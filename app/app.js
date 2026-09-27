// Canari · écran principal, ventes (payées en entier ou en partie), dépenses,
// crédits clients et remboursements.
// Les calculs suivent le prototype (prototype/carnet-boutique.html), avec une
// différence voulue : une vente garde son montant total ET ce que le client a
// donné. Le reste passe à crédit sur le nom du client.

const CLE_DEJA_VU = "canari.accueilVu";
const CLE_DONNEES = "canari.donnees";
const CLE_DERNIERE_SAUVEGARDE = "canari.derniereSauvegarde";
const CLE_AVANT_RESTAURATION = "canari.avantRestauration";
const JOUR = 864e5;

function lire(cle) {
  try { return localStorage.getItem(cle); } catch (e) { return null; }
}
function ecrire(cle, valeur) {
  try { localStorage.setItem(cle, valeur); return true; } catch (e) { return false; }
}
const $ = function (id) { return document.getElementById(id); };

/* ---------- Données enregistrées sur le téléphone ---------- */

// Chaque mouvement : { id, type, montant, encaisse, note, client, clientId, t }
// type : vente, depense, paye (remboursement client), maison, fdette, fpaye
// Pour une vente, « encaisse » est ce que le client a donné ; le reste est à crédit.
// Pour une dette fournisseur (fdette), « verse » est ce que j'ai déjà donné
// (compté comme dépensé) ; le reste est ce que je dois. Le fournisseur est
// rangé par son nom (fournisseurId) ; son numéro est facultatif.
// clients : fiche de chaque client, rangée par son numéro de téléphone
//   (le numéro identifie le client : deux « Koffi » différents ne sont jamais mélangés).
// meta : suivi des relances par client (promesse, relances), rangé par numéro aussi.
let donnees = { mouvements: [], clients: {}, fournisseurs: {}, meta: {} };
completerDonnees();

// Ajoute les rubriques qui manquent (anciennes données ou sauvegarde récupérée).
function completerDonnees() {
  if (!donnees.meta) donnees.meta = {};
  if (!donnees.clients) donnees.clients = {};
  if (!donnees.fournisseurs) donnees.fournisseurs = {};
  if (!donnees.boutique) donnees.boutique = {};  // nom, tel, adresse, merci, logo
  if (!donnees.produits) donnees.produits = {};  // voir boutique.js
  if (!donnees.compteurs) donnees.compteurs = { facture: 0, recu: 0 };
  if (!donnees.charges) donnees.charges = [];
  if (!donnees.intrants) donnees.intrants = {}; // ingrédients et matières, voir intrants.js   // charges fixes et taxes, voir charges.js
}

/* Les données sont rangées dans la base du navigateur (IndexedDB) : beaucoup plus de
   place que le petit espace « localStorage » (environ 5 Mo, soit 2 ans de ventes).
   Si la base n'est pas disponible, on se replie sur localStorage. */
const BASE = "canari", MAGASIN = "donnees";
let modeStockage = "local"; // "base" (IndexedDB) ou "local" (localStorage)
let baseOuverte = null;

function ouvrirBase() {
  if (!baseOuverte) {
    baseOuverte = new Promise(function (ok, ko) {
      if (!window.indexedDB) return ko(new Error("pas de base"));
      const r = indexedDB.open(BASE, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(MAGASIN); };
      r.onsuccess = function () { ok(r.result); };
      r.onerror = function () { ko(r.error); };
    });
  }
  return baseOuverte;
}
function lireBase(cle) {
  return ouvrirBase().then(function (db) {
    return new Promise(function (ok, ko) {
      const q = db.transaction(MAGASIN).objectStore(MAGASIN).get(cle);
      q.onsuccess = function () { ok(q.result); };
      q.onerror = function () { ko(q.error); };
    });
  });
}
function ecrireBase(cle, valeur) {
  return ouvrirBase().then(function (db) {
    return new Promise(function (ok, ko) {
      const tx = db.transaction(MAGASIN, "readwrite");
      tx.objectStore(MAGASIN).put(valeur, cle);
      tx.oncomplete = function () { ok(); };
      tx.onerror = tx.onabort = function () { ko(tx.error); };
    });
  });
}

// Au démarrage : lit la base. Les données d'une ancienne version (localStorage)
// y sont déplacées une fois, puis effacées de localStorage.
function chargerDonnees() {
  let ancien = null;
  try { ancien = JSON.parse(lire(CLE_DONNEES)); } catch (e) { ancien = null; }
  const ancienValide = ancien && Array.isArray(ancien.mouvements);
  return lireBase("principal").then(function (d) {
    modeStockage = "base";
    if (ancienValide) {
      return ecrireBase("principal", ancien).then(function () {
        try { localStorage.removeItem(CLE_DONNEES); } catch (e) { /* rien */ }
        return ancien;
      });
    }
    return d && Array.isArray(d.mouvements) ? d : null;
  }).catch(function () {
    modeStockage = "local";
    return ancienValide ? ancien : null;
  });
}

function sauver() {
  versionDonnees++;
  const alerte = function () { message("Attention : impossible d'enregistrer sur ce téléphone. Fais une sauvegarde (Réglages ⚙)."); };
  if (modeStockage === "base") {
    ecrireBase("principal", donnees).catch(function () {
      if (!ecrire(CLE_DONNEES, JSON.stringify(donnees))) alerte();
    });
  } else if (!ecrire(CLE_DONNEES, JSON.stringify(donnees))) {
    alerte();
  }
}

/* ---------- Mémoire des calculs ----------
   Avec une année de ventes (plus de 10 000 lignes), relire tout l'historique à chaque
   affichage rend l'appli lente sur un petit téléphone. Les résultats (ventes par jour,
   stock, dettes…) sont gardés jusqu'au prochain changement des données. */
let versionDonnees = 0;
const memoire = {};
function memo(nom, calcul) {
  const cle = versionDonnees + ":" + donnees.mouvements.length;
  const m = memoire[nom];
  if (m && m.cle === cle) return m.valeur;
  const valeur = calcul();
  memoire[nom] = { cle: cle, valeur: valeur };
  return valeur;
}
// Les lignes d'une journée (clé « AAAA-MM-JJ »).
function mouvementsDuJour(jour) {
  return memo("parJour", function () {
    const parJour = {};
    donnees.mouvements.forEach(function (m) {
      const k = cleJour(m.t);
      (parJour[k] || (parJour[k] = [])).push(m);
    });
    return parJour;
  })[jour] || [];
}

/* ---------- Outils ---------- */

const nombre = function (n) {
  return Math.round(n).toLocaleString("fr-FR").replace(/[  ]/g, " ");
};
// Espaces insécables : « 6 500 F » ne sera jamais coupé en fin de ligne.
const franc = function (n) { return formatDevise(nombre(n).replace(/ /g, "\u00a0")); }; // monnaie : voir devise.js
const lireMontant = function (texte) { return parseInt(String(texte).replace(/\D/g, ""), 10) || 0; };
const cleJour = function (t) {
  const d = new Date(t);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};
const debutJour = function (t) { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const joursDepuis = function (t) { return Math.round((debutJour(Date.now()) - debutJour(t)) / JOUR); };
const ilYA = function (t) {
  const j = joursDepuis(t);
  return j <= 0 ? "aujourd'hui" : j === 1 ? "hier" : "il y a " + j + " jours";
};
const dateCourte = function (t) {
  return new Date(t).toLocaleDateString(LOCALE, { day: "numeric", month: "short" });
};
const nouvelId = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
const echapper = function (s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
};
const cleClient = function (nom) { return "c:" + nom.trim().toLowerCase().replace(/\s+/g, " "); };

// Numéro de téléphone : on garde seulement les chiffres. Un numéro ivoirien écrit
// avec l'indicatif (225 ou 00225) est ramené à ses 10 chiffres.
function normaliserTel(texte) {
  let d = String(texte || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 13 && d.startsWith("225")) d = d.slice(3);
  return d;
}
function afficherTel(tel) {
  return tel.length === 10 ? tel.replace(/(\d{2})(?=\d)/g, "$1 ") : tel;
}
// Identifiant du client d'un mouvement : son numéro, ou son nom pour les
// anciennes lignes notées avant qu'on demande le numéro.
function idClientDe(m) {
  if (m.clientId) return m.clientId;
  return m.client ? cleClient(m.client) : "";
}
const cleFournisseur = function (nom) { return "f:" + nom.trim().toLowerCase().replace(/\s+/g, " "); };
function idFournisseurDe(m) {
  return m.fournisseurId || (m.client ? cleFournisseur(m.client) : "");
}
function ficheFournisseur(id, nomParDefaut) {
  const f = donnees.fournisseurs[id];
  return { id: id, nom: (f && f.nom) || nomParDefaut || "", tel: (f && f.tel) || "" };
}
function ficheClient(id, nomParDefaut) {
  const f = donnees.clients[id];
  return { id: id, nom: (f && f.nom) || nomParDefaut || "", tel: f ? f.tel : "" };
}

/* ---------- Calculs ---------- */

// Argent réellement reçu pour une vente (les anciennes ventes étaient payées en entier).
function encaisseDe(m) {
  return typeof m.encaisse === "number" ? m.encaisse : m.montant;
}
// Part d'une vente laissée à crédit.
function creditDe(m) {
  if (m.type === "credit") return m.montant;
  if (m.type === "vente") return m.montant - encaisseDe(m);
  return 0;
}

/* Bénéfice (décision du propriétaire) :
   bénéfice = ventes (même à crédit) − prix de revient de ce qui est vendu − autres dépenses.
   L'achat de marchandise à revendre ne baisse pas le bénéfice le jour de l'achat :
   il est compté au moment où la marchandise est vendue (prix de revient).
   À côté, l'argent en caisse = argent entré − argent sorti (marchandise comprise). */

// Marge habituelle de la boutique, en % du prix de vente (Réglages).
function margeHabituelle() {
  const m = donnees.boutique.marge;
  return typeof m === "number" ? m : 20;
}
function coutParMarge(prixVente) {
  return Math.round(prixVente * (100 - margeHabituelle()) / 100);
}
// Prix de revient d'un produit : son prix d'achat, ou déduit de la marge habituelle.
function coutProduit(p) {
  // Fabrication ou service : la fiche de coût, au prix moyen actuel des intrants.
  if (p.fiche && (p.type === "fabrication" || p.type === "service")) {
    const c = coutUnitaireFiche(p.fiche);
    if (c > 0) return c;
  }
  return typeof p.cout === "number" ? p.cout : coutParMarge(p.prix);
}
// Prix de revient d'une vente.
function coutDe(m) {
  if (m.type !== "vente" && m.type !== "credit") return 0;
  if (m.lignes && m.lignes.length) {
    return m.lignes.reduce(function (s, l) {
      const p = donnees.produits[l.produitId];
      const cout = typeof l.cout === "number" ? l.cout : p ? coutProduit(p) : coutParMarge(l.prix);
      return s + cout * l.qte;
    }, 0);
  }
  return typeof m.cout === "number" ? m.cout : coutParMarge(m.montant);
}
// Une dépense de marchandise à revendre ne compte pas dans le bénéfice.
function estMarchandise(m) {
  return m.type === "depense" && m.categorie === "marchandise";
}
// Marchandise, charge fixe prévue ou impôt prévu : sortent de la caisse, mais sont
// déjà comptés ailleurs dans le bénéfice (prix de revient, part des charges du jour).
function horsBenefice(m) {
  return m.type === "depense" && (m.categorie === "marchandise" || m.categorie === "charge" || m.categorie === "impot");
}

function totauxDuJour(jour) {
  const deja = memo("totaux", function () { return {}; });
  if (!deja[jour]) deja[jour] = calculTotauxDuJour(jour);
  return deja[jour];
}
function calculTotauxDuJour(jour) {
  let encaisse = 0, sorti = 0, depenses = 0, maison = 0, vendu = 0, aCredit = 0, cout = 0;
  mouvementsDuJour(jour).forEach(function (m) {
    if (m.type === "vente" || m.type === "credit") {
      vendu += m.montant;
      aCredit += creditDe(m);
      cout += coutDe(m);
      if (m.type === "vente") encaisse += encaisseDe(m);
    }
    else if (m.type === "paye") encaisse += m.montant;
    else if (m.type === "depense") {
      sorti += m.montant;
      if (!horsBenefice(m)) depenses += m.montant;
    }
    else if (m.type === "fpaye") sorti += m.montant;
    else if (m.type === "fdette") sorti += m.verse || 0;
    else if (m.type === "maison") maison += m.montant;
  });
  const part = partDuJour(vendu);
  const margeBrute = vendu - cout;
  return {
    vendu: vendu, aCredit: aCredit, cout: cout, depenses: depenses,
    margeBrute: margeBrute, partCharges: part.charges, partImpots: part.impots,
    chargesEtTaxes: depenses + part.charges + part.impots,
    benefice: margeBrute - depenses - part.charges - part.impots, // bénéfice net
    encaisse: encaisse, sorti: sorti, maison: maison,
    caisse: encaisse - sorti - maison
  };
}

// Liste des clients qui doivent de l'argent, du plus gros au plus petit.
function clientsQuiDoivent() {
  return memo("clientsQuiDoivent", calcul_clientsQuiDoivent);
}
function calcul_clientsQuiDoivent() {
  const parCle = new Map();
  donnees.mouvements.slice().sort(function (a, b) { return a.t - b.t; }).forEach(function (m) {
    const cle = idClientDe(m);
    if (!cle) return;
    const credit = creditDe(m);
    if (credit <= 0 && m.type !== "paye") return;
    const fiche = ficheClient(cle, m.client);
    const c = parCle.get(cle) || { cle: cle, nom: fiche.nom, tel: fiche.tel, du: 0, depuis: 0, dernier: 0, historique: [] };
    c.dernier = m.t;
    if (m.type === "paye") {
      c.du -= m.montant;
      c.historique.push({ t: m.t, texte: "A payé", montant: -m.montant });
    } else {
      if (c.du <= 0) c.depuis = m.t; // nouvelle dette après avoir tout réglé
      c.du += credit;
      c.historique.push({ t: m.t, texte: m.note || "Achat à crédit", montant: credit });
    }
    if (c.du <= 0) { c.du = 0; c.depuis = 0; }
    parCle.set(cle, c);
  });
  return Array.from(parCle.values())
    .filter(function (c) { return c.du > 0; })
    .sort(function (a, b) { return b.du - a.du; });
}

// Fournisseurs à qui je dois de l'argent, du plus gros au plus petit.
function fournisseursQueJeDois() {
  return memo("fournisseursQueJeDois", calcul_fournisseursQueJeDois);
}
function calcul_fournisseursQueJeDois() {
  const parCle = new Map();
  donnees.mouvements.slice().sort(function (a, b) { return a.t - b.t; }).forEach(function (m) {
    if (m.type !== "fdette" && m.type !== "fpaye") return;
    const cle = idFournisseurDe(m);
    if (!cle) return;
    const fiche = ficheFournisseur(cle, m.client);
    const f = parCle.get(cle) || { cle: cle, nom: fiche.nom, tel: fiche.tel, du: 0, depuis: 0, historique: [] };
    if (m.type === "fpaye") {
      f.du -= m.montant;
      f.historique.push({ t: m.t, texte: "J'ai payé", montant: -m.montant });
    } else {
      const reste = m.montant - (m.verse || 0);
      if (reste <= 0) return;
      if (f.du <= 0) f.depuis = m.t;
      f.du += reste;
      f.historique.push({ t: m.t, texte: m.note || "Marchandise à crédit", montant: reste });
    }
    if (f.du <= 0) { f.du = 0; f.depuis = 0; }
    parCle.set(cle, f);
  });
  return Array.from(parCle.values())
    .filter(function (f) { return f.du > 0; })
    .sort(function (a, b) { return b.du - a.du; });
}

function listeFournisseurs() {
  return memo("listeFournisseurs", calcul_listeFournisseurs);
}
function calcul_listeFournisseurs() {
  const vus = new Map();
  donnees.mouvements.slice().sort(function (a, b) { return b.t - a.t; }).forEach(function (m) {
    if (m.type !== "fdette" && m.type !== "fpaye") return;
    const id = idFournisseurDe(m);
    if (id && !vus.has(id)) vus.set(id, ficheFournisseur(id, m.client));
  });
  return Array.from(vus.values());
}

// Tous les clients connus, les plus récents d'abord : { id, nom, tel }.
function listeClients() {
  return memo("listeClients", calcul_listeClients);
}
function calcul_listeClients() {
  const vus = new Map();
  donnees.mouvements.slice().sort(function (a, b) { return b.t - a.t; }).forEach(function (m) {
    const id = idClientDe(m);
    if (!id || vus.has(id) || !(m.type === "vente" || m.type === "credit" || m.type === "paye")) return;
    vus.set(id, ficheClient(id, m.client));
  });
  return Array.from(vus.values());
}

/* ---------- Relances ---------- */

function suiviDe(cle) {
  if (!donnees.meta[cle]) donnees.meta[cle] = { promesse: "", relances: [] };
  const s = donnees.meta[cle];
  if (!Array.isArray(s.relances)) s.relances = [];
  if (typeof s.promesse !== "string") s.promesse = "";
  return s;
}
const dateLongue = function (cle) {
  return new Date(cle + "T12:00:00").toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" });
};

// Classement d'un client pour les relances (mêmes règles que le prototype) :
// urgent = promesse dépassée ou pour aujourd'hui, OU jamais relancé et doit depuis
// 7 jours ou plus, OU relancé sans réponse depuis 5 jours ou plus.
function statutRelance(c) {
  const suivi = donnees.meta[c.cle] || { promesse: "", relances: [] };
  const relances = suivi.relances || [];
  const derniere = relances.length ? Math.max.apply(null, relances) : 0;
  const aujourdhui = cleJour(Date.now());
  if (suivi.promesse) {
    if (suivi.promesse < aujourdhui) return { code: "retard", urgent: true, texte: "Promesse non tenue (" + dateCourte(suivi.promesse + "T12:00:00") + ")" };
    if (suivi.promesse === aujourdhui) return { code: "retard", urgent: true, texte: "A promis de payer aujourd'hui" };
    return { code: "promesse", urgent: false, texte: "A promis de payer le " + dateLongue(suivi.promesse) };
  }
  const derniereNouvelle = Math.max(derniere, c.dernier || 0);
  const silence = joursDepuis(derniereNouvelle);
  const anciennete = joursDepuis(c.depuis);
  if (!relances.length && anciennete >= 7) return { code: "retard", urgent: true, texte: "Doit depuis " + anciennete + " jours, jamais relancé" };
  if (relances.length && silence >= 5) return { code: "retard", urgent: true, texte: "Relancé " + relances.length + " fois, sans réponse depuis " + silence + " jours" };
  if (relances.length) return { code: "attente", urgent: false, texte: "Relancé " + ilYA(derniere) + ", on attend" };
  return { code: "recent", urgent: false, texte: "Crédit récent (" + ilYA(c.depuis) + ")" };
}

/* ---------- Affichage ---------- */

const NOMS = {
  vente: "Vente", depense: "Dépense", credit: "Vente à crédit", paye: "Remboursement",
  maison: "Pris pour la maison", fdette: "Dette fournisseur", fpaye: "Payé au fournisseur", stock: "Stock", intrant: "Intrant"
};

let onglet = "jour";
let coteCredits = "clients";

// Dessine seulement l'onglet affiché (les autres le seront quand on les ouvrira).
function afficher() {
  appliquerDevise();
  afficherRappelSauvegarde();
  afficherBandeauAbonnement();
  majPastilles();
  if (onglet === "jour") afficherJour();
  else if (onglet === "credits") afficherCredits();
  else if (onglet === "relances") afficherRelances();
  else if (onglet === "semaine") { if ($("vue-mois").hidden) afficherSemaine(); else afficherMois(); }
  else if (onglet === "stock") afficherStock();
  document.querySelectorAll(".vue").forEach(function (v) { v.hidden = v.id !== "vue-" + onglet; });
  document.querySelectorAll("[data-onglet]").forEach(function (b) {
    if (b.dataset.onglet === onglet) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
}

// Les pastilles rouges des onglets Relances et Stock.
function majPastilles() {
  const urgents = clientsQuiDoivent().filter(function (c) { return statutRelance(c).urgent; }).length;
  $("nb-relances").hidden = urgents === 0;
  $("nb-relances").textContent = urgents;
  const bas = produitsARacheter().length + intrantsARacheter().length;
  $("nb-stock").hidden = bas === 0;
  $("nb-stock").textContent = bas;
}

function afficherJour() {
  const aujourdhui = cleJour(Date.now());
  const t = totauxDuJour(aujourdhui);
  const signe = function (n) { return (n < 0 ? "− " : "") + franc(Math.abs(n)); };
  $("gain").textContent = franc(t.vendu);
  $("marge").textContent = signe(t.margeBrute);
  $("charges-jour").textContent = franc(t.chargesEtTaxes);
  $("net").textContent = signe(t.benefice);
  $("case-net").className = "chiffre " + (t.benefice < 0 ? "sort" : "entre");
  const seuil = seuilDuJour();
  $("seuil").hidden = !seuil || t.vendu >= seuil;
  $("seuil").innerHTML = '<span>Pour couvrir tes charges, vends au moins</span><b>' + franc(seuil) + '</b>' +
    '<small>Encore ' + franc(Math.max(0, seuil - t.vendu)) + ' à vendre aujourd\'hui.</small>';
  $("rappel-parametrage").hidden = !!donnees.boutique.parametre || !$("rappel-sauvegarde").hidden;
  const bouge = t.encaisse || t.sorti || t.maison;
  $("caisse").hidden = !bouge;
  const parMoyen = caisseParMoyen(aujourdhui);
  const detail = Object.keys(parMoyen).length > 1 || (Object.keys(parMoyen)[0] && Object.keys(parMoyen)[0] !== "especes")
    ? '<small class="par-moyen">' + Object.keys(MOYENS).filter(function (k) { return parMoyen[k]; }).map(function (k) {
        return MOYENS[k] + " " + (parMoyen[k] > 0 ? "+ " : "") + signe(parMoyen[k]);
      }).join(" · ") + '</small>' : '';
  $("caisse").innerHTML = '<span>Argent en caisse</span><b>' + (t.caisse > 0 ? "+ " : "") + signe(t.caisse) + '</b>' +
    '<small>entré ' + franc(t.encaisse) + ' · sorti ' + franc(t.sorti + t.maison) + '</small>' + detail;
  const reste = t.benefice - t.maison;
  $("reste-boutique").hidden = t.maison === 0;
  $("reste-boutique").innerHTML = '<span>Pris pour la maison ' + franc(t.maison) + '</span><b>Reste du bénéfice net ' + signe(reste) + '</b>';

  afficherBilan(t);

  const lignes = mouvementsDuJour(aujourdhui).slice()
    .sort(function (a, b) { return b.t - a.t; });
  $("vide").hidden = lignes.length > 0;
  $("titre-liste").hidden = lignes.length === 0;
  $("liste").innerHTML = lignes.map(ligneHtml).join("");
}

function ligneHtml(m) {
  const heure = new Date(m.t).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
  const estFournisseur = m.type === "fdette" || m.type === "fpaye";
  const nomQui = !m.client ? "" : estFournisseur ? ficheFournisseur(idFournisseurDe(m), m.client).nom : ficheClient(idClientDe(m), m.client).nom;
  const qui = (nomQui ? " · " + echapper(nomQui) : "") + (m.moyen && MOYENS[m.moyen] ? " · " + MOYENS[m.moyen] : "");
  let type = m.type, montants;
  if (m.type === "vente" || m.type === "credit") {
    const recu = m.type === "vente" ? encaisseDe(m) : 0;
    const credit = creditDe(m);
    if (recu === 0) type = "credit";
    montants = (recu > 0 ? '<span class="m-entre">+ ' + franc(recu) + '</span>' : "") +
      (credit > 0 ? '<span class="m-credit">' + franc(credit) + ' à crédit</span>' : "");
  } else if (m.type === "fdette") {
    const verse = m.verse || 0, reste = m.montant - verse;
    montants = (verse > 0 ? '<span class="m-sort">− ' + franc(verse) + '</span>' : "") +
      (reste > 0 ? '<span class="m-credit">' + franc(reste) + ' à payer</span>' : "");
  } else if (m.type === "intrant") {
    const i = donnees.intrants[m.intrantId];
    montants = '<span class="m-stock">' + (m.quantite > 0 ? "+" : "−") + " " + qteTexte(Math.abs(m.quantite), i ? i.unite : "unite") + '</span>' +
      (m.qteAchat ? '<span class="m-stock petit">' + qteTexte(m.qteAchat, m.uniteAchat) + '</span>' : '');
  } else if (m.type === "stock") {
    montants = '<span class="m-stock">' + (m.quantite > 0 ? "+" : "−") + " " + qteTexte(Math.abs(m.quantite), uniteDe(donnees.produits[m.produitId])) + '</span>' +
      (m.qteAchat ? '<span class="m-stock petit">' + qteTexte(m.qteAchat, m.uniteAchat) + '</span>' : '');
  } else {
    const signe = m.type === "paye" ? "+ " : (m.type === "depense" || m.type === "fpaye" || m.type === "maison") ? "− " : "";
    montants = '<span>' + signe + franc(m.montant) + '</span>';
  }
  const RAISONS = { depart: "Stock de départ", arrivage: "Arrivage", correction: "Stock corrigé", production: "Fabriqué" };
  const nomType = m.type === "intrant" ? ({ achat: "Achat d'intrant", correction: "Intrant corrigé", depart: "Intrant : stock de départ" }[m.raison] || "Intrant")
    : m.type === "stock" ? (RAISONS[m.raison] || "Stock")
    : estMarchandise(m) ? "Achat de marchandise"
    : m.type === "depense" && m.categorie === "charge" ? "Charge fixe payée"
    : m.type === "depense" && m.categorie === "impot" ? "Impôt ou taxe payé"
    : type === "credit" ? "Vente à crédit" : m.type === "vente" && creditDe(m) > 0 ? "Vente, pas tout payé" : NOMS[m.type];
  const produits = m.lignes && m.lignes.length
    ? m.lignes.map(libelleLigne).join(", ") : "";
  const titre = m.note || produits || (m.type === "vente" && creditDe(m) > 0 ? "Vente de " + franc(m.montant) : NOMS[type]);
  const avecDocument = m.type === "vente" || m.type === "credit" || m.type === "paye";
  const texte = '<b>' + echapper(titre) + '</b>' +
    '<small>' + nomType + qui + ' · ' + heure + '</small>' +
    (avecDocument ? '<small class="lien-document">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6"/></svg>' +
      (m.type === "paye" ? "Reçu" : "Facture") + '</small>' : '');
  return '<li class="ligne t-' + type + '">' +
    '<span class="pastille" aria-hidden="true"></span>' +
    (avecDocument
      ? '<button type="button" class="ligne-texte" data-document="' + m.id + '">' + texte + '</button>'
      : '<span class="ligne-texte">' + texte + '</span>') +
    '<span class="ligne-montant">' + montants + '</span>' +
    '<button type="button" class="retirer" data-retirer="' + m.id + '" aria-label="Retirer cette ligne">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
    '</li>';
}

function afficherCredits() {
  document.querySelectorAll("[data-cote]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.cote === coteCredits));
  });
  $("credits-clients").hidden = coteCredits !== "clients";
  $("credits-fournisseurs").hidden = coteCredits !== "fournisseurs";
  const clients = clientsQuiDoivent();
  const fournisseurs = fournisseursQueJeDois();
  document.querySelector('[data-cote="clients"]').textContent = "On me doit" + (clients.length ? " (" + clients.length + ")" : "");
  document.querySelector('[data-cote="fournisseurs"]').textContent = "Je dois" + (fournisseurs.length ? " (" + fournisseurs.length + ")" : "");

  if (!clients.length) {
    $("credits-clients").innerHTML = videHtml("canari-tranquille",
      "Personne ne te doit d'argent.<br>Quand un client prend à crédit, appuie sur <strong>Crédit</strong>.");
  } else {
    $("credits-clients").innerHTML = totalHtml("Tes clients te doivent", clients, "client", "total-credits") +
      '<ul class="clients">' + clients.map(function (c) { return carteHtml(c, "client"); }).join("") + '</ul>';
  }

  if (!fournisseurs.length) {
    $("credits-fournisseurs").innerHTML = videHtml("canari-yeux-fermes",
      "Tu ne dois rien à tes fournisseurs.<br>Quand tu prends de la marchandise à crédit, appuie sur <strong>Dette fournisseur</strong>.");
  } else {
    $("credits-fournisseurs").innerHTML = totalHtml("Tu dois à tes fournisseurs", fournisseurs, "fournisseur", "total-credits total-dettes") +
      '<ul class="clients">' + fournisseurs.map(function (f) { return carteHtml(f, "fournisseur"); }).join("") + '</ul>';
  }
}

function afficherRelances() {
  const clients = clientsQuiDoivent();
  const groupes = { retard: [], promesse: [], attente: [], recent: [] };
  clients.forEach(function (c) { groupes[statutRelance(c).code].push(c); });
  const urgents = groupes.retard.length;
  $("nb-relances").hidden = urgents === 0;
  $("nb-relances").textContent = urgents;

  if (!clients.length) {
    $("vue-relances").innerHTML = videHtml("canari-yeux-fermes", "Aucun client ne te doit d'argent.<br>Rien à relancer !");
    return;
  }
  const bloc = function (titre, liste, aide) {
    if (!liste.length) return "";
    return '<section class="groupe"><h2 class="titre-liste">' + titre + ' · ' + liste.length + '</h2>' +
      (aide ? '<p class="aide">' + aide + '</p>' : '') +
      '<ul class="clients">' + liste.map(function (c) { return carteHtml(c, "client", true); }).join("") + '</ul></section>';
  };
  const aRecuperer = groupes.retard.reduce(function (s, c) { return s + c.du; }, 0);
  $("vue-relances").innerHTML =
    (urgents
      ? '<div class="total-credits total-relances"><img src="icones/canari-clin-doeil.webp" width="72" height="84" alt="">' +
        '<div><span>À récupérer en priorité</span><strong>' + franc(aRecuperer) + '</strong>' +
        '<small>' + urgents + ' client' + (urgents > 1 ? 's' : '') + ' à relancer aujourd\'hui</small></div></div>'
      : videHtml("canari-yeux-fermes", "Personne à relancer aujourd'hui. Bien joué !")) +
    bloc("À relancer aujourd'hui", groupes.retard, "Promesses dépassées, ou clients silencieux depuis trop longtemps.") +
    bloc("Promesses à venir", groupes.promesse, "") +
    bloc("Déjà relancés", groupes.attente, "Laisse-leur quelques jours avant de relancer encore.") +
    bloc("Crédits récents", groupes.recent, "Pas encore besoin de relancer.");
}

/* ---------- Bilan du jour en une phrase ---------- */

function afficherBilan(t) {
  const clients = clientsQuiDoivent();
  const fournisseurs = fournisseursQueJeDois();
  const aRelancer = clients.filter(function (c) { return statutRelance(c).urgent; }).length;
  const phrases = [];
  const fort = function (x) { return "<strong>" + x + "</strong>"; };

  if (LANGUE === "en") {
    $("bilan-texte").setAttribute("translate", "no"); // déjà écrit en anglais
    bilanAnglais(t, clients, fournisseurs, aRelancer, phrases, fort);
  } else {
  if (t.vendu) {
    phrases.push("Aujourd'hui tu as vendu " + franc(t.vendu) +
      (t.aCredit ? " (dont " + franc(t.aCredit) + " à crédit)" : "") + ".");
  }
  if (t.vendu) phrases.push("Ta marge brute est de " + franc(t.margeBrute) + ".");
  if (t.vendu || t.depenses) {
    const apres = t.partCharges + t.partImpots ? "Après tes charges et taxes du jour, ton bénéfice net est d'environ " : "Ton bénéfice net est de ";
    phrases.push(t.benefice >= 0
      ? apres + fort(franc(t.benefice)) + "."
      : "Après tes charges et taxes du jour, tu es en perte d'environ " + fort(franc(-t.benefice)) + ".");
  } else if (!t.encaisse && !t.sorti && !t.maison) {
    phrases.push("Rien de noté aujourd'hui pour l'instant.");
  }
  if (t.maison) {
    const reste = t.benefice - t.maison;
    phrases.push("Tu as pris " + franc(t.maison) + " pour la maison, il reste donc " +
      fort((reste < 0 ? "− " : "") + franc(Math.abs(reste))) + " de bénéfice net pour la boutique.");
  }
  if (clients.length) {
    const total = clients.reduce(function (s, c) { return s + c.du; }, 0);
    phrases.push("Tes clients te doivent " + franc(total) +
      (clients.length > 1 ? ", dont " + echapper(clients[0].nom) + " " + franc(clients[0].du) : "") + ".");
  }
  if (aRelancer) phrases.push(fort(aRelancer + " client" + (aRelancer > 1 ? "s" : "") + " à relancer."));
  const racheter = produitsARacheter().concat(intrantsARacheter());
  if (racheter.length) {
    phrases.push("Pense à racheter " + (racheter.length <= 3
      ? racheter.map(function (x) { return echapper(x.nom); }).join(", ").replace(/, ([^,]*)$/, " et $1")
      : racheter.length + " articles (produits ou intrants)") + ".");
  }
  if (fournisseurs.length) {
    const total = fournisseurs.reduce(function (s, f) { return s + f.du; }, 0);
    phrases.push("Tu dois " + franc(total) + " à tes fournisseurs.");
  }
  }
  $("bilan-texte").innerHTML = phrases.join(" ");

  // Humeur du Petit Canari : grand sourire les très bons jours.
  const passes = derniersJours(7).slice(0, 6).map(function (j) { return j.totaux.benefice; })
    .filter(function (g) { return g !== 0; });
  const moyenne = passes.length ? passes.reduce(function (a, b) { return a + b; }, 0) / passes.length : 0;
  let humeur = "canari-tranquille";
  if (t.benefice > 0 && passes.length && t.benefice >= moyenne) humeur = "canari-yeux-fermes";
  else if (t.benefice > 0) humeur = "canari-joyeux";
  else if (t.benefice < 0) humeur = "canari-pensif";
  const image = "icones/" + humeur + ".webp";
  if ($("bilan-image").getAttribute("src") !== image) $("bilan-image").setAttribute("src", image);
}

// Le même bilan, écrit directement en anglais (les phrases françaises sont faites de morceaux).
function bilanAnglais(t, clients, fournisseurs, aRelancer, phrases, fort) {
  if (t.vendu) {
    phrases.push("Today you sold " + franc(t.vendu) +
      (t.aCredit ? " (including " + franc(t.aCredit) + " on credit)" : "") + ".");
    phrases.push("Your gross margin is " + franc(t.margeBrute) + ".");
  }
  if (t.vendu || t.depenses) {
    const apres = t.partCharges + t.partImpots ? "After today's costs and taxes, your net profit is about " : "Your net profit is ";
    phrases.push(t.benefice >= 0
      ? apres + fort(franc(t.benefice)) + "."
      : "After today's costs and taxes, you made a loss of about " + fort(franc(-t.benefice)) + ".");
  } else if (!t.encaisse && !t.sorti && !t.maison) {
    phrases.push("Nothing recorded today yet.");
  }
  if (t.maison) {
    const reste = t.benefice - t.maison;
    phrases.push("You took " + franc(t.maison) + " for home, so " +
      fort((reste < 0 ? "− " : "") + franc(Math.abs(reste))) + " of net profit is left for the shop.");
  }
  if (clients.length) {
    const total = clients.reduce(function (s, c) { return s + c.du; }, 0);
    phrases.push("Your customers owe you " + franc(total) +
      (clients.length > 1 ? ", including " + echapper(clients[0].nom) + " " + franc(clients[0].du) : "") + ".");
  }
  if (aRelancer) phrases.push(fort(aRelancer + " customer" + (aRelancer > 1 ? "s" : "") + " to remind."));
  const racheter = produitsARacheter().concat(intrantsARacheter());
  if (racheter.length) {
    phrases.push("Remember to restock " + (racheter.length <= 3
      ? racheter.map(function (x) { return echapper(x.nom); }).join(", ").replace(/, ([^,]*)$/, " and $1")
      : racheter.length + " items (products or supplies)") + ".");
  }
  if (fournisseurs.length) {
    const total = fournisseurs.reduce(function (s, f) { return s + f.du; }, 0);
    phrases.push("You owe " + franc(total) + " to your suppliers.");
  }
}

/* ---------- Onglet Semaine ---------- */

// Les 7 derniers jours, du plus ancien à aujourd'hui.
function derniersJours(n) {
  const jours = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    jours.push({ date: d, cle: cleJour(d), totaux: totauxDuJour(cleJour(d)), aujourdhui: i === 0 });
  }
  return jours;
}

function afficherSemaine() {
  const jours = derniersJours(7);
  const gains = jours.map(function (j) { return j.totaux.benefice; });
  const plusGrand = Math.max.apply(null, gains.map(Math.abs).concat([1]));
  const somme = function (cle) { return jours.reduce(function (s, j) { return s + j.totaux[cle]; }, 0); };
  const gain = somme("benefice"), maison = somme("maison"), vendu = somme("vendu"), aCredit = somme("aCredit");
  const caisse = somme("caisse");
  const reste = gain - maison;
  const signe = function (n) { return (n < 0 ? "− " : "") + franc(Math.abs(n)); };
  const rien = jours.every(function (j) { return !j.totaux.encaisse && !j.totaux.sorti && !j.totaux.maison && !j.totaux.vendu; });

  if (rien) {
    $("vue-7jours").innerHTML = videHtml("canari-tranquille",
      "Rien de noté ces 7 derniers jours.<br>Ton bilan de la semaine apparaîtra ici.");
    return;
  }

  const marge = somme("margeBrute");
  $("vue-7jours").innerHTML =
    '<div class="carte-gain carte-semaine">' +
      '<p class="etiquette">Ventes des 7 derniers jours</p>' +
      '<p class="gros-chiffre">' + franc(vendu) + '</p>' +
      '<div class="trois-chiffres deux">' +
        '<div class="chiffre revient"><span>Marge brute</span><strong>' + signe(marge) + '</strong></div>' +
        '<div class="chiffre ' + (gain < 0 ? 'sort' : 'entre') + '"><span>Bénéfice net</span><strong' + (gain < 0 ? ' class="m-sort"' : '') + '>' + signe(gain) + '</strong></div>' +
      '</div>' +
      (aCredit ? '<p class="vendu">Dont ' + franc(aCredit) + ' vendus à crédit</p>' : '') +
      (maison ? '<p class="vendu">Pris pour la maison ' + franc(maison) + ' · reste ' + signe(reste) + '</p>' : '') +
      '<p class="vendu">Argent en caisse sur 7 jours : ' + signe(caisse) + '</p>' +
    '</div>' +
    '<h2 class="titre-liste">Bénéfice net de chaque jour</h2>' +
    '<ul class="barres" aria-label="Bénéfice net de chaque jour">' + jours.map(function (j) {
      const g = j.totaux.benefice;
      const largeur = g === 0 ? 0 : Math.max(3, Math.round(Math.abs(g) / plusGrand * 100));
      const nom = j.aujourdhui ? "Auj." : j.date.toLocaleDateString(LOCALE, { weekday: "short" }).replace(".", "");
      return '<li class="barre' + (g < 0 ? ' negative' : '') + (j.aujourdhui ? ' aujourdhui' : '') + '">' +
        '<span class="barre-jour"><b>' + nom.charAt(0).toUpperCase() + nom.slice(1) + '</b><small>' + j.date.getDate() + '</small></span>' +
        '<span class="barre-piste"><span class="barre-remplie" style="width:' + largeur + '%"></span></span>' +
        '<span class="barre-valeur">' + signe(g) + '</span>' +
        '</li>';
    }).join("") + '</ul>' +
    '<p class="aide legende-semaine"><span class="puce entre"></span>jour gagnant <span class="puce sort"></span>jour perdant</p>';
}

// Lignes de l'historique d'un client ou d'un fournisseur, des plus récentes aux plus anciennes.
function historiqueHtml(c, client) {
  const lignes = c.historique.slice().reverse();
  const montrees = lignes.slice(0, 40);
  return montrees.map(function (h) {
    const paye = h.montant < 0;
    return '<li><span>' + dateCourte(h.t) + ' · ' + echapper(h.texte) + '</span><span class="' + (paye ? (client ? 'm-entre' : 'm-sort') : 'm-credit') + '">' +
      (paye ? '− ' : '+ ') + franc(Math.abs(h.montant)) + '</span></li>';
  }).join("") + (lignes.length > montrees.length ? '<li class="aide">… et ' + (lignes.length - montrees.length) + ' opérations plus anciennes.</li>' : '');
}
// Remplit un historique au moment où on l'ouvre.
document.addEventListener("toggle", function (e) {
  const d = e.target;
  if (!d.open || !d.dataset || !d.dataset.historique) return;
  const client = d.dataset.sorte === "client";
  const c = (client ? clientsQuiDoivent() : fournisseursQueJeDois()).find(function (x) { return x.cle === d.dataset.historique; });
  if (c) d.querySelector("ul").innerHTML = historiqueHtml(c, client);
}, true);

function videHtml(image, texte) {
  return '<div class="vide"><img src="icones/' + image + '.webp" width="96" height="114" alt=""><p>' + texte + '</p></div>';
}
function totalHtml(titre, liste, mot, classe) {
  const total = liste.reduce(function (s, c) { return s + c.du; }, 0);
  return '<div class="' + classe + '"><span>' + titre + '</span><strong>' + franc(total) + '</strong>' +
    '<small>' + liste.length + ' ' + mot + (liste.length > 1 ? 's' : '') + '</small></div>';
}

// Carte d'un client (« On me doit ») ou d'un fournisseur (« Je dois »).
function carteHtml(c, sorte, avecStatut) {
  const client = sorte === "client";
  const parDefaut = client ? "Achat à crédit" : "Marchandise à crédit";
  const notes = c.historique.filter(function (h) { return h.montant > 0 && h.texte !== parDefaut; })
    .map(function (h) { return h.texte; });
  const derniers = notes.filter(function (t, i) { return notes.lastIndexOf(t) === i; }).slice(-2).join(", ");
  const tel = c.tel ? '<a class="client-tel" href="tel:' + c.tel + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>' +
      afficherTel(c.tel) + '</a>'
    : client ? '<span class="sans-tel">Pas de numéro</span>' : '';
  const statut = client ? statutRelance(c) : null;
  const modifier = '<button type="button" class="petit-modifier" data-fiche="' + echapper(c.cle) + '" data-sorte="' + sorte + '">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/></svg>Modifier</button>';
  return '<li class="client' + (client ? '' : ' fournisseur') + '">' +
    '<div class="client-haut"><b>' + echapper(c.nom) + '</b><strong>' + franc(c.du) + '</strong></div>' +
    (statut && (avecStatut || statut.urgent) ? '<p><span class="etat etat-' + statut.code + '">' + echapper(statut.texte) + '</span></p>' : '') +
    '<p class="client-info ligne-tel">' + (tel || '<span></span>') + modifier + '</p>' +
    '<p class="client-info">' + (client ? 'Doit depuis ' : 'Depuis ') + ilYA(c.depuis).replace("il y a ", "") + (derniers ? ' · ' + echapper(derniers) : '') + '</p>' +
    // L'historique n'est dessiné que si on l'ouvre (voir historiqueHtml).
    '<details class="historique" data-historique="' + echapper(c.cle) + '" data-sorte="' + sorte + '"><summary>Voir l\'historique</summary><ul></ul></details>' +
    '<div class="client-boutons' + (client ? '' : ' un-seul') + '">' +
    (client ? '<button type="button" class="bouton bouton-relancer" data-relancer="' + echapper(c.cle) + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>Relancer</button>' : '') +
    '<button type="button" class="bouton ' + (client ? 'bouton-paye' : 'bouton-fpaye') + '" data-paye="' + echapper(c.cle) + '" data-sorte="' + sorte + '">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>' + (client ? 'Il a payé' : 'J\'ai payé') + '</button>' +
    '</div>' +
    '</li>';
}

function montrer(id) {
  document.querySelectorAll(".ecran").forEach(function (e) {
    e.hidden = e.id !== id;
  });
  $("onglets").hidden = id !== "principal";
  if (id === "principal") afficher();
  document.querySelector('meta[name="theme-color"]')
    .setAttribute("content", id === "accueil" ? "#174A3F" : "#F6EEE3");
}

/* ---------- Message en bas de l'écran ---------- */

let minuterieMessage, actionAnnuler = null, actionAutre = null;
function message(texte, annuler, joyeux, libelle, autre) {
  actionAutre = autre ? autre.action : null;
  $("message-autre").hidden = !autre;
  $("message").classList.toggle("deux-boutons", !!autre);
  if (autre) $("message-autre").textContent = autre.libelle;
  $("message-texte").textContent = texte;
  $("message-image").hidden = !joyeux;
  actionAnnuler = annuler || null;
  $("message-annuler").hidden = !annuler;
  $("message-annuler").textContent = libelle || "Annuler";
  $("message").hidden = false;
  clearTimeout(minuterieMessage);
  minuterieMessage = setTimeout(function () {
    $("message").hidden = true;
    actionAnnuler = null;
    actionAutre = null;
  }, autre ? 9000 : annuler ? 6000 : 3500);
}
$("message-autre").addEventListener("click", function () {
  if (actionAutre) actionAutre();
  actionAutre = null;
});
$("message-annuler").addEventListener("click", function () {
  if (actionAnnuler) actionAnnuler();
  actionAnnuler = null;
  $("message").hidden = true;
});

/* ---------- Saisie ---------- */

const MODES = {
  vente: { titre: "Nouvelle vente", couleur: "var(--entre)", montant: "Prix total", note: "Qu'as-tu vendu ? (facultatif)", exemple: "ex. 2 pains, 1 savon", paiement: true },
  credit: { titre: "Vente à crédit", couleur: "var(--credit)", montant: "Prix total", note: "Qu'a-t-il pris ? (facultatif)", exemple: "ex. huile 1 L", paiement: true },
  depense: { titre: "Nouvelle dépense", couleur: "var(--sort)", montant: "Combien ?", note: "Pour quoi ? (facultatif)", exemple: "ex. marchandise, transport" },
  paye: { titre: "Remboursement", couleur: "var(--entre)", montant: "Combien il te donne ?", note: "Note (facultatif)", exemple: "ex. paiement partiel" },
  maison: { titre: "Pris pour la maison", couleur: "var(--maison)", montant: "Combien ?", note: "Pour quoi ? (facultatif)", exemple: "ex. popote, école, transport" },
  fdette: { titre: "Dette fournisseur", couleur: "var(--credit)", montant: "Prix total de la marchandise", note: "Qu'as-tu pris ? (facultatif)", exemple: "ex. 10 cartons de lait", fournisseur: true, rapides: [5000, 10000, 25000, 50000] },
  fpaye: { titre: "Paiement", couleur: "var(--sort)", montant: "Combien tu lui donnes ?", note: "Note (facultatif)", exemple: "ex. deuxième versement" }
};
const RAPIDES = [500, 1000, 2000, 5000];
let modeSaisie = "vente";
let paiementPartiel = false;
let clientRembourse = null; // client (ou fournisseur) choisi quand on note un paiement

function ouvrirSaisie(mode, client) {
  modeSaisie = mode;
  clientRembourse = client || null;
  const M = MODES[mode];
  $("saisie").style.setProperty("--couleur-saisie", M.couleur);
  $("saisie-titre").textContent = M.titre + (client ? " de " + client.nom : "");
  $("montant-etiquette").textContent = M.montant;
  $("note-etiquette").textContent = M.note;
  $("note").placeholder = M.exemple;
  $("montant").value = "";
  $("donne").value = "";
  $("client").value = "";
  $("tel").value = "";
  $("client-reconnu").hidden = true;
  $("fournisseur").value = "";
  $("tel-f").value = "";
  $("note").value = "";
  $("erreur").hidden = true;

  let rapides = montantsRapides(M.rapides || RAPIDES).map(function (v) {
    return '<button type="button" class="rapide" data-rapide="' + v + '">' + franc(v) + '</button>';
  }).join("");
  if (client) rapides = '<button type="button" class="rapide rapide-tout" data-rapide="' + client.du + '">Tout : ' + franc(client.du) + '</button>' + rapides;
  $("rapides").innerHTML = rapides;
  $("rapides").classList.toggle("avec-tout", !!client);

  preparerChoixVente(mode);
  preparerMoyen(mode);
  coutTape = false;
  $("cout-vente").value = "";
  $("cout-saisie").hidden = true;
  $("bloc-categorie").hidden = mode !== "depense";
  if (mode === "depense") {
    const avecCharges = aDesCharges();
    document.querySelectorAll('[data-categorie="charge"], [data-categorie="impot"]').forEach(function (b) { b.hidden = !avecCharges; });
    const derniere = lire("canari.categorieDepense");
    choisirCategorie(derniere === "marchandise" || (avecCharges && (derniere === "charge" || derniere === "impot")) ? derniere : "autre");
  }
  majCout();
  $("bloc-paiement").hidden = !M.paiement;
  $("bloc-fournisseur").hidden = !M.fournisseur;
  $("donne-etiquette").textContent = M.fournisseur ? "Combien tu as déjà donné ? (facultatif)" : "Combien il a donné ?";
  if (M.fournisseur) afficherSuggestionsF();
  choisirPaiement(mode === "credit");
  $("message").hidden = true;
  $("fond-saisie").hidden = false;
  $("saisie").hidden = false;
  $("saisie").scrollTop = 0;
  $("montant").focus();
}

function choisirPaiement(partiel) {
  paiementPartiel = partiel;
  document.querySelectorAll("[data-paiement]").forEach(function (b) {
    b.setAttribute("aria-pressed", String((b.dataset.paiement === "partiel") === partiel));
  });
  const M = MODES[modeSaisie];
  const avecClient = M.paiement && partiel;
  $("bloc-donne").hidden = !avecClient && !M.fournisseur;
  $("bloc-client").hidden = !avecClient;
  if (avecClient) afficherSuggestions();
  majReste();
}

/* ---------- Prix de revient et type de dépense ---------- */

let coutTape = false;      // le vendeur a changé le prix de revient à la main
let categorieDepense = "autre";

// Affiche le prix de revient et le bénéfice de la vente en cours.
function majCout() {
  const M = MODES[modeSaisie];
  if (!M || !M.paiement) { $("bloc-cout").hidden = true; $("cout-saisie").hidden = true; return; }
  const parProduits = faconVente === "produits";
  const total = parProduits ? totalPanier() : lireMontant($("montant").value);
  if (!total) { $("bloc-cout").hidden = true; return; }
  let cout;
  if (parProduits) {
    cout = lignesPanier().reduce(function (s, l) { return s + coutProduit(donnees.produits[l.produitId]) * l.qte; }, 0);
  } else {
    cout = coutTape ? lireMontant($("cout-vente").value) : coutParMarge(total);
    if (!coutTape) $("cout-vente").value = nombre(cout);
  }
  const benef = total - cout;
  $("bloc-cout").hidden = false;
  $("cout-texte").innerHTML = "Prix de revient : <b>" + franc(cout) + "</b>" +
    (!parProduits && !coutTape ? " (marge " + margeHabituelle() + " %)" : "") +
    "<br>Bénéfice : <b class='" + (benef < 0 ? "m-sort" : "m-entre") + "'>" + (benef < 0 ? "− " : "") + franc(Math.abs(benef)) + "</b>";
  $("cout-changer").hidden = parProduits || !$("cout-saisie").hidden;
}

function choisirCategorie(c) {
  categorieDepense = c;
  ecrire("canari.categorieDepense", c);
  document.querySelectorAll("[data-categorie]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.categorie === c));
  });
  $("categorie-aide").textContent = {
    marchandise: "Ne baisse pas ton bénéfice : il est compté quand tu revends (prix de revient). Ça sort quand même de la caisse.",
    charge: "Déjà comptée chaque jour dans tes charges : ne baisse pas ton bénéfice une 2ᵉ fois. Ça sort de la caisse.",
    impot: "Déjà compté chaque jour dans tes taxes : ne baisse pas ton bénéfice une 2ᵉ fois. Ça sort de la caisse.",
    autre: "Dépense imprévue (réparation, sachets, transport…). Baisse ton bénéfice."
  }[c];
  afficherChoixCharge(c);
}

function majReste() {
  majCout();
  const total = lireMontant($("montant").value);
  const donne = lireMontant($("donne").value);
  if (!total) { $("reste").textContent = ""; return; }
  const fournisseur = MODES[modeSaisie].fournisseur;
  if (donne > total) { $("reste").textContent = fournisseur ? "Tu as donné plus que le prix." : "Il a donné plus que le prix."; return; }
  $("reste").textContent = (fournisseur ? "Reste à payer : " : "Reste à crédit : ") + franc(total - donne);
}

// Propose les clients déjà connus qui correspondent à ce qui est tapé (nom ou numéro).
function afficherSuggestions() {
  const nomTape = $("client").value.trim().toLowerCase();
  const telTape = normaliserTel($("tel").value);
  const clients = listeClients().filter(function (c) {
    if (telTape && c.tel === telTape) return false; // déjà choisi
    if (telTape) return c.tel.indexOf(telTape) !== -1;
    return !nomTape || c.nom.toLowerCase().indexOf(nomTape) !== -1;
  }).slice(0, 6);
  $("suggestions").innerHTML = clients.map(function (c) {
    return '<button type="button" class="suggestion" data-client="' + echapper(c.id) + '">' +
      '<b>' + echapper(c.nom) + '</b><small>' + (c.tel ? afficherTel(c.tel) : 'pas de numéro') + '</small></button>';
  }).join("");
  $("quel-client").hidden = clients.length === 0;
}

// Si le numéro tapé est celui d'un client connu, on remplit son nom.
function reconnaitreClient() {
  const tel = normaliserTel($("tel").value);
  const f = tel && donnees.clients[tel];
  $("client-reconnu").hidden = !f;
  if (f) {
    $("client-reconnu").textContent = "C'est " + f.nom + ", déjà dans ton carnet.";
    $("client").value = f.nom;
  }
}

// Fournisseurs déjà connus qui correspondent au nom tapé.
function afficherSuggestionsF() {
  const tape = $("fournisseur").value.trim().toLowerCase();
  const liste = listeFournisseurs().filter(function (f) {
    return f.nom.toLowerCase() !== tape && (!tape || f.nom.toLowerCase().indexOf(tape) !== -1);
  }).slice(0, 6);
  $("suggestions-f").innerHTML = liste.map(function (f) {
    return '<button type="button" class="suggestion" data-fournisseur="' + echapper(f.id) + '">' +
      '<b>' + echapper(f.nom) + '</b>' + (f.tel ? '<small>' + afficherTel(f.tel) + '</small>' : '') + '</button>';
  }).join("");
}

// Ouvre une fenêtre du bas (produit, arrivage, facture…) sur un fond sombre.
function ouvrirFeuille(id) {
  document.querySelectorAll(".saisie").forEach(function (f) { f.hidden = f.id !== id; });
  $("message").hidden = true;
  $("fond-saisie").hidden = false;
  $(id).scrollTop = 0;
}
function fermerFeuilles() {
  document.querySelectorAll(".saisie").forEach(function (f) { f.hidden = true; });
  $("fond-saisie").hidden = true;
  if (document.activeElement) document.activeElement.blur();
}

function fermerSaisie() {
  $("saisie").hidden = true;
  $("fond-saisie").hidden = true;
  if (document.activeElement) document.activeElement.blur();
}

function formaterChamp(e) {
  if (e.target.readOnly) return;
  const chiffres = e.target.value.replace(/\D/g, "").slice(0, 9);
  e.target.value = chiffres ? nombre(Number(chiffres)) : "";
  $("erreur").hidden = true;
  majReste();
}
$("montant").addEventListener("input", formaterChamp);
$("donne").addEventListener("input", formaterChamp);
$("client").addEventListener("input", function () { $("erreur").hidden = true; afficherSuggestions(); });
$("tel").addEventListener("input", function () { $("erreur").hidden = true; reconnaitreClient(); afficherSuggestions(); });
$("suggestions").addEventListener("click", function (e) {
  const b = e.target.closest("[data-client]");
  if (!b) return;
  const c = listeClients().find(function (x) { return x.id === b.dataset.client; });
  if (!c) return;
  $("tel").value = c.tel ? afficherTel(c.tel) : "";
  $("client").value = c.nom;
  reconnaitreClient();
  afficherSuggestions();
});
$("fournisseur").addEventListener("input", function () { $("erreur").hidden = true; afficherSuggestionsF(); });
$("suggestions-f").addEventListener("click", function (e) {
  const b = e.target.closest("[data-fournisseur]");
  if (!b) return;
  const f = ficheFournisseur(b.dataset.fournisseur);
  $("fournisseur").value = f.nom;
  $("tel-f").value = f.tel ? afficherTel(f.tel) : "";
  afficherSuggestionsF();
});
$("rapides").addEventListener("click", function (e) {
  const b = e.target.closest("[data-rapide]");
  if (!b) return;
  $("montant").value = nombre(Number(b.dataset.rapide));
  $("erreur").hidden = true;
  majReste();
});
$("cout-changer").addEventListener("click", function () {
  $("cout-saisie").hidden = false;
  $("cout-changer").hidden = true;
  $("cout-vente").focus();
  $("cout-vente").select();
});
$("cout-vente").addEventListener("input", function (e) {
  const chiffres = e.target.value.replace(/\D/g, "").slice(0, 9);
  e.target.value = chiffres ? nombre(Number(chiffres)) : "";
  coutTape = true;
  majCout();
});
$("bloc-categorie").addEventListener("click", function (e) {
  const b = e.target.closest("[data-categorie]");
  if (b) choisirCategorie(b.dataset.categorie);
});
$("bloc-paiement").addEventListener("click", function (e) {
  const b = e.target.closest("[data-paiement]");
  if (b) choisirPaiement(b.dataset.paiement === "partiel");
});
$("saisie-annuler").addEventListener("click", fermerSaisie);
$("fond-saisie").addEventListener("click", fermerFeuilles);

function erreur(texte, champ) {
  $("erreur").textContent = texte;
  $("erreur").hidden = false;
  if (champ) champ.focus();
}

$("saisie").addEventListener("submit", function (e) {
  e.preventDefault();
  const M = MODES[modeSaisie];
  const parProduits = M.paiement && faconVente === "produits";
  const lignes = parProduits ? lignesPanier() : null;
  if (parProduits && !lignes.length) return erreur("Appuie sur + à côté des produits vendus.");
  const montant = parProduits ? totalPanier() : lireMontant($("montant").value);
  if (!montant) return erreur("Écris un montant, par exemple 1 500.", $("montant"));

  const note = $("note").value.trim();
  let mouvement, texte, joyeux = false, nouveauClient = null;

  if (M.paiement) {
    let encaisse = montant, client = "", tel = "";
    if (paiementPartiel) {
      encaisse = lireMontant($("donne").value);
      client = $("client").value.trim().replace(/\s+/g, " ");
      tel = normaliserTel($("tel").value);
      if (encaisse > montant) return erreur("Il a donné plus que le prix. Vérifie les montants.", $("donne"));
      if (encaisse === montant) {
        client = ""; tel = "";
      } else if (tel.length < 8) {
        return erreur("Écris le numéro du client : c'est lui qui permet de le retrouver et de le relancer.", $("tel"));
      } else if (!client) {
        return erreur("Écris le nom du client.", $("client"));
      }
    }
    if (tel) {
      // Le numéro identifie le client. Un client déjà connu garde sa fiche.
      if (donnees.clients[tel]) client = donnees.clients[tel].nom;
      else nouveauClient = donnees.clients[tel] = { tel: tel, nom: client, depuis: Date.now() };
    }
    mouvement = { id: nouvelId(), type: "vente", montant: montant, encaisse: encaisse, note: note, client: client, clientId: tel, t: Date.now() };
    if (!tel) delete mouvement.clientId;
    if (lignes) {
      // Le prix de revient de chaque produit est gardé tel qu'il était le jour de la vente.
      lignes.forEach(function (l) {
        const produit = donnees.produits[l.produitId];
        l.cout = coutProduit(produit);
        // Un service vendu consomme ses intrants (ex. mèches pour une coiffure).
        if (typeDe(produit) === "service") {
          const conso = consommationPour(produit, l.qte);
          if (conso.length) l.consommation = conso;
        }
      });
      mouvement.lignes = lignes;
    } else {
      mouvement.cout = coutTape ? lireMontant($("cout-vente").value) : coutParMarge(montant);
    }
    donnees.compteurs.facture = (donnees.compteurs.facture || 0) + 1;
    mouvement.numero = donnees.compteurs.facture;
    donnees.mouvements.push(mouvement);
    const reste = montant - encaisse;
    if (reste > 0) {
      const c = clientsQuiDoivent().find(function (x) { return x.cle === tel; });
      texte = "Noté. " + client + " te doit maintenant " + franc(c ? c.du : reste) + ".";
    } else {
      texte = "Vente de " + franc(montant) + " notée.";
      joyeux = true;
    }
  } else if (modeSaisie === "fdette") {
    const verse = lireMontant($("donne").value);
    const nom = $("fournisseur").value.trim().replace(/\s+/g, " ");
    const tel = normaliserTel($("tel-f").value);
    if (verse > montant) return erreur("Tu as donné plus que le prix. Vérifie les montants.", $("donne"));
    if (!nom) return erreur("Écris le nom du fournisseur.", $("fournisseur"));
    if (tel && tel.length < 8) return erreur("Ce numéro semble incomplet.", $("tel-f"));
    const id = cleFournisseur(nom);
    const fiche = donnees.fournisseurs[id] || { nom: nom, tel: "" };
    if (tel) fiche.tel = tel;
    donnees.fournisseurs[id] = fiche;
    mouvement = { id: nouvelId(), type: "fdette", montant: montant, verse: verse, note: note, client: fiche.nom, fournisseurId: id, t: Date.now() };
    donnees.mouvements.push(mouvement);
    const f = fournisseursQueJeDois().find(function (x) { return x.cle === id; });
    texte = f ? "Noté. Tu dois maintenant " + franc(f.du) + " à " + fiche.nom + "." : "Noté. Tu as tout payé à " + fiche.nom + ".";
  } else if (modeSaisie === "fpaye") {
    const f = clientRembourse;
    if (montant > f.du) return erreur("Tu ne dois que " + franc(f.du) + " à " + f.nom + ".", $("montant"));
    mouvement = { id: nouvelId(), type: "fpaye", montant: montant, note: note, client: f.nom, fournisseurId: f.cle, t: Date.now() };
    donnees.mouvements.push(mouvement);
    const reste = f.du - montant;
    texte = reste > 0 ? "Noté. Tu dois encore " + franc(reste) + " à " + f.nom + "." : "Tu ne dois plus rien à " + f.nom + ". Bravo !";
    joyeux = reste <= 0;
  } else if (modeSaisie === "paye") {
    const c = clientRembourse;
    if (montant > c.du) return erreur(c.nom + " ne te doit que " + franc(c.du) + ".", $("montant"));
    mouvement = { id: nouvelId(), type: "paye", montant: montant, encaisse: montant, note: note, client: c.nom, t: Date.now() };
    donnees.compteurs.recu = (donnees.compteurs.recu || 0) + 1;
    mouvement.numero = donnees.compteurs.recu;
    if (c.tel) mouvement.clientId = c.tel;
    donnees.mouvements.push(mouvement);
    // Quand le client rembourse, sa promesse de paiement est effacée.
    if (donnees.meta[c.cle]) donnees.meta[c.cle].promesse = "";
    const reste = c.du - montant;
    texte = reste > 0 ? "Merci ! " + c.nom + " doit encore " + franc(reste) + "." : c.nom + " a tout payé. Bravo !";
    joyeux = true;
  } else {
    mouvement = { id: nouvelId(), type: modeSaisie, montant: montant, note: note, client: "", t: Date.now() };
    if (modeSaisie === "depense") {
      mouvement.categorie = categorieDepense;
      if ((categorieDepense === "charge" || categorieDepense === "impot") && chargeChoisie) mouvement.chargeId = chargeChoisie;
    }
    donnees.mouvements.push(mouvement);
    texte = modeSaisie === "maison" ? franc(montant) + " pris pour la maison, c'est noté." : NOMS[modeSaisie] + " de " + franc(montant) + " notée.";
  }

  moyenPour(mouvement); // espèces, Wave, Orange Money…
  sauver();
  fermerSaisie();
  afficher();
  if (mouvement.type === "vente" || mouvement.type === "paye") {
    // Proposer tout de suite la facture (ou le reçu) à envoyer au client.
    const m = mouvement;
    // Un nouveau client : proposer aussi de l'ajouter aux contacts du téléphone.
    const autre = nouveauClient ? { libelle: "Contacts", action: function () { ajouterAuxContacts([nouveauClient]); } } : null;
    message(texte, function () { ouvrirDocument(m); }, joyeux, m.type === "paye" ? "Reçu" : "Facture", autre);
  } else {
    message(texte, null, joyeux);
  }
});

/* ---------- Retirer une ligne ---------- */

$("liste").addEventListener("click", function (e) {
  const d = e.target.closest("[data-document]");
  if (d) {
    const m = donnees.mouvements.find(function (x) { return x.id === d.dataset.document; });
    if (m) ouvrirDocument(m);
    return;
  }
  const b = e.target.closest("[data-retirer]");
  if (!b) return;
  const i = donnees.mouvements.findIndex(function (m) { return m.id === b.dataset.retirer; });
  if (i < 0) return;
  const retire = donnees.mouvements.splice(i, 1)[0];
  sauver();
  afficher();
  message("Ligne retirée.", function () {
    donnees.mouvements.splice(i, 0, retire);
    sauver();
    afficher();
  });
});

/* ---------- Onglets et crédits ---------- */

$("onglets").addEventListener("click", function (e) {
  const b = e.target.closest("[data-onglet]");
  if (!b) return;
  onglet = b.dataset.onglet;
  afficher();
  window.scrollTo(0, 0);
});
function clicCarte(e) {
  const cote = e.target.closest("[data-cote]");
  if (cote) { coteCredits = cote.dataset.cote; afficherCredits(); return; }
  const r = e.target.closest("[data-relancer]");
  if (r) {
    const c = clientsQuiDoivent().find(function (x) { return x.cle === r.dataset.relancer; });
    if (c) ouvrirRelance(c);
    return;
  }
  const b = e.target.closest("[data-fiche], [data-paye]");
  if (!b) return;
  const client = b.dataset.sorte === "client";
  const liste = client ? clientsQuiDoivent() : fournisseursQueJeDois();
  const c = liste.find(function (x) { return x.cle === (b.dataset.fiche || b.dataset.paye); });
  if (!c) return;
  if (b.dataset.fiche) ouvrirFiche(c, b.dataset.sorte);
  else ouvrirSaisie(client ? "paye" : "fpaye", c);
}
$("vue-credits").addEventListener("click", clicCarte);
$("vue-relances").addEventListener("click", clicCarte);

/* ---------- Relancer un client sur WhatsApp ---------- */

let clientRelance = null;

// Numéro pour WhatsApp : un numéro ivoirien à 10 chiffres reçoit l'indicatif 225.
function numeroWhatsApp(tel) {
  const d = normaliserTel(tel);
  return d.length === 10 ? "225" + d : d;
}
// Ajoute « Tu peux payer par Wave au 07… » aux relances, si la boutique a des comptes mobiles.
function messageRelance(c, ton) {
  const paiement = lignesPaiement();
  if (LANGUE === "en") {
    return messageRelanceBase(c, ton) + (paiement.length ? "\nYou can also pay by " + paiement.join(", ").replace(/ : /g, ": ") + "." : "");
  }
  return messageRelanceBase(c, ton) + (paiement.length ? "\nTu peux aussi payer par " + paiement.join(", ") + "." : "");
}
function messageRelanceBase(c, ton) {
  const montant = nombre(c.du).replace(/ /g, "\u00a0");
  const j = joursDepuis(c.depuis);
  const duree = j <= 0 ? "aujourd'hui" : j === 1 ? "hier" : j + " jours";
  const limite = new Date();
  limite.setDate(limite.getDate() + 3);
  const dateLimite = limite.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" });
  if (LANGUE === "en") {
    // Les mêmes messages en anglais (3 tons : gentil, ferme, dernier rappel).
    const depuis = j <= 0 ? "today" : j === 1 ? "yesterday" : j + " days";
    if (ton === "ferme") {
      return "Hello " + c.nom + ", I am coming back to you about the " + montant + " " + deviseCourante.mot + " you have owed the shop " +
        (j <= 1 ? "since " + depuis : "for " + depuis) + ". Can you come and pay this week? Tell me which day suits you. Thank you.";
    }
    if (ton === "dernier") {
      return "Hello " + c.nom + ", this is my last reminder about the " + montant + " " + deviseCourante.mot + " owed to the shop. Please pay by " +
        dateLimite + ". Without payment, I will not be able to give you credit any more. Thank you for understanding.";
    }
    return "Hello " + c.nom + ", I hope you are well. A small reminder from the shop: " + montant +
      " " + deviseCourante.mot + " is still to be paid. You can come whenever it suits you. Thank you very much!";
  }
  if (ton === "ferme") {
    return "Bonjour " + c.nom + ", je reviens vers toi pour les " + montant + " " + deviseCourante.mot + " que tu dois à la boutique depuis " + duree +
      ". Peux-tu passer régler cette semaine ? Dis-moi le jour qui t'arrange. Merci.";
  }
  if (ton === "dernier") {
    return "Bonjour " + c.nom + ", c'est mon dernier rappel pour les " + montant + " " + deviseCourante.mot + " dus à la boutique. Merci de régler d'ici " +
      dateLimite + ". Sans règlement, je ne pourrai plus faire de crédit. Merci de ta compréhension.";
  }
  return "Bonjour " + c.nom + ", j'espère que tu vas bien. Petit rappel de la boutique : il reste " + montant +
    " " + deviseCourante.mot + " à régler. Tu peux passer quand ça t'arrange. Merci beaucoup !";
}
function choisirTon(ton) {
  document.querySelectorAll("[data-ton]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.ton === ton));
  });
  $("relance-texte").value = messageRelance(clientRelance, ton);
  majLienWhatsApp();
}
function majLienWhatsApp() {
  $("relance-whatsapp").href = "https://wa.me/" + numeroWhatsApp(clientRelance.tel) +
    "?text=" + encodeURIComponent($("relance-texte").value);
}
function ouvrirRelance(c) {
  clientRelance = c;
  const suivi = donnees.meta[c.cle] || { promesse: "", relances: [] };
  const n = (suivi.relances || []).length;
  $("relance-titre").textContent = "Relancer " + c.nom;
  $("relance-historique").textContent = "Doit " + franc(c.du) + ". " + (n
    ? "Déjà relancé " + n + " fois, la dernière " + ilYA(Math.max.apply(null, suivi.relances)) + "."
    : "Jamais relancé.");
  $("relance-tel").innerHTML = c.tel
    ? "WhatsApp : <b>" + afficherTel(c.tel) + "</b>"
    : '<span class="sans-tel">Pas de numéro : WhatsApp te demandera de choisir le contact.</span>';
  $("relance-promesse").value = suivi.promesse || "";
  $("relance-promesse").min = cleJour(Date.now());
  choisirTon(n === 0 ? "gentil" : n < 3 ? "ferme" : "dernier");
  $("message").hidden = true;
  $("fond-saisie").hidden = false;
  $("relance").hidden = false;
  $("relance").scrollTop = 0;
}
function fermerRelance() {
  $("relance").hidden = true;
  $("fond-saisie").hidden = true;
}
// Chaque envoi compte comme une relance (une seule par minute, pour ne pas compter deux fois).
function noterRelance(texte) {
  const suivi = suiviDe(clientRelance.cle);
  const derniere = suivi.relances.length ? Math.max.apply(null, suivi.relances) : 0;
  if (Date.now() - derniere > 60000) suivi.relances.push(Date.now());
  sauver();
  afficher();
  message(texte);
}
$("tons").addEventListener("click", function (e) {
  const b = e.target.closest("[data-ton]");
  if (b) choisirTon(b.dataset.ton);
});
$("relance-texte").addEventListener("input", majLienWhatsApp);
$("relance-whatsapp").addEventListener("click", function () {
  majLienWhatsApp();
  noterRelance("Relance notée. WhatsApp s'ouvre…");
  fermerRelance();
});
$("relance-copier").addEventListener("click", function () {
  const texte = $("relance-texte").value;
  const fini = function () { noterRelance("Message copié. Colle-le dans WhatsApp ou en SMS."); };
  const secours = function () {
    $("relance-texte").select();
    try { document.execCommand("copy"); fini(); } catch (err) { message("Sélectionne le texte pour le copier."); }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texte).then(fini, secours);
  else secours();
});
$("relance-note").addEventListener("click", function () {
  noterRelance("Relance notée pour " + clientRelance.nom + ".");
  fermerRelance();
});
$("relance-promesse").addEventListener("change", function () {
  const suivi = suiviDe(clientRelance.cle);
  suivi.promesse = $("relance-promesse").value;
  sauver();
  afficher();
  message(suivi.promesse ? "Promesse notée pour le " + dateLongue(suivi.promesse) + "." : "Promesse retirée.");
});
$("relance-fermer").addEventListener("click", fermerRelance);

/* ---------- Fiche client ou fournisseur (corriger nom ou numéro) ---------- */

let clientFiche = null, sorteFiche = "client";
function ouvrirFiche(c, sorte) {
  clientFiche = c;
  sorteFiche = sorte || "client";
  $("fiche-titre").textContent = sorteFiche === "client" ? "Fiche du client" : "Fiche du fournisseur";
  $("fiche-tel-etiquette").textContent = sorteFiche === "client" ? "Numéro de téléphone" : "Numéro de téléphone (facultatif)";
  $("fiche-tel").value = c.tel ? afficherTel(c.tel) : "";
  $("fiche-nom").value = c.nom;
  $("fiche-erreur").hidden = true;
  $("message").hidden = true;
  $("fond-saisie").hidden = false;
  $("fiche").hidden = false;
}
function fermerFiche() {
  $("fiche").hidden = true;
  $("fond-saisie").hidden = true;
  if (document.activeElement) document.activeElement.blur();
}
$("fiche-annuler").addEventListener("click", fermerFiche);
$("fiche").addEventListener("submit", function (e) {
  e.preventDefault();
  const ancien = clientFiche.cle;
  const tel = normaliserTel($("fiche-tel").value);
  const nom = $("fiche-nom").value.trim().replace(/\s+/g, " ");
  const oups = function (t, champ) { $("fiche-erreur").textContent = t; $("fiche-erreur").hidden = false; champ.focus(); };
  if (sorteFiche === "fournisseur") return enregistrerFicheFournisseur(ancien, nom, tel, oups);
  if (tel.length < 8) return oups("Écris le numéro du client (au moins 8 chiffres).", $("fiche-tel"));
  if (!nom) return oups("Écris le nom du client.", $("fiche-nom"));
  if (tel !== ancien && donnees.clients[tel]) {
    return oups("Ce numéro est déjà celui de " + donnees.clients[tel].nom + ".", $("fiche-tel"));
  }
  // On range tout ce qui concerne ce client sous son (nouveau) numéro.
  const fiche = donnees.clients[ancien] || { depuis: Date.now() };
  delete donnees.clients[ancien];
  fiche.tel = tel;
  fiche.nom = nom;
  donnees.clients[tel] = fiche;
  donnees.mouvements.forEach(function (m) {
    if (idClientDe(m) === ancien) { m.clientId = tel; m.client = nom; }
  });
  if (donnees.meta[ancien]) {
    donnees.meta[tel] = donnees.meta[ancien];
    if (tel !== ancien) delete donnees.meta[ancien];
  }
  sauver();
  fermerFiche();
  afficher();
  message("Fiche de " + nom + " enregistrée.");
});

function enregistrerFicheFournisseur(ancien, nom, tel, oups) {
  if (!nom) return oups("Écris le nom du fournisseur.", $("fiche-nom"));
  if (tel && tel.length < 8) return oups("Ce numéro semble incomplet.", $("fiche-tel"));
  const id = cleFournisseur(nom);
  if (id !== ancien && donnees.fournisseurs[id]) {
    return oups("Tu as déjà un fournisseur qui s'appelle " + donnees.fournisseurs[id].nom + ".", $("fiche-nom"));
  }
  delete donnees.fournisseurs[ancien];
  donnees.fournisseurs[id] = { nom: nom, tel: tel };
  donnees.mouvements.forEach(function (m) {
    if ((m.type === "fdette" || m.type === "fpaye") && idFournisseurDe(m) === ancien) { m.fournisseurId = id; m.client = nom; }
  });
  sauver();
  fermerFiche();
  afficher();
  message("Fiche de " + nom + " enregistrée.");
}

/* ---------- Sauvegarde et récupération ---------- */

function joursDepuisSauvegarde() {
  const t = Number(lire(CLE_DERNIERE_SAUVEGARDE));
  return t ? joursDepuis(t) : null;
}

// Petit rappel en haut de l'écran : jamais sauvegardé, ou pas depuis 7 jours.
function afficherRappelSauvegarde() {
  const premier = donnees.mouvements.reduce(function (min, m) { return Math.min(min, m.t); }, Infinity);
  const j = joursDepuisSauvegarde();
  const montrerRappel = premier !== Infinity && joursDepuis(premier) >= 2 && (j === null || j >= 7);
  $("rappel-sauvegarde").hidden = !montrerRappel;
  if (montrerRappel) {
    $("rappel-texte").textContent = j === null
      ? "Tu n'as jamais sauvegardé tes chiffres."
      : "Dernière sauvegarde il y a " + j + " jours.";
  }
}

function afficherReglages() {
  remplirFormBoutique();
  remplirFormPaiements();
  afficherAbonnementReglages();
  const parJour = Math.round((fixeMensuel("charge") + fixeMensuel("impot")) / joursTravail());
  const taux = tauxVentes("charge") + tauxVentes("impot");
  $("resume-charges").textContent = aDesCharges()
    ? "Environ " + franc(parJour) + " par jour de travail" + (taux ? " + " + taux + " % des ventes" : "") + " (" + joursTravail() + " jours par mois)."
    : "Aucune charge enregistrée. Ajoute ton loyer, tes salaires et tes taxes pour voir ton bénéfice net.";
  const j = joursDepuisSauvegarde();
  $("derniere-sauvegarde").textContent = j === null ? "Aucune sauvegarde pour l'instant."
    : "Dernière sauvegarde : " + ilYA(Number(lire(CLE_DERNIERE_SAUVEGARDE))) + ".";
  $("derniere-sauvegarde").classList.toggle("a-faire", j === null || j >= 7);
  $("annuler-restauration").hidden = lire(CLE_AVANT_RESTAURATION) !== "oui";
}

function fichierSauvegarde() {
  const contenu = JSON.stringify({ app: "canari", version: 1, date: new Date().toISOString(), donnees: donnees });
  const nom = tr("canari-sauvegarde") + "-" + cleJour(Date.now()) + ".json";
  return new File([contenu], nom, { type: "application/json" });
}
function sauvegardeFaite() {
  ecrire(CLE_DERNIERE_SAUVEGARDE, String(Date.now()));
  afficherReglages();
  afficher();
}
function telechargerSauvegarde() {
  const fichier = fichierSauvegarde();
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(fichier);
  lien.download = fichier.name;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(function () { URL.revokeObjectURL(lien.href); }, 10000);
  sauvegardeFaite();
  message("Sauvegarde enregistrée dans « Téléchargements » : " + fichier.name, null, true);
}
function partagerSauvegarde() {
  const fichier = fichierSauvegarde();
  if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
    navigator.share({ files: [fichier], title: tr("Sauvegarde Canari") }).then(function () {
      sauvegardeFaite();
      message("Sauvegarde envoyée. Garde bien ce fichier !", null, true);
    }).catch(function (err) {
      if (err && err.name === "AbortError") return; // l'utilisateur a fermé la fenêtre
      telechargerSauvegarde();
    });
  } else {
    telechargerSauvegarde();
  }
}

function restaurer(fichier) {
  const lecteur = new FileReader();
  lecteur.onload = function () {
    let contenu = null;
    try { contenu = JSON.parse(lecteur.result); } catch (e) { contenu = null; }
    const d = contenu && contenu.app === "canari" && contenu.donnees;
    if (!d || !Array.isArray(d.mouvements)) {
      message("Ce fichier n'est pas une sauvegarde Canari.");
      return;
    }
    const quand = contenu.date ? new Date(contenu.date).toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric" }) : "?";
    const ok = window.confirm(tr("Récupérer la sauvegarde du " + quand + " (" + d.mouvements.length + " lignes) ?") + "\n\n" +
      tr("Ce qui est noté sur ce téléphone sera remplacé."));
    if (!ok) return;
    garderAvantRestauration(donnees);
    const abonnement = donnees.abonnement;
    donnees = d;
    completerDonnees();
    garderAbonnement(abonnement);
    sauver();
    afficher();
    afficherReglages();
    message("Sauvegarde récupérée : " + d.mouvements.length + " lignes.", null, true);
  };
  lecteur.onerror = function () { message("Impossible de lire ce fichier."); };
  lecteur.readAsText(fichier);
}

function ouvrirReglages() {
  afficherReglages();
  montrer("reglages");
  window.scrollTo(0, 0);
}
$("ouvrir-reglages").addEventListener("click", ouvrirReglages);
$("rappel-bouton").addEventListener("click", ouvrirReglages);
$("fermer-reglages").addEventListener("click", function () { montrer("principal"); window.scrollTo(0, 0); });
$("sauvegarde-partager").addEventListener("click", partagerSauvegarde);
$("sauvegarde-telecharger").addEventListener("click", telechargerSauvegarde);
$("sauvegarde-fichier").addEventListener("change", function (e) {
  const f = e.target.files && e.target.files[0];
  if (f) restaurer(f);
  e.target.value = "";
});
// La copie d'avant récupération est gardée dans la base (elle peut être grosse).
function garderAvantRestauration(d) {
  const copie = JSON.parse(JSON.stringify(d));
  const marquer = function () { ecrire(CLE_AVANT_RESTAURATION, "oui"); afficherReglages(); };
  if (modeStockage === "base") ecrireBase("avantRestauration", copie).then(marquer).catch(function () {});
  else if (ecrire(CLE_AVANT_RESTAURATION + ".copie", JSON.stringify(copie))) marquer();
}
function lireAvantRestauration() {
  if (modeStockage === "base") return lireBase("avantRestauration");
  try { return Promise.resolve(JSON.parse(lire(CLE_AVANT_RESTAURATION + ".copie"))); } catch (e) { return Promise.resolve(null); }
}
$("annuler-restauration").addEventListener("click", function () {
  if (!window.confirm(tr("Revenir aux chiffres d'avant la récupération ?"))) return;
  lireAvantRestauration().then(function (avant) {
    if (!avant || !Array.isArray(avant.mouvements)) { message("La copie d'avant n'est plus disponible."); return; }
    const abonnement = donnees.abonnement;
    donnees = avant;
    completerDonnees();
    garderAbonnement(abonnement);
    sauver();
    try { localStorage.removeItem(CLE_AVANT_RESTAURATION); localStorage.removeItem(CLE_AVANT_RESTAURATION + ".copie"); } catch (e) { /* rien */ }
    if (modeStockage === "base") ecrireBase("avantRestauration", null).catch(function () {});
    afficher();
    afficherReglages();
    message("C'est revenu comme avant.");
  });
});


// Demande au téléphone de ne pas effacer les données de Canari pour faire de la place.
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(function () {});
}

/* ---------- Démarrage ---------- */

const dateTexte = new Date().toLocaleDateString(LOCALE, { weekday: "short", day: "numeric", month: "short" });
$("date-du-jour").textContent = dateTexte.charAt(0).toUpperCase() + dateTexte.slice(1);


$("commencer").addEventListener("click", function () {
  ecrire(CLE_DEJA_VU, "oui");
  ouvrirParametrage(0, "principal");
});

document.querySelectorAll("[data-saisie]").forEach(function (b) {
  b.addEventListener("click", function () { ouvrirSaisie(b.dataset.saisie); });
});
document.querySelectorAll("[data-bientot]").forEach(function (b) {
  b.addEventListener("click", function () {
    message("Bientôt ! Ce bouton marchera à la prochaine étape.");
  });
});

// Si on revient sur l'appli un autre jour, on remet l'écran à jour.
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) afficher();
});

// Démarrage : on lit les données, puis on met tout en route.
initLangue();
document.querySelectorAll("[data-langue]").forEach(function (b) {
  b.setAttribute("aria-pressed", String(b.dataset.langue === LANGUE));
  b.addEventListener("click", function () { if (b.dataset.langue !== LANGUE) choisirLangue(b.dataset.langue); });
});
chargerDonnees().then(function (d) {
  if (d) donnees = d;
  completerDonnees();
  appliquerDevise();
  initDevise();
  initPaiements();
  initCharges();
  initFiches();
  initIntrants();
  initBoutique();
  initFacture();
  initContacts();
  initAbonnement();
  initVoix();
  montrer(lire(CLE_DEJA_VU) ? "principal" : "accueil");
});

// Fonctionnement sans internet
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  });
}

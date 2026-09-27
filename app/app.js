// Canari · écran principal, ventes (payées en entier ou en partie), dépenses,
// crédits clients et remboursements.
// Les calculs suivent le prototype (prototype/carnet-boutique.html), avec une
// différence voulue : une vente garde son montant total ET ce que le client a
// donné. Le reste passe à crédit sur le nom du client.

const CLE_DEJA_VU = "canari.accueilVu";
const CLE_DONNEES = "canari.donnees";
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
try {
  const brut = JSON.parse(lire(CLE_DONNEES));
  if (brut && Array.isArray(brut.mouvements)) donnees = brut;
} catch (e) { /* données illisibles : on repart de zéro */ }
if (!donnees.meta) donnees.meta = {};
if (!donnees.clients) donnees.clients = {};
if (!donnees.fournisseurs) donnees.fournisseurs = {};

function sauver() {
  if (!ecrire(CLE_DONNEES, JSON.stringify(donnees))) {
    message("Attention : impossible d'enregistrer sur ce téléphone.");
  }
}

/* ---------- Outils ---------- */

const nombre = function (n) {
  return Math.round(n).toLocaleString("fr-FR").replace(/[  ]/g, " ");
};
// Espaces insécables : « 6 500 F » ne sera jamais coupé en fin de ligne.
const franc = function (n) { return nombre(n).replace(/ /g, " ") + " F"; };
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
  return new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
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

function totauxDuJour(jour) {
  let encaisse = 0, depense = 0, maison = 0, vendu = 0, aCredit = 0;
  donnees.mouvements.forEach(function (m) {
    if (cleJour(m.t) !== jour) return;
    if (m.type === "vente" || m.type === "credit") {
      vendu += m.montant;
      aCredit += creditDe(m);
      if (m.type === "vente") encaisse += encaisseDe(m);
    }
    else if (m.type === "paye") encaisse += m.montant;
    else if (m.type === "depense" || m.type === "fpaye") depense += m.montant;
    else if (m.type === "fdette") depense += m.verse || 0;
    else if (m.type === "maison") maison += m.montant;
  });
  return { encaisse: encaisse, depense: depense, maison: maison, gain: encaisse - depense, vendu: vendu, aCredit: aCredit };
}

// Liste des clients qui doivent de l'argent, du plus gros au plus petit.
function clientsQuiDoivent() {
  const parCle = new Map();
  donnees.mouvements.slice().sort(function (a, b) { return a.t - b.t; }).forEach(function (m) {
    const cle = idClientDe(m);
    if (!cle) return;
    const credit = creditDe(m);
    if (credit <= 0 && m.type !== "paye") return;
    const fiche = ficheClient(cle, m.client);
    const c = parCle.get(cle) || { cle: cle, nom: fiche.nom, tel: fiche.tel, du: 0, depuis: 0, historique: [] };
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
  const vus = new Map();
  donnees.mouvements.slice().sort(function (a, b) { return b.t - a.t; }).forEach(function (m) {
    const id = idClientDe(m);
    if (!id || vus.has(id) || !(m.type === "vente" || m.type === "credit" || m.type === "paye")) return;
    vus.set(id, ficheClient(id, m.client));
  });
  return Array.from(vus.values());
}

/* ---------- Affichage ---------- */

const NOMS = {
  vente: "Vente", depense: "Dépense", credit: "Vente à crédit", paye: "Remboursement",
  maison: "Pris pour la maison", fdette: "Dette fournisseur", fpaye: "Payé au fournisseur"
};

let onglet = "jour";
let coteCredits = "clients";

function afficher() {
  afficherJour();
  afficherCredits();
  document.querySelectorAll(".vue").forEach(function (v) { v.hidden = v.id !== "vue-" + onglet; });
  document.querySelectorAll("[data-onglet]").forEach(function (b) {
    if (b.dataset.onglet === onglet) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
}

function afficherJour() {
  const aujourdhui = cleJour(Date.now());
  const t = totauxDuJour(aujourdhui);
  $("gain").textContent = (t.gain < 0 ? "− " : "") + franc(Math.abs(t.gain));
  $("gain").classList.toggle("negatif", t.gain < 0);
  $("encaisse").textContent = franc(t.encaisse);
  $("depense").textContent = franc(t.depense);
  $("maison").textContent = franc(t.maison);
  $("vendu").hidden = t.aCredit === 0;
  $("vendu").textContent = "Vendu aujourd'hui : " + franc(t.vendu) + ", dont " + franc(t.aCredit) + " à crédit";
  const reste = t.gain - t.maison;
  $("reste-boutique").hidden = t.maison === 0;
  $("reste-boutique").textContent = "Reste pour la boutique : " + (reste < 0 ? "− " : "") + franc(Math.abs(reste));

  const lignes = donnees.mouvements
    .filter(function (m) { return cleJour(m.t) === aujourdhui; })
    .sort(function (a, b) { return b.t - a.t; });
  $("vide").hidden = lignes.length > 0;
  $("titre-liste").hidden = lignes.length === 0;
  $("liste").innerHTML = lignes.map(ligneHtml).join("");
}

function ligneHtml(m) {
  const heure = new Date(m.t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const estFournisseur = m.type === "fdette" || m.type === "fpaye";
  const nomQui = !m.client ? "" : estFournisseur ? ficheFournisseur(idFournisseurDe(m), m.client).nom : ficheClient(idClientDe(m), m.client).nom;
  const qui = nomQui ? " · " + echapper(nomQui) : "";
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
  } else {
    const signe = m.type === "paye" ? "+ " : (m.type === "depense" || m.type === "fpaye" || m.type === "maison") ? "− " : "";
    montants = '<span>' + signe + franc(m.montant) + '</span>';
  }
  const nomType = type === "credit" ? "Vente à crédit" : m.type === "vente" && creditDe(m) > 0 ? "Vente, pas tout payé" : NOMS[m.type];
  const titre = m.note || (m.type === "vente" && creditDe(m) > 0 ? "Vente de " + franc(m.montant) : NOMS[type]);
  return '<li class="ligne t-' + type + '">' +
    '<span class="pastille" aria-hidden="true"></span>' +
    '<span class="ligne-texte"><b>' + echapper(titre) + '</b>' +
    '<small>' + nomType + qui + ' · ' + heure + '</small></span>' +
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

function videHtml(image, texte) {
  return '<div class="vide"><img src="icones/' + image + '.webp" width="96" height="114" alt=""><p>' + texte + '</p></div>';
}
function totalHtml(titre, liste, mot, classe) {
  const total = liste.reduce(function (s, c) { return s + c.du; }, 0);
  return '<div class="' + classe + '"><span>' + titre + '</span><strong>' + franc(total) + '</strong>' +
    '<small>' + liste.length + ' ' + mot + (liste.length > 1 ? 's' : '') + '</small></div>';
}

// Carte d'un client (« On me doit ») ou d'un fournisseur (« Je dois »).
function carteHtml(c, sorte) {
  const client = sorte === "client";
  const parDefaut = client ? "Achat à crédit" : "Marchandise à crédit";
  const notes = c.historique.filter(function (h) { return h.montant > 0 && h.texte !== parDefaut; })
    .map(function (h) { return h.texte; });
  const derniers = notes.filter(function (t, i) { return notes.lastIndexOf(t) === i; }).slice(-2).join(", ");
  const tel = c.tel ? '<a class="client-tel" href="tel:' + c.tel + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>' +
      afficherTel(c.tel) + '</a>'
    : client ? '<span class="sans-tel">Pas de numéro</span>' : '';
  return '<li class="client' + (client ? '' : ' fournisseur') + '">' +
    '<div class="client-haut"><b>' + echapper(c.nom) + '</b><strong>' + franc(c.du) + '</strong></div>' +
    (tel ? '<p class="client-info">' + tel + '</p>' : '') +
    '<p class="client-info">' + (client ? 'Doit depuis ' : 'Depuis ') + ilYA(c.depuis).replace("il y a ", "") + (derniers ? ' · ' + echapper(derniers) : '') + '</p>' +
    '<details class="historique"><summary>Voir l\'historique</summary><ul>' +
    c.historique.slice().reverse().map(function (h) {
      const paye = h.montant < 0;
      return '<li><span>' + dateCourte(h.t) + ' · ' + echapper(h.texte) + '</span><span class="' + (paye ? (client ? 'm-entre' : 'm-sort') : 'm-credit') + '">' +
        (paye ? '− ' : '+ ') + franc(Math.abs(h.montant)) + '</span></li>';
    }).join("") + '</ul></details>' +
    '<div class="client-boutons">' +
    '<button type="button" class="bouton bouton-fiche" data-fiche="' + echapper(c.cle) + '" data-sorte="' + sorte + '">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/></svg>Modifier</button>' +
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
  document.querySelector('meta[name="theme-color"]')
    .setAttribute("content", id === "accueil" ? "#174A3F" : "#F6EEE3");
}

/* ---------- Message en bas de l'écran ---------- */

let minuterieMessage, actionAnnuler = null;
function message(texte, annuler, joyeux) {
  $("message-texte").textContent = texte;
  $("message-image").hidden = !joyeux;
  actionAnnuler = annuler || null;
  $("message-annuler").hidden = !annuler;
  $("message").hidden = false;
  clearTimeout(minuterieMessage);
  minuterieMessage = setTimeout(function () {
    $("message").hidden = true;
    actionAnnuler = null;
  }, annuler ? 6000 : 3500);
}
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

  let rapides = (M.rapides || RAPIDES).map(function (v) {
    return '<button type="button" class="rapide" data-rapide="' + v + '">' + franc(v) + '</button>';
  }).join("");
  if (client) rapides = '<button type="button" class="rapide rapide-tout" data-rapide="' + client.du + '">Tout : ' + franc(client.du) + '</button>' + rapides;
  $("rapides").innerHTML = rapides;
  $("rapides").classList.toggle("avec-tout", !!client);

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

function majReste() {
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

function fermerSaisie() {
  $("saisie").hidden = true;
  $("fond-saisie").hidden = true;
  if (document.activeElement) document.activeElement.blur();
}

function formaterChamp(e) {
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
$("bloc-paiement").addEventListener("click", function (e) {
  const b = e.target.closest("[data-paiement]");
  if (b) choisirPaiement(b.dataset.paiement === "partiel");
});
$("saisie-annuler").addEventListener("click", fermerSaisie);
$("fond-saisie").addEventListener("click", function () { fermerSaisie(); fermerFiche(); });

function erreur(texte, champ) {
  $("erreur").textContent = texte;
  $("erreur").hidden = false;
  if (champ) champ.focus();
}

$("saisie").addEventListener("submit", function (e) {
  e.preventDefault();
  const montant = lireMontant($("montant").value);
  if (!montant) return erreur("Écris un montant, par exemple 1 500.", $("montant"));

  const M = MODES[modeSaisie];
  const note = $("note").value.trim();
  let mouvement, texte, joyeux = false;

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
      else donnees.clients[tel] = { tel: tel, nom: client, depuis: Date.now() };
    }
    mouvement = { id: nouvelId(), type: "vente", montant: montant, encaisse: encaisse, note: note, client: client, clientId: tel, t: Date.now() };
    if (!tel) delete mouvement.clientId;
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
    if (c.tel) mouvement.clientId = c.tel;
    donnees.mouvements.push(mouvement);
    // Quand le client rembourse, sa promesse de paiement est effacée.
    if (donnees.meta[c.cle]) donnees.meta[c.cle].promesse = "";
    const reste = c.du - montant;
    texte = reste > 0 ? "Merci ! " + c.nom + " doit encore " + franc(reste) + "." : c.nom + " a tout payé. Bravo !";
    joyeux = true;
  } else {
    mouvement = { id: nouvelId(), type: modeSaisie, montant: montant, note: note, client: "", t: Date.now() };
    donnees.mouvements.push(mouvement);
    texte = modeSaisie === "maison" ? franc(montant) + " pris pour la maison, c'est noté." : NOMS[modeSaisie] + " de " + franc(montant) + " notée.";
  }

  sauver();
  fermerSaisie();
  afficher();
  message(texte, null, joyeux);
});

/* ---------- Retirer une ligne ---------- */

$("liste").addEventListener("click", function (e) {
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
$("vue-credits").addEventListener("click", function (e) {
  const cote = e.target.closest("[data-cote]");
  if (cote) { coteCredits = cote.dataset.cote; afficherCredits(); return; }
  const b = e.target.closest("[data-fiche], [data-paye]");
  if (!b) return;
  const client = b.dataset.sorte === "client";
  const liste = client ? clientsQuiDoivent() : fournisseursQueJeDois();
  const c = liste.find(function (x) { return x.cle === (b.dataset.fiche || b.dataset.paye); });
  if (!c) return;
  if (b.dataset.fiche) ouvrirFiche(c, b.dataset.sorte);
  else ouvrirSaisie(client ? "paye" : "fpaye", c);
});

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

/* ---------- Démarrage ---------- */

const dateTexte = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
$("date-du-jour").textContent = dateTexte.charAt(0).toUpperCase() + dateTexte.slice(1);

$("commencer").addEventListener("click", function () {
  ecrire(CLE_DEJA_VU, "oui");
  montrer("principal");
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

afficher();
montrer(lire(CLE_DEJA_VU) ? "principal" : "accueil");

// Fonctionnement sans internet
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  });
}

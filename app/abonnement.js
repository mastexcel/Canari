// Canari · essai gratuit d'UN MOIS, puis abonnement.
// Chargé avant app.js ; initAbonnement() est lancé au démarrage.
//
// Canari marche sans internet et sans serveur. Le paiement se fait donc ainsi :
//   1. le commerçant paie une formule sur un des comptes de Canari (RECEPTION) ;
//   2. il envoie sa demande sur WhatsApp avec son « numéro Canari » ;
//   3. le propriétaire de Canari vérifie l'argent reçu et crée un code d'activation
//      avec sa page privée (gerant.html), signé avec sa clé secrète ;
//   4. le commerçant colle le code (ou touche le lien) : l'appli vérifie la signature
//      avec la clé publique ci-dessous. Personne d'autre ne peut fabriquer un code.
// Quand l'abonnement est fini, rien n'est effacé ni caché : on peut toujours voir
// ses chiffres, faire sa sauvegarde, relancer et noter les remboursements.
// Seules les nouvelles ventes, dépenses et achats demandent un abonnement.

// Un mois d'essai (décision du propriétaire, 02/10/2026 : l'abonnement est
// exigé après un mois, au lieu de trois). Le compte part du premier jour
// d'utilisation. Rien d'autre à changer : tous les textes de l'appli parlent
// de « jours restants », jamais de « trois mois ».
const ESSAI_JOURS = 30;
const ANCIEN_ESSAI_JOURS = 90;   // la règle d'avant, pour ne couper personne net
// Les prix de l'abonnement sont en FCFA, quelle que soit la monnaie de la boutique.
function francCFA(n) {
  const cfa = deviseCourante.symbole === "F" && !deviseCourante.avant;
  return nombre(n).replace(/ /g, "\u00a0") + (cfa ? "\u00a0F" : "\u00a0FCFA");
}
// Le bandeau prévient 7 jours avant la fin : sur un essai d'un mois, dix
// jours d'avertissement, c'était un tiers de l'essai passé à être relancé.
const PREVENIR_JOURS = 7;
const FORMULES = [
  { id: "mois", nom: "1 mois", jours: 31, prix: 1000, detail: function () { return "Environ " + francCFA(35) + " par jour"; } },
  { id: "trimestre", nom: "3 mois", jours: 92, prix: 2500, detail: function () { return "Tu économises " + francCFA(500); } },
  { id: "an", nom: "1 an", jours: 366, prix: 9000, detail: function () { return "3 mois offerts"; }, conseil: true }
];
// Comptes de Canari (le propriétaire) qui reçoivent les abonnements, tous sur son
// compte entreprise Djamo. À remplir avant le lancement.
const RECEPTION = {
  whatsapp: "0584374848",   // numéro WhatsApp du propriétaire : reçoit les demandes, envoie les codes
  // Wave : lien marchand du propriétaire (extrait de son QR code Wave). Il ouvre
  // directement l'application Wave, et son QR est scannable dans Wave.
  wave: {
    lien: "https://pay.wave.com/m/M_ci_b-BzcCIujDTv/c/ci/?src=d",
    qr: "icones/qr-wave.png"
  },
  djamo: {
    // QR code du compte entreprise Djamo du propriétaire. L'image est générée à
    // partir du lien ci-dessous (niveau de correction H, mascotte au centre).
    qr: "icones/qr-djamo.png",
    lien: "https://pay.djamo.com/hq91c"
  },
  carte: "",      // lien de paiement par carte Visa
  comptes: [      // autres comptes, facultatif : { nom: "Wave", tel: "07…", lien: "…" }
  ]
};
// Les clés publiques qui peuvent signer un code d'activation (format JWK, courbe
// P-256). Elles ne permettent QUE de vérifier un code, jamais d'en fabriquer.
// Il y en a deux, et c'est voulu :
//   1. la clé du TÉLÉPHONE du propriétaire (page gerant.html). Sa clé secrète ne
//      quitte jamais son téléphone. C'est la clé maîtresse : elle marchera
//      toujours, même si le serveur tombe ou si on l'arrête ;
//   2. la clé du SERVEUR du tunnel de vente (voir tunnel/LISEZ-MOI.md), qui signe
//      les codes tout seul dès que CinetPay confirme un paiement. Sa clé secrète
//      vit sur le serveur, pas dans l'appli.
// Deux clés séparées parce qu'un serveur est forcément plus exposé qu'un
// téléphone : si celui-ci était un jour percé, le propriétaire retire la clé
// serveur de cette liste à la mise à jour suivante et sa clé à lui, intacte,
// continue de marcher. Une clé vide est simplement ignorée.
const CLES_PUBLIQUES = [
  { // 1. le téléphone du propriétaire (gerant.html)
    kty: "EC", crv: "P-256",
    x: "lrnwwI4arI86bExVtIjGKJyMuD5Mi2i42cm_2zDP07k",
    y: "W9aVJAHZffpSpR0jPy8IKNZR9hm6iPJntPi_RL6gHMU"
  }
  // 2. le serveur du tunnel : à coller ici (clé publique donnée par
  //    tunnel/fabriquer-cle-serveur.html). Tant qu'elle manque, le tunnel ne
  //    peut pas activer d'abonnement tout seul.
].concat(typeof CLE_SERVEUR !== "undefined" && CLE_SERVEUR && CLE_SERVEUR.x ? [CLE_SERVEUR] : []);
const CLE_MIROIR_ABONNEMENT = "canari.abonnement";

/* ---------- État de l'abonnement ---------- */

function nouvelIdCanari() {
  const lettres = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sans 0/O ni 1/I/L, faciles à confondre
  const alea = new Uint8Array(8);
  crypto.getRandomValues(alea);
  return Array.prototype.map.call(alea, function (n) { return lettres[n % lettres.length]; }).join("");
}

// Crée la fiche d'abonnement si elle manque. Une copie est gardée à part
// (localStorage) : récupérer une vieille sauvegarde ne fait perdre aucun mois payé.
function completerAbonnement() {
  let a = donnees.abonnement;
  if (!a || !a.id) {
    const premier = donnees.mouvements.reduce(function (min, m) { return Math.min(min, m.t || min); }, Date.now());
    a = donnees.abonnement = { id: nouvelIdCanari(), debut: premier, fin: 0, codes: [], conseil: 0, essaisConseil: 0 };
  }
  if (!a.codes) a.codes = [];
  if (!a.conseil) a.conseil = 0;              // fin de l'option Conseil
  if (!a.essaisConseil) a.essaisConseil = 0;  // questions déjà offertes
  // L'essai est passé de trois mois à un mois. Un commerçant qui utilise déjà
  // Canari depuis plus d'un mois se retrouverait coupé net, du jour au
  // lendemain, sans avoir rien vu venir. On lui laisse donc une semaine à
  // partir du jour où il reçoit cette version — une seule fois, et seulement
  // si l'ancienne règle le laissait encore en essai.
  if (a.essaiJusqua === undefined) {
    const t = Date.now();
    a.essaiJusqua = (a.debut + ESSAI_JOURS * JOUR < t && a.debut + ANCIEN_ESSAI_JOURS * JOUR > t)
      ? t + 7 * JOUR : 0;
  }
  let miroir = null;
  try { miroir = JSON.parse(lire(CLE_MIROIR_ABONNEMENT)); } catch (e) { miroir = null; }
  if (miroir && miroir.id === a.id) {
    a.debut = Math.min(a.debut, miroir.debut || a.debut);
    a.fin = Math.max(a.fin || 0, miroir.fin || 0);
    a.conseil = Math.max(a.conseil || 0, miroir.conseil || 0);
    a.essaisConseil = Math.max(a.essaisConseil || 0, miroir.essaisConseil || 0);
    if (miroir.essaiJusqua !== undefined) a.essaiJusqua = Math.max(a.essaiJusqua || 0, miroir.essaiJusqua || 0);
    (miroir.codes || []).forEach(function (c) { if (a.codes.indexOf(c) === -1) a.codes.push(c); });
    a.vu = Math.max(a.vu || 0, miroir.vu || 0);
  }
  garderMiroir();
}
// Après la récupération d'une sauvegarde : une vieille sauvegarde sans abonnement garde
// celui du téléphone ; une sauvegarde d'un autre téléphone apporte le sien (changement de téléphone).
function garderAbonnement(avant) {
  if (!donnees.abonnement && avant) donnees.abonnement = avant;
  completerAbonnement();
}
function garderMiroir() {
  const a = donnees.abonnement;
  ecrire(CLE_MIROIR_ABONNEMENT, JSON.stringify({ id: a.id, debut: a.debut, fin: a.fin, codes: a.codes, vu: a.vu,
    conseil: a.conseil, essaisConseil: a.essaisConseil, essaiJusqua: a.essaiJusqua || 0 }));
}

// L'heure du téléphone, sans pouvoir revenir en arrière pour allonger l'essai.
function maintenantAbonnement() {
  const a = donnees.abonnement;
  const t = Date.now();
  if (!a.vu || t > a.vu) { a.vu = t; return t; }
  return a.vu;
}

function etatAbonnement() {
  const a = donnees.abonnement;
  const t = maintenantAbonnement();
  const finEssai = Math.max(a.debut + ESSAI_JOURS * JOUR, a.essaiJusqua || 0);
  const paye = a.fin > t;
  const fin = paye ? Math.max(a.fin, finEssai) : finEssai;
  const reste = Math.max(0, Math.ceil((fin - t) / JOUR));
  return {
    essai: !paye && t < finEssai,
    paye: paye,
    actif: t < fin,
    fin: fin,
    reste: reste,
    bientot: t < fin && reste <= PREVENIR_JOURS
  };
}
function abonnementActif() { return etatAbonnement().actif; }

function dateFin(t) {
  return new Date(t).toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric" });
}
function texteEtat(e) {
  if (e.paye) return "Abonnement actif jusqu'au " + dateFin(e.fin) + " (" + joursTexte(e.reste) + ").";
  if (e.essai) return "Essai gratuit : encore " + joursTexte(e.reste) + ", jusqu'au " + dateFin(e.fin) + ".";
  return "Ton " + (donnees.abonnement.fin ? "abonnement" : "essai gratuit") + " est fini depuis le " + dateFin(e.fin) + ".";
}
function joursTexte(n) { return n <= 1 ? n + " jour" : n + " jours"; }
function idAffiche(id) { return id.slice(0, 4) + "-" + id.slice(4); }

/* ---------- Codes d'activation ---------- */

// Code : NUMEROCANARI.JOURS.EMISSION.SIGNATURE (signature ECDSA P-256 en base64url).
// Un « C » devant les jours (…​.C92.…) veut dire : option Conseil, pas abonnement.
// Les anciens codes, sans lettre, marchent toujours.
function base64urlVersOctets(texte) {
  const b = atob(texte.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((texte.length + 3) % 4));
  const o = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) o[i] = b.charCodeAt(i);
  return o;
}
function lireCode(texte) {
  // On accepte le code seul, le lien entier, avec espaces ou retours à la ligne.
  const brut = String(texte || "").replace(/\s+/g, "");
  const m = brut.match(/([A-Z2-9]{8})\.(C?\d{1,4})\.([a-z0-9]{4,12})\.([A-Za-z0-9_-]{80,90})/);
  if (!m) return null;
  const conseil = m[2].charAt(0) === "C";
  return { id: m[1], jours: Number(conseil ? m[2].slice(1) : m[2]), conseil: conseil,
    emis: m[3], signature: m[4], charge: m[1] + "." + m[2] + "." + m[3] };
}
// Un code est bon s'il est signé par N'IMPORTE LAQUELLE des clés publiques
// (le téléphone du propriétaire, ou le serveur du tunnel).
function verifierSignature(code) {
  if (!CLES_PUBLIQUES.length || !window.crypto || !crypto.subtle) return Promise.resolve(false);
  const signature = base64urlVersOctets(code.signature);
  const charge = new TextEncoder().encode(code.charge);
  const essayer = function (i) {
    if (i >= CLES_PUBLIQUES.length) return Promise.resolve(false);
    return crypto.subtle.importKey("jwk", CLES_PUBLIQUES[i], { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"])
      .then(function (cle) {
        return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, cle, signature, charge);
      })
      .catch(function () { return false; })
      .then(function (ok) { return ok || essayer(i + 1); });
  };
  return essayer(0);
}

// Ce qu'on dit après un code accepté : abonnement, ou option Conseil.
function texteApresCode(texte) {
  const code = lireCode(texte);
  if (code && code.conseil) {
    return "Option Conseil active jusqu'au " + dateFin(donnees.abonnement.conseil) + ".";
  }
  return texteEtat(etatAbonnement());
}

// Renvoie une promesse avec un message d'erreur, ou "" si tout va bien.
function activerCode(texte) {
  const code = lireCode(texte);
  const a = donnees.abonnement;
  if (!code) return Promise.resolve("Ce code n'est pas complet. Copie tout le message reçu, puis colle-le ici.");
  if (code.id !== a.id) return Promise.resolve("Ce code est pour un autre téléphone (numéro Canari " + idAffiche(code.id) + "). Le tien est " + idAffiche(a.id) + ".");
  if (a.codes.indexOf(code.emis) !== -1) return Promise.resolve("Ce code a déjà été utilisé sur ce téléphone.");
  if (!CLES_PUBLIQUES.length) return Promise.resolve("Les abonnements ne sont pas encore ouverts. Réessaie après la prochaine mise à jour.");
  return verifierSignature(code).then(function (ok) {
    if (!ok) return "Ce code n'est pas valable. Vérifie que tu l'as copié en entier.";
    const t = maintenantAbonnement();
    if (code.conseil) {
      // Option Conseil : les jours s'ajoutent à la suite de l'option en cours.
      a.conseil = Math.max(a.conseil || 0, t) + code.jours * JOUR;
    } else {
      const e = etatAbonnement();
      // Les jours payés s'ajoutent à la fin de l'essai ou de l'abonnement en cours.
      a.fin = Math.max(e.actif ? e.fin : t, a.fin || 0) + code.jours * JOUR;
    }
    a.codes.push(code.emis);
    // La facture de l'abonnement qui vient d'être payé (voir facture-abo.js).
    derniereFactureAbo = noterFactureAbonnement(code, code.conseil ? a.conseil : a.fin);
    garderMiroir();
    sauver();
    return "";
  });
}
let derniereFactureAbo = null;

/* ---------- Écran « Mon abonnement » ---------- */

let formuleChoisie = "an";

function ouvrirAbonnement(raison) {
  const e = etatAbonnement();
  $("abo-raison").hidden = !raison;
  $("abo-raison").textContent = raison || "";
  $("abo-etat").textContent = texteEtat(e);
  $("abo-etat").className = "abo-etat " + (e.actif ? (e.bientot ? "bientot" : "ok") : "fini");
  $("abo-id").textContent = idAffiche(donnees.abonnement.id);
  $("abo-formules").innerHTML = FORMULES.map(function (f) {
    return '<button type="button" class="choix-carte abo-formule" data-formule="' + f.id + '">' +
      (f.conseil ? '<span class="abo-conseil">Conseillé</span>' : '') +
      '<b>' + f.nom + '</b><span class="abo-prix">' + francCFA(f.prix) + '</span><small>' + f.detail() + '</small></button>';
  }).join("");
  choisirFormule(formuleChoisie);
  // Quand le tunnel de vente est allumé (voir tunnel.js), le paiement est
  // automatique : un seul bouton, et l'abonnement s'active tout seul. L'ancien
  // chemin (payer, puis écrire sur WhatsApp) reste là, replié derrière « Je
  // préfère payer autrement » : il ne dépend d'aucun serveur, donc il doit
  // toujours rester possible.
  const auto = tunnelActif();
  $("abo-auto").hidden = !auto;
  $("abo-manuel").hidden = auto && !manuelOuvert;
  $("abo-demande-bloc").hidden = auto && !manuelOuvert;
  $("abo-autrement").hidden = manuelOuvert;
  // Deux chemins de paiement : Wave (le plus courant) et la page Djamo pour les autres.
  const w = RECEPTION.wave, d = RECEPTION.djamo;
  $("abo-wave-lien").hidden = !w.lien;
  if (w.lien) $("abo-wave-lien").href = w.lien;
  $("abo-djamo-lien").hidden = !d.lien;
  if (d.lien) $("abo-djamo-lien").href = d.lien;
  $("abo-djamo").hidden = !w.lien && !d.lien && !d.qr && !w.qr;
  $("abo-qr-bloc").hidden = !d.qr && !w.qr;
  $("abo-qr-wave").hidden = !w.qr;
  if (w.qr) { $("abo-qr-wave-image").src = w.qr; $("abo-qr-wave-enregistrer").href = w.qr; }
  $("abo-qr-autres").hidden = !d.qr;
  if (d.qr) { $("abo-qr").src = d.qr; $("abo-qr-enregistrer").href = d.qr; }
  $("abo-carte").hidden = !RECEPTION.carte;
  if (RECEPTION.carte) $("abo-carte").href = RECEPTION.carte;
  const comptes = RECEPTION.comptes.filter(function (c) { return c.tel || c.lien; });
  $("abo-comptes").hidden = !comptes.length;
  $("abo-comptes").innerHTML = comptes.map(function (c) {
    return '<li><b>' + echapper(c.nom) + '</b> : ' + (c.tel ? echapper(afficherTel(c.tel)) : '') +
      (c.lien ? ' <a href="' + echapper(c.lien) + '" target="_blank" rel="noopener">Payer par lien</a>' : '') + '</li>';
  }).join("");
  $("abo-bientot").hidden = !$("abo-djamo").hidden || !!RECEPTION.carte || comptes.length > 0;
  $("abo-demande").hidden = !RECEPTION.whatsapp;
  $("abo-email").value = donnees.abonnement.email || "";
  $("abo-code").value = "";
  $("abo-erreur").hidden = true;
  afficherFacturesAbo();
  ouvrirFeuille("abonnement");
}
function choisirFormule(id) {
  formuleChoisie = id;
  const f = FORMULES.find(function (x) { return x.id === id; }) || FORMULES[0];
  document.querySelectorAll("[data-formule]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.formule === id));
  });
  $("abo-montant").textContent = francCFA(f.prix);
  const b = donnees.boutique;
  const email = ($("abo-email").value || "").trim();
  // La formule demandée est gardée : à l'activation, c'est elle qui donne le prix
  // à écrire sur la facture (le code d'activation ne contient que des jours).
  donnees.abonnement.demande = { jours: f.jours, prix: f.prix, nom: f.nom, email: email, conseil: false };
  const texte = tr("Bonjour Canari, je veux l'abonnement " + f.nom + " (" + francCFA(f.prix) + ").") + "\n" +
    tr("Mon numéro Canari : " + idAffiche(donnees.abonnement.id)) + "\n" +
    (b.nom ? tr("Boutique : " + b.nom) + "\n" : "") +
    (email ? tr("Mon e-mail : " + email) + "\n" : "") +
    tr(RECEPTION.carte
      ? "J'ai payé par (Wave, Orange Money, MTN, Moov, Djamo ou carte Visa) : "
      : "J'ai payé par (Wave, Orange Money, MTN, Moov ou Djamo) : ");
  // Lien de service pour le propriétaire : il ouvre sa page privée déjà remplie
  // (numéro Canari, formule, nom de la boutique). Sans sa clé secrète, ce lien ne
  // permet de fabriquer aucun code : il ne fait que remplir le formulaire.
  const lienGerant = new URL("gerant.html", location.href).href + "#id=" + donnees.abonnement.id +
    "&j=" + f.jours + "&f=" + encodeURIComponent(f.nom) + "&p=" + f.prix +
    (b.nom ? "&b=" + encodeURIComponent(b.nom.slice(0, 40)) : "") +
    (email ? "&m=" + encodeURIComponent(email) : "") +
    (b.tel ? "&t=" + b.tel : "");   // pour que la réponse parte dans la bonne conversation
  $("abo-demande").href = "https://wa.me/" + numeroWhatsApp(RECEPTION.whatsapp) +
    "?text=" + encodeURIComponent(texte + "\n\n" + tr("Lien pour Canari :") + "\n" + lienGerant);
  // Le guichet automatique : le lien porte la formule et le numéro Canari.
  if (tunnelActif()) $("abo-auto-lien").href = lienPaiementTunnel(f);
}
// « Je préfère payer autrement » : déplie l'ancien chemin, sans serveur.
let manuelOuvert = false;
function validerCode() {
  const bouton = $("abo-activer");
  bouton.disabled = true;
  const texte = $("abo-code").value;
  activerCode(texte).then(function (erreur) {
    bouton.disabled = false;
    if (erreur) { $("abo-erreur").textContent = erreur; $("abo-erreur").hidden = false; return; }
    fermerFeuilles();
    afficher();
    if (!$("reglages").hidden) afficherAbonnementReglages();
    // La facture du paiement s'affiche tout de suite : c'est elle que le
    // commerçant envoie sur WhatsApp ou par e-mail (voir facture-abo.js).
    const facture = derniereFactureAbo;
    message("Merci ! " + texteApresCode(texte),
      facture ? function () { ouvrirFactureAbonnement(facture); } : null,
      true, facture ? "Ma facture" : null);
  });
}

/* ---------- Bandeau, Réglages et actions réservées ---------- */

function afficherBandeauAbonnement() {
  const e = etatAbonnement();
  const montrer = !e.actif || e.bientot;
  $("rappel-abonnement").hidden = !montrer;
  if (montrer) {
    $("rappel-abonnement-texte").textContent = !e.actif
      ? "Ton " + (donnees.abonnement.fin ? "abonnement" : "essai gratuit") + " est fini. Tes chiffres sont gardés."
      : (e.essai ? "Ton essai gratuit finit dans " : "Ton abonnement finit dans ") + joursTexte(e.reste) + ".";
  }
}
function afficherAbonnementReglages() {
  $("reglage-abo-etat").textContent = texteEtat(etatAbonnement());
  $("reglage-abo-id").textContent = idAffiche(donnees.abonnement.id);
}

// Nouvelles ventes, dépenses et achats : seulement avec un essai ou un abonnement en cours.
// Un remboursement de client reste toujours possible : c'est de l'argent qui rentre.
function reserverAuxAbonnes(nom, libre) {
  const original = window[nom];
  window[nom] = function () {
    if (abonnementActif() || (libre && libre.apply(null, arguments))) return original.apply(this, arguments);
    ouvrirAbonnement("Pour noter de nouvelles ventes et dépenses, prends un abonnement. Tes chiffres, tes crédits, tes relances et ta sauvegarde restent disponibles.");
  };
}

// Lien reçu sur WhatsApp : …/#code=XXXX
function codeDansLeLien() {
  const m = location.hash.match(/code=([^&]+)/);
  if (!m) return;
  history.replaceState(null, "", location.pathname + location.search);
  const code = decodeURIComponent(m[1]);
  activerCode(code).then(function (erreur) {
    if (erreur) {
      ouvrirAbonnement();
      $("abo-code").value = code;
      $("abo-erreur").textContent = erreur;
      $("abo-erreur").hidden = false;
    } else {
      afficher();
      const facture = derniereFactureAbo;
      message("Merci ! " + texteApresCode(code),
        facture ? function () { ouvrirFactureAbonnement(facture); } : null,
        true, facture ? "Ma facture" : null);
    }
  });
}

function initAbonnement() {
  completerAbonnement();
  reserverAuxAbonnes("ouvrirSaisie", function (mode) { return mode === "paye"; });
  reserverAuxAbonnes("ouvrirArrivage");
  reserverAuxAbonnes("ouvrirAchatIntrant");
  $("abo-formules").addEventListener("click", function (e) {
    const b = e.target.closest("[data-formule]");
    if (b) choisirFormule(b.dataset.formule);
  });
  $("abo-autrement").addEventListener("click", function () {
    manuelOuvert = true;
    $("abo-manuel").hidden = false;
    $("abo-demande-bloc").hidden = false;
    $("abo-autrement").hidden = true;
  });
  $("abo-activer").addEventListener("click", validerCode);
  $("abo-fermer").addEventListener("click", fermerFeuilles);
  // L'e-mail est gardé sur le téléphone : il sert à la facture et au message du
  // propriétaire, et il est remis d'office à la prochaine ouverture.
  $("abo-email").addEventListener("input", function () {
    donnees.abonnement.email = $("abo-email").value.trim();
    choisirFormule(formuleChoisie);   // l'e-mail entre dans le message et le lien
  });
  $("abo-email").addEventListener("change", sauver);
  $("abo-copier-id").addEventListener("click", function () {
    const id = idAffiche(donnees.abonnement.id);
    if (navigator.clipboard) navigator.clipboard.writeText(id).then(function () { message("Numéro Canari copié : " + id); }, function () {});
  });
  $("rappel-abonnement-bouton").addEventListener("click", function () { ouvrirAbonnement(); });
  $("reglage-abo-ouvrir").addEventListener("click", function () { ouvrirAbonnement(); });
  window.addEventListener("hashchange", codeDansLeLien);
  codeDansLeLien();
}

// Canari · essai gratuit de 3 mois, puis abonnement.
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

const ESSAI_JOURS = 90;
// Les prix de l'abonnement sont en FCFA, quelle que soit la monnaie de la boutique.
function francCFA(n) {
  const cfa = deviseCourante.symbole === "F" && !deviseCourante.avant;
  return nombre(n).replace(/ /g, "\u00a0") + (cfa ? "\u00a0F" : "\u00a0FCFA");
}
const PREVENIR_JOURS = 10; // bandeau sur l'écran principal avant la fin
const FORMULES = [
  { id: "mois", nom: "1 mois", jours: 31, prix: 1000, detail: function () { return "Environ " + francCFA(35) + " par jour"; } },
  { id: "trimestre", nom: "3 mois", jours: 92, prix: 2500, detail: function () { return "Tu économises " + francCFA(500); } },
  { id: "an", nom: "1 an", jours: 366, prix: 9000, detail: function () { return "3 mois offerts"; }, conseil: true }
];
// Comptes de Canari (le propriétaire) qui reçoivent les abonnements, tous sur son
// compte entreprise Djamo. À remplir avant le lancement.
const RECEPTION = {
  whatsapp: "",   // numéro WhatsApp qui reçoit les demandes et envoie les codes
  djamo: {
    qr: "",       // image du QR code Djamo (ex. "icones/qr-djamo.png") : Djamo, Wave, Orange Money, MTN, Moov
    lien: ""      // lien de paiement contenu dans le QR code, s'il y en a un
  },
  carte: "",      // lien de paiement par carte Visa
  comptes: [      // autres comptes, facultatif : { nom: "Wave", tel: "07…", lien: "…" }
  ]
};
// Clé publique de la page gerant.html (format JWK, courbe P-256). Elle ne permet
// que de vérifier les codes, pas d'en fabriquer.
let CLE_PUBLIQUE = null;
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
    a = donnees.abonnement = { id: nouvelIdCanari(), debut: premier, fin: 0, codes: [] };
  }
  if (!a.codes) a.codes = [];
  let miroir = null;
  try { miroir = JSON.parse(lire(CLE_MIROIR_ABONNEMENT)); } catch (e) { miroir = null; }
  if (miroir && miroir.id === a.id) {
    a.debut = Math.min(a.debut, miroir.debut || a.debut);
    a.fin = Math.max(a.fin || 0, miroir.fin || 0);
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
  ecrire(CLE_MIROIR_ABONNEMENT, JSON.stringify({ id: a.id, debut: a.debut, fin: a.fin, codes: a.codes, vu: a.vu }));
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
  const finEssai = a.debut + ESSAI_JOURS * JOUR;
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
function base64urlVersOctets(texte) {
  const b = atob(texte.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((texte.length + 3) % 4));
  const o = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) o[i] = b.charCodeAt(i);
  return o;
}
function lireCode(texte) {
  // On accepte le code seul, le lien entier, avec espaces ou retours à la ligne.
  const brut = String(texte || "").replace(/\s+/g, "");
  const m = brut.match(/([A-Z2-9]{8})\.(\d{1,4})\.([a-z0-9]{4,12})\.([A-Za-z0-9_-]{80,90})/);
  if (!m) return null;
  return { id: m[1], jours: Number(m[2]), emis: m[3], signature: m[4], charge: m[1] + "." + m[2] + "." + m[3] };
}
function verifierSignature(code) {
  if (!CLE_PUBLIQUE || !window.crypto || !crypto.subtle) return Promise.resolve(false);
  return crypto.subtle.importKey("jwk", CLE_PUBLIQUE, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"])
    .then(function (cle) {
      return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, cle,
        base64urlVersOctets(code.signature), new TextEncoder().encode(code.charge));
    }).catch(function () { return false; });
}

// Renvoie une promesse avec un message d'erreur, ou "" si tout va bien.
function activerCode(texte) {
  const code = lireCode(texte);
  const a = donnees.abonnement;
  if (!code) return Promise.resolve("Ce code n'est pas complet. Copie tout le message reçu, puis colle-le ici.");
  if (code.id !== a.id) return Promise.resolve("Ce code est pour un autre téléphone (numéro Canari " + idAffiche(code.id) + "). Le tien est " + idAffiche(a.id) + ".");
  if (a.codes.indexOf(code.emis) !== -1) return Promise.resolve("Ce code a déjà été utilisé sur ce téléphone.");
  if (!CLE_PUBLIQUE) return Promise.resolve("Les abonnements ne sont pas encore ouverts. Réessaie après la prochaine mise à jour.");
  return verifierSignature(code).then(function (ok) {
    if (!ok) return "Ce code n'est pas valable. Vérifie que tu l'as copié en entier.";
    const e = etatAbonnement();
    // Les jours payés s'ajoutent à la fin de l'essai ou de l'abonnement en cours.
    a.fin = Math.max(e.actif ? e.fin : maintenantAbonnement(), a.fin || 0) + code.jours * JOUR;
    a.codes.push(code.emis);
    garderMiroir();
    sauver();
    return "";
  });
}

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
  // QR code Djamo : se scanne avec Djamo, Wave, Orange Money, MTN MoMo ou Moov Money.
  const d = RECEPTION.djamo;
  $("abo-djamo").hidden = !d.qr && !d.lien;
  $("abo-qr-bloc").hidden = !d.qr;
  if (d.qr) { $("abo-qr").src = d.qr; $("abo-qr-enregistrer").href = d.qr; }
  $("abo-djamo-lien").hidden = !d.lien;
  if (d.lien) $("abo-djamo-lien").href = d.lien;
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
  $("abo-code").value = "";
  $("abo-erreur").hidden = true;
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
  const texte = tr("Bonjour Canari, je veux l'abonnement " + f.nom + " (" + francCFA(f.prix) + ").") + "\n" +
    tr("Mon numéro Canari : " + idAffiche(donnees.abonnement.id)) + "\n" +
    (b.nom ? tr("Boutique : " + b.nom) + "\n" : "") +
    tr("J'ai payé par (QR Djamo, Wave, Orange Money, MTN, Moov ou carte Visa) : ");
  $("abo-demande").href = "https://wa.me/" + numeroWhatsApp(RECEPTION.whatsapp) + "?text=" + encodeURIComponent(texte);
}
function validerCode() {
  const bouton = $("abo-activer");
  bouton.disabled = true;
  activerCode($("abo-code").value).then(function (erreur) {
    bouton.disabled = false;
    if (erreur) { $("abo-erreur").textContent = erreur; $("abo-erreur").hidden = false; return; }
    fermerFeuilles();
    afficher();
    if (!$("reglages").hidden) afficherAbonnementReglages();
    message("Merci ! " + texteEtat(etatAbonnement()), null, true);
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
      message("Merci ! " + texteEtat(etatAbonnement()), null, true);
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
  $("abo-activer").addEventListener("click", validerCode);
  $("abo-fermer").addEventListener("click", fermerFeuilles);
  $("abo-copier-id").addEventListener("click", function () {
    const id = idAffiche(donnees.abonnement.id);
    if (navigator.clipboard) navigator.clipboard.writeText(id).then(function () { message("Numéro Canari copié : " + id); }, function () {});
  });
  $("rappel-abonnement-bouton").addEventListener("click", function () { ouvrirAbonnement(); });
  $("reglage-abo-ouvrir").addEventListener("click", function () { ouvrirAbonnement(); });
  window.addEventListener("hashchange", codeDansLeLien);
  codeDansLeLien();
}

// Canari · le tunnel de vente autonome (côté application).
//
// Le but : qu'un commerçant puisse découvrir Canari sur une affiche, l'installer,
// être accompagné par WhatsApp pendant son mois d'essai, payer avec Wave ou Orange
// Money, et voir son abonnement s'activer tout seul — sans que le propriétaire
// touche à son téléphone. Le serveur qui fait ce travail est décrit dans
// tunnel/LISEZ-MOI.md (quatre scénarios n8n).
//
// Ce fichier ne contient que les trois choses qui regardent l'appli :
//   1. l'INSCRIPTION : envoyer le prénom, le numéro WhatsApp et le numéro Canari
//      au serveur, pour qu'il puisse envoyer les rappels. Toujours sur accord du
//      commerçant, jamais en cachette, et refusable à tout moment ;
//   2. le LIEN DE PAIEMENT : ouvrir le guichet (Wave, Orange Money, MTN, Moov)
//      avec le numéro Canari du téléphone dedans ;
//   3. le RETOUR de paiement : dire « c'est reçu, ton code arrive ».
//
// L'appli marche exactement comme avant quand TUNNEL.url est vide : aucun écran
// nouveau, aucune donnée qui sort du téléphone. Le tunnel s'allume le jour où le
// propriétaire colle l'adresse de son serveur ci-dessous.

const TUNNEL = {
  // Adresse publique du serveur du propriétaire (n8n), SANS barre à la fin.
  // Exemple : "https://canari.app.n8n.cloud". Vide = tunnel éteint.
  url: "",
  // Noms des trois portes du serveur (à ne changer que si on les renomme dans n8n).
  inscription: "/webhook/canari-inscription",
  paiement: "/webhook/canari-payer"
};

// Clé publique du serveur qui signe les codes d'activation. Elle est fabriquée
// une seule fois avec tunnel/fabriquer-cle-serveur.html : la page donne une clé
// PUBLIQUE (à coller ici, elle ne permet que de vérifier) et une clé SECRÈTE (à
// coller dans n8n, à ne jamais mettre dans l'appli). Vide = le serveur ne peut
// pas activer d'abonnement, seul le propriétaire le peut depuis gerant.html.
const CLE_SERVEUR = { kty: "EC", crv: "P-256", x: "", y: "" };

function tunnelActif() { return !!TUNNEL.url; }

/* ---------- 1. L'inscription aux rappels WhatsApp ---------- */

// Ce qui part, et rien d'autre : le prénom, le numéro WhatsApp, le nom de la
// boutique, le numéro Canari du téléphone et la langue. Jamais une vente, jamais
// un client, jamais un montant. C'est écrit en clair dans l'écran d'accord et
// dans app/confidentialite.html.
function fichierInscription() {
  const a = donnees.abonnement, r = a.rappels || {}, b = donnees.boutique;
  return {
    id: a.id,
    nom: r.nom || "",
    telephone: r.tel || b.tel || "",
    boutique: b.nom || "",
    langue: typeof LANGUE !== "undefined" ? LANGUE : "fr",
    debut: new Date(a.debut).toISOString().slice(0, 10),
    finEssai: new Date(etatAbonnement().fin).toISOString().slice(0, 10)
  };
}

// L'envoi peut rater (pas de réseau, serveur arrêté) : on réessaie à l'ouverture
// suivante et dès que le réseau revient. Un commerçant qui n'a pas de forfait ce
// jour-là ne doit pas perdre son inscription.
function envoyerInscription() {
  const a = donnees.abonnement, r = a.rappels;
  if (!tunnelActif() || !r || !r.ok || r.envoye || !r.tel) return Promise.resolve(false);
  return fetch(TUNNEL.url + TUNNEL.inscription, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fichierInscription())
  }).then(function (reponse) {
    if (!reponse.ok) return false;
    r.envoye = Date.now();
    sauver();
    return true;
  }).catch(function () { return false; });   // hors ligne : on réessaiera
}

// Dire oui (ou non) aux rappels. Appelé par le questionnaire de départ et par
// Réglages → Rappels WhatsApp.
function reglerRappels(ok, nom, tel) {
  const a = donnees.abonnement;
  const r = a.rappels = a.rappels || {};
  r.ok = !!ok;
  if (nom !== undefined) r.nom = String(nom || "").trim().slice(0, 40);
  if (tel !== undefined) {
    const propre = normaliserTel(tel);
    if (propre !== r.tel) r.envoye = 0;   // nouveau numéro : il faut le redire au serveur
    r.tel = propre;
  }
  if (!r.ok) r.envoye = 0;
  sauver();
  return r.ok ? envoyerInscription() : Promise.resolve(false);
}

/* ---------- 2. Le lien de paiement ---------- */

// Le guichet a besoin de savoir POUR QUEL TÉLÉPHONE on paie : c'est le numéro
// Canari qui voyage dans le lien, et c'est lui que le serveur écrira dans le code
// d'activation. Un code fabriqué pour un numéro Canari ne marche sur aucun autre
// téléphone (voir activerCode dans abonnement.js) : un lien de paiement partagé
// par erreur n'abonne donc personne d'autre.
function lienPaiementTunnel(formule) {
  const a = donnees.abonnement, b = donnees.boutique, r = a.rappels || {};
  const q = [
    "id=" + encodeURIComponent(a.id),
    "plan=" + encodeURIComponent(formule.id),
    "jours=" + formule.jours,
    "prix=" + formule.prix
  ];
  const tel = r.tel || b.tel;
  if (tel) q.push("tel=" + encodeURIComponent(tel));
  if (b.nom) q.push("boutique=" + encodeURIComponent(b.nom.slice(0, 40)));
  if (a.email) q.push("email=" + encodeURIComponent(a.email));
  if (typeof LANGUE !== "undefined") q.push("langue=" + LANGUE);
  return TUNNEL.url + TUNNEL.paiement + "?" + q.join("&");
}

/* ---------- 3. Le retour du guichet ---------- */

// Après le paiement, le guichet ramène le commerçant sur l'appli avec
// …/#paiement=ok (ou #paiement=non s'il a abandonné). Le code d'activation, lui,
// arrive par WhatsApp quelques secondes plus tard : c'est le serveur qui
// l'envoie, une fois le paiement vérifié auprès du guichet. On ne débloque
// jamais l'abonnement sur la seule parole du navigateur : n'importe qui pourrait
// taper #paiement=ok dans l'adresse.
function retourPaiement() {
  const m = location.hash.match(/paiement=(ok|non)/);
  if (!m) return;
  history.replaceState(null, "", location.pathname + location.search);
  if (m[1] === "non") {
    message("Paiement annulé. Tu peux réessayer quand tu veux.");
    return;
  }
  message("Paiement reçu, merci ! Ton code d'activation arrive sur WhatsApp dans un instant. Touche le lien du message et c'est fini.",
    null, true);
  // Le code met quelques secondes à partir : on reste poli et on ne redemande rien.
}

/* ---------- Réglages → Rappels WhatsApp ---------- */

function afficherRappelsReglages() {
  $("form-rappels").hidden = !tunnelActif();
  if (!tunnelActif()) return;
  const r = donnees.abonnement.rappels || {};
  const b = donnees.boutique;
  $("rappels-ok").setAttribute("aria-pressed", String(!!r.ok));
  $("rappels-champs").hidden = !r.ok;
  $("rappels-nom").value = r.nom || "";
  $("rappels-tel").value = r.tel ? afficherTel(r.tel) : (b.tel ? afficherTel(b.tel) : "");
  $("rappels-etat").textContent = !r.ok
    ? tr("Canari ne t'écrit pas. Rien ne sort de ton téléphone.")
    : r.envoye
      ? tr("C'est noté : Canari peut t'écrire.")
      : tr("Dès que tu auras du réseau, Canari enregistrera ton numéro.");
}

function initRappelsReglages() {
  const carte = $("form-rappels");
  if (!carte) return;
  $("rappels-ok").addEventListener("click", function () {
    const ouvert = $("rappels-ok").getAttribute("aria-pressed") !== "true";
    $("rappels-ok").setAttribute("aria-pressed", String(ouvert));
    $("rappels-champs").hidden = !ouvert;
  });
  $("rappels-garder").addEventListener("click", function () {
    const ok = $("rappels-ok").getAttribute("aria-pressed") === "true";
    const tel = $("rappels-tel").value;
    if (ok && normaliserTel(tel).length < 8) {
      message("Écris ton numéro WhatsApp (au moins 8 chiffres) pour que Canari puisse t'écrire.");
      return;
    }
    reglerRappels(ok, $("rappels-nom").value, tel);
    afficherRappelsReglages();
    message(ok ? "C'est noté, Canari peut t'écrire." : "C'est noté, Canari ne t'écrit pas.", null, true);
  });
}

/* ---------- Mise en route ---------- */

function initTunnel() {
  initRappelsReglages();
  afficherRappelsReglages();
  if (!tunnelActif()) return;
  window.addEventListener("hashchange", retourPaiement);
  retourPaiement();
  // Rattrapage : une inscription restée en route repart dès qu'il y a du réseau.
  envoyerInscription();
  window.addEventListener("online", function () { envoyerInscription(); });
}

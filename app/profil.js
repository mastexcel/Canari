// Canari · L'ONGLET PROFIL.
//
// Demande du propriétaire (27/10/2026) : « ajoute un onglet profil à Canari ».
//
// CE QU'IL RÉPARE. L'identité de la boutique — son nom, son logo, son numéro,
// son registre du commerce, sa monnaie — était enfouie dans les Réglages,
// derrière la roue dentée, au milieu de quinze autres cartes. Le commerçant
// qui voulait vérifier ce qui s'imprime sur ses factures devait chercher. Son
// abonnement était ailleurs, son entreprise ailleurs encore. Le Profil
// rassemble en un écran tout ce qui répond à « qui suis-je, dans Canari ? ».
//
// CE N'EST PAS UN DOUBLON DES RÉGLAGES, et la frontière est nette :
//   · le PROFIL MONTRE — qui tu es, depuis quand, ce que tu as, où tu en es
//     de ton abonnement. On le lit ;
//   · les RÉGLAGES CHANGENT — les formulaires, les interrupteurs, la
//     sauvegarde, la remise à zéro. On y tape.
// Chaque carte du Profil porte donc un bouton qui ouvre le bon formulaire des
// Réglages, et AUCUN formulaire n'est redessiné ici : un champ copié deux fois
// est un champ qui finira par diverger.

/* ---------- L'identité de la boutique ---------- */

// Depuis quand cette boutique existe dans Canari : la date du premier
// mouvement noté. C'est la seule date vraie dont on dispose.
function debutBoutique() {
  const premier = donnees.mouvements.reduce(function (min, m) {
    return Math.min(min, m.t);
  }, Infinity);
  return premier === Infinity ? 0 : premier;
}

// Ce que la boutique vend, en une phrase, d'après le questionnaire de départ.
// Les trois mots sont ceux des Réglages : on ne réinvente pas un vocabulaire.
function metierBoutique() {
  const a = (donnees.boutique.activites || []).slice();
  if (!a.length) return "";
  const noms = { revente: "Revente", fabrication: "Fabrication", service: "Services", services: "Services" };
  return a.map(function (k) { return tr(noms[k] || k); }).join(" · ");
}

/* ---------- L'écran ---------- */

function afficherProfil() {
  const b = donnees.boutique;
  const nom = b.nom || tr("Ma boutique");
  const debut = debutBoutique();
  const metier = metierBoutique();

  /* La carte d'identité, en graphite et braise : c'est un « grand moment »
     au sens de la charte — on la regarde, on n'y travaille pas. */
  let html = '<section class="profil-tete">' +
    '<div class="profil-haut">' +
      '<div class="profil-vignette">' +
        (b.logo
          ? '<img src="' + b.logo + '" alt="">'
          : '<img src="icones/canari-tranquille.webp" width="72" height="76" alt="">') +
      '</div>' +
      '<div class="profil-nom">' +
        '<h2 translate="no">' + echapper(nom) + '</h2>' +
        (metier ? '<p class="profil-metier">' + echapper(metier) + '</p>' : '') +
      '</div>' +
    '</div>' +
    (debut ? '<p class="profil-depuis">' + tr("Dans Canari depuis le") + " " + dateLongue(cleJour(debut)) + '</p>' : '') +
    '<ul class="profil-compteurs">' +
      compteur(donnees.mouvements.filter(function (m) { return m.type === "vente"; }).length, "ventes notées", "vente notée") +
      compteur(Object.keys(donnees.clients).length, "clients", "client") +
      compteur(listeProduits().length, "produits", "produit") +
      compteur(Object.keys(donnees.fournisseurs).length, "fournisseurs", "fournisseur") +
    '</ul>' +
  '</section>';

  /* L'abonnement : le même texte que dans les Réglages (texteEtat), pour que
     les deux écrans ne puissent jamais se contredire. */
  const e = etatAbonnement();
  html += '<section class="carte-reglage profil-carte">' +
    '<h2>' + tr("Mon abonnement") + '</h2>' +
    '<p class="' + (e.actif ? "" : "negatif") + '">' + echapper(texteEtat(e)) + '</p>' +
    '<p class="aide">' + tr("Ton numéro Canari :") + ' <b translate="no">' + echapper(idAffiche(donnees.abonnement.id)) + '</b></p>' +
    '<button type="button" class="bouton bouton-sauver" data-profil="abonnement">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/></svg>' +
      tr("Voir les formules") + '</button>' +
  '</section>';

  // Mes entreprises : seulement s'il y en a plusieurs, comme le bandeau du
  // haut. Sur un téléphone à une seule entreprise, ce serait une carte vide
  // de sens — et le bouton pour en ajouter vit déjà dans les Réglages.
  if (typeof plusieursEntreprises === "function" && plusieursEntreprises()) {
    html += '<section class="carte-reglage profil-carte">' +
      '<h2>' + tr("Mon entreprise") + '</h2>' +
      '<p translate="no">' + echapper(nomEntreprise(entrepriseActive())) + '</p>' +
      '<button type="button" class="bouton bouton-annuler" data-profil="entreprises">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21V9l6-4 6 4v12M9 21v-5h3v5M15 21h6V13l-6-4"/></svg>' +
        tr("Changer d'entreprise") + '</button>' +
    '</section>';
  }

  /* Ce qui s'imprime sur les factures. C'est la raison d'être de cette carte :
     le commerçant doit pouvoir vérifier d'un coup d'œil ce que ses clients
     vont lire, sans ouvrir un formulaire. */
  const lignes = [
    ["Téléphone", b.tel ? afficherTel(b.tel) : ""],
    ["Adresse", b.adresse || ""],
    ["N° RCCM", b.rccm || ""],
    ["N° de compte contribuable", b.dfe || ""],
    ["Monnaie", nomDevise()]
  ].filter(function (l) { return l[1]; });

  html += '<section class="carte-reglage profil-carte">' +
    '<h2>' + tr("Ma boutique") + '</h2>' +
    (lignes.length
      ? '<dl class="profil-infos">' + lignes.map(function (l) {
          return '<div><dt>' + tr(l[0]) + '</dt><dd translate="no">' + echapper(l[1]) + '</dd></div>';
        }).join("") + '</dl>'
      : '<p class="aide">' + tr("Tu n'as pas encore rempli les informations de ta boutique. Elles s'impriment sur tes factures et tes reçus.") + '</p>') +
    '<button type="button" class="bouton bouton-sauver" data-profil="boutique">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/></svg>' +
      tr("Modifier mes informations") + '</button>' +
  '</section>';

  /* Les raccourcis : les quatre choses qu'on va chercher dans les Réglages et
     qu'on ne retrouve jamais du premier coup. */
  html += '<section class="carte-reglage profil-carte">' +
    '<h2>' + tr("Aller plus loin") + '</h2>' +
    '<div class="profil-liens">' +
      '<a class="bouton bouton-annuler" href="guide.html" target="_blank" rel="noopener">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h7v15H4zM13 5h7v15h-7z"/></svg>' + tr("Guide de l'utilisateur") + '</a>' +
      '<button type="button" class="bouton bouton-annuler" data-profil="export">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/></svg>' + tr("Télécharger mes chiffres") + '</button>' +
      '<button type="button" class="bouton bouton-annuler" data-profil="sauvegarde">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM9 4v6h6V4"/></svg>' + tr("Sauvegarder mes chiffres") + '</button>' +
      '<button type="button" class="bouton bouton-annuler" data-profil="reglages">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/></svg>' + tr("Tous les réglages") + '</button>' +
    '</div>' +
  '</section>';

  $("vue-profil").innerHTML = html;
}

// « 1 client » / « 12 clients » : les deux accords sont écrits en entier, des
// deux côtés du dictionnaire. Jamais « client(s) » (règle du projet).
function compteur(n, pluriel, singulier) {
  return '<li><b>' + nombre(n) + '</b><small>' + tr(n > 1 ? pluriel : singulier) + '</small></li>';
}

/* ---------- Les boutons ---------- */

// Ouvre les Réglages ET amène l'œil sur la bonne carte : sans le défilement,
// le commerçant retombe en haut d'un écran long et doit chercher à nouveau —
// exactement ce que le Profil est censé lui épargner.
function reglagesSur(id) {
  ouvrirReglages();
  const carte = $(id);
  if (!carte) return;
  // Après le rendu, sinon la position n'est pas encore connue.
  requestAnimationFrame(function () {
    carte.scrollIntoView({ block: "start", behavior: "smooth" });
  });
}

function initProfil() {
  $("vue-profil").addEventListener("click", function (e) {
    const b = e.target.closest("[data-profil]");
    if (!b) return;
    const quoi = b.dataset.profil;
    if (quoi === "abonnement") ouvrirAbonnement();
    else if (quoi === "entreprises") ouvrirEntreprises();
    else if (quoi === "boutique") reglagesSur("form-boutique");
    else if (quoi === "export") ouvrirExport();
    else if (quoi === "sauvegarde") reglagesSur("carte-sauvegarde");
    else if (quoi === "reglages") ouvrirReglages();
  });
}

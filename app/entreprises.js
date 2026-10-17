// Canari · plusieurs entreprises sur le même téléphone.
//
// Demande du propriétaire (17/10/2026) : « on doit pouvoir enregistrer
// plusieurs entreprises différentes et sélectionner à chaque fois avec
// laquelle on souhaite partir ; le nombre d'entreprises possible de créer doit
// se faire en fonction des abonnements ».
//
// COMMENT C'EST RANGÉ. Chaque entreprise a son propre dossier : ses ventes,
// ses clients, ses produits, ses charges — tout, séparé. La PREMIÈRE garde la
// clé « principal », celle de toutes les versions d'avant : un commerçant qui
// met simplement l'appli à jour ne perd rien et n'a rien à faire. Les suivantes
// reçoivent une clé « dossier-xxxxxx ».
//
// CE QUI RESTE COMMUN AU TÉLÉPHONE, et pas à l'entreprise :
//   · l'ABONNEMENT. Sinon il suffirait de créer une deuxième entreprise pour
//     obtenir un deuxième mois d'essai gratuit. Le numéro Canari, les jours
//     payés et l'option Conseil sont donc partagés par toutes les entreprises
//     (voir completerAbonnement dans abonnement.js) ;
//   · la langue, la voix, et les autres réglages du téléphone.
//
// LA RÈGLE DU NOMBRE, et elle est volontairement gentille : l'abonnement dit
// combien d'entreprises on peut CRÉER. Il n'efface jamais rien. Un commerçant
// qui passe d'une formule à trois entreprises à une formule à une seule voit
// toujours ses trois entreprises et travaille dedans : il ne peut simplement
// plus en ajouter. On ne prend jamais en otage le travail de quelqu'un.

const CLE_ENTREPRISES = "canari.entreprises";   // miroir localStorage de l'index
const MAX_ENTREPRISES = 20;                      // garde-fou : au-delà, l'écran devient une liste illisible

// L'index : quelle entreprise est ouverte, et la liste de toutes.
let indexEntreprises = { actif: "principal", liste: [] };

function nouvelleCleDossier() {
  return "dossier-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ---------- Lecture et écriture de l'index ---------- */

// Lu AVANT les données, au démarrage : c'est lui qui dit quel dossier ouvrir.
function chargerEntreprises() {
  let miroir = null;
  try { miroir = JSON.parse(lire(CLE_ENTREPRISES)); } catch (e) { miroir = null; }
  return lireBase("entreprises").then(function (d) {
    return d && Array.isArray(d.liste) ? d : miroir;
  }).catch(function () {
    return miroir;
  }).then(function (index) {
    indexEntreprises = completerIndex(index);
    cleDossier = indexEntreprises.actif;
    return null;
  });
}

// Un index neuf, ou réparé : il y a toujours au moins « principal ».
function completerIndex(index) {
  const i = index && Array.isArray(index.liste) && index.liste.length
    ? { actif: index.actif, liste: index.liste.filter(function (e) { return e && e.cle; }) }
    : { actif: "principal", liste: [{ cle: "principal", nom: "", cree: Date.now() }] };
  if (!i.liste.some(function (e) { return e.cle === "principal"; })) {
    i.liste.unshift({ cle: "principal", nom: "", cree: Date.now() });
  }
  if (!i.liste.some(function (e) { return e.cle === i.actif; })) i.actif = i.liste[0].cle;
  return i;
}

function enregistrerEntreprises() {
  ecrire(CLE_ENTREPRISES, JSON.stringify(indexEntreprises));
  if (modeStockage === "base") ecrireBase("entreprises", indexEntreprises).catch(function () { /* le miroir suffit */ });
}

/* ---------- Lire la liste ---------- */

function listeEntreprises() { return indexEntreprises.liste; }
function plusieursEntreprises() { return indexEntreprises.liste.length > 1; }

// Le nom montré : celui de la boutique si elle en a un, sinon un nom de secours.
// Le nom de l'entreprise ACTIVE suit toujours celui de la boutique : si le
// commerçant renomme sa boutique dans Réglages, la liste suit toute seule.
function nomEntreprise(e) {
  if (e.cle === indexEntreprises.actif && donnees.boutique && donnees.boutique.nom) return donnees.boutique.nom;
  return e.nom || tr("Entreprise sans nom");
}
function entrepriseActive() {
  return indexEntreprises.liste.find(function (e) { return e.cle === indexEntreprises.actif; }) || indexEntreprises.liste[0];
}
// Garde le nom de l'entreprise active à jour dans l'index (appelé après un
// changement du nom de la boutique).
function majNomEntreprise() {
  const e = entrepriseActive();
  const nom = (donnees.boutique && donnees.boutique.nom) || "";
  if (e && e.nom !== nom) { e.nom = nom; enregistrerEntreprises(); }
}

/* ---------- Combien l'abonnement en permet ---------- */

// L'abonnement porte le nombre d'entreprises (voir abonnement.js). Sans
// abonnement payé — pendant l'essai, ou après la fin — c'est une seule.
function entreprisesAutorisees() {
  const a = donnees.abonnement;
  if (!a) return 1;
  const e = etatAbonnement();
  return e.paye ? Math.max(1, a.entreprises || 1) : 1;
}
// Les entreprises qui comptent dans l'abonnement : toutes, SAUF la boutique
// de démonstration (voir demo.js). Sinon la démo prendrait l'unique place
// permise pendant l'essai gratuit — exactement le moment où l'on cherche à
// convaincre quelqu'un.
function entreprisesComptees() {
  return listeEntreprises().filter(function (e) { return !e.demo; });
}
function peutCreerEntreprise() {
  return entreprisesComptees().length < Math.min(MAX_ENTREPRISES, entreprisesAutorisees());
}

/* ---------- Changer d'entreprise ---------- */

// On enregistre ce qui est ouvert, puis on ouvre l'autre dossier. Tout est
// redessiné : la mémoire des calculs est vidée par le changement de version,
// sinon l'écran montrerait les chiffres de l'entreprise d'avant.
function basculerVers(cle) {
  if (cle === indexEntreprises.actif) { fermerFeuilles(); return Promise.resolve(); }
  const cible = indexEntreprises.liste.find(function (e) { return e.cle === cle; });
  if (!cible) return Promise.resolve();
  sauver();
  majNomEntreprise();
  indexEntreprises.actif = cle;
  cleDossier = cle;
  enregistrerEntreprises();
  versionDonnees++;                       // vide la mémoire des calculs
  return chargerDonnees().then(function (d) {
    donnees = d || { mouvements: [], clients: {}, fournisseurs: {}, meta: {} };
    completerDonnees();
    completerAbonnement();                // l'abonnement est commun au téléphone
    appliquerDevise();
    fermerFeuilles();
    montrer("principal");
    afficher();
    afficherEntreprises();
    message(tr("Tu travailles maintenant dans") + " " + nomEntreprise(cible) + ".", null, true);
  });
}

// Créer une entreprise : un dossier vide, et on part dessus. Le questionnaire
// de départ s'ouvre tout seul — une entreprise neuve n'a ni nom, ni charges.
function creerEntreprise(nom) {
  if (!peutCreerEntreprise()) return Promise.resolve(false);
  const cle = nouvelleCleDossier();
  const propre = String(nom || "").trim().replace(/\s+/g, " ").slice(0, 40);
  sauver();
  majNomEntreprise();
  indexEntreprises.liste.push({ cle: cle, nom: propre, cree: Date.now() });
  indexEntreprises.actif = cle;
  cleDossier = cle;
  enregistrerEntreprises();
  versionDonnees++;
  const abonnement = donnees.abonnement;  // commun au téléphone : il suit
  donnees = { mouvements: [], clients: {}, fournisseurs: {}, meta: {} };
  if (abonnement) donnees.abonnement = JSON.parse(JSON.stringify(abonnement));
  completerDonnees();
  if (propre) donnees.boutique.nom = propre;
  completerAbonnement();
  sauver();
  appliquerDevise();
  fermerFeuilles();
  afficher();
  // Le questionnaire de départ : une entreprise neuve n'a ni marge, ni charges.
  ouvrirParametrage(0, "principal");
  return Promise.resolve(true);
}

// Supprimer une entreprise. Jamais celle qui est ouverte (on bascule d'abord),
// jamais la dernière, et avec deux confirmations : c'est irréversible.
function supprimerEntreprise(cle) {
  if (indexEntreprises.liste.length < 2) return;
  const e = indexEntreprises.liste.find(function (x) { return x.cle === cle; });
  if (!e) return;
  const nom = nomEntreprise(e);
  if (!window.confirm(tr("Supprimer " + nom + " ? Toutes ses ventes, ses clients et ses produits seront perdus.") + "\n\n" +
      tr("Si tu n'as pas fait de sauvegarde, touche Annuler et fais-la d'abord."))) return;
  if (!window.confirm(tr("Dernière question : es-tu sûr ? On ne peut pas revenir en arrière."))) return;
  const etaitActive = cle === indexEntreprises.actif;
  indexEntreprises.liste = indexEntreprises.liste.filter(function (x) { return x.cle !== cle; });
  if (etaitActive) indexEntreprises.actif = indexEntreprises.liste[0].cle;
  enregistrerEntreprises();
  // Le dossier lui-même part aussi : sinon il occuperait la place pour rien.
  if (modeStockage === "base") ecrireBase(cle, null).catch(function () {});
  try { localStorage.removeItem(cleLocaleDossier(cle)); } catch (err) { /* rien */ }
  try { localStorage.removeItem(CLE_DERNIERE_SAUVEGARDE + "." + cle); } catch (err) { /* rien */ }
  if (etaitActive) {
    cleDossier = indexEntreprises.actif;
    versionDonnees++;
    chargerDonnees().then(function (d) {
      donnees = d || { mouvements: [], clients: {}, fournisseurs: {}, meta: {} };
      completerDonnees();
      completerAbonnement();
      appliquerDevise();
      afficher();
      afficherEntreprises();
      message(nom + " " + tr("est supprimée."), null, true);
    });
  } else {
    afficherEntreprises();
    message(nom + " " + tr("est supprimée."), null, true);
  }
}

function renommerEntreprise(cle) {
  const e = indexEntreprises.liste.find(function (x) { return x.cle === cle; });
  if (!e) return;
  const nom = window.prompt(tr("Le nom de cette entreprise :"), nomEntreprise(e));
  if (nom === null) return;
  const propre = String(nom).trim().replace(/\s+/g, " ").slice(0, 40);
  e.nom = propre;
  enregistrerEntreprises();
  // Si c'est celle qui est ouverte, le nom de la boutique suit : les factures
  // et le bilan doivent porter le même nom que la liste.
  if (cle === indexEntreprises.actif && propre) {
    donnees.boutique.nom = propre;
    sauver();
    afficher();
    if (!$("reglages").hidden) afficherReglages();
  }
  afficherEntreprises();
}

/* ---------- L'écran ---------- */

function afficherEntreprises() {
  const liste = listeEntreprises();
  const actif = indexEntreprises.actif;
  const autorisees = entreprisesAutorisees();
  const peut = peutCreerEntreprise();

  $("entreprises-liste").innerHTML = liste.map(function (e) {
    const ouverte = e.cle === actif;
    return '<li class="ent' + (ouverte ? " ent-ouverte" : "") + '">' +
      '<button type="button" class="ent-choisir" data-ouvrir-entreprise="' + e.cle + '"' + (ouverte ? ' aria-current="true"' : '') + '>' +
        '<b translate="no">' + echapper(nomEntreprise(e)) + '</b>' +
        '<small>' + (e.demo ? tr("Démonstration · chiffres d'exemple") :
          ouverte ? tr("Ouverte en ce moment") : tr("Touche pour travailler dedans")) + '</small>' +
      '</button>' +
      '<button type="button" class="ent-modifier" data-renommer-entreprise="' + e.cle + '" aria-label="' + tr("Renommer") + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/></svg></button>' +
      (liste.length > 1 ? '<button type="button" class="retirer" data-supprimer-entreprise="' + e.cle + '" aria-label="' + tr("Supprimer") + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' : "") +
      '</li>';
  }).join("");

  const vraies = entreprisesComptees().length;
  $("entreprises-compte").textContent = vraies === 1
    ? tr("1 entreprise sur ce téléphone.")
    : tr(vraies + " entreprises sur ce téléphone.");

  $("entreprises-ajouter").hidden = !peut;
  $("entreprises-limite").hidden = peut;
  if (!peut) {
    $("entreprises-limite").textContent = autorisees <= 1
      ? tr("Ta formule te donne droit à une seule entreprise. Pour en ajouter, prends une formule qui en permet plusieurs.")
      : tr("Ta formule te donne droit à " + autorisees + " entreprises, et tu les as toutes.");
  }
  $("entreprises-abonnement").hidden = peut;
  // La carte « Montrer Canari à quelqu'un » des Réglages suit : la démo peut
  // avoir été supprimée d'ici, avec le ✕ de la liste (voir demo.js).
  if (typeof afficherReglagesDemo === "function") afficherReglagesDemo();
}

function ouvrirEntreprises() {
  afficherEntreprises();
  ouvrirFeuille("entreprises");
}

function demanderNouvelleEntreprise() {
  if (!peutCreerEntreprise()) return;
  const nom = window.prompt(tr("Le nom de ta nouvelle entreprise :"), "");
  if (nom === null) return;
  creerEntreprise(nom);
}

/* ---------- Mise en route ---------- */

function initEntreprises() {
  // Le nom de la boutique peut avoir changé depuis le dernier passage.
  majNomEntreprise();
  $("entreprises-liste").addEventListener("click", function (e) {
    const ouvrir = e.target.closest("[data-ouvrir-entreprise]");
    if (ouvrir) { basculerVers(ouvrir.dataset.ouvrirEntreprise); return; }
    const renommer = e.target.closest("[data-renommer-entreprise]");
    if (renommer) { renommerEntreprise(renommer.dataset.renommerEntreprise); return; }
    const supprimer = e.target.closest("[data-supprimer-entreprise]");
    if (supprimer) supprimerEntreprise(supprimer.dataset.supprimerEntreprise);
  });
  $("entreprises-ajouter").addEventListener("click", demanderNouvelleEntreprise);
  $("entreprises-fermer").addEventListener("click", fermerFeuilles);
  $("entreprises-abonnement").addEventListener("click", function () { fermerFeuilles(); ouvrirAbonnement(); });
  $("reglage-entreprises").addEventListener("click", ouvrirEntreprises);
  $("ouvrir-entreprises").addEventListener("click", ouvrirEntreprises);
  majBandeauEntreprise();
}

// Le nom de l'entreprise ouverte, en haut de l'écran principal. Il n'apparaît
// que s'il y en a plusieurs : sur un téléphone à une seule entreprise, ce
// serait une ligne de plus à lire pour rien.
function majBandeauEntreprise() {
  const montrer = plusieursEntreprises();
  $("ouvrir-entreprises").hidden = !montrer;
  if (montrer) $("entreprise-nom").textContent = nomEntreprise(entrepriseActive());
}

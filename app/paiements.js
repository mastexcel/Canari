// Canari · paiement mobile (Wave, Orange Money, MTN MoMo, Moov Money / Flooz, Djamo).
// Chargé avant app.js ; initPaiements() est lancé au démarrage.
//
// Sans contrat avec les opérateurs, Canari ne reçoit pas l'argent lui-même. Il :
//   - garde les numéros de réception de la boutique (Réglages) ;
//   - les met sur les factures et dans les relances WhatsApp ;
//   - note pour chaque entrée ou sortie d'argent le moyen utilisé (espèces, Wave…) ;
//   - sépare l'argent en caisse : espèces d'un côté, chaque compte mobile de l'autre.
// Aucun logo d'opérateur n'est utilisé, seulement leurs noms.

const MOYENS = {
  especes: "Espèces",
  wave: "Wave",
  orange: "Orange Money",
  mtn: "MTN MoMo",
  moov: "Moov Money (Flooz)",
  djamo: "Djamo"
};
const MOYENS_MOBILES = ["wave", "orange", "mtn", "moov", "djamo"];

function reglagesPaiement() {
  if (!donnees.boutique.paiements) donnees.boutique.paiements = {};
  return donnees.boutique.paiements;
}
// Comptes mobiles activés par la boutique (avec un numéro ou un lien).
function moyensMobilesActifs() {
  const r = reglagesPaiement();
  return MOYENS_MOBILES.filter(function (k) { return r[k] && r[k].actif; });
}
function moyenDe(m) {
  return m.moyen && MOYENS[m.moyen] ? m.moyen : "especes";
}
// Texte « Wave : 07 00 00 00 00 · Orange Money : 05 … » pour factures et relances.
function lignesPaiement() {
  const r = reglagesPaiement();
  return moyensMobilesActifs().map(function (k) {
    const c = r[k];
    return tr(MOYENS[k] + (c.tel ? " : " + afficherTel(c.tel) : "") + (c.lien ? " (" + c.lien + ")" : ""));
  });
}

// Argent entré et sorti ce jour-là, par moyen de paiement.
function caisseParMoyen(jour) {
  const parMoyen = {};
  const ajouter = function (k, n) { if (n) parMoyen[k] = (parMoyen[k] || 0) + n; };
  mouvementsDuJour(jour).forEach(function (m) {
    const k = moyenDe(m);
    if (m.type === "vente") ajouter(k, encaisseDe(m));
    else if (m.type === "paye") ajouter(k, m.montant);
    else if (m.type === "depense" || m.type === "fpaye" || m.type === "maison" || m.type === "invest") ajouter(k, -m.montant);
    else if (m.type === "fdette") ajouter(k, -(m.verse || 0));
  });
  return parMoyen;
}

/* ---------- Ce qu'il reste sur chaque compte (décision du propriétaire) ----------

   « La caisse ne peut jamais être négative » : on ne peut pas sortir de l'argent
   qu'on n'a pas. Canari compte donc, pour chaque moyen (espèces, Wave, Orange…),
   ce qui reste vraiment : l'argent du départ, plus tout ce qui est entré, moins
   tout ce qui est sorti. Une sortie plus grande que ce reste est refusée, et
   Canari propose un compte qui a assez.

   L'argent du départ est indispensable : sans lui, une boutique qui commence
   Canari avec 50 000 F dans son tiroir partirait de zéro et ne pourrait rien
   dépenser. Il se règle dans Réglages → Argent en caisse, où le commerçant
   compte son argent et écrit ce qu'il a ; Canari en déduit le départ. */

function departParMoyen() {
  return donnees.boutique.depart || {};
}
// Tout ce qui est entré moins tout ce qui est sorti, depuis le premier jour, par moyen.
function mouvementParMoyen() {
  return memo("parMoyen", function () {
    const par = {};
    const ajouter = function (k, n) { if (n) par[k] = (par[k] || 0) + n; };
    donnees.mouvements.forEach(function (m) {
      const k = moyenDe(m);
      if (m.type === "vente") ajouter(k, encaisseDe(m));
      else if (m.type === "paye") ajouter(k, m.montant);
      else if (m.type === "depense" || m.type === "fpaye" || m.type === "maison" || m.type === "invest") ajouter(k, -m.montant);
      else if (m.type === "fdette") ajouter(k, -(m.verse || 0));
    });
    return par;
  });
}
// Ce qu'il reste sur un compte, maintenant.
function soldeMoyen(k) {
  const depart = departParMoyen()[k];
  return (typeof depart === "number" ? depart : 0) + (mouvementParMoyen()[k] || 0);
}
// Les moyens que la boutique utilise : les espèces, plus ses comptes mobiles.
function moyensUtilises() {
  return ["especes"].concat(moyensMobilesActifs());
}
// Les moyens qui ont un solde ou un historique : ceux qu'il vaut la peine d'afficher.
function soldesAffichables() {
  const cles = {};
  Object.keys(mouvementParMoyen()).forEach(function (k) { cles[k] = 1; });
  Object.keys(departParMoyen()).forEach(function (k) { if (departParMoyen()[k]) cles[k] = 1; });
  moyensUtilises().forEach(function (k) { cles[k] = 1; });
  return Object.keys(MOYENS).filter(function (k) { return cles[k]; });
}
// Le commerçant compte son argent et écrit ce qu'il a : Canari en déduit le départ.
function poserSolde(k, reel) {
  if (!donnees.boutique.depart) donnees.boutique.depart = {};
  donnees.boutique.depart[k] = reel - (mouvementParMoyen()[k] || 0);
}

// Les modes de saisie où de l'argent sort de la boutique.
const SORTIES = ["depense", "maison", "invest", "fpaye", "fdette"];
// Le commerçant a-t-il déjà dit combien d'argent il a ?
function caisseDeclaree() {
  return !!donnees.boutique.depart;
}
/* Le garde-fou est actif quand l'argent a été compté au moins une fois, et
   tant que le commerçant ne l'a pas éteint dans les Réglages.
   Tant que l'argent n'a jamais été compté, Canari ne bloque rien : une boutique
   qui utilisait déjà Canari avant cette version partirait sinon de zéro et
   verrait toutes ses dépenses refusées du jour au lendemain. */
function gardeCaisseActif() {
  return caisseDeclaree() && donnees.boutique.gardeCaisse !== false;
}
/* Peut-on sortir ce montant de ce compte ? Rend null si oui, sinon ce qui manque
   et les comptes qui ont assez (pour les proposer). */
function verifierSortie(k, montant) {
  if (!gardeCaisseActif() || !montant) return null;
  const solde = soldeMoyen(k);
  if (montant <= solde) return null;
  return {
    moyen: k, solde: solde, manque: montant - solde,
    autres: moyensUtilises().filter(function (a) { return a !== k && soldeMoyen(a) >= montant; })
  };
}
// La phrase du haut : « Espèces : tu n'as que 3 000 F. Il manque 2 000 F. »
function texteManque(v) {
  return MOYENS[v.moyen] + " : tu n'as que " + franc(v.solde) + ". Il manque " + franc(v.manque) + ".";
}
// Le conseil en dessous, toujours le même selon le cas (donc traduisible tel quel).
function aideManque(v, mode) {
  if (v.autres.length) return "Touche un compte qui a assez, juste au-dessus.";
  if (mode === "depense" || mode === "fdette") return "Prends-la à crédit chez ton fournisseur, ou corrige ton argent dans Réglages → Argent en caisse.";
  return "Si tu as de l'argent que Canari ne connaît pas, écris-le dans Réglages → Argent en caisse.";
}

/* ---------- Choix du moyen dans la fenêtre de saisie ---------- */

let moyenChoisi = "especes";

function preparerMoyen(mode) {
  const actifs = moyensMobilesActifs();
  const concerne = ["vente", "credit", "paye", "depense", "maison", "fpaye", "fdette", "invest"].indexOf(mode) !== -1;
  $("bloc-moyen").hidden = !concerne || !actifs.length;
  $("moyen-etiquette").textContent = mode === "vente" || mode === "credit" || mode === "paye" ? "Argent reçu en…" : "Payé avec…";
  // Quand l'argent sort, chaque compte montre ce qu'il lui reste : on choisit en voyant.
  $("choix-moyen").innerHTML = boutonsMoyen(["especes"].concat(actifs), "moyen", SORTIES.indexOf(mode) !== -1);
  choisirMoyen("especes");
}
// Les boutons de choix d'un moyen, avec son solde quand l'argent sort.
function boutonsMoyen(liste, attribut, avecSolde) {
  return liste.map(function (k) {
    return '<button type="button" class="suggestion" data-' + attribut + '="' + k + '"><b>' + MOYENS[k] + '</b>' +
      (avecSolde ? '<small class="solde-moyen">' + franc(soldeMoyen(k)) + '</small>' : '') + '</button>';
  }).join("");
}
function choisirMoyen(k) {
  moyenChoisi = k;
  document.querySelectorAll("[data-moyen]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.moyen === k));
  });
}
// Le moyen réellement utilisé : espèces si la boutique n'a aucun compte mobile.
function moyenActuel() {
  return $("bloc-moyen").hidden ? "especes" : moyenChoisi;
}
// Cache le reproche de la fenêtre d'arrivage et le conseil qui va avec.
function cacherErreurAchat() {
  $("arrivage-erreur").hidden = true;
  $("arrivage-erreur-aide").hidden = true;
}
// Refuse la sortie et explique quoi faire. Rend toujours false (« on n'enregistre pas »).
function refuserSortie(v, mode) {
  erreur(texteManque(v), null);
  $("erreur-aide").textContent = aideManque(v, mode);
  $("erreur-aide").hidden = false;
  return false;
}
// Le moyen n'a de sens que si de l'argent change de main (pas pour une vente tout à crédit).
function moyenPour(mouvement) {
  if ($("bloc-moyen").hidden) return;
  if (mouvement.type === "vente" && !encaisseDe(mouvement)) return;
  if (mouvement.type === "fdette" && !mouvement.verse) return;
  if (moyenChoisi !== "especes") mouvement.moyen = moyenChoisi;
}

/* ---------- Moyen de paiement d'un achat (arrivage, achat d'intrant) ---------- */

let moyenAchat = "especes";
function preparerMoyenAchat() {
  const actifs = moyensMobilesActifs();
  const paye = arrivagePaye === "tout" || arrivagePaye === "partiel";
  $("arrivage-moyen").hidden = !paye || !actifs.length;
  $("choix-moyen-achat").innerHTML = boutonsMoyen(["especes"].concat(actifs), "moyen-achat", true);
  choisirMoyenAchat(moyenAchat);
}
function choisirMoyenAchat(k) {
  moyenAchat = k;
  document.querySelectorAll("[data-moyen-achat]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.moyenAchat === k));
  });
}

/* ---------- Réglages : numéros de réception ---------- */

function remplirFormPaiements() {
  const r = reglagesPaiement();
  $("liste-paiements").innerHTML = MOYENS_MOBILES.map(function (k) {
    const c = r[k] || {};
    return '<li class="ligne-paiement' + (c.actif ? ' actif' : '') + '" data-compte="' + k + '">' +
      '<button type="button" class="choix-carte" data-activer-compte="' + k + '" aria-pressed="' + !!c.actif + '"><b>' + MOYENS[k] + '</b>' +
        '<small>' + (c.actif ? "J'accepte" : "Je n'accepte pas") + '</small></button>' +
      '<div class="compte-details"' + (c.actif ? '' : ' hidden') + '>' +
        '<input class="note compte-tel" type="tel" inputmode="tel" placeholder="Numéro qui reçoit l\'argent" value="' + (c.tel ? afficherTel(c.tel) : "") + '" aria-label="Numéro ' + MOYENS[k] + '">' +
        (k === "wave" ? '<input class="note compte-lien" inputmode="url" placeholder="Lien de paiement Wave (facultatif)" value="' + echapper(c.lien || "") + '" aria-label="Lien de paiement Wave">' : '') +
      '</div></li>';
  }).join("");
}

function enregistrerPaiements(e) {
  e.preventDefault();
  const r = reglagesPaiement();
  let probleme = "";
  document.querySelectorAll("#liste-paiements .ligne-paiement").forEach(function (li) {
    const k = li.dataset.compte;
    const actif = li.querySelector("[data-activer-compte]").getAttribute("aria-pressed") === "true";
    const tel = normaliserTel(li.querySelector(".compte-tel").value);
    const lienChamp = li.querySelector(".compte-lien");
    const lien = lienChamp ? lienChamp.value.trim() : "";
    if (actif && tel.length < 8 && !lien) probleme = "Écris le numéro " + MOYENS[k] + " qui reçoit l'argent.";
    r[k] = { actif: actif, tel: tel, lien: lien };
  });
  if (probleme) { $("paiements-erreur").textContent = probleme; $("paiements-erreur").hidden = false; return; }
  $("paiements-erreur").hidden = true;
  sauver();
  if (document.activeElement) document.activeElement.blur();
  message(moyensMobilesActifs().length ? "Paiements mobiles enregistrés. Ils seront sur tes factures et tes relances." : "Paiements mobiles enregistrés.", null, true);
}

/* ---------- Réglages : argent en caisse ---------- */

function remplirFormCaisse() {
  $("liste-soldes").innerHTML = moyensUtilises().map(function (k) {
    return '<li class="ligne-solde" data-solde="' + k + '">' +
      '<label class="champ-etiquette" for="solde-' + k + '">' + MOYENS[k] + '</label>' +
      '<div class="montant-boite petite"><input id="solde-' + k + '" class="montant solde-champ" inputmode="numeric" value="' + nombre(soldeMoyen(k)) + '" aria-label="' + MOYENS[k] + '">' +
      '<span class="montant-f">' + echapper(deviseCourante.symbole) + '</span></div>' +
      '</li>';
  }).join("");
  $("garde-caisse").setAttribute("aria-pressed", String(!caisseDeclaree() || donnees.boutique.gardeCaisse !== false));
  // Tant que l'argent n'a jamais été compté, Canari ne bloque rien : on le dit.
  $("caisse-pas-comptee").hidden = caisseDeclaree();
}

function enregistrerCaisse(e) {
  e.preventDefault();
  document.querySelectorAll("#liste-soldes .ligne-solde").forEach(function (li) {
    poserSolde(li.dataset.solde, lireMontant(li.querySelector("input").value));
  });
  donnees.boutique.gardeCaisse = $("garde-caisse").getAttribute("aria-pressed") === "true";
  sauver();
  remplirFormCaisse(); // les soldes et le rappel se remettent à jour
  if (document.activeElement) document.activeElement.blur();
  message("Argent en caisse enregistré : " + franc(soldeMoyen("especes")) + " en espèces.", null, true);
}

/* ---------- Mise en route ---------- */

function initPaiements() {
  $("choix-moyen-achat").addEventListener("click", function (e) {
    const b = e.target.closest("[data-moyen-achat]");
    if (b) choisirMoyenAchat(b.dataset.moyenAchat);
  });
  $("choix-moyen").addEventListener("click", function (e) {
    const b = e.target.closest("[data-moyen]");
    if (b) choisirMoyen(b.dataset.moyen);
  });
  $("liste-paiements").addEventListener("click", function (e) {
    const b = e.target.closest("[data-activer-compte]");
    if (!b) return;
    const actif = b.getAttribute("aria-pressed") !== "true";
    b.setAttribute("aria-pressed", String(actif));
    b.querySelector("small").textContent = actif ? "J'accepte" : "Je n'accepte pas";
    const li = b.closest(".ligne-paiement");
    li.classList.toggle("actif", actif);
    li.querySelector(".compte-details").hidden = !actif;
    if (actif) li.querySelector(".compte-tel").focus();
  });
  $("form-paiements").addEventListener("submit", enregistrerPaiements);
  $("form-caisse").addEventListener("submit", enregistrerCaisse);
  $("garde-caisse").addEventListener("click", function () {
    const b = $("garde-caisse");
    b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
  });
  // Changer de compte efface le reproche : le nouveau compte a peut-être assez.
  $("choix-moyen").addEventListener("click", cacherErreur);
  $("choix-moyen-achat").addEventListener("click", cacherErreurAchat);
}

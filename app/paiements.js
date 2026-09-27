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
    return MOYENS[k] + (c.tel ? " : " + afficherTel(c.tel) : "") + (c.lien ? " (" + c.lien + ")" : "");
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
    else if (m.type === "depense" || m.type === "fpaye" || m.type === "maison") ajouter(k, -m.montant);
    else if (m.type === "fdette") ajouter(k, -(m.verse || 0));
  });
  return parMoyen;
}

/* ---------- Choix du moyen dans la fenêtre de saisie ---------- */

let moyenChoisi = "especes";

function preparerMoyen(mode) {
  const actifs = moyensMobilesActifs();
  const concerne = ["vente", "credit", "paye", "depense", "maison", "fpaye"].indexOf(mode) !== -1;
  $("bloc-moyen").hidden = !concerne || !actifs.length;
  $("moyen-etiquette").textContent = mode === "vente" || mode === "credit" || mode === "paye" ? "Argent reçu en…" : "Payé avec…";
  $("choix-moyen").innerHTML = ["especes"].concat(actifs).map(function (k) {
    return '<button type="button" class="suggestion" data-moyen="' + k + '"><b>' + MOYENS[k] + '</b></button>';
  }).join("");
  choisirMoyen("especes");
}
function choisirMoyen(k) {
  moyenChoisi = k;
  document.querySelectorAll("[data-moyen]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.moyen === k));
  });
}
// Le moyen n'a de sens que si de l'argent change de main (pas pour une vente tout à crédit).
function moyenPour(mouvement) {
  if ($("bloc-moyen").hidden) return;
  if (mouvement.type === "vente" && !encaisseDe(mouvement)) return;
  if (moyenChoisi !== "especes") mouvement.moyen = moyenChoisi;
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

/* ---------- Mise en route ---------- */

function initPaiements() {
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
}

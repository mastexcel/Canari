// Canari · écran principal, saisie des ventes et des dépenses.
// Les calculs suivent le prototype (prototype/carnet-boutique.html).

const CLE_DEJA_VU = "canari.accueilVu";
const CLE_DONNEES = "canari.donnees";

function lire(cle) {
  try { return localStorage.getItem(cle); } catch (e) { return null; }
}
function ecrire(cle, valeur) {
  try { localStorage.setItem(cle, valeur); return true; } catch (e) { return false; }
}
const $ = function (id) { return document.getElementById(id); };

/* ---------- Données enregistrées sur le téléphone ---------- */

// Chaque mouvement : { id, type, montant, note, client, t }
// type : vente, depense, credit, paye, maison, fdette, fpaye
let donnees = { mouvements: [] };
try {
  const brut = JSON.parse(lire(CLE_DONNEES));
  if (brut && Array.isArray(brut.mouvements)) donnees = brut;
} catch (e) { /* données illisibles : on repart de zéro */ }

function sauver() {
  if (!ecrire(CLE_DONNEES, JSON.stringify(donnees))) {
    message("Attention : impossible d'enregistrer sur ce téléphone.");
  }
}

/* ---------- Outils ---------- */

const nombre = function (n) {
  return Math.round(n).toLocaleString("fr-FR").replace(/[  ]/g, " ");
};
const franc = function (n) { return nombre(n) + " F"; };
const cleJour = function (t) {
  const d = new Date(t);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
};
const nouvelId = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
const echapper = function (s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
};

/* ---------- Calculs ---------- */

function totauxDuJour(jour) {
  let encaisse = 0, depense = 0, maison = 0;
  donnees.mouvements.forEach(function (m) {
    if (cleJour(m.t) !== jour) return;
    if (m.type === "vente" || m.type === "paye") encaisse += m.montant;
    else if (m.type === "depense" || m.type === "fpaye") depense += m.montant;
    else if (m.type === "maison") maison += m.montant;
  });
  return { encaisse: encaisse, depense: depense, maison: maison, gain: encaisse - depense };
}

/* ---------- Affichage ---------- */

const NOMS = {
  vente: "Vente", depense: "Dépense", credit: "Crédit client", paye: "Remboursement",
  maison: "Pris pour la maison", fdette: "Dette fournisseur", fpaye: "Payé au fournisseur"
};
const SIGNES = { vente: "+ ", paye: "+ ", depense: "− ", fpaye: "− ", maison: "− ", credit: "", fdette: "" };

function afficher() {
  const aujourdhui = cleJour(Date.now());
  const t = totauxDuJour(aujourdhui);
  $("gain").textContent = (t.gain < 0 ? "− " : "") + franc(Math.abs(t.gain));
  $("gain").classList.toggle("negatif", t.gain < 0);
  $("encaisse").textContent = franc(t.encaisse);
  $("depense").textContent = franc(t.depense);
  $("maison").textContent = franc(t.maison);

  const lignes = donnees.mouvements
    .filter(function (m) { return cleJour(m.t) === aujourdhui; })
    .sort(function (a, b) { return b.t - a.t; });
  $("vide").hidden = lignes.length > 0;
  $("titre-liste").hidden = lignes.length === 0;
  $("liste").innerHTML = lignes.map(function (m) {
    const heure = new Date(m.t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const qui = m.client ? " · " + echapper(m.client) : "";
    return '<li class="ligne t-' + m.type + '">' +
      '<span class="pastille" aria-hidden="true"></span>' +
      '<span class="ligne-texte"><b>' + echapper(m.note || NOMS[m.type]) + '</b>' +
      '<small>' + NOMS[m.type] + qui + ' · ' + heure + '</small></span>' +
      '<span class="ligne-montant">' + SIGNES[m.type] + franc(m.montant) + '</span>' +
      '<button type="button" class="retirer" data-retirer="' + m.id + '" aria-label="Retirer cette ligne">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '</li>';
  }).join("");
}

function montrer(id) {
  document.querySelectorAll(".ecran").forEach(function (e) {
    e.hidden = e.id !== id;
  });
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
  }, annuler ? 6000 : 3000);
}
$("message-annuler").addEventListener("click", function () {
  if (actionAnnuler) actionAnnuler();
  actionAnnuler = null;
  $("message").hidden = true;
});

/* ---------- Saisie ---------- */

const MODES = {
  vente: { titre: "Nouvelle vente", couleur: "var(--entre)", note: "Qu'as-tu vendu ? (facultatif)", exemple: "ex. 2 pains, 1 savon" },
  depense: { titre: "Nouvelle dépense", couleur: "var(--sort)", note: "Pour quoi ? (facultatif)", exemple: "ex. marchandise, transport" }
};
const RAPIDES = [500, 1000, 2000, 5000];
let modeSaisie = "vente";

function ouvrirSaisie(mode) {
  modeSaisie = mode;
  const M = MODES[mode];
  $("saisie").style.setProperty("--couleur-saisie", M.couleur);
  $("saisie-titre").textContent = M.titre;
  $("note-etiquette").textContent = M.note;
  $("note").placeholder = M.exemple;
  $("montant").value = "";
  $("note").value = "";
  $("erreur").hidden = true;
  $("rapides").innerHTML = RAPIDES.map(function (v) {
    return '<button type="button" class="rapide" data-rapide="' + v + '">' + franc(v) + '</button>';
  }).join("");
  $("fond-saisie").hidden = false;
  $("saisie").hidden = false;
  $("montant").focus();
}
function fermerSaisie() {
  $("saisie").hidden = true;
  $("fond-saisie").hidden = true;
  document.activeElement && document.activeElement.blur();
}

$("montant").addEventListener("input", function (e) {
  const chiffres = e.target.value.replace(/\D/g, "").slice(0, 9);
  e.target.value = chiffres ? nombre(Number(chiffres)) : "";
  $("erreur").hidden = true;
});
$("rapides").addEventListener("click", function (e) {
  const b = e.target.closest("[data-rapide]");
  if (!b) return;
  $("montant").value = nombre(Number(b.dataset.rapide));
  $("erreur").hidden = true;
});
$("saisie-annuler").addEventListener("click", fermerSaisie);
$("fond-saisie").addEventListener("click", fermerSaisie);

$("saisie").addEventListener("submit", function (e) {
  e.preventDefault();
  const montant = parseInt($("montant").value.replace(/\D/g, ""), 10);
  if (!montant || montant <= 0) {
    $("erreur").textContent = "Écris un montant, par exemple 1 500.";
    $("erreur").hidden = false;
    $("montant").focus();
    return;
  }
  const mouvement = {
    id: nouvelId(), type: modeSaisie, montant: montant,
    note: $("note").value.trim(), client: "", t: Date.now()
  };
  donnees.mouvements.push(mouvement);
  sauver();
  fermerSaisie();
  afficher();
  message(NOMS[modeSaisie] + " de " + franc(montant) + " notée.", null, modeSaisie === "vente");
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
    message("Bientôt ! Ce bouton marchera dans une prochaine étape.");
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

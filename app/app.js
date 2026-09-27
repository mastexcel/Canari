// Canari · étape 1 : écran d'accueil et aperçu de l'écran principal.

const CLE_DEJA_VU = "canari.accueilVu";

function lire(cle) {
  try { return localStorage.getItem(cle); } catch (e) { return null; }
}
function ecrire(cle, valeur) {
  try { localStorage.setItem(cle, valeur); } catch (e) { /* stockage indisponible */ }
}

function montrer(id) {
  document.querySelectorAll(".ecran").forEach(function (e) {
    e.hidden = e.id !== id;
  });
  document.querySelector('meta[name="theme-color"]')
    .setAttribute("content", id === "accueil" ? "#174A3F" : "#F6EEE3");
}

let minuterieMessage;
function message(texte) {
  const boite = document.getElementById("message");
  boite.textContent = texte;
  boite.hidden = false;
  clearTimeout(minuterieMessage);
  minuterieMessage = setTimeout(function () { boite.hidden = true; }, 2500);
}

const aujourdhui = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
document.getElementById("date-du-jour").textContent =
  aujourdhui.charAt(0).toUpperCase() + aujourdhui.slice(1);

document.getElementById("commencer").addEventListener("click", function () {
  ecrire(CLE_DEJA_VU, "oui");
  montrer("principal");
});

document.querySelectorAll("[data-bientot]").forEach(function (b) {
  b.addEventListener("click", function () {
    message("Bientôt ! Ce bouton marchera à la prochaine étape.");
  });
});

montrer(lire(CLE_DEJA_VU) ? "principal" : "accueil");

// Fonctionnement sans internet
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  });
}

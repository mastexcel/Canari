// Canari · langue de l'appli (français ou anglais).
// Chargé en premier. L'appli est écrite en français ; en anglais, chaque texte affiché
// est cherché dans le dictionnaire EN (textes exacts) puis dans EN_MOTIFS (textes
// avec des nombres ou des noms), au moment où il apparaît à l'écran.
// Les textes qui ne passent pas par l'écran (WhatsApp, factures, fenêtres de
// confirmation) sont traduits avec tr("…").
// Les montants gardent l'écriture « 12 500 F » dans les deux langues.

const CLE_LANGUE = "canari.langue";
const LANGUE = (function () {
  try { return localStorage.getItem(CLE_LANGUE) === "en" ? "en" : "fr"; } catch (e) { return "fr"; }
})();
const LOCALE = LANGUE === "en" ? "en-GB" : "fr-FR"; // pour les dates
const EN = {};        // « texte français » : "English text"
const EN_MOTIFS = []; // [/^Vente de (.+) notée\.$/, "Sale of $1 recorded."] ou [regexp, function]
document.documentElement.lang = LANGUE;

function choisirLangue(l) {
  try { localStorage.setItem(CLE_LANGUE, l); } catch (e) { /* rien */ }
  location.reload();
}

const cacheTraduction = new Map();
const nonTraduits = new Set(); // pour les tests : textes français restés sans traduction
const dejaAnglais = new Set();  // textes déjà traduits (l'écran les renvoie quand on les change)

// Traduit un texte français (retourne le texte tel quel en français ou s'il est inconnu).
function tr(texte) {
  if (LANGUE !== "en" || texte == null) return texte;
  const brut = String(texte);
  const cle = brut.replace(/[\s\u00a0\u202f]+/g, " ").trim();
  if (!cle || !/[A-Za-zÀ-ÿ]{2}/.test(cle)) return brut;
  if (dejaAnglais.has(cle)) return brut;
  let r = cacheTraduction.get(cle);
  if (r === undefined) {
    r = EN[cle];
    if (r === undefined) {
      for (let i = 0; i < EN_MOTIFS.length; i++) {
        const m = EN_MOTIFS[i];
        if (m[0].test(cle)) {
          r = typeof m[1] === "function" ? cle.replace(m[0], m[1]) : cle.replace(m[0], m[1]);
          break;
        }
      }
    }
    if (r === undefined) { r = null; nonTraduits.add(cle); }
    else {
      r = r.replace(/(\d) (?=\d{3}\b)/g, "$1\u00a0").replace(/(\d) F\b/g, "$1\u00a0F");
      dejaAnglais.add(r.replace(/[\s\u00a0\u202f]+/g, " ").trim());
    }
    cacheTraduction.set(cle, r);
  }
  if (r === null) return brut;
  // Garde les espaces autour (mise en page du HTML).
  const avant = brut.match(/^\s*/)[0], apres = brut.match(/\s*$/)[0];
  return avant + r + apres;
}

/* ---------- Traduction de l'écran ---------- */

const ATTRIBUTS_TRADUITS = ["placeholder", "aria-label", "title", "alt"];
function nePasTraduire(el) {
  return !el || el.closest("script, style, textarea, [translate='no']");
}
function traduireTexte(noeud) {
  if (nePasTraduire(noeud.parentElement)) return;
  const v = noeud.nodeValue;
  const n = tr(v);
  if (n !== v) noeud.nodeValue = n;
}
function traduireAttributs(el) {
  ATTRIBUTS_TRADUITS.forEach(function (a) {
    const v = el.getAttribute(a);
    if (v) { const n = tr(v); if (n !== v) el.setAttribute(a, n); }
  });
}
function traduireArbre(racine) {
  if (racine.nodeType === 3) return traduireTexte(racine);
  if (racine.nodeType !== 1 || nePasTraduire(racine)) return;
  traduireAttributs(racine);
  racine.querySelectorAll("[placeholder], [aria-label], [title], [alt]").forEach(traduireAttributs);
  const parcours = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = parcours.nextNode())) traduireTexte(n);
}

function initLangue() {
  if (LANGUE !== "en") return;
  document.title = tr(document.title);
  traduireArbre(document.body);
  new MutationObserver(function (changements) {
    changements.forEach(function (c) {
      if (c.type === "characterData") traduireTexte(c.target);
      else if (c.type === "attributes") traduireAttributs(c.target);
      else c.addedNodes.forEach(traduireArbre);
    });
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTS_TRADUITS });
}

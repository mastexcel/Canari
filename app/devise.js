// Canari · monnaie de la boutique (choisie au questionnaire de départ ou dans Réglages).
// Chargé après i18n.js, avant les autres fichiers.
//
// Les montants restent des nombres entiers (pas de centimes) : Canari ne propose donc
// que des monnaies où l'on compte sans centimes au quotidien. « Autre » permet
// d'écrire son propre symbole.
// Changer de monnaie ne convertit pas les montants déjà notés : seul le symbole change.
// Pour les dictionnaires anglais, les montants sont ramenés à la forme « 12 500 F »
// avant la traduction, puis remis dans la monnaie choisie (voir tr() dans i18n.js).

const DEVISES = [
  { code: "XOF", nom: "Franc CFA (Afrique de l'Ouest)", pays: "Côte d'Ivoire, Sénégal, Mali, Burkina, Bénin, Togo, Niger", symbole: "F", mot: "FCFA", parle: "francs", facteur: 1 },
  { code: "XAF", nom: "Franc CFA (Afrique centrale)", pays: "Cameroun, Gabon, Congo, Tchad, Centrafrique", symbole: "F", mot: "FCFA", parle: "francs", facteur: 1 },
  { code: "GNF", nom: "Franc guinéen", pays: "Guinée", symbole: "GNF", mot: "GNF", parle: "francs guinéens", facteur: 10 },
  { code: "CDF", nom: "Franc congolais", pays: "RD Congo", symbole: "FC", mot: "FC", parle: "francs congolais", facteur: 5 },
  { code: "NGN", nom: "Naira", pays: "Nigeria", symbole: "₦", avant: true, mot: "naira", parle: "naira", facteur: 2 },
  { code: "LRD", nom: "Dollar libérien", pays: "Liberia", symbole: "L$", avant: true, mot: "L$", parle: "dollars", facteur: 0.2 },
  { code: "SLE", nom: "Leone", pays: "Sierra Leone", symbole: "Le", avant: true, mot: "leones", parle: "leones", facteur: 0.05 },
  { code: "GMD", nom: "Dalasi", pays: "Gambie", symbole: "D", mot: "dalasis", parle: "dalasis", facteur: 0.2 },
  { code: "MRU", nom: "Ouguiya", pays: "Mauritanie", symbole: "UM", mot: "UM", parle: "ouguiyas", facteur: 0.1 },
  { code: "RWF", nom: "Franc rwandais", pays: "Rwanda", symbole: "FRW", mot: "FRW", parle: "francs rwandais", facteur: 2 },
  { code: "BIF", nom: "Franc burundais", pays: "Burundi", symbole: "FBu", mot: "FBu", parle: "francs burundais", facteur: 5 },
  { code: "KMF", nom: "Franc comorien", pays: "Comores", symbole: "FC", mot: "KMF", parle: "francs comoriens", facteur: 1 },
  { code: "DJF", nom: "Franc djiboutien", pays: "Djibouti", symbole: "Fdj", mot: "Fdj", parle: "francs djiboutiens", facteur: 0.5 },
  { code: "MGA", nom: "Ariary", pays: "Madagascar", symbole: "Ar", mot: "ariary", parle: "ariary", facteur: 5 },
  { code: "AUTRE", nom: "Autre monnaie", pays: "", symbole: "", mot: "", parle: "", facteur: 1 }
];

Object.assign(EN, {
  "Ta monnaie": "Your currency",
  "Monnaie": "Currency",
  "Franc CFA (Afrique de l'Ouest)": "CFA franc (West Africa)",
  "Franc CFA (Afrique centrale)": "CFA franc (Central Africa)",
  "Franc guinéen": "Guinean franc",
  "Franc congolais": "Congolese franc",
  "Dollar libérien": "Liberian dollar",
  "Franc rwandais": "Rwandan franc",
  "Franc burundais": "Burundian franc",
  "Franc comorien": "Comorian franc",
  "Franc djiboutien": "Djiboutian franc",
  "Autre monnaie": "Other currency",
  "Symbole de ta monnaie": "Your currency symbol",
  "ex. $ ou €": "e.g. $ or €",
  "Montants sans centimes. Changer de monnaie ne convertit pas les montants déjà notés.": "Amounts without cents. Changing currency does not convert amounts already recorded.",
  "Écris le symbole de ta monnaie.": "Write your currency symbol.",
  "Naira": "Naira", "Leone": "Leone", "Dalasi": "Dalasi", "Ouguiya": "Ouguiya", "Ariary": "Ariary",
  "francs": "francs", "francs guinéens": "Guinean francs", "francs congolais": "Congolese francs",
  "francs rwandais": "Rwandan francs", "francs burundais": "Burundian francs", "francs comoriens": "Comorian francs",
  "francs djiboutiens": "Djiboutian francs", "dollars": "dollars"
});
EN_MOTIFS.push(
  [/^Monnaie : (.+)$/, function (m, n) { return "Currency: " + tr(n); }],
  [/^Nouvelle monnaie : (.+) \(avant : (.+)\)\. Les montants déjà notés ne seront pas convertis\. Continuer \?$/,
    function (m, a, b) { return "New currency: " + tr(a) + " (before: " + tr(b) + "). Amounts already recorded will not be converted. Continue?"; }]
);

let deviseCourante = DEVISES[0];

// La monnaie de la boutique (Franc CFA d'Afrique de l'Ouest si rien n'est choisi).
function lireDevise(b) {
  b = b || (typeof donnees !== "undefined" && donnees.boutique) || {};
  const d = DEVISES.find(function (x) { return x.code === b.devise; }) || DEVISES[0];
  if (d.code !== "AUTRE") return d;
  const s = (b.symbole || "").trim() || "F";
  return { code: "AUTRE", nom: d.nom, symbole: s, mot: s, parle: s, facteur: 1, avant: /^[$€£¥₹]/.test(s) };
}
function appliquerDevise() {
  deviseCourante = lireDevise();
  document.querySelectorAll(".montant-f, .lc-f").forEach(function (s) { s.textContent = deviseCourante.symbole; });
}

// « 12 500 F », « ₦12 500 », « 12 500 GNF » (espaces insécables : jamais coupé en fin de ligne).
function formatDevise(nombreTexte) {
  const d = deviseCourante;
  return d.avant ? d.symbole + nombreTexte : nombreTexte + " " + d.symbole;
}
// Montants rapides adaptés à la monnaie (500, 1 000… en FCFA ; 5 000, 10 000… en GNF).
function montantsRapides(liste) {
  const f = deviseCourante.facteur || 1;
  return liste.map(function (v) {
    const x = v * f;
    const p = Math.pow(10, Math.max(0, Math.floor(Math.log10(x)) - 1));
    return Math.max(1, Math.round(x / p) * p);
  });
}
function nomDevise() { return tr(deviseCourante.nom); }

// Pour les dictionnaires : « ₦12 500 » ou « 12 500 GNF » → « 12 500 F », et retour.
function versMontantsF(texte) {
  const d = deviseCourante;
  if (d.symbole === "F" && !d.avant) return texte;
  const s = d.symbole.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nb = "(\\d{1,3}(?:[ \\u00a0\\u202f]\\d{3})*)";
  return d.avant
    ? texte.replace(new RegExp(s + nb, "g"), "$1 F")
    : texte.replace(new RegExp(nb + "[ \\u00a0]" + s + "(?![\\w$€£])", "g"), "$1 F");
}
function depuisMontantsF(texte) {
  const d = deviseCourante;
  if (d.symbole === "F" && !d.avant) return texte;
  return texte.replace(/(\d{1,3}(?:[   ]\d{3})*)[  ]F\b/g, function (m, n) { return formatDevise(n); });
}

// Menu déroulant des monnaies (questionnaire et Réglages).
function optionsDevises(code) {
  return DEVISES.map(function (d) {
    return '<option value="' + d.code + '"' + (d.code === code ? " selected" : "") + ">" +
      echapper(tr(d.nom)) + (d.symbole ? " (" + d.symbole + ")" : "") + "</option>";
  }).join("");
}

// Champs « Ta monnaie » (+ symbole si « Autre ») pour le questionnaire (prefixe "param")
// et les Réglages (prefixe "boutique").
function champsDevise(prefixe, code, symbole) {
  const autre = code === "AUTRE";
  return '<label class="champ-etiquette" for="' + prefixe + '-devise">Ta monnaie</label>' +
    '<select id="' + prefixe + '-devise" class="note choix-devise" translate="no">' + optionsDevises(code || "XOF") + '</select>' +
    '<div class="bloc-symbole"' + (autre ? '' : ' hidden') + '>' +
      '<label class="champ-etiquette" for="' + prefixe + '-symbole">Symbole de ta monnaie</label>' +
      '<input id="' + prefixe + '-symbole" class="note" maxlength="5" placeholder="ex. $ ou €" value="' + echapper(symbole || "") + '">' +
    '</div>' +
    '<p class="aide">Montants sans centimes. Changer de monnaie ne convertit pas les montants déjà notés.</p>';
}

function initDevise() {
  document.addEventListener("change", function (e) {
    if (!e.target.classList || !e.target.classList.contains("choix-devise")) return;
    const bloc = e.target.nextElementSibling;
    if (bloc && bloc.classList.contains("bloc-symbole")) {
      bloc.hidden = e.target.value !== "AUTRE";
      if (!bloc.hidden) bloc.querySelector("input").focus();
    }
  });
  $("boutique-devise-champs").innerHTML = champsDevise("boutique", donnees.boutique.devise, donnees.boutique.symbole);
}
EN_MOTIFS.push(
  [/^Environ (.+) FCFA par jour$/, "About $1 FCFA a day"],
  [/^Tu économises (.+) FCFA$/, "You save $1 FCFA"]
);

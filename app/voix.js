// Canari · commandes vocales, pour ceux qui écrivent ou lisent peu.
// Chargé avant app.js ; initVoix() est lancé au démarrage.
//
// On appuie sur « Parler » et on dit par exemple :
//   « Vente 2 000 »            → ouvre une vente de 2 000 F
//   « Crédit Koffi 5 000 »     → ouvre un crédit de 5 000 F pour Koffi
//   « Koffi a payé 2 000 »     → ouvre le remboursement de Koffi
//   « Dépense transport 500 »  → ouvre une dépense de 500 F (note : transport)
//   « Maison 1 000 »           → ouvre « Pris pour la maison »
//   « Combien j'ai gagné ? »   → Canari lit le bilan du jour à voix haute
//   « Qui me doit ? »          → Canari lit les clients qui doivent
// Canari remplit la fenêtre et le dit à voix haute ; on vérifie et on appuie sur
// « Enregistrer ». Rien n'est enregistré sans ce geste.
// La reconnaissance de la voix de Chrome a besoin d'internet ; la lecture à voix
// haute marche en général sans internet.

Object.assign(EN, {
  "Parler": "Speak",
  "Écouter": "Listen",
  "Je t'écoute…": "I'm listening…",
  "Dis par exemple :": "For example, say:",
  "« Vente 2 000 »": "“Sale 2000”",
  "« Crédit Koffi 5 000 »": "“Credit Koffi 5000”",
  "« Koffi a payé 2 000 »": "“Koffi paid 2000”",
  "« Dépense transport 500 »": "“Expense transport 500”",
  "« Maison 1 000 »": "“Home 1000”",
  "« Combien j'ai gagné ? »": "“How much did I make?”",
  "« Qui me doit ? »": "“Who owes me?”",
  "Arrêter": "Stop",
  "Commande vocale": "Voice command",
  "Lire à voix haute": "Read aloud",
  "Je n'ai pas compris. Dis par exemple : vente, deux mille.": "I didn't understand. Say for example: sale, two thousand.",
  "La commande vocale a besoin d'internet. Vérifie ta connexion.": "Voice commands need the internet. Check your connection.",
  "Autorise le micro pour Canari dans les réglages du téléphone.": "Allow the microphone for Canari in your phone settings.",
  "Je n'ai rien entendu. Appuie sur Parler et parle près du téléphone.": "I heard nothing. Tap Speak and talk close to the phone.",
  "Vérifie, puis appuie sur le bouton Enregistrer.": "Check, then tap the Save button.",
  "Tape son numéro de téléphone, puis appuie sur Enregistrer.": "Type their phone number, then tap Save.",
  "Personne ne te doit de l'argent.": "Nobody owes you money.",
  "Je ne trouve pas ce client dans tes crédits.": "I can't find this customer in your credits.",
  "Lire cet écran à voix haute": "Read this screen aloud",
  "Lire cette question à voix haute": "Read this question aloud",
  "Dire": "Say",
  "Voix": "Voice",
  "Pour ceux qui lisent ou écrivent peu : appuie sur « Parler » ou « Dire » et parle, Canari remplit et te répond.": "For people who read or write little: tap “Speak” or “Say” and talk, Canari fills in and answers you.",
  "Canari lit ses messages à voix haute": "Canari reads its messages aloud",
  "Chaque message en bas de l'écran est dit à voix haute.": "Every message at the bottom of the screen is spoken aloud.",
  "Parler plus lentement": "Speak more slowly",
  "Canari parle moins vite.": "Canari speaks more slowly.",
  "« Ouvre les relances »": "“Open reminders”",
  "Réglages.": "Settings.",
  "Tu ne dois rien à tes fournisseurs.": "You owe nothing to your suppliers.",
  "Personne à relancer aujourd'hui.": "Nobody to remind today.",
  "1 client à relancer aujourd'hui :": "1 customer to remind today:",
  "À racheter :": "To buy again:",
  "Ton stock est bon, rien à racheter.": "Your stock is fine, nothing to buy.",
  "Dis le montant.": "Say the amount.",
  "Dis son numéro de téléphone.": "Say their phone number.",
  "Dis son nom.": "Say their name.",
  "Dis le nom et le numéro de téléphone du client.": "Say the customer's name and phone number.",
  "Dis le nom du fournisseur.": "Say the supplier's name.",
  "Tout payé.": "Fully paid.",
  "Il n'a rien donné.": "They gave nothing.",
  "Dis oui pour enregistrer, ou dis ce qu'il faut changer.": "Say yes to save, or say what to change.",
  "Je n'ai pas compris.": "I didn't understand.",
  "D'accord, j'annule.": "OK, I'm cancelling.",
  "Appuie sur Enregistrer quand c'est bon.": "Tap Save when it's right.",
  "Choisis ta langue, puis appuie sur Commencer.": "Choose your language, then tap Start.",
  "Canari lira ses messages à voix haute.": "Canari will read its messages aloud.",
  "Je parle plus lentement.": "I'm speaking more slowly."
});
EN_MOTIFS.push(
  [/^Vente de (.+)\.$/, "Sale of $1."],
  [/^Crédit de (.+) pour (.+)\.$/, "Credit of $1 for $2."],
  [/^Crédit de (.+)\.$/, "Credit of $1."],
  [/^(.+) a payé (.+)\.$/, "$1 paid $2."],
  [/^Dépense de (.+) pour (.+)\.$/, "Expense of $1 for $2."],
  [/^Dépense de (.+)\.$/, "Expense of $1."],
  [/^Pris pour la maison : (.+)\.$/, "Taken for home: $1."],
  [/^Tes clients te doivent (.+)\.$/, "Your customers owe you $1."],
  [/^(.+) te doit (.+)\.$/, "$1 owes you $2."],
  [/^J'ai entendu : « (.+) »$/, "I heard: “$1”"],
  [/^Tu dois (.+) à tes fournisseurs\.$/, "You owe $1 to your suppliers."],
  [/^(\d+) clients à relancer aujourd'hui :$/, "$1 customers to remind today:"],
  [/^Ces 7 derniers jours, tu as vendu (.+)\.$/, "In the last 7 days, you sold $1."],
  [/^Ton bénéfice net est de (.+)\.$/, "Your net profit is $1."],
  [/^Il a donné (.+)\.$/, "They gave $1."],
  [/^Client : (.+)\.$/, "Customer: $1."],
  [/^Numéro : (.+)\.$/, "Number: $1."],
  [/^Fournisseur : (.+)\.$/, "Supplier: $1."],
  [/^Payé par (.+)\.$/, "Paid by $1."],
  [/^Note : (.+)\.$/, "Note: $1."],
  [/^(.+) : (.+ F)\.$/, function (m, a, b) { return tr(a) + ": " + b + "."; }]
);

const Reconnaissance = window.SpeechRecognition || window.webkitSpeechRecognition;
let ecoute = null;

/* ---------- Parler à voix haute ---------- */

// Préférences de voix, gardées sur ce téléphone : Canari lit les messages, voix plus lente.
const CLE_VOIX = "canari.voix";
function prefsVoix() {
  try { return Object.assign({ lecture: false, lent: false }, JSON.parse(lire(CLE_VOIX)) || {}); }
  catch (e) { return { lecture: false, lent: false }; }
}
let voixActiveJusqua = 0; // pendant une conversation vocale, Canari lit aussi ses messages

// Dit un texte à voix haute, puis lance « ensuite » quand il a fini de parler.
function parler(texte, ensuite) {
  if (!("speechSynthesis" in window) || !texte) { if (ensuite) ensuite(); return; }
  // Les montants de l'écran (« 2 000 F », « ₦2 000 ») sont dits « 2000 francs », « 2000 naira »…
  const phrase = versMontantsF(tr(texte))
    .replace(/(\d)[\s\u00a0\u202f](?=\d{3}\b)/g, "$1")   // « 2 000 » se lit « deux mille »
    .replace(/(\d)[\s\u00a0]F\b/g, "$1 " + motParle())
    .replace(/\s·\s/g, ", ");
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(phrase);
  u.lang = LANGUE === "en" ? "en-GB" : "fr-FR";
  u.rate = prefsVoix().lent ? 0.8 : 0.95;
  const voix = speechSynthesis.getVoices().filter(function (v) { return v.lang && v.lang.slice(0, 2) === u.lang.slice(0, 2); });
  if (voix.length) u.voice = voix.find(function (v) { return v.localService; }) || voix[0];
  if (ensuite) {
    // Filet de sécurité : certains téléphones n'annoncent pas la fin de la phrase.
    let fait = false;
    const suite = function () { if (!fait) { fait = true; ensuite(); } };
    u.onend = suite;
    u.onerror = suite;
    setTimeout(suite, 1500 + phrase.length * 90 / u.rate);
  }
  speechSynthesis.speak(u);
}

/* ---------- Comprendre la phrase ---------- */

const MOTS_NOMBRES = {
  "zéro": 0, zero: 0, un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10,
  onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16, vingt: 20, vingts: 20, trente: 30, quarante: 40,
  cinquante: 50, soixante: 60, septante: 70, huitante: 80, octante: 80, nonante: 90, quatrevingt: 80,
  one: 1, two: 2, three: 3, four: 4, five: 5, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
};
const MULTIPLES = { cent: 100, cents: 100, hundred: 100, mille: 1000, mil: 1000, thousand: 1000, million: 1e6, millions: 1e6 };
const PETITS_MOTS = ["un", "une"]; // « un » n'est un nombre que dans un nombre (« cent un ») ou devant « mille »

// Coupe la phrase en mots simples (minuscules, sans ponctuation). « 2 000 » et « 2.000 » deviennent « 2000 ».
function motsDe(phrase) {
  return phrase.toLowerCase()
    .replace(/(\d)[\s\u00a0\u202f.](?=\d{3}(\D|$))/g, "$1")
    .replace(/(\d+)\s*k\b/g, function (m, n) { return String(n * 1000); })
    .replace(/quatre[- ]vingts?/g, "quatrevingt")
    .replace(/[’]/g, "'")
    .replace(/[-,;:!?«»"“”()]/g, " ")
    .replace(/\.(?!\d)/g, " ")
    .split(/\s+/).filter(Boolean);
}

// Trouve le montant dans les mots : « 2000 », « deux mille cinq cents », « two thousand »…
// Rend { montant, mots } : les mots qui restent, sans le montant ni « francs ».
function motParle() { return tr(deviseCourante.parle || deviseCourante.symbole); }
// « francs », « FCFA », « naira », « GNF »… ne font pas partie du nom ou de la note.
function estMotDevise(mot) {
  const d = deviseCourante;
  return /^(francs?|f|fcfa|cfa)$/.test(mot) || [d.symbole, d.mot].concat((d.parle || "").split(" "))
    .some(function (x) { return x && x.toLowerCase() === mot; });
}
function lireMontantParle(mots) {
  let meilleur = 0, total = 0, courant = 0, dansNombre = false;
  const tous = [];
  const garde = [];
  const finir = function () {
    if (dansNombre) { meilleur = Math.max(meilleur, total + courant); tous.push(total + courant); }
    total = 0; courant = 0; dansNombre = false;
  };
  mots.forEach(function (mot, i) {
    let n = null;
    if (/^\d+$/.test(mot)) n = Number(mot);
    else if (mot in MOTS_NOMBRES && (PETITS_MOTS.indexOf(mot) === -1 || dansNombre || mots[i + 1] in MULTIPLES)) n = MOTS_NOMBRES[mot];
    if (n !== null) { courant += n; dansNombre = true; return; }
    if (mot in MULTIPLES) {
      const x = MULTIPLES[mot];
      if (x === 100) courant = (courant || 1) * 100;
      else { total += (courant || 1) * x; courant = 0; }
      dansNombre = true;
      return;
    }
    if (dansNombre && (mot === "et" || mot === "and" || mot === "a")) return;
    finir();
    if (!estMotDevise(mot)) garde.push(mot);
  });
  finir();
  return { montant: meilleur, mots: garde, nombres: tous };
}

// Chaque intention est reconnue par des mots ou groupes de mots (français et anglais).
const INTENTIONS = [
  { nom: "dettes", mots: ["qui me doit", "qui me doivent", "me doivent", "who owes", "owe me", "owes me"] },
  { nom: "depense", mots: ["j'ai payé", "j'ai paye", "i paid", "i spent"] },
  { nom: "paye", mots: ["a payé", "a paye", "m'a payé", "m'a paye", "m'a remboursé", "m'a rembourse", "remboursé", "a remboursé", "a rembourse", "remboursement", "rembourse", "paid", "repaid", "has paid", "paid back"] },
  { nom: "credit", mots: ["crédit", "credit", "crédits", "credits"] },
  { nom: "maison", mots: ["maison", "home", "house"] },
  { nom: "depense", mots: ["dépense", "depense", "dépenses", "dépensé", "depensé", "achat", "acheté", "expense", "spent", "bought"] },
  { nom: "vente", mots: ["vente", "ventes", "vendu", "vendre", "vends", "sale", "sold", "sell"] },
  { nom: "bilan", mots: ["combien", "gagné", "gagne", "bilan", "résumé", "resume", "bénéfice", "benefice", "how much", "profit", "summary", "earned", "made"] }
];
const MOTS_VIDES = new Set(("j'ai jai je il elle a m'a de du des d' à la le les l' et avec fait fais noter note mets mettre " +
  "i he she has have of the to on and put record me my pris taken payé paye payer remboursé rembourse back").split(" ").concat(
  INTENTIONS.reduce(function (l, i) { return l.concat(i.mots.filter(function (m) { return m.indexOf(" ") === -1; })); }, [])));

function comprendre(phrase) {
  const mots = motsDe(phrase);
  const avecEspaces = " " + mots.join(" ") + " ";
  const intention = INTENTIONS.find(function (i) {
    return i.mots.some(function (m) { return avecEspaces.indexOf(" " + m + " ") !== -1; });
  });
  const m = lireMontantParle(mots);
  // « Crédit Koffi 5 000 pour du riz » : le nom est avant « pour », la note après.
  const utiles = m.mots.filter(function (x) { return !MOTS_VIDES.has(x); });
  const estPour = function (x) { return x === "pour" || x === "for"; };
  while (utiles.length && estPour(utiles[0])) utiles.shift(); // « crédit pour Awa… »
  const coupe = utiles.findIndex(estPour);
  const avant = coupe === -1 ? utiles : utiles.slice(0, coupe);
  const apres = coupe === -1 ? [] : utiles.slice(coupe + 1).filter(function (x) { return !estPour(x); });
  const majuscules = function (l) { return l.join(" ").replace(/(^|\s)\S/g, function (c) { return c.toUpperCase(); }); };
  const nom = intention ? intention.nom : m.montant ? "vente" : null;
  if (!nom) return null;
  const personne = nom === "credit" || nom === "paye";
  return {
    nom: nom,
    montant: m.montant,
    texte: personne ? majuscules(avant) : "",
    note: personne ? apres.join(" ") : avant.concat(apres).join(" ")
  };
}

function sansAccents(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}
// Client dont le nom ressemble le plus au nom dit (d'abord parmi ceux qui doivent).
function trouverClient(nom, liste) {
  const cherche = sansAccents(nom);
  if (!cherche) return null;
  return liste.find(function (c) { return sansAccents(c.nom) === cherche; }) ||
    liste.find(function (c) { return sansAccents(c.nom).indexOf(cherche) === 0; }) ||
    liste.find(function (c) { return sansAccents(c.nom).indexOf(cherche) !== -1 || cherche.indexOf(sansAccents(c.nom)) !== -1; }) ||
    null;
}

/* ---------- Aller vers un onglet : « ouvre les relances », « montre le stock »… ---------- */

const NAVIGATION = [
  { onglet: "jour", mots: ["jour", "accueil", "aujourd'hui", "today", "day"] },
  { onglet: "credits", mots: ["crédits", "credits", "dettes", "debts"] },
  { onglet: "relances", mots: ["relances", "relance", "relancer", "reminders", "reminder"] },
  { onglet: "semaine", mots: ["semaine", "week", "bilan de la semaine", "summary"] },
  { onglet: "stock", mots: ["stock", "stocks", "produits", "products"] },
  { onglet: "reglages", mots: ["réglages", "reglages", "paramètres", "parametres", "settings"] }
];
const MOTS_ALLER = new Set("ouvre ouvrir montre montrer affiche afficher va aller voir vois les mes le la l' à au aux sur des mon ma open show go to my the see".split(" "));

// « Ouvre les relances » → { onglet: "relances" } ; rien si la phrase dit autre chose.
function navigationDemandee(phrase) {
  const mots = motsDe(phrase);
  if (!mots.length || mots.some(function (m) { return /^\d/.test(m); })) return null;
  const texte = " " + mots.join(" ") + " ";
  const cible = NAVIGATION.find(function (n) { return n.mots.some(function (m) { return texte.indexOf(" " + m + " ") !== -1; }); });
  if (!cible) return null;
  let reste = texte;
  cible.mots.forEach(function (m) { reste = reste.split(" " + m + " ").join(" "); });
  const autres = reste.trim().split(/\s+/).filter(function (m) { return m && !MOTS_ALLER.has(m); });
  return autres.length ? null : cible.onglet;
}

function allerA(o) {
  fermerFeuilles();
  if (o === "reglages") { ouvrirReglages(); return parler("Réglages."); }
  montrer("principal");
  const b = document.querySelector('[data-onglet="' + o + '"]');
  if (b) b.click();
  parler(resumeEcran());
}

/* ---------- Lire l'écran à voix haute ---------- */

// Une phrase courte qui résume l'écran affiché.
function resumeEcran() {
  if (!$("reglages").hidden) return "Réglages.";
  if (onglet === "jour") return $("bilan-texte").textContent || $("vide").textContent;
  if (onglet === "credits") {
    if (coteCredits === "fournisseurs") {
      const f = fournisseursQueJeDois();
      if (!f.length) return "Tu ne dois rien à tes fournisseurs.";
      return tr("Tu dois " + franc(f.reduce(function (s, x) { return s + x.du; }, 0)) + " à tes fournisseurs.") + " " +
        f.slice(0, 3).map(function (x) { return tr(x.nom + " : " + franc(x.du) + "."); }).join(" ");
    }
    const c = clientsQuiDoivent();
    if (!c.length) return "Personne ne te doit de l'argent.";
    return tr("Tes clients te doivent " + franc(c.reduce(function (s, x) { return s + x.du; }, 0)) + ".") + " " +
      c.slice(0, 3).map(function (x) { return tr(x.nom + " te doit " + franc(x.du) + "."); }).join(" ");
  }
  if (onglet === "relances") {
    const urgents = clientsQuiDoivent().filter(function (c) { return statutRelance(c).urgent; });
    if (!urgents.length) return "Personne à relancer aujourd'hui.";
    return tr(urgents.length === 1 ? "1 client à relancer aujourd'hui :" : urgents.length + " clients à relancer aujourd'hui :") + " " +
      urgents.slice(0, 5).map(function (c) { return c.nom; }).join(", ") + ".";
  }
  if (onglet === "semaine") {
    if (!$("vue-mois").hidden) {
      const carte = $("vue-mois").querySelector(".carte-gain");
      return carte ? carte.textContent.replace(/\s+/g, " ").trim() : "";
    }
    const jours = derniersJours(7);
    const somme = function (cle) { return jours.reduce(function (s, j) { return s + j.totaux[cle]; }, 0); };
    return tr("Ces 7 derniers jours, tu as vendu " + franc(somme("vendu")) + ".") + " " +
      tr("Ton bénéfice net est de " + franc(somme("benefice")) + ".");
  }
  if (onglet === "stock") {
    const bas = produitsARacheter().map(function (p) { return p.nom; }).concat(intrantsARacheter().map(function (i) { return i.nom; }));
    return bas.length ? tr("À racheter :") + " " + bas.slice(0, 6).join(", ") + "." : "Ton stock est bon, rien à racheter.";
  }
  return "";
}

// Lit une fenêtre du bas : son titre, chaque question avec ce qui est déjà rempli, l'erreur.
function lireFeuille(feuille) {
  const morceaux = [];
  const titre = feuille.querySelector(".saisie-titre");
  if (titre) morceaux.push(titre.textContent);
  feuille.querySelectorAll(".champ-etiquette").forEach(function (l) {
    if (!visible(l)) return;
    const champ = l.htmlFor ? document.getElementById(l.htmlFor) : null;
    const valeur = champ && champ.value ? champ.value : "";
    morceaux.push(l.textContent.replace(/\s*\(facultatif\)|\s*\(optional\)/i, "") + (valeur ? " : " + valeur : ""));
  });
  const erreur = feuille.querySelector(".erreur:not([hidden])");
  if (erreur && erreur.textContent) morceaux.push(erreur.textContent);
  return morceaux.map(function (m) { return m.trim().replace(/[.?]?$/, "."); }).join(" ");
}
function visible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

/* ---------- Remplir la fenêtre de saisie à la voix ---------- */

const MOTS_OUI = ["oui", "ok", "okay", "d'accord", "c'est bon", "enregistre", "enregistrer", "enregistrez", "valide", "valider", "confirme", "yes", "save", "confirm", "correct", "c'est ça", "voilà"];
const MOTS_NON = ["non", "annule", "annuler", "ferme", "fermer", "laisse", "arrête", "no", "cancel", "stop", "close"];
const MOYENS_PARLES = { especes: ["espèces", "especes", "cash", "liquide"], wave: ["wave"], orange: ["orange", "orange money"], mtn: ["mtn", "momo"], moov: ["moov", "flooz"], djamo: ["djamo"] };
const CATEGORIES_PARLEES = {
  marchandise: ["marchandise", "marchandises", "stock", "goods"],
  charge: ["loyer", "salaire", "salaires", "électricité", "electricite", "courant", "eau", "charge", "rent", "salary", "electricity"],
  impot: ["impôt", "impot", "impôts", "taxe", "taxes", "patente", "tax"]
};
const PAS_TOUT = ["pas tout payé", "pas tout paye", "pas tout", "crédit", "credit", "reste", "avance", "acompte", "not all", "part"];
const TOUT_PAYE = ["tout payé", "tout paye", "comptant", "paid all", "all paid", "fully paid"];
const MOTS_DONNE = ["donné", "donne", "a donné", "versé", "gave", "given", "avance", "acompte"];

function contientUn(texte, liste) {
  return liste.some(function (m) { return texte.indexOf(" " + m + " ") !== -1; });
}
function declencher(champ, valeur) {
  champ.value = valeur;
  champ.dispatchEvent(new Event("input", { bubbles: true }));
}

// Comprend une phrase dite pendant que la fenêtre de saisie est ouverte.
// Rend "oui", "non", "rempli" ou "" (rien compris).
function remplirSaisieParVoix(phrase) {
  // Un numéro de téléphone dit chiffre par chiffre (« 07 01 02 03 04 ») est mis à part.
  let tel = "";
  const brut = chiffresParles(phrase).replace(/(\+?\d[\d\s.-]{6,}\d)/g, function (m) {
    const d = m.replace(/\D/g, "");
    if (d.length >= 8 && (d[0] === "0" || /^225/.test(d) || d.length >= 10)) { tel = d; return " "; }
    return m;
  });
  const mots = motsDe(brut);
  const texte = " " + mots.join(" ") + " ";
  const m = lireMontantParle(mots);
  const utiles = m.mots.filter(function (x) { return !MOTS_VIDES.has(x) && !estPetitMot(x); });
  if (!m.montant && !tel && contientUn(texte, MOTS_OUI) && utiles.length <= 2) return "oui";
  if (!m.montant && !tel && contientUn(texte, MOTS_NON) && utiles.length <= 2) return "non";

  let rempli = false;
  const mode = modeSaisie;
  // Vente : « 5 000, il a donné 2 000 » ou « pas tout payé » / « tout payé ».
  if ((mode === "vente" || mode === "credit") && m.nombres.length >= 2 && contientUn(texte, MOTS_DONNE)) {
    declencher($("montant"), String(m.nombres[0]));
    if (mode === "vente") choisirPaiement(true);
    declencher($("donne"), String(m.nombres[1]));
    rempli = true;
  } else if (m.montant) {
    declencher($("montant"), String(m.montant));
    rempli = true;
  }
  if (mode === "vente") {
    if (contientUn(texte, TOUT_PAYE)) { choisirPaiement(false); rempli = true; }
    else if (contientUn(texte, PAS_TOUT)) { choisirPaiement(true); rempli = true; }
  }
  // Moyen de paiement : « par Wave », « en espèces »…
  Object.keys(MOYENS_PARLES).forEach(function (k) {
    if (contientUn(texte, MOYENS_PARLES[k]) && document.querySelector('[data-moyen="' + k + '"]') && !$("bloc-moyen").hidden) {
      choisirMoyen(k); rempli = true;
    }
  });
  // Catégorie de dépense.
  if (mode === "depense") {
    Object.keys(CATEGORIES_PARLEES).forEach(function (k) {
      if (contientUn(texte, CATEGORIES_PARLEES[k])) { choisirCategorie(k); rempli = true; }
    });
  }
  // Le reste de la phrase : le client, le fournisseur ou la note.
  const sansMotsCles = utiles.filter(function (x) {
    return [MOYENS_PARLES, CATEGORIES_PARLEES].every(function (liste) {
      return Object.keys(liste).every(function (k) { return liste[k].indexOf(x) === -1; });
    }) && ["tout", "pas", "donné", "donne", "versé", "reste", "avance", "acompte", "gave", "all", "not", "comptant", "numéro", "numero", "téléphone", "telephone", "number", "phone", "nom", "name", "appelle", "s'appelle"].indexOf(x) === -1;
  });
  const coupe = sansMotsCles.findIndex(function (x) { return x === "pour" || x === "for"; });
  const nomDit = (coupe === -1 ? sansMotsCles : sansMotsCles.slice(0, coupe)).join(" ")
    .replace(/(^|\s)\S/g, function (c) { return c.toUpperCase(); });
  const noteDite = coupe === -1 ? "" : sansMotsCles.slice(coupe + 1).filter(function (x) { return x !== "pour" && x !== "for"; }).join(" ");
  const avecClient = !$("bloc-client").hidden && visible($("bloc-client"));
  const avecFournisseur = !$("bloc-fournisseur").hidden && visible($("bloc-fournisseur"));
  if (tel) {
    if (avecClient) { declencher($("tel"), afficherTel(normaliserTel(tel))); rempli = true; }
    else if (avecFournisseur) { declencher($("tel-f"), afficherTel(normaliserTel(tel))); rempli = true; }
  }
  if (avecClient && nomDit) {
    const connu = trouverClient(nomDit, listeClients());
    if (connu && connu.tel && !normaliserTel($("tel").value)) declencher($("tel"), afficherTel(connu.tel));
    else declencher($("client"), connu ? connu.nom : nomDit);
    if (noteDite) $("note").value = noteDite;
    rempli = true;
  } else if (avecFournisseur && nomDit) {
    declencher($("fournisseur"), nomDit);
    if (noteDite) $("note").value = noteDite;
    rempli = true;
  } else if (nomDit || noteDite) {
    $("note").value = [nomDit.toLowerCase(), noteDite].filter(Boolean).join(" ");
    rempli = true;
  }
  return rempli ? "rempli" : "";
}
// « zéro sept, zéro un… » → « 07 01… » : un numéro dit en mots commence par zéro.
const CHIFFRES_MOTS = { "zéro": 0, zero: 0, oh: 0, un: 1, une: 1, one: 1, deux: 2, two: 2, trois: 3, three: 3, quatre: 4, four: 4,
  cinq: 5, five: 5, six: 6, sept: 7, seven: 7, huit: 8, eight: 8, neuf: 9, nine: 9 };
function chiffresParles(phrase) {
  return phrase.replace(/\b(z[ée]ro|zero|oh)\s+(un|une|one|deux|two|trois|three|quatre|four|cinq|five|six|sept|seven|huit|eight|neuf|nine|z[ée]ro|zero)\b/gi,
    function (m, a, b) { return "0" + CHIFFRES_MOTS[b.toLowerCase()]; });
}
function estPetitMot(x) { return x === "pour" || x === "for" ? false : x.length === 1 && !/\d/.test(x); }

// Ce qui est rempli, dit en une ou deux phrases, et ce qui manque encore.
function resumeSaisie() {
  const mode = modeSaisie;
  const montant = lireMontant($("montant").value);
  // Le titre est traduit ici : l'écran ne l'a peut-être pas encore fait (fenêtre qui vient de s'ouvrir).
  const parties = [tr($("saisie-titre").textContent) + (montant ? (LANGUE === "en" ? ": " : " : ") + franc(montant) : "") + "."];
  let manque = "";
  if (!montant && !(mode === "vente" && !$("bloc-produits").hidden)) manque = "Dis le montant.";
  if (mode === "vente" && !$("bloc-paiement").hidden) {
    if (paiementPartiel) {
      const donne = lireMontant($("donne").value);
      parties.push(donne ? tr("Il a donné " + franc(donne) + ".") : tr("Il n'a rien donné."));
    } else parties.push(tr("Tout payé."));
  }
  const clientVisible = !$("bloc-client").hidden && visible($("bloc-client"));
  if (clientVisible) {
    const nom = $("client").value.trim(), tel = normaliserTel($("tel").value);
    if (nom) parties.push(tr("Client : " + nom + "."));
    if (tel.length >= 8) parties.push(tr("Numéro : " + afficherTel(tel) + "."));
    if (!manque && tel.length < 8 && !nom) manque = "Dis le nom et le numéro de téléphone du client.";
    else if (!manque && tel.length < 8) manque = "Dis son numéro de téléphone.";
    else if (!manque && !nom) manque = "Dis son nom.";
  }
  const fournisseurVisible = !$("bloc-fournisseur").hidden && visible($("bloc-fournisseur"));
  if (fournisseurVisible) {
    const f = $("fournisseur").value.trim();
    if (f) parties.push(tr("Fournisseur : " + f + "."));
    else if (!manque) manque = "Dis le nom du fournisseur.";
  }
  if (mode === "depense") {
    const cat = document.querySelector("[data-categorie][aria-pressed='true']");
    if (cat) parties.push(cat.textContent + ".");
  }
  if (!$("bloc-moyen").hidden && moyenChoisi !== "especes") parties.push(tr("Payé par " + MOYENS[moyenChoisi] + "."));
  if ($("note").value.trim()) parties.push(tr("Note : " + $("note").value.trim() + "."));
  return { texte: parties.map(tr).join(" "), manque: manque };
}

/* ---------- Conversation : Canari dit ce qu'il a compris et attend « oui » ---------- */

let toursConversation = 0;
const TOURS_MAX = 6;

function dialogueSaisie(avant) {
  if ($("saisie").hidden || toursConversation >= TOURS_MAX) return;
  voixActiveJusqua = Date.now() + 60000;
  const r = resumeSaisie();
  const question = r.manque || "Dis oui pour enregistrer, ou dis ce qu'il faut changer.";
  parler((avant ? tr(avant) + " " : "") + r.texte + " " + tr(question), function () {
    if ($("saisie").hidden || toursConversation >= TOURS_MAX) return;
    toursConversation++;
    ecouterVoix(true, phraseDansSaisie);
  });
}
function phraseDansSaisie(alternatives) {
  let resultat = "";
  for (let i = 0; i < alternatives.length && !resultat; i++) resultat = remplirSaisieParVoix(alternatives[i]);
  if (resultat === "oui") {
    const r = resumeSaisie();
    if (r.manque) return dialogueSaisie();
    $("saisie").requestSubmit();
    // Si l'appli a refusé (numéro manquant…), Canari lit l'erreur et réécoute.
    setTimeout(function () {
      if (!$("saisie").hidden && !$("erreur").hidden) {
        parler($("erreur").textContent, function () { toursConversation++; ecouterVoix(true, phraseDansSaisie); });
      }
    }, 150);
    return;
  }
  if (resultat === "non") { fermerSaisie(); return parler("D'accord, j'annule."); }
  if (!resultat) return dialogueSaisie("Je n'ai pas compris.");
  dialogueSaisie();
}

/* ---------- Commandes dites avec le bouton « Parler » de l'écran principal ---------- */

function remplirMontant(n) {
  if (!n) return;
  declencher($("montant"), String(n));
}
function executer(ordre) {
  voixActiveJusqua = Date.now() + 60000;
  if (ordre.nom === "aller") return allerA(ordre.onglet);
  if (ordre.nom === "aide") return parler(tr("Dis par exemple :") + " " + Array.prototype.map.call(document.querySelectorAll(".voix-exemples li"), function (li) { return li.textContent; }).join(", "));
  if (ordre.nom === "bilan") {
    fermerFeuilles();
    montrer("principal");
    document.querySelector('[data-onglet="jour"]').click();
    return parler($("bilan-texte").textContent || $("vide").textContent);
  }
  if (ordre.nom === "dettes") {
    fermerFeuilles();
    montrer("principal");
    coteCredits = "clients";
    document.querySelector('[data-onglet="credits"]').click();
    return parler(resumeEcran());
  }
  toursConversation = 0;
  if (ordre.nom === "paye") {
    const c = trouverClient(ordre.texte, clientsQuiDoivent());
    if (!c) return parler("Je ne trouve pas ce client dans tes crédits.");
    ouvrirSaisie("paye", c);
    if ($("saisie").hidden) return; // abonnement fini : la fenêtre d'abonnement s'est ouverte
    remplirMontant(ordre.montant);
    return dialogueSaisie();
  }
  const mode = ordre.nom === "credit" ? "credit" : ordre.nom === "maison" ? "maison" : ordre.nom === "depense" ? "depense" : "vente";
  ouvrirSaisie(mode);
  if ($("saisie").hidden) return;
  remplirMontant(ordre.montant);
  if (mode !== "maison" && ordre.note) $("note").value = ordre.note;
  if (mode === "depense" && ordre.note) {
    const texte = " " + ordre.note + " ";
    Object.keys(CATEGORIES_PARLEES).forEach(function (k) { if (contientUn(texte, CATEGORIES_PARLEES[k])) choisirCategorie(k); });
  }
  if (mode === "credit" && ordre.texte) {
    const c = trouverClient(ordre.texte, listeClients());
    if (c && c.tel) declencher($("tel"), afficherTel(c.tel));
    else declencher($("client"), ordre.texte);
  }
  dialogueSaisie();
}

/* ---------- Écouter ---------- */

// Écoute une phrase. compact = petite bande en haut (la fenêtre reste visible).
// suite(alternatives) reçoit les phrases entendues (la plus probable d'abord).
function ecouterVoix(compact, suite) {
  if (!Reconnaissance) return;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (ecoute) { try { ecoute.abort(); } catch (e) { /* rien */ } }
  $("voix-entendu").textContent = "";
  $("voix-ecoute").classList.toggle("compact", !!compact);
  $("voix-ecoute").hidden = false;
  if (navigator.vibrate) navigator.vibrate(30);
  const r = ecoute = new Reconnaissance();
  r.lang = LANGUE === "en" ? "en-GB" : "fr-FR";
  r.interimResults = true;
  r.maxAlternatives = 3;
  let compris = false;
  r.onresult = function (e) {
    const res = e.results[e.results.length - 1];
    $("voix-entendu").textContent = tr("J'ai entendu : « " + res[0].transcript + " »");
    if (!res.isFinal) return;
    compris = true;
    const alternatives = [];
    for (let i = 0; i < res.length; i++) alternatives.push(res[i].transcript);
    fermerEcoute();
    suite(alternatives);
  };
  r.onerror = function (e) {
    compris = true;
    fermerEcoute();
    const texte = e.error === "network" ? "La commande vocale a besoin d'internet. Vérifie ta connexion."
      : e.error === "not-allowed" || e.error === "service-not-allowed" ? "Autorise le micro pour Canari dans les réglages du téléphone."
      : e.error === "no-speech" ? "Je n'ai rien entendu. Appuie sur Parler et parle près du téléphone."
      : e.error === "aborted" ? "" : "Je n'ai pas compris. Dis par exemple : vente, deux mille.";
    if (texte) { message(texte); parler(texte); }
  };
  r.onend = function () {
    if (!compris && !$("voix-ecoute").hidden) {
      fermerEcoute();
      message("Je n'ai rien entendu. Appuie sur Parler et parle près du téléphone.");
    }
  };
  try { r.start(); } catch (e) { fermerEcoute(); }
}
function fermerEcoute() {
  $("voix-ecoute").hidden = true;
  if (ecoute) { try { ecoute.abort(); } catch (e) { /* rien */ } ecoute = null; }
}
function arreterVoix() {
  toursConversation = TOURS_MAX;
  voixActiveJusqua = 0;
  fermerEcoute();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}

// Bouton « Parler » de l'écran principal.
function ecouter() {
  fermerFeuilles();
  ecouterVoix(false, function (alternatives) {
    let ordre = null;
    for (let i = 0; i < alternatives.length && !ordre; i++) {
      const o = navigationDemandee(alternatives[i]);
      ordre = o ? { nom: "aller", onglet: o } : /^(aide|help|que dire|quoi dire)/i.test(alternatives[i].trim()) ? { nom: "aide" } : comprendre(alternatives[i]);
    }
    if (ordre) executer(ordre);
    else parler("Je n'ai pas compris. Dis par exemple : vente, deux mille.");
  });
}

/* ---------- Boutons « Écouter » partout, réglages de la voix ---------- */

const ICONE_ECOUTER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';

// Ajoute un petit haut-parleur à côté du titre de chaque fenêtre du bas.
function ajouterHautParleurs() {
  document.querySelectorAll(".saisie").forEach(function (f) {
    const titre = f.querySelector(".saisie-titre");
    if (!titre || f.querySelector(".voix-feuille") || f.id === "saisie") return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "voix-feuille";
    b.setAttribute("aria-label", "Lire à voix haute");
    b.innerHTML = ICONE_ECOUTER;
    b.addEventListener("click", function () { parler(lireFeuille(f)); });
    titre.insertAdjacentElement("afterend", b);
  });
}

function majReglagesVoix() {
  const p = prefsVoix();
  document.querySelectorAll("[data-pref-voix]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(!!p[b.dataset.prefVoix]));
  });
}

function initVoix() {
  const peutParler = "speechSynthesis" in window;
  $("saisie-parler").hidden = !Reconnaissance;
  document.querySelectorAll(".voix-lire").forEach(function (b) { b.hidden = !peutParler; });
  $("voix-arreter").addEventListener("click", arreterVoix);
  $("voix-bilan").addEventListener("click", function () { parler($("bilan-texte").textContent); });
  $("voix-ecran").addEventListener("click", function () { parler(resumeEcran()); });
  $("voix-accueil").addEventListener("click", function () {
    parler(document.querySelector(".slogan").textContent + " " + document.querySelector(".accueil-texte").textContent + " " +
      tr("Choisis ta langue, puis appuie sur Commencer."));
  });
  $("voix-param").addEventListener("click", function () {
    const contenu = Array.prototype.filter.call($("param-contenu").querySelectorAll("p, label, h2, .choix-carte b"), visible)
      .map(function (e) { return e.textContent.trim().replace(/[.:?!]+$/, ""); }).filter(Boolean).slice(0, 8).join(". ");
    parler($("param-titre").textContent + ". " + contenu);
  });
  $("saisie-parler").addEventListener("click", function () {
    toursConversation = 0;
    ecouterVoix(true, phraseDansSaisie);
  });
  $("saisie-ecouter").addEventListener("click", function () {
    const r = resumeSaisie();
    parler(r.texte + " " + tr(r.manque || "Appuie sur Enregistrer quand c'est bon."));
  });
  document.querySelectorAll("[data-pref-voix]").forEach(function (b) {
    b.addEventListener("click", function () {
      const p = prefsVoix();
      p[b.dataset.prefVoix] = !p[b.dataset.prefVoix];
      ecrire(CLE_VOIX, JSON.stringify(p));
      majReglagesVoix();
      if (b.dataset.prefVoix === "lecture" && p.lecture) parler("Canari lira ses messages à voix haute.");
      if (b.dataset.prefVoix === "lent" && p.lent) parler("Je parle plus lentement.");
    });
  });
  majReglagesVoix();
  ajouterHautParleurs();
  // Les messages du bas sont lus à voix haute si on l'a choisi, ou pendant une conversation.
  const messageEcrit = message;
  message = function (texte) {
    messageEcrit.apply(this, arguments);
    if (peutParler && (prefsVoix().lecture || Date.now() < voixActiveJusqua)) parler(texte);
  };
  // Si on ferme la fenêtre, la conversation s'arrête.
  $("fond-saisie").addEventListener("click", arreterVoix);
  if (peutParler) speechSynthesis.getVoices(); // charge les voix à l'avance
}

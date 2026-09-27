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
  "Je ne trouve pas ce client dans tes crédits.": "I can't find this customer in your credits."
});
EN_MOTIFS.push(
  [/^Vente de (.+) francs\.$/, "Sale of $1 francs."],
  [/^Crédit de (.+) francs pour (.+)\.$/, "Credit of $1 francs for $2."],
  [/^Crédit de (.+) francs\.$/, "Credit of $1 francs."],
  [/^(.+) a payé (.+) francs\.$/, "$1 paid $2 francs."],
  [/^Dépense de (.+) francs\.$/, "Expense of $1 francs."],
  [/^Dépense de (.+) francs pour (.+)\.$/, "Expense of $1 francs for $2."],
  [/^Pris pour la maison : (.+) francs\.$/, "Taken for home: $1 francs."],
  [/^Tes clients te doivent (.+) francs\.$/, "Your customers owe you $1 francs."],
  [/^(.+) te doit (.+) francs\.$/, "$1 owes you $2 francs."],
  [/^J'ai entendu : « (.+) »$/, "I heard: “$1”"]
);

const Reconnaissance = window.SpeechRecognition || window.webkitSpeechRecognition;
let ecoute = null;

/* ---------- Parler à voix haute ---------- */

function parler(texte) {
  if (!("speechSynthesis" in window) || !texte) return;
  const phrase = tr(texte)
    .replace(/(\d)[\s  ](?=\d{3}\b)/g, "$1")   // « 2 000 » se lit « deux mille »
    .replace(/(\d)[\s ]F\b/g, "$1 francs");
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(phrase);
  u.lang = LANGUE === "en" ? "en-GB" : "fr-FR";
  u.rate = 0.95;
  const voix = speechSynthesis.getVoices().filter(function (v) { return v.lang && v.lang.slice(0, 2) === u.lang.slice(0, 2); });
  if (voix.length) u.voice = voix.find(function (v) { return v.localService; }) || voix[0];
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
function lireMontantParle(mots) {
  let meilleur = 0, total = 0, courant = 0, dansNombre = false;
  const garde = [];
  const finir = function () {
    if (dansNombre) meilleur = Math.max(meilleur, total + courant);
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
    if (!/^(francs?|f|fcfa|cfa)$/.test(mot)) garde.push(mot);
  });
  finir();
  return { montant: meilleur, mots: garde };
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

/* ---------- Faire ce qui est demandé ---------- */

function remplirMontant(n) {
  if (!n) return;
  $("montant").value = String(n);
  $("montant").dispatchEvent(new Event("input", { bubbles: true }));
}
function executer(ordre) {
  const montantDit = ordre.montant ? franc(ordre.montant).replace(/ F$/, "").replace(/ F$/, "") : "";
  if (ordre.nom === "bilan") {
    montrer("principal");
    afficher();
    parler($("bilan-texte").textContent || $("vide").textContent);
    return;
  }
  if (ordre.nom === "dettes") {
    const clients = clientsQuiDoivent();
    if (!clients.length) return parler("Personne ne te doit de l'argent.");
    const total = clients.reduce(function (s, c) { return s + c.du; }, 0);
    parler(tr("Tes clients te doivent " + nombre(total) + " francs.") + " " +
      clients.slice(0, 3).map(function (c) { return tr(c.nom + " te doit " + nombre(c.du) + " francs."); }).join(" "));
    return;
  }
  if (ordre.nom === "paye") {
    const c = trouverClient(ordre.texte, clientsQuiDoivent());
    if (!c) return parler("Je ne trouve pas ce client dans tes crédits.");
    ouvrirSaisie("paye", c);
    if ($("saisie").hidden) return; // abonnement fini : la fenêtre d'abonnement s'est ouverte
    remplirMontant(ordre.montant);
    return parler(tr(c.nom + " a payé " + montantDit + " francs.") + " " + tr("Vérifie, puis appuie sur le bouton Enregistrer."));
  }
  const mode = ordre.nom === "credit" ? "credit" : ordre.nom === "maison" ? "maison" : ordre.nom === "depense" ? "depense" : "vente";
  ouvrirSaisie(mode);
  if ($("saisie").hidden) return;
  remplirMontant(ordre.montant);
  if (mode !== "maison" && ordre.note) $("note").value = ordre.note;
  if (mode === "credit") {
    const c = trouverClient(ordre.texte, listeClients());
    if (c && c.tel) {
      $("tel").value = afficherTel(c.tel);
      $("tel").dispatchEvent(new Event("input", { bubbles: true }));
    } else if (ordre.texte) {
      $("client").value = ordre.texte;
      $("client").dispatchEvent(new Event("input", { bubbles: true }));
    }
    const pour = c ? c.nom : ordre.texte;
    parler(tr("Crédit de " + montantDit + " francs" + (pour ? " pour " + pour : "") + ".") + " " +
      tr(c && c.tel ? "Vérifie, puis appuie sur le bouton Enregistrer." : "Tape son numéro de téléphone, puis appuie sur Enregistrer."));
    return;
  }
  const phrase = mode === "maison" ? "Pris pour la maison : " + montantDit + " francs."
    : mode === "depense" ? "Dépense de " + montantDit + " francs" + (ordre.note ? " pour " + ordre.note : "") + "."
    : "Vente de " + montantDit + " francs.";
  parler(tr(phrase) + " " + tr("Vérifie, puis appuie sur le bouton Enregistrer."));
}

/* ---------- Écouter ---------- */

function fermerEcoute() {
  $("voix-ecoute").hidden = true;
  if (ecoute) { try { ecoute.abort(); } catch (e) { /* rien */ } ecoute = null; }
}
function ecouter() {
  if (!Reconnaissance) return;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  fermerFeuilles();
  $("voix-entendu").textContent = "";
  $("voix-ecoute").hidden = false;
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
    let ordre = null;
    for (let i = 0; i < res.length && !ordre; i++) ordre = comprendre(res[i].transcript);
    fermerEcoute();
    if (ordre) executer(ordre);
    else parler("Je n'ai pas compris. Dis par exemple : vente, deux mille.");
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

function initVoix() {
  $("voix-parler").hidden = !Reconnaissance;
  $("voix-bilan").hidden = !("speechSynthesis" in window);
  $("voix-parler").addEventListener("click", ecouter);
  $("voix-arreter").addEventListener("click", fermerEcoute);
  $("voix-bilan").addEventListener("click", function () { parler($("bilan-texte").textContent); });
  if ("speechSynthesis" in window) speechSynthesis.getVoices(); // charge les voix à l'avance
}

// Canari · charges fixes, impôts et taxes, questionnaire de départ, bilan du mois.
// Chargé avant app.js ; initCharges() est lancé au démarrage par app.js.
//
// Cascade (décision du propriétaire) :
//   ventes − prix de revient = marge brute
//   − autres dépenses − charges fixes = résultat avant impôts
//   − impôts et taxes = bénéfice net
// Les charges et taxes prévues (loyer, patente…) sont réparties sur les jours de
// travail : chaque jour où l'on vend porte sa part. Payer une charge prévue
// (dépense « Charge fixe » ou « Impôt ») sort de la caisse mais ne la compte pas
// deux fois dans le bénéfice.

/* ---------- Modèles pré-remplis selon la façon de vendre ---------- */

const CANAUX = {
  boutique: { nom: "En boutique", aide: "un local, un magasin, un kiosque" },
  enligne: { nom: "En ligne", aide: "WhatsApp, Facebook, TikTok, livraison" },
  sauvette: { nom: "À la sauvette", aide: "dans la rue, au marché, en marchant" }
};
const ACTIVITES = {
  revente: { nom: "Je revends des marchandises", aide: "j'achète et je revends" },
  fabrication: { nom: "Je fabrique", aide: "pain, attiéké, jus, savon, couture…" },
  services: { nom: "Je fais des services", aide: "coiffure, réparation, transport…" }
};
const FREQUENCES = { jour: "par jour", semaine: "par semaine", mois: "par mois", an: "par an" };

const MODELES_CHARGES = {
  boutique: [
    { nom: "Loyer", frequence: "mois" },
    { nom: "Électricité", frequence: "mois" },
    { nom: "Eau", frequence: "mois" },
    { nom: "Salaire d'un employé", frequence: "mois" },
    { nom: "Gardiennage", frequence: "mois" }
  ],
  enligne: [
    { nom: "Forfait internet", frequence: "mois" },
    { nom: "Publicité (Facebook, TikTok…)", frequence: "mois" },
    { nom: "Livraisons payées par toi", frequence: "mois" },
    { nom: "Frais Mobile Money", mode: "pourcent" }
  ],
  sauvette: [
    { nom: "Ticket de marché", frequence: "jour" },
    { nom: "Transport", frequence: "jour" }
  ],
  commun: [
    { nom: "Crédit téléphone", frequence: "mois" }
  ]
};
const MODELES_IMPOTS = [
  { nom: "Impôt (DGI)", frequence: "an" },
  { nom: "Taxe communale / patente", frequence: "an" }
];

/* ---------- Calculs ---------- */

function joursTravail() {
  const j = donnees.boutique.joursTravail;
  return j > 0 ? j : 26;
}
function lignesActives(type) {
  return (donnees.charges || []).filter(function (l) {
    return l.type === type && (l.mode === "pourcent" ? l.taux > 0 : l.montant > 0);
  });
}
// Montant d'une ligne fixe ramené au mois.
function parMois(l) {
  const f = { jour: joursTravail(), semaine: 52 / 12, mois: 1, an: 1 / 12 }[l.frequence] || 1;
  return l.montant * f;
}
function fixeMensuel(type) {
  return lignesActives(type).filter(function (l) { return l.mode !== "pourcent"; })
    .reduce(function (s, l) { return s + parMois(l); }, 0);
}
function tauxVentes(type) {
  return lignesActives(type).filter(function (l) { return l.mode === "pourcent"; })
    .reduce(function (s, l) { return s + l.taux; }, 0);
}
function aDesCharges() {
  return lignesActives("charge").length + lignesActives("impot").length > 0;
}

// Part des charges et taxes portée par une journée de ventes.
function partDuJour(vendu) {
  if (!vendu) return { charges: 0, impots: 0 };
  return {
    charges: Math.round(fixeMensuel("charge") / joursTravail() + vendu * tauxVentes("charge") / 100),
    impots: Math.round(fixeMensuel("impot") / joursTravail() + vendu * tauxVentes("impot") / 100)
  };
}

// Ventes minimum par jour pour couvrir charges et taxes (seuil de rentabilité).
function seuilDuJour() {
  const fixe = (fixeMensuel("charge") + fixeMensuel("impot")) / joursTravail();
  const marge = margeHabituelle() - tauxVentes("charge") - tauxVentes("impot");
  if (!fixe || marge <= 0) return 0;
  return Math.ceil(fixe / (marge / 100) / 100) * 100;
}

/* ---------- Bilan du mois ---------- */

let moisAffiche = null; // { annee, mois } ; null = mois en cours

function bilanDuMois(annee, mois) {
  const aujourdhui = new Date();
  const enCours = annee === aujourdhui.getFullYear() && mois === aujourdhui.getMonth();
  const joursDuMois = new Date(annee, mois + 1, 0).getDate();
  const dernierJour = enCours ? aujourdhui.getDate() : joursDuMois;
  const t = { vendu: 0, aCredit: 0, cout: 0, depenses: 0, maison: 0, encaisse: 0, sorti: 0, joursVente: 0 };
  for (let j = 1; j <= dernierJour; j++) {
    const d = totauxDuJour(cleJour(new Date(annee, mois, j, 12)));
    ["vendu", "aCredit", "cout", "depenses", "maison", "encaisse", "sorti"].forEach(function (k) { t[k] += d[k]; });
    if (d.vendu) t.joursVente++;
  }
  // Charges fixes : la partie du mois écoulée, comptée à partir du premier jour
  // noté dans Canari (pour ne pas faire payer tout le mois à un nouvel utilisateur).
  const premier = donnees.mouvements.reduce(function (min, m) { return Math.min(min, m.t); }, Infinity);
  const debutCanari = premier === Infinity ? new Date() : new Date(premier);
  let premierJour = 1;
  if (debutCanari.getFullYear() === annee && debutCanari.getMonth() === mois) premierJour = debutCanari.getDate();
  else if (debutCanari > new Date(annee, mois + 1, 0, 23, 59)) premierJour = dernierJour + 1;
  const fraction = Math.max(0, dernierJour - premierJour + 1) / joursDuMois;
  t.fraction = fraction;
  t.enCours = enCours;
  t.chargesFixes = Math.round(fixeMensuel("charge") * fraction + t.vendu * tauxVentes("charge") / 100);
  t.impots = Math.round(fixeMensuel("impot") * fraction + t.vendu * tauxVentes("impot") / 100);
  t.margeBrute = t.vendu - t.cout;
  t.avantImpots = t.margeBrute - t.depenses - t.chargesFixes;
  t.net = t.avantImpots - t.impots;

  // Ce qui a déjà été payé pour chaque charge prévue ce mois-ci.
  t.paye = {};
  donnees.mouvements.forEach(function (m) {
    const d = new Date(m.t);
    if (m.type !== "depense" || !m.chargeId || d.getFullYear() !== annee || d.getMonth() !== mois) return;
    t.paye[m.chargeId] = (t.paye[m.chargeId] || 0) + m.montant;
  });
  return t;
}

function afficherMois() {
  const aujourdhui = new Date();
  const ref = moisAffiche || { annee: aujourdhui.getFullYear(), mois: aujourdhui.getMonth() };
  const t = bilanDuMois(ref.annee, ref.mois);
  const nomMois = new Date(ref.annee, ref.mois, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const signe = function (n) { return (n < 0 ? "− " : "") + franc(Math.abs(n)); };
  const pct = function (n) { return t.vendu ? " (" + Math.round(n / t.vendu * 100) + " %)" : ""; };
  const ligne = function (libelle, valeur, classe) {
    return '<li class="cascade-ligne ' + (classe || "") + '"><span>' + libelle + '</span><b>' + valeur + '</b></li>';
  };
  const estCeMois = !moisAffiche || (ref.annee === aujourdhui.getFullYear() && ref.mois === aujourdhui.getMonth());

  let html = '<div class="mois-nav">' +
    '<button type="button" class="bouton-reglages" data-mois="-1" aria-label="Mois précédent">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
    '<h2 class="titre-ecran">' + nomMois.charAt(0).toUpperCase() + nomMois.slice(1) + '</h2>' +
    '<button type="button" class="bouton-reglages" data-mois="1" aria-label="Mois suivant"' + (estCeMois ? ' disabled' : '') + '>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>' +
    '</div>';

  if (!t.vendu && !t.sorti && !t.encaisse) {
    $("vue-mois").innerHTML = html + videHtml("canari-tranquille", "Rien de noté ce mois-ci.");
    return;
  }

  html +=
    '<div class="carte-gain carte-mois">' +
      '<p class="etiquette">Ventes du mois</p>' +
      '<p class="gros-chiffre">' + franc(t.vendu) + '</p>' +
      '<div class="trois-chiffres deux">' +
        '<div class="chiffre entre"><span>Marge brute</span><strong>' + signe(t.margeBrute) + '</strong></div>' +
        '<div class="chiffre ' + (t.net < 0 ? 'sort' : 'entre') + '"><span>Bénéfice net</span><strong' + (t.net < 0 ? ' class="m-sort"' : '') + '>' + signe(t.net) + '</strong></div>' +
      '</div>' +
    '</div>' +
    '<h2 class="titre-liste">Le calcul, pas à pas</h2>' +
    '<ul class="cascade">' +
      ligne("Ventes" + (t.aCredit ? " (dont " + franc(t.aCredit) + " à crédit)" : ""), franc(t.vendu)) +
      ligne("− Prix de revient", "− " + franc(t.cout), "moins") +
      ligne("= Marge brute" + pct(t.margeBrute), signe(t.margeBrute), "total") +
      ligne("− Autres dépenses", "− " + franc(t.depenses), "moins") +
      ligne("− Charges fixes" + (t.enCours && t.chargesFixes ? " (jusqu'à aujourd'hui)" : ""), "− " + franc(t.chargesFixes), "moins") +
      ligne("= Résultat avant impôts", signe(t.avantImpots), "total") +
      ligne("− Impôts et taxes", "− " + franc(t.impots), "moins") +
      ligne("= Bénéfice net" + (t.net > 0 ? pct(t.net) : ""), signe(t.net), "total net" + (t.net < 0 ? " perte" : "")) +
      (t.maison ? ligne("− Pris pour la maison", "− " + franc(t.maison), "moins maison") +
        ligne("= Reste pour la boutique", signe(t.net - t.maison), "total") : "") +
    '</ul>' +
    '<p class="aide">Argent en caisse ce mois : ' + signe(t.encaisse - t.sorti - t.maison) +
      ' (entré ' + franc(t.encaisse) + ', sorti ' + franc(t.sorti + t.maison) + ').</p>';

  const prevues = lignesActives("charge").concat(lignesActives("impot"));
  if (prevues.length) {
    html += '<h2 class="titre-liste">Charges et taxes du mois</h2><ul class="cascade prevues">' +
      prevues.map(function (l) {
        const prevu = l.mode === "pourcent" ? Math.round(t.vendu * l.taux / 100) : Math.round(parMois(l));
        const paye = t.paye[l.id] || 0;
        const etat = l.mode === "pourcent" ? l.taux + " % des ventes"
          : paye >= prevu ? "payé" : paye ? "payé " + franc(paye) : "pas encore payé";
        return '<li class="cascade-ligne' + (l.mode !== "pourcent" && paye < prevu ? ' a-payer' : '') + '"><span>' + echapper(l.nom) +
          '<small>' + etat + '</small></span><b>' + franc(prevu) + '</b></li>';
      }).join("") + '</ul>' +
      '<p class="aide">Quand tu paies une de ces charges, note-la avec « Dépense » puis « Charge fixe » ou « Impôt ».</p>';
  } else {
    html += '<div class="carte-reglage invitation"><p>Ajoute ton loyer, tes salaires et tes taxes pour voir ton vrai bénéfice net.</p>' +
      '<button type="button" class="bouton bouton-sauver" data-parametrage="5">Ajouter mes charges</button></div>';
  }
  $("vue-mois").innerHTML = html;
}

/* ---------- Questionnaire de départ ---------- */

const ETAPES = ["intro", "boutique", "canaux", "activites", "marge", "charges", "impots", "fin"];
let etape = 0;
let brouillon = null; // réponses en cours, enregistrées à la fin
let retourApres = "principal";

function nouvelleLigne(modele, type) {
  return {
    id: nouvelId(), nom: modele.nom, type: type, mode: modele.mode || "fixe",
    frequence: modele.frequence || "mois", montant: 0, taux: 0
  };
}

// Complète la liste des charges avec les modèles des façons de vendre choisies.
function preremplirCharges(b) {
  const noms = b.charges.map(function (l) { return l.nom.toLowerCase(); });
  const ajouter = function (modele, type) {
    if (noms.indexOf(modele.nom.toLowerCase()) !== -1) return;
    b.charges.push(nouvelleLigne(modele, type));
    noms.push(modele.nom.toLowerCase());
  };
  b.canaux.forEach(function (c) { (MODELES_CHARGES[c] || []).forEach(function (m) { ajouter(m, "charge"); }); });
  MODELES_CHARGES.commun.forEach(function (m) { ajouter(m, "charge"); });
  MODELES_IMPOTS.forEach(function (m) { ajouter(m, "impot"); });
}

function ouvrirParametrage(depart, retour) {
  const b = donnees.boutique;
  brouillon = {
    nom: b.nom || "", tel: b.tel || "", rccm: b.rccm || "", dfe: b.dfe || "",
    canaux: (b.canaux || []).slice(), activites: (b.activites || []).slice(),
    marge: margeHabituelle(), joursTravail: joursTravail(),
    charges: JSON.parse(JSON.stringify(donnees.charges || []))
  };
  etape = depart || 0;
  retourApres = retour || "principal";
  montrer("parametrage");
  afficherEtape();
}

function lireEtape() {
  const nom = ETAPES[etape];
  if (nom === "boutique") {
    brouillon.nom = $("param-nom").value.trim().replace(/\s+/g, " ");
    brouillon.tel = normaliserTel($("param-tel").value);
    brouillon.rccm = $("param-rccm").value.trim().toUpperCase();
    brouillon.dfe = $("param-dfe").value.trim().toUpperCase();
  } else if (nom === "marge") {
    const m = parseInt($("param-marge").value.replace(/\D/g, ""), 10);
    if (!isNaN(m) && m < 100) brouillon.marge = m;
  } else if (nom === "charges" || nom === "impots") {
    document.querySelectorAll("#param-contenu .ligne-charge").forEach(function (li) {
      const l = brouillon.charges.find(function (x) { return x.id === li.dataset.id; });
      if (!l) return;
      l.nom = li.querySelector(".lc-nom").value.trim() || l.nom;
      const valeur = lireMontant(li.querySelector(".lc-montant").value);
      const mode = li.querySelector(".lc-mode") ? li.querySelector(".lc-mode").value : l.mode;
      l.mode = mode === "pourcent" ? "pourcent" : "fixe";
      if (l.mode === "pourcent") { l.taux = Math.min(99, valeur); l.montant = 0; }
      else { l.montant = valeur; l.taux = 0; l.frequence = li.querySelector(".lc-frequence").value; }
    });
    if (nom === "charges") {
      const j = parseInt($("param-jours").value.replace(/\D/g, ""), 10);
      if (j > 0 && j <= 31) brouillon.joursTravail = j;
    }
  }
}

function ligneChargeHtml(l, avecMode) {
  const pourcent = l.mode === "pourcent";
  return '<li class="ligne-charge" data-id="' + l.id + '">' +
    '<div class="lc-haut"><input class="note lc-nom" value="' + echapper(l.nom) + '" aria-label="Nom">' +
    '<button type="button" class="retirer" data-retirer-charge="' + l.id + '" aria-label="Retirer cette ligne">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
    '<div class="lc-bas">' +
      '<input class="note lc-montant" inputmode="numeric" placeholder="0" value="' + (pourcent ? (l.taux || "") : (l.montant ? nombre(l.montant) : "")) + '" aria-label="Montant">' +
      (avecMode || pourcent
        ? '<select class="note lc-mode" aria-label="Montant ou pourcentage"><option value="fixe"' + (pourcent ? '' : ' selected') + '>F</option>' +
          '<option value="pourcent"' + (pourcent ? ' selected' : '') + '>% des ventes</option></select>'
        : '<span class="lc-f">F</span>') +
      '<select class="note lc-frequence" aria-label="Fréquence"' + (pourcent ? ' hidden' : '') + '>' +
        Object.keys(FREQUENCES).map(function (f) {
          return '<option value="' + f + '"' + (l.frequence === f ? ' selected' : '') + '>' + FREQUENCES[f] + '</option>';
        }).join("") +
      '</select>' +
    '</div></li>';
}

function choixMultiplesHtml(liste, choisis, attribut) {
  return '<div class="choix-cartes">' + Object.keys(liste).map(function (k) {
    return '<button type="button" class="choix-carte" ' + attribut + '="' + k + '" aria-pressed="' + (choisis.indexOf(k) !== -1) + '">' +
      '<b>' + liste[k].nom + '</b><small>' + liste[k].aide + '</small></button>';
  }).join("") + '</div>';
}

function afficherEtape() {
  const nom = ETAPES[etape];
  const b = brouillon;
  let image = "canari-tranquille", titre = "", html = "";

  if (nom === "intro") {
    image = "mascotte-canari-3d";
    titre = "Calculons ton vrai bénéfice";
    html = '<p>Quelques questions sur ta boutique, tes charges et tes taxes. Ça prend 2 minutes.</p>' +
      '<p>Tu peux passer une question, et tout changer plus tard dans Réglages ⚙.</p>';
  } else if (nom === "boutique") {
    titre = "Ta boutique";
    html = '<label class="champ-etiquette" for="param-nom">Son nom</label>' +
      '<input id="param-nom" class="note" placeholder="ex. Boutique Awa" autocapitalize="words" value="' + echapper(b.nom) + '">' +
      '<label class="champ-etiquette" for="param-tel">Son téléphone</label>' +
      '<input id="param-tel" class="note" type="tel" inputmode="tel" placeholder="ex. 07 00 00 00 00" value="' + (b.tel ? afficherTel(b.tel) : "") + '">' +
      '<p class="champ-etiquette">Ton logo (image ou PDF, facultatif)</p>' +
      '<div class="logo-boutique"><div class="logo-apercu" id="param-logo-apercu">' +
        (donnees.boutique.logo ? '<img src="' + donnees.boutique.logo + '" alt="Logo de la boutique">' : '<span>Pas de logo</span>') + '</div>' +
        '<label class="bouton bouton-annuler bouton-fichier">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4"/></svg>Choisir un logo' +
          '<input type="file" id="param-logo" accept="image/*,application/pdf,.pdf"></label></div>' +
      '<p class="aide">Pour des factures officielles (facultatif) :</p>' +
      '<label class="champ-etiquette" for="param-rccm">N° RCCM (Registre du commerce)</label>' +
      '<input id="param-rccm" class="note" placeholder="ex. CI-ABJ-2024-A-12345" autocapitalize="characters" value="' + echapper(b.rccm) + '">' +
      '<label class="champ-etiquette" for="param-dfe">N° de DFE / compte contribuable (NCC)</label>' +
      '<input id="param-dfe" class="note" placeholder="ex. 2401234 A" autocapitalize="characters" value="' + echapper(b.dfe) + '">';
  } else if (nom === "canaux") {
    titre = "Comment vends-tu ?";
    html = '<p class="aide">Tu peux en choisir plusieurs.</p>' + choixMultiplesHtml(CANAUX, b.canaux, "data-canal");
  } else if (nom === "activites") {
    titre = "Que vends-tu ?";
    html = '<p class="aide">Tu peux en choisir plusieurs.</p>' + choixMultiplesHtml(ACTIVITES, b.activites, "data-activite");
  } else if (nom === "marge") {
    image = "canari-joyeux";
    titre = "Ta marge habituelle";
    html = '<p>Quand tu vends pour <b>1 000 F</b>, combien te reste-t-il une fois la marchandise (ou les ingrédients) payée ?</p>' +
      '<div class="rapides">' + [100, 200, 300, 400].map(function (v) {
        return '<button type="button" class="rapide" data-marge="' + (v / 10) + '">' + franc(v) + '</button>';
      }).join("") + '</div>' +
      '<label class="champ-etiquette" for="param-marge">Ou tape ta marge en %</label>' +
      '<input id="param-marge" class="note quantite" inputmode="numeric" value="' + b.marge + '">' +
      '<p class="aide" id="param-marge-aide">Sur 1 000 F vendus, il te reste ' + franc(b.marge * 10) + '.</p>';
  } else if (nom === "charges") {
    titre = "Tes charges fixes";
    preremplirCharges(b);
    html = '<p class="aide">Ce que tu paies même quand tu vends peu. Laisse vide ce que tu ne paies pas.</p>' +
      '<ul class="lignes-charges">' + b.charges.filter(function (l) { return l.type === "charge"; })
        .map(function (l) { return ligneChargeHtml(l, false); }).join("") + '</ul>' +
      '<button type="button" class="bouton bouton-annuler" data-ajouter-charge="charge">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Ajouter une charge</button>' +
      '<label class="champ-etiquette" for="param-jours">Combien de jours travailles-tu par mois ?</label>' +
      '<input id="param-jours" class="note quantite" inputmode="numeric" value="' + b.joursTravail + '">';
  } else if (nom === "impots") {
    titre = "Tes impôts et taxes";
    preremplirCharges(b);
    html = '<p class="aide">Mets le montant que tu paies vraiment (fixe, ou en % des ventes). Laisse vide si tu ne paies pas.</p>' +
      '<ul class="lignes-charges">' + b.charges.filter(function (l) { return l.type === "impot"; })
        .map(function (l) { return ligneChargeHtml(l, true); }).join("") + '</ul>' +
      '<button type="button" class="bouton bouton-annuler" data-ajouter-charge="impot">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Ajouter un impôt ou une taxe</button>';
  } else if (nom === "fin") {
    image = "canari-yeux-fermes";
    titre = "C'est prêt !";
    // Aperçu calculé avec les réponses, avant de les enregistrer.
    const avant = { charges: donnees.charges, jours: donnees.boutique.joursTravail, marge: donnees.boutique.marge };
    donnees.charges = b.charges; donnees.boutique.joursTravail = b.joursTravail; donnees.boutique.marge = b.marge;
    const parJour = Math.round((fixeMensuel("charge") + fixeMensuel("impot")) / joursTravail());
    const seuil = seuilDuJour();
    donnees.charges = avant.charges; donnees.boutique.joursTravail = avant.jours; donnees.boutique.marge = avant.marge;
    html = parJour
      ? '<p>Chaque jour de travail, tes charges et taxes font environ <b>' + franc(parJour) + '</b>.</p>' +
        (seuil ? '<p class="seuil">Avec ta marge de ' + b.marge + ' %, il faut vendre au moins <b>' + franc(seuil) + '</b> par jour pour ne pas perdre d\'argent.</p>' : '')
      : '<p>Tu n\'as pas mis de charges. Tu pourras les ajouter plus tard dans Réglages ⚙.</p>';
    html += '<p>Sur l\'écran du jour, tu verras tes ventes, ta marge et ton bénéfice net.</p>';
  }

  $("param-image").src = "icones/" + image + ".webp";
  $("param-titre").textContent = titre;
  $("param-contenu").innerHTML = html;
  $("param-progres").innerHTML = ETAPES.map(function (e, i) {
    return '<span class="' + (i < etape ? 'fait' : i === etape ? 'actuel' : '') + '"></span>';
  }).join("");
  $("param-retour").hidden = etape === 0;
  $("param-passer").hidden = etape === 0 || etape === ETAPES.length - 1;
  $("param-suivant").textContent = etape === 0 ? "C'est parti" : etape === ETAPES.length - 1 ? "Terminer" : "Suivant";
  window.scrollTo(0, 0);
}

function terminerParametrage() {
  const b = donnees.boutique;
  if (brouillon.nom) b.nom = brouillon.nom;
  if (brouillon.tel) b.tel = brouillon.tel;
  b.rccm = brouillon.rccm;
  b.dfe = brouillon.dfe;
  b.canaux = brouillon.canaux;
  b.activites = brouillon.activites;
  b.marge = brouillon.marge;
  b.joursTravail = brouillon.joursTravail;
  b.parametre = true;
  // On ne garde que les lignes remplies.
  donnees.charges = brouillon.charges.filter(function (l) { return l.mode === "pourcent" ? l.taux > 0 : l.montant > 0; });
  sauver();
  montrer(retourApres);
  if (retourApres === "reglages") afficherReglages();
  message("Paramétrage enregistré.", null, true);
}

/* ---------- Dépenses : charge fixe ou impôt payé ---------- */

let chargeChoisie = "";
function afficherChoixCharge(categorie) {
  const liste = categorie === "charge" || categorie === "impot" ? lignesActives(categorie) : [];
  $("bloc-charge-payee").hidden = !liste.length;
  chargeChoisie = "";
  $("choix-charge-payee").innerHTML = liste.map(function (l) {
    return '<button type="button" class="suggestion" data-charge-payee="' + l.id + '"><b>' + echapper(l.nom) + '</b>' +
      (l.mode === "pourcent" ? '' : '<small>' + franc(l.montant) + ' ' + FREQUENCES[l.frequence] + '</small>') + '</button>';
  }).join("");
}

/* ---------- Mise en route ---------- */

function initCharges() {
  $("param-suivant").addEventListener("click", function () {
    lireEtape();
    if (etape === ETAPES.length - 1) return terminerParametrage();
    etape++;
    afficherEtape();
  });
  $("param-passer").addEventListener("click", function () {
    etape = Math.min(etape + 1, ETAPES.length - 1);
    afficherEtape();
  });
  $("param-retour").addEventListener("click", function () {
    lireEtape();
    etape = Math.max(0, etape - 1);
    afficherEtape();
  });
  $("param-quitter").addEventListener("click", function () {
    donnees.boutique.parametre = donnees.boutique.parametre || "passe";
    sauver();
    montrer(retourApres);
  });
  $("param-contenu").addEventListener("click", function (e) {
    const canal = e.target.closest("[data-canal]");
    const activite = e.target.closest("[data-activite]");
    const choix = canal || activite;
    if (choix) {
      const liste = canal ? brouillon.canaux : brouillon.activites;
      const cle = canal ? canal.dataset.canal : activite.dataset.activite;
      const i = liste.indexOf(cle);
      if (i === -1) liste.push(cle); else liste.splice(i, 1);
      choix.setAttribute("aria-pressed", String(i === -1));
      return;
    }
    const marge = e.target.closest("[data-marge]");
    if (marge) {
      $("param-marge").value = marge.dataset.marge;
      $("param-marge").dispatchEvent(new Event("input"));
      return;
    }
    const ajout = e.target.closest("[data-ajouter-charge]");
    if (ajout) {
      lireEtape();
      const type = ajout.dataset.ajouterCharge;
      brouillon.charges.push(nouvelleLigne({ nom: type === "impot" ? "Autre taxe" : "Autre charge", frequence: "mois" }, type));
      afficherEtape();
      const champs = document.querySelectorAll("#param-contenu .lc-nom");
      if (champs.length) { champs[champs.length - 1].focus(); champs[champs.length - 1].select(); }
      return;
    }
    const retrait = e.target.closest("[data-retirer-charge]");
    if (retrait) {
      lireEtape();
      brouillon.charges = brouillon.charges.filter(function (l) { return l.id !== retrait.dataset.retirerCharge; });
      afficherEtape();
    }
  });
  $("param-contenu").addEventListener("input", function (e) {
    if (e.target.id === "param-marge") {
      const m = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
      $("param-marge-aide").textContent = "Sur 1 000 F vendus, il te reste " + franc(Math.min(99, m) * 10) + ".";
    }
    if (e.target.classList.contains("lc-montant")) {
      const li = e.target.closest(".ligne-charge");
      const pourcent = li.querySelector(".lc-mode") && li.querySelector(".lc-mode").value === "pourcent";
      const chiffres = e.target.value.replace(/\D/g, "").slice(0, pourcent ? 2 : 9);
      e.target.value = chiffres ? (pourcent ? chiffres : nombre(Number(chiffres))) : "";
    }
  });
  $("param-contenu").addEventListener("change", function (e) {
    if (e.target.id === "param-logo") {
      const f = e.target.files && e.target.files[0];
      if (f) chargerLogo(f);
      e.target.value = "";
      return;
    }
    if (e.target.classList.contains("lc-mode")) {
      const li = e.target.closest(".ligne-charge");
      li.querySelector(".lc-frequence").hidden = e.target.value === "pourcent";
      li.querySelector(".lc-montant").value = "";
    }
  });

  $("vue-semaine").addEventListener("click", function (e) {
    const vue = e.target.closest("[data-bilan]");
    if (vue) {
      const mois = vue.dataset.bilan === "mois";
      document.querySelectorAll("[data-bilan]").forEach(function (b) { b.setAttribute("aria-pressed", String((b.dataset.bilan === "mois") === mois)); });
      $("vue-mois").hidden = !mois;
      $("vue-7jours").hidden = mois;
      if (mois) afficherMois(); else afficherSemaine();
      return;
    }
    const nav = e.target.closest("[data-mois]");
    if (nav && !nav.disabled) {
      const a = new Date();
      const ref = moisAffiche || { annee: a.getFullYear(), mois: a.getMonth() };
      const d = new Date(ref.annee, ref.mois + Number(nav.dataset.mois), 1);
      moisAffiche = { annee: d.getFullYear(), mois: d.getMonth() };
      afficherMois();
      return;
    }
    const p = e.target.closest("[data-parametrage]");
    if (p) ouvrirParametrage(Number(p.dataset.parametrage), "principal");
  });

  $("choix-charge-payee").addEventListener("click", function (e) {
    const b = e.target.closest("[data-charge-payee]");
    if (!b) return;
    chargeChoisie = chargeChoisie === b.dataset.chargePayee ? "" : b.dataset.chargePayee;
    document.querySelectorAll("[data-charge-payee]").forEach(function (x) {
      x.setAttribute("aria-pressed", String(x.dataset.chargePayee === chargeChoisie));
    });
    const l = (donnees.charges || []).find(function (x) { return x.id === chargeChoisie; });
    if (l && !$("montant").value && l.mode !== "pourcent") $("montant").value = nombre(l.montant);
    if (l && !$("note").value) $("note").value = l.nom;
  });

  $("ouvrir-parametrage").addEventListener("click", function () { ouvrirParametrage(0, "reglages"); });
  $("ouvrir-charges").addEventListener("click", function () { ouvrirParametrage(5, "reglages"); });
  $("rappel-parametrage-bouton").addEventListener("click", function () { ouvrirParametrage(0, "principal"); });
  $("rappel-parametrage-fermer").addEventListener("click", function () {
    donnees.boutique.parametre = "passe";
    sauver();
    afficher();
  });
}

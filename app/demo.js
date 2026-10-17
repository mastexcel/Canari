// Canari · LA BOUTIQUE DE DÉMONSTRATION.
//
// Demande du propriétaire (17/10/2026) : « créer une version de démo déjà
// renseignée avec des données pour convaincre un auditoire ».
//
// POURQUOI. Une appli de comptabilité vide ne montre rien : le tableau de bord
// est gris, les courbes sont plates, les comptes annuels sont à zéro. Devant un
// public — un investisseur, une banque, un commerçant à convaincre — il faut
// une boutique qui a vécu. Taper un an de ventes à la main avant chaque
// présentation est impossible : c'est donc Canari qui les écrit.
//
// TROIS GARANTIES, et elles comptent plus que les chiffres :
//   1. la démo est une ENTREPRISE À PART (voir entreprises.js). Les vraies
//      données du propriétaire ne sont jamais touchées, jamais mélangées ;
//   2. elle ne mange PAS une place de son abonnement. Sans cela, la démo
//      serait impossible pendant l'essai gratuit, où une seule entreprise est
//      permise — exactement le moment où l'on cherche à convaincre ;
//   3. elle se dit DÉMO partout : le nom porte « (démo) », un bandeau le
//      rappelle en haut de l'écran, et un bouton l'efface d'un coup. Personne
//      ne doit prendre ces chiffres pour les siens, ni relancer par erreur un
//      client qui n'existe pas.
//
// LES NUMÉROS SONT FAUX, ET VOLONTAIREMENT RECONNAISSABLES (07 00 00 00 xx) :
// pendant une démonstration, on touche « Relancer » — il ne faut surtout pas
// qu'un vrai inconnu reçoive le message.
//
// TOUT EST CALCULÉ, RIEN N'EST ÉCRIT EN DUR. Les chiffres sortent du même
// code que les vraies ventes : mêmes types de mouvements, mêmes prix de
// revient gardés à la vente, mêmes arrivages, mêmes dettes. Le tableau de
// bord, les comptes annuels et les états OHADA les lisent donc comme des
// vrais — sinon la démo mentirait, et une démo qui mente se voit.

const DEMO_JOURS = 420;          // un peu plus d'un an : deux années civiles pour les comptes pluriannuels
const DEMO_SUFFIXE = " (démo)";

function estEntrepriseDemo() {
  return !!(donnees.boutique && donnees.boutique.demo);
}

/* ---------- Le hasard, mais toujours le même ----------
   Une démo doit être reproductible : si le propriétaire montre l'appli deux
   fois, il doit retrouver les mêmes chiffres, et pouvoir préparer son discours
   dessus. On n'utilise donc pas Math.random. */
function demoHasard(graine) {
  let g = graine;
  const suivant = function () { g = (g * 1103515245 + 12345) % 2147483648; return g / 2147483648; };
  return {
    entre: function (a, b) { return a + Math.floor(suivant() * (b - a + 1)); },
    des: function () { return suivant(); },
    choix: function (t) { return t[Math.floor(suivant() * t.length)]; },
    chance: function (p) { return suivant() < p; }
  };
}

/* ---------- Les produits de la boutique ----------
   Une alimentation générale de quartier : ce que tout le monde reconnaît.
   « lot » est ce qu'on achète d'un coup (en unité d'achat), « rappro » le
   niveau de stock qui déclenche un arrivage, « poids » la part du produit
   dans les ventes. */
const DEMO_PRODUITS = [
  { cle: "riz",    nom: "Riz parfumé",        unite: "kg",        prix: 700,  cout: 550,  uniteAchat: "sac",     contenance: 50, prixAchatLot: 27500, seuil: 20, lot: 3,  rappro: 35, poids: 18, min: 1,  max: 5 },
  { cle: "huile",  nom: "Huile de palme",     unite: "litre",     prix: 1200, cout: 950,  uniteAchat: "bidon",   contenance: 20, prixAchatLot: 19000, seuil: 8,  lot: 2,  rappro: 12, poids: 12, min: 0.5, max: 3 },
  { cle: "sucre",  nom: "Sucre en morceaux",  unite: "paquet",    prix: 1000, cout: 800,  uniteAchat: "carton",  contenance: 20, prixAchatLot: 16000, seuil: 8,  lot: 2,  rappro: 12, poids: 10, min: 1,  max: 3 },
  { cle: "lait",   nom: "Lait en poudre",     unite: "boite",     prix: 2500, cout: 2000, uniteAchat: "carton",  contenance: 12, prixAchatLot: 24000, seuil: 5,  lot: 2,  rappro: 7,  poids: 8,  min: 1,  max: 2 },
  { cle: "savon",  nom: "Savon de ménage",    unite: "unite",     prix: 350,  cout: 260,  uniteAchat: "carton",  contenance: 30, prixAchatLot: 7800,  seuil: 15, lot: 3,  rappro: 25, poids: 11, min: 2,  max: 6 },
  { cle: "tomate", nom: "Tomate concentrée",  unite: "boite",     prix: 300,  cout: 220,  uniteAchat: "carton",  contenance: 50, prixAchatLot: 11000, seuil: 20, lot: 2,  rappro: 35, poids: 12, min: 2,  max: 8 },
  { cle: "pates",  nom: "Spaghetti",          unite: "paquet",    prix: 500,  cout: 380,  uniteAchat: "carton",  contenance: 20, prixAchatLot: 7600,  seuil: 10, lot: 2,  rappro: 15, poids: 9,  min: 1,  max: 4 },
  { cle: "eau",    nom: "Eau minérale 1,5 L", unite: "bouteille", prix: 400,  cout: 300,  uniteAchat: "pack",    contenance: 6,  prixAchatLot: 1800,  seuil: 18, lot: 8,  rappro: 28, poids: 10, min: 1,  max: 6 },
  { cle: "charbon",nom: "Charbon de bois",    unite: "sac",       prix: 2500, cout: 1800, seuil: 4,  lot: 10, rappro: 5,  poids: 6,  min: 1,  max: 2 }
];

// Le produit FABRIQUÉ : il fait vivre la fiche de coût, les intrants et
// « J'ai fabriqué » — trois écrans qui resteraient vides sans lui.
const DEMO_INTRANTS = [
  { cle: "bissap",     nom: "Bissap séché",        unite: "kg",     cout: 2500, seuil: 2,  lot: 5,  rappro: 3 },
  { cle: "sucre-i",    nom: "Sucre en poudre",     unite: "kg",     cout: 700,  seuil: 4,  lot: 10, rappro: 6 },
  { cle: "bouteilles", nom: "Bouteilles vides",    unite: "unite",  cout: 100,  seuil: 60, lot: 300, rappro: 90 },
  { cle: "eau-i",      nom: "Eau de production",   unite: "litre",  cout: 25,   seuil: 40, lot: 200, rappro: 60 }
];
const DEMO_RECETTE = [
  { cle: "bissap",     qte: 1 },
  { cle: "sucre-i",    qte: 2 },
  { cle: "bouteilles", qte: 30 },
  { cle: "eau-i",      qte: 20 },
  { nom: "Gaz",        qte: 1, unite: "forfait", prix: 500 }   // une ligne au forfait : elle ne se stocke pas
];
const DEMO_RENDEMENT = 30;       // une fournée donne 30 bouteilles

const DEMO_CLIENTS = [
  { nom: "Koffi Aka",        tel: "0700000001" },
  { nom: "Mariam Touré",     tel: "0700000002" },
  { nom: "Tante Adjoua",     tel: "0700000003" },
  { nom: "Yao Bernard",      tel: "0700000004" },
  { nom: "Fatou Diomandé",   tel: "0700000005" },
  { nom: "Monsieur Kouamé",  tel: "0700000006" },
  { nom: "Awa Coulibaly",    tel: "0700000007" },
  { nom: "Jean-Marc Zadi",   tel: "0700000008" },
  { nom: "Salimata Bakayoko",tel: "0700000009" },
  { nom: "Ibrahim Sangaré",  tel: "0700000010" },
  { nom: "Clarisse N'Guessan", tel: "0700000011" },
  { nom: "Vieux Soro",       tel: "0700000012" }
];

const DEMO_FOURNISSEURS = [
  { nom: "Grossiste Adjamé Soro", tel: "0700000020" },
  { nom: "Dépôt riz Koumassi",    tel: "0700000021" },
  { nom: "Marché Gouro",          tel: "" },
  { nom: "Boissons Yopougon",     tel: "0700000022" }
];

const DEMO_CHARGES = [
  { nom: "Loyer de la boutique",   type: "charge", frequence: "mois",    montant: 45000 },
  { nom: "Électricité",            type: "charge", frequence: "mois",    montant: 12000 },
  { nom: "Salaire de l'aide",      type: "charge", frequence: "mois",    montant: 60000 },
  { nom: "Transport marchandise",  type: "charge", frequence: "semaine", montant: 5000 },
  { nom: "Crédit téléphone",       type: "charge", frequence: "mois",    montant: 5000 },
  { nom: "Patente",                type: "impot",  frequence: "an",      montant: 35000 },
  { nom: "Taxe municipale",        type: "impot",  frequence: "mois",    montant: 3000 }
];

const DEMO_AUTRES_DEPENSES = [
  "Sachets et emballages", "Transport au marché", "Réparation de l'étagère",
  "Balai, eau de javel", "Pousse-pousse", "Ampoules", "Petit entretien du frigo"
];

const DEMO_INVESTS = [
  { nom: "Congélateur", montant: 180000, duree: 5,  ilYA: 240 },
  { nom: "Étagères métalliques", montant: 75000, duree: 10, ilYA: 390 },
  { nom: "Moto d'occasion pour les livraisons", montant: 250000, duree: 5, ilYA: 95 }
];

// Les moyens de paiement, avec leur part réelle : les espèces dominent, mais
// le mobile money prend de la place — c'est ce que la démo doit montrer.
const DEMO_MOYENS = [
  { k: "especes", part: 62 }, { k: "wave", part: 20 },
  { k: "orange", part: 11 },  { k: "mtn", part: 7 }
];

/* ---------- Le générateur ---------- */

function donneesDemo() {
  const h = demoHasard(20261017);
  let compteur = 0;
  const id = function () { return "demo" + (++compteur).toString(36); };
  const minuit = function (decalage) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime() - decalage * JOUR;
  };
  const jourIso = function (decalage) {
    return new Date(minuit(decalage) + 12 * 3600e3).toISOString().slice(0, 10);
  };
  /* LES SOLDES, MOYEN PAR MOYEN — ET ILS NE DESCENDENT PAS SOUS ZÉRO.
     La première version tirait le moyen de paiement au hasard et payait le
     loyer, les salaires et la maison en espèces quoi qu'il arrive. Résultat à
     l'écran : « Espèces − 760 750 F » pendant que le mobile money s'entassait.
     Or Canari promet justement l'inverse — « la caisse ne peut jamais être
     négative » — et c'est l'un des arguments de la démonstration. Un chiffre
     qui contredit la promesse qu'on est en train de faire vaut mieux ne pas
     être montré du tout.
     La démo se comporte donc comme un vrai commerçant : elle encaisse où le
     client paie, et elle paie avec un compte qui a de quoi. */
  const solde = { especes: 200000, wave: 250000, orange: 0, mtn: 0, moov: 0, djamo: 0 };
  /* 40 000 F et non 15 000 : les mouvements d'une même journée ne sont pas
     écrits dans l'ordre exact des heures (les arrivages le matin, les ventes,
     puis les charges), et une fois tout remis dans l'ordre un compte pouvait
     passer sous zéro pendant quelques heures. Cette marge l'évite. */
  const GARDE = 40000;

  // Un ENCAISSEMENT : le client choisit, pas la boutique.
  const moyen = function () {
    let n = h.entre(1, 100), cumul = 0;
    let k = "especes";
    for (let i = 0; i < DEMO_MOYENS.length; i++) {
      cumul += DEMO_MOYENS[i].part;
      if (n <= cumul) { k = DEMO_MOYENS[i].k; break; }
    }
    solde[k] += 0;   // le montant est ajouté par entrer()
    return k;
  };
  const entrer = function (k, n) { solde[k] = (solde[k] || 0) + n; };

  const plusGarni = function () {
    return Object.keys(solde).reduce(function (a, k) { return solde[k] > solde[a] ? k : a; }, "especes");
  };

  // Une SORTIE : on paie avec un compte qui a de quoi, les espèces d'abord
  // (c'est ce que fait un commerçant), sinon le compte le mieux garni.
  const sortir = function (n, prefere) {
    /* Les espèces d'abord, puis les comptes du mieux garni au moins garni.
       Sans ce classement, MTN (7 % des encaissements) ne servait jamais à
       payer et finissait par être le compte le plus riche de la boutique —
       ce qu'aucun commerçant ne laisserait arriver. */
    const parSolde = ["wave", "orange", "mtn", "especes"].sort(function (a, b) { return solde[b] - solde[a]; });
    const ordre = [prefere || "especes", "especes"].concat(parSolde);
    let choisi = "";
    // Premier tour : un compte qui couvre la sortie ET garde sa marge.
    for (let i = 0; i < ordre.length && !choisi; i++) {
      const k = ordre[i];
      if (k && solde[k] >= n + GARDE) choisi = k;
    }
    // Deuxième tour : un compte qui couvre la sortie, marge ou pas. C'est ce
    // que fait un commerçant un jour difficile — et ça évite d'aller taper
    // dans un compte qui n'a pas de quoi.
    for (let i = 0; i < ordre.length && !choisi; i++) {
      const k = ordre[i];
      if (k && solde[k] >= n) choisi = k;
    }
    if (!choisi) {
      // Rien n'a assez : on prend le mieux garni. Ça n'arrive qu'au tout
      // début, avant que les ventes n'aient rempli les comptes.
      choisi = Object.keys(solde).reduce(function (a, k) { return solde[k] > solde[a] ? k : a; }, "especes");
    }
    solde[choisi] -= n;
    return choisi;
  };
  const arrondir = function (n, pas) { return Math.round(n / pas) * pas; };

  const d = {
    mouvements: [], clients: {}, fournisseurs: {}, meta: {},
    produits: {}, intrants: {}, charges: [], compteurs: { facture: 0, recu: 0 }, boutique: {}
  };

  /* --- La boutique --- */
  d.boutique = {
    demo: true,
    // Le questionnaire de départ est déjà répondu : sans ce drapeau, le
    // bandeau « Calcule ton vrai bénéfice net : 6 petites questions »
    // s'affiche sur une boutique qui a pourtant ses charges et sa marge.
    parametre: true,
    nom: "Boutique Awa" + DEMO_SUFFIXE,
    tel: "0700000000",
    adresse: "Cocody Angré, 8e tranche · Abidjan",
    rccm: "CI-ABJ-03-2024-B12-04518",
    dfe: "2419870 K",
    devise: "XOF", symbole: "",
    merci: "Merci pour ta confiance !",
    canaux: ["boutique"],
    activites: ["revente", "fabrication"],
    marge: 28,
    joursTravail: 26,
    gardeCaisse: true,
    paiements: {
      wave:   { actif: true, tel: "0700000000", lien: "" },
      orange: { actif: true, tel: "0700000000", lien: "" },
      mtn:    { actif: true, tel: "0700000000", lien: "" }
    },
    depart: { especes: 200000, wave: 250000 }
  };
  DEMO_CHARGES.forEach(function (c) {
    d.charges.push({ id: id(), nom: c.nom, type: c.type, mode: "fixe", frequence: c.frequence, montant: c.montant, taux: 0 });
  });

  /* --- Les clients et les fournisseurs --- */
  DEMO_CLIENTS.forEach(function (c, i) {
    d.clients[c.tel] = { tel: c.tel, nom: c.nom, depuis: minuit(DEMO_JOURS - i * 9) };
  });
  DEMO_FOURNISSEURS.forEach(function (f) {
    d.fournisseurs[cleFournisseur(f.nom)] = { nom: f.nom, tel: f.tel };
  });

  /* --- Les produits, les intrants, la recette --- */
  const parCle = {};
  DEMO_PRODUITS.forEach(function (m) {
    const p = {
      id: id(), nom: m.nom, unite: m.unite, prix: m.prix, cout: m.cout,
      type: "revente", suivi: true, seuil: m.seuil
    };
    if (m.uniteAchat) { p.uniteAchat = m.uniteAchat; p.contenance = m.contenance; p.prixAchatLot = m.prixAchatLot; }
    d.produits[p.id] = p;
    parCle[m.cle] = p;
  });
  DEMO_INTRANTS.forEach(function (m) {
    const i = { id: id(), nom: m.nom, unite: m.unite, cout: m.cout, seuil: m.seuil };
    d.intrants[i.id] = i;
    parCle[m.cle] = i;
  });
  const recette = DEMO_RECETTE.map(function (l) {
    if (l.cle) {
      const i = parCle[l.cle];
      return { id: id(), nom: i.nom, qte: l.qte, unite: i.unite, prix: i.cout, intrantId: i.id };
    }
    return { id: id(), nom: l.nom, qte: l.qte, unite: l.unite, prix: l.prix };
  });
  const jus = {
    id: id(), nom: "Jus de bissap", unite: "bouteille", prix: 500, type: "fabrication",
    suivi: true, seuil: 20,
    fiche: { lignes: recette, rendement: DEMO_RENDEMENT }
  };
  jus.cout = Math.round(recette.reduce(function (s, l) { return s + l.qte * l.prix; }, 0) / DEMO_RENDEMENT * 100) / 100;
  d.produits[jus.id] = jus;
  parCle.jus = jus;

  // Le jus se vend comme les autres : on l'ajoute à la table des ventes.
  const vendables = DEMO_PRODUITS.map(function (m) {
    return { p: parCle[m.cle], modele: m };
  });
  vendables.push({ p: jus, modele: { cle: "jus", poids: 10, min: 1, max: 4 } });
  const poidsTotal = vendables.reduce(function (s, v) { return s + v.modele.poids; }, 0);

  /* --- Le stock de départ (le jour où la boutique commence Canari) --- */
  const stock = {};
  const stockI = {};
  const depart = minuit(DEMO_JOURS) + 8 * 3600e3;
  DEMO_PRODUITS.forEach(function (m) {
    const p = parCle[m.cle];
    const q = Math.round(m.rappro * 2.2 * 10) / 10;
    stock[p.id] = q;
    d.mouvements.push({ id: id(), type: "stock", produitId: p.id, quantite: q, raison: "depart", note: p.nom, montant: 0, client: "", t: depart });
  });
  stock[jus.id] = 40;
  d.mouvements.push({ id: id(), type: "stock", produitId: jus.id, quantite: 40, raison: "depart", note: jus.nom, montant: 0, client: "", t: depart });
  DEMO_INTRANTS.forEach(function (m) {
    const i = parCle[m.cle];
    stockI[i.id] = m.rappro * 2;
    d.mouvements.push({ id: id(), type: "intrant", intrantId: i.id, quantite: m.rappro * 2, raison: "depart", note: i.nom, montant: 0, client: "", t: depart });
  });

  /* --- Les dettes des clients, suivies au fil des jours ---
     Un client ne doit pas « rien » puis « tout » : il achète à crédit, puis
     rembourse un peu plus tard. On garde donc ce que chacun doit. */
  const doit = {};
  DEMO_CLIENTS.forEach(function (c) { doit[c.tel] = 0; });

  // Ce que l'on doit aux fournisseurs, pour ne jamais payer plus que dû.
  const dette = {};
  DEMO_FOURNISSEURS.forEach(function (f) { dette[cleFournisseur(f.nom)] = 0; });

  const arrivageDe = function (v, t) {
    const m = v.modele, p = v.p;
    const qte = m.uniteAchat ? m.lot * m.contenance : m.lot;
    const total = m.uniteAchat ? m.lot * m.prixAchatLot : Math.round(m.lot * m.cout);
    const a = {
      id: id(), type: "stock", produitId: p.id, quantite: qte, raison: "arrivage",
      note: p.nom, montant: 0, client: "", t: t
    };
    if (m.uniteAchat) { a.qteAchat = m.lot; a.uniteAchat = m.uniteAchat; }
    d.mouvements.push(a);
    stock[p.id] = Math.round((stock[p.id] + qte) * 1000) / 1000;
    // « Tu l'as payé ? » : tout payé, à crédit, ou payé en partie.
    const libelle = "Achat : " + p.nom;
    const f = DEMO_FOURNISSEURS[h.entre(0, 2)];
    const cle = cleFournisseur(f.nom);
    const tirage = h.des();
    if (tirage < 0.6) {
      d.mouvements.push({ id: id(), type: "depense", categorie: "marchandise", montant: total, note: libelle, client: "", moyen: sortir(total), t: t + 60e3 });
    } else if (tirage < 0.85) {
      const verse = arrondir(total * 0.4, 500);
      d.mouvements.push({ id: id(), type: "fdette", montant: total, verse: verse, note: libelle, client: f.nom, fournisseurId: cle, moyen: sortir(verse), t: t + 60e3 });
      dette[cle] += total - verse;
    } else {
      d.mouvements.push({ id: id(), type: "fdette", montant: total, verse: 0, note: libelle, client: f.nom, fournisseurId: cle, t: t + 60e3 });
      dette[cle] += total;
    }
  };

  /* LES VENTES « AU MONTANT » DOIVENT ÊTRE ACHETÉES, ELLES AUSSI.
     Une vente notée par produits consomme le stock, donc elle a son arrivage
     et sa dépense de marchandise. Une vente notée juste au montant, non : la
     première version de la démo vendait donc 5 millions de marchandise que
     personne n'avait achetée. Deux chiffres mentaient d'un coup — la caisse
     grimpait à 4 millions et demi, et la marge commerciale des états OHADA
     (qui se calcule sur les achats RÉELS, pas sur le prix de revient gardé
     dans la vente) montait à 53 % au lieu de 28 %. On met donc de côté le
     prix de revient de ces ventes, et on l'achète pour de vrai au marché
     dès qu'il y en a pour un plein panier. */
  let aAcheter = 0;
  const acheterAuMarche = function (t) {
    if (aAcheter < 25000) return;
    const total = arrondir(aAcheter, 100);
    aAcheter = 0;
    d.mouvements.push({
      id: id(), type: "depense", categorie: "marchandise", montant: total,
      note: "Achat marchandise au marché", client: "", moyen: sortir(total), t: t
    });
  };

  const achatIntrant = function (m, t) {
    const i = parCle[m.cle];
    const total = Math.round(m.lot * m.cout);
    d.mouvements.push({ id: id(), type: "intrant", intrantId: i.id, quantite: m.lot, raison: "achat", note: i.nom, montant: 0, client: "", t: t });
    stockI[i.id] = Math.round((stockI[i.id] + m.lot) * 1000) / 1000;
    d.mouvements.push({ id: id(), type: "depense", categorie: "marchandise", montant: total, note: "Achat : " + i.nom, client: "", moyen: sortir(total), t: t + 60e3 });
  };

  /* --- Le cœur : un an de journées --- */
  for (let j = DEMO_JOURS; j >= 0; j--) {
    const date = new Date(minuit(j));
    const semaine = date.getDay();
    const base = minuit(j);

    /* Les investissements, à leur date : le matériel sert des années, mais
       l'argent sort ce jour-là. Ils sont placés DANS la boucle pour que la
       sortie se fasse sur le solde du moment — posés avant, la moto à
       350 000 F était payée avec la caisse du tout premier jour. */
    DEMO_INVESTS.forEach(function (v) {
      if (v.ilYA !== j || v.ilYA > DEMO_JOURS) return;
      d.mouvements.push({
        id: id(), type: "invest", montant: v.montant, duree: v.duree, note: v.nom,
        client: "", // Un gros achat se paie avec le compte le mieux garni : c'est le seul
        // qui puisse le couvrir en entier.
        moyen: sortir(v.montant, v.montant >= 100000 ? plusGarni() : "especes"),
        t: base + 10 * 3600e3
      });
    });

    // Fermé la plupart des dimanches.
    if (semaine === 0 && h.chance(0.8)) continue;

    // La boutique grandit doucement sur l'année (+ 30 %), et le samedi fait
    // toujours plus que le mardi : une courbe plate n'apprend rien à personne.
    const croissance = 1 + 0.3 * ((DEMO_JOURS - j) / DEMO_JOURS);
    const jourSemaine = [0.8, 0.9, 0.85, 0.95, 1, 1.15, 1.3][semaine];
    const souffle = 0.85 + h.des() * 0.3;
    const nbVentes = Math.max(3, Math.round(11 * croissance * jourSemaine * souffle));

    // Les arrivages d'abord : on ne vend pas ce qu'on n'a pas.
    acheterAuMarche(base + 7 * 3600e3 + 10 * 60e3);
    vendables.forEach(function (v) {
      if (v.modele.cle === "jus") return;
      if (stock[v.p.id] <= v.modele.rappro) arrivageDe(v, base + 7 * 3600e3 + h.entre(0, 60) * 60e3);
    });
    DEMO_INTRANTS.forEach(function (m) {
      const i = parCle[m.cle];
      if (stockI[i.id] <= m.rappro) achatIntrant(m, base + 7 * 3600e3 + h.entre(0, 60) * 60e3);
    });

    // Une fournée de jus quand il en reste peu.
    if (stock[jus.id] < 25) {
      const conso = DEMO_RECETTE.filter(function (l) { return l.cle; }).map(function (l) {
        return { intrantId: parCle[l.cle].id, qte: l.qte };
      });
      const assez = conso.every(function (c) { return stockI[c.intrantId] >= c.qte; });
      if (assez) {
        conso.forEach(function (c) { stockI[c.intrantId] = Math.round((stockI[c.intrantId] - c.qte) * 1000) / 1000; });
        stock[jus.id] += DEMO_RENDEMENT;
        d.mouvements.push({
          id: id(), type: "stock", produitId: jus.id, quantite: DEMO_RENDEMENT, raison: "production",
          note: jus.nom, montant: 0, client: "", consommation: conso, t: base + 6 * 3600e3
        });
      }
    }

    /* Les ventes de la journée */
    for (let v = 0; v < nbVentes; v++) {
      const t = base + (8 + Math.floor(v * 11 / nbVentes)) * 3600e3 + h.entre(0, 59) * 60e3;
      const parProduits = h.chance(0.62);
      let montant = 0, lignes = null, cout = 0;

      if (parProduits) {
        lignes = [];
        const nbLignes = h.chance(0.45) ? 1 : h.chance(0.7) ? 2 : 3;
        const pris = {};
        for (let l = 0; l < nbLignes; l++) {
          // Tirage au poids : le riz part plus souvent que le charbon.
          let n = h.des() * poidsTotal, choisi = vendables[0];
          for (let k = 0; k < vendables.length; k++) {
            n -= vendables[k].modele.poids;
            if (n <= 0) { choisi = vendables[k]; break; }
          }
          if (pris[choisi.p.id]) continue;
          const m = choisi.modele;
          let qte = m.unite === "litre" || choisi.p.unite === "litre"
            ? Math.round((m.min + h.des() * (m.max - m.min)) * 2) / 2
            : h.entre(Math.ceil(m.min), m.max);
          if (qte <= 0) qte = 1;
          if (stock[choisi.p.id] < qte) continue;
          pris[choisi.p.id] = true;
          stock[choisi.p.id] = Math.round((stock[choisi.p.id] - qte) * 1000) / 1000;
          const ligne = { produitId: choisi.p.id, nom: choisi.p.nom, unite: choisi.p.unite, prix: choisi.p.prix, qte: qte, cout: choisi.p.cout };
          // Un jus vendu consomme… rien de plus : il a déjà été fabriqué.
          lignes.push(ligne);
          montant += Math.round(choisi.p.prix * qte);
          cout += choisi.p.cout * qte;
        }
        if (!lignes.length) continue;
        cout = Math.round(cout);
      } else {
        montant = arrondir(600 + h.des() * h.des() * 11000, 50);
        cout = Math.round(montant * (1 - 28 / 100));
        aAcheter += cout;
      }

      const mv = {
        id: id(), type: "vente", montant: montant, encaisse: montant,
        note: "", client: "", t: t
      };
      if (lignes) mv.lignes = lignes; else mv.cout = cout;

      // Une vente sur dix laisse un reste à crédit : c'est le cœur du produit.
      if (h.chance(0.1)) {
        const c = DEMO_CLIENTS[h.entre(0, DEMO_CLIENTS.length - 1)];
        const toutACredit = h.chance(0.45);
        mv.encaisse = toutACredit ? 0 : arrondir(montant * (0.2 + h.des() * 0.4), 100);
        if (mv.encaisse >= montant) mv.encaisse = 0;
        mv.client = c.nom;
        mv.clientId = c.tel;
        doit[c.tel] += montant - mv.encaisse;
      }
      if (mv.encaisse > 0) { mv.moyen = moyen(); entrer(mv.moyen, mv.encaisse); }
      d.compteurs.facture++;
      mv.numero = d.compteurs.facture;
      d.mouvements.push(mv);
    }

    /* Les remboursements des clients */
    DEMO_CLIENTS.forEach(function (c) {
      if (doit[c.tel] <= 0 || !h.chance(0.085)) return;
      const tout = h.chance(0.55);
      const somme = tout ? doit[c.tel] : Math.max(500, arrondir(doit[c.tel] * (0.3 + h.des() * 0.4), 500));
      const regle = Math.min(somme, doit[c.tel]);
      doit[c.tel] -= regle;
      d.compteurs.recu++;
      d.mouvements.push({
        id: id(), type: "paye", montant: regle, encaisse: regle, note: "", client: c.nom,
        clientId: c.tel, numero: d.compteurs.recu, moyen: (function () { const k = moyen(); entrer(k, regle); return k; })(), t: base + h.entre(9, 18) * 3600e3
      });
    });

    /* Les dépenses du jour : charges prévues, impôts, autres dépenses */
    const dernierDuMois = new Date(base + JOUR).getDate() === 1;
    if (date.getDate() === 3) {
      ["Loyer de la boutique", "Électricité", "Crédit téléphone"].forEach(function (nom, i) {
        const l = d.charges.find(function (x) { return x.nom === nom; });
        d.mouvements.push({
          id: id(), type: "depense", categorie: "charge", chargeId: l.id, montant: l.montant,
          note: nom, client: "", moyen: sortir(l.montant), t: base + 11 * 3600e3 + i * 60e3
        });
      });
    }
    if (dernierDuMois) {
      const salaire = d.charges.find(function (x) { return x.nom === "Salaire de l'aide"; });
      d.mouvements.push({
        id: id(), type: "depense", categorie: "charge", chargeId: salaire.id, montant: salaire.montant,
        note: "Salaire de l'aide", client: "", moyen: sortir(salaire.montant), t: base + 17 * 3600e3
      });
      const taxe = d.charges.find(function (x) { return x.nom === "Taxe municipale"; });
      d.mouvements.push({
        id: id(), type: "depense", categorie: "impot", chargeId: taxe.id, montant: taxe.montant,
        note: "Taxe municipale", client: "", moyen: sortir(taxe.montant), t: base + 17 * 3600e3 + 60e3
      });
    }
    // La patente, une fois dans l'année.
    if (date.getMonth() === 0 && date.getDate() === 15) {
      const patente = d.charges.find(function (x) { return x.nom === "Patente"; });
      d.mouvements.push({
        id: id(), type: "depense", categorie: "impot", chargeId: patente.id, montant: patente.montant,
        note: "Patente de l'année", client: "", moyen: sortir(patente.montant, "wave"), t: base + 10 * 3600e3
      });
    }
    if (semaine === 1) {
      const transport = d.charges.find(function (x) { return x.nom === "Transport marchandise"; });
      d.mouvements.push({
        id: id(), type: "depense", categorie: "charge", chargeId: transport.id, montant: 5000,
        note: "Transport marchandise", client: "", moyen: sortir(5000), t: base + 7 * 3600e3 + 30 * 60e3
      });
    }
    if (h.chance(0.45)) {
      const petite = arrondir(500 + h.des() * 4000, 100);
      d.mouvements.push({
        id: id(), type: "depense", categorie: "autre", montant: petite,
        note: h.choix(DEMO_AUTRES_DEPENSES), client: "", moyen: sortir(petite), t: base + h.entre(9, 18) * 3600e3
      });
    }

    /* Un paiement au fournisseur, quand on lui doit quelque chose */
    DEMO_FOURNISSEURS.forEach(function (f) {
      const cle = cleFournisseur(f.nom);
      if (dette[cle] <= 0 || !h.chance(0.07)) return;
      const somme = h.chance(0.35) ? dette[cle] : Math.max(1000, arrondir(dette[cle] * 0.5, 500));
      const regle = Math.min(somme, dette[cle]);
      dette[cle] -= regle;
      d.mouvements.push({
        id: id(), type: "fpaye", montant: regle, note: "", client: f.nom, fournisseurId: cle,
        moyen: sortir(regle), t: base + h.entre(8, 17) * 3600e3
      });
    });

    /* Pris pour la maison : deux à trois fois par semaine (la séparation
       boutique / maison est l'un de nos avantages : elle doit se voir). */
    if (h.chance(0.40)) {
      const pourLaMaison = arrondir(2000 + h.des() * 8000, 500);
      d.mouvements.push({
        id: id(), type: "maison", montant: pourLaMaison,
        note: h.choix(["Marché du soir", "Écolage", "Transport", "Ordonnance", "Dépense maison"]),
        client: "", moyen: sortir(pourLaMaison), t: base + h.entre(12, 19) * 3600e3
      });
    }
  }

  /* --- Les relances : des clients à chaque étage du classement ---
     « À relancer aujourd'hui », « A promis de payer », « déjà relancé » :
     l'onglet Relances doit montrer les quatre familles, sinon la démo
     n'explique pas la fonctionnalité la plus différenciante de Canari. */
  const doivent = DEMO_CLIENTS.filter(function (c) { return doit[c.tel] > 0; });
  doivent.forEach(function (c, i) {
    const s = { promesse: "", relances: [] };
    if (i % 4 === 1) {
      s.promesse = jourIso(-h.entre(2, 9));                       // promesse à venir
    } else if (i % 4 === 2) {
      s.promesse = jourIso(h.entre(2, 6));                        // promesse dépassée : urgent
      s.relances = [minuit(h.entre(10, 20))];
    } else if (i % 4 === 3) {
      s.relances = [minuit(h.entre(1, 3))];                       // relancé tout récemment
    }
    d.meta[c.tel] = s;
  });

  /* --- L'ALERTE « À RACHETER » DOIT AVOIR QUELQUE CHOSE À DIRE ---
     Sans cela, l'onglet Stock affiche « À racheter 0 » et l'une des
     fonctionnalités que le commerçant comprend le plus vite ne se montre
     pas. On ne fabrique aucun mouvement pour ça : on règle simplement
     l'alerte de deux produits juste au-dessus de ce qu'il en reste — c'est
     exactement ce que fait un commerçant qui veut être prévenu plus tôt. */
  ["riz", "lait"].forEach(function (cle) {
    const p = parCle[cle];
    const reste = stock[p.id];
    if (reste > 0) p.seuil = Math.ceil(reste * 1.25);
  });

  d.mouvements.sort(function (a, b) { return a.t - b.t; });
  return d;
}

/* ---------- Créer, ouvrir, retirer la démonstration ---------- */

// La démo est une entreprise à part, et elle ne mange pas une place de
// l'abonnement (voir entreprises.js, entreprisesAutorisees).
function cleDemoExistante() {
  const e = listeEntreprises().find(function (x) { return x.demo; });
  return e ? e.cle : "";
}

function creerDemo() {
  const deja = cleDemoExistante();
  if (deja) return basculerVers(deja);

  const cle = "demo-" + Date.now().toString(36);
  sauver();
  majNomEntreprise();
  indexEntreprises.liste.push({ cle: cle, nom: "Boutique Awa" + DEMO_SUFFIXE, cree: Date.now(), demo: true });
  indexEntreprises.actif = cle;
  cleDossier = cle;
  enregistrerEntreprises();
  versionDonnees++;
  const abonnement = donnees.abonnement;      // l'abonnement est commun au téléphone
  donnees = donneesDemo();
  if (abonnement) donnees.abonnement = JSON.parse(JSON.stringify(abonnement));
  completerDonnees();
  completerAbonnement();
  sauver();
  appliquerDevise();
  fermerFeuilles();
  montrer("principal");
  afficher();
  message("La boutique de démonstration est prête : un an de ventes, de crédits et de charges.", null, true);
  return Promise.resolve(true);
}

// Refaire la démo à neuf (après l'avoir montrée et touchée pendant la
// présentation) : on efface les mouvements et on régénère.
function refaireDemo() {
  if (!estEntrepriseDemo()) return;
  if (!window.confirm(tr("Remettre la boutique de démonstration à neuf ? Ce qui a été noté pendant la présentation sera effacé."))) return;
  const abonnement = donnees.abonnement;
  versionDonnees++;
  donnees = donneesDemo();
  if (abonnement) donnees.abonnement = JSON.parse(JSON.stringify(abonnement));
  completerDonnees();
  completerAbonnement();
  sauver();
  fermerFeuilles();
  montrer("principal");
  afficher();
  message("La démonstration est repartie à neuf.", null, true);
}

function retirerDemo() {
  const cle = cleDemoExistante();
  if (!cle) return;
  if (!window.confirm(tr("Retirer la boutique de démonstration ? Tes vraies entreprises ne sont pas touchées."))) return;
  const etaitActive = cle === indexEntreprises.actif;
  indexEntreprises.liste = indexEntreprises.liste.filter(function (x) { return x.cle !== cle; });
  if (etaitActive) indexEntreprises.actif = indexEntreprises.liste[0].cle;
  enregistrerEntreprises();
  if (modeStockage === "base") ecrireBase(cle, null).catch(function () { /* rien */ });
  try { localStorage.removeItem(cleLocaleDossier(cle)); } catch (e) { /* rien */ }
  try { localStorage.removeItem(CLE_DERNIERE_SAUVEGARDE + "." + cle); } catch (e) { /* rien */ }
  if (!etaitActive) {
    if (!$("reglages").hidden) afficherReglages();
    afficherEntreprises();
    message("La démonstration est retirée.", null, true);
    return;
  }
  cleDossier = indexEntreprises.actif;
  versionDonnees++;
  chargerDonnees().then(function (dd) {
    donnees = dd || { mouvements: [], clients: {}, fournisseurs: {}, meta: {} };
    completerDonnees();
    completerAbonnement();
    appliquerDevise();
    fermerFeuilles();
    montrer("principal");
    afficher();
    message("La démonstration est retirée. Tu retrouves tes vrais chiffres.", null, true);
  });
}

/* ---------- Le bandeau « démonstration » ----------
   Il doit être visible sans être joli : pendant une présentation on l'oublie,
   et après on croit que ce sont ses propres chiffres. */
function majBandeauDemo() {
  const b = $("bandeau-demo");
  if (!b) return;
  b.hidden = !estEntrepriseDemo();
}

function afficherReglagesDemo() {
  const carte = $("carte-demo");
  if (!carte) return;
  const demo = estEntrepriseDemo();
  const existe = !!cleDemoExistante();
  $("demo-etat").textContent = demo
    ? "Tu es dans la boutique de démonstration. Tes vrais chiffres sont intacts dans tes autres entreprises."
    : existe
      ? "La boutique de démonstration est prête. Tu peux l'ouvrir quand tu veux."
      : "Une boutique d'exemple avec un an de ventes, de crédits clients, de dettes fournisseurs, de charges et de matériel. Parfaite pour montrer Canari à quelqu'un.";
  $("demo-ouvrir").hidden = demo;
  $("demo-ouvrir").textContent = existe ? tr("Ouvrir la démonstration") : tr("Créer la démonstration");
  $("demo-refaire").hidden = !demo;
  $("demo-retirer").hidden = !existe;
}

function initDemo() {
  const brancher = function (cle, fn) { const b = $(cle); if (b) b.addEventListener("click", fn); };
  brancher("demo-ouvrir", function () { creerDemo(); });
  brancher("demo-refaire", refaireDemo);
  brancher("demo-retirer", retirerDemo);
  brancher("demo-quitter", function () {
    const autre = listeEntreprises().find(function (x) { return !x.demo; });
    if (autre) basculerVers(autre.cle);
  });
  majBandeauDemo();
}

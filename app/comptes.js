// Canari · Comptes annuels : bilan, compte de résultat, analyse et conseils.
//
// Demande du propriétaire (05/10/2026) : « une page qui permet de générer le
// bilan et le compte de résultat annuel et pluriannuel, accompagnés d'une
// analyse financière détaillée avec graphiques, ratios et conseils indicatifs ».
//
// Ce que fait cette page, en français de tous les jours :
//   · le COMPTE DE RÉSULTAT répond à « combien ai-je gagné cette année ? ».
//     Il part des ventes et enlève, une par une, toutes les choses qui coûtent,
//     jusqu'au bénéfice net ;
//   · le BILAN répond à « que vaut ma boutique aujourd'hui ? ». D'un côté ce
//     qu'elle possède (l'argent, la marchandise, ce qu'on lui doit, le
//     matériel), de l'autre ce qu'elle doit, et la différence : ce qui est
//     vraiment à elle ;
//   · les RATIOS sont des petits calculs qui comparent deux chiffres entre eux.
//     Un chiffre seul ne dit rien ; « 30 % de marge » dit tout ;
//   · l'ANALYSE écrit en phrases ce que les chiffres racontent, et les CONSEILS
//     disent quoi faire. Ils sont indicatifs : Canari n'est pas un comptable.
//
// Deux vues : UNE ANNÉE (le détail), ou PLUSIEURS ANNÉES côte à côte (jusqu'à
// cinq colonnes) pour voir ce qui monte et ce qui descend.
//
// Trois approximations, dites honnêtement à l'écran (« Ce que Canari sait et
// ne sait pas »), parce qu'un chiffre faux présenté comme vrai est pire que
// pas de chiffre du tout :
//   1. les charges fixes et les taxes d'une année passée sont réparties avec
//      les montants d'AUJOURD'HUI (Canari ne garde pas l'historique des
//      réglages) ;
//   2. le stock est compté au prix d'achat moyen d'aujourd'hui ;
//   3. l'argent en caisse d'une année passée part de l'argent de départ déclaré
//      dans les Réglages.

const ANNEES_COMPTES = 5;              // au-delà, les colonnes deviennent illisibles
const CLE_ANNEE_COMPTES = "canari.anneeComptes";
const CLE_VUE_COMPTES = "canari.vueComptes";

let anneeComptes = 0;                  // 0 = l'année en cours
let vueComptes = "annee";              // "annee" ou "pluriannuel"

/* =======================================================================
   1. LES ANNÉES DISPONIBLES
   ======================================================================= */

// De la première année notée à l'année en cours, sans dépasser cinq colonnes.
function anneesComptables() {
  return memo("anneesComptables", function () {
    const maintenant = new Date().getFullYear();
    const premier = donnees.mouvements.reduce(function (min, m) { return Math.min(min, m.t); }, Infinity);
    const premiere = premier === Infinity ? maintenant : new Date(premier).getFullYear();
    const depart = Math.max(premiere, maintenant - ANNEES_COMPTES + 1);
    const liste = [];
    for (let a = depart; a <= maintenant; a++) liste.push(a);
    return liste;
  });
}
function anneeChoisie() {
  const liste = anneesComptables();
  return liste.indexOf(anneeComptes) !== -1 ? anneeComptes : liste[liste.length - 1];
}

/* =======================================================================
   2. LE COMPTE DE RÉSULTAT D'UNE ANNÉE
   ======================================================================= */

// La cascade, dans l'ordre où on la lit :
//   ventes − prix de revient               = marge brute
//   − autres dépenses − charges fixes
//   − usure du matériel                    = résultat avant impôts
//   − impôts et taxes                      = bénéfice net
// Chaque jour porte déjà sa part (voir calculTotauxDuJour dans app.js) : une
// année n'est que la somme de ses jours.
function exerciceDe(annee) {
  return memo("exercice-" + annee, function () { return calculExercice(annee); });
}
function calculExercice(annee) {
  const debut = new Date(annee, 0, 1, 0, 0, 0, 0).getTime();
  const finAnnee = new Date(annee, 11, 31, 23, 59, 59, 999).getTime();
  const fin = Math.min(finAnnee, Date.now());
  const e = {
    annee: annee, debut: debut, fin: fin, finAnnee: finAnnee,
    enCours: finAnnee > Date.now(),
    ventes: 0, cout: 0, margeBrute: 0,
    autresDepenses: 0, chargesFixes: 0, impots: 0, usure: 0,
    resultatAvantImpots: 0, resultatNet: 0,
    encaisse: 0, sorti: 0, aCredit: 0, maison: 0, achats: 0, investi: 0,
    joursVente: 0, joursNotes: 0, nbVentes: 0
  };
  const dernier = debutJour(fin);
  for (let t = debutJour(debut); t <= dernier; t += JOUR) {
    const cle = cleJour(t);
    const lignes = mouvementsDuJour(cle);
    if (!lignes.length) continue;
    const d = totauxDuJour(cle);
    e.joursNotes++;
    if (d.vendu > 0) e.joursVente++;
    e.ventes += d.vendu;
    e.cout += d.cout;
    e.autresDepenses += d.depenses;
    e.chargesFixes += d.partCharges;
    e.impots += d.partImpots;
    e.usure += d.usure;
    e.encaisse += d.encaisse;
    e.sorti += d.sorti;
    e.aCredit += d.aCredit;
    e.maison += d.maison;
    lignes.forEach(function (m) {
      if (m.type === "vente" || m.type === "credit") { if (m.montant > 0) e.nbVentes++; }
      else if (m.type === "depense" && (m.categorie === "marchandise" || estMarchandise(m))) e.achats += m.montant;
      else if (m.type === "fdette") e.achats += m.montant;
      else if (m.type === "invest") e.investi += m.montant;
    });
  }
  e.margeBrute = e.ventes - e.cout;
  e.resultatAvantImpots = e.margeBrute - e.autresDepenses - e.chargesFixes - e.usure;
  e.resultatNet = e.resultatAvantImpots - e.impots;
  e.resteBoutique = e.resultatNet - e.maison;
  e.vide = e.joursNotes === 0;
  return e;
}

// Les ventes d'une année, du 1er janvier jusqu'à une date. Sert à comparer
// honnêtement une année en cours avec la même tranche de l'année d'avant.
function ventesTranche(annee, jusqua) {
  return memo("tranche-" + annee + "-" + cleJour(jusqua), function () {
    const debut = debutJour(new Date(annee, 0, 1, 12).getTime());
    const fin = Math.min(debutJour(jusqua), debutJour(new Date(annee, 11, 31, 12).getTime()));
    let total = 0;
    for (let t = debut; t <= fin; t += JOUR) {
      if (mouvementsDuJour(cleJour(t)).length) total += totauxDuJour(cleJour(t)).vendu;
    }
    return total;
  });
}

/* =======================================================================
   3. LE BILAN À UNE DATE
   ======================================================================= */

// Ce que la boutique POSSÈDE (l'actif), ce qu'elle DOIT (le passif), et la
// différence : ce qui lui appartient vraiment. Pour une année passée, la photo
// est prise au 31 décembre ; pour l'année en cours, aujourd'hui.
function bilanAu(ts) {
  return memo("bilan-" + ts, function () { return calculBilan(ts); });
}
function calculBilan(ts) {
  const avant = function (m) { return m.t <= ts; };

  /* --- L'argent : le départ déclaré, plus tout ce qui est entré, moins tout
         ce qui est sorti jusqu'à cette date (même calcul que paiements.js). --- */
  let caisse = 0;
  const depart = departParMoyen();
  Object.keys(depart).forEach(function (k) { caisse += depart[k] || 0; });
  donnees.mouvements.forEach(function (m) {
    if (!avant(m)) return;
    if (m.type === "vente") caisse += encaisseDe(m);
    else if (m.type === "paye") caisse += m.montant;
    else if (m.type === "depense" || m.type === "fpaye" || m.type === "maison" || m.type === "invest") caisse -= m.montant;
    else if (m.type === "fdette") caisse -= m.verse || 0;
  });

  /* --- Ce que les clients doivent, client par client. On ne compte pas les
         avances (un solde négatif) comme une créance : ce serait inventer de
         l'argent qui n'existe pas. --- */
  const parClient = {};
  const parFournisseur = {};
  donnees.mouvements.slice().sort(function (a, b) { return a.t - b.t; }).forEach(function (m) {
    if (!avant(m)) return;
    const c = idClientDe(m);
    if (c && (m.type === "vente" || m.type === "credit")) parClient[c] = (parClient[c] || 0) + creditDe(m);
    else if (c && m.type === "paye") parClient[c] = (parClient[c] || 0) - m.montant;
    if (m.type === "fdette" || m.type === "fpaye") {
      const f = idFournisseurDe(m);
      if (!f) return;
      if (m.type === "fpaye") parFournisseur[f] = (parFournisseur[f] || 0) - m.montant;
      else parFournisseur[f] = (parFournisseur[f] || 0) + Math.max(0, m.montant - (m.verse || 0));
    }
  });
  const positifs = function (o) {
    return Object.keys(o).reduce(function (s, k) { return s + Math.max(0, o[k]); }, 0);
  };
  const creances = Math.round(positifs(parClient));
  const dettes = Math.round(positifs(parFournisseur));

  /* --- La marchandise et les intrants, comptés au prix d'achat moyen
         d'aujourd'hui (Canari ne garde pas l'historique des prix). --- */
  const qte = {}, qteIntrant = {};
  donnees.mouvements.forEach(function (m) {
    if (!avant(m)) return;
    if (m.type === "stock") qte[m.produitId] = (qte[m.produitId] || 0) + m.quantite;
    if (m.type === "intrant") qteIntrant[m.intrantId] = (qteIntrant[m.intrantId] || 0) + m.quantite;
    if (m.lignes) m.lignes.forEach(function (l) {
      qte[l.produitId] = (qte[l.produitId] || 0) - l.qte;
      if (l.consommation) l.consommation.forEach(function (c) { qteIntrant[c.intrantId] = (qteIntrant[c.intrantId] || 0) - c.qte; });
    });
    if (m.consommation) m.consommation.forEach(function (c) { qteIntrant[c.intrantId] = (qteIntrant[c.intrantId] || 0) - c.qte; });
  });
  let stock = 0;
  Object.keys(qte).forEach(function (id) {
    const p = donnees.produits[id];
    if (p) stock += Math.max(0, qte[id]) * (coutProduit(p) || 0);
  });
  Object.keys(qteIntrant).forEach(function (id) {
    const i = donnees.intrants[id];
    if (i) stock += Math.max(0, qteIntrant[id]) * (i.cout || 0);
  });
  stock = Math.round(stock);

  /* --- Le matériel : ce qu'il lui reste de valeur à cette date. Un four payé
         300 000 F et utilisé depuis la moitié de sa durée en vaut 150 000. --- */
  let materiel = 0;
  donnees.mouvements.forEach(function (m) {
    if (m.type !== "invest" || !avant(m)) return;
    const duree = Math.max(1, m.duree || 3) * 365 * JOUR;
    const reste = Math.max(0, 1 - (ts - m.t) / duree);
    materiel += m.montant * reste;
  });
  materiel = Math.round(materiel);

  const totalActif = Math.round(caisse) + creances + stock + materiel;
  return {
    date: ts, caisse: Math.round(caisse), creances: creances, stock: stock, materiel: materiel,
    totalActif: totalActif, dettes: dettes,
    // Ce qui appartient vraiment au commerçant : tout ce qu'il a, moins ce qu'il doit.
    capitauxPropres: totalActif - dettes,
    totalPassif: totalActif
  };
}

/* =======================================================================
   4. LES RATIOS
   ======================================================================= */

// Un ratio : son nom, sa valeur, son verdict (olive / ocre / rouge), la phrase
// qui le lit, et le geste à faire. Même règle que le tableau de bord : un
// indicateur qui ne donne pas les quatre ne sert à rien.
// Les trois mêmes verdicts que le tableau de bord, et les mêmes noms de
// classe : olive « bon », ocre « attention », rouge « alerte ». Un commerçant
// qui a appris les couleurs sur un écran les retrouve sur l'autre.
function verdictSeuil(valeur, bon, moyen, inverse) {
  if (valeur === null || valeur === undefined) return "neutre";
  if (inverse) return valeur <= bon ? "bon" : valeur <= moyen ? "attention" : "alerte";
  return valeur >= bon ? "bon" : valeur >= moyen ? "attention" : "alerte";
}
function parJourDe(total, jours) { return jours > 0 ? total / jours : 0; }

function ratiosDe(ex, bil, precedent) {
  const r = [];
  const jours = Math.max(1, ex.joursNotes);
  const ventesParJour = parJourDe(ex.ventes, jours);
  const coutParJour = parJourDe(ex.cout, jours);
  const achatsParJour = parJourDe(ex.achats || ex.cout, jours);

  /* --- Rentabilité --- */
  const marge = ex.ventes ? Math.round(ex.margeBrute / ex.ventes * 100) : null;
  r.push({
    cle: "marge", groupe: "rentabilite", nom: "Taux de marge brute",
    valeur: pourcent(marge), brut: marge, verdict: verdictSeuil(marge, 30, 15),
    lecture: marge === null ? "Pas encore de vente cette année."
      : "Sur " + franc(1000) + " vendus, il te reste " + franc(Math.round(marge * 10)) + " après avoir payé la marchandise.",
    conseil: marge === null ? "Note tes ventes : la marge se calcule toute seule."
      : marge >= 30 ? "Garde cette marge : c'est elle qui paie tes charges."
      : marge >= 15 ? "Regarde tes trois plus gros produits : un seul mal acheté suffit à faire baisser toute la marge."
      : "Ta marge est trop faible. Soit tu achètes trop cher, soit tu vends trop bas. Compare tes prix d'achat chez deux fournisseurs."
  });

  const net = ex.ventes ? Math.round(ex.resultatNet / ex.ventes * 100) : null;
  r.push({
    cle: "net", groupe: "rentabilite", nom: "Taux de bénéfice net",
    valeur: pourcent(net), brut: net, verdict: verdictSeuil(net, 10, 3),
    lecture: net === null ? "Pas encore de vente cette année."
      : net < 0 ? "Cette année, tu perds " + franc(Math.abs(Math.round(net * 10))) + " sur " + franc(1000) + " vendus."
      : "Sur " + franc(1000) + " vendus, il te reste vraiment " + franc(Math.round(net * 10)) + " à la fin.",
    conseil: net === null ? "" : net >= 10 ? "C'est une bonne année. Mets de côté de quoi tenir un mois sans vendre."
      : net >= 3 ? "Ça tient, mais de peu. Regarde la ligne la plus grosse de tes dépenses."
      : "Tu travailles presque pour rien. Il faut soit vendre plus, soit baisser une charge, soit augmenter tes prix."
  });

  const poids = ex.ventes ? Math.round((ex.chargesFixes + ex.impots + ex.usure) / ex.ventes * 100) : null;
  r.push({
    cle: "poids", groupe: "rentabilite", nom: "Poids des charges et taxes",
    valeur: pourcent(poids), brut: poids, verdict: verdictSeuil(poids, 25, 40, true),
    lecture: poids === null ? "Pas encore de vente cette année."
      : "Tes charges fixes, tes taxes et l'usure du matériel mangent " + poids + " % de tes ventes.",
    conseil: poids === null ? "" : poids <= 25 ? "Tes charges sont tenues. C'est ce qui te permet de résister à un mois creux."
      : poids <= 40 ? "Liste tes charges et demande-toi, pour chacune : qu'est-ce qui se passe si je l'arrête ?"
      : "Tes charges sont trop lourdes pour ce que tu vends. Il faut vendre plus, ou en supprimer une."
  });

  // Une année EN COURS ne se compare pas à une année entière : au 5 octobre,
  // neuf mois contre douze feraient croire à une chute de 25 % alors que rien
  // n'a bougé. On compare donc la même tranche : du 1er janvier à aujourd'hui,
  // contre le 1er janvier au même jour l'an dernier.
  const referencePrec = precedent
    ? (ex.enCours ? ventesTranche(precedent.annee, Date.now() - 365 * JOUR) : precedent.ventes)
    : 0;
  const croissance = referencePrec
    ? Math.round((ex.ventes - referencePrec) / referencePrec * 100) : null;
  if (croissance !== null) {
    r.push({
      cle: "croissance", groupe: "rentabilite", nom: "Croissance des ventes",
      valeur: pourcent(croissance), brut: croissance, verdict: verdictSeuil(croissance, 5, -5),
      lecture: (ex.enCours ? "À la même date l'an dernier, la comparaison est honnête. " : "") +
        (croissance >= 0 ? "Tu vends " + croissance + " % de plus qu'en " + precedent.annee + "."
          : "Tu vends " + Math.abs(croissance) + " % de moins qu'en " + precedent.annee + "."),
      conseil: croissance >= 5 ? "Ce qui marche, fais-en plus : regarde quel produit a porté cette hausse."
        : croissance >= -5 ? "Tu fais du surplace. Essaie une nouveauté sur un petit stock avant d'en acheter beaucoup."
        : "Tes ventes baissent. Appelle tes dix meilleurs clients : ils te diront pourquoi mieux que n'importe quel calcul."
    });
  }

  /* --- Argent et délais --- */
  const rotation = coutParJour > 0 ? Math.round(bil.stock / coutParJour) : null;
  r.push({
    cle: "rotation", groupe: "argent", nom: "Marchandise qui dort",
    valeur: rotation === null ? "—" : pluriel(rotation, "jour"), brut: rotation,
    verdict: verdictSeuil(rotation, 30, 60, true),
    lecture: rotation === null ? "Pas encore assez de ventes pour le calculer."
      : "Ton stock représente " + pluriel(rotation, "jour") + " de ventes.",
    conseil: rotation === null ? "" : rotation <= 30 ? "Ton stock tourne bien : ton argent ne dort pas sur les étagères."
      : rotation <= 60 ? "Repère les produits qui ne bougent pas depuis deux mois et solde-les."
      : "Beaucoup d'argent dort en marchandise. Chaque sac qui attend, c'est de l'argent que tu ne peux pas utiliser."
  });

  const delaiClients = ventesParJour > 0 ? Math.round(bil.creances / ventesParJour) : null;
  r.push({
    cle: "clients", groupe: "argent", nom: "Délai de paiement des clients",
    valeur: delaiClients === null ? "—" : pluriel(delaiClients, "jour"), brut: delaiClients,
    verdict: verdictSeuil(delaiClients, 15, 30, true),
    lecture: delaiClients === null ? "Pas encore assez de ventes pour le calculer."
      : "Tes clients mettent en moyenne " + pluriel(delaiClients, "jour") + " à te payer.",
    conseil: delaiClients === null ? "" : delaiClients <= 15 ? "Tes clients paient vite. Continue de noter chaque crédit le jour même."
      : delaiClients <= 30 ? "Ouvre l'onglet Relances une fois par semaine : la moitié du retard vient de l'oubli."
      : "Tu fais crédit à la place de ta banque. Relance, et demande un acompte sur les gros achats."
  });

  const delaiFournisseurs = achatsParJour > 0 ? Math.round(bil.dettes / achatsParJour) : null;
  if (delaiFournisseurs !== null) {
    r.push({
      cle: "fournisseurs", groupe: "argent", nom: "Délai de paiement à tes fournisseurs",
      valeur: pluriel(delaiFournisseurs, "jour"), brut: delaiFournisseurs, verdict: "neutre",
      lecture: "Tu mets en moyenne " + pluriel(delaiFournisseurs, "jour") + " à payer tes fournisseurs.",
      conseil: delaiClients !== null && delaiFournisseurs < delaiClients
        ? "Tu paies tes fournisseurs plus vite que tes clients ne te paient : c'est toi qui avances l'argent."
        : "Tu paies tes fournisseurs moins vite que tes clients ne te paient : c'est confortable, mais tiens tes promesses."
    });
  }

  const bfr = bil.stock + bil.creances - bil.dettes;
  const bfrJours = ventesParJour > 0 ? Math.round(bfr / ventesParJour) : null;
  r.push({
    cle: "bfr", groupe: "argent", nom: "Argent immobilisé",
    valeur: sommeF(bfr), brut: bfr, verdict: verdictSeuil(bfrJours, 30, 60, true),
    lecture: bfrJours === null ? "Ton stock et tes créances, moins ce que tu dois."
      : "Ton stock et ce qu'on te doit, moins ce que tu dois, font " + pluriel(bfrJours, "jour") + " de ventes.",
    conseil: "C'est l'argent que ton activité retient en permanence. Plus il est petit, plus tu es libre."
  });

  const chargesMois = Math.round((ex.chargesFixes + ex.impots + ex.autresDepenses) / Math.max(1, ex.joursNotes) * 30);
  // Une caisse négative ne se raconte pas en « −55,5 mois » : ça ne veut rien
  // dire. On le dit avec des mots, et on renvoie au seul geste utile.
  const caisseRouge = bil.caisse < 0;
  const moisTenus = !caisseRouge && chargesMois > 0 ? Math.round(bil.caisse / chargesMois * 10) / 10 : null;
  r.push({
    cle: "tresorerie", groupe: "argent", nom: "Combien de temps tu tiens sans vendre",
    valeur: caisseRouge ? sommeF(bil.caisse) : moisTenus === null ? "—" : virgule(moisTenus) + "\u00a0mois",
    brut: caisseRouge ? -1 : moisTenus,
    verdict: caisseRouge ? "alerte" : verdictSeuil(moisTenus, 1, 0.5),
    lecture: caisseRouge
        ? "Ta caisse est dans le rouge : il est sorti " + franc(Math.abs(bil.caisse)) + " de plus qu'il n'est entré."
      : moisTenus === null ? "Pas encore assez de charges notées pour le calculer."
      : "Avec " + franc(bil.caisse) + " en caisse, tu tiens environ " + virgule(moisTenus) + " mois sans vendre.",
    conseil: caisseRouge
        ? "Compte l'argent que tu as vraiment et écris-le dans Réglages → Argent en caisse. Souvent, il manque juste l'argent du départ."
      : moisTenus === null ? "" : moisTenus >= 1 ? "Tu as de quoi voir venir. Garde ce matelas, ne le dépense pas en stock."
      : moisTenus >= 0.5 ? "Un mois creux et tu es serré. Vise un mois de charges d'avance."
      : "Tu es sur le fil. Avant tout nouvel achat, mets de côté une semaine de charges."
  });

  /* --- Solidité --- */
  const autonomie = bil.totalActif > 0 ? Math.round(bil.capitauxPropres / bil.totalActif * 100) : null;
  r.push({
    cle: "autonomie", groupe: "solidite", nom: "Ce qui t'appartient vraiment",
    valeur: pourcent(autonomie), brut: autonomie, verdict: verdictSeuil(autonomie, 60, 35),
    lecture: autonomie === null ? "Pas encore de quoi faire un bilan."
      : autonomie < 0 ? "Tu dois plus que ce que vaut ta boutique."
      : "Sur 100 F de valeur dans ta boutique, " + autonomie + " F sont à toi, le reste est à tes fournisseurs.",
    conseil: autonomie === null ? "" : autonomie >= 60 ? "Ta boutique t'appartient. C'est ce qui te permet de refuser un mauvais crédit."
      : autonomie >= 35 ? "Rembourse une dette fournisseur avant d'en prendre une nouvelle."
      : "Tu travailles surtout avec l'argent des autres. Un fournisseur qui réclame, et tout s'arrête."
  });

  const roe = bil.capitauxPropres > 0 ? Math.round(ex.resultatNet / bil.capitauxPropres * 100) : null;
  r.push({
    cle: "roe", groupe: "solidite", nom: "Ce que rapporte ton argent",
    valeur: pourcent(roe), brut: roe, verdict: verdictSeuil(roe, 20, 8),
    lecture: roe === null ? "Pas encore de quoi le calculer."
      : roe < 0 ? "Ton argent placé dans la boutique t'a fait perdre " + Math.abs(roe) + " % cette année."
      : "Chaque 100 F que tu as mis dans ta boutique t'a rapporté " + roe + " F cette année.",
    conseil: roe === null ? "" : roe >= 20 ? "Ta boutique rapporte bien. C'est là qu'il faut remettre ton argent."
      : roe >= 8 ? "C'est correct. Un produit à meilleure marge ferait monter ce chiffre sans travailler plus."
      : "Ton argent dort. Regarde ce qui l'immobilise : du stock qui ne part pas, ou des clients qui ne paient pas."
  });

  const tauxMarge = ex.ventes ? ex.margeBrute / ex.ventes : 0;
  const seuil = tauxMarge > 0 ? Math.round((ex.chargesFixes + ex.impots + ex.usure + ex.autresDepenses) / tauxMarge) : null;
  r.push({
    cle: "seuil", groupe: "solidite", nom: "Ventes minimum pour ne rien perdre",
    valeur: seuil === null ? "—" : franc(seuil), brut: seuil,
    verdict: seuil === null ? "neutre" : ex.ventes >= seuil ? "bon" : "alerte",
    lecture: seuil === null ? "Pas encore assez de chiffres pour le calculer."
      : ex.ventes >= seuil ? "Tu as vendu " + franc(ex.ventes) + ", au-dessus des " + franc(seuil) + " qu'il te fallait."
      : "Il te fallait vendre " + franc(seuil) + " pour ne rien perdre. Tu en es à " + franc(ex.ventes) + ".",
    conseil: seuil === null ? "" : ex.ventes >= seuil
      ? "Tout ce que tu vends au-dessus de ce seuil est du bénéfice. Chaque vente compte double."
      : "Divise ce chiffre par tes jours de travail : c'est ce qu'il faut faire chaque jour."
  });

  return r;
}

/* =======================================================================
   5. L'ANALYSE ÉCRITE
   ======================================================================= */

// Des phrases COURTES et AUTONOMES, comme dans conseil.js : chacune est
// traduite séparément, donc aucune ne doit dépendre de la précédente.
function analyseDe(ex, bil, precedent, ratios) {
  const trouve = function (cle) { return ratios.find(function (x) { return x.cle === cle; }); };
  const parties = [];

  /* --- L'activité --- */
  const activite = [];
  activite.push("En " + ex.annee + ", tu as vendu pour " + franc(ex.ventes) + ".");
  if (ex.joursVente) {
    activite.push("Tu as vendu " + pluriel(ex.joursVente, "jour") + " dans l'année, soit " +
      franc(Math.round(ex.ventes / ex.joursVente)) + " par jour de vente en moyenne.");
  }
  if (ex.nbVentes) {
    activite.push("Cela fait " + pluriel(ex.nbVentes, "vente") + ", à " +
      franc(Math.round(ex.ventes / ex.nbVentes)) + " en moyenne.");
  }
  if (precedent && precedent.ventes) {
    // Même précaution que pour le ratio : on compare la même tranche d'année.
    const reference = ex.enCours ? ventesTranche(precedent.annee, Date.now() - 365 * JOUR) : precedent.ventes;
    if (reference) {
      const ecart = ex.ventes - reference;
      activite.push(ecart >= 0
        ? "C'est " + franc(ecart) + " de plus qu'en " + precedent.annee + " à la même date."
        : "C'est " + franc(Math.abs(ecart)) + " de moins qu'en " + precedent.annee + " à la même date.");
    }
  }
  if (ex.aCredit) {
    activite.push("Sur ces ventes, " + franc(ex.aCredit) + " sont partis à crédit.");
  }
  if (ex.enCours) activite.push("Attention : l'année n'est pas finie, ces chiffres vont encore bouger.");
  parties.push({ titre: "Ton activité", phrases: activite });

  /* --- La rentabilité --- */
  const rent = [];
  rent.push("Tes ventes de " + franc(ex.ventes) + " t'ont coûté " + franc(ex.cout) + " de marchandise.");
  rent.push("Il te reste donc " + franc(ex.margeBrute) + " de marge brute.");
  const sorties = ex.autresDepenses + ex.chargesFixes + ex.impots + ex.usure;
  if (sorties) rent.push("Tes charges, tes taxes et l'usure du matériel ont pris " + franc(sorties) + ".");
  rent.push(ex.resultatNet >= 0
    ? "Ton bénéfice net de l'année est de " + franc(ex.resultatNet) + "."
    : "Ta perte de l'année est de " + franc(Math.abs(ex.resultatNet)) + ".");
  if (ex.maison) {
    rent.push("Tu as pris " + franc(ex.maison) + " pour la maison.");
    rent.push(ex.resteBoutique >= 0
      ? "Il reste donc " + franc(ex.resteBoutique) + " pour faire grandir la boutique."
      : "Tu as pris " + franc(Math.abs(ex.resteBoutique)) + " de plus que ce que la boutique a gagné.");
  }
  // La plus grosse ligne de dépense : c'est là qu'il y a quelque chose à gagner.
  const postes = [
    { nom: "la marchandise", v: ex.cout },
    { nom: "tes autres dépenses", v: ex.autresDepenses },
    { nom: "tes charges fixes", v: ex.chargesFixes },
    { nom: "tes impôts et taxes", v: ex.impots },
    { nom: "l'usure du matériel", v: ex.usure }
  ].filter(function (p) { return p.v > 0; }).sort(function (a, b) { return b.v - a.v; });
  if (postes.length && ex.ventes) {
    rent.push("Ton plus gros poste est " + postes[0].nom + " : " + franc(Math.round(postes[0].v)) +
      ", soit " + Math.round(postes[0].v / ex.ventes * 100) + " % de tes ventes.");
  }
  parties.push({ titre: "Ce que tu gagnes vraiment", phrases: rent });

  /* --- Le patrimoine --- */
  const patr = [];
  patr.push("Ta boutique possède " + sommeF(bil.totalActif) + " en tout.");
  const detail = [];
  if (bil.caisse > 0) detail.push(franc(bil.caisse) + " en caisse et sur tes comptes");
  if (bil.stock) detail.push(franc(bil.stock) + " de marchandise");
  if (bil.creances) detail.push(franc(bil.creances) + " que tes clients te doivent");
  if (bil.materiel) detail.push(franc(bil.materiel) + " de matériel");
  if (detail.length) patr.push("C'est-à-dire " + detail.join(", ") + ".");
  patr.push(bil.dettes
    ? "Tu dois " + franc(bil.dettes) + " à tes fournisseurs."
    : "Tu ne dois rien à tes fournisseurs.");
  patr.push(bil.capitauxPropres >= 0
    ? "Ce qui t'appartient vraiment, c'est donc " + franc(bil.capitauxPropres) + "."
    : "Tu dois " + franc(Math.abs(bil.capitauxPropres)) + " de plus que ce que vaut ta boutique.");
  const a = trouve("autonomie");
  if (a && a.brut !== null && a.brut < 35) {
    patr.push("C'est peu : la plus grande partie de ta boutique est encore payée par tes fournisseurs.");
  }
  parties.push({ titre: "Ce que vaut ta boutique", phrases: patr });

  /* --- L'argent qui circule --- */
  const tres = [];
  const dc = trouve("clients"), rot = trouve("rotation"), tr2 = trouve("tresorerie");
  if (dc && dc.brut !== null) tres.push("Tes clients mettent " + pluriel(dc.brut, "jour") + " à te payer.");
  if (rot && rot.brut !== null) tres.push("Ta marchandise reste " + pluriel(rot.brut, "jour") + " en stock avant d'être vendue.");
  if (dc && rot && dc.brut !== null && rot.brut !== null) {
    tres.push("Entre le jour où tu achètes et le jour où tu es payé, il se passe environ " +
      pluriel(dc.brut + rot.brut, "jour") + ".");
    tres.push("C'est pendant tout ce temps que ton argent est bloqué.");
  }
  if (bil.caisse < 0) {
    tres.push("Ta caisse est dans le rouge de " + franc(Math.abs(bil.caisse)) + ".");
    tres.push("Vérifie l'argent que tu avais au départ dans Réglages → Argent en caisse.");
  } else if (tr2 && tr2.brut !== null && tr2.brut >= 0) {
    tres.push(tr2.brut >= 1
      ? "Avec ce que tu as en caisse, tu peux tenir " + virgule(tr2.brut) + " mois sans vendre."
      : "Avec ce que tu as en caisse, tu ne tiens que " + virgule(tr2.brut) + " mois sans vendre.");
  }
  if (tres.length) parties.push({ titre: "Comment ton argent circule", phrases: tres });

  return parties;
}

/* =======================================================================
   6. LES CONSEILS
   ======================================================================= */

// Les gestes les plus utiles, classés par gravité : le rouge d'abord. Même
// principe que « Ce que je ferais à ta place » du tableau de bord, mais sur
// l'année entière et sur la solidité, pas sur la semaine.
function conseilsDe(ex, bil, precedent, ratios) {
  const gravite = { alerte: 0, attention: 1, bon: 2, neutre: 3 };
  const liste = ratios
    .filter(function (r) { return r.conseil && r.verdict !== "neutre"; })
    .sort(function (a, b) { return gravite[a.verdict] - gravite[b.verdict]; })
    .map(function (r) { return { verdict: r.verdict, nom: r.nom, texte: r.conseil }; });

  // Deux conseils qui ne viennent d'aucun ratio mais de la situation.
  if (ex.maison && ex.resultatNet > 0 && ex.maison > ex.resultatNet) {
    liste.unshift({ verdict: "alerte", nom: "L'argent de la maison",
      texte: "Tu prends pour la maison plus que la boutique ne gagne. À ce rythme, la boutique rétrécit chaque mois." });
  }
  if (bil.materiel === 0 && ex.resultatNet > 0 && bil.caisse > 0) {
    liste.push({ verdict: "bon", nom: "Investir",
      texte: "Tu n'as pas encore de matériel. Un congélateur, une vitrine ou une moto peut faire grandir tes ventes plus vite qu'un stock de plus." });
  }
  return liste.slice(0, 6);
}

/* =======================================================================
   7. LES GRAPHIQUES (SVG écrit à la main : rien à charger, marche sans réseau)
   ======================================================================= */

// Deux séries en colonnes, année par année : les ventes et le bénéfice net.
// Le bénéfice peut être négatif, donc l'axe zéro n'est pas forcément en bas.
function colonnesAnneesSvg(annees) {
  if (!annees.length) return "";
  const L = 300, H = 120, pas = L / annees.length;
  const valeurs = [];
  annees.forEach(function (a) { valeurs.push(a.ventes, a.resultatNet); });
  const haut = Math.max(1, Math.max.apply(null, valeurs));
  const bas = Math.min(0, Math.min.apply(null, valeurs));
  const etendue = haut - bas || 1;
  const y = function (v) { return H - (v - bas) / etendue * H; };
  const zero = y(0);
  let barres = "";
  annees.forEach(function (a, i) {
    const x = i * pas, large = pas * 0.3;
    const dessiner = function (v, dx, classe) {
      const h = Math.abs(y(v) - zero);
      const yy = v >= 0 ? y(v) : zero;
      return '<rect class="' + classe + '" x="' + (x + dx).toFixed(1) + '" y="' + yy.toFixed(1) +
        '" width="' + large.toFixed(1) + '" height="' + Math.max(1, h).toFixed(1) + '" rx="2"/>';
    };
    barres += dessiner(a.ventes, pas * 0.14, "col-ventes") + dessiner(a.resultatNet, pas * 0.52, a.resultatNet < 0 ? "col-perte" : "col-net");
  });
  return '<svg class="graphe-annees" viewBox="0 0 ' + L + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
    '<line class="axe" x1="0" y1="' + zero.toFixed(1) + '" x2="' + L + '" y2="' + zero.toFixed(1) + '"/>' +
    barres + '</svg>' +
    '<ul class="graphe-annees-noms">' + annees.map(function (a) {
      return '<li>' + a.annee + '</li>';
    }).join("") + '</ul>' +
    '<p class="graphe-legende"><span class="leg-point leg-ventes"></span>Ventes' +
    '<span class="leg-point leg-net"></span>Bénéfice net</p>';
}

// La cascade du compte de résultat : une barre par étage, de la plus grande
// (les ventes) à la plus petite (ce qui reste).
function cascadeSvg(ex) {
  const etages = [
    { nom: "Ventes", v: ex.ventes, classe: "etage-ventes" },
    { nom: "Marge brute", v: ex.margeBrute, classe: "etage-marge" },
    { nom: "Avant impôts", v: ex.resultatAvantImpots, classe: "etage-avant" },
    { nom: "Bénéfice net", v: ex.resultatNet, classe: ex.resultatNet < 0 ? "etage-perte" : "etage-net" }
  ];
  const max = Math.max(1, Math.max.apply(null, etages.map(function (e) { return Math.abs(e.v); })));
  return '<ul class="cascade">' + etages.map(function (e) {
    const part = Math.min(100, Math.abs(e.v) / max * 100);
    return '<li><span class="cascade-nom">' + e.nom + '</span>' +
      '<span class="cascade-piste"><span class="cascade-barre ' + e.classe + '" style="width:' + part.toFixed(1) + '%"></span></span>' +
      '<b class="cascade-valeur' + (e.v < 0 ? " m-negatif" : "") + '">' + sommeF(Math.round(e.v)) + '</b></li>';
  }).join("") + '</ul>';
}

// Le bilan en deux barres empilées : ce que la boutique a, ce qu'elle doit.
function bilanSvg(bil) {
  const total = Math.max(1, bil.totalActif);
  const part = function (v) { return Math.max(0, v) / total * 100; };
  // Chaque bloc porte son nom : c'est ce que lit un lecteur d'écran, et ce
  // qu'affiche un appui long. Sans lui, le dessin ne dit rien à qui ne voit pas.
  const bloc = function (v, classe, nom) {
    const p = part(v);
    return p < 0.5 ? "" : '<span class="pile-part ' + classe + '" style="width:' + p.toFixed(1) +
      '%" title="' + nom + " : " + franc(Math.round(v)) + '"></span>';
  };
  const propres = Math.max(0, bil.capitauxPropres);
  return '<div class="piles">' +
    '<p class="pile-titre">Ce que ta boutique possède</p>' +
    '<div class="pile">' + bloc(bil.caisse, "p-caisse", "Caisse") + bloc(bil.stock, "p-stock", "Marchandise") +
      bloc(bil.creances, "p-creances", "On me doit") + bloc(bil.materiel, "p-materiel", "Matériel") + '</div>' +
    '<p class="graphe-legende">' +
      '<span class="leg-point p-caisse"></span>Caisse' +
      '<span class="leg-point p-stock"></span>Marchandise' +
      '<span class="leg-point p-creances"></span>On me doit' +
      '<span class="leg-point p-materiel"></span>Matériel</p>' +
    '<p class="pile-titre">À qui c\'est</p>' +
    '<div class="pile">' + bloc(bil.dettes, "p-dettes", "À mes fournisseurs") +
      bloc(propres, "p-propres", "À moi") + '</div>' +
    '<p class="graphe-legende">' +
      '<span class="leg-point p-dettes"></span>À mes fournisseurs' +
      '<span class="leg-point p-propres"></span>À moi</p>' +
    '</div>';
}

/* =======================================================================
   8. L'ÉCRAN
   ======================================================================= */

function ligneCompte(nom, valeurs, classe) {
  return '<tr class="' + (classe || "") + '"><th scope="row">' + nom + '</th>' +
    valeurs.map(function (v) {
      const negatif = typeof v === "number" && v < 0;
      return '<td class="' + (negatif ? "m-negatif" : "") + '">' +
        (typeof v === "number" ? sommeF(Math.round(v)) : v) + '</td>';
    }).join("") + '</tr>';
}
// Une ligne qui retire quelque chose : elle porte un « − » et le rouge du
// décaissement, sauf à zéro (un zéro n'est pas une sortie d'argent).
// « Pris pour la maison » fait exception et garde l'ardoise : ce n'est pas une
// perte, c'est de l'argent qui change de poche — c'est la séparation
// boutique / maison, et elle doit se voir d'un coup d'œil.
function ligneMoins(nom, valeurs, couleur) {
  const classe = couleur || "m-sort";
  return '<tr class="ligne-moins"><th scope="row">' + nom + '</th>' +
    valeurs.map(function (v) {
      const n = Math.round(v);
      return '<td class="' + (n ? classe : "") + '">' + (n ? "\u2212\u00a0" + franc(n) : franc(0)) + '</td>';
    }).join("") + '</tr>';
}

function compteResultatHtml(exs) {
  const col = function (f) { return exs.map(f); };
  return '<table class="comptes-table">' +
    '<caption>Compte de résultat</caption>' +
    '<thead><tr><th scope="col">En francs</th>' +
      exs.map(function (e) { return '<th scope="col">' + e.annee + (e.enCours ? " *" : "") + '</th>'; }).join("") +
    '</tr></thead><tbody>' +
    ligneCompte("Ventes de l'année", col(function (e) { return e.ventes; }), "ligne-forte") +
    ligneMoins("Prix de revient de la marchandise", col(function (e) { return e.cout; })) +
    ligneCompte("= Marge brute", col(function (e) { return e.margeBrute; }), "ligne-total") +
    ligneMoins("Autres dépenses", col(function (e) { return e.autresDepenses; })) +
    ligneMoins("Charges fixes", col(function (e) { return e.chargesFixes; })) +
    ligneMoins("Usure du matériel", col(function (e) { return e.usure; })) +
    ligneCompte("= Résultat avant impôts", col(function (e) { return e.resultatAvantImpots; }), "ligne-total") +
    ligneMoins("Impôts et taxes", col(function (e) { return e.impots; })) +
    ligneCompte("= Bénéfice net", col(function (e) { return e.resultatNet; }), "ligne-forte ligne-finale") +
    ligneMoins("Pris pour la maison", col(function (e) { return e.maison; }), "m-maison") +
    ligneCompte("= Reste pour la boutique", col(function (e) { return e.resteBoutique; }), "ligne-total") +
    '</tbody></table>' +
    (exs.some(function (e) { return e.enCours; })
      ? '<p class="aide">* Cette année n\'est pas finie : elle ne couvre que les jours déjà passés.</p>' : "");
}

function bilanTableHtml(bils, exs) {
  const titre = function (b, e) {
    return e.enCours ? "Aujourd'hui" : "31/12/" + e.annee;
  };
  return '<table class="comptes-table">' +
    '<caption>Bilan</caption>' +
    '<thead><tr><th scope="col">En francs</th>' +
      bils.map(function (b, i) { return '<th scope="col">' + titre(b, exs[i]) + '</th>'; }).join("") +
    '</tr></thead><tbody>' +
    '<tr class="ligne-section"><th scope="row" colspan="' + (bils.length + 1) + '">Ce que la boutique possède</th></tr>' +
    ligneCompte("Argent en caisse et sur les comptes", bils.map(function (b) { return b.caisse; })) +
    ligneCompte("Marchandise en stock", bils.map(function (b) { return b.stock; })) +
    ligneCompte("Ce que les clients me doivent", bils.map(function (b) { return b.creances; })) +
    ligneCompte("Matériel (ce qu'il lui reste de valeur)", bils.map(function (b) { return b.materiel; })) +
    ligneCompte("= Total", bils.map(function (b) { return b.totalActif; }), "ligne-forte") +
    '<tr class="ligne-section"><th scope="row" colspan="' + (bils.length + 1) + '">À qui tout cela appartient</th></tr>' +
    ligneCompte("Ce que je dois à mes fournisseurs", bils.map(function (b) { return b.dettes; })) +
    ligneCompte("Ce qui m'appartient vraiment", bils.map(function (b) { return b.capitauxPropres; }), "ligne-forte ligne-finale") +
    ligneCompte("= Total", bils.map(function (b) { return b.totalPassif; }), "ligne-total") +
    '</tbody></table>';
}

function ratiosHtml(ratios) {
  const groupes = [
    ["rentabilite", "Ce que ça rapporte", "Ces chiffres disent si ton travail paie."],
    ["argent", "Comment l'argent circule", "Ces chiffres disent où ton argent est bloqué."],
    ["solidite", "La solidité de ta boutique", "Ces chiffres disent si tu peux encaisser un coup dur."]
  ];
  return groupes.map(function (g) {
    const cartes = ratios.filter(function (r) { return r.groupe === g[0]; }).map(function (r) {
      return carteIndicateur({ nom: r.nom, valeur: r.valeur, verdict: r.verdict, lecture: r.lecture, conseil: r.conseil });
    });
    return famille(g[1], g[2], cartes);
  }).join("");
}

function analyseHtml(parties) {
  return '<section class="famille analyse"><h2 class="titre-liste">L\'analyse de ton année</h2>' +
    parties.map(function (p) {
      return '<div class="analyse-bloc"><h3>' + tr(p.titre) + '</h3>' +
        p.phrases.map(function (ph) { return '<p>' + echapper(tr(ph)) + '</p>'; }).join("") + '</div>';
    }).join("") + '</section>';
}

function conseilsHtml(conseils) {
  if (!conseils.length) return "";
  return '<section class="famille"><h2 class="titre-liste">Ce que je ferais à ta place</h2>' +
    '<p class="aide famille-aide">Des conseils indicatifs, tirés de tes chiffres. Ils ne remplacent pas un comptable.</p>' +
    '<ul class="gestes">' + conseils.map(function (c) {
      return '<li class="geste geste-' + c.verdict + '"><b>' + tr(c.nom) + '</b><p>' + echapper(tr(c.texte)) + '</p></li>';
    }).join("") + '</ul></section>';
}

function choixAnneeHtml() {
  const liste = anneesComptables();
  const choisie = anneeChoisie();
  return '<div class="comptes-entete">' +
      '<img src="icones/fonds/canari-croissance.webp" width="92" height="123" alt="">' +
      '<div><h3>Tes comptes annuels</h3>' +
      '<p>Le bilan, le compte de résultat et ce qu\'ils disent de ta boutique.</p></div>' +
    '</div>' +
    '<div class="deux-choix vues-comptes" role="group" aria-label="Une année ou plusieurs">' +
      '<button type="button" class="choix" data-vue-comptes="annee" aria-pressed="' + (vueComptes === "annee") + '">Une année</button>' +
      '<button type="button" class="choix" data-vue-comptes="pluriannuel" aria-pressed="' + (vueComptes === "pluriannuel") + '">Plusieurs années</button>' +
    '</div>' +
    (vueComptes === "annee"
      ? '<div class="annees-choix" role="group" aria-label="Année regardée">' + liste.map(function (a) {
          return '<button type="button" class="choix" data-annee-comptes="' + a + '" aria-pressed="' + (a === choisie) + '">' + a + '</button>';
        }).join("") + '</div>'
      : '<p class="aide periode-aide">' + pluriel(liste.length, "année") + ', de ' + liste[0] + ' à ' + liste[liste.length - 1] + '.</p>');
}

function afficherComptes() {
  const liste = anneesComptables();
  const seule = vueComptes === "annee";
  const annees = seule ? [anneeChoisie()] : liste;
  const exs = annees.map(exerciceDe);
  const bils = exs.map(function (e) { return bilanAu(Math.min(e.finAnnee, Date.now())); });
  const haut = choixAnneeHtml();

  if (exs.every(function (e) { return e.vide; })) {
    $("vue-comptes").innerHTML = haut +
      '<div class="vide"><img class="scene" src="icones/fonds/canari-croissance.webp" width="210" height="280" alt="">' +
      '<p>Rien de noté ' + (seule ? "en " + annees[0] : "ces années-là") + '.<br>' +
      'Note tes ventes et tes dépenses : les comptes se feront tout seuls.</p></div>';
    return;
  }

  const ex = exs[exs.length - 1];
  const bil = bils[bils.length - 1];
  const precedent = exerciceDe(ex.annee - 1);
  const ratios = ratiosDe(ex, bil, precedent.vide ? null : precedent);

  let html = haut;
  // En vue « plusieurs années », le graphique des colonnes donne d'un coup
  // d'œil ce que trois pages de chiffres mettraient longtemps à dire.
  if (!seule && exs.length > 1) {
    html += '<section class="famille"><h2 class="titre-liste">Ventes et bénéfice, année par année</h2>' +
      '<div class="carte-graphe">' + colonnesAnneesSvg(exs) + '</div></section>';
  }
  html += '<section class="famille"><h2 class="titre-liste">Combien tu as gagné</h2>' +
    '<p class="aide famille-aide">On part des ventes et on enlève tout ce qui coûte, dans l\'ordre.</p>' +
    '<div class="carte-graphe">' + compteResultatHtml(exs) + '</div>' +
    (seule ? '<div class="carte-graphe">' + cascadeSvg(ex) + '</div>' : "") +
    '</section>';
  html += '<section class="famille"><h2 class="titre-liste">Ce que vaut ta boutique</h2>' +
    '<p class="aide famille-aide">D\'un côté ce que ta boutique possède, de l\'autre à qui cela appartient.</p>' +
    '<div class="carte-graphe">' + bilanTableHtml(bils, exs) + '</div>' +
    (seule ? '<div class="carte-graphe">' + bilanSvg(bil) + '</div>' : "") +
    '</section>';
  html += ratiosHtml(ratios);
  html += analyseHtml(analyseDe(ex, bil, precedent.vide ? null : precedent, ratios));
  html += conseilsHtml(conseilsDe(ex, bil, precedent.vide ? null : precedent, ratios));
  html += '<section class="famille note-comptes"><h2 class="titre-liste">Ce que Canari sait, et ne sait pas</h2>' +
    '<ul class="aide">' +
      '<li>Les charges fixes et les taxes d\'une année passée sont réparties avec les montants que tu as réglés aujourd\'hui : Canari ne garde pas l\'historique de tes réglages.</li>' +
      '<li>Ta marchandise en stock est comptée au prix d\'achat moyen d\'aujourd\'hui.</li>' +
      '<li>L\'argent en caisse part de ce que tu as déclaré dans Réglages → Argent en caisse.</li>' +
      '<li>Ce sont des comptes de gestion, faits pour décider. Pour les impôts ou une banque, fais-les vérifier par un comptable.</li>' +
    '</ul></section>';
  html += '<div class="comptes-boutons">' +
    '<button type="button" class="bouton bouton-sauver" id="comptes-pdf">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5"/></svg>Télécharger en PDF</button>' +
    '<button type="button" class="bouton bouton-annuler" id="comptes-excel">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>Télécharger en Excel</button>' +
    '</div>';
  $("vue-comptes").innerHTML = html;
}

/* =======================================================================
   9. TÉLÉCHARGER SES COMPTES (PDF ou Excel, écrits par export.js)
   ======================================================================= */

function feuillesComptes() {
  const liste = anneesComptables();
  const annees = vueComptes === "annee" ? [anneeChoisie()] : liste;
  const exs = annees.map(exerciceDe);
  const bils = exs.map(function (e) { return bilanAu(Math.min(e.finAnnee, Date.now())); });
  const entete = ["En francs"].concat(exs.map(function (e) { return String(e.annee); }));
  const formats = ["texte"].concat(exs.map(function () { return "nombre"; }));
  const ligne = function (nom, f) { return [nom].concat(exs.map(f)); };

  const resultat = [entete,
    ligne("Ventes de l'année", function (e) { return Math.round(e.ventes); }),
    ligne("Prix de revient de la marchandise", function (e) { return -Math.round(e.cout); }),
    ligne("= Marge brute", function (e) { return Math.round(e.margeBrute); }),
    ligne("Autres dépenses", function (e) { return -Math.round(e.autresDepenses); }),
    ligne("Charges fixes", function (e) { return -Math.round(e.chargesFixes); }),
    ligne("Usure du matériel", function (e) { return -Math.round(e.usure); }),
    ligne("= Résultat avant impôts", function (e) { return Math.round(e.resultatAvantImpots); }),
    ligne("Impôts et taxes", function (e) { return -Math.round(e.impots); }),
    ligne("= Bénéfice net", function (e) { return Math.round(e.resultatNet); }),
    ligne("Pris pour la maison", function (e) { return -Math.round(e.maison); }),
    ligne("= Reste pour la boutique", function (e) { return Math.round(e.resteBoutique); })
  ];

  const ligneB = function (nom, f) { return [nom].concat(bils.map(f)); };
  const bilan = [entete,
    ligneB("Argent en caisse et sur les comptes", function (b) { return b.caisse; }),
    ligneB("Marchandise en stock", function (b) { return b.stock; }),
    ligneB("Ce que les clients me doivent", function (b) { return b.creances; }),
    ligneB("Matériel (valeur restante)", function (b) { return b.materiel; }),
    ligneB("= Total de ce que la boutique possède", function (b) { return b.totalActif; }),
    ligneB("Ce que je dois à mes fournisseurs", function (b) { return b.dettes; }),
    ligneB("Ce qui m'appartient vraiment", function (b) { return b.capitauxPropres; })
  ];

  const dernier = exs[exs.length - 1];
  const precedent = exerciceDe(dernier.annee - 1);
  const ratios = ratiosDe(dernier, bils[bils.length - 1], precedent.vide ? null : precedent);
  const lignesRatios = [["Indicateur", "Valeur", "Ce que ça veut dire", "Ce qu'il faut faire"]];
  ratios.forEach(function (r) { lignesRatios.push([r.nom, r.valeur, r.lecture, r.conseil || ""]); });

  const lignesAnalyse = [["Partie", "Phrase"]];
  analyseDe(dernier, bils[bils.length - 1], precedent.vide ? null : precedent, ratios)
    .forEach(function (p) { p.phrases.forEach(function (ph) { lignesAnalyse.push([p.titre, ph]); }); });
  conseilsDe(dernier, bils[bils.length - 1], precedent.vide ? null : precedent, ratios)
    .forEach(function (c) { lignesAnalyse.push(["Conseil — " + c.nom, c.texte]); });

  return [
    { nom: "Compte de résultat", lignes: resultat, formats: formats },
    { nom: "Bilan", lignes: bilan, formats: formats },
    { nom: "Ratios", lignes: lignesRatios, formats: ["texte", "texte", "texte", "texte"] },
    { nom: "Analyse et conseils", lignes: lignesAnalyse, formats: ["texte", "texte"] }
  ];
}

function telechargerComptes(format) {
  const feuilles = feuillesComptes();
  const annees = vueComptes === "annee" ? String(anneeChoisie())
    : anneesComptables()[0] + "-" + anneesComptables()[anneesComptables().length - 1];
  const nomBoutique = (donnees.boutique.nom || "Canari").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "Canari";
  const titre = tr("Comptes annuels") + " — " + (donnees.boutique.nom || "Canari");
  try {
    if (format === "pdf") {
      const octets = fabriquerPdf(feuilles, titre, tr("Année") + " " + annees + " · " + tr("Établi avec Canari"));
      livrerFichier(new File([octets], nomBoutique + "_comptes_" + annees + ".pdf", { type: "application/pdf" }), "PDF");
    } else {
      const octets = fabriquerClasseur(feuilles);
      livrerFichier(new File([octets], nomBoutique + "_comptes_" + annees + ".xlsx",
        { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "Excel");
    }
  } catch (e) {
    message("Le fichier n'a pas pu être fabriqué. Réessaie.");
  }
}

/* =======================================================================
   10. MISE EN ROUTE
   ======================================================================= */

function initComptes() {
  const annee = parseInt(lire(CLE_ANNEE_COMPTES), 10);
  if (annee) anneeComptes = annee;
  const vue = lire(CLE_VUE_COMPTES);
  if (vue === "pluriannuel" || vue === "annee") vueComptes = vue;

  $("vue-comptes").addEventListener("click", function (e) {
    const an = e.target.closest("[data-annee-comptes]");
    if (an) {
      anneeComptes = parseInt(an.dataset.anneeComptes, 10);
      ecrire(CLE_ANNEE_COMPTES, String(anneeComptes));
      afficherComptes();
      return;
    }
    const vueBouton = e.target.closest("[data-vue-comptes]");
    if (vueBouton) {
      vueComptes = vueBouton.dataset.vueComptes;
      ecrire(CLE_VUE_COMPTES, vueComptes);
      afficherComptes();
      return;
    }
    if (e.target.closest("#comptes-pdf")) telechargerComptes("pdf");
    else if (e.target.closest("#comptes-excel")) telechargerComptes("excel");
  });
}

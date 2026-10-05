// Canari · les états financiers au format OHADA (SYSCOHADA révisé).
//
// Demande du propriétaire (05/10/2026) : « je souhaite qu'il y ait un vrai
// bilan et un vrai compte de résultat au sens strict de l'OHADA, à consulter
// à la demande, en plus de ce que tu as déjà fait ».
//
// CE QUE C'EST, ET CE QUE CE N'EST PAS.
// L'écran « Comptes annuels » (comptes.js) parle au commerçant : il dit en
// français simple combien il a gagné et ce que vaut sa boutique. Cet écran-ci
// parle à son COMPTABLE, à sa BANQUE et aux IMPÔTS : c'est la même réalité,
// rangée dans le cadre officiel de l'OHADA, avec les intitulés et les codes
// de référence du modèle (TA, RA, XA, AZ, CP, DZ…).
// Mais Canari n'est pas une comptabilité en partie double : il note ce qui se
// passe, il n'enregistre pas des écritures. Ces états sont donc une
// PRÉSENTATION AU FORMAT OHADA de ce que le commerçant a noté. Avant tout
// dépôt officiel, un expert-comptable doit les reprendre. C'est écrit en haut
// de l'écran, pas en petits caractères en bas.
//
// Référence : Acte uniforme relatif au droit comptable et à l'information
// financière (AUDCIF), applicable depuis le 1er janvier 2018 dans les 17 pays
// de l'OHADA, dont la Côte d'Ivoire. L'exercice va du 1er janvier au
// 31 décembre (art. 7), ce qui est déjà le découpage de comptes.js.

/* =======================================================================
   1. QUEL SYSTÈME S'APPLIQUE À CETTE BOUTIQUE
   ======================================================================= */

// Seuils du Système Minimal de Trésorerie (AUDCIF, art. 13) : une très petite
// entreprise relève du SMT tant que son chiffre d'affaires annuel ne dépasse
// pas ces montants. Au-dessus, c'est le Système normal.
// À VÉRIFIER AUPRÈS D'UN COMPTABLE : ces seuils sont fixés par l'Acte
// uniforme et peuvent être révisés. Ils sont ici, en un seul endroit, pour
// qu'une correction ne demande qu'une ligne.
// En dessous de ce montant, un écart entre l'actif et ce que les chiffres
// expliquent vient des arrondis, pas d'une erreur de saisie.
const ECART_NEGLIGEABLE = 1000;

const SEUILS_SMT = {
  negoce: { montant: 30000000, nom: "le négoce", aide: "acheter pour revendre" },
  artisanat: { montant: 20000000, nom: "l'artisanat", aide: "fabriquer soi-même" },
  services: { montant: 10000000, nom: "les services", aide: "vendre son travail" }
};

// La nature de l'activité, décidée par ce qui rapporte le plus dans l'année :
// une boutique qui revend ET fabrique relève du seuil de son métier principal.
function natureActivite(ex) {
  const parts = [
    { cle: "negoce", valeur: ex.TA },
    { cle: "artisanat", valeur: ex.TB },
    { cle: "services", valeur: ex.TC }
  ].sort(function (a, b) { return b.valeur - a.valeur; });
  if (parts[0].valeur > 0) return parts[0].cle;
  // Aucune vente encore : on se fie à ce qui a été répondu au questionnaire.
  const a = donnees.boutique.activites || [];
  if (a.indexOf("revente") !== -1) return "negoce";
  if (a.indexOf("fabrication") !== -1) return "artisanat";
  if (a.indexOf("services") !== -1) return "services";
  return "negoce";
}

function regimeOhada(ex) {
  const cle = natureActivite(ex);
  const seuil = SEUILS_SMT[cle];
  const smt = ex.XB <= seuil.montant;
  return { cle: cle, seuil: seuil, smt: smt, chiffre: ex.XB };
}

/* =======================================================================
   2. OÙ VA CHAQUE DÉPENSE DANS LE MODÈLE OHADA
   ======================================================================= */

// Le modèle OHADA range les charges par NATURE, pas par usage. Canari ne
// connaît que le nom que le commerçant a écrit : on le reconnaît par mots-clés
// et on montre le rangement à l'écran, pour qu'il puisse le corriger.
// Les mots sont écrits sans accent et en minuscules : la comparaison enlève
// les accents, donc « électricité » et « electricite » tombent au même endroit.
const POSTES_CHARGES = [
  { ref: "RK", nom: "Charges de personnel",
    mots: ["salaire", "employe", "personnel", "main d oeuvre", "main-d oeuvre", "apprenti", "paie", "ouvrier", "vendeuse", "vendeur"] },
  { ref: "RG", nom: "Transports",
    mots: ["transport", "carburant", "essence", "gasoil", "taxi", "gbaka", "livraison", "fret", "moto", "peage", "voyage"] },
  { ref: "RI", nom: "Impôts et taxes",
    mots: ["impot", "taxe", "patente", "dgi", "ticket de marche", "vignette", "douane", "timbre", "communale"] },
  { ref: "RH", nom: "Services extérieurs",
    mots: ["loyer", "electricite", "eau", "internet", "telephone", "credit telephone", "publicite", "pub",
           "gardiennage", "assurance", "entretien", "reparation", "banque", "frais", "abonnement", "forfait", "mobile money"] },
  { ref: "RE", nom: "Autres achats",
    mots: ["emballage", "sachet", "fourniture", "gaz", "charbon", "bois", "glace", "nettoyage", "savon"] }
];
const POSTE_PAR_DEFAUT = { ref: "RJ", nom: "Autres charges" };

// RA ou RC ? L'OHADA sépare ce qu'on achète pour REVENDRE TEL QUEL
// (RA, achats de marchandises) de ce qu'on achète pour FABRIQUER
// (RC, achats de matières premières). La différence n'est pas un détail : la
// farine d'un boulanger rangée en RA donne une marge commerciale négative et
// un compte de résultat qui ne veut plus rien dire.
// Canari reconnaît l'achat par son libellé : un intrant connu, ou un produit
// connu dont le type décide. Sinon, c'est ce que la boutique a déclaré vendre
// au questionnaire qui tranche.
function posteAchat(note) {
  const t = sansAccent(note);
  if (t) {
    const intrants = typeof listeIntrants === "function" ? listeIntrants() : [];
    for (let i = 0; i < intrants.length; i++) {
      const n = sansAccent(intrants[i].nom);
      if (n && t.indexOf(n) !== -1) return "RC";
    }
    const produits = listeProduits();
    for (let i = 0; i < produits.length; i++) {
      const n = sansAccent(produits[i].nom);
      if (n && t.indexOf(n) !== -1) return typeDe(produits[i]) === "revente" ? "RA" : "RC";
    }
  }
  const a = donnees.boutique.activites || [];
  if (!a.length || a.indexOf("revente") !== -1) return "RA";
  return "RC";
}

function sansAccent(t) {
  return String(t || "").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, " ").replace(/\s+/g, " ").trim();
}

// Le poste OHADA d'une dépense ou d'une charge, d'après sa catégorie puis son nom.
function posteOhada(nom, categorie) {
  if (categorie === "impot") return POSTES_CHARGES[2];      // RI, sans discuter
  const t = sansAccent(nom);
  if (t) {
    for (let i = 0; i < POSTES_CHARGES.length; i++) {
      const p = POSTES_CHARGES[i];
      for (let j = 0; j < p.mots.length; j++) {
        if (t.indexOf(p.mots[j]) !== -1) return p;
      }
    }
  }
  return POSTE_PAR_DEFAUT;
}

/* =======================================================================
   3. LE COMPTE DE RÉSULTAT OHADA
   ======================================================================= */

// Il est construit sur les mouvements RÉELLEMENT notés — pas sur les parts de
// charges estimées que Canari étale sur les jours (voir comptes.js). C'est ce
// qui permet au bilan de s'équilibrer : une charge estimée ne sort d'aucune
// caisse et ne peut donc apparaître dans aucun bilan.
function exerciceOhada(annee) {
  return memo("ohada-resultat-" + annee, function () { return calculExerciceOhada(annee); });
}
function calculExerciceOhada(annee) {
  const debut = new Date(annee, 0, 1, 0, 0, 0, 0).getTime();
  const finAnnee = new Date(annee, 11, 31, 23, 59, 59, 999).getTime();
  const fin = Math.min(finAnnee, Date.now());
  const e = {
    annee: annee, debut: debut, fin: fin, finAnnee: finAnnee, enCours: finAnnee > Date.now(),
    TA: 0, TB: 0, TC: 0, TD: 0, TE: 0,   // produits d'exploitation
    RA: 0, RB: 0, RC: 0, RD: 0, RE: 0, RG: 0, RH: 0, RI: 0, RJ: 0, RK: 0, RL: 0,
    prelevements: 0,                      // compte de l'exploitant (« pris pour la maison »)
    detailCharges: {},                    // ce qui a été rangé où, pour l'afficher
    vide: true
  };
  const ajouter = function (ref, montant, nom) {
    e[ref] += montant;
    const d = e.detailCharges[ref] || (e.detailCharges[ref] = { total: 0, lignes: {} });
    d.total += montant;
    if (nom) d.lignes[nom] = (d.lignes[nom] || 0) + montant;
  };

  donnees.mouvements.forEach(function (m) {
    if (m.t < debut || m.t > fin) return;
    e.vide = false;
    if (m.type === "vente" || m.type === "credit") {
      // Une vente par produits se répartit selon le type de chaque produit ;
      // une vente au montant est du négoce par défaut.
      if (m.lignes && m.lignes.length) {
        m.lignes.forEach(function (l) {
          const p = donnees.produits[l.produitId];
          const t = p ? typeDe(p) : "revente";
          const valeur = l.prix * l.qte;
          if (t === "fabrication") e.TB += valeur;
          else if (t === "service") e.TC += valeur;
          else e.TA += valeur;
        });
        // Un arrondi ou une remise sur le total : il va au négoce.
        const somme = m.lignes.reduce(function (s, l) { return s + l.prix * l.qte; }, 0);
        e.TA += m.montant - somme;
      } else {
        e.TA += m.montant;
      }
    } else if (m.type === "depense") {
      if (m.categorie === "marchandise" || estMarchandise(m)) ajouter(posteAchat(m.note), m.montant, m.note || "Marchandise");
      else {
        const poste = posteOhada(m.note || m.categorie, m.categorie);
        ajouter(poste.ref, m.montant, m.note || poste.nom);
      }
    } else if (m.type === "fdette") {
      // Un achat à crédit est un achat de l'exercice, même s'il n'est pas payé.
      ajouter(posteAchat(m.note), m.montant, m.note || "Marchandise à crédit");
    }
    else if (m.type === "maison") e.prelevements += m.montant;
  });

  // Les trois stocks du modèle OHADA ne jouent pas le même rôle :
  //   RB · variation des MARCHANDISES (achetées pour être revendues telles
  //        quelles) : stock de début − stock de fin. Si le stock a monté, la
  //        variation est négative et vient en moins des achats, parce que
  //        cette marchandise-là n'a pas encore été vendue ;
  //   RD · variation des MATIÈRES PREMIÈRES, même principe ;
  //   TE · PRODUCTION STOCKÉE : ce que la boutique a fabriqué sans l'avoir
  //        encore vendu. C'est un produit, pas une charge : il s'ajoute.
  const stockDebut = valeurStockAu(debut - 1);
  const stockFin = valeurStockAu(fin);
  e.RB = stockDebut.marchandises - stockFin.marchandises;
  e.RD = stockDebut.intrants - stockFin.intrants;
  e.TE = stockFin.produitsFinis - stockDebut.produitsFinis;

  // RL · Dotations aux amortissements : l'usure du matériel sur l'année.
  e.RL = usureDeLAnnee(annee, fin);

  /* --- Les soldes du modèle OHADA --- */
  e.XA = e.TA - e.RA - e.RB;                                    // marge commerciale
  e.XB = e.TA + e.TB + e.TC + e.TD;                             // chiffre d'affaires
  e.XC = e.XA + e.TB + e.TC + e.TD + e.TE                       // valeur ajoutée
       - e.RC - e.RD - e.RE - e.RG - e.RH - e.RI - e.RJ;
  e.XD = e.XC - e.RK;                                           // excédent brut d'exploitation
  e.XE = e.XD - e.RL;                                           // résultat d'exploitation
  e.XF = 0;                                                     // résultat financier
  e.XG = e.XE + e.XF;                                           // résultat des activités ordinaires
  e.XH = 0;                                                     // hors activités ordinaires
  e.RS = 0;                                                     // impôt sur le résultat (non suivi)
  e.XI = e.XG + e.XH - e.RS;                                    // RÉSULTAT NET
  return e;
}

// L'usure du matériel sur une année : la part de chaque investissement qui
// tombe dans cette année-là.
function usureDeLAnnee(annee, fin) {
  const debut = new Date(annee, 0, 1, 0, 0, 0, 0).getTime();
  let total = 0;
  donnees.mouvements.forEach(function (m) {
    if (m.type !== "invest" || m.t > fin) return;
    const duree = Math.max(1, m.duree || 3) * 365 * JOUR;
    const parMs = m.montant / duree;
    const depart = Math.max(m.t, debut);
    const arret = Math.min(fin, m.t + duree);
    if (arret > depart) total += (arret - depart) * parMs;
  });
  return Math.round(total);
}

// La valeur du stock à une date, au prix d'achat moyen d'aujourd'hui,
// séparée en marchandises et matières premières (intrants).
function valeurStockAu(ts) {
  return memo("ohada-stock-" + ts, function () {
    const qte = {}, qteIntrant = {};
    donnees.mouvements.forEach(function (m) {
      if (m.t > ts) return;
      if (m.type === "stock") qte[m.produitId] = (qte[m.produitId] || 0) + m.quantite;
      if (m.type === "intrant") qteIntrant[m.intrantId] = (qteIntrant[m.intrantId] || 0) + m.quantite;
      if (m.lignes) m.lignes.forEach(function (l) {
        qte[l.produitId] = (qte[l.produitId] || 0) - l.qte;
        if (l.consommation) l.consommation.forEach(function (c) { qteIntrant[c.intrantId] = (qteIntrant[c.intrantId] || 0) - c.qte; });
      });
      if (m.consommation) m.consommation.forEach(function (c) { qteIntrant[c.intrantId] = (qteIntrant[c.intrantId] || 0) - c.qte; });
    });
    let marchandises = 0, produitsFinis = 0, intrants = 0;
    Object.keys(qte).forEach(function (id) {
      const p = donnees.produits[id];
      if (!p) return;
      const valeur = Math.max(0, qte[id]) * (coutProduit(p) || 0);
      if (typeDe(p) === "revente") marchandises += valeur; else produitsFinis += valeur;
    });
    Object.keys(qteIntrant).forEach(function (id) {
      const i = donnees.intrants[id];
      if (i) intrants += Math.max(0, qteIntrant[id]) * (i.cout || 0);
    });
    return {
      marchandises: Math.round(marchandises),
      produitsFinis: Math.round(produitsFinis),
      intrants: Math.round(intrants),
      produits: Math.round(marchandises + produitsFinis),   // tout le stock de produits
      total: Math.round(marchandises + produitsFinis + intrants)
    };
  });
}

/* =======================================================================
   4. LE BILAN OHADA
   ======================================================================= */

// L'apport de départ : ce que le commerçant a mis dans la boutique le premier
// jour — son argent, et la marchandise qu'il avait déjà. C'est le capital.
function apportDeDepart() {
  return memo("ohada-apport", function () {
    let argent = 0;
    const depart = departParMoyen();
    Object.keys(depart).forEach(function (k) { argent += depart[k] || 0; });
    let marchandise = 0;
    donnees.mouvements.forEach(function (m) {
      if (m.raison !== "depart") return;
      if (m.type === "stock") {
        const p = donnees.produits[m.produitId];
        if (p) marchandise += m.quantite * (coutProduit(p) || 0);
      } else if (m.type === "intrant") {
        const i = donnees.intrants[m.intrantId];
        if (i) marchandise += m.quantite * (i.cout || 0);
      }
    });
    return Math.round(argent + marchandise);
  });
}

function bilanOhada(annee) {
  return memo("ohada-bilan-" + annee, function () { return calculBilanOhada(annee); });
}
function calculBilanOhada(annee) {
  const ex = exerciceOhada(annee);
  const ts = ex.fin;
  const b = bilanAu(ts);               // les mêmes chiffres que comptes.js : un seul calcul
  const stock = valeurStockAu(ts);

  // Le matériel : son prix d'achat (brut), ce qui s'est usé (amortissements),
  // et ce qui lui reste (net) — les trois colonnes du modèle OHADA.
  let brut = 0, amort = 0;
  donnees.mouvements.forEach(function (m) {
    if (m.type !== "invest" || m.t > ts) return;
    const duree = Math.max(1, m.duree || 3) * 365 * JOUR;
    const use = Math.min(m.montant, m.montant * (ts - m.t) / duree);
    brut += m.montant;
    amort += Math.max(0, use);
  });
  brut = Math.round(brut); amort = Math.round(amort);
  const netImmo = brut - amort;

  const caisse = b.caisse;
  const tresorerieActif = Math.max(0, caisse);
  const tresoreriePassif = Math.max(0, -caisse);   // une caisse négative est un découvert

  const actif = {
    AM: { brut: brut, amort: amort, net: netImmo },
    AZ: netImmo,
    BB: stock.total,
    BI: b.creances,
    BK: stock.total + b.creances,
    BS: tresorerieActif,
    BT: tresorerieActif,
    BZ: netImmo + stock.total + b.creances + tresorerieActif
  };

  /* --- Les capitaux propres, à la manière de l'OHADA ---
     CA  le capital : l'apport du premier jour ;
     CH  le report à nouveau : tout ce que les années passées ont laissé,
         moins ce que le commerçant a pris pour la maison ces années-là ;
     CJ  le résultat de l'exercice ;
     puis les prélèvements de l'exercice (le compte de l'exploitant).
     L'ÉCART : Canari n'est pas une comptabilité en partie double. Si des
     arrivages ont été notés sans leur prix, ou si l'argent de départ n'a
     jamais été déclaré, le compte ne tombe pas juste. On montre l'écart au
     lieu de le cacher : c'est lui qui dit où le carnet a des trous. */
  let report = 0;
  for (let a = premiereAnneeOhada(); a < annee; a++) {
    const p = exerciceOhada(a);
    report += p.XI - p.prelevements;
  }
  report = Math.round(report);
  const capital = apportDeDepart();
  const propresCalcules = capital + report + ex.XI - ex.prelevements;
  const propresReels = actif.BZ - b.dettes - tresoreriePassif;
  let ecart = Math.round(propresReels - propresCalcules);
  // Sous 1 000 F, c'est de l'arrondi, pas un trou dans le carnet : on le range
  // dans le report à nouveau pour que la colonne tombe juste à l'affichage.
  if (Math.abs(ecart) < ECART_NEGLIGEABLE) { report += ecart; ecart = 0; }

  const passif = {
    CA: capital,
    CH: report,
    CJ: Math.round(ex.XI),
    prelevements: Math.round(ex.prelevements),
    ecart: ecart,
    CP: Math.round(propresReels),
    DJ: b.dettes,
    DP: b.dettes,
    DR: tresoreriePassif,
    DT: tresoreriePassif,
    DZ: Math.round(propresReels + b.dettes + tresoreriePassif)
  };
  return { annee: annee, date: ts, enCours: ex.enCours, actif: actif, passif: passif, ecart: ecart };
}

function premiereAnneeOhada() {
  return memo("ohada-premiere-annee", function () {
    const premier = donnees.mouvements.reduce(function (min, m) { return Math.min(min, m.t); }, Infinity);
    return premier === Infinity ? new Date().getFullYear() : new Date(premier).getFullYear();
  });
}

/* =======================================================================
   5. L'ÉCRAN
   ======================================================================= */

let anneeOhada = 0;
let toutVoirOhada = false;   // montrer aussi les lignes à zéro du modèle

function anneeOhadaChoisie() {
  const liste = anneesComptables();
  return liste.indexOf(anneeOhada) !== -1 ? anneeOhada : liste[liste.length - 1];
}

// Un montant du modèle : aligné à droite, en chiffres tabulaires, et vide
// quand il n'y a rien (le modèle OHADA laisse la case vide, il n'écrit pas 0).
function mt(n) {
  const v = Math.round(n || 0);
  return v === 0 ? '<td class="ohada-vide">—</td>'
    : '<td' + (v < 0 ? ' class="m-negatif"' : '') + '>' + sommeF(v) + '</td>';
}

// Les lignes de CHARGES du modèle OHADA. Elles s'écrivent en négatif dans la
// colonne : sans le signe, « Ventes 936 192 » puis « Achats 569 120 » puis
// « MARGE 355 632 » a l'air d'une erreur de calcul. Avec le signe, la colonne
// s'additionne de haut en bas, comme sur le formulaire.
const CHARGES_OHADA = ["RA", "RB", "RC", "RD", "RE", "RF", "RG", "RH", "RI",
  "RJ", "RK", "RL", "RM", "RN", "RO", "RP", "RQ", "RS"];

// Une ligne du modèle. `total` met la ligne en gras avec son filet.
function ligneOhada(ref, libelle, valeurs, total) {
  const charge = CHARGES_OHADA.indexOf(ref) !== -1;
  const v = charge ? valeurs.map(function (x) { return -(x || 0); }) : valeurs;
  const rien = v.every(function (x) { return !Math.round(x || 0); });
  if (rien && !total && !toutVoirOhada) return "";
  return '<tr class="' + (total ? "ohada-total" : "") + '">' +
    '<td class="ohada-ref" translate="no">' + ref + '</td>' +
    '<th scope="row">' + libelle + '</th>' +
    v.map(mt).join("") + '</tr>';
}

function compteResultatOhadaHtml(n, p) {
  const l = function (ref, libelle, cle, total) {
    return ligneOhada(ref, libelle, [n[cle], p ? p[cle] : 0], total);
  };
  return '<table class="comptes-table ohada-table">' +
    '<caption>Compte de résultat — exercice clos le ' + (n.enCours ? "jour d'aujourd'hui" : "31 décembre " + n.annee) + '</caption>' +
    '<thead><tr><th scope="col">Réf</th><th scope="col">Libellé</th>' +
      '<th scope="col">' + n.annee + (n.enCours ? " *" : "") + '</th>' +
      '<th scope="col">' + (p ? p.annee : "—") + '</th></tr></thead><tbody>' +
    l("TA", "Ventes de marchandises", "TA") +
    l("RA", "Achats de marchandises", "RA") +
    l("RB", "Variation de stocks de marchandises", "RB") +
    l("XA", "MARGE COMMERCIALE", "XA", true) +
    l("TB", "Ventes de produits fabriqués", "TB") +
    l("TC", "Travaux, services vendus", "TC") +
    l("TD", "Produits accessoires", "TD") +
    l("XB", "CHIFFRE D'AFFAIRES", "XB", true) +
    l("TE", "Production stockée (ou déstockage)", "TE") +
    l("RC", "Achats de matières premières et fournitures liées", "RC") +
    l("RD", "Variation de stocks de matières premières", "RD") +
    l("RE", "Autres achats", "RE") +
    l("RG", "Transports", "RG") +
    l("RH", "Services extérieurs", "RH") +
    l("RI", "Impôts et taxes", "RI") +
    l("RJ", "Autres charges", "RJ") +
    l("XC", "VALEUR AJOUTÉE", "XC", true) +
    l("RK", "Charges de personnel", "RK") +
    l("XD", "EXCÉDENT BRUT D'EXPLOITATION", "XD", true) +
    l("RL", "Dotations aux amortissements et aux provisions", "RL") +
    l("XE", "RÉSULTAT D'EXPLOITATION", "XE", true) +
    l("XF", "RÉSULTAT FINANCIER", "XF", true) +
    l("XG", "RÉSULTAT DES ACTIVITÉS ORDINAIRES", "XG", true) +
    l("XH", "RÉSULTAT HORS ACTIVITÉS ORDINAIRES", "XH", true) +
    l("RS", "Impôts sur le résultat", "RS") +
    l("XI", "RÉSULTAT NET", "XI", true) +
    '</tbody></table>';
}

function bilanOhadaHtml(n, p) {
  const A = n.actif, AP = p ? p.actif : null;
  const P = n.passif, PP = p ? p.passif : null;
  const la = function (ref, libelle, cle, total) {
    return ligneOhada(ref, libelle, [A[cle], AP ? AP[cle] : 0], total);
  };
  const lp = function (ref, libelle, cle, total) {
    return ligneOhada(ref, libelle, [P[cle], PP ? PP[cle] : 0], total);
  };
  const entete = '<thead><tr><th scope="col">Réf</th><th scope="col">Libellé</th>' +
    '<th scope="col">' + n.annee + (n.enCours ? " *" : "") + '</th>' +
    '<th scope="col">' + (p ? p.annee : "—") + '</th></tr></thead>';
  const amort = A.AM.amort ?
    '<tr><td class="ohada-ref"></td><th scope="row" class="ohada-detail">dont prix d\'achat ' + franc(A.AM.brut) +
      ', déjà usé ' + franc(A.AM.amort) + '</th><td colspan="2"></td></tr>' : "";
  return '<table class="comptes-table ohada-table">' +
    '<caption>Bilan au ' + (n.enCours ? "jour d'aujourd'hui" : "31 décembre " + n.annee) + ' — ACTIF</caption>' +
    entete + '<tbody>' +
    ligneOhada("AM", "Matériel, mobilier et actifs biologiques", [A.AM.net, AP ? AP.AM.net : 0]) + amort +
    la("AZ", "TOTAL ACTIF IMMOBILISÉ", "AZ", true) +
    la("BB", "Stocks et encours", "BB") +
    la("BI", "Clients et comptes rattachés", "BI") +
    la("BK", "TOTAL ACTIF CIRCULANT", "BK", true) +
    la("BS", "Banques, chèques postaux, caisse et assimilés", "BS") +
    la("BT", "TOTAL TRÉSORERIE-ACTIF", "BT", true) +
    la("BZ", "TOTAL GÉNÉRAL", "BZ", true) +
    '</tbody></table>' +
    '<table class="comptes-table ohada-table">' +
    '<caption>Bilan au ' + (n.enCours ? "jour d'aujourd'hui" : "31 décembre " + n.annee) + ' — PASSIF</caption>' +
    entete + '<tbody>' +
    lp("CA", "Capital (apport de départ)", "CA") +
    lp("CH", "Report à nouveau", "CH") +
    lp("CJ", "Résultat net de l'exercice", "CJ") +
    ligneOhada("", "Prélèvements de l'exploitant", [-P.prelevements, PP ? -PP.prelevements : 0]) +
    (P.ecart ? ligneOhada("", "Écart à régulariser (voir la note en bas)", [P.ecart, PP ? PP.ecart : 0]) : "") +
    lp("CP", "TOTAL CAPITAUX PROPRES", "CP", true) +
    lp("DJ", "Fournisseurs d'exploitation", "DJ") +
    lp("DP", "TOTAL PASSIF CIRCULANT", "DP", true) +
    lp("DR", "Banques, crédits de trésorerie", "DR") +
    lp("DT", "TOTAL TRÉSORERIE-PASSIF", "DT", true) +
    lp("DZ", "TOTAL GÉNÉRAL", "DZ", true) +
    '</tbody></table>';
}

// Le rangement des charges, montré en clair : c'est la seule partie que Canari
// devine, donc c'est la seule que le commerçant doit pouvoir vérifier.
function rangementHtml(ex) {
  const refs = Object.keys(ex.detailCharges).filter(function (r) { return ex.detailCharges[r].total > 0; });
  if (!refs.length) return "";
  const NOMS = {
    RA: "Achats de marchandises",
    RC: "Achats de matières premières et fournitures liées",
    RJ: POSTE_PAR_DEFAUT.nom
  };
  POSTES_CHARGES.forEach(function (x) { NOMS[x.ref] = x.nom; });
  const nomDe = function (ref) { return NOMS[ref] || ref; };
  return '<section class="famille"><h2 class="titre-liste">Comment Canari a rangé tes dépenses</h2>' +
    '<p class="aide famille-aide">Canari reconnaît tes dépenses par leur nom. Si une ligne est au mauvais endroit, renomme-la : « Salaire Awa » part dans les charges de personnel, « Loyer boutique » dans les services extérieurs.</p>' +
    '<div class="carte-graphe"><table class="comptes-table ohada-table"><tbody>' +
    refs.sort().map(function (ref) {
      const d = ex.detailCharges[ref];
      const noms = Object.keys(d.lignes).sort(function (a, b) { return d.lignes[b] - d.lignes[a]; }).slice(0, 6);
      return '<tr class="ohada-total"><td class="ohada-ref" translate="no">' + ref + '</td>' +
        '<th scope="row">' + nomDe(ref) + '</th>' + mt(d.total) + '</tr>' +
        noms.map(function (n) {
          return '<tr><td class="ohada-ref"></td><th scope="row" class="ohada-detail" translate="no">' + echapper(n) + '</th>' + mt(d.lignes[n]) + '</tr>';
        }).join("");
    }).join("") +
    '</tbody></table></div></section>';
}

function regimeHtml(ex) {
  const r = regimeOhada(ex);
  return '<section class="famille"><h2 class="titre-liste">Quel système t\'est applicable</h2>' +
    '<div class="ohada-regime ohada-' + (r.smt ? "smt" : "normal") + '">' +
    '<b>' + (r.smt ? "Système Minimal de Trésorerie (SMT)" : "Système normal") + '</b>' +
    '<p>Ton activité principale, c\'est ' + r.seuil.nom + ' (' + r.seuil.aide + '). ' +
      'Le seuil du SMT pour cette activité est de ' + franc(r.seuil.montant) + ' de chiffre d\'affaires par an. ' +
      'Tu es à ' + franc(Math.round(r.chiffre)) + '.</p>' +
    '<p class="aide">' + (r.smt
      ? "Tu relèves donc du système le plus simple : des états réduits, et pas de comptabilité en partie double obligatoire."
      : "Tu dépasses le seuil : l'OHADA demande alors des états complets et une comptabilité tenue par un professionnel.") +
    '</p>' +
    '<p class="aide">Source : Acte uniforme OHADA relatif au droit comptable et à l\'information financière, article 13. Fais confirmer le seuil par un comptable : il peut être révisé.</p>' +
    '</div></section>';
}

function notesOhadaHtml(n, ex) {
  const items = [];
  if (n.actif.AM.brut) {
    items.push("Note 3 · Matériel : prix d'achat " + franc(n.actif.AM.brut) +
      ", amortissements cumulés " + franc(n.actif.AM.amort) + ", valeur nette " + franc(n.actif.AM.net) + ".");
  }
  if (n.actif.BB) {
    const s = valeurStockAu(n.date);
    const morceaux = [];
    if (s.marchandises) morceaux.push("marchandises " + franc(s.marchandises));
    if (s.produitsFinis) morceaux.push("produits finis " + franc(s.produitsFinis));
    if (s.intrants) morceaux.push("matières premières " + franc(s.intrants));
    items.push("Note 6 · Stocks : " + morceaux.join(", ") + ", comptés au prix d'achat moyen d'aujourd'hui.");
  }
  if (n.actif.BI) {
    const clients = clientsQuiDoivent();
    items.push("Note 7 · Clients : " + pluriel(clients.length, "client") + " pour " + franc(n.actif.BI) + ".");
  }
  if (n.passif.DJ) {
    const f = fournisseursQueJeDois();
    items.push("Note 16 · Fournisseurs : " + pluriel(f.length, "fournisseur") + " pour " + franc(n.passif.DJ) + ".");
  }
  items.push("Note 27 · Prélèvements de l'exploitant sur l'exercice : " + franc(n.passif.prelevements) + ".");
  return '<section class="famille"><h2 class="titre-liste">Notes annexes</h2>' +
    '<ul class="aide ohada-notes">' + items.map(function (i) { return '<li>' + i + '</li>'; }).join("") + '</ul></section>';
}

function avertissementOhadaHtml(n) {
  return '<div class="ohada-avertissement">' +
    '<b>À lire avant de montrer ces états à qui que ce soit</b>' +
    '<p>Canari note ce que tu fais ; il ne tient pas une comptabilité en partie double.</p>' +
    '<p>Ces pages sont une présentation au format OHADA de ce que tu as noté — pas des états certifiés.</p>' +
    '<p>Avant un dépôt aux impôts ou une demande à la banque, un expert-comptable doit les reprendre.</p>' +
    (n.ecart ? '<p class="negatif">Il reste un écart de ' + franc(Math.abs(n.ecart)) + ' entre ce que ta boutique possède et ce que tes chiffres expliquent. C\'est presque toujours la même chose : un arrivage noté sans son prix, ou l\'argent que tu avais au départ jamais déclaré. Corrige-le dans Réglages → Argent en caisse, et note le prix de chaque arrivage.</p>' : '') +
    '</div>';
}

function manquantsOhadaHtml() {
  return '<section class="famille note-comptes"><h2 class="titre-liste">Ce que Canari ne sait pas remplir</h2>' +
    '<p class="aide famille-aide">Ces lignes du modèle OHADA restent vides parce que Canari ne suit pas encore ce qu\'elles demandent. Ce n\'est pas une erreur : c\'est une boutique qui n\'a pas ces opérations, ou un suivi qui n\'existe pas dans l\'appli.</p>' +
    // Chaque poste est en DEUX éléments : le nom, puis la phrase. Un <b> au
    // milieu d'une phrase la couperait en morceaux et la traduction anglaise
    // ne reconnaîtrait plus rien.
    '<ul class="ohada-manques">' + [
      ["Immobilisations incorporelles et financières (AD, AQ)", "Canari ne note que le matériel."],
      ["Emprunts et dettes financières (DA)", "Les prêts ne sont pas suivis."],
      ["Dettes fiscales et sociales (DK)", "Canari note les taxes quand elles sont payées, pas quand elles sont dues."],
      ["Résultat financier (XF) et hors activités ordinaires (XH)", "Ni intérêts, ni cession de matériel."],
      ["Impôt sur le résultat (RS)", "Il se calcule sur le résultat fiscal, que seul un comptable peut établir."],
      ["Achats de matières premières (RC)", "Canari range tous les achats de marchandise en RA, sans les séparer."],
      ["Tableau de flux de trésorerie et notes annexes complètes", "Non produits."]
    ].map(function (l) { return '<li><b>' + l[0] + '</b><p>' + l[1] + '</p></li>'; }).join("") +
    '</ul></section>';
}

function afficherOhada() {
  const liste = anneesComptables();
  const annee = anneeOhadaChoisie();
  const ex = exerciceOhada(annee);
  const precedent = annee - 1 >= premiereAnneeOhada() ? exerciceOhada(annee - 1) : null;
  const n = bilanOhada(annee);
  const p = precedent ? bilanOhada(annee - 1) : null;
  const b = donnees.boutique;

  let html = '<div class="ohada-entete">' +
      '<h2' + (b.nom ? ' translate="no"' : '') + '>' + (b.nom ? echapper(b.nom) : "Ma boutique") + '</h2>' +
      '<p>États financiers · exercice ' + annee + '</p>' +
      (b.rccm ? '<p class="aide">RCCM ' + echapper(b.rccm) + '</p>' : "") +
      (b.dfe ? '<p class="aide">Compte contribuable ' + echapper(b.dfe) + '</p>' : "") +
      '<p class="aide">Référentiel : SYSCOHADA révisé (AUDCIF)</p>' +
    '</div>' +
    avertissementOhadaHtml(n);

  html += '<div class="annees-choix" role="group" aria-label="Exercice regardé">' + liste.map(function (a) {
      return '<button type="button" class="choix" data-annee-ohada="' + a + '" aria-pressed="' + (a === annee) + '">' + a + '</button>';
    }).join("") + '</div>';

  if (ex.vide) {
    html += '<div class="vide"><img class="scene" src="icones/fonds/canari-croissance.webp" width="210" height="280" alt="">' +
      '<p>Rien de noté en ' + annee + '.<br>Les états se remplissent tout seuls à partir de ce que tu notes.</p></div>';
    $("vue-ohada").innerHTML = html;
    return;
  }

  html += regimeHtml(ex);
  html += '<section class="famille"><h2 class="titre-liste">Compte de résultat</h2>' +
    '<div class="carte-graphe">' + compteResultatOhadaHtml(ex, precedent) + '</div></section>';
  html += '<section class="famille"><h2 class="titre-liste">Bilan</h2>' +
    '<div class="carte-graphe">' + bilanOhadaHtml(n, p) + '</div></section>';
  html += rangementHtml(ex);
  html += notesOhadaHtml(n, ex);
  html += manquantsOhadaHtml();
  html += '<div class="comptes-boutons">' +
    '<button type="button" class="bouton bouton-annuler" id="ohada-tout">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>' +
      (toutVoirOhada ? "Cacher les lignes vides" : "Voir toutes les lignes du modèle") + '</button>' +
    '<button type="button" class="bouton bouton-sauver" id="ohada-pdf">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM14 3v5h5"/></svg>Télécharger en PDF</button>' +
    '<button type="button" class="bouton bouton-annuler" id="ohada-excel">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>Télécharger en Excel</button>' +
    '</div>';
  if (ex.enCours) html += '<p class="aide">* L\'exercice ' + annee + ' n\'est pas clos : ces chiffres s\'arrêtent à aujourd\'hui.</p>';
  $("vue-ohada").innerHTML = html;
}

/* =======================================================================
   6. TÉLÉCHARGER LES ÉTATS
   ======================================================================= */

function feuillesOhada() {
  const annee = anneeOhadaChoisie();
  const ex = exerciceOhada(annee);
  const precedent = annee - 1 >= premiereAnneeOhada() ? exerciceOhada(annee - 1) : null;
  const n = bilanOhada(annee);
  const p = precedent ? bilanOhada(annee - 1) : null;
  const entete = ["Réf", "Libellé", String(annee), precedent ? String(annee - 1) : ""];
  const formats = ["texte", "texte", "nombre", "nombre"];
  const l = function (ref, libelle, a, b2) { return [ref, libelle, Math.round(a || 0), Math.round(b2 || 0)]; };

  const resultat = [entete,
    l("TA", "Ventes de marchandises", ex.TA, precedent && precedent.TA),
    l("RA", "Achats de marchandises", -ex.RA, precedent && -precedent.RA),
    l("RB", "Variation de stocks de marchandises", -ex.RB, precedent && -precedent.RB),
    l("XA", "MARGE COMMERCIALE", ex.XA, precedent && precedent.XA),
    l("TB", "Ventes de produits fabriqués", ex.TB, precedent && precedent.TB),
    l("TC", "Travaux, services vendus", ex.TC, precedent && precedent.TC),
    l("XB", "CHIFFRE D'AFFAIRES", ex.XB, precedent && precedent.XB),
    l("TE", "Production stockée (ou déstockage)", ex.TE, precedent && precedent.TE),
    l("RC", "Achats de matières premières", -ex.RC, precedent && -precedent.RC),
    l("RD", "Variation de stocks de matières premières", -ex.RD, precedent && -precedent.RD),
    l("RE", "Autres achats", -ex.RE, precedent && -precedent.RE),
    l("RG", "Transports", -ex.RG, precedent && -precedent.RG),
    l("RH", "Services extérieurs", -ex.RH, precedent && -precedent.RH),
    l("RI", "Impôts et taxes", -ex.RI, precedent && -precedent.RI),
    l("RJ", "Autres charges", -ex.RJ, precedent && -precedent.RJ),
    l("XC", "VALEUR AJOUTÉE", ex.XC, precedent && precedent.XC),
    l("RK", "Charges de personnel", -ex.RK, precedent && -precedent.RK),
    l("XD", "EXCÉDENT BRUT D'EXPLOITATION", ex.XD, precedent && precedent.XD),
    l("RL", "Dotations aux amortissements", -ex.RL, precedent && -precedent.RL),
    l("XE", "RÉSULTAT D'EXPLOITATION", ex.XE, precedent && precedent.XE),
    l("XG", "RÉSULTAT DES ACTIVITÉS ORDINAIRES", ex.XG, precedent && precedent.XG),
    l("XI", "RÉSULTAT NET", ex.XI, precedent && precedent.XI)
  ];

  const bilanL = [entete,
    l("AM", "Matériel, mobilier et actifs biologiques (net)", n.actif.AM.net, p && p.actif.AM.net),
    l("", "dont prix d'achat", n.actif.AM.brut, p && p.actif.AM.brut),
    l("", "dont amortissements cumulés", -n.actif.AM.amort, p && -p.actif.AM.amort),
    l("AZ", "TOTAL ACTIF IMMOBILISÉ", n.actif.AZ, p && p.actif.AZ),
    l("BB", "Stocks et encours", n.actif.BB, p && p.actif.BB),
    l("BI", "Clients et comptes rattachés", n.actif.BI, p && p.actif.BI),
    l("BK", "TOTAL ACTIF CIRCULANT", n.actif.BK, p && p.actif.BK),
    l("BS", "Banques, chèques postaux, caisse et assimilés", n.actif.BS, p && p.actif.BS),
    l("BT", "TOTAL TRÉSORERIE-ACTIF", n.actif.BT, p && p.actif.BT),
    l("BZ", "TOTAL GÉNÉRAL ACTIF", n.actif.BZ, p && p.actif.BZ),
    ["", "", "", ""],
    l("CA", "Capital (apport de départ)", n.passif.CA, p && p.passif.CA),
    l("CH", "Report à nouveau", n.passif.CH, p && p.passif.CH),
    l("CJ", "Résultat net de l'exercice", n.passif.CJ, p && p.passif.CJ),
    l("", "Prélèvements de l'exploitant", -n.passif.prelevements, p && -p.passif.prelevements),
    l("", "Écart à régulariser", n.passif.ecart, p && p.passif.ecart),
    l("CP", "TOTAL CAPITAUX PROPRES", n.passif.CP, p && p.passif.CP),
    l("DJ", "Fournisseurs d'exploitation", n.passif.DJ, p && p.passif.DJ),
    l("DP", "TOTAL PASSIF CIRCULANT", n.passif.DP, p && p.passif.DP),
    l("DR", "Banques, crédits de trésorerie", n.passif.DR, p && p.passif.DR),
    l("DT", "TOTAL TRÉSORERIE-PASSIF", n.passif.DT, p && p.passif.DT),
    l("DZ", "TOTAL GÉNÉRAL PASSIF", n.passif.DZ, p && p.passif.DZ)
  ];

  const lignesRangement = [["Réf", "Poste OHADA", "Ligne notée dans Canari", "Montant"]];
  Object.keys(ex.detailCharges).sort().forEach(function (ref) {
    const d = ex.detailCharges[ref];
    Object.keys(d.lignes).forEach(function (nom) {
      lignesRangement.push([ref, "", nom, Math.round(d.lignes[nom])]);
    });
  });

  return [
    { nom: "Compte de résultat", lignes: resultat, formats: formats },
    { nom: "Bilan", lignes: bilanL, formats: formats },
    { nom: "Rangement des dépenses", lignes: lignesRangement, formats: ["texte", "texte", "texte", "nombre"] }
  ];
}

function telechargerOhada(format) {
  const annee = anneeOhadaChoisie();
  const nomBoutique = (donnees.boutique.nom || "Canari").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "Canari";
  const titre = tr("États financiers OHADA") + " — " + (donnees.boutique.nom || "Canari");
  const sous = tr("Exercice") + " " + annee + " · " + tr("SYSCOHADA révisé") + " · " + tr("À faire vérifier par un comptable");
  try {
    const feuilles = feuillesOhada();
    if (format === "pdf") {
      livrerFichier(new File([fabriquerPdf(feuilles, titre, sous)],
        nomBoutique + "_OHADA_" + annee + ".pdf", { type: "application/pdf" }), "PDF");
    } else {
      livrerFichier(new File([fabriquerClasseur(feuilles)], nomBoutique + "_OHADA_" + annee + ".xlsx",
        { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "Excel");
    }
  } catch (e) {
    message("Le fichier n'a pas pu être fabriqué. Réessaie.");
  }
}

/* =======================================================================
   7. MISE EN ROUTE
   ======================================================================= */

// D'où on est venu : l'écran Bilan ou les Réglages. Le bouton « Retour »
// ramène là, pas ailleurs — sinon on perd le fil de ce qu'on regardait.
let retourOhada = "principal";
function ouvrirOhada(depuis) {
  retourOhada = depuis || "principal";
  montrer("ohada");
  afficherOhada();
  window.scrollTo(0, 0);
}

function initOhada() {
  $("ohada-fermer").addEventListener("click", function () {
    montrer(retourOhada);
    if (retourOhada === "reglages") afficherReglages();
  });
  $("reglages-ohada").addEventListener("click", function () { ouvrirOhada("reglages"); });
  $("vue-ohada").addEventListener("click", function (e) {
    const an = e.target.closest("[data-annee-ohada]");
    if (an) { anneeOhada = parseInt(an.dataset.anneeOhada, 10); afficherOhada(); return; }
    if (e.target.closest("#ohada-tout")) { toutVoirOhada = !toutVoirOhada; afficherOhada(); return; }
    if (e.target.closest("#ohada-pdf")) telechargerOhada("pdf");
    else if (e.target.closest("#ohada-excel")) telechargerOhada("excel");
  });
}

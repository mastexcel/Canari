/* =====================================================================
   TABLEAU DE BORD  ·  les chiffres de la boutique, lus et expliqués
   ---------------------------------------------------------------------
   Deux choses dans ce fichier :

   1. LES INVESTISSEMENTS (congélateur, moto, machine, deuxième
      boutique…). Ce n'est pas une dépense du jour : l'argent sort de la
      caisse une fois, mais le matériel sert pendant des années. Canari
      étale donc son coût sur sa durée d'usage — c'est « l'usure du
      matériel » — exactement comme il étale déjà les charges fixes sur
      les jours de travail.

   2. LE TABLEAU DE BORD : quatre familles d'indicateurs (activité,
      efficacité, profitabilité, investissement), chacun avec son
      dessin, sa lecture automatique en une phrase, et le geste à faire.
      Tous les dessins sont des SVG écrits ici : aucune image à charger,
      rien à télécharger, ça marche sans internet.
   ===================================================================== */

const ANNEE = 365;
const DUREES = [1, 2, 3, 5, 10]; // durées d'usage proposées, en années

/* ---------- Les investissements ---------- */

// Gardée en mémoire : elle est demandée pour chaque jour du bilan.
function listeInvestissements() {
  return memo("investissements", function () {
    return donnees.mouvements.filter(function (m) { return m.type === "invest"; })
      .sort(function (a, b) { return b.t - a.t; });
  });
}

function dureeDe(m) { return Math.max(1, m.duree || 3); }

// Ce qu'un investissement coûte par jour pendant sa durée d'usage.
function usureParJour(m) { return m.montant / (dureeDe(m) * ANNEE); }

// L'usure de tout le matériel pour un jour donné (clé « 2026-09-28 »).
function usureDuJour(jour) {
  const t = new Date(jour + "T12:00:00").getTime();
  if (isNaN(t)) return 0;
  return Math.round(listeInvestissements().reduce(function (s, m) {
    const debut = debutJour(m.t);
    const fin = debut + dureeDe(m) * ANNEE * JOUR;
    return t >= debut && t < fin ? s + usureParJour(m) : s;
  }, 0));
}

// Ce qu'il reste de valeur au matériel aujourd'hui (prix d'achat moins l'usure).
function valeurMateriel() {
  return Math.round(listeInvestissements().reduce(function (s, m) {
    const passe = Math.max(0, joursDepuis(m.t));
    return s + Math.max(0, m.montant - passe * usureParJour(m));
  }, 0));
}

function aDesInvestissements() { return listeInvestissements().length > 0; }

/* ---------- Les chiffres ---------- */

// Argent en caisse depuis le tout premier jour noté dans Canari.
function caisseTotale() {
  return memo("caisseTotale", function () {
    let entre = 0, sorti = 0;
    donnees.mouvements.forEach(function (m) {
      if (m.type === "vente" || m.type === "paye") entre += encaisseDe(m);
      else if (m.type === "depense" || m.type === "fpaye" || m.type === "maison" || m.type === "invest") sorti += m.montant;
      else if (m.type === "fdette") sorti += m.verse || 0;
    });
    return entre - sorti;
  });
}

function valeurStock() {
  const produits = listeProduits().reduce(function (s, p) {
    return s + Math.max(0, stockDe(p.id)) * (coutProduit(p) || 0);
  }, 0);
  return Math.round(produits + valeurIntrants());
}

function totalDu(liste) { return liste.reduce(function (s, c) { return s + c.du; }, 0); }

// Tous les indicateurs, calculés une fois puis gardés en mémoire.
function indicateurs() { return memo("tableau", calculIndicateurs); }

function calculIndicateurs() {
  const jours = derniersJours(30);
  const premier = donnees.mouvements.reduce(function (min, m) { return Math.min(min, m.t); }, Infinity);
  const joursNotes = premier === Infinity ? 0 : Math.min(30, joursDepuis(premier) + 1);
  const r = { jours: jours, joursNotes: joursNotes, vide: joursNotes === 0 };

  const somme = function (liste, champ) {
    return liste.reduce(function (s, j) { return s + j.totaux[champ]; }, 0);
  };
  r.vendu = somme(jours, "vendu");
  r.cout = somme(jours, "cout");
  r.margeBrute = r.vendu - r.cout;
  r.benefice = somme(jours, "benefice");
  r.aCredit = somme(jours, "aCredit");
  r.maison = somme(jours, "maison");
  r.joursVente = jours.filter(function (j) { return j.totaux.vendu > 0; }).length;

  /* --- Activité --- */
  const sept = jours.slice(-7), septAvant = jours.slice(-14, -7);
  const v1 = sept.reduce(function (s, j) { return s + j.totaux.vendu; }, 0);
  const v0 = septAvant.reduce(function (s, j) { return s + j.totaux.vendu; }, 0);
  r.ventes7 = v1;
  r.tendance = v0 ? Math.round((v1 - v0) / v0 * 100) : null;
  r.venteMoyenne = r.joursVente ? Math.round(r.vendu / r.joursVente) : 0;

  let nbVentes = 0;
  jours.forEach(function (j) {
    nbVentes += mouvementsDuJour(j.cle).filter(function (m) {
      return (m.type === "vente" || m.type === "credit") && m.montant > 0;
    }).length;
  });
  r.nbVentes = nbVentes;
  r.panier = nbVentes ? Math.round(r.vendu / nbVentes) : 0;
  r.ventesParJour = r.joursVente ? Math.round(nbVentes / r.joursVente * 10) / 10 : 0;

  // Moyenne par jour de la semaine (lundi → dimanche).
  const parSemaine = [0, 0, 0, 0, 0, 0, 0], compte = [0, 0, 0, 0, 0, 0, 0];
  jours.forEach(function (j) {
    const k = (j.date.getDay() + 6) % 7;
    parSemaine[k] += j.totaux.vendu;
    compte[k]++;
  });
  r.semaine = parSemaine.map(function (v, i) { return compte[i] ? Math.round(v / compte[i]) : 0; });
  r.meilleurJour = r.semaine.indexOf(Math.max.apply(null, r.semaine));
  r.joursSansVente = Math.max(0, joursNotes - r.joursVente);

  /* --- Efficacité --- */
  r.tauxMarge = r.vendu ? Math.round(r.margeBrute / r.vendu * 100) : null;
  r.partCredit = r.vendu ? Math.round(r.aCredit / r.vendu * 100) : null;

  // Recouvrement : sur 90 jours, combien de crédits accordés ont été remboursés.
  let accorde = 0, rembourse = 0;
  const limite = Date.now() - 90 * JOUR;
  donnees.mouvements.forEach(function (m) {
    if (m.t < limite) return;
    if (m.type === "vente" || m.type === "credit") accorde += creditDe(m);
    else if (m.type === "paye") rembourse += m.montant;
  });
  r.accorde = accorde;
  r.recouvrement = accorde ? Math.min(100, Math.round(rembourse / accorde * 100)) : null;

  // Les clients qui doivent, et depuis combien de temps en moyenne.
  const clients = clientsQuiDoivent();
  r.onMeDoit = totalDu(clients);
  r.nbClientsDoivent = clients.length;
  let pondere = 0;
  clients.forEach(function (c) { pondere += c.du * Math.max(0, joursDepuis(c.depuis || Date.now())); });
  r.ageCredits = r.onMeDoit ? Math.round(pondere / r.onMeDoit) : 0;
  r.aRelancer = clients.filter(function (c) { return statutRelance(c).classe === "retard"; }).length;

  // Rotation du stock : combien de jours de vente dorment en marchandise.
  r.valeurStock = valeurStock();
  const coutParJour = r.joursVente ? r.cout / r.joursVente : 0;
  r.joursDeStock = coutParJour > 0 && r.valeurStock > 0 ? Math.round(r.valeurStock / coutParJour) : null;

  /* --- Profitabilité --- */
  r.tauxNet = r.vendu ? Math.round(r.benefice / r.vendu * 100) : null;
  r.seuil = seuilDuJour();
  r.joursAuSeuil = r.seuil ? jours.filter(function (j) { return j.totaux.vendu >= r.seuil; }).length : null;
  r.beneficeParJour = r.joursVente ? Math.round(r.benefice / r.joursVente) : 0;

  // Ce que chaque produit a rapporté sur 30 jours (prix de vente moins prix de revient).
  const parProduit = {};
  jours.forEach(function (j) {
    mouvementsDuJour(j.cle).forEach(function (m) {
      if (!m.lignes) return;
      m.lignes.forEach(function (l) {
        const p = donnees.produits[l.produitId];
        if (!p) return;
        const e = parProduit[l.produitId] || (parProduit[l.produitId] = { nom: p.nom, vendu: 0, marge: 0, qte: 0 });
        e.vendu += l.prix * l.qte;
        e.marge += (l.prix - (l.cout || 0)) * l.qte;
        e.qte += l.qte;
      });
    });
  });
  r.produits = Object.keys(parProduit).map(function (k) { return parProduit[k]; })
    .sort(function (a, b) { return b.marge - a.marge; });
  r.produitsPerte = r.produits.filter(function (p) { return p.marge <= 0; });

  /* --- Investissement et trésorerie --- */
  r.caisse = caisseTotale();
  r.jeDois = totalDu(fournisseursQueJeDois());
  r.materiel = valeurMateriel();
  r.tresorerie = r.caisse + r.onMeDoit + r.valeurStock + r.materiel - r.jeDois;
  r.chargesMois = Math.round(fixeMensuel("charge") + fixeMensuel("impot"));
  // Ce qu'on peut sortir sans mettre la boutique en danger : l'argent en
  // caisse, moins ce qu'on doit aux fournisseurs, moins un mois de charges
  // gardé de côté.
  r.capacite = Math.max(0, r.caisse - r.jeDois - r.chargesMois);
  r.investissements = listeInvestissements();
  r.usureJour = usureDuJour(cleJour(Date.now()));
  return r;
}

/* ---------- Les dessins (SVG écrits à la main) ---------- */

// Une courbe : les valeurs jour par jour, avec le dessous rempli.
function courbeSvg(valeurs, classe) {
  const L = 300, H = 92, bas = H - 10, haut = 8;
  const max = Math.max.apply(null, valeurs.concat([1]));
  const min = Math.min.apply(null, valeurs.concat([0]));
  const etendue = max - min || 1;
  const x = function (i) { return valeurs.length < 2 ? L / 2 : Math.round(i / (valeurs.length - 1) * L * 10) / 10; };
  const y = function (v) { return Math.round((bas - (v - min) / etendue * (bas - haut)) * 10) / 10; };
  const points = valeurs.map(function (v, i) { return x(i) + " " + y(v); });
  const ligne = "M" + points.join(" L");
  const zero = y(Math.max(min, 0));
  return '<svg class="graphe ' + (classe || "") + '" viewBox="0 0 ' + L + ' ' + H + '" preserveAspectRatio="none" role="img" aria-hidden="true">' +
    '<path class="graphe-fond" d="' + ligne + ' L' + x(valeurs.length - 1) + ' ' + zero + ' L' + x(0) + ' ' + zero + ' Z"/>' +
    '<path class="graphe-zero" d="M0 ' + zero + ' L' + L + ' ' + zero + '"/>' +
    '<path class="graphe-trait" d="' + ligne + '"/>' +
    '<circle class="graphe-point" cx="' + x(valeurs.length - 1) + '" cy="' + y(valeurs[valeurs.length - 1]) + '" r="4"/>' +
    '</svg>';
}

// Sept colonnes : la moyenne de chaque jour de la semaine.
function colonnesSvg(valeurs, meilleur) {
  const L = 300, H = 92, bas = H - 16, large = 30;
  const max = Math.max.apply(null, valeurs.concat([1]));
  const jours = ["L", "M", "M", "J", "V", "S", "D"];
  return '<svg class="graphe graphe-colonnes" viewBox="0 0 ' + L + ' ' + H + '" role="img" aria-hidden="true">' +
    valeurs.map(function (v, i) {
      const h = Math.max(2, Math.round(v / max * (bas - 10)));
      const cx = Math.round(i * (L / 7) + (L / 7 - large) / 2);
      return '<rect class="colonne' + (i === meilleur ? " forte" : "") + '" x="' + cx + '" y="' + (bas - h) + '" width="' + large + '" height="' + h + '" rx="5"/>' +
        '<text class="colonne-nom" x="' + (cx + large / 2) + '" y="' + (H - 3) + '" text-anchor="middle">' + jours[i] + '</text>';
    }).join("") + '</svg>';
}

// Des barres couchées : les produits qui rapportent le plus.
function barresProduits(items) {
  const max = Math.max.apply(null, items.map(function (p) { return Math.abs(p.marge); }).concat([1]));
  return '<ul class="barres-produits">' + items.map(function (p) {
    const l = Math.max(4, Math.round(Math.abs(p.marge) / max * 100));
    return '<li><span class="bp-nom">' + echapper(p.nom) + '</span>' +
      '<span class="bp-piste"><span class="bp-barre' + (p.marge <= 0 ? " perte" : "") + '" style="width:' + l + '%"></span></span>' +
      '<span class="bp-valeur' + (p.marge < 0 ? " m-negatif" : "") + '">' + (p.marge < 0 ? "− " : "") + franc(Math.abs(p.marge)) + '</span></li>';
  }).join("") + '</ul>';
}

/* ---------- L'affichage ---------- */

// Un indicateur : un nom, un chiffre, un verdict, une lecture, un conseil.
function carteIndicateur(o) {
  const v = o.verdict || "neutre";
  return '<li class="ind ind-' + v + '">' +
    '<div class="ind-haut"><span class="ind-nom">' + o.nom + '</span>' +
    '<b class="ind-valeur">' + o.valeur + '</b></div>' +
    (o.dessin || "") +
    '<p class="ind-lecture">' + o.lecture + '</p>' +
    (o.conseil ? '<p class="ind-conseil">' + o.conseil + '</p>' : '') +
    '</li>';
}

function famille(titre, sousTitre, cartes) {
  if (!cartes.length) return "";
  return '<section class="famille">' +
    '<h2 class="titre-liste">' + titre + '</h2>' +
    '<p class="aide famille-aide">' + sousTitre + '</p>' +
    '<ul class="indicateurs">' + cartes.join("") + '</ul></section>';
}

function pourcent(n) { return n === null || n === undefined ? "—" : (n < 0 ? "−\u00a0" : "") + Math.abs(n) + " %"; }
// Un montant qui peut être négatif : « −<espace insécable>931 F », jamais « -931 F ».
function sommeF(n) { return (n < 0 ? "−\u00a0" : "") + franc(Math.abs(n)); }
// Un nombre à virgule, écrit à la française : « 2,9 ».
function virgule(n) { return String(n).replace(".", ","); }
// « 1 jour », « 3 jours » : jamais de « jour(s) ».
function pluriel(n, mot) { return n + " " + mot + (n > 1 ? "s" : ""); }

function afficherTableau() {
  const r = indicateurs();
  if (r.vide) {
    $("vue-tableau").innerHTML = videHtml("canari-tranquille",
      "Le tableau de bord se remplit tout seul.<br>Note tes ventes pendant quelques jours et reviens ici.");
    return;
  }

  const cartes = [];

  /* ---------------- Activité ---------------- */
  const act = [];
  act.push(carteIndicateur({
    nom: "Ventes des 30 derniers jours",
    valeur: franc(r.vendu),
    verdict: r.tendance === null ? "neutre" : r.tendance >= 0 ? "bon" : r.tendance >= -15 ? "attention" : "alerte",
    dessin: courbeSvg(r.jours.map(function (j) { return j.totaux.vendu; })),
    lecture: r.tendance === null
      ? "Tu as vendu en moyenne " + franc(r.venteMoyenne) + " par jour de vente."
      : r.tendance >= 0
        ? "Tes ventes montent de " + r.tendance + " % par rapport aux 7 jours d'avant."
        : "Tes ventes baissent de " + Math.abs(r.tendance) + " % par rapport aux 7 jours d'avant.",
    conseil: r.tendance !== null && r.tendance < -15
      ? "Regarde ce qui a changé : un produit en rupture, un concurrent, la saison. Préviens tes bons clients que tu as de la marchandise."
      : ""
  }));
  act.push(carteIndicateur({
    nom: "Ton meilleur jour",
    valeur: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"][r.meilleurJour],
    verdict: "neutre",
    dessin: colonnesSvg(r.semaine, r.meilleurJour),
    lecture: "En moyenne " + franc(r.semaine[r.meilleurJour]) + " ce jour-là.",
    conseil: "Fais ton stock la veille de ton meilleur jour, et garde tes promotions pour tes jours creux."
  }));
  act.push(carteIndicateur({
    nom: "Panier moyen",
    valeur: franc(r.panier),
    verdict: "neutre",
    lecture: "Environ " + virgule(r.ventesParJour) + " ventes par jour" + (r.joursSansVente ? ", et " + pluriel(r.joursSansVente, "jour") + " sans aucune vente" : "") + ".",
    conseil: "Pour gagner plus sans plus de clients : propose toujours un petit produit en plus au moment de payer."
  }));
  cartes.push(famille("Activité", "Est-ce que ça bouge ?", act));

  /* ---------------- Efficacité ---------------- */
  const eff = [];
  if (r.tauxMarge !== null) {
    eff.push(carteIndicateur({
      nom: "Taux de marge brute",
      valeur: pourcent(r.tauxMarge),
      verdict: r.tauxMarge >= 30 ? "bon" : r.tauxMarge >= 15 ? "attention" : "alerte",
      lecture: "Sur " + franc(1000) + " vendus, il te reste " + franc(Math.round(r.tauxMarge * 10)) + " avant tes autres frais.",
      conseil: r.tauxMarge < 15
        ? "C'est trop peu : tu travailles presque pour ton fournisseur. Monte tes prix ou achète moins cher, en plus grande quantité."
        : ""
    }));
  }
  if (r.partCredit !== null) {
    eff.push(carteIndicateur({
      nom: "Part vendue à crédit",
      valeur: pourcent(r.partCredit),
      verdict: r.partCredit <= 20 ? "bon" : r.partCredit <= 40 ? "attention" : "alerte",
      lecture: "On te doit " + franc(r.onMeDoit) + ", de " + pluriel(r.nbClientsDoivent, "personne") +
        ", depuis " + pluriel(r.ageCredits, "jour") + " en moyenne.",
      conseil: r.partCredit > 40
        ? "Trop de crédit étouffe la caisse. Fixe une limite par client et ne sers plus à crédit celui qui n'a pas réglé le précédent."
        : r.aRelancer ? (r.aRelancer === 1 ? "Tu as 1 client à relancer aujourd'hui. Va dans l'onglet Relances."
          : "Tu as " + r.aRelancer + " clients à relancer aujourd'hui. Va dans l'onglet Relances.") : ""
    }));
  }
  if (r.recouvrement !== null) {
    eff.push(carteIndicateur({
      nom: "Argent récupéré",
      valeur: pourcent(r.recouvrement),
      verdict: r.recouvrement >= 80 ? "bon" : r.recouvrement >= 50 ? "attention" : "alerte",
      lecture: "Sur les crédits des 90 derniers jours, tu as déjà récupéré " + r.recouvrement + " %.",
      conseil: r.recouvrement < 50
        ? "Relance chaque semaine, le même jour. Un client relancé tôt paie beaucoup plus souvent qu'un client oublié."
        : ""
    }));
  }
  if (r.joursDeStock !== null) {
    eff.push(carteIndicateur({
      nom: "Marchandise qui dort",
      valeur: r.joursDeStock + " jours",
      verdict: r.joursDeStock <= 15 ? "bon" : r.joursDeStock <= 30 ? "attention" : "alerte",
      lecture: "Tu as " + franc(r.valeurStock) + " de marchandise : de quoi tenir " + r.joursDeStock + " jours.",
      conseil: r.joursDeStock > 30
        ? "C'est de l'argent qui dort. Achète plus souvent et en plus petite quantité, et brade ce qui ne part pas."
        : ""
    }));
  }
  cartes.push(famille("Efficacité", "Est-ce que ça tourne bien ?", eff));

  /* ---------------- Profitabilité ---------------- */
  const pro = [];
  if (r.tauxNet !== null) {
    pro.push(carteIndicateur({
      nom: "Bénéfice net",
      valeur: pourcent(r.tauxNet),
      verdict: r.tauxNet >= 15 ? "bon" : r.tauxNet >= 5 ? "attention" : "alerte",
      dessin: courbeSvg(r.jours.map(function (j) { return j.totaux.benefice; }), "graphe-benefice"),
      lecture: r.benefice >= 0
        ? "Tu gagnes environ " + franc(r.beneficeParJour) + " par jour de vente, soit " + franc(r.benefice) + " sur 30 jours."
        : "Tu perds environ " + franc(Math.abs(r.beneficeParJour)) + " par jour de vente, soit " + franc(Math.abs(r.benefice)) + " sur 30 jours.",
      conseil: r.tauxNet < 5
        ? "Ton bénéfice est trop mince. Regarde d'abord tes trois plus grosses dépenses, puis tes prix."
        : ""
    }));
  }
  if (r.seuil) {
    pro.push(carteIndicateur({
      nom: "Seuil de rentabilité",
      valeur: franc(r.seuil),
      verdict: r.joursAuSeuil >= r.joursVente * 0.8 ? "bon" : r.joursAuSeuil >= r.joursVente * 0.5 ? "attention" : "alerte",
      lecture: "Tu as dépassé ce seuil " + r.joursAuSeuil + " jours sur les " + r.joursNotes + " derniers.",
      conseil: "En dessous de ce chiffre, ta journée ne paie même pas tes charges."
    }));
  }
  if (r.produits.length) {
    pro.push(carteIndicateur({
      nom: "Ce qui te rapporte le plus",
      valeur: echapper(r.produits[0].nom),
      verdict: r.produitsPerte.length ? "attention" : "bon",
      dessin: barresProduits(r.produits.slice(0, 5)),
      lecture: !r.produitsPerte.length ? "Tes cinq meilleurs produits, par ce qu'ils te laissent en poche."
        : r.produitsPerte.length === 1 ? "1 produit ne te rapporte rien, ou te fait perdre de l'argent."
        : r.produitsPerte.length + " produits ne te rapportent rien, ou te font perdre de l'argent.",
      conseil: r.produitsPerte.length
        ? "Vérifie le prix d'achat et le prix de vente de ces produits dans l'onglet Stock."
        : "Mets tes meilleurs produits devant, et n'en manque jamais."
    }));
  }
  cartes.push(famille("Profitabilité", "Est-ce que ça gagne ?", pro));

  /* ---------------- Investissement ---------------- */
  const inv = [];
  inv.push(carteIndicateur({
    nom: "Ce que vaut ta boutique",
    valeur: sommeF(r.tresorerie),
    verdict: r.tresorerie > 0 ? "bon" : "alerte",
    lecture: "Caisse " + sommeF(r.caisse) + " · marchandise " + franc(r.valeurStock) +
      " · on te doit " + franc(r.onMeDoit) + (r.materiel ? " · matériel " + franc(r.materiel) : "") +
      " · tu dois " + franc(r.jeDois) + ".",
    conseil: "C'est tout ce que la boutique possède, moins ce qu'elle doit."
  }));
  inv.push(carteIndicateur({
    nom: "Ce que tu peux investir",
    valeur: franc(r.capacite),
    verdict: r.capacite > 0 ? "bon" : "attention",
    lecture: r.capacite > 0
      ? "Après avoir gardé de quoi payer tes fournisseurs et un mois de charges."
      : "Pour l'instant, garde ton argent : tes dettes et tes charges passent avant.",
    conseil: r.capacite > 0
      ? "Avant d'acheter : combien ça me rapporte par jour ? En combien de jours c'est remboursé ?"
      : ""
  }));
  cartes.push(famille("Investissement", "Qu'est-ce que tu peux construire ?", inv));

  /* ---------------- Les investissements notés ---------------- */
  let mat = '<section class="famille"><h2 class="titre-liste">Ton matériel</h2>';
  if (!r.investissements.length) {
    mat += '<p class="aide famille-aide">Un congélateur, une moto, une machine, une deuxième boutique : note-le ici. ' +
      'Canari étale son coût sur sa durée d\'usage, et te dit en combien de temps il est remboursé.</p>';
  } else {
    mat += '<p class="aide famille-aide">L\'usure du matériel te coûte ' + franc(r.usureJour) + ' par jour.</p>' +
      '<ul class="liste-invest">' + r.investissements.map(function (m) {
        const passe = Math.max(0, joursDepuis(m.t));
        const total = dureeDe(m) * ANNEE;
        const reste = Math.max(0, total - passe);
        const rembourse = Math.min(100, Math.round(passe / total * 100));
        return '<li class="invest">' +
          '<div class="invest-haut"><b>' + echapper(m.note || "Matériel") + '</b><span>' + franc(m.montant) + '</span></div>' +
          '<span class="invest-piste"><span class="invest-barre" style="width:' + rembourse + '%"></span></span>' +
          '<small>' + franc(Math.round(usureParJour(m))) + ' par jour · ' +
          (reste > 0 ? "encore " + Math.ceil(reste / 30) + " mois d'usage" : "entièrement amorti") + ' · acheté ' + dateCourte(m.t) + '</small>' +
          '<button type="button" class="petit-modifier supprimer" data-retirer-invest="' + m.id + '">Retirer</button>' +
          '</li>';
      }).join("") + '</ul>';
  }
  mat += '<button type="button" class="bouton bouton-invest" id="noter-invest">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Noter un investissement</button></section>';
  cartes.push(mat);

  /* ---------------- La stratégie ---------------- */
  cartes.push(strategieHtml(r));

  $("vue-tableau").innerHTML = cartes.join("");
}

// Les trois gestes les plus utiles, choisis à partir des indicateurs.
function strategieHtml(r) {
  const actions = [];
  const ajouter = function (gravite, texte) { actions.push({ g: gravite, t: texte }); };

  if (r.tauxMarge !== null && r.tauxMarge < 15) ajouter(3, "Revois tes prix : ta marge est trop faible pour vivre de la boutique.");
  if (r.partCredit !== null && r.partCredit > 40) ajouter(3, "Réduis le crédit : fixe une limite par client.");
  if (r.aRelancer) ajouter(3, r.aRelancer === 1
    ? "Relance aujourd'hui ton client en retard."
    : "Relance aujourd'hui tes " + r.aRelancer + " clients en retard.");
  if (r.joursDeStock !== null && r.joursDeStock > 30) ajouter(2, "Achète en plus petite quantité : trop d'argent dort en marchandise.");
  if (r.tauxNet !== null && r.tauxNet < 5) ajouter(2, "Cherche la dépense de trop : regarde le calcul du mois, ligne par ligne.");
  if (r.tendance !== null && r.tendance < -15) ajouter(2, "Tes ventes baissent : va vers tes anciens clients avant qu'ils prennent l'habitude d'acheter ailleurs.");
  if (r.produitsPerte.length) ajouter(2, r.produitsPerte.length === 1
    ? "Corrige le prix du produit qui ne rapporte rien."
    : "Corrige le prix des " + r.produitsPerte.length + " produits qui ne rapportent rien.");
  if (r.joursSansVente > 5) ajouter(1, "Tu as " + pluriel(r.joursSansVente, "jour") + " sans vente : ouvre plus régulièrement, ou note même les petites ventes.");
  if (r.capacite > 0 && r.tauxNet !== null && r.tauxNet >= 10) ajouter(1, "Tu peux investir " + franc(r.capacite) + " : choisis ce qui te fera vendre plus, pas ce qui fait joli.");
  if (r.recouvrement !== null && r.recouvrement >= 80 && r.tauxMarge >= 30) ajouter(1, "Ta boutique est saine. Garde le rythme, et mets de côté chaque semaine.");
  if (!actions.length) ajouter(1, "Continue à tout noter : dans quelques jours, Canari pourra te conseiller.");

  const trois = actions.sort(function (a, b) { return b.g - a.g; }).slice(0, 3);
  return '<section class="famille strategie">' +
    '<h2 class="titre-liste">Ce que je ferais à ta place</h2>' +
    '<ol class="actions-strategie">' + trois.map(function (a) {
      return '<li class="action-str g' + a.g + '">' + a.t + '</li>';
    }).join("") + '</ol></section>';
}

/* ---------- Brancher les boutons ---------- */

function initTableau() {
  $("vue-tableau").addEventListener("click", function (e) {
    if (e.target.closest("#noter-invest")) { ouvrirSaisie("invest"); return; }
    const sup = e.target.closest("[data-retirer-invest]");
    if (sup) {
      const i = donnees.mouvements.findIndex(function (m) { return m.id === sup.dataset.retirerInvest; });
      if (i < 0) return;
      const retire = donnees.mouvements.splice(i, 1)[0];
      sauver();
      afficher();
      message("Investissement retiré.", function () {
        donnees.mouvements.push(retire);
        sauver();
        afficher();
      }, false, "Annuler");
    }
  });
  document.querySelectorAll("[data-duree]").forEach(function (b) {
    b.addEventListener("click", function () { choisirDuree(Number(b.dataset.duree)); });
  });
}

let dureeChoisie = 3;
function choisirDuree(n) {
  dureeChoisie = n;
  document.querySelectorAll("[data-duree]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(Number(b.dataset.duree) === n));
  });
  const m = lireMontant($("montant").value);
  $("duree-aide").textContent = m
    ? "Ça te coûtera environ " + franc(Math.round(m / (n * ANNEE))) + " par jour pendant " + n + (n > 1 ? " ans." : " an.")
    : "Choisis combien d'années ce matériel va te servir.";
}

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

/* ---------- La période regardée (demande du propriétaire) ----------
   Semaine = 7 jours détaillés, Mois = 30 jours détaillés, Année = 12
   mois détaillés. Le choix vaut pour tout le tableau de bord et reste
   gardé sur le téléphone. */
const PERIODES = {
  semaine: { nom: "Semaine", detail: "7 jours", jours: 7, avant: "aux 7 jours d'avant" },
  mois: { nom: "Mois", detail: "30 jours", jours: 30, avant: "aux 30 jours d'avant" },
  annee: { nom: "Année", detail: "12 mois", jours: 365, avant: "à l'année d'avant" }
};
const CLE_PERIODE = "canari.periodeTableau";
// La valeur gardée sur le téléphone est lue au démarrage (initTableau) :
// ce fichier se charge avant app.js, où vit lire().
let periodeTableau = "mois";
function periode() { return PERIODES[periodeTableau]; }

// Combien de jours la période couvre. Pour l'année, on prend les 12 mois
// civils entiers (du 1er du mois, il y a 11 mois, jusqu'à aujourd'hui) :
// sinon le premier mois serait coupé en deux et la courbe mentirait.
function joursDePeriode() {
  if (periodeTableau !== "annee") return periode().jours;
  const a = new Date();
  const debut = new Date(a.getFullYear(), a.getMonth() - 11, 1, 12);
  return Math.round((debutJour(a) - debutJour(debut)) / JOUR) + 1;
}

// Les jours d'une tranche : `nombre` jours qui se terminent il y a `decalage` jours.
function joursEntre(decalage, nombre) {
  const jours = [];
  for (let i = nombre - 1 + decalage; i >= decalage; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const cle = cleJour(d);
    jours.push({ date: d, cle: cle, totaux: totauxDuJour(cle), aujourdhui: i === 0 });
  }
  return jours;
}

// Les mêmes chiffres, mais regroupés par mois civil (pour l'année).
function parMoisCivil(jours) {
  const mois = [];
  let courant = null;
  jours.forEach(function (j) {
    const cle = j.date.getFullYear() + "-" + j.date.getMonth();
    if (!courant || courant.cle !== cle) {
      courant = { cle: cle, date: j.date, jours: [], totaux: { vendu: 0, benefice: 0, encaisse: 0, sorti: 0, maison: 0 } };
      mois.push(courant);
    }
    courant.jours.push(j);
    ["vendu", "benefice", "encaisse", "sorti", "maison"].forEach(function (k) { courant.totaux[k] += j.totaux[k]; });
  });
  return mois;
}

// Les points à dessiner : un par jour, ou un par mois pour l'année.
function pointsDe(jours) {
  if (periodeTableau !== "annee") {
    return jours.map(function (j) {
      return {
        nom: j.date.toLocaleDateString(LOCALE, { day: "numeric" }),
        court: j.date.toLocaleDateString(LOCALE, { weekday: "narrow" }),
        vendu: j.totaux.vendu, benefice: j.totaux.benefice,
        recettes: j.totaux.encaisse, sorties: j.totaux.sorti + j.totaux.maison
      };
    });
  }
  return parMoisCivil(jours).map(function (m) {
    const nom = m.date.toLocaleDateString(LOCALE, { month: "short" }).replace(".", "");
    return {
      nom: nom, court: nom.charAt(0).toUpperCase(),
      vendu: m.totaux.vendu, benefice: m.totaux.benefice,
      recettes: m.totaux.encaisse, sorties: m.totaux.sorti + m.totaux.maison
    };
  });
}

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

// Tous les indicateurs, calculés une fois par période puis gardés en mémoire.
function indicateurs() { return memo("tableau-" + periodeTableau, calculIndicateurs); }

function calculIndicateurs() {
  const P = periode();
  const nbJours = joursDePeriode();
  const jours = joursEntre(0, nbJours);
  const premier = donnees.mouvements.reduce(function (min, m) { return Math.min(min, m.t); }, Infinity);
  const joursNotes = premier === Infinity ? 0 : Math.min(nbJours, joursDepuis(premier) + 1);
  const r = { jours: jours, joursNotes: joursNotes, vide: joursNotes === 0, periode: P, points: pointsDe(jours) };

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
  r.venteMoyenne = 0; // rempli plus bas

  /* --- Activité --- */
  // La tendance compare la période affichée à la même durée juste avant.
  const avant = joursEntre(nbJours, nbJours);
  const v0 = avant.reduce(function (s, j) { return s + j.totaux.vendu; }, 0);
  const joursVenteAvant = avant.filter(function (j) { return j.totaux.vendu > 0; }).length;
  r.venduAvant = v0;
  r.joursVenteAvant = joursVenteAvant;
  r.venteMoyenne = r.joursVente ? Math.round(r.vendu / r.joursVente) : 0;
  // Pas de tendance tant que la période d'avant est trop vide : « + 611 % »
  // parce qu'on vient d'installer l'appli n'apprend rien à personne.
  r.tendance = v0 && joursVenteAvant >= Math.max(2, Math.round(r.joursVente / 2))
    ? Math.round((r.vendu - v0) / v0 * 100) : null;

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

  // Recettes et sorties d'argent : ce que le comparatif met face à face.
  r.recettes = somme(jours, "encaisse");
  r.sorties = somme(jours, "sorti") + r.maison;

  // Camembert 1 : où part l'argent qui sort.
  const postes = { marchandise: 0, charge: 0, impot: 0, autre: 0, maison: 0, invest: 0 };
  jours.forEach(function (j) {
    mouvementsDuJour(j.cle).forEach(function (m) {
      if (m.type === "depense") {
        const c = m.categorie === "marchandise" || estMarchandise(m) ? "marchandise"
          : m.categorie === "charge" ? "charge" : m.categorie === "impot" ? "impot" : "autre";
        postes[c] += m.montant;
      } else if (m.type === "fpaye") postes.marchandise += m.montant;
      else if (m.type === "fdette") postes.marchandise += m.verse || 0;
      else if (m.type === "maison") postes.maison += m.montant;
      else if (m.type === "invest") postes.invest += m.montant;
    });
  });
  const NOMS_POSTES = {
    marchandise: ["Achats de marchandise", "la marchandise"],
    charge: ["Charges fixes", "tes charges fixes"],
    impot: ["Impôts et taxes", "tes impôts et taxes"],
    autre: ["Autres dépenses", "tes autres dépenses"],
    maison: ["Pris pour la maison", "ce que tu prends pour la maison"],
    invest: ["Investissements", "tes investissements"]
  };
  r.postes = Object.keys(postes).filter(function (k) { return postes[k] > 0; })
    .map(function (k) { return { cle: k, nom: NOMS_POSTES[k][0], phrase: NOMS_POSTES[k][1], valeur: postes[k] }; })
    .sort(function (a, b) { return b.valeur - a.valeur; });
  r.totalSorties = r.postes.reduce(function (s, p) { return s + p.valeur; }, 0);

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

  // Ce que chaque produit a vendu et rapporté pendant la période.
  const parProduit = {};
  let venduSansDetail = 0;
  jours.forEach(function (j) {
    mouvementsDuJour(j.cle).forEach(function (m) {
      if (m.type !== "vente" && m.type !== "credit") return;
      if (!m.lignes) { venduSansDetail += m.montant; return; }
      m.lignes.forEach(function (l) {
        const p = donnees.produits[l.produitId];
        if (!p) return;
        const e = parProduit[l.produitId] || (parProduit[l.produitId] = { nom: p.nom, unite: uniteDe(p), vendu: 0, marge: 0, qte: 0 });
        e.vendu += l.prix * l.qte;
        e.marge += (l.prix - (l.cout || 0)) * l.qte;
        e.qte += l.qte;
      });
    });
  });
  r.produits = Object.keys(parProduit).map(function (k) { return parProduit[k]; })
    .sort(function (a, b) { return b.marge - a.marge; });
  r.produitsPerte = r.produits.filter(function (p) { return p.marge <= 0; });
  r.produitsCA = r.produits.slice().sort(function (a, b) { return b.vendu - a.vendu; });
  r.produitsQte = r.produits.slice().sort(function (a, b) { return b.qte - a.qte; });
  r.venduSansDetail = venduSansDetail;

  // Camembert 2 : d'où vient le chiffre d'affaires (5 produits, puis « autres »).
  const parts = r.produitsCA.slice(0, 5).map(function (p) { return { nom: p.nom, valeur: p.vendu }; });
  const autres = r.produitsCA.slice(5).reduce(function (s, p) { return s + p.vendu; }, 0);
  if (autres > 0) parts.push({ nom: "Autres produits", valeur: autres });
  if (venduSansDetail > 0) parts.push({ nom: "Ventes au montant", valeur: venduSansDetail });
  r.partsCA = parts;

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

// Des barres couchées : un classement de produits. `valeur` dit sur quoi
// classer (bénéfice, chiffre d'affaires, quantité), `texte` comment l'écrire.
function barresListe(items, valeur, texte) {
  const max = Math.max.apply(null, items.map(function (p) { return Math.abs(valeur(p)); }).concat([1]));
  return '<ul class="barres-produits">' + items.map(function (p) {
    const v = valeur(p);
    const l = Math.max(4, Math.round(Math.abs(v) / max * 100));
    return '<li><span class="bp-nom">' + echapper(p.nom) + '</span>' +
      '<span class="bp-piste"><span class="bp-barre' + (v <= 0 ? " perte" : "") + '" style="width:' + l + '%"></span></span>' +
      '<span class="bp-valeur' + (v < 0 ? " m-negatif" : "") + '">' + texte(p) + '</span></li>';
  }).join("") + '</ul>';
}
function barresProduits(items) {
  return barresListe(items, function (p) { return p.marge; }, function (p) { return sommeF(p.marge); });
}

/* ---------- Les camemberts (demande du propriétaire) ---------- */

// Sept teintes de la signature Canari : aucune couleur vive.
const COULEURS_PART = ["var(--olive-600)", "var(--ocre-600)", "var(--dore)", "var(--olive-400)",
  "var(--ocre-300)", "var(--maison-clair)", "var(--olive-200)"];

// Un camembert : une part par poste, et la liste chiffrée en dessous.
function camembertSvg(parts) {
  const total = parts.reduce(function (s, p) { return s + p.valeur; }, 0);
  if (!total) return "";
  const C = 50, R = 46;
  let debut = -Math.PI / 2;
  const tranches = parts.length === 1
    ? '<circle cx="' + C + '" cy="' + C + '" r="' + R + '" fill="' + COULEURS_PART[0] + '"/>'
    : parts.map(function (p, i) {
        const angle = p.valeur / total * Math.PI * 2;
        const fin = debut + angle;
        const x1 = (C + R * Math.cos(debut)).toFixed(2), y1 = (C + R * Math.sin(debut)).toFixed(2);
        const x2 = (C + R * Math.cos(fin)).toFixed(2), y2 = (C + R * Math.sin(fin)).toFixed(2);
        debut = fin;
        return '<path d="M' + C + ' ' + C + ' L' + x1 + ' ' + y1 +
          ' A' + R + ' ' + R + ' 0 ' + (angle > Math.PI ? 1 : 0) + ' 1 ' + x2 + ' ' + y2 + ' Z" fill="' +
          COULEURS_PART[i % COULEURS_PART.length] + '"/>';
      }).join("");
  return '<div class="camembert">' +
    '<svg class="camembert-dessin" viewBox="0 0 100 100" role="img" aria-hidden="true">' + tranches + '</svg>' +
    '<ul class="camembert-legende">' + parts.map(function (p, i) {
      return '<li><span class="cl-puce" style="background:' + COULEURS_PART[i % COULEURS_PART.length] + '"></span>' +
        '<span class="cl-nom">' + echapper(p.nom) + '</span>' +
        '<span class="cl-valeur">' + franc(p.valeur) + '</span>' +
        '<span class="cl-part">' + Math.round(p.valeur / total * 100) + ' %</span></li>';
    }).join("") + '</ul></div>';
}

/* ---------- Recettes contre dépenses (demande du propriétaire) ---------- */

// Peu de points (7 jours, 12 mois) : deux barres côte à côte.
// Beaucoup de points (30 jours) : deux courbes, plus lisibles.
function comparatifSvg(points) {
  const max = Math.max.apply(null, points.map(function (p) { return Math.max(p.recettes, p.sorties); }).concat([1]));
  const L = 300, H = 110, bas = H - 16, haut = 8;
  const y = function (v) { return (bas - v / max * (bas - haut)).toFixed(1); };
  let dessin;
  if (points.length <= 12) {
    const pas = L / points.length, large = Math.max(4, Math.min(11, pas / 2.6));
    dessin = points.map(function (p, i) {
      const centre = i * pas + pas / 2;
      const rect = function (v, classe, dx) {
        const h = Math.max(1, bas - Number(y(v)));
        return '<rect class="' + classe + '" x="' + (centre + dx).toFixed(1) + '" y="' + y(v) +
          '" width="' + large.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="2.5"/>';
      };
      return rect(p.recettes, "barre-recette", -large - 1.5) + rect(p.sorties, "barre-sortie", 1.5) +
        '<text class="colonne-nom" x="' + centre.toFixed(1) + '" y="' + (H - 3) + '" text-anchor="middle">' + p.court + '</text>';
    }).join("");
  } else {
    const x = function (i) { return (i / (points.length - 1) * L).toFixed(1); };
    const trace = function (champ) {
      return "M" + points.map(function (p, i) { return x(i) + " " + y(p[champ]); }).join(" L");
    };
    dessin = '<path class="graphe-zero" d="M0 ' + bas + ' L' + L + ' ' + bas + '"/>' +
      '<path class="trait-recette" d="' + trace("recettes") + '"/>' +
      '<path class="trait-sortie" d="' + trace("sorties") + '"/>';
  }
  return '<svg class="graphe graphe-comparatif" viewBox="0 0 ' + L + ' ' + H + '" role="img" aria-hidden="true">' +
    dessin + '</svg>' +
    '<p class="legende-comparatif"><span class="puce-recette"></span>ce qui rentre' +
    '<span class="puce-sortie"></span>ce qui sort</p>';
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

// Les trois boutons Semaine · Mois · Année, en haut du tableau de bord.
function choixPeriodeHtml() {
  return '<div class="trois-choix periodes" role="group" aria-label="Période regardée">' +
    Object.keys(PERIODES).map(function (k) {
      return '<button type="button" class="choix" data-periode="' + k + '" aria-pressed="' +
        (k === periodeTableau) + '">' + PERIODES[k].nom + '</button>';
    }).join("") + '</div>' +
    '<p class="aide periode-aide">' + periode().detail + ' détaillés.</p>';
}

function afficherTableau() {
  const r = indicateurs();
  if (r.vide) {
    $("vue-tableau").innerHTML = videHtml("canari-tranquille",
      "Le tableau de bord se remplit tout seul.<br>Note tes ventes pendant quelques jours et reviens ici.");
    return;
  }

  const cartes = [choixPeriodeHtml()];

  /* ---------------- Activité ---------------- */
  const act = [];
  act.push(carteIndicateur({
    nom: "Ventes sur " + r.periode.detail,
    valeur: franc(r.vendu),
    verdict: r.tendance === null ? "neutre" : r.tendance >= 0 ? "bon" : r.tendance >= -15 ? "attention" : "alerte",
    dessin: courbeSvg(r.points.map(function (p) { return p.vendu; })),
    lecture: r.tendance === null
      ? "Tu as vendu en moyenne " + franc(r.venteMoyenne) + " par jour de vente."
      : r.tendance > 100
        ? "Tes ventes ont plus que doublé par rapport " + r.periode.avant + "."
        : r.tendance >= 0
          ? "Tes ventes montent de " + r.tendance + " % par rapport " + r.periode.avant + "."
          : "Tes ventes baissent de " + Math.abs(r.tendance) + " % par rapport " + r.periode.avant + ".",
    conseil: r.tendance === null ? "Note chaque vente, même petite : c'est cette courbe qui te dira si tu progresses."
      : r.tendance < -15 ? "Regarde ce qui a changé : un produit en rupture, un concurrent, la saison. Préviens tes bons clients que tu as de la marchandise."
      : r.tendance >= 15 ? "Ça monte : garde le stock de tes produits qui partent, c'est le pire moment pour en manquer."
      : "Ça tient. Vise une hausse régulière plutôt qu'un gros coup."
  }));
  // Le comparatif demandé : ce qui rentre face à ce qui sort.
  const ecart = r.recettes - r.sorties;
  act.push(carteIndicateur({
    nom: "Ce qui rentre et ce qui sort",
    valeur: sommeF(ecart),
    verdict: ecart > 0 ? "bon" : ecart === 0 ? "attention" : "alerte",
    dessin: comparatifSvg(r.points),
    lecture: "Il est rentré " + franc(r.recettes) + " et il est sorti " + franc(r.sorties) + ".",
    conseil: ecart >= 0
      ? "Ta caisse se remplit. Mets de côté une part de cet écart chaque semaine."
      : "Il sort plus d'argent qu'il n'en rentre. Regarde le camembert des dépenses juste en dessous, et fais-toi payer tes crédits."
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

  /* ---------------- D'où vient l'argent, et où il part ---------------- */
  const rep = [];
  if (r.partsCA.length) {
    const premier = r.partsCA[0];
    const partPremier = Math.round(premier.valeur / r.vendu * 100);
    rep.push(carteIndicateur({
      nom: "D'où vient ton chiffre d'affaires",
      valeur: franc(r.vendu),
      verdict: partPremier > 60 ? "attention" : "bon",
      dessin: camembertSvg(r.partsCA),
      lecture: premier.nom + " fait " + partPremier + " % de tes ventes.",
      conseil: partPremier > 60
        ? "Tout repose sur un seul produit : le jour où il manque, ta journée est perdue. Cherche un deuxième produit qui marche."
        : "Tes ventes sont bien réparties : si un produit manque, la boutique tient quand même."
    }));
  }
  if (r.postes.length) {
    const gros = r.postes[0];
    const partGros = Math.round(gros.valeur / r.totalSorties * 100);
    rep.push(carteIndicateur({
      nom: "Où part ton argent",
      valeur: franc(r.totalSorties),
      verdict: gros.cle === "marchandise" ? "bon" : gros.cle === "maison" ? "alerte" : "attention",
      dessin: camembertSvg(r.postes),
      lecture: "Ton plus gros poste, c'est " + gros.phrase + " : " + partGros + " % de ce qui sort.",
      conseil: gros.cle === "marchandise"
        ? "C'est normal : la marchandise se revend. Surveille surtout que tu ne l'achètes pas trop cher."
        : gros.cle === "maison"
          ? "Tu prends plus pour la maison que tu ne dépenses pour la boutique. Fixe-toi une somme fixe par semaine."
          : gros.cle === "charge"
            ? "Tes charges fixes pèsent lourd : vends plus, ou cherche à les faire baisser (loyer, électricité)."
            : "Regarde ligne par ligne ce qui compose ce poste : c'est là qu'on trouve la dépense de trop."
    }));
  }
  cartes.push(famille("Répartition", "D'où vient l'argent, et où il part ?", rep));

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
        : r.tauxMarge < 30
          ? "Ça peut monter : négocie tes achats en gros, ou ajoute des produits qui marchent mieux."
          : "Bonne marge. Garde-la en achetant toujours au même bon prix."
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
          : "Tu as " + r.aRelancer + " clients à relancer aujourd'hui. Va dans l'onglet Relances.")
        : "Le crédit fait revenir les clients. Garde-le sous contrôle en notant chaque fois le numéro."
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
        : r.recouvrement < 80
          ? "Pas mal. Fixe une date avec chaque client au moment du crédit : c'est ce qui fait payer."
          : "Tes clients te paient bien. Continue à noter chaque remboursement le jour même."
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
        : r.joursDeStock > 15
          ? "Correct. Surveille les produits qui restent longtemps : ce sont eux qui bloquent ton argent."
          : "Ton stock tourne vite : ton argent travaille au lieu de dormir."
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
        ? "Tu gagnes environ " + franc(r.beneficeParJour) + " par jour de vente, soit " + franc(r.benefice) + " au total."
        : "Tu perds environ " + franc(Math.abs(r.beneficeParJour)) + " par jour de vente, soit " + franc(Math.abs(r.benefice)) + " au total.",
      conseil: r.tauxNet < 5
        ? "Ton bénéfice est trop mince. Regarde d'abord tes trois plus grosses dépenses, puis tes prix."
        : r.tauxNet < 15
          ? "Ça passe, mais sans marge de sécurité. Un mois creux et tu es dans le rouge."
          : "Beau bénéfice. Garde une part de côté : c'est elle qui paiera ton prochain investissement."
    }));
  }
  if (r.seuil) {
    pro.push(carteIndicateur({
      nom: "Seuil de rentabilité",
      valeur: franc(r.seuil),
      verdict: r.joursAuSeuil >= r.joursVente * 0.8 ? "bon" : r.joursAuSeuil >= r.joursVente * 0.5 ? "attention" : "alerte",
      lecture: "Tu as dépassé ce seuil " + r.joursAuSeuil + " jours sur les " + r.joursNotes + " derniers.",
      conseil: r.joursAuSeuil >= r.joursVente * 0.8
        ? "Tu couvres tes charges presque tous les jours : c'est la base d'une boutique solide."
        : "En dessous de ce chiffre, ta journée ne paie même pas tes charges. Vise-le dès le matin."
    }));
  }
  if (r.produitsCA.length) {
    pro.push(carteIndicateur({
      nom: "Tes 5 plus gros chiffres d'affaires",
      valeur: echapper(r.produitsCA[0].nom),
      verdict: "neutre",
      dessin: barresListe(r.produitsCA.slice(0, 5), function (p) { return p.vendu; }, function (p) { return franc(p.vendu); }),
      lecture: "Ce que chaque produit t'a fait encaisser, avant le prix de revient.",
      conseil: "Le plus gros chiffre d'affaires n'est pas toujours celui qui rapporte le plus : compare avec la carte du bénéfice."
    }));
    pro.push(carteIndicateur({
      nom: "Tes 5 produits les plus vendus",
      valeur: echapper(r.produitsQte[0].nom),
      verdict: "neutre",
      dessin: barresListe(r.produitsQte.slice(0, 5), function (p) { return p.qte; }, function (p) { return qteTexte(p.qte, p.unite); }),
      lecture: "Ce qui sort le plus souvent de ta boutique, en quantité.",
      conseil: "Ce sont eux qui font venir les clients : ne les laisse jamais manquer, même si tu gagnes peu dessus."
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
      : "Fais-toi d'abord payer tes crédits et règle tes fournisseurs : c'est le premier investissement."
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
  const gardee = lire(CLE_PERIODE);
  if (PERIODES[gardee]) periodeTableau = gardee;
  $("vue-tableau").addEventListener("click", function (e) {
    const p = e.target.closest("[data-periode]");
    if (p) {
      periodeTableau = p.dataset.periode;
      ecrire(CLE_PERIODE, periodeTableau);
      afficherTableau();
      $("vue-tableau").scrollIntoView({ block: "start" });
      return;
    }
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

// Canari · fiches de coût (lot B) : ce que coûte vraiment chaque produit ou service.
// Chargé avant app.js. Utilisé par la fiche produit (boutique.js).
//
// Trois types de produits :
//   revente     : prix d'achat (éventuellement en sac, carton… voir boutique.js) ;
//   fabrication : recette d'un lot (fournée) : chaque intrant × quantité × prix,
//                 plus gaz, main-d'œuvre, emballages… divisé par le nombre obtenu ;
//   service     : coûts intermédiaires d'une prestation (mèches, pièces, carburant…).
// Le coût d'une unité vendue est gardé dans p.cout, comme pour la revente.

const TYPES_PRODUIT = {
  revente: "Je le revends",
  fabrication: "Je le fabrique",
  service: "C'est un service"
};

// Modèles pré-remplis : les lignes habituelles, sans prix (ils changent d'un marché à l'autre).
const MODELES_FICHES = {
  fabrication: [
    { nom: "Pain", unite: "unite", lignes: [["Farine", "kg"], ["Levure", "kg"], ["Sel", "kg"], ["Sucre", "kg"], ["Gaz ou bois", "forfait"], ["Main-d'œuvre", "forfait"], ["Sachets", "unite"]] },
    { nom: "Attiéké", unite: "sachet", lignes: [["Manioc", "kg"], ["Ferment", "kg"], ["Huile", "litre"], ["Gaz ou bois", "forfait"], ["Main-d'œuvre", "forfait"], ["Sachets", "unite"], ["Transport", "forfait"]] },
    { nom: "Jus (bissap, gingembre)", unite: "bouteille", lignes: [["Bissap ou gingembre", "kg"], ["Sucre", "kg"], ["Arômes, menthe", "forfait"], ["Eau", "litre"], ["Bouteilles ou sachets", "unite"], ["Glace", "forfait"], ["Gaz", "forfait"]] },
    { nom: "Garba", unite: "plat", lignes: [["Attiéké", "sachet"], ["Poisson (thon)", "kg"], ["Huile", "litre"], ["Piment, oignon, tomate", "forfait"], ["Sachets", "unite"], ["Gaz", "forfait"]] },
    { nom: "Savon", unite: "unite", lignes: [["Huile ou beurre de karité", "kg"], ["Soude", "kg"], ["Parfum", "litre"], ["Emballages", "unite"], ["Main-d'œuvre", "forfait"]] },
    { nom: "Vêtement cousu", unite: "unite", lignes: [["Tissu", "metre"], ["Doublure", "metre"], ["Fil", "unite"], ["Boutons, fermeture", "unite"], ["Électricité", "forfait"], ["Main-d'œuvre", "forfait"]] }
  ],
  service: [
    { nom: "Coiffure, tresses", unite: "prestation", lignes: [["Mèches", "paquet"], ["Produits (gel, huile…)", "forfait"], ["Électricité", "forfait"], ["Aide coiffeuse", "forfait"]] },
    { nom: "Réparation de téléphone", unite: "prestation", lignes: [["Pièce (écran, batterie…)", "unite"], ["Colle, petits outils", "forfait"], ["Déplacement", "forfait"]] },
    { nom: "Retouche, couture sur mesure", unite: "prestation", lignes: [["Fil", "unite"], ["Boutons, fermeture", "unite"], ["Électricité", "forfait"]] },
    { nom: "Livraison, transport", unite: "prestation", lignes: [["Carburant", "litre"], ["Entretien de la moto", "forfait"], ["Crédit téléphone", "forfait"]] },
    { nom: "Lavage (auto, linge)", unite: "prestation", lignes: [["Savon, détergent", "forfait"], ["Eau", "litre"], ["Électricité", "forfait"]] }
  ]
};

/* ---------- Calculs ---------- */

// Une ligne reliée à un intrant du stock prend son prix moyen (sauf prix changé à la main).
function coutLigne(l) {
  return (l.qte || 0) * (l.prixManuel ? (l.prix || 0) : prixLigne(l));
}
function totalFiche(fiche) {
  return (fiche.lignes || []).reduce(function (s, l) { return s + coutLigne(l); }, 0);
}
// Coût d'une unité vendue : total du lot ÷ nombre obtenu (1 pour un service).
function coutUnitaireFiche(fiche) {
  const r = fiche.rendement > 0 ? fiche.rendement : 1;
  return totalFiche(fiche) / r;
}
function typeDe(p) {
  return (p && p.type) || "revente";
}

/* ---------- Fiche dans le formulaire produit ---------- */

let typeProduit = "revente";
let ficheEnCours = { lignes: [], rendement: 1 };

function optionsUnites(choisie) {
  return Object.keys(UNITES).map(function (u) {
    return '<option value="' + u + '"' + (u === choisie ? ' selected' : '') + '>' + (u === "unite" ? "unité" : UNITES[u][0]) + '</option>';
  }).join("");
}

function ligneFicheHtml(l) {
  const cout = coutLigne(l);
  return '<li class="ligne-charge ligne-fiche" data-id="' + l.id + '">' +
    '<div class="lc-haut"><input class="note lc-nom lf-nom" value="' + echapper(l.nom) + '" aria-label="Poste" placeholder="ex. Farine">' +
    '<button type="button" class="retirer" data-retirer-ligne="' + l.id + '" aria-label="Retirer cette ligne">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
    '<div class="lc-bas">' +
      '<input class="note lf-qte" inputmode="decimal" placeholder="Qté" value="' + (l.qte ? String(l.qte).replace(".", ",") : "") + '" aria-label="Quantité">' +
      '<select class="note lf-unite" aria-label="Unité">' + optionsUnites(l.unite) + '</select>' +
      '<span class="lf-fois">×</span>' +
      '<input class="note lf-prix" inputmode="numeric" placeholder="Prix" value="' + (l.prix ? nombre(l.prix) : "") + '" aria-label="Prix unitaire">' +
    '</div>' +
    '<p class="lf-cout">' + texteCoutLigne(l) + '</p>' +
    '</li>';
}

function texteCoutLigne(l) {
  const cout = coutLigne(l);
  const stock = l.intrantId && donnees.intrants[l.intrantId] && !l.prixManuel ? " · prix moyen du stock" : "";
  return cout ? "= " + franc(Math.round(cout)) + stock : "Prix de 1 " + nomUnite(l.unite, 1);
}

function afficherFicheForm() {
  const fab = typeProduit === "fabrication";
  const u = uniteChoisie();
  $("fiche-rendement-bloc").hidden = !fab;
  $("fiche-rendement-etiquette").textContent = "Une fournée (un lot) donne combien de " + nomUnite(u, 2) + " ?";
  $("fiche-titre-lignes").textContent = fab ? "Ce que coûte une fournée" : "Ce que coûte une prestation";
  $("fiche-modeles").innerHTML = (MODELES_FICHES[typeProduit] || []).map(function (m, i) {
    return '<button type="button" class="suggestion" data-modele="' + i + '"><b>' + m.nom + '</b></button>';
  }).join("");
  $("fiche-lignes").innerHTML = ficheEnCours.lignes.map(ligneFicheHtml).join("");
  majTotalFiche();
}

// Relit les lignes tapées (sans tout redessiner, pour ne pas fermer le clavier).
function lireFicheForm() {
  document.querySelectorAll("#fiche-lignes .ligne-fiche").forEach(function (li) {
    const l = ficheEnCours.lignes.find(function (x) { return x.id === li.dataset.id; });
    if (!l) return;
    l.nom = li.querySelector(".lf-nom").value.trim();
    l.qte = lireQte(li.querySelector(".lf-qte").value) || 0;
    l.unite = li.querySelector(".lf-unite").value;
    const prix = lireMontant(li.querySelector(".lf-prix").value);
    // Prix changé à la main sur une ligne reliée au stock : il remplacera le prix de l'intrant.
    const i = l.intrantId && donnees.intrants[l.intrantId];
    if (i && typeof i.cout === "number" && prix !== Math.round(i.cout)) l.prixManuel = true;
    l.prix = prix;
    li.querySelector(".lf-cout").textContent = texteCoutLigne(l);
  });
  const r = lireQte($("fiche-rendement").value);
  ficheEnCours.rendement = typeProduit === "fabrication" ? (r > 0 ? r : 0) : 1;
}

function majTotalFiche() {
  const total = totalFiche(ficheEnCours);
  const u = uniteChoisie();
  const fab = typeProduit === "fabrication";
  const unitaire = ficheEnCours.rendement > 0 ? total / ficheEnCours.rendement : 0;
  $("fiche-total").innerHTML = !total ? '<span>Remplis les quantités et les prix.</span>'
    : '<span>' + (fab ? "Total de la fournée" : "Total d'une prestation") + '</span><b>' + franc(total) + '</b>' +
      (fab ? (ficheEnCours.rendement > 0
        ? '<span>÷ ' + qteTexte(ficheEnCours.rendement, u) + ' = coût de revient</span><b>' + franc(Math.round(unitaire)) + parUnite(u) + '</b>'
        : '<span class="m-sort">Indique combien la fournée donne.</span><b></b>') : '');
  majMargeProduit();
}

function nouvelleLigneFiche(nom, unite) {
  return { id: nouvelId(), nom: nom || "", qte: 0, unite: unite || "kg", prix: 0 };
}

function choisirType(t) {
  typeProduit = t;
  document.querySelectorAll("[data-type-produit]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.typeProduit === t));
  });
  const revente = t === "revente";
  $("bloc-achat").hidden = !revente || !suiviProduit;
  $("bloc-achat-autre").hidden = !revente || !achatAutre;
  $("bloc-cout-simple").hidden = !revente || achatAutre;
  $("bloc-fiche").hidden = revente;
  if (!revente && !ficheEnCours.lignes.length) ficheEnCours.lignes.push(nouvelleLigneFiche());
  if (!revente) afficherFicheForm();
  majUniteProduit();
}

function chargerFicheForm(p) {
  ficheEnCours = p && p.fiche ? JSON.parse(JSON.stringify(p.fiche)) : { lignes: [], rendement: 1 };
  ficheEnCours.lignes.forEach(function (l) {
    if (!l.id) l.id = nouvelId();
    // Afficher le prix moyen actuel de l'intrant relié.
    const i = l.intrantId && donnees.intrants[l.intrantId];
    if (i && typeof i.cout === "number") l.prix = Math.round(i.cout);
    delete l.prixManuel;
  });
  $("fiche-rendement").value = ficheEnCours.rendement > 0 && typeDe(p) === "fabrication" ? String(ficheEnCours.rendement).replace(".", ",") : "";
}

// Vérifie la fiche avant d'enregistrer. Rend un message d'erreur, ou "".
function verifierFiche() {
  lireFicheForm();
  // Les lignes vides ou à 0 F (ex. « Sucre » laissé vide) ne sont pas gardées.
  ficheEnCours.lignes = ficheEnCours.lignes.filter(function (l) { return coutLigne(l) > 0; });
  if (!ficheEnCours.lignes.some(function (l) { return coutLigne(l) > 0; })) {
    return "Remplis au moins une ligne de la fiche de coût (quantité et prix).";
  }
  if (typeProduit === "fabrication" && !(ficheEnCours.rendement > 0)) return "Indique combien une fournée donne.";
  return "";
}

/* ---------- Voir la fiche de coût d'un produit (la matrice) ---------- */

function ficheTableHtml(p) {
  const u = uniteDe(p);
  const t = typeDe(p);
  const cout = coutProduit(p);
  const marge = p.prix - cout;
  const pct = p.prix ? Math.round(marge / p.prix * 100) : 0;
  const classe = marge < 0 ? "perte" : pct < 10 ? "faible" : "bonne";
  let lignes = "", pied = "";
  if (t === "revente") {
    if (p.uniteAchat) {
      lignes = '<tr><td>Achat d\'un ' + nomUnite(p.uniteAchat, 1) + '</td><td>' + qteTexte(p.contenance, u) + '</td><td>' + franc(p.prixAchatLot) + '</td></tr>';
      pied = '<tr class="sous-total"><td colspan="2">Prix d\'achat moyen' + parUnite(u) + '</td><td>' + franc(Math.round(cout)) + '</td></tr>';
    } else {
      lignes = '<tr><td>Prix d\'achat' + (typeof p.cout === "number" ? "" : " (marge habituelle)") + '</td><td>1 ' + nomUnite(u, 1) + '</td><td>' + franc(Math.round(cout)) + '</td></tr>';
    }
  } else {
    const f = p.fiche || { lignes: [], rendement: 1 };
    lignes = f.lignes.map(function (l) {
      const stock = l.intrantId && donnees.intrants[l.intrantId];
      return '<tr><td>' + echapper(l.nom || "—") + '<small>' + franc(Math.round(prixLigne(l))) + parUnite(l.unite) + (stock ? " (prix moyen)" : "") + '</small></td><td>' + qteTexte(l.qte, l.unite) + '</td><td>' + franc(Math.round(coutLigne(l))) + '</td></tr>';
    }).join("");
    pied = '<tr class="sous-total"><td colspan="2">' + (t === "fabrication" ? "Total de la fournée" : "Total d'une prestation") + '</td><td>' + franc(Math.round(totalFiche(f))) + '</td></tr>' +
      (t === "fabrication" ? '<tr><td colspan="2">÷ nombre obtenu</td><td>' + qteTexte(f.rendement, u) + '</td></tr>' : '');
  }
  return '<table class="matrice">' +
    '<thead><tr><th>Poste</th><th>Quantité</th><th>Coût</th></tr></thead>' +
    '<tbody>' + lignes + pied +
      '<tr class="total"><td colspan="2">Coût de revient' + parUnite(u) + '</td><td>' + franc(Math.round(cout)) + '</td></tr>' +
      '<tr><td colspan="2">Prix de vente' + parUnite(u) + '</td><td>' + franc(p.prix) + '</td></tr>' +
      '<tr class="marge ' + classe + '"><td colspan="2">Marge' + parUnite(u) + ' (' + (pct < 0 ? "− " + (-pct) : pct) + ' %)</td><td>' + (marge < 0 ? "− " : "") + franc(Math.abs(Math.round(marge))) + '</td></tr>' +
    '</tbody></table>' +
    (classe === "perte" ? '<p class="alerte-marge">Attention : tu perds de l\'argent sur ce produit. Augmente le prix ou baisse les coûts.</p>'
      : classe === "faible" ? '<p class="alerte-marge faible">Marge faible : moins de 10 %. Vérifie tes prix.</p>' : '');
}

let produitFiche = null;
function ouvrirFicheCout(id) {
  produitFiche = donnees.produits[id];
  if (!produitFiche) return;
  $("fiche-apercu-titre").textContent = "Fiche de coût : " + produitFiche.nom;
  $("fiche-apercu-type").textContent = TYPES_PRODUIT[typeDe(produitFiche)];
  $("fiche-apercu-contenu").innerHTML = ficheTableHtml(produitFiche);
  ouvrirFeuille("fiche-apercu");
}

/* ---------- Mise en route ---------- */

function initFiches() {
  $("produit-type").addEventListener("click", function (e) {
    const b = e.target.closest("[data-type-produit]");
    if (!b) return;
    if (typeProduit !== "revente") lireFicheForm();
    choisirType(b.dataset.typeProduit);
    // Un service ne se compte pas en stock, par défaut.
    if (!produitEnCours) choisirSuivi(b.dataset.typeProduit !== "service");
  });
  $("fiche-lignes").addEventListener("input", function (e) {
    if (e.target.classList.contains("lf-prix")) {
      const chiffres = e.target.value.replace(/\D/g, "").slice(0, 9);
      e.target.value = chiffres ? nombre(Number(chiffres)) : "";
    }
    lireFicheForm();
    majTotalFiche();
  });
  $("fiche-lignes").addEventListener("change", function () { lireFicheForm(); majTotalFiche(); });
  $("fiche-rendement").addEventListener("input", function () { lireFicheForm(); majTotalFiche(); });
  $("fiche-lignes").addEventListener("click", function (e) {
    const b = e.target.closest("[data-retirer-ligne]");
    if (!b) return;
    lireFicheForm();
    ficheEnCours.lignes = ficheEnCours.lignes.filter(function (l) { return l.id !== b.dataset.retirerLigne; });
    afficherFicheForm();
  });
  $("fiche-ajouter").addEventListener("click", function () {
    lireFicheForm();
    ficheEnCours.lignes.push(nouvelleLigneFiche("", "forfait"));
    afficherFicheForm();
    const noms = document.querySelectorAll("#fiche-lignes .lf-nom");
    if (noms.length) noms[noms.length - 1].focus();
  });
  $("fiche-modeles").addEventListener("click", function (e) {
    const b = e.target.closest("[data-modele]");
    if (!b) return;
    const m = MODELES_FICHES[typeProduit][Number(b.dataset.modele)];
    lireFicheForm();
    const dejaRemplie = ficheEnCours.lignes.some(function (l) { return l.qte || l.prix; });
    if (dejaRemplie && !window.confirm("Remplacer les lignes déjà tapées par le modèle « " + m.nom + " » ?")) return;
    ficheEnCours.lignes = m.lignes.map(function (x) { return nouvelleLigneFiche(x[0], x[1]); });
    if (!$("produit-nom").value.trim()) $("produit-nom").value = m.nom;
    $("produit-unite").value = m.unite;
    afficherFicheForm();
    majUniteProduit();
  });
  $("fiche-apercu-modifier").addEventListener("click", function () {
    if (produitFiche) ouvrirProduit(produitFiche.id);
  });
  $("fiche-apercu-fermer").addEventListener("click", fermerFeuilles);
}

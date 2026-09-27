// Canari · infos de la boutique (logo…), produits, prix et stock.
// Ce fichier est chargé avant app.js ; il utilise ses outils ($, donnees, franc…)
// seulement quand on l'appelle, et initBoutique() est lancé au démarrage par app.js.

/* ---------- Unités de vente ---------- */

// Chaque produit se vend dans une unité : le prix, le prix d'achat, le stock et
// l'alerte sont tous comptés dans cette unité (ex. 500 F le kg, 12,5 kg en stock).
const UNITES = {
  unite: ["unité", "unités"], kg: ["kg", "kg"], g: ["g", "g"], litre: ["litre", "litres"],
  cl: ["cl", "cl"], metre: ["mètre", "mètres"], sac: ["sac", "sacs"], carton: ["carton", "cartons"],
  paquet: ["paquet", "paquets"], sachet: ["sachet", "sachets"], boite: ["boîte", "boîtes"],
  bouteille: ["bouteille", "bouteilles"], bidon: ["bidon", "bidons"], tas: ["tas", "tas"],
  botte: ["botte", "bottes"], plat: ["plat", "plats"], prestation: ["prestation", "prestations"]
};
function uniteDe(p) { return (p && p.unite) || "unite"; }
function nomUnite(u, n) {
  const noms = UNITES[u];
  if (!noms) return Math.abs(n) >= 2 && !/[sxz]$/.test(u) ? u + "s" : u; // unité tapée à la main
  return Math.abs(n) >= 2 ? noms[1] : noms[0];
}
// Quantité lisible : « 2,5 kg », « 3 sacs », « 1 unité ».
function qteTexte(n, u) {
  const q = Math.round(n * 1000) / 1000;
  return q.toLocaleString("fr-FR", { maximumFractionDigits: 3 }).replace(/[\u00a0\u202f]/g, " ") + "\u00a0" + nomUnite(u || "unite", q);
}
// Lit une quantité tapée, avec virgule ou point : « 1,5 » → 1.5.
function lireQte(texte) {
  const n = parseFloat(String(texte).replace(/\s/g, "").replace(",", "."));
  return isNaN(n) ? NaN : Math.round(n * 1000) / 1000;
}
// Libellé d'une ligne vendue : « 3 × Savon » ou « Riz 2,5 kg ».
function libelleLigne(l) {
  return !l.unite || l.unite === "unite" ? String(l.qte).replace(".", ",") + " × " + l.nom : l.nom + " " + qteTexte(l.qte, l.unite);
}
// « 500 F / kg » ; rien pour l'unité simple.
function parUnite(u) { return !u || u === "unite" ? "" : " / " + nomUnite(u, 1); }

/* ---------- Produits et stock ---------- */

// Un produit : { id, nom, unite, prix, cout, suivi (compter le stock ?), seuil (alerte) }.
// S'il s'achète dans une autre unité (sac de 50 kg vendu au kg) :
//   uniteAchat = "sac", contenance = 50 (kg dans un sac), prixAchatLot = prix d'un sac.
// « cout » est toujours le prix d'achat moyen d'UNE unité de vente (le kg).
// Le stock n'est jamais écrit à la main : il se calcule à partir des lignes
// « stock » (départ, arrivage, correction) moins les quantités vendues.
// Ainsi, retirer une vente remet automatiquement le produit en stock.
function stockDe(idProduit) {
  let n = 0;
  donnees.mouvements.forEach(function (m) {
    if (m.type === "stock" && m.produitId === idProduit) n += m.quantite;
    else if (m.lignes) m.lignes.forEach(function (l) { if (l.produitId === idProduit) n -= l.qte; });
  });
  return Math.round(n * 1000) / 1000;
}

function listeProduits() {
  return Object.keys(donnees.produits).map(function (id) { return donnees.produits[id]; })
    .sort(function (a, b) { return a.nom.localeCompare(b.nom, "fr"); });
}

function aRacheter(p) {
  return p.suivi && stockDe(p.id) <= (p.seuil || 0);
}
function produitsARacheter() {
  return listeProduits().filter(aRacheter);
}

function afficherStock() {
  const produits = listeProduits();
  const bas = produits.filter(aRacheter);
  $("nb-stock").hidden = bas.length === 0;
  $("nb-stock").textContent = bas.length;

  if (!produits.length) {
    $("vue-stock").innerHTML =
      '<div class="vide"><img src="icones/canari-pensif.webp" width="96" height="114" alt="">' +
      '<p>Ajoute les produits que tu vends avec leur prix.<br>Tes ventes iront plus vite, tes factures seront détaillées et Canari comptera ton stock.</p></div>' +
      '<button type="button" class="bouton bouton-sauver" data-nouveau-produit>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Ajouter un produit</button>';
    return;
  }

  const valeur = produits.reduce(function (s, p) {
    return s + (p.suivi ? Math.max(0, stockDe(p.id)) * coutProduit(p) : 0);
  }, 0);
  const ordre = bas.concat(produits.filter(function (p) { return !aRacheter(p); }));

  $("vue-stock").innerHTML =
    '<div class="carte-gain carte-stock">' +
      '<p class="etiquette">Valeur de ton stock (prix d\'achat)</p>' +
      '<p class="gros-chiffre">' + franc(valeur) + '</p>' +
      '<div class="trois-chiffres deux">' +
        '<div class="chiffre entre"><span>Produits</span><strong>' + produits.length + '</strong></div>' +
        '<div class="chiffre sort"><span>À racheter</span><strong>' + bas.length + '</strong></div>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="bouton bouton-sauver ajouter-produit" data-nouveau-produit>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Ajouter un produit</button>' +
    (produits.length > 6 ? '<input class="note recherche-stock" id="recherche-stock" type="search" placeholder="Chercher un produit">' : '') +
    '<ul class="produits" id="liste-produits">' + ordre.map(function (p) {
      const n = stockDe(p.id), u = uniteDe(p);
      const etat = !p.suivi ? '<span class="stock-quantite neutre">Stock non compté</span>'
        : '<span class="stock-quantite' + (aRacheter(p) ? ' bas' : '') + '"><b>' + qteTexte(n, u) + '</b> en stock' +
          (p.uniteAchat && p.contenance ? ' <small>(≈ ' + qteTexte(Math.round(n / p.contenance * 10) / 10, p.uniteAchat) + ')</small>' : '') +
          (aRacheter(p) ? ' · à racheter' : '') + '</span>';
      return '<li class="produit' + (aRacheter(p) ? ' bas' : '') + '" data-nom="' + echapper(p.nom.toLowerCase()) + '">' +
        '<div class="client-haut"><b>' + echapper(p.nom) + '</b><strong>' + franc(p.prix) + '<small>' + parUnite(u) + '</small></strong></div>' +
        '<p class="aide">Coûte ' + franc(coutProduit(p)) + parUnite(u) + (typeof p.cout === "number" ? "" : " (marge habituelle)") +
          (p.uniteAchat ? ' (acheté ' + franc(p.prixAchatLot) + ' le ' + nomUnite(p.uniteAchat, 1) + ' de ' + qteTexte(p.contenance, u) + ')' : '') +
          ' · bénéfice ' + franc(p.prix - coutProduit(p)) + (u === "unite" ? " par vente" : " par " + nomUnite(u, 1)) + '</p>' +
        '<p>' + etat + '</p>' +
        '<div class="client-boutons' + (p.suivi ? '' : ' un-seul') + '">' +
          '<button type="button" class="bouton bouton-fiche" data-modifier-produit="' + p.id + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/></svg>Modifier</button>' +
          (p.suivi ? '<button type="button" class="bouton bouton-arrivage" data-arrivage="' + p.id + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Arrivage</button>' : '') +
        '</div>' +
      '</li>';
    }).join("") + '</ul>';
}

/* ---------- Ajouter ou modifier un produit ---------- */

let produitEnCours = null; // null = nouveau produit
let suiviProduit = true;
let achatAutre = false;   // acheté dans une autre unité (sac, carton…)

function choisirAchat(autre) {
  achatAutre = autre;
  document.querySelectorAll("[data-achat]").forEach(function (b) {
    b.setAttribute("aria-pressed", String((b.dataset.achat === "autre") === autre));
  });
  $("bloc-achat-autre").hidden = !autre;
  $("bloc-cout-simple").hidden = autre;
  majUniteProduit();
}
// Prix d'achat d'une unité de vente, d'après le prix du sac (ou du carton).
function coutDepuisLot() {
  const contenance = lireQte($("produit-contenance").value);
  const lot = lireMontant($("produit-prix-lot").value);
  return contenance > 0 && lot > 0 ? lot / contenance : 0;
}

function choisirSuivi(oui) {
  suiviProduit = oui;
  document.querySelectorAll("[data-suivi]").forEach(function (b) {
    b.setAttribute("aria-pressed", String((b.dataset.suivi === "oui") === oui));
  });
  $("bloc-quantite").hidden = !oui;
  majUniteProduit();
}

function uniteChoisie() {
  const v = $("produit-unite").value;
  if (v !== "autre") return v;
  return $("produit-unite-autre").value.trim().toLowerCase() || "unite";
}
// Met toutes les étiquettes du formulaire dans l'unité choisie.
function majUniteProduit() {
  const u = uniteChoisie();
  $("produit-unite-autre").hidden = $("produit-unite").value !== "autre";
  const une = u === "unite" ? "" : " (par " + nomUnite(u, 1) + ")";
  $("produit-prix-etiquette").textContent = "Prix de vente" + une;
  $("produit-cout-etiquette").textContent = (suiviProduit ? "Prix d'achat" : "Ce que ça te coûte") + une + (suiviProduit ? "" : " (facultatif)");
  const plur = u === "unite" ? "" : " (en " + nomUnite(u, 2) + ")";
  $("produit-quantite-etiquette").textContent = (produitEnCours ? "Combien il en reste vraiment ?" : "Combien tu en as maintenant ?") + plur;
  $("produit-seuil-etiquette").textContent = "Me prévenir quand il en reste" + plur;
  $("achat-meme").textContent = u === "unite" ? "Pareil (à l'unité)" : "Pareil (au " + nomUnite(u, 1) + ")";
  const ua = $("produit-unite-achat").value;
  $("contenance-etiquette").textContent = "Combien de " + nomUnite(u, 2) + " dans un " + nomUnite(ua, 1) + " ?";
  $("prix-lot-etiquette").textContent = "Prix d'achat d'un " + nomUnite(ua, 1);
  $("bloc-achat").hidden = !suiviProduit;
  if (!suiviProduit && achatAutre) { achatAutre = false; $("bloc-achat-autre").hidden = true; $("bloc-cout-simple").hidden = false; }
  majMargeProduit();
}

function majMargeProduit() {
  const prix = lireMontant($("produit-prix").value);
  const lot = achatAutre ? coutDepuisLot() : 0;
  const tape = achatAutre ? lot > 0 : $("produit-cout").value.trim() !== "";
  const cout = achatAutre ? lot : tape ? lireMontant($("produit-cout").value) : coutParMarge(prix);
  if (!prix) { $("produit-marge").textContent = "Si tu ne sais pas, laisse vide : Canari utilisera ta marge habituelle (" + margeHabituelle() + " %)."; return; }
  const b = prix - cout;
  const u = uniteChoisie();
  $("produit-marge").textContent = (achatAutre && lot ? "Prix d'achat : " + franc(Math.round(lot * 100) / 100) + parUnite(u) + ". " : "") +
    (tape ? "" : "Marge habituelle (" + margeHabituelle() + " %) : ") +
    (achatAutre && lot ? "Tu gagnes " : "tu gagnes ") + (b < 0 ? "− " : "") + franc(Math.abs(b)) + (u === "unite" ? " sur chaque vente." : " par " + nomUnite(u, 1) + ".");
}

function ouvrirProduit(id) {
  const p = id ? donnees.produits[id] : null;
  produitEnCours = p;
  $("produit-titre").textContent = p ? "Modifier " + p.nom : "Nouveau produit";
  $("produit-nom").value = p ? p.nom : "";
  $("produit-prix").value = p ? nombre(p.prix) : "";
  $("produit-cout").value = p && typeof p.cout === "number" ? nombre(p.cout) : "";
  $("produit-quantite").value = p ? String(stockDe(p.id)).replace(".", ",") : "";
  $("produit-seuil").value = p ? String(p.seuil).replace(".", ",") : "3";
  const u = uniteDe(p);
  $("produit-unite").value = UNITES[u] ? u : "autre";
  $("produit-unite-autre").value = UNITES[u] ? "" : u;
  $("produit-unite-achat").value = p && p.uniteAchat ? p.uniteAchat : "sac";
  $("produit-contenance").value = p && p.contenance ? String(p.contenance).replace(".", ",") : "";
  $("produit-prix-lot").value = p && p.prixAchatLot ? nombre(p.prixAchatLot) : "";
  achatAutre = !!(p && p.uniteAchat);
  $("bloc-achat-autre").hidden = !achatAutre;
  $("bloc-cout-simple").hidden = achatAutre;
  document.querySelectorAll("[data-achat]").forEach(function (b) {
    b.setAttribute("aria-pressed", String((b.dataset.achat === "autre") === achatAutre));
  });
  $("produit-erreur").hidden = true;
  $("produit-supprimer").hidden = !p;
  choisirSuivi(p ? p.suivi : true);
  ouvrirFeuille("produit-form");
  if (!p) $("produit-nom").focus();
}

function enregistrerProduit(e) {
  e.preventDefault();
  const nom = $("produit-nom").value.trim().replace(/\s+/g, " ");
  const prix = lireMontant($("produit-prix").value);
  const oups = function (t, champ) { $("produit-erreur").textContent = t; $("produit-erreur").hidden = false; champ.focus(); };
  if (!nom) return oups("Écris le nom du produit.", $("produit-nom"));
  if (!prix) return oups("Écris le prix de vente.", $("produit-prix"));
  const deja = listeProduits().find(function (p) {
    return p.nom.toLowerCase() === nom.toLowerCase() && (!produitEnCours || p.id !== produitEnCours.id);
  });
  if (deja) return oups("Tu as déjà un produit qui s'appelle « " + deja.nom + " ».", $("produit-nom"));

  const quantiteTapee = $("produit-quantite").value.trim();
  const quantite = lireQte(quantiteTapee);
  const seuil = lireQte($("produit-seuil").value);
  if ($("produit-unite").value === "autre" && !$("produit-unite-autre").value.trim()) {
    return oups("Écris l'unité (ex. seau, pot, rouleau).", $("produit-unite-autre"));
  }
  const p = produitEnCours || { id: nouvelId() };
  p.nom = nom;
  p.unite = uniteChoisie();
  p.prix = prix;
  if (achatAutre) {
    const contenance = lireQte($("produit-contenance").value);
    const lot = lireMontant($("produit-prix-lot").value);
    if (!(contenance > 0)) return oups("Écris combien il y en a dans un " + nomUnite($("produit-unite-achat").value, 1) + ".", $("produit-contenance"));
    if (!lot) return oups("Écris le prix d'achat d'un " + nomUnite($("produit-unite-achat").value, 1) + ".", $("produit-prix-lot"));
    // Le prix moyen n'est remplacé que si le prix du lot ou la contenance ont changé.
    const change = p.uniteAchat !== $("produit-unite-achat").value || p.contenance !== contenance || p.prixAchatLot !== lot;
    p.uniteAchat = $("produit-unite-achat").value;
    p.contenance = contenance;
    p.prixAchatLot = lot;
    if (change || typeof p.cout !== "number") p.cout = Math.round(lot / contenance * 100) / 100;
  } else {
    delete p.uniteAchat; delete p.contenance; delete p.prixAchatLot;
    if ($("produit-cout").value.trim() !== "") {
      const tape = lireMontant($("produit-cout").value);
      if (typeof p.cout !== "number" || Math.round(p.cout) !== tape) p.cout = tape;
    } else delete p.cout;
  }
  p.suivi = suiviProduit;
  p.seuil = isNaN(seuil) ? 3 : Math.max(0, seuil);
  donnees.produits[p.id] = p;

  // Le stock tapé devient une ligne « stock » (départ ou correction).
  if (suiviProduit && quantiteTapee !== "" && !isNaN(quantite)) {
    const ecart = Math.round((quantite - (produitEnCours ? stockDe(p.id) : 0)) * 1000) / 1000;
    if (ecart !== 0) {
      donnees.mouvements.push({
        id: nouvelId(), type: "stock", produitId: p.id, quantite: ecart,
        raison: produitEnCours ? "correction" : "depart", note: p.nom, montant: 0, client: "", t: Date.now()
      });
    }
  }
  sauver();
  fermerFeuilles();
  afficher();
  message(produitEnCours ? p.nom + " modifié." : p.nom + " ajouté à tes produits.", null, true);
}

function supprimerProduit() {
  const p = produitEnCours;
  if (!p || !window.confirm("Supprimer « " + p.nom + " » de tes produits ?\n\nLes ventes déjà notées ne changent pas.")) return;
  delete donnees.produits[p.id];
  sauver();
  fermerFeuilles();
  afficher();
  message(p.nom + " supprimé.");
}

/* ---------- Arrivage de marchandise ---------- */

let produitArrivage = null;
let arrivagePaye = false;

function choisirArrivagePaye(oui) {
  arrivagePaye = oui;
  document.querySelectorAll("[data-arrivage-paye]").forEach(function (b) {
    b.setAttribute("aria-pressed", String((b.dataset.arrivagePaye === "oui") === oui));
  });
  majArrivage();
}
// Affiche la conversion (2 sacs = 100 kg) et le total payé.
function majArrivage() {
  const p = produitArrivage;
  if (!p) return;
  const n = lireQte($("arrivage-quantite").value) || 0;
  const prix = lireMontant($("arrivage-prix").value);
  const u = uniteDe(p);
  $("arrivage-conversion").textContent = p.uniteAchat ? "= " + qteTexte(n * p.contenance, u) + " ajoutés au stock" : "";
  $("arrivage-total").textContent = prix && n ? "Total : " + franc(Math.round(n * prix)) +
    (arrivagePaye ? ", noté comme dépense de marchandise." : "") : "";
}

function ouvrirArrivage(id) {
  produitArrivage = donnees.produits[id];
  $("arrivage-titre").textContent = "Arrivage : " + produitArrivage.nom;
  const u = uniteDe(produitArrivage);
  $("arrivage-actuel").textContent = "Tu en as " + qteTexte(stockDe(id), u) + " en ce moment.";
  const ua = produitArrivage.uniteAchat;
  const unRecu = ua || u;
  $("arrivage-etiquette").textContent = unRecu === "unite" ? "Combien en as-tu reçu ?" : "Combien en as-tu reçu (en " + nomUnite(unRecu, 2) + ") ?";
  $("arrivage-prix-etiquette").textContent = ua ? "Prix d'un " + nomUnite(ua, 1) + " cette fois"
    : "Prix d'achat" + (u === "unite" ? " d'une unité" : " du " + nomUnite(u, 1)) + " cette fois";
  const prixConnu = ua ? produitArrivage.prixAchatLot : produitArrivage.cout;
  $("arrivage-prix").value = typeof prixConnu === "number" ? nombre(Math.round(prixConnu)) : "";
  $("arrivage-quantite").value = "1";
  choisirArrivagePaye(false);
  $("arrivage-erreur").hidden = true;
  ouvrirFeuille("arrivage-form");
}
function enregistrerArrivage(e) {
  e.preventDefault();
  const n = lireQte($("arrivage-quantite").value);
  if (!(n > 0)) {
    $("arrivage-erreur").textContent = "Écris combien tu en as reçu.";
    $("arrivage-erreur").hidden = false;
    return;
  }
  const p = produitArrivage;
  const qte = p.uniteAchat ? Math.round(n * p.contenance * 1000) / 1000 : n; // en unités de vente
  const prix = lireMontant($("arrivage-prix").value);
  if (prix) {
    // Prix moyen : l'ancien stock garde son prix, le nouveau arrive au nouveau prix.
    const coutNouveau = p.uniteAchat ? prix / p.contenance : prix;
    const avant = Math.max(0, stockDe(p.id));
    const coutAncien = typeof p.cout === "number" ? p.cout : coutNouveau;
    p.cout = Math.round((avant * coutAncien + qte * coutNouveau) / (avant + qte) * 100) / 100;
    if (p.uniteAchat) p.prixAchatLot = prix;
  }
  const arrivage = {
    id: nouvelId(), type: "stock", produitId: p.id, quantite: qte, raison: "arrivage",
    note: p.nom, montant: 0, client: "", t: Date.now()
  };
  if (p.uniteAchat) { arrivage.qteAchat = n; arrivage.uniteAchat = p.uniteAchat; }
  donnees.mouvements.push(arrivage);
  if (arrivagePaye && prix) {
    donnees.mouvements.push({
      id: nouvelId(), type: "depense", categorie: "marchandise", montant: Math.round(n * prix),
      note: "Achat : " + qteTexte(n, p.uniteAchat || uniteDe(p)) + " de " + p.nom, client: "", t: Date.now() + 1
    });
  }
  sauver();
  fermerFeuilles();
  afficher();
  message(p.nom + " : + " + qteTexte(qte, uniteDe(p)) + (p.uniteAchat ? " (" + qteTexte(n, p.uniteAchat) + ")" : "") +
    ". Il y en a maintenant " + qteTexte(stockDe(p.id), uniteDe(p)) + ".", null, true);
}

/* ---------- Choisir les produits pendant une vente ---------- */

let panier = {}; // { idProduit: quantité }
let faconVente = "montant";

function totalPanier() {
  return Object.keys(panier).reduce(function (s, id) {
    const p = donnees.produits[id];
    return s + (p ? Math.round(p.prix * panier[id]) : 0);
  }, 0);
}
function lignesPanier() {
  return Object.keys(panier).filter(function (id) { return panier[id] > 0 && donnees.produits[id]; })
    .map(function (id) {
      const p = donnees.produits[id];
      return { produitId: id, nom: p.nom, unite: uniteDe(p), prix: p.prix, qte: panier[id] };
    });
}

function choisirFacon(facon) {
  faconVente = facon;
  ecrire("canari.faconVente", facon);
  document.querySelectorAll("[data-facon]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.facon === facon));
  });
  const parProduits = facon === "produits";
  $("bloc-produits").hidden = !parProduits;
  $("rapides").hidden = parProduits;
  $("montant").readOnly = parProduits;
  $("montant").classList.toggle("calcule", parProduits);
  $("cout-saisie").hidden = true;
  coutTape = false;
  if (!parProduits) majCout();
  if (parProduits) {
    $("recherche-produit").value = "";
    $("recherche-produit").hidden = listeProduits().length <= 6;
    afficherChoixProduits();
  }
}

function afficherChoixProduits() {
  const cherche = $("recherche-produit").value.trim().toLowerCase();
  $("choix-produits").innerHTML = listeProduits().filter(function (p) {
    return !cherche || p.nom.toLowerCase().indexOf(cherche) !== -1 || panier[p.id];
  }).map(function (p) {
    const q = panier[p.id] || 0, u = uniteDe(p);
    const reste = p.suivi ? stockDe(p.id) : null;
    const alerte = p.suivi && q > reste ? '<small class="m-sort">Il n\'en reste que ' + qteTexte(Math.max(0, reste), u) + '</small>'
      : p.suivi ? '<small>' + qteTexte(reste, u) + ' en stock</small>' : '';
    return '<li class="choix-produit' + (q ? ' choisi' : '') + '">' +
      '<span class="choix-produit-nom"><b>' + echapper(p.nom) + '</b><small>' + franc(p.prix) + parUnite(u) +
        (q ? ' · <b>' + franc(Math.round(p.prix * q)) + '</b>' : '') + '</small>' + alerte + '</span>' +
      '<span class="pas-a-pas">' +
        (q ? '<button type="button" class="bouton pas" data-moins="' + p.id + '" aria-label="Un de moins">−</button>' +
             '<label class="qte-boite"><input class="qte" inputmode="decimal" data-qte="' + p.id + '" value="' + String(q).replace(".", ",") + '" aria-label="Quantité de ' + echapper(p.nom) + '">' +
             (u === "unite" ? '' : '<small>' + nomUnite(u, q) + '</small>') + '</label>' : '') +
        '<button type="button" class="bouton pas plus" data-plus="' + p.id + '" aria-label="Un de plus">+</button>' +
      '</span></li>';
  }).join("") || '<li class="aide">Aucun produit ne correspond.</li>';
  const total = totalPanier();
  $("montant").value = total ? nombre(total) : "";
  majReste();
}

function preparerChoixVente(mode) {
  panier = {};
  const avecProduits = (mode === "vente" || mode === "credit") && listeProduits().length > 0;
  $("choix-vente").hidden = !avecProduits;
  if (avecProduits) {
    choisirFacon(lire("canari.faconVente") === "produits" ? "produits" : "montant");
  } else {
    faconVente = "montant";
    $("bloc-produits").hidden = true;
    $("rapides").hidden = false;
    $("montant").readOnly = false;
    $("montant").classList.remove("calcule");
  }
}

/* ---------- Infos de la boutique et logo ---------- */

function remplirFormBoutique() {
  const b = donnees.boutique;
  $("boutique-nom").value = b.nom || "";
  $("boutique-tel").value = b.tel ? afficherTel(b.tel) : "";
  $("boutique-adresse").value = b.adresse || "";
  $("boutique-merci").value = b.merci || "";
  $("boutique-marge").value = String(margeHabituelle());
  afficherLogo();
}
function afficherLogo() {
  const logo = donnees.boutique.logo;
  $("logo-apercu").innerHTML = logo ? '<img src="' + logo + '" alt="Logo de la boutique">' : '<span>Pas de logo</span>';
  $("logo-retirer").hidden = !logo;
}

// Le logo peut être une image (photo, PNG, JPG…) ou un PDF (1re page).
// Il est réduit à 300 px au plus pour ne pas alourdir le téléphone.
function chargerLogo(fichier) {
  const estPdf = fichier.type === "application/pdf" || /\.pdf$/i.test(fichier.name || "");
  message(estPdf ? "Lecture du PDF…" : "Lecture de l'image…");
  (estPdf ? pdfEnToile(fichier) : imageEnToile(fichier)).then(function (toile) {
    enregistrerLogo(estPdf ? rogner(toile) : toile);
  }).catch(function (err) {
    if (err === "sans-internet") message("Pour lire un PDF la première fois, il faut internet. Réessaie avec internet, ou choisis une image.");
    else message(estPdf ? "Ce PDF ne peut pas être lu. Essaie avec une image du logo." : "Cette image ne peut pas être lue.");
  });
}

function imageEnToile(fichier) {
  return new Promise(function (ok, ko) {
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.onload = function () {
      const toile = document.createElement("canvas");
      toile.width = img.width;
      toile.height = img.height;
      toile.getContext("2d").drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      ok(toile);
    };
    img.onerror = function () { URL.revokeObjectURL(url); ko(); };
    img.src = url;
  });
}

// Dessine la 1re page du PDF. pdf.js n'est chargé qu'à ce moment-là.
function pdfEnToile(fichier) {
  const lecteur = import("./vendor/pdfjs/pdf.min.mjs").catch(function () { throw "sans-internet"; });
  return Promise.all([lecteur, fichier.arrayBuffer()]).then(function (r) {
    const pdfjs = r[0];
    pdfjs.GlobalWorkerOptions.workerSrc = "vendor/pdfjs/pdf.worker.min.mjs";
    return pdfjs.getDocument({ data: new Uint8Array(r[1]), isEvalSupported: false }).promise;
  }).then(function (pdf) {
    return pdf.getPage(1);
  }).then(function (page) {
    const base = page.getViewport({ scale: 1 });
    const echelle = Math.min(4, 1200 / Math.max(base.width, base.height));
    const vue = page.getViewport({ scale: echelle });
    const toile = document.createElement("canvas");
    toile.width = Math.ceil(vue.width);
    toile.height = Math.ceil(vue.height);
    return page.render({ canvasContext: toile.getContext("2d"), viewport: vue }).promise.then(function () { return toile; });
  });
}

// Enlève les marges blanches ou transparentes autour du logo (un PDF est souvent une page entière).
function rogner(toile) {
  const ctx = toile.getContext("2d");
  const l = toile.width, h = toile.height;
  const px = ctx.getImageData(0, 0, l, h).data;
  let haut = h, bas = -1, gauche = l, droite = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < l; x++) {
      const i = (y * l + x) * 4;
      const vide = px[i + 3] < 20 || (px[i] > 245 && px[i + 1] > 245 && px[i + 2] > 245);
      if (vide) continue;
      if (y < haut) haut = y;
      if (y > bas) bas = y;
      if (x < gauche) gauche = x;
      if (x > droite) droite = x;
    }
  }
  if (bas < 0) return toile; // page vide : on garde tel quel
  const marge = 8;
  gauche = Math.max(0, gauche - marge); haut = Math.max(0, haut - marge);
  droite = Math.min(l - 1, droite + marge); bas = Math.min(h - 1, bas + marge);
  const r = document.createElement("canvas");
  r.width = droite - gauche + 1;
  r.height = bas - haut + 1;
  r.getContext("2d").drawImage(toile, gauche, haut, r.width, r.height, 0, 0, r.width, r.height);
  return r;
}

function enregistrerLogo(source) {
  const cote = 300;
  const echelle = Math.min(1, cote / Math.max(source.width, source.height));
  const toile = document.createElement("canvas");
  toile.width = Math.max(1, Math.round(source.width * echelle));
  toile.height = Math.max(1, Math.round(source.height * echelle));
  toile.getContext("2d").drawImage(source, 0, 0, toile.width, toile.height);
  donnees.boutique.logo = toile.toDataURL("image/png");
  sauver();
  afficherLogo();
  message("Logo enregistré. Il sera sur tes factures.", null, true);
}

function enregistrerBoutique(e) {
  e.preventDefault();
  const b = donnees.boutique;
  b.nom = $("boutique-nom").value.trim().replace(/\s+/g, " ");
  b.tel = normaliserTel($("boutique-tel").value);
  b.adresse = $("boutique-adresse").value.trim();
  b.merci = $("boutique-merci").value.trim();
  const marge = parseInt($("boutique-marge").value.replace(/\D/g, ""), 10);
  if (!isNaN(marge) && marge < 100) b.marge = marge;
  sauver();
  if (document.activeElement) document.activeElement.blur();
  message("Infos de la boutique enregistrées.", null, true);
}

/* ---------- Mise en route ---------- */

function initBoutique() {
  $("vue-stock").addEventListener("click", function (e) {
    if (e.target.closest("[data-nouveau-produit]")) return ouvrirProduit(null);
    const m = e.target.closest("[data-modifier-produit]");
    if (m) return ouvrirProduit(m.dataset.modifierProduit);
    const a = e.target.closest("[data-arrivage]");
    if (a) return ouvrirArrivage(a.dataset.arrivage);
  });
  $("vue-stock").addEventListener("input", function (e) {
    if (e.target.id !== "recherche-stock") return;
    const cherche = e.target.value.trim().toLowerCase();
    document.querySelectorAll("#liste-produits .produit").forEach(function (li) {
      li.hidden = cherche && li.dataset.nom.indexOf(cherche) === -1;
    });
  });

  $("produit-suivi").addEventListener("click", function (e) {
    const b = e.target.closest("[data-suivi]");
    if (b) choisirSuivi(b.dataset.suivi === "oui");
  });
  ["produit-prix", "produit-cout"].forEach(function (id) {
    $(id).addEventListener("input", function (e) {
      const chiffres = e.target.value.replace(/\D/g, "").slice(0, 9);
      e.target.value = chiffres ? nombre(Number(chiffres)) : "";
      majMargeProduit();
    });
  });
  $("produit-unite").innerHTML = Object.keys(UNITES).map(function (u) {
    return '<option value="' + u + '">' + (u === "unite" ? "à l'unité (pièce)" : UNITES[u][0]) + '</option>';
  }).join("") + '<option value="autre">autre…</option>';
  $("produit-unite").addEventListener("change", majUniteProduit);
  $("produit-unite-achat").innerHTML = Object.keys(UNITES).filter(function (u) { return u !== "prestation"; }).map(function (u) {
    return '<option value="' + u + '">' + UNITES[u][0] + '</option>';
  }).join("");
  $("produit-unite-achat").value = "sac";
  $("produit-unite-achat").addEventListener("change", majUniteProduit);
  $("produit-achat-facon").addEventListener("click", function (e) {
    const b = e.target.closest("[data-achat]");
    if (b) choisirAchat(b.dataset.achat === "autre");
  });
  $("produit-contenance").addEventListener("input", majMargeProduit);
  $("produit-prix-lot").addEventListener("input", function (e) {
    const chiffres = e.target.value.replace(/\D/g, "").slice(0, 9);
    e.target.value = chiffres ? nombre(Number(chiffres)) : "";
    majMargeProduit();
  });
  $("arrivage-paye").addEventListener("click", function (e) {
    const b = e.target.closest("[data-arrivage-paye]");
    if (b) choisirArrivagePaye(b.dataset.arrivagePaye === "oui");
  });
  $("arrivage-quantite").addEventListener("input", majArrivage);
  $("arrivage-prix").addEventListener("input", function (e) {
    const chiffres = e.target.value.replace(/\D/g, "").slice(0, 9);
    e.target.value = chiffres ? nombre(Number(chiffres)) : "";
    majArrivage();
  });
  $("produit-unite-autre").addEventListener("input", majUniteProduit);
  $("produit-form").addEventListener("submit", enregistrerProduit);
  $("produit-annuler").addEventListener("click", fermerFeuilles);
  $("produit-supprimer").addEventListener("click", supprimerProduit);

  $("arrivage-form").addEventListener("submit", enregistrerArrivage);
  $("arrivage-annuler").addEventListener("click", fermerFeuilles);
  $("arrivage-form").addEventListener("click", function (e) {
    const b = e.target.closest("[data-pas]");
    if (!b) return;
    const n = (lireQte($("arrivage-quantite").value) || 0) + Number(b.dataset.pas);
    $("arrivage-quantite").value = String(Math.max(1, Math.round(n * 1000) / 1000)).replace(".", ",");
    majArrivage();
  });

  $("choix-vente").addEventListener("click", function (e) {
    const b = e.target.closest("[data-facon]");
    if (b) choisirFacon(b.dataset.facon);
  });
  $("recherche-produit").addEventListener("input", afficherChoixProduits);
  // Quantité tapée à la main (ex. 1,5 kg) : on met à jour le total sans redessiner la liste.
  $("choix-produits").addEventListener("input", function (e) {
    const id = e.target.dataset && e.target.dataset.qte;
    if (!id) return;
    const q = lireQte(e.target.value);
    if (q > 0) panier[id] = q;
    const total = totalPanier();
    $("montant").value = total ? nombre(total) : "";
    majReste();
  });
  $("choix-produits").addEventListener("change", function (e) {
    const id = e.target.dataset && e.target.dataset.qte;
    if (!id) return;
    const q = lireQte(e.target.value);
    if (!(q > 0)) delete panier[id];
    afficherChoixProduits();
  });
  $("choix-produits").addEventListener("click", function (e) {
    const plus = e.target.closest("[data-plus]");
    const moins = e.target.closest("[data-moins]");
    if (plus) panier[plus.dataset.plus] = Math.round(((panier[plus.dataset.plus] || 0) + 1) * 1000) / 1000;
    else if (moins) {
      panier[moins.dataset.moins] = Math.round(((panier[moins.dataset.moins] || 0) - 1) * 1000) / 1000;
      if (panier[moins.dataset.moins] <= 0) delete panier[moins.dataset.moins];
    } else return;
    $("erreur").hidden = true;
    afficherChoixProduits();
  });

  $("form-boutique").addEventListener("submit", enregistrerBoutique);
  $("logo-fichier").addEventListener("change", function (e) {
    const f = e.target.files && e.target.files[0];
    if (f) chargerLogo(f);
    e.target.value = "";
  });
  $("logo-retirer").addEventListener("click", function () {
    delete donnees.boutique.logo;
    sauver();
    afficherLogo();
  });
}

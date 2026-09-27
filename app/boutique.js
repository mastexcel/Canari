// Canari · infos de la boutique (logo…), produits, prix et stock.
// Ce fichier est chargé avant app.js ; il utilise ses outils ($, donnees, franc…)
// seulement quand on l'appelle, et initBoutique() est lancé au démarrage par app.js.

/* ---------- Produits et stock ---------- */

// Un produit : { id, nom, prix, suivi (compter le stock ?), seuil (alerte) }.
// Le stock n'est jamais écrit à la main : il se calcule à partir des lignes
// « stock » (départ, arrivage, correction) moins les quantités vendues.
// Ainsi, retirer une vente remet automatiquement le produit en stock.
function stockDe(idProduit) {
  let n = 0;
  donnees.mouvements.forEach(function (m) {
    if (m.type === "stock" && m.produitId === idProduit) n += m.quantite;
    else if (m.lignes) m.lignes.forEach(function (l) { if (l.produitId === idProduit) n -= l.qte; });
  });
  return n;
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
      const n = stockDe(p.id);
      const etat = !p.suivi ? '<span class="stock-quantite neutre">Stock non compté</span>'
        : '<span class="stock-quantite' + (aRacheter(p) ? ' bas' : '') + '"><b>' + n + '</b> en stock' +
          (aRacheter(p) ? ' · à racheter' : '') + '</span>';
      return '<li class="produit' + (aRacheter(p) ? ' bas' : '') + '" data-nom="' + echapper(p.nom.toLowerCase()) + '">' +
        '<div class="client-haut"><b>' + echapper(p.nom) + '</b><strong>' + franc(p.prix) + '</strong></div>' +
        '<p class="aide">Coûte ' + franc(coutProduit(p)) + (typeof p.cout === "number" ? "" : " (marge habituelle)") +
          ' · bénéfice ' + franc(p.prix - coutProduit(p)) + ' par vente</p>' +
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

function choisirSuivi(oui) {
  suiviProduit = oui;
  document.querySelectorAll("[data-suivi]").forEach(function (b) {
    b.setAttribute("aria-pressed", String((b.dataset.suivi === "oui") === oui));
  });
  $("bloc-quantite").hidden = !oui;
  $("produit-cout-etiquette").textContent = oui ? "Prix d'achat (ce qu'il te coûte)" : "Ce que ça te coûte (facultatif)";
  majMargeProduit();
}

function majMargeProduit() {
  const prix = lireMontant($("produit-prix").value);
  const tape = $("produit-cout").value.trim() !== "";
  const cout = tape ? lireMontant($("produit-cout").value) : coutParMarge(prix);
  if (!prix) { $("produit-marge").textContent = "Si tu ne sais pas, laisse vide : Canari utilisera ta marge habituelle (" + margeHabituelle() + " %)."; return; }
  const b = prix - cout;
  $("produit-marge").textContent = (tape ? "" : "Marge habituelle (" + margeHabituelle() + " %) : ") +
    "tu gagnes " + (b < 0 ? "− " : "") + franc(Math.abs(b)) + " sur chaque vente.";
}

function ouvrirProduit(id) {
  const p = id ? donnees.produits[id] : null;
  produitEnCours = p;
  $("produit-titre").textContent = p ? "Modifier " + p.nom : "Nouveau produit";
  $("produit-nom").value = p ? p.nom : "";
  $("produit-prix").value = p ? nombre(p.prix) : "";
  $("produit-cout").value = p && typeof p.cout === "number" ? nombre(p.cout) : "";
  $("produit-quantite").value = p ? String(stockDe(p.id)) : "";
  $("produit-quantite-etiquette").textContent = p ? "Combien il en reste vraiment ?" : "Combien tu en as maintenant ?";
  $("produit-seuil").value = p ? String(p.seuil) : "3";
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
  const quantite = parseInt(quantiteTapee.replace(/[^\d-]/g, ""), 10);
  const seuil = parseInt($("produit-seuil").value.replace(/\D/g, ""), 10);
  const p = produitEnCours || { id: nouvelId() };
  p.nom = nom;
  p.prix = prix;
  if ($("produit-cout").value.trim() !== "") p.cout = lireMontant($("produit-cout").value);
  else delete p.cout;
  p.suivi = suiviProduit;
  p.seuil = isNaN(seuil) ? 3 : seuil;
  donnees.produits[p.id] = p;

  // Le stock tapé devient une ligne « stock » (départ ou correction).
  if (suiviProduit && quantiteTapee !== "" && !isNaN(quantite)) {
    const ecart = quantite - (produitEnCours ? stockDe(p.id) : 0);
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
function ouvrirArrivage(id) {
  produitArrivage = donnees.produits[id];
  $("arrivage-titre").textContent = "Arrivage : " + produitArrivage.nom;
  $("arrivage-actuel").textContent = "Tu en as " + stockDe(id) + " en ce moment.";
  $("arrivage-quantite").value = "1";
  $("arrivage-erreur").hidden = true;
  ouvrirFeuille("arrivage-form");
}
function enregistrerArrivage(e) {
  e.preventDefault();
  const n = parseInt($("arrivage-quantite").value.replace(/\D/g, ""), 10);
  if (!n) {
    $("arrivage-erreur").textContent = "Écris combien tu en as reçu.";
    $("arrivage-erreur").hidden = false;
    return;
  }
  const p = produitArrivage;
  donnees.mouvements.push({
    id: nouvelId(), type: "stock", produitId: p.id, quantite: n, raison: "arrivage",
    note: p.nom, montant: 0, client: "", t: Date.now()
  });
  sauver();
  fermerFeuilles();
  afficher();
  message("+" + n + " " + p.nom + ". Il y en a maintenant " + stockDe(p.id) + ".", null, true);
}

/* ---------- Choisir les produits pendant une vente ---------- */

let panier = {}; // { idProduit: quantité }
let faconVente = "montant";

function totalPanier() {
  return Object.keys(panier).reduce(function (s, id) {
    const p = donnees.produits[id];
    return s + (p ? p.prix * panier[id] : 0);
  }, 0);
}
function lignesPanier() {
  return Object.keys(panier).filter(function (id) { return panier[id] > 0 && donnees.produits[id]; })
    .map(function (id) {
      const p = donnees.produits[id];
      return { produitId: id, nom: p.nom, prix: p.prix, qte: panier[id] };
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
    const q = panier[p.id] || 0;
    const reste = p.suivi ? stockDe(p.id) : null;
    const alerte = p.suivi && q > reste ? '<small class="m-sort">Il n\'en reste que ' + Math.max(0, reste) + '</small>'
      : p.suivi ? '<small>' + reste + ' en stock</small>' : '';
    return '<li class="choix-produit' + (q ? ' choisi' : '') + '">' +
      '<span class="choix-produit-nom"><b>' + echapper(p.nom) + '</b><small>' + franc(p.prix) + '</small>' + alerte + '</span>' +
      '<span class="pas-a-pas">' +
        (q ? '<button type="button" class="bouton pas" data-moins="' + p.id + '" aria-label="Un de moins">−</button>' +
             '<b class="qte">' + q + '</b>' : '') +
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

// Réduit l'image choisie (300 px au plus) pour ne pas alourdir le téléphone.
function chargerLogo(fichier) {
  const url = URL.createObjectURL(fichier);
  const img = new Image();
  img.onload = function () {
    const cote = 300;
    const echelle = Math.min(1, cote / Math.max(img.width, img.height));
    const toile = document.createElement("canvas");
    toile.width = Math.round(img.width * echelle);
    toile.height = Math.round(img.height * echelle);
    toile.getContext("2d").drawImage(img, 0, 0, toile.width, toile.height);
    URL.revokeObjectURL(url);
    donnees.boutique.logo = toile.toDataURL("image/png");
    sauver();
    afficherLogo();
    message("Logo enregistré.", null, true);
  };
  img.onerror = function () { URL.revokeObjectURL(url); message("Cette image ne peut pas être lue."); };
  img.src = url;
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
  $("produit-form").addEventListener("submit", enregistrerProduit);
  $("produit-annuler").addEventListener("click", fermerFeuilles);
  $("produit-supprimer").addEventListener("click", supprimerProduit);

  $("arrivage-form").addEventListener("submit", enregistrerArrivage);
  $("arrivage-annuler").addEventListener("click", fermerFeuilles);
  $("arrivage-form").addEventListener("click", function (e) {
    const b = e.target.closest("[data-pas]");
    if (!b) return;
    const n = (parseInt($("arrivage-quantite").value.replace(/\D/g, ""), 10) || 0) + Number(b.dataset.pas);
    $("arrivage-quantite").value = String(Math.max(1, n));
  });

  $("choix-vente").addEventListener("click", function (e) {
    const b = e.target.closest("[data-facon]");
    if (b) choisirFacon(b.dataset.facon);
  });
  $("recherche-produit").addEventListener("input", afficherChoixProduits);
  $("choix-produits").addEventListener("click", function (e) {
    const plus = e.target.closest("[data-plus]");
    const moins = e.target.closest("[data-moins]");
    if (plus) panier[plus.dataset.plus] = (panier[plus.dataset.plus] || 0) + 1;
    else if (moins) {
      panier[moins.dataset.moins] = (panier[moins.dataset.moins] || 0) - 1;
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

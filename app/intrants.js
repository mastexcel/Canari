// Canari · lot C : stock des intrants (ingrédients, matières, emballages),
// achats en unités (kg, litre, sac de 50 kg…) au prix moyen pondéré, et
// consommation des intrants par la fabrication (« J'ai fabriqué ») et les services vendus.
// Chargé avant app.js ; initIntrants() est lancé au démarrage.
//
// Un intrant : { id, nom, unite (unité d'usage : kg, litre…), cout (prix moyen d'une unité),
//                seuil, uniteAchat?, contenance?, prixAchatLot? }
// Son stock se calcule, comme pour les produits :
//   lignes « intrant » (départ, achat, correction)
//   − consommations gardées dans les fabrications et les ventes de services.
// Retirer une fabrication ou une vente remet donc les intrants en stock.

/* ---------- Calculs ---------- */

function listeIntrants() {
  return Object.keys(donnees.intrants).map(function (id) { return donnees.intrants[id]; })
    .sort(function (a, b) { return a.nom.localeCompare(b.nom, "fr"); });
}
function intrantParNom(nom) {
  const cle = nom.trim().toLowerCase();
  return listeIntrants().find(function (i) { return i.nom.toLowerCase() === cle; });
}

function stockIntrant(id) {
  let n = 0;
  const consommer = function (c) { if (c.intrantId === id) n -= c.qte; };
  donnees.mouvements.forEach(function (m) {
    if (m.type === "intrant" && m.intrantId === id) n += m.quantite;
    if (m.consommation) m.consommation.forEach(consommer);
    if (m.lignes) m.lignes.forEach(function (l) { if (l.consommation) l.consommation.forEach(consommer); });
  });
  return Math.round(n * 1000) / 1000;
}
function intrantARacheter(i) {
  return stockIntrant(i.id) <= (i.seuil || 0);
}
function intrantsARacheter() {
  return listeIntrants().filter(intrantARacheter);
}
function valeurIntrants() {
  return listeIntrants().reduce(function (s, i) { return s + Math.max(0, stockIntrant(i.id)) * (i.cout || 0); }, 0);
}

// Une ligne de fiche se compte en stock sauf si elle est au forfait (gaz, main-d'œuvre…).
function ligneStockable(l) {
  return l.unite !== "forfait" && l.nom && l.nom.trim();
}
// Prix d'une ligne de fiche : le prix moyen de l'intrant s'il est connu.
function prixLigne(l) {
  const i = l.intrantId && donnees.intrants[l.intrantId];
  return i && typeof i.cout === "number" ? i.cout : (l.prix || 0);
}

// Relie chaque ligne d'une fiche à un intrant du stock (créé s'il n'existe pas).
function lierIntrants(fiche) {
  if (!fiche || !fiche.lignes) return;
  fiche.lignes.forEach(function (l) {
    if (!ligneStockable(l)) { delete l.intrantId; return; }
    let i = l.intrantId && donnees.intrants[l.intrantId];
    if (!i) i = intrantParNom(l.nom);
    if (!i) {
      i = { id: nouvelId(), nom: l.nom.trim(), unite: l.unite, seuil: 0 };
      if (l.prix) i.cout = l.prix;
      donnees.intrants[i.id] = i;
    }
    l.intrantId = i.id;
    l.unite = i.unite;
    // Un prix tapé dans la fiche devient le prix de l'intrant s'il a été changé à la main,
    // ou tant qu'aucun achat n'a été noté.
    if (l.prix && (l.prixManuel || !aDesAchats(i.id) || typeof i.cout !== "number")) i.cout = l.prix;
    delete l.prixManuel;
  });
}
function aDesAchats(id) {
  return donnees.mouvements.some(function (m) { return m.type === "intrant" && m.intrantId === id && m.raison === "achat"; });
}

// Ce qu'une fabrication de « qte » unités (ou une prestation) consomme.
function consommationPour(p, qte) {
  const f = p && p.fiche;
  if (!f || !f.lignes) return [];
  const r = typeDe(p) === "fabrication" ? (f.rendement > 0 ? f.rendement : 1) : 1;
  return f.lignes.filter(function (l) { return l.intrantId && donnees.intrants[l.intrantId] && l.qte; })
    .map(function (l) { return { intrantId: l.intrantId, qte: Math.round(l.qte * qte / r * 1000) / 1000 }; });
}
// Texte « Ça va utiliser : 25 kg de Farine (il en reste 40 kg)… », avec les manques en rouge.
function consommationHtml(conso) {
  if (!conso.length) return "";
  return '<p class="champ-etiquette">Ça va utiliser :</p><ul class="conso">' + conso.map(function (c) {
    const i = donnees.intrants[c.intrantId];
    const reste = stockIntrant(c.intrantId);
    const manque = c.qte > reste;
    return '<li' + (manque ? ' class="manque"' : '') + '><span>' + echapper(i.nom) + '</span><b>' + qteTexte(c.qte, i.unite) + '</b>' +
      '<small>' + (manque ? "il n'en reste que " + qteTexte(Math.max(0, reste), i.unite) : "il en reste " + qteTexte(reste, i.unite)) + '</small></li>';
  }).join("") + '</ul>';
}

/* ---------- Liste des intrants (onglet Stock) ---------- */

let vueStock = "produits";

function afficherIntrants() {
  const liste = listeIntrants();
  const bas = liste.filter(intrantARacheter);
  if (!liste.length) {
    $("stock-intrants").innerHTML =
      '<div class="vide"><img src="icones/canari-pensif.webp" width="96" height="114" alt="">' +
      '<p>Les intrants sont ce que tu utilises pour fabriquer : farine, sucre, huile, mèches, sachets…<br>' +
      'Ils se créent tout seuls quand tu remplis la recette d\'un produit que tu fabriques. Tu peux aussi en ajouter un ici.</p></div>' +
      '<button type="button" class="bouton bouton-sauver" data-nouvel-intrant>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Ajouter un intrant</button>';
    return;
  }
  const ordre = bas.concat(liste.filter(function (i) { return !intrantARacheter(i); }));
  $("stock-intrants").innerHTML =
    '<div class="carte-gain carte-stock">' +
      '<p class="etiquette">Valeur de tes intrants (prix moyen)</p>' +
      '<p class="gros-chiffre">' + franc(valeurIntrants()) + '</p>' +
      '<div class="trois-chiffres deux">' +
        '<div class="chiffre entre"><span>Intrants</span><strong>' + liste.length + '</strong></div>' +
        '<div class="chiffre sort"><span>À racheter</span><strong>' + bas.length + '</strong></div>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="bouton bouton-sauver ajouter-produit" data-nouvel-intrant>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Ajouter un intrant</button>' +
    '<ul class="produits">' + ordre.map(function (i) {
      const n = stockIntrant(i.id), u = i.unite, faible = intrantARacheter(i);
      const utilise = listeProduits().filter(function (p) {
        return p.fiche && p.fiche.lignes.some(function (l) { return l.intrantId === i.id; });
      }).map(function (p) { return p.nom; });
      return '<li class="produit intrant' + (faible ? ' bas' : '') + '">' +
        '<div class="client-haut"><b>' + echapper(i.nom) + '</b><strong>' + (typeof i.cout === "number" ? franc(Math.round(i.cout)) + '<small>' + parUnite(u) + '</small>' : '<small>prix ?</small>') + '</strong></div>' +
        '<p><span class="stock-quantite' + (faible ? ' bas' : '') + '"><b>' + qteTexte(n, u) + '</b> en stock' +
          (i.uniteAchat && i.contenance ? ' <small>(≈ ' + qteTexte(Math.round(n / i.contenance * 10) / 10, i.uniteAchat) + ')</small>' : '') +
          (faible ? ' · à racheter' : '') + '</span></p>' +
        (utilise.length ? '<p class="aide">Utilisé pour : ' + echapper(utilise.join(", ")) + '</p>' : '') +
        '<div class="client-boutons">' +
          '<button type="button" class="bouton bouton-fiche" data-modifier-intrant="' + i.id + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/></svg>Modifier</button>' +
          '<button type="button" class="bouton bouton-arrivage" data-achat-intrant="' + i.id + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Achat</button>' +
        '</div></li>';
    }).join("") + '</ul>';
}

function afficherVueStock() {
  document.querySelectorAll("[data-vue-stock]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.vueStock === vueStock));
  });
  $("stock-produits").hidden = vueStock !== "produits";
  $("stock-intrants").hidden = vueStock !== "intrants";
  const basI = intrantsARacheter().length;
  document.querySelector('[data-vue-stock="intrants"]').textContent = "Intrants" + (basI ? " (" + basI + ")" : "");
  afficherIntrants();
}

/* ---------- Ajouter ou modifier un intrant ---------- */

let intrantEnCours = null;
let intrantAchatAutre = false;

function choisirAchatIntrant(autre) {
  intrantAchatAutre = autre;
  document.querySelectorAll("[data-intrant-achat]").forEach(function (b) {
    b.setAttribute("aria-pressed", String((b.dataset.intrantAchat === "autre") === autre));
  });
  majFormIntrant();
}
function majFormIntrant() {
  const u = $("intrant-unite").value, ua = $("intrant-unite-achat").value;
  $("intrant-achat-meme").textContent = "Pareil (au " + nomUnite(u, 1) + ")";
  $("bloc-intrant-achat").hidden = !intrantAchatAutre;
  $("intrant-contenance-etiquette").textContent = "Combien de " + nomUnite(u, 2) + " dans un " + nomUnite(ua, 1) + " ?";
  $("intrant-prix-etiquette").textContent = intrantAchatAutre ? "Prix d'achat d'un " + nomUnite(ua, 1) : "Prix d'achat d'un " + nomUnite(u, 1);
  $("intrant-stock-etiquette").textContent = (intrantEnCours ? "Combien il en reste vraiment ?" : "Combien tu en as maintenant ?") + " (en " + nomUnite(u, 2) + ")";
  $("intrant-seuil-etiquette").textContent = "Me prévenir quand il en reste (en " + nomUnite(u, 2) + ")";
  const prix = lireMontant($("intrant-prix").value);
  const contenance = lireQte($("intrant-contenance").value);
  $("intrant-conversion").textContent = intrantAchatAutre && prix && contenance > 0
    ? "Soit " + franc(Math.round(prix / contenance)) + " le " + nomUnite(u, 1) + "." : "";
}

function ouvrirIntrant(id) {
  const i = id ? donnees.intrants[id] : null;
  intrantEnCours = i;
  $("intrant-titre").textContent = i ? "Modifier " + i.nom : "Nouvel intrant";
  $("intrant-nom").value = i ? i.nom : "";
  $("intrant-unite").value = i ? i.unite : "kg";
  $("intrant-unite-achat").value = i && i.uniteAchat ? i.uniteAchat : "sac";
  $("intrant-contenance").value = i && i.contenance ? String(i.contenance).replace(".", ",") : "";
  $("intrant-prix").value = i ? (i.uniteAchat && i.prixAchatLot ? nombre(i.prixAchatLot) : typeof i.cout === "number" ? nombre(Math.round(i.cout)) : "") : "";
  $("intrant-stock").value = i ? String(stockIntrant(i.id)).replace(".", ",") : "";
  $("intrant-seuil").value = i ? String(i.seuil || 0).replace(".", ",") : "";
  $("intrant-erreur").hidden = true;
  $("intrant-supprimer").hidden = !i;
  choisirAchatIntrant(!!(i && i.uniteAchat));
  ouvrirFeuille("intrant-form");
  if (!i) $("intrant-nom").focus();
}

function enregistrerIntrant(e) {
  e.preventDefault();
  const oups = function (t, champ) { $("intrant-erreur").textContent = t; $("intrant-erreur").hidden = false; champ.focus(); };
  const nom = $("intrant-nom").value.trim().replace(/\s+/g, " ");
  if (!nom) return oups("Écris le nom de l'intrant.", $("intrant-nom"));
  const deja = intrantParNom(nom);
  if (deja && (!intrantEnCours || deja.id !== intrantEnCours.id)) return oups("Tu as déjà un intrant qui s'appelle « " + deja.nom + " ».", $("intrant-nom"));
  const prix = lireMontant($("intrant-prix").value);
  const contenance = lireQte($("intrant-contenance").value);
  if (intrantAchatAutre && !(contenance > 0)) return oups("Écris combien il y en a dans un " + nomUnite($("intrant-unite-achat").value, 1) + ".", $("intrant-contenance"));

  const i = intrantEnCours || { id: nouvelId() };
  const ancienPrix = i.uniteAchat ? i.prixAchatLot : i.cout;
  const ancienneContenance = i.contenance;
  i.nom = nom;
  i.unite = $("intrant-unite").value;
  const seuil = lireQte($("intrant-seuil").value);
  i.seuil = seuil > 0 ? seuil : 0;
  if (intrantAchatAutre) {
    i.uniteAchat = $("intrant-unite-achat").value;
    i.contenance = contenance;
    if (prix) {
      i.prixAchatLot = prix;
      // Le prix moyen n'est remplacé que si le prix tapé a changé.
      if (prix !== ancienPrix || contenance !== ancienneContenance || typeof i.cout !== "number") i.cout = Math.round(prix / contenance * 100) / 100;
    }
  } else {
    delete i.uniteAchat; delete i.contenance; delete i.prixAchatLot;
    if (prix && (typeof i.cout !== "number" || Math.round(i.cout) !== prix)) i.cout = prix;
  }
  donnees.intrants[i.id] = i;

  // Le stock tapé devient une ligne « intrant » (départ ou correction).
  const tape = $("intrant-stock").value.trim();
  const qte = lireQte(tape);
  if (tape !== "" && !isNaN(qte)) {
    const ecart = Math.round((qte - (intrantEnCours ? stockIntrant(i.id) : 0)) * 1000) / 1000;
    if (ecart) donnees.mouvements.push({
      id: nouvelId(), type: "intrant", intrantId: i.id, quantite: ecart,
      raison: intrantEnCours ? "correction" : "depart", note: i.nom, montant: 0, client: "", t: Date.now()
    });
  }
  sauver();
  fermerFeuilles();
  vueStock = "intrants";
  afficher();
  message(intrantEnCours ? i.nom + " modifié." : i.nom + " ajouté à tes intrants.", null, true);
}

function supprimerIntrant() {
  const i = intrantEnCours;
  if (!i || !window.confirm("Supprimer « " + i.nom + " » de tes intrants ?\n\nLes recettes qui l'utilisent garderont leur ligne, sans stock.")) return;
  delete donnees.intrants[i.id];
  listeProduits().forEach(function (p) {
    if (p.fiche) p.fiche.lignes.forEach(function (l) { if (l.intrantId === i.id) delete l.intrantId; });
  });
  sauver();
  fermerFeuilles();
  afficher();
  message(i.nom + " supprimé.");
}

/* ---------- Acheter un intrant (même fenêtre que l'arrivage) ---------- */

let intrantAchete = null;

function ouvrirAchatIntrant(id) {
  intrantAchete = donnees.intrants[id];
  const i = intrantAchete;
  produitArrivage = i; // la fenêtre d'arrivage lit unite, uniteAchat et contenance
  const u = i.unite, ua = i.uniteAchat;
  $("arrivage-titre").textContent = "Achat : " + i.nom;
  $("arrivage-actuel").textContent = "Tu en as " + qteTexte(stockIntrant(i.id), u) + " en ce moment.";
  $("arrivage-achat").hidden = false;
  $("arrivage-conso").innerHTML = "";
  $("arrivage-etiquette").textContent = "Combien en as-tu acheté (en " + nomUnite(ua || u, 2) + ") ?";
  $("arrivage-prix-etiquette").textContent = ua ? "Prix d'un " + nomUnite(ua, 1) + " cette fois" : "Prix d'un " + nomUnite(u, 1) + " cette fois";
  const prixConnu = ua ? i.prixAchatLot : i.cout;
  $("arrivage-prix").value = typeof prixConnu === "number" ? nombre(Math.round(prixConnu)) : "";
  $("arrivage-quantite").value = "1";
  $("arrivage-erreur").hidden = true;
  $("arrivage-donne").value = "";
  $("arrivage-fournisseur").value = "";
  choisirArrivagePaye("non");
  ouvrirFeuille("arrivage-form");
}

function enregistrerAchatIntrant() {
  const i = intrantAchete;
  const n = lireQte($("arrivage-quantite").value);
  if (!(n > 0)) {
    $("arrivage-erreur").textContent = "Écris combien tu en as acheté.";
    $("arrivage-erreur").hidden = false;
    return;
  }
  const qte = i.uniteAchat ? Math.round(n * i.contenance * 1000) / 1000 : n;
  const prix = lireMontant($("arrivage-prix").value);
  const probleme = verifierPaiementAchat(Math.round(n * prix));
  if (probleme) {
    $("arrivage-erreur").textContent = probleme;
    $("arrivage-erreur").hidden = false;
    return;
  }
  if (prix) {
    // Prix moyen pondéré : l'ancien stock garde son prix, le nouveau arrive au nouveau prix.
    const nouveau = i.uniteAchat ? prix / i.contenance : prix;
    const avant = Math.max(0, stockIntrant(i.id));
    const ancien = typeof i.cout === "number" ? i.cout : nouveau;
    i.cout = Math.round((avant * ancien + qte * nouveau) / (avant + qte) * 100) / 100;
    if (i.uniteAchat) i.prixAchatLot = prix;
  }
  const achat = { id: nouvelId(), type: "intrant", intrantId: i.id, quantite: qte, raison: "achat", note: i.nom, montant: 0, client: "", t: Date.now() };
  if (i.uniteAchat) { achat.qteAchat = n; achat.uniteAchat = i.uniteAchat; }
  donnees.mouvements.push(achat);
  const paiement = prix ? noterPaiementAchat(Math.round(n * prix), "Achat : " + qteTexte(n, i.uniteAchat || i.unite) + " de " + i.nom) : "";
  sauver();
  fermerFeuilles();
  intrantAchete = null;
  vueStock = "intrants";
  afficher();
  message(i.nom + " : + " + qteTexte(qte, i.unite) + (i.uniteAchat ? " (" + qteTexte(n, i.uniteAchat) + ")" : "") +
    ". Prix moyen : " + franc(Math.round(i.cout || 0)) + parUnite(i.unite) + "." + (paiement ? " " + paiement : ""), null, true);
}

/* ---------- Mise en route ---------- */

function initIntrants() {
  const options = Object.keys(UNITES).filter(function (u) { return u !== "prestation" && u !== "forfait"; }).map(function (u) {
    return '<option value="' + u + '">' + (u === "unite" ? "unité (pièce)" : UNITES[u][0]) + '</option>';
  }).join("");
  $("intrant-unite").innerHTML = options;
  $("intrant-unite-achat").innerHTML = options;
  $("intrant-unite").addEventListener("change", majFormIntrant);
  $("intrant-unite-achat").addEventListener("change", majFormIntrant);
  $("intrant-contenance").addEventListener("input", majFormIntrant);
  $("intrant-prix").addEventListener("input", function (e) {
    const chiffres = e.target.value.replace(/\D/g, "").slice(0, 9);
    e.target.value = chiffres ? nombre(Number(chiffres)) : "";
    majFormIntrant();
  });
  $("intrant-achat-facon").addEventListener("click", function (e) {
    const b = e.target.closest("[data-intrant-achat]");
    if (b) choisirAchatIntrant(b.dataset.intrantAchat === "autre");
  });
  $("intrant-form").addEventListener("submit", enregistrerIntrant);
  $("intrant-annuler").addEventListener("click", fermerFeuilles);
  $("intrant-supprimer").addEventListener("click", supprimerIntrant);

  $("vue-stock").addEventListener("click", function (e) {
    const v = e.target.closest("[data-vue-stock]");
    if (v) { vueStock = v.dataset.vueStock; afficherVueStock(); return; }
    if (e.target.closest("[data-nouvel-intrant]")) return ouvrirIntrant(null);
    const m = e.target.closest("[data-modifier-intrant]");
    if (m) return ouvrirIntrant(m.dataset.modifierIntrant);
    const a = e.target.closest("[data-achat-intrant]");
    if (a) return ouvrirAchatIntrant(a.dataset.achatIntrant);
  });

  // Les recettes déjà écrites (lot B) sont reliées au stock des intrants.
  let change = false;
  listeProduits().forEach(function (p) {
    if (p.fiche && p.fiche.lignes.some(function (l) { return ligneStockable(l) && !l.intrantId; })) { lierIntrants(p.fiche); change = true; }
  });
  if (change) sauver();
}

// Canari · factures et reçus de paiement en image, à partager sur WhatsApp.
// L'image est dessinée sur le téléphone (sans internet), avec le logo et le nom
// de la boutique enregistrés dans Réglages.

const COULEURS_FACTURE = {
  fond: "#FFFFFF", vert: "#174A3F", texte: "#2A1A12", doux: "#6B5646",
  ligne: "#E6D9C6", sable: "#F6EEE3", rouge: "#B8412B", entre: "#1E7A4F", or: "#F2B233"
};

let documentEnCours = null; // { toile, nom }

function numeroDocument(prefixe, n) {
  return prefixe + String(n).padStart(4, "0");
}

// Donne un numéro à une vente ou un paiement qui n'en a pas encore.
function assurerNumero(m) {
  if (m.numero) return m.numero;
  const cle = m.type === "paye" ? "recu" : "facture";
  donnees.compteurs[cle] = (donnees.compteurs[cle] || 0) + 1;
  m.numero = donnees.compteurs[cle];
  sauver();
  return m.numero;
}

// Ce que le client devait juste avant un paiement.
function soldeAvant(paiement) {
  const id = idClientDe(paiement);
  let du = 0;
  donnees.mouvements.slice().sort(function (a, b) { return a.t - b.t; }).some(function (m) {
    if (m.id === paiement.id) return true;
    if (idClientDe(m) !== id) return false;
    if (m.type === "paye") du -= m.montant;
    else du += creditDe(m);
    if (du < 0) du = 0;
    return false;
  });
  return du;
}

function dateHeure(t) {
  const d = new Date(t);
  // « à » et « N° » n'ont pas deux lettres de suite : tr() ne les traduirait pas.
  return d.toLocaleDateString(LOCALE) + (LANGUE === "en" ? " at " : " à ") + d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
}

/* ---------- Dessin ---------- */

function chargerImage(src) {
  return new Promise(function (ok) {
    if (!src) return ok(null);
    const img = new Image();
    img.onload = function () { ok(img); };
    img.onerror = function () { ok(null); };
    img.src = src;
  });
}

function couper(ctx, texte, largeurMax) {
  const mots = String(texte).split(" ");
  const lignes = [];
  let ligne = "";
  mots.forEach(function (mot) {
    const essai = ligne ? ligne + " " + mot : mot;
    if (ctx.measureText(essai).width > largeurMax && ligne) { lignes.push(ligne); ligne = mot; }
    else ligne = essai;
  });
  if (ligne) lignes.push(ligne);
  return lignes;
}

function dessinerDocument(doc) {
  const polices = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('700 40px "Fredoka"'), document.fonts.load('400 24px "Rubik"'), document.fonts.load('600 24px "Rubik"')]).catch(function () {})
    : Promise.resolve();
  return Promise.all([polices, chargerImage(donnees.boutique.logo)]).then(function (r) {
    const logo = r[1];
    const C = COULEURS_FACTURE;
    const L = 900, marge = 56;
    const toile = document.createElement("canvas");
    const ctx = toile.getContext("2d");
    const fredoka = function (taille, poids) { return (poids || 700) + " " + taille + 'px "Fredoka", sans-serif'; };
    const rubik = function (taille, poids) { return (poids || 400) + " " + taille + 'px "Rubik", sans-serif'; };

    // On dessine deux fois : la première pour mesurer la hauteur.
    function dessiner(vraiment) {
      let y = 0;
      const texte = function (t, x, yy, police, couleur, align) {
        if (!vraiment) return;
        ctx.font = police;
        ctx.fillStyle = couleur;
        ctx.textAlign = align || "left";
        ctx.fillText(t, x, yy);
      };
      const trait = function (yy, couleur, epaisseur) {
        if (!vraiment) return;
        ctx.fillStyle = couleur;
        ctx.fillRect(marge, yy, L - 2 * marge, epaisseur || 2);
      };
      if (vraiment) {
        ctx.fillStyle = C.fond;
        ctx.fillRect(0, 0, L, toile.height);
        ctx.fillStyle = C.vert;
        ctx.fillRect(0, 0, L, 14);
      }

      // En-tête : logo, nom, téléphone, adresse
      y = 50;
      let xTexte = marge;
      if (logo) {
        const cote = 130;
        const e = Math.min(cote / logo.width, cote / logo.height);
        if (vraiment) ctx.drawImage(logo, marge, y, logo.width * e, logo.height * e);
        xTexte = marge + cote + 28;
      }
      const b = donnees.boutique;
      ctx.font = fredoka(44);
      const nomLignes = couper(ctx, b.nom || tr("Ma boutique"), L - xTexte - marge);
      let yt = y + 44;
      nomLignes.forEach(function (l) { texte(l, xTexte, yt, fredoka(44), C.vert); yt += 50; });
      if (b.tel) { texte(tr("Tél. " + afficherTel(b.tel)), xTexte, yt, rubik(26), C.doux); yt += 36; }
      if (b.adresse) {
        ctx.font = rubik(26);
        couper(ctx, b.adresse, L - xTexte - marge).forEach(function (l) { texte(l, xTexte, yt, rubik(26), C.doux); yt += 34; });
      }
      // Numéros officiels de l'entreprise.
      if (b.rccm) { texte(tr("RCCM : " + b.rccm), xTexte, yt, rubik(22), C.doux); yt += 30; }
      if (b.dfe) { texte(tr("DFE / NCC : " + b.dfe), xTexte, yt, rubik(22), C.doux); yt += 30; }
      y = Math.max(yt, logo ? y + 140 : yt) + 18;
      trait(y, C.ligne, 3);
      y += 62;

      // Titre, numéro et date
      texte(doc.titre, marge, y, rubik(34, 700), C.texte);
      texte((LANGUE === "en" ? "No. " : "N° ") + doc.numero, L - marge, y - 4, rubik(26, 600), C.texte, "right");
      y += 38;
      texte(dateHeure(doc.t), L - marge, y, rubik(24), C.doux, "right");
      if (doc.client) texte(tr("Client : " + doc.client), marge, y, rubik(28, 600), C.texte);
      y += 34;
      if (doc.telClient) { texte(tr("Tél. " + afficherTel(doc.telClient)), marge, y, rubik(24), C.doux); y += 34; }
      y += 20;

      if (doc.lignes) {
        // Tableau des produits
        const colQte = L - marge - 350, colPu = L - marge - 170, colTot = L - marge;
        if (vraiment) { ctx.fillStyle = C.sable; ctx.fillRect(marge, y, L - 2 * marge, 52); }
        texte(tr("Désignation"), marge + 16, y + 34, rubik(22, 600), C.doux);
        texte(tr("Qté"), colQte, y + 34, rubik(22, 600), C.doux, "right");
        texte(tr("Prix"), colPu, y + 34, rubik(22, 600), C.doux, "right");
        texte(tr("Total"), colTot - 16, y + 34, rubik(22, 600), C.doux, "right");
        y += 52;
        doc.lignes.forEach(function (l) {
          ctx.font = rubik(26);
          const morceaux = couper(ctx, l.nom, colQte - marge - 170);
          const qte = !l.unite || l.unite === "unite" ? String(l.qte).replace(".", ",") : qteTexte(l.qte, l.unite);
          const h = Math.max(60, 26 + morceaux.length * 32);
          morceaux.forEach(function (m, i) { texte(m, marge + 16, y + 40 + i * 32, rubik(26), C.texte); });
          texte(tr(qte), colQte, y + 40, rubik(26), C.texte, "right");
          texte(tr(nombre(l.prix) + (l.unite && l.unite !== "unite" ? "/" + nomUnite(l.unite, 1) : "")), colPu, y + 40, rubik(l.unite && l.unite !== "unite" ? 22 : 26), C.texte, "right");
          texte(nombre(Math.round(l.prix * l.qte)), colTot - 16, y + 40, rubik(26, 600), C.texte, "right");
          y += h;
          trait(y, C.ligne, 2);
        });
        y += 56;
        texte(tr("TOTAL"), L - marge - 300, y, rubik(34, 600), C.texte, "right");
        texte(franc(doc.total), L - marge, y, rubik(40, 700), C.vert, "right");
        y += 50;
        if (doc.reste > 0) {
          texte(tr("Payé"), L - marge - 300, y, rubik(28), C.doux, "right");
          texte(franc(doc.paye), L - marge, y, rubik(28, 600), C.entre, "right");
          y += 44;
          texte(tr("Reste à payer"), L - marge - 300, y, rubik(28, 600), C.rouge, "right");
          texte(franc(doc.reste), L - marge, y, rubik(34, 700), C.rouge, "right");
          y += 30;
        }
      } else {
        // Reçu de paiement
        const rangee = function (libelle, valeur, couleur, grand) {
          texte(libelle, marge, y, rubik(28, grand ? 600 : 400), grand ? C.texte : C.doux);
          texte(valeur, L - marge, y, grand ? rubik(40, 700) : rubik(28, 600), couleur, "right");
          y += grand ? 64 : 50;
        };
        y += 10;
        rangee(tr("Montant dû avant ce paiement"), franc(doc.avant), C.texte);
        rangee(tr("Payé aujourd'hui"), franc(doc.paye), C.entre, true);
        trait(y - 30, C.ligne, 2);
        y += 10;
        if (doc.reste > 0) rangee(tr("Reste à payer"), franc(doc.reste), C.rouge, true);
        else rangee(tr("Reste à payer"), franc(0), C.entre, true);
      }

      // Tampon « PAYÉ » quand tout est réglé
      if (doc.reste === 0 && vraiment) {
        ctx.save();
        ctx.translate(marge + 150, y - 40);
        ctx.rotate(-0.18);
        ctx.strokeStyle = C.entre;
        ctx.lineWidth = 5;
        ctx.strokeRect(-110, -44, 220, 76);
        ctx.font = fredoka(48);
        ctx.fillStyle = C.entre;
        ctx.textAlign = "center";
        ctx.fillText(tr("PAYÉ"), 0, 12);
        ctx.restore();
      }

      // Comptes de paiement mobile de la boutique.
      const paiement = lignesPaiement();
      if (paiement.length) {
        y += 50;
        texte(tr(doc.reste > 0 ? "Pour payer le reste :" : "Paiement accepté :"), marge, y, rubik(24, 600), C.texte);
        paiement.forEach(function (l) {
          ctx.font = rubik(24);
          couper(ctx, l, L - 2 * marge).forEach(function (morceau) { y += 34; texte(morceau, marge, y, rubik(24), C.doux); });
        });
      }

      y += 60;
      trait(y, C.ligne, 3);
      y += 56;
      texte(b.merci || tr("Merci et à bientôt !"), L / 2, y, fredoka(32, 600), C.vert, "center");
      y += 50;
      return y;
    }

    toile.width = L;
    toile.height = Math.ceil(dessiner(false));
    dessiner(true);
    return toile;
  });
}

/* ---------- Ouvrir, partager, enregistrer ---------- */

function documentVente(m) {
  const fiche = m.clientId || m.client ? ficheClient(idClientDe(m), m.client) : null;
  const lignes = m.lignes && m.lignes.length ? m.lignes
    : [{ nom: m.note || tr("Articles divers"), qte: 1, prix: m.montant }];
  const paye = m.type === "vente" ? encaisseDe(m) : 0;
  return {
    titre: tr("FACTURE"), numero: numeroDocument("F-", assurerNumero(m)), t: m.t,
    client: fiche && fiche.nom, telClient: fiche && fiche.tel,
    lignes: lignes, total: m.montant, paye: paye, reste: m.montant - paye
  };
}
function documentRecu(m) {
  const fiche = ficheClient(idClientDe(m), m.client);
  const avant = soldeAvant(m);
  const reste = Math.max(0, avant - m.montant);
  return {
    titre: tr(reste > 0 ? "REÇU D'ACOMPTE" : "REÇU DE PAIEMENT"), numero: numeroDocument("R-", assurerNumero(m)), t: m.t,
    client: fiche.nom, telClient: fiche.tel,
    avant: avant, paye: m.montant, reste: reste
  };
}

function ouvrirDocument(m) {
  const doc = m.type === "paye" ? documentRecu(m) : documentVente(m);
  $("facture-titre").textContent = (m.type === "paye" ? "Reçu " : "Facture ") + doc.numero;
  $("facture-image").removeAttribute("src");
  // Envoi direct : seulement si on connaît le numéro du client.
  const direct = !!(doc.telClient && doc.telClient.length >= 8);
  $("facture-envoyer").hidden = !direct;
  $("facture-envoyer-nom").textContent = doc.client || "";
  $("facture-partager").classList.toggle("bouton-annuler", direct);
  $("facture-partager").classList.toggle("bouton-whatsapp", !direct);
  $("facture-partager-texte").textContent = direct ? tr("Partager l'image") : tr("Envoyer sur WhatsApp");
  $("facture-aide").textContent = direct
    ? "La conversation de " + doc.client + " s'ouvre directement, sans chercher dans tes contacts."
    : doc.client
      ? tr(doc.client + " n'a pas de numéro. Ajoute-le avec « Modifier » dans l'onglet Crédits pour envoyer en un geste.")
      : "Cette vente n'a pas de client : choisis WhatsApp, puis la personne.";
  ouvrirFeuille("facture-apercu");
  dessinerDocument(doc).then(function (toile) {
    documentEnCours = { toile: toile, doc: doc, nom: tr(m.type === "paye" ? "recu-" : "facture-") + doc.numero + ".png" };
    $("facture-image").src = toile.toDataURL("image/png");
  });
}

function fichierDocument() {
  return new Promise(function (ok) {
    documentEnCours.toile.toBlob(function (blob) {
      ok(new File([blob], documentEnCours.nom, { type: "image/png" }));
    }, "image/png");
  });
}
function enregistrerDocument() {
  if (!documentEnCours) return;
  fichierDocument().then(function (f) {
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(f);
    lien.download = f.name;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(function () { URL.revokeObjectURL(lien.href); }, 10000);
    message("Image enregistrée dans « Téléchargements ».", null, true);
  });
}
function partagerDocument() {
  if (!documentEnCours) return;
  fichierDocument().then(function (f) {
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      navigator.share({ files: [f] }).catch(function (err) {
        if (!err || err.name !== "AbortError") enregistrerDocument();
      });
    } else {
      enregistrerDocument();
      message("Image enregistrée. Envoie-la depuis WhatsApp (trombone, puis Galerie).");
    }
  });
}

/* ---------- Envoi direct dans la conversation du client ---------- */

// La facture écrite en texte : c'est elle qui part dans WhatsApp, car un lien
// WhatsApp peut ouvrir la bonne conversation mais ne peut pas y coller une image.
function factureEnTexte(doc) {
  const b = donnees.boutique;
  const lignes = [];
  // L'anglais ne met pas d'espace avant les deux-points.
  const sep = LANGUE === "en" ? ": " : " : ";
  lignes.push(doc.titre + " " + doc.numero + (b.nom ? " · " + b.nom : ""));
  if (doc.client) lignes.push(tr("Client") + sep + doc.client);
  lignes.push("");
  if (doc.lignes) {
    doc.lignes.forEach(function (l) {
      const qte = !l.unite || l.unite === "unite" ? String(l.qte).replace(".", ",") : qteTexte(l.qte, l.unite);
      lignes.push("• " + tr(qte) + " " + l.nom + sep + franc(Math.round(l.prix * l.qte)));
    });
    lignes.push("");
    lignes.push(tr("TOTAL") + sep + franc(doc.total));
    if (doc.paye) lignes.push(tr("Déjà payé") + sep + franc(doc.paye));
    if (doc.reste > 0) lignes.push(tr("Reste à payer") + sep + franc(doc.reste));
  } else {
    lignes.push(tr("Montant dû avant ce paiement") + sep + franc(doc.avant));
    lignes.push(tr("Payé aujourd'hui") + sep + franc(doc.paye));
    lignes.push(doc.reste > 0 ? tr("Reste à payer") + sep + franc(doc.reste) : tr("Tout est payé. Merci !"));
  }
  const paiement = lignesPaiement();
  if (doc.reste > 0 && paiement.length) {
    lignes.push("");
    lignes.push(tr("Pour payer le reste :"));
    paiement.forEach(function (p) { lignes.push("• " + p); });
  }
  if (b.merci) { lignes.push(""); lignes.push(b.merci); }
  return lignes.join("\n");
}

// Copie l'image dans le presse-papier : dans la conversation, un appui long
// sur la zone de texte permet de la coller. Tous les téléphones ne le savent pas faire.
function copierImageDocument() {
  if (!navigator.clipboard || !window.ClipboardItem || !documentEnCours) return Promise.resolve(false);
  try {
    const item = new ClipboardItem({
      "image/png": new Promise(function (ok) { documentEnCours.toile.toBlob(ok, "image/png"); })
    });
    return navigator.clipboard.write([item]).then(function () { return true; }, function () { return false; });
  } catch (e) { return Promise.resolve(false); }
}

function envoyerDocumentAuClient() {
  if (!documentEnCours || !documentEnCours.doc) return;
  const doc = documentEnCours.doc;
  const lien = "https://wa.me/" + numeroWhatsApp(doc.telClient) + "?text=" + encodeURIComponent(factureEnTexte(doc));
  copierImageDocument().then(function (copiee) {
    window.open(lien, "_blank", "noopener");
    message(copiee
      ? "La conversation de " + doc.client + " s'ouvre. L'image est copiée : appuie longuement sur la zone de texte pour la coller."
      : "La conversation de " + doc.client + " s'ouvre avec la facture écrite. Pour l'image, reviens et touche « Partager l'image ».", null, true);
  });
}

function initFacture() {
  $("facture-envoyer").addEventListener("click", envoyerDocumentAuClient);
  $("facture-partager").addEventListener("click", partagerDocument);
  $("facture-enregistrer").addEventListener("click", enregistrerDocument);
  $("facture-fermer").addEventListener("click", fermerFeuilles);
}

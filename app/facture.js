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
  return d.toLocaleDateString("fr-FR") + " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
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
      const nomLignes = couper(ctx, b.nom || "Ma boutique", L - xTexte - marge);
      let yt = y + 44;
      nomLignes.forEach(function (l) { texte(l, xTexte, yt, fredoka(44), C.vert); yt += 50; });
      if (b.tel) { texte("Tél. " + afficherTel(b.tel), xTexte, yt, rubik(26), C.doux); yt += 36; }
      if (b.adresse) {
        ctx.font = rubik(26);
        couper(ctx, b.adresse, L - xTexte - marge).forEach(function (l) { texte(l, xTexte, yt, rubik(26), C.doux); yt += 34; });
      }
      y = Math.max(yt, logo ? y + 140 : yt) + 18;
      trait(y, C.ligne, 3);
      y += 62;

      // Titre, numéro et date
      texte(doc.titre, marge, y, fredoka(40), C.texte);
      texte("N° " + doc.numero, L - marge, y - 4, rubik(26, 600), C.texte, "right");
      y += 38;
      texte(dateHeure(doc.t), L - marge, y, rubik(24), C.doux, "right");
      if (doc.client) texte("Client : " + doc.client, marge, y, rubik(28, 600), C.texte);
      y += 34;
      if (doc.telClient) { texte("Tél. " + afficherTel(doc.telClient), marge, y, rubik(24), C.doux); y += 34; }
      y += 20;

      if (doc.lignes) {
        // Tableau des produits
        const colQte = L - marge - 350, colPu = L - marge - 170, colTot = L - marge;
        if (vraiment) { ctx.fillStyle = C.sable; ctx.fillRect(marge, y, L - 2 * marge, 52); }
        texte("Désignation", marge + 16, y + 34, rubik(22, 600), C.doux);
        texte("Qté", colQte, y + 34, rubik(22, 600), C.doux, "right");
        texte("Prix", colPu, y + 34, rubik(22, 600), C.doux, "right");
        texte("Total", colTot - 16, y + 34, rubik(22, 600), C.doux, "right");
        y += 52;
        doc.lignes.forEach(function (l) {
          ctx.font = rubik(26);
          const morceaux = couper(ctx, l.nom, colQte - marge - 170);
          const qte = !l.unite || l.unite === "unite" ? String(l.qte).replace(".", ",") : qteTexte(l.qte, l.unite);
          const h = Math.max(60, 26 + morceaux.length * 32);
          morceaux.forEach(function (m, i) { texte(m, marge + 16, y + 40 + i * 32, rubik(26), C.texte); });
          texte(qte, colQte, y + 40, rubik(26), C.texte, "right");
          texte(nombre(l.prix) + (l.unite && l.unite !== "unite" ? "/" + nomUnite(l.unite, 1) : ""), colPu, y + 40, rubik(l.unite && l.unite !== "unite" ? 22 : 26), C.texte, "right");
          texte(nombre(Math.round(l.prix * l.qte)), colTot - 16, y + 40, rubik(26, 600), C.texte, "right");
          y += h;
          trait(y, C.ligne, 2);
        });
        y += 56;
        texte("TOTAL", L - marge - 300, y, fredoka(34), C.texte, "right");
        texte(franc(doc.total), L - marge, y, fredoka(40), C.vert, "right");
        y += 50;
        if (doc.reste > 0) {
          texte("Payé", L - marge - 300, y, rubik(28), C.doux, "right");
          texte(franc(doc.paye), L - marge, y, rubik(28, 600), C.entre, "right");
          y += 44;
          texte("Reste à payer", L - marge - 300, y, rubik(28, 600), C.rouge, "right");
          texte(franc(doc.reste), L - marge, y, fredoka(34), C.rouge, "right");
          y += 30;
        }
      } else {
        // Reçu de paiement
        const rangee = function (libelle, valeur, couleur, grand) {
          texte(libelle, marge, y, rubik(28, grand ? 600 : 400), grand ? C.texte : C.doux);
          texte(valeur, L - marge, y, grand ? fredoka(40) : rubik(28, 600), couleur, "right");
          y += grand ? 64 : 50;
        };
        y += 10;
        rangee("Montant dû avant ce paiement", franc(doc.avant), C.texte);
        rangee("Payé aujourd'hui", franc(doc.paye), C.entre, true);
        trait(y - 30, C.ligne, 2);
        y += 10;
        if (doc.reste > 0) rangee("Reste à payer", franc(doc.reste), C.rouge, true);
        else rangee("Reste à payer", "0 F", C.entre, true);
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
        ctx.fillText("PAYÉ", 0, 12);
        ctx.restore();
      }

      y += 60;
      trait(y, C.ligne, 3);
      y += 56;
      texte(b.merci || "Merci et à bientôt !", L / 2, y, fredoka(32, 600), C.vert, "center");
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
    : [{ nom: m.note || "Articles divers", qte: 1, prix: m.montant }];
  const paye = m.type === "vente" ? encaisseDe(m) : 0;
  return {
    titre: "FACTURE", numero: numeroDocument("F-", assurerNumero(m)), t: m.t,
    client: fiche && fiche.nom, telClient: fiche && fiche.tel,
    lignes: lignes, total: m.montant, paye: paye, reste: m.montant - paye
  };
}
function documentRecu(m) {
  const fiche = ficheClient(idClientDe(m), m.client);
  const avant = soldeAvant(m);
  const reste = Math.max(0, avant - m.montant);
  return {
    titre: reste > 0 ? "REÇU D'ACOMPTE" : "REÇU DE PAIEMENT", numero: numeroDocument("R-", assurerNumero(m)), t: m.t,
    client: fiche.nom, telClient: fiche.tel,
    avant: avant, paye: m.montant, reste: reste
  };
}

function ouvrirDocument(m) {
  const doc = m.type === "paye" ? documentRecu(m) : documentVente(m);
  $("facture-titre").textContent = (m.type === "paye" ? "Reçu " : "Facture ") + doc.numero;
  $("facture-image").removeAttribute("src");
  $("facture-aide").textContent = donnees.boutique.nom
    ? "Choisis WhatsApp, puis " + (doc.client || "le client") + "."
    : "Astuce : ajoute le nom et le logo de ta boutique dans Réglages ⚙.";
  ouvrirFeuille("facture-apercu");
  dessinerDocument(doc).then(function (toile) {
    documentEnCours = { toile: toile, nom: (m.type === "paye" ? "recu-" : "facture-") + doc.numero + ".png" };
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

function initFacture() {
  $("facture-partager").addEventListener("click", partagerDocument);
  $("facture-enregistrer").addEventListener("click", enregistrerDocument);
  $("facture-fermer").addEventListener("click", fermerFeuilles);
}

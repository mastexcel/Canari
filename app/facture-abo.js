// Canari · la facture d'abonnement, émise par Bridge Investment & Partners.
// Chargée après facture.js (elle réutilise son dessin) ; initFactureAbo() au démarrage.
//
// Quand un commerçant active son abonnement, il reçoit sa facture : elle
// s'affiche tout de suite, et il peut l'envoyer sur WhatsApp ou par e-mail.
// C'est la SEULE image de l'appli qui porte le logo de Bridge Investment &
// Partners à côté de celui de Canari : les factures de vente du commerçant,
// elles, portent le logo de SA boutique et rien d'autre.
//
// Pourquoi la facture est fabriquée sur le téléphone du commerçant : Canari
// n'a pas de serveur. Une facture envoyée automatiquement par BIP demanderait
// un serveur d'envoi (voir docs/play-store.md pour la même limite côté
// paiement). Le commerçant a donc sa facture à coup sûr, sans attendre, et le
// propriétaire peut la lui renvoyer depuis sa page privée.

// Les coordonnées de l'émetteur sont dans emetteur.js, partagé avec gerant.html.

let factureAboEnCours = null; // { toile, doc, nom }

/* ---------- Les données de la facture ---------- */

// Le numéro porte le numéro Canari du téléphone : deux commerçants ne peuvent
// donc pas avoir la même référence, alors que chacun compte de son côté.
function numeroFactureAbo(n) {
  return "CAN-" + donnees.abonnement.id + "-" + String(n).padStart(2, "0");
}

// La formule correspondant à un nombre de jours payés.
function formuleDeJours(jours) {
  return FORMULES.find(function (f) { return f.jours === jours; }) || null;
}

/* Note la facture d'un abonnement qui vient d'être activé, et la rend.
   `code` vient de activerCode() : { jours, conseil, emis }. */
function noterFactureAbonnement(code, finApres) {
  const a = donnees.abonnement;
  if (!a.factures) a.factures = [];
  const demande = a.demande || {};
  const formule = code.conseil ? null : formuleDeJours(code.jours);
  // Le prix vient de la formule demandée sur ce téléphone ; sinon de la liste.
  const memeDemande = demande.jours === code.jours && !!demande.conseil === !!code.conseil;
  const doc = {
    numero: numeroFactureAbo(a.factures.length + 1),
    t: Date.now(),
    jours: code.jours,
    conseil: !!code.conseil,
    designation: code.conseil
      ? "Option Conseil « Demande à Canari » — " + (memeDemande && demande.nom ? demande.nom : code.jours + " jours")
      : "Abonnement Canari — " + (formule ? formule.nom : code.jours + " jours"),
    prix: memeDemande && demande.prix ? demande.prix : (formule ? formule.prix : 0),
    fin: finApres,
    email: demande.email || a.email || "",
    boutique: donnees.boutique.nom || "",
    tel: donnees.boutique.tel || ""
  };
  a.factures.push(doc);
  if (a.factures.length > 60) a.factures.splice(0, a.factures.length - 60);
  a.demande = null;
  return doc;
}

/* ---------- Le dessin ---------- */

function dessinerFactureAbo(doc) {
  const polices = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('700 40px "Fredoka"'), document.fonts.load('400 24px "Rubik"'),
                   document.fonts.load('600 24px "Rubik"')]).catch(function () {})
    : Promise.resolve();
  return Promise.all([polices, chargerImage(EMETTEUR.logo), chargerImage("icones/canari-joyeux.webp")])
    .then(function (r) {
      const logoBip = r[1], logoCanari = r[2];
      const C = COULEURS_FACTURE;
      const L = 900, marge = 56;
      const toile = document.createElement("canvas");
      const ctx = toile.getContext("2d");
      const fredoka = function (t, p) { return (p || 700) + " " + t + 'px "Fredoka", sans-serif'; };
      const rubik = function (t, p) { return (p || 400) + " " + t + 'px "Rubik", sans-serif'; };
      const sep = LANGUE === "en" ? ": " : " : ";

      // Deux passes : la première mesure la hauteur, la seconde dessine.
      function dessiner(vraiment) {
        let y = 0;
        const texte = function (t, x, yy, police, couleur, align) {
          if (!vraiment) return;
          ctx.font = police; ctx.fillStyle = couleur; ctx.textAlign = align || "left";
          ctx.fillText(t, x, yy);
        };
        const trait = function (yy, couleur, ep) {
          if (!vraiment) return;
          ctx.fillStyle = couleur; ctx.fillRect(marge, yy, L - 2 * marge, ep || 2);
        };
        if (vraiment) {
          ctx.fillStyle = C.fond; ctx.fillRect(0, 0, L, toile.height);
          ctx.fillStyle = C.vert; ctx.fillRect(0, 0, L, 14);
        }

        // En-tête : les deux logos, BIP à gauche (l'éditeur), Canari à droite (le produit).
        y = 46;
        let bas = y;
        if (logoBip) {
          const l = 300, e = Math.min(l / logoBip.width, 150 / logoBip.height);
          if (vraiment) ctx.drawImage(logoBip, marge, y, logoBip.width * e, logoBip.height * e);
          bas = Math.max(bas, y + logoBip.height * e);
        } else {
          texte(EMETTEUR.nom, marge, y + 40, fredoka(36), C.texte);
          bas = Math.max(bas, y + 56);
        }
        if (logoCanari) {
          const cote = 120, e = Math.min(cote / logoCanari.width, cote / logoCanari.height);
          const larg = logoCanari.width * e;
          if (vraiment) ctx.drawImage(logoCanari, L - marge - larg, y, larg, logoCanari.height * e);
          bas = Math.max(bas, y + logoCanari.height * e);
        }
        y = bas + 44;   // de l'air entre les logos et les mentions légales

        // Coordonnées de l'émetteur. La forme juridique et le capital sont
        // obligatoires sur une facture de société en Côte d'Ivoire.
        const lignesEmetteur = [];
        if (EMETTEUR.forme) lignesEmetteur.push(EMETTEUR.forme);
        if (EMETTEUR.adresse) lignesEmetteur.push(EMETTEUR.adresse);
        if (EMETTEUR.tel) lignesEmetteur.push(tr("Tél. " + afficherTel(EMETTEUR.tel)));
        if (EMETTEUR.email) lignesEmetteur.push(EMETTEUR.email);
        if (EMETTEUR.rccm) lignesEmetteur.push(tr("RCCM : " + EMETTEUR.rccm));
        if (EMETTEUR.dfe) lignesEmetteur.push(tr("DFE / NCC : " + EMETTEUR.dfe));
        lignesEmetteur.forEach(function (l) { texte(l, marge, y, rubik(24), C.doux); y += 32; });
        y += 10;
        trait(y, C.ligne, 3); y += 44;

        // Titre, numéro, date
        texte(tr("FACTURE D'ABONNEMENT"), marge, y, rubik(30, 600), C.texte);
        texte(tr("N° ") + doc.numero, L - marge, y, rubik(26, 600), C.texte, "right");
        y += 38;
        texte(dateHeure(doc.t), L - marge, y, rubik(24), C.doux, "right");
        y += 44;

        // Le client
        texte(tr("Client"), marge, y, rubik(24, 600), C.doux); y += 34;
        if (doc.boutique) { texte(doc.boutique, marge, y, rubik(28, 600), C.texte); y += 36; }
        texte(tr("Numéro Canari") + sep + idAffiche(donnees.abonnement.id), marge, y, rubik(24), C.doux); y += 32;
        if (doc.tel) { texte(tr("Tél. " + afficherTel(doc.tel)), marge, y, rubik(24), C.doux); y += 32; }
        if (doc.email) { texte(doc.email, marge, y, rubik(24), C.doux); y += 32; }
        y += 16;

        // La ligne de la prestation
        if (vraiment) { ctx.fillStyle = C.sable; ctx.fillRect(marge, y - 26, L - 2 * marge, 44); }
        texte(tr("Désignation"), marge + 16, y, rubik(24, 600), C.doux);
        texte(tr("Montant"), L - marge - 16, y, rubik(24, 600), C.doux, "right");
        y += 50;
        ctx.font = rubik(26);
        const lignes = couper(ctx, tr(doc.designation), L - 2 * marge - 220);
        const yLigne = y;
        lignes.forEach(function (l) { texte(l, marge + 16, y, rubik(26), C.texte); y += 34; });
        texte(francCFA(doc.prix), L - marge - 16, yLigne, rubik(26, 600), C.texte, "right");
        y += 6;
        texte(tr("Période couverte jusqu'au " + dateFin(doc.fin)), marge + 16, y, rubik(22), C.doux);
        y += 40;
        trait(y, C.ligne, 2); y += 46;

        // Total et mention de paiement
        texte(tr("TOTAL"), L - marge - 200, y, rubik(30, 600), C.texte, "right");
        texte(francCFA(doc.prix), L - marge, y, rubik(34, 600), C.vert, "right");
        y += 44;
        texte(tr("Payé — merci !"), L - marge, y, rubik(26, 600), C.entre, "right");
        y += 44;
        if (EMETTEUR.tva) {
          ctx.font = rubik(22);
          couper(ctx, tr(EMETTEUR.tva), L - 2 * marge).forEach(function (l) {
            texte(l, marge, y, rubik(22), C.doux); y += 30;
          });
          y += 8;
        }
        trait(y, C.ligne, 2); y += 40;
        ctx.font = rubik(24);
        couper(ctx, tr(EMETTEUR.produit + " est une application de " + EMETTEUR.nom + "."), L - 2 * marge)
          .forEach(function (l) { texte(l, L / 2, y, rubik(24), C.doux, "center"); y += 32; });
        return y + marge;
      }

      toile.width = L;
      toile.height = Math.ceil(dessiner(false));
      dessiner(true);
      return toile;
    });
}

/* ---------- L'écran ---------- */

function ouvrirFactureAbonnement(doc) {
  factureAboEnCours = null;
  $("abofac-titre").textContent = tr("Facture " + doc.numero);
  $("abofac-image").removeAttribute("src");
  $("abofac-email").hidden = false;
  ouvrirFeuille("abo-facture");
  dessinerFactureAbo(doc).then(function (toile) {
    factureAboEnCours = { toile: toile, doc: doc, nom: tr("facture-abonnement-") + doc.numero + ".png" };
    $("abofac-image").src = toile.toDataURL("image/png");
  });
}

// La facture écrite en texte : c'est elle qui part dans WhatsApp et dans l'e-mail,
// car ni l'un ni l'autre ne peuvent recevoir une image depuis un simple lien.
function factureAboEnTexte(doc) {
  const sep = LANGUE === "en" ? ": " : " : ";
  const l = [];
  l.push(tr("FACTURE D'ABONNEMENT") + " " + doc.numero);
  l.push(EMETTEUR.nom);
  if (EMETTEUR.forme) l.push(EMETTEUR.forme);
  if (EMETTEUR.adresse) l.push(EMETTEUR.adresse);
  if (EMETTEUR.tel) l.push(tr("Tél. " + afficherTel(EMETTEUR.tel)));
  if (EMETTEUR.email) l.push(EMETTEUR.email);
  if (EMETTEUR.rccm) l.push(tr("RCCM : " + EMETTEUR.rccm));
  if (EMETTEUR.dfe) l.push(tr("DFE / NCC : " + EMETTEUR.dfe));
  l.push("");
  l.push(tr("Date") + sep + dateHeure(doc.t));
  if (doc.boutique) l.push(tr("Client") + sep + doc.boutique);
  l.push(tr("Numéro Canari") + sep + idAffiche(donnees.abonnement.id));
  l.push("");
  l.push(tr(doc.designation) + sep + francCFA(doc.prix));
  l.push(tr("Période couverte jusqu'au " + dateFin(doc.fin)));
  l.push("");
  l.push(tr("TOTAL") + sep + francCFA(doc.prix));
  l.push(tr("Payé — merci !"));
  if (EMETTEUR.tva) l.push(tr(EMETTEUR.tva));
  l.push("");
  l.push(tr(EMETTEUR.produit + " est une application de " + EMETTEUR.nom + "."));
  return l.join("\n");
}

function fichierFactureAbo() {
  return new Promise(function (ok) {
    factureAboEnCours.toile.toBlob(function (blob) {
      ok(new File([blob], factureAboEnCours.nom, { type: "image/png" }));
    }, "image/png");
  });
}

function enregistrerFactureAbo() {
  if (!factureAboEnCours) return;
  fichierFactureAbo().then(function (f) {
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(f);
    lien.download = f.name;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(function () { URL.revokeObjectURL(lien.href); }, 10000);
    message("Facture enregistrée dans « Téléchargements ».", null, true);
  });
}

function partagerFactureAbo() {
  if (!factureAboEnCours) return;
  fichierFactureAbo().then(function (f) {
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      navigator.share({ files: [f] }).catch(function (err) {
        if (!err || err.name !== "AbortError") enregistrerFactureAbo();
      });
    } else {
      enregistrerFactureAbo();
      message("Facture enregistrée. Envoie-la depuis WhatsApp (trombone, puis Galerie).");
    }
  });
}

// WhatsApp : le lien ouvre la liste des conversations avec la facture écrite.
// L'image est copiée dans le presse-papier quand le téléphone le permet.
function envoyerFactureAboWhatsApp() {
  if (!factureAboEnCours) return;
  const texte = factureAboEnTexte(factureAboEnCours.doc);
  const copier = navigator.clipboard && window.ClipboardItem
    ? navigator.clipboard.write([new ClipboardItem({
        "image/png": new Promise(function (ok) { factureAboEnCours.toile.toBlob(ok, "image/png"); })
      })]).then(function () { return true; }, function () { return false; })
    : Promise.resolve(false);
  copier.then(function (copiee) {
    window.open("https://wa.me/?text=" + encodeURIComponent(texte), "_blank", "noopener");
    message(copiee
      ? "WhatsApp s'ouvre avec ta facture écrite. L'image est copiée : appuie longuement sur la zone de texte pour la coller."
      : "WhatsApp s'ouvre avec ta facture écrite. Pour l'image, reviens et touche « Enregistrer l'image ».", null, true);
  });
}

// E-mail : le lien ouvre la messagerie du téléphone, déjà remplie. Une page web
// ne peut pas envoyer un e-mail toute seule, et ne peut pas y joindre l'image :
// il faut l'enregistrer puis la joindre à la main.
function envoyerFactureAboEmail() {
  if (!factureAboEnCours) return;
  const doc = factureAboEnCours.doc;
  const sujet = tr("Facture " + doc.numero + " — " + EMETTEUR.produit);
  const lien = "mailto:" + encodeURIComponent(doc.email || "") +
    "?subject=" + encodeURIComponent(sujet) +
    "&body=" + encodeURIComponent(factureAboEnTexte(doc));
  window.open(lien, "_blank", "noopener");
  message("Ta messagerie s'ouvre avec la facture écrite. Pour joindre l'image, enregistre-la d'abord.", null, true);
}

/* ---------- Retrouver ses factures ---------- */

function listeFacturesAbo() {
  return ((donnees.abonnement && donnees.abonnement.factures) || []).slice().reverse();
}

function afficherFacturesAbo() {
  const liste = listeFacturesAbo();
  $("abo-factures").hidden = !liste.length;
  if (!liste.length) return;
  $("abo-factures-liste").innerHTML = liste.map(function (f, i) {
    return '<button type="button" class="suggestion" data-facture-abo="' + i + '">' +
      '<b>' + echapper(tr(f.designation)) + '</b>' +
      '<small>' + echapper(f.numero + " · " + new Date(f.t).toLocaleDateString(LOCALE) + " · " + francCFA(f.prix)) + '</small>' +
      '</button>';
  }).join("");
}

function initFactureAbo() {
  $("abofac-whatsapp").addEventListener("click", envoyerFactureAboWhatsApp);
  $("abofac-email").addEventListener("click", envoyerFactureAboEmail);
  $("abofac-partager").addEventListener("click", partagerFactureAbo);
  $("abofac-enregistrer").addEventListener("click", enregistrerFactureAbo);
  $("abofac-fermer").addEventListener("click", fermerFeuilles);
  $("abo-factures-liste").addEventListener("click", function (e) {
    const b = e.target.closest("[data-facture-abo]");
    if (b) ouvrirFactureAbonnement(listeFacturesAbo()[Number(b.dataset.factureAbo)]);
  });
}

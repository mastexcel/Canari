/* =====================================================================
   EXPORT EXCEL  ·  un vrai fichier .xlsx, fabriqué sur le téléphone
   ---------------------------------------------------------------------
   Un fichier Excel est un dossier ZIP qui contient des fichiers XML.
   Canari l'écrit lui-même, sans aucune bibliothèque à télécharger :
   l'appli reste légère et l'export marche sans internet.

   Le ZIP est écrit « sans compression » (méthode « stored ») : c'est
   plus simple, et sur un carnet de caisse les fichiers restent petits
   (quelques centaines de kilo-octets pour une année).

   Six feuilles : Résumé, Mouvements, Jour par jour, Produits,
   Clients, Fournisseurs. La période se choisit dans les Réglages.
   ===================================================================== */

/* ---------- Le ZIP (méthode « stored », sans compression) ---------- */

// Table de contrôle CRC-32, exigée par le format ZIP.
let TABLE_CRC = null;
function crc32(octets) {
  if (!TABLE_CRC) {
    TABLE_CRC = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      TABLE_CRC[n] = c >>> 0;
    }
  }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < octets.length; i++) c = TABLE_CRC[(c ^ octets[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function octetsDe(texte) { return new TextEncoder().encode(texte); }

// Fabrique le ZIP à partir d'une liste { nom, texte }.
function fabriquerZip(fichiers) {
  const morceaux = [], entrees = [];
  let position = 0;
  const ecrireNombre = function (tableau, decalage, valeur, taille) {
    for (let i = 0; i < taille; i++) tableau[decalage + i] = (valeur >>> (i * 8)) & 0xFF;
  };
  fichiers.forEach(function (f) {
    const nom = octetsDe(f.nom), contenu = octetsDe(f.texte), somme = crc32(contenu);
    const entete = new Uint8Array(30 + nom.length);
    ecrireNombre(entete, 0, 0x04034B50, 4);   // signature
    ecrireNombre(entete, 4, 20, 2);           // version minimale
    ecrireNombre(entete, 8, 0, 2);            // méthode : sans compression
    ecrireNombre(entete, 14, somme, 4);
    ecrireNombre(entete, 18, contenu.length, 4);
    ecrireNombre(entete, 22, contenu.length, 4);
    ecrireNombre(entete, 26, nom.length, 2);
    entete.set(nom, 30);
    entrees.push({ nom: nom, somme: somme, taille: contenu.length, position: position });
    morceaux.push(entete, contenu);
    position += entete.length + contenu.length;
  });
  const debutIndex = position;
  entrees.forEach(function (e) {
    const c = new Uint8Array(46 + e.nom.length);
    ecrireNombre(c, 0, 0x02014B50, 4);
    ecrireNombre(c, 4, 20, 2);
    ecrireNombre(c, 6, 20, 2);
    ecrireNombre(c, 10, 0, 2);
    ecrireNombre(c, 16, e.somme, 4);
    ecrireNombre(c, 20, e.taille, 4);
    ecrireNombre(c, 24, e.taille, 4);
    ecrireNombre(c, 28, e.nom.length, 2);
    ecrireNombre(c, 42, e.position, 4);
    c.set(e.nom, 46);
    morceaux.push(c);
    position += c.length;
  });
  const fin = new Uint8Array(22);
  ecrireNombre(fin, 0, 0x06054B50, 4);
  ecrireNombre(fin, 8, entrees.length, 2);
  ecrireNombre(fin, 10, entrees.length, 2);
  ecrireNombre(fin, 12, position - debutIndex, 4);
  ecrireNombre(fin, 16, debutIndex, 4);
  morceaux.push(fin);
  return new Blob(morceaux, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/* ---------- Les cellules ---------- */

const XML_ECHAPPE = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };
function xml(s) {
  // Excel refuse les caractères de contrôle : on les retire.
  return String(s === null || s === undefined ? "" : s)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/[&<>"']/g, function (c) { return XML_ECHAPPE[c]; });
}
function lettreColonne(n) {
  let s = "";
  while (n >= 0) { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; }
  return s;
}
// Excel compte les jours depuis le 30 décembre 1899.
function serieExcel(t) {
  const d = new Date(t);
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000;
  return utc + 25569;
}
// Une cellule : texte, nombre, date, ou entête.
function cellule(colonne, ligne, valeur, style) {
  const ref = lettreColonne(colonne) + ligne;
  if (valeur === null || valeur === undefined || valeur === "") return "";
  if (typeof valeur === "number" && isFinite(valeur)) {
    return '<c r="' + ref + '"' + (style ? ' s="' + style + '"' : "") + '><v>' + valeur + '</v></c>';
  }
  return '<c r="' + ref + '"' + (style ? ' s="' + style + '"' : "") + ' t="inlineStr"><is><t xml:space="preserve">' +
    xml(valeur) + '</t></is></c>';
}

// Une feuille. `lignes` : tableau de tableaux. La première ligne est l'entête.
// `formats` : par colonne, "texte" | "nombre" | "date" | "pourcent".
function feuilleXml(lignes, formats) {
  const STYLE = { texte: 0, nombre: 2, date: 1, pourcent: 3 };
  const corps = lignes.map(function (ligne, i) {
    const n = i + 1;
    const cellules = ligne.map(function (v, c) {
      const entete = i === 0;
      const f = formats && formats[c] ? formats[c] : "texte";
      let valeur = v;
      if (!entete && f === "date" && typeof v === "number") valeur = serieExcel(v);
      return cellule(c, n, valeur, entete ? 4 : STYLE[f] || 0);
    }).join("");
    return '<row r="' + n + '">' + cellules + '</row>';
  }).join("");
  const largeurs = (formats || []).map(function (f, i) {
    const l = f === "date" ? 12 : f === "nombre" ? 14 : f === "pourcent" ? 10 : 22;
    return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + l + '" customWidth="1"/>';
  }).join("");
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    (largeurs ? '<cols>' + largeurs + '</cols>' : '') +
    '<sheetData>' + corps + '</sheetData></worksheet>';
}

// Assemble le classeur complet.
function fabriquerClasseur(feuilles) {
  const fichiers = [
    { nom: "[Content_Types].xml", texte: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      feuilles.map(function (f, i) {
        return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
      }).join("") + '</Types>' },
    { nom: "_rels/.rels", texte: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>' },
    { nom: "xl/workbook.xml", texte: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
      feuilles.map(function (f, i) {
        return '<sheet name="' + xml(f.nom) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>';
      }).join("") + '</sheets></workbook>' },
    { nom: "xl/_rels/workbook.xml.rels", texte: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      feuilles.map(function (f, i) {
        return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>';
      }).join("") +
      '<Relationship Id="rId' + (feuilles.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      '</Relationships>' },
    // Styles : 0 normal, 1 date, 2 nombre avec séparateur, 3 pourcentage, 4 entête en gras.
    { nom: "xl/styles.xml", texte: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0"/>' +
      '<numFmt numFmtId="165" formatCode="dd/mm/yyyy"/></numFmts>' +
      '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>' +
      '<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
      '<fills count="3"><fill><patternFill patternType="none"/></fill>' +
      '<fill><patternFill patternType="gray125"/></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FFE4E9D7"/><bgColor indexed="64"/></patternFill></fill></fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="5">' +
      '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
      '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
      '<xf numFmtId="9" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
      '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>' +
      '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>' }
  ];
  feuilles.forEach(function (f, i) {
    fichiers.push({ nom: "xl/worksheets/sheet" + (i + 1) + ".xml", texte: feuilleXml(f.lignes, f.formats) });
  });
  return fabriquerZip(fichiers);
}

/* ---------- Le contenu des six feuilles ---------- */

const PERIODES_EXCEL = {
  semaine: { nom: "7 derniers jours", jours: 7 },
  mois: { nom: "30 derniers jours", jours: 30 },
  annee: { nom: "12 derniers mois", jours: 365 },
  tout: { nom: "Depuis le début", jours: 0 },
  dates: { nom: "Dates choisies", jours: 0 }
};
let periodeExcel = "mois";

// Les bornes de la période choisie, en millisecondes.
function bornesExcel() {
  const fin = debutJour(Date.now()) + JOUR - 1;
  if (periodeExcel === "dates") {
    const d1 = $("excel-du").value, d2 = $("excel-au").value;
    const debut = d1 ? new Date(d1 + "T00:00:00").getTime() : 0;
    const arret = d2 ? new Date(d2 + "T23:59:59").getTime() : fin;
    return { debut: debut, fin: arret };
  }
  if (periodeExcel === "tout") return { debut: 0, fin: fin };
  const n = PERIODES_EXCEL[periodeExcel].jours;
  return { debut: debutJour(Date.now()) - (n - 1) * JOUR, fin: fin };
}

function nomTypeExcel(m) {
  if (m.type === "vente") return creditDe(m) > 0 ? "Vente, pas tout payé" : "Vente";
  if (m.type === "credit") return "Vente à crédit";
  if (m.type === "depense") {
    return m.categorie === "marchandise" ? "Achat de marchandise"
      : m.categorie === "charge" ? "Charge fixe payée"
      : m.categorie === "impot" ? "Impôt ou taxe payé" : "Autre dépense";
  }
  return NOMS[m.type] || m.type;
}

function donneesExcel(bornes) {
  const B = donnees.boutique;
  const mouvements = donnees.mouvements.filter(function (m) { return m.t >= bornes.debut && m.t <= bornes.fin; })
    .sort(function (a, b) { return a.t - b.t; });

  // Les jours couverts par la période, pour la feuille « Jour par jour ».
  const jours = [];
  let total = { vendu: 0, cout: 0, depenses: 0, charges: 0, impots: 0, usure: 0, benefice: 0, encaisse: 0, sorti: 0, maison: 0, aCredit: 0 };
  if (mouvements.length) {
    const premier = debutJour(Math.max(bornes.debut, mouvements[0].t));
    const dernier = debutJour(Math.min(bornes.fin, mouvements[mouvements.length - 1].t));
    for (let t = premier; t <= dernier; t += JOUR) {
      const cle = cleJour(t), d = totauxDuJour(cle);
      if (!d.vendu && !d.sorti && !d.encaisse && !d.maison) continue;
      jours.push({ t: t, d: d });
      total.vendu += d.vendu; total.cout += d.cout; total.depenses += d.depenses;
      total.charges += d.partCharges; total.impots += d.partImpots; total.usure += d.usure;
      total.benefice += d.benefice; total.encaisse += d.encaisse; total.sorti += d.sorti;
      total.maison += d.maison; total.aCredit += d.aCredit;
    }
  }

  /* --- Feuille 1 : Résumé --- */
  const ligne = function (nom, valeur) { return [nom, valeur]; };
  const resume = [
    ["Canari — " + (B.nom || "Ma boutique"), ""],
    ["Période", PERIODES_EXCEL[periodeExcel].nom],
    ["Du", bornes.debut ? new Date(bornes.debut).toLocaleDateString(LOCALE) : "le premier jour noté"],
    ["Au", new Date(bornes.fin).toLocaleDateString(LOCALE)],
    ["Monnaie", deviseCourante.code],
    ["", ""],
    ligne("Ventes", total.vendu),
    ligne("dont vendu à crédit", total.aCredit),
    ligne("Prix de revient", -total.cout),
    ligne("= Marge brute", total.vendu - total.cout),
    ligne("Autres dépenses", -total.depenses),
    ligne("Charges fixes", -total.charges),
    ligne("Impôts et taxes", -total.impots),
    ligne("Usure du matériel", -total.usure),
    ligne("= Bénéfice net", total.benefice),
    ["", ""],
    ligne("Argent entré", total.encaisse),
    ligne("Argent sorti", -(total.sorti + total.maison)),
    ligne("dont pris pour la maison", -total.maison),
    ligne("= Argent en caisse sur la période", total.encaisse - total.sorti - total.maison),
    ["", ""],
    ligne("On me doit (aujourd'hui)", clientsQuiDoivent().reduce(function (s, c) { return s + c.du; }, 0)),
    ligne("Je dois (aujourd'hui)", fournisseursQueJeDois().reduce(function (s, c) { return s + c.du; }, 0)),
    ligne("Valeur du stock (aujourd'hui)", valeurStock()),
    ["", ""],
    ["Nombre de lignes", mouvements.length],
    ["Fichier créé le", new Date().toLocaleString(LOCALE)]
  ];

  /* --- Feuille 2 : Mouvements --- */
  const lignesMouvements = [["Date", "Heure", "Type", "Libellé", "Client ou fournisseur", "Moyen",
    "Montant", "Encaissé", "À crédit", "Prix de revient", "Note"]];
  mouvements.forEach(function (m) {
    const qui = m.client || "";
    const encaisse = m.type === "vente" || m.type === "paye" ? encaisseDe(m) : "";
    const credit = m.type === "vente" || m.type === "credit" ? creditDe(m) : "";
    const cout = m.type === "vente" || m.type === "credit" ? coutDe(m) : "";
    const produits = m.lignes && m.lignes.length ? m.lignes.map(libelleLigne).join(", ") : "";
    lignesMouvements.push([m.t, new Date(m.t).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" }),
      nomTypeExcel(m), produits || m.note || nomTypeExcel(m), qui, MOYENS[m.moyen || "especes"] || "",
      m.montant || 0, encaisse, credit, cout, m.note || ""]);
  });

  /* --- Feuille 3 : Jour par jour --- */
  const lignesJours = [["Date", "Ventes", "Prix de revient", "Marge brute", "Autres dépenses",
    "Charges fixes", "Impôts et taxes", "Usure du matériel", "Bénéfice net", "Argent entré", "Argent sorti", "Pris pour la maison"]];
  jours.forEach(function (j) {
    lignesJours.push([j.t, j.d.vendu, j.d.cout, j.d.vendu - j.d.cout, j.d.depenses,
      j.d.partCharges, j.d.partImpots, j.d.usure, j.d.benefice, j.d.encaisse, j.d.sorti, j.d.maison]);
  });

  /* --- Feuille 4 : Produits --- */
  const parProduit = {};
  mouvements.forEach(function (m) {
    if (!m.lignes) return;
    m.lignes.forEach(function (l) {
      const p = donnees.produits[l.produitId];
      if (!p) return;
      const e = parProduit[l.produitId] || (parProduit[l.produitId] = { p: p, qte: 0, vendu: 0, cout: 0 });
      e.qte += l.qte;
      e.vendu += l.prix * l.qte;
      e.cout += (l.cout || 0) * l.qte;
    });
  });
  const lignesProduits = [["Produit", "Unité", "Quantité vendue", "Chiffre d'affaires", "Prix de revient",
    "Marge", "Marge en %", "Prix de vente", "Stock aujourd'hui", "Valeur du stock"]];
  Object.keys(parProduit).map(function (k) { return parProduit[k]; })
    .sort(function (a, b) { return b.vendu - a.vendu; })
    .forEach(function (e) {
      const marge = e.vendu - e.cout;
      const stock = stockDe(e.p.id);
      lignesProduits.push([e.p.nom, nomUnite(uniteDe(e.p), 2), e.qte, e.vendu, e.cout, marge,
        e.vendu ? marge / e.vendu : "", e.p.prix || 0, stock, Math.max(0, stock) * (coutProduit(e.p) || 0)]);
    });

  /* --- Feuille 5 : Clients --- */
  const lignesClients = [["Client", "Téléphone", "Doit aujourd'hui", "Depuis le", "Dernier mouvement"]];
  clientsQuiDoivent().forEach(function (c) {
    lignesClients.push([c.nom, c.tel ? afficherTel(c.tel) : "", c.du, c.depuis || "", c.dernier || ""]);
  });

  /* --- Feuille 6 : Fournisseurs --- */
  const lignesF = [["Fournisseur", "Téléphone", "Je dois aujourd'hui", "Dernier mouvement"]];
  fournisseursQueJeDois().forEach(function (c) {
    lignesF.push([c.nom, c.tel ? afficherTel(c.tel) : "", c.du, c.dernier || ""]);
  });

  return [
    { nom: "Résumé", lignes: resume, formats: ["texte", "nombre"] },
    { nom: "Mouvements", lignes: lignesMouvements,
      formats: ["date", "texte", "texte", "texte", "texte", "texte", "nombre", "nombre", "nombre", "nombre", "texte"] },
    { nom: "Jour par jour", lignes: lignesJours,
      formats: ["date", "nombre", "nombre", "nombre", "nombre", "nombre", "nombre", "nombre", "nombre", "nombre", "nombre", "nombre"] },
    { nom: "Produits", lignes: lignesProduits,
      formats: ["texte", "texte", "nombre", "nombre", "nombre", "nombre", "pourcent", "nombre", "nombre", "nombre"] },
    { nom: "Clients", lignes: lignesClients, formats: ["texte", "texte", "nombre", "date", "date"] },
    { nom: "Fournisseurs", lignes: lignesF, formats: ["texte", "texte", "nombre", "date"] }
  ];
}

/* ---------- Le bouton ---------- */

function nomFichierExcel(bornes) {
  const B = (donnees.boutique.nom || "Canari").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "Canari";
  const d = function (t) { return cleJour(t); };
  return B + "_" + (bornes.debut ? d(bornes.debut) : "debut") + "_" + d(bornes.fin) + ".xlsx";
}

function telechargerExcel() {
  const bornes = bornesExcel();
  if (bornes.debut > bornes.fin) {
    message("La date de début est après la date de fin.");
    return;
  }
  const feuilles = donneesExcel(bornes);
  const lignes = feuilles[1].lignes.length - 1;
  if (!lignes) {
    message("Aucun mouvement sur cette période.");
    return;
  }
  const blob = fabriquerClasseur(feuilles);
  const fichier = new File([blob], nomFichierExcel(bornes),
    { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const enregistrer = function () {
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(fichier);
    lien.download = fichier.name;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(function () { URL.revokeObjectURL(lien.href); }, 10000);
    message("Fichier Excel enregistré dans « Téléchargements » : " + fichier.name, null, true);
  };
  if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
    navigator.share({ files: [fichier], title: tr("Chiffres Canari") })
      .then(function () { message("Fichier Excel envoyé.", null, true); })
      .catch(function (err) { if (!err || err.name !== "AbortError") enregistrer(); });
  } else {
    enregistrer();
  }
}

function choisirPeriodeExcel(cle) {
  periodeExcel = cle;
  document.querySelectorAll("[data-excel]").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.excel === cle));
  });
  $("excel-dates").hidden = cle !== "dates";
  const b = bornesExcel();
  $("excel-resume").textContent = cle === "dates" && !$("excel-du").value
    ? "Choisis la première et la dernière date."
    : "Du " + (b.debut ? new Date(b.debut).toLocaleDateString(LOCALE) : "premier jour noté") +
      " au " + new Date(b.fin).toLocaleDateString(LOCALE) + ".";
}

function initExcel() {
  document.querySelectorAll("[data-excel]").forEach(function (b) {
    b.addEventListener("click", function () { choisirPeriodeExcel(b.dataset.excel); });
  });
  ["excel-du", "excel-au"].forEach(function (id) {
    $(id).addEventListener("change", function () { choisirPeriodeExcel(periodeExcel); });
  });
  $("excel-telecharger").addEventListener("click", telechargerExcel);
  choisirPeriodeExcel(periodeExcel);
}

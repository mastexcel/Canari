// Canari · lien avec les contacts du téléphone.
// Chargé avant app.js ; initContacts() est lancé au démarrage.
//
// Une page web installée ne peut pas écrire directement dans les contacts d'Android.
// Canari prépare donc une fiche contact (fichier .vcf) : le téléphone l'ouvre dans
// l'application Contacts, déjà remplie, et il suffit d'appuyer sur « Enregistrer ».
// Dans l'autre sens, le sélecteur de contacts de Chrome permet de choisir un client
// dans le répertoire du téléphone (si le téléphone le permet).

function numeroInternational(tel) {
  const d = normaliserTel(tel);
  return d.length === 10 ? "+225" + d : (d ? "+" + d : "");
}
function nettoyerVcard(texte) {
  return String(texte).replace(/[\\;,]/g, function (c) { return "\\" + c; }).replace(/\n/g, " ");
}
function vcard(c) {
  const b = donnees.boutique;
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:;" + nettoyerVcard(c.nom) + ";;;",
    "FN:" + nettoyerVcard(c.nom),
    "TEL;TYPE=CELL:" + numeroInternational(c.tel),
    "NOTE:" + nettoyerVcard((c.role || "Client") + (b.nom ? " de " + b.nom : "") + " (Canari)"),
    "END:VCARD"
  ].join("\r\n");
}

// Donne la fiche (ou les fiches) au téléphone, qui propose de l'ajouter aux contacts.
function ajouterAuxContacts(clients) {
  const liste = clients.filter(function (c) { return c && c.tel; });
  if (!liste.length) { message("Aucun client avec un numéro pour l'instant."); return; }
  const nom = liste.length === 1
    ? "contact-" + liste[0].nom.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") + ".vcf"
    : "clients-canari.vcf";
  const fichier = new File([liste.map(vcard).join("\r\n") + "\r\n"], nom, { type: "text/vcard" });
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(fichier);
  lien.download = fichier.name;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(function () { URL.revokeObjectURL(lien.href); }, 10000);
  message(liste.length === 1
    ? "Ouvre le fichier téléchargé, puis appuie sur « Enregistrer » pour ajouter " + liste[0].nom + " à tes contacts."
    : "Ouvre le fichier téléchargé : tes " + liste.length + " clients s'ajouteront à tes contacts.", null, true);
}

function tousLesClients() {
  return Object.keys(donnees.clients).map(function (tel) { return donnees.clients[tel]; })
    .filter(function (c) { return c.tel && c.nom; });
}

// Choisir un client dans les contacts du téléphone (Chrome sur Android).
function contactsDisponibles() {
  return "contacts" in navigator && "ContactsManager" in window && typeof navigator.contacts.select === "function";
}
function choisirDansContacts() {
  navigator.contacts.select(["name", "tel"], { multiple: false }).then(function (resultat) {
    const c = resultat && resultat[0];
    if (!c) return;
    const tel = normaliserTel((c.tel || [])[0] || "");
    if (tel) $("tel").value = afficherTel(tel);
    const nom = ((c.name || [])[0] || "").trim();
    reconnaitreClient(); // un client déjà connu garde le nom de Canari
    if (nom && $("client-reconnu").hidden) $("client").value = nom;
    afficherSuggestions();
    $("erreur").hidden = true;
  }).catch(function () { /* fenêtre fermée ou refusée */ });
}

function initContacts() {
  $("choisir-contact").hidden = !contactsDisponibles();
  $("choisir-contact").addEventListener("click", choisirDansContacts);
  $("contacts-tous").addEventListener("click", function () { ajouterAuxContacts(tousLesClients()); });
  $("fiche-contacts").addEventListener("click", function () {
    const tel = normaliserTel($("fiche-tel").value);
    const nom = $("fiche-nom").value.trim();
    if (tel.length < 8 || !nom) { message("Écris d'abord le nom et le numéro."); return; }
    ajouterAuxContacts([{ tel: tel, nom: nom, role: sorteFiche === "fournisseur" ? "Fournisseur" : "Client" }]);
  });
}

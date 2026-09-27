// Anglais : textes de la zone « extras » (voir i18n.js).
// paiements.js (paiement mobile), facture.js (factures et reçus dessinés),
// contacts.js (fiches contact), abonnement.js (essai gratuit, abonnement).

Object.assign(EN, {
  /* ---------- Paiement mobile ---------- */
  "Espèces": "Cash",
  "Wave": "Wave",
  "Orange Money": "Orange Money",
  "MTN MoMo": "MTN MoMo",
  "Moov Money (Flooz)": "Moov Money (Flooz)",
  "Djamo": "Djamo",
  "Argent reçu en…": "Money received by…",
  "Payé avec…": "Paid with…",
  "J'accepte": "I accept",
  "Je n'accepte pas": "I don't accept",
  "Numéro qui reçoit l'argent": "Number that receives the money",
  "Lien de paiement Wave (facultatif)": "Wave payment link (optional)",
  "Lien de paiement Wave": "Wave payment link",
  "Paiements mobiles enregistrés. Ils seront sur tes factures et tes relances.": "Mobile money saved. It will be on your invoices and reminders.",
  "Paiements mobiles enregistrés.": "Mobile money saved.",

  /* ---------- Factures et reçus (écran) ---------- */
  "Astuce : ajoute le nom et le logo de ta boutique dans Réglages ⚙.": "Tip: add your shop's name and logo in Settings ⚙.",
  "Image enregistrée dans « Téléchargements ».": "Image saved in “Downloads”.",
  "Image enregistrée. Envoie-la depuis WhatsApp (trombone, puis Galerie).": "Image saved. Send it from WhatsApp (paper clip, then Gallery).",

  /* ---------- Factures et reçus (image dessinée) ---------- */
  "FACTURE": "INVOICE",
  "REÇU D'ACOMPTE": "PART-PAYMENT RECEIPT",
  "REÇU DE PAIEMENT": "PAYMENT RECEIPT",
  "Ma boutique": "My shop",
  "Désignation": "Item",
  "Qté": "Qty",
  "Prix": "Price",
  "Total": "Total",
  "TOTAL": "TOTAL",
  "Payé": "Paid",
  "Reste à payer": "Balance due",
  "Déjà payé": "Already paid",
  "Montant dû avant ce paiement": "Owed before this payment",
  "Payé aujourd'hui": "Paid today",
  "PAYÉ": "PAID",
  "Pour payer le reste :": "To pay the balance:",
  "Paiement accepté :": "Payment accepted:",
  "Merci et à bientôt !": "Thank you, see you soon!",
  "Articles divers": "Various items",
  "recu-": "receipt-",
  "facture-": "invoice-",

  /* ---------- Contacts ---------- */
  "clients-canari.vcf": "customers-canari.vcf",
  "Aucun client avec un numéro pour l'instant.": "No customer with a number yet.",
  "Écris d'abord le nom et le numéro.": "Write the name and number first.",

  /* ---------- Abonnement ---------- */
  "1 mois": "1 month",
  "3 mois": "3 months",
  "1 an": "1 year",
  "Environ 35 F par jour": "About 35 F a day",
  "Tu économises 500 F": "You save 500 F",
  "3 mois offerts": "3 months free",
  "Conseillé": "Best choice",
  "Payer par lien": "Pay by link",
  "Pour noter de nouvelles ventes et dépenses, prends un abonnement. Tes chiffres, tes crédits, tes relances et ta sauvegarde restent disponibles.":
    "To record new sales and expenses, take a subscription. Your figures, credits, reminders and backup stay available.",
  "Ce code n'est pas complet. Copie tout le message reçu, puis colle-le ici.": "This code is not complete. Copy the whole message you received, then paste it here.",
  "Ce code a déjà été utilisé sur ce téléphone.": "This code was already used on this phone.",
  "Les abonnements ne sont pas encore ouverts. Réessaie après la prochaine mise à jour.": "Subscriptions are not open yet. Try again after the next update.",
  "Ce code n'est pas valable. Vérifie que tu l'as copié en entier.": "This code is not valid. Check that you copied all of it.",
  "J'ai payé par (QR Djamo, Wave, Orange Money, MTN, Moov ou carte Visa) :": "I paid with (Djamo QR, Wave, Orange Money, MTN, Moov or Visa card):"
});

// Unités sur les factures (« 2,5 kg », « 3 sacs », « 600/kg »).
const UNITES_EN_EXTRAS = {
  "unité": "unit", "unités": "units", "kg": "kg", "g": "g", "litre": "litre", "litres": "litres",
  "cl": "cl", "mètre": "metre", "mètres": "metres", "sac": "bag", "sacs": "bags",
  "carton": "carton", "cartons": "cartons", "paquet": "pack", "paquets": "packs",
  "sachet": "sachet", "sachets": "sachets", "boîte": "box", "boîtes": "boxes",
  "bouteille": "bottle", "bouteilles": "bottles", "bidon": "jerrycan", "bidons": "jerrycans",
  "botte": "bunch", "bottes": "bunches", "plat": "plate", "plats": "plates",
  "prestation": "service", "prestations": "services", "forfait": "flat rate", "forfaits": "flat rates"
};
const MOTIF_UNITES_EXTRAS = "unités?|kg|g|litres?|cl|mètres?|sacs?|cartons?|paquets?|sachets?|boîtes?|bouteilles?|bidons?|tas|bottes?|plats?|prestations?|forfaits?";
function uniteEnExtras(u, pluriel) {
  if (u === "tas") return pluriel ? "heaps" : "heap";
  return UNITES_EN_EXTRAS[u] || u;
}
function joursEnExtras(n) { return n + (Number(n) <= 1 ? " day" : " days"); }
const COMPTES_EXTRAS = "Wave|Orange Money|MTN MoMo|Moov Money \\(Flooz\\)|Djamo";

EN_MOTIFS.push(
  /* ---------- Paiement mobile ---------- */
  // Lignes « Wave : 07 11 22 33 44 (lien) » (factures et relances)
  [new RegExp("^(" + COMPTES_EXTRAS + ") : (.+)$"), "$1: $2"],
  [new RegExp("^(" + COMPTES_EXTRAS + ") (\\(https?:.+\\))$"), "$1 $2"],
  [new RegExp("^Numéro (" + COMPTES_EXTRAS + ")$"), "$1 number"],
  [new RegExp("^Écris le numéro (" + COMPTES_EXTRAS + ") qui reçoit l'argent\\.$"), "Write the $1 number that receives the money."],

  /* ---------- Factures et reçus ---------- */
  [/^Reçu (R-\d+)$/, "Receipt $1"],
  [/^Facture (F-\d+)$/, "Invoice $1"],
  [/^Choisis WhatsApp, puis (.+)\.$/, function (m, q) { return "Choose WhatsApp, then " + (q === "le client" ? "the customer" : q) + "."; }],
  [/^Tél\. (.+)$/, "Tel. $1"],
  [/^RCCM : (.+)$/, "RCCM: $1"],
  [/^DFE \/ NCC : (.+)$/, "DFE / NCC: $1"],
  [/^Client : (.+)$/, "Customer: $1"],
  // Quantité et prix par unité
  [new RegExp("^(−? ?[\\d ]+(?:,\\d+)?) (" + MOTIF_UNITES_EXTRAS + ")$"), function (m, q, u) {
    return q + " " + uniteEnExtras(u, !/^−? ?1$/.test(q));
  }],
  [new RegExp("^([\\d ]+)/(" + MOTIF_UNITES_EXTRAS + ")$"), function (m, p, u) { return p + "/" + uniteEnExtras(u, false); }],

  /* ---------- Contacts ---------- */
  [/^(Client|Fournisseur) de (.+) \(Canari\)$/, function (m, r, b) { return (r === "Client" ? "Customer" : "Supplier") + " of " + b + " (Canari)"; }],
  [/^(Client|Fournisseur) \(Canari\)$/, function (m, r) { return (r === "Client" ? "Customer" : "Supplier") + " (Canari)"; }],
  [/^Ouvre le fichier téléchargé, puis appuie sur « Enregistrer » pour ajouter (.+) à tes contacts\.$/, "Open the downloaded file, then tap “Save” to add $1 to your contacts."],
  [/^Ouvre le fichier téléchargé : tes (\d+) clients s'ajouteront à tes contacts\.$/, "Open the downloaded file: your $1 customers will be added to your contacts."],

  /* ---------- Abonnement ---------- */
  [/^Abonnement actif jusqu'au (.+) \((\d+) jours?\)\.$/, function (m, d, n) { return "Subscription active until " + d + " (" + joursEnExtras(n) + ")."; }],
  [/^Essai gratuit : encore (\d+) jours?, jusqu'au (.+)\.$/, function (m, n, d) { return "Free trial: " + joursEnExtras(n) + " left, until " + d + "."; }],
  [/^Ton (abonnement|essai gratuit) est fini depuis le (.+)\.$/, function (m, q, d) { return "Your " + (q === "abonnement" ? "subscription" : "free trial") + " ended on " + d + "."; }],
  [/^Ton (abonnement|essai gratuit) est fini\. Tes chiffres sont gardés\.$/, function (m, q) { return "Your " + (q === "abonnement" ? "subscription" : "free trial") + " has ended. Your figures are kept."; }],
  [/^Ton (abonnement|essai gratuit) finit dans (\d+) jours?\.$/, function (m, q, n) { return "Your " + (q === "abonnement" ? "subscription" : "free trial") + " ends in " + joursEnExtras(n) + "."; }],
  [/^Ce code est pour un autre téléphone \(numéro Canari (.+)\)\. Le tien est (.+)\.$/, "This code is for another phone (Canari number $1). Yours is $2."],
  [/^Merci ! ((?:Abonnement|Essai|Ton) .+)$/, function (m, reste) { return "Thank you! " + tr(reste); }],
  [/^[A-Z2-9]{4}-[A-Z2-9]{4}$/, "$&"], // numéro Canari affiché (pas du français)
  [/^Numéro Canari copié : (.+)$/, "Canari number copied: $1"],
  // Message WhatsApp de demande d'abonnement
  [/^Bonjour Canari, je veux l'abonnement (.+) \((.+ F)\)\.$/, function (m, f, p) { return "Hello Canari, I want the " + tr(f) + " subscription (" + p + ")."; }],
  [/^Mon numéro Canari : (.+)$/, "My Canari number: $1"],
  [/^Boutique : (.+)$/, "Shop: $1"]
);

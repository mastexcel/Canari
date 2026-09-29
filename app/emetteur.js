// Canari · l'entreprise qui édite l'application et qui émet les factures
// d'abonnement. Ce fichier est chargé par l'appli (facture-abo.js) ET par la
// page privée du propriétaire (gerant.html) : les deux écrivent la même facture,
// il ne doit donc exister qu'un seul endroit où ces informations sont écrites.
//
// À COMPLÉTER par le propriétaire avant le lancement : sans le RCCM et le numéro
// de contribuable, la facture n'a pas de valeur administrative en Côte d'Ivoire.
const EMETTEUR = {
  nom: "Bridge Investment & Partners",
  produit: "Canari",
  logo: "icones/bip.webp",
  adresse: "",     // ex. « Cocody Riviera, Abidjan »
  tel: "",         // ex. « 0584374848 »
  email: "",       // ex. « contact@bip.ci »
  rccm: "",        // N° du Registre du commerce
  dfe: "",         // N° de DFE / compte contribuable (NCC)
  tva: ""          // ex. « TVA non applicable, article 355 du CGI » — vide si rien à dire
};

// Canari · l'entreprise qui édite l'application et qui émet les factures
// d'abonnement. Ce fichier est chargé par l'appli (facture-abo.js) ET par la
// page privée du propriétaire (gerant.html) : les deux écrivent la même facture,
// il ne doit donc exister qu'un seul endroit où ces informations sont écrites.
//
// Les valeurs viennent des documents fournis par le propriétaire le 29/09/2026 :
// sa déclaration fiscale d'existence (Direction générale des impôts) et son
// registre du commerce. En Côte d'Ivoire, une facture doit porter la
// dénomination sociale, la forme juridique, le capital, le siège, le numéro du
// registre du commerce et le numéro de compte contribuable.
const EMETTEUR = {
  nom: "Bridge Investment & Partners",
  // Dénomination au registre du commerce : « BRIDGE INVESTMENT PARTNERS », SARL.
  forme: "SARL au capital de 3 000 000 F CFA",
  produit: "Canari",
  logo: "icones/bip.webp",
  adresse: "Cocody Riviera Faya, Abidjan",
  tel: "0748346650",              // le fixe est le 25 22 02 01 80
  email: "",                      // À CONFIRMER : illisible sur la déclaration manuscrite
  rccm: "CI-ABJ-03-2022-B12-00279",
  dfe: "2205980 D",               // compte contribuable (à revérifier sur le document)
  // La TVA n'est pas cochée parmi les obligations fiscales de la déclaration
  // (régime « IM »). La phrase exacte doit venir du comptable : elle engage la
  // responsabilité fiscale de l'entreprise, Canari ne l'invente pas.
  tva: ""
};

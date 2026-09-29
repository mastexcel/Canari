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
  // Dénomination exacte du registre du commerce, choisie par le propriétaire
  // le 29/09/2026 : c'est elle qui engage l'entreprise sur une facture. Le logo,
  // lui, porte un « & » : c'est une image, elle n'est pas retouchée.
  nom: "Bridge Investment Partners",
  forme: "SARL au capital de 3 000 000 F CFA",
  produit: "Canari",
  logo: "icones/bip.webp",
  adresse: "Cocody Riviera Faya, Abidjan",
  tel: "0748346650",              // le fixe est le 25 22 02 01 80
  email: "jja@bridgeinvestmentpartners.net",
  rccm: "CI-ABJ-03-2022-B12-00279",
  dfe: "2205980 D",               // compte contribuable (à revérifier sur le document)
  // La TVA n'est pas cochée parmi les obligations fiscales de la déclaration
  // (régime « IM »). Phrase donnée par le propriétaire le 29/09/2026.
  tva: "TVA non applicable"
};

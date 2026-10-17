/* Canari · anglais des entreprises multiples (entreprises.js) et des nouvelles
   formules d'abonnement (abonnement.js). */

Object.assign(EN, {
  /* --- L'écran et la liste --- */
  "Mes entreprises": "My businesses",
  "Tu peux tenir plusieurs entreprises sur le même téléphone, chacune avec ses propres chiffres, et passer de l'une à l'autre quand tu veux.":
    "You can keep several businesses on the same phone, each with its own figures, and switch between them whenever you like.",
  "Chaque entreprise a ses propres ventes, ses clients, ses produits et ses chiffres. Rien ne se mélange. L'abonnement, lui, est le même pour tout le téléphone.":
    "Each business has its own sales, customers, products and figures. Nothing gets mixed up. The subscription, though, is the same for the whole phone.",
  "Ajouter une entreprise": "Add a business",
  "Entreprise sans nom": "Business with no name",
  "Ouverte en ce moment": "Open right now",
  "Touche pour travailler dedans": "Tap to work in it",
  "Renommer": "Rename",
  "Supprimer": "Delete",
  "Voir les formules": "See the plans",
  "1 entreprise sur ce téléphone.": "1 business on this phone.",
  "Ta formule te donne droit à une seule entreprise. Pour en ajouter, prends une formule qui en permet plusieurs.":
    "Your plan allows one business only. To add more, take a plan that allows several.",
  "Le nom de ta nouvelle entreprise :": "The name of your new business:",
  "Le nom de cette entreprise :": "This business's name:",
  "Tu travailles maintenant dans": "You are now working in",
  "est supprimée.": "has been deleted.",
  "Dernière question : es-tu sûr ? On ne peut pas revenir en arrière.":
    "Last question: are you sure? There is no going back.",
  "Si tu n'as pas fait de sauvegarde, touche Annuler et fais-la d'abord.":
    "If you have not made a backup, tap Cancel and make one first.",

  /* --- L'abonnement : les formules --- */
  "Combien d'entreprises ?": "How many businesses?",
  "Pour combien de temps ?": "For how long?",
  "Solo": "Solo",
  "Multi": "Multi",
  "Pro": "Pro",
  "Une seule entreprise": "One business only",
  "Jusqu'à 3 entreprises": "Up to 3 businesses",
  "Jusqu'à 10 entreprises": "Up to 10 businesses",
  "Une entreprise sur ce téléphone.": "One business on this phone.",
  "1 mois": "1 month",
  "3 mois": "3 months",
  "1 an": "1 year",
  "1. Combien d'entreprises ?": "1. How many businesses?",
  "2. Pour combien de temps ?": "2. For how long?",
  "3. Paie": "3. Pay",
  "4. Ton e-mail (pour recevoir ta facture)": "4. Your e-mail (to receive your invoice)",
  "5. Envoie ta demande": "5. Send your request",
  "6. Ton code d'activation": "6. Your activation code",

  /* --- La sauvegarde --- */
  "Ce qui est noté sur ce téléphone sera remplacé.": "What is recorded on this phone will be replaced.",
  "Seule l'entreprise ouverte en ce moment est touchée.": "Only the business open right now is affected.",
  "La récupération a échoué. Rien n'a été changé.": "The restore failed. Nothing was changed.",

  /* --- La page du propriétaire (gerant.html) --- */
  "Combien d'entreprises ce code permet": "How many businesses this code allows",
  "Rempli tout seul par la formule choisie. 1 = une seule entreprise, comme tous les codes d'avant.":
    "Filled in by the plan you choose. 1 = one business only, like every earlier code."
});

EN_MOTIFS.push(
  [/^(\d+) entreprises sur ce téléphone\.$/, "$1 businesses on this phone."],
  [/^Jusqu'à (\d+) entreprises sur ce téléphone\.$/, "Up to $1 businesses on this phone."],
  [/^Ta formule te donne droit à (\d+) entreprises, et tu les as toutes\.$/,
    "Your plan allows $1 businesses, and you have them all."],
  [/^Tu travailles maintenant dans (.+)\.$/, "You are now working in $1."],
  [/^(.+) est supprimée\.$/, "$1 has been deleted."],
  [/^Supprimer (.+) \? Toutes ses ventes, ses clients et ses produits seront perdus\.$/,
    "Delete $1? All its sales, customers and products will be lost."],
  [/^Cette sauvegarde contient (\d+) entreprises\.$/, "This backup holds $1 businesses."],
  [/^Les (\d+) entreprises de ce téléphone seront remplacées\.$/,
    "The $1 businesses on this phone will be replaced."],
  [/^Sauvegarde récupérée : (\d+) entreprises\.$/, "Backup restored: $1 businesses."],
  [/^Solo (1 mois|3 mois|1 an)$/, "Solo $1"],
  [/^Multi (1 mois|3 mois|1 an)$/, "Multi $1"],
  [/^Pro (1 mois|3 mois|1 an)$/, "Pro $1"],
  [/^3 mois offerts, (.+) chaque mois$/, "3 months free, $1 a month"],
  [/^(.+) par jour$/, "$1 a day"],
  [/^Tu économises (.+)$/, "You save $1"],
  [/^Bonjour Canari, je veux l'abonnement (.+) \((.+)\)\.$/,
    "Hello Canari, I would like the $1 subscription ($2)."]
);

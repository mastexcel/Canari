/* Canari · anglais des comptes annuels (comptes.js).
   Textes exacts dans EN, textes avec des chiffres dans EN_MOTIFS.
   Les montants sont écrits « 12 500 F » des deux côtés : tr() les ramène à
   cette écriture avant de chercher, puis remet la monnaie de la boutique. */

Object.assign(EN, {
  /* --- L'écran et ses choix --- */
  "Comptes annuels": "Yearly accounts",
  "Tes comptes annuels": "Your yearly accounts",
  "Le bilan, le compte de résultat et ce qu'ils disent de ta boutique.":
    "The balance sheet, the profit and loss account, and what they say about your shop.",
  "Une année": "One year",
  "Plusieurs années": "Several years",
  "Ventes et bénéfice, année par année": "Sales and profit, year by year",
  "Combien tu as gagné": "How much you made",
  "On part des ventes et on enlève tout ce qui coûte, dans l'ordre.":
    "We start from sales and take away everything that costs, one by one.",
  "D'un côté ce que ta boutique possède, de l'autre à qui cela appartient.":
    "On one side what your shop owns, on the other who it belongs to.",
  "Télécharger en PDF": "Download as PDF",
  "Télécharger en Excel": "Download as Excel",

  /* --- Le compte de résultat --- */
  "Compte de résultat": "Profit and loss account",
  "En francs": "In francs",
  "Ventes de l'année": "Sales for the year",
  "Prix de revient de la marchandise": "Cost of the goods sold",
  "= Marge brute": "= Gross margin",
  "Autres dépenses": "Other expenses",
  "Charges fixes": "Fixed costs",
  "Usure du matériel": "Wear on equipment",
  "= Résultat avant impôts": "= Profit before tax",
  "Impôts et taxes": "Taxes and duties",
  "= Bénéfice net": "= Net profit",
  "Pris pour la maison": "Taken for the house",
  "= Reste pour la boutique": "= Left for the shop",
  "* Cette année n'est pas finie : elle ne couvre que les jours déjà passés.":
    "* This year is not over: it only covers the days already gone.",

  /* --- Le bilan --- */
  "Bilan": "Balance sheet",
  "Ce que la boutique possède": "What the shop owns",
  "Ce que ta boutique possède": "What your shop owns",
  "Argent en caisse et sur les comptes": "Cash in hand and on your accounts",
  "Marchandise en stock": "Goods in stock",
  "Ce que les clients me doivent": "What customers owe me",
  "Matériel (ce qu'il lui reste de valeur)": "Equipment (value it has left)",
  "Matériel (valeur restante)": "Equipment (remaining value)",
  "= Total": "= Total",
  "= Total de ce que la boutique possède": "= Total of what the shop owns",
  "À qui tout cela appartient": "Who all this belongs to",
  "À qui c'est": "Who it belongs to",
  "Ce que je dois à mes fournisseurs": "What I owe my suppliers",
  "Ce qui m'appartient vraiment": "What is really mine",
  "Caisse": "Cash",
  "Marchandise": "Goods",
  "On me doit": "Owed to me",
  "Matériel": "Equipment",
  "À mes fournisseurs": "To my suppliers",
  "À moi": "Mine",
  "Ventes": "Sales",
  "Bénéfice net": "Net profit",
  "Marge brute": "Gross margin",
  "Avant impôts": "Before tax",

  /* --- Les familles de ratios --- */
  "Ce que ça rapporte": "What it brings in",
  "Ces chiffres disent si ton travail paie.": "These figures say whether your work pays.",
  "Comment l'argent circule": "How the money moves",
  "Ces chiffres disent où ton argent est bloqué.": "These figures say where your money is stuck.",
  "La solidité de ta boutique": "How solid your shop is",
  "Ces chiffres disent si tu peux encaisser un coup dur.": "These figures say whether you can take a hard knock.",

  /* --- Les noms des ratios --- */
  "Taux de marge brute": "Gross margin rate",
  "Taux de bénéfice net": "Net profit rate",
  "Poids des charges et taxes": "Weight of costs and taxes",
  "Croissance des ventes": "Sales growth",
  "Marchandise qui dort": "Goods sitting still",
  "Délai de paiement des clients": "How long customers take to pay",
  "Délai de paiement à tes fournisseurs": "How long you take to pay suppliers",
  "Argent immobilisé": "Money tied up",
  "Combien de temps tu tiens sans vendre": "How long you last without selling",
  "Ce que rapporte ton argent": "What your money brings in",
  "Ventes minimum pour ne rien perdre": "Minimum sales to lose nothing",
  "Ce qui t'appartient vraiment": "What is really yours",
  "Une année ou plusieurs": "One year or several",
  "Année regardée": "Year shown",

  /* --- Les lectures sans chiffre --- */
  "Pas encore de vente cette année.": "No sales yet this year.",
  "Pas encore assez de ventes pour le calculer.": "Not enough sales yet to work it out.",
  "Pas encore assez de charges notées pour le calculer.": "Not enough costs recorded yet to work it out.",
  "Pas encore assez de chiffres pour le calculer.": "Not enough figures yet to work it out.",
  "Pas encore de quoi faire un bilan.": "Not enough yet for a balance sheet.",
  "Pas encore de quoi le calculer.": "Not enough yet to work it out.",
  "Tu dois plus que ce que vaut ta boutique.": "You owe more than your shop is worth.",
  "Vérifie l'argent que tu avais au départ dans Réglages → Argent en caisse.":
    "Check the money you started with in Settings → Cash in hand.",
  "Compte l'argent que tu as vraiment et écris-le dans Réglages → Argent en caisse. Souvent, il manque juste l'argent du départ.":
    "Count the money you really have and write it in Settings → Cash in hand. Often the starting money is simply missing.",
  "Ton stock et tes créances, moins ce que tu dois.": "Your stock and what you are owed, minus what you owe.",

  /* --- Les conseils des ratios --- */
  "Note tes ventes : la marge se calcule toute seule.": "Record your sales: the margin works itself out.",
  "Garde cette marge : c'est elle qui paie tes charges.": "Keep this margin: it is what pays your costs.",
  "Regarde tes trois plus gros produits : un seul mal acheté suffit à faire baisser toute la marge.":
    "Look at your three biggest products: one badly bought is enough to pull the whole margin down.",
  "Ta marge est trop faible. Soit tu achètes trop cher, soit tu vends trop bas. Compare tes prix d'achat chez deux fournisseurs.":
    "Your margin is too thin. Either you buy too dear or you sell too cheap. Compare your buying prices at two suppliers.",
  "C'est une bonne année. Mets de côté de quoi tenir un mois sans vendre.":
    "This is a good year. Put aside enough to last a month without selling.",
  "Ça tient, mais de peu. Regarde la ligne la plus grosse de tes dépenses.":
    "It holds, but only just. Look at the biggest line in your expenses.",
  "Tu travailles presque pour rien. Il faut soit vendre plus, soit baisser une charge, soit augmenter tes prix.":
    "You are working for almost nothing. You must sell more, cut a cost, or raise your prices.",
  "Tes charges sont tenues. C'est ce qui te permet de résister à un mois creux.":
    "Your costs are under control. That is what lets you ride out a slow month.",
  "Liste tes charges et demande-toi, pour chacune : qu'est-ce qui se passe si je l'arrête ?":
    "List your costs and ask, for each one: what happens if I stop it?",
  "Tes charges sont trop lourdes pour ce que tu vends. Il faut vendre plus, ou en supprimer une.":
    "Your costs are too heavy for what you sell. You must sell more, or drop one.",
  "Ce qui marche, fais-en plus : regarde quel produit a porté cette hausse.":
    "Do more of what works: look at which product carried this rise.",
  "Tu fais du surplace. Essaie une nouveauté sur un petit stock avant d'en acheter beaucoup.":
    "You are standing still. Try something new on a small stock before buying a lot of it.",
  "Tes ventes baissent. Appelle tes dix meilleurs clients : ils te diront pourquoi mieux que n'importe quel calcul.":
    "Your sales are falling. Call your ten best customers: they will tell you why better than any calculation.",
  "Ton stock tourne bien : ton argent ne dort pas sur les étagères.":
    "Your stock turns well: your money is not sleeping on the shelves.",
  "Repère les produits qui ne bougent pas depuis deux mois et solde-les.":
    "Spot the products that have not moved for two months and sell them off.",
  "Beaucoup d'argent dort en marchandise. Chaque sac qui attend, c'est de l'argent que tu ne peux pas utiliser.":
    "A lot of money is sleeping in goods. Every bag that waits is money you cannot use.",
  "Tes clients paient vite. Continue de noter chaque crédit le jour même.":
    "Your customers pay quickly. Keep recording every credit the same day.",
  "Ouvre l'onglet Relances une fois par semaine : la moitié du retard vient de l'oubli.":
    "Open the Reminders tab once a week: half of the delay comes from forgetting.",
  "Tu fais crédit à la place de ta banque. Relance, et demande un acompte sur les gros achats.":
    "You are lending instead of your bank. Chase them up, and ask for a deposit on big purchases.",
  "Tu paies tes fournisseurs plus vite que tes clients ne te paient : c'est toi qui avances l'argent.":
    "You pay your suppliers faster than your customers pay you: you are the one fronting the money.",
  "Tu paies tes fournisseurs moins vite que tes clients ne te paient : c'est confortable, mais tiens tes promesses.":
    "You pay your suppliers slower than your customers pay you: that is comfortable, but keep your promises.",
  "C'est l'argent que ton activité retient en permanence. Plus il est petit, plus tu es libre.":
    "This is the money your business holds on to all the time. The smaller it is, the freer you are.",
  "Tu as de quoi voir venir. Garde ce matelas, ne le dépense pas en stock.":
    "You have enough to see things coming. Keep this cushion, do not spend it on stock.",
  "Un mois creux et tu es serré. Vise un mois de charges d'avance.":
    "One slow month and you are tight. Aim for one month of costs ahead.",
  "Tu es sur le fil. Avant tout nouvel achat, mets de côté une semaine de charges.":
    "You are on the edge. Before any new purchase, set aside a week of costs.",
  "Ta boutique t'appartient. C'est ce qui te permet de refuser un mauvais crédit.":
    "Your shop is yours. That is what lets you turn down a bad credit.",
  "Rembourse une dette fournisseur avant d'en prendre une nouvelle.":
    "Pay off one supplier debt before taking on a new one.",
  "Tu travailles surtout avec l'argent des autres. Un fournisseur qui réclame, et tout s'arrête.":
    "You are working mostly with other people's money. One supplier asking, and everything stops.",
  "Ta boutique rapporte bien. C'est là qu'il faut remettre ton argent.":
    "Your shop pays well. That is where you should put your money back.",
  "C'est correct. Un produit à meilleure marge ferait monter ce chiffre sans travailler plus.":
    "That is fair. A product with a better margin would lift this figure without more work.",
  "Ton argent dort. Regarde ce qui l'immobilise : du stock qui ne part pas, ou des clients qui ne paient pas.":
    "Your money is asleep. Look at what is holding it: stock that will not move, or customers who will not pay.",
  "Tout ce que tu vends au-dessus de ce seuil est du bénéfice. Chaque vente compte double.":
    "Everything you sell above this line is profit. Every sale counts double.",
  "Divise ce chiffre par tes jours de travail : c'est ce qu'il faut faire chaque jour.":
    "Divide this figure by your working days: that is what you must do each day.",

  /* --- L'analyse --- */
  "L'analyse de ton année": "Your year, explained",
  "Ton activité": "Your activity",
  "Ce que tu gagnes vraiment": "What you really earn",
  "Ce que vaut ta boutique": "What your shop is worth",
  "Comment ton argent circule": "How your money moves",
  "Attention : l'année n'est pas finie, ces chiffres vont encore bouger.":
    "Careful: the year is not over, these figures will still move.",
  "Tu ne dois rien à tes fournisseurs.": "You owe your suppliers nothing.",
  "C'est peu : la plus grande partie de ta boutique est encore payée par tes fournisseurs.":
    "That is little: most of your shop is still paid for by your suppliers.",
  "C'est pendant tout ce temps que ton argent est bloqué.":
    "It is during all that time that your money is stuck.",

  /* --- Les conseils --- */
  "Des conseils indicatifs, tirés de tes chiffres. Ils ne remplacent pas un comptable.":
    "Guidance drawn from your own figures. It does not replace an accountant.",
  "L'argent de la maison": "The household money",
  "Tu prends pour la maison plus que la boutique ne gagne. À ce rythme, la boutique rétrécit chaque mois.":
    "You take more for the house than the shop earns. At this rate, the shop shrinks every month.",
  "Investir": "Investing",
  "Tu n'as pas encore de matériel. Un congélateur, une vitrine ou une moto peut faire grandir tes ventes plus vite qu'un stock de plus.":
    "You have no equipment yet. A freezer, a display case or a motorbike can grow your sales faster than more stock.",

  /* --- Ce que Canari sait et ne sait pas --- */
  "Ce que Canari sait, et ne sait pas": "What Canari knows, and does not know",
  "Les charges fixes et les taxes d'une année passée sont réparties avec les montants que tu as réglés aujourd'hui : Canari ne garde pas l'historique de tes réglages.":
    "Fixed costs and taxes for a past year are spread using the amounts set today: Canari keeps no history of your settings.",
  "Ta marchandise en stock est comptée au prix d'achat moyen d'aujourd'hui.":
    "Your goods in stock are counted at today's average buying price.",
  "L'argent en caisse part de ce que tu as déclaré dans Réglages → Argent en caisse.":
    "Cash in hand starts from what you declared in Settings → Cash in hand.",
  "Ce sont des comptes de gestion, faits pour décider. Pour les impôts ou une banque, fais-les vérifier par un comptable.":
    "These are management accounts, made for deciding. For the tax office or a bank, have an accountant check them.",

  /* --- L'écran vide et les fichiers --- */
  "Année": "Year",
  "Établi avec Canari": "Drawn up with Canari",
  "Ratios": "Ratios",
  "Analyse et conseils": "Analysis and advice",
  "Indicateur": "Indicator",
  "Valeur": "Value",
  "Ce que ça veut dire": "What it means",
  "Ce qu'il faut faire": "What to do",
  "Partie": "Part",
  "Phrase": "Sentence",
  "Le fichier n'a pas pu être fabriqué. Réessaie.": "The file could not be made. Try again."
});

EN_MOTIFS.push(
  /* --- Les lectures chiffrées des ratios --- */
  [/^Sur (.+) vendus, il te reste (.+) après avoir payé la marchandise\.$/,
    "Out of $1 sold, $2 is left after paying for the goods."],
  [/^Sur (.+) vendus, il te reste vraiment (.+) à la fin\.$/,
    "Out of $1 sold, $2 is really left at the end."],
  [/^Cette année, tu perds (.+) sur (.+) vendus\.$/,
    "This year you lose $1 on every $2 sold."],
  [/^Tes charges fixes, tes taxes et l'usure du matériel mangent (\d+) % de tes ventes\.$/,
    "Your fixed costs, taxes and equipment wear eat $1 % of your sales."],
  [/^Tu vends (\d+) % de plus qu'en (\d{4})\.$/, "You are selling $1 % more than in $2."],
  [/^Tu vends (\d+) % de moins qu'en (\d{4})\.$/, "You are selling $1 % less than in $2."],
  [/^À la même date l'an dernier, la comparaison est honnête\. Tu vends (\d+) % de plus qu'en (\d{4})\.$/,
    "Measured to the same date last year, so the comparison is fair. You are selling $1 % more than in $2."],
  [/^À la même date l'an dernier, la comparaison est honnête\. Tu vends (\d+) % de moins qu'en (\d{4})\.$/,
    "Measured to the same date last year, so the comparison is fair. You are selling $1 % less than in $2."],
  [/^Ton stock représente (.+) de ventes\.$/, "Your stock is worth $1 of sales."],
  [/^Tes clients mettent en moyenne (.+) à te payer\.$/, "Your customers take $1 on average to pay you."],
  [/^Tu mets en moyenne (.+) à payer tes fournisseurs\.$/, "You take $1 on average to pay your suppliers."],
  [/^Ton stock et ce qu'on te doit, moins ce que tu dois, font (.+) de ventes\.$/,
    "Your stock and what you are owed, minus what you owe, come to $1 of sales."],
  [/^Avec (.+) en caisse, tu tiens environ (.+) mois sans vendre\.$/,
    "With $1 in hand, you can last about $2 months without selling."],
  [/^Sur 100 F de valeur dans ta boutique, (\d+) F sont à toi, le reste est à tes fournisseurs\.$/,
    "Out of every 100 F of value in your shop, $1 F is yours, the rest belongs to your suppliers."],
  [/^Ton argent placé dans la boutique t'a fait perdre (\d+) % cette année\.$/,
    "The money you put into the shop lost you $1 % this year."],
  [/^Chaque 100 F que tu as mis dans ta boutique t'a rapporté (\d+) F cette année\.$/,
    "Every 100 F you put into your shop brought you back $1 F this year."],
  [/^Tu as vendu (.+), au-dessus des (.+) qu'il te fallait\.$/,
    "You sold $1, above the $2 you needed."],
  [/^Il te fallait vendre (.+) pour ne rien perdre\. Tu en es à (.+)\.$/,
    "You needed to sell $1 to lose nothing. You are at $2."],

  /* --- L'analyse --- */
  [/^En (\d{4}), tu as vendu pour (.+)\.$/, "In $1, you sold $2 worth."],
  [/^Tu as vendu (.+) dans l'année, soit (.+) par jour de vente en moyenne\.$/,
    "You sold on $1 in the year, that is $2 per selling day on average."],
  [/^Cela fait (.+), à (.+) en moyenne\.$/, "That makes $1, at $2 on average."],
  [/^C'est (.+) de plus qu'en (\d{4})\.$/, "That is $1 more than in $2."],
  [/^C'est (.+) de moins qu'en (\d{4})\.$/, "That is $1 less than in $2."],
  [/^C'est (.+) de plus qu'en (\d{4}) à la même date\.$/, "That is $1 more than in $2 at the same date."],
  [/^C'est (.+) de moins qu'en (\d{4}) à la même date\.$/, "That is $1 less than in $2 at the same date."],
  [/^Sur ces ventes, (.+) sont partis à crédit\.$/, "Of those sales, $1 went on credit."],
  [/^Tes ventes de (.+) t'ont coûté (.+) de marchandise\.$/, "Your $1 of sales cost you $2 in goods."],
  [/^Il te reste donc (.+) de marge brute\.$/, "That leaves you $1 of gross margin."],
  [/^Tes charges, tes taxes et l'usure du matériel ont pris (.+)\.$/,
    "Your costs, taxes and equipment wear took $1."],
  [/^Ton bénéfice net de l'année est de (.+)\.$/, "Your net profit for the year is $1."],
  [/^Ta perte de l'année est de (.+)\.$/, "Your loss for the year is $1."],
  [/^Tu as pris (.+) pour la maison\.$/, "You took $1 for the house."],
  [/^Il reste donc (.+) pour faire grandir la boutique\.$/, "That leaves $1 to grow the shop."],
  [/^Tu as pris (.+) de plus que ce que la boutique a gagné\.$/,
    "You took $1 more than the shop earned."],
  [/^Ton plus gros poste est (.+) : (.+), soit (\d+) % de tes ventes\.$/,
    "Your biggest item is $1: $2, that is $3 % of your sales."],
  [/^Ta boutique possède (.+) en tout\.$/, "Your shop owns $1 in all."],
  [/^C'est-à-dire (.+)\.$/, "That is $1."],
  [/^Tu dois (.+) à tes fournisseurs\.$/, "You owe $1 to your suppliers."],
  [/^Ce qui t'appartient vraiment, c'est donc (.+)\.$/, "What is really yours, then, is $1."],
  [/^Tes clients mettent (.+) à te payer\.$/, "Your customers take $1 to pay you."],
  [/^Ta marchandise reste (.+) en stock avant d'être vendue\.$/,
    "Your goods stay $1 in stock before being sold."],
  [/^Entre le jour où tu achètes et le jour où tu es payé, il se passe environ (.+)\.$/,
    "Between the day you buy and the day you are paid, about $1 go by."],
  [/^Avec ce que tu as en caisse, tu peux tenir (.+) mois sans vendre\.$/,
    "With what you have in hand, you can last $1 months without selling."],
  [/^Avec ce que tu as en caisse, tu ne tiens que (.+) mois sans vendre\.$/,
    "With what you have in hand, you only last $1 months without selling."],
  [/^Ta caisse est dans le rouge : il est sorti (.+) de plus qu'il n'est entré\.$/,
    "Your cash is in the red: $1 more went out than came in."],
  [/^Ta caisse est dans le rouge de (.+)\.$/, "Your cash is $1 in the red."],
  [/^Tu dois (.+) de plus que ce que vaut ta boutique\.$/,
    "You owe $1 more than your shop is worth."],

  /* --- Les morceaux de phrase du détail du bilan --- */
  [/^(.+) en caisse et sur tes comptes$/, "$1 in hand and on your accounts"],
  [/^(.+) de marchandise$/, "$1 of goods"],
  [/^(.+) que tes clients te doivent$/, "$1 your customers owe you"],
  [/^(.+) de matériel$/, "$1 of equipment"],

  /* --- L'en-tête des colonnes et l'écran vide --- */
  [/^31\/12\/(\d{4})$/, "31/12/$1"],
  [/^(\d+) années, de (\d{4}) à (\d{4})\.$/, "$1 years, from $2 to $3."],
  [/^Rien de noté en (\d{4})\.$/, "Nothing recorded in $1."],
  [/^Comptes annuels — (.+)$/, "Yearly accounts — $1"],
  [/^Année (.+) · Établi avec Canari$/, "Year $1 · Drawn up with Canari"],
  [/^Conseil — (.+)$/, "Advice — $1"],
  [/^([\d, ]+) mois$/, "$1 months"],
  [/^(Caisse|Marchandise|Matériel) : (.+)$/, "$1: $2"],
  [/^On me doit : (.+)$/, "Owed to me: $1"],
  [/^À mes fournisseurs : (.+)$/, "To my suppliers: $1"],
  [/^À moi : (.+)$/, "Mine: $1"]
);

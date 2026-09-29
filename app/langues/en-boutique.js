// Anglais : textes de la zone « boutique » (voir i18n.js).
// Fichiers : charges.js (questionnaire, charges, bilan du mois), fiches.js (types de produits,
// modèles de recettes, fiche de coût), intrants.js (stock des intrants), boutique.js (produits,
// unités, stock, arrivages, panier, boutique, logo).
(function () {
  /* ---------- Unités et quantités (« 2,5 kg », « 297 unités », « 1 forfait ») ---------- */

  // [français singulier, français pluriel, anglais singulier, anglais pluriel]
  const UNITES_EN = [
    ["unité", "unités", "unit", "units"], ["kg", "kg", "kg", "kg"], ["g", "g", "g", "g"],
    ["litre", "litres", "litre", "litres"], ["cl", "cl", "cl", "cl"], ["mètre", "mètres", "metre", "metres"],
    ["sac", "sacs", "bag", "bags"], ["carton", "cartons", "carton", "cartons"], ["paquet", "paquets", "pack", "packs"],
    ["sachet", "sachets", "sachet", "sachets"], ["boîte", "boîtes", "box", "boxes"],
    ["bouteille", "bouteilles", "bottle", "bottles"], ["bidon", "bidons", "jerrycan", "jerrycans"],
    ["tas", "tas", "heap", "heaps"], ["botte", "bottes", "bunch", "bunches"], ["plat", "plats", "plate", "plates"],
    ["prestation", "prestations", "service", "services"], ["forfait", "forfaits", "flat rate", "flat rates"]
  ];
  function chercherUnite(mot) {
    return UNITES_EN.find(function (u) { return u[0] === mot || u[1] === mot; });
  }
  // Mot d'unité seul : le pluriel français donne le pluriel anglais (ou forcé avec « pluriel »).
  function uniteEn(mot, pluriel) {
    const u = chercherUnite(mot);
    if (!u) return mot; // unité tapée à la main : gardée telle quelle
    if (pluriel === undefined) pluriel = mot === u[1] && u[0] !== u[1];
    return pluriel ? u[3] : u[2];
  }
  // « 1 234,5 » → « 1 234.5 »
  function nombreEn(s) { return s.replace(/,(\d)/g, ".$1"); }
  // Une quantité : « − 2,5 kg » → « − 2.5 kg », « 3 sacs » → « 3 bags », « 1 unité » → « 1 unit ».
  function qteEn(q) {
    const m = String(q).replace(/[  ]/g, " ").match(/^(\s*[+−-]?\s?)(\d[\d ]*(?:,\d+)?) (.+?)(\s*)$/);
    if (!m) return tr(q);
    const n = parseFloat(m[2].replace(/ /g, "").replace(",", "."));
    const u = chercherUnite(m[3]);
    const mot = u ? (Math.abs(n) === 1 ? u[2] : u[3]) : m[3];
    return m[1] + nombreEn(m[2]) + "\u00a0" + mot + m[4];
  }
  const MOTS = UNITES_EN.reduce(function (l, u) { return l.concat([u[1], u[0]]); }, [])
    .filter(function (x, i, l) { return l.indexOf(x) === i; })
    .sort(function (a, b) { return b.length - a.length; }).join("|");
  const Q = "(?:−\\s?)?\\d[\\d ]*(?:,\\d+)? (?:" + MOTS + ")(?![A-Za-zÀ-ÿ])";
  const Q_TOUTES = new RegExp(Q, "g");
  // Remplace toutes les quantités connues dans un texte.
  function qtesEn(s) { return String(s).replace(Q_TOUTES, qteEn); }
  // Quantité avec une unité quelconque (un seul mot, éventuellement tapé à la main).
  const QG = "(?:−\\s?)?\\d[\\d ]*(?:,\\d+)? [^\\s()]+";
  function motif(source, fn) { return [new RegExp(source), fn]; }

  // Ce que rend noterPaiementAchat (collé à la fin des messages d'arrivage et d'achat).
  function paiementEn(s) {
    if (!s) return "";
    let m = s.match(/^Payé : (.+ F)\.$/);
    if (m) return "Paid: " + m[1] + ".";
    m = s.match(/^(?:Donné : (.+? F)\. )?Tu dois maintenant (.+? F) à (.+)\.$/);
    if (m) return (m[1] ? "Given: " + m[1] + ". " : "") + "You now owe " + m[2] + " to " + m[3] + ".";
    return tr(s);
  }
  function fournisseurEn(qui) { return qui === "ton fournisseur" ? "your supplier" : qui; }

  Object.assign(EN, {
    /* ---- Questionnaire : l'argent déjà en caisse au premier jour ---- */
    "L'argent que tu as maintenant": "The money you have now",
    "Compte l'argent de la boutique, celui que tu as sur toi et dans le tiroir. Écris-le ici.":
      "Count the shop's money \u2014 what you have on you and in the drawer. Write it here.",
    "En espèces": "In cash",
    "Canari s'en sert pour t'empêcher de sortir de l'argent que tu n'as pas. Tes comptes Wave ou Orange Money se règlent plus tard, dans Réglages.":
      "Canari uses it to stop you spending money you don't have. Your Wave or Orange Money accounts are set up later, in Settings.",

    /* ---- Unités seules (listes de choix, petits textes) ---- */
    "unité": "unit", "unités": "units", "kg": "kg", "cl": "cl", "litre": "litre", "litres": "litres",
    "mètre": "metre", "mètres": "metres", "sac": "bag", "sacs": "bags", "carton": "carton", "cartons": "cartons",
    "paquet": "pack", "paquets": "packs", "sachet": "sachet", "sachets": "sachets", "boîte": "box", "boîtes": "boxes",
    "bouteille": "bottle", "bouteilles": "bottles", "bidon": "jerrycan", "bidons": "jerrycans", "tas": "heap",
    "botte": "bunch", "bottes": "bunches", "plat": "plate", "plats": "plates", "prestation": "service",
    "prestations": "services", "forfait": "flat rate", "forfaits": "flat rates",
    "à l'unité (pièce)": "by the unit (piece)", "unité (pièce)": "unit (piece)", "autre…": "other…",

    /* ---- charges.js : façons de vendre, activités, fréquences ---- */
    "En boutique": "In a shop", "un local, un magasin, un kiosque": "a room, a store, a kiosk",
    "En ligne": "Online", "WhatsApp, Facebook, TikTok, livraison": "WhatsApp, Facebook, TikTok, delivery",
    "À la sauvette": "Street selling", "dans la rue, au marché, en marchant": "in the street, at the market, walking around",
    "Je revends des marchandises": "I resell goods", "j'achète et je revends": "I buy and I resell",
    "Je fabrique": "I make things", "pain, attiéké, jus, savon, couture…": "bread, attiéké, juice, soap, sewing…",
    "Je fais des services": "I do services", "coiffure, réparation, transport…": "hairdressing, repairs, transport…",
    "par jour": "per day", "par semaine": "per week", "par mois": "per month", "par an": "per year",

    /* ---- Charges et taxes pré-remplies ---- */
    "Loyer": "Rent", "Électricité": "Electricity", "Eau": "Water", "Salaire d'un employé": "Staff wages",
    "Gardiennage": "Security guard", "Forfait internet": "Internet plan",
    "Publicité (Facebook, TikTok…)": "Advertising (Facebook, TikTok…)", "Livraisons payées par toi": "Deliveries you pay for",
    "Frais Mobile Money": "Mobile Money fees", "Ticket de marché": "Market ticket", "Transport": "Transport",
    "Crédit téléphone": "Phone credit", "Impôt (DGI)": "Tax (DGI)", "Taxe communale / patente": "Local tax / business licence",
    "Autre taxe": "Other tax", "Autre charge": "Other cost",

    /* ---- Bilan du mois ---- */
    "Mois précédent": "Previous month", "Mois suivant": "Next month",
    "Rien de noté ce mois-ci.": "Nothing recorded this month.",
    "Ventes du mois": "This month's sales", "Marge brute": "Gross margin", "Bénéfice net": "Net profit",
    "Le calcul, pas à pas": "The calculation, step by step", "Ventes": "Sales",
    "− Prix de revient": "− Cost price", "= Marge brute": "= Gross margin", "− Autres dépenses": "− Other expenses",
    "− Charges fixes": "− Fixed costs", "− Charges fixes (jusqu'à aujourd'hui)": "− Fixed costs (up to today)",
    "= Résultat avant impôts": "= Result before taxes", "− Impôts et taxes": "− Taxes", "= Bénéfice net": "= Net profit",
    "− Pris pour la maison": "− Taken for home", "= Reste pour la boutique": "= Left for the shop",
    "Charges et taxes du mois": "This month's costs and taxes", "payé": "paid", "pas encore payé": "not paid yet",
    "Quand tu paies une de ces charges, note-la avec « Dépense » puis « Charge fixe » ou « Impôt ».":
      "When you pay one of these costs, record it with “Expense”, then “Fixed cost” or “Tax”.",
    "Ajoute ton loyer, tes salaires et tes taxes pour voir ton vrai bénéfice net.":
      "Add your rent, wages and taxes to see your real net profit.",
    "Ajouter mes charges": "Add my costs",

    /* ---- Questionnaire de départ ---- */
    "Nom": "Name", "Retirer cette ligne": "Remove this line", "Montant": "Amount",
    "Montant ou pourcentage": "Amount or percentage", "% des ventes": "% of sales", "Fréquence": "How often",
    "Calculons ton vrai bénéfice": "Let's work out your real profit",
    "Quelques questions sur ta boutique, tes charges et tes taxes. Ça prend 2 minutes.":
      "A few questions about your shop, your costs and your taxes. It takes 2 minutes.",
    "Tu peux passer une question, et tout changer plus tard dans Réglages ⚙.":
      "You can skip a question, and change everything later in Settings ⚙.",
    "Ta boutique": "Your shop", "Son nom": "Its name", "ex. Boutique Awa": "e.g. Awa's Shop",
    "Son téléphone": "Its phone number", "ex. 07 00 00 00 00": "e.g. 07 00 00 00 00",
    "Ton logo (image ou PDF, facultatif)": "Your logo (image or PDF, optional)",
    "Logo de la boutique": "Shop logo", "Pas de logo": "No logo", "Choisir un logo": "Choose a logo",
    "Pour des factures officielles (facultatif) :": "For official invoices (optional):",
    "N° RCCM (Registre du commerce)": "RCCM No. (Trade register)", "ex. CI-ABJ-2024-A-12345": "e.g. CI-ABJ-2024-A-12345",
    "N° de DFE / compte contribuable (NCC)": "DFE / taxpayer account No. (NCC)", "ex. 2401234 A": "e.g. 2401234 A",
    "Comment vends-tu ?": "How do you sell?", "Tu peux en choisir plusieurs.": "You can choose more than one.",
    "Que vends-tu ?": "What do you sell?", "Ta marge habituelle": "Your usual margin",
    "Quand tu vends pour": "When you sell for",
    ", combien te reste-t-il une fois la marchandise (ou les ingrédients) payée ?":
      ", how much do you keep once the goods (or ingredients) are paid for?",
    "Ou tape ta marge en %": "Or type your margin in %",
    "Tes charges fixes": "Your fixed costs",
    "Ce que tu paies même quand tu vends peu. Laisse vide ce que tu ne paies pas.":
      "What you pay even when you sell little. Leave empty what you don't pay.",
    "Ajouter une charge": "Add a cost", "Combien de jours travailles-tu par mois ?": "How many days do you work each month?",
    "Tes impôts et taxes": "Your taxes",
    "Mets le montant que tu paies vraiment (fixe, ou en % des ventes). Laisse vide si tu ne paies pas.":
      "Put the amount you really pay (fixed, or as a % of sales). Leave empty if you don't pay.",
    "Ajouter un impôt ou une taxe": "Add a tax",
    "C'est prêt !": "All set!",
    "Chaque jour de travail, tes charges et taxes font environ": "Each working day, your costs and taxes come to about",
    "par jour pour ne pas perdre d'argent.": "per day so you don't lose money.",
    "Tu n'as pas mis de charges. Tu pourras les ajouter plus tard dans Réglages ⚙.":
      "You didn't add any costs. You can add them later in Settings ⚙.",
    "Sur l'écran du jour, tu verras tes ventes, ta marge et ton bénéfice net.":
      "On the Today screen, you will see your sales, your margin and your net profit.",
    "C'est parti": "Let's go", "Terminer": "Finish", "Suivant": "Next",
    "Paramétrage enregistré.": "Setup saved.",

    /* ---- fiches.js : types de produits, modèles, fiche de coût ---- */
    "Je le revends": "I resell it", "Je le fabrique": "I make it", "C'est un service": "It's a service",
    "Pain": "Bread", "Attiéké": "Attiéké", "Jus (bissap, gingembre)": "Juice (bissap, ginger)", "Garba": "Garba",
    "Savon": "Soap", "Vêtement cousu": "Sewn clothes", "Coiffure, tresses": "Hairdressing, braids",
    "Réparation de téléphone": "Phone repair", "Retouche, couture sur mesure": "Alterations, tailoring",
    "Livraison, transport": "Delivery, transport", "Lavage (auto, linge)": "Washing (cars, laundry)",
    "Farine": "Flour", "Levure": "Yeast", "Sel": "Salt", "Sucre": "Sugar", "Gaz ou bois": "Gas or firewood",
    "Main-d'œuvre": "Labour", "Sachets": "Sachets", "Manioc": "Cassava", "Ferment": "Ferment", "Huile": "Oil",
    "Bissap ou gingembre": "Bissap or ginger", "Arômes, menthe": "Flavours, mint", "Bouteilles ou sachets": "Bottles or sachets",
    "Glace": "Ice", "Gaz": "Gas", "Poisson (thon)": "Fish (tuna)", "Piment, oignon, tomate": "Chilli, onion, tomato",
    "Huile ou beurre de karité": "Oil or shea butter", "Soude": "Caustic soda", "Parfum": "Perfume",
    "Emballages": "Packaging", "Tissu": "Fabric", "Doublure": "Lining", "Fil": "Thread", "Boutons, fermeture": "Buttons, zip",
    "Mèches": "Hair extensions", "Produits (gel, huile…)": "Products (gel, oil…)", "Aide coiffeuse": "Hairdresser's helper",
    "Pièce (écran, batterie…)": "Part (screen, battery…)", "Colle, petits outils": "Glue, small tools",
    "Déplacement": "Travel", "Carburant": "Fuel", "Entretien de la moto": "Motorbike upkeep", "Savon, détergent": "Soap, detergent",
    "Poste": "Item", "ex. Farine": "e.g. Flour", "Qté": "Qty", "Quantité": "Quantity", "Unité": "Unit",
    "Prix": "Price", "Prix unitaire": "Unit price",
    "Ce que coûte une fournée": "What one batch costs", "Ce que coûte une prestation": "What one service costs",
    "Remplis les quantités et les prix.": "Fill in the quantities and prices.",
    "Total de la fournée": "Batch total", "Total d'une prestation": "Total for one service",
    "Indique combien la fournée donne.": "Say how many one batch makes.",
    "Indique combien une fournée donne.": "Say how many one batch makes.",
    "Remplis au moins une ligne de la fiche de coût (quantité et prix).":
      "Fill in at least one line of the cost sheet (quantity and price).",
    "Prix d'achat": "Purchase price", "Prix d'achat (marge habituelle)": "Purchase price (usual margin)",
    "÷ nombre obtenu": "÷ number made", "Coût": "Cost", "Coût de revient": "Cost price", "Prix de vente": "Selling price",
    "Attention : tu perds de l'argent sur ce produit. Augmente le prix ou baisse les coûts.":
      "Careful: you lose money on this product. Raise the price or lower the costs.",
    "Marge faible : moins de 10 %. Vérifie tes prix.": "Low margin: under 10 %. Check your prices.",

    /* ---- intrants.js ---- */
    "Ça va utiliser :": "This will use:",
    "Les intrants sont ce que tu utilises pour fabriquer : farine, sucre, huile, mèches, sachets…":
      "Supplies are what you use to make things: flour, sugar, oil, hair extensions, sachets…",
    "Ils se créent tout seuls quand tu remplis la recette d'un produit que tu fabriques. Tu peux aussi en ajouter un ici.":
      "They are added by themselves when you fill in the recipe of a product you make. You can also add one here.",
    "Ajouter un intrant": "Add a supply", "Valeur de tes intrants (prix moyen)": "Value of your supplies (average price)",
    "Intrants": "Supplies", "À racheter": "To buy again", "prix ?": "price?",
    "en stock": "in stock", "en stock · à racheter": "in stock · buy again", "· à racheter": "· buy again",
    "Modifier": "Edit", "Achat": "Purchase", "Nouvel intrant": "New supply",
    "Écris le nom de l'intrant.": "Write the name of the supply.",
    "Les recettes qui l'utilisent garderont leur ligne, sans stock.": "Recipes that use it keep their line, without stock.",
    "Écris combien tu en as acheté.": "Write how many you bought.",

    /* ---- boutique.js : produits, stock, arrivages, panier, logo ---- */
    "Ajoute les produits que tu vends avec leur prix.": "Add the products you sell, with their price.",
    "Tes ventes iront plus vite, tes factures seront détaillées et Canari comptera ton stock.":
      "Your sales will be faster, your invoices will be detailed and Canari will count your stock.",
    "Ajouter un produit": "Add a product", "Valeur de ton stock (prix d'achat)": "Value of your stock (purchase price)",
    "Produits": "Products", "Chercher un produit": "Search for a product", "Stock non compté": "Stock not counted",
    "Voir la fiche de coût": "See the cost sheet", "J'ai fabriqué": "I made a batch", "Arrivage": "Delivery",
    "par vente": "per sale",
    "Ce que ça te coûte (facultatif)": "What it costs you (optional)",
    "Combien il en reste vraiment ?": "How many are really left?", "Combien tu en as maintenant ?": "How many do you have now?",
    "Me prévenir quand il en reste": "Warn me when only this many are left",
    "Pareil (à l'unité)": "Same (by the unit)", "Nouveau produit": "New product",
    "Écris le nom du produit.": "Write the product name.", "Écris le prix de vente.": "Write the selling price.",
    "Écris l'unité (ex. seau, pot, rouleau).": "Write the unit (e.g. bucket, pot, roll).",
    "Les ventes déjà notées ne changent pas.": "Sales already recorded don't change.",
    "Écris le prix pour noter le paiement.": "Write the price to record the payment.",
    "Écris le nom du fournisseur, pour savoir à qui tu dois.": "Write the supplier's name, so you know who you owe.",
    "Écris combien tu as donné.": "Write how much you gave.",
    "Tu as tout donné : choisis « Tout payé ».": "You gave it all: choose “Paid in full”.",
    "Combien en as-tu reçu ?": "How many did you receive?",
    "Prix d'achat d'une unité cette fois": "Purchase price of one unit this time",
    "Combien en as-tu fabriqué ?": "How many did you make?",
    "Écris combien tu en as reçu.": "Write how many you received.",
    "Un de moins": "One less", "Un de plus": "One more", "Aucun produit ne correspond.": "No product matches.",
    "Lecture du PDF…": "Reading the PDF…", "Lecture de l'image…": "Reading the image…",
    "Pour lire un PDF la première fois, il faut internet. Réessaie avec internet, ou choisis une image.":
      "To read a PDF the first time, you need internet. Try again with internet, or choose an image.",
    "Ce PDF ne peut pas être lu. Essaie avec une image du logo.": "This PDF can't be read. Try with an image of the logo.",
    "Cette image ne peut pas être lue.": "This image can't be read.",
    "Logo enregistré. Il sera sur tes factures.": "Logo saved. It will be on your invoices.",
    "Infos de la boutique enregistrées.": "Shop details saved."
  });

  EN_MOTIFS.push(
    /* ---- Quantités seules : « 2,5 kg », « + 100 kg », « − 3 unités », « 600/kg » (factures) ---- */
    motif("^[+−]? ?" + Q + "$", function (m) { return qteEn(m); }),
    [/^(\d[\d ]*)\/(\S+)$/, function (m, n, u) { return n + "/" + uniteEn(u, false); }],
    /* ---- charges.js ---- */
    [/^Ventes \(dont (.+ F) à crédit\)$/, "Sales ($1 on credit)"],
    [/^= Marge brute \((-?\d+) %\)$/, "= Gross margin ($1 %)"],
    [/^= Bénéfice net \((-?\d+) %\)$/, "= Net profit ($1 %)"],
    [/^Entré moins sorti ce mois : (.+) \(entré (.+ F), sorti (.+ F)\)\.$/, "In minus out this month: $1 (in $2, out $3)."],
    [/^(\d+) % des ventes$/, "$1 % of sales"],
    [/^payé (.+ F)$/, "paid $1"],
    [/^Sur 1 000 F vendus, il te reste (.+ F)\.$/, "Out of 1 000 F of sales, you keep $1."],
    [/^Avec ta marge de (\d+) %, il faut vendre au moins$/, "With your margin of $1 %, you need to sell at least"],
    [/^(.+ F) (par jour|par semaine|par mois|par an)$/, function (m, f, p) { return f + " " + tr(p); }],

    /* ---- fiches.js ---- */
    [/^Fiche de coût : (.+)$/, "Cost sheet: $1"],
    [/^Remplacer les lignes déjà tapées par le modèle « (.+) » \?$/, function (m, n) {
      return "Replace the lines already typed with the “" + tr(n) + "” template?";
    }],
    [/^Prix de 1 (.+)$/, function (m, u) { return "Price of 1 " + uniteEn(u, false); }],
    [/^Une fournée \(un lot\) donne combien de (.+) \?$/, function (m, u) { return "How many " + uniteEn(u, true) + " does one batch make?"; }],
    [/^= (.+ F) · prix moyen du stock$/, "= $1 · average stock price"],
    [/^÷ (.+) = coût de revient$/, function (m, q) { return "÷ " + qteEn(q) + " = cost price"; }],
    [/^(\d[\d ]* F) \/ (\S+) \(prix moyen\)$/, function (m, f, u) { return f + " / " + uniteEn(u, false) + " (average price)"; }],
    [/^(\d[\d ]* F) \(prix moyen\)$/, "$1 (average price)"],
    [/^Achat d'un (.+)$/, function (m, u) { return "Buying one " + uniteEn(u, false); }],
    [/^Prix d'achat moyen \/ (.+)$/, function (m, u) { return "Average purchase price / " + uniteEn(u, false); }],
    [/^Coût de revient \/ (.+)$/, function (m, u) { return "Cost price / " + uniteEn(u, false); }],
    [/^Prix de vente \/ (.+)$/, function (m, u) { return "Selling price / " + uniteEn(u, false); }],
    [/^Marge(?: \/ (.+?))? \((−? ?\d+) %\)$/, function (m, u, p) { return "Margin" + (u ? " / " + uniteEn(u, false) : "") + " (" + p + " %)"; }],

    /* ---- intrants.js ---- */
    [/^Intrants \((\d+)\)$/, "Supplies ($1)"],
    motif("^il n'en reste que (" + QG + ")$", function (m, q) { return "only " + qteEn(q) + " left"; }),
    motif("^il en reste (" + QG + ")$", function (m, q) { return qteEn(q) + " left"; }),
    [/^\(≈ (.+)\)$/, function (m, q) { return "(≈ " + qteEn(q) + ")"; }],
    [/^Utilisé pour : (.+)$/, "Used for: $1"],
    [/^Tu as déjà un intrant qui s'appelle « (.+) »\.$/, "You already have a supply called “$1”."],
    [/^Supprimer « (.+) » de tes intrants \?$/, "Delete “$1” from your supplies?"],
    [/^(.+) ajouté à tes intrants\.$/, "$1 added to your supplies."],
    [/^Soit (.+ F) le (.+)\.$/, function (m, f, u) { return "That is " + f + " per " + uniteEn(u, false) + "."; }],
    [/^Combien en as-tu acheté \(en (.+)\) \?$/, function (m, u) { return "How many did you buy (in " + uniteEn(u, true) + ")?"; }],
    [/^Prix d'un (.+) cette fois$/, function (m, u) { return "Price of one " + uniteEn(u, false) + " this time"; }],
    [/^Tu en as (.+) en ce moment\.$/, function (m, q) { return "You have " + qteEn(q) + " right now."; }],
    // Message après un achat d'intrant : « Farine : + 100 kg (2 sacs). Prix moyen : 250 F / kg. Payé : 5 000 F. »
    motif("^(.+) : \\+ (" + QG + ")(?: \\((" + QG + ")\\))?\\. Prix moyen : (.+? F)(?: / (\\S+))?\\.(?: (.+))?$",
      function (m, nom, q, qa, f, u, p) {
        return nom + ": + " + qteEn(q) + (qa ? " (" + qteEn(qa) + ")" : "") + ". Average price: " + f +
          (u ? " / " + uniteEn(u, false) : "") + "." + (p ? " " + paiementEn(p) : "");
      }),
    // Note gardée avec la dépense ou la dette : « Achat : 2 sacs de Farine »
    motif("^Achat : (" + QG + ") de (.+)$", function (m, q, nom) { return "Purchase: " + qteEn(q) + " of " + nom; }),
    [/^Achat : (.+)$/, "Purchase: $1"],

    /* ---- boutique.js ---- */
    motif("^Il n'en reste que (" + QG + ")$", function (m, q) { return "Only " + qteEn(q) + " left"; }),
    motif("^(" + QG + ") en stock$", function (m, q) { return qteEn(q) + " in stock"; }),
    [/^(\d[\d ]* F) \/ (\S+) ·$/, function (m, f, u) { return f + " / " + uniteEn(u, false) + " ·"; }],
    [/^(\d[\d ]* F) \/ (\S+)$/, function (m, f, u) { return f + " / " + uniteEn(u, false); }],
    [/^\/ (\S+)$/, function (m, u) { return "/ " + uniteEn(u, false); }],
    [/^perte (.+ F)$/, "loss $1"],
    // Ligne d'aide d'un produit dans l'onglet Stock.
    [/^(?:(Je le revends|Je le fabrique|C'est un service) · )?Coûte (.+? F)(?: \/ (\S+))?( \(marge habituelle\))?(?: \(acheté (.+? F) le (\S+) de (.+?)\))? ·(?: bénéfice (.+? F) (?:par vente|par (\S+)))?$/,
      function (m, type, cout, u, marge, lot, ua, cont, benef, u2) {
        return (type ? tr(type) + " · " : "") + "Costs " + cout + (u ? " / " + uniteEn(u, false) : "") +
          (marge ? " (usual margin)" : "") +
          (lot ? " (bought at " + lot + " per " + uniteEn(ua, false) + " of " + qteEn(cont) + ")" : "") + " ·" +
          (benef ? " profit " + benef + (u2 ? " per " + uniteEn(u2, false) : " per sale") : "");
      }],
    [/^par (\S+)$/, function (m, u) { return "per " + uniteEn(u, false); }],
    [/^Quantité de (.+)$/, "Quantity of $1"],
    [/^Prix de vente \(par (.+)\)$/, function (m, u) { return "Selling price (per " + uniteEn(u, false) + ")"; }],
    [/^Prix d'achat \(par (.+)\)$/, function (m, u) { return "Purchase price (per " + uniteEn(u, false) + ")"; }],
    [/^Ce que ça te coûte \(par (.+)\) \(facultatif\)$/, function (m, u) { return "What it costs you (per " + uniteEn(u, false) + ") (optional)"; }],
    [/^Combien il en reste vraiment \? \(en (.+)\)$/, function (m, u) { return "How many are really left? (in " + uniteEn(u, true) + ")"; }],
    [/^Combien tu en as maintenant \? \(en (.+)\)$/, function (m, u) { return "How many do you have now? (in " + uniteEn(u, true) + ")"; }],
    [/^Me prévenir quand il en reste \(en (.+)\)$/, function (m, u) { return "Warn me when only this many are left (in " + uniteEn(u, true) + ")"; }],
    [/^Pareil \(au (.+)\)$/, function (m, u) { return "Same (per " + uniteEn(u, false) + ")"; }],
    [/^Combien de (.+) dans un (.+) \?$/, function (m, u, ua) { return "How many " + uniteEn(u, true) + " in one " + uniteEn(ua, false) + "?"; }],
    [/^Prix d'achat d'un (.+)$/, function (m, u) { return "Purchase price of one " + uniteEn(u, false); }],
    [/^Si tu ne sais pas, laisse vide : Canari utilisera ta marge habituelle \((\d+) %\)\.$/,
      "If you don't know, leave it empty: Canari will use your usual margin ($1 %)."],
    [/^(?:Coût de revient : (.+? F)(?: \/ (\S+))?\. )?(?:Prix d'achat : (.+? F)(?: \/ (\S+))?\. )?(?:Marge habituelle \((\d+) %\) : )?[Tt]u gagnes (− )?(.+? F) (?:sur chaque vente|par (\S+))\.$/,
      function (m, cr, u1, pa, u2, marge, moins, gain, u3) {
        const par = function (u) { return u ? " / " + uniteEn(u, false) : ""; };
        return (cr ? "Cost price: " + cr + par(u1) + ". " : "") + (pa ? "Purchase price: " + pa + par(u2) + ". " : "") +
          (marge ? "Usual margin (" + marge + " %): y" : "Y") + "ou make " + (moins || "") + gain +
          (u3 ? " per " + uniteEn(u3, false) : " on each sale") + ".";
      }],
    [/^Tu as déjà un produit qui s'appelle « (.+) »\.$/, "You already have a product called “$1”."],
    [/^Écris combien il y en a dans un (.+)\.$/, function (m, u) { return "Write how many there are in one " + uniteEn(u, false) + "."; }],
    [/^Écris le prix d'achat d'un (.+)\.$/, function (m, u) { return "Write the purchase price of one " + uniteEn(u, false) + "."; }],
    [/^Supprimer « (.+) » de tes produits \?$/, "Delete “$1” from your products?"],
    [/^(.+) ajouté à tes produits\.$/, "$1 added to your products."],
    [/^= (.+) ajoutés au stock$/, function (m, q) { return "= " + qteEn(q) + " added to stock"; }],
    [/^(.+ F) sortent de la caisse \(dépense de marchandise\)\.$/, "$1 leaves the cash box (goods expense)."],
    [/^(.+ F) sortent de la caisse, reste (.+ F) à crédit chez (.+)\.$/, function (m, a, b, qui) {
      return a + " leaves the cash box, " + b + " left on credit with " + fournisseurEn(qui) + ".";
    }],
    [/^Tu devras (.+ F) à (.+)\.$/, function (m, a, qui) { return "You will owe " + a + " to " + fournisseurEn(qui) + "."; }],
    [/^Total : (.+ F)$/, "Total: $1"],
    [/^Arrivage : (.+)$/, "Delivery: $1"],
    [/^J'ai fabriqué : (.+)$/, "I made: $1"],
    [/^Combien en as-tu reçu \(en (.+)\) \?$/, function (m, u) { return "How many did you receive (in " + uniteEn(u, true) + ")?"; }],
    [/^Combien en as-tu fabriqué \(en (.+)\) \?$/, function (m, u) { return "How many did you make (in " + uniteEn(u, true) + ")?"; }],
    [/^Prix d'achat du (.+) cette fois$/, function (m, u) { return "Purchase price per " + uniteEn(u, false) + " this time"; }],
    // Message après un arrivage : « Riz : + 100 kg (2 sacs). Il y en a maintenant 150 kg. Payé : 5 000 F. »
    motif("^(.+) : \\+ (" + QG + ")(?: \\((" + QG + ")\\))?\\. Il y en a maintenant (" + QG + ")\\.(?: (.+))?$",
      function (m, nom, q, qa, total, p) {
        return nom + ": + " + qteEn(q) + (qa ? " (" + qteEn(qa) + ")" : "") + ". You now have " + qteEn(total) + "." +
          (p ? " " + paiementEn(p) : "");
      }),
    [/^(.+) modifié\.$/, "$1 updated."],
    [/^(.+) supprimé\.$/, "$1 deleted."],
    [/^Modifier (.+)$/, "Edit $1"],
    // Lignes d'une vente : « Riz 2,5 kg, 3 × Savon »
    motif("^(?:[^,]+ " + Q + "|\\d+(?:,\\d+)? × [^,]+)(?:, (?:[^,]+ " + Q + "|\\d+(?:,\\d+)? × [^,]+))*$", function (m) {
      return qtesEn(m).replace(/(\d),(\d+ ×)/g, "$1.$2");
    })
  );
})();

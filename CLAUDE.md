# Canari · Instructions du projet

Ce fichier résume toutes les décisions prises pour l'application **Canari**. Lis-le en entier avant d'écrire du code. Le propriétaire du projet ne sait pas programmer : explique chaque étape en français simple, sans jargon, et demande-lui de tester sur son téléphone à chaque étape.

## Le produit en une phrase

Canari est un carnet de caisse sur téléphone pour les petits commerçants de Côte d'Ivoire : ventes, dépenses, crédits clients, dettes fournisseurs et relances, avec le gain du jour toujours visible.

## Le client idéal

- Boutiquier de quartier ou commerçante du marché, 30 à 55 ans, à Abidjan puis dans toute l'Afrique de l'Ouest francophone.
- Vend un peu à crédit tous les jours, note dans un cahier papier ou ne note rien.
- Téléphone Android d'entrée de gamme (Tecno, Itel), souvent avec peu de mémoire et une connexion internet instable.
- Peu de temps, parfois peu à l'aise avec la lecture : il doit comprendre un écran en 2 secondes.

## Ses problèmes (ce que l'appli règle)

1. Il ne sait pas combien il gagne vraiment chaque jour.
2. Il oublie qui lui doit combien et perd de l'argent.
3. Il n'ose pas relancer les clients.
4. Il mélange l'argent de la boutique et celui de la maison.
5. Il oublie ce qu'il doit à ses grossistes.

## Ce qui nous différencie des concurrents

Concurrents étudiés : Djago (Côte d'Ivoire), Keiwa, NAFA ERP, OkCredit, Khatabook.
- **Tout en un mais simple** : ventes + dépenses + crédits + gain du jour sur un seul écran (les autres ne font souvent que le crédit).
- **Zéro publicité**, jamais. Les avis des concurrents se plaignent surtout des pubs et des abonnements forcés.
- **Séparation boutique / maison.**
- **Relances intelligentes** avec messages WhatsApp prêts, 3 tons.
- **Une mascotte attachante** et une identité ivoirienne.

## Identité visuelle

- **Nom** : Canari (la jarre traditionnelle en terre cuite qui garde l'eau précieuse). Écrit en minuscules dans le logo : « canari ».
- **Slogan** : « Tu vends. Canari compte. » (choisi par le propriétaire en remplacement de « Garde chaque franc. », qui ne voulait plus rien dire hors zone FCFA depuis l'ajout des monnaies : naira, franc guinéen…). Il dit le partage du travail, ne nomme aucune monnaie, et fait entendre le nom de la marque. Anglais : « You sell. Canari counts. »
- **Couleurs**
  - Vert forêt `#174A3F` (couleur principale, fond de l'icône)
  - Terre cuite `#C8643A` (la jarre)
  - Terre claire `#E08A5F` (bord de la jarre, accents)
  - Or `#F2B233` (pièces, gains)
  - Sable `#F6EEE3` (fond clair de l'appli)
  - Brun foncé `#2A1A12` (texte)
  - Rouge dépense `#B8412B`, ambre crédit `#9A6512` (couleurs de sens)
- **Signature graphique (demande du propriétaire : les couleurs nationales — orange, blanc, vert — en nuances sourdes, aucune couleur vive, des motifs et des formes en fond, un rendu professionnel)**, dans `app/style.css`, section « SIGNATURE GRAPHIQUE CANARI ».
  - **Trois familles de couleurs** : **ivoire** (`--ivoire`, `--ivoire-2`, `--sable`), **ocre** (l'orange sourd : `--ocre-500` à `--ocre-800`, `--ocre-100`, `--dore`) et **olive** (`--olive-50` à `--olive-900`). Les couleurs de la marque pointent dessus (`--vert-foret` = olive 700, `--terre-cuite` = ocre 600, `--or` = doré). Les couleurs de sens : olive = argent qui entre, **rouge = argent qui sort et nombre négatif**, ocre = crédit, ardoise = maison. Les fonds restent clairs et sourds ; seuls les textes sont foncés.
  - **Cinq dessins faits maison** (SVG écrits dans le CSS, aucune image à charger) : **les vagues** (arcs concentriques, en filigrane sur toute la page et dans le bilan du jour), **les pièces** (ronds dorés au trait, sur les grandes cartes et l'accueil), **le zigzag** (la frise du canari, en haut des cartes et en bas de l'accueil), **le halo** (cercles du goulot, coin des cartes et des fenêtres) et **la trame** (fines hachures obliques : la tenue du papier). Plus trois voiles de couleur fixes derrière la page et une grande goutte sur l'accueil.
  - **Rendu sobre** : bordures fines de 1 px, ombres légères, angles à 16-18 px, pas d'effet de relief, étiquettes des grandes cartes en petites capitales.
  - Contrastes vérifiés : tous les textes ≥ 6,8:1 (le minimum exigé est 4,5:1).
  - Le fond ne doit pas être en `background-attachment: fixed` (défilement saccadé sur les petits téléphones) : les formes sont posées par `body::before`, qui ne se redessine pas.
- **Polices (retravaillées à la demande du propriétaire : « faire correspondre les polices au contenu »)**, section « TYPOGRAPHIE » de `app/style.css`. Toujours deux polices seulement (poids de l'appli inchangé), mais deux rôles nets :
  - **Fredoka** (`--titre`), ronde et chaleureuse → l'**identité** : le logo, le slogan, les titres d'écran et de fenêtre, les titres de liste, les mots des gros boutons, le nom de la boutique sur les factures.
  - **Rubik** (`--texte`, `--chiffres`), nette et sobre → tout ce qui se **lit et se compare** : les phrases, les listes, et surtout **tous les montants**.
  - **Pourquoi les montants ne sont plus en Fredoka** : son chiffre 1 est bien plus étroit que les autres (mesuré : « 111111 » = 69 px contre 103 px pour « 000000 »), donc les colonnes de montants dansent d'une ligne à l'autre. Rubik sait écrire les **chiffres tabulaires** (tous de la même largeur) : `font-variant-numeric: tabular-nums lining-nums`, posé sur les montants et sur les listes et tableaux entiers (`.liste`, `.clients`, `.produits`, `.barres`, `.matrice`, `.historique`…). Le bilan du jour en garde des chiffres proportionnels : c'est une phrase, pas une colonne.
  - Réglages fins : interligne 1,5 pour la lecture et 1,2 dans les boutons ; grands nombres en Rubik 700 resserrés (`letter-spacing` négatif) ; étiquettes des grandes cartes en petites capitales espacées ; titres en `text-wrap: balance`.
  - Sur la facture, le nom de la boutique reste en Fredoka (identité) mais « FACTURE » / « REÇU D'ACOMPTE » et les montants passent en Rubik (mention administrative). Code : `app/facture.js`.
  - **Règle pour la suite** : tout nouveau montant ou tableau de chiffres doit hériter de `--chiffres` et des chiffres tabulaires ; ne jamais remettre Fredoka sur un nombre.
- **Le rouge (demande du propriétaire, fait)**, section « CHIFFRES NÉGATIFS ET DÉCAISSEMENTS » de `app/style.css`. Le rouge ne sert qu'à **deux** choses, pour qu'il garde son sens :
  1. un **nombre négatif** : perte du jour, de la semaine ou du mois, argent en caisse dans le rouge, reste pour la boutique négatif, marge négative d'une fiche de coût, barre d'un jour perdant ;
  2. un **décaissement** : dépense, charge fixe, impôt ou taxe, paiement au fournisseur, prix de revient (les lignes « − … » du calcul du mois), bouton Dépense.
  Rouge de la marque `#B8412B` (fonds, pastilles, boutons) et sa version foncée `#8E2F1E` pour les textes et les montants (contraste 7,7:1 sur l'ivoire : lisible en plein soleil). Un zéro n'est pas un décaissement : la ligne « − Charges fixes » à 0 reste grise et sans signe moins.
  **« Pris pour la maison » garde l'ardoise** : ce n'est pas une perte, c'est de l'argent qui change de poche (c'est la séparation boutique / maison, un de nos avantages).
  **Comment le rouge est posé** : quand le montant est seul dans son élément (`<strong>`, `<b>`, `<td>`, `.barre-valeur`), il reçoit la classe `m-negatif` ou `m-sort`. Quand le montant est au milieu d'une phrase, c'est **toute la phrase** qui passe en rouge (classe `negatif` sur le `<p>`) : couper la phrase en deux pour colorer le seul nombre empêcherait la traduction anglaise (`EN_MOTIFS`) de la reconnaître. **Règle pour la suite** : tout nouveau montant négatif ou sortie d'argent suit cette règle ; ne jamais couper une phrase traduite pour colorer un nombre.
  Le signe moins est collé au montant par une espace insécable (`−\u00a0`) : sinon il se retrouve seul sur sa ligne dans les petites cases.
- **La mascotte « Petit Canari » (dessin fourni par le propriétaire, en place)** : une jarre en terre cuite souriante, frise en zigzag blanche sur le ventre, une pièce d'or qui tombe dans le goulot, posée sur une **carte crème arrondie** au motif de vagues. La planche d'origine est gardée dans `store/planche-canari.png`.
  - **Cinq humeurs**, dans `app/icones/` : **joyeux** (`mascotte-canari-3d.webp`, pouce levé, pièce en main, il marche — l'écran d'accueil et le questionnaire), **clin d'œil** (`canari-clin-doeil.webp` — les relances), **yeux fermés** (`canari-yeux-fermes.webp` — bonne journée, objectif atteint), **tranquille** (`canari-tranquille.webp` — écrans neutres et vides), **pensif** (`canari-pensif.webp` — journée en perte, stock vide).
  - **Les vignettes servent telles qu'elles se présentent (demande du propriétaire)** : on ne détoure pas le personnage, on ne lui retire pas sa carte crème. Le seul traitement est de découper la carte et de rendre transparent le blanc de la planche autour d'elle, pour que ses coins arrondis restent arrondis au lieu de laisser un carré blanc. **Plus aucun fond vert dans l'appli** (demande précédente du propriétaire) : le crème de la carte s'accorde avec l'ivoire de la page.
  - **L'icône du TÉLÉPHONE est la même vignette**, posée dans un carré du même crème (`icone-180/192/512.png`) ; `icone-maskable-512.png` a en plus 16 % de marge, parce qu'Android rogne les bords des icônes adaptatives et couperait sinon les coins de la carte. Comme l'icône n'est plus verte, le **fond de l'écran de démarrage** passe à l'ivoire de l'appli (`background_color`) ; la barre du haut (`theme_color`) garde le vert de la marque.
  - **Les cinq vignettes sont presque carrées** (largeur ≈ 0,95 × hauteur). Les `<img>` de l'appli fixent la largeur et laissent la hauteur suivre : il suffit donc de les réduire à 360 px de large pour qu'elles aient toutes la même taille apparente. Les attributs `height` des `<img>` valent la largeur × 1,055 (ils ne servent qu'à réserver la place).
  - **Refabriquer les images** (si le propriétaire fournit un nouveau dessin) : tout est dans `store/`, avec son mode d'emploi (`store/LISEZ-MOI.md`). `detourer-mascotte.py` découpe les cinq vignettes, `fabriquer-images.py` remplit `app/icones/`, `captures.mjs` et `composer.mjs` refont les visuels du Play Store.
  - **Règle pour la suite** : ne pas retoucher le dessin du propriétaire. Une planche livrée sur cartes se découpe telle quelle ; le seul traitement permis est d'ôter le blanc autour de la carte.

## Le prototype existant

`prototype/carnet-boutique.html` est un prototype qui fonctionne déjà (page web). Il sert de **référence pour les fonctionnalités et les calculs**. Ouvre-le et reproduis son comportement dans la vraie appli, avec l'identité Canari.

## Fonctionnalités de la version 1

**Écran principal**
- Gain du jour en très gros (encaissé moins dépensé), en FCFA.
- Trois chiffres : encaissé, dépensé, pris pour la maison.
- Bilan du jour en une phrase, par exemple : « Aujourd'hui tu as gagné 8 700 F. Tu as pris 2 000 F pour la maison, il reste donc 6 700 F pour la boutique. Tes clients te doivent 7 800 F, dont Koffi 4 000 F. 2 clients à relancer. Tu dois 10 000 F à tes fournisseurs. »
- Gros boutons : Vente, Dépense, Crédit. Plus petits : Pris pour la maison, Dette fournisseur.

**Types de mouvements**
| Type | Effet |
|---|---|
| Vente | + encaissé |
| Dépense | + dépensé |
| Crédit client | le client doit plus (pas d'argent encaissé) |
| Remboursement client | + encaissé, le client doit moins |
| Pris pour la maison | sort de la caisse, compté à part (pas dans le gain) |
| Dette fournisseur | je dois plus au fournisseur (pas d'argent sorti) |
| Paiement fournisseur | + dépensé, je dois moins |

Calculs (remplacés par la décision « bénéfice » ci-dessous) : gain = encaissé − dépensé ; reste pour la boutique = gain − pris pour la maison.

**Décision du propriétaire : le chiffre en gros est le bénéfice.**
- Bénéfice = ventes (même à crédit) − prix de revient de ce qui est vendu − autres dépenses.
- Prix de revient : pour une vente par produits, le prix d'achat de chaque produit (ou, s'il n'est pas connu, le prix de vente moins la marge habituelle) ; pour une vente par montant, prix de vente moins la marge habituelle (Réglages, 20 % par défaut), modifiable à la vente. Il est gardé dans la vente le jour où elle est notée : changer la marge ou un prix d'achat ne change pas le passé.
- Une dépense est soit « Marchandise à revendre » (ne baisse pas le bénéfice, elle est comptée à la revente), soit « Autre dépense » (transport, loyer… baisse le bénéfice). Les dettes et paiements fournisseurs sont de la marchandise.
- À côté : **argent en caisse** = argent entré (ventes payées + remboursements) − argent sorti (toutes les dépenses, paiements fournisseurs, maison).
- Reste pour la boutique = bénéfice − pris pour la maison.
- La valeur du stock est calculée au prix d'achat.

**Décisions du propriétaire (lot A, structure des coûts, voir `docs/analyse-structure-des-couts.md`)**
- Le chiffre en gros sur l'écran Jour est **les ventes du jour**. En dessous : marge brute, charges et taxes du jour, **bénéfice net**.
- Cascade : ventes − prix de revient = marge brute ; − autres dépenses − charges fixes = résultat avant impôts ; − impôts et taxes = bénéfice net.
- **Questionnaire de départ** (après « Commencer », refaisable dans Réglages) : boutique, façon de vendre (**en boutique, en ligne, à la sauvette** : chacune pré-remplit sa liste de charges), ce qu'on vend (revente, fabrication, services), marge habituelle, charges fixes (montant + fréquence jour / semaine / mois / an, ou % des ventes), jours de travail par mois, impôts et taxes (montant fixe ou % des ventes, remplis par l'opérateur : Canari n'invente pas de règles fiscales).
- Les charges et taxes prévues sont réparties sur les jours de travail : chaque jour où l'on vend porte sa part. Le mois compte la part écoulée depuis le premier jour noté dans Canari.
- Une dépense peut être : marchandise à revendre, charge fixe (déjà prévue), impôt ou taxe (déjà prévu), autre dépense. Seule « autre dépense » baisse le bénéfice ce jour-là ; les autres ne sortent que de la caisse. Payer une charge prévue la marque « payée » dans le bilan du mois.
- Seuil : ventes minimum par jour pour couvrir charges et taxes, affiché tant qu'il n'est pas atteint.
- Onglet **Bilan** : 7 derniers jours, ou Mois (cascade complète, charges prévues payées ou non).
- **Lot B (fait)** : chaque produit a un type : **revente** (prix d'achat, unité d'achat), **fabrication** (recette d'une fournée : lignes poste × quantité × unité × prix unitaire, + nombre obtenu par fournée ; coût de revient = total ÷ nombre obtenu) ou **service** (coûts intermédiaires d'une prestation). Modèles pré-remplis sans prix (pain, attiéké, jus, garba, savon, vêtement cousu ; coiffure, réparation de téléphone, retouche, livraison, lavage). « Voir la fiche de coût » affiche la matrice (postes, quantités, coûts, coût de revient, prix de vente, marge en %, alerte si perte ou marge < 10 %). Pour un produit fabriqué, « Arrivage » devient « J'ai fabriqué ». Code : `app/fiches.js`.
- **Lot C (fait)** : stock des **intrants** (ingrédients, matières, emballages), onglet Stock → « Intrants ». Chaque ligne de recette (sauf les lignes au forfait : gaz, main-d'œuvre…) est reliée à un intrant, créé tout seul à partir du nom. Achat d'intrant en unité d'achat (sac de 50 kg…), **prix moyen pondéré**, option « payé maintenant » (dépense de marchandise). « J'ai fabriqué » consomme les intrants selon la recette (affiche ce qui va être utilisé et ce qui manque) ; une prestation de service vendue consomme ses intrants. La consommation est gardée dans la ligne de fabrication ou de vente : la retirer remet les intrants en stock. Le coût de revient d'un produit fabriqué suit le prix moyen actuel des intrants ; une vente garde le coût du jour. Code : `app/intrants.js`.

**Décision du propriétaire (étape 3) : vente ≠ encaissement.** Une vente n'est pas forcément payée en entier. Chaque vente garde son prix total (`montant`) et ce que le client a donné (`encaisse`). Le reste passe à crédit sur le nom du client. Le bouton « Crédit » est une vente où le client n'a rien donné. L'encaissé du jour ne compte que l'argent reçu (ventes payées + remboursements) ; l'écran principal affiche aussi « Vendu aujourd'hui : X F, dont Y F à crédit ».

**Décision du propriétaire : le client est identifié par son numéro de téléphone.** Dès qu'une vente laisse un reste à crédit, le numéro est obligatoire (au moins 8 chiffres ; un numéro ivoirien avec 225 ou 00225 est ramené à ses 10 chiffres). Deux clients avec le même nom mais des numéros différents sont deux clients différents. Si on tape un numéro déjà connu, l'appli reconnaît le client et remplit son nom. Le nom et le numéro se corrigent avec « Modifier » dans l'onglet Crédits (tout l'historique suit). Ce numéro servira aux relances WhatsApp.

**Saisie**
- Montant avec clavier numérique et boutons rapides (500, 1 000, 2 000, 5 000 F).
- Nom du client ou du fournisseur avec suggestions des noms déjà utilisés.
- Note facultative.
- Chaque ligne peut être retirée, avec « Annuler » pendant quelques secondes.

**Onglets** : Jour, Crédits (« On me doit » / « Je dois »), Relances, Semaine (gain des 7 derniers jours en barres, total, pris pour la maison, reste pour la boutique).

**Relances**
- Pour chaque client : numéro WhatsApp, date promise de paiement, historique des relances.
- Classement automatique :
  - À relancer aujourd'hui : promesse dépassée ou pour aujourd'hui, OU jamais relancé et doit depuis 7 jours ou plus, OU relancé sans réponse depuis 5 jours ou plus.
  - Promesses à venir.
  - Déjà relancés (moins de 5 jours).
  - Crédits récents.
- Nombre de clients à relancer affiché sur l'onglet.
- Message prêt en 3 tons, choisi selon le nombre de relances (0 : gentil, 1 à 2 : ferme, 3 et plus : dernier rappel), modifiable :
  - Gentil : « Bonjour [nom], j'espère que tu vas bien. Petit rappel de la boutique : il reste [montant] FCFA à régler. Tu peux passer quand ça t'arrange. Merci beaucoup ! »
  - Ferme : « Bonjour [nom], je reviens vers toi pour les [montant] FCFA que tu dois à la boutique depuis [durée]. Peux-tu passer régler cette semaine ? Dis-moi le jour qui t'arrange. Merci. »
  - Dernier rappel : « Bonjour [nom], c'est mon dernier rappel pour les [montant] FCFA dus à la boutique. Merci de régler d'ici [date dans 3 jours]. Sans règlement, je ne pourrai plus faire de crédit. Merci de ta compréhension. »
- Bouton « Envoyer sur WhatsApp » (lien `https://wa.me/225XXXXXXXXXX?text=...` ; un numéro ivoirien à 10 chiffres reçoit le préfixe 225) et bouton « Copier ». Chaque envoi est compté comme une relance.
- Quand le client rembourse, sa promesse est effacée.

## Règles pour l'interface

- Tout en français simple, tutoiement.
- Montants en FCFA sans décimales, avec espaces : « 12 500 F ».
- Gros chiffres, gros boutons (au moins 48 px de haut), peu de mots, une icône à côté de chaque action.
- Couleurs de sens constantes : vert = argent qui entre, rouge = argent qui sort, ambre = crédit, bleu-violet = maison.
- Doit rester lisible en plein soleil (bon contraste).
- Écrans vides accueillants avec la mascotte et une phrase qui dit quoi faire.

## Contraintes techniques

- **Android d'abord**, téléphones d'entrée de gamme : appli légère, rapide au démarrage.
- **Fonctionne sans internet.** Toutes les données sont enregistrées sur le téléphone. La synchronisation en ligne viendra plus tard.
- Technologie conseillée : **Flutter** avec une base de données locale (par exemple SQLite). Si le propriétaire préfère commencer plus simplement, une **application web installable (PWA)** hors ligne est acceptable pour les premiers tests.
- Pas de publicité, pas de collecte de données inutile.
- Sauvegarde : prévoir un export des données (fichier) pour ne rien perdre si le téléphone change.

## Ajouts demandés par le propriétaire (faits, étape 6 bis)

- **Paramètres de la boutique** : nom, logo (image ou PDF), numéro, adresse, **N° RCCM** (Registre du commerce) et **N° de DFE / compte contribuable (NCC)**, tous facultatifs. Demandés dès le questionnaire de départ (écran « Ta boutique »), modifiables dans Réglages, et imprimés sur les factures et reçus sous le nom de la boutique.
- **Produits et services** avec leur prix.
- **Saisie d'une vente au choix** : choisir des produits (total calculé, stock mis à jour, facture prête) OU taper juste un montant pour aller vite.
- **Factures en image avec le logo**, partagées sur WhatsApp comme une photo : facture de vente, et **reçu d'acompte** à chaque paiement d'une partie d'un crédit (déjà payé, reste à payer).
- **Envoi direct dans la conversation du client (demande du propriétaire, fait)** : comme les relances, la facture part dans le WhatsApp du client **sans chercher dans les contacts**. Bouton principal « **Envoyer à [nom]** » → `https://wa.me/225XXXXXXXXXX?text=…` avec la **facture écrite en texte** (numéro, boutique, client, lignes avec quantités et unités, TOTAL, déjà payé, reste à payer, moyens de paiement, message de remerciement). **Limite de WhatsApp** : un lien peut ouvrir la bonne conversation mais **ne peut pas y attacher l'image**. Canari **copie donc l'image dans le presse-papier** juste avant d'ouvrir la conversation (`ClipboardItem`, quand le téléphone le permet) : un appui long sur la zone de texte la colle. Le bouton « Partager l'image » reste en second (menu de partage d'Android). Sans numéro connu, le bouton direct est caché et Canari propose d'ajouter le numéro avec « Modifier » dans Crédits. L'envoi automatique de l'image, sans geste, demanderait l'API WhatsApp Business (compte Meta, modèles validés, serveur, coût par message) : à voir plus tard, comme le paiement automatique. Code : `app/facture.js` (`factureEnTexte`, `envoyerDocumentAuClient`).
- **Stock simple** : quantité par produit, qui baisse à chaque vente, monte à chaque arrivée de marchandise, avec une alerte quand un produit va manquer. Permet au vendeur de faire le point sur son stock.

**Décision du propriétaire : chaque produit a une unité de vente** (unité/pièce, kg, g, litre, cl, mètre, sac, carton, paquet, sachet, boîte, bouteille, bidon, tas, botte, plat, prestation, ou une unité tapée à la main). Le prix de vente, le prix d'achat, le stock, l'alerte, les arrivages et les quantités vendues sont comptés dans cette unité, avec des décimales possibles (1,5 kg). La facture affiche « 2,5 kg » et « 600/kg ». **Unité d'achat différente (fait)** : un produit peut s'acheter dans une autre unité que celle de vente (sac de 50 kg vendu au kg, carton de 24 bouteilles vendu à la bouteille). On note l'unité d'achat, la contenance et le prix du lot ; Canari calcule le prix d'achat par unité de vente. Un arrivage se note dans l'unité d'achat (« 2 sacs » = 100 kg ajoutés au stock), avec le prix du lot cette fois-là ; le prix d'achat devient le **prix moyen pondéré** (ancien stock à l'ancien prix, nouveau stock au nouveau prix). **Paiement d'un achat (décision du propriétaire)** : pour chaque arrivage de produit ou achat d'intrant, « Tu l'as payé ? » a 4 réponses : **tout payé** (dépense de marchandise), **payé en partie** (montant donné + fournisseur : une dette fournisseur est créée avec ce qui a été versé, le reste est dû), **tout à crédit** (dette fournisseur du total), **pas maintenant / déjà noté** (rien). Les dettes apparaissent dans Crédits → Je dois.

Comment c'est fait : `app/boutique.js` (boutique, produits, stock, choix des produits dans une vente) et `app/facture.js` (factures « F-0001 » et reçus « R-0001 » dessinés en image sur le téléphone, partagés avec le menu de partage d'Android). Le stock n'est jamais tapé à la main : il se calcule à partir des lignes « stock » (départ, arrivage, correction) moins les quantités vendues, donc retirer une vente remet le produit en stock. Un reçu s'appelle « reçu d'acompte » tant qu'il reste quelque chose à payer.

## Étape 7 : solidité sur petit téléphone (fait)

- **Stockage** : les données sont dans la base du navigateur (IndexedDB), plus dans localStorage (limité à ~5 Mo, soit ~2 ans de ventes). Les anciennes données sont déplacées automatiquement au premier lancement. Repli sur localStorage si IndexedDB n'est pas disponible.
- **Vitesse** : les calculs (ventes par jour, stocks, dettes, listes de clients) sont gardés en mémoire jusqu'au prochain changement (`memo()` dans `app.js`, invalidé par `sauver()`). Seul l'onglet affiché est dessiné. Les historiques des clients ne sont dessinés qu'à l'ouverture. Mesure avec 1 an de données (10 400 lignes) et un processeur 6× plus lent : ouverture < 1 s, onglets < 0,3 s.
- Icônes compressées, petits textes plus foncés, boutons ✕ et « Modifier » à 48 px. L'appli pèse ~2,7 Mo, dont 1,7 Mo pour le lecteur de PDF (`app/vendor/pdfjs`, qui sert à accepter un logo de boutique en PDF).
- **Règle pour la suite** : ne jamais laisser une capture d'écran de test dans `app/` — tout ce qui est là est téléchargé par chaque commerçant. Douze captures oubliées y pesaient 740 Ko, retirées le 29/09/2026.
- Liste de vérifications sur un vrai téléphone : `docs/tests-telephone.md`.

## Paiement mobile (fait, sans contrat opérateur)

Demande du propriétaire : recevoir l'argent par Wave, Orange Money, MTN MoMo, Moov Money (Flooz) ou Djamo. Fait sans intégration automatique (qui exige un contrat marchand, une entreprise enregistrée, des frais et un serveur) :
- Réglages → **Paiement mobile** : comptes acceptés, numéro de réception, lien de paiement Wave facultatif.
- Ces moyens apparaissent **sur les factures et reçus** (« Pour payer le reste : Wave : 07… ») et **à la fin des relances WhatsApp** (« Tu peux aussi payer par… »).
- Chaque entrée ou sortie d'argent note son **moyen** (espèces par défaut, champ `moyen` du mouvement ; rien pour une vente tout à crédit). L'argent en caisse du jour est détaillé par moyen (« Espèces + 1 500 F · Wave + 5 000 F »). Les **paiements aux fournisseurs** aussi : « J'ai payé », dette fournisseur avec une partie versée, arrivage ou achat d'intrant « tout payé » ou « payé en partie » proposent « Payé avec… ».
- Aucun logo d'opérateur, seulement les noms. Code : `app/paiements.js`.
- Plus tard (décision d'entreprise du propriétaire) : paiement automatique par lien, avec confirmation, via un agrégateur de paiement ivoirien ou les API des opérateurs ; nécessite un serveur.

## Contacts du téléphone (fait)

Demande du propriétaire : le client enregistré dans Canari doit aussi apparaître dans les contacts du téléphone. Une page web installée ne peut pas écrire directement dans les contacts d'Android : Canari prépare une **fiche contact (.vcf)** que le téléphone ouvre dans l'appli Contacts, déjà remplie (nom, numéro en +225, note « Client de [boutique] (Canari) ») ; il reste à appuyer sur « Enregistrer ».
- Après une vente qui crée un **nouveau** client : bouton « Contacts » dans le message du bas, à côté de « Facture ».
- Fiche d'un client ou d'un fournisseur (« Modifier ») : « Ajouter aux contacts du téléphone ».
- Réglages → **Contacts du téléphone** : tous les clients en un seul fichier.
- Dans l'autre sens, « Choisir dans mes contacts » (saisie d'une vente à crédit) remplit le nom et le numéro depuis le répertoire, si le téléphone le permet (Chrome sur Android) ; le bouton est caché sinon.
- Quand l'appli sera sur le Play Store (étape 8), l'écriture directe dans les contacts pourra être ajoutée. Code : `app/contacts.js`.

## Abonnement (fait, décision du propriétaire, voir `docs/analyse-abonnement.md`)

- **Gratuit 3 mois** (90 jours depuis le premier jour d'utilisation), puis payant. Prix proposés : 1 mois 1 000 F, 3 mois 2 500 F, 1 an 9 000 F (conseillé). À confirmer par le propriétaire et sur le terrain.
- Bandeau 10 jours avant la fin. Après la fin, **rien n'est effacé ni caché** : on voit tout, on relance, on note les remboursements, on sauvegarde ; seules les nouvelles ventes, dépenses et achats demandent un abonnement.
- Chaque téléphone a un **numéro Canari** (8 caractères). Le client paie sur les comptes du propriétaire (`RECEPTION` dans `app/abonnement.js`, à remplir), envoie sa demande sur WhatsApp ; le propriétaire crée un **code d'activation signé** (ECDSA P-256) avec sa page privée `app/gerant.html` (clé secrète gardée sur son téléphone) ; le client touche le lien `…/#code=…` ou colle le code. L'appli vérifie avec la clé publique (`CLE_PUBLIQUE`, à remplir avec celle du propriétaire). Jours payés ajoutés à la suite ; un code ne sert qu'une fois ; l'abonnement suit la sauvegarde et a une copie à part (localStorage) pour ne rien perdre en récupérant une vieille sauvegarde.
- **Moyens de paiement de l'abonnement (décision du propriétaire)** : **QR code Djamo** du compte entreprise (payable avec Djamo, Wave, Orange Money, MTN MoMo, Moov Money). **La carte Visa n'est pas disponible** : le propriétaire a regardé sa page de paiement Djamo, elle ne propose que le mobile money. Le bouton « Payer par carte Visa » et la mention « ou carte Visa » dans le message WhatsApp sont donc cachés (vérifié à l'écran) ; ils réapparaîtront tout seuls le jour où `RECEPTION.carte` recevra un lien acceptant les cartes. Tout arrive sur le compte entreprise Djamo. **Deux chemins de paiement (retour du propriétaire : Wave refusait de scanner le QR Djamo)** :
  1. **Wave** — le propriétaire a fourni son QR marchand Wave ; le lien qu'il contient (`https://pay.wave.com/m/M_ci_b-BzcCIujDTv/c/ci/?src=d`) est dans `RECEPTION.wave.lien` (bouton principal « Payer avec Wave », ouvre l'appli Wave) et ré-encodé en QR maison `app/icones/qr-wave.png` (sans logo ni mascotte, pour que le scanner de Wave le lise ; 0,9 Ko, vérifié lisible en 200 px et flouté). **Le logo Wave n'est pas utilisé**, seulement le nom, conformément à la règle de marque.
  2. **Les autres moyens** — bouton « Orange Money, MTN, Moov ou Djamo » vers la page Djamo, et son QR (avec mascotte).
  **Pourquoi deux QR** : chaque opérateur ne lit que ses propres QR codes ; un lien web ne se scanne qu'avec l'appareil photo. Les scanners de Wave, Orange Money, MTN et Moov ne lisent que les QR de leur propre service ; un QR marchand Wave se demande à Wave Business. L'écran d'abonnement met donc en avant le bouton **« Payer maintenant »** (`RECEPTION.djamo.lien`), qui ouvre la page de paiement où le moyen se choisit ; le **QR code** (`RECEPTION.djamo.qr`) vient après, pour un autre téléphone, avec la consigne de le scanner **avec l'appareil photo**, pas dans l'appli de paiement. Bouton « Payer par carte Visa » si `RECEPTION.carte` est rempli. **Lien de paiement du propriétaire (fourni) : `https://pay.djamo.com/hq91c`**, encapsulé dans `app/icones/qr-djamo.png` (QR niveau H, couleur olive, mascotte au centre, 14 Ko ; vérifié lisible en 200 px et flouté). `RECEPTION.djamo` est donc rempli. **Numéro WhatsApp du propriétaire (fourni) : `0584374848`** → `RECEPTION.whatsapp`, le bouton « Envoyer ta demande » ouvre `wa.me/2250584374848` avec la formule choisie et le numéro Canari du client. **Clé publique du propriétaire (fournie)** : elle est dans `CLE_PUBLIQUE` (`app/abonnement.js`) ; sa clé secrète reste sur son téléphone, dans `cle-canari-SECRETE.json`. Vérifié : la clé est acceptée par le navigateur, et un code signé par une autre clé est refusé. **Chaîne vérifiée en vrai par le propriétaire (27/09/2026)** : code créé sur `gerant.html` → collé dans l'appli → abonnement activé. Tout est donc branché pour les abonnements.
- **Raccourci pour le propriétaire (fait, décision du propriétaire)** : activer un abonnement lui demande deux appuis, sans rien taper. Le message WhatsApp du client se termine par « Lien pour Canari : » et un lien vers sa page privée, rempli d'avance (`gerant.html#id=…&j=…&f=…&p=…&b=…&t=…` : numéro Canari, jours, nom et prix de la formule, nom de la boutique, numéro du client). Il touche le lien : la page affiche « Demande reçue de « Boutique Awa » : 3 mois (2 500 F). », avec le numéro Canari, la formule et le numéro du client déjà remplis ; il touche « Créer le code » puis « Envoyer sur WhatsApp », et le code part dans la conversation du client. Le lien ne contient aucun secret : sans la clé privée gardée sur son téléphone, il ne fabrique aucun code, il ne fait que remplir le formulaire. L'adresse est nettoyée après lecture, et un nouveau lien touché quand la page est déjà ouverte est pris en compte (`hashchange`). Code : `app/abonnement.js` (`choisirFormule`) et `app/gerant.html` (`lireDemande`). Reste, plus tard : un lien de paiement acceptant les **cartes** (à demander à Djamo), et l'**activation automatique** après paiement (serveur, agrégateur).

## Tableau de bord et investissements (fait, demande du propriétaire)

Demande : « une page tableau de bord où les courbes et les graphiques interprétés automatiquement permettent à l'utilisateur d'élaborer une stratégie à partir des chiffres et des tendances ; des indicateurs d'activité, d'efficacité, de profitabilité, d'investissement ; la possibilité de faire des acquisitions et des investissements. » Code : `app/tableau.js`, dictionnaire `app/langues/en-tableau.js`.

- **Où** : onglet Bilan, troisième choix « Tableau de bord » (à côté de « 7 jours » et « Mois »).
- **Période (demande du propriétaire)** : quatre boutons en haut — **Semaine** (7 jours détaillés), **Mois** (30 jours détaillés, par défaut), **Année** (12 mois civils détaillés) et **Années** (une colonne par année civile, jusqu'à 5 ans en arrière, à partir de la première année notée). Le choix vaut pour **tout** le tableau de bord et reste gardé sur le téléphone (`canari.periodeTableau`). Pour l'année, Canari prend les 12 mois civils entiers (du 1er du mois, il y a 11 mois) : sinon le premier mois serait coupé et la courbe mentirait.
- **Les dates sont écrites (demande du propriétaire)** : sous les boutons de période, « Du 31 août au 29 septembre 2026 » ; et sous chaque graphique, une ligne de repères (premier point, milieu, dernier point) — sans elle, on ne sait pas de quand parle la courbe qu'on regarde. Chaque point garde sa date (`pleine`).
- **En vue Années, la tendance compare la même tranche de l'année** : du 1er janvier à aujourd'hui contre le 1er janvier au même jour l'an dernier. Comparer une année en cours à une année entière ferait croire à une chute.
- **Deux façons de voir (demande du propriétaire : « le tableau de bord est beaucoup allongé »)** : **L'essentiel** (par défaut) et **Tout le détail**, gardé sur le téléphone (`canari.vueTableau`).
  - **L'essentiel** est une **mosaïque** : quatre grandes tuiles (ventes, bénéfice net, on me doit, en caisse), quatre petites (marge, à crédit, stock, je dois), la courbe des ventes et le comparatif « ce qui rentre / ce qui sort » en version ramassée (66 px de haut), puis les trois gestes conseillés et le bouton de téléchargement. Chaque tuile porte la couleur de son verdict.
  - **Tout le détail** garde toutes les cartes d'avant (camemberts, classements, seuil, matériel…).
- **Chaque indicateur** est une carte : son nom, son chiffre en gros, un **verdict** de couleur (olive = ça va, ocre = à surveiller, rouge = attention), sa **lecture en une phrase** écrite automatiquement, et le **geste à faire** quand il y a quelque chose à corriger.
- **Activité** : ventes de la période (courbe) avec la **tendance** (la période contre la même durée juste avant ; pas de tendance si la période d'avant est trop vide, pour éviter les « + 611 % » d'un nouvel utilisateur) ; **ce qui rentre face à ce qui sort** (barres côte à côte quand il y a 12 points ou moins, deux courbes pour 30 jours) ; meilleur jour de la semaine (7 colonnes) ; panier moyen, ventes par jour, jours sans vente.
- **Répartition (deux camemberts, demande du propriétaire)** : **d'où vient le chiffre d'affaires** (les 5 plus gros produits, puis « Autres produits » et « Ventes au montant ») et **où part l'argent** (achats de marchandise, charges fixes, impôts et taxes, autres dépenses, pris pour la maison, investissements). Dessin SVG avec des arcs, légende chiffrée en dessous sur toute la largeur (sur un petit écran, une légende à côté couperait les noms). Sept teintes de la signature, aucune couleur vive.
- **Efficacité** : taux de marge brute (bon ≥ 30 %, à surveiller ≥ 15 %) ; part vendue à crédit (bon ≤ 20 %, alerte > 40 %) avec l'âge moyen des créances ; argent récupéré sur 90 jours (bon ≥ 80 %) ; marchandise qui dort, en jours de vente (bon ≤ 15 jours, alerte > 30).
- **Profitabilité** : bénéfice net en % (courbe du bénéfice) ; seuil de rentabilité et nombre de jours où il est dépassé ; **trois classements de 5 produits** (demande du propriétaire) : par **chiffre d'affaires**, par **quantité vendue** (dans l'unité de chaque produit), et par **bénéfice** — avec, dans ce dernier, ceux qui font perdre en rouge.
- **Investissement** : ce que vaut la boutique (caisse + marchandise + créances + matériel − dettes) ; **ce qu'on peut investir** = caisse − dettes fournisseurs − un mois de charges, jamais négatif.
- **« Ce que je ferais à ta place »** : les **trois** gestes les plus utiles, choisis parmi une douzaine de règles et classés par gravité (rouge, ocre, olive). C'est la « stratégie » demandée. Le haut-parleur de l'écran lit ces trois gestes.
- **Acquisitions et investissements** : nouveau type de mouvement `invest` (bouton « Investissement » sur l'écran Jour, et « Noter un investissement » dans le tableau de bord). On note le montant, ce que c'est, et la **durée d'usage** (1, 2, 3, 5 ou 10 ans).
  - **Ce n'est pas une dépense du jour** : l'argent sort de la caisse une fois, mais le matériel sert des années. Canari étale son coût sur sa durée d'usage — « **l'usure du matériel** » — exactement comme il étale déjà les charges fixes sur les jours de travail. Une nouvelle ligne « − Usure du matériel » apparaît dans le calcul du mois, **seulement s'il y a du matériel** : une boutique sans investissement ne voit aucun changement.
  - Chaque matériel affiche ce qu'il coûte par jour, une barre d'usure, et le temps d'usage qui reste. La valeur qui lui reste entre dans « ce que vaut ta boutique ».
- **Dessins** : tout est en SVG écrit dans `tableau.js` (courbe, colonnes, barres) — aucune image à charger, aucune bibliothèque, ça marche sans internet. Mesure avec un an de données (10 400 lignes) et un processeur 6× plus lent : le tableau de bord s'ouvre en 0,37 s, et changer de période prend moins de 0,2 s.
- **Chaque carte donne toujours un conseil** (demande du propriétaire : « toutes les courbes doivent être commentées avec des suggestions d'action ») — y compris quand tout va bien, où le conseil dit quoi garder.
- **Règle pour la suite** : un nouvel indicateur doit toujours donner les quatre choses (chiffre, verdict, lecture, geste), et sa phrase doit recevoir sa traduction anglaise dans `en-tableau.js` (texte exact pour les conseils, motif `EN_MOTIFS` pour les phrases avec des chiffres). Les accords (« 1 produit » / « 3 produits ») s'écrivent en entier des deux côtés, jamais « produit(s) ».

## Télécharger ses chiffres : Excel, PDF, CSV (fait, demande du propriétaire)

- **Où** : son **propre écran**, atteint de deux endroits — Réglages → **Télécharger mes chiffres**, et le bouton en bas du tableau de bord (le propriétaire ne trouvait pas l'export quand il était caché dans les Réglages). Période au choix : 7 derniers jours, 30 derniers jours, 12 derniers mois, depuis le début, ou **deux dates choisies**. Code : `app/export.js`.
- **Trois formats, les mêmes données** :
  - **Excel (.xlsx)** : six feuilles, pour trier et calculer.
  - **PDF** : le même contenu en tableaux, prêt à imprimer ou à envoyer. Écrit à la main lui aussi (objets PDF, table des positions, polices standard Helvetica en WinAnsi — rien à embarquer). Les textes trop longs sont **coupés à la largeur de leur colonne**, sinon ils débordent sur la voisine. Au-delà de 400 lignes, le PDF renvoie vers l'Excel. Vérifié en l'ouvrant dans un vrai lecteur PDF.
  - **CSV** : la liste des mouvements seule, séparateur `;` et virgule décimale (ce qu'attend un Excel français), avec le BOM UTF-8 pour que les accents passent.
- **Un vrai fichier `.xlsx`**, fabriqué sur le téléphone, **sans aucune bibliothèque** : un fichier Excel est un ZIP de fichiers XML, et `app/export.js` écrit les deux (ZIP « stored », sans compression, plus le CRC-32 exigé par le format). L'appli reste légère et l'export marche **sans internet**.
- **Six feuilles** : Résumé (la cascade complète, ce qu'on doit, la valeur du stock), Mouvements (une ligne par opération, avec encaissé / à crédit / prix de revient / moyen de paiement), Jour par jour, Produits (quantité, chiffre d'affaires, marge, % de marge, stock), Clients, Fournisseurs.
- Les **dates sont de vraies dates** (format `dd/mm/yyyy`) et les **montants de vrais nombres** (`#,##0`) : on peut trier, filtrer et additionner dans Excel, LibreOffice ou Google Sheets. Vérifié en relisant le fichier produit.
- Le fichier part par le **menu de partage d'Android** (WhatsApp, e-mail, Drive) ou tombe dans « Téléchargements ».
- **Règle pour la suite** : une nouvelle colonne doit déclarer son format (`texte`, `nombre`, `date`, `pourcent`) dans la feuille, sinon Excel l'affiche comme du texte.

## Option Conseil : « Demande à Canari » (fait, décision du propriétaire, voir `docs/analyse-conseil-ia.md`)

Demande : une option d'intelligence artificielle où le commerçant discute et pose des questions sur son activité pour décider, **facturée** par le propriétaire.

- **Où** : bouton « Pose ta question à Canari » en bas du tableau de bord, et Réglages → **Demande à Canari**. Écran de conversation (`app/conseil.js`) avec questions toutes prêtes, clavier, et bouton « Dire » (voix).
- **Deux façons de répondre** :
  1. **Le relais** (vraie IA) : si `RELAIS.url` est rempli avec l'adresse du serveur du propriétaire, la question part avec un **résumé chiffré** de la boutique (`resumeBoutique()`, ~700 mots-jetons) et la réponse revient. **La clé de l'IA n'est jamais dans l'appli** : n'importe qui pourrait l'extraire et dépenser l'argent du propriétaire. C'est aussi le serveur qui **compte les questions** — le compteur de l'appli peut être trafiqué.
  2. **Les réponses de Canari** (défaut aujourd'hui, et repli automatique si le réseau lâche ou si le serveur ne répond pas en 20 s) : onze sujets reconnus par mots-clés (qui me doit, je dois, ce que je gagne, ma caisse, investir, quel produit, pourquoi je perds, combien vendre, mon stock, vendre plus, la maison), chacun construisant sa réponse depuis le tableau de bord. **0 F, sans internet.**
- **Payant** : l'option s'active avec un code signé dont les jours commencent par **« C »** (`…​.C92.…`). Les anciens codes, sans lettre, restent valables. `donnees.abonnement.conseil` garde la date de fin, à part de l'abonnement ; le miroir localStorage la garde aussi. La page `gerant.html` a une case « C'est l'option Conseil », cochée automatiquement par le lien (`&o=conseil`), et le journal enregistre le **prix demandé** (l'option n'a pas les prix de l'abonnement).
- **5 questions offertes** (`RELAIS.essaisOfferts`), avec un message d'avertissement à la dernière.
- **Prix proposés** : 1 mois 500 F, 3 mois 1 200 F, 1 an 4 000 F. Analyse complète dans `docs/analyse-conseil-ia.md` : une question coûte ~1,7 F avec Claude Haiku 4.5 (1 $ / 5 $ par million de mots-jetons, ~1 630 en entrée et ~250 en sortie, 1 $ ≈ 600 F à revérifier) ; marge de 76 % à l'usage normal, 52 % chez un gros utilisateur, avec une limite d'usage correct de **100 questions par mois à faire compter par le serveur**. Seuil de rentabilité : 9 abonnés avec un serveur à 3 000 F/mois, 1 seul avec une offre gratuite.
- **Traductions** : les réponses sont découpées **en phrases**, chacune traduite séparément (`tr()` phrase par phrase) et la bulle porte `translate="no"` — sinon il faudrait un motif anglais par combinaison de chiffres. Dictionnaire : `app/langues/en-conseil.js`. **Règle pour la suite** : une nouvelle réponse s'écrit en phrases courtes et autonomes, jamais en un seul bloc avec plusieurs chiffres.

## Mises à jour : prévenir l'utilisateur (fait)

**Le problème, vécu plusieurs fois par le propriétaire** : il redemandait un travail déjà livré parce que son téléphone lui montrait encore l'ancienne version. C'est normal — l'appli s'ouvre depuis la copie gardée sur le téléphone (c'est ce qui la rend rapide et utilisable sans internet), donc une nouvelle version ne s'affiche qu'à l'ouverture **suivante**.

- **Bandeau « Une nouvelle version de Canari est prête. » + bouton « Ouvrir »** sur l'écran principal, dès que le service worker a fini de télécharger la nouvelle version (`updatefound` → état `installed` avec un contrôleur déjà présent = c'est bien une mise à jour, pas une première installation). Un appui recharge : les fichiers sont déjà là.
- **Vérification quand on revient sur l'appli** (`visibilitychange`), au plus une fois par heure.
- **Le numéro de version est affiché** en bas des Réglages (« canari · Garde chaque franc. · Zéro publicité. · canari-v47 »). L'appli le demande au service worker par message (`{type:"version"}`) : aucune constante à tenir à jour en double, donc aucun risque d'afficher un faux numéro. Le numéro vit dans son propre élément avec `translate="no"`, pour que la phrase garde sa traduction anglaise.
- **À dire au propriétaire quand il ne voit pas un changement** : ouvre l'appli, attends le bandeau, touche « Ouvrir ». S'il n'apparaît pas, vérifie le numéro de version en bas des Réglages.

## Repartir à zéro (fait, demande du propriétaire)

Le propriétaire ne savait pas comment effacer ses essais avant de faire tester l'appli à un commerçant. Réglages → **Repartir à zéro** → « Tout effacer et repartir à zéro », avec **deux confirmations** (la seconde rappelle qu'on ne peut pas revenir en arrière) et un rappel de faire une sauvegarde d'abord.
- Efface les mouvements, les clients, les fournisseurs, les produits, les intrants, les charges et les paramètres de la boutique.
- **L'abonnement n'est pas touché** : il est payé, il reste (`donnees.abonnement` est recopié dans les données neuves).
- La date de dernière sauvegarde est remise à zéro, pour que le rappel reparte proprement. Code : `repartirDeZero()` dans `app/app.js`.

## Monnaie (fait, demande du propriétaire)

- Choisie au questionnaire de départ (écran « Ta boutique ») et modifiable dans Réglages → infos de la boutique. Par défaut : franc CFA d'Afrique de l'Ouest (« F »).
- Liste (`app/devise.js`) : franc CFA Ouest (XOF) et Centre (XAF), franc guinéen, congolais, rwandais, burundais, comorien, djiboutien, naira, dollar libérien, leone, dalasi, ouguiya, ariary, ou **« Autre »** avec son propre symbole. Montants **sans centimes** (les monnaies à centimes courants comme le cedi ou l'euro ne sont pas proposées, sauf par « Autre »).
- Tout suit la monnaie : montants (`franc()` → « 12 500 F », « ₦12 500 », « 12 500 GNF »), symbole à côté des champs, boutons rapides (multipliés selon la monnaie), factures, relances WhatsApp (« 5 000 naira »), voix (« 2000 naira »). Changer de monnaie **ne convertit pas** les montants déjà notés (confirmation demandée).
- Les dictionnaires anglais restent écrits avec « F » : `tr()` ramène les montants à « 12 500 F » avant de chercher, puis remet la monnaie choisie.
- L'**abonnement** reste affiché et payé en **FCFA**, quelle que soit la monnaie de la boutique.

## Langues et commandes vocales (fait, demande du propriétaire)

- **Français ou anglais** : choix sur l'écran d'accueil et dans Réglages → Langue (la page se recharge). L'appli reste écrite en français ; en anglais, `app/i18n.js` traduit chaque texte au moment où il s'affiche (dictionnaire exact `EN` + motifs `EN_MOTIFS` pour les textes avec nombres ou noms), grâce à un MutationObserver. Dictionnaires : `app/langues/en-principal.js` (app.js, index.html), `en-boutique.js` (charges, fiches, intrants, boutique), `en-extras.js` (paiements, facture, contacts, abonnement). Les textes hors écran (WhatsApp, factures dessinées, confirmations, fichiers) passent par `tr("…")`. Les dates suivent la langue (`LOCALE`), les montants gardent « 12 500 F ». Un nouveau texte doit recevoir sa traduction anglaise dans le bon dictionnaire.
- **Voix partout** (`app/voix.js`), pour ceux qui écrivent ou lisent peu (demande du propriétaire : « intégrée à chaque paramètre ») :
  - Écran Jour : **pas de bouton « Parler »** (retiré à la demande du propriétaire). La voix passe par « Dire » dans chaque fenêtre de saisie et par les haut-parleurs. (Le code des commandes générales — « Vente 2 000 », « Qui me doit ? », « Ouvre les relances »… — reste dans `voix.js`, fonction `ecouter()`, s'il faut le remettre ailleurs.)
  - Fenêtre de saisie (vente, crédit, dépense, remboursement, maison, fournisseur) : boutons « Dire » et « Écouter ». On peut tout dire : montant, « il a donné 2 000 », « tout payé / pas tout payé », nom du client ou du fournisseur, numéro (« zéro sept, zéro un… »), catégorie de dépense (loyer, marchandise, taxe…), moyen (Wave, Orange…).
  - **Conversation** : Canari dit ce qu'il a compris et ce qui manque (« Dis son numéro de téléphone »), puis écoute à nouveau ; « oui / c'est bon / enregistre » enregistre, « non / annule » ferme. Le message de fin est lu. Rien n'est enregistré sans « oui » ou le bouton.
  - Haut-parleurs « Écouter » : accueil, chaque question du questionnaire, en-tête de l'écran principal (résume l'onglet affiché : bilan, qui doit, qui relancer, semaine, stock à racheter), chaque fenêtre du bas (titre, questions et réponses déjà remplies).
  - Réglages → **Voix** : « Canari lit ses messages à voix haute » (chaque message du bas) et « Parler plus lentement » (gardés sur le téléphone).
  - La reconnaissance vocale de Chrome a besoin d'internet ; la lecture à voix haute marche en général sans. Les langues locales (dioula, baoulé…) ne sont pas reconnues. Le micro du clavier du téléphone (Gboard) reste utilisable dans tous les champs.

## Play Store (préparé, étape 8)

Tout ce qui peut être fait sans compte Google est fait. Guide pas à pas pour le propriétaire : `docs/play-store.md`.
- **Politique de confidentialité** : `app/confidentialite.html` (français + anglais), obligatoire pour le Play Store. Adresse publique : `https://mastexcel.github.io/Canari/confidentialite.html`. Lien en bas des Réglages. Contenu : tout reste sur le téléphone, aucune publicité, aucun traqueur ; la liste exacte des cas où une donnée sort (WhatsApp, sauvegarde, export, contacts, abonnement, micro, option Conseil) ; les autorisations, toutes refusables.
- **Visuels de la fiche** : `store/` — icône 512, icône maskable 512, bannière 1024 × 500, et cinq captures 1080 × 1920 fabriquées depuis une vraie boutique de démonstration bénéficiaire, chacune avec sa phrase (« Ton bénéfice du jour, sans calculer », « N'oublie plus qui te doit », « Relance sans te fâcher », « Tes chiffres, expliqués », « Une facture propre, en deux secondes »).
- **Technique** : l'appli part au Play Store en **TWA** (l'appli Android ouvre le site en plein écran, sans barre d'adresse : un seul code à maintenir). `twa-manifest.json` (réglages Bubblewrap, `packageId: ci.canari.app`), `android/` (dossier de fabrication), `.github/workflows/android.yml` (tâche manuelle qui fabrique le `.aab` — **jamais encore exécutée** : l'ordinateur de travail n'a pas accès aux outils Android de Google).
- **Deux décisions attendues du propriétaire** (détaillées dans le guide) :
  1. **12 testeurs pendant 14 jours** : pour un compte développeur personnel récent, Google l'exige avant d'autoriser la publication au grand public. Les 10 commerçants du test terrain sont exactement ces testeurs.
  2. **L'adresse du fichier de vérification** : Google vérifie `https://mastexcel.github.io/.well-known/assetlinks.json`, à la **racine du domaine**, pas dans `/Canari/`. Deux solutions : un second dépôt GitHub gratuit nommé `mastexcel.github.io`, ou un nom de domaine à soi (`canari.ci`). Modèle prêt : `app/.well-known/assetlinks.json` (l'empreinte SHA-256 est donnée par le Play Console après le premier envoi).
- **À garder précieusement** : le fichier de signature (keystore) et son mot de passe — sans eux, plus aucune mise à jour possible.

## La caisse ne peut pas être négative (fait, décision du propriétaire)

Demande : « la caisse ne peut jamais être négative, donc paramètre de sorte que s'il n'y a pas d'argent dans la caisse elle ne peut pas effectuer de dépenses en espèces, à moins de suggérer le règlement par le compte mobile money qui a un solde suffisant. » Code : `app/paiements.js`.

- **Un solde par moyen** (espèces, Wave, Orange Money, MTN, Moov, Djamo) : `soldeMoyen(k)` = argent du départ + tout ce qui est entré − tout ce qui est sorti, depuis le premier jour. `caisseTotale()` (tableau de bord, « ce que vaut ta boutique », « ce qu'on peut investir ») passe maintenant par ce même calcul : **un seul argent en caisse pour toute l'appli**.
- **L'argent du départ est indispensable.** Sans lui, une boutique qui commence Canari avec 40 000 F dans son tiroir partirait de zéro et ne pourrait pas noter sa première dépense. Il est donc demandé **dans le questionnaire de départ** (nouvelle étape « L'argent que tu as maintenant », après « Ta boutique ») et corrigeable à tout moment dans **Réglages → Argent en caisse**, où le commerçant **compte son argent et écrit ce qu'il a** : Canari en déduit le départ (`poserSolde()`). C'est le même principe que le stock de départ.
- **Le garde-fou** : toute sortie d'argent (dépense, pris pour la maison, investissement, paiement fournisseur, part versée d'une dette, arrivage ou achat d'intrant payé) est refusée si elle dépasse le solde du moyen choisi. Types concernés : `SORTIES` dans `paiements.js`. Une **vente, un remboursement ou un achat à crédit ne sont jamais bloqués** : rien ne sort.
- **Trois sorties honnêtes, jamais « note-le quand même »** :
  1. **payer avec un compte qui a assez** — c'est la suggestion demandée. Chaque bouton « Payé avec… » affiche son solde (« Espèces 5 000 F · Wave 20 000 F ») : on choisit en voyant. Toucher un autre compte efface le refus ;
  2. **prendre la marchandise à crédit** chez le fournisseur (conseillé pour une dépense ou un arrivage) ;
  3. **corriger son argent** dans Réglages, si le commerçant a de l'argent que Canari ne connaît pas.
- **Le message** : une phrase rouge (« Espèces : tu n'as que 5 000 F. Il manque 3 000 F. ») et, en dessous, un conseil fixe selon le cas (`#erreur-aide`, `#arrivage-erreur-aide`). Le conseil est **une phrase entière sans chiffre**, pour qu'une seule entrée de dictionnaire suffise ; seule la phrase chiffrée a un motif `EN_MOTIFS`. La voix lit les deux.
- **C'est un paramètre** (demande du propriétaire) : Réglages → Argent en caisse → « M'empêcher de dépenser l'argent que je n'ai pas », actif par défaut (`donnees.boutique.gardeCaisse`). Éteint, l'appli se comporte comme avant.
- **L'écran Jour montre maintenant ce qui reste vraiment** (« Argent en caisse 25 000 F », détail du jour en dessous) et non plus l'entrée moins la sortie du jour : sinon le chiffre affiché et le chiffre qui bloque seraient différents, et le refus passerait pour un bug. Les vues 7 jours et Mois, qui sont bien des flux, s'appellent désormais « Entré moins sorti sur 7 jours / ce mois ».
- **Deux bugs corrigés au passage** : un **investissement** ne sortait pas de la caisse par moyen (`caisseParMoyen`) et n'avait pas de choix « Payé avec… ».
- **Règle pour la suite** : tout nouveau mouvement qui fait sortir de l'argent doit être ajouté à `SORTIES` et passer par `verifierSortie()` avant d'être enregistré.


## La facture d'abonnement (fait, demande du propriétaire)

Demande : « lorsqu'un utilisateur s'abonne, il doit recevoir une facture d'abonnement de Canari par WhatsApp et par e-mail. Canari est une application de **Bridge Investment & Partners** et je souhaite que sur la facture et **uniquement** sur la facture apparaissent le logo de BIP et celui de Canari. » Code : `app/facture-abo.js`, coordonnées dans `app/emetteur.js`, logo dans `app/icones/bip.webp`.

- **Uniquement sur cette facture-là.** Les factures et reçus que le commerçant envoie à SES clients portent le logo de SA boutique et rien d'autre (`app/facture.js`, inchangé). Le logo BIP n'apparaît nulle part ailleurs dans l'appli.
- **Quand.** Dès que le code d'activation est accepté, la facture est créée et le message du bas propose « Ma facture ». Elle se retrouve ensuite à tout moment dans **Mon abonnement → Mes factures d'abonnement** (les 60 dernières).
- **Ce qu'elle porte** : les deux logos (BIP à gauche, l'éditeur ; Canari à droite, le produit), les coordonnées de l'émetteur, le numéro, la date, le client (boutique, numéro Canari, téléphone, e-mail), la ligne « Abonnement Canari — 3 mois » avec la période couverte, le total et la mention « Payé — merci ! ».
- **Le numéro** : `CAN-` + le numéro Canari du téléphone + le rang (`CAN-K7P2QX9M-01`). Chaque commerçant compte de son côté, et le numéro Canari étant unique, deux clients ne peuvent pas avoir la même référence. La page `gerant.html` calcule le même numéro depuis son journal.
- **Le prix** vient de la formule demandée sur ce téléphone, gardée dans `donnees.abonnement.demande` au moment où le commerçant touche « Envoyer ta demande » : le code d'activation, lui, ne contient que des jours. À défaut, le prix est déduit des jours (`FORMULES`).
- **L'e-mail du commerçant** est demandé à l'écran d'abonnement (étape 3), gardé sur le téléphone, ajouté au message WhatsApp de la demande et au lien vers `gerant.html` (`&m=`).
- **L'envoi** : bouton « Envoyer sur WhatsApp » (la facture **écrite**, comme pour les factures de vente : un lien WhatsApp ne peut pas transporter une image ; elle est copiée dans le presse-papier quand le téléphone le permet) et bouton « Envoyer par e-mail » (`mailto:` pré-rempli). « Enregistrer l'image » et « Partager » restent en dessous.
- **Côté propriétaire** : `gerant.html` affiche la même facture écrite après la création du code, avec « Copier », « Envoyer sur WhatsApp » et « Envoyer par e-mail ». Il peut donc la renvoyer lui-même, sous le nom de BIP.
- **Les mentions légales, fournies par le propriétaire le 29/09/2026** (déclaration fiscale d'existence + registre du commerce) : **SARL au capital de 3 000 000 F CFA**, **Cocody Riviera Faya, Abidjan**, **07 48 34 66 50** (fixe : 25 22 02 01 80), **RCCM CI-ABJ-03-2022-B12-00279**, **compte contribuable 2205980 D**. Elles sont dans `app/emetteur.js`.
- **E-mail de BIP (fourni le 29/09/2026) : `jja@bridgeinvestmentpartners.net`**, dans `EMETTEUR.email` ; il paraît sous le logo BIP sur la facture dessinée et dans la facture écrite (WhatsApp, e-mail).
- **Il manque encore deux choses** (`docs/informations-bip.md`) : la **mention de TVA** (la case TVA n'est pas cochée sur la déclaration, régime « IM » ; la phrase exacte vient du comptable, elle engage la responsabilité fiscale et Canari ne l'invente pas), et la **vérification des deux numéros à l'écran par le propriétaire**. À signaler aussi : le registre du commerce dit « BRIDGE INVESTMENT PARTNERS », le logo dit « BRIDGE INVESTMENT & PARTNERS » ; c'est la version du logo qui est écrite.
- **Ce qui demanderait un serveur** : l'envoi **automatique** de la facture par e-mail. Une page web ne peut ni envoyer un e-mail toute seule, ni joindre une image à un `mailto:` ou à un lien WhatsApp. Aujourd'hui, le commerçant a sa facture à coup sûr (elle est fabriquée sur son téléphone) et l'envoie en un geste ; le propriétaire peut la lui renvoyer. C'est la même limite que le paiement automatique et l'activation automatique.
- **Règle pour la suite** : les coordonnées de l'émetteur vivent dans `app/emetteur.js` **et nulle part ailleurs** — le fichier est chargé par l'appli et par `gerant.html`, pour que les deux écrivent exactement la même facture.


## Hors version 1 (plus tard)

Compte en ligne et synchronisation, plusieurs vendeurs par boutique, paiement mobile automatique dans l'appli (voir ci-dessus), activation automatique de l'abonnement, autres langues (dioula, baoulé), autres pays.

## Ordre de travail conseillé

1. Installer le projet et afficher un premier écran aux couleurs de Canari, avec l'icône.
2. Écran principal et saisie des ventes et dépenses, enregistrés sur le téléphone.
3. Crédits clients, remboursements et onglet Crédits.
4. Pris pour la maison, dettes et paiements fournisseurs.
5. Onglet Relances avec WhatsApp.
6. Onglet Semaine et bilan du jour.
6 bis. Paramètres (logo, nom), produits et prix, vente par produits, factures et reçus d'acompte en image sur WhatsApp, stock simple.
7. Export des données, tests sur un vrai téléphone d'entrée de gamme.
7 bis. **Test avec de vrais commerçants (en cours)** : guide de terrain prêt dans `docs/test-terrain.md` — 10 commerçants, 6 gestes à faire seul, questions de prix, fiche à remplir, seuils de décision. Sert à répondre à deux questions : l'appli est-elle comprise sans aide, et paieront-ils 1 000 F par mois ? Les résultats décident de la suite (corriger l'appli, ou ajuster le prix, ou lancer).
7 quater. **Export Excel** et **option Conseil** (« Demande à Canari »), payante (fait).
7 ter. **Tableau de bord** : indicateurs d'activité, d'efficacité, de profitabilité et d'investissement, lus et expliqués, avec les trois gestes conseillés ; investissements et acquisitions (fait).
8. **Play Store (préparé)** : politique de confidentialité, visuels de la fiche, réglages TWA, guide pas à pas (`docs/play-store.md`). Reste au propriétaire : le compte développeur, les 12 testeurs et le choix du domaine.

À chaque étape : montrer le résultat, expliquer comment le tester, attendre l'avis du propriétaire avant de passer à la suite.

## Marque et droits

- **Canari est une application de Bridge Investment & Partners (BIP).** Le logo de BIP n'apparaît que sur la facture d'abonnement (voir plus haut) : nulle part ailleurs dans l'appli.
- Le nom Canari n'a pas encore été déposé. Avant le lancement public : recherche d'antériorité puis dépôt à l'OAPI via l'OIPI (Abidjan-Plateau).
- Ne jamais utiliser de personnages, logos ou noms d'autres marques.

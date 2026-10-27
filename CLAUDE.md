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
- **Couleurs (charte BIP depuis le 02/10/2026, voir plus bas)**
  - Graphite `#1A1B20` → `#121319` (couleur principale : fonds sombres, textes, barre du haut)
  - Braise `#DC3F17`, braise vive `#F46134`, braise profonde `#8E1F0C` (l'orange-rouge du logo BIP : accents de marque)
  - Gris BIP `#8E929B` (le « B » du logo : filets, dessins de fond)
  - Ivoire `#FCFAF7` et rosé pâle `#F8EFE9` (fonds clairs de l'appli)
  - Or `#C2802F` (pièces)
  - Couleurs de sens, inchangées : vert olive `#5E7033` = argent qui entre, rouge `#B8412B` = argent qui sort, ambre `#96701F` = crédit, ardoise `#4A5873` = maison
  - *Avant* : vert forêt `#174A3F`, terre cuite `#C8643A`, or `#F2B233`, sable `#F6EEE3`.
- **Charte graphique : celle du logo BIP (demande du propriétaire du 02/10/2026 : « l'application doit être attractive, créer de l'émotion en offrant une atmosphère unique et une expérience unique de navigation, des fonds soignés et originaux ; utilise d'autres couleurs tant que cela ne brise pas la dynamique de la charte ; bascule sur la charte du logo BIP »)**, dans `app/style.css`, sections « SIGNATURE GRAPHIQUE CANARI » et « ATMOSPHÈRE ». Inspirée des pages du site BIP Corporate Finance fournies par le propriétaire (héros sombre, braise orange-rouge, grille fine, sections claires rosées).
  - **Deux registres qui se répondent, et c'est là que naît l'émotion.** Les **grands moments sont sombres** : l'écran d'accueil, la carte du jour, « On me doit », « Je dois », la semaine, le mois, le stock — graphite, braise qui chauffe un coin, grille fine, vagues de Canari en filigrane clair ; le chiffre sort en blanc du fond chaud. Le **travail reste clair** : listes, fenêtres de saisie, réglages, tableau de bord gardent l'ivoire, parce qu'on y lit longtemps, en plein soleil, sur un écran bon marché.
  - **Trois familles de couleurs** : **ivoire** (`--ivoire`, `--ivoire-2`, `--sable` — le rosé pâle des sections claires du site BIP), **braise** (l'orange-rouge du logo : `--braise-vive` `#F46134`, `--braise` `#DC3F17`, `--braise-profonde` `#8E1F0C`, plus la famille `--ocre-*` qui pointe dessus) et **gris chaud** (`--gris-900` à `--gris-50`, dont `--gris-400` `#8E929B`, le gris du « B » du logo).
  - **Le vert n'est plus une couleur de marque, seulement une couleur de sens.** L'ancienne famille `--olive-*` est devenue un **alias du gris** : les deux mille lignes de règles qui l'utilisaient pour des choses neutres (titres, boutons de réglage, filets, puces) ont basculé d'un coup sur le graphite BIP. Le vert vit désormais dans `--entre` seul.
  - **Les couleurs de sens ne bougent pas** : olive/vert = argent qui entre, **rouge = argent qui sort et nombre négatif**, ocre = crédit, ardoise = maison.
  - **La braise n'est jamais un bouton d'argent.** Elle ne sert qu'aux surfaces de marque : fond sombre, dégradés, filets du haut des cartes, onglet actif, bouton « Commencer », titres de réglage. Sinon le rouge perdrait son seul sens, l'argent qui sort. **Règle pour la suite** : ne jamais poser la braise sur un bouton qui note un mouvement d'argent.
  - **Les dessins** (SVG écrits dans le CSS, aucune image à charger) : **les rubans** (`--motif-rubans`, le fond de l'appli — voir ci-dessous) ; les **lignes de crête** à deux échelles — `--motif-cretes` (640 px, chaud) et `--motif-cretes-gris` (900 px, gris froid), gardées pour les cartes sombres et la fenêtre de saisie ; la **grille** de BIP (`--motif-grille`, `--motif-grille-claire`) ; la **poussière** (`--motif-poussiere`, un grain très fin qui creuse les fonds sombres) ; la **frise** (`--motif-frise`, le zigzag du canari réduit à un fil de braise de 0,8 px à 17 % — assez pour qu'on le sente, pas assez pour qu'on le regarde) ; et la **braise** (`--lueur-braise`, `--fond-braise` : graphite + deux lueurs chaudes + grille, le fond de tous les grands moments).
  - **Le fond de la page : LES RUBANS (choix du propriétaire du 02/10/2026, parmi quatre propositions dessinées pour lui — les dunes, les rubans, le canari, le souffle).** De larges barres en courbe qui traversent l'écran. Chaque ruban est un **trio** — une bande très large et très pâle, une bande moyenne plus soutenue, un fil fin par-dessus — ce qui lui donne une épaisseur et une ombre au lieu d'un simple trait. Quatre trios, dans les couleurs de la charte : braise et doré en haut, gris et graphite au milieu, olive plus bas, braise tout en bas.
    Le fond reste en trois couches, toutes **fixes** derrière le contenu, donc jamais redessinées au défilement — c'est ce qui le garde fluide sur un petit téléphone :
    1. la **teinte** (`body`) — ivoire chaud qui glisse vers le rosé puis le gris ;
    2. les **lueurs** (`body::before`) — deux voiles très diffus, braise en haut à droite, olive en bas à gauche ;
    3. les **rubans** (`body::after`) — posés en `cover` et **effacés en haut et en bas par un `mask-image`**.
    **L'accueil ne porte PAS les rubans** (choix du propriétaire, 02/10/2026) : il garde le graphite, la braise, la grille fine de BIP et la grande forme ronde très douce en haut à gauche. Les rubans y chargeaient l'image.
    **Piège à connaître** : un SVG de fond garde ses proportions même avec `background-size: 100% 100%` — le navigateur le centre et laisse deux bandes vides sur les côtés. Il faut `preserveAspectRatio="xMidYMid slice"` sur le SVG **et** `cover` en CSS.
  - **Un seul dessin de bouton pour toute l'appli (demande du propriétaire, 02/10/2026 : « je souhaite que dans toute l'application les boutons soient comme sur cette interface, même design, avec des couleurs différentes ; pour le vert prends le vert olive »)**, section « LES BOUTONS » de `app/style.css`. Il montrait l'écran d'accueil ; on en tire **deux formes, et deux seules** :
    1. **le bouton plein** (« Commencer ») — un dégradé de sa couleur, plus clair en haut à gauche et plus profond en bas à droite, le texte en blanc, une lueur de la même couleur posée dessous. C'est l'action principale de l'écran : Commencer, Vente, Dépense, Crédit, Enregistrer, Il a payé, Sauvegarder, le bouton du message du bas, la bascule retenue ;
    2. **le bouton cerné** (« Français » / « English ») — un fond à peine teinté, un bord de 2 px, le texte dans la couleur. C'est le second choix, un réglage, une bascule : Pris pour la maison, Dette fournisseur, Relancer, Annuler, Écouter, les montants rapides, les cases des Réglages.
    Chaque bouton ne change que sa **couleur** (`--teinte`), jamais son dessin : olive = argent qui entre, rouge = argent qui sort, ambre = crédit, ardoise = maison et matériel, braise = la marque, graphite = le neutre. Les trois gros boutons sont donc **pleins** maintenant, avec leur icône en médaillon clair, au lieu des cartes pâles d'avant. **Règle pour la suite** : un nouveau bouton reçoit une `--teinte` et l'une des deux formes ; on ne dessine pas un bouton de plus à la main.
  - **Le vert est un vert OLIVE** (choix du propriétaire) : `--entre` `#5E7033`, `--entre-fonce` `#44521F`, `--entre-clair` `#A9B97B`, `--entre-100` `#EBF0DB`. Blanc sur olive : 5,7:1.
  - Contrastes vérifiés : blanc sur le fond sombre ≈ 15:1, texte doux `#BDB6B0` ≈ 8,8:1, braise `#F46134` ≈ 5,6:1 — tous au-dessus du minimum exigé (4,5:1).
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
- **Les fonds dessinés (images fournies par le propriétaire le 05/10/2026 : « utilise ces arrière-plans en fonction des interfaces dans l'application »)**, dans `app/icones/fonds/` et la section « LES FONDS DESSINÉS » de `app/style.css`. Il a livré **deux sortes d'images**, et elles ne servent pas à la même chose :
  1. des **plaques vides** — `fond-page` (ivoire et sauge, filets dorés, grille de points) et `fond-carte` (ivoire, vague verte et or, frise ethnique). Ce sont de vrais fonds : on écrit par-dessus ;
  2. des **scènes** — la mascotte dans un décor : `canari-marche` (le marché en plein jour), `canari-boutique` (les étagères et le téléphone validé), `canari-outils` (les outils qui flottent), `canari-croissance` (la courbe qui monte et les piles de pièces). Ce sont des illustrations : **on ne met jamais de texte dessus**, elles remplacent une vignette.
  - **Où elles vont** : `fond-page` est le fond de toute l'appli (`body::after`, fixe, à 78 % et effacé en haut et en bas, exactement comme les rubans qu'il remplace) ; `fond-carte` habille les écrans vides et le bandeau des comptes annuels ; `canari-outils` ouvre le questionnaire, `canari-marche` l'écran Jour vide, `canari-boutique` le Stock vide, `canari-croissance` les comptes annuels.
  - **Elles sont VERTES, et la charte est au graphite et à la braise de BIP depuis le 02/10/2026.** Elles sont donc posées là où elles ne croisent **aucune couleur de sens** (vert = argent qui entre, rouge = argent qui sort) : le fond de page, les écrans vides, le questionnaire, les comptes annuels. Les écrans de travail — listes, saisie, réglages — gardent l'ivoire, parce qu'on y lit longtemps, en plein soleil, sur un écran bon marché. L'accueil ne change pas : il garde le graphite et la braise que le propriétaire a choisis.
  - **Le voile est obligatoire sous un texte.** `fond-carte` porte une large vague vert foncé : sans voile, la phrase « Ajoute les produits que tu vends » tombait dessus en gris sur vert et devenait illisible (vu à l'écran le 05/10/2026). Un dégradé ivoire à 80-88 % est donc posé **par-dessus** l'image : le motif se devine, le texte garde son fond clair quelle que soit la hauteur de la carte. Contraste mesuré après correction : **5,2:1** (minimum exigé 4,5:1).
  - **Poids** : six WebP, **87 Ko en tout**. Chacune est réduite à la taille où elle s'affiche vraiment — une image deux fois trop grande coûte quatre fois plus cher à décoder sur un téléphone d'entrée de gamme.
  - **Règle pour la suite** : une plaque se pose en fond avec son voile ; une scène se pose en `<img class="scene">` et ne reçoit jamais de texte par-dessus.
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
- Couleurs de sens constantes : vert = argent qui entre, rouge = argent qui sort, ambre = crédit, ardoise = maison. Elles n'ont pas bougé avec la charte BIP : la braise de BIP ne sert jamais à un bouton d'argent.
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

- **Les prix (revus le 17/10/2026, demande du propriétaire : « aligne-toi sur la tarification des applications similaires avec un léger avantage prix en notre faveur ; les prix pratiqués actuellement me semblent trop petits »)**. Relevé du marché et raisonnement complets dans `docs/analyse-prix.md`. Trois formules, qui se distinguent par le **nombre d'entreprises** :

| Formule | Entreprises | 1 mois | 3 mois | 1 an | ramené au mois |
|---|---|---|---|---|---|
| **Solo** | 1 | 3 000 F | 8 000 F | 27 000 F | 2 250 F |
| **Multi** | 3 | 5 000 F | 13 500 F | 45 000 F | 3 750 F |
| **Pro** | 10 | 8 000 F | 21 500 F | 72 000 F | 6 000 F |

  L'année se paie toujours **neuf mois pour douze**. *Avant* : 1 000 / 2 500 / 9 000 F, une seule entreprise.
  **Pourquoi ces chiffres** : le marché se coupe en deux. Les carnets de crédit pour micro-commerçants (OkCredit, Khatabook, IKA DJAGO) sont **gratuits, payés par la publicité** — Canari a promis de ne jamais en mettre, il doit donc faire payer. Les logiciels de gestion pour PME d'Afrique francophone vont de 3 000 F (GestionsPro Basic) à **8 900 F pour UNE boutique** (FiaVia Essentiel, le comparable le plus proche), 10 000 F (Ngavix), 15 000 F et plus (Madata), 59 900 F (KiboERP). Canari est entre les deux : l'entrée de gamme à 3 000 F est **trois fois l'ancien prix** et **trois fois moins cher que FiaVia** pour la même chose ; même la formule Pro (dix entreprises) reste sous le prix d'une seule boutique chez FiaVia. Pour un commerçant qui gagne 5 000 à 15 000 F par jour, 3 000 F par mois font 1 à 2 % de son bénéfice ; à 8 900 F on serait à 6 %, impayable.
  **Les prix relevés viennent de pages d'éditeurs trouvées sur le web, pas de devis vérifiés** : à confirmer avant d'en faire un argument public. Le terrain tranchera (`docs/test-terrain.md`, mis à jour : la question est maintenant « paierais-tu 3 000 F par mois ? »).
  **Où vivent les prix** : `PRIX` dans `app/abonnement.js` (la source), recopiés dans `tunnel/fabriquer-scenarios.py` (c'est le serveur qui encaisse) et dans la liste de `app/gerant.html`. Si un prix change, ces trois endroits changent **et** les visuels de `store/pub/` se refont.
- **Gratuit 1 mois** (30 jours depuis le premier jour d'utilisation ; décision du propriétaire du 02/10/2026, l'essai était de 3 mois), puis payant. `ESSAI_JOURS` dans `app/abonnement.js`. Le bandeau prévient **7 jours** avant la fin (`PREVENIR_JOURS`) : sur un essai d'un mois, dix jours d'avertissement, c'était un tiers de l'essai passé à être relancé.
  - **Personne n'est coupé net** : un commerçant qui utilisait déjà Canari depuis plus d'un mois se serait retrouvé bloqué du jour au lendemain, sans rien avoir vu venir. À la première ouverture de cette version, s'il était encore en essai sous l'ancienne règle des 90 jours, il reçoit **7 jours** à partir de ce jour-là (`a.essaiJusqua`, posé une seule fois, gardé aussi dans le miroir localStorage). Vérifié sur quatre cas : nouveau → 30 jours ; 20 jours d'usage → 10 ; 50 jours → 7 ; 100 jours → 0. Prix proposés : 1 mois 1 000 F, 3 mois 2 500 F, 1 an 9 000 F (conseillé). À confirmer par le propriétaire et sur le terrain.
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

## Guide de l'utilisateur (fait, demande du propriétaire)

Demande du 02/10/2026 : « insère une page dénommée Guide de l'utilisateur, où du détail pas à pas l'utilisation de l'application ». Code : `app/guide.html`.

- **Une page à part**, comme `confidentialite.html` : elle s'ouvre seule, se partage par un lien, s'imprime, et **marche sans internet** (elle est dans `FICHIERS` du service worker). Adresse publique : `https://mastexcel.github.io/Canari/guide.html`.
- **Seize sections**, dans l'ordre où un commerçant découvre l'appli : installer, le premier démarrage, l'écran du jour, une vente, le crédit et le remboursement, une dépense, l'argent de la maison, les fournisseurs, les relances WhatsApp, les produits et le stock, les factures, lire ses chiffres, parler au lieu d'écrire, la sauvegarde, l'abonnement, et « si quelque chose ne va pas ». Un sommaire cliquable en haut.
- **Écrit pour quelqu'un qui n'a jamais utilisé d'application de gestion** : des étapes numérotées, des tableaux « ce que tu vois / ce que ça veut dire », les couleurs de sens expliquées, et des encadrés — vert pour un conseil, rouge pour un avertissement (la sauvegarde, le garde-fou de la caisse, la reconnaissance vocale qui a besoin d'internet).
- **Aux couleurs de la charte BIP** : en-tête sombre graphite et braise comme l'accueil de l'appli, cartes blanches, filets de braise devant les titres. La page n'a **aucune dépendance** : pas de police à télécharger, pas de script, tout est dans le fichier.
- **Où on y entre** : Réglages → première carte, **« Guide de l'utilisateur »** avec le bouton « Ouvrir le guide » ; et un lien discret tout en bas des Réglages, à côté de la politique de confidentialité.
- **Version anglaise** en bas de la même page (`<section class="en">`), plus ramassée mais complète.
- **Règle pour la suite** : quand une fonctionnalité change, la section correspondante du guide change avec elle. Un guide faux est pire que pas de guide.

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

## Les visuels de publicité (fait, demande du propriétaire)

Demande du 02/10/2026 : « crée les images pour faire la publicité de l'application auprès du public ». Tout est dans `store/pub/`, avec son mode d'emploi (`store/pub/LISEZ-MOI.md`).

- **Sept visuels**, aux couleurs de la charte BIP, avec de vraies captures de l'appli :
  - **deux statuts WhatsApp / stories** 1080 × 1920 — « Tu sais combien tu as *vraiment* gagné aujourd'hui ? » et « Qui te doit de l'argent ? Canari s'en souvient. » ;
  - **trois carrés** 1080 × 1080 — la marque, la relance (avec le message tout écrit), et le prix ;
  - une **bannière** 1200 × 630 — couverture de page, et aperçu du lien ;
  - un **flyer A5 à imprimer** 1748 × 2480 (300 dpi) avec un **QR code** vers l'adresse de l'appli : au marché, personne ne tape une adresse à la main.
- **Fabriqués par le code, jamais à la main** : `store/pub/fabriquer.py` écrit une page HTML (polices, mascotte, captures et QR en base64, aucune dépendance extérieure), `store/pub/photographier.mjs` photographie chaque section à la taille exacte. Si un prix, le slogan ou une capture changent, on relance les deux scripts.
- **L'aperçu du lien** : `app/index.html` porte les balises `og:` et `twitter:card`, et l'image `app/icones/partage.jpg` (1200 × 630, 79 Ko, compressée exprès puisqu'elle est téléchargée par celui qui reçoit le lien). Sans ça, le lien arrive nu sur WhatsApp — et personne ne touche un lien nu.
- **Règle pour la suite** : jamais de logo ni de personnage d'une autre marque sur un visuel (on peut **nommer** WhatsApp, pas poser son logo) ; jamais de promesse de gain (« gagne plus », « double ton chiffre ») — Canari compte ce que le commerçant gagne, il ne le fait pas gagner ; et si un prix change, on refait les images.

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
- **Les mentions légales, fournies par le propriétaire le 29/09/2026** (déclaration fiscale d'existence + registre du commerce) : **SARL au capital de 3 000 000 F CFA**, **Cocody Riviera Faya, Abidjan**, **05 84 37 48 48** (le numéro WhatsApp du propriétaire, choisi par lui pour les documents ; la déclaration portait aussi le 07 48 34 66 50 et le fixe 25 22 02 01 80), **RCCM CI-ABJ-03-2022-B12-00279**, **compte contribuable 2205980 D**. Elles sont dans `app/emetteur.js`.
- **E-mail de BIP (fourni le 29/09/2026) : `jja@bridgeinvestmentpartners.net`**, dans `EMETTEUR.email` ; il paraît sous le logo BIP sur la facture dessinée et dans la facture écrite (WhatsApp, e-mail).
- **Mention de TVA (donnée le 29/09/2026) : « TVA non applicable »**, dans `EMETTEUR.tva` ; elle paraît sous « Payé — merci ! ». Traduction anglaise : « VAT not applicable ».
- **Le nom écrit sur la facture est celui du registre du commerce : « Bridge Investment Partners », sans le « & »** (choix du propriétaire le 29/09/2026 : c'est cette dénomination qui engage l'entreprise devant les impôts). Le **logo**, lui, garde son « & » : c'est une image du propriétaire, elle n'est pas retouchée.
- **Il ne manque plus que** la **vérification des deux numéros à l'écran par le propriétaire** (`docs/informations-bip.md`).
- **Ce qui demanderait un serveur** : l'envoi **automatique** de la facture par e-mail. Une page web ne peut ni envoyer un e-mail toute seule, ni joindre une image à un `mailto:` ou à un lien WhatsApp. Aujourd'hui, le commerçant a sa facture à coup sûr (elle est fabriquée sur son téléphone) et l'envoie en un geste ; le propriétaire peut la lui renvoyer. C'est la même limite que le paiement automatique et l'activation automatique.
- **Règle pour la suite** : les coordonnées de l'émetteur vivent dans `app/emetteur.js` **et nulle part ailleurs** — le fichier est chargé par l'appli et par `gerant.html`, pour que les deux écrivent exactement la même facture.


## Les comptes annuels : bilan et compte de résultat (fait, demande du propriétaire)

Demande du 05/10/2026 : « crée une page qui permet de générer le bilan et le compte de résultat annuel et pluriannuel, accompagnés d'une analyse financière détaillée avec graphiques, ratios et conseils indicatifs ». Code : `app/comptes.js`, dictionnaire `app/langues/en-comptes.js`.

- **Où** : onglet Bilan, quatrième choix **« Comptes annuels »** (à côté de 7 jours, Mois et Tableau de bord). Les quatre boutons passent sur deux lignes (`.quatre-choix`) : quatre ne tiennent pas sur 320 px.
- **Deux vues** : **Une année** (le détail, avec le choix de l'année) ou **Plusieurs années** côte à côte, jusqu'à **5 colonnes** (`ANNEES_COMPTES`) — au-delà, les colonnes deviennent illisibles sur un téléphone. Le choix est gardé sur le téléphone (`canari.anneeComptes`, `canari.vueComptes`).
- **Le compte de résultat** est la somme des jours de l'année : chaque jour porte déjà sa part de charges (`calculTotauxDuJour`). Cascade : ventes − prix de revient = marge brute ; − autres dépenses − charges fixes − usure du matériel = résultat avant impôts ; − impôts et taxes = **bénéfice net** ; − pris pour la maison = reste pour la boutique. La ligne « Pris pour la maison » garde **l'ardoise**, jamais le rouge : ce n'est pas une perte, c'est de l'argent qui change de poche.
- **Le bilan** est une photo à une date (31 décembre, ou aujourd'hui pour l'année en cours), calculée en rejouant les mouvements jusqu'à cette date (`bilanAu(ts)`). Actif : caisse (départ + flux), créances clients, stock (produits + intrants), matériel (valeur nette après usure). Passif : dettes fournisseurs, et **capitaux propres = actif − dettes**. Il s'équilibre donc par construction — c'est volontaire et c'est dit à l'écran.
- **Douze ratios**, chacun avec les quatre choses obligatoires (chiffre, verdict de couleur, lecture en une phrase, geste à faire), dans les **mêmes trois couleurs que le tableau de bord** (`bon` / `attention` / `alerte`) : taux de marge brute, taux de bénéfice net, poids des charges et taxes, croissance des ventes, marchandise qui dort, délai de paiement des clients, délai de paiement aux fournisseurs, argent immobilisé (BFR), combien de temps on tient sans vendre, ce qui t'appartient vraiment (autonomie financière), ce que rapporte ton argent (rentabilité des capitaux), ventes minimum pour ne rien perdre (seuil de rentabilité).
- **Une année en cours ne se compare jamais à une année entière** (`ventesTranche`) : au 5 octobre, neuf mois contre douze feraient croire à une chute de 25 % alors que rien n'a bougé. On compare du 1er janvier à aujourd'hui contre le 1er janvier au même jour l'an dernier. Vérifié : la même boutique passait de « −12 % » à « +19 % » après correction.
- **Une caisse négative se dit avec des mots**, jamais en « −55,5 mois » : « Ta caisse est dans le rouge : il est sorti X de plus qu'il n'est entré », et le geste renvoie à Réglages → Argent en caisse (il manque presque toujours l'argent du départ).
- **Trois graphiques en SVG écrit à la main** (rien à charger, marche sans réseau) : colonnes ventes + bénéfice année par année, la cascade du compte de résultat en barres, et le bilan en deux piles (ce que la boutique possède / à qui c'est). Chaque bloc d'une pile porte son nom et son montant en `title`, pour les lecteurs d'écran.
- **L'analyse écrite** en quatre parties (ton activité, ce que tu gagnes vraiment, ce que vaut ta boutique, comment ton argent circule). Comme pour `conseil.js`, elle est faite de **phrases courtes et autonomes**, chacune traduite séparément : aucune ne doit dépendre de la précédente.
- **Télécharger** : PDF et Excel, fabriqués par `fabriquerPdf` et `fabriquerClasseur` de `export.js` (rien de dupliqué). Quatre feuilles : Compte de résultat, Bilan, Ratios, Analyse et conseils. Vérifié : vrai PDF, vrai .xlsx relu feuille par feuille.
- **Trois approximations, dites honnêtement à l'écran** dans « Ce que Canari sait, et ne sait pas » : les charges d'une année passée sont réparties avec les montants d'aujourd'hui (Canari ne garde pas l'historique des réglages) ; le stock est compté au prix d'achat moyen d'aujourd'hui ; la caisse part de l'argent de départ déclaré. Et la phrase qui compte : ce sont des **comptes de gestion, faits pour décider** — pour les impôts ou une banque, un comptable doit les vérifier. Un chiffre faux présenté comme vrai est pire que pas de chiffre.
- **Règle pour la suite** : un nouveau ratio donne les quatre choses, reçoit sa traduction dans `en-comptes.js` (texte exact pour les conseils, motif `EN_MOTIFS` pour les phrases chiffrées), et toute comparaison avec l'année d'avant passe par `ventesTranche` tant que l'année en cours n'est pas finie.

## Les états financiers OHADA (fait, demande du propriétaire)

Demande du 05/10/2026 : « je souhaite qu'il y ait un vrai bilan et un vrai compte de résultat au sens strict de l'OHADA, à consulter à la demande, en plus de ce que tu as déjà fait ». Code : `app/ohada.js`, dictionnaire `app/langues/en-ohada.js`. Référentiel : **SYSCOHADA révisé** (Acte uniforme relatif au droit comptable et à l'information financière, applicable depuis le 01/01/2018 dans les 17 pays de l'OHADA).

- **Deux écrans qui ne parlent pas à la même personne.** « Comptes annuels » (`comptes.js`) parle au **commerçant** : en français simple, ce qu'il a gagné et ce que vaut sa boutique. « États financiers OHADA » parle à son **comptable, sa banque et aux impôts** : la même réalité, dans le cadre officiel, avec les intitulés et les codes du modèle (TA, RA, XA, XB, XC, XD, XE, XG, XI, AM, AZ, BB, BI, BK, BS, BT, BZ, CA, CH, CJ, CP, DJ, DP, DR, DT, DZ). On y entre par le bas des Comptes annuels et par **Réglages → Mes états financiers OHADA** ; le bouton « Retour » ramène d'où l'on vient (`retourOhada`).
- **Le bilan s'équilibre vraiment** (vérifié : actif = passif à l'unité près sur trois jeux de données). Pour cela, le compte de résultat OHADA est construit sur les **mouvements réellement notés**, pas sur les parts de charges estimées que Canari étale sur les jours (`comptes.js`) : une charge estimée ne sort d'aucune caisse, donc elle ne peut apparaître dans aucun bilan. Capitaux propres = capital (apport de départ : argent + stock du premier jour) + report à nouveau (résultats passés − prélèvements passés) + résultat de l'exercice − prélèvements de l'exercice.
- **L'écart est montré, jamais caché.** Canari n'est pas une comptabilité en partie double : si un arrivage a été noté sans son prix, ou si l'argent de départ n'a jamais été déclaré, le compte ne tombe pas juste. Une ligne « Écart à régulariser » apparaît alors, avec la phrase qui dit quoi corriger. Sous **1 000 F** (`ECART_NEGLIGEABLE`), c'est de l'arrondi : il rentre dans le report à nouveau pour que la colonne s'additionne exactement à l'écran.
- **Les charges s'écrivent en négatif** dans la colonne. Sans le signe, « Ventes 936 192 » puis « Achats 569 120 » puis « MARGE 355 632 » a l'air d'une erreur de calcul ; avec, la colonne s'additionne de haut en bas comme sur le formulaire.
- **RA ou RC, et ce n'est pas un détail.** L'OHADA sépare ce qu'on achète pour **revendre tel quel** (RA) de ce qu'on achète pour **fabriquer** (RC). La farine d'un boulanger rangée en RA donnait une marge commerciale de **−3 760 000 F** et un compte de résultat qui ne voulait plus rien dire. `posteAchat()` reconnaît l'achat par son libellé : un intrant connu → RC ; un produit connu → son type décide ; sinon, ce que la boutique a déclaré vendre au questionnaire tranche. Les trois stocks sont séparés de la même façon : **RB** variation des marchandises, **RD** variation des matières premières, **TE** production stockée (un produit, pas une charge).
- **Le rangement des dépenses est montré en clair** (« Comment Canari a rangé tes dépenses ») : c'est la seule partie que Canari devine, donc la seule que le commerçant doit pouvoir vérifier. Il reconnaît par mots-clés sans accent (`POSTES_CHARGES`) : salaire → RK, transport → RG, loyer/électricité → RH, taxe/patente → RI, emballage/gaz → RE, le reste → RJ. Pour corriger, il suffit de renommer la ligne.
- **Quel système s'applique** : le **Système Minimal de Trésorerie** ou le **Système normal**, selon les seuils de l'AUDCIF art. 13 (`SEUILS_SMT`, en un seul endroit pour qu'une correction ne demande qu'une ligne) — **30 M** pour le négoce, **20 M** pour l'artisanat, **10 M** pour les services. L'activité principale est celle qui rapporte le plus dans l'année (TA / TB / TC), pas celle qui a été cochée. L'écran cite l'article et invite à faire confirmer le seuil par un comptable.
- **L'avertissement se lit AVANT les chiffres**, pas en bas de page : ces états sont une **présentation au format OHADA** de ce qui a été noté, pas des états certifiés ; avant un dépôt aux impôts ou une demande à la banque, un expert-comptable doit les reprendre.
- **Ce que Canari ne sait pas remplir** est écrit noir sur blanc : immobilisations incorporelles et financières (AD, AQ), emprunts (DA), dettes fiscales et sociales (DK), résultat financier (XF) et hors activités ordinaires (XH), impôt sur le résultat (RS), tableau de flux de trésorerie et notes annexes complètes.
- **Quatre notes annexes** que Canari peut vraiment remplir : matériel (brut, amortissements, net), stocks, clients, fournisseurs, prélèvements de l'exploitant.
- **Comparatif N-1** sur les deux états, bouton **« Voir toutes les lignes du modèle »** pour afficher aussi les lignes vides du formulaire, et **téléchargement PDF / Excel** par les fonctions de `export.js`.
- **Piège de traduction rencontré** : un `<b>` au MILIEU d'une phrase la coupe en trois nœuds de texte, et le dictionnaire anglais ne reconnaît plus rien. Les emphases sont donc sorties des phrases (`<b>nom</b><p>phrase</p>`), et les **codes du modèle** (TA, RA, XA…) comme le **nom de la boutique** portent `translate="no"` : ce sont les mêmes dans les deux langues.
- **Le stock du premier jour est un APPORT, pas un achat (corrigé le 17/10/2026)**. Il est déjà compté dans le capital (CA) ; il entrait une **seconde fois** dans le résultat, par la variation de stock de la première année — de la marchandise en stock sans achat en face, donc un bénéfice gonflé d'autant. Le bilan affichait alors une ligne « Écart à régulariser » **exactement égale au stock de départ**, sur des données pourtant complètes : 256 343 F sur un bilan de 1,2 million, soit 21 % des capitaux propres. C'est le pire des cas, parce que l'écart doit signaler un trou dans le carnet, jamais un calcul de Canari. `stockApporte()` range donc ce stock dans le stock de **début** de l'exercice. Vérifié après correction : actif = passif **à l'unité** sur 2025 et 2026, écart à zéro. Révélé par la boutique de démonstration (voir plus bas) — c'est à ça que sert un jeu de données complet.
- **Règle pour la suite** : une nouvelle ligne du modèle reçoit son code de référence, sa place dans la cascade, et sa traduction dans `en-ohada.js` ; tout nouvel achat doit passer par `posteAchat()` ; toute ligne de charge doit figurer dans `CHARGES_OHADA` pour s'écrire en négatif ; et tout stock qui entre **sans achat** (un apport, un cadeau) doit être écarté de la variation de stock, sinon il devient du bénéfice.

## Plusieurs entreprises sur le même téléphone (fait, demande du propriétaire)

Demande du 17/10/2026 : « on doit pouvoir enregistrer plusieurs entreprises différentes et sélectionner à chaque fois avec laquelle on souhaite partir ; le nombre d'entreprises possible de créer doit se faire en fonction des abonnements ». Code : `app/entreprises.js`, dictionnaire `app/langues/en-entreprises.js`.

- **Chaque entreprise a son propre dossier** : ses ventes, ses clients, ses produits, ses charges, ses chiffres — tout, séparé. Rien ne se mélange. La **première garde la clé `principal`**, celle de toutes les versions d'avant : un commerçant qui met simplement l'appli à jour ne perd rien et n'a rien à faire. Les suivantes reçoivent une clé `dossier-xxxxxx`. `cleDossier` (dans `app.js`) dit laquelle est ouverte ; `sauver()` et `chargerDonnees()` écrivent et lisent sous cette clé.
- **Où ça se passe** : un **bandeau en haut de l'écran du jour** porte le nom de l'entreprise ouverte et ouvre la liste — il n'apparaît **que s'il y en a plusieurs**, sinon ce serait une ligne de plus à lire pour rien. Et **Réglages → Mes entreprises** : la liste, la bascule, l'ajout, le renommage, la suppression.
- **Ce qui reste commun au téléphone, et pas à l'entreprise : L'ABONNEMENT.** Sinon il suffirait de créer une deuxième entreprise pour obtenir un deuxième mois d'essai gratuit, et une nouvelle chaque mois pour ne jamais payer. Le **numéro Canari du miroir localStorage fait donc loi** : un dossier neuf l'adopte au lieu d'en tirer un nouveau (`completerAbonnement`). Vérifié : trois entreprises, un seul numéro Canari, un seul abonnement.
- **La règle du nombre, volontairement gentille** : l'abonnement dit combien d'entreprises on peut **créer**. Il n'efface jamais rien. Un commerçant qui passe de Multi à Solo **voit toujours ses trois entreprises et travaille dedans** : il ne peut simplement plus en ajouter. On ne prend jamais en otage le travail de quelqu'un. Pendant l'**essai gratuit**, c'est **une seule** entreprise (`entreprisesAutorisees()`), et l'écran explique quelle formule en permet plus.
- **Le code d'activation porte le nombre d'entreprises** : un **« E » derrière les jours** (`K7P2QX9M.366E3.…` = 366 jours, 3 entreprises). Sans « E », c'est une seule — **tous les codes d'avant restent valables**. `gerant.html` a le champ correspondant, rempli tout seul par la formule choisie, et le lien du client porte `&e=3`. Le serveur du tunnel signe pareil (`fabriquer-scenarios.py`). À l'activation, on prend **le plus grand des deux** : ajouter un mois Solo à un Multi encore en cours ne doit pas faire perdre ses entreprises en route.
- **La sauvegarde emporte TOUTES les entreprises** dans un seul fichier (`version: 2`, tableau `entreprises`) : « ne rien perdre si le téléphone change » n'aurait aucun sens si deux entreprises sur trois restaient sur l'ancien. Le champ `donnees` garde l'entreprise ouverte, donc une sauvegarde neuve se récupère aussi sur une version ancienne de Canari. La confirmation **dit combien d'entreprises vont être remplacées** : c'est irréversible, personne ne doit le découvrir après coup. Les dossiers des autres entreprises sont **lus d'avance** à l'ouverture des Réglages (`prechargerDossiers`), pour que « Partager » garde le droit d'ouvrir le menu d'Android — un téléphone le retire si on le fait attendre.
- **Deux pièges rencontrés, à retenir** :
  1. **tous les fichiers partagent le même espace de noms.** `const DUREES` existait déjà dans `tableau.js` (les durées d'usage du matériel) : le redéclarer dans `abonnement.js` arrêtait le script et toute l'appli tombait. Avant d'ajouter un nom au niveau global, vérifier qu'il est libre — le script de contrôle est trois lignes de Python sur `^(const|let|var|function) nom`. De même, `dureeChoisie` est pris : les durées d'abonnement s'appellent `dureeAbo` ;
  2. **dans `EN_MOTIFS`, le premier motif qui correspond gagne**, dans l'ordre de chargement des dictionnaires. `en-boutique.js` traduit déjà `« … F par mois »` et prenait la phrase entière « 3 mois offerts · 2 250 F par mois ». La phrase française a donc été reformulée en « 3 mois offerts, 2 250 F **chaque mois** ». Un motif ajouté plus tard ne peut pas passer devant un motif plus ancien.
- **Règle pour la suite** : tout ce qui est propre à une entreprise va dans `donnees` ; tout ce qui est propre au téléphone (abonnement, langue, voix) va dans localStorage. Une nouvelle clé localStorage propre à l'entreprise doit porter le suffixe du dossier, comme `cleSauvegarde()`.

## Le tunnel de vente autonome (fait, demande du propriétaire)

Demande du 02/10/2026, avec un montage n8n fourni en exemple : « inspire-toi de ça et élabore un tunnel de vente entièrement autonome pour la vente de cette application ». Tout est dans `tunnel/`, avec son mode d'emploi (`tunnel/LISEZ-MOI.md`, montage pas à pas, coûts, essais à faire, pannes courantes).

- **Ce que ça règle** : aujourd'hui chaque abonnement demande au propriétaire d'ouvrir `gerant.html`, de créer le code et de le renvoyer. À dix clients c'est tenable, à trois cents c'est un travail de nuit. Le tunnel fait la chaîne entière : affiche → installation → **inscription** → messages de suivi pendant l'essai → **paiement** (Wave, Orange Money, MTN, Moov par CinetPay) → **code d'activation signé, envoyé sur WhatsApp**, sans aucun geste du propriétaire.
- **Quatre scénarios n8n** : `1-inscription.json`, `2-messages-du-matin.json` (chaque matin 9 h), `3-lien-de-paiement.json`, `4-paiement-et-code.json`. Ils ne sont pas écrits à la main : `tunnel/fabriquer-scenarios.py` les fabrique (un scénario n8n relie ses nœuds par leur **nom** — écrit à la main, on en oublie un et n8n refuse le fichier sans dire pourquoi). Après modification : `python3 fabriquer-scenarios.py`.
- **La signature est gardée, le mot de passe partagé est refusé.** Le montage fourni fabriquait le code avec un secret **écrit dans l'appli** (HMAC) ; son propre mode d'emploi l'avouait : « un développeur motivé pourrait le retrouver » — et il fabriquerait alors des abonnements gratuits à volonté. Canari garde donc son système : code **signé** ECDSA P-256, l'appli ne portant que la clé **publique**.
- **Deux clés publiques, et c'est voulu** (`CLES_PUBLIQUES` dans `app/abonnement.js`) : 1. le **téléphone** du propriétaire (`gerant.html`), clé maîtresse, qui marchera toujours même serveur éteint ; 2. le **serveur** du tunnel (`CLE_SERVEUR` dans `app/tunnel.js`), qui signe tout seul. Un serveur est plus exposé qu'un téléphone dans une poche : si le sien était percé, il retire la clé serveur de la liste à la mise à jour suivante et sa clé à lui, intacte, continue. Avec une seule clé, il aurait fallu tout refaire et tous les abonnements vendus auraient sauté. La clé serveur se fabrique une fois avec `tunnel/fabriquer-cle-serveur.html` (clé publique → l'appli, clé secrète → n8n, jamais l'inverse ; la page sait aussi fabriquer un vrai code pour vérifier que la paire fonctionne).
- **Le code est attaché au téléphone qui a payé** : le numéro Canari est dans le texte signé, donc le lien de paiement le porte (`lienPaiementTunnel()`). Un code repartagé n'abonne personne (« Ce code est pour un autre téléphone »).
- **On ne croit jamais le navigateur.** Le guichet ramène sur `…/#paiement=ok` : l'appli dit « c'est reçu, ton code arrive » et **ne débloque rien** — n'importe qui pourrait taper cette adresse. Ce qui débloque, c'est le code signé, et il n'est fabriqué qu'après que le serveur a **redemandé à CinetPay** l'état de la transaction (la notification de CinetPay ne suffit pas : elle pourrait venir d'ailleurs). Le prix et les jours viennent de la table `FORMULES` du serveur, jamais du lien, sinon on paierait 1 F pour un an en changeant l'adresse. Et un paiement notifié deux fois ne donne qu'un seul code (colonne `derniere_transaction`).
- **Dix messages WhatsApp** (`tunnel/modeles-whatsapp.md`, à déposer chez Meta) : bienvenue, J1, J3, J10, J21, J27, fin d'essai, le code, renouvellement, abonnement fini. **Un seul message par jour et par personne**, jamais deux fois le même (colonne `dernier_message`), et seulement le plus avancé qu'on n'a pas encore reçu — un commerçant inscrit en retard ne reçoit pas les six d'un coup. Un commerçant relancé trop souvent bloque le numéro, et un numéro bloqué arrête tout le tunnel.
- **Côté appli, tout tient dans `app/tunnel.js`.** Tant que `TUNNEL.url` est vide, **l'appli est exactement celle d'avant** : aucun écran en plus, et rien ne sort du téléphone (vérifié : questionnaire à 9 étapes, carte Réglages cachée, bouton « Payer maintenant » caché). Le tunnel s'allume le jour où le propriétaire colle l'adresse de son serveur et la clé publique.
- **Ce qui sort du téléphone, et seulement sur un OUI** : prénom, numéro WhatsApp, nom de la boutique, langue, numéro Canari, dates de l'essai ; au paiement, la formule, le montant et l'e-mail s'il a été donné. Ce qui ne sort **jamais** : aucune vente, aucune dépense, aucun montant de caisse, aucun client ni son numéro, aucune dette, aucun produit, aucun stock. L'accord est demandé à l'avant-dernière étape du questionnaire (« Veux-tu que Canari t'écrive ? », étape `rappels`, montrée seulement si le tunnel est allumé) et se reprend dans **Réglages → Rappels WhatsApp**. Dire non n'empêche pas de s'abonner : le numéro Canari suffit. `app/confidentialite.html` et la section 15 de `app/guide.html` le disent en français et en anglais.
- **L'ancien chemin reste là**, replié derrière « Je préfère payer autrement » : il ne dépend d'aucun serveur, donc il doit toujours rester possible.
- **Ce que ça coûte** : n8n (~15 000 F/mois en Cloud, ~3 000 F sur un petit serveur), WhatsApp (~15 F le message utilitaire, soit ~150 F par client sur un an), CinetPay (~3 %). Le tunnel se paie à partir d'une vingtaine d'abonnés.
- **Reste à faire plus tard** : le « STOP » automatique (cinquième scénario sur les messages entrants ; aujourd'hui il faut écrire `oui` dans la colonne `stop` de la Sheet — à automatiser **avant** d'avoir beaucoup d'abonnés, un STOP ignoré fait signaler le numéro), la facture d'abonnement envoyée par e-mail toute seule (il faudrait la dessiner sur le serveur), et le parrainage.
- **Ce qui dépend du propriétaire** (détaillé dans `tunnel/LISEZ-MOI.md`) : un **numéro WhatsApp Business neuf** — surtout pas le `05 84 37 48 48`, qui sert aux factures et aux demandes à la main —, un compte **CinetPay**, un compte **n8n**, et les dix modèles acceptés par Meta.

## La boutique de démonstration (fait, demande du propriétaire)

Demande du 17/10/2026 : « créer une version de démo déjà renseignée avec des données pour convaincre un auditoire ». Code : `app/demo.js`, traductions dans `app/langues/en-entreprises.js`.

- **Pourquoi** : une appli de comptabilité vide ne montre rien — tableau de bord gris, courbes plates, comptes annuels à zéro. Devant un investisseur, une banque ou un commerçant, il faut une boutique qui a vécu, et personne ne va taper un an de ventes à la main avant chaque présentation.
- **Où** : Réglages → **« Montrer Canari à quelqu'un »** → « Créer la démonstration ». Trois boutons ensuite : ouvrir, **remettre à neuf** (après l'avoir touchée pendant la présentation) et **retirer**.
- **Ce qu'elle contient** : *Boutique Awa (démo)*, une alimentation générale de Cocody Angré, sur **420 jours** (donc **deux années civiles** : les comptes pluriannuels et la vue « Années » ont de quoi comparer). 10 produits dont un **fabriqué** (jus de bissap, avec sa fiche de coût, sa recette et ses 4 intrants), 12 clients, 4 fournisseurs, 7 charges et taxes, 3 investissements, ~6 300 mouvements. Chiffres obtenus : 15,1 M de ventes, 324 000 F en caisse, 92 000 F dus par les clients, 46 000 F dus aux fournisseurs, 247 000 F de stock.
- **Trois garanties, qui comptent plus que les chiffres** :
  1. c'est une **entreprise à part** (voir `entreprises.js`) : les vraies données ne sont jamais touchées ;
  2. elle ne mange **pas une place de l'abonnement** (`entreprisesComptees()` l'exclut) — sinon la démo serait impossible pendant l'essai gratuit, exactement le moment où l'on cherche à convaincre ;
  3. elle **se dit démo partout** : le nom porte « (démo) », un bandeau braise le rappelle en haut de l'écran avec un bouton « Mes vrais chiffres », la liste des entreprises l'étiquette, et elle **n'entre pas dans la sauvegarde** (`rassemblerEntreprises` l'écarte : des chiffres inventés n'ont rien à faire dans un fichier de sauvegarde, et ils y pèseraient plus lourd que les vrais).
- **Les numéros de téléphone sont faux et volontairement reconnaissables** (`07 00 00 00 01` à `07 00 00 00 22`) : pendant une démonstration on touche « Relancer », et il ne faut surtout pas qu'un vrai inconnu reçoive le message.
- **Tout est calculé, rien n'est écrit en dur**, et avec un hasard **reproductible** (pas de `Math.random` : le propriétaire doit retrouver les mêmes chiffres d'une présentation à l'autre, et pouvoir préparer son discours dessus). Les mouvements sont de vrais mouvements — mêmes types, prix de revient gardé à la vente, arrivages, dettes, consommation d'intrants — donc le tableau de bord, les comptes annuels et les états OHADA les lisent comme des vrais.
- **Deux chiffres faux rattrapés en cours de route, à retenir** :
  1. les ventes **« au montant »** ne consommaient aucun stock, donc elles ne déclenchaient **aucun achat de marchandise** : la caisse grimpait à **4,5 millions** et la marge commerciale des états OHADA (qui se calcule sur les achats réels) montait à **53 % au lieu de 28 %**. Le prix de revient de ces ventes est donc mis de côté et **acheté pour de vrai au marché** dès qu'il y en a pour un plein panier ;
  2. « pris pour la maison » à 2 000 F par jour laissait le bénéfice s'entasser dans un tiroir. Un commerçant vit de sa boutique : le prélèvement est monté à ~1 M sur l'année, et la caisse finit à 324 000 F — crédible.
- **L'alerte « à racheter »** : aucun mouvement n'est fabriqué pour elle, on règle simplement l'alerte de deux produits juste au-dessus de ce qu'il en reste. C'est exactement ce que fait un commerçant qui veut être prévenu plus tôt.
- **Vitesse** : 280 ms de génération et **773 ms du doigt à l'écran** sur un processeur 6× plus lent (téléphone d'entrée de gamme). Pas d'écran d'attente, donc.
- **Les données de la démo restent en français** même en anglais (noms de produits, de clients, libellés des dépenses) : c'est le cas normal — les données d'une vraie boutique sont dans la langue du commerçant, et l'appli ne les traduit jamais. Seuls les écrans de la démo sont traduits.
- **Règle pour la suite** : un nouveau type de mouvement doit être représenté dans la démo, sinon l'écran qui le montre reste vide pendant une présentation. Et tout chiffre ajouté doit rester **cohérent avec les autres** : la démo est lue par le tableau de bord, les comptes annuels ET les états OHADA, qui ne calculent pas de la même façon — un chiffre qui ne tient que dans un seul des trois se voit tout de suite.

## L'onglet Profil (fait, demande du propriétaire)

Demande du 27/10/2026 : « ajoute un onglet profil à Canari ». Code : `app/profil.js`, dictionnaire `app/langues/en-profil.js`.

- **Ce qu'il répare** : l'identité de la boutique — nom, logo, numéro, RCCM, compte contribuable, monnaie — était enfouie dans les Réglages, derrière la roue dentée, au milieu de quinze cartes. Le commerçant qui voulait vérifier **ce qui s'imprime sur ses factures** devait chercher. Son abonnement était ailleurs, son entreprise ailleurs encore.
- **La frontière avec les Réglages, et elle est nette** : le **Profil MONTRE** (qui tu es, depuis quand, ce que tu as, où tu en es de ton abonnement) — on le lit ; les **Réglages CHANGENT** (formulaires, interrupteurs, sauvegarde, remise à zéro) — on y tape. Chaque carte du Profil porte un bouton qui ouvre le bon formulaire des Réglages, et **aucun formulaire n'est redessiné** : un champ copié deux fois finit par diverger.
- **Ce qu'on y voit** : une carte d'identité sombre (graphite et braise, un « grand moment » au sens de la charte) avec le logo ou la mascotte, le nom, le métier, « Dans Canari depuis le… » et quatre compteurs (ventes notées, clients, produits, fournisseurs) ; puis **Mon abonnement** (le même texte que dans les Réglages, par `texteEtat()`, pour que les deux écrans ne puissent jamais se contredire), **Mon entreprise** (seulement s'il y en a plusieurs), **Ma boutique** (ce qui s'imprime sur les factures) et **Aller plus loin** (guide, export, sauvegarde, réglages).
- **`reglagesSur(id)`** ouvre les Réglages **et amène l'œil sur la bonne carte** : sans le défilement, on retombe en haut d'un écran long et il faut chercher à nouveau — exactement ce que le Profil est censé épargner. La carte Sauvegarde a reçu l'identifiant `carte-sauvegarde` qui lui manquait.
- **Six onglets tiennent sur 320 px** (vérifié : aucun mot coupé, aucun débordement). Le mot « Profil » est court, c'est ce qui le permet.
- **Règle pour la suite** : le Profil ne reçoit jamais un champ de saisie. S'il faut pouvoir changer quelque chose, on ajoute un bouton vers la carte des Réglages qui le fait déjà.

## Les tailles d'écran : portrait, paysage, tablette, PC (fait, demande du propriétaire)

Demande du 27/10/2026, en deux temps : « avec affichage en mode portrait et paysage », puis — après une première version — « **la configuration en mode paysage n'est pas bonne du tout ; recherche ce qui se fait de mieux en la matière et fais de même. La taille des objets, la taille de police, la largeur des colonnes : tout doit être recalculé et redéfini pour assurer la meilleure expérience possible à l'utilisateur.** » Il avait raison : la première version était du rafistolage — on rétrécissait des choses au jugé jusqu'à ce que ça rentre. Tout a été repris. Section « LES TAILLES D'ÉCRAN » de `app/style.css`.

### Le déverrouillage, à DEUX endroits

L'appli était verrouillée en portrait dans deux fichiers, et il fallait lever les deux :
1. `app/manifest.webmanifest` → `"orientation": "any"` (l'appli installée depuis le navigateur) ;
2. `twa-manifest.json` → `"orientation": "any"` (l'application Android du Play Store). **Oublier celui-ci annulait tout le travail CSS** : l'appli serait restée debout quoi qu'il arrive. Le workflow Android vérifie maintenant ce point et **échoue** s'il trouve `screenOrientation="portrait"`.

### Les classes de taille de fenêtre de Material 3, et rien d'autre

Plus aucun seuil choisi au hasard. Tout est posé sur les **classes de taille de fenêtre** qu'Android publie, avec la part du parc réel qu'elles couvrent :

| | Largeur | | Hauteur |
|---|---|---|---|
| **compacte** | < 600 px — 99,96 % des téléphones **debout** | **compacte** | < 480 px — 99,78 % des téléphones **couchés** |
| **moyenne** | 600 – 839 — 93,73 % des tablettes debout | **moyenne** | 480 – 899 |
| **étendue** | 840 – 1199 — 97,22 % des tablettes couchées | **étendue** | ≥ 900 |
| **grande** | ≥ 1200 — grandes tablettes et PC | | |

### La navigation suit la règle officielle d'Android, mot pour mot

« *Navigation bar if the width **or height** is compact — navigation rail for everything else.* » C'est le **« ou hauteur »** qui a corrigé mon premier réflexe : un téléphone couché a beau être large, sa hauteur est compacte, donc il **garde la barre du bas**. Un rail vertical sur 360 px de haut ne tiendrait de toute façon pas six destinations à 48 px.

| Appareil | Classe | Navigation |
|---|---|---|
| Téléphone debout (360 × 740) | largeur compacte | **barre du bas** |
| Téléphone couché (740 × 360) | hauteur compacte | **barre du bas**, fine (icône à côté du mot, 48 px) |
| Tablette, PC (≥ 600 × ≥ 480) | moyenne et plus | **rail vertical à gauche**, 80 px (valeur Material), destinations de 56 px |

Le rail libère **toute la hauteur** de l'écran, et sur une tablette tenue à deux mains les destinations tombent sous le pouce.

### Ce qui a été recalculé

- **La largeur du texte n'est pas la largeur de l'écran.** « Occuper tout l'espace » ne veut pas dire étirer les phrases : la recherche en typographie situe le confort entre **50 et 75 signes par ligne**, avec 65 comme cible, et le WCAG pose 80 en limite haute. L'écran prend donc toute la place, mais chaque bloc de **texte** est plafonné à 65 signes (`--mesure: 65ch`).
- **Les cibles tactiles ne descendent jamais sous 48 px**, dans aucun mode — le minimum Material. Ma première version était tombée à **44 px** sur la barre couchée : corrigé, et vérifié automatiquement sur les huit formats.
- **Les marges suivent la classe** : 16 px en compact, **24 px dès la largeur moyenne**. C'est l'échelle de Material, et elle évite l'effet « téléphone agrandi » où tout reste collé aux bords d'un grand écran.
- **Les tailles de police se calculent sur la dimension qui abonde.** Couché, le chiffre du jour était rétréci au jugé (32 px) ; il se calcule maintenant sur la **largeur** — `clamp(34px, 6vw, 48px)` — et retrouve `clamp(48px, 4.4vw, 62px)` en largeur étendue. **Le corps du texte, lui, ne bouge jamais** : l'appli doit rester lisible en plein soleil sur un écran bon marché, et rogner les phrases pour gagner trois pixels serait un mauvais échange.
- **L'écran du jour en deux volets, à la manière « liste-détail » de Material** : un volet de largeur **fixe** (`minmax(300px, 380px)`) pour **agir** — le chiffre du jour, les six boutons — et un volet **souple** pour **lire** — le bilan, puis les mouvements. Une proportion (1fr/1,1fr) aurait étiré les boutons sur un écran de PC ; une largeur fixe les garde à la taille de la main. C'est `grid-auto-flow: dense` qui fait démarrer la colonne de droite tout en haut, au lieu d'attendre la hauteur des boutons.
- **Les listes de cartes** (clients, fournisseurs, relances, produits, intrants) prennent autant de colonnes de 320 px que l'écran en porte : trois sur un PC, une sur un téléphone. La **liste des mouvements du jour reste d'un bloc** — c'est UNE carte à lignes séparées, la couper en deux ferait deux moitiés de tableau.
- **La fenêtre de saisie change de forme avec l'écran.** Une feuille collée en bas est une forme de téléphone : sur une tablette ou un PC elle oblige à descendre l'œil et la main tout en bas d'un grand écran. Dès la largeur moyenne **avec de la hauteur**, elle devient une **boîte de dialogue centrée** (560 px) où tout le formulaire tient d'un coup. En hauteur compacte elle reste une feuille, avec les deux boutons **collés en bas** : sans ça « Enregistrer » tombait à 668 px dans une fenêtre de 360, invisible, et rien ne disait qu'il fallait faire défiler *à l'intérieur*. Le fond de cette barre est **plein**, pas dégradé — avec le dégradé, les montants rapides se devinaient à demi effacés derrière et on croyait à un bug.
- **L'accueil couché passe sur deux colonnes** (la marque à gauche, les boutons à droite) : empilé, il demandait 624 px pour 360 et « Commencer » tombait sous la ligne de flottaison. Le tout premier écran de l'appli n'offrait aucune action visible.
- **Les pastilles rouges se rangent au-dessus de l'icône** quand la barre passe en ligne : elles tombaient sur la première lettre du mot (« .elances », « .tock »).

### Le piège à retenir

Une colonne `1fr` **ne descend jamais sous la largeur de son contenu**. Sans `minmax(0, 1fr)`, une carte un peu large écrase sa voisine et fait déborder l'écran sur le côté — mesuré sur les Réglages : **773 px de contenu dans une fenêtre de 740**. **Règle pour la suite** : toute colonne de grille qui reçoit du contenu de largeur inconnue s'écrit `minmax(0, 1fr)`, jamais `1fr`.

### Vérifié automatiquement

Sur **huit formats** — 320 × 740, 360 × 740, 740 × 360, 844 × 390, 600 × 960, 1024 × 768, 1280 × 800, 1920 × 1080 — et pour chacun : la bonne forme de navigation, **aucune cible tactile sous 48 px**, « Enregistrer » visible sans chercher, aucun débordement horizontal sur les six onglets, aucune erreur de script.

### Reprise du 27/10/2026 : trois défauts signalés par le propriétaire

Il a regardé le résultat et a eu raison sur les trois points. Ce qui a été corrigé :

1. **Le portrait ne devait pas bouger — il ne bouge plus.** Les trois blocs de mise en page large portent désormais `orientation: landscape` : un téléphone **debout** ne rencontre plus aucune de ces règles, quelle que soit sa largeur. Une tablette debout garde donc aussi sa barre du bas.
2. **Les mots coupés en deux dans les listes.** `.ligne-texte b` portait `overflow-wrap: anywhere`, qui autorise la coupure au **milieu d'un mot**. Effet de bord invisible dans le code et très visible à l'écran : la largeur minimale de la colonne de texte tombait à **une seule lettre**, donc la colonne du montant se servait la première et « Remboursement » s'écrivait « Remboursem / ent ». C'est `break-word` qu'il fallait (couper entre les mots seulement), et le montant ne prend plus que la place dont il a besoin (`flex: 0 0 auto`).
3. **Les tableaux de chiffres.** Un tableau en `table-layout: auto` partage la place **au prorata du contenu** : la colonne des chiffres s'élargissait pendant que les intitulés passaient sur deux lignes. La colonne de gauche réclame donc tout le reste (`width: 99%`) et les colonnes de chiffres se réduisent à leur contenu (`width: 1%`). Attention : les **états OHADA** ont une colonne de code (« Réf ») AVANT l'intitulé, donc c'est leur **deuxième** colonne qui prend la place.
4. **Les cartes mal réparties en paysage.** Les tuiles du tableau de bord restaient à `1fr 1fr` et devenaient de longs rubans portant un seul petit chiffre ; les ratios des comptes annuels étaient une colonne de bandes pleine largeur. Chaque famille prend maintenant autant de colonnes que l'écran en porte (`repeat(auto-fit, minmax(…))`), et les courbes ramassées à 66 px retrouvent 104 px de hauteur, sinon elles s'aplatissent en trait.
5. **Deux volets, oui — mais à partir de 840 px, pas de 600.** C'était ma vraie erreur. Sur un téléphone **couché** (740 px), le volet des mouvements tombait à 336 px : les libellés se coupaient au milieu d'un mot et la colonne de gauche restait vide sur 1 500 px. 740 px est une largeur **moyenne** au sens de Material ; la vue liste-détail est réservée à la largeur **étendue**. Un téléphone couché affiche donc la même chose qu'en portrait, en plus large.
6. **Le volet des mouvements est un vrai bloc** (`<div class="volet-mouvements">` autour du titre, de la liste et de l'écran vide), posé en `grid-area: 1 / 2 / -1 / 3`. Sans lui, le titre « Aujourd'hui » restait seul en haut de la colonne de droite et la liste ne commençait qu'au bas de la carte du jour, avec 300 px de vide. La grille déclare **cinq rangées** — quatre pour le volet de gauche, une cinquième souple : sans elle, grid répartit le surplus de hauteur de la liste sur les quatre rangées et écarte les boutons jusqu'en bas de l'écran.
7. **Quatre cibles tactiles sous 48 px** arrivées avec les écrans récents (bandeau d'entreprise, bandeau de démo et son bouton, numéro de téléphone d'une fiche client) remontées au plancher Material.

### Le vrai coupable : DEUX ÉCRANS PARTAGEAIENT UN NOM DE CLASSE

Après ces corrections, le propriétaire a renvoyé une capture du **« calcul, pas à pas »** (Bilan → Mois) avec le même défaut : « Ventes (dont / 58 450 F à / crédit) » sur **trois lignes**, et le montant flottant au milieu d'une colonne vide. En **portrait comme en paysage**. Ce n'était donc pas une affaire de taille d'écran du tout.

`charges.js` écrit depuis toujours `<ul class="cascade">` avec des `<li class="cascade-ligne">` : une carte à lignes séparées, libellé à gauche, montant à droite (`flex`, `space-between`). Quand `comptes.js` est arrivé, il a écrit **lui aussi** `<ul class="cascade">`, mais pour une **pile de barres** : `display: flex` sur le `<ul>` et une grille `6.5em 1fr auto` sur chaque `li`. Ses règles étant **plus bas dans la feuille**, elles gagnaient — et s'appliquaient aux `li` de `charges.js`, qui n'avaient rien demandé. Le libellé se retrouvait coincé dans **104 px** et le montant dans la colonne de la barre, qui n'existe pas chez `charges.js`. La pile de barres, elle, s'affichait correctement : le défaut ne se voyait que sur l'écran qui n'était pas prévu pour.

Les barres de `comptes.js` s'appellent donc **`.cascade-barres`**. C'est exactement le même piège que `const DUREES` dans `tableau.js` et `abonnement.js` (voir « Plusieurs entreprises ») : **la feuille de style est un espace de noms partagé par tous les écrans**, au même titre que le JavaScript.

**Règle pour la suite** : avant de donner un nom de classe à un nouvel écran, vérifier qu'il est libre — `grep -n '^\.nom[ {.:]' app/style.css`. Un nom déjà pris se réutilise **seulement** si on habille le même élément ; sinon on en choisit un autre. Et quand un écran s'affiche mal alors qu'un autre, voisin, va bien, regarder d'abord si les deux partagent une classe.

**Règle pour la suite** : un nouvel écran ne reçoit pas son propre seuil. Il se range dans les classes existantes — largeur compacte / moyenne / étendue, hauteur compacte — et hérite des marges, de la mesure de 65 signes et du plancher tactile de 48 px. Et **une vue en deux volets commence à 840 px**, jamais à 600 : en dessous, les deux volets sont trop étroits tous les deux.

## L'application Android : APK et AAB (fait)

- **L'adresse de téléchargement, fixe et publique** (accord du propriétaire du 27/10/2026) :
  **`https://github.com/mastexcel/Canari/releases/download/essai/canari.apk`**
  Le marqueur (`essai`) et le nom du fichier ne changent jamais : une nouvelle fabrication remplace le fichier **sans casser le lien** déjà envoyé à quelqu'un. L'onglet « Actions » de GitHub, lui, demande un compte et de la navigation — ce n'est pas un endroit où envoyer un commerçant. Vérifié : HTTP 200, 3 073 810 octets.
- **Deux fichiers, et ils ne servent pas à la même chose** : `canari.apk` s'installe **directement sur un téléphone** (on l'envoie par WhatsApp, on l'ouvre) ; `canari.aab` ne sert qu'au **Play Store** — Android ne sait pas installer un `.aab`. L'ancien workflow ne sortait que le `.aab`, donc rien d'installable.
- **L'APK demande Android 7 (minSdk 24)** : la bibliothèque qui fait tourner une TWA (`androidbrowserhelper` 2.7.4) l'exige, et la fusion des manifestes échouait à 21. Personne n'est exclu de Canari pour autant : sur un téléphone plus ancien, l'appli s'installe toujours depuis Chrome, avec la même icône et le même hors-ligne.
- **CINQ BLOCAGES ONT DÛ ÊTRE DÉMÊLÉS avant la première fabrication réussie**, et ils sont tous du même genre — un outil qui attend une réponse humaine. À relire avant de toucher à cette tâche :
  1. sur un runner nu, **Bubblewrap télécharge le JDK et le SDK puis demande d'accepter les licences** : la tâche est restée **64 minutes** bloquée là. On lui déclare donc d'avance les outils déjà installés sur le runner (`~/.bubblewrap/config.json` : `jdkPath`, `androidSdkPath`) et on accepte les licences avant de le lancer ;
  2. **`bubblewrap init` est un questionnaire qui veut un vrai terminal.** Le nourrir avec `yes` ne répond à rien : ça remplit le tube de « y » jusqu'au délai maximum. Il est donc **supprimé** — `bubblewrap update` régénère le projet depuis `twa-manifest.json` sans rien demander ;
  3. **`update` pose quand même UNE question**, le numéro de la nouvelle version : on la lui répond par le tube ;
  4. **Bubblewrap ne juge un SDK que sur la présence d'un dossier `tools` ou `bin` à sa racine** ; le runner range les siens dans `cmdline-tools/latest/bin`, d'où « The provided androidSdk isn't correct ». Un lien symbolique suffit ;
  5. **les mots de passe de signature passent par `BUBBLEWRAP_KEYSTORE_PASSWORD` et `BUBBLEWRAP_KEY_PASSWORD`**, jamais par un tube : Bubblewrap lit son invite caractère par caractère et les deux lignes se mélangeaient.
  Chaque commande a maintenant son **délai maximum** (un blocage échoue en minutes, pas en une heure), stdin est **fermé** partout où aucune réponse n'est attendue, et la tâche **recrache la cause de ses échecs dans ses annotations** — les journaux d'une tâche sont servis depuis un autre serveur et ne sont pas lisibles par l'API, donc sans ça un échec ne dit rien de plus que « exit code 1 ». Pour un échec Gradle, c'est le bloc « What went wrong » qui est remonté, pas les vingt dernières lignes (qui ne sont que le fond de la pile Java).
- **Piège YAML, rencontré deux fois** : dans un bloc `run: |`, une chaîne ou un sous-document (`heredoc`) qui contient une ligne **non indentée** casse le fichier entier, et GitHub ne sait plus le lire. Les textes longs s'écrivent donc avec `printf` dans un fichier, puis se passent par `--notes-file`. **Et on ne met jamais une validation et un `git push` dans la même commande enchaînée** : la validation a échoué, le push a eu lieu quand même.
- **Sur un PC, un APK ne s'installe pas.** Pour Windows, Mac ou Linux, c'est la **PWA** : ouvrir `https://mastexcel.github.io/Canari/` dans Chrome ou Edge → l'icône « Installer » dans la barre d'adresse. L'appli obtenue a sa propre fenêtre et marche hors ligne.
- **LA CLÉ DE SIGNATURE NE SORT PLUS DU WORKFLOW, et c'est un vrai trou qui a été bouché.** Le dépôt `mastexcel/Canari` est **public** ; or les artefacts d'une tâche sont téléchargeables par toute personne qui peut lire le dépôt, c'est-à-dire **tout le monde**. L'ancienne tâche fabriquait une clé de signature et la déposait là **avec son mot de passe** : n'importe qui aurait pu la récupérer et signer une fausse mise à jour de Canari au nom du propriétaire. Désormais : sans le secret `ANDROID_KEYSTORE`, la tâche signe avec une **clé jetable** (l'APK s'installe et marche, mais il ne peut pas aller au Play Store et la version suivante ne s'installera pas par-dessus) ; avec le secret, la vraie clé est utilisée. La clé doit naître **sur la machine du propriétaire**, ou être confiée à **Play App Signing** (Google la garde). Détaillé dans `docs/play-store.md`.
- **Règle pour la suite** : ne jamais faire sortir un secret par un artefact de ce dépôt tant qu'il est public — ni clé, ni mot de passe, ni jeton. L'empreinte SHA-256 de la clé, elle, est publique par nature : elle peut rester dans l'artefact, et le Play Console la demande pour `assetlinks.json`.

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
7 septies. **Plusieurs entreprises par téléphone** et **nouvelle grille de prix** (Solo / Multi / Pro, 3 000 à 8 000 F par mois), alignée sur le marché (fait).
7 sexies. **Comptes annuels** : bilan, compte de résultat, ratios, analyse et conseils, sur une ou plusieurs années (fait). Et les mêmes états **au format OHADA** (SYSCOHADA révisé), à consulter à la demande (fait).
7 quinquies. **Tunnel de vente autonome (préparé)** : inscription, messages de suivi, paiement et activation sans intervention (`tunnel/`). Reste au propriétaire : le numéro WhatsApp Business, CinetPay et n8n.
7 nonies. **Onglet Profil**, **tailles d'écran** (portrait, paysage, tablette, PC, sur les classes Material) et **APK Android installable** (fait).
7 octies. **Boutique de démonstration** : une boutique d'exemple déjà remplie, pour montrer l'appli à un auditoire (fait).
8. **Play Store (préparé)** : politique de confidentialité, visuels de la fiche, réglages TWA, guide pas à pas (`docs/play-store.md`). Reste au propriétaire : le compte développeur, les 12 testeurs et le choix du domaine.

À chaque étape : montrer le résultat, expliquer comment le tester, attendre l'avis du propriétaire avant de passer à la suite.

## Marque et droits

- **Canari est une application de Bridge Investment Partners (BIP)** — la dénomination du registre du commerce, celle qui est écrite sur la facture d'abonnement ; le logo, lui, porte « BRIDGE INVESTMENT & PARTNERS ». Le logo de BIP n'apparaît que sur la facture d'abonnement (voir plus haut) : nulle part ailleurs dans l'appli.
- Le nom Canari n'a pas encore été déposé. Avant le lancement public : recherche d'antériorité puis dépôt à l'OAPI via l'OIPI (Abidjan-Plateau).
- Ne jamais utiliser de personnages, logos ou noms d'autres marques.

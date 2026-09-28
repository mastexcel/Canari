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
- **Slogan** : « Garde chaque franc. »
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
- **Icône de l'appli** : `images/canari-joyeux.png` (jarre souriante, pièce qui tombe, fond vert). Une version simplifiée du personnage 3D pourra la remplacer.
- **Mascotte « Petit Canari »** : `images/mascotte-canari-3d.png`. À utiliser sur l'écran d'accueil, les écrans vides, les messages de réussite. Humeurs :
  - joyeux (`canari-joyeux.png`) : bon gain, vente enregistrée ;
  - clin d'œil (`canari-clin-doeil.png`) : relances ;
  - yeux fermés, grand sourire (`canari-yeux-fermes.png`) : bonne journée, objectif atteint ;
  - tranquille (`canari-tranquille.png`) : écrans neutres.

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
- Icônes compressées (appli ~0,7 Mo), petits textes plus foncés, boutons ✕ et « Modifier » à 48 px.
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
8. Préparation pour le Play Store (icône, captures d'écran, description).

À chaque étape : montrer le résultat, expliquer comment le tester, attendre l'avis du propriétaire avant de passer à la suite.

## Marque et droits

- Le nom Canari n'a pas encore été déposé. Avant le lancement public : recherche d'antériorité puis dépôt à l'OAPI via l'OIPI (Abidjan-Plateau).
- Ne jamais utiliser de personnages, logos ou noms d'autres marques.

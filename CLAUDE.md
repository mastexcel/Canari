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
- **Polices** : Fredoka (nom, titres, gros chiffres) et Rubik (texte). Toutes deux sur Google Fonts.
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
- **Moyens de paiement de l'abonnement (décision du propriétaire)** : **QR code Djamo** du compte entreprise (payable avec Djamo, Wave, Orange Money, MTN MoMo, Moov Money) et **carte Visa**. Tout arrive sur le compte entreprise Djamo. L'écran d'abonnement montre le QR code (`RECEPTION.djamo.qr`), un bouton pour l'enregistrer (on ne peut pas scanner l'écran de son propre téléphone), la page de paiement si le QR contient un lien (`RECEPTION.djamo.lien`) et « Payer par carte Visa » (`RECEPTION.carte`). À remplir avec l'image du QR et les liens du propriétaire. Activation automatique après paiement : plus tard (serveur).

## Langues et commandes vocales (fait, demande du propriétaire)

- **Français ou anglais** : choix sur l'écran d'accueil et dans Réglages → Langue (la page se recharge). L'appli reste écrite en français ; en anglais, `app/i18n.js` traduit chaque texte au moment où il s'affiche (dictionnaire exact `EN` + motifs `EN_MOTIFS` pour les textes avec nombres ou noms), grâce à un MutationObserver. Dictionnaires : `app/langues/en-principal.js` (app.js, index.html), `en-boutique.js` (charges, fiches, intrants, boutique), `en-extras.js` (paiements, facture, contacts, abonnement). Les textes hors écran (WhatsApp, factures dessinées, confirmations, fichiers) passent par `tr("…")`. Les dates suivent la langue (`LOCALE`), les montants gardent « 12 500 F ». Un nouveau texte doit recevoir sa traduction anglaise dans le bon dictionnaire.
- **Commandes vocales** (`app/voix.js`), pour ceux qui écrivent ou lisent peu : gros bouton « Parler » sur l'écran Jour. Phrases comprises (français et anglais, chiffres ou mots) : « Vente 2 000 », « Crédit Koffi 5 000 (pour du riz) », « Koffi a payé 2 000 », « Dépense transport 500 », « Maison 1 000 », « Combien j'ai gagné ? », « Qui me doit ? ». Canari **remplit la fenêtre et le dit à voix haute** ; rien n'est enregistré sans appuyer sur « Enregistrer ». Bouton « Écouter » : lit le bilan du jour. La reconnaissance vocale de Chrome a besoin d'internet ; la lecture à voix haute marche en général sans. Les langues locales (dioula, baoulé…) ne sont pas reconnues par les téléphones.

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
8. Préparation pour le Play Store (icône, captures d'écran, description).

À chaque étape : montrer le résultat, expliquer comment le tester, attendre l'avis du propriétaire avant de passer à la suite.

## Marque et droits

- Le nom Canari n'a pas encore été déposé. Avant le lancement public : recherche d'antériorité puis dépôt à l'OAPI via l'OIPI (Abidjan-Plateau).
- Ne jamais utiliser de personnages, logos ou noms d'autres marques.

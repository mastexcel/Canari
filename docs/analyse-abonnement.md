# Abonnement Canari : analyse et proposition

## Décision du propriétaire

- Canari est **gratuit pendant 3 mois** (90 jours à partir du premier jour d'utilisation), puis **payant**.
- Paiement par **mobile money** et par **carte**, l'argent arrivant sur le **compte entreprise Djamo** du propriétaire.

## Prix proposé

| Formule | Prix | Par jour | Remarque |
|---|---|---|---|
| 1 mois | **1 000 F** | ~35 F | pour essayer sans s'engager |
| 3 mois | **2 500 F** | ~27 F | 500 F d'économie |
| 1 an | **9 000 F** | ~25 F | 3 mois offerts, formule mise en avant |

Pourquoi ce niveau :
1. **Le client.** Un boutiquier ou une commerçante qui gagne quelques milliers de francs de bénéfice par jour. Le prix doit être une petite dépense qu'on ne regrette pas : **moins qu'un pain par jour**.
2. **La valeur rendue.** Un seul crédit oublié (2 000 à 5 000 F) coûte plus qu'un à cinq mois d'abonnement. Le message de vente est simple : « Canari se paie tout seul dès le premier crédit récupéré. »
3. **La concurrence.** Plusieurs concurrents sont gratuits (ils gagnent leur argent avec la publicité ou des prêts) ; d'autres font payer des abonnements dont les utilisateurs se plaignent. Canari doit donc rester **bon marché** et **montrer ce qu'on gagne à payer** : zéro publicité, tout en un, relances, factures, bénéfice net. Les prix exacts des concurrents sont à vérifier sur le terrain avant de fixer le prix final.
4. **Des montants ronds** (1 000, 2 500, 9 000) faciles à envoyer par mobile money.
5. **Payer à l'année** rapporte plus d'argent d'un coup au propriétaire et fait moins de clients qui arrêtent : c'est la formule conseillée.

À faire avant le lancement : demander à **10 à 20 commerçants** qui ont utilisé les 3 mois gratuits s'ils paieraient 1 000 F par mois, et ajuster. Un prix de lancement (par exemple 7 500 F l'année pour les 100 premiers) peut aider.

Frais : les opérateurs et agrégateurs prennent une commission (souvent de l'ordre de 1 à 3,5 % selon le service ; à vérifier avec chacun). Sur 1 000 F, cela fait quelques dizaines de francs.

## Ce qui se passe à la fin de l'essai (choix fait pour ne pas fâcher les clients)

- Canari prévient **10 jours avant** avec un bandeau sur l'écran principal.
- Après la fin : **rien n'est effacé ni caché**. On peut toujours voir ses chiffres, ses crédits, relancer, noter les remboursements des clients et faire sa sauvegarde.
- Seules les **nouvelles ventes, dépenses et achats** demandent un abonnement.
- Les jours payés s'ajoutent à la suite de l'essai ou de l'abonnement en cours (payer en avance ne fait rien perdre).
- L'abonnement suit la sauvegarde : en changeant de téléphone, on le garde.

## Comment le paiement marche aujourd'hui (sans serveur)

1. Dans Canari → Réglages → **Mon abonnement**, le client choisit une formule.
2. Il paie sur un des comptes du propriétaire (affichés dans l'appli) en écrivant son **numéro Canari** (8 caractères, ex. K7P2-QX9M) dans le message du paiement.
3. Il touche « Envoyer sur WhatsApp » : un message prêt part vers le WhatsApp du propriétaire.
4. Le propriétaire vérifie l'argent reçu, ouvre sa page privée **gerant.html**, tape le numéro Canari et la formule : un **code signé** est créé, avec un lien, à envoyer sur WhatsApp.
5. Le client touche le lien (ou colle le code) : l'abonnement est activé, même sans internet.

Sécurité : le code est signé avec une **clé secrète** qui reste sur le téléphone du propriétaire. L'appli ne contient que la clé publique, qui vérifie les codes mais ne peut pas en fabriquer. Un code ne marche que pour un seul numéro Canari et une seule fois.

Limites connues : quelqu'un de très habile peut remettre son essai à zéro en effaçant l'appli (il perd alors tous ses chiffres), ou partager sa sauvegarde avec une autre boutique. C'est acceptable au début.

## Moyens de paiement choisis par le propriétaire

- **QR code Djamo** du compte entreprise : le client le scanne avec Djamo, Wave, Orange Money, MTN MoMo ou Moov Money. L'appli affiche le QR code, propose de l'enregistrer (on ne peut pas scanner l'écran de son propre téléphone : on scanne l'image depuis la galerie si l'appli de paiement le permet, ou avec un autre téléphone), et ouvre la page de paiement si le QR contient un lien.
- **Carte Visa : pas disponible pour l'instant.** La page de paiement Djamo du propriétaire (`https://pay.djamo.com/hq91c`) ne propose que le mobile money. Le bouton reste caché dans l'appli. À demander à Djamo : « pouvez-vous m'activer un lien de paiement qui accepte les cartes Visa ? »
- Tout l'argent arrive sur le compte entreprise Djamo.

## Paiement automatique (plus tard)

Recevoir une carte bancaire, ou activer l'abonnement **tout seul** après un paiement mobile money, demande un **agrégateur de paiement** (des entreprises qui encaissent mobile money et cartes pour le compte d'un marchand et envoient une confirmation), plus un **petit serveur** qui reçoit cette confirmation et crée le code. Il faut une entreprise enregistrée (RCCM) et un contrat avec l'agrégateur.

Questions à poser à Djamo (et aux agrégateurs) :
- Mon compte entreprise Djamo peut-il **recevoir directement** des paiements Wave, Orange Money, MTN MoMo et Moov Money ? Avec quel numéro ou quel lien ?
- Djamo propose-t-il un **lien de paiement** ou un service d'encaissement par **carte** pour les entreprises ?
- Sinon : un agrégateur peut-il **reverser l'argent sur mon compte Djamo** (virement ou RIB du compte entreprise) ?

Dès que le propriétaire a ces réponses, l'appli a déjà un emplacement pour le lien « Payer par carte bancaire » (`RECEPTION.carte` dans `app/abonnement.js`).

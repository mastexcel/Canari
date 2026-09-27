# Canari · Analyse : paramétrage et structure des coûts

Demande du propriétaire : avant d'utiliser Canari, l'utilisateur répond à une série de questions pour décrire ses produits et services. Pour chaque produit, Canari construit une **structure de coûts** (intrants, quantités, prix unitaires, coûts intermédiaires). Les achats sont notés en unités (kg, litre, unité…). Les charges administratives, puis les taxes et impôts, sont déduits pour obtenir le **bénéfice net**.

Ce document est une proposition. Il n'est pas encore validé.

## 1. Trois façons de fabriquer un prix de revient

| Type d'activité | Exemples | Ce qui compose le prix de revient d'une unité vendue |
|---|---|---|
| **Revente de marchandises** | boutique, vente de pagnes, quincaillerie | prix d'achat de la marchandise, ramené à l'unité de vente (un sac de 50 kg acheté, vendu au kg) + frais d'approche éventuels (transport, emballage) |
| **Transformation / fabrication** | attiéké, pain, jus, savon, couture de vêtements | **fiche recette** : chaque intrant × quantité × prix unitaire (kg, litre, unité) + coûts du lot (gaz, eau, électricité, emballage, main-d'œuvre payée au lot), le tout divisé par le nombre d'unités obtenues par lot |
| **Prestation de services** | coiffure, réparation, transport, couture sur mesure | **coûts intermédiaires** par prestation : produits consommés (mèches, pièces), sous-traitance, déplacement, énergie |

Un même commerçant peut avoir les trois (une couturière vend des pagnes, coud et fait des retouches). Le type se choisit donc **par produit**, pas pour toute la boutique.

## 2. La cascade de calcul

```
  Ventes (chiffre d'affaires, même à crédit)
− Coût de revient des ventes (marchandises, intrants, coûts intermédiaires)
= MARGE BRUTE
− Charges fixes / administratives (loyer, salaires, électricité de la boutique, téléphone, patente…)
= RÉSULTAT AVANT IMPÔTS
− Impôts et taxes (montant fixe ou pourcentage des ventes, renseignés par l'opérateur)
= BÉNÉFICE NET
```

Les charges fixes et les impôts sont surtout **mensuels** ou **annuels**, alors que Canari affiche des **journées**. Deux vues :
- **Jour** : la marge brute du jour. En dessous : « part des charges du jour ≈ X F » (charges du mois ÷ jours de travail) et « bénéfice net estimé ».
- **Mois** (nouvel écran, à côté de Semaine) : la cascade complète, avec les vrais montants du mois.

## 3. Le paramétrage (questionnaire de départ)

Une seule question par écran, avec la mascotte, de gros boutons et « Passer » partout. On peut le refaire depuis Réglages.

1. **Ta boutique** : nom, logo, téléphone, adresse (existe déjà).
2. **Ce que tu fais** (plusieurs choix) : je revends / je fabrique / je fais des services.
3. **Tes produits et services** : pour chacun, sa **fiche de coût** selon son type (voir 4). Des **modèles pré-remplis** proposent les lignes habituelles (par exemple pour l'attiéké : manioc, ferment, huile, sachets, gaz, main-d'œuvre). L'utilisateur tape ses quantités et ses prix. Canari n'invente pas de prix : ils changent d'un marché à l'autre.
4. **Tes charges fixes** : loyer, salaires, électricité, eau, téléphone, transport régulier, patente, ticket de marché… avec leur montant et leur fréquence (jour / semaine / mois / an), et le nombre de jours de travail par mois.
5. **Tes impôts et taxes** : montant fixe (par mois, trimestre ou an) ou pourcentage des ventes. Les régimes ivoiriens (DGI, taxes communales) pourront être proposés plus tard, après vérification. L'opérateur reste maître des montants.

## 4. La matrice de structure de coûts (par produit)

Exemple : **pain de 250 g**. Les chiffres sont fictifs, pour montrer la forme.

| Poste | Quantité par lot | Unité | Prix unitaire | Coût du lot |
|---|---|---|---|---|
| Farine | 25 | kg | 600 F/kg | 15 000 F |
| Levure | 0,25 | kg | 4 000 F/kg | 1 000 F |
| Sel | 0,5 | kg | 300 F/kg | 150 F |
| Gaz | 1 | lot | 2 000 F | 2 000 F |
| Main-d'œuvre | 1 | lot | 3 000 F | 3 000 F |
| Sachets | 100 | unité | 10 F | 1 000 F |
| **Total du lot** | | | | **22 150 F** |
| Unités obtenues par lot | 100 pains | | | |
| **Coût de revient d'un pain** | | | | **222 F** |
| Prix de vente | | | | 250 F |
| **Marge brute par pain** | | | | **28 F (11 %)** |

- Pour une **marchandise**, la matrice a une ligne « achat » (prix du sac ou du carton ÷ nombre d'unités vendues dedans) et des lignes de frais facultatives.
- Pour un **service**, elle liste les coûts intermédiaires d'une prestation.
- Canari affiche en couleur les produits qui rapportent peu ou font perdre de l'argent.

## 5. Les achats en unités

Nouvel écran **« Achat »** : quoi (marchandise, intrant ou service intermédiaire), quantité, unité (kg, litre, unité, sac, carton, bidon…), prix total. Canari calcule le **prix unitaire**, puis :
- ajoute au **stock** (marchandise ou intrant) ;
- met à jour le prix dans les fiches de coût (dernier prix, ou prix moyen : à décider) ;
- sort l'argent de la caisse, ou crée une dette fournisseur si ce n'est pas payé.

Pour la transformation, un bouton **« J'ai fabriqué »** : « 100 pains ». Canari retire les intrants du stock selon la recette et ajoute 100 pains au stock de produits finis.

## 6. Le risque et comment l'éviter

Le client visé doit comprendre un écran en 2 secondes. Une comptabilité analytique complète peut le décourager. Précautions :
- **Deux niveaux** : « simple » (ce qui existe, avec la marge habituelle) et « détaillé » (fiches de coût). Le questionnaire active le niveau détaillé, produit par produit.
- **Tout est facultatif** : un produit sans fiche utilise la marge habituelle, et l'appli marche quand même.
- **Modèles pré-remplis** pour les activités les plus courantes.
- La cascade complète n'apparaît que dans l'écran **Mois**. L'écran Jour reste lisible.

## 7. Découpage proposé

- **Lot A** : charges fixes, impôts et taxes, écran Mois avec la cascade complète, bénéfice net estimé sur l'écran Jour, questions 2, 4 et 5 du paramétrage.
- **Lot B** : fiches de coût par produit (3 types) avec unités, matrice affichée, modèles pré-remplis, question 3.
- **Lot C** : achats en unités, stock des intrants, « J'ai fabriqué », mise à jour automatique des prix.

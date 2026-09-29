# Les informations de Bridge Investment & Partners, pour la facture

La facture d'abonnement que reçoit chaque commerçant est **émise par Bridge
Investment & Partners**. Pour qu'elle ait une valeur administrative en Côte
d'Ivoire, elle doit porter tes numéros d'entreprise.

Tant qu'une case est vide, elle n'est simplement pas écrite sur la facture.

## Ce que j'ai déjà mis (29/09/2026)

Tiré de ta **déclaration fiscale d'existence** et de ton **registre du commerce** :

| Case | Ce que j'ai écrit |
|---|---|
| Forme et capital | SARL au capital de 3 000 000 F CFA |
| Adresse | Cocody Riviera Faya, Abidjan |
| Téléphone | 07 48 34 66 50 *(le fixe est le 25 22 02 01 80)* |
| **N° RCCM** | **CI-ABJ-03-2022-B12-00279** |
| **N° de compte contribuable** | **2205980 D** |

## Ce qui manque encore — trois choses

1. **L'e-mail.** Sur ta déclaration il est écrit à la main et je n'arrive pas à
   le lire avec certitude (« jja@bipexp… »). Je ne l'invente pas : une adresse
   fausse sur une facture, ce sont des clients qui écrivent dans le vide.
   **Écris-la-moi.**
2. **La mention de TVA.** Sur ta déclaration, la case TVA n'est pas cochée parmi
   tes obligations fiscales (ton régime est « IM »). La phrase exacte à écrire
   dépend de ton régime, et c'est la seule ligne de la facture qui engage ta
   responsabilité fiscale : **demande-la à ton comptable.** Souvent :
   « TVA non applicable — article 355 du Code général des impôts ».
3. **Une vérification de ta part.** Relis les deux numéros ci-dessus sur ta
   facture, à l'écran. Un chiffre de travers sur un numéro fiscal, et la facture
   ne vaut rien. **C'est toi qui confirmes, pas moi.**

## Un écart que je te signale

Ton registre du commerce dit « **BRIDGE INVESTMENT PARTNERS** » (sans le « & »),
ton logo dit « **BRIDGE INVESTMENT & PARTNERS** ». J'ai gardé la version du logo,
parce que c'est celle que tes clients reconnaissent. Si ton comptable préfère la
dénomination exacte du registre, dis-le-moi : c'est un mot à changer.

## Où ça se remplit

Dans le fichier **`app/emetteur.js`**. Il ne contient que ça, et tout est écrit
en clair : il suffit d'écrire entre les guillemets.

```js
const EMETTEUR = {
  nom: "Bridge Investment & Partners",
  produit: "Canari",
  logo: "icones/bip.webp",
  adresse: "",     // ← ici
  tel: "",         // ← ici
  email: "",       // ← ici
  rccm: "",        // ← ici
  dfe: "",         // ← ici
  tva: ""          // ← ici
};
```

Tu peux aussi me donner les six lignes en message : je les mets moi-même, je
vérifie le rendu et je remets l'appli en ligne.

## Pourquoi un seul fichier

Ces informations servent à **deux endroits** : la facture que le commerçant voit
dans l'appli, et celle que tu peux lui renvoyer depuis ta page privée
(`gerant.html`). Les deux lisent le même fichier, donc il n'y a jamais deux
versions différentes de ta facture.

# Les informations de Bridge Investment & Partners, pour la facture

La facture d'abonnement que reçoit chaque commerçant est **émise par Bridge
Investment & Partners**. Pour qu'elle ait une valeur administrative en Côte
d'Ivoire, elle doit porter tes numéros d'entreprise.

Tant que ces cases sont vides, elles ne sont simplement pas écrites sur la
facture : elle reste jolie, avec les deux logos et les montants, mais elle ne
vaut pas comme pièce comptable.

## Ce qu'il me faut

Réponds-moi simplement, une ligne par case :

| Case | Ce que c'est | Exemple |
|---|---|---|
| **Adresse** | Où se trouve l'entreprise | Cocody Riviera 3, Abidjan |
| **Téléphone** | Le numéro de l'entreprise | 05 84 37 48 48 |
| **E-mail** | L'adresse à laquelle un client peut écrire | contact@bip.ci |
| **N° RCCM** | Le Registre du commerce et du crédit mobilier | CI-ABJ-2024-B-12345 |
| **N° de DFE / NCC** | Le compte contribuable (Direction des Impôts) | 2401234 A |
| **Mention de TVA** | Ce que ton comptable veut voir écrit | TVA non applicable, article 355 du CGI |

La **mention de TVA** dépend de ton régime : si tu es à l'impôt synthétique ou à
la taxe d'État de l'entreprenant, tu ne factures pas de TVA et il faut l'écrire ;
si tu es au réel et que tu la factures, il faut la faire apparaître à part.
**Demande à ton comptable la phrase exacte** — je ne peux pas la deviner, et
c'est la seule ligne de la facture qui engage ta responsabilité fiscale.

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

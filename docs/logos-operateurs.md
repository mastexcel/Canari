# Les logos des opérateurs de paiement

Les cases « Moyens de paiement » de l'écran du jour peuvent afficher le **logo
officiel** de chaque opérateur, à la demande du propriétaire (27/10/2026).

## Ce qu'il faut déposer

Dans `app/icones/operateurs/`, un fichier par opérateur, **nommé exactement
comme la clé du moyen** :

| Fichier attendu | Opérateur |
|---|---|
| `wave.svg` | Wave |
| `orange.svg` | Orange Money |
| `mtn.svg` | MTN MoMo |
| `moov.svg` | Moov Money (Flooz) |
| `djamo.svg` | Djamo |

- **SVG de préférence** (net à toutes les tailles, quelques kilo-octets) ;
  un PNG transparent d'au moins 128 × 128 convient aussi — renommer alors
  l'extension dans `logoMoyen()` (`app/app.js`).
- Le logo est affiché en 26 × 26 px, dans un médaillon de 34 px, avec
  `object-fit: contain` : **il n'est jamais étiré ni recoloré**.
- Les **espèces** n'ont pas de logo à demander : leur dessin de billet est
  écrit dans `app/app.js` (constante `BILLET`). Ce n'est la marque de personne.

## Tant qu'un fichier n'est pas là

La case garde **le nom et le montant**, et le médaillon disparaît. Canari ne
met **jamais** un dessin maison à la place du logo d'une marque : ce serait le
contrefaire. Aucun message d'erreur n'est montré au commerçant, mais le
fichier manquant apparaît dans la console du navigateur (une ligne 404).

## Avant de déposer un logo : l'autorisation

Un logo est une **marque déposée**. L'utiliser demande l'accord de son
propriétaire, et chaque opérateur publie ses conditions :

- **Wave** — charte de marque à demander à Wave Business Côte d'Ivoire.
- **Orange Money** — Orange impose une charte d'usage de sa marque ; l'accord
  passe par Orange Côte d'Ivoire.
- **MTN MoMo** — MTN publie un « brand toolkit » réservé à ses partenaires.
- **Moov Money (Flooz)**, **Djamo** — à demander directement.

Le propriétaire est seul juge de cet usage et des accords obtenus. Ce qui
reste vrai dans tous les cas, et qui est écrit dans `CLAUDE.md` :

- le logo n'est **jamais redessiné, recoloré ni déformé** ;
- il ne sert **qu'à désigner le moyen de paiement**, jamais à laisser croire
  à un partenariat ou à une validation de Canari par l'opérateur ;
- aucun autre écran de l'appli ne porte le logo d'une autre marque.

Le Play Store refuse une fiche qui utilise la marque d'un tiers sans droit :
c'est un motif de retrait de l'application.

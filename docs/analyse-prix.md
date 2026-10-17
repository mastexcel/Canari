# Les prix de Canari — relevé du marché et décision (17/10/2026)

Demande du propriétaire : « aligne-toi sur la tarification des applications
similaires avec un léger avantage prix en notre faveur ; les prix pratiqués
actuellement me semblent trop petits. »

## Ce que faisait Canari

| Formule | Prix |
|---|---|
| 1 mois | 1 000 F |
| 3 mois | 2 500 F |
| 1 an | 9 000 F |

Une seule entreprise par téléphone, et les trois formules ne se distinguaient
que par la durée.

## Ce que fait le marché

Relevé par recherche sur le web en octobre 2026. **Ce sont des prix affichés
par les éditeurs eux-mêmes, pas des devis vérifiés** : à confirmer avant d'en
faire un argument public.

Le marché se coupe en deux, et Canari tombe entre les deux.

### 1. Les carnets de crédit pour micro-commerçants

| Produit | Pays | Prix |
|---|---|---|
| OkCredit | Inde | gratuit ; les formules payantes ne sont pas publiées |
| Khatabook | Inde | gratuit ; ~600 F/mois cité par un annuaire tiers, non confirmé |
| IKA DJAGO, Mondjago | Côte d'Ivoire | gratuits au téléchargement, aucun tarif publié |

Ils vivent de la **publicité**. Canari a promis de ne jamais en mettre : il
doit donc faire payer. C'est le plancher, pas la cible.

### 2. Les logiciels de gestion pour PME d'Afrique francophone

| Produit | Prix mensuel | Ce qu'on a pour ce prix |
|---|---|---|
| GestionsPro | 3 000 F (Basic) · 5 000 F (Pro) | gestion en ligne |
| **FiaVia Essentiel** | **8 900 F** | **1 magasin**, 3 utilisateurs |
| FiaVia Classique | 14 900 F | |
| FiaVia Professionnel | 19 900 F | |
| Ngavix Starter (Cameroun) | 10 000 F | 2 utilisateurs, CRM, stock, facturation |
| Madata (Côte d'Ivoire) | à partir de 15 000 F, jusqu'à 70–90 000 F | selon le pack |
| KiboERP Pro | 59 900 F | 10 utilisateurs, SYSCOHADA |
| Odoo | 52 000 à 117 000 F | hors intégration |
| TPEBoost | licence à vie à partir de 65 000 F | |

FiaVia est **le comparable le plus proche** : un logiciel de gestion pour
commerçants d'Afrique, dont l'entrée de gamme couvre **une seule boutique**.
C'est lui qui sert de repère.

## La décision

Trois formules, qui se distinguent par le **nombre d'entreprises** — c'est
l'autre demande du propriétaire du même jour.

| Formule | Entreprises | 1 mois | 3 mois | 1 an | ramené au mois |
|---|---|---|---|---|---|
| **Solo** | 1 | **3 000 F** | 8 000 F | 27 000 F | 2 250 F |
| **Multi** | 3 | **5 000 F** | 13 500 F | 45 000 F | 3 750 F |
| **Pro** | 10 | **8 000 F** | 21 500 F | 72 000 F | 6 000 F |

L'abonnement annuel se paie **neuf mois pour douze**, comme avant.

### Pourquoi ces chiffres

- **3 000 F pour l'entrée de gamme**, c'est **trois fois l'ancien prix** — le
  propriétaire trouvait l'ancien trop petit, et il avait raison : 1 000 F par
  mois, c'était le prix d'un plat de riz.
- C'est **trois fois moins cher que FiaVia Essentiel** (8 900 F), qui couvre
  pourtant la même chose : une boutique. L'avantage prix est net, et il se
  défend : Canari est plus simple, il n'a pas de multi-utilisateur, il n'est
  pas un ERP.
- **Même la formule Pro (10 entreprises) à 8 000 F reste sous le prix d'une
  seule boutique chez FiaVia.** C'est l'argument commercial le plus fort de la
  grille, et il est vrai.
- Pour le commerçant visé — 5 000 à 15 000 F de bénéfice par jour —, 3 000 F
  par mois représente **environ 1 à 2 % de son bénéfice mensuel**. À 8 900 F,
  on serait à 6 % : impayable pour lui.

### Ce que ça change pour le test terrain

`docs/test-terrain.md` demandait : « paieront-ils 1 000 F par mois ? ». La
question devient **3 000 F par mois, ou 27 000 F l'année**. Il faut aussi
demander si l'idée de tenir **plusieurs entreprises** en intéresse certains :
c'est ce qui fait passer de 3 000 à 5 000 F.

### Ce qui reste à vérifier

1. Les prix du tableau viennent de pages d'éditeurs trouvées par recherche sur
   le web. **Il faut les confirmer** — au minimum FiaVia, le comparable direct.
2. Le terrain tranchera : si dix commerçants sur dix disent non à 3 000 F, le
   chiffre est trop haut, pas le marché.
3. Les prix vivent **à un seul endroit** du code, `PRIX` dans
   `app/abonnement.js`, et sont recopiés dans `tunnel/fabriquer-scenarios.py`
   (c'est le serveur qui encaisse) et dans `app/gerant.html` (la liste des
   formules du propriétaire). Si un prix change, ces trois endroits changent,
   et les visuels de publicité se refont (`store/pub/`).

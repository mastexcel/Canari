# Les visuels de publicité de Canari

Sept images, prêtes à envoyer ou à imprimer. Elles sont **fabriquées par le code**
(`fabriquer.py` puis `photographier.mjs`) : si un prix, le slogan ou une capture
d'écran changent, on relance les deux scripts et les sept images se refont.

## Ce que tu as, et où t'en servir

| Fichier | Taille | Où l'utiliser |
|---|---|---|
| `statut-gain.png` | 1080 × 1920 | **Statut WhatsApp**, story Facebook ou Instagram. L'accroche la plus forte : « Tu sais combien tu as *vraiment* gagné aujourd'hui ? » |
| `statut-credit.png` | 1080 × 1920 | **Statut WhatsApp**, story. Pour parler des crédits et des relances — c'est le problème que les commerçants ressentent le plus. |
| `carre-marque.png` | 1080 × 1080 | **Post Facebook / Instagram.** La carte de visite : la mascotte, le nom, le slogan, ce que l'appli fait. À utiliser en premier post. |
| `carre-relance.png` | 1080 × 1080 | **Post.** Montre le message de relance tout écrit. C'est celui qui fait comprendre l'intérêt en deux secondes. |
| `carre-prix.png` | 1080 × 1080 | **Post.** Le prix, annoncé franchement : 1 mois gratuit, puis 1 000 F. Et « zéro publicité ». |
| `banniere.png` | 1200 × 630 | **Couverture de page Facebook**, et c'est aussi elle qui sert d'aperçu quand on envoie le lien (voir plus bas). |
| `flyer.png` | 1748 × 2480 | **Flyer A5 à imprimer** (300 points par pouce). Avec le **QR code** : le commerçant le scanne avec son appareil photo et l'appli s'installe. À distribuer au marché, à laisser chez les grossistes. |

## Trois conseils pour t'en servir

1. **Le statut WhatsApp est ton meilleur canal.** Tes clients et tes connaissances
   le voient sans que tu aies à payer quoi que ce soit. Mets `statut-gain.png` un
   jour, `statut-credit.png` trois jours plus tard, et écris le lien dans le texte
   du statut : on ne peut pas cliquer sur une image.
2. **Le flyer avec le QR code marche mieux en vrai qu'un lien.** Au marché,
   personne ne tape une adresse à la main. Avec le QR, il sort son téléphone,
   il scanne, c'est installé. Imprime-le en A5, en couleur.
3. **Montre le bénéfice, pas l'application.** Les trois visuels qui marchent le
   mieux sont ceux qui posent une question que le commerçant se pose déjà :
   combien j'ai gagné, qui me doit, combien ça coûte.

## L'aperçu du lien

Quand tu envoies `https://mastexcel.github.io/Canari/` sur WhatsApp ou Facebook,
l'image `banniere.png` s'affiche automatiquement avec le titre et une phrase.
C'est réglé dans `app/index.html` (les lignes `og:`) et l'image est dans
`app/icones/partage.jpg` (79 Ko, compressée exprès : elle est téléchargée par
celui qui reçoit le lien).

**Si tu changes la bannière**, refais aussi cette image :

```
python3 -c "from PIL import Image; im=Image.open('store/pub/banniere.png').convert('RGB'); im.save('app/icones/partage.jpg','JPEG',quality=84,optimize=True,progressive=True)"
```

## Refaire les images

```
python3 store/pub/fabriquer.py        # écrit le modèle dans /tmp/claude-0/pub/modele.html
node    store/pub/photographier.mjs   # photographie les sept visuels dans store/pub/
```

`fabriquer.py` a besoin des captures d'écran de l'appli dans `/tmp/claude-0/pub/`
(`tel-jour.png`, `tel-credits.png`, `tel-relances.png`, `tel-tableau.png`) :
ce sont des captures de l'appli réduites de moitié, aux coins arrondis.

## Ce qu'on n'écrit jamais sur un visuel

- Aucun logo, nom ou personnage d'une autre marque (Wave, Orange, WhatsApp…).
  On peut **nommer** WhatsApp dans une phrase, pas poser son logo.
- Aucune promesse de gain (« gagne plus », « double ton chiffre »).
  Canari compte ce que le commerçant gagne ; il ne le fait pas gagner.
- Aucun prix qui ne soit pas celui de l'appli. Si le prix change, on refait les images.

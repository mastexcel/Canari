# Les visuels de la fiche Play Store

Ce dossier contient ce qu'on envoie à Google, et de quoi le refabriquer.

## Ce qu'on envoie

| Fichier | Où il sert |
|---|---|
| `icone-512.png` | l'icône de la fiche |
| `icone-maskable-512.png` | l'icône adaptative d'Android |
| `banniere-1024x500.png` | le bandeau en haut de la fiche |
| `capture-1.png` … `capture-5.png` | les captures d'écran (1080 × 1920) |

## Comment c'est fabriqué

1. **Découper les vignettes** — `detourer-mascotte.py` découpe les cinq vignettes
   de la planche fournie par le propriétaire (joyeux, clin d'œil, yeux fermés,
   tranquille, pensif). Les vignettes servent **telles qu'elles se présentent**,
   avec leur carte crème : on n'ôte que le blanc de la planche autour d'elles,
   pour que leurs coins arrondis restent arrondis.
2. **Fabriquer les images de l'appli** — `fabriquer-images.py` met chaque
   découpe dans le cadre attendu par `app/icones/`, et compose les icônes sur le
   vert de la marque.
3. **Prendre les captures d'écran** — `captures.mjs` ouvre l'appli avec une
   boutique de démonstration (35 jours de ventes, des crédits, un investissement)
   et enregistre `ecran-1-jour.png` … `ecran-5-facture.png`.
4. **Composer la fiche** — `preview.html` pose le bandeau de titre au-dessus de
   chaque capture et dessine la bannière ; `composer.mjs` en fait les PNG finaux.

Il faut un petit serveur local pour les étapes 3 et 4 (`python3 -m http.server
8767` à la racine du projet), parce qu'une page ouverte en `file://` ne peut pas
lire les polices ni les images d'à côté.

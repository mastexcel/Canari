"""Découpe la planche du canari et enlève le fond : cinq images transparentes.

Le fond de cette planche est un DÉGRADÉ chaud (presque noir dans les coins, halo
doré derrière les personnages). On ne peut pas l'enlever par la couleur : son halo
est proche de l'orange du personnage et du jaune des pièces.

Ce qui le trahit, c'est qu'un dégradé ne varie que très lentement, et que la lueur
peinte autour des pièces est floue elle aussi. On floute donc l'image très fort
(rayon 45) pour obtenir le fond seul, on le soustrait, et il ne reste que ce qui
change vite : le personnage, ses traits, ses éclats.

Le seuil de cet écart suit la CLARTÉ du fond à cet endroit (un septième de sa
valeur, entre 11 et 18) : le pied gauche du grand personnage se trouve dans le
coin sombre de la planche, où orange sur brun ne creuse qu'une petite différence
— un seuil unique le coupait en deux. On referme ensuite les fentes du
contour (rayon 13, la plus petite valeur qui remplisse le corps d'un bout à
l'autre), on rebouche l'intérieur, puis on rogne quatre pixels : mieux vaut
mordre un cheveu sur le dessin que garder un liseré de fond brun autour. Le bord
est enfin adouci au flou (rayon 2,2) : sans lui il resterait en dents de scie,
là où le personnage se détache mal du coin sombre de la planche.

Les cinq personnages sont ensuite séparés par des lignes de coupe passant là où la
planche est vide (mesuré : y = 497 au milieu, y = 485 à droite).
"""
import numpy as np
from PIL import Image
from scipy import ndimage

SOURCE = "planche-canari.png"   # la planche de dessins fournie par le propriétaire
PANNEAUX = {
    "joyeux":      (20, 10, 800, 1010),      # grand : pouce levé, pièce, il marche
    "clin-doeil":  (720, 10, 1150, 497),     # clin d'œil, pouce levé
    "yeux-fermes": (1150, 10, 1530, 485),    # bras levés, yeux fermés
    "tranquille":  (720, 497, 1150, 1015),   # bras croisés, paisible
    "pensif":      (1150, 485, 1530, 1015),  # assis, main sur la joue
}

def disque(r):
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r

def silhouettes(im, flou=45, part=0.14, mini=11, maxi=18, fente=13, rognage=4):
    gris = np.asarray(im.convert("RGB")).astype(float).mean(2)
    fond = ndimage.gaussian_filter(gris, flou)
    ecart = np.abs(gris - fond)                       # le dégradé s'annule
    seuil = np.clip(part * fond, mini, maxi)          # plus bas là où la planche est sombre
    m = ndimage.binary_fill_holes(ndimage.binary_closing(ecart > seuil, disque(fente)))
    return ndimage.binary_erosion(m, disque(rognage))

src = Image.open(SOURCE)
rgb = np.asarray(src.convert("RGB"))
masque = silhouettes(src)

for nom, (x0, y0, x1, y1) in PANNEAUX.items():
    part = np.zeros(masque.shape, bool)
    part[y0:y1, x0:x1] = masque[y0:y1, x0:x1]
    # Dans chaque panneau on ne garde que le personnage : les morceaux du voisin
    # coupés par la ligne sont jetés. Ses éclats jaunes tiennent à sa pièce, donc
    # ils font partie du même bloc et restent.
    et, n = ndimage.label(part)
    if n:
        t = ndimage.sum(part, et, range(1, n + 1))
        part = et == int(np.argmax(t)) + 1
    doux = ndimage.gaussian_filter(part.astype(np.float32), 2.2)
    alpha = np.clip((doux - 0.5) / 0.18 + 0.5, 0, 1)
    im = Image.fromarray(np.dstack([rgb, (alpha * 255).astype(np.uint8)]), "RGBA")
    im = im.crop(im.getchannel("A").getbbox())
    im.save(f"decoupes/{nom}.png")
    print(nom.ljust(14), "->", im.size)

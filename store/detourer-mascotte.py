"""Découpe les cinq vignettes du canari dans la planche fournie par le propriétaire.

Demande du propriétaire : garder les vignettes **telles qu'elles se présentent**,
avec leur carte crème et son motif de vagues. On ne détoure donc pas le
personnage : on découpe la carte, et on rend transparent le blanc qui l'entoure,
pour que ses coins arrondis restent arrondis au lieu de laisser un carré blanc.

Le fond de la planche est blanc pur, la carte est crème : la séparation est
immédiate. On rebouche ensuite l'intérieur, sinon les parties blanches du dessin
(le zigzag du ventre, le blanc des yeux) seraient percées elles aussi.
"""
import numpy as np
from PIL import Image
from scipy import ndimage

SOURCE = "planche-canari.png"   # la planche de dessins fournie par le propriétaire
# nom : (x0, y0, x1, y1) — mesuré sur la planche, une vignette par personnage.
PANNEAUX = {
    "joyeux":      (12, 120, 728, 876),    # grand : pouce levé, pièce, il marche
    "clin-doeil":  (741, 102, 1123, 502),  # clin d'œil, pouce levé
    "yeux-fermes": (1136, 101, 1523, 502), # bras levés, yeux fermés
    "tranquille":  (741, 529, 1123, 937),  # bras croisés, paisible
    "pensif":      (1136, 529, 1523, 938), # assis, main sur la joue
}

def carte(im, blanc=750):
    """La vignette seule : tout sauf le blanc de la planche autour."""
    a = np.asarray(im.convert("RGB")).astype(int)
    dedans = ndimage.binary_fill_holes(a.sum(2) < blanc)
    doux = ndimage.gaussian_filter(dedans.astype(np.float32), 0.6)
    return np.clip((doux - 0.45) / 0.2, 0, 1)

src = Image.open(SOURCE)
for nom, (x0, y0, x1, y1) in PANNEAUX.items():
    v = src.crop((x0, y0, x1 + 1, y1 + 1))
    alpha = carte(v)
    im = Image.fromarray(np.dstack([np.asarray(v.convert("RGB")),
                                    (alpha * 255).astype(np.uint8)]), "RGBA")
    im = im.crop(im.getchannel("A").getbbox())
    im.save(f"decoupes/{nom}.png")
    print(nom.ljust(14), "->", im.size)

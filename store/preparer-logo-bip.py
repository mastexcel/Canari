"""Prépare le logo de Bridge Investment & Partners pour la facture d'abonnement.

Le fichier fourni est un carré de 1080 px presque entièrement blanc. On le recadre
sur le dessin, et on rend le blanc transparent pour que le logo se pose proprement
quelle que soit la couleur du papier. Le blanc INTÉRIEUR (le creux des lettres B
et P) est protégé : on n'efface que le blanc relié au bord de l'image.
"""
import numpy as np
from PIL import Image
from scipy import ndimage

SOURCE = "logo-bip.jpg"
CIBLE = "../app/icones/bip.webp"
LARGEUR = 600          # assez pour la facture, qui fait 900 px de large

im = Image.open(SOURCE).convert("RGB")
a = np.asarray(im).astype(int)

blanc = a.min(2) >= 235
etiquettes, n = ndimage.label(blanc)
bords = set(etiquettes[0].tolist() + etiquettes[-1].tolist() +
            etiquettes[:, 0].tolist() + etiquettes[:, -1].tolist()) - {0}
dehors = np.isin(etiquettes, list(bords))

doux = ndimage.gaussian_filter((~dehors).astype(np.float32), 0.6)
alpha = np.clip((doux - 0.45) / 0.2, 0, 1)
logo = Image.fromarray(np.dstack([np.asarray(im), (alpha * 255).astype(np.uint8)]), "RGBA")
logo = logo.crop(logo.getchannel("A").getbbox())
logo = logo.resize((LARGEUR, round(logo.height * LARGEUR / logo.width)), Image.LANCZOS)
logo.save(CIBLE, "WEBP", quality=88, method=6)
print("bip.webp", logo.size)

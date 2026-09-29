"""Fabrique les images de Canari à partir des cinq découpes du nouveau dessin.

Chaque mascotte est posée dans un cadre de la même forme que l'ancienne image
(360 × 42x) : les <img> de l'appli gardent ainsi exactement leurs proportions.
Le personnage est mis à l'échelle sur sa HAUTEUR, pas sur le cadre : sinon
celui qui a les bras repliés (plus étroit) paraîtrait plus grand que les autres
alors que l'appli fixe la largeur et laisse la hauteur suivre.

L'icône que le TÉLÉPHONE affiche garde le fond vert de la marque (#174A3F,
celui du manifeste et de l'écran de démarrage) : sur un écran d'accueil, une
image sans fond se perdrait dans le papier peint.

Dans l'APPLI en revanche, plus aucun fond vert (demande du propriétaire) :
le petit logo de l'en-tête et l'avatar des messages sont la jarre seule, posée
sur l'ivoire de la page.
"""
import os
from PIL import Image

SOURCE = "decoupes"
CIBLE = "../app/icones"
VERT = (23, 74, 63)          # --vert-foret, comme le manifeste

# fichier → (découpe, largeur, hauteur) ; mêmes dimensions que les anciennes images
MASCOTTES = {
    "mascotte-canari-3d": ("joyeux", 360, 434),  # le héros garde ses propres proportions
    "canari-clin-doeil":  ("clin-doeil", 360, 422),
    "canari-yeux-fermes": ("yeux-fermes", 360, 428),
    "canari-tranquille":  ("tranquille", 360, 428),
    "canari-pensif":      ("pensif", 360, 429),
}

def poser(perso, largeur, hauteur, marge=0.03, fond=None, bas=True, sur_hauteur=False):
    """Met le personnage dans un cadre donné, centré, posé sur le bas."""
    dispo_l, dispo_h = largeur * (1 - 2 * marge), hauteur * (1 - 2 * marge)
    k = dispo_h / perso.height if sur_hauteur else min(dispo_l / perso.width, dispo_h / perso.height)
    k = min(k, dispo_l / perso.width)
    p = perso.resize((max(1, round(perso.width * k)), max(1, round(perso.height * k))), Image.LANCZOS)
    cadre = Image.new("RGBA", (largeur, hauteur), (fond + (255,)) if fond else (0, 0, 0, 0))
    y = hauteur - round(hauteur * marge) - p.height if bas else (hauteur - p.height) // 2
    cadre.alpha_composite(p, ((largeur - p.width) // 2, y))
    return cadre

def enregistrer_webp(im, chemin, qualite=82):
    im.save(chemin, "WEBP", quality=qualite, method=6)
    return os.path.getsize(chemin)

decoupes = {n: Image.open(f"{SOURCE}/{n}.png") for n in
            ["joyeux", "clin-doeil", "yeux-fermes", "tranquille", "pensif"]}

for nom, (decoupe, l, h) in MASCOTTES.items():
    im = poser(decoupes[decoupe], l, h, sur_hauteur=True)
    print(nom.ljust(20), f"{l}×{h}", round(enregistrer_webp(im, f"{CIBLE}/{nom}.webp") / 1024, 1), "Ko")

# Le logo de l'en-tête et l'avatar des messages : la jarre seule, sans fond.
joyeux = poser(decoupes["joyeux"], 360, 360, marge=0.02)
print("canari-joyeux".ljust(20), "360×360", round(enregistrer_webp(joyeux, f"{CIBLE}/canari-joyeux.webp") / 1024, 1), "Ko")

# Les icônes de l'appli : fond vert plein (Android arrondit lui-même).
for taille in (180, 192, 512):
    ic = poser(decoupes["joyeux"], taille, taille, marge=0.05, fond=VERT).convert("RGB")
    ic = ic.quantize(colors=200, method=Image.MEDIANCUT)
    ic.save(f"{CIBLE}/icone-{taille}.png", optimize=True)
    print(f"icone-{taille}".ljust(20), f"{taille}×{taille}",
          round(os.path.getsize(f"{CIBLE}/icone-{taille}.png") / 1024, 1), "Ko")

# L'icône « maskable » : Android peut rogner jusqu'à 20 % sur les bords,
# le personnage doit donc tenir dans le cercle du milieu.
mask = poser(decoupes["joyeux"], 512, 512, marge=0.14, fond=VERT).convert("RGB")
mask = mask.quantize(colors=200, method=Image.MEDIANCUT)
mask.save(f"{CIBLE}/icone-maskable-512.png", optimize=True)
print("icone-maskable-512".ljust(20), "512×512",
      round(os.path.getsize(f"{CIBLE}/icone-maskable-512.png") / 1024, 1), "Ko")

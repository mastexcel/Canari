"""Fabrique les images de Canari à partir des cinq vignettes découpées.

Demande du propriétaire : les vignettes servent **telles qu'elles se présentent**,
avec leur carte crème et son motif de vagues. On ne fait donc que les réduire :
aucun recadrage, aucune marge ajoutée, aucun fond posé derrière.

Elles sont toutes presque carrées (largeur ≈ 0,95 × hauteur). L'appli fixe la
largeur des <img> et laisse la hauteur suivre, donc réduire à 360 pixels de large
suffit : les cinq mascottes gardent la même taille apparente.

Seule l'icône « maskable » fait exception, et pour une raison technique : Android
rogne jusqu'à 20 % sur les bords des icônes adaptatives, ce qui couperait les
coins arrondis de la carte. On la pose donc sur un aplat de la même couleur
crème, ce qui prolonge la carte au lieu de la trahir.
"""
import os
from PIL import Image

SOURCE = "decoupes"
CIBLE = "../app/icones"
CREME = (250, 242, 229)      # la couleur de fond des vignettes, relevée sur la planche

# fichier → (découpe, largeur) ; la hauteur suit les proportions de la vignette
MASCOTTES = {
    "mascotte-canari-3d": ("joyeux", 360),      # accueil et questionnaire
    "canari-joyeux":      ("joyeux", 180),      # logo de l'en-tête, avatar des messages
    "canari-clin-doeil":  ("clin-doeil", 360),
    "canari-yeux-fermes": ("yeux-fermes", 360),
    "canari-tranquille":  ("tranquille", 360),
    "canari-pensif":      ("pensif", 360),
}

def reduire(im, largeur):
    return im.resize((largeur, round(im.height * largeur / im.width)), Image.LANCZOS)

def enregistrer_webp(im, chemin, qualite=82):
    im.save(chemin, "WEBP", quality=qualite, method=6)
    return round(os.path.getsize(chemin) / 1024, 1)

decoupes = {n: Image.open(f"{SOURCE}/{n}.png") for n in
            ["joyeux", "clin-doeil", "yeux-fermes", "tranquille", "pensif"]}

for nom, (decoupe, largeur) in MASCOTTES.items():
    im = reduire(decoupes[decoupe], largeur)
    print(nom.ljust(20), f"{im.width}×{im.height}",
          enregistrer_webp(im, f"{CIBLE}/{nom}.webp"), "Ko")

# L'icône du téléphone : la vignette telle quelle, dans un carré.
for taille in (180, 192, 512):
    v = decoupes["joyeux"]
    k = taille / max(v.width, v.height)
    p = v.resize((round(v.width * k), round(v.height * k)), Image.LANCZOS)
    ic = Image.new("RGBA", (taille, taille), CREME + (255,))
    ic.alpha_composite(p, ((taille - p.width) // 2, (taille - p.height) // 2))
    ic.convert("RGB").quantize(colors=220, method=Image.MEDIANCUT).save(
        f"{CIBLE}/icone-{taille}.png", optimize=True)
    print(f"icone-{taille}".ljust(20), f"{taille}×{taille}",
          round(os.path.getsize(f"{CIBLE}/icone-{taille}.png") / 1024, 1), "Ko")

# L'icône « maskable » : la même, mais avec 16 % de marge de chaque côté,
# parce qu'Android rogne les bords des icônes adaptatives.
v = decoupes["joyeux"]
dispo = round(512 * (1 - 2 * 0.16))
k = dispo / max(v.width, v.height)
p = v.resize((round(v.width * k), round(v.height * k)), Image.LANCZOS)
mask = Image.new("RGBA", (512, 512), CREME + (255,))
mask.alpha_composite(p, ((512 - p.width) // 2, (512 - p.height) // 2))
mask.convert("RGB").quantize(colors=220, method=Image.MEDIANCUT).save(
    f"{CIBLE}/icone-maskable-512.png", optimize=True)
print("icone-maskable-512".ljust(20), "512×512",
      round(os.path.getsize(f"{CIBLE}/icone-maskable-512.png") / 1024, 1), "Ko")

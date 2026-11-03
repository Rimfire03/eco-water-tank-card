# Fond photo réaliste pour la carte

> La carte embarque déjà un jour et une nuit (générés avec ces prompts). Ce guide sert à utiliser tes propres images.

La carte peut afficher une **image photo-réaliste** à la place du dessin. Elle garde par-dessus, animés : l'eau de la cuve (niveau, vagues, bulles), le filet d'arrivée, l'écoulement dans le tuyau, la pluie (3 profondeurs, éclairs), le flotteur, le repère de volume utilisable et toutes les pastilles de données.

L'image ne contient donc **aucune eau, aucune pluie, aucun texte**.

## 1. Générer l'image (jour)

Outil conseillé : un générateur capable d'éditer / de suivre un cadrage (Midjourney, DALL·E / ChatGPT, Flux, Ideogram...). Format **4:3** (ex. 1200 × 896), export WebP ou JPEG.

Prompt (anglais, à coller tel quel) :

```
Ultra realistic photograph, vertical cross-section cutaway view of a garden, 4:3 landscape, flat even daylight, sharp focus, high detail.
Top 35% of the image: clear blue sky with soft white clouds, distant green hills and trees, a strip of lawn with short grass at the ground line. At the far left edge, the cropped corner of a house: beige clapboard wall, a window with a white frame, roof eave with a gutter and a grey downspout running down the wall.
Bottom 65%: a cutaway of the soil showing layers of dark topsoil, brown clay, small stones and roots, photographic texture.
Buried in the soil, centered: a rectangular concrete rainwater storage tank seen in cross-section. Concrete walls about 2.5% of the image width thick, formwork seams, slight stains. The tank occupies roughly from 26% to 75% of the image width and from 44% to 94% of its height. The interior cavity is EMPTY and dark (no water at all), with plain concrete walls inside.
A vertical access shaft, about 6% of the image width, rises from the middle of the tank roof to the lawn, with metal rungs and a round cast-iron manhole cover flush with the grass.
A grey pipe leaves the downspout at the left, goes down into the soil along the left edge and turns right as a horizontal pipe entering the tank wall near the top of the cavity at about 47% of the image height.
Inside the cavity, bottom right, a yellow submersible pump standing on the floor, with a black cable going up and a grey riser pipe rising through the soil to a garden tap above the lawn at the right.
A short overflow pipe stub exits the tank right wall near the bottom.
No water in the tank or pipes, no rain, no people, no animals, no text, no logos, no watermark.
```

Si le résultat ne respecte pas les positions, ce n'est pas bloquant : voir « Caler » plus bas.

## 2. Version nuit

Donne l'image du jour au générateur (mode image-vers-image / édition) avec :

```
Same image, same composition and framing, exactly the same objects in the same places, but at night: dark blue starry sky with a bright moon, the house window lit warm yellow, soft cool moonlight on the lawn, the buried part lit dimly. Still no water in the tank, no rain, no text.
```

Sans image de nuit, la carte assombrit et teinte l'image du jour toute seule (crépuscule, nuit, pluie).

## 3. Installer les images

Copie les fichiers dans `config/www/eco-water-tank/` (accessibles en `/local/eco-water-tank/...`), puis :

```yaml
type: custom:eco-water-tank-card
device: <id de l'appareil>
image: /local/eco-water-tank/jour.webp
image_night: /local/eco-water-tank/nuit.webp   # optionnel
```

## 4. Caler l'eau sur ta cuve

Les positions sont en **% de l'image** (x, y, largeur, hauteur). Par défaut la cavité est en `[31.3, 55.8, 44.2, 30.7]`. Active `debug: true` pour voir un cadre magenta (zone d'eau) et un trait cyan (tuyau), puis ajuste :

```yaml
debug: true
tank: [30, 48, 41, 42]          # x, y, largeur, hauteur de la cavité vide
pipe: [[10, 14], [10, 48], [30, 48]]   # points du tuyau, du haut de la gouttière jusqu'au mur de la cuve
```

Retire `debug` une fois calé. Le filet d'arrivée part du coin haut-gauche de la zone d'eau : place l'entrée du tuyau dans la cuve à cet endroit.

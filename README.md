# 💧 Eco Water Tank Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/Rimfire03/eco-water-tank-card?include_prereleases)](https://github.com/Rimfire03/eco-water-tank-card/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Donate-orange.svg?logo=buy-me-a-coffee&logoColor=white)](https://buymeacoffee.com/slide598b)

> A realistic, animated Lovelace card for rainwater and water tanks in **Home Assistant**, made for the [Eco Water Tank](https://github.com/Rimfire03/eco-water-tank) integration but **usable without it**, with any sensors and units. Ready for **HACS**.  
> *Une carte Lovelace réaliste et animée pour les cuves d'eau de pluie sous **Home Assistant**, conçue pour l'intégration [Eco Water Tank](https://github.com/Rimfire03/eco-water-tank) mais **utilisable sans elle**, avec n'importe quels capteurs et unités. Prête pour **HACS**.*

---

## ☕ Support / Soutenir le projet

If you find this card helpful, consider buying me a coffee to support the development!  
*Si vous appréciez cette carte, vous pouvez m'offrir un café pour soutenir le développement !*

<a href="https://buymeacoffee.com/slide598b" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 50px !important;width: 217px !important;" ></a>

---

## 🌐 Languages Supported / Langues Disponibles

- 🇬🇧 **English** (Default fallback)
- 🇫🇷 **Français**

*Entity names, states and weather terms come straight from Home Assistant, in your language. Only the few texts specific to the card are translated (English and French).*  
*Les noms d'entités, les états et les termes météo viennent directement de Home Assistant, dans votre langue. Seuls les quelques textes propres à la carte sont traduits (anglais et français).*

---

<p align="center">
  <img src="https://raw.githubusercontent.com/Rimfire03/eco-water-tank-card/main/docs/preview-rain.png" alt="Eco Water Tank card, rainy day" width="49%">
  <img src="https://raw.githubusercontent.com/Rimfire03/eco-water-tank-card/main/docs/preview-night.png" alt="Eco Water Tank card, rainy night" width="49%">
</p>

---

# 🇬🇧 English Documentation

## ✨ Features

- 📸 **Photo-realistic cutaway** of a buried tank, day and night pictures bundled (use your own if you like).
- 💧 **Animated water**: level with waves, bubbles and light patterns, stream from the inlet pipe with splashes, float and level scale. The surface only moves while water enters the tank.
- 🌧️ **Live weather**: rain falls on the scene (three depths, lightning in storms), the sky follows the sun (day, dusk, night).
- 🚰 **Learned flow**: the water in the inlet pipe and the amount of rain show the current flow against the highest flow ever seen, read from the recorder history and learned for good.
- 📊 **All the data on the picture**: level %, volume, capacity, usable volume, rain collected, efficiency, water in / out (today and total), net balance of the day, overflow.
- 📈 **Fill history**: the round button next to the collection efficiency swaps the view for a chart of the tank fill over 24 h, 7 days or 30 days (min, max, average, now; touch or hover for the exact value).
- 🔌 **With or without the integration**: use the Eco Water Tank device, or your own level / volume / flow / rain / pump sensors.
- 📏 **Many units**: L, mL, m³, ft³, gal, … for volumes; mm, cm, m, in, ft, … for heights and rain; L/min, m³/h, gpm, mm/h, in/h, … for flows.
- 🛠️ **Calibration** (integration): real volume or fill, "tank full / empty", share your tank.
- ⚙️ **Visual editor** with a button to **import the configuration from the integration**.

---

## 📦 Installation

### Method 1: Via HACS (Recommended)

1. Open **Home Assistant** and navigate to **HACS** > **Frontend** (**Dashboard**).
2. Open the 3-dots menu > **Custom repositories**, add `https://github.com/Rimfire03/eco-water-tank-card` with the category **Dashboard**.
3. Search for **Eco Water Tank Card** and click **Download**.
4. Refresh your browser when prompted (Ctrl+F5).

---

### Method 2: Manual Installation

1. Download the `dist/eco-water-tank-card.js` file from this repository (or from the latest release).
2. Place `eco-water-tank-card.js` into your Home Assistant directory: `config/www/eco-water-tank-card.js`.
3. In Home Assistant, go to **Settings** > **Dashboards** > **Resources** (top right 3-dots menu).
4. Click **Add Resource**:
   - **URL**: `/local/eco-water-tank-card.js`
   - **Resource type**: `JavaScript Module`
5. Save and reload your dashboard.

---

## 🛠️ Configuration Example (YAML)

With the **Eco Water Tank** integration:

```yaml
type: custom:eco-water-tank-card
device: <device id>                # or: entity: sensor.my_tank_level (any entity of the tank)
name: Tank                         # optional
rain_entity: sensor.rain_gauge     # optional, rain intensity or gauge
```

The easiest way: add the card from the picker (**Eco Water Tank**), choose the device, or press **Import from the integration** in the editor.

Without the integration (your own sensors):

```yaml
type: custom:eco-water-tank-card
name: Rain tank
level_entity: sensor.tank_distance    # %, height, distance or volume
level_empty: 150                      # reading when empty (height / distance sensors)
level_full: 20                        # reading when full
capacity: 5                           # in capacity_unit, or the unit of your volume sensor
capacity_unit: m³                     # optional: L, m³, gal, ft³
pump_limit: 0.2                       # optional: volume the pump can never draw
inlet_entity: sensor.water_in         # optional: total (L, m³, gal…) or flow (L/min, m³/h, gpm…)
outlet_entity: sensor.water_out       # optional: total or flow
pump_entity: switch.pump              # optional: switch, or a power sensor in W
rain_entity: sensor.rain_rate         # optional
weather_entity: weather.home          # optional
volume_unit: L                        # display unit: L, m³, gal, ft³ (default: your unit system)
```

---

## ⚙️ Configuration Reference

| Option | Description |
| :--- | :--- |
| `device` | Eco Water Tank device (integration). |
| `entity` | Any entity of that device (alternative to `device`). |
| `name` | Title of the card (default: name of the level sensor). |
| `level_entity` | Level sensor: `%`, a height or distance (m, cm, mm, in, ft…) or a volume (L, m³, gal, ft³…). |
| `level_empty`, `level_full` | Readings of the level sensor when the tank is empty and full (height / distance sensors, e.g. ultrasonic). |
| `tank_height` | Height of the tank, in the unit of the level sensor, instead of `level_empty` / `level_full` for a height sensor. |
| `volume_entity` | Volume sensor (L, m³, gal, ft³…). |
| `capacity`, `capacity_unit` | Capacity when the sensors give no volume. Unit: `capacity_unit`, else the unit of the volume sensor, else the display unit. |
| `pump_limit` | Volume the pump can never draw (same unit as `capacity`); shows the usable volume. |
| `inlet_entity` | Water in: a counter (total and today) or a flow meter (instant flow). |
| `outlet_entity` | Water out: a counter or a flow meter. |
| `pump_entity`, `pump_threshold` | Pump: a switch, or a power sensor above `pump_threshold` W (default 5). |
| `rain_entity` | Rain: intensity (mm/h, in/h), cumulative gauge (mm, cm, in) or a rain binary sensor. |
| `weather_entity` | A weather entity: rainy, pouring, lightning-rainy… |
| `sun_entity` | Sun entity (default `sun.sun`); without it the card uses the browser clock. |
| `volume_unit` | Display unit: `L`, `m³`, `gal`, `ft³` (default: your Home Assistant unit system). |
| `entities` | Map of keys to entities (`level`, `volume`, `capacity`, `usable_volume`, `water_in`, `water_in_estimated`, `water_out`, `water_out_today`, `water_in_today`, `water_in_estimated_today`, `rain_in`, `overflow`, `rain_efficiency`, `calibrate_volume`, `calibrate_percent`, `apply_correction`, `mark_full`, `mark_empty`, `share_tank`); overrides the integration's entities. |
| `image`, `image_night` | Your own pictures (e.g. `/local/eco-water-tank/day.webp`). |
| `photo` | `false` to use the drawn scene instead of the pictures. |
| `tank`, `pipe`, `debug` | Alignment of the water and the pipe on your own picture, in % of the picture. See [IMAGE-PROMPTS.md](IMAGE-PROMPTS.md). |

### How the data is read

- **Level**: a `%` sensor is used as is. A height or distance sensor needs `level_empty` and `level_full` (or `tank_height`). A volume sensor needs `capacity`.
- **Water in / out**: a counter gives the total and **today's total** (read from the recorder history since midnight). A flow meter shows the instant flow instead.
- **Pump**: animated while `pump_entity` is on (or above its threshold), while a flow meter reads above 0, or while the "water out" counter keeps rising.
- **Rain**: `rain_entity` and `weather_entity` can be used together. Without them the card uses the integration's rainwater estimate.
- **Units**: volumes are converted from L, mL, cL, dL, hL, m³, ft³, gal (US), imp gal, fl. oz., CCF; heights and rain from mm, cm, dm, m, in, ft, yd. The card displays litres or gallons following your unit system, or `volume_unit`.

### 🚰 Flow and rain intensity: learned maximum

The thickness and speed of the water in the pipe, and the amount of rain, show the current flow **relative to the highest flow ever seen on that source**:

- The first time, the card reads the recorder history (45 days) and takes the highest flow as the maximum.
- It then keeps learning: any flow above the maximum becomes the new maximum. The maximum is stored in your Home Assistant user data (shared between your devices, with a `localStorage` fallback).
- Without history yet, the reference is a "heavy" flow (10 mm/h of rain, or 10 % of the capacity per hour).

### 📸 Photo background

The card ships with a day and a night picture. Use your own with `image` / `image_night`, and align the water with `tank` and `pipe` (add `debug: true` to see the zones). Prompts and steps: [IMAGE-PROMPTS.md](IMAGE-PROMPTS.md).

---

# 🇫🇷 Documentation en Français

## ✨ Fonctionnalités

- 📸 **Coupe photo-réaliste** d'une cuve enterrée, images de jour et de nuit incluses (vous pouvez utiliser les vôtres).
- 💧 **Eau animée** : niveau avec vagues, bulles et reflets, filet du tuyau d'arrivée avec éclaboussures, flotteur et échelle de niveau. La surface ne bouge que lorsque de l'eau entre dans la cuve.
- 🌧️ **Météo en direct** : la pluie tombe sur la scène (trois profondeurs, éclairs en cas d'orage), le ciel suit le soleil (jour, crépuscule, nuit).
- 🚰 **Débit appris** : l'eau dans le tuyau d'arrivée et la quantité de pluie montrent le débit actuel par rapport au plus fort débit jamais vu, lu dans l'historique et appris en continu.
- 📊 **Toutes les données sur l'image** : niveau %, volume, capacité, volume utilisable, eau de pluie récupérée, rendement, eau entrée / sortie (du jour et total), bilan du jour, débordement.
- 📈 **Historique de remplissage** : le bouton rond à côté du rendement de collecte remplace la vue par un graphique du remplissage sur 24 h, 7 jours ou 30 jours (min, max, moyenne, actuel ; toucher ou survoler pour la valeur exacte).
- 🔌 **Avec ou sans l'intégration** : utilisez l'appareil Eco Water Tank, ou vos propres capteurs de niveau / volume / débit / pluie / pompe.
- 📏 **Nombreuses unités** : L, mL, m³, ft³, gal… pour les volumes ; mm, cm, m, in, ft… pour les hauteurs et la pluie ; L/min, m³/h, gpm, mm/h, in/h… pour les débits.
- 🛠️ **Calibration** (intégration) : volume ou remplissage réel, « cuve pleine / vide », partage de votre cuve.
- ⚙️ **Éditeur visuel** avec un bouton pour **importer la configuration depuis l'intégration**.

---

## 📦 Installation

### Méthode 1 : Via HACS (Recommandé)

1. Ouvrez **Home Assistant** et allez dans **HACS** > **Interface** (**Dashboard**).
2. Menu 3 points > **Dépôts personnalisés**, ajoutez `https://github.com/Rimfire03/eco-water-tank-card` avec la catégorie **Dashboard**.
3. Recherchez **Eco Water Tank Card** et cliquez sur **Télécharger**.
4. Rafraîchissez votre navigateur quand c'est demandé (Ctrl+F5).

---

### Méthode 2 : Installation manuelle

1. Téléchargez le fichier `dist/eco-water-tank-card.js` de ce dépôt (ou de la dernière release).
2. Placez `eco-water-tank-card.js` dans le dossier de Home Assistant : `config/www/eco-water-tank-card.js`.
3. Dans Home Assistant, allez dans **Paramètres** > **Tableaux de bord** > **Ressources** (menu 3 points en haut à droite).
4. Cliquez sur **Ajouter une ressource** :
   - **URL** : `/local/eco-water-tank-card.js`
   - **Type de ressource** : `Module JavaScript`
5. Enregistrez et rechargez votre tableau de bord.

---

## 🛠️ Exemple de Configuration YAML

Avec l'intégration **Eco Water Tank** :

```yaml
type: custom:eco-water-tank-card
device: <id de l'appareil>         # ou : entity: sensor.ma_cuve_niveau (n'importe quelle entité de la cuve)
name: Cuve                         # optionnel
rain_entity: sensor.pluviometre    # optionnel, intensité de pluie ou pluviomètre
```

Le plus simple : ajoutez la carte depuis le sélecteur (**Eco Water Tank**), choisissez l'appareil, ou appuyez sur **Importer depuis l'intégration** dans l'éditeur.

Sans l'intégration (vos propres capteurs) :

```yaml
type: custom:eco-water-tank-card
name: Cuve de pluie
level_entity: sensor.cuve_distance    # %, hauteur, distance ou volume
level_empty: 150                      # lecture cuve vide (capteurs de hauteur / distance)
level_full: 20                        # lecture cuve pleine
capacity: 5                           # dans capacity_unit, ou l'unité de votre capteur de volume
capacity_unit: m³                     # optionnel : L, m³, gal, ft³
pump_limit: 0.2                       # optionnel : volume que la pompe ne peut jamais pomper
inlet_entity: sensor.eau_entree       # optionnel : total (L, m³, gal…) ou débit (L/min, m³/h, gpm…)
outlet_entity: sensor.eau_sortie      # optionnel : total ou débit
pump_entity: switch.pompe             # optionnel : interrupteur, ou capteur de puissance en W
rain_entity: sensor.pluie             # optionnel
weather_entity: weather.maison        # optionnel
volume_unit: L                        # unité d'affichage : L, m³, gal, ft³ (défaut : votre système d'unités)
```

---

## ⚙️ Référence de configuration

Les options sont les mêmes qu'en anglais ci-dessus (`device`, `entity`, `name`, `level_entity`, `level_empty`, `level_full`, `tank_height`, `volume_entity`, `capacity`, `capacity_unit`, `pump_limit`, `inlet_entity`, `outlet_entity`, `pump_entity`, `pump_threshold`, `rain_entity`, `weather_entity`, `sun_entity`, `volume_unit`, `entities`, `image`, `image_night`, `photo`, `tank`, `pipe`, `debug`).

### Lecture des données

- **Niveau** : un capteur en `%` est utilisé tel quel. Un capteur de hauteur ou de distance demande `level_empty` et `level_full` (ou `tank_height`). Un capteur de volume demande `capacity`.
- **Eau entrée / sortie** : un compteur donne le total et le **total du jour** (lu dans l'historique depuis minuit). Un débitmètre affiche le débit instantané.
- **Pompe** : animée tant que `pump_entity` est allumé (ou au-dessus de son seuil), qu'un débitmètre lit plus de 0, ou que le compteur « eau sortie » continue de monter.
- **Pluie** : `rain_entity` et `weather_entity` peuvent s'utiliser ensemble. Sans eux, la carte utilise l'estimation d'eau de pluie de l'intégration.
- **Unités** : les volumes sont convertis depuis L, mL, cL, dL, hL, m³, ft³, gal (US), imp gal, fl. oz., CCF ; les hauteurs et la pluie depuis mm, cm, dm, m, in, ft, yd. La carte affiche des litres ou des gallons selon votre système d'unités, ou `volume_unit`.

### 🚰 Débit et intensité de pluie : maximum appris

L'épaisseur et la vitesse de l'eau dans le tuyau, ainsi que la quantité de pluie, montrent le débit actuel **par rapport au plus fort débit jamais vu sur cette source** :

- La première fois, la carte lit l'historique de l'enregistreur (45 jours) et prend le plus fort débit comme maximum.
- Elle continue ensuite d'apprendre : tout débit supérieur devient le nouveau maximum. Le maximum est conservé dans vos données utilisateur Home Assistant (partagé entre vos appareils, avec une copie `localStorage`).
- Sans historique, la référence est un débit « fort » (10 mm/h de pluie, ou 10 % de la capacité par heure).

### 📸 Image de fond

La carte est livrée avec une image de jour et une de nuit. Utilisez les vôtres avec `image` / `image_night`, et alignez l'eau avec `tank` et `pipe` (ajoutez `debug: true` pour voir les zones). Prompts et étapes : [IMAGE-PROMPTS.md](IMAGE-PROMPTS.md).

---

## 🧰 Development / Développement

Source in `src/`, built file in `dist/` (what HACS serves). The `build` script of `package.json` writes it and sets the version `x.yy` from the commit count (`-dev` suffix on the `dev` branch), like the other cards. Push a tag `vX.YY` to publish a release.  
*Sources dans `src/`, fichier construit dans `dist/` (ce que sert HACS). Le script `build` de `package.json` l'écrit et fixe la version `x.yy` d'après le nombre de commits (suffixe `-dev` sur la branche `dev`), comme les autres cartes. Poussez un tag `vX.YY` pour publier une release.*

---

## 📄 Licence

Projet open-source sous licence [MIT](LICENSE) - Développé pour la communauté Home Assistant par [Rimfire03](https://github.com/Rimfire03).

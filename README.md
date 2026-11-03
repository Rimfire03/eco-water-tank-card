# Eco Water Tank Card

Lovelace card for the [Eco Water Tank](https://github.com/Rimfire03/eco-water-tank) integration. No dependencies.

- Photo-realistic cross-section (day and night pictures bundled): buried concrete tank, downspout, pump. Animated water, inflow pipe, float, rain and all the data (level, volume, in/out, rain, overflow, usable volume) sit on the picture
- Rain falls on the scene when it rains; more drops and a thicker, faster flow in the pipe as intensity grows
- Day, dusk and night sky (from `sun.sun`, else the clock)
- Level %, volume, learned capacity, usable volume
- Water in / out today and total, net balance of the day (≈ marks estimated values)
- Rain section: collected, overflow, learned efficiency (only if rain gauge configured)
- Collapsible calibration: real volume / fill, apply, tank full / empty, share
- Only shows what your tank has. Labels, states and weather terms come from Home Assistant (your language); only a few card-specific texts are translated (fr, en)

## Install

HACS → Custom repositories → add this repo, type **Dashboard** → install. Reload the browser.

Manual: copy `dist/eco-water-tank-card.js` to `config/www/` and add it as a dashboard resource (`/local/eco-water-tank-card.js`, JavaScript module).

## Use

Add the card from the picker (**Eco Water Tank**) and choose the device, or in YAML:

```yaml
type: custom:eco-water-tank-card
device: <device id>   # or: entity: sensor.cuve_level (any entity of the tank)
name: Cuve            # optional
rain_entity: sensor.pluviometre   # optional, see below
sun_entity: sun.sun   # optional
```

Entities are found through the device, whatever their names. To override them:

```yaml
type: custom:eco-water-tank-card
entities:
  level: sensor.cuve_level
  volume: sensor.cuve_volume
  # also: capacity, usable_volume, water_in, water_in_estimated, water_out,
  # water_out_today, water_in_today, water_in_estimated_today, rain_in, overflow,
  # rain_efficiency, calibrate_volume, calibrate_percent, apply_correction,
  # mark_full, mark_empty, share_tank
```

## Photo background

The card ships with a day and a night picture (`src/images/`, bundled into `dist/` at build time). Use your own with `image` / `image_night`, or set `photo: false` for the drawn scene. Prompts, alignment (`tank`, `pipe`, `debug`): see [IMAGE-PROMPTS.md](IMAGE-PROMPTS.md).

## Rain and night

- Rain: set `rain_entity` to your rain gauge (a mm/h sensor, or a cumulative mm counter; intensity comes from how fast it rises, 10 mm/h = heavy). Without it, the card uses the integration's "Rainwater collected" sensor. It stops raining 12 min after the last increase.
- Day/dusk/night: from the sun elevation of `sun.sun` (or `sun_entity`); without a sun entity the card uses the browser clock.

## Development

Source in `src/`, built file in `dist/` (what HACS serves). The `build` script of `package.json` writes it and sets the version `x.yy` from the commit count (`-dev` suffix on the `dev` branch), like the other cards. Push a tag `vX.YY` to publish a release.

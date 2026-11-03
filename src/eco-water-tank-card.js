/* Eco Water Tank card — companion for the eco_water_tank integration. No dependencies. */

const CARD_VERSION = "0.08";
console.info(
  `%c ECO-WATER-TANK-CARD %c v${CARD_VERSION} `,
  "color: white; background: #2f8fe0; font-weight: 700; border-radius: 3px 0 0 3px;",
  "color: #333; background: #e0e0e0; font-weight: 700; border-radius: 0 3px 3px 0;"
);

// Only texts that exist nowhere in Home Assistant or the integration. Everything else
// (entity names, states, weather conditions) comes from HA in the user's language.
const T = {
  en: { net: "Net today", calib: "Calibration", low: "Low", ok: "OK", high: "Full",
    capacity: "Capacity", usable: "Usable volume", in_today: "In today", out_today: "Out today", title: "Water tank",
    missing: "Select an Eco Water Tank device, or set level_entity / volume_entity.",
    hint: "Type the real volume or fill, then Apply. Or mark the tank full/empty right now." },
  fr: { net: "Bilan du jour", calib: "Calibration", low: "Bas", ok: "OK", high: "Plein",
    capacity: "Capacité", usable: "Volume utilisable", in_today: "Entrée du jour", out_today: "Sortie du jour", title: "Cuve d'eau",
    missing: "Choisis un appareil Eco Water Tank, ou renseigne level_entity / volume_entity.",
    hint: "Saisis le volume ou le remplissage réel, puis Appliquer. Ou marque la cuve pleine/vide maintenant." },
};

const DOMAIN = "eco_water_tank";

// Units: everything is read in litres, mm, % (rates per hour) and shown in the user's unit system.
const VOLUME = { "L": 1, "l": 1, "mL": 0.001, "ml": 0.001, "cL": 0.01, "dL": 0.1, "hL": 100, "m³": 1000, "m3": 1000, "ft³": 28.316846592, "ft3": 28.316846592,
  "gal": 3.785411784, "gallon": 3.785411784, "gallons": 3.785411784, "US gal": 3.785411784, "imp gal": 4.54609, "gal (UK)": 4.54609, "fl. oz.": 0.0295735295625,
  "CCF": 2831.6846592 };
const LENGTH = { "mm": 1, "cm": 10, "dm": 100, "m": 1000, "km": 1e6, "in": 25.4, "ft": 304.8, "yd": 914.4, "mi": 1609344 };
const TIME_H = { s: 1 / 3600, sec: 1 / 3600, min: 1 / 60, h: 1, hr: 1, d: 24, day: 24 };
const DISPLAY = { "L": { f: 1, d: 0 }, "m³": { f: 1000, d: 2 }, "gal": { f: VOLUME.gal, d: 0 }, "ft³": { f: VOLUME["ft³"], d: 1 } };
const WEATHER_RAIN = { rainy: 0.35, pouring: 0.9, "lightning-rainy": 0.85, "snowy-rainy": 0.3, hail: 0.6, lightning: 0.4 };

/** kind: pct | vol (f = L) | len (f = mm) | vrate (f = L/h) | lrate (f = mm/h) | other */
function parseUnit(u) {
  u = String(u ?? "").trim();
  if (u === "%") return { kind: "pct", f: 1 };
  if (u.toLowerCase() === "gpm") return { kind: "vrate", f: VOLUME.gal * 60 };
  if (u in VOLUME) return { kind: "vol", f: VOLUME[u] };
  if (u in LENGTH) return { kind: "len", f: LENGTH[u] };
  const m = u.match(/^(.+?)\s*\/\s*(s|sec|min|h|hr|d|day)$/);
  if (m) {
    if (m[1] in VOLUME) return { kind: "vrate", f: VOLUME[m[1]] / TIME_H[m[2]] };
    if (m[1] in LENGTH) return { kind: "lrate", f: LENGTH[m[1]] / TIME_H[m[2]] };
  }
  return { kind: "other", f: 1 };
}
const BUNDLED_IMAGES = {}; // @@IMAGES@@
const DROPS = 60;
const PUMP_MS = 90000, RAIN_MIN = 12;
const CHIPS = [
  // key, entity keys (first one present wins), icon, placement class
  ["rain_in", ["rain_in"], "mdi:weather-pouring", "p-a"],
  ["rain_efficiency", ["rain_efficiency"], "mdi:percent-outline", "p-b"],
  ["in_today", ["water_in_today", "water_in_estimated_today"], "mdi:water-plus", "s-l1"],
  ["tot_in", ["water_in", "water_in_estimated"], "mdi:arrow-down-bold-circle", "s-l2"],
  ["net", null, "mdi:swap-vertical-bold", "s-l3"],
  ["out_today", ["water_out_today"], "mdi:water-minus", "s-r1"],
  ["tot_out", ["water_out"], "mdi:arrow-up-bold-circle", "s-r2"],
  ["overflow", ["overflow"], "mdi:water-alert", "s-r3"],
];

const STYLE = `
:host { display:block; }
ha-card { overflow:hidden; padding:0 0 12px; --tank:#2f8fe0; --tank2:#6cc3ff; --tankd:#0f4a85; }
ha-card.low { --tank:#e0482f; --tank2:#ff8a73; --tankd:#7d1e12; }
ha-card.mid { --tank:#e09a2f; --tank2:#ffd073; --tankd:#7a4a0c; }
.pad { padding:0 16px; }
.head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:14px 16px 10px; }
.title { font-size:1.15rem; font-weight:600; color:var(--primary-text-color); }
.chip { font-size:.75rem; font-weight:600; padding:3px 10px; border-radius:999px;
  background:color-mix(in srgb,var(--tank) 18%,transparent); color:var(--tank); }

/* ---- scene (sizes in cqw so overlays scale with the picture) ---- */
.scene { position:relative; container-type:inline-size; aspect-ratio:400/320; overflow:hidden;
  --sky1:#4a9fe6; --sky2:#cdeaff; --sil:#3f7a45; --grass:#5aa64f; --grass2:#43883e; --dim:1; --glow:#fff3b0; --soil:1; }
.scene.dusk { --sky1:#5d4f9c; --sky2:#f6ac66; --sil:#2c3550; --grass:#3d6a3a; --grass2:#2f5530; --dim:.78; --glow:#ffb36b; --soil:.85; }
.scene.night { --sky1:#050a22; --sky2:#1b2860; --sil:#0e1626; --grass:#1d3a24; --grass2:#142a1a; --dim:.48; --glow:#9db4ff; --soil:.7; }
.scene.day.rainy { --sky1:#5f6f79; --sky2:#a3b0ba; --sil:#35603a; --grass:#4c9046; --grass2:#3a7636; --dim:.85; --soil:.92; }
.scene.dusk.rainy { --sky1:#3a3349; --sky2:#7d717a; --sil:#252d3e; --dim:.62; }
.scene.night.rainy { --sky1:#03060e; --sky2:#10172c; --dim:.4; }
.scene svg.art { position:absolute; inset:0; width:100%; height:100%; }
.sky1 { stop-color:var(--sky1); } .sky2 { stop-color:var(--sky2); }
.dim { filter:brightness(var(--dim)); } .sdim { filter:brightness(var(--soil)); }
.sil { fill:var(--sil); } .grass { fill:var(--grass); } .grass2 { fill:var(--grass2); }
.sun, .moon, .stars, .glow { transition:opacity 1.5s; opacity:0; }
.day .sun, .dusk .sun, .day .glow, .dusk .glow { opacity:1; } .rainy .sun, .rainy .glow { opacity:.18; }
.night .moon, .night .stars, .night .glow { opacity:1; } .night.rainy .moon, .night.rainy .glow { opacity:.3; } .night.rainy .stars { opacity:.1; }
.rays { transform-origin:352px 66px; animation:spin 50s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.star { animation:twinkle 3s ease-in-out infinite; } .star:nth-child(2n) { animation-delay:1s; } .star:nth-child(3n) { animation-delay:2s; }
@keyframes twinkle { 50% { opacity:.2; } }
.cloud { opacity:.92; transition:opacity 1.5s; animation:cloud 70s linear infinite; }
.cloud ellipse.m { fill:url(#cloudg); } .cloud ellipse.s { fill:url(#cloudsh); }
.cloud.c2 { animation-duration:100s; animation-delay:-40s; opacity:.7; } .cloud.c3 { animation-duration:85s; animation-delay:-65s; opacity:.8; }
.night .cloud { opacity:.55; } .rainy .cloud, .rainy .cloud.c2, .rainy .cloud.c3 { opacity:1; }
.scene { --cloud:#fff; --cloud2:#b5c6d8; --mtn:#8aa7bf; }
.scene.dusk { --cloud:#ffd9b8; --cloud2:#c07b6c; --mtn:#75688f; }
.scene.night { --cloud:#6d7aa8; --cloud2:#2f3a66; --mtn:#162038; }
.scene.day.rainy { --cloud:#7b8691; --cloud2:#4d5762; --mtn:#7f93a1; }
.scene.dusk.rainy { --cloud:#6b6470; --cloud2:#3d3a48; --mtn:#554f68; }
.scene.night.rainy { --cloud:#2c3349; --cloud2:#12172a; --mtn:#0e1424; }
.photo-d { filter:var(--pf,none); transition:filter 2s; } .photo-n { opacity:0; transition:opacity 2s, filter 2s; filter:var(--pn,none); } .night .photo-n { opacity:1; }
.scene { --pf:none; --pn:none; } .scene.dusk { --pf:brightness(.85) sepia(.3) saturate(1.2); } .scene.night { --pf:brightness(.4) saturate(.65) hue-rotate(8deg); }
.scene.day.rainy { --pf:brightness(.82) saturate(.7); } .scene.dusk.rainy { --pf:brightness(.68) sepia(.2) saturate(.8); } .scene.night.rainy { --pf:brightness(.32) saturate(.55); --pn:brightness(.75) saturate(.8); }
.tint-rain { opacity:0; transition:opacity 1.5s; } .rainy .tint-rain { opacity:.4; }
.mtn { fill:var(--mtn); } .grass3 { fill:var(--grass3); }
.night .wg { filter:brightness(.62) saturate(.9); } .dusk .wg { filter:brightness(.88); } .wg { transition:filter 2s; }
.photo .utag { font-size:2.7cqw; padding:.9cqw 2.4cqw; } .photo .p-wx { left:2%; top:2%; width:28%; } .photo .p-a { left:31%; top:2%; width:27%; } .photo .p-b { left:59%; top:2%; width:20%; }
.photo .s-l1, .photo .s-l2, .photo .s-l3 { left:2%; width:25%; } .photo .s-l1 { top:61%; } .photo .s-l2 { top:73%; } .photo .s-l3 { top:85%; }
.photo .s-r1, .photo .s-r2, .photo .s-r3 { left:80%; width:19%; } .photo .s-r1 { top:62%; } .photo .s-r2 { top:73%; } .photo .s-r3 { top:84%; }

.scene { --grass3:#7cc266; } .scene.dusk { --grass3:#50884a; } .scene.night { --grass3:#27492f; }
.beam { opacity:0; transition:opacity 2s; mix-blend-mode:screen; } .day .beam { opacity:.55; } .dusk .beam { opacity:.3; } .day.rainy .beam { opacity:.16; } .dusk.rainy .beam, .night .beam { opacity:0; }
.dust { fill:#fff; opacity:.5; animation:mote 9s ease-in-out infinite alternate; }
.cloud.c4 { animation-duration:120s; animation-delay:-95s; opacity:.75; }
.gr { opacity:0; transition:opacity 2s; } .day:not(.rainy) .gr, .dusk:not(.rainy) .gr { opacity:1; animation:grp 8s ease-in-out infinite alternate; }
@keyframes grp { from { opacity:.5; } to { opacity:1; } }
.mist { opacity:0; transition:opacity 1.5s; } .rainy .mist { opacity:1; }
@keyframes cloud { from { transform:translateX(-120px); } to { transform:translateX(440px); } }
.bird { display:none; animation:fly 24s linear infinite; } .day:not(.rainy) .bird { display:block; } .bird.b2 { animation-duration:31s; animation-delay:-12s; }
.bird path { animation:flap .5s ease-in-out infinite alternate; transform-box:fill-box; transform-origin:center; }
@keyframes fly { from { transform:translate(-30px,0); } to { transform:translate(430px,-14px); } }
@keyframes flap { to { transform:scaleY(.35); } }
.fly { display:none; } .night:not(.rainy) .fly { display:block; }
.fly circle { fill:#ffee7a; filter:drop-shadow(0 0 3px #ffe45c); opacity:0; animation:blink 3s ease-in-out infinite; }
.fly circle:nth-child(2n) { animation-delay:1.2s; } .fly circle:nth-child(3n) { animation-delay:2.1s; }
@keyframes blink { 0%,100% { opacity:0; transform:translate(0,0); } 50% { opacity:1; transform:translate(6px,-8px); } }
.win { fill:#9fd2f7; } .night .win, .dusk .win { fill:#ffd76e; filter:drop-shadow(0 0 5px #ffd76e); }
.sway { transform-box:fill-box; transform-origin:50% 100%; animation:sway 5s ease-in-out infinite alternate; }
.rainy .sway { animation-duration:1.6s; }
@keyframes sway { from { transform:rotate(-2deg); } to { transform:rotate(2deg); } }
.drops, .gsplash, .bolt, .flash { opacity:0; transition:opacity 1s; }
.rainy .drops, .rainy .gsplash { opacity:1; }
.drop { stroke:#d6ebff; stroke-linecap:round; opacity:0; animation:fall var(--s,.8s) linear var(--d,0s) infinite; }
.night .drop { stroke:#8fb2e8; }
@keyframes fall { 0% { transform:translate(0,-12px); } 100% { transform:translate(-14px,130px); } }
.gsplash ellipse { fill:none; stroke:#e6f3ff; stroke-width:.9; opacity:0; transform-box:fill-box; transform-origin:center; animation:splash 1s ease-out var(--d) infinite; }
@keyframes splash { 0% { opacity:.9; transform:scale(.2); } 100% { opacity:0; transform:scale(1.6); } }
.storm .flash { animation:flash 7s linear infinite; } .storm .bolt { animation:flash 7s linear infinite; }
@keyframes flash { 0%,88%,92%,100% { opacity:0; } 89%,91% { opacity:.5; } 90% { opacity:.12; } }
.pbody { fill:none; stroke:#7a838c; stroke-linecap:round; stroke-linejoin:round; }
.pflow { fill:none; stroke:var(--tank2); stroke-linecap:round; stroke-linejoin:round; opacity:0;
  transition:opacity 1s, stroke-width .8s; }
.pdark { fill:none; stroke:var(--tankd); stroke-linecap:round; stroke-linejoin:round; opacity:0; transition:opacity 1s, stroke-width .8s; }
.rainy .dark-in, .pumping .dark-out { opacity:.95; }
.pshine { fill:none; stroke:#fff; stroke-width:1; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:2 7 4 15 1 9; opacity:0;
  transition:opacity 1s; animation:flow var(--fs,1s) linear infinite; }
.rainy .flow-in, .rainy .shine-in, .pumping .flow-out, .pumping .shine-out { opacity:1; }
.rainy .shine-in, .pumping .shine-out { opacity:.75; }
@keyframes flow { to { stroke-dashoffset:-38; } }
.stream { stroke:var(--tank2); stroke-linecap:round; opacity:0; transition:opacity 1s, stroke-width .8s; }
.stream-shine { stroke:#fff; stroke-width:1; stroke-linecap:round; stroke-dasharray:3 9; opacity:0; animation:streamfall .35s linear infinite; }
.rainy .stream { opacity:.95; } .rainy .stream-shine { opacity:.8; } @keyframes streamfall { to { stroke-dashoffset:-12; } }
.isplash ellipse { fill:none; stroke:#fff; stroke-width:1; opacity:0; transform-box:fill-box; transform-origin:center; animation:splash 1.1s ease-out var(--d) infinite; }
.isplash .foam { fill:#fff; stroke:none; animation:foam .5s ease-in-out infinite alternate; }
@keyframes foam { to { transform:scale(1.3,1.6); opacity:.45; } }
.isplash .sd { fill:#fff; opacity:0; animation:sdrop .9s ease-out var(--d) infinite; }
@keyframes sdrop { 0% { opacity:0; transform:translate(0,0); } 12% { opacity:.95; } 50% { transform:translate(calc(var(--dx)*.7),-9px); } 100% { opacity:0; transform:translate(var(--dx),1px); } }
.rainy .isplash ellipse { opacity:1; } .rainy .isplash .foam { opacity:.7; }
.spill { stroke:var(--tank2); stroke-width:2.6; stroke-linecap:round; opacity:0; }
.overflowing .spill { opacity:1; }
.tap { fill:var(--tank2); opacity:0; animation:drip 1.1s ease-in infinite; } .pumping .tap { opacity:1; }
@keyframes drip { 0% { transform:translateY(0); opacity:0; } 15% { opacity:1; } 100% { transform:translateY(10px); opacity:0; } }
.pump-led { fill:#3ee06a; opacity:0; } .pumping .pump-led { opacity:1; animation:blink2 1s ease-in-out infinite; }
@keyframes blink2 { 50% { opacity:.35; } }
.lvl { transition:transform 1.2s cubic-bezier(.3,.7,.2,1); }
.wave { animation:drift 6s linear infinite; } .wave.b { animation-duration:11s; animation-direction:reverse; opacity:.5; } .wave.m { animation-duration:8s; animation-direction:reverse; }
.caus { opacity:.16; animation:caus 7s linear infinite; } .caus.c2 { opacity:.12; animation-duration:11s; animation-direction:reverse; }
@keyframes caus { to { transform:translate(40px,6px); } }
.mote { fill:#fff; opacity:.35; animation:mote 14s ease-in-out infinite alternate; }
@keyframes mote { from { transform:translate(0,0); } to { transform:translate(14px,-12px); } }
@keyframes drift { to { transform:translateX(-60px); } }
.bub { fill:none; stroke:#fff; stroke-width:.6; opacity:0; animation:bub 4s ease-in infinite; } .bub:nth-child(2n) { animation-delay:1.3s; } .bub:nth-child(3n) { animation-delay:2.4s; }
.pumping .bub { animation-duration:1.6s; }
@keyframes bub { 0% { opacity:0; transform:translate(0,0); } 20% { opacity:.75; } 50% { transform:translate(2px,-26px); } 100% { opacity:0; transform:translate(-2px,-55px); } }
.cray { fill:#fff; opacity:.07; animation:ray 6s ease-in-out infinite alternate; } .cray:nth-child(2) { animation-delay:2s; } .cray:nth-child(3) { animation-delay:4s; }
@keyframes ray { to { opacity:.16; transform:translateX(10px); } }
@media (prefers-reduced-motion:reduce) { .scene * { animation:none!important; } .lvl { transition:none; } }

/* ---- overlays ---- */
.c { position:absolute; display:flex; align-items:center; gap:1.2cqw; padding:.9cqw 1.8cqw .9cqw 1.3cqw; border-radius:2.4cqw;
  background:rgba(8,16,30,.58); border:1px solid rgba(255,255,255,.16); backdrop-filter:blur(3px);
  color:#fff; line-height:1.15; min-width:0; box-sizing:border-box; }
.c ha-icon { --mdc-icon-size:4cqw; width:4cqw; height:4cqw; flex:none; color:var(--tank2); }
.c .t { display:flex; flex-direction:column; min-width:0; }
.c .l { font-size:2cqw; opacity:.78; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.c .l:empty { display:none; }
.c .v { font-size:3cqw; font-weight:700; white-space:nowrap; }
.c .v i { font-style:normal; font-weight:400; opacity:.7; margin-right:.5cqw; }
.c .v u { text-decoration:none; font-size:2.1cqw; font-weight:500; opacity:.8; margin-left:.5cqw; }
.c .pos { color:#7ee58f; } .c .neg { color:#ff9088; }
.p-wx { left:2%; top:3%; width:30%; } .p-a { left:34%; top:3%; width:30%; } .p-b { left:66%; top:3%; width:32%; }
.s-l1, .s-l2, .s-l3 { left:2%; width:25%; } .s-l1 { top:53%; } .s-l2 { top:66%; } .s-l3 { top:79%; }
.s-r1, .s-r2, .s-r3 { left:76.5%; width:22%; } .s-r1 { top:39%; } .s-r2 { top:52%; } .s-r3 { top:65%; }
.tankinfo { position:absolute; left:50.5%; top:70%; transform:translate(-50%,-50%); text-align:center; color:#fff;
  text-shadow:0 1px 5px rgba(0,0,0,.7),0 0 2px rgba(0,0,0,.6); pointer-events:none; width:24%; }
.tankinfo .pc { font-size:9cqw; font-weight:800; line-height:1; } .tankinfo .pc small { font-size:4.2cqw; font-weight:700; margin-left:.4cqw; }
.tankinfo .vl { font-size:3.8cqw; font-weight:700; margin-top:.8cqw; } .tankinfo .cp { font-size:2.3cqw; opacity:.92; margin-top:.4cqw; white-space:nowrap; margin-inline:-6cqw; }
.utag { position:absolute; left:30%; transform:translate(0,-50%); font-size:2.1cqw; padding:.6cqw 1.5cqw; border-radius:2cqw;
  background:rgba(8,16,30,.6); color:#fff; border:1px solid rgba(255,255,255,.18); white-space:nowrap; display:none; }
.utag b { margin-left:.8cqw; }
.ftag { position:absolute; left:38%; transform:translate(-50%,0); font-size:2.2cqw; padding:.5cqw 1.5cqw; border-radius:2cqw; font-weight:700;
  background:rgba(8,16,30,.6); color:#fff; border:1px solid rgba(255,255,255,.18); white-space:nowrap; display:none; }

details { margin:14px 16px 0; border-top:1px solid var(--divider-color); padding-top:10px; }
summary { cursor:pointer; font-size:.9rem; font-weight:600; color:var(--primary-text-color); list-style:none; }
summary::before { content:"▸ "; } details[open] summary::before { content:"▾ "; }
.hint { font-size:.78rem; color:var(--secondary-text-color); margin:8px 0; }
.row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-top:8px; }
label.f { flex:1 1 130px; font-size:.75rem; color:var(--secondary-text-color); }
label.f input { width:100%; box-sizing:border-box; margin-top:3px; padding:8px; font:inherit; font-size:.95rem;
  color:var(--primary-text-color); background:var(--card-background-color); border:1px solid var(--divider-color); border-radius:8px; }
button { cursor:pointer; font:inherit; font-size:.85rem; font-weight:600; padding:8px 14px; border-radius:8px;
  border:1px solid var(--divider-color); background:transparent; color:var(--primary-text-color); }
button.main { background:var(--primary-color); border-color:var(--primary-color); color:var(--text-primary-color,#fff); }
button:hover { filter:brightness(1.1); } button:active { transform:scale(.97); }
.warn { padding:16px; color:var(--secondary-text-color); }
`;

// Buried tank cavity: x 114..290, y 150..290. Water surface moves from y=290 (empty) to y=150 (full).
const TOP = 150, H = 140, GROUND = 112;

const VH = 300; // photo scene height in viewBox units (4:3)
const PHOTO_DEFAULT = { tank: [31.3, 55.8, 44.2, 30.7], pipe: [[20.4, 7], [15.6, 12.5], [15.6, 57.7], [32.9, 57.7]] };
const esc = (u) => String(u).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const cut = (s, from, to) => { const a = s.indexOf(from), b = s.indexOf(to); return a < 0 || b < 0 || b < a ? s : s.slice(0, a) + s.slice(b); };

/** Keep the dynamic layers (rain, water, pipe flow, float) and drop the drawn scenery for a photo background. */
function toPhoto(html, o) {
  const [bx, by, bw, bh] = o.tank.map((v, i) => v * (i % 2 ? VH / 100 : 4));
  const cable = html.match(/  <line data-cable[^\n]*\n/)[0];
  const d = "M" + o.pipe.map(([x, y]) => `${(x * 4).toFixed(1)} ${(y * VH / 100).toFixed(1)}`).join("L");
  html = cut(html, "  <!-- sky -->", "  <!-- inlet pipe");
  html = html.replace(/  <path class="pbody" d="M41 46V150H116"[^\n]*\n/, "").split("M41 46V150H116").join(d);
  html = cut(html, "  <!-- manhole + shaft -->", "  <!-- water -->");
  html = html.replace(/  <g clip-path="url\(#cavity\)" class="beam">[\s\S]*?<\/g>\n/, "")
    .replace(/  <rect x="114" y="150" width="176" height="140" fill="url\(#edge\)"\/>\n/, "")
    .replace(/  <path class="pbody" d="M114 150H130"[^\n]*\n/, "")
    .replace("  <!-- water -->", `  <g class="wg" transform="translate(${bx} ${by}) scale(${bw / 176} ${bh / 140}) translate(-114 -150)">\n${cable}  <!-- water -->`)
    .replace("  <!-- overflow stub -->", "  </g>\n  <!-- overflow stub -->");
  html = cut(html, "  <!-- overflow stub -->", "  <!-- rain -->");
  html = html.replace(/[^\n]*url\(#vign\)[^\n]*\n/, "").replace(/[^\n]*filter="url\(#grain\)" opacity="\.12"[^\n]*\n/, "");
  const stream = html.match(/  <path class="stream" data-stream[\s\S]*?<\/g>\n(?=  <!-- float)/)[0];
  html = html.replace(stream, "").replace("  <!-- rain -->", `${stream.replace(/cx="141"/g, 'cx="0"')}  <!-- rain -->`);
  const layers = `
  <image class="photo-d" href="${esc(o.image)}" width="400" height="${VH}" preserveAspectRatio="xMidYMid slice"/>
  ${o.night ? `<image class="photo-n" href="${esc(o.night)}" width="400" height="${VH}" preserveAspectRatio="xMidYMid slice"/>` : ""}
  <rect class="tint-rain" width="400" height="${GROUND}" fill="url(#raindark)"/>
  ${o.debug ? `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="none" stroke="#f0f" stroke-width="1"/><path d="${d}" fill="none" stroke="#0ff" stroke-width="1"/>` : ""}`;
  return html.replace("</defs>", "</defs>" + layers)
    .replace('viewBox="0 0 400 320"', `viewBox="0 0 400 ${VH}"`)
    .replace('<div class="scene day" data-scene>', `<div class="scene day photo" data-scene style="aspect-ratio:400/${VH}">`);
}

function scene(opt = {}) {
  const GROUND = opt.photo ? 124 : 112; // ground line (y in viewBox units)
  const rnd = (i, m) => ((i * 9301 + 49297) % 233280) / 233280 * m;
  const drops = Array.from({ length: DROPS }, (_, i) => {
    const x = Math.round(rnd(i + 3, 420)) - 10;
    const d = -(rnd(i + 11, 1.4)).toFixed(2);
    // three depth tiers: far = thin, short and slow; near = thick, long and fast
    const [w, len, sp, o] = [[0.6, 6, 0.95, 0.45], [1, 9, 0.7, 0.7], [1.5, 13, 0.5, 0.95]][i % 3];
    const s = (sp + rnd(i + 5, 0.2)).toFixed(2);
    return `<line class="drop" data-drop="${i}" x1="${x}" y1="0" x2="${(x - len * 0.27).toFixed(1)}" y2="${len}" style="--d:${d}s;--s:${s}s;stroke-width:${w};stroke-opacity:${o}"/>`;
  }).join("");
  const gsplash = Array.from({ length: 18 }, (_, i) =>
    `<ellipse cx="${Math.round(rnd(i + 40, 390)) + 5}" cy="${GROUND - 1 + (i % 3)}" rx="4" ry="1.2" style="--d:${rnd(i + 7, 1).toFixed(2)}s"/>`).join("");
  const stars = Array.from({ length: 22 }, (_, i) =>
    `<circle class="star" cx="${Math.round(rnd(i + 90, 400))}" cy="${Math.round(rnd(i + 17, 90))}" r="${(0.8 + rnd(i, 0.8)).toFixed(1)}" fill="#fff"/>`).join("");
  const flies = Array.from({ length: 9 }, (_, i) =>
    `<circle cx="${Math.round(rnd(i + 200, 400))}" cy="${GROUND - 4 - Math.round(rnd(i + 300, 18))}" r="1.5" style="animation-delay:${(i * 0.6).toFixed(1)}s"/>`).join("");
  const blades = (seed, hmax, y) => {
    let d = `M0 ${y}`;
    for (let x = 0; x < 404; x += 4) d += `l2 -${(2 + rnd(x + seed, hmax)).toFixed(1)}l2 ${0}`.replace("l2 0", "l2 0") + "";
    // zig-zag back to the baseline
    d = `M0 ${y}`;
    for (let x = 0; x < 404; x += 4) d += `L${x + 2} ${(y - 2 - rnd(x + seed, hmax)).toFixed(1)}L${x + 4} ${y}`;
    return d + `V${y + 8}H0z`;
  };
  const pebbles = Array.from({ length: 90 }, (_, i) => {
    const x = rnd(i + 500, 400), y = GROUND + 8 + rnd(i + 700, 200), r = 0.8 + rnd(i + 900, 2.6);
    const c = ["#7b5a3e", "#4a3324", "#8c6b4d", "#33231a", "#6a4e37"][i % 5];
    return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${r.toFixed(1)}" ry="${(r * 0.7).toFixed(1)}" fill="${c}" opacity=".7"/>`;
  }).join("");
  const stones = Array.from({ length: 14 }, (_, i) => {
    const x = rnd(i + 1500, 400), y = GROUND + 14 + rnd(i + 1600, 190), r = 2.2 + rnd(i + 1700, 3.4);
    return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${r.toFixed(1)}" ry="${(r * 0.72).toFixed(1)}" fill="url(#stone)" stroke="#1d130d" stroke-opacity=".4" stroke-width=".5" transform="rotate(${(rnd(i + 1800, 60) - 30).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }).join("");
  const ticks = [25, 50, 75].map((p) => {
    const y = TOP + H * (1 - p / 100);
    return `<path d="M278 ${y}h12" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"/><text x="275" y="${y + 2.5}" text-anchor="end" font-size="7" fill="#fff" fill-opacity=".75">${p}</text>`;
  }).join("");
  const motes = Array.from({ length: 9 }, (_, i) =>
    `<circle class="mote" cx="${(122 + rnd(i + 60, 160)).toFixed(0)}" cy="${(14 + rnd(i + 80, 100)).toFixed(0)}" r="${(0.5 + rnd(i + 5, 0.7)).toFixed(1)}" style="animation-delay:-${(rnd(i + 9, 12)).toFixed(1)}s;animation-duration:${(10 + rnd(i + 3, 10)).toFixed(0)}s"/>`).join("");
  const bubs = [[150, 100, 1.4], [182, 80, 2.2], [226, 110, 1.1], [262, 90, 1.8], [204, 120, 1.6], [170, 118, 1], [246, 70, 1.3]].map(([x, y, r]) => `<circle class="bub" cx="${x}" cy="${y}" r="${r}" style="animation-duration:${(3 + r).toFixed(1)}s"/>`).join("");
  const trees = [[20, 14], [48, 20], [96, 12], [118, 18], [140, 10], [250, 16], [272, 11], [310, 19], [336, 12], [378, 15]]
    .map(([x, h]) => `<polygon points="${x - 6},${GROUND - 2} ${x},${GROUND - 2 - h} ${x + 6},${GROUND - 2}"/>`).join("");
  const html = `<div class="scene day" data-scene>
<svg class="art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop class="sky1" offset="0"/><stop class="sky2" offset="1"/></linearGradient>
    <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34241a"/><stop offset=".1" stop-color="#4b3626"/><stop offset=".3" stop-color="#6e4f36"/><stop offset=".62" stop-color="#58402e"/><stop offset="1" stop-color="#261a12"/></linearGradient>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--tank2)"/><stop offset=".3" stop-color="var(--tank)"/><stop offset="1" style="stop-color:var(--tankd)"/></linearGradient>
    <linearGradient id="shallow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".12" stop-color="#000" stop-opacity="0"/><stop offset=".88" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
    <linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
    <mask id="cfade" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="100"><rect width="400" height="100" fill="url(#cf)"/></mask>
    <pattern id="caus" width="40" height="24" patternUnits="userSpaceOnUse"><path d="M0 6q10 -7 20 0t20 0M0 18q10 -7 20 0t20 0" stroke="#fff" fill="none" stroke-width="1.3"/></pattern>
    <pattern id="caus2" width="34" height="20" patternUnits="userSpaceOnUse"><path d="M0 5q8.5 -6 17 0t17 0M0 15q8.5 -6 17 0t17 0" stroke="#fff" fill="none" stroke-width="1"/></pattern>
    <linearGradient id="wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e3d2b0"/><stop offset="1" stop-color="#c6b08a"/></linearGradient>
    <linearGradient id="conc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa0a5"/><stop offset=".5" stop-color="#868c91"/><stop offset="1" stop-color="#6f7479"/></linearGradient>
    <linearGradient id="cav" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a141c"/><stop offset="1" stop-color="#14232e"/></linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="var(--glow)" stop-opacity=".85"/><stop offset="1" stop-color="var(--glow)" stop-opacity="0"/></radialGradient>
    <mask id="cres"><rect width="400" height="320" fill="#fff"/><circle cx="359" cy="62" r="13" fill="#000"/></mask>
    <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2 0 0 0 -.8"/></filter>
    <filter id="mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".025 .05" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .06  0 0 0 0 .03  1.7 0 0 0 -.6"/></filter>
    <filter id="cmottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".03 .05" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .13  0 0 0 0 .14  0 0 0 0 .15  1.6 0 0 0 -.5"/></filter>
    <linearGradient id="raindark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101820" stop-opacity=".85"/><stop offset="1" stop-color="#101820" stop-opacity="0"/></linearGradient>
    <filter id="blur1" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation=".9"/></filter>
    <filter id="blur5" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
    <radialGradient id="bloom"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".4" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="beamg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity=".75"/><stop offset=".6" stop-color="#fff6c8" stop-opacity=".18"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="160%" height="160%"><feDropShadow dx="3" dy="4" stdDeviation="2.5" flood-color="#000" flood-opacity=".35"/></filter>
    <radialGradient id="cloudg"><stop offset="0" style="stop-color:var(--cloud)"/><stop offset=".55" style="stop-color:var(--cloud)" stop-opacity=".9"/><stop offset="1" style="stop-color:var(--cloud)" stop-opacity="0"/></radialGradient>
    <radialGradient id="cloudsh"><stop offset="0" style="stop-color:var(--cloud2)" stop-opacity=".85"/><stop offset="1" style="stop-color:var(--cloud2)" stop-opacity="0"/></radialGradient>
    <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky2)" stop-opacity="0"/><stop offset="1" style="stop-color:var(--sky2)" stop-opacity=".75"/></linearGradient>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".28"/></linearGradient>
    <radialGradient id="vign" cx=".5" cy=".5" r=".78"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>
    <radialGradient id="leaf" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#86cf72"/><stop offset=".55" stop-color="#3f8a3f"/><stop offset="1" stop-color="#1f5428"/></radialGradient>
    <radialGradient id="stone" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#a99a88"/><stop offset="1" stop-color="#4b4137"/></radialGradient>
    <linearGradient id="bark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5a3c"/><stop offset=".5" stop-color="#5a3f28"/><stop offset="1" stop-color="#3a2818"/></linearGradient>
    <linearGradient id="pumpg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe066"/><stop offset=".45" stop-color="#e3b21f"/><stop offset="1" stop-color="#9c6f0c"/></linearGradient>
    <linearGradient id="floatg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb347"/><stop offset="1" stop-color="#c8641a"/></linearGradient>
    <linearGradient id="eave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".4"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <pattern id="siding" width="10" height="8" patternUnits="userSpaceOnUse"><rect y="6.8" width="10" height="1.2" fill="#000" opacity=".18"/><rect width="10" height="1" fill="#fff" opacity=".28"/></pattern>
    <pattern id="shingle" width="8" height="6" patternUnits="userSpaceOnUse"><rect width="8" height="6" fill="#93432f"/><path d="M0 5.4q4 1.2 8 0" stroke="#000" stroke-opacity=".32" fill="none"/><path d="M4 0v5" stroke="#000" stroke-opacity=".14"/><path d="M0 .6h8" stroke="#fff" stroke-opacity=".1"/></pattern>
    <clipPath id="cavity"><rect x="114" y="${TOP}" width="176" height="${H}"/></clipPath>
    <clipPath id="air"><rect width="400" height="${GROUND + 2}"/></clipPath>
  </defs>
  <!-- sky -->
  <rect width="400" height="${GROUND + 4}" fill="url(#sky)"/>
  <circle class="glow" cx="352" cy="66" r="70" fill="url(#glow)"/>
  <g class="stars">${stars}</g>
  <g class="sun"><g class="rays" stroke="#ffe27a" stroke-width="2.4" stroke-linecap="round">
    <path d="M352 42v7M352 83v7M328 66h7M369 66h7M335 49l5 5M364 78l5 5M369 49l-5 5M340 78l-5 5"/></g>
    <circle cx="352" cy="66" r="14" fill="#ffd84a"/><circle cx="352" cy="66" r="34" fill="url(#bloom)"/></g>
  <g class="moon"><circle cx="352" cy="66" r="14" fill="#f6f1d6" mask="url(#cres)"/></g>
  <g class="gr" fill="#fff" opacity=".07"><polygon points="352,66 250,${GROUND} 285,${GROUND}"/><polygon points="352,66 300,${GROUND} 322,${GROUND}"/><polygon points="352,66 180,${GROUND} 230,${GROUND}"/><polygon points="352,66 120,${GROUND} 150,${GROUND}"/></g>
  <path class="mtn" filter="url(#blur1)" d="M0 ${GROUND}V84L34 66 62 80 100 54 136 78 172 60 214 86 258 58 300 82 338 62 372 80 400 68V${GROUND}z" opacity=".85"/>
  <path class="mtn" filter="url(#blur1)" d="M0 ${GROUND}V96L50 82 90 94 140 76 190 96 240 80 290 98 340 84 400 96V${GROUND}z" opacity=".95"/>
  <rect y="64" width="400" height="${GROUND - 60}" fill="url(#haze)"/>
  <g class="cloud"><ellipse class="s" cx="0" cy="52" rx="30" ry="9"/><ellipse class="m" cx="0" cy="48" rx="30" ry="9"/><ellipse class="m" cx="20" cy="41" rx="20" ry="12"/><ellipse class="m" cx="-19" cy="44" rx="15" ry="8"/></g>
  <g class="cloud c2"><ellipse class="s" cx="0" cy="83" rx="26" ry="8"/><ellipse class="m" cx="0" cy="80" rx="26" ry="8"/><ellipse class="m" cx="16" cy="74" rx="16" ry="9"/></g>
  <g class="cloud c4"><ellipse class="s" cx="0" cy="66" rx="24" ry="7"/><ellipse class="m" cx="0" cy="63" rx="24" ry="7"/><ellipse class="m" cx="-14" cy="60" rx="13" ry="7"/><ellipse class="m" cx="15" cy="58" rx="15" ry="8"/></g>
  <g class="cloud c3"><ellipse class="s" cx="0" cy="33" rx="32" ry="9"/><ellipse class="m" cx="0" cy="30" rx="32" ry="9"/><ellipse class="m" cx="22" cy="23" rx="19" ry="10"/><ellipse class="m" cx="-23" cy="26" rx="16" ry="8"/></g>
  <g class="bird"><path d="M0 0q4 -5 8 0q4 -5 8 0" stroke="#34404a" fill="none" stroke-width="1.4" transform="translate(0,56)"/></g>
  <g class="bird b2"><path d="M0 0q3 -4 6 0q3 -4 6 0" stroke="#34404a" fill="none" stroke-width="1.2" transform="translate(0,78)"/></g>
  <g class="dim">
    <g class="sil">${trees}
      <rect x="168" y="${GROUND - 20}" width="34" height="18"/><polygon points="164,${GROUND - 20} 185,${GROUND - 34} 206,${GROUND - 20}"/><rect x="194" y="${GROUND - 38}" width="5" height="10"/>
      <rect x="302" y="${GROUND - 14}" width="22" height="12"/><polygon points="299,${GROUND - 14} 313,${GROUND - 24} 327,${GROUND - 14}"/></g>
    <path class="grass2" d="${blades(7, 7, GROUND + 1)}"/>
  </g>
  <g class="dim">
    <ellipse cx="324" cy="${GROUND}" rx="26" ry="3.4" fill="#000" opacity=".28"/>
    <g class="sway"><path d="M318 ${GROUND} C319 90 317 80 316 66 L322 66 C322 82 323 94 325 ${GROUND}z" fill="url(#bark)"/>
      <path d="M319 82 L308 70M321 76 L332 64" stroke="#5a3f28" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="304" cy="58" r="14" fill="url(#leaf)"/><circle cx="334" cy="58" r="14" fill="url(#leaf)"/><circle cx="319" cy="46" r="17" fill="url(#leaf)"/>
      <circle cx="308" cy="68" r="12" fill="url(#leaf)"/><circle cx="330" cy="68" r="12" fill="url(#leaf)"/><circle cx="319" cy="60" r="14" fill="url(#leaf)"/>
      <g fill="#a9e08a" opacity=".35"><circle cx="312" cy="42" r="3"/><circle cx="326" cy="50" r="2.4"/><circle cx="300" cy="54" r="2.6"/><circle cx="338" cy="62" r="2.2"/></g></g>
    <ellipse cx="160" cy="${GROUND}" rx="15" ry="2.4" fill="#000" opacity=".25"/>
    <g class="sway"><ellipse cx="156" cy="104" rx="11" ry="8" fill="url(#leaf)"/><ellipse cx="168" cy="106" rx="9" ry="6.5" fill="url(#leaf)"/><circle cx="153" cy="101" r="1.5" fill="#ff7aa8"/><circle cx="165" cy="103" r="1.4" fill="#ffd24a"/><circle cx="160" cy="99" r="1.3" fill="#fff"/></g>
    <ellipse cx="238" cy="${GROUND}" rx="13" ry="2.2" fill="#000" opacity=".25"/>
    <g class="sway"><ellipse cx="236" cy="105" rx="10" ry="7.5" fill="url(#leaf)"/><ellipse cx="246" cy="107" rx="7" ry="5.5" fill="url(#leaf)"/></g>
  </g>
  <g class="fly">${flies}</g>
  <!-- soil -->
  <g class="sdim">
    <rect y="${GROUND}" width="400" height="${320 - GROUND}" fill="url(#soil)"/>
    <rect y="${GROUND}" width="400" height="${320 - GROUND}" filter="url(#mottle)" opacity=".7"/>
    ${pebbles}
    ${stones}
    <rect y="${GROUND}" width="400" height="${320 - GROUND}" filter="url(#grain)" opacity=".38"/>
    <rect y="${GROUND}" width="400" height="8" fill="#1d130d" opacity=".4"/>
    <g fill="none" stroke="#2b1d14" stroke-opacity=".55" stroke-width="1.2" stroke-linecap="round">
      <path d="M60 ${GROUND + 4}q6 18 -2 34q-6 12 2 26"/><path d="M82 ${GROUND + 4}q-8 14 0 28"/><path d="M330 ${GROUND + 4}q8 20 0 40q-8 16 2 30"/><path d="M352 ${GROUND + 4}q-6 12 2 24"/></g>
    <path d="M0 175q60 8 120 -2t160 6t120 -4" stroke="#241811" stroke-opacity=".35" stroke-width="2" fill="none"/>
    <path d="M0 250q80 -8 150 4t250 -6" stroke="#1d130d" stroke-opacity=".35" stroke-width="2" fill="none"/>
  </g>
  <rect y="${GROUND - 1}" width="400" height="5" class="grass"/>
  <g class="dim"><path class="grass" d="${blades(31, 9, GROUND + 3)}"/><path class="grass3" d="${blades(77, 11, GROUND + 4)}" opacity=".9"/></g>
  <!-- house (cut at the left edge) -->
  <g class="dim">
    <rect x="0" y="40" width="58" height="${GROUND - 40}" fill="url(#wall)" filter="url(#shadow)"/>
    <rect x="0" y="40" width="58" height="${GROUND - 40}" fill="url(#siding)"/>
    <rect x="0" y="40" width="58" height="14" fill="url(#eave)"/>
    <rect x="0" y="26" width="68" height="14" rx="1.5" fill="url(#shingle)"/><rect x="0" y="26" width="68" height="14" rx="1.5" fill="url(#eave)" opacity=".35" transform="scale(1,-1) translate(0,-66)"/>
    <rect x="0" y="40" width="50" height="3" fill="#e9e4d8"/><rect x="0" y="43" width="50" height="4.5" rx="2" fill="#7a838c"/><rect x="0" y="43" width="50" height="1.2" fill="#fff" opacity=".35"/>
    <rect x="5" y="86" width="34" height="4" fill="#e9e4d8"/><rect x="5" y="90" width="34" height="1.5" fill="#000" opacity=".25"/>
    <rect class="win" x="8" y="58" width="28" height="30" rx="2" stroke="#f2efe6" stroke-width="2.6"/>
    <clipPath id="wclip"><rect x="8" y="58" width="28" height="30"/></clipPath>
    <g clip-path="url(#wclip)"><polygon points="8,88 8,74 24,58 33,58" fill="#fff" opacity=".28"/><polygon points="20,88 36,70 36,80 28,88" fill="#fff" opacity=".12"/>
      <rect x="8" y="58" width="6" height="30" fill="#b8473a" opacity=".55"/><rect x="30" y="58" width="6" height="30" fill="#b8473a" opacity=".55"/></g>
    <path d="M22 58v30M8 73h28" stroke="#f2efe6" stroke-width="1.6"/>
    <rect x="38" y="44" width="7" height="${GROUND - 44}" fill="#8a949e"/><rect x="39.4" y="44" width="1.6" height="${GROUND - 44}" fill="#fff" opacity=".4"/><rect x="43.6" y="44" width="1.4" height="${GROUND - 44}" fill="#000" opacity=".25"/>
    <rect x="36" y="62" width="11" height="2.2" fill="#5d666e"/><rect x="36" y="90" width="11" height="2.2" fill="#5d666e"/><rect x="36" y="${GROUND - 8}" width="11" height="8" fill="#6c757d"/>
    <rect x="0" y="${GROUND - 5}" width="58" height="5" fill="#9a9a9a"/><rect x="0" y="${GROUND - 5}" width="58" height="1" fill="#fff" opacity=".3"/>
  </g>
  <!-- inlet pipe: downspout then underground into the tank -->
  <path class="pbody" d="M41 46V150H116" stroke-width="8"/>
  <path class="pdark dark-in" data-dark d="M41 46V150H116" stroke-width="5"/>
  <path class="pflow flow-in" data-flow d="M41 46V150H116" stroke-width="3"/>
  <path class="pshine shine-in" data-shine d="M41 46V150H116"/>
  <!-- manhole + shaft -->
  <rect x="180" y="${GROUND - 2}" width="44" height="5" rx="2" fill="#2e353b"/>
  <rect x="184" y="${GROUND + 3}" width="36" height="${TOP - GROUND - 3}" fill="#9aa0a5"/>
  <rect x="190" y="${GROUND + 3}" width="24" height="${TOP - GROUND - 3}" fill="url(#cav)"/>
  <g stroke="#cfd4d8" stroke-width="1.6"><path d="M192 ${GROUND + 8}h20M192 ${GROUND + 18}h20M192 ${GROUND + 28}h20"/></g>
  <!-- tank walls + cavity -->
  <rect x="97" y="133" width="210" height="174" rx="10" fill="#000" opacity=".6" filter="url(#blur5)"/>
  <rect x="104" y="140" width="196" height="160" rx="6" fill="url(#conc)"/>
  <rect x="104" y="140" width="196" height="160" rx="6" filter="url(#cmottle)" opacity=".8"/>
  <rect x="104" y="140" width="196" height="160" rx="6" filter="url(#grain)" opacity=".4"/>
  <g stroke="#000" stroke-opacity=".28" stroke-width=".9"><path d="M153 142v156M202 142v156M251 142v156"/></g>
  <g stroke="#fff" stroke-opacity=".12" stroke-width=".9"><path d="M154 142v156M203 142v156M252 142v156"/></g>
  <g fill="#3a3f43" opacity=".7">${[[128, 146], [177, 146], [226, 146], [275, 146], [128, 294], [177, 294], [226, 294], [275, 294]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3"/>`).join("")}</g>
  <path d="M106 141.5H298" stroke="#fff" stroke-opacity=".4" stroke-width="1"/><path d="M105.5 142V298" stroke="#fff" stroke-opacity=".22" stroke-width="1"/>
  <path d="M106 299H298" stroke="#000" stroke-opacity=".4" stroke-width="1.4"/><path d="M299 142V298" stroke="#000" stroke-opacity=".3" stroke-width="1.4"/>
  <ellipse cx="116" cy="170" rx="5" ry="16" fill="#8a4a1f" opacity=".22"/>
  <g fill="#000" opacity=".13">${Array.from({ length: 50 }, (_, i) => `<circle cx="${(106 + rnd(i + 1200, 192)).toFixed(0)}" cy="${(142 + rnd(i + 1300, 156)).toFixed(0)}" r="${(0.6 + rnd(i, 1)).toFixed(1)}"/>`).join("")}</g>
  <rect x="114" y="${TOP}" width="176" height="${H}" fill="url(#cav)"/>
  <rect x="114" y="${TOP}" width="176" height="${H}" filter="url(#cmottle)" opacity=".9"/>
  <rect x="114" y="${TOP}" width="176" height="${H}" filter="url(#grain)" opacity=".5"/>
  <g stroke="#000" stroke-opacity=".3" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M128 152q2 30 -1 62"/><path d="M176 152q-2 22 1 40"/><path d="M270 152q3 26 0 54"/><path d="M233 152q1 18 -1 30"/></g>
  <g fill="#4d6b3a" opacity=".3"><circle cx="118" cy="154" r="3"/><circle cx="122" cy="156" r="2"/><circle cx="286" cy="154" r="3.4"/><circle cx="281" cy="157" r="2"/></g>
  <g fill="#fff" opacity=".35"><circle cx="150" cy="153" r=".9"/><circle cx="222" cy="154" r=".8"/><circle cx="262" cy="153" r="1"/><circle cx="130" cy="155" r=".7"/></g>
  <rect x="114" y="${TOP}" width="176" height="14" fill="url(#eave)"/>
  <rect x="190" y="140" width="24" height="12" fill="url(#cav)"/>
  <!-- pump + riser + cable (seen through the water) -->
  <path class="pbody" d="M251 262V${GROUND - 12}q0 -10 10 -10h7v6" stroke-width="5"/>
  <path class="pdark dark-out" data-dark2 d="M251 262V${GROUND - 12}q0 -10 10 -10h7v6" stroke-width="3.6"/>
  <path class="pflow flow-out" d="M251 262V${GROUND - 12}q0 -10 10 -10h7v6" stroke-width="2"/>
  <path class="pshine shine-out" d="M251 262V${GROUND - 12}q0 -10 10 -10h7v6"/>
  <circle class="tap" cx="268" cy="${GROUND - 3}" r="1.7"/>
  <path d="M245 262q-9 -18 -5 -56T244 150" stroke="#14181b" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="251" cy="290" rx="18" ry="2.4" fill="#000" opacity=".4"/>
  <g><rect x="238" y="262" width="26" height="26" rx="4" fill="url(#pumpg)"/><rect x="238" y="262" width="26" height="8" rx="3" fill="#2a2e31"/><rect x="239" y="263" width="24" height="1.6" rx=".8" fill="#fff" opacity=".25"/>
    <rect x="236" y="286" width="30" height="4" rx="1" fill="#4a5056"/><rect x="236" y="286" width="30" height="1" fill="#fff" opacity=".25"/><circle class="pump-led" cx="258" cy="266" r="1.8"/>
    <path d="M243 274h16M243 279h16" stroke="#000" stroke-opacity=".3" stroke-width="1.2"/><path d="M241 264v22" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round"/>
    <g fill="#222" opacity=".8"><rect x="243" y="282" width="3" height="3" rx=".6"/><rect x="249" y="282" width="3" height="3" rx=".6"/><rect x="255" y="282" width="3" height="3" rx=".6"/></g></g>
  <line data-cable x1="162" x2="162" y1="${TOP}" y2="250" stroke="#d9d9d9" stroke-width="1.1"/>
  <!-- water -->
  <g clip-path="url(#cavity)"><g transform="translate(0,${TOP})"><g class="lvl" data-lvl style="transform:translateY(${H}px)">
    <rect x="100" y="2" width="200" height="${H + 20}" fill="url(#g)" opacity=".8"/>
    <rect x="100" y="2" width="200" height="16" fill="url(#shallow)"/>
    <g mask="url(#cfade)"><rect class="caus c1" x="60" y="0" width="280" height="${H + 6}" fill="url(#caus)"/><rect class="caus c2" x="60" y="0" width="280" height="${H + 6}" fill="url(#caus2)"/></g>
    <g><polygon class="cray" points="140,2 160,2 200,${H} 170,${H}"/><polygon class="cray" points="210,2 226,2 262,${H} 238,${H}"/><polygon class="cray" points="250,2 262,2 286,${H} 268,${H}"/></g>
    ${motes}
    ${bubs}
    <path class="wave b" d="M60 0q15 -4 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0V14h-300z" fill="var(--tank2)"/>
    <path class="wave m" d="M60 0q15 3 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0V14h-300z" fill="var(--tank)" opacity=".55"/>
    <path class="wave" d="M60 0q15 5 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0V14h-300z" fill="var(--tank)" opacity=".5"/>
    <path class="wave line" d="M60 0q15 5 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0" fill="none" stroke="#fff" stroke-width="1" opacity=".7"/>
  </g></g></g>
  <g clip-path="url(#cavity)" class="beam"><polygon points="190,${TOP} 214,${TOP} 160,290 126,290" fill="url(#beamg)"/>
    <circle class="dust" cx="188" cy="185" r="1"/><circle class="dust" cx="176" cy="215" r=".9" style="animation-delay:-3s"/><circle class="dust" cx="196" cy="170" r=".8" style="animation-delay:-6s"/><circle class="dust" cx="165" cy="245" r="1" style="animation-delay:-2s"/></g>
  <rect x="114" y="${TOP}" width="176" height="${H}" fill="url(#edge)"/>
  <!-- inlet stream: leaves the spout in an arc, breaks on the surface -->
  <path class="pbody" d="M114 150H130" stroke-width="7"/>
  <path class="stream" data-stream d="M129 151C137 151 141 170 141 200" fill="none" stroke-width="3"/>
  <path class="stream-shine" data-stream2 d="M129 151C137 151 141 170 141 200" fill="none"/>
  <g class="isplash" data-isplash transform="translate(0,290)">
    <ellipse cx="141" cy="0" rx="10" ry="2.6" style="--d:0s"/><ellipse cx="141" cy="0" rx="10" ry="2.6" style="--d:.55s"/>
    <ellipse class="foam" cx="141" cy="0.5" rx="6" ry="1.4"/>
    <circle class="sd" cx="141" cy="0" r="1.1" style="--dx:-9px;--d:0s"/><circle class="sd" cx="141" cy="0" r="1" style="--dx:7px;--d:.3s"/>
    <circle class="sd" cx="141" cy="0" r="1.2" style="--dx:-5px;--d:.6s"/><circle class="sd" cx="141" cy="0" r="1" style="--dx:11px;--d:.15s"/>
    <circle class="sd" cx="141" cy="0" r=".9" style="--dx:4px;--d:.75s"/>
  </g>
  <!-- float + level marks -->
  <rect data-float x="156" y="0" width="12" height="7" rx="3" fill="url(#floatg)" stroke="#7a3d00" stroke-width=".8"/>
  <line data-ulim x1="114" x2="290" y1="0" y2="0" stroke="#fff" stroke-width="1.2" stroke-dasharray="4 3" opacity="0"/>
  <g stroke="#fff" stroke-opacity=".6">${ticks}</g>
  <!-- overflow stub -->
  <path class="pbody" d="M300 262H314" stroke-width="5"/>
  <line class="spill" x1="315" y1="264" x2="315" y2="292"/>
  <!-- rain -->
  <g class="gsplash" clip-path="url(#air)">${gsplash}</g>
  <g clip-path="url(#air)" class="drops">${drops}</g>
  <path class="bolt" d="M300 4l-12 26h9l-11 30 22 -36h-10l8 -20z" fill="#fff8c4" transform="scale(.8) translate(40,0)"/>
  <rect class="flash" width="400" height="${GROUND}" fill="#fff"/>
  <g class="mist"><rect y="${GROUND - 26}" width="400" height="30" fill="url(#mist)"/><rect y="${GROUND - 4}" width="400" height="5" fill="#fff" opacity=".14"/></g>
  <rect width="400" height="320" filter="url(#grain)" opacity=".12" style="mix-blend-mode:overlay" pointer-events="none"/>
  <rect width="400" height="320" fill="url(#vign)" pointer-events="none"/>
</svg>
<div class="c p-wx" data-wx><ha-icon data-wxi icon="mdi:weather-sunny"></ha-icon><div class="t"><span class="l" data-wxs></span><span class="v" data-wxl></span></div></div>
@CHIPS@
<div class="tankinfo"><div class="pc"><span data-pct>–</span><small>%</small></div><div class="vl"><span data-vol>–</span> <span data-vu>L</span></div><div class="cp" data-cap></div></div>
<div class="utag" data-utag></div>
</div>`;
  return opt.photo ? toPhoto(html, opt) : html;
}

class EcoWaterTankCard extends HTMLElement {
  setConfig(config) {
    if (!config || (!config.device && !config.entity && !config.entities && !config.level_entity && !config.volume_entity)) {
      throw new Error("Set `device`, or `level_entity` / `volume_entity` to use the card without the integration");
    }
    this._config = config;
    this._key = null;
    this._ids = null;
    this._rain = null;
    this._pump = null;
    this._base = {};
    if (this._hass) this.hass = this._hass;
  }

  static getConfigElement() { return document.createElement("eco-water-tank-card-editor"); }
  static getStubConfig() { return {}; }
  getCardSize() { return 6; }

  connectedCallback() {
    // rain / pump stop without any state change: re-evaluate the scene regularly
    this._timer = setInterval(() => this._ids && this._weather(), 20000);
  }
  disconnectedCallback() { clearInterval(this._timer); }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    const ids = this._resolve();
    const key = ids ? Object.keys(ids).sort().join() : "";
    if (key !== this._key) { this._key = key; this._ids = ids; this._build(); }
    this._ids = ids;
    if (ids) this._update();
  }

  _t(k) { return (T[(this._hass.language || "en").slice(0, 2)] || T.en)[k]; }

  /** Entity name in HA's language: friendly name without the device-name prefix. */
  _name(key) {
    const h = this._hass, id = this._ids[key], st = id && h.states[id];
    const full = st?.attributes?.friendly_name;
    if (!full) return key;
    const dev = h.devices?.[h.entities?.[id]?.device_id]?.name;
    return dev && full.startsWith(dev + " ") ? full.slice(dev.length + 1) : full;
  }

  _loc(key, fallback) { return this._hass.localize?.(key) || fallback; }

  /**
   * key -> entity_id. With the integration: its entities via the entity registry (names are
   * user-chosen, translation keys are not). Without: level_entity / volume_entity / inlet_entity /
   * outlet_entity or an `entities` map, any sensor of any integration. The map overrides.
   */
  _resolve() {
    const h = this._hass, c = this._config;
    const out = {};
    const dev = c.device || h.entities?.[c.entity]?.device_id;
    if (dev) {
      for (const [id, e] of Object.entries(h.entities || {})) {
        if (e.device_id === dev && e.platform === DOMAIN && e.translation_key) out[e.translation_key] = id;
      }
    }
    const own = { level: c.level_entity, volume: c.volume_entity, water_in: c.inlet_entity, water_out: c.outlet_entity, ...(c.entities || {}) };
    for (const [k, id] of Object.entries(own)) if (id) out[k] = id;
    return out.level || out.volume ? out : null;
  }

  _build() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const ids = this._ids;
    if (!ids) {
      this.shadowRoot.innerHTML = `<style>${STYLE}</style><ha-card><div class="warn">${this._t("missing")}</div></ha-card>`;
      return;
    }
    const tile = (k, icon, cls, label) => `<div class="c ${cls}" data-tile="${k}"><ha-icon icon="${icon}"></ha-icon><div class="t"><span class="l">${label}</span>
        <span class="v"><i data-e="${k}"></i><span data-v="${k}"></span><u data-u="${k}"></u></span></div></div>`;
    const clean = (t) => t.replace(/\s*\(.*\)\s*$/, "");
    const list = [];
    for (const [k, srcs, icon, cls] of CHIPS) {
      if (k === "net") continue;
      const src = srcs.find((x) => ids[x]);
      let derived = null, kind = k === "rain_efficiency" ? "pct" : "vol";
      // no "today" sensor (card used without the integration): derive it from a cumulative counter
      if (!src && (k === "in_today" || k === "out_today")) {
        const w = k === "in_today" ? "water_in" : "water_out";
        if (this._unitKind(w) === "vol") derived = w;
      }
      if (!src && !derived) continue;
      if (src && (k === "tot_in" || k === "tot_out") && this._unitKind(src) === "vrate") kind = "rate"; // flow meter: instant flow
      list.push({ k, src, derived, kind, html: tile(k, icon, cls, clean(derived ? this._t(k) : this._name(src))) });
    }
    if (list.some((x) => x.k === "in_today") && list.some((x) => x.k === "out_today")) {
      const n = CHIPS.find((x) => x[0] === "net");
      list.push({ k: "net", kind: "vol", html: tile("net", n[2], n[3], this._t("net")) });
    }
    this._chips = list;
    const canCalib = ids.apply_correction || ids.mark_full;
    this.shadowRoot.innerHTML = `<style>${STYLE}</style>
<ha-card>
  <div class="head"><div class="title" data-title></div><span class="chip" data-chip></span></div>
  ${scene(this._photo()).replace("@CHIPS@", this._chips.map((c) => c.html).join(""))}
  ${canCalib ? `<details><summary>${this._t("calib")}</summary>
    <div class="hint">${this._t("hint")}</div>
    <div class="row">
      ${ids.calibrate_volume ? `<label class="f">${this._name("calibrate_volume")}<input type="number" min="0" step="1" data-num="calibrate_volume"></label>` : ""}
      ${ids.calibrate_percent ? `<label class="f">${this._name("calibrate_percent")}<input type="number" min="0" max="100" step="0.1" data-num="calibrate_percent"></label>` : ""}
      ${ids.apply_correction ? `<button class="main" data-btn="apply_correction">${this._name("apply_correction")}</button>` : ""}
    </div>
    <div class="row">
      ${ids.mark_full ? `<button data-btn="mark_full">${this._name("mark_full")}</button>` : ""}
      ${ids.mark_empty ? `<button data-btn="mark_empty">${this._name("mark_empty")}</button>` : ""}
      ${ids.share_tank ? `<button data-btn="share_tank">${this._name("share_tank")}</button>` : ""}
    </div></details>` : ""}
</ha-card>`;
    const root = this.shadowRoot;
    root.querySelectorAll("[data-btn]").forEach((b) =>
      b.addEventListener("click", () => this._hass.callService("button", "press", { entity_id: this._ids[b.dataset.btn] })));
    root.querySelectorAll("[data-num]").forEach((i) =>
      i.addEventListener("change", () => {
        if (i.value === "") return;
        this._hass.callService("number", "set_value", { entity_id: this._ids[i.dataset.num], value: Number(i.value) });
      }));
    this._drops = [...root.querySelectorAll("[data-drop]")];
    // photo mode: follow the tank box with the big numbers and the usable-volume tag
    const o = this._photo();
    if (o.photo) {
      const [x, y, w, h] = o.tank;
      Object.assign(root.querySelector(".tankinfo").style, { left: `${x + w / 2}%`, top: `${y + h * 0.55}%` });
      // usable volume: pill centered just under the tank (below the outer wall, ~90.5% of the picture)
      Object.assign(root.querySelector("[data-utag]").style, { left: `${x + w / 2}%`, top: "91.8%", transform: "translate(-50%,0)" });
    }
  }

  /** Photo background options (percent of the picture); photo = false keeps the drawn scene. */
  _photo() {
    const c = this._config;
    const image = c.image || (c.photo === false ? null : BUNDLED_IMAGES.day);
    const night = c.image ? c.image_night : c.photo === false ? null : BUNDLED_IMAGES.night;
    return {
      photo: !!image, image, night, debug: !!c.debug,
      tank: c.tank || PHOTO_DEFAULT.tank, pipe: c.pipe || PHOTO_DEFAULT.pipe,
    };
  }

  /** Scene y (0..320 units) of a y given in the drawn-scene tank coordinates. */
  _ty(y) {
    const o = this._photo();
    return o.photo ? o.tank[1] * VH / 100 + (y - TOP) * (o.tank[3] * VH / 100 / H) : y;
  }

  _st(key) {
    const id = this._ids[key];
    return id ? this._hass.states[id] : undefined;
  }

  _unitKind(key) { return parseUnit(this._st(key)?.attributes?.unit_of_measurement).kind; }

  /** Value in base units: litres, mm, L/h, mm/h (percent and unknown units untouched). */
  _num(key) {
    const s = this._st(key);
    if (!s) return null;
    const v = parseFloat(s.state);
    return Number.isFinite(v) ? v * parseUnit(s.attributes?.unit_of_measurement).f : null;
  }

  _cfgNum(x) { const n = parseFloat(x); return Number.isFinite(n) ? n : null; }

  /** Display units follow the HA unit system unless `volume_unit` (L, m³, gal, ft³) is set. */
  _vu() { const u = this._config.volume_unit; return DISPLAY[u] ? u : this._hass.config?.unit_system?.volume === "gal" ? "gal" : "L"; }
  _fu() { return this._vu() === "gal" ? "gal/min" : "L/min"; }
  _lu() { return this._hass.config?.unit_system?.length === "mi" ? "in" : "mm"; }

  /** A volume typed in the config (capacity, pump_limit), as litres: in `capacity_unit`, else the unit of the volume sensor, else the display unit. */
  _cfgVol(x) {
    const n = this._cfgNum(x);
    if (n == null) return null;
    const sensor = ["volume", "level"].map((k) => parseUnit(this._st(k)?.attributes?.unit_of_measurement)).find((u) => u.kind === "vol");
    return n * (VOLUME[this._config.capacity_unit] ?? sensor?.f ?? DISPLAY[this._vu()].f);
  }

  _cap() { return this._num("capacity") ?? this._cfgVol(this._config.capacity); }

  /** Litres from a volume sensor, or from a level sensor that reads in a volume unit. */
  _volRaw() {
    if (this._ids.volume) { const v = this._num("volume"); if (v != null) return v; }
    return this._unitKind("level") === "vol" ? this._num("level") : null;
  }

  /** Fill in %: a % sensor, a calibrated height/distance sensor (level_empty / level_full), litres / capacity. */
  _pct() {
    const s = this._st("level"), c = this._config;
    if (s) {
      const v = parseFloat(s.state);
      if (Number.isFinite(v)) {
        const k = parseUnit(s.attributes?.unit_of_measurement);
        const lo = this._cfgNum(c.level_empty), hi = this._cfgNum(c.level_full);
        if (k.kind === "pct") return v;
        if (lo != null && hi != null && hi !== lo) return (v - lo) / (hi - lo) * 100;
        if (k.kind === "vol") { const cap = this._cap(); if (cap) return v * k.f / cap * 100; }
        else { const th = this._cfgNum(c.tank_height); if (th) return v / th * 100; }
      }
    }
    const vr = this._volRaw(), cap = this._cap();
    return vr != null && cap ? vr / cap * 100 : null;
  }

  _vol() {
    const vr = this._volRaw();
    if (vr != null) return vr;
    const p = this._pct(), cap = this._cap();
    return p != null && cap ? p / 100 * cap : null;
  }

  _capShown() {
    const cap = this._cap();
    if (cap) return cap;
    const vr = this._volRaw(), p = this._pct();
    return vr != null && p > 1 ? vr / p * 100 : null;
  }

  _fmt(v, d = 0) {
    return v == null ? "–" : v.toLocaleString(this._hass.language, { maximumFractionDigits: d, minimumFractionDigits: d });
  }

  /** Litres -> text in the display unit. */
  _fv(L) {
    if (L == null) return "–";
    const f = DISPLAY[this._vu()], x = L / f.f;
    return this._fmt(x, f.d === 2 ? (Math.abs(x) < 10 ? 2 : 1) : f.d);
  }

  /** Litres since local midnight from a cumulative counter, via the recorder (first value seen as a fallback). */
  _today(key) {
    const id = this._ids[key], v = this._num(key);
    if (!id || v == null) return null;
    const day = new Date().toLocaleDateString("sv");
    const b = (this._base[id] ||= { day: null, v: 0 });
    if (b.day !== day) { b.day = day; b.v = v; this._loadBase(id, key, b, day); }
    return v >= b.v ? v - b.v : v; // a counter that restarted counts from zero
  }

  async _loadBase(id, key, b, day) {
    try {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const res = await this._hass.callWS({
        type: "history/history_during_period", start_time: start.toISOString(), end_time: new Date().toISOString(),
        entity_ids: [id], include_start_time_state: true, significant_changes_only: false, minimal_response: true, no_attributes: true,
      });
      const first = parseFloat(res?.[id]?.[0]?.s);
      const f = parseUnit(this._st(key)?.attributes?.unit_of_measurement).f;
      if (Number.isFinite(first) && b.day === day) { b.v = first * f; this._update(); }
    } catch (e) { /* no recorder: the first value seen today stays the baseline */ }
  }

  /**
   * Rain intensity 0..1 and the time it last rained. Sources, any of them: `rain_entity`
   * (mm/h or in/h sensor, cumulative mm / in gauge, or a binary rain sensor), `weather_entity`,
   * else the integration's "rainwater collected" sensor (litres, scaled to the tank capacity).
   */
  _trackRain() {
    const c = this._config, now = Date.now();
    const srcs = [c.rain_entity, c.weather_entity].filter(Boolean);
    if (!srcs.length && this._ids.rain_in) srcs.push(this._ids.rain_in);
    const r = (this._rain ||= { i: 0, rainAt: 0, rate: null, s: {} });
    r.rate = null;
    for (const id of srcs) {
      const s = (r.s[id] ||= { last: null, at: 0, i: 0, rainAt: 0 });
      this._rainOf(id, s, now, r);
      if (s.rainAt >= r.rainAt) { r.rainAt = s.rainAt; r.i = s.i; }
    }
  }

  _rainOf(id, s, now, r) {
    const st = this._hass.states[id];
    if (!st) return;
    const dom = id.split(".")[0];
    if (dom === "weather") {
      const i = WEATHER_RAIN[st.state] ?? 0;
      if (i > 0) { s.i = i; s.rainAt = now; }
      return;
    }
    if (dom === "binary_sensor" || dom === "input_boolean" || dom === "switch") {
      if (st.state === "on") { s.i = 0.5; s.rainAt = now; }
      return;
    }
    const v = parseFloat(st.state);
    if (!Number.isFinite(v)) return;
    const k = parseUnit(st.attributes?.unit_of_measurement);
    if (k.kind === "lrate") {
      const mmh = v * k.f, inch = this._lu() === "in";
      r.rate = { v: mmh / (inch ? 25.4 : 1), unit: `${inch ? "in" : "mm"}/h` };
      s.i = Math.min(1, mmh / 10);
      if (mmh > 0) s.rainAt = now;
      return;
    }
    // cumulative gauge (mm, cm, in), or the integration's litres: intensity from how fast it rises
    const x = k.kind === "len" ? v * k.f : v;
    const heavy = k.kind === "len" ? 10 : Math.max(10, (this._cap() || 1000) * 0.1); // 10 mm/h, or 10 % of capacity per hour
    if (s.last == null) {
      // first sight: a recent change means it is probably raining right now
      if (now - new Date(st.last_changed || 0).getTime() < 10 * 60000) { s.rainAt = now; s.i = 0.3; }
    } else if (x > s.last) {
      s.i = Math.max(0.1, Math.min(1, ((x - s.last) / Math.max(s.at ? (now - s.at) / 3600000 : 0.1, 0.02)) / heavy));
      s.rainAt = now;
    }
    if (s.last == null || x !== s.last) s.at = now;
    s.last = x;
  }

  /** The pump: `pump_entity` (switch, or a power sensor above `pump_threshold` W), a flow meter above 0, or a rising "water out" counter. */
  _trackPump() {
    const h = this._hass, c = this._config, now = Date.now();
    const p = (this._pump ||= { last: null, at: 0, on: false });
    if (c.pump_entity) {
      const st = h.states[c.pump_entity];
      if (!st) return;
      const n = parseFloat(st.state);
      p.on = Number.isFinite(n) ? n > (this._cfgNum(c.pump_threshold) ?? 5) : st.state === "on";
      return;
    }
    const id = this._ids.water_out || this._ids.water_out_today;
    const st = id && h.states[id];
    if (!st) return;
    const v = parseFloat(st.state);
    if (!Number.isFinite(v)) return;
    if (parseUnit(st.attributes?.unit_of_measurement).kind === "vrate") { p.on = v > 0; return; }
    if (p.last == null) { if (now - new Date(st.last_changed || 0).getTime() < PUMP_MS) p.at = now; }
    else if (v > p.last) p.at = now;
    p.last = v;
  }

  _weather() {
    const r = this._rain, h = this._hass, now = Date.now();
    const idle = r ? (now - r.rainAt) / 60000 : Infinity;
    const raining = idle < RAIN_MIN;
    const i = raining ? r.i * (idle < 6 ? 1 : 0.5) : 0;
    const sc = this.shadowRoot?.querySelector("[data-scene]");
    if (!sc) return;
    // day / dusk / night: sun elevation if available, else the clock
    const sun = h.states[this._config.sun_entity || "sun.sun"];
    const el = sun ? parseFloat(sun.attributes?.elevation) : NaN;
    let phase;
    if (Number.isFinite(el)) phase = el > 4 ? "day" : el > -4 ? "dusk" : "night";
    else if (sun) phase = sun.state === "above_horizon" ? "day" : "night";
    else { const hr = new Date().getHours(); phase = hr >= 8 && hr < 19 ? "day" : hr >= 6 && hr < 21 ? "dusk" : "night"; }
    const pumping = !!this._pump && (this._pump.on || now - this._pump.at < PUMP_MS);
    const lvl = this._pct();
    const overflowing = raining && lvl != null && lvl >= 97.5;
    sc.className = `scene ${phase}${this._photo().photo ? " photo" : ""}${raining ? " rainy" : ""}${raining && i >= 0.8 ? " storm" : ""}${pumping ? " pumping" : ""}${overflowing ? " overflowing" : ""}`;
    const n = raining ? Math.round(10 + i * (DROPS - 10)) : 0;
    this._drops?.forEach((d, k) => { d.style.opacity = k < n ? (0.5 + i * 0.5).toFixed(2) : "0"; });
    const flow = sc.querySelector("[data-flow]");
    const wpx = (1 + i * 5.6) * (this._photo().photo ? 0.55 : 1); // trickle -> full pipe
    sc.querySelector("[data-dark]").style.strokeWidth = wpx.toFixed(1);
    flow.style.strokeWidth = Math.max(0.8, wpx * 0.55).toFixed(1);
    sc.style.setProperty("--fs", `${(1.5 - i * 1.25).toFixed(2)}s`);
    sc.querySelector("[data-stream]").style.strokeWidth = (1 + i * 5).toFixed(1);
    // weather chip
    const w = (c) => this._loc(`component.weather.entity_component._.state.${c}`, c);
    const cond = raining ? (i < 0.6 ? "rainy" : "pouring") : phase === "night" ? "clear-night" : "sunny";
    const icon = raining ? (i < 0.6 ? "mdi:weather-rainy" : "mdi:weather-pouring") : phase === "night" ? "mdi:weather-night" : phase === "dusk" ? "mdi:weather-sunset" : "mdi:weather-sunny";
    const wi = sc.querySelector("[data-wxi]");
    if (wi.getAttribute("icon") !== icon) wi.setAttribute("icon", icon);
    sc.querySelector("[data-wxl]").textContent = w(cond);
    sc.querySelector("[data-wxs]").textContent = raining && r.rate ? `${this._fmt(r.rate.v, 1)} ${r.rate.unit}` : "";
  }

  _update() {
    const r = this.shadowRoot, ids = this._ids, h = this._hass, c = this._config;
    const $ = (q) => r.querySelector(q);
    const set = (q, v) => { const e = $(q); if (e && e.textContent !== v) e.textContent = v; };
    const vu = this._vu();

    const lvl = this._pct(), vol = this._vol(), cap = this._capShown();
    const p = lvl == null ? 0 : Math.max(0, Math.min(100, lvl));
    const main = h.states[ids.level] || h.states[ids.volume];
    set("[data-title]", c.name || main?.attributes?.friendly_name?.replace(/\s+(Level|Niveau)$/i, "") || this._t("title"));
    set("[data-pct]", this._fmt(lvl, 1));
    set("[data-vol]", this._fv(vol));
    set("[data-vu]", vu);
    set("[data-cap]", cap == null ? "" : `${ids.capacity ? this._name("capacity").replace(/\s*\(.*\)\s*$/, "") : this._t("capacity")}: ${this._fv(cap)} ${vu}`);
    set("[data-chip]", lvl == null ? this._loc("state.default.unknown", "?") : lvl < 15 ? this._t("low") : lvl > 95 ? this._t("high") : this._t("ok"));
    const card = $("ha-card");
    card.classList.toggle("low", lvl != null && lvl < 15);
    card.classList.toggle("mid", lvl != null && lvl >= 15 && lvl < 35);

    // water surface and everything that rides on it
    const sy = TOP + H * (1 - p / 100);
    $("[data-lvl]").style.transform = `translateY(${(H * (1 - p / 100)).toFixed(1)}px)`;
    if (!this._photo().photo) $("[data-isplash]").style.transform = `translateY(${sy.toFixed(1)}px)`;
    const ph = this._photo();
    let sd;
    if (ph.photo) {
      // from the mouth of the pipe, falling straight onto the water surface (picture units)
      const [mx, my] = ph.pipe[ph.pipe.length - 1];
      const x0 = mx * 4, y0 = my * VH / 100, x1 = x0 + 5, y1 = Math.max(this._ty(sy), y0 + 6);
      sd = `M${x0 - 3} ${y0}C${x0 + 3} ${y0} ${x1} ${y0 + 2} ${x1} ${(y0 + y1) / 2}S${x1} ${y1 - 2} ${x1} ${y1.toFixed(1)}`;
      $("[data-isplash]").setAttribute("transform", `translate(${x1} ${y1.toFixed(1)})`);
    } else {
      sd = `M129 151C137 151 141 ${(151 + Math.max(sy, 158)) / 2 - 8} 141 ${Math.max(sy, 158).toFixed(1)}`;
    }
    $("[data-stream]").setAttribute("d", sd);
    $("[data-stream2]").setAttribute("d", sd);
    $("[data-float]").setAttribute("y", (sy - 5).toFixed(1));
    $("[data-cable]").setAttribute("y2", (sy - 5).toFixed(1));
    const lim = this._cfgVol(c.pump_limit);
    const usable = this._num("usable_volume") ?? (lim != null && vol != null ? Math.max(0, vol - lim) : null);
    const ul = $("[data-ulim]"), ut = $("[data-utag]");
    if (usable != null && vol > 0) {
      const ly = TOP + H * (1 - (p * (1 - usable / vol)) / 100);
      ul.setAttribute("y1", ly.toFixed(1)); ul.setAttribute("y2", ly.toFixed(1)); ul.style.opacity = ".8";
      ut.style.display = "block"; if (!this._photo().photo) ut.style.top = `${(ly / 320 * 100).toFixed(1)}%`;
      ut.innerHTML = `${ids.usable_volume ? this._name("usable_volume") : this._t("usable")}<b>${this._fv(usable)} ${vu}</b>`;
    } else { ul.style.opacity = "0"; ut.style.display = "none"; }

    // data chips: litres (any volume unit), flow (L/min, m³/h, gpm...), %, and today's totals
    const estimated = (id) => !!(id && h.states[id]?.attributes?.estimated);
    const chips = this._chips || [];
    const vals = {};
    for (const x of chips) {
      if (x.k === "net") continue;
      vals[x.k] = x.kind === "pct" || x.kind === "rate" ? this._num(x.src) : x.derived ? this._today(x.derived) : this._num(x.src);
    }
    const inChip = chips.find((x) => x.k === "in_today");
    for (const x of chips) {
      let v, est, cls = "", text, unit;
      if (x.k === "net") {
        const a = vals.in_today, b = vals.out_today;
        v = a != null && b != null ? a - b : null;
        est = estimated(ids[inChip?.src]);
        cls = v == null ? "" : v >= 0 ? "pos" : "neg";
      } else { v = vals[x.k]; est = estimated(ids[x.src]); }
      if (x.kind === "pct") { text = v == null ? "–" : this._fmt(v); unit = "%"; }
      else if (x.kind === "rate") { text = v == null ? "–" : this._fmt(v / 60 / DISPLAY[this._vu() === "gal" ? "gal" : "L"].f, 1); unit = ` ${this._fu()}`; }
      else { text = this._fv(v); unit = ` ${vu}`; }
      set(`[data-v="${x.k}"]`, text);
      set(`[data-u="${x.k}"]`, v == null ? "" : unit);
      set(`[data-e="${x.k}"]`, est ? "≈" : "");
      $(`[data-v="${x.k}"]`).className = cls;
    }

    // number inputs: show the pending value, but never overwrite one being edited
    r.querySelectorAll("[data-num]").forEach((inp) => {
      if (this.shadowRoot.activeElement === inp) return;
      const st = h.states[ids[inp.dataset.num]]?.state;
      inp.value = st && st !== "unknown" && st !== "unavailable" ? st : "";
    });

    this._trackRain();
    this._trackPump();
    this._weather();
  }
}

const EDITOR_T = {
  en: { import: "Import from the integration", none: "No Eco Water Tank found.", old: "Update the Eco Water Tank integration (0.4.6 or later) to import.", done: "Imported:", pick: "Several tanks: choose one." },
  fr: { import: "Importer depuis l'intégration", none: "Aucun Eco Water Tank trouvé.", old: "Mets à jour l'intégration Eco Water Tank (0.4.6 ou plus) pour importer.", done: "Importé :", pick: "Plusieurs cuves : choisis-en une." },
};

class EcoWaterTankCardEditor extends HTMLElement {
  setConfig(c) { this._config = c; this._render(); }
  set hass(h) {
    this._hass = h;
    if (this._form) this._form.hass = h;
    if (this._btn) this._btn.textContent = this._t("import");
  }
  _t(k) { return (EDITOR_T[(this._hass?.language || "en").slice(0, 2)] || EDITOR_T.en)[k]; }

  _emit(config) {
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
    this._render();
  }

  /** Fill device, name and rain sensor from the integration's own configuration. */
  async _import() {
    const note = (t) => { this._msg.textContent = t; };
    this._pick.replaceChildren();
    note("");
    let tanks;
    try {
      ({ tanks } = await this._hass.callWS({ type: `${DOMAIN}/card_config` }));
    } catch (e) {
      note(this._t("old"));
      return;
    }
    const known = tanks.filter((x) => x.device_id);
    if (!known.length) { note(this._t("none")); return; }
    const cur = this._config.device;
    const match = known.find((x) => x.device_id === cur) || (known.length === 1 ? known[0] : null);
    if (match) return this._apply(match);
    note(this._t("pick"));
    for (const x of known) {
      const b = document.createElement("button");
      b.textContent = x.name;
      b.addEventListener("click", () => this._apply(x));
      this._pick.appendChild(b);
    }
  }

  _apply(t) {
    const config = { ...this._config, device: t.device_id, name: t.name };
    if (t.rain_entity) config.rain_entity = t.rain_entity;
    this._emit(config);
    this._msg.textContent = `${this._t("done")} ${t.name}${t.rain_entity ? ` (${t.rain_entity})` : ""}`;
    this._pick.replaceChildren();
  }

  _render() {
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => s.label;
      this._form.addEventListener("value-changed", (e) =>
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: e.detail.value }, bubbles: true, composed: true })));
      this.appendChild(this._form);
      const box = document.createElement("div");
      box.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px";
      const btn = document.createElement("button");
      btn.style.cssText = "cursor:pointer;font:inherit;font-weight:600;padding:8px 14px;border-radius:8px;border:1px solid var(--primary-color);background:var(--primary-color);color:var(--text-primary-color,#fff)";
      btn.addEventListener("click", () => this._import());
      this._btn = btn;
      this._msg = document.createElement("span");
      this._msg.style.cssText = "font-size:.85rem;color:var(--secondary-text-color)";
      this._pick = document.createElement("div");
      this._pick.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;width:100%";
      box.append(btn, this._msg, this._pick);
      this.appendChild(box);
    }
    this._btn.textContent = this._t("import");
    this._form.hass = this._hass;
    this._form.data = this._config;
    const ent = (domain) => ({ entity: { domain } });
    const num = { number: { mode: "box", step: "any" } };
    this._form.schema = [
      { name: "device", label: "Device (Eco Water Tank integration)", selector: { device: { integration: DOMAIN } } },
      { name: "name", label: "Name (optional)", selector: { text: {} } },
      {
        type: "expandable", name: "", title: "Without the integration: your own entities",
        schema: [
          { name: "level_entity", label: "Level sensor (%, height/distance in m, cm, mm, in, ft, or volume in L, m³, gal...)", selector: ent(["sensor", "number", "input_number"]) },
          { name: "level_empty", label: "Level sensor reading when the tank is empty (height or distance sensors)", selector: num },
          { name: "level_full", label: "Level sensor reading when the tank is full", selector: num },
          { name: "volume_entity", label: "Volume sensor (L, m³, gal, ft³...)", selector: ent(["sensor", "number", "input_number"]) },
          { name: "capacity", label: "Capacity (when the sensors give no volume)", selector: num },
          { name: "capacity_unit", label: "Unit of capacity and pump limit (default: unit of the volume sensor, else display unit)", selector: { select: { options: ["L", "m³", "gal", "ft³"], mode: "dropdown" } } },
          { name: "pump_limit", label: "Volume the pump can never draw (optional)", selector: num },
          { name: "inlet_entity", label: "Water in: total (L, m³, gal...) or flow (L/min, m³/h, gpm...)", selector: ent("sensor") },
          { name: "outlet_entity", label: "Water out: total or flow", selector: ent("sensor") },
          { name: "pump_entity", label: "Pump (switch, or power sensor in W)", selector: ent(["switch", "binary_sensor", "input_boolean", "sensor"]) },
          { name: "weather_entity", label: "Weather entity (rain)", selector: ent("weather") },
        ],
      },
      { name: "volume_unit", label: "Display unit (default: your unit system)", selector: { select: { options: ["L", "m³", "gal", "ft³"], mode: "dropdown" } } },
      { name: "rain_entity", label: "Rain sensor (optional: mm/h or in/h, cumulative mm or in, or a rain binary sensor)", selector: ent(["sensor", "binary_sensor"]) },
      { name: "sun_entity", label: "Sun entity (optional, default sun.sun)", selector: ent("sun") },
      { name: "image", label: "Photo background, day (optional, e.g. /local/eco-water-tank/day.webp)", selector: { text: {} } },
      { name: "image_night", label: "Photo background, night (optional)", selector: { text: {} } },
    ];
  }
}

customElements.define("eco-water-tank-card", EcoWaterTankCard);
customElements.define("eco-water-tank-card-editor", EcoWaterTankCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "eco-water-tank-card",
  name: "Eco Water Tank",
  description: "Cross-section of a buried tank (rain, day/night, inflow, pump) with all the integration's data on the picture.",
  preview: false,
});

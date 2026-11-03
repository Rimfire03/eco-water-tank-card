const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcFile = path.join(__dirname, 'src', 'eco-water-tank-card.js');
const imagesDir = path.join(__dirname, 'src', 'images');
const distDir = path.join(__dirname, 'dist');
fs.mkdirSync(distDir, { recursive: true });

// Version x.yy from the commit count (same scheme as the other cards); -dev suffix on the dev branch
function getVersion() {
  try {
    const count = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim(), 10);
    let branch = '';
    try { branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim(); } catch (e) {}
    const next = count + 1;
    const v = `${Math.floor(next / 100)}.${String(next % 100).padStart(2, '0')}`;
    return branch === 'dev' ? `${v}-dev` : v;
  } catch (err) {
    return '0.01';
  }
}

const version = getVersion();
console.log(`Building Eco Water Tank Card version: v${version}`);

const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

// Bundle the photo backgrounds (src/images/day.webp, night.webp) as data URIs, only into dist
const images = {};
for (const key of ['day', 'night']) {
  const f = path.join(imagesDir, `${key}.webp`);
  if (fs.existsSync(f)) images[key] = `data:image/webp;base64,${fs.readFileSync(f).toString('base64')}`;
}

const src = fs.readFileSync(srcFile, 'utf8').replace(/const CARD_VERSION = "[^"]+";/, `const CARD_VERSION = "${version}";`);
fs.writeFileSync(srcFile, src, 'utf8');
const dist = src.replace('const BUNDLED_IMAGES = {}; // @@IMAGES@@', () => `const BUNDLED_IMAGES = ${JSON.stringify(images)};`);
fs.writeFileSync(path.join(distDir, 'eco-water-tank-card.js'), dist, 'utf8');
console.log(`Successfully built dist/eco-water-tank-card.js (v${version}, ${Object.keys(images).length} bundled image(s), ${(dist.length / 1024).toFixed(0)} KB)`);

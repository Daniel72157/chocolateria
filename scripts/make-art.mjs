// Genera las ilustraciones de producto (SVG plano -> WebP 1000x1250) en public/art/.
// Son dibujos de marcador de posición en la paleta de la marca: reemplázalos con fotos reales desde el panel.
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const C = { k950: '#3b1f1a', k800: '#4d2a22', k600: '#6e4b40', c500: '#bb8833', c300: '#e8c9b2', c200: '#efd9c4', cr100: '#f2e9de', cr50: '#fbf6ef', sal: '#064e44', sal2: '#f2e9de', fr: '#a53d2b' };
const W = 1000, H = 1250;
const rnd = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const svg = (field, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${field}"/>${body}</svg>`;
const circ = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`;
const rect = (x, y, w, h, f, rx = 0, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" ${extra}/>`;
const ell = (x, y, rx, ry, f, rot = 0) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" transform="rotate(${rot} ${x} ${y})"/>`;

function bombones(field = C.c300) {
  let s = rect(130, 120, 740, 150, C.c500) + rect(455, 120, 90, 150, C.cr50) + rect(130, 290, 740, 580, C.k800) + rect(160, 320, 680, 520, C.k950);
  const tones = [[C.k600, '#8a5a4a'], [C.c500, '#D6A46A'], [C.k600, '#8a5a4a'], [C.c300, '#F4E3C9'], [C.k600, '#8a5a4a'], [C.c500, '#D6A46A']];
  [[295, 500], [500, 500], [705, 500], [295, 690], [500, 690], [705, 690]].forEach(([x, y], i) => {
    s += circ(x, y, 94, C.k800) + circ(x, y, 78, tones[i][0]) + circ(x - 24, y - 26, 22, tones[i][1]) + circ(x + 20, y + 22, 9, i % 2 ? C.cr50 : C.c300);
  });
  return svg(field, s + rect(160, 880, 680, 60, C.k800));
}
function barra(field = C.sal2) {
  let s = `<g transform="rotate(-12 500 650)">` + rect(330, 180, 340, 930, C.k800);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) s += rect(346 + c * 108, 200 + r * 112, 100, 102, C.k600, 6) + rect(354 + c * 108, 208 + r * 112, 40, 14, '#8a5a4a', 4);
  s += rect(320, 760, 360, 360, C.cr50) + rect(320, 840, 360, 70, C.c500) + circ(500, 975, 40, C.k800) + `</g>`;
  return svg(field, s);
}
function trufas(field = C.sal) {
  const r = rnd(7);
  let s = circ(500, 640, 400, C.cr50) + circ(500, 640, 340, C.cr100);
  [[400, 500], [610, 520], [330, 700], [670, 720], [500, 650], [500, 830]].forEach(([x, y]) => {
    s += circ(x, y, 96, C.k950);
    for (let i = 0; i < 16; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 86; s += circ(x + Math.cos(a) * d, y + Math.sin(a) * d, 3 + r() * 5, C.k600); }
    s += circ(x - 28, y - 30, 24, C.k800);
  });
  return svg(field, s);
}
function taza(field = C.c300, liquid = C.k800, art = 'espiral') {
  let s = `<circle cx="830" cy="640" r="86" fill="none" stroke="${C.cr100}" stroke-width="38"/>` + circ(500, 640, 400, C.cr50) + circ(500, 640, 290, C.cr100) + circ(500, 640, 236, liquid);
  if (art === 'espiral') s += `<path d="M500 640 m-110 0 a110 110 0 1 1 110 110 a64 64 0 1 1 -64 -64 a22 22 0 1 1 22 22" fill="none" stroke="${C.c300}" stroke-width="20" stroke-linecap="round"/>`;
  else s += circ(500, 640, 190, C.c500) + circ(500, 640, 128, C.k600) + circ(500, 640, 56, C.c500);
  s += `<g transform="rotate(-35 250 960)">` + rect(110, 940, 280, 36, C.k600, 18) + rect(120, 948, 260, 8, C.c500, 4) + `</g>` + ell(760, 940, 78, 40, C.cr100, 25) + rect(700, 922, 190, 28, C.cr100, 14, 'transform="rotate(25 760 940)"');
  return svg(field, s);
}
function brownie(field = C.sal2) {
  let s = ell(500, 880, 390, 120, C.cr50) + ell(500, 860, 320, 90, C.cr100) + rect(270, 440, 460, 420, C.k800) + rect(270, 440, 460, 110, C.k950) + rect(270, 590, 460, 34, C.c300) + rect(270, 700, 460, 24, C.c300);
  [[290, 90], [380, 140], [480, 70], [570, 130], [660, 100]].forEach(([x, h]) => (s += rect(x, 520, 54, h, C.k950, 27)));
  s += circ(500, 410, 48, C.fr) + circ(484, 394, 14, '#c8665a') + `<path d="M500 365 q16 -70 70 -90" stroke="${C.k800}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  return svg(field, s);
}
function mesa(field = C.c300) {
  let s = '';
  [[330, 450], [670, 450], [330, 790], [670, 790]].forEach(([x, y], i) => {
    s += circ(x, y, 176, i % 3 === 0 ? C.k800 : C.k600) + circ(x, y, 138, i % 3 === 0 ? C.k950 : C.k800) + rect(x - 138, y - 5, 276, 10, i % 3 === 0 ? C.k800 : C.k600) + rect(x - 5, y - 138, 10, 276, i % 3 === 0 ? C.k800 : C.k600);
  });
  return svg(field, s + rect(120, 1010, 760, 90, C.cr50) + rect(120, 1010, 380, 90, C.c500));
}
function cacaopolvo(field = C.sal2) {
  let s = ell(500, 1020, 340, 110, C.k600) + ell(500, 1000, 250, 70, C.k800) + rect(330, 300, 340, 650, C.k800) + rect(305, 250, 390, 80, C.c500, 8) + rect(360, 470, 280, 330, C.cr50) + ell(500, 600, 50, 84, C.k800, 28) + `<path d="M470 540 Q510 600 470 670" stroke="${C.c500}" stroke-width="10" fill="none"/>` + rect(390, 720, 220, 18, C.c300, 9) + rect(420, 756, 160, 18, C.c300, 9);
  return svg(field, s + `<g transform="rotate(-28 780 900)">` + rect(700, 890, 260, 28, C.c500, 14) + ell(690, 904, 56, 36, C.c500) + `</g>`);
}
function nibs(field = C.c300) {
  const r = rnd(11);
  const nib = (x, y, f) => `<polygon points="${[0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * 6.28 + r(); const d = 14 + r() * 16; return `${(x + Math.cos(a) * d).toFixed(1)},${(y + Math.sin(a) * d).toFixed(1)}`; }).join(' ')}" fill="${f}"/>`;
  let s = rect(300, 340, 400, 660, C.cr50, 44) + rect(322, 520, 356, 460, C.k950, 28) + rect(290, 260, 420, 110, C.c500, 20) + rect(350, 660, 300, 190, C.cr100);
  for (let i = 0; i < 90; i++) s += nib(340 + r() * 320, 540 + r() * 420, r() > 0.5 ? C.k600 : C.k800);
  for (let i = 0; i < 26; i++) s += nib(160 + r() * 680, 1060 + r() * 120, r() > 0.5 ? C.k600 : C.k800);
  return svg(field, s + rect(380, 720, 240, 14, C.c500, 7) + rect(410, 760, 180, 14, C.c500, 7));
}
function cajacorp(field = C.sal2, box = C.k800, lid = C.k950, ribbon = C.c500) {
  let s = rect(200, 570, 600, 420, box) + rect(170, 450, 660, 140, lid) + rect(455, 450, 90, 540, ribbon) + `<ellipse cx="410" cy="410" rx="86" ry="46" fill="${ribbon}" transform="rotate(-22 410 410)"/><ellipse cx="590" cy="410" rx="86" ry="46" fill="${ribbon}" transform="rotate(22 590 410)"/>` + circ(500, 428, 36, C.c300);
  s += `<g transform="rotate(10 740 760)">` + rect(660, 660, 150, 210, C.cr50) + circ(735, 690, 14, field) + rect(682, 740, 106, 12, C.c300, 6) + rect(682, 774, 80, 12, C.c300, 6) + `</g>`;
  return svg(field, s);
}
function mayorista(field = C.c300) {
  const box = (x, y, w, h, f, band) => rect(x, y, w, h, f) + rect(x, y + h * 0.38, w, h * 0.16, band) + rect(x + w * 0.62, y + h * 0.62, w * 0.28, h * 0.2, C.cr50);
  return svg(field, box(110, 820, 380, 270, C.k800, C.c500) + box(510, 820, 380, 270, C.k600, C.cr50) + box(310, 540, 380, 270, C.k950, C.c500) + box(410, 330, 180, 200, C.c500, C.k800) + rect(110, 1100, 780, 40, C.k800));
}
function granos(field = C.k800) {
  let s = ell(360, 560, 135, 330, C.c500, 18) + [-80, -40, 0, 40, 80].map((d) => `<path d="M${360 + d * 0.8} 260 Q${360 + d * 1.6} 560 ${360 + d * 0.8} 880" stroke="#A8723A" stroke-width="10" fill="none" transform="rotate(18 360 560)"/>`).join('');
  s += ell(690, 760, 125, 300, C.c500, -40) + ell(690, 760, 82, 250, C.cr100, -40);
  [[0, -150], [-30, -60], [30, -60], [-30, 30], [30, 30], [0, 120], [0, 0]].forEach(([dx, dy]) => (s += ell(690 + dx * 1.4 + dy * 0.64, 760 + dy * 1.4 - dx * 0.64, 30, 46, C.c300, -40)));
  [[250, 1020, 12], [380, 1060, -20], [520, 1040, 30], [640, 1070, 5], [770, 1030, -35], [450, 1130, 18]].forEach(([x, y, a]) => (s += ell(x, y, 40, 62, C.k600, a) + `<path d="M${x - 8} ${y - 40} Q${x + 14} ${y} ${x - 8} ${y + 40}" stroke="${C.k800}" stroke-width="7" fill="none" transform="rotate(${a} ${x} ${y})"/>`));
  return svg(field, s);
}
function tazon(field = C.sal2) {
  const r = rnd(3);
  let s = '';
  for (let i = 0; i < 46; i++) { const x = 270 + r() * 460, y = 520 + r() * 130; s += ell(x, y, 30, 46, i % 3 ? C.k600 : C.k800, r() * 180); }
  s += `<path d="M180 640 L820 640 A320 320 0 0 1 180 640 Z" fill="${C.k800}"/>` + rect(160, 610, 680, 50, C.cr50, 24) + `<g transform="rotate(32 700 400)">` + rect(660, 160, 44, 520, C.c500, 22) + ell(682, 200, 80, 120, C.c500) + `</g>`;
  return svg(field, s + ell(500, 1060, 260, 34, C.k800));
}
function postTrufas(field = C.c200) {
  const r = rnd(5);
  let s = circ(330, 480, 220, C.c500) + circ(330, 480, 180, C.cr100) + circ(330, 480, 150, C.c300);
  for (let i = 0; i < 26; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 130; s += ell(330 + Math.cos(a) * d, 480 + Math.sin(a) * d, 8, 12, C.k800, r() * 90); }
  [[640, 640], [780, 860], [520, 870]].forEach(([x, y]) => { s += circ(x, y, 100, C.k950) + circ(x - 30, y - 30, 26, C.k800); for (let i = 0; i < 10; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 90; s += circ(x + Math.cos(a) * d, y + Math.sin(a) * d, 4, C.k600); } });
  return svg(field, s + rect(120, 1060, 760, 36, C.k800));
}

function helado(field = C.c300) {
  return svg(field, `<polygon points="360,640 640,640 500,1100" fill="${C.c500}"/><path d="M400 700 L600 700 M430 790 L570 790 M460 880 L540 880" stroke="${C.k600}" stroke-width="10"/>` + circ(500, 560, 150, C.cr100) + circ(430, 470, 120, C.k600) + circ(570, 470, 120, C.cr50) + circ(500, 360, 100, C.k800) + circ(500, 255, 34, C.fr));
}
const out = 'public/art';
mkdirSync(out, { recursive: true });
const art = {
  bombones: bombones(), barra: barra(), trufas: trufas(), taza: taza(), cafe: taza(C.sal, C.k600, 'rosetón'), brownie: brownie(),
  mesa: mesa(), cacaopolvo: cacaopolvo(), nibs: nibs(), cajacorp: cajacorp(), mayorista: mayorista(), helado: helado(), granos: granos(),
  'cover-snacks': bombones(), 'cover-canasta': cacaopolvo(), 'cover-industrial': cajacorp(C.k800, C.k600, C.k950, C.c500),
  'post-taller': tazon(), 'post-trufas': postTrufas(), 'post-regalos': cajacorp(C.k600, C.cr50, C.cr100, C.c500),
};
for (const [name, s] of Object.entries(art)) {
  writeFileSync(`${out}/${name}.svg`, s);
  await sharp(Buffer.from(s)).webp({ quality: 88 }).toFile(`${out}/${name}.webp`);
}

// Imagen para compartir (Open Graph 1200x630)
const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630"><rect width="1200" height="630" fill="${C.k950}"/>
<ellipse cx="980" cy="315" rx="130" ry="210" transform="rotate(28 980 315)" fill="${C.c500}"/><path d="M930 130 C880 260 1060 380 1010 500" stroke="${C.k950}" stroke-width="16" fill="none"/>
<rect x="80" y="440" width="520" height="14" fill="${C.c500}"/>
<text x="80" y="290" font-family="Georgia, serif" font-size="120" fill="${C.cr100}">Chocolate Zurych</text>
<text x="80" y="370" font-family="Georgia, serif" font-size="40" fill="${C.c300}">Redescubre el chocolate</text></svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 88 }).toFile('public/og-image.jpg');
console.log('ilustraciones:', Object.keys(art).length);

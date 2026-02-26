/**
 * Generate BlackBelt app icons and splash screen.
 *
 * Design: dark background (#1a1a2e), stylised black-belt in white/gold,
 * "BB" monogram. Runs via `node scripts/generate-icons.mjs`.
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '../public');

// ── SVG template ─────────────────────────────────────────
function iconSvg(size) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.42;          // main circle radius
  const beltW = s * 0.52;      // belt width
  const beltH = s * 0.09;      // belt height
  const beltY = cy + s * 0.02; // belt vertical center
  const knotR = s * 0.055;     // knot circle
  const knotTailW = s * 0.06;
  const knotTailH = s * 0.16;
  const fontSize = s * 0.22;
  const textY = cy - s * 0.08;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0d0d1a"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="50%" stop-color="#DAA520"/>
      <stop offset="100%" stop-color="#B8860B"/>
    </linearGradient>
    <linearGradient id="belt" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="50%" stop-color="#1a1a1a"/>
      <stop offset="100%" stop-color="#2a2a2a"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="${s * 0.008}" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${s * 0.18}" fill="url(#bg)"/>

  <!-- Outer ring -->
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#gold)" stroke-width="${s * 0.015}" opacity="0.6"/>

  <!-- "BB" text -->
  <text x="${cx}" y="${textY}" text-anchor="middle" dominant-baseline="central"
        font-family="'Georgia','Times New Roman',serif" font-weight="bold"
        font-size="${fontSize}" fill="url(#gold)" filter="url(#glow)"
        letter-spacing="${s * 0.02}">BB</text>

  <!-- Belt -->
  <rect x="${cx - beltW / 2}" y="${beltY - beltH / 2}" width="${beltW}" height="${beltH}"
        rx="${beltH * 0.35}" fill="url(#belt)" stroke="#444" stroke-width="${s * 0.004}"/>

  <!-- Belt edge highlights -->
  <line x1="${cx - beltW / 2 + s * 0.02}" y1="${beltY - beltH / 2 + s * 0.01}"
        x2="${cx + beltW / 2 - s * 0.02}" y2="${beltY - beltH / 2 + s * 0.01}"
        stroke="#555" stroke-width="${s * 0.003}" stroke-linecap="round"/>

  <!-- Knot center -->
  <circle cx="${cx}" cy="${beltY}" r="${knotR}" fill="#1a1a1a" stroke="#444" stroke-width="${s * 0.004}"/>

  <!-- Knot tails (left) -->
  <rect x="${cx - knotTailW / 2 - s * 0.03}" y="${beltY + knotR * 0.5}"
        width="${knotTailW}" height="${knotTailH}" rx="${s * 0.01}"
        fill="url(#belt)" stroke="#444" stroke-width="${s * 0.003}"
        transform="rotate(-8, ${cx - s * 0.03}, ${beltY + knotR})"/>

  <!-- Knot tails (right) -->
  <rect x="${cx - knotTailW / 2 + s * 0.03}" y="${beltY + knotR * 0.5}"
        width="${knotTailW}" height="${knotTailH}" rx="${s * 0.01}"
        fill="url(#belt)" stroke="#444" stroke-width="${s * 0.003}"
        transform="rotate(8, ${cx + s * 0.03}, ${beltY + knotR})"/>

  <!-- "BLACK BELT" subtitle -->
  <text x="${cx}" y="${beltY + beltH / 2 + knotTailH + s * 0.04}" text-anchor="middle"
        font-family="'Helvetica Neue','Arial',sans-serif" font-weight="600"
        font-size="${s * 0.055}" fill="#FFFFFF" opacity="0.85"
        letter-spacing="${s * 0.025}">BLACKBELT</text>
</svg>`;
}

// ── Splash SVG (logo centered on dark bg) ────────────────
function splashSvg(w, h) {
  const logoSize = Math.min(w, h) * 0.3;
  const cx = w / 2;
  const cy = h / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#0d0d1a"/>
  <svg x="${cx - logoSize / 2}" y="${cy - logoSize / 2}" width="${logoSize}" height="${logoSize}">
    ${iconSvg(logoSize).replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
  </svg>
</svg>`;
}

// ── Generate all assets ──────────────────────────────────
async function main() {
  console.log('Generating BlackBelt icons...');

  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-1024.png', size: 1024 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const { name, size } of sizes) {
    const svg = Buffer.from(iconSvg(size));
    await sharp(svg).png().toFile(resolve(PUBLIC, name));
    console.log(`  ✓ ${name} (${size}x${size})`);
  }

  // Favicon 32x32
  const fav = Buffer.from(iconSvg(32));
  await sharp(fav).png().toFile(resolve(PUBLIC, 'favicon-32.png'));
  // ICO is just a renamed PNG for modern browsers
  await sharp(fav).png().toFile(resolve(PUBLIC, 'favicon.ico'));
  console.log('  ✓ favicon.ico (32x32)');

  // Splash 2732x2732
  const splash = Buffer.from(splashSvg(2732, 2732));
  await sharp(splash).png().toFile(resolve(PUBLIC, 'splash-2732x2732.png'));
  console.log('  ✓ splash-2732x2732.png');

  console.log('\nAll icons generated in public/');
}

main().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});

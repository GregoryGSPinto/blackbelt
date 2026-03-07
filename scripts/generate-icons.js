#!/usr/bin/env node
/**
 * BlackBelt — Generate App Icons
 * Gera ícones para iOS e Android em todas as resoluções necessárias
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const RESOURCES_DIR = path.join(__dirname, '..', 'resources');

// Configurações de ícones iOS
const IOS_ICONS = [
  { size: 20, idiom: 'iphone', scale: 2, name: 'Icon-App-20x20@2x' },
  { size: 20, idiom: 'iphone', scale: 3, name: 'Icon-App-20x20@3x' },
  { size: 29, idiom: 'iphone', scale: 2, name: 'Icon-App-29x29@2x' },
  { size: 29, idiom: 'iphone', scale: 3, name: 'Icon-App-29x29@3x' },
  { size: 40, idiom: 'iphone', scale: 2, name: 'Icon-App-40x40@2x' },
  { size: 40, idiom: 'iphone', scale: 3, name: 'Icon-App-40x40@3x' },
  { size: 60, idiom: 'iphone', scale: 2, name: 'Icon-App-60x60@2x' },
  { size: 60, idiom: 'iphone', scale: 3, name: 'Icon-App-60x60@3x' },
  { size: 20, idiom: 'ipad', scale: 1, name: 'Icon-App-20x20@1x' },
  { size: 20, idiom: 'ipad', scale: 2, name: 'Icon-App-20x20@2x' },
  { size: 29, idiom: 'ipad', scale: 1, name: 'Icon-App-29x29@1x' },
  { size: 29, idiom: 'ipad', scale: 2, name: 'Icon-App-29x29@2x' },
  { size: 40, idiom: 'ipad', scale: 1, name: 'Icon-App-40x40@1x' },
  { size: 40, idiom: 'ipad', scale: 2, name: 'Icon-App-40x40@2x' },
  { size: 76, idiom: 'ipad', scale: 1, name: 'Icon-App-76x76@1x' },
  { size: 76, idiom: 'ipad', scale: 2, name: 'Icon-App-76x76@2x' },
  { size: 83.5, idiom: 'ipad', scale: 2, name: 'Icon-App-83.5x83.5@2x' },
  { size: 1024, idiom: 'ios-marketing', scale: 1, name: 'ItunesArtwork@2x' },
];

// Configurações de ícones Android
const ANDROID_ICONS = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

// Gerar ícone base (1024x1024)
async function generateBaseIcon() {
  const size = 1024;
  const padding = size * 0.1;
  const iconSize = size - (padding * 2);
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#DC2626"/>
      <stop offset="100%" style="stop-color:#991B1B"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg)" rx="${size * 0.22}" filter="url(#shadow)"/>
  
  <!-- Belt Icon -->
  <g transform="translate(${padding}, ${padding})">
    <!-- Belt rectangle -->
    <rect x="${iconSize * 0.15}" y="${iconSize * 0.35}" width="${iconSize * 0.7}" height="${iconSize * 0.3}" 
          fill="#FFF" rx="${iconSize * 0.03}"/>
    <!-- Center knot -->
    <circle cx="${iconSize * 0.5}" cy="${iconSize * 0.5}" r="${iconSize * 0.12}" fill="#1a1a2e"/>
    <!-- Left fold -->
    <path d="M${iconSize * 0.15} ${iconSize * 0.35} L${iconSize * 0.08} ${iconSize * 0.15} L${iconSize * 0.25} ${iconSize * 0.35} Z" fill="#FFF"/>
    <!-- Right fold -->
    <path d="M${iconSize * 0.85} ${iconSize * 0.35} L${iconSize * 0.92} ${iconSize * 0.15} L${iconSize * 0.75} ${iconSize * 0.35} Z" fill="#FFF"/>
    <!-- Left tail -->
    <path d="M${iconSize * 0.2} ${iconSize * 0.65} L${iconSize * 0.15} ${iconSize * 0.9} L${iconSize * 0.3} ${iconSize * 0.65} Z" fill="#FFF"/>
    <!-- Right tail -->
    <path d="M${iconSize * 0.8} ${iconSize * 0.65} L${iconSize * 0.85} ${iconSize * 0.9} L${iconSize * 0.7} ${iconSize * 0.65} Z" fill="#FFF"/>
  </g>
</svg>`;

  return sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function generateIOSIcons(baseBuffer) {
  const iosDir = path.join(RESOURCES_DIR, 'ios', 'AppIcon.appiconset');
  fs.mkdirSync(iosDir, { recursive: true });

  console.log('🍎 Gerando ícones iOS...');

  const contents = {
    images: [],
    info: { version: 1, author: 'xcode' }
  };

  for (const icon of IOS_ICONS) {
    const pixelSize = Math.round(icon.size * icon.scale);
    const filename = `${icon.name}.png`;
    
    await sharp(baseBuffer)
      .resize(pixelSize, pixelSize)
      .png({ compressionLevel: 9 })
      .toFile(path.join(iosDir, filename));

    contents.images.push({
      size: `${icon.size}x${icon.size}`,
      idiom: icon.idiom,
      filename: filename,
      scale: `${icon.scale}x`
    });

    console.log(`  ✅ ${filename} (${pixelSize}x${pixelSize})`);
  }

  fs.writeFileSync(
    path.join(iosDir, 'Contents.json'),
    JSON.stringify(contents, null, 2)
  );

  console.log('');
}

async function generateAndroidIcons(baseBuffer) {
  const androidResDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
  
  console.log('🤖 Gerando ícones Android...');

  for (const icon of ANDROID_ICONS) {
    const dir = path.join(androidResDir, icon.dir);
    fs.mkdirSync(dir, { recursive: true });

    await sharp(baseBuffer)
      .resize(icon.size, icon.size)
      .png({ compressionLevel: 9 })
      .toFile(path.join(dir, 'ic_launcher.png'));

    // Foreground para adaptive icons
    await sharp(baseBuffer)
      .resize(icon.size, icon.size)
      .png({ compressionLevel: 9 })
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`  ✅ ${icon.dir} (${icon.size}x${icon.size})`);
  }

  // Background para adaptive icons
  const backgroundSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="108" height="108" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#DC2626"/>
</svg>`;

  const backgroundBuffer = await sharp(Buffer.from(backgroundSvg))
    .png()
    .toBuffer();

  for (const icon of ANDROID_ICONS) {
    const dir = path.join(androidResDir, icon.dir);
    await sharp(backgroundBuffer)
      .resize(icon.size, icon.size)
      .png({ compressionLevel: 9 })
      .toFile(path.join(dir, 'ic_launcher_background.png'));
  }

  console.log('');
}

async function generatePlayStoreIcon(baseBuffer) {
  const playStoreDir = path.join(RESOURCES_DIR, 'android');
  fs.mkdirSync(playStoreDir, { recursive: true });

  console.log('📱 Gerando ícone Google Play...');

  // Play Store (512x512)
  await sharp(baseBuffer)
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(playStoreDir, 'playstore-icon.png'));

  console.log('  ✅ playstore-icon.png (512x512)');

  // Feature Graphic (1024x500)
  const featureSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d0d1a"/>
      <stop offset="100%" style="stop-color:#1a1a2e"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#DC2626" text-anchor="middle">BLACKBELT</text>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="36" fill="#FFF" text-anchor="middle">Gestão Completa para Academias de Artes Marciais</text>
</svg>`;

  await sharp(Buffer.from(featureSvg))
    .png({ compressionLevel: 9 })
    .toFile(path.join(playStoreDir, 'feature-graphic.png'));

  console.log('  ✅ feature-graphic.png (1024x500)');
  console.log('');
}

async function main() {
  console.log('🥋 BlackBelt — Generating App Icons\n');

  // Gerar ícone base
  console.log('🎨 Gerando ícone base...');
  const baseBuffer = await generateBaseIcon();
  console.log('  ✅ Ícone base criado (1024x1024)\n');

  // Gerar ícones para cada plataforma
  await generateIOSIcons(baseBuffer);
  await generateAndroidIcons(baseBuffer);
  await generatePlayStoreIcon(baseBuffer);

  // Salvar ícone base
  fs.writeFileSync(path.join(RESOURCES_DIR, 'icon.png'), baseBuffer);

  console.log('═'.repeat(60));
  console.log('🎉 Ícones gerados com sucesso!');
  console.log('');
  console.log('Arquivos criados:');
  console.log('  • resources/ios/AppIcon.appiconset/ (18 ícones)');
  console.log('  • android/app/src/main/res/mipmap-*/');
  console.log('  • resources/android/playstore-icon.png');
  console.log('  • resources/android/feature-graphic.png');
  console.log('  • resources/icon.png');
  console.log('═'.repeat(60));
}

main().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});

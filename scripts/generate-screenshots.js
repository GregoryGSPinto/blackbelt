#!/usr/bin/env node
/**
 * BlackBelt — Generate Placeholder Screenshots for Stores
 *
 * Gera screenshots profissionais usando Sharp para:
 * - App Store (iOS): iPhone 6.7", 6.5", iPad 12.9"
 * - Google Play (Android): Phone, Tablet
 *
 * Usage: node scripts/generate-screenshots.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configurações de dispositivos
const DEVICES = {
  'appstore/iphone-67': { width: 1290, height: 2796, name: 'iPhone 15 Pro Max' },
  'appstore/iphone-65': { width: 1284, height: 2778, name: 'iPhone 14 Pro Max' },
  'appstore/ipad-129': { width: 2048, height: 2732, name: 'iPad Pro 12.9"' },
  'playstore/phone': { width: 1080, height: 1920, name: 'Android Phone' },
  'playstore/tablet-7': { width: 1200, height: 1920, name: 'Android 7" Tablet' },
  'playstore/tablet-10': { width: 1600, height: 2560, name: 'Android 10" Tablet' },
};

// Screens a serem geradas (sem emojis, usando ícones SVG)
const SCREENS = [
  {
    id: '01-login',
    title: 'Login Seguro',
    subtitle: 'Acesso rapido e seguro a sua academia',
    gradient: ['#0d0d1a', '#1a1a2e'],
    iconSvg: `<circle cx="70" cy="70" r="40" fill="none" stroke="#DC2626" stroke-width="4"/><path d="M70 50v25l15 8" fill="none" stroke="#DC2626" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    id: '02-dashboard',
    title: 'Dashboard Adulto',
    subtitle: 'Acompanhe seu progresso e conquistas',
    gradient: ['#1a1a2e', '#16213e'],
    iconSvg: `<rect x="30" y="50" width="25" height="60" rx="4" fill="#DC2626"/><rect x="65" y="35" width="25" height="75" rx="4" fill="#e94560" opacity="0.8"/><rect x="100" y="55" width="25" height="55" rx="4" fill="#DC2626" opacity="0.6"/>`,
  },
  {
    id: '03-checkin',
    title: 'Check-in QR',
    subtitle: 'Presenca rapida com QR Code',
    gradient: ['#16213e', '#0f3460'],
    iconSvg: `<rect x="35" y="35" width="40" height="40" fill="none" stroke="#DC2626" stroke-width="4"/><rect x="75" y="75" width="40" height="40" fill="none" stroke="#DC2626" stroke-width="4"/><rect x="45" y="45" width="20" height="20" fill="#DC2626"/>`,
  },
  {
    id: '04-kids',
    title: 'Modo Kids',
    subtitle: 'Interface divertida para criancas',
    gradient: ['#e94560', '#ff6b6b'],
    iconSvg: `<circle cx="60" cy="60" r="25" fill="#FFD93D"/><circle cx="50" cy="55" r="4" fill="#333"/><circle cx="70" cy="55" r="4" fill="#333"/><path d="M50 75q10 10 20 0" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/><circle cx="95" cy="85" r="20" fill="#6BCB77"/>`,
  },
  {
    id: '05-teen',
    title: 'Perfil Teen',
    subtitle: 'Autonomia com acompanhamento dos pais',
    gradient: ['#533483', '#7b2cbf'],
    iconSvg: `<path d="M50 40l30-15 30 15v50l-30 15-30-15z" fill="none" stroke="#DC2626" stroke-width="3"/><path d="M50 40l30 15 30-15M80 55v50" stroke="#DC2626" stroke-width="3" fill="none"/>`,
  },
  {
    id: '06-shop',
    title: 'Loja Integrada',
    subtitle: 'Equipamentos e acessorios',
    gradient: ['#0f3460', '#16a085'],
    iconSvg: `<path d="M40 45h10l5 40h50l5-40h10" fill="none" stroke="#DC2626" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="65" cy="105" r="8" fill="none" stroke="#DC2626" stroke-width="3"/><circle cx="105" cy="105" r="8" fill="none" stroke="#DC2626" stroke-width="3"/>`,
  },
  {
    id: '07-admin',
    title: 'Admin Dashboard',
    subtitle: 'Gestao completa da academia',
    gradient: ['#1a1a2e', '#e94560'],
    iconSvg: `<circle cx="60" cy="60" r="30" fill="none" stroke="#DC2626" stroke-width="4"/><circle cx="110" cy="60" r="20" fill="none" stroke="#DC2626" stroke-width="4" opacity="0.7"/><circle cx="150" cy="60" r="12" fill="none" stroke="#DC2626" stroke-width="4" opacity="0.4"/>`,
  },
  {
    id: '08-professor',
    title: 'Area do Professor',
    subtitle: 'Turmas, chamadas e avaliacoes',
    gradient: ['#16a085', '#27ae60'],
    iconSvg: `<path d="M50 40h80v80H50z" fill="none" stroke="#DC2626" stroke-width="4" rx="5"/><line x1="70" y1="40" x2="70" y2="120" stroke="#DC2626" stroke-width="3"/><line x1="50" y1="70" x2="130" y2="70" stroke="#DC2626" stroke-width="3"/>`,
  },
];

// Cores do tema BlackBelt
const COLORS = {
  primary: '#DC2626',
  secondary: '#0d0d1a',
  accent: '#e94560',
  text: '#ffffff',
  textSecondary: '#b8b8b8',
};

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

async function generateScreenImage(width, height, screen, deviceName) {
  const [color1, color2] = screen.gradient;
  const iconSize = Math.min(width, height) * 0.15;
  const iconX = (width - iconSize) / 2;
  const iconY = height * 0.32;
  
  // Criar SVG com o design
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${color1}"/>
      <stop offset="100%" style="stop-color:${color2}"/>
    </linearGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.1)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0.05)"/>
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg)"/>
  
  <!-- Decorative circles -->
  <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${width * 0.3}" fill="rgba(233,69,96,0.1)"/>
  <circle cx="${width * 0.2}" cy="${height * 0.8}" r="${width * 0.25}" fill="rgba(220,38,38,0.08)"/>
  
  <!-- Status bar area (iOS style) -->
  <rect x="0" y="0" width="100%" height="${Math.floor(height * 0.04)}" fill="rgba(0,0,0,0.2)"/>
  
  <!-- Main card -->
  <rect x="${width * 0.08}" y="${height * 0.22}" width="${width * 0.84}" height="${height * 0.50}" 
        rx="${width * 0.04}" fill="url(#card)" filter="url(#shadow)" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
  
  <!-- Icon -->
  <g transform="translate(${iconX}, ${iconY}) scale(${iconSize / 140})">
    ${screen.iconSvg}
  </g>
  
  <!-- Title -->
  <text x="50%" y="${height * 0.62}" font-family="Arial, Helvetica, sans-serif" font-size="${width * 0.055}" 
        font-weight="bold" fill="${COLORS.text}" text-anchor="middle">${escapeXml(screen.title)}</text>
  
  <!-- Subtitle -->
  <text x="50%" y="${height * 0.68}" font-family="Arial, Helvetica, sans-serif" font-size="${width * 0.032}" 
        fill="${COLORS.textSecondary}" text-anchor="middle">${escapeXml(screen.subtitle)}</text>
  
  <!-- BlackBelt logo area -->
  <text x="50%" y="${height * 0.14}" font-family="Arial, Helvetica, sans-serif" font-size="${width * 0.045}" 
        font-weight="bold" fill="${COLORS.primary}" text-anchor="middle">BLACKBELT</text>
  
  <!-- Bottom device info -->
  <text x="50%" y="${height * 0.88}" font-family="Arial, Helvetica, sans-serif" font-size="${width * 0.025}" 
        fill="${COLORS.textSecondary}" text-anchor="middle">${escapeXml(deviceName)}</text>
  
  <!-- Home indicator (iOS style) -->
  <rect x="${width * 0.35}" y="${height * 0.96}" width="${width * 0.3}" height="${Math.max(4, height * 0.008)}" 
        rx="${Math.max(2, height * 0.004)}" fill="rgba(255,255,255,0.5)"/>
</svg>`;

  return sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function main() {
  console.log('🥋 BlackBelt — Generating Store Screenshots\n');

  const baseDir = path.join(__dirname, '..', 'store', 'screenshots');
  
  // Garantir que o diretório base existe
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  let totalGenerated = 0;

  for (const [deviceDir, device] of Object.entries(DEVICES)) {
    console.log(`📱 ${device.name} (${device.width}×${device.height})`);
    
    const devicePath = path.join(baseDir, deviceDir);
    if (!fs.existsSync(devicePath)) {
      fs.mkdirSync(devicePath, { recursive: true });
    }

    for (const screen of SCREENS) {
      const filePath = path.join(devicePath, `${screen.id}.png`);
      
      try {
        const buffer = await generateScreenImage(device.width, device.height, screen, device.name);
        fs.writeFileSync(filePath, buffer);
        console.log(`   ✅ ${screen.id}.png`);
        totalGenerated++;
      } catch (err) {
        console.error(`   ❌ ${screen.id}.png: ${err.message}`);
      }
    }
    console.log('');
  }

  // Criar arquivo de resumo
  const summaryPath = path.join(baseDir, 'GENERATED.md');
  const summary = `# Screenshots Gerados Automaticamente

**Data:** ${new Date().toISOString().split('T')[0]}
**Total:** ${totalGenerated} imagens

## Dispositivos

${Object.entries(DEVICES).map(([dir, d]) => `- **${d.name}**: ${d.width}×${d.height} px (${dir})`).join('\n')}

## Telas

${SCREENS.map(s => `- **${s.id}**: ${s.title}`).join('\n')}

## Nota

Estas sao imagens placeholder geradas automaticamente.
Para producao, substituir por screenshots reais do app usando:

\`\`\`bash
# Opção 1: Captura automatica (requer Puppeteer)
bash scripts/capture-screenshots.sh auto

# Opção 2: Captura manual
# Rodar o app, abrir DevTools em cada resolucao, exportar PNG
\`\`\`
`;
  fs.writeFileSync(summaryPath, summary);

  console.log('═'.repeat(60));
  console.log(`🎉 ${totalGenerated} screenshots gerados com sucesso!`);
  console.log(`📁 Local: ${baseDir}`);
  console.log('═'.repeat(60));
}

main().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});

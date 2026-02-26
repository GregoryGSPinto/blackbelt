#!/usr/bin/env bash

# ════════════════════════════════════════════════════════════
# BLACKBELT — Store Screenshot Capture Guide
#
# Cria estrutura de diretórios e gera screenshots via Puppeteer.
# Se Puppeteer não estiver disponível, cria estrutura para captura manual.
#
# Uso:
#   bash scripts/capture-screenshots.sh          # Cria estrutura
#   bash scripts/capture-screenshots.sh auto     # Captura automática (Puppeteer)
# ════════════════════════════════════════════════════════════

set -euo pipefail

G='\033[0;32m'; B='\033[0;34m'; Y='\033[0;33m'; NC='\033[0m'
log() { echo -e "${B}[SCREENSHOT]${NC} $1"; }
ok()  { echo -e "${G}  ✓${NC} $1"; }

# ── Criar estrutura de diretórios ──
log "Criando estrutura de diretórios..."

mkdir -p screenshots/appstore/{iphone-67,iphone-65,ipad-129}
mkdir -p screenshots/playstore/{phone,tablet}

ok "screenshots/appstore/iphone-67/   (1290 × 2796 px — iPhone 15 Pro Max)"
ok "screenshots/appstore/iphone-65/   (1284 × 2778 px — iPhone 14 Pro Max)"
ok "screenshots/appstore/ipad-129/    (2048 × 2732 px — iPad Pro 12.9\")"
ok "screenshots/playstore/phone/      (1080 × 1920 px mínimo)"
ok "screenshots/playstore/tablet/     (1200 × 1920 px)"

# ── Telas para capturar (em ordem de prioridade) ──
cat > screenshots/README.md << 'EOF'
# Screenshots para Stores — BlackBelt

## Resoluções Obrigatórias

### Apple App Store
| Device           | Resolução     | Diretório         |
|-----------------|---------------|-------------------|
| iPhone 6.7"     | 1290 × 2796   | appstore/iphone-67 |
| iPhone 6.5"     | 1284 × 2778   | appstore/iphone-65 |
| iPad Pro 12.9"  | 2048 × 2732   | appstore/ipad-129  |

### Google Play Store
| Device      | Resolução mín.  | Diretório        |
|------------|-----------------|------------------|
| Phone      | 1080 × 1920    | playstore/phone   |
| Tablet 7"  | 1200 × 1920    | playstore/tablet  |

## Telas para Capturar (mínimo 6, máximo 10)

| #  | Tela                | URL                | Descrição                                      |
|----|---------------------|--------------------|-------------------------------------------------|
| 01 | Home                | /inicio            | Carrossel de vídeos com cinematic background     |
| 02 | Player              | /sessões/1           | PremiumPlayer com vídeo de BlackBelt                   |
| 03 | Sessões               | /sessões             | Grid de sessões com categorias                     |
| 04 | Meu BlackBelt         | /meu-blackbelt       | Progresso do aluno (niveis, conquistas)            |
| 05 | Kids                | /kids-inicio       | Interface infantil colorida com mascote          |
| 06 | Shop                | /shop              | Produtos (uniformes) com cards premium             |
| 07 | Séries              | /series            | Séries de vídeo estilo Netflix                   |
| 08 | Check-in            | /checkin-financeiro | Check-in de presença e financeiro                |
| 09 | Professor Dashboard | /professor-dashboard| Dashboard do instrutor                          |
| 10 | Admin Dashboard     | /dashboard         | Dashboard administrativo                         |

## Processo Manual

1. Rodar app: `pnpm dev`
2. Abrir Chrome DevTools → Device Mode
3. Configurar resolução exata por device
4. Navegar para cada URL
5. Exportar PNG sem compressão
6. Nomear: `01-home.png`, `02-player.png`, etc.

## Dicas para Aprovação

- Apple: screenshots devem ser do app real (não mockups)
- Apple: não incluir status bar do iPhone no screenshot
- Google: mínimo 2 screenshots, recomendado 4-8
- Ambas: screenshots devem representar funcionalidades reais
- Não incluir informação sensível (emails reais, CPFs)
- Usar dados mock (já configurados no app)
EOF

ok "screenshots/README.md criado"

# ── Gerar script Puppeteer (se disponível) ──
if [[ "${1:-}" == "auto" ]]; then
  log "Gerando script Puppeteer para captura automática..."

  cat > screenshots/capture.mjs << 'PUPPETEER'
import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const DEVICES = {
  'appstore/iphone-67': { width: 1290, height: 2796, deviceScaleFactor: 3 },
  'appstore/iphone-65': { width: 1284, height: 2778, deviceScaleFactor: 3 },
  'appstore/ipad-129':  { width: 2048, height: 2732, deviceScaleFactor: 2 },
  'playstore/phone':    { width: 1440, height: 3120, deviceScaleFactor: 3 },
  'playstore/tablet':   { width: 1200, height: 1920, deviceScaleFactor: 2 },
};

const SCREENS = [
  { name: '01-home',      url: '/inicio' },
  { name: '02-player',    url: '/sessões/1' },
  { name: '03-sessões',     url: '/sessões' },
  { name: '04-meu-blackbelt', url: '/meu-blackbelt' },
  { name: '05-kids',      url: '/kids-inicio' },
  { name: '06-shop',      url: '/shop' },
];

async function capture() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Login first (mock mode auto-logs in)
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(2000);

  for (const [dir, viewport] of Object.entries(DEVICES)) {
    await page.setViewport(viewport);
    console.log(`\n📱 Device: ${dir} (${viewport.width}×${viewport.height})`);

    for (const screen of SCREENS) {
      mkdirSync(`screenshots/${dir}`, { recursive: true });
      await page.goto(`${BASE_URL}${screen.url}`, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(1500); // Wait for animations

      const path = `screenshots/${dir}/${screen.name}.png`;
      await page.screenshot({ path, fullPage: false });
      console.log(`  ✓ ${path}`);
    }
  }

  await browser.close();
  console.log('\n✅ Screenshots capturados com sucesso!');
}

capture().catch(console.error);
PUPPETEER

  ok "screenshots/capture.mjs criado"
  echo ""
  echo "  Executar:"
  echo "    pnpm add puppeteer --save-dev"
  echo "    pnpm dev &"
  echo "    node screenshots/capture.mjs"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Estrutura de screenshots pronta!                       ║"
echo "║                                                         ║"
echo "║  Captura manual: ver screenshots/README.md              ║"
echo "║  Captura auto:   bash scripts/capture-screenshots.sh auto║"
echo "╚══════════════════════════════════════════════════════════╝"

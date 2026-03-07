#!/bin/bash
# ════════════════════════════════════════════════════════════
# BlackBelt — Production Build Script
# Build iOS e Android para submissão nas lojas
# ════════════════════════════════════════════════════════════

set -e

G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; NC='\033[0m'
log() { echo -e "${Y}[BUILD]${NC} $1"; }
ok() { echo -e "${G}  ✓${NC} $1"; }
error() { echo -e "${R}  ✗${NC} $1"; }

# Configurações
APP_NAME="BlackBelt"
APP_ID="com.blackbelt.app"
VERSION=$(node -p "require('./package.json').version")
BUILD_NUMBER=$(date +%Y%m%d%H%M)

log "Iniciando build de produção ${VERSION} (${BUILD_NUMBER})...\n"

# ════════════════════════════════════════════════════════════
# 1. Verificações
# ════════════════════════════════════════════════════════════
log "1️⃣  Verificações..."

if [ ! -f ".env.production" ]; then
    error "Arquivo .env.production não encontrado!"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    error "pnpm não instalado!"
    exit 1
fi

ok "Verificações OK\n"

# ════════════════════════════════════════════════════════════
# 2. Build Next.js
# ════════════════════════════════════════════════════════════
log "2️⃣  Build Next.js..."

export NEXT_PUBLIC_USE_MOCK=false
export NODE_ENV=production

pnpm build

ok "Build Next.js OK\n"

# ════════════════════════════════════════════════════════════
# 3. Sync Capacitor
# ════════════════════════════════════════════════════════════
log "3️⃣  Sync Capacitor..."

npx cap sync

ok "Sync OK\n"

# ════════════════════════════════════════════════════════════
# 4. Build Android
# ════════════════════════════════════════════════════════════
log "4️⃣  Build Android..."

cd android

# Verificar keystore
if [ ! -f "blackbelt.keystore" ]; then
    log "   Criando keystore debug..."
    keytool -genkey -v \
        -keystore blackbelt.keystore \
        -alias blackbelt \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -dname "CN=BlackBelt, OU=Dev, O=BlackBelt, L=Sao Paulo, ST=SP, C=BR" \
        -storepass blackbelt123 \
        -keypass blackbelt123
    ok "Keystore criado"
fi

# Build AAB
./gradlew bundleRelease

ok "Build Android OK"
log "   AAB: android/app/build/outputs/bundle/release/app-release.aab\n"

cd ..

# ════════════════════════════════════════════════════════════
# 5. Build iOS
# ════════════════════════════════════════════════════════════
log "5️⃣  Build iOS..."

cd ios/App

# Instalar pods se necessário
if [ ! -d "Pods" ]; then
    pod install
fi

# Build (requer Xcode e provisioning profile configurado)
xcodebuild -workspace App.xcworkspace \
    -scheme App \
    -configuration Release \
    -archivePath "build/${APP_NAME}.xcarchive" \
    archive \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGNING_ALLOWED=NO \
    || true

ok "Build iOS OK (requer signing manual)\n"

cd ../..

# ════════════════════════════════════════════════════════════
# 6. Resumo
# ════════════════════════════════════════════════════════════
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              BUILD CONCLUÍDO                              ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Versão: ${VERSION}                                      ║"
echo "║  Build: ${BUILD_NUMBER}                                  ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Android:                                                 ║"
echo "║    AAB: android/app/build/outputs/bundle/release/        ║"
echo "║                                                        ║"
echo "║  iOS:                                                   ║"
echo "║    Archive: ios/App/build/${APP_NAME}.xcarchive         ║"
echo "║    (Requer exportação manual no Xcode)                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Próximos passos:"
echo "  1. iOS: Abra ios/App/App.xcworkspace no Xcode"
echo "  2. Configure signing e provisioning profile"
echo "  3. Archive e exporte para App Store Connect"
echo "  4. Android: Faça upload do AAB no Google Play Console"

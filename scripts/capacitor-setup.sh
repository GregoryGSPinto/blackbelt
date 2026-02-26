#!/usr/bin/env bash

# ════════════════════════════════════════════════════════════
# BLACKBELT — Capacitor Setup & Build
#
# Instala Capacitor, gera build estático e prepara iOS/Android.
#
# Uso:
#   bash scripts/capacitor-setup.sh          # Setup completo
#   bash scripts/capacitor-setup.sh ios      # Apenas iOS
#   bash scripts/capacitor-setup.sh android  # Apenas Android
#   bash scripts/capacitor-setup.sh sync     # Apenas sync (pós-build)
# ════════════════════════════════════════════════════════════

set -euo pipefail

R='\033[0;31m'; G='\033[0;32m'; Y='\033[0;33m'; B='\033[0;34m'; NC='\033[0m'
log() { echo -e "${B}[CAP]${NC} $1"; }
ok()  { echo -e "${G}  ✓${NC} $1"; }
err() { echo -e "${R}  ✗${NC} $1"; }

TARGET="${1:-all}"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║    BLACKBELT — Capacitor Setup                        ║"
echo "║    Target: $TARGET"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Install Capacitor ──
if [[ "$TARGET" == "all" || "$TARGET" == "setup" ]]; then
  log "Instalando Capacitor..."

  pnpm add @capacitor/core @capacitor/cli --save
  ok "@capacitor/core + @capacitor/cli"

  pnpm add @capacitor/ios @capacitor/android --save
  ok "@capacitor/ios + @capacitor/android"

  pnpm add @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard --save
  ok "Plugins: splash-screen, status-bar, keyboard"

  # Init (skip se já existe capacitor.config.ts)
  if [[ ! -f "capacitor.config.ts" ]]; then
    npx cap init "BlackBelt" "com.blackbelt.app" --web-dir=out
    ok "Capacitor inicializado"
  else
    ok "capacitor.config.ts já existe"
  fi
fi

# ── Step 2: Build estático ──
if [[ "$TARGET" != "sync" ]]; then
  log "Gerando build estático (next build → /out)..."

  pnpm build
  ok "Build estático gerado em /out"

  # Verificar
  if [[ -d "out" ]]; then
    FILE_COUNT=$(find out -type f | wc -l)
    SIZE=$(du -sh out | cut -f1)
    ok "  $FILE_COUNT arquivos, $SIZE"
  else
    err "Diretório /out não encontrado"
    exit 1
  fi
fi

# ── Step 3: iOS ──
if [[ "$TARGET" == "all" || "$TARGET" == "ios" ]]; then
  log "Configurando iOS..."

  if [[ ! -d "ios" ]]; then
    npx cap add ios
    ok "Plataforma iOS adicionada"
  else
    ok "Plataforma iOS já existe"
  fi

  npx cap sync ios
  ok "Sync iOS concluído"

  # Info.plist updates
  PLIST="ios/App/App/Info.plist"
  if [[ -f "$PLIST" ]]; then
    # Camera usage
    if ! grep -q "NSCameraUsageDescription" "$PLIST"; then
      sed -i '' '/<\/dict>/i\
  <key>NSCameraUsageDescription</key>\
  <string>BlackBelt usa a câmera para foto de perfil</string>\
  <key>ITSAppUsesNonExemptEncryption</key>\
  <false/>' "$PLIST" 2>/dev/null || true
      ok "Info.plist atualizado (câmera + encryption declaration)"
    else
      ok "Info.plist já configurado"
    fi
  fi

  # Privacy Manifest (obrigatório iOS 17+)
  PRIVACY_SRC="resources/PrivacyInfo.xcprivacy"
  PRIVACY_DST="ios/App/App/PrivacyInfo.xcprivacy"
  if [[ -f "$PRIVACY_SRC" && ! -f "$PRIVACY_DST" ]]; then
    cp "$PRIVACY_SRC" "$PRIVACY_DST"
    ok "PrivacyInfo.xcprivacy copiado para projeto iOS"
    log "⚠️  IMPORTANTE: Abra o Xcode e adicione PrivacyInfo.xcprivacy ao target 'App'"
  elif [[ -f "$PRIVACY_DST" ]]; then
    ok "PrivacyInfo.xcprivacy já existe no projeto"
  else
    err "PrivacyInfo.xcprivacy não encontrado em resources/"
  fi

  # Splash Screen (copiar para Xcode assets se disponível)
  if [[ -f "resources/splash.png" ]]; then
    ok "Splash screen disponível em resources/splash.png"
    log "→ Configure no Xcode: Assets.xcassets → LaunchImage ou use Storyboard"
  fi

  echo ""
  echo -e "${G}  iOS pronto!${NC}"
  echo "  Próximos passos:"
  echo "    1. npx cap open ios"
  echo "    2. Xcode → Signing & Capabilities → selecionar team"
  echo "    3. Product → Archive → Distribute (TestFlight)"
  echo ""
fi

# ── Step 4: Android ──
if [[ "$TARGET" == "all" || "$TARGET" == "android" ]]; then
  log "Configurando Android..."

  if [[ ! -d "android" ]]; then
    npx cap add android
    ok "Plataforma Android adicionada"
  else
    ok "Plataforma Android já existe"
  fi

  npx cap sync android
  ok "Sync Android concluído"

  # AndroidManifest.xml: ensure HTTPS only
  MANIFEST="android/app/src/main/AndroidManifest.xml"
  if [[ -f "$MANIFEST" ]]; then
    if ! grep -q "usesCleartextTraffic" "$MANIFEST"; then
      sed -i 's/<application/<application android:usesCleartextTraffic="false"/' "$MANIFEST" 2>/dev/null || true
      ok "AndroidManifest.xml: HTTPS only"
    fi
  fi

  # build.gradle: update target SDK
  GRADLE="android/app/build.gradle"
  if [[ -f "$GRADLE" ]]; then
    sed -i 's/targetSdkVersion [0-9]*/targetSdkVersion 34/' "$GRADLE" 2>/dev/null || true
    sed -i 's/compileSdkVersion [0-9]*/compileSdkVersion 34/' "$GRADLE" 2>/dev/null || true
    ok "build.gradle: targetSdkVersion 34, compileSdkVersion 34"
  fi

  echo ""
  echo -e "${G}  Android pronto!${NC}"
  echo "  Próximos passos:"
  echo "    1. npx cap open android"
  echo "    2. Build → Generate Signed Bundle (AAB)"
  echo "    3. Play Console → Internal Testing → Upload AAB"
  echo ""
  echo "  Para gerar AAB via CLI:"
  echo "    cd android && ./gradlew bundleRelease"
  echo "    # Output: android/app/build/outputs/bundle/release/app-release.aab"
  echo ""
fi

# ── Step 5: Sync only ──
if [[ "$TARGET" == "sync" ]]; then
  log "Sincronizando web → native..."
  npx cap sync
  ok "Sync completo"
fi

# ── Summary ──
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Setup concluído!                                       ║"
echo "║                                                         ║"
echo "║  npx cap open ios       → Xcode                        ║"
echo "║  npx cap open android   → Android Studio                ║"
echo "║  npx cap sync           → Re-sync após alterações       ║"
echo "╚══════════════════════════════════════════════════════════╝"

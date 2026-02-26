#!/usr/bin/env bash

# ════════════════════════════════════════════════════════════
# BLACKBELT — Copy Splash + Icons to Android Drawable Folders
#
# Executar APÓS `npx cap add android`:
#   bash scripts/android-assets.sh
# ════════════════════════════════════════════════════════════

set -euo pipefail

G='\033[0;32m'; Y='\033[0;33m'; NC='\033[0m'
ok()  { echo -e "${G}  ✓${NC} $1"; }
log() { echo -e "${Y}[ASSETS]${NC} $1"; }

ANDROID="android/app/src/main/res"

if [[ ! -d "$ANDROID" ]]; then
  echo "❌ Diretório android/ não encontrado. Execute primeiro:"
  echo "   bash scripts/capacitor-setup.sh android"
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Copiando splash + icon assets para Android              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Splash Screen ──
log "Copiando splash screens..."

# Android splash: precisa estar em drawable-*
for density in "drawable-land-hdpi" "drawable-land-mdpi" "drawable-land-xhdpi" "drawable-land-xxhdpi" "drawable-land-xxxhdpi"; do
  mkdir -p "$ANDROID/$density"
  cp resources/splash-android-landscape.png "$ANDROID/$density/splash.png" 2>/dev/null || true
done

for density in "drawable-port-hdpi" "drawable-port-mdpi" "drawable-port-xhdpi" "drawable-port-xxhdpi" "drawable-port-xxxhdpi"; do
  mkdir -p "$ANDROID/$density"
  cp resources/splash-android-portrait.png "$ANDROID/$density/splash.png" 2>/dev/null || true
done

ok "Splash screens copiados para todas as densidades"

# ── Adaptive Icon ──
log "Copiando adaptive icon..."

# Mipmap folders for adaptive icon
for density in "mipmap-hdpi" "mipmap-mdpi" "mipmap-xhdpi" "mipmap-xxhdpi" "mipmap-xxxhdpi"; do
  mkdir -p "$ANDROID/$density"
done

# Copy foreground/background
cp resources/icon-foreground.png "$ANDROID/mipmap-xxxhdpi/ic_launcher_foreground.png"
cp resources/icon-background.png "$ANDROID/mipmap-xxxhdpi/ic_launcher_background.png"
ok "Adaptive icon foreground + background copiados"

# ── ic_launcher XML (adaptive icon definition) ──
MIPMAP_ANYDPI="$ANDROID/mipmap-anydpi-v26"
mkdir -p "$MIPMAP_ANYDPI"

cat > "$MIPMAP_ANYDPI/ic_launcher.xml" << 'XML'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
XML

cat > "$MIPMAP_ANYDPI/ic_launcher_round.xml" << 'XML'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
XML

ok "ic_launcher.xml + ic_launcher_round.xml criados"

echo ""
echo -e "${G}✅ Assets Android prontos!${NC}"
echo ""

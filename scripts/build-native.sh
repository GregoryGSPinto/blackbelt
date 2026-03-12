#!/bin/bash
set -e

echo "=== BlackBelt Native Build Script ==="
echo ""

# ─── Pre-requisites check ───
check_prereqs() {
  local missing=0

  if ! command -v node &>/dev/null; then
    echo "ERROR: Node.js not found. Install from https://nodejs.org"
    missing=1
  fi

  if ! command -v npx &>/dev/null; then
    echo "ERROR: npx not found. Install Node.js"
    missing=1
  fi

  if [[ "$1" == "ios" || "$1" == "all" ]]; then
    if ! command -v xcodebuild &>/dev/null; then
      echo "ERROR: Xcode not found. Install from Mac App Store"
      missing=1
    fi
    if ! xcodebuild -version &>/dev/null 2>&1; then
      echo "ERROR: Xcode command line tools not configured. Run: xcode-select --install"
      missing=1
    fi
  fi

  if [[ "$1" == "android" || "$1" == "all" ]]; then
    if [ -z "$ANDROID_HOME" ]; then
      echo "ERROR: ANDROID_HOME not set. Install Android Studio and set ANDROID_HOME"
      missing=1
    fi
    if [ ! -f "android/app/signing.properties" ] && [ ! -f "android/keystore.properties" ]; then
      echo "WARNING: No signing config found. Release build may fail without signing keys"
    fi
  fi

  if [ $missing -eq 1 ]; then
    echo ""
    echo "Fix the issues above and re-run."
    exit 1
  fi

  echo "Pre-requisites OK"
}

# ─── Build Web ───
build_web() {
echo ""
echo "--- Building mobile shell and validating the hosted web app ---"
pnpm run build:mobile
echo "Mobile build complete"
}

# ─── Capacitor Sync ───
cap_sync() {
  echo ""
  echo "--- Syncing Capacitor ---"
  npx cap sync
  echo "Capacitor sync complete"
}

# ─── iOS Build ───
build_ios() {
  echo ""
  echo "--- Building iOS ---"
  cd ios/App

  xcodebuild -workspace App.xcworkspace \
    -scheme App \
    -configuration Release \
    -archivePath build/BlackBelt.xcarchive \
    archive \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    CODE_SIGNING_ALLOWED=NO

  echo "iOS archive created at: ios/App/build/BlackBelt.xcarchive"
  cd ../..
}

# ─── Android Build ───
build_android() {
  echo ""
  echo "--- Building Android ---"
  cd android

  if [ -f "gradlew" ]; then
    chmod +x gradlew
    ./gradlew assembleRelease
  else
    echo "ERROR: gradlew not found in android/"
    cd ..
    exit 1
  fi

  echo "Android APK created at: android/app/build/outputs/apk/release/"
  cd ..
}

# ─── Main ───
PLATFORM="${1:-all}"

echo "Platform: $PLATFORM"
echo ""

check_prereqs "$PLATFORM"
build_web
cap_sync

case "$PLATFORM" in
  ios)
    build_ios
    ;;
  android)
    build_android
    ;;
  all)
    build_ios
    build_android
    ;;
  *)
    echo "Usage: $0 [ios|android|all]"
    exit 1
    ;;
esac

echo ""
echo "=== Build complete ==="

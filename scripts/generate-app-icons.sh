#!/bin/bash
# ============================================================
# Generate App Store Icons & Splash Screens
# ============================================================
# Requires: ImageMagick (brew install imagemagick)
# Source: public/icon-1024.png
# ============================================================

set -e

SOURCE="public/icon-1024.png"
if [ ! -f "$SOURCE" ]; then
  echo "Error: $SOURCE not found"
  exit 1
fi

# Check for ImageMagick
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
  echo "Error: ImageMagick not installed. Run: brew install imagemagick"
  exit 1
fi

CONVERT_CMD="magick"
if ! command -v magick &> /dev/null; then
  CONVERT_CMD="convert"
fi

echo "Generating iOS icons..."

IOS_ICONS="ios/App/App/Assets.xcassets/AppIcon.appiconset"
mkdir -p "$IOS_ICONS"

# iOS icon sizes (points × scale)
declare -a IOS_SIZES=(
  "20x20@1x:20"
  "20x20@2x:40"
  "20x20@3x:60"
  "29x29@1x:29"
  "29x29@2x:58"
  "29x29@3x:87"
  "40x40@1x:40"
  "40x40@2x:80"
  "40x40@3x:120"
  "60x60@2x:120"
  "60x60@3x:180"
  "76x76@1x:76"
  "76x76@2x:152"
  "83.5x83.5@2x:167"
  "1024x1024@1x:1024"
)

for entry in "${IOS_SIZES[@]}"; do
  name="${entry%%:*}"
  size="${entry##*:}"
  $CONVERT_CMD "$SOURCE" -resize "${size}x${size}" "$IOS_ICONS/icon-${name}.png"
done

# Generate Contents.json for iOS
cat > "$IOS_ICONS/Contents.json" << 'CONTENTS'
{
  "images": [
    { "size": "20x20", "idiom": "iphone", "filename": "icon-20x20@2x.png", "scale": "2x" },
    { "size": "20x20", "idiom": "iphone", "filename": "icon-20x20@3x.png", "scale": "3x" },
    { "size": "29x29", "idiom": "iphone", "filename": "icon-29x29@2x.png", "scale": "2x" },
    { "size": "29x29", "idiom": "iphone", "filename": "icon-29x29@3x.png", "scale": "3x" },
    { "size": "40x40", "idiom": "iphone", "filename": "icon-40x40@2x.png", "scale": "2x" },
    { "size": "40x40", "idiom": "iphone", "filename": "icon-40x40@3x.png", "scale": "3x" },
    { "size": "60x60", "idiom": "iphone", "filename": "icon-60x60@2x.png", "scale": "2x" },
    { "size": "60x60", "idiom": "iphone", "filename": "icon-60x60@3x.png", "scale": "3x" },
    { "size": "20x20", "idiom": "ipad", "filename": "icon-20x20@1x.png", "scale": "1x" },
    { "size": "20x20", "idiom": "ipad", "filename": "icon-20x20@2x.png", "scale": "2x" },
    { "size": "29x29", "idiom": "ipad", "filename": "icon-29x29@1x.png", "scale": "1x" },
    { "size": "29x29", "idiom": "ipad", "filename": "icon-29x29@2x.png", "scale": "2x" },
    { "size": "40x40", "idiom": "ipad", "filename": "icon-40x40@1x.png", "scale": "1x" },
    { "size": "40x40", "idiom": "ipad", "filename": "icon-40x40@2x.png", "scale": "2x" },
    { "size": "76x76", "idiom": "ipad", "filename": "icon-76x76@1x.png", "scale": "1x" },
    { "size": "76x76", "idiom": "ipad", "filename": "icon-76x76@2x.png", "scale": "2x" },
    { "size": "83.5x83.5", "idiom": "ipad", "filename": "icon-83.5x83.5@2x.png", "scale": "2x" },
    { "size": "1024x1024", "idiom": "ios-marketing", "filename": "icon-1024x1024@1x.png", "scale": "1x" }
  ],
  "info": { "version": 1, "author": "generate-app-icons.sh" }
}
CONTENTS

echo "Generating Android icons..."

ANDROID_RES="android/app/src/main/res"

declare -A ANDROID_SIZES=(
  ["mipmap-mdpi"]=48
  ["mipmap-hdpi"]=72
  ["mipmap-xhdpi"]=96
  ["mipmap-xxhdpi"]=144
  ["mipmap-xxxhdpi"]=192
)

for dir in "${!ANDROID_SIZES[@]}"; do
  size=${ANDROID_SIZES[$dir]}
  mkdir -p "$ANDROID_RES/$dir"
  $CONVERT_CMD "$SOURCE" -resize "${size}x${size}" "$ANDROID_RES/$dir/ic_launcher.png"
  # Round icon (with circle mask)
  $CONVERT_CMD "$SOURCE" -resize "${size}x${size}" \
    \( +clone -threshold 100% -fill white -draw "circle $((size/2)),$((size/2)) $((size/2)),0" \) \
    -channel-fx '| gray=>alpha' -compose multiply -composite \
    "$ANDROID_RES/$dir/ic_launcher_round.png" 2>/dev/null || \
    cp "$ANDROID_RES/$dir/ic_launcher.png" "$ANDROID_RES/$dir/ic_launcher_round.png"
done

echo "Generating splash screens..."

SPLASH_DIR="public/splash"
mkdir -p "$SPLASH_DIR"

BG_COLOR="#0d0d1a"

# iPhone splash screens
declare -A SPLASH_SIZES=(
  ["Default@2x~iphone"]="750x1334"
  ["Default-568h@2x~iphone"]="750x1334"
  ["Default-667h"]="750x1334"
  ["Default-736h"]="1242x2208"
  ["Default-Portrait@2x~ipad"]="1536x2048"
  ["Default-Portrait~ipad"]="768x1024"
  ["Default-Landscape@2x~ipad"]="2048x1536"
  ["iPhone_6.5"]="1242x2688"
  ["iPhone_5.5"]="1242x2208"
  ["Android_splash"]="1080x1920"
)

for name in "${!SPLASH_SIZES[@]}"; do
  dims=${SPLASH_SIZES[$name]}
  w="${dims%x*}"
  h="${dims#*x}"
  icon_size=$((w < h ? w/3 : h/3))

  $CONVERT_CMD -size "${w}x${h}" "xc:${BG_COLOR}" \
    \( "$SOURCE" -resize "${icon_size}x${icon_size}" \) \
    -gravity center -composite \
    "$SPLASH_DIR/${name}.png" 2>/dev/null || echo "  Skipped $name (ImageMagick issue)"
done

echo "Done! Generated:"
echo "  - iOS icons in $IOS_ICONS"
echo "  - Android icons in $ANDROID_RES"
echo "  - Splash screens in $SPLASH_DIR"

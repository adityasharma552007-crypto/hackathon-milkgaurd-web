#!/bin/bash

# =============================================================================
# MilkGuard APK Setup Script
# =============================================================================
# Run this script after building the Android APK to set up the download page.
# =============================================================================

set -e

PROJECT_ROOT="/media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web"
APK_SOURCE="$PROJECT_ROOT/../android/app/build/outputs/apk/release/app-release.apk"
APK_DEST="$PROJECT_ROOT/public/downloads/MilkGuard.apk"
VERSION_JSON="$PROJECT_ROOT/public/downloads/version.json"

echo "============================================"
echo "  MilkGuard APK Setup Script"
echo "============================================"
echo ""

# Step 1: Create downloads directory
echo "[1/5] Creating downloads directory..."
mkdir -p "$PROJECT_ROOT/public/downloads"
echo "      ✓ Directory created"

# Step 2: Check if APK exists at source
echo ""
echo "[2/5] Looking for APK file..."
if [ -f "$APK_SOURCE" ]; then
    echo "      ✓ Found APK at: $APK_SOURCE"
    echo "      Copying to: $APK_DEST"
    cp "$APK_SOURCE" "$APK_DEST"
    chmod 644 "$APK_DEST"
    echo "      ✓ APK copied successfully"
else
    # Try alternative paths
    ALT_PATHS=(
        "$PROJECT_ROOT/android/app/build/outputs/apk/release/app-release.apk"
        "$HOME/Downloads/app-release.apk"
        "$HOME/Downloads/MilkGuard.apk"
        "$PROJECT_ROOT/MilkGuard.apk"
    )

    FOUND=false
    for path in "${ALT_PATHS[@]}"; do
        if [ -f "$path" ]; then
            echo "      ✓ Found APK at: $path"
            echo "      Copying to: $APK_DEST"
            cp "$path" "$APK_DEST"
            chmod 644 "$APK_DEST"
            FOUND=true
            break
        fi
    done

    if [ "$FOUND" = false ]; then
        echo "      ⚠ APK not found in expected locations"
        echo ""
        echo "      Please either:"
        echo "      1. Build APK: cd android && ./gradlew assembleRelease"
        echo "      2. Copy your APK manually to: $APK_DEST"
        echo ""

        # Create placeholder for testing
        echo "      Creating placeholder file for testing..."
        echo "PLACEHOLDER - Replace with actual APK" > "$APK_DEST"
        echo "      ⚠ Placeholder created (replace with real APK)"
    fi
fi

# Step 3: Get APK metadata
echo ""
echo "[3/5] Getting APK metadata..."
if [ -f "$APK_DEST" ] && [ "$APK_DEST" != *".txt" ]; then
    APK_SIZE_HUMAN=$(du -h "$APK_DEST" | cut -f1)
    APK_SIZE_BYTES=$(stat -c%s "$APK_DEST" 2>/dev/null || stat -f%z "$APK_DEST" 2>/dev/null || echo "0")
    echo "      Size: $APK_SIZE_HUMAN ($APK_SIZE_BYTES bytes)"

    # Update version.json with actual size
    if command -v jq &> /dev/null && [ -f "$VERSION_JSON" ]; then
        jq --arg size "$APK_SIZE_HUMAN" --argjson bytes "$APK_SIZE_BYTES" \
           '.size = $size | .sizeBytes = $bytes' "$VERSION_JSON" > "${VERSION_JSON}.tmp"
        mv "${VERSION_JSON}.tmp" "$VERSION_JSON"
        echo "      ✓ version.json updated"
    fi
else
    echo "      ⚠ Skipping metadata (placeholder file)"
fi

# Step 4: Verify version.json
echo ""
echo "[4/5] Verifying version.json..."
if [ -f "$VERSION_JSON" ]; then
    if command -v jq &> /dev/null; then
        if jq empty "$VERSION_JSON" 2>/dev/null; then
            echo "      ✓ Valid JSON"
            jq -r '"      Version: \(.version) | Build: \(.buildDate)"' "$VERSION_JSON"
        else
            echo "      ✗ Invalid JSON - please fix manually"
        fi
    else
        echo "      ✓ File exists (jq not available for validation)"
    fi
else
    echo "      ✗ version.json not found"
fi

# Step 5: Summary
echo ""
echo "[5/5] Setup Summary"
echo "============================================"
echo ""
echo "Files created/updated:"
echo "  - $APK_DEST"
echo "  - $VERSION_JSON"
echo ""
echo "Next steps:"
echo "  1. Run verification: ./scripts/verify-apk.sh"
echo "  2. If APK is a placeholder, replace it with the real APK"
echo "  3. Commit changes: git add . && git commit -m 'feat: Add APK download'"
echo "  4. Push to deploy: git push origin main"
echo ""

# Test curl commands
echo "After deployment, test with:"
echo "  curl -I https://milkguard.vercel.app/downloads/MilkGuard.apk"
echo "  curl -s https://milkguard.vercel.app/downloads/version.json | jq"
echo ""

echo "============================================"
echo "  Setup Complete!"
echo "============================================"

#!/bin/bash

# =============================================================================
# MilkGuard APK Verification Script
# =============================================================================
# This script verifies:
# 1. APK file exists and is readable
# 2. version.json is valid JSON
# 3. File paths are correct
# 4. APK MIME type is correct
# 5. Reports overall status
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web"
APK_SOURCE="$PROJECT_ROOT/android/app/build/outputs/apk/release/app-release.apk"
APK_DEST="$PROJECT_ROOT/public/downloads/MilkGuard.apk"
VERSION_JSON="$PROJECT_ROOT/public/downloads/version.json"

echo "============================================"
echo "  MilkGuard APK Verification Script"
echo "============================================"
echo ""

# Track overall status
OVERALL_STATUS=0

# =============================================================================
# Check 1: Verify APK source file exists
# =============================================================================
echo -e "${BLUE}[1/6]${NC} Checking APK source file..."
if [ -f "$APK_SOURCE" ]; then
    echo -e "  ${GREEN}✓${NC} APK source exists at: $APK_SOURCE"
    APK_SIZE=$(du -h "$APK_SOURCE" | cut -f1)
    echo "  Size: $APK_SIZE"
else
    echo -e "  ${YELLOW}!${NC} APK source not found at: $APK_SOURCE"
    echo "  ${YELLOW}!${NC} Please build the APK first: ./gradlew assembleRelease"
    OVERALL_STATUS=1
fi

# =============================================================================
# Check 2: Verify downloads directory exists
# =============================================================================
echo ""
echo -e "${BLUE}[2/6]${NC} Checking downloads directory..."
DOWNLOADS_DIR="$PROJECT_ROOT/public/downloads"
if [ -d "$DOWNLOADS_DIR" ]; then
    echo -e "  ${GREEN}✓${NC} Downloads directory exists: $DOWNLOADS_DIR"
else
    echo -e "  ${RED}✗${NC} Downloads directory not found"
    echo "  Creating directory..."
    mkdir -p "$DOWNLOADS_DIR"
    echo -e "  ${GREEN}✓${NC} Directory created"
fi

# =============================================================================
# Check 3: Verify APK destination file
# =============================================================================
echo ""
echo -e "${BLUE}[3/6]${NC} Checking APK destination file..."
if [ -f "$APK_DEST" ]; then
    echo -e "  ${GREEN}✓${NC} APK exists at: $APK_DEST"
    APK_SIZE=$(du -h "$APK_DEST" | cut -f1)
    echo "  Size: $APK_SIZE"

    # Check if readable
    if [ -r "$APK_DEST" ]; then
        echo -e "  ${GREEN}✓${NC} File is readable"
    else
        echo -e "  ${RED}✗${NC} File is not readable"
        OVERALL_STATUS=1
    fi
else
    echo -e "  ${YELLOW}!${NC} APK not found at destination: $APK_DEST"
    if [ -f "$APK_SOURCE" ]; then
        echo "  Copying from source..."
        cp "$APK_SOURCE" "$APK_DEST"
        echo -e "  ${GREEN}✓${NC} APK copied successfully"
    else
        echo "  ${YELLOW}!${NC} Create a placeholder or build the APK first"
        OVERALL_STATUS=1
    fi
fi

# =============================================================================
# Check 4: Verify version.json
# =============================================================================
echo ""
echo -e "${BLUE}[4/6]${NC} Checking version.json..."
if [ -f "$VERSION_JSON" ]; then
    echo -e "  ${GREEN}✓${NC} version.json exists"

    # Validate JSON
    if command -v jq &> /dev/null; then
        if jq empty "$VERSION_JSON" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} Valid JSON format"

            # Extract and display metadata
            VERSION=$(jq -r '.version' "$VERSION_JSON")
            BUILD_DATE=$(jq -r '.buildDate' "$VERSION_JSON")
            FILENAME=$(jq -r '.filename' "$VERSION_JSON")
            SIZE=$(jq -r '.size' "$VERSION_JSON")

            echo "  Version: $VERSION"
            echo "  Build Date: $BUILD_DATE"
            echo "  Filename: $FILENAME"
            echo "  Size: $SIZE"
        else
            echo -e "  ${RED}✗${NC} Invalid JSON format"
            OVERALL_STATUS=1
        fi
    elif command -v python3 &> /dev/null; then
        if python3 -c "import json; json.load(open('$VERSION_JSON'))" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} Valid JSON format (verified with Python)"
        else
            echo -e "  ${RED}✗${NC} Invalid JSON format"
            OVERALL_STATUS=1
        fi
    else
        echo -e "  ${YELLOW}!${NC} Cannot validate JSON (jq/python3 not available)"
    fi
else
    echo -e "  ${RED}✗${NC} version.json not found"
    OVERALL_STATUS=1
fi

# =============================================================================
# Check 5: Verify MIME type
# =============================================================================
echo ""
echo -e "${BLUE}[5/6]${NC} Checking APK MIME type..."
if [ -f "$APK_DEST" ]; then
    if command -v file &> /dev/null; then
        MIME_TYPE=$(file -b --mime-type "$APK_DEST")
        echo "  Detected MIME type: $MIME_TYPE"

        if [ "$MIME_TYPE" = "application/vnd.android.package-archive" ] || [ "$MIME_TYPE" = "application/zip" ]; then
            echo -e "  ${GREEN}✓${NC} MIME type is valid for APK"
        else
            echo -e "  ${YELLOW}!${NC} Unexpected MIME type (expected application/vnd.android.package-archive)"
        fi
    else
        echo -e "  ${YELLOW}!${NC} 'file' command not available, skipping MIME check"
    fi
fi

# =============================================================================
# Check 6: Verify file permissions
# =============================================================================
echo ""
echo -e "${BLUE}[6/6]${NC} Checking file permissions..."
if [ -f "$APK_DEST" ]; then
    PERMISSIONS=$(ls -l "$APK_DEST" | awk '{print $1}')
    echo "  Permissions: $PERMISSIONS"

    # Check if world-readable
    if [[ "$PERMISSIONS" == *r* ]]; then
        echo -e "  ${GREEN}✓${NC} File is readable"
    else
        echo -e "  ${YELLOW}!${NC} File may not be publicly readable"
    fi
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "============================================"
echo "  Verification Summary"
echo "============================================"

if [ $OVERALL_STATUS -eq 0 ]; then
    echo -e "  ${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "  Next steps:"
    echo "  1. Commit changes: git add . && git commit -m 'feat: Add APK download'"
    echo "  2. Push to deploy: git push origin main"
    echo "  3. Test download: curl -I https://your-domain.com/downloads/MilkGuard.apk"
else
    echo -e "  ${RED}✗ Some checks failed${NC}"
    echo ""
    echo "  Required actions:"
    if [ ! -f "$APK_SOURCE" ]; then
        echo "  - Build APK: cd android && ./gradlew assembleRelease"
    fi
    if [ ! -f "$APK_DEST" ]; then
        echo "  - Copy APK to: public/downloads/MilkGuard.apk"
    fi
    if [ ! -f "$VERSION_JSON" ]; then
        echo "  - Create version.json in public/downloads/"
    fi
fi

echo ""
exit $OVERALL_STATUS

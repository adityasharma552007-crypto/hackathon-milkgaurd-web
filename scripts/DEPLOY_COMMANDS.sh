#!/bin/bash

# =============================================================================
# MilkGuard - Complete Deployment Commands
# =============================================================================
# Copy and paste these commands to deploy the APK download page.
# =============================================================================

# -----------------------------------------------------------------------------
# STEP 1: Build the Android APK
# -----------------------------------------------------------------------------
echo "=== STEP 1: Build Android APK ==="

# Navigate to Android project
cd /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/android

# Build release APK
./gradlew assembleRelease

# Verify APK was created
ls -la app/build/outputs/apk/release/app-release.apk

# -----------------------------------------------------------------------------
# STEP 2: Copy APK to Web Project
# -----------------------------------------------------------------------------
echo "=== STEP 2: Copy APK to Web Project ==="

# Create downloads directory
mkdir -p /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web/public/downloads

# Copy APK
cp /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/android/app/build/outputs/apk/release/app-release.apk \
   /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web/public/downloads/MilkGuard.apk

# Set permissions
chmod 644 /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web/public/downloads/MilkGuard.apk

# -----------------------------------------------------------------------------
# STEP 3: Update version.json with actual APK size
# -----------------------------------------------------------------------------
echo "=== STEP 3: Update version.json ==="

cd /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web

# Get APK size in bytes
APK_SIZE_BYTES=$(stat -c%s public/downloads/MilkGuard.apk)

# Get human-readable size
APK_SIZE_HUMAN=$(du -h public/downloads/MilkGuard.apk | cut -f1)

# Update version.json (requires jq)
jq --arg size "$APK_SIZE_HUMAN" \
   --argjson bytes "$APK_SIZE_BYTES" \
   '.size = $size | .sizeBytes = $bytes' \
   public/downloads/version.json > public/downloads/version.json.tmp && \
mv public/downloads/version.json.tmp public/downloads/version.json

# Verify JSON is valid
jq . public/downloads/version.json

# -----------------------------------------------------------------------------
# STEP 4: Run Verification
# -----------------------------------------------------------------------------
echo "=== STEP 4: Run Verification ==="

./scripts/verify-apk.sh

# -----------------------------------------------------------------------------
# STEP 5: Git Commit and Push
# -----------------------------------------------------------------------------
echo "=== STEP 5: Git Commit and Push ==="

cd /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web

# Stage all changes
git add .

# Commit with message
git commit -m "feat: Add Android APK download page

- Download page component with progress tracking
- version.json with build metadata
- Installation instructions and troubleshooting
- Footer and landing page download links
- Vercel configuration for APK headers
- Verification and setup scripts"

# Push to main branch
git push origin main

# -----------------------------------------------------------------------------
# STEP 6: Test Deployment (After Vercel deploys)
# -----------------------------------------------------------------------------
echo "=== STEP 6: Test Deployment ==="

# Wait for Vercel deployment to complete, then test:

# Test version.json endpoint
curl -s https://milkguard.vercel.app/downloads/version.json | jq

# Test APK download headers
curl -I https://milkguard.vercel.app/downloads/MilkGuard.apk

# Expected headers:
# Content-Type: application/vnd.android.package-archive
# Content-Disposition: attachment; filename="MilkGuard.apk"
# Cache-Control: public, max-age=3600

# Download and verify file integrity
curl -L -o /tmp/test-milkguard.apk https://milkguard.vercel.app/downloads/MilkGuard.apk
file /tmp/test-milkguard.apk

# Compare file sizes
ls -la /tmp/test-milkguard.apk
ls -la public/downloads/MilkGuard.apk

# -----------------------------------------------------------------------------
# STEP 7: Mobile Testing
# -----------------------------------------------------------------------------
echo "=== STEP 7: Mobile Testing ==="

# On your Android device:
# 1. Open browser and navigate to: https://milkguard.vercel.app/download
# 2. Click "Download APK"
# 3. Accept the download when prompted
# 4. Open the downloaded file
# 5. Install the app (may need to enable Unknown Sources)
# 6. Launch MilkGuard and verify it works

# -----------------------------------------------------------------------------
# STEP 8: Verify Download Page
# -----------------------------------------------------------------------------
echo "=== STEP 8: Verify Download Page ==="

# Open in browser:
# https://milkguard.vercel.app/download

# Check that:
# [ ] Page loads correctly
# [ ] Version info displays correctly
# [ ] Download button works
# [ ] Progress bar shows during download
# [ ] Changelog section expands/collapses
# [ ] Installation steps are visible
# [ ] Troubleshooting section works
# [ ] Support link is functional

# -----------------------------------------------------------------------------
# QUICK ONE-LINERS FOR TESTING
# -----------------------------------------------------------------------------

# Quick test - version.json
curl -s https://milkguard.vercel.app/downloads/version.json | jq '.version,.size'

# Quick test - APK headers
curl -sI https://milkguard.vercel.app/downloads/MilkGuard.apk | grep -E "Content-Type|Content-Disposition"

# Quick test - Download and verify
curl -L -s https://milkguard.vercel.app/downloads/MilkGuard.apk | head -c 4 | xxd

# Should output: 50 4b 03 04 (ZIP file signature - APKs are ZIP files)

# -----------------------------------------------------------------------------
# ROLLBACK (If something goes wrong)
# -----------------------------------------------------------------------------
echo "=== ROLLBACK Commands (if needed) ==="

# Revert last commit
git revert HEAD

# Or reset to previous state
git reset --hard HEAD~1

# Remove download files
rm -rf public/downloads/MilkGuard.apk
rm -rf src/app/download
rm -rf src/components/download

# Revert vercel.json changes (get previous version from git)
git checkout HEAD~1 -- vercel.json

# =============================================================================
# END OF DEPLOYMENT SCRIPT
# =============================================================================

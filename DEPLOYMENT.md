# MilkGuard APK Deployment Guide

Complete guide for deploying the MilkGuard Android APK download page.

---

## Quick Start Checklist

- [ ] APK built and placed at `public/downloads/MilkGuard.apk`
- [ ] `version.json` configured with correct metadata
- [ ] Verification script passes all checks
- [ ] Git commit created
- [ ] Pushed to main branch
- [ ] Vercel deployment complete
- [ ] Download page tested on desktop and mobile

---

## Step 1: Build and Copy APK

### Option A: Build from source
```bash
cd /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### Option B: Copy existing APK
```bash
# Create destination directory
mkdir -p /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web/public/downloads

# Copy APK
cp /path/to/your/app-release.apk /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web/public/downloads/MilkGuard.apk

# Verify file is readable
chmod 644 /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web/public/downloads/MilkGuard.apk
```

---

## Step 2: Update version.json

Edit `/media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web/public/downloads/version.json`:

```bash
# Get APK file size
du -h public/downloads/MilkGuard.apk

# Get file size in bytes (for sizeBytes field)
stat -c%s public/downloads/MilkGuard.apk
```

Update these fields:
- `version`: Your app version (e.g., "1.0.0")
- `versionCode`: Integer version code
- `buildDate`: ISO 8601 format (e.g., "2026-04-13T12:00:00Z")
- `size`: Human-readable size (e.g., "24.5 MB")
- `sizeBytes`: Exact byte count
- `changelog`: Array of new features/fixes

---

## Step 3: Run Verification Script

```bash
cd /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web
./scripts/verify-apk.sh
```

Expected output: All checks pass with green checkmarks.

---

## Step 4: Git Commit and Push

```bash
cd /media/aditya-sharma/4E8C0ED58C0EB80B/MilkGaurd/web

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add Android APK download page

- Download page component with progress tracking
- version.json with build metadata
- Installation instructions and troubleshooting
- Footer and landing page download links"

# Push to main branch
git push origin main
```

---

## Step 5: Monitor Vercel Deployment

1. Go to https://vercel.com/dashboard
2. Find your MilkGuard project
3. Watch the deployment progress
4. Wait for "Ready" status

---

## Step 6: Testing

### Test version.json
```bash
curl -s https://milkguard.vercel.app/downloads/version.json | jq
```

### Test APK download
```bash
# Check headers
curl -I https://milkguard.vercel.app/downloads/MilkGuard.apk

# Download and verify
curl -L -o /tmp/test-milkguard.apk https://milkguard.vercel.app/downloads/MilkGuard.apk
file /tmp/test-milkguard.apk
```

Expected headers:
```
Content-Type: application/vnd.android.package-archive
Content-Disposition: attachment; filename="MilkGuard.apk"
Cache-Control: public, max-age=3600
```

### Manual Testing Checklist

- [ ] Navigate to `/download` page
- [ ] Page loads with correct version info
- [ ] Download button works
- [ ] Progress bar shows during download
- [ ] APK file downloads successfully
- [ ] Installation instructions are visible
- [ ] Troubleshooting section expands/collapses
- [ ] Support link works

### Mobile Testing

1. Open `/download` on Android device
2. Tap Download button
3. Accept download in browser
4. Open downloaded APK
5. Install (may need to enable "Unknown Sources")
6. Launch app and verify it works

---

## Step 7: Post-Deployment

### Update LinkedIn

Copy the post template from the "LinkedIn Post Template" section below.

### Update README

Add the "Android App Installation" section to your project README.

---

## Troubleshooting

### APK not downloading
- Check Vercel function logs for errors
- Verify file exists in `public/downloads/`
- Check browser console for CORS errors

### version.json not loading
- Ensure JSON is valid: `jq empty public/downloads/version.json`
- Check file permissions: `ls -la public/downloads/`
- Verify path is correct in DownloadAPK.tsx

### Vercel build fails
- Check Node.js version compatibility
- Verify all imports are correct
- Review build logs in Vercel dashboard

---

## File Structure

```
web/
├── public/
│   └── downloads/
│       ├── MilkGuard.apk      # The Android APK
│       └── version.json       # Build metadata
├── src/
│   ├── app/
│   │   ├── download/
│   │   │   └── page.tsx       # Download page route
│   │   └── LandingClient.tsx  # Updated with download button
│   └── components/
│       └── download/
│           └── DownloadAPK.tsx # Main download component
├── scripts/
│   └── verify-apk.sh          # Verification script
└── vercel.json                # Updated with APK headers
```

---

## Environment Variables

Ensure these are set in Vercel:

```
NEXT_PUBLIC_SITE_URL=https://milkguard.vercel.app
```

---

## Support

For issues, contact: support@milkguard.app

# MilkGuard PWA Deployment & Architecture Guide

Complete guide for deploying and validating the MilkGuard Progressive Web App (PWA).

---

## Architecture Overview

MilkGuard has transitioned completely from a legacy APK approach to a modern, cross-platform Progressive Web App (PWA):

1. **Standalone App Shell**: Launches in full-screen standalone mode without browser UI Chrome.
2. **Offline Resilience**: Dedicated `/offline` fallback page cached during installation via `public/sw.js`.
3. **Data Security**: Sensitive paths (`/scan`, `/history`, `/reports`, `/profile`, `/api/*`, and Supabase/OAuth endpoints) strictly bypass caching to prevent exposure of authenticated data.
4. **Hardware Connectivity**: Web Bluetooth Low Energy (BLE) operates natively within Chromium-based PWA environments without native wrapper plugins.
5. **Maskable Icons**: Adaptive icons formatted for Android adaptive launchers and iOS home screens.

---

## Deployment Checklist

- [x] Manifest valid at `/manifest.json` with standalone display and maskable icons.
- [x] Service worker registered at `/sw.js` with root scope (`/`).
- [x] Dynamic and sensitive routes bypass service worker caching.
- [x] Vercel cache-control headers configured (`no-cache` for `/sw.js`, short revalidation for `/manifest.json`).
- [x] Dedicated PWA installation guide available at `/download`.
- [x] Install buttons dynamically adapt to standalone state, native install prompts, and iOS manual flows.

---

## Verification & Testing

### 1. Build Verification
```bash
npm run build
```

### 2. Service Worker & Manifest
- Open DevTools → Application → Manifest.
- Verify Name, Short Name, Start URL (`/`), Display (`standalone`), and Icons (192x192 & 512x512).
- Inspect Service Workers tab to confirm active registration of `sw.js`.

### 3. Lighthouse PWA Audit
- Run Chrome DevTools Lighthouse audit under the **PWA** category.
- Verify installability and offline fallback.

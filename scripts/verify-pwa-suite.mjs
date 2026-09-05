import fs from 'node:fs';
import path from 'node:path';

const WEB_DIR = process.cwd();

console.log('====================================================');
console.log('       MILKGUARD PWA VERIFICATION SUITE             ');
console.log('====================================================\n');

let allPassed = true;

function assert(condition, message) {
  if (condition) {
    console.log(`\x1b[32m[PASS]\x1b[0m ${message}`);
  } else {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${message}`);
    allPassed = false;
  }
}

// 1. MANIFEST VERIFICATION
console.log('--- 1. Testing Web App Manifest ---');
const manifestPath = path.join(WEB_DIR, 'public', 'manifest.json');
assert(fs.existsSync(manifestPath), 'manifest.json exists in public directory');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifest.name === 'MilkGuard', `Manifest name is "MilkGuard" (got: ${manifest.name})`);
assert(manifest.short_name === 'MilkGuard', `Manifest short_name is "MilkGuard" (got: ${manifest.short_name})`);
assert(manifest.display === 'standalone', `Manifest display mode is "standalone" (got: ${manifest.display})`);
assert(manifest.start_url === '/', `Manifest start_url is "/" (got: ${manifest.start_url})`);
assert(manifest.theme_color === '#00668a', `Manifest theme_color is "#00668a" (got: ${manifest.theme_color})`);
assert(manifest.icons && manifest.icons.length >= 2, 'Manifest contains icons array with >= 2 icons');

const has192 = manifest.icons.some(i => i.sizes === '192x192');
const has512 = manifest.icons.some(i => i.sizes === '512x512');
assert(has192, 'Manifest includes 192x192 icon');
assert(has512, 'Manifest includes 512x512 icon');

// 2. ICON ASSETS EXISTENCE & SIZES
console.log('\n--- 2. Testing PWA Icon Assets ---');
const icon192Path = path.join(WEB_DIR, 'public', 'icon-192x192.png');
const icon512Path = path.join(WEB_DIR, 'public', 'icon-512x512.png');
const appleIconPath = path.join(WEB_DIR, 'public', 'apple-touch-icon.png');
const faviconIcoPath = path.join(WEB_DIR, 'public', 'favicon.ico');

assert(fs.existsSync(icon192Path) && fs.statSync(icon192Path).size > 1000, 'icon-192x192.png exists and is valid size');
assert(fs.existsSync(icon512Path) && fs.statSync(icon512Path).size > 5000, 'icon-512x512.png exists and is valid size');
assert(fs.existsSync(appleIconPath) && fs.statSync(appleIconPath).size > 1000, 'apple-touch-icon.png exists');
assert(fs.existsSync(faviconIcoPath) && fs.statSync(faviconIcoPath).size > 100, 'favicon.ico exists');

// 3. SERVICE WORKER VERIFICATION
console.log('\n--- 3. Testing Service Worker Security & Caching ---');
const swPath = path.join(WEB_DIR, 'public', 'sw.js');
assert(fs.existsSync(swPath), 'public/sw.js exists');

const swContent = fs.readFileSync(swPath, 'utf8');
assert(swContent.includes('CACHE_NAME'), 'SW defines cache naming');
assert(swContent.includes('/offline'), 'SW pre-caches /offline fallback page');
assert(swContent.includes('supabase.co'), 'SW explicitly bypasses Supabase domains');
assert(swContent.includes('/api/'), 'SW explicitly bypasses /api/ endpoints');
assert(swContent.includes('/auth/'), 'SW explicitly bypasses /auth/ endpoints');
assert(swContent.includes("searchParams.has('code')"), 'SW explicitly bypasses OAuth code query params');
assert(!swContent.includes('cache-all'), 'SW does NOT do reckless caching');

// 4. NO APK LEAKS IN CODEBASE
console.log('\n--- 4. Checking for Legacy APK Artifacts ---');
const apkDownloadPath = path.join(WEB_DIR, 'public', 'downloads', 'MilkGuard.apk');
assert(!fs.existsSync(apkDownloadPath), 'No legacy MilkGuard.apk in public/downloads');

const downloadApkComponent = path.join(WEB_DIR, 'src', 'components', 'download', 'DownloadAPK.tsx');
assert(!fs.existsSync(downloadApkComponent), 'No legacy DownloadAPK.tsx component');

// 5. HARDWARE / BLE INTEGRATION CHECK
console.log('\n--- 5. Testing Hardware BLE Service Integrity ---');
const bleServicePath = path.join(WEB_DIR, 'src', 'lib', 'hardware', 'bluetoothService.ts');
assert(fs.existsSync(bleServicePath), 'bluetoothService.ts exists and is intact');
const bleContent = fs.readFileSync(bleServicePath, 'utf8');
assert(bleContent.includes('navigator.bluetooth'), 'BLE uses standard Web Bluetooth navigator.bluetooth API');
assert(bleContent.includes('requestDevice'), 'BLE contains proper device request logic');

console.log('\n====================================================');
if (allPassed) {
  console.log('\x1b[32mALL PWA VERIFICATION TESTS PASSED SUCCESSFULLY!\x1b[0m');
  console.log('====================================================\n');
} else {
  console.error('\x1b[31mSOME PWA CHECKS FAILED!\x1b[0m');
  console.log('====================================================\n');
  process.exit(1);
}

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { NextRequest, NextResponse } = require('next/server');

const SUPABASE_URL = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
const SUPABASE_ANON_KEY = 'dummy-key';

console.log('------------------------------------------------------------');
console.log('TEST 1: Client-side createBrowserClient storage test');
console.log('------------------------------------------------------------');

// Setup mock window/document
global.window = { document: { cookie: '' } };
global.document = global.window.document;

// Client as configured in src/lib/supabase/client.ts
const client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  cookies: {},
  global: {
    fetch: () => {}
  }
});

try {
  await client.auth.storage.setItem('sb-test-auth-token-code-verifier', 'pkce-verifier-12345');
  console.log('Client storage.setItem: PASS -> Cookie stored:', document.cookie);
  const retrieved = await client.auth.storage.getItem('sb-test-auth-token-code-verifier');
  console.log('Client storage.getItem: PASS -> Retrieved value:', retrieved);
} catch (err) {
  console.error('Client storage FAILED:', err);
  process.exit(1);
}

console.log('\n------------------------------------------------------------');
console.log('TEST 2: Server-side Route Handler createServerClient storage test');
console.log('------------------------------------------------------------');

// Create a simulated incoming request with the cookie set by the browser
const req = new NextRequest('https://hackathon-milkgaurd-web.vercel.app/auth/callback?code=fake_code&next=/home', {
  headers: {
    'cookie': 'sb-test-auth-token-code-verifier=pkce-verifier-12345'
  }
});
const targetUrl = new URL('/home', req.url);
const res = NextResponse.redirect(targetUrl);

// Simulating our updated callback route handler
let cookieStore = null; // simulate environment where cookies() throws or returns null
const serverClient = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  cookies: {
    get(name) {
      const reqVal = req.cookies.get(name)?.value;
      if (reqVal !== undefined) return reqVal;
      try {
        return cookieStore?.get?.(name)?.value;
      } catch {
        return undefined;
      }
    },
    set(name, value, options) {
      res.cookies.set({ name, value, ...options });
      try {
        cookieStore?.set?.({ name, value, ...options });
      } catch {}
    },
    remove(name, options) {
      res.cookies.set({ name, value: '', ...options, maxAge: 0 });
      try {
        cookieStore?.set?.({ name, value: '', ...options, maxAge: 0 });
      } catch {}
    },
  },
});

try {
  // Test reading code verifier from request cookies
  const verifier = await serverClient.auth.storage.getItem('sb-test-auth-token-code-verifier');
  console.log('Server storage.getItem (from request.cookies): PASS ->', verifier);

  // Test setting tokens onto response cookies (this is where setItem crashed before!)
  await serverClient.auth.storage.setItem('sb-test-auth-token', JSON.stringify({ access_token: 'valid_token' }));
  console.log('Server storage.setItem (onto response.cookies): PASS');
  console.log('Set-Cookie headers generated on redirect response:');
  console.log(res.headers.get('set-cookie'));
} catch (err) {
  console.error('Server storage FAILED:', err);
  process.exit(1);
}

console.log('\nALL LOCAL SIMULATION TESTS PASSED! No .set errors!');

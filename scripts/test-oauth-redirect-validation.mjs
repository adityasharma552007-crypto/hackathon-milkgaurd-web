import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
const supabaseKey = 'sb_publishable_9r7Dic2Dr-wNIJp6Rj_qtA_ek46svAG';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testOAuthRedirectHandling() {
  const testUrls = [
    'https://hackathon-milkgaurd-web.vercel.app/auth/callback',
    'https://hackathon-milkgaurd-web.vercel.app/auth/callback?next=/home',
    'http://localhost:3000/auth/callback',
    'http://localhost:3000/auth/callback?next=/home',
    'https://unauthorized-domain-xyz.com/auth/callback',
  ];

  for (const testUrl of testUrls) {
    console.log('\n--- TESTING REDIRECT TO:', testUrl);
    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: testUrl }
    });

    if (data?.url) {
      console.log('Authorize URL query params:');
      const parsed = new URL(data.url);
      console.log('  redirect_to in authorize URL:', parsed.searchParams.get('redirect_to'));

      // Now follow the authorize redirect to Google
      const authRes = await fetch(data.url, { redirect: 'manual' });
      console.log('  Supabase Authorize HTTP status:', authRes.status);
      const loc = authRes.headers.get('location');
      if (loc) {
        const gUrl = new URL(loc);
        console.log('  Location sent to browser:', gUrl.origin + gUrl.pathname);
        console.log('  Google redirect_uri:', gUrl.searchParams.get('redirect_uri'));
        console.log('  Google redirect_to:', gUrl.searchParams.get('redirect_to'));
        console.log('  Google state:', gUrl.searchParams.get('state'));
      }
    }
  }
}

testOAuthRedirectHandling().catch(console.error);

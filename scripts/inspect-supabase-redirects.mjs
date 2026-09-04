import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
const supabaseKey = 'sb_publishable_9r7Dic2Dr-wNIJp6Rj_qtA_ek46svAG';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectOAuthUrls() {
  console.log('=== INSPECTING OAUTH REDIRECT URLS ===');

  // 1. With window.location.origin equivalent (production domain)
  const prodCallback = 'https://hackathon-milkgaurd-web.vercel.app/auth/callback?next=/home';
  const { data: gData1, error: gErr1 } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: prodCallback,
    }
  });
  console.log('\nGoogle with prodCallback:', prodCallback);
  console.log('Returned URL:', gData1?.url);

  // Parse the returned URL
  if (gData1?.url) {
    const parsed = new URL(gData1.url);
    console.log('Google Auth Host:', parsed.host);
    console.log('Google redirect_uri param:', parsed.searchParams.get('redirect_uri'));
  }

  // 2. With GitHub
  const { data: ghData, error: ghErr } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: prodCallback,
    }
  });
  console.log('\nGitHub with prodCallback:', prodCallback);
  console.log('Returned URL:', ghData?.url);
  if (ghData?.url) {
    const parsed = new URL(ghData.url);
    console.log('GitHub redirect_uri param:', parsed.searchParams.get('redirect_uri'));
  }

  // 3. What if redirectTo is NOT passed? What is the default Site URL in Supabase?
  const { data: defaultData } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  console.log('\nDefault (no redirectTo) Google URL:', defaultData?.url);
  if (defaultData?.url) {
    const parsed = new URL(defaultData.url);
    console.log('Default redirect_uri:', parsed.searchParams.get('redirect_uri'));
  }
}

inspectOAuthUrls().catch(console.error);

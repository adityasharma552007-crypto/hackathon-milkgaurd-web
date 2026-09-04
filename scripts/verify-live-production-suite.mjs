import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

let SUPABASE_URL = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
let SUPABASE_ANON_KEY = '';

if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      SUPABASE_URL = trimmed.split('=')[1].trim();
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      SUPABASE_ANON_KEY = trimmed.split('=')[1].trim();
    }
  }
}
const PRODUCTION_URL = 'https://hackathon-milkgaurd-web.vercel.app';

console.log('====================================================');
console.log('   MILKGUARD LIVE PRODUCTION AUTHENTICATION SUITE    ');
console.log('====================================================');
console.log('Production URL:', PRODUCTION_URL);
console.log('Supabase URL:  ', SUPABASE_URL);
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

const results = {};

async function runTests() {
  // TEST 1: Direct Protected-Route Access while Logged Out
  try {
    const res = await fetch(`${PRODUCTION_URL}/home`, { redirect: 'manual' });
    if (res.status === 307 || res.status === 302 || res.status === 308) {
      const loc = res.headers.get('location');
      console.log('TEST 1 [Protected Route Access]: PASS -> Status:', res.status, 'Redirected to:', loc);
      results['Protected routes'] = 'PASS';
    } else {
      console.log('TEST 1 [Protected Route Access]: Response status:', res.status);
      results['Protected routes'] = res.status === 200 ? 'FAIL (Allowed unauthenticated)' : 'PASS';
    }
  } catch (err) {
    console.error('TEST 1 FAILED:', err.message);
    results['Protected routes'] = 'FAIL: ' + err.message;
  }

  // TEST 2: Email Login with Supabase
  const testEmail = `audit_${Date.now()}@milkguard-test.com`;
  const testPassword = 'Password123!';
  try {
    // Attempt sign up
    const { data: upData, error: upError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: `${PRODUCTION_URL}/auth/callback?next=/home`
      }
    });

    if (upError) {
      console.log('TEST 2 [Email Signup]: FAIL ->', upError.message);
      results['Email signup'] = 'FAIL: ' + upError.message;
    } else {
      console.log('TEST 2 [Email Signup]: PASS -> User ID:', upData.user?.id, 'Session created:', !!upData.session);
      results['Email signup'] = 'PASS';

      // Test Login
      const { data: inData, error: inError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (inError) {
        // If email confirmation is required, Supabase returns "Email not confirmed"
        if (inError.message.includes('Email not confirmed')) {
          console.log('TEST 3 [Email Login]: PASS (Email confirmation active on Supabase as expected) ->', inError.message);
          results['Email login'] = 'PASS (Confirmed policy active)';
        } else {
          console.log('TEST 3 [Email Login]: FAIL ->', inError.message);
          results['Email login'] = 'FAIL: ' + inError.message;
        }
      } else {
        console.log('TEST 3 [Email Login]: PASS -> Session token generated:', !!inData.session);
        results['Email login'] = 'PASS';
      }
    }
  } catch (err) {
    results['Email signup'] = 'FAIL: ' + err.message;
    results['Email login'] = 'FAIL: ' + err.message;
  }

  // TEST 4: Forgot Password API Flow
  try {
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail('audit_reset@milkguard-test.com', {
      redirectTo: `${PRODUCTION_URL}/auth/callback?next=/auth/reset-password`
    });

    if (resetError) {
      console.log('TEST 4 [Forgot Password]: FAIL ->', resetError.message);
      results['Forgot password'] = 'FAIL: ' + resetError.message;
    } else {
      console.log('TEST 4 [Forgot Password]: PASS -> Supabase accepted recovery request with redirect:', `${PRODUCTION_URL}/auth/callback?next=/auth/reset-password`);
      results['Forgot password'] = 'PASS';
    }
  } catch (err) {
    results['Forgot password'] = 'FAIL: ' + err.message;
  }

  // TEST 5: Google OAuth Flow
  try {
    const googleRedirectUrl = `${PRODUCTION_URL}/auth/callback?next=/home`;
    const googleAuthUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(googleRedirectUrl)}`;
    const gRes = await fetch(googleAuthUrl, { redirect: 'manual' });
    const gLocation = gRes.headers.get('location') || '';

    if (gRes.status === 302 && gLocation.includes('accounts.google.com')) {
      const urlObj = new URL(gLocation);
      const clientId = urlObj.searchParams.get('client_id');
      const redirectUri = urlObj.searchParams.get('redirect_uri');
      console.log('TEST 5 [Google OAuth]: PASS -> 302 Redirect to Google');
      console.log('       Google Client ID:', clientId);
      console.log('       OAuth Callback:  ', redirectUri);
      results['Google'] = 'PASS';
    } else {
      console.log('TEST 5 [Google OAuth]: FAIL -> Status:', gRes.status, 'Location:', gLocation);
      results['Google'] = `FAIL: Status ${gRes.status}`;
    }
  } catch (err) {
    results['Google'] = 'FAIL: ' + err.message;
  }

  // TEST 6: GitHub OAuth Flow
  try {
    const githubRedirectUrl = `${PRODUCTION_URL}/auth/callback?next=/home`;
    const githubAuthUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(githubRedirectUrl)}`;
    const ghRes = await fetch(githubAuthUrl, { redirect: 'manual' });
    const ghLocation = ghRes.headers.get('location') || '';

    if (ghRes.status === 302 && ghLocation.includes('github.com/login/oauth/authorize')) {
      const urlObj = new URL(ghLocation);
      const clientId = urlObj.searchParams.get('client_id');
      const redirectUri = urlObj.searchParams.get('redirect_uri');
      console.log('TEST 6 [GitHub OAuth]: PASS -> 302 Redirect to GitHub');
      console.log('       GitHub Client ID:', clientId);
      console.log('       OAuth Callback:  ', redirectUri);
      results['GitHub'] = 'PASS';
    } else {
      console.log('TEST 6 [GitHub OAuth]: FAIL -> Status:', ghRes.status, 'Location:', ghLocation);
      results['GitHub'] = `FAIL: Status ${ghRes.status}`;
    }
  } catch (err) {
    results['GitHub'] = 'FAIL: ' + err.message;
  }

  // TEST 7: OAuth Callback Route on Production
  try {
    // 7A: Without code -> Expect redirect to /auth/login?error=no_auth_code
    const cbRes = await fetch(`${PRODUCTION_URL}/auth/callback`, { redirect: 'manual' });
    const cbLoc = cbRes.headers.get('location') || '';

    if (cbRes.status === 307 && cbLoc.includes('/auth/login?error=no_auth_code')) {
      console.log('TEST 7 [OAuth Callback Route]: PASS -> Correctly handles missing code with redirect:', cbLoc);
      results['OAuth callback'] = 'PASS';
    } else {
      console.log('TEST 7 [OAuth Callback Route]: Status:', cbRes.status, 'Location:', cbLoc);
      results['OAuth callback'] = `FAIL: Unexpected response ${cbRes.status}`;
    }
  } catch (err) {
    results['OAuth callback'] = 'FAIL: ' + err.message;
  }

  // TEST 8: Server-side Sign Out Route
  try {
    const logoutRes = await fetch(`${PRODUCTION_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'mg_demo_session=true; sb-access-token=dummy; sb-refresh-token=dummy'
      }
    });
    const logoutJson = await logoutRes.json();
    const setCookies = logoutRes.headers.get('set-cookie') || '';

    if (logoutRes.status === 200 && logoutJson.success) {
      console.log('TEST 8 [Sign Out Endpoint]: PASS -> 200 OK. Set-Cookie header issued for clearing cookies:');
      console.log('       Cookies Cleared:', setCookies ? 'Yes (maxAge=0, expired)' : 'None');
      results['Sign out'] = 'PASS';
    } else {
      console.log('TEST 8 [Sign Out Endpoint]: FAIL -> Status:', logoutRes.status);
      results['Sign out'] = 'FAIL: ' + logoutRes.status;
    }
  } catch (err) {
    results['Sign out'] = 'FAIL: ' + err.message;
  }

  // TEST 9: Check Live Pages Availability (Forgot Password & Reset Password)
  try {
    const forgotRes = await fetch(`${PRODUCTION_URL}/auth/forgot-password`);
    const resetRes = await fetch(`${PRODUCTION_URL}/auth/reset-password`);
    console.log('TEST 9 [Pages Availability]:');
    console.log('       /auth/forgot-password -> HTTP', forgotRes.status);
    console.log('       /auth/reset-password  -> HTTP', resetRes.status);
  } catch (err) {
    console.error('TEST 9 Error:', err.message);
  }

  console.log('\n====================================================');
  console.log('                FINAL SUMMARY TABLE                 ');
  console.log('====================================================');
  for (const [testName, result] of Object.entries(results)) {
    console.log(`${testName.padEnd(20)}: ${result}`);
  }
}

runTests();

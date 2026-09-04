import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testPasswordResetDirect() {
  const testEmail = 'audit_1788523570379@milkguard-test.com';
  const targetUrl = 'https://hackathon-milkgaurd-web.vercel.app/auth/reset-password';

  console.log('Testing generateLink with direct reset target:', targetUrl);
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email: testEmail,
    options: {
      redirectTo: targetUrl,
    }
  });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Action link generated:', data.properties.action_link);
  const res = await fetch(data.properties.action_link, { redirect: 'manual' });
  console.log('HTTP Status:', res.status);
  const loc = res.headers.get('location');
  console.log('Location header:', loc);
  if (loc) {
    const parsed = new URL(loc);
    console.log('Target host:', parsed.host);
    console.log('Target path:', parsed.pathname);
    console.log('Target hash:', parsed.hash ? parsed.hash.slice(0, 40) + '...' : 'none');
  }
}

testPasswordResetDirect().catch(console.error);

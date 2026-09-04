import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testLocalhostRedirect() {
  const { data: { users } } = await adminClient.auth.admin.listUsers();
  const testEmail = users[0].email;

  console.log('--- TEST 1: redirectTo = http://localhost:3000/auth/reset-password ---');
  const { data: d1 } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email: testEmail,
    options: {
      redirectTo: 'http://localhost:3000/auth/reset-password',
    }
  });
  console.log('Action link 1:', d1.properties.action_link);
  const res1 = await fetch(d1.properties.action_link, { redirect: 'manual' });
  console.log('Status 1:', res1.status);
  console.log('Location 1 (where Supabase actually redirects):', res1.headers.get('location'));

  console.log('\n--- TEST 2: redirectTo = http://localhost:3000/auth/callback?next=/home ---');
  const { data: d2 } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email: testEmail,
    options: {
      redirectTo: 'http://localhost:3000/auth/callback?next=/home',
    }
  });
  console.log('Action link 2:', d2.properties.action_link);
  const res2 = await fetch(d2.properties.action_link, { redirect: 'manual' });
  console.log('Status 2:', res2.status);
  console.log('Location 2 (where Supabase actually redirects):', res2.headers.get('location'));
}

testLocalhostRedirect().catch(console.error);

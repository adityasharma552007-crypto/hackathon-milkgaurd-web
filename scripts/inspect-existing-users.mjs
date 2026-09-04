import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function findUsers() {
  const { data: { users }, error } = await adminClient.auth.admin.listUsers();
  if (error) {
    console.error('listUsers error:', error);
    return;
  }
  console.log(`Found ${users.length} users:`);
  for (const u of users) {
    console.log(`- ID: ${u.id}, Email: ${u.email}`);
  }

  if (users.length > 0) {
    const testEmail = users[0].email;
    console.log('\nTesting generateLink for:', testEmail);
    const { data: d1, error: e1 } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: testEmail,
    });
    if (e1) {
      console.log('generateLink error:', e1);
    } else {
      console.log('Action link (default):', d1.properties.action_link);
      const res = await fetch(d1.properties.action_link, { redirect: 'manual' });
      console.log('Response status:', res.status);
      console.log('Location header (WHERE SUPABASE REDIRECTS):', res.headers.get('location'));
    }

    // Now test with prod redirectTo
    console.log('\nTesting generateLink with prod redirectTo:');
    const { data: d2, error: e2 } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: testEmail,
      options: {
        redirectTo: 'https://hackathon-milkgaurd-web.vercel.app/auth/callback?next=/auth/reset-password',
      }
    });
    if (e2) {
      console.log('generateLink with prod redirectTo error:', e2);
    } else {
      console.log('Action link (prod redirectTo):', d2.properties.action_link);
      const res2 = await fetch(d2.properties.action_link, { redirect: 'manual' });
      console.log('Response status:', res2.status);
      console.log('Location header (WHERE SUPABASE REDIRECTS):', res2.headers.get('location'));
    }
  }
}

findUsers().catch(console.error);

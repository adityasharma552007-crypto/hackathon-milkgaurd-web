import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

async function inspectGeneratedLinks() {
  console.log('=== INSPECTING GENERATED LINKS VIA ADMIN CLIENT ===');

  // Test generating a recovery link for a test email
  const testEmail = 'admin@milkguard.com';

  // 1. Without redirectTo
  try {
    const { data: d1, error: e1 } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: testEmail,
    });
    if (e1) {
      console.log('generateLink without redirectTo error:', e1.message);
    } else {
      console.log('1. Generated link without redirectTo:');
      console.log('   Action link:', d1.properties.action_link);
      const parsed = new URL(d1.properties.action_link);
      console.log('   redirect_to in link:', parsed.searchParams.get('redirect_to'));
    }
  } catch (err) {
    console.error('Error 1:', err);
  }

  // 2. With redirectTo = https://hackathon-milkgaurd-web.vercel.app/auth/callback?next=/auth/reset-password
  try {
    const { data: d2, error: e2 } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: testEmail,
      options: {
        redirectTo: 'https://hackathon-milkgaurd-web.vercel.app/auth/callback?next=/auth/reset-password',
      }
    });
    if (e2) {
      console.log('generateLink with prod redirectTo error:', e2.message);
    } else {
      console.log('\n2. Generated link with prod redirectTo:');
      console.log('   Action link:', d2.properties.action_link);
      const parsed = new URL(d2.properties.action_link);
      console.log('   redirect_to in link:', parsed.searchParams.get('redirect_to'));
    }
  } catch (err) {
    console.error('Error 2:', err);
  }

  // 3. Now let's simulate clicking that action_link (HTTP GET without redirect)
  try {
    const { data: d3 } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: testEmail,
    });
    if (d3?.properties?.action_link) {
      console.log('\n3. Simulating clicking default action_link:');
      const res = await fetch(d3.properties.action_link, { redirect: 'manual' });
      console.log('   HTTP Status:', res.status);
      console.log('   Location header:', res.headers.get('location'));
    }
  } catch (err) {
    console.error('Error 3:', err);
  }
}

inspectGeneratedLinks().catch(console.error);

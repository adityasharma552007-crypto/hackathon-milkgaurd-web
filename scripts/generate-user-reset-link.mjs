import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function generateDirectResetLink(email) {
  console.log(`Generating recovery link for: ${email}`);

  // 1. Generate the recovery link
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email: email,
  });

  if (error) {
    console.error('Error generating link:', error.message);
    return;
  }

  const actionLink = data.properties.action_link;
  console.log('Action link generated from Supabase.');

  // 2. Follow the verification step directly to obtain the authenticated session tokens
  const verifyRes = await fetch(actionLink, { redirect: 'manual' });
  const locationHeader = verifyRes.headers.get('location');

  if (!locationHeader) {
    console.error('No location header returned from verify endpoint. Status:', verifyRes.status);
    return;
  }

  // Extract the hash (#access_token=...&refresh_token=...&type=recovery)
  const hashIndex = locationHeader.indexOf('#');
  if (hashIndex === -1) {
    console.error('No hash found in location header:', locationHeader);
    return;
  }

  const hashPart = locationHeader.substring(hashIndex);

  // 3. Construct direct localhost and live production reset links
  const localhostLink = `http://localhost:3000/auth/reset-password${hashPart}`;
  const productionLink = `https://hackathon-milkgaurd-web.vercel.app/auth/reset-password${hashPart}`;

  console.log('\n======================================================');
  console.log('DIRECT LOCALHOST PASSWORD RESET LINK:');
  console.log(localhostLink);
  console.log('\nDIRECT LIVE PRODUCTION PASSWORD RESET LINK:');
  console.log(productionLink);
  console.log('======================================================\n');
}

generateDirectResetLink('adityasharma155589@gmail.com').catch(console.error);

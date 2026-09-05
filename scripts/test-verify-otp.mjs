import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
const envFile = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);
const anonMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/);
const serviceRoleKey = keyMatch[1].trim();
const anonKey = anonMatch[1].trim();

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const client = createClient(supabaseUrl, anonKey);

async function testVerifyOtp() {
  const email = 'audit_1788523570379@milkguard-test.com';

  // 1. Generate link
  const { data: linkData, error: lErr } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email,
  });

  const tokenHash = linkData.properties.hashed_token;
  console.log('Generated token_hash:', tokenHash);

  // 2. Client verifies OTP with token_hash
  const { data: verifyData, error: vErr } = await client.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'recovery',
  });

  console.log('verifyOtp Error:', vErr);
  console.log('verifyOtp Session established:', !!verifyData.session);
  console.log('User ID:', verifyData.user?.id);

  // 3. Client updates password
  if (verifyData.session) {
    const { data: uData, error: uErr } = await client.auth.updateUser({
      password: 'NewTestPassword123!',
    });
    console.log('updateUser Error:', uErr);
    console.log('Password updated successfully:', !uErr);
  }
}

testVerifyOtp().catch(console.error);

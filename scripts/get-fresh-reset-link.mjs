import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
const envFile = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);
const serviceRoleKey = keyMatch[1].trim();

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function getFreshLink() {
  const email = 'adityasharma155589@gmail.com';
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email: email,
  });

  if (error) {
    console.error('Error:', error);
    return;
  }

  const tokenHash = data.properties.hashed_token;
  console.log('\n=== FRESH UNCONSUMED RESET LINKS ===');
  console.log('\n1. Localhost (with token_hash):');
  console.log(`http://localhost:3000/auth/reset-password?token_hash=${tokenHash}`);
  console.log('\n2. Live Production (with token_hash):');
  console.log(`https://hackathon-milkgaurd-web.vercel.app/auth/reset-password?token_hash=${tokenHash}`);
  console.log('====================================\n');
}

getFreshLink();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);
const serviceRoleKey = keyMatch ? keyMatch[1].trim() : process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function inspectProperties() {
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email: 'adityasharma155589@gmail.com',
  });
  console.log('Error:', error);
  console.log('Properties keys:', Object.keys(data.properties));
  console.log('Properties:');
  console.log('  email_otp:', data.properties.email_otp);
  console.log('  hashed_token:', data.properties.hashed_token);
  console.log('  verification_type:', data.properties.verification_type);
  console.log('  action_link:', data.properties.action_link);
}

inspectProperties();

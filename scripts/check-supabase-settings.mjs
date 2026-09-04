import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

async function checkManagementApi() {
  console.log('Testing Supabase Admin endpoints...');
  
  // Try calling /auth/v1/settings or /auth/v1/admin
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });
    console.log('GET /auth/v1/settings -> Status:', res.status);
    const json = await res.json();
    console.log('Settings:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('/auth/v1/settings error:', err.message);
  }

  // Try fetching project settings
  try {
    const res2 = await fetch(`${supabaseUrl}/auth/v1/admin/audit`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });
    console.log('GET /auth/v1/admin/audit -> Status:', res2.status);
  } catch (err) {
    console.error('/auth/v1/admin/audit error:', err.message);
  }
}

checkManagementApi().catch(console.error);

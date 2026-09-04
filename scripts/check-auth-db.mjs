import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co';
const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkAuthSchema() {
  console.log('Querying database tables in auth schema...');
  // Check if we can query via rpc or schema
  const { data, error } = await client.from('profiles').select('count', { count: 'exact', head: true });
  console.log('Profiles table access:', !error);

  // Try querying pg_tables
  const { data: tables, error: tErr } = await client.rpc('get_tables_info').catch(() => ({}));
  console.log('Tables rpc:', tables, tErr);
}

checkAuthSchema();

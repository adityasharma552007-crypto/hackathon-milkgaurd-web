const serviceRoleKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const projectRef = 'xogvlpwwwwjwjstypjlo';

async function testManagement() {
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });
    console.log('Management API status:', res.status);
    console.log('Response:', (await res.text()).slice(0, 300));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testManagement();

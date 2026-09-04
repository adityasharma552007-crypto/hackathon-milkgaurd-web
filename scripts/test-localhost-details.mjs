async function testLocalhostDetails() {
  console.log('=== CHECKING LOCALHOST:3000 ===');

  // 1. Fetch /
  const r1 = await fetch('http://localhost:3000/');
  console.log('1. GET / -> Status:', r1.status);
  const html1 = await r1.text();
  console.log('   HTML size:', html1.length);
  const cssMatch = html1.match(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/);
  console.log('   CSS link in HTML:', cssMatch ? cssMatch[1] : 'NONE');
  if (cssMatch) {
    const cssRes = await fetch('http://localhost:3000' + cssMatch[1]);
    console.log('   CSS fetch status:', cssRes.status, 'size:', (await cssRes.text()).length);
  }

  // 2. Fetch /auth/login
  const r2 = await fetch('http://localhost:3000/auth/login');
  console.log('\n2. GET /auth/login -> Status:', r2.status);
  const html2 = await r2.text();
  console.log('   HTML size:', html2.length);
  const cssMatch2 = html2.match(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/);
  console.log('   CSS link in /auth/login:', cssMatch2 ? cssMatch2[1] : 'NONE');

  // 3. Test POST /api/auth/login
  console.log('\n3. Testing email login via local API:');
  const r3 = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'audit_1788523570379@milkguard-test.com', password: 'TestPassword123!' })
  });
  console.log('   POST /api/auth/login -> Status:', r3.status);
  console.log('   Response:', await r3.json());
}

testLocalhostDetails().catch(console.error);

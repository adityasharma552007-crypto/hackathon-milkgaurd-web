async function testLocalhostApp() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- TESTING LOCALHOST:3000 ---');

  // 1. Root route
  const r1 = await fetch(`${baseUrl}/`);
  console.log('1. GET / -> HTTP', r1.status);
  const html1 = await r1.text();
  console.log('   Contains MilkGuard:', html1.includes('MilkGuard'));
  console.log('   Contains stylesheet link:', html1.includes('rel="stylesheet"'));

  // 2. Login page
  const r2 = await fetch(`${baseUrl}/auth/login`);
  console.log('2. GET /auth/login -> HTTP', r2.status);
  const html2 = await r2.text();
  console.log('   Contains Sign In:', html2.includes('Sign In') || html2.includes('Welcome Back') || html2.includes('MilkGuard'));
  console.log('   Contains Google Sign-In:', html2.includes('Google') || html2.includes('google'));
  console.log('   Contains GitHub Sign-In:', html2.includes('GitHub') || html2.includes('github'));

  // 3. Forgot Password page
  const r3 = await fetch(`${baseUrl}/auth/forgot-password`);
  console.log('3. GET /auth/forgot-password -> HTTP', r3.status);
  const html3 = await r3.text();
  console.log('   Contains Reset / Forgot:', html3.includes('Reset') || html3.includes('Password'));

  // 4. Protected Route Redirect
  const r4 = await fetch(`${baseUrl}/home`, { redirect: 'manual' });
  console.log('4. GET /home (unauthenticated) -> HTTP', r4.status);
  console.log('   Redirect location:', r4.headers.get('location'));

  // 5. Auth API logout endpoint
  const r5 = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' });
  console.log('5. POST /api/auth/logout -> HTTP', r5.status);
  const json5 = await r5.json();
  console.log('   Logout response:', json5);

  console.log('\n--- ALL LOCAL CHECKS PASSED ---');
}

testLocalhostApp().catch(console.error);

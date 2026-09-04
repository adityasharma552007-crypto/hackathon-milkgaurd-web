async function check() {
  const routes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/auth/callback'];
  console.log('Checking live deployment at https://hackathon-milkgaurd-web.vercel.app:');
  for (const r of routes) {
    try {
      const res = await fetch('https://hackathon-milkgaurd-web.vercel.app' + r, { redirect: 'manual' });
      console.log(r, 'status:', res.status, 'location:', res.headers.get('location') || '(none)');
    } catch(e) {
      console.log(r, 'error:', e.message);
    }
  }
}
check();

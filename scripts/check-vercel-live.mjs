async function checkVercelLive() {
  console.log('Checking live deployment...');
  const baseUrl = 'https://hackathon-milkgaurd-web.vercel.app';

  // 1. Test /reset-password redirect on live
  const r1 = await fetch(`${baseUrl}/reset-password`, { redirect: 'manual' });
  console.log('/reset-password -> Status:', r1.status, 'Location:', r1.headers.get('location'));

  // 2. Test robots.txt on live
  const r2 = await fetch(`${baseUrl}/robots.txt`);
  const t2 = await r2.text();
  console.log('robots.txt Sitemap line:', t2.split('\n').find(l => l.includes('Sitemap:')));

  // 3. Test /auth/login on live
  const r3 = await fetch(`${baseUrl}/auth/login`);
  console.log('/auth/login -> Status:', r3.status);

  // 4. Test /auth/callback on live
  const r4 = await fetch(`${baseUrl}/auth/callback`, { redirect: 'manual' });
  console.log('/auth/callback (no code) -> Status:', r4.status, 'Location:', r4.headers.get('location'));
}

checkVercelLive().catch(console.error);

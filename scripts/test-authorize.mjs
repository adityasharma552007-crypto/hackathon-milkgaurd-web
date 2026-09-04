async function testAuthorize() {
  const url = 'https://xogvlpwwwwjwjstypjlo.supabase.co/auth/v1/authorize?provider=google&redirect_to=https%3A%2F%2Fhackathon-milkgaurd-web.vercel.app%2Fauth%2Fcallback%3Fnext%3D%2Fhome';
  console.log('GET', url);
  const res = await fetch(url, { redirect: 'manual' });
  console.log('Status:', res.status);
  const loc = res.headers.get('location');
  console.log('Redirect Location:', loc);
  if (loc) {
    const parsed = new URL(loc);
    console.log('Target host:', parsed.host);
    console.log('Target redirect_uri parameter sent to Google:', parsed.searchParams.get('redirect_uri'));
    console.log('Target state parameter sent to Google:', parsed.searchParams.get('state'));
  }

  // Also test GitHub
  const ghUrl = 'https://xogvlpwwwwjwjstypjlo.supabase.co/auth/v1/authorize?provider=github&redirect_to=https%3A%2F%2Fhackathon-milkgaurd-web.vercel.app%2Fauth%2Fcallback%3Fnext%3D%2Fhome';
  console.log('\nGET', ghUrl);
  const ghRes = await fetch(ghUrl, { redirect: 'manual' });
  console.log('Status:', ghRes.status);
  const ghLoc = ghRes.headers.get('location');
  console.log('Redirect Location:', ghLoc);
  if (ghLoc) {
    const parsed = new URL(ghLoc);
    console.log('Target host:', parsed.host);
    console.log('Target redirect_uri parameter sent to GitHub:', parsed.searchParams.get('redirect_uri'));
  }
}

testAuthorize().catch(console.error);

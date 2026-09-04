async function testCss(path) {
  console.log(`\nTesting ${path}:`);
  const res = await fetch('http://localhost:3000' + path);
  const html = await res.text();
  const cssMatches = html.match(/href="([^"]+\.css[^"]*)"/g);
  console.log('CSS links found in HTML:', cssMatches);
  if (cssMatches) {
    for (const match of cssMatches) {
      const href = match.match(/href="([^"]+)"/)[1];
      const fullUrl = href.startsWith('http') ? href : 'http://localhost:3000' + href;
      try {
        const cssRes = await fetch(fullUrl);
        console.log(fullUrl, 'status:', cssRes.status, 'contentType:', cssRes.headers.get('content-type'));
      } catch (e) {
        console.log(fullUrl, 'ERROR:', e.message);
      }
    }
  } else {
    console.log('NO CSS LINKS FOUND!');
  }
}

async function run() {
  await testCss('/');
  await testCss('/auth/login');
  await testCss('/auth/forgot-password');
}
run();

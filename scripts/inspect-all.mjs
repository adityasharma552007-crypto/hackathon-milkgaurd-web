async function inspectRoute(path) {
  console.log(`\n========================================`);
  console.log(`INSPECTING: ${path}`);
  console.log(`========================================`);
  try {
    const res = await fetch(`http://localhost:3000${path}`, { redirect: 'manual' });
    console.log(`Status: ${res.status} ${res.statusText}`);
    if (res.status >= 300 && res.status < 400) {
      console.log(`Redirect to: ${res.headers.get('location')}`);
      return;
    }
    const html = await res.text();
    console.log(`HTML Length: ${html.length}`);

    // Check stylesheets
    const cssMatches = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/g)].map(m => m[1]);
    console.log(`Stylesheets (${cssMatches.length}):`);
    for (const href of cssMatches) {
      const fullUrl = href.startsWith('http') ? href : `http://localhost:3000${href}`;
      const cRes = await fetch(fullUrl);
      console.log(`  ${href} -> ${cRes.status} (${cRes.headers.get('content-type')})`);
    }

    // Check script files
    const scriptMatches = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
    console.log(`Scripts (${scriptMatches.length}):`);
    let failedScripts = 0;
    for (const href of scriptMatches) {
      const fullUrl = href.startsWith('http') ? href : `http://localhost:3000${href}`;
      const sRes = await fetch(fullUrl);
      if (sRes.status !== 200) {
        console.log(`  FAILED: ${href} -> ${sRes.status}`);
        failedScripts++;
      }
    }
    if (failedScripts === 0) {
      console.log(`  All ${scriptMatches.length} script files loaded with HTTP 200.`);
    }
  } catch (err) {
    console.error(`Error inspecting ${path}:`, err.message);
  }
}

async function run() {
  await inspectRoute('/');
  await inspectRoute('/auth/login');
  await inspectRoute('/home');
}

run();

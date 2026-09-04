async function test() {
  try {
    const res = await fetch('http://localhost:3000');
    console.log('GET http://localhost:3000 -> HTTP', res.status);
    const html = await res.text();
    console.log('HTML size:', html.length);
    
    // Find all links
    const linkRegex = /<link[^>]+>/g;
    const links = html.match(linkRegex) || [];
    console.log('\n--- LINKS ---');
    for (const l of links) console.log(l);

    // Find all scripts
    const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g;
    const scripts = [];
    let sm;
    while ((sm = scriptRegex.exec(html)) !== null) {
      scripts.push(sm[1]);
    }
    console.log('\n--- SCRIPTS (' + scripts.length + ') ---');
    for (const s of scripts) console.log(s);

    // Test CSS links
    const cssRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/g;
    let cm;
    console.log('\n--- TESTING CSS LINKS ---');
    while ((cm = cssRegex.exec(html)) !== null) {
      const href = cm[1];
      const fullUrl = href.startsWith('http') ? href : 'http://localhost:3000' + href;
      const cRes = await fetch(fullUrl);
      const text = await cRes.text();
      console.log(fullUrl, '-> Status:', cRes.status, 'Type:', cRes.headers.get('content-type'), 'Length:', text.length);
    }

    // Test first 5 script links
    console.log('\n--- TESTING SCRIPTS ---');
    for (const s of scripts.slice(0, 5)) {
      const fullUrl = s.startsWith('http') ? s : 'http://localhost:3000' + s;
      const sRes = await fetch(fullUrl);
      console.log(fullUrl, '-> Status:', sRes.status, 'Type:', sRes.headers.get('content-type'));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

test();

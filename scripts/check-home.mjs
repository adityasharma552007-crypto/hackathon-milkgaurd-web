async function checkHome() {
  try {
    const res = await fetch('http://localhost:3000/home');
    console.log('/home -> Status:', res.status);
    const html = await res.text();
    console.log('HTML length:', html.length);
    console.log('Title or error:', html.slice(0, 500));
    
    // Check if there are CSS links
    const cssMatches = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/g)].map(m => m[1]);
    console.log('CSS links:', cssMatches);
    for (const cssUrl of cssMatches) {
      const fullUrl = cssUrl.startsWith('http') ? cssUrl : 'http://localhost:3000' + cssUrl;
      const cRes = await fetch(fullUrl);
      console.log(fullUrl, '-> Status:', cRes.status, 'Type:', cRes.headers.get('content-type'));
    }
  } catch (err) {
    console.error('Error fetching /home:', err);
  }
}
checkHome();

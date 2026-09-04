async function checkChunks() {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g;
  let m;
  while ((m = scriptRegex.exec(html)) !== null) {
    const url = 'http://localhost:3000' + m[1];
    const sRes = await fetch(url);
    const text = await sRes.text();
    console.log(m[1], '-> Status:', sRes.status, 'Bytes:', text.length);
    if (sRes.status !== 200) {
      console.error('FAILED CHUNK:', m[1], text.slice(0, 300));
    }
  }
}
checkChunks();

async function check() {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  const m = html.match(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/);
  if (!m) { console.log('NO CSS LINK FOUND'); return; }
  const cssUrl = 'http://localhost:3000' + m[1];
  console.log('Fetching', cssUrl);
  const cRes = await fetch(cssUrl);
  const css = await cRes.text();
  console.log('CSS length:', css.length);
  console.log('CSS preview (first 400 chars):\n', css.slice(0, 400));
  console.log('Contains flex:', css.includes('.flex'));
  console.log('Contains grid:', css.includes('.grid'));
  console.log('Contains text-white:', css.includes('.text-white'));
  console.log('Contains bg-[#f8f9ff]:', css.includes('#f8f9ff'));
}
check();

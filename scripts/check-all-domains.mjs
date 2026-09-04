async function checkDomains() {
  const domains = [
    'https://hackathon-milkgaurd-web.vercel.app',
    'http://hackathon-milkgaurd-web.vercel.app',
    'https://hackathon-milkguard-web.vercel.app',
    'http://hackathon-milkguard-web.vercel.app',
    'https://milkguard.vercel.app',
    'https://milkgaurd.vercel.app',
    'https://milkguard-web.vercel.app',
    'https://milkgaurd-web.vercel.app',
  ];

  console.log('=== TESTING DOMAINS ===');
  for (const d of domains) {
    try {
      const res = await fetch(d, { redirect: 'manual' });
      const text = await res.text();
      const isDeploymentNotFound = text.includes('DEPLOYMENT_NOT_FOUND') || text.includes('deployment could not be found');
      const hasMilkGuard = text.includes('MilkGuard');
      console.log(`${d} -> Status: ${res.status} | MilkGuard: ${hasMilkGuard} | DeploymentNotFound: ${isDeploymentNotFound}`);
      if (res.status >= 300 && res.status < 400) {
        console.log(`   Redirects to: ${res.headers.get('location')}`);
      }
    } catch (e) {
      console.log(`${d} -> ERROR: ${e.message}`);
    }
  }
}

checkDomains().catch(console.error);

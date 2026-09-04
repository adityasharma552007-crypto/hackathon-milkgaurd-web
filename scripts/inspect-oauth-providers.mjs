import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local
const envFile = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim()
        const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
        process.env[key] = val
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function inspectProviders() {
  console.log('--- 1. Testing Google OAuth authorize redirect ---')
  const { data: gData } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://hackathon-milkgaurd-web.vercel.app/auth/callback',
      skipBrowserRedirect: true
    }
  })
  
  if (gData?.url) {
    console.log('Google Authorize URL:', gData.url)
    try {
      const gRes = await fetch(gData.url, { redirect: 'manual' })
      console.log('Google Auth Endpoint HTTP Status:', gRes.status)
      console.log('Google Auth Location Header:', gRes.headers.get('location'))
      if (gRes.status === 400 || gRes.status === 500) {
        console.log('Google Error Body:', await gRes.text())
      }
    } catch (e) {
      console.error('Fetch error:', e.message)
    }
  }

  console.log('\n--- 2. Testing GitHub OAuth authorize redirect ---')
  const { data: ghData } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: 'https://hackathon-milkgaurd-web.vercel.app/auth/callback',
      skipBrowserRedirect: true
    }
  })

  if (ghData?.url) {
    console.log('GitHub Authorize URL:', ghData.url)
    try {
      const ghRes = await fetch(ghData.url, { redirect: 'manual' })
      console.log('GitHub Auth Endpoint HTTP Status:', ghRes.status)
      console.log('GitHub Auth Location Header:', ghRes.headers.get('location'))
      if (ghRes.status === 400 || ghRes.status === 500) {
        console.log('GitHub Error Body:', await ghRes.text())
      }
    } catch (e) {
      console.error('Fetch error:', e.message)
    }
  }
}

inspectProviders().catch(console.error)

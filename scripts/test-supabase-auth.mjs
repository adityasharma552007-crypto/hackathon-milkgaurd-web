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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('--- Supabase Auth Audit ---')
console.log('Project URL:', supabaseUrl)
console.log('Anon Key Present:', Boolean(supabaseAnonKey))
console.log('Service Key Present:', Boolean(supabaseServiceKey))

const anonClient = createClient(supabaseUrl, supabaseAnonKey)
const adminClient = createClient(supabaseUrl, supabaseServiceKey)

async function testAuth() {
  // 1. Check Google OAuth URL generation
  console.log('\n--- Testing Google OAuth Initialization ---')
  const { data: googleData, error: googleError } = await anonClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://hackathon-milkgaurd-web.vercel.app/auth/callback',
      skipBrowserRedirect: true
    }
  })
  if (googleError) {
    console.error('Google OAuth Error:', googleError)
  } else {
    console.log('Google OAuth URL Generated Successfully:', googleData?.url?.slice(0, 100) + '...')
  }

  // 2. Check GitHub OAuth URL generation
  console.log('\n--- Testing GitHub OAuth Initialization ---')
  const { data: githubData, error: githubError } = await anonClient.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: 'https://hackathon-milkgaurd-web.vercel.app/auth/callback',
      skipBrowserRedirect: true
    }
  })
  if (githubError) {
    console.error('GitHub OAuth Error:', githubError)
  } else {
    console.log('GitHub OAuth URL Generated Successfully:', githubData?.url?.slice(0, 100) + '...')
  }

  // 3. Test Reset Password For Email
  console.log('\n--- Testing resetPasswordForEmail ---')
  const testEmail = 'audit_test_' + Date.now() + '@example.com'
  const { data: resetData, error: resetError } = await anonClient.auth.resetPasswordForEmail(testEmail, {
    redirectTo: 'https://hackathon-milkgaurd-web.vercel.app/auth/reset-password'
  })
  if (resetError) {
    console.error('Reset Password Error:', resetError)
  } else {
    console.log('Reset Password Request Accepted by Supabase:', resetData)
  }

  // 4. Test Email Signup
  console.log('\n--- Testing Email Signup & Signin ---')
  const testPass = 'AuditSecurePassword123!'
  const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
    email: testEmail,
    password: testPass,
    options: {
      data: { full_name: 'Audit User' }
    }
  })
  if (signUpError) {
    console.error('SignUp Error:', signUpError)
  } else {
    console.log('SignUp Success! User ID:', signUpData?.user?.id)
    console.log('User Confirmation Required:', !signUpData?.session)
  }

  // Clean up test user if created
  if (signUpData?.user?.id) {
    console.log('Cleaning up test user...')
    await adminClient.auth.admin.deleteUser(signUpData.user.id)
    console.log('Test user cleaned up.')
  }
}

testAuth().catch(console.error)

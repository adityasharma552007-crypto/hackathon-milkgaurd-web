const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Manual env parsing since dotenv might not be available
const envObj = {}
const content = fs.readFileSync('.env.local', 'utf-8')
for (const line of content.split('\n')) {
  if (line && line.includes('=')) {
    const [key, ...vals] = line.split('=')
    envObj[key.trim()] = vals.join('=').trim()
  }
}

const supabaseUrl = envObj['NEXT_PUBLIC_SUPABASE_URL']
const supabaseServiceKey = envObj['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function backfillProfiles() {
  console.log("Starting missing profile backfill...")
  
  // 1. Get all users from auth.users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError) {
    console.error("Failed to list users:", usersError)
    process.exit(1)
  }
  
  console.log(`Found ${users.length} total users in auth.users`)

  // 2. Get all existing profiles
  const { data: profiles, error: profError } = await supabase.from('profiles').select('id')
  if (profError) {
    console.error("Failed to query profiles:", profError)
    process.exit(1)
  }

  const profileIds = new Set(profiles.map(p => p.id))
  console.log(`Found ${profileIds.size} existing profiles in public.profiles`)

  let createdCount = 0

  // 3. Insert missing
  for (const user of users) {
    if (!profileIds.has(user.id)) {
      console.log(`Missing profile for ${user.email}, creating...`)
      
      const fullName = 
        user.user_metadata?.full_name || 
        user.user_metadata?.name || 
        user.user_metadata?.user_name || 
        (user.email ? user.email.split('@')[0] : 'Unknown')
      
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: fullName,
        total_scans: 0,
        safe_scans: 0,
        created_at: user.created_at
      })
      
      if (insertError) {
        console.error(`Error inserting profile for ${user.email}:`, insertError.message)
      } else {
        console.log(`✅ Success: created profile for ${user.email}`)
        createdCount++
      }
    }
  }

  console.log(`\nBackfill complete. Created ${createdCount} new profiles.`)
}

backfillProfiles()

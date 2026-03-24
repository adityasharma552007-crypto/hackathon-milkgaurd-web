'use client'

import { useEffect } from 'react'
import { useUserStore, type Profile } from '@/store/useUserStore'
import { User } from '@supabase/supabase-js'

interface UserHydratorProps {
  user: User | null
  profile: Profile | null
}

export function UserHydrator({ user, profile }: UserHydratorProps) {
  const { setUser, setProfile } = useUserStore()

  useEffect(() => {
    setUser(user)
    setProfile(profile)
  }, [user, profile, setUser, setProfile])

  return null
}

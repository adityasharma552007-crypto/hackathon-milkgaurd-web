import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  city: string | null
  area: string | null
  pod_id: string | null
  total_scans: number
  safe_scans: number
  created_at: string
}

interface UserState {
  user: User | null
  profile: Profile | null
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  clearUser: () => set({ user: null, profile: null }),
}))

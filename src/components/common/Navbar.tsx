'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Cpu,
  MapPin,
  BarChart3,
  HelpCircle,
  Info,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon,
  Download,
  BookOpen,
  type LucideIcon
} from 'lucide-react'
import { MilkGuardLogo } from '@/components/brand/MilkGuardLogo'
import { InstallButton } from '@/components/pwa/InstallButton'
import { useUserStore } from '@/store/useUserStore'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/home', icon: ShieldCheck },
  { label: 'Scan', href: '/scan', icon: QrCode, badge: 'Live AI' },
  { label: 'Hardware', href: '/hardware', icon: Cpu },
  { label: 'How It Works', href: '/how-it-works', icon: BookOpen },
  { label: 'Map', href: '/map', icon: MapPin },
  { label: 'Reports', href: '/history', icon: BarChart3 },
  { label: 'About', href: '/about', icon: Info },
  { label: 'FAQ', href: '/faq', icon: HelpCircle },
]

export function Navbar({ className }: { className?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, clearUser } = useUserStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDemoUser, setIsDemoUser] = useState(false)

  // Check demo cookie on mount
  useEffect(() => {
    const hasDemo = typeof document !== 'undefined' && document.cookie.includes('mg_demo_session=true')
    setIsDemoUser(hasDemo)
  }, [user])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isLoggedIn = !!user || isDemoUser

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Ignore error if offline or mock
    }
    // Clear demo cookie
    document.cookie = 'mg_demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    clearUser()
    setIsDemoUser(false)
    router.push('/?logged_out=true')
    router.refresh()
  }

  return (
    <header
      className={cn(
        'sticky top-0 w-full z-50 bg-[#f8f9ff]/95 backdrop-blur-xl border-b border-[#d1e4ff]/70 ambient-shadow transition-all',
        className
      )}
    >
      <div className="flex justify-between items-center px-4 md:px-8 h-16 w-full max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <MilkGuardLogo
            variant="header"
            size="sm"
            linkToHome
            priority
            className="hover:opacity-90 transition-opacity"
          />

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/home' && pathname?.startsWith(item.href))
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5',
                    isActive
                      ? 'bg-[#00668a] text-white shadow-sm'
                      : 'text-[#3e484f] hover:text-[#00668a] hover:bg-[#e5efff]/70'
                  )}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-[#6e7980]'} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#30c5b3]/20 text-[#006b5f]'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right CTA / Auth Area */}
        <div className="flex items-center gap-2.5">
          <InstallButton variant="header" className="hidden sm:inline-flex" />

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#e5efff] hover:bg-[#d1e4ff] text-[#001d36] transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-[#00668a] text-white flex items-center justify-center font-bold text-xs">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <span className="text-xs font-bold hidden md:inline truncate max-w-[100px]">
                  {profile?.full_name?.split(' ')[0] || 'My Account'}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl text-[#6e7980] hover:text-[#ba1a1a] hover:bg-red-50 transition-colors hidden sm:flex items-center justify-center"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#00668a] hover:bg-[#e5efff] transition-all flex items-center gap-1.5"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </Link>

              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#00668a] hover:bg-[#004c69] shadow-sm transition-all flex items-center gap-1.5"
              >
                <UserPlus size={14} />
                <span>Sign Up Free</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-xl text-[#001d36] hover:bg-[#e5efff] transition-colors ml-1"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#d1e4ff] bg-[#f8f9ff]/98 backdrop-blur-2xl px-4 py-5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5 mb-4">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/home' && pathname?.startsWith(item.href))
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors',
                    isActive
                      ? 'bg-[#00668a] text-white shadow-sm'
                      : 'text-[#3e484f] hover:bg-[#e5efff]'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-[#00668a]'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-black',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#30c5b3]/20 text-[#006b5f]'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-[#d1e4ff] pt-4 space-y-2">
            {!isLoggedIn ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 rounded-xl border border-[#d1e4ff] bg-white text-xs font-bold text-[#00668a] hover:bg-[#f8f9ff] text-center flex items-center justify-center gap-1.5"
                >
                  <LogIn size={14} />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#00668a] text-white text-xs font-extrabold text-center flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <UserPlus size={14} />
                  <span>Sign Up Free</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#d1e4ff] text-xs font-bold text-[#001d36] flex items-center gap-2"
                >
                  <UserIcon size={16} className="text-[#00668a]" />
                  <span>My Profile & Stats</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    handleSignOut()
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-50 text-xs font-bold text-[#ba1a1a] flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            <div className="pt-2">
              <InstallButton
                variant="header"
                className="w-full justify-center text-xs py-2.5"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

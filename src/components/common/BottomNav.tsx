/**
 * Bottom Navigation Component
 *
 * Primary navigation for mobile-first experience.
 * Uses semantic HTML with proper link structure for SEO crawlability.
 * Internal linking helps search engines discover and rank all important pages.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Scan, Map, History, User } from 'lucide-react'
import { cn } from '@/lib/utils'

import { useTranslation } from '@/lib/i18n/useTranslation'

// Navigation tabs with SEO-friendly link structure
const tabs = [
  { name: 'Home',     key: 'nav_home',      href: '/home',     icon: 'home' },
  { name: 'Scan',     key: 'nav_scan',      href: '/scan',     icon: 'qr_code_scanner' },
  { name: 'Reports',  key: 'nav_reports',   href: '/history',  icon: 'analytics' },
  { name: 'Map',      key: 'nav_map',       href: '/map',      icon: 'map' },
  { name: 'Verify',   key: 'nav_verify',    href: '/verify',   icon: 'verified' },
  { name: 'Assistant', key: 'nav_assistant', href: '/chat',    icon: 'smart_toy' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none p-3 pb-safe">
      <nav className="bg-[#f8f9ff]/90 backdrop-blur-xl border border-[#d1e4ff] ambient-shadow rounded-full h-16 w-full max-w-xl flex items-center justify-around px-3 pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/home' && pathname?.startsWith(tab.href))
          const label = t(tab.key, tab.name)

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-1.5 rounded-full active:scale-90 transition-all duration-300 ease-out",
                isActive 
                  ? "bg-[#38bdf8] text-[#004965] shadow-sm font-semibold" 
                  : "text-[#51666d] hover:bg-[#cde3eb]/50"
              )}
            >
              <span className={cn(
                "material-symbols-outlined text-xl transition-all",
                isActive && "filled"
              )}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-medium tracking-tight leading-none mt-0.5">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Check, Smartphone } from 'lucide-react'
import { usePwaInstall } from '@/hooks/usePwaInstall'
import { IosInstallModal } from '@/components/pwa/IosInstallModal'

interface InstallButtonProps {
  label?: string
  variant?: 'header' | 'dashboard' | 'hero' | 'guide' | 'footer'
  showInstalledBadge?: boolean
  className?: string
}

export function InstallButton({
  label,
  variant = 'header',
  showInstalledBadge = false,
  className = '',
}: InstallButtonProps) {
  const router = useRouter()
  const { isMounted, isInstallable, isInstalled, isIos, promptInstall } = usePwaInstall()
  const [showIosModal, setShowIosModal] = useState(false)

  if (!isMounted) return null

  // 1. App already installed
  if (isInstalled) {
    if (!showInstalledBadge) return null

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 ${className}`}
      >
        <Check size={14} className="text-emerald-600" />
        <span>MilkGuard Installed</span>
      </div>
    )
  }

  // 2. Click handler
  const handleClick = async () => {
    if (isInstallable) {
      await promptInstall()
      return
    }

    if (isIos) {
      setShowIosModal(true)
      return
    }

    // Fallback: navigate to dedicated PWA install guide with browser-specific instructions
    router.push('/download')
  }

  // Default labels
  const buttonLabel = label || (variant === 'dashboard' ? 'Install App' : 'Install MilkGuard')

  // Variant styles
  let variantStyles = 'bg-[#e5efff] text-[#00668a] hover:bg-[#c4e7ff] text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm'

  if (variant === 'dashboard') {
    variantStyles = 'hidden sm:flex items-center gap-1.5 bg-[#00668a] hover:bg-[#004c69] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all'
  } else if (variant === 'hero' || variant === 'guide') {
    variantStyles = 'w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00668a] hover:bg-[#004c69] text-white px-6 py-3 rounded-xl text-sm font-extrabold shadow-md transition-all'
  } else if (variant === 'footer') {
    variantStyles = 'hover:text-white transition-colors text-xs font-semibold text-[#c4e7ff] bg-transparent border-0 p-0 cursor-pointer'
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-1.5 ${variantStyles} ${className}`}
        aria-label={buttonLabel}
      >
        {variant === 'dashboard' ? (
          <>
            <Smartphone size={14} />
            <span>{buttonLabel}</span>
            <Download size={12} className="opacity-80" />
          </>
        ) : (
          <>
            <Download size={variant === 'guide' || variant === 'hero' ? 18 : 15} />
            <span>{buttonLabel}</span>
          </>
        )}
      </button>

      <IosInstallModal
        isOpen={showIosModal}
        onClose={() => setShowIosModal(false)}
      />
    </>
  )
}

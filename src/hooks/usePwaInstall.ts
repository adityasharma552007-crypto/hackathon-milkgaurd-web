'use client'

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (typeof window === 'undefined') return

    // 1. Detect if running as installed standalone PWA
    const checkIsInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isNavigatorStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
      const isAndroidApp = document.referrer.includes('android-app://')
      return Boolean(isStandalone || isNavigatorStandalone || isAndroidApp)
    }

    setIsInstalled(checkIsInstalled())

    // 2. Detect iOS (Safari on iOS doesn't support beforeinstallprompt, requires manual Add to Home Screen)
    const ua = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream
    setIsIos(isIosDevice)

    // 3. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    // 4. Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    // 5. Media query listener for display-mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange)
      }
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false
    }

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
        setDeferredPrompt(null)
        return true
      }
      return false
    } catch (err) {
      console.error('[PWA] Error calling install prompt:', err)
      return false
    }
  }, [deferredPrompt])

  return {
    isMounted,
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIos,
    promptInstall,
  }
}

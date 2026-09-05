'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker after window load to prevent competing with initial critical render
      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          })

          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (
                  installingWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  console.log('[PWA] New content available; please refresh.')
                }
              })
            }
          })
        } catch (error) {
          console.warn('[PWA] Service Worker registration failed:', error)
        }
      }

      if (document.readyState === 'complete') {
        register()
      } else {
        window.addEventListener('load', register)
        return () => window.removeEventListener('load', register)
      }
    }
  }, [])

  return null
}

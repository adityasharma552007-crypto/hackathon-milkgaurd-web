/**
 * Google Analytics 4 Integration for Next.js 14
 *
 * This component loads GA4 via gtag.js and tracks page views automatically.
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a GA4 property at https://analytics.google.com
 * 2. Copy your Measurement ID (format: G-XXXXXXXXXX)
 * 3. Add to .env.local: NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 * 4. For production tracking, also add to Vercel environment variables
 *
 * EVENTS TRACKED:
 * - page_view (automatic)
 * - generate_lead (when user starts a milk test)
 * - Custom events can be added via trackEvent() helper
 */

'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Get GA ID from environment - will be undefined if not configured
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export function GoogleAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (!GA_ID) return

    // Load gtag.js script dynamically
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    script.async = true
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      // @ts-ignore - gtag is loaded dynamically
      window.dataLayer.push(arguments)
    }

    // Configure GA4
    gtag('js', new Date())
    gtag('config', GA_ID, {
      // Recommended GA4 configuration
      send_page_view: true,
      anonymize_ip: true, // Privacy-friendly: anonymize IP addresses
    })
  }, [])

  // Track page views on navigation (for client-side routing)
  useEffect(() => {
    if (!GA_ID || !window.gtag) return

    // Send page view event for each route change
    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_title: document.title,
    })
  }, [pathname])

  return null // This is a head-only component
}

// =============================================================================
// HELPER FUNCTIONS FOR EVENT TRACKING
// =============================================================================

/**
 * Track custom events in GA4
 *
 * Usage examples:
 * - trackEvent('start_milk_test', { method: 'hardware' })
 * - trackEvent('view_results', { safety_score: 85 })
 * - trackEvent('download_report', { format: 'pdf' })
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) {
    console.debug('GA not initialized, skipping event:', eventName)
    return
  }

  window.gtag('event', eventName, eventParams)
}

/**
 * Track milk test initiation (conversion event)
 * Call this when user clicks "Start Scan" button
 */
export function trackTestInitiation(method: 'hardware' | 'simulation' = 'hardware') {
  trackEvent('generate_lead', {
    method,
    currency: 'INR',
    value: 0, // Free tier
  })
}

/**
 * Track completed milk test with results
 * Call this when scan completes successfully
 */
export function trackTestCompletion(params: {
  safetyScore: number
  adulterantsDetected: number
  testDuration: number
}) {
  trackEvent('milk_test_complete', {
    safety_score: params.safetyScore,
    adulterants_detected: params.adulterantsDetected,
    test_duration_ms: params.testDuration,
  })
}

/**
 * Track hardware connection events
 */
export function trackHardwareConnection(connected: boolean) {
  trackEvent('hardware_connection', {
    status: connected ? 'connected' : 'disconnected',
  })
}

// Declare gtag type for TypeScript
declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

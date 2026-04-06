/**
 * MetaDescription Component & Utilities
 *
 * Provides consistent meta descriptions across pages.
 * Meta descriptions don't directly affect rankings but influence click-through rates.
 *
 * Best Practices:
 * - Keep between 150-160 characters
 * - Include primary keyword naturally
 * - Add a call-to-action
 * - Make each page unique
 */

import React from 'react'

/**
 * Pre-written meta descriptions for common pages
 * These are optimized for click-through rates and keyword relevance
 */
export const META_DESCRIPTIONS = {
  // ── HOME PAGE ───────────────────────────────────────────────────────────────
  home: "Detect milk adulteration instantly with AI-powered spectral analysis. Contactless milk purity testing with FSSAI-compliant reporting. Protect your family from harmful adulterants like urea, detergent, and starch.",

  // ── TEST PAGE ───────────────────────────────────────────────────────────────
  test: "Start your milk quality test now. Our AI analyzes 18 wavelengths to detect 7+ common adulterants in just 8 seconds. No touching, no contamination - completely contactless detection.",

  // ── RESULTS PAGE ────────────────────────────────────────────────────────────
  results: "View your milk test results with detailed SafetyScore analysis. Get instant adulteration detection results, historical trends, and FSSAI compliance verification.",

  // ── ABOUT PAGE ──────────────────────────────────────────────────────────────
  about: "Learn about MilkGuard AI - India's trusted milk adulteration detection system. Built by Team API Avengers to protect families from food adulteration using cutting-edge AI technology.",

  // ── HOW IT WORKS PAGE ───────────────────────────────────────────────────────
  howItWorks: "Discover how MilkGuard uses near-infrared (NIR) spectral analysis to detect milk adulteration. Learn about our AI model, FSSAI compliance, and 8-second testing process.",

  // ── FAQ PAGE ────────────────────────────────────────────────────────────────
  faq: "Find answers to common questions about milk purity testing, adulteration detection, FSSAI standards, and how to use MilkGuard. Get help with hardware setup and test interpretation.",

  // ── HISTORY PAGE ────────────────────────────────────────────────────────────
  history: "Track your milk testing history with detailed records and trend analysis. Monitor vendor quality over time and download FSSAI-compliant reports for documentation.",

  // ── HARDWARE PAGE ───────────────────────────────────────────────────────────
  hardware: "Connect your MilkGuard Pod device for contactless milk testing. Setup guide, troubleshooting, and firmware updates for your spectral analysis hardware.",

  // ── PROFILE PAGE ────────────────────────────────────────────────────────────
  profile: "Manage your MilkGuard account settings, view testing statistics, and customize your food safety preferences. Update profile information and notification settings.",
} as const

/**
 * Get meta description for a page
 * Falls back to default if page key not found
 */
export function getPageDescription(pageKey: keyof typeof META_DESCRIPTIONS | string): string {
  if (pageKey in META_DESCRIPTIONS) {
    return META_DESCRIPTIONS[pageKey as keyof typeof META_DESCRIPTIONS]
  }
  return META_DESCRIPTIONS.home
}

/**
 * Validate meta description length
 * Returns true if within optimal range (150-160 chars)
 */
export function isValidMetaDescription(description: string): boolean {
  const length = description.length
  return length >= 140 && length <= 170
}

/**
 * Truncate meta description to optimal length
 * Adds ellipsis if truncated
 */
export function truncateMetaDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) {
    return description
  }

  // Find last space before maxLength to avoid cutting words
  const truncated = description.slice(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxLength - 20) {
    return truncated.slice(0, lastSpace) + '...'
  }
  return truncated + '...'
}

/**
 * SEO-friendly paragraph component
 * Use for content that should be readable and keyword-rich
 */
interface SEOParagraphProps {
  children: React.ReactNode
  className?: string
  /** Primary keyword to emphasize */
  highlightKeyword?: string
}

export function SEOParagraph({ children, className, highlightKeyword }: SEOParagraphProps) {
  const content = highlightKeyword && typeof children === 'string'
    ? (children as string).split(highlightKeyword).map((part, i, arr) => (
        <React.Fragment key={i}>
          {part}
          {i < arr.length - 1 && (
            <strong className="text-[#1A6B4A]">{highlightKeyword}</strong>
          )}
        </React.Fragment>
      ))
    : children

  return (
    <p className={`text-slate-600 leading-relaxed ${className || ''}`}>
      {content}
    </p>
  )
}

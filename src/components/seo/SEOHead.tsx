/**
 * SEOHead Component
 *
 * Reusable component for consistent SEO meta tags on any page.
 * Use this when you need page-specific SEO that extends the root layout.
 *
 * Features:
 * - Dynamic title and description
 * - Page-specific Open Graph tags
 * - Twitter Card tags
 * - Canonical URL
 * - JSON-LD structured data
 */

import { Metadata } from 'next'

interface SEOHeadProps {
  /** Page-specific title (will be appended with "| MilkGuard") */
  title: string
  /** Page-specific description for search engines */
  description: string
  /** Canonical URL for this page (prevents duplicate content) */
  canonicalUrl?: string
  /** OG image URL (should be 1200x630px) */
  ogImage?: string
  /** Additional keywords for this specific page */
  keywords?: string[]
  /** Whether this page should be indexed by search engines */
  noIndex?: boolean
}

/**
 * Generate metadata object for a specific page
 * Use this in your page's export const metadata
 */
export function generatePageMetadata({
  title,
  description,
  canonicalUrl,
  ogImage,
  keywords,
  noIndex = false,
}: SEOHeadProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://milkguard.vercel.app'
  const fullCanonicalUrl = canonicalUrl || siteUrl

  return {
    title,
    description,
    keywords: keywords?.join(', '),

    // Open Graph
    openGraph: {
      title,
      description,
      url: fullCanonicalUrl,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
        : [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: title }],
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage || `${siteUrl}/og-image.png`,
    },

    // Robots
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },

    // Canonical URL
    alternates: {
      canonical: fullCanonicalUrl,
    },
  }
}

/**
 * Generate JSON-LD structured data for a page
 * Use this for article, FAQ, or other specific content types
 */
export function generateArticleJsonLd(params: {
  headline: string
  description: string
  datePublished: string
  dateModified?: string
  author?: string
}): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.headline,
    description: params.description,
    datePublished: params.datePublished,
    dateModified: params.dateModified || params.datePublished,
    author: params.author ? { '@type': 'Organization', name: params.author } : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Team API Avengers',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
  })
}

/**
 * Generate FAQ JSON-LD structured data
 * Use this on FAQ pages for rich snippets in search results
 */
export function generateFAQJsonLd(faqs: Array<{ question: string; answer: string }>): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  })
}

/**
 * Generate HowTo JSON-LD structured data
 * Use this on how-it-works pages for rich snippets
 */
export function generateHowToJsonLd(steps: Array<{
  name: string
  text: string
  image?: string
}>): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How MilkGuard Detects Adulteration',
    step: steps.map((step) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  })
}

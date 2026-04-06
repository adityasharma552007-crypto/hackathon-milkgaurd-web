/**
 * Dynamic Sitemap Generator for Next.js 14
 *
 * This file automatically generates a sitemap.xml for search engines.
 * It includes all public routes with appropriate priority and change frequency.
 *
 * SITEMAP SUBMISSION INSTRUCTIONS:
 * =================================
 * 1. Google Search Console:
 *    - Go to https://search.google.com/search-console
 *    - Add your property (if not already added)
 *    - Navigate to "Sitemaps" in the left sidebar
 *    - Submit: sitemap.xml
 *
 * 2. Bing Webmaster Tools:
 *    - Go to https://www.bing.com/webmasters
 *    - Add/verify your site
 *    - Navigate to "Sitemaps"
 *    - Submit: sitemap.xml
 *
 * 3. The sitemap is automatically generated at:
 *    - Development: http://localhost:3000/sitemap.xml
 *    - Production: https://your-domain.com/sitemap.xml
 *
 * TODO: Update the siteUrl to your production domain
 */

import { MetadataRoute } from 'next'

// =============================================================================
// CONFIGURATION
// =============================================================================
// TODO: Replace with your production domain
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://milkguard.vercel.app'

// =============================================================================
// ROUTE CONFIGURATION
// =============================================================================
// Define all public routes with their SEO priorities
interface RouteConfig {
  path: string
  priority: number
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  includeInSitemap: boolean
}

const routes: RouteConfig[] = [
  // ── HIGH PRIORITY (Core user flows) ─────────────────────────────────────────
  { path: '/', priority: 1.0, changeFrequency: 'weekly', includeInSitemap: true },
  { path: '/test', priority: 0.9, changeFrequency: 'daily', includeInSitemap: true },
  { path: '/scan', priority: 0.9, changeFrequency: 'daily', includeInSitemap: true },

  // ── MEDIUM PRIORITY (Important content pages) ───────────────────────────────
  { path: '/results', priority: 0.8, changeFrequency: 'daily', includeInSitemap: true },
  { path: '/history', priority: 0.8, changeFrequency: 'daily', includeInSitemap: true },
  { path: '/hardware', priority: 0.7, changeFrequency: 'weekly', includeInSitemap: true },

  // ── STANDARD PRIORITY (Informational pages) ─────────────────────────────────
  { path: '/about', priority: 0.7, changeFrequency: 'monthly', includeInSitemap: true },
  { path: '/how-it-works', priority: 0.7, changeFrequency: 'monthly', includeInSitemap: true },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly', includeInSitemap: true },
  { path: '/learn', priority: 0.7, changeFrequency: 'weekly', includeInSitemap: true },
  { path: '/map', priority: 0.7, changeFrequency: 'weekly', includeInSitemap: true },
  { path: '/chat', priority: 0.7, changeFrequency: 'weekly', includeInSitemap: true },
  { path: '/profile', priority: 0.6, changeFrequency: 'weekly', includeInSitemap: true },

  // ── AUTH PAGES (Lower priority, less frequently crawled) ────────────────────
  { path: '/auth/login', priority: 0.5, changeFrequency: 'monthly', includeInSitemap: true },
  { path: '/auth/signup', priority: 0.5, changeFrequency: 'monthly', includeInSitemap: true },
]

// =============================================================================
// ROUTES TO EXCLUDE FROM SITEMAP
// =============================================================================
// These routes will be disallowed in robots.txt and excluded from sitemap
const excludedRoutes = [
  '/api',
  '/admin',
  '/private',
  '/_next',
  '/auth/callback',
]

/**
 * Generate last modified date
 * Returns ISO 8601 formatted date
 */
function getLastModified(path: string): Date {
  // Content pages change less frequently
  const contentPages = ['/about', '/how-it-works', '/faq']
  if (contentPages.includes(path)) {
    return new Date('2026-01-15') // Static content date
  }

  // Dynamic pages have more recent dates
  return new Date()
}

/**
 * Generate sitemap entries for all routes
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return routes
    .filter((route) => route.includeInSitemap)
    .map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: getLastModified(route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
}

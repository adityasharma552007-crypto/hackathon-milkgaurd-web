/**
 * Authoritative Site Configuration for MilkGuard
 *
 * Ensures canonical URLs, OpenGraph, sitemaps, and redirects strictly match
 * the authoritative deployment at https://hackathon-milkgaurd-web.vercel.app
 * and never resolve to the external/unrelated milkguard.vercel.app.
 */

export const PRODUCTION_SITE_URL = 'https://hackathon-milkgaurd-web.vercel.app'

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl) {
    const clean = envUrl.trim().replace(/\/$/, '')
    // Guard against incorrect milkguard.vercel.app (missing the 'a' in gaurd)
    if (clean === 'https://milkguard.vercel.app' || clean === 'http://milkguard.vercel.app') {
      return PRODUCTION_SITE_URL
    }
    return clean
  }
  return PRODUCTION_SITE_URL
}

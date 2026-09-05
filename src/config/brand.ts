/**
 * MilkGuard Centralized Brand Configuration
 * Single source of truth for all brand assets, logos, icons, and metadata.
 */

export const BRAND_CONFIG = {
  name: 'MilkGuard',
  shortName: 'MilkGuard',
  tagline: 'Pure Milk. Real Results.',
  description: 'AI-Powered Milk Adulteration Detection & Spectral Analysis System',
  
  // Brand Assets
  assets: {
    // Primary transparent brand badge (emblem + wordmark + tagline)
    logo: '/brand/logo.png',
    
    // Circular emblem icon (magnifying glass, milk drop, shield, sensor tube)
    logoIcon: '/brand/logo-icon.png',
    
    // High-res full badge
    logoFull: '/brand/logo-full.png',
    
    // PWA & Browser icons
    favicon: '/favicon.ico',
    favicon16: '/favicon-16x16.png',
    favicon32: '/favicon-32x32.png',
    appleTouchIcon: '/apple-touch-icon.png',
    icon192: '/icon-192x192.png',
    icon512: '/icon-512x512.png',
    
    // Open Graph / Social sharing preview
    ogImage: '/og-image.png',
  },
  
  // Theme styling tokens aligned with new official brand mark
  colors: {
    primary: '#00668a',
    primaryDark: '#004c69',
    accent: '#38bdf8',
    shieldBlue: '#00288e',
    pureWhite: '#ffffff',
  }
} as const;

export type BrandConfig = typeof BRAND_CONFIG;

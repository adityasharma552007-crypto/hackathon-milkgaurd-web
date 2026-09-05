import type { Metadata } from 'next'
import { PwaInstallGuide } from '@/components/download/PwaInstallGuide'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hackathon-milkgaurd-web.vercel.app'

export const metadata: Metadata = {
  title: 'Install MilkGuard App | Progressive Web App (PWA)',
  description: 'Install MilkGuard directly on Android, iOS, and Desktop. Fast, secure AI-powered milk adulteration detection app without APK downloads.',
  keywords: 'milkguard pwa, install milkguard, milk testing app, milk adulteration detection, food safety pwa',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Install MilkGuard App | Progressive Web App',
    description: 'Install MilkGuard on Android, iOS, and Desktop with instant launch and AI-powered milk purity analysis.',
    url: `${siteUrl}/download`,
    siteName: 'MilkGuard',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'MilkGuard - Install Progressive Web App',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Install MilkGuard App',
    description: 'Instant AI-powered milk adulteration detection on your device',
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: `${siteUrl}/download`,
  },
}

export default function InstallPage() {
  return <PwaInstallGuide />
}

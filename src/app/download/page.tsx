import type { Metadata } from 'next'
import { PwaInstallGuide } from '@/components/download/PwaInstallGuide'
import { Navbar } from '@/components/common/Navbar'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { getSiteUrl } from '@/config/site'

const siteUrl = getSiteUrl()

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
  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4">
        <Breadcrumbs items={[{ label: 'Install App', href: '/download' }]} />
      </div>
      <main className="flex-1">
        <PwaInstallGuide />
      </main>
    </div>
  )
}

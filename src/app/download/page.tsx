import type { Metadata } from 'next'
import { DownloadAPK } from '@/components/download/DownloadAPK'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://milkguard.vercel.app'

export const metadata: Metadata = {
  title: 'Download MilkGuard APK | Android App',
  description: 'Download MilkGuard for Android - AI-powered milk adulteration detection app. Scan milk samples, get instant results, and protect your family from harmful contaminants.',
  keywords: 'milkguard apk download, milk testing app, adulteration detection android, milk safety app',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Download MilkGuard APK | Android App',
    description: 'Download MilkGuard for Android - AI-powered milk adulteration detection in 8 seconds',
    url: `${siteUrl}/download`,
    siteName: 'MilkGuard',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'MilkGuard - AI-Powered Milk Adulteration Detection',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Download MilkGuard APK',
    description: 'AI-powered milk adulteration detection in your pocket',
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: `${siteUrl}/download`,
  },
}

export default function DownloadPage() {
  return <DownloadAPK />
}

/**
 * Page-specific Metadata Configuration
 *
 * Each page exports its own metadata that extends the root layout.
 * This file contains all metadata configurations for SEO optimization.
 *
 * TODO: Update siteUrl to your production domain
 */

import { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://milkguard.vercel.app'

// =============================================================================
// HOME PAGE (/)
// Primary keyword: "milk adulteration detection"
// =============================================================================
export const homeMetadata: Metadata = {
  title: 'MilkGuard | AI-Powered Milk Adulteration Detection System',
  description:
    'Detect milk adulteration instantly with AI-powered spectral analysis. Contactless milk purity testing that identifies urea, detergent, starch, and 7+ adulterants in 8 seconds. FSSAI-compliant.',
  keywords: [
    'milk adulteration detection',
    'milk purity test',
    'milk quality checker',
    'food safety AI',
    'contactless milk testing',
    'FSSAI milk standards',
    'spectral analysis milk',
    'AI food testing',
  ].join(', '),
  openGraph: {
    title: 'MilkGuard | AI-Powered Milk Adulteration Detection',
    description: 'Protect your family from adulterated milk. AI-powered detection in 8 seconds.',
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'MilkGuard - Milk Adulteration Detection System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MilkGuard | AI-Powered Milk Adulteration Detection',
    description: 'Detect milk adulteration in 8 seconds with AI-powered spectral analysis.',
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
}

// =============================================================================
// TEST PAGE (/test or /scan)
// Primary keyword: "detect milk quality online"
// =============================================================================
export const testMetadata: Metadata = {
  title: 'Start Milk Quality Test | Detect Adulteration Online',
  description:
    'Start your milk quality test now. Our AI analyzes 18 wavelengths to detect urea, detergent, starch, formalin, and other adulterants in just 8 seconds. Completely contactless.',
  keywords: [
    'detect milk quality online',
    'milk test online',
    'check milk purity',
    'milk adulteration test',
    'online milk testing',
    'AI milk scanner',
    'milk safety test',
  ].join(', '),
  openGraph: {
    title: 'Start Milk Quality Test | Detect Adulteration',
    description: 'Test your milk for adulterants in 8 seconds. No touching, no contamination.',
    url: `${siteUrl}/scan`,
    images: [
      {
        url: `${siteUrl}/og-test.png`,
        width: 1200,
        height: 630,
        alt: 'MilkGuard Test Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start Milk Quality Test',
    description: 'Test your milk for 7+ adulterants in 8 seconds.',
  },
  alternates: {
    canonical: `${siteUrl}/scan`,
  },
}

// =============================================================================
// RESULTS PAGE (/results or /history/[id])
// Primary keyword: "milk test results analysis"
// =============================================================================
export const resultsMetadata: Metadata = {
  title: 'Milk Test Results | SafetyScore Analysis & Adulteration Report',
  description:
    'View detailed milk test results with SafetyScore analysis. Get instant adulteration detection results, historical trends, contaminant breakdown, and FSSAI compliance verification.',
  keywords: [
    'milk test results analysis',
    'milk safety score',
    'adulteration report',
    'milk quality results',
    'FSSAI compliance report',
    'milk test history',
  ].join(', '),
  openGraph: {
    title: 'Milk Test Results | SafetyScore Analysis',
    description: 'Detailed adulteration analysis with SafetyScore and FSSAI compliance.',
    url: `${siteUrl}/history`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Milk Test Results',
    description: 'View your SafetyScore and detailed adulteration analysis.',
  },
  alternates: {
    canonical: `${siteUrl}/history`,
  },
}

// =============================================================================
// ABOUT PAGE (/about)
// Primary keyword: "about MilkGuard AI"
// =============================================================================
export const aboutMetadata: Metadata = {
  title: 'About MilkGuard | AI Food Safety by Team API Avengers',
  description:
    'Learn about MilkGuard AI - India\'s trusted milk adulteration detection system. Built by Team API Avengers to protect families from food adulteration using cutting-edge NIR spectral analysis and AI.',
  keywords: [
    'about MilkGuard AI',
    'Team API Avengers',
    'milk safety company',
    'food safety startup India',
    'AI food testing company',
    'milk adulteration solution',
  ].join(', '),
  openGraph: {
    title: 'About MilkGuard | AI Food Safety',
    description: 'Built by Team API Avengers to protect Indian families from food adulteration.',
    url: `${siteUrl}/about`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About MilkGuard',
    description: 'Learn about our mission to make milk safe for every Indian family.',
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
}

// =============================================================================
// HOW IT WORKS PAGE (/how-it-works)
// Primary keyword: "how milk adulteration detection works"
// =============================================================================
export const howItWorksMetadata: Metadata = {
  title: 'How MilkGuard Works | NIR Spectral Analysis & AI Detection',
  description:
    'Discover how MilkGuard uses near-infrared (NIR) spectral analysis and AI to detect milk adulteration. Learn about our 18-wavelength scanning, machine learning model, and 8-second testing process.',
  keywords: [
    'how milk adulteration detection works',
    'NIR spectral analysis',
    'milk testing technology',
    'AI detection process',
    'spectral scanning milk',
    'how MilkGuard works',
    'milk purity technology',
  ].join(', '),
  openGraph: {
    title: 'How MilkGuard Works | NIR Spectral Analysis',
    description: 'Learn how our AI analyzes 18 wavelengths to detect adulterants in 8 seconds.',
    url: `${siteUrl}/how-it-works`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How MilkGuard Works',
    description: 'NIR spectral analysis meets AI for instant adulteration detection.',
  },
  alternates: {
    canonical: `${siteUrl}/how-it-works`,
  },
}

// =============================================================================
// FAQ PAGE (/faq)
// Primary keyword: "milk purity test FAQ"
// =============================================================================
export const faqMetadata: Metadata = {
  title: 'FAQ | Milk Purity Test Questions & Answers',
  description:
    'Find answers to common questions about milk purity testing, adulteration detection, FSSAI standards, and how to use MilkGuard. Get help with hardware setup, test interpretation, and safety scores.',
  keywords: [
    'milk purity test FAQ',
    'milk testing questions',
    'adulteration detection help',
    'FSSAI standards FAQ',
    'MilkGuard how to use',
    'milk safety questions',
    'spectral analysis FAQ',
  ].join(', '),
  openGraph: {
    title: 'FAQ | Milk Purity Test Questions',
    description: 'Answers to common questions about milk testing and adulteration detection.',
    url: `${siteUrl}/faq`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Milk Purity Test FAQ',
    description: 'Get answers to your milk testing questions.',
  },
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
}

// =============================================================================
// HISTORY PAGE (/history)
// =============================================================================
export const historyMetadata: Metadata = {
  title: 'Test History | Track Milk Quality Over Time',
  description:
    'Track your milk testing history with detailed records and trend analysis. Monitor vendor quality over time, download FSSAI-compliant reports, and visualize safety trends.',
  keywords: [
    'milk test history',
    'milk quality trends',
    'vendor quality tracking',
    'FSSAI reports',
    'milk testing records',
  ].join(', '),
  openGraph: {
    title: 'Test History | Track Milk Quality',
    description: 'Monitor your milk vendor quality over time with detailed trend analysis.',
    url: `${siteUrl}/history`,
  },
  alternates: {
    canonical: `${siteUrl}/history`,
  },
}

// =============================================================================
// HARDWARE PAGE (/hardware)
// =============================================================================
export const hardwareMetadata: Metadata = {
  title: 'Connect Hardware | MilkGuard Pod Setup',
  description:
    'Connect your MilkGuard Pod device for contactless milk testing. Setup guide, device pairing, troubleshooting, and firmware updates for your spectral analysis hardware.',
  keywords: [
    'MilkGuard Pod setup',
    'connect milk scanner',
    'spectral device pairing',
    'hardware setup',
    'milk testing device',
  ].join(', '),
  openGraph: {
    title: 'Connect Hardware | MilkGuard Pod',
    description: 'Set up your MilkGuard Pod for contactless milk adulteration detection.',
    url: `${siteUrl}/hardware`,
  },
  alternates: {
    canonical: `${siteUrl}/hardware`,
  },
}

// =============================================================================
// LEARN PAGE (/learn)
// =============================================================================
export const learnMetadata: Metadata = {
  title: 'Learn | Milk Safety Education & Resources',
  description:
    'Educational resources about milk safety, adulteration types, health impacts, and FSSAI regulations. Learn about common adulterants and how to protect your family.',
  keywords: [
    'milk safety education',
    'adulteration types',
    'FSSAI regulations',
    'milk health impacts',
    'food safety resources',
  ].join(', '),
  openGraph: {
    title: 'Learn | Milk Safety Education',
    description: 'Educational resources about milk adulteration and food safety.',
    url: `${siteUrl}/learn`,
  },
  alternates: {
    canonical: `${siteUrl}/learn`,
  },
}

// =============================================================================
// MAP PAGE (/map)
// =============================================================================
export const mapMetadata: Metadata = {
  title: 'Vendor Map | Find Safe Milk Suppliers Near You',
  description:
    'Interactive map of milk vendors with safety ratings. Find trusted milk suppliers in your area based on community testing data and safety scores.',
  keywords: [
    'milk vendor map',
    'safe milk suppliers',
    'milk safety ratings',
    'trusted milk vendors',
    'community milk testing',
  ].join(', '),
  openGraph: {
    title: 'Vendor Map | Find Safe Milk',
    description: 'Find trusted milk vendors in your area with community safety ratings.',
    url: `${siteUrl}/map`,
  },
  alternates: {
    canonical: `${siteUrl}/map`,
  },
}

// =============================================================================
// CHAT PAGE (/chat)
// =============================================================================
export const chatMetadata: Metadata = {
  title: 'AI Chat Assistant | Milk Safety Questions',
  description:
    'Chat with our AI assistant about milk safety, adulteration detection, test results interpretation, and FSSAI standards. Get instant answers to your food safety questions.',
  keywords: [
    'milk safety chat',
    'AI food assistant',
    'adulteration help',
    'milk testing support',
    'FSSAI questions',
  ].join(', '),
  openGraph: {
    title: 'AI Chat Assistant',
    description: 'Get instant answers about milk safety and adulteration detection.',
    url: `${siteUrl}/chat`,
  },
  alternates: {
    canonical: `${siteUrl}/chat`,
  },
}

// =============================================================================
// PROFILE PAGE (/profile)
// =============================================================================
export const profileMetadata: Metadata = {
  title: 'Profile | Account Settings',
  description:
    'Manage your MilkGuard account settings, view testing statistics, customize notifications, and update your food safety preferences.',
  keywords: [
    'MilkGuard profile',
    'account settings',
    'testing statistics',
    'user preferences',
  ].join(', '),
  openGraph: {
    title: 'Profile | Account Settings',
    description: 'Manage your MilkGuard account and preferences.',
    url: `${siteUrl}/profile`,
  },
  alternates: {
    canonical: `${siteUrl}/profile`,
  },
}

// =============================================================================
// AUTH PAGES
// =============================================================================
export const loginMetadata: Metadata = {
  title: 'Sign In | MilkGuard',
  description: 'Sign in to access your milk testing history, saved vendors, and personalized dashboard.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${siteUrl}/auth/login`,
  },
}

export const signupMetadata: Metadata = {
  title: 'Create Account | MilkGuard',
  description: 'Create a free MilkGuard account to start testing milk for adulteration and protect your family.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${siteUrl}/auth/signup`,
  },
}

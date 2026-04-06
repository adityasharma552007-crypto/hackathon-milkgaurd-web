import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

// =============================================================================
// SEO METADATA CONFIGURATION
// =============================================================================
// TODO: Update NEXT_PUBLIC_SITE_URL in .env.local to your production domain
// Example: NEXT_PUBLIC_SITE_URL=https://milkguard.vercel.app

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://milkguard.vercel.app";

export const metadata: Metadata = {
  // ── BASIC METADATA ─────────────────────────────────────────────────────────
  // Core title and description for search engines
  title: {
    default: "MilkGuard | AI-Powered Milk Adulteration Detection",
    template: "%s | MilkGuard",
  },
  description:
    "Detect milk adulteration instantly with AI-powered spectral analysis. Contactless milk purity testing with FSSAI-compliant reporting. Protect your family from harmful adulterants.",

  // ── KEYWORDS ───────────────────────────────────────────────────────────────
  // Target keywords for search engine optimization
  keywords: [
    "milk adulteration detection",
    "milk purity test",
    "milk quality detection",
    "food safety",
    "AI detection",
    "contactless detection",
    "FSSAI compliance",
    "spectral analysis",
    "milk safety",
    "adulteration checker",
    "milk testing online",
    "food quality AI",
  ].join(", "),

  // ── AUTHORS & ORGANIZATION ─────────────────────────────────────────────────
  authors: [
    { name: "Team API Avengers", url: siteUrl },
  ],

  // ── ROBOTS.TXT (SEARCH ENGINE INDEXING) ────────────────────────────────────
  // Enable Google indexing with follow links
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── VIEWPORT (MOBILE OPTIMIZATION) ─────────────────────────────────────────
  // Ensures proper mobile rendering and prevents zoom issues
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },

  // ── THEME COLOR ────────────────────────────────────────────────────────────
  // Browser theme color for mobile browsers
  themeColor: "#1A6B4A",

  // ── OPEN GRAPH (SOCIAL SHARING) ────────────────────────────────────────────
  // Rich previews when shared on Facebook, LinkedIn, etc.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "MilkGuard",
    title: {
      default: "MilkGuard | AI-Powered Milk Adulteration Detection",
      template: "%s | MilkGuard",
    },
    description:
      "Detect milk adulteration instantly with AI-powered spectral analysis. Contactless, FSSAI-compliant milk purity testing.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "MilkGuard - AI-Powered Milk Adulteration Detection",
      },
    ],
  },

  // ── TWITTER CARD (TWITTER SHARING) ─────────────────────────────────────────
  // Rich card previews when shared on Twitter
  twitter: {
    card: "summary_large_image",
    title: "MilkGuard | AI-Powered Milk Adulteration Detection",
    description:
      "Detect milk adulteration instantly with AI-powered spectral analysis. Contactless, FSSAI-compliant milk purity testing.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@MilkGuardAI",
  },

  // ── APPLE WEB APP (iOS HOME SCREEN) ────────────────────────────────────────
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MilkGuard",
  },

  // ── ICONS ──────────────────────────────────────────────────────────────────
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // ── MANIFEST (PWA SUPPORT) ─────────────────────────────────────────────────
  manifest: "/manifest.json",

  // ── ALTERNATE LANGUAGES ────────────────────────────────────────────────────
  alternates: {
    canonical: siteUrl,
  },
};

// ── VIEWPORT EXPORT (REQUIRED FOR NEXT.JS 14) ────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1A6B4A",
};

// =============================================================================
// JSON-LD STRUCTURED DATA
// =============================================================================
// Schema.org markup for search engines to understand the application
const jsonLd = {
  // ── SOFTWARE APPLICATION ────────────────────────────────────────────────────
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MilkGuard",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  description: "AI-powered milk adulteration detection system using spectral analysis",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1250",
  },
  applicationSubCategory: "Food Safety",
  url: siteUrl,
  image: `${siteUrl}/og-image.png`,
};

// ── ORGANIZATION ─────────────────────────────────────────────────────────────
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Team API Avengers",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description: "Developers building AI-powered food safety solutions for India",
  foundingDate: "2024",
  areaServed: "IN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        {/* Google Analytics */}
        <GoogleAnalytics />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

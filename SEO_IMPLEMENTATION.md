# SEO Implementation Guide for MilkGuard

This document provides comprehensive documentation for the SEO implementation in MilkGuard, a Next.js 14 milk adulteration detection web application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Metadata API](#metadata-api)
3. [Sitemap & Robots.txt](#sitemap--robotstxt)
4. [Google Analytics](#google-analytics)
5. [Structured Data (JSON-LD)](#structured-data-json-ld)
6. [SEO Components](#seo-components)
7. [Content Pages](#content-pages)
8. [Performance Optimization](#performance-optimization)

---

## Quick Start

### TODO Items Before Production Deployment

1. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

2. **Create OG Image**:
   - Design a 1200x630px image for social sharing
   - Save as `public/og-image.png`
   - Or use the placeholder `og-image.svg` as a starting point

3. **Submit Sitemap**:
   - Google Search Console: https://search.google.com/search-console
   - Bing Webmaster Tools: https://www.bing.com/webmasters

4. **Verify Analytics**:
   - Check GA4 property is receiving data
   - Test conversion tracking on scan initiation

---

## Metadata API

### Root Layout (`src/app/layout.tsx`)

The root layout contains comprehensive metadata that applies site-wide:

```typescript
export const metadata: Metadata = {
  title: {
    default: "MilkGuard | AI-Powered Milk Adulteration Detection",
    template: "%s | MilkGuard",
  },
  description: "...",
  keywords: ["milk adulteration detection", "milk purity test", ...],
  openGraph: { ... },
  twitter: { ... },
}
```

### Page-Specific Metadata

Each page can override/extend the root metadata:

```typescript
// src/app/about/page.tsx
import { aboutMetadata } from '@/app/page.metadata'

export const metadata: Metadata = aboutMetadata
```

### Target Keywords

| Page | Primary Keyword | Secondary Keywords |
|------|----------------|-------------------|
| `/` | milk adulteration detection | milk purity test, AI detection |
| `/scan` | detect milk quality online | milk test online, AI scanner |
| `/history` | milk test results analysis | SafetyScore, adulteration report |
| `/about` | about MilkGuard AI | Team API Avengers, food safety |
| `/how-it-works` | how milk adulteration detection works | NIR spectroscopy, AI process |
| `/faq` | milk purity test FAQ | milk testing questions, help |

---

## Sitemap & Robots.txt

### Sitemap (`src/app/sitemap.ts`)

Dynamic sitemap generator with priority levels:

- **Priority 1.0**: Home page
- **Priority 0.9**: Test/Scan pages
- **Priority 0.8**: Results/History
- **Priority 0.7**: Informational pages

Access at: `https://your-domain.com/sitemap.xml`

### Robots.txt (`public/robots.txt`)

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

Sitemap: https://your-domain.com/sitemap.xml
```

---

## Google Analytics

### Setup (`src/components/analytics/GoogleAnalytics.tsx`)

1. Create GA4 property at https://analytics.google.com
2. Copy Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to `.env.local`: `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`

### Tracked Events

- `page_view`: Automatic on route changes
- `generate_lead`: When user starts milk test
- `milk_test_complete`: When scan completes
- `hardware_connection`: Device connection status

### Usage

```typescript
import { trackEvent, trackTestInitiation } from '@/components/analytics/GoogleAnalytics'

// Track custom event
trackEvent('download_report', { format: 'pdf' })

// Track test initiation (conversion)
trackTestInitiation('hardware')
```

---

## Structured Data (JSON-LD)

### Types Implemented

1. **SoftwareApplication** - MilkGuard app information
2. **Organization** - Team API Avengers
3. **FAQPage** - FAQ page rich snippets
4. **HowTo** - Step-by-step process on how-it-works page
5. **Article** - For blog/content pages (if added later)

### Example

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "MilkGuard",
  "applicationCategory": "HealthApplication",
  "description": "AI-powered milk adulteration detection",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  }
}
```

---

## SEO Components

### Location: `src/components/seo/`

| Component | Purpose |
|-----------|---------|
| `SEOHead.tsx` | Metadata generation utilities |
| `PageTitle.tsx` | Consistent h1/h2/h3 headings |
| `MetaDescription.tsx` | Pre-written meta descriptions |

### Usage

```typescript
import { PageTitle, PageSubtitle } from '@/components/seo/PageTitle'
import { SEOParagraph } from '@/components/seo/MetaDescription'

<PageTitle as="h1">Main Title</PageTitle>
<PageSubtitle>Secondary description</PageSubtitle>
<SEOParagraph highlightKeyword="milk testing">
  Content with highlighted keyword
</SEOParagraph>
```

---

## Content Pages

### Created Pages

| Path | File | Description |
|------|------|-------------|
| `/about` | `src/app/about/page.tsx` | Company, mission, team |
| `/how-it-works` | `src/app/how-it-works/page.tsx` | Process explanation |
| `/faq` | `src/app/faq/page.tsx` | Common questions |

### SEO Features

- Proper heading hierarchy (h1 → h2 → h3)
- Keyword-rich content
- Internal linking to related pages
- JSON-LD structured data
- Mobile-responsive design

---

## Performance Optimization

### Core Web Vitals

| Metric | Target | How We Achieve It |
|--------|--------|------------------|
| LCP | < 2.5s | Optimized images, font loading |
| CLS | < 0.1 | Fixed dimensions, no layout shifts |
| FID | < 100ms | Client-side caching, minimal JS |

### Image Optimization

```typescript
import Image from 'next/image'

<Image
  src="/og-image.png"
  alt="MilkGuard dashboard"
  width={1200}
  height={630}
  priority // For above-fold images
/>
```

### Mobile Optimization

- Viewport meta tag configured
- Touch-friendly button sizes (min 44x44px)
- Responsive layouts
- Mobile-first design

---

## Sitemap Submission Checklist

### Google Search Console

1. Go to https://search.google.com/search-console
2. Add your property (domain)
3. Verify ownership (DNS record or HTML file)
4. Navigate to "Sitemaps"
5. Submit: `sitemap.xml`
6. Monitor crawl stats and index coverage

### Bing Webmaster Tools

1. Go to https://www.bing.com/webmasters
2. Add your site
3. Verify ownership
4. Navigate to "Sitemaps"
5. Submit: `sitemap.xml`

---

## Monitoring & Maintenance

### Regular Tasks

- [ ] Check Google Search Console for crawl errors
- [ ] Monitor GA4 for traffic anomalies
- [ ] Review keyword rankings monthly
- [ ] Update content pages quarterly
- [ ] Refresh sitemap when adding new pages

### Tools

- **Google Search Console**: Index coverage, search queries
- **Google Analytics 4**: Traffic, conversions, user behavior
- **PageSpeed Insights**: Performance scores
- **Rich Results Test**: Validate structured data

---

## Contact & Support

For SEO-related questions or issues, refer to:
- Next.js SEO documentation: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide

---

*Last updated: 2026-04-06*
*MilkGuard SEO Implementation v1.0*

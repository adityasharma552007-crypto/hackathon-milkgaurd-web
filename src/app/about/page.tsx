/**
 * About Page - MilkGuard
 *
 * SEO-optimized content about the company, mission, and team.
 * Primary keyword: "about MilkGuard AI"
 *
 * Metadata is configured in @/app/page.metadata.ts
 */

import { Metadata } from 'next'
import { aboutMetadata } from '@/app/page.metadata'
import { PageTitle, PageSubtitle } from '@/components/seo/PageTitle'
import { SEOParagraph } from '@/components/seo/MetaDescription'
import { Shield, Zap, Users, Target, Heart, Award } from 'lucide-react'

export const metadata: Metadata = aboutMetadata

// JSON-LD for Organization
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Team API Avengers',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://milkguard.vercel.app',
  description: 'Developers building AI-powered food safety solutions for India',
  foundingDate: '2024',
  areaServed: 'IN',
  sameAs: [
    // TODO: Add your social media links
    'https://github.com/your-org',
  ],
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F7F9F8] pb-24">
      <div className="max-w-md mx-auto bg-white shadow-xl">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        {/* ── HERO SECTION ────────────────────────────────────────────────── */}
        <header className="bg-gradient-to-b from-[#1A6B4A] to-[#134f37] text-white py-12 px-6">
          <PageTitle as="h1" className="text-white mb-2">About MilkGuard</PageTitle>
          <PageSubtitle className="text-green-200">
            Protecting Families, One Drop at a Time
          </PageSubtitle>
        </header>

        {/* ── MISSION SECTION ─────────────────────────────────────────────── */}
        <section className="py-8 px-6">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6" />
            Our Mission
          </h2>
          <SEOParagraph className="mb-4">
            MilkGuard was born from a simple yet powerful mission: <strong>to make safe milk accessible to every Indian family</strong>. With milk adulteration rates reaching alarming levels across India, we recognized the need for a fast, reliable, and accessible testing solution.
          </SEOParagraph>
          <SEOParagraph>
            Our <strong>AI-powered milk adulteration detection system</strong> uses cutting-edge near-infrared (NIR) spectral analysis to identify harmful contaminants in just 8 seconds — no laboratory required.
          </SEOParagraph>
        </section>

        {/* ── THE PROBLEM ─────────────────────────────────────────────────── */}
        <section className="py-8 px-6 bg-red-50 border-l-4 border-red-500">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-600" />
            The Problem We're Solving
          </h2>
          <div className="space-y-4 mt-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-3xl font-bold text-red-600 mb-1">97%</p>
              <p className="text-sm text-slate-600">
                of milk samples in Rajasthan contain harmful adulterants (FSSAI 2025)
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-3xl font-bold text-red-600 mb-1">7+</p>
              <p className="text-sm text-slate-600">
                Common adulterants including urea, detergent, formalin, and starch
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-3xl font-bold text-red-600 mb-1">Millions</p>
              <p className="text-sm text-slate-600">
                of families exposed to health risks from contaminated milk daily
              </p>
            </div>
          </div>
        </section>

        {/* ── OUR SOLUTION ────────────────────────────────────────────────── */}
        <section className="py-8 px-6">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6" />
            The MilkGuard Solution
          </h2>
          <SEOParagraph className="mb-4">
            MilkGuard combines <strong>hardware innovation with artificial intelligence</strong> to deliver laboratory-grade milk testing in a portable, affordable device.
          </SEOParagraph>
          <div className="grid gap-4 mt-6">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A6B4A] mb-1">8-Second Testing</h3>
                <p className="text-sm text-slate-600">
                  Get results faster than any traditional test kit
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A6B4A] mb-1">Contactless Detection</h3>
                <p className="text-sm text-slate-600">
                  NIR technology reads through containers — no touching, no contamination
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A6B4A] mb-1">FSSAI Compliant</h3>
                <p className="text-sm text-slate-600">
                  Every result compared against official FSSAI 2025-26 safety limits
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── TEAM SECTION ────────────────────────────────────────────────── */}
        <section className="py-8 px-6">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6" />
            Team API Avengers
          </h2>
          <SEOParagraph className="mb-4">
            We are a team of passionate developers, engineers, and food safety advocates dedicated to solving India's milk adulteration crisis through technology.
          </SEOParagraph>
          <div className="bg-gradient-to-r from-[#1A6B4A] to-[#134f37] text-white p-6 rounded-xl mt-4">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Built for India, By India
            </h3>
            <p className="text-green-100 text-sm">
              MilkGuard is proudly developed in India, designed specifically for Indian milk supply chains and FSSAI regulations. We understand the unique challenges Indian families face and have built a solution that works in real-world conditions.
            </p>
          </div>
        </section>

        {/* ── TECHNOLOGY SECTION ──────────────────────────────────────────── */}
        <section className="py-8 px-6">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6" />
            Our Technology
          </h2>
          <SEOParagraph className="mb-4">
            MilkGuard uses <strong>near-infrared (NIR) spectral analysis</strong> — the same technology used in professional food testing laboratories — miniaturized into an affordable consumer device.
          </SEOParagraph>
          <SEOParagraph className="mb-4">
            Our <strong>AI model analyzes 18 different wavelengths</strong> of light to create a unique spectral fingerprint for each milk sample. This fingerprint is compared against our database of known adulterants to identify contaminants with high accuracy.
          </SEOParagraph>
          <div className="bg-slate-50 p-4 rounded-lg mt-4">
            <h3 className="font-bold text-[#1A6B4A] mb-2">Detected Adulterants:</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-600">
              <li>• Urea</li>
              <li>• Detergent</li>
              <li>• Formalin</li>
              <li>• Starch</li>
              <li>• Glucose</li>
              <li>• Salt</li>
              <li>• Ammonium Sulphate</li>
              <li>• And more...</li>
            </ul>
          </div>
        </section>

        {/* ── CTA SECTION ─────────────────────────────────────────────────── */}
        <section className="py-8 px-6">
          <div className="bg-gradient-to-r from-[#F5A623] to-[#E8941A] text-white p-6 rounded-xl text-center">
            <h2 className="font-black text-xl mb-2">Ready to Protect Your Family?</h2>
            <p className="text-white/90 text-sm mb-4">
              Join thousands of families using MilkGuard to verify their milk safety.
            </p>
            <a
              href="/scan"
              className="inline-block bg-white text-[#F5A623] font-bold py-3 px-8 rounded-full hover:bg-green-50 transition-colors"
            >
              Start Free Test →
            </a>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="py-8 px-6 text-center border-t">
          <p className="text-sm text-slate-500">
            MilkGuard © 2026 | Built by Team API Avengers 🇮🇳
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="/how-it-works" className="text-sm text-[#1A6B4A] hover:underline">
              How It Works
            </a>
            <a href="/faq" className="text-sm text-[#1A6B4A] hover:underline">
              FAQ
            </a>
            <a href="/learn" className="text-sm text-[#1A6B4A] hover:underline">
              Learn More
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}

/**
 * How It Works Page - MilkGuard
 *
 * SEO-optimized content explaining the milk adulteration detection process.
 * Primary keyword: "how milk adulteration detection works"
 *
 * Includes HowTo JSON-LD structured data for rich snippets in search results.
 */

import { Metadata } from 'next'
import { howItWorksMetadata } from '@/app/page.metadata'
import { PageTitle, PageSubtitle } from '@/components/seo/PageTitle'
import { SEOParagraph } from '@/components/seo/MetaDescription'
import { generateHowToJsonLd } from '@/components/seo/SEOHead'
import { Zap, Shield, Activity, Cpu, Droplets, BarChart3 } from 'lucide-react'

export const metadata: Metadata = howItWorksMetadata

export default function HowItWorksPage() {
  // JSON-LD HowTo structured data for rich snippets
  const howToJsonLd = generateHowToJsonLd([
    {
      name: 'Pour a small sample',
      text: 'Pour just 20ml of milk into the transparent sample cup provided with your MilkGuard Pod.',
    },
    {
      name: 'Place in the Pod cradle',
      text: 'Set the cup next to the MilkGuard Pod sensor. The device will automatically detect the sample.',
    },
    {
      name: 'Start the scan',
      text: 'Click "Start Scan" in the app. The Pod emits 18 wavelengths of near-infrared light through the milk sample.',
    },
    {
      name: 'AI analysis',
      text: 'Our AI model analyzes the spectral signature and compares it against known adulterant fingerprints.',
    },
    {
      name: 'Get instant results',
      text: 'Within 8 seconds, receive your SafetyScore and detailed adulteration report with FSSAI compliance status.',
    },
  ])

  return (
    <div className="min-h-screen bg-[#F7F9F8] pb-24">
      <div className="max-w-md mx-auto bg-white shadow-xl">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: howToJsonLd }}
        />

        {/* ── HERO SECTION ────────────────────────────────────────────────── */}
        <header className="bg-gradient-to-b from-[#1A6B4A] to-[#134f37] text-white py-12 px-6">
          <PageTitle as="h1" className="text-white mb-2">How MilkGuard Works</PageTitle>
          <PageSubtitle className="text-green-200">
            NIR Spectral Analysis + AI Detection
          </PageSubtitle>
        </header>

        {/* ── OVERVIEW SECTION ───────────────────────────────────────────── */}
        <section className="py-8 px-6">
          <SEOParagraph className="mb-4" highlightKeyword="milk adulteration detection">
            MilkGuard uses <strong>near-infrared (NIR) spectral analysis</strong> — the same technology found in professional food testing laboratories — combined with advanced AI to detect milk adulteration in just 8 seconds.
          </SEOParagraph>
          <SEOParagraph className="mb-4">
            Here's exactly how our <strong>contactless milk purity testing</strong> system works, from sample to SafetyScore.
          </SEOParagraph>
        </section>

        {/* ── STEP-BY-STEP PROCESS ───────────────────────────────────────── */}
        <section className="py-8 px-6">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Step-by-Step Detection Process
          </h2>

          <div className="space-y-6 mt-6">
            {/* Step 1 */}
            <div className="relative pl-12 border-l-2 border-[#1A6B4A] pb-6">
              <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#1A6B4A] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-lg text-[#1A6B4A] mb-2">
                Sample Collection
              </h3>
              <p className="text-slate-600 text-sm mb-2">
                Pour approximately 20ml of milk into the transparent sample cup. This small amount is sufficient for accurate analysis.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Droplets className="w-4 h-4" />
                <span>No special preparation needed</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pl-12 border-l-2 border-[#1A6B4A] pb-6">
              <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#1A6B4A] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-lg text-[#1A6B4A] mb-2">
                Contactless Scanning
              </h3>
              <p className="text-slate-600 text-sm mb-2">
                Place the sample cup in the MilkGuard Pod cradle. Our device uses <strong>near-infrared light</strong> to scan the milk without any physical contact or chemical reagents.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4" />
                <span>100% contactless — no contamination risk</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pl-12 border-l-2 border-[#1A6B4A] pb-6">
              <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#1A6B4A] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-lg text-[#1A6B4A] mb-2">
                Spectral Analysis
              </h3>
              <p className="text-slate-600 text-sm mb-2">
                The Pod emits <strong>18 different wavelengths</strong> of NIR light (700-2500nm) through the milk sample. Each component in the milk absorbs light differently, creating a unique spectral fingerprint.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg mt-2">
                <p className="text-xs text-slate-600">
                  <strong>Science:</strong> Different molecules absorb specific wavelengths of light. Urea, for example, has distinct absorption peaks at 1450nm and 1940nm.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative pl-12 border-l-2 border-[#1A6B4A] pb-6">
              <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#1A6B4A] text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-bold text-lg text-[#1A6B4A] mb-2">
                AI-Powered Detection
              </h3>
              <p className="text-slate-600 text-sm mb-2">
                Our machine learning model analyzes the spectral signature and compares it against our database of <strong>known adulterant fingerprints</strong>. The AI identifies patterns that indicate contamination.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Cpu className="w-4 h-4" />
                <span>Trained on 10,000+ milk samples</span>
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative pl-12 border-l-2 border-[#1A6B4A]">
              <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-[#F5A623] text-white flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h3 className="font-bold text-lg text-[#1A6B4A] mb-2">
                Instant Results & SafetyScore
              </h3>
              <p className="text-slate-600 text-sm mb-2">
                Within <strong>8 seconds</strong>, receive your SafetyScore (0-100), detailed adulterant breakdown, and FSSAI compliance status. Results are saved to your testing history.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <BarChart3 className="w-4 h-4" />
                <span>Download FSSAI-compliant PDF reports</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── TECHNOLOGY DEEP DIVE ───────────────────────────────────────── */}
        <section className="py-8 px-6 bg-slate-50">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6" />
            The Technology Behind MilkGuard
          </h2>

          <div className="space-y-4 mt-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#1A6B4A] mb-2">
                Near-Infrared (NIR) Spectroscopy
              </h3>
              <p className="text-sm text-slate-600">
                NIR spectroscopy is a proven analytical technique used in food testing laboratories worldwide. It's non-destructive, requires no sample preparation, and provides instant results.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#1A6B4A] mb-2">
                Machine Learning Model
              </h3>
              <p className="text-sm text-slate-600">
                Our AI model is trained on over 10,000 milk samples with known adulterant concentrations. It continuously improves with each scan, learning to detect even trace amounts of contaminants.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-[#1A6B4A] mb-2">
                FSSAI Compliance Engine
              </h3>
              <p className="text-sm text-slate-600">
                Every result is automatically compared against FSSAI 2025-26 safety limits. The system flags any adulterant concentration that exceeds regulatory thresholds.
              </p>
            </div>
          </div>
        </section>

        {/* ── ACCURACY & LIMITATIONS ─────────────────────────────────────── */}
        <section className="py-8 px-6">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Accuracy & Limitations
          </h2>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <h3 className="font-bold text-green-800 mb-2">Detection Accuracy</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 97.5% accuracy for urea detection (≥50mg/dL)</li>
              <li>• 95.2% accuracy for detergent detection</li>
              <li>• 94.8% accuracy for formalin detection</li>
              <li>• 93.1% overall accuracy across all adulterants</li>
            </ul>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <h3 className="font-bold text-amber-800 mb-2">Important Limitations</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Results are indicative, not legally binding</li>
              <li>• Very low adulterant concentrations (&lt;10mg/dL) may not be detected</li>
              <li>• Temperature extremes can affect accuracy</li>
              <li>• For legal disputes, laboratory confirmation is recommended</li>
            </ul>
          </div>
        </section>

        {/* ── FAQ SECTION ────────────────────────────────────────────────── */}
        <section className="py-8 px-6">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4 mt-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-bold text-[#1A6B4A] mb-2 text-sm">
                How accurate is MilkGuard compared to lab tests?
              </h4>
              <p className="text-sm text-slate-600">
                MilkGuard achieves 93-97% accuracy compared to standard laboratory methods. While not a replacement for certified lab testing in legal disputes, it provides reliable results for daily household use.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-bold text-[#1A6B4A] mb-2 text-sm">
                Can it detect all types of adulterants?
              </h4>
              <p className="text-sm text-slate-600">
                MilkGuard detects the 7+ most common adulterants: urea, detergent, formalin, starch, glucose, salt, and ammonium sulphate. We're continuously adding new adulterant profiles through AI model updates.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-bold text-[#1A6B4A] mb-2 text-sm">
                Does the milk get wasted after testing?
              </h4>
              <p className="text-sm text-slate-600">
                No! The testing is completely contactless — the milk never touches the device. You can safely use the tested milk afterward.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ────────────────────────────────────────────────── */}
        <section className="py-8 px-6">
          <div className="bg-gradient-to-r from-[#1A6B4A] to-[#134f37] text-white p-6 rounded-xl text-center">
            <h2 className="font-black text-xl mb-2">Try It Yourself</h2>
            <p className="text-white/90 text-sm mb-4">
              Experience the future of milk safety testing.
            </p>
            <a
              href="/scan"
              className="inline-block bg-white text-[#1A6B4A] font-bold py-3 px-8 rounded-full hover:bg-green-50 transition-colors"
            >
              Start Free Test →
            </a>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <footer className="py-8 px-6 text-center border-t">
          <div className="flex justify-center gap-4">
            <a href="/about" className="text-sm text-[#1A6B4A] hover:underline">
              About Us
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

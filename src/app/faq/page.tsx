/**
 * FAQ Page - MilkGuard
 *
 * SEO-optimized FAQ content with JSON-LD structured data for rich snippets.
 * Primary keyword: "milk purity test FAQ"
 *
 * The FAQPage schema markup helps Google display these Q&As directly in search results.
 */

import { Metadata } from 'next'
import { faqMetadata } from '@/app/page.metadata'
import { generateFAQJsonLd } from '@/components/seo/SEOHead'
import { PageTitle, PageSubtitle } from '@/components/seo/PageTitle'
import { SEOParagraph } from '@/components/seo/MetaDescription'
import { HelpCircle, ChevronDown } from 'lucide-react'

export const metadata: Metadata = faqMetadata

// FAQ data for JSON-LD and rendering
const faqs = [
  {
    question: 'What is milk adulteration and why is it dangerous?',
    answer: 'Milk adulteration is the practice of adding harmful substances to milk to increase quantity or mask poor quality. Common adulterants include urea (used as fertilizer), detergent (creates false froth), formalin (preservative), and starch (thickens milk). These substances can cause serious health issues including kidney damage, digestive problems, and long-term toxicity. According to FSSAI, over 97% of milk samples in some Indian states contain harmful adulterants.',
  },
  {
    question: 'How does MilkGuard detect milk adulteration?',
    answer: 'MilkGuard uses near-infrared (NIR) spectral analysis combined with AI-powered detection. When you place a milk sample in the Pod, it emits 18 different wavelengths of light through the milk. Each substance absorbs light differently, creating a unique "spectral fingerprint." Our AI model analyzes this fingerprint and compares it against known adulterant patterns to identify contaminants in just 8 seconds.',
  },
  {
    question: 'How accurate is the MilkGuard test?',
    answer: 'MilkGuard achieves 93-97% accuracy for detecting common adulterants like urea, detergent, and formalin when compared to standard laboratory methods. The accuracy depends on adulterant concentration — higher concentrations are detected more reliably. While MilkGuard provides reliable results for daily household use, laboratory confirmation is recommended for legal disputes or official compliance documentation.',
  },
  {
    question: 'What adulterants can MilkGuard detect?',
    answer: 'MilkGuard currently detects 7+ common adulterants: Urea, Detergent, Formalin, Starch, Glucose, Salt (Sodium Chloride), and Ammonium Sulphate. We continuously update our AI model to detect additional adulterants as new threats emerge. Each adulterant has a distinct spectral signature that our system learns to recognize.',
  },
  {
    question: 'Is the test safe? Does the milk get contaminated?',
    answer: 'Yes, the test is completely safe! MilkGuard uses contactless NIR spectroscopy — the milk never touches the device. Light passes through the container to analyze the milk. After testing, the milk is safe to consume (unless the test reveals adulteration, in which case you should discard it). No chemicals, no reagents, no contamination.',
  },
  {
    question: 'How much milk do I need for a test?',
    answer: 'You only need approximately 20ml of milk — about 2-3 tablespoons. This small amount is sufficient for accurate spectral analysis. The milk should be at room temperature for best results. Extreme temperatures (very hot or very cold) can affect the accuracy of the reading.',
  },
  {
    question: 'What is the SafetyScore?',
    answer: 'The SafetyScore is a 0-100 rating that summarizes your milk\'s overall quality. A score of 90-100 indicates excellent quality with no detected adulterants. 70-89 means acceptable quality with minor concerns. Below 70 indicates significant adulteration detected. The score is calculated based on the type and concentration of any detected adulterants, compared against FSSAI safety limits.',
  },
  {
    question: 'Can I use MilkGuard results for legal purposes?',
    answer: 'MilkGuard results are intended for personal household use and awareness. While highly accurate, they are not legally binding for disputes or official compliance documentation. For legal purposes, you would need testing from an FSSAI-certified laboratory. However, MilkGuard results can help you decide when to seek official testing.',
  },
  {
    question: 'How do I connect the MilkGuard Pod device?',
    answer: 'To connect your MilkGuard Pod: (1) Ensure the Pod is powered on and within Bluetooth range. (2) Go to the Hardware page in the app. (3) Tap "Connect Device" and wait for pairing. (4) Once connected, you\'ll see a green status indicator. If connection fails, check that the Pod is charged and try restarting both the device and app.',
  },
  {
    question: 'What should I do if milk is adulterated?',
    answer: 'If MilkGuard detects adulteration: (1) Do not consume the milk. (2) Document the results with a screenshot or PDF report. (3) Contact your milk vendor to report the issue. (4) Consider switching to a different vendor. (5) For repeated issues, you can report to FSSAI through their official complaint portal. Your safety is the priority.',
  },
  {
    question: 'Is MilkGuard approved by FSSAI?',
    answer: 'MilkGuard follows FSSAI 2025-26 safety standards and limits for all adulterant detection. While the device itself is not an FSSAI-certified laboratory, our detection thresholds and SafetyScore calculations are aligned with FSSAI regulations. We are working toward official FSSAI recognition for consumer-grade testing devices.',
  },
  {
    question: 'Can I test other dairy products besides milk?',
    answer: 'Currently, MilkGuard is calibrated specifically for liquid milk (cow, buffalo, and mixed). We are developing models for other dairy products like paneer, curd, and ghee. These will be added through firmware updates. Using MilkGuard for non-milk substances may give inaccurate results.',
  },
]

export default function FAQPage() {
  // Generate FAQ JSON-LD for rich snippets
  const faqJsonLd = generateFAQJsonLd(faqs)

  return (
    <div className="min-h-screen bg-[#F7F9F8] pb-24">
      <div className="max-w-md mx-auto bg-white shadow-xl">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqJsonLd }}
        />

        {/* ── HERO SECTION ────────────────────────────────────────────────── */}
        <header className="bg-gradient-to-b from-[#1A6B4A] to-[#134f37] text-white py-12 px-6">
          <PageTitle as="h1" className="text-white mb-2">
            Frequently Asked Questions
          </PageTitle>
          <PageSubtitle className="text-green-200">
            Everything About Milk Purity Testing
          </PageSubtitle>
        </header>

        {/* ── QUICK LINKS ───────────────────────────────────────────────── */}
        <section className="py-6 px-6 border-b">
          <div className="flex flex-wrap gap-2">
            <a href="#general" className="text-xs font-medium text-[#1A6B4A] bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors">
              General
            </a>
            <a href="#accuracy" className="text-xs font-medium text-[#1A6B4A] bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors">
              Accuracy
            </a>
            <a href="#device" className="text-xs font-medium text-[#1A6B4A] bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors">
              Device
            </a>
            <a href="#safety" className="text-xs font-medium text-[#1A6B4A] bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors">
              Safety
            </a>
          </div>
        </section>

        {/* ── GENERAL QUESTIONS ─────────────────────────────────────────── */}
        <section id="general" className="py-8 px-6">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            General Questions
          </h2>

          <div className="space-y-4 mt-4">
            {faqs.slice(0, 2).map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        {/* ── ACCURACY & DETECTION ──────────────────────────────────────── */}
        <section id="accuracy" className="py-8 px-6 bg-slate-50">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Accuracy & Detection
          </h2>

          <div className="space-y-4 mt-4">
            {faqs.slice(2, 5).map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        {/* ── DEVICE & USAGE ────────────────────────────────────────────── */}
        <section id="device" className="py-8 px-6">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Device & Usage
          </h2>

          <div className="space-y-4 mt-4">
            {faqs.slice(5, 9).map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        {/* ── SAFETY & COMPLIANCE ───────────────────────────────────────── */}
        <section id="safety" className="py-8 px-6 bg-slate-50">
          <h2 className="text-2xl font-black text-[#1A6B4A] mb-6 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Safety & Compliance
          </h2>

          <div className="space-y-4 mt-4">
            {faqs.slice(9).map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        {/* ── STILL HAVE QUESTIONS ──────────────────────────────────────── */}
        <section className="py-8 px-6">
          <div className="bg-gradient-to-r from-[#1A6B4A] to-[#134f37] text-white p-6 rounded-xl text-center">
            <h2 className="font-black text-xl mb-2">Still Have Questions?</h2>
            <p className="text-white/90 text-sm mb-4">
              Our AI chat assistant can help with specific questions about milk testing, adulteration, and FSSAI standards.
            </p>
            <a
              href="/chat"
              className="inline-block bg-white text-[#1A6B4A] font-bold py-3 px-8 rounded-full hover:bg-green-50 transition-colors"
            >
              Chat with AI →
            </a>
          </div>
        </section>

        {/* ── RELATED LINKS ─────────────────────────────────────────────── */}
        <section className="py-8 px-6 border-t">
          <h3 className="font-bold text-[#1A6B4A] mb-4 text-center">Related Resources</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/how-it-works"
              className="text-sm text-[#1A6B4A] bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
            >
              How It Works
            </a>
            <a
              href="/about"
              className="text-sm text-[#1A6B4A] bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
            >
              About MilkGuard
            </a>
            <a
              href="/learn"
              className="text-sm text-[#1A6B4A] bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
            >
              Learn About Adulteration
            </a>
            <a
              href="/scan"
              className="text-sm text-white bg-[#F5A623] px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Start Free Test
            </a>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer className="py-8 px-6 text-center border-t">
          <p className="text-sm text-slate-500">
            MilkGuard © 2026 | Team API Avengers 🇮🇳
          </p>
        </footer>
      </div>
    </div>
  )
}

/**
 * FAQ Item Component
 * Accessible accordion-style Q&A with proper semantic HTML
 */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-white rounded-lg shadow-sm border border-slate-200">
      <summary className="flex items-center justify-between cursor-pointer p-4 list-none">
        <h4 className="font-semibold text-[#1A6B4A] text-sm pr-4">
          {question}
        </h4>
        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
        {answer}
      </div>
    </details>
  )
}

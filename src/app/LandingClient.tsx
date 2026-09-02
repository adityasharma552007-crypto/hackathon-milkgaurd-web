'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Download, ShieldCheck, Zap, Award, ArrowRight, Smartphone, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react'

export default function LandingClient() {
  const router = useRouter()

  const goToLogin = () => router.push('/auth/login')
  const goToSignup = () => router.push('/auth/signup')
  const goToDownload = () => router.push('/download')

  return (
    <main className="min-h-screen bg-[#f8f9ff] text-[#001d36] font-sans antialiased overflow-x-hidden">
      {/* ── TOP NAV BAR ── */}
      <header className="sticky top-0 w-full z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-[#d1e4ff]/60 ambient-shadow">
        <div className="flex justify-between items-center px-4 md:px-10 h-16 w-full max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00668a] to-[#004c69] flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-2xl">biotech</span>
            </div>
            <span className="text-xl font-extrabold text-[#00288e] tracking-tight">MilkGuard</span>
          </Link>

          {/* Navigation CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToDownload}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#00668a] bg-[#e5efff] hover:bg-[#c4e7ff] transition-all"
            >
              <Download size={15} />
              <span>Download APK</span>
            </button>
            <button
              onClick={goToLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#00668a] hover:bg-[#e5efff] transition-all"
            >
              Sign In
            </button>
            <button
              onClick={goToSignup}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#00668a] hover:bg-[#004c69] shadow-sm transition-all flex items-center gap-1"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 md:px-10 bg-gradient-to-b from-[#f8f9ff] via-[#e5efff]/40 to-[#f8f9ff] overflow-hidden">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e5efff] border border-[#c4e7ff] text-xs font-bold text-[#00668a]">
              <span className="w-2 h-2 rounded-full bg-[#30c5b3] animate-pulse"></span>
              <span>FSSAI Compliant · Spectral NIR Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#001d36] tracking-tight leading-[1.1]">
              Know What&apos;s in Your Milk. <br />
              <span className="text-[#00668a]">Scanned in Seconds.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#3e484f] font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Instant non-contact NIR spectral analysis & AI adulterant detection. Verify purity, track vendor trust scores, and write tamper-proof reports to Polygon blockchain.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={goToSignup}
                className="w-full sm:w-auto px-8 py-4 bg-[#00668a] hover:bg-[#004c69] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#00668a]/20 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Start Free Purity Scan</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={goToDownload}
                className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-[#f8f9ff] border border-[#d1e4ff] text-[#001d36] font-bold text-sm rounded-2xl ambient-shadow transition-all flex items-center justify-center gap-2"
              >
                <Smartphone size={18} className="text-[#00668a]" />
                <span>Get Mobile App</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#3e484f] font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#30c5b3]" />
                <span>100% Non-Contact</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#30c5b3]" />
                <span>Polygon On-Chain</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#30c5b3]" />
                <span>8 Sec Analysis</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl border border-[#d1e4ff] ambient-shadow p-6 space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#30c5b3]/15 text-[#006b5f] flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#001d36] text-sm">Sample Test Result</h3>
                    <p className="text-xs text-[#3e484f]">Fresh Cow Milk · Jaipur</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#30c5b3]/20 text-[#006b5f] text-xs font-bold">
                  98% PURE
                </span>
              </div>

              {/* Radial Gauge Preview */}
              <div className="bg-[#f8f9ff] rounded-2xl p-6 border border-[#d1e4ff] flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-24 h-24 rounded-full bg-[#e5efff] border-4 border-[#30c5b3] flex items-center justify-center shadow-inner">
                  <span className="text-3xl font-black text-[#001d36]">98</span>
                </div>
                <p className="text-xs font-bold text-[#006b5f] uppercase tracking-wider">PASSED · Safe for Consumption</p>
                <p className="text-[11px] text-[#3e484f]">No Urea, Detergent, or Water dilution detected.</p>
              </div>

              {/* Verified Features list */}
              <div className="space-y-2 text-xs font-semibold text-[#001d36]">
                <div className="flex justify-between p-3 rounded-xl bg-[#f8f9ff] border border-[#d1e4ff]">
                  <span>FSSAI Standards Compliance</span>
                  <span className="text-[#006b5f] font-bold">Verified</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#f8f9ff] border border-[#d1e4ff]">
                  <span>Polygon Amoy Blockchain Record</span>
                  <span className="text-[#00668a] font-bold">Logged</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHTS ── */}
      <section className="py-16 px-4 md:px-10 bg-white border-y border-[#d1e4ff]">
        <div className="w-full max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#001d36] tracking-tight">
              Why MilkGuard Protection Works
            </h2>
            <p className="text-xs sm:text-sm text-[#3e484f] font-medium">
              Engineered with NIR multispectral hardware, Groq AI inference, and decentralized blockchain verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#f8f9ff] p-6 rounded-2xl border border-[#d1e4ff] ambient-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#e5efff] text-[#00668a] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">biotech</span>
              </div>
              <h3 className="text-lg font-bold text-[#001d36]">Contactless Detection</h3>
              <p className="text-xs text-[#3e484f] leading-relaxed font-medium">
                18-wavelength NIR spectral analysis reads through transparent milk containers without touching or contaminating the sample.
              </p>
            </div>

            <div className="bg-[#f8f9ff] p-6 rounded-2xl border border-[#d1e4ff] ambient-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#e5efff] text-[#00668a] flex items-center justify-center font-bold">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#001d36]">Instant AI Analysis</h3>
              <p className="text-xs text-[#3e484f] leading-relaxed font-medium">
                Powered by Groq Mixtral AI inference engine to deliver actionable safety reports and chemical breakdown analogies in seconds.
              </p>
            </div>

            <div className="bg-[#f8f9ff] p-6 rounded-2xl border border-[#d1e4ff] ambient-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#e5efff] text-[#00668a] flex items-center justify-center font-bold">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#001d36]">Polygon Blockchain Proof</h3>
              <p className="text-xs text-[#3e484f] leading-relaxed font-medium">
                Every test score payload is SHA-256 hashed and recorded on the Polygon Amoy testnet for tamper-proof public auditability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#001d36] text-white py-12 px-4 md:px-10">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00668a] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">biotech</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight">MilkGuard</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-[#c4e7ff]">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="/download" className="hover:text-white transition-colors">Download APK</Link>
          </div>

          <p className="text-xs text-[#8e9aa0]">
            MilkGuard © 2026 · Built for Food Safety 🇮🇳
          </p>
        </div>
      </footer>
    </main>
  )
}

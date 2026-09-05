'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Smartphone,
  Download,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Globe,
  Bluetooth,
  ChevronDown,
  ChevronUp,
  Laptop,
  Apple,
  Share2,
  ExternalLink,
  Wifi,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InstallButton } from '@/components/pwa/InstallButton'
import { MilkGuardLogo } from '@/components/brand/MilkGuardLogo'
import { usePwaInstall } from '@/hooks/usePwaInstall'

export function PwaInstallGuide() {
  const { isInstalled, isInstallable, isIos } = usePwaInstall()
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android')
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9ff] via-[#e5efff]/40 to-[#f8f9ff] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-1">
            <MilkGuardLogo variant="full" size={110} priority />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e5efff] border border-[#c4e7ff] text-xs font-bold text-[#00668a]">
            <Zap size={14} />
            <span>Progressive Web App (PWA)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#001d36] tracking-tight">
            Install MilkGuard
          </h1>

          <p className="text-sm sm:text-base text-[#3e484f] max-w-2xl mx-auto leading-relaxed">
            Install MilkGuard directly onto your home screen or desktop. Instant access, fast loading, and native app experience with zero APK downloads.
          </p>

          {/* Primary Install Action Box */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isInstalled ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 shadow-sm">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <span className="text-sm font-bold">MilkGuard is already installed on this device!</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <InstallButton
                  variant="hero"
                  label="Install MilkGuard App"
                  className="px-8 py-3.5 text-base font-extrabold shadow-lg"
                />
                <span className="text-xs text-[#52606d]">
                  {isInstallable
                    ? '✓ Instant one-click installation available'
                    : isIos
                    ? 'Tap Share → Add to Home Screen in Safari'
                    : 'Supported on Chrome, Edge, Brave, and Safari'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border-[#c4e7ff]/70 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#e5efff] flex items-center justify-center text-[#00668a] mb-2">
                <ShieldCheck size={22} />
              </div>
              <CardTitle className="text-base font-bold text-[#001d36]">No APK Needed</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[#52606d] leading-relaxed">
              Install safely via your browser sandbox. No unknown sources permission, no suspicious package installers, and always up-to-date.
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#c4e7ff]/70 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#e5efff] flex items-center justify-center text-[#00668a] mb-2">
                <Zap size={22} />
              </div>
              <CardTitle className="text-base font-bold text-[#001d36]">Instant Launch</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[#52606d] leading-relaxed">
              Opens full-screen in standalone mode without browser navigation bars. High-performance caching loads the shell in milliseconds.
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#c4e7ff]/70 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#e5efff] flex items-center justify-center text-[#00668a] mb-2">
                <Bluetooth size={22} />
              </div>
              <CardTitle className="text-base font-bold text-[#001d36]">Hardware Integration</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[#52606d] leading-relaxed">
              Directly interfaces with the MilkGuard ESP32 sensor hardware via Web Bluetooth Low Energy (BLE) on Chromium browsers.
            </CardContent>
          </Card>
        </div>

        {/* Device-Specific Installation Instructions Tabs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#c4e7ff]/60">
          <h2 className="text-xl font-bold text-[#001d36] mb-6 text-center">
            How to Install on Your Device
          </h2>

          <div className="flex border-b border-[#e2eaf0] mb-6">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 pb-3 text-sm font-bold transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'android'
                  ? 'border-[#00668a] text-[#00668a]'
                  : 'border-transparent text-[#64748b] hover:text-[#001d36]'
              }`}
            >
              <Smartphone size={16} />
              <span>Android</span>
            </button>

            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 pb-3 text-sm font-bold transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'ios'
                  ? 'border-[#00668a] text-[#00668a]'
                  : 'border-transparent text-[#64748b] hover:text-[#001d36]'
              }`}
            >
              <Apple size={16} />
              <span>iOS (iPhone / iPad)</span>
            </button>

            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 pb-3 text-sm font-bold transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'desktop'
                  ? 'border-[#00668a] text-[#00668a]'
                  : 'border-transparent text-[#64748b] hover:text-[#001d36]'
              }`}
            >
              <Laptop size={16} />
              <span>Desktop (PC / Mac)</span>
            </button>
          </div>

          {/* Android Guide */}
          {activeTab === 'android' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2eaf0]">
                <div className="w-8 h-8 rounded-full bg-[#00668a] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#001d36]">Open in Google Chrome</h4>
                  <p className="text-xs text-[#52606d] mt-0.5">
                    Visit MilkGuard in Google Chrome, Microsoft Edge, or Samsung Internet.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2eaf0]">
                <div className="w-8 h-8 rounded-full bg-[#00668a] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#001d36]">Tap "Install MilkGuard"</h4>
                  <p className="text-xs text-[#52606d] mt-0.5">
                    Click the install button on this page, or open Chrome's three dots menu (⋮) and tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2eaf0]">
                <div className="w-8 h-8 rounded-full bg-[#00668a] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#001d36]">Launch from Home Screen</h4>
                  <p className="text-xs text-[#52606d] mt-0.5">
                    MilkGuard is now on your home screen and app drawer, running as a standalone app.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* iOS Guide */}
          {activeTab === 'ios' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2eaf0]">
                <div className="w-8 h-8 rounded-full bg-[#00668a] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#001d36]">Open in Safari</h4>
                  <p className="text-xs text-[#52606d] mt-0.5">
                    Open MilkGuard in Apple Safari on your iPhone or iPad.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2eaf0]">
                <div className="w-8 h-8 rounded-full bg-[#00668a] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#001d36]">Tap the Share Button</h4>
                  <p className="text-xs text-[#52606d] mt-0.5">
                    Tap the Share icon (square with arrow pointing up) in Safari's bottom navigation bar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2eaf0]">
                <div className="w-8 h-8 rounded-full bg-[#00668a] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#001d36]">Tap "Add to Home Screen"</h4>
                  <p className="text-xs text-[#52606d] mt-0.5">
                    Scroll down and select <strong>"Add to Home Screen"</strong>, then tap <strong>"Add"</strong> in the top right.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Guide */}
          {activeTab === 'desktop' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2eaf0]">
                <div className="w-8 h-8 rounded-full bg-[#00668a] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#001d36]">Use Chrome or Edge</h4>
                  <p className="text-xs text-[#52606d] mt-0.5">
                    Open MilkGuard on your Windows, macOS, or Linux device in Google Chrome or Microsoft Edge.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2eaf0]">
                <div className="w-8 h-8 rounded-full bg-[#00668a] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#001d36]">Click the Address Bar Install Icon</h4>
                  <p className="text-xs text-[#52606d] mt-0.5">
                    Look for the <strong>Install</strong> icon (computer with down arrow) on the right side of the address bar, or click the "Install MilkGuard" button on this page.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8f9ff] border border-[#e2eaf0]">
                <div className="w-8 h-8 rounded-full bg-[#00668a] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#001d36]">Launch from Desktop or Start Menu</h4>
                  <p className="text-xs text-[#52606d] mt-0.5">
                    MilkGuard will run in its own dedicated window with taskbar/dock integration.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Offline & Hardware Architecture Notice */}
        <div className="bg-[#00288e]/5 border border-[#c4e7ff] rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-[#00288e] font-extrabold text-base">
            <Wifi size={20} />
            <span>Application Shell vs. Live Services</span>
          </div>

          <p className="text-xs text-[#3e484f] leading-relaxed">
            MilkGuard is a food-safety diagnostic platform. Once installed, the <strong>app shell and user interface are cached for fast offline access</strong>. However, because accuracy is paramount:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-[#e2eaf0]">
              <h5 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Available Offline
              </h5>
              <ul className="text-xs text-[#52606d] space-y-1 list-disc list-inside">
                <li>App shell & fast page navigation</li>
                <li>PWA launch from home screen</li>
                <li>Device status & BLE connection UI</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#e2eaf0]">
              <h5 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-1">
                <AlertCircle size={14} className="text-amber-600" />
                Internet Required
              </h5>
              <ul className="text-xs text-[#52606d] space-y-1 list-disc list-inside">
                <li>AI spectral adulteration analysis</li>
                <li>Cloud scan history synchronization</li>
                <li>FSSAI certificate verification on blockchain</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#c4e7ff]/60 space-y-4">
          <h3 className="text-lg font-bold text-[#001d36] mb-4">
            Frequently Asked Questions
          </h3>

          {[
            {
              q: 'Why did MilkGuard switch from an APK to a PWA?',
              a: 'PWAs are more secure, install instantly, consume significantly less storage, and update automatically without downloading unknown APK files. They also run across Android, iOS, Windows, and Mac.'
            },
            {
              q: 'Does installing as a PWA support the ESP32 hardware scanner?',
              a: 'Yes! On Chromium-based browsers (Chrome, Edge, Opera on Android/PC/Mac), the installed PWA communicates with the ESP32 hardware using Web Bluetooth Low Energy (BLE) without needing native app bridge plugins.'
            },
            {
              q: 'How do I update MilkGuard?',
              a: 'You do not need to do anything. The service worker automatically checks for updates in the background whenever you open the app.'
            },
            {
              q: 'How do I uninstall MilkGuard?',
              a: 'Just like any native app: long-press the MilkGuard icon on your home screen or app drawer and select "Uninstall" or "Remove".'
            }
          ].map((item, idx) => (
            <div key={idx} className="border-b border-[#e2eaf0] pb-3 last:border-b-0">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left py-2 text-sm font-bold text-[#001d36] hover:text-[#00668a] transition-colors"
              >
                <span>{item.q}</span>
                {faqOpen === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {faqOpen === idx && (
                <p className="text-xs text-[#52606d] mt-1 leading-relaxed animate-in fade-in duration-200">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Footer */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00668a] hover:underline"
          >
            ← Return to MilkGuard Home
          </Link>
        </div>

      </div>
    </div>
  )
}

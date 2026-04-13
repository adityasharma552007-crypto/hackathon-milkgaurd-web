'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone,
  Download,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  FileText,
  HelpCircle,
  ExternalLink,
  Wifi,
  HardDrive
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface VersionInfo {
  version: string
  versionCode: number
  buildDate: string
  mode: string
  filename: string
  size: string
  sizeBytes: number
  minSdkVersion: number
  targetSdkVersion: number
  downloadUrl: string
  changelog: string[]
  requirements: {
    android: string
    storage: string
    internet: string
    permissions: string[]
  }
  releaseNotes: string
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

export function DownloadAPK() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadComplete, setDownloadComplete] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  useEffect(() => {
    fetch('/downloads/version.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load version info')
        return res.json()
      })
      .then(data => {
        setVersionInfo(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handleDownload = async () => {
    if (!versionInfo) return

    setDownloading(true)
    setProgress(0)
    setDownloadComplete(false)

    try {
      const response = fetch(versionInfo.downloadUrl)

      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + Math.random() * 15
        })
      }, 200)

      const res = await response

      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      clearInterval(interval)
      setProgress(100)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = versionInfo.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setTimeout(() => {
        setDownloading(false)
        setDownloadComplete(true)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
      setDownloading(false)
      setProgress(0)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading download info...</p>
        </div>
      </div>
    )
  }

  if (error && !versionInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/downloads/MilkGuard.apk" download>
                Download Directly
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-blue-100">
      {/* Header */}
      <motion.header
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-4 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Smartphone className="w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">MilkGuard for Android</h1>
          <p className="text-blue-100 text-sm">AI-Powered Milk Adulteration Detection</p>
        </div>
      </motion.header>

      <main className="max-w-2xl mx-auto p-4 -mt-4">
        {/* Download Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Card className="mb-4 shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    {versionInfo?.filename || 'MilkGuard.apk'}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      v{versionInfo?.version}
                    </Badge>
                    <span className="text-slate-500 text-xs">
                      {versionInfo?.size}
                    </span>
                  </CardDescription>
                </div>
                <Shield className="w-8 h-8 text-blue-600/50" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* System Requirements */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-xs text-slate-600 font-medium">Android {versionInfo?.minSdkVersion}+</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <HardDrive className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-slate-600 font-medium">{versionInfo?.requirements?.storage || '50 MB'}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <Wifi className="w-5 h-5 mx-auto mb-1 text-indigo-600" />
                  <p className="text-xs text-slate-600 font-medium">Internet</p>
                </div>
              </div>

              {/* Download Button */}
              <AnimatePresence>
                {!downloadComplete ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    >
                      {downloading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Downloading... {Math.round(progress)}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Download className="w-5 h-5" />
                          Download APK
                        </span>
                      )}
                    </Button>
                    {downloading && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3"
                      >
                        <Progress value={progress} className="h-2" />
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
                  >
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-semibold">Download Complete!</p>
                    <p className="text-green-600 text-sm mt-1">Check your downloads folder</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Build Info */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-slate-500">Build Date</dt>
                    <dd className="font-medium text-slate-700">
                      {versionInfo?.buildDate ? new Date(versionInfo.buildDate).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Target SDK</dt>
                    <dd className="font-medium text-slate-700">Android {versionInfo?.targetSdkVersion}</dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>

          {/* Changelog */}
          <Card className="mb-4 shadow-lg border-0">
            <CardHeader
              className="cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleSection('changelog')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-base">What&apos;s New</CardTitle>
                </div>
                {expandedSection === 'changelog' ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </CardHeader>
            <AnimatePresence>
              {expandedSection === 'changelog' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent>
                    <ul className="space-y-2">
                      {versionInfo?.changelog?.map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Installation Steps */}
          <Card className="mb-4 shadow-lg border-0">
            <CardHeader
              className="cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleSection('install')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <CardTitle className="text-base">Installation Steps</CardTitle>
                </div>
                {expandedSection === 'install' ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </CardHeader>
            <AnimatePresence>
              {expandedSection === 'install' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent>
                    <ol className="space-y-3">
                      {[
                        { step: 1, text: 'Download the APK file by clicking the Download button above' },
                        { step: 2, text: 'Open your device Settings → Security → Enable "Unknown Sources"' },
                        { step: 3, text: 'Open the Downloads app and tap on MilkGuard.apk' },
                        { step: 4, text: 'Tap "Install" when prompted' },
                        { step: 5, text: 'Once installed, tap "Open" to launch MilkGuard' },
                      ].map((item, index) => (
                        <motion.li
                          key={item.step}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {item.step}
                          </span>
                          <span className="text-sm text-slate-600 pt-0.5">{item.text}</span>
                        </motion.li>
                      ))}
                    </ol>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Troubleshooting */}
          <Card className="mb-4 shadow-lg border-0">
            <CardHeader
              className="cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleSection('troubleshoot')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-base">Troubleshooting</CardTitle>
                </div>
                {expandedSection === 'troubleshoot' ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </CardHeader>
            <AnimatePresence>
              {expandedSection === 'troubleshoot' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="space-y-3">
                    {[
                      {
                        issue: 'Installation blocked',
                        solution: 'Go to Settings → Security → Enable "Install from Unknown Sources" for your browser'
                      },
                      {
                        issue: 'App won\'t open',
                        solution: 'Ensure you have Android 5.0 (API 21) or higher'
                      },
                      {
                        issue: 'Download fails',
                        solution: 'Check your internet connection and try again'
                      },
                      {
                        issue: 'Insufficient storage',
                        solution: 'Free up at least 50 MB of space before installing'
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-orange-50 border border-orange-200 rounded-lg p-3"
                      >
                        <p className="font-medium text-orange-800 text-sm">{item.issue}</p>
                        <p className="text-orange-600 text-xs mt-1">{item.solution}</p>
                      </motion.div>
                    ))}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Support */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-blue-100 mb-3">Need help or have questions?</p>
                <Button
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  asChild
                >
                  <a href="mailto:support@milkguard.app" className="flex items-center gap-2">
                    Contact Support
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-slate-500 text-xs">
          MilkGuard v{versionInfo?.version} • Built with ❤️ for India&apos;s food safety
        </p>
      </footer>
    </div>
  )
}

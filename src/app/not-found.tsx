import Link from "next/link"
import { Navbar } from "@/components/common/Navbar"
import { ShieldAlert, ArrowLeft, ScanLine, Cpu, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 text-center relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-100 rounded-full blur-2xl opacity-60 pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

          {/* Icon */}
          <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <span className="inline-block px-3 py-1 bg-rose-100/80 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            Error 404
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
            Page or Scan Not Found
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
            The safety record, sensor telemetry, or MilkGuard page you are looking for has been moved, archived, or never existed.
          </p>

          {/* Quick links grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
            <Link
              href="/scan"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <ScanLine className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Milk Scanner</p>
                <p className="text-[11px] text-slate-500">Run guest AI test</p>
              </div>
            </Link>

            <Link
              href="/hardware"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Hardware Docs</p>
                <p className="text-[11px] text-slate-500">AS7265x NIR specs</p>
              </div>
            </Link>

            <Link
              href="/verify"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">On-Chain Ledger</p>
                <p className="text-[11px] text-slate-500">Verify hash records</p>
              </div>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-100/50 transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Return Home</p>
                <p className="text-[11px] text-slate-500">Go to homepage</p>
              </div>
            </Link>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-md transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Safety Hub
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-100">
        MilkGuard &copy; 2026 &bull; FSSAI Compliant Smart Optical Detection
      </footer>
    </div>
  )
}

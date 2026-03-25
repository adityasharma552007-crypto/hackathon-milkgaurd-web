"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import {
  Droplets, FlaskConical, AlertTriangle, Shield, Waves, Info,
  Activity, BookOpen, AlertCircle, Search, Sparkles
} from "lucide-react"

const FACTS = [
  "97% of milk samples in Rajasthan were found adulterated in 2025",
  "Formalin used in milk preservation is a classified carcinogen",
  "Urea is added to milk to artificially inflate protein readings"
]

const ADULTERANTS = [
  { 
    id: "water", name: "Water", emoji: "💧", danger: "Dilutes nutrients & causes infections",
    what: "Unclean tap or river water added to milk.",
    why: "Used purely to increase milk volume for higher profit.",
    health: "High risk of waterborne diseases like cholera and typhoid if unclean.",
    fssai: "0% added water (Lactometer reading < 26 indicates added water)"
  },
  { 
    id: "urea", name: "Urea", emoji: "🧪", danger: "Damages kidneys & digestive tract",
    what: "A chemical compound usually used as fertilizer.",
    why: "Added to artificially inflate the non-protein nitrogen (SNF) readings in lab tests.",
    health: "Long-term exposure leads to severe kidney damage and impaired vision.",
    fssai: "Max 0.07% (Naturally occurring). Any added urea is strictly prohibited."
  },
  { 
    id: "detergent", name: "Detergent", emoji: "🧼", danger: "Causes severe gastric distress",
    what: "Liquid soap, shampoo, or liquid detergent.",
    why: "Used to emulsify added oils and create a fake creamy lather/froth in synthetic milk.",
    health: "Gastrointestinal complications, food poisoning, and potential liver damage.",
    fssai: "Zero tolerance. Strictly prohibited."
  },
  { 
    id: "starch", name: "Starch", emoji: "🌾", danger: "Harmful for diabetics",
    what: "Wheat flour, arrowroot, or rice flour.",
    why: "Added to restore the thickness and solid-not-fat (SNF) value after water dilution.",
    health: "Can cause massive sugar spikes; dangerous for diabetics. Mild gastric issues.",
    fssai: "Zero tolerance. Strictly prohibited."
  },
  { 
    id: "formalin", name: "Formalin", emoji: "☠️", danger: "Classified carcinogen (cancer-causing)",
    what: "A 40% solution of formaldehyde, typically used to preserve biological specimens.",
    why: "Used to artificially extend the shelf-life of milk in hot weather without refrigeration.",
    health: "Highly toxic. Causes severe liver & kidney damage. Known cancer-causing agent.",
    fssai: "Zero tolerance. Strictly prohibited."
  },
  { 
    id: "fat", name: "Foreign Fat", emoji: "🧈", danger: "Increases bad cholesterol",
    what: "Hydrogenated vegetable oils (Dalda) or cheap recycled cooking oils.",
    why: "Replaces the natural expensive milk fat (ghee) which is extracted and sold separately.",
    health: "Increases risk of heart attacks, cardiovascular diseases, and bad cholesterol.",
    fssai: "Only pure milk fat is permitted. No foreign fat allowed."
  }
]

const TESTS = [
  {
    id: "iodine", name: "Iodine Test", target: "Starch", time: "2 min", icon: FlaskConical,
    steps: ["Take 5ml of milk in a glass.", "Add 2 drops of standard Iodine solution.", "If milk turns deep blue or black, starch is present."]
  },
  {
    id: "froth", name: "Froth Test", target: "Detergent", time: "2 min", icon: Waves,
    steps: ["Take 5-10ml of milk in a glass bottle.", "Add equal amount of water.", "Shake vigorously for 5 minutes.", "Dense, lasting lather indicates detergent (pure milk creates thin, quickly disappearing froth)."]
  },
  {
    id: "litmus", name: "Litmus Test", target: "Urea", time: "2 min", icon: Sparkles,
    steps: ["Dip a red litmus paper into a milk sample.", "Leave it for 1 minute.", "If paper turns blue, it indicates urea or excessive alkaline adulterants."]
  },
  {
    id: "drop", name: "Surface Drop Test", target: "Water", time: "2 min", icon: Droplets,
    steps: ["Take a polished slanting surface (e.g., a steel plate).", "Put one drop of milk on it.", "Pure milk flows slowly leaving a white trail.", "Diluted milk flows immediately without any visible trail."]
  },
  {
    id: "h2so4", name: "H2SO4 Ring Test", target: "Formalin", time: "2 min", icon: AlertCircle,
    steps: ["Take 5ml of milk in a test tube.", "Slowly add 2ml of concentrated Sulfuric acid by the side of the tube.", "A violet or purple ring at the junction indicates Formalin."]
  },
  {
    id: "lacto", name: "Lactometer", target: "Density", time: "2 min", icon: Activity,
    steps: ["Pour milk into a deep jar.", "Float a standard lactometer in the milk.", "Read the level. Pure milk reads between 26 and 32 (specific gravity 1.026 - 1.032).", "Below 26 means added water."]
  }
]

const FSSAI_STANDARDS = [
  { name: "Added Water", limit: "0%", risk: "Low" },
  { name: "Urea", limit: "< 0.07% (Natural)", risk: "High" },
  { name: "Detergent", limit: "Zero Tolerance", risk: "Severe" },
  { name: "Formalin", limit: "Zero Tolerance", risk: "Severe" },
  { name: "Starch", limit: "Zero Tolerance", risk: "Moderate" }
]

export default function LearnPage() {
  const [factIndex, setFactIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FACTS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#F7F9F8] pb-32">
      {/* Header */}
      <div className="bg-[#1A6B4A] text-white p-6 pt-12 pb-16 relative overflow-hidden">
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">EduGuard</h1>
        <p className="text-sm font-medium opacity-90">Your sanctuary for milk purity knowledge.</p>
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-[60px]" />
      </div>

      <main className="p-4 -mt-10 relative z-10 space-y-8">
        {/* Featured Fact Card */}
        <Card className="rounded-3xl border-none shadow-xl bg-gradient-to-br from-[#1A6B4A] to-green-800 text-white overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <Info size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Did You Know?</span>
            </div>
            <div className="min-h-[80px] flex items-center">
              <p className="text-xl font-bold leading-tight transition-opacity duration-500">
                "{FACTS[factIndex]}"
              </p>
            </div>
            {/* Dots */}
            <div className="flex gap-2 mt-6">
              {FACTS.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === factIndex ? 'w-6 bg-white' : 'w-2 bg-white/30'}`} />
              ))}
            </div>
          </CardContent>
          <BookOpen className="absolute bottom-[-20px] right-[-20px] w-32 h-32 text-white opacity-5" />
        </Card>

        {/* What's In Your Milk? */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest px-2">What's In Your Milk?</h2>
          </div>
          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-4 no-scrollbar">
            {ADULTERANTS.map((adulterant) => (
              <Sheet key={adulterant.id}>
                <SheetTrigger asChild>
                  <Card className="min-w-[200px] w-[200px] rounded-3xl border-none shadow-md cursor-pointer hover:shadow-lg transition-all flex-shrink-0">
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="text-4xl mb-4 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center">
                        {adulterant.emoji}
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 mb-1">{adulterant.name}</h3>
                      <p className="text-xs text-red-500 font-medium leading-snug line-clamp-2">
                        {adulterant.danger}
                      </p>
                    </CardContent>
                  </Card>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-[2rem] max-h-[90vh] pb-10">
                  <SheetHeader className="text-left mt-2">
                    <div className="text-5xl mb-4 bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
                      {adulterant.emoji}
                    </div>
                    <SheetTitle className="text-2xl font-black text-center">{adulterant.name}</SheetTitle>
                    <SheetDescription className="text-center text-red-500 font-medium">
                      {adulterant.danger}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-8 space-y-6">
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Info size={14} className="text-[#1A6B4A]" /> What it is
                      </h4>
                      <p className="text-sm font-medium text-slate-700">{adulterant.what}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertCircle size={14} className="text-amber-500" /> Why it is added
                      </h4>
                      <p className="text-sm font-medium text-slate-700">{adulterant.why}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Activity size={14} className="text-red-500" /> Health Impact
                      </h4>
                      <p className="text-sm font-medium text-slate-700">{adulterant.health}</p>
                    </div>
                    <div className="bg-[#F8FBF9] p-4 rounded-2xl border border-green-100">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Shield size={14} className="text-[#1A6B4A]" /> FSSAI Safe Limit
                      </h4>
                      <p className="text-sm font-bold text-[#1A6B4A]">{adulterant.fssai}</p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </section>

        {/* Home Test Guides */}
        <section>
          <div className="mb-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest px-2">Home Test Guides</h2>
            <p className="text-xs text-slate-500 font-medium px-2 mt-1">Simple ways to test milk purity at home.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TESTS.map((test) => {
              const Icon = test.icon
              return (
                <Sheet key={test.id}>
                  <SheetTrigger asChild>
                    <Card className="rounded-2xl border-none shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-[#F8FBF9] rounded-xl flex items-center justify-center text-[#1A6B4A] mb-3">
                          <Icon size={24} />
                        </div>
                        <h3 className="font-bold text-sm text-slate-800 mb-1 leading-tight">{test.name}</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">FOR {test.target}</p>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none text-[10px] px-2 py-0">
                          {test.time}
                        </Badge>
                      </CardContent>
                    </Card>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-[2rem] max-h-[90vh] pb-10">
                     <SheetHeader className="text-center mt-2">
                       <div className="w-16 h-16 bg-[#F8FBF9] rounded-2xl flex items-center justify-center text-[#1A6B4A] mx-auto mb-4">
                         <Icon size={32} />
                       </div>
                       <SheetTitle className="text-2xl font-black">{test.name}</SheetTitle>
                       <SheetDescription className="font-bold text-slate-400 uppercase tracking-widest text-xs">
                         Testing for {test.target}
                       </SheetDescription>
                     </SheetHeader>
                     <div className="mt-8 space-y-4">
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b pb-2">Step by Step Guide</h4>
                       {test.steps.map((step, idx) => (
                         <div key={idx} className="flex gap-4">
                           <div className="w-6 h-6 rounded-full bg-[#1A6B4A] text-white flex items-center justify-center text-xs font-black shrink-0">
                             {idx + 1}
                           </div>
                           <p className="text-sm font-medium text-slate-700 pt-0.5 leading-relaxed">{step}</p>
                         </div>
                       ))}
                     </div>
                  </SheetContent>
                </Sheet>
              )
            })}
          </div>
        </section>

        {/* FSSAI Standards Table */}
        <section>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest px-2 mb-4">FSSAI Standards</h2>
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-black text-slate-400 uppercase bg-slate-50">
                  <tr>
                    <th className="px-5 py-4">Adulterant</th>
                    <th className="px-5 py-4">Limit</th>
                    <th className="px-5 py-4">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {FSSAI_STANDARDS.map((std, idx) => (
                    <tr key={idx} className={`border-b border-slate-50 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="px-5 py-4 font-bold text-slate-700">{std.name}</td>
                      <td className="px-5 py-4 font-medium text-slate-500">{std.limit}</td>
                      <td className="px-5 py-4">
                        <Badge variant="secondary" className={`border-none text-[10px] px-2 py-0 ${
                          std.risk === 'Severe' ? 'bg-red-50 text-red-600' :
                          std.risk === 'High' ? 'bg-amber-50 text-amber-600' :
                          'bg-green-50 text-[#1A6B4A]'
                        }`}>
                          {std.risk}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}

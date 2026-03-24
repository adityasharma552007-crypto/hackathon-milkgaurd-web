import { generateWavelengths, pickProfile } from "./wavegen"
import { createClient } from "@/lib/supabase/client"

export interface ScanRequest {
  userId: string
  vendorId?: string
}

export interface ScanResponse {
  success: boolean
  scanId: string
  safetyScore: number
  resultTier: "safe" | "warning" | "danger" | "hazard"
  aiConfidence: number
  scanDuration: number
  adulterants: AdulterantResult[]
  wavelengthAnalysis: WavelengthReading[]
  recommendation: string
  autoReported: boolean
  error?: string
}

export interface AdulterantResult {
  name: string
  detected: boolean
  detectedValue: number
  safeLimit: number
  unit: string
  status: "safe" | "warning" | "danger" | "hazard" | "clear"
  quantity500ml: number
  analogy: string
}

export interface WavelengthReading {
  channel: number
  wavelength: number
  reading: number
  baseline: number
  deviationPct: number
  status: "normal" | "elevated" | "anomaly"
}

export async function runScan(request: ScanRequest): Promise<ScanResponse> {
  const profile    = pickProfile()
  const wavelengths = generateWavelengths(profile)

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-milk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        wavelengths,
        userId:   request.userId,
        vendorId: request.vendorId ?? null
      })
    }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? "Scan failed")
  }

  return res.json()
}

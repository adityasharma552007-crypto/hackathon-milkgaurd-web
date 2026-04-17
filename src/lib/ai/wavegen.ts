/**
 * AS7343 14-Channel Wavegen & Profile Simulator
 *
 * Maps the 14 AS7343 spectral channels to approximate wavelengths:
 *   F1 ~415nm, F2 ~445nm, F3 ~480nm, F4 ~515nm,
 *   F5 ~555nm, F6 ~590nm, F7 ~630nm, F8 ~680nm,
 *   NIR ~855nm, Clear (broadband)
 *
 * Used by the AI scan engine when no real hardware reading is available.
 * When real AS7343 data is present, these simulated values are replaced
 * by the actual channel readings from milk_data.
 */

// ─── Pure milk spectral baseline (AS7343 14-channel) ────────────────────────
// Indices: [F1, F2, F3, F4, F5, F6, F7, F8, NIR, CLEAR, FD, FZ, FY, FXL]
const BASELINE: readonly number[] = [
  0.52, 0.61, 0.74, 0.78, 0.80, 0.76, 0.70, 0.63,  // F1–F8  (visible)
  0.48,                                               // NIR
  0.82,                                               // CLEAR
  0.44, 0.51, 0.58, 0.65,                            // FD, FZ, FY, FXL (auxiliary)
]

type Profile = 'pure' | 'adulterated' | 'hazardous'

// ─── Adulteration spikes mapped to AS7343 channel positions ─────────────────
const SPIKES: Record<Profile, Partial<Record<number, number>>> = {
  pure: {},
  adulterated: {
    3:  +0.18,  // F4 ~515nm  — urea spike
    4:  +0.20,  // F5 ~555nm  — urea spike
    8:  +0.12,  // NIR        — water dilution elevation
  },
  hazardous: {
    2:  +0.15,  // F3 ~480nm  — detergent zone
    3:  +0.25,  // F4 ~515nm  — detergent spike
    4:  +0.22,  // F5 ~555nm  — detergent spike
    8:  +0.35,  // NIR        — formalin / heavy adulterant
  },
}

function noise(): number {
  return (Math.random() - 0.5) * 0.06  // ±3% sensor noise
}

/** Generate simulated readings for all 14 AS7343 channels */
export function generateWavelengths(profile: Profile): number[] {
  const spikes = SPIKES[profile]
  return (BASELINE as number[]).map((base, i) => {
    const spike = spikes[i] ?? 0
    const value = base + spike + noise()
    return Math.round(Math.max(0.01, Math.min(0.99, value)) * 1000) / 1000
  })
}

export function pickProfile(): Profile {
  const rand = Math.random()
  if (rand < 0.70) return 'pure'
  if (rand < 0.90) return 'adulterated'
  return 'hazardous'
}

// ─── Channel metadata (for display and labelling) ─────────────────────────────
export interface ChannelMeta {
  key: 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8' | 'nir' | 'clear'
  label: string
  wavelength: string
  color: string
}

export const AS7343_CHANNELS: ChannelMeta[] = [
  { key: 'f1',    label: 'F1',    wavelength: '415nm', color: '#8B5CF6' },
  { key: 'f2',    label: 'F2',    wavelength: '445nm', color: '#6366F1' },
  { key: 'f3',    label: 'F3',    wavelength: '480nm', color: '#3B82F6' },
  { key: 'f4',    label: 'F4',    wavelength: '515nm', color: '#06B6D4' },
  { key: 'f5',    label: 'F5',    wavelength: '555nm', color: '#10B981' },
  { key: 'f6',    label: 'F6',    wavelength: '590nm', color: '#84CC16' },
  { key: 'f7',    label: 'F7',    wavelength: '630nm', color: '#F59E0B' },
  { key: 'f8',    label: 'F8',    wavelength: '680nm', color: '#EF4444' },
  { key: 'nir',   label: 'NIR',   wavelength: '855nm', color: '#7C3AED' },
  { key: 'clear', label: 'Clear', wavelength: 'BB',    color: '#94A3B8' },
]

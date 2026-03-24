const BASELINE = [
  0.81, 0.80, 0.75, 0.71, 0.68, 0.64,
  0.61, 0.57, 0.55, 0.51, 0.47, 0.44,
  0.41, 0.68, 0.35, 0.31, 0.29, 0.27
]

type Profile = "pure" | "adulterated" | "hazardous"

const SPIKES: Record<Profile, Partial<Record<number, number>>> = {
  pure: {},
  adulterated: {
    4:  +0.22,   // 510nm — urea spike
    5:  +0.20,   // 535nm — urea spike
    13: +0.09,   // 760nm — water elevation
  },
  hazardous: {
    3:  +0.18,   // 485nm — detergent zone
    4:  +0.28,   // 510nm — detergent spike
    5:  +0.25,   // 535nm — detergent spike
    16: +0.52,   // 900nm — formalin spike
  }
}

function noise() {
  return (Math.random() - 0.5) * 0.06  // ±3% noise
}

export function generateWavelengths(profile: Profile): number[] {
  const spikes = SPIKES[profile]
  return BASELINE.map((base, i) => {
    const spike = spikes[i] ?? 0
    const value = base + spike + noise()
    return Math.round(Math.max(0.01, Math.min(0.99, value)) * 1000) / 1000
  })
}

export function pickProfile(): Profile {
  const rand = Math.random()
  if (rand < 0.70) return "pure"
  if (rand < 0.90) return "adulterated"
  return "hazardous"
}

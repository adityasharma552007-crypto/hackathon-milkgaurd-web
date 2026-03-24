export const colors = {
  // Core palette
  primaryDark: '#1A6B4A',   // Deep Medical Green
  primaryMid: '#2ECC8A',    // Bright Mint — active states
  accent: '#F5A623',        // Warm Amber — CTAs
  background: '#F7F9F8',    // Off-white with green tint
  surface: '#FFFFFF',       // Card surfaces

  // Text
  textPrimary: '#1C1C1E',   // Near black
  textMuted: '#6E7A80',     // Slate grey
  textInverse: '#FFFFFF',   // On dark backgrounds

  // Status
  safe: '#27AE60',          // Safe results
  warning: '#F39C12',       // Caution
  danger: '#E67E22',        // Adulterated
  hazard: '#C0392B',        // Toxic/critical

  // Backgrounds (tinted)
  safeBg: '#D8F3DC',
  warningBg: '#FFF3CD',
  dangerBg: '#FFE5D9',
  hazardBg: '#FFE5E7',

  // UI
  divider: '#E8F0EC',
  cardBorder: '#E8F0EC',
  chartGrid: '#F0F4F2',
} as const;

export type ColorKey = keyof typeof colors;

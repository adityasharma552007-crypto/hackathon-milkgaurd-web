import { colors } from '../theme/colors';
import { AdulterantResult } from '../data/mockScans';

export type SafetyTier = 'safe' | 'warning' | 'danger' | 'hazard';

export interface SafetyLabel {
  label: string;
  color: string;
  icon: string;
  tier: SafetyTier;
  bgColor: string;
}

export function calculateSafetyScore(adulterants: Record<string, AdulterantResult>): number {
  let score = 100;
  const entries = Object.values(adulterants);

  for (const item of entries) {
    if (item.status === 'hazard' || (item.isToxic && item.detected)) {
      score -= 50;
    } else if (item.status === 'danger') {
      // significantly above limit (2x-5x)
      if (item.limit > 0 && item.value >= item.limit * 2) {
        score -= 30;
      } else {
        score -= 15;
      }
    } else if (item.status === 'warning') {
      // slightly above limit (up to 2x)
      score -= 15;
    } else if (item.status === 'safe' && item.detected) {
      score -= 5;
    }
  }

  return Math.max(0, Math.min(100, score));
}

export function getSafetyLabel(score: number): SafetyLabel {
  if (score >= 85) {
    return {
      label: 'Pure & Safe',
      color: colors.safe,
      bgColor: colors.safeBg,
      icon: '✅',
      tier: 'safe',
    };
  } else if (score >= 60) {
    return {
      label: 'Minor Issues',
      color: colors.warning,
      bgColor: colors.warningBg,
      icon: '⚠️',
      tier: 'warning',
    };
  } else if (score >= 30) {
    return {
      label: 'Adulterated',
      color: colors.danger,
      bgColor: colors.dangerBg,
      icon: '🚨',
      tier: 'danger',
    };
  } else {
    return {
      label: 'Hazardous',
      color: colors.hazard,
      bgColor: colors.hazardBg,
      icon: '☠️',
      tier: 'hazard',
    };
  }
}

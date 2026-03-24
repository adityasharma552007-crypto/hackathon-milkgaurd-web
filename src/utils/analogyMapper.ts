import { colors } from '../theme/colors';

export function getBarPercentage(
  value: number,
  limit: number,
  type: 'max' | 'min'
): number {
  if (limit === 0) {
    // For zero-tolerance items, any detection = 110% (overflow)
    return value > 0 ? 110 : 0;
  }
  if (type === 'max') {
    return Math.min(110, (value / limit) * 100);
  } else {
    // For min limits (like fat), lower value = worse, so invert
    const pct = (value / limit) * 100;
    return Math.min(110, 200 - pct); // inversion: 100% fat = 100%, 50% fat = 150% (cap at 110)
  }
}

export function getBarColor(percentage: number): string {
  if (percentage <= 60) return colors.safe;
  if (percentage <= 85) return colors.warning;
  if (percentage <= 100) return colors.danger;
  return colors.hazard;
}

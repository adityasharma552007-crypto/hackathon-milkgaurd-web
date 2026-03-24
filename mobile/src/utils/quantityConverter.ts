export interface QuantityResult {
  amount: number;
  unit: string;
  analogy: string;
  isToxic: boolean;
}

const TOXIC_ADULTERANTS = ['detergent', 'formalin'];

export function convertToQuantity(
  adulterant: string,
  percentage: number,
  volumeMl: number = 500
): QuantityResult {
  const isToxic = TOXIC_ADULTERANTS.includes(adulterant);

  if (isToxic) {
    const amount = parseFloat((percentage * volumeMl / 100).toFixed(3));
    return {
      amount,
      unit: adulterant === 'detergent' ? 'ml' : 'ml',
      analogy: 'TOXIC AT ANY LEVEL',
      isToxic: true,
    };
  }

  switch (adulterant) {
    case 'waterAddition': {
      const amount = parseFloat(((percentage / 100) * volumeMl).toFixed(1));
      const teaspoons = parseFloat((amount / 5).toFixed(1));
      return {
        amount,
        unit: 'ml',
        analogy: `≈ ${teaspoons} teaspoon${teaspoons !== 1 ? 's' : ''} of water`,
        isToxic: false,
      };
    }
    case 'urea': {
      const amount = parseFloat(((percentage / 100) * volumeMl).toFixed(2));
      const analogy = amount < 0.5 ? '≈ a tiny pinch' : '≈ a small pinch';
      return { amount, unit: 'g', analogy, isToxic: false };
    }
    case 'starch': {
      const amount = parseFloat(((percentage / 100) * volumeMl).toFixed(2));
      return { amount, unit: 'g', analogy: `≈ ${(amount / 2.5).toFixed(1)} pinches`, isToxic: false };
    }
    case 'neutralizers': {
      const amount = parseFloat(((percentage / 100) * volumeMl).toFixed(2));
      return { amount, unit: 'g', analogy: `≈ ${(amount * 4).toFixed(1)} grains of salt`, isToxic: false };
    }
    case 'fatContent': {
      // Fat is a "min" limit — shortage
      const missingPct = 3.5 - percentage;
      if (missingPct <= 0) {
        return { amount: 0, unit: 'g', analogy: 'Fat content is adequate', isToxic: false };
      }
      const missing = parseFloat(((missingPct / 100) * volumeMl).toFixed(1));
      return { amount: missing, unit: 'g', analogy: `Missing ${missing}g of natural fat`, isToxic: false };
    }
    default: {
      const amount = parseFloat(((percentage / 100) * volumeMl).toFixed(2));
      return { amount, unit: 'g', analogy: `≈ ${amount}g substance`, isToxic: false };
    }
  }
}

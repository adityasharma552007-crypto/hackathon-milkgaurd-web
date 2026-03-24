export interface AdulterantInfo {
  name: string;
  chemicalName: string;
  dangerLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  healthImpact: string;
  fssaiLimit: string;
  isToxic: boolean;
}

export const ADULTERANT_DB: Record<string, AdulterantInfo> = {
  waterAddition: {
    name: 'Water Addition',
    chemicalName: 'H₂O (excess)',
    dangerLevel: 'low',
    description: 'Addition of water reduces the nutritional value of milk without any health risk.',
    healthImpact: 'Reduces protein, fat and mineral content. Financial fraud.',
    fssaiLimit: 'Max 3% above natural moisture',
    isToxic: false,
  },
  urea: {
    name: 'Urea',
    chemicalName: 'CO(NH₂)₂',
    dangerLevel: 'medium',
    description: 'Urea is added to boost the SNF (Solid Not Fat) level artificially.',
    healthImpact: 'Kidney damage, liver stress with prolonged consumption.',
    fssaiLimit: 'Max 0.07%',
    isToxic: false,
  },
  detergent: {
    name: 'Detergent',
    chemicalName: 'Sodium Dodecyl Sulfate (SDS)',
    dangerLevel: 'critical',
    description: 'Detergent is sometimes added to emulsify water into milk and create artificial froth.',
    healthImpact: 'Gastroenteritis, liver and kidney damage. TOXIC.',
    fssaiLimit: 'Zero tolerance — NOT PERMITTED',
    isToxic: true,
  },
  starch: {
    name: 'Starch',
    chemicalName: 'Polysaccharide starch',
    dangerLevel: 'medium',
    description: 'Starch is added to increase milk viscosity after water dilution.',
    healthImpact: 'Digestive issues, problematic for diabetics.',
    fssaiLimit: 'Zero tolerance — NOT PERMITTED',
    isToxic: false,
  },
  formalin: {
    name: 'Formalin',
    chemicalName: 'Formaldehyde (HCHO)',
    dangerLevel: 'critical',
    description: 'Formalin is a preservative used to extend shelf life of adulterated milk.',
    healthImpact: 'Carcinogenic. Causes respiratory distress, liver and kidney failure. TOXIC.',
    fssaiLimit: 'Zero tolerance — NOT PERMITTED',
    isToxic: true,
  },
  neutralizers: {
    name: 'Neutralizers',
    chemicalName: 'Sodium Carbonate / Bicarbonate',
    dangerLevel: 'medium',
    description: 'Neutralizers are added to increase milk shelf life by masking acidity.',
    healthImpact: 'Destroys vitamins, affects gut flora, causes mineral imbalance.',
    fssaiLimit: 'Max 0.05%',
    isToxic: false,
  },
  fatContent: {
    name: 'Fat Content',
    chemicalName: 'Milk Fat (Triglycerides)',
    dangerLevel: 'low',
    description: 'Fat is a key nutritional indicator. Low fat may indicate skimming or dilution.',
    healthImpact: 'Reduced nutritional value, especially for infants.',
    fssaiLimit: 'Min 3.5% for full-fat toned milk',
    isToxic: false,
  },
};

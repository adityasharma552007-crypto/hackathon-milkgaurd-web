export interface AdulterantResult {
  detected: boolean;
  value: number;
  limit: number;
  unit: string;
  status: 'safe' | 'warning' | 'danger' | 'hazard' | 'clear';
}

export interface ScanProfile {
  id: string;
  profileName: string;
  score: number;
  waterAddition: AdulterantResult;
  urea: AdulterantResult;
  detergent: AdulterantResult;
  starch: AdulterantResult;
  formalin: AdulterantResult;
  neutralizers: AdulterantResult;
  fatContent: AdulterantResult;
  wavelengths: number[];
  baseline?: number[];
  aiConfidence: number;
  scanDuration: number;
  vendor: string;
  area: string;
  timestamp: string;
  location: { lat: number; lng: number };
}

const now = () => new Date().toISOString();

export const PURE_MILK_PROFILE: ScanProfile = {
  id: 'scan_pure_001',
  profileName: 'PURE_MILK',
  score: 91,
  waterAddition: { detected: true, value: 2.1, limit: 3.0, unit: '%', status: 'safe' },
  urea: { detected: true, value: 0.04, limit: 0.07, unit: '%', status: 'safe' },
  detergent: { detected: false, value: 0.00, limit: 0.00, unit: '%', status: 'clear' },
  starch: { detected: false, value: 0.00, limit: 0.00, unit: '%', status: 'clear' },
  formalin: { detected: false, value: 0.00, limit: 0.00, unit: '%', status: 'clear' },
  neutralizers: { detected: false, value: 0.00, limit: 0.00, unit: '%', status: 'clear' },
  fatContent: { detected: true, value: 2.8, limit: 3.5, unit: '%', status: 'warning' },
  wavelengths: [0.82, 0.79, 0.76, 0.72, 0.68, 0.65, 0.61, 0.58, 0.55, 0.51, 0.48, 0.44, 0.41, 0.74, 0.35, 0.32, 0.29, 0.28],
  baseline: [0.81, 0.80, 0.75, 0.71, 0.68, 0.64, 0.61, 0.57, 0.55, 0.51, 0.47, 0.44, 0.41, 0.68, 0.35, 0.31, 0.29, 0.27],
  aiConfidence: 97.4,
  scanDuration: 7.8,
  vendor: 'Amul Dairy Booth',
  area: 'Vaishali Nagar',
  timestamp: now(),
  location: { lat: 26.9124, lng: 75.7873 },
};

export const ADULTERATED_PROFILE: ScanProfile = {
  id: 'scan_adult_001',
  profileName: 'ADULTERATED',
  score: 42,
  urea: { detected: true, value: 0.11, limit: 0.07, unit: '%', status: 'danger' },
  waterAddition: { detected: true, value: 5.8, limit: 3.0, unit: '%', status: 'danger' },
  neutralizers: { detected: true, value: 0.08, limit: 0.05, unit: '%', status: 'warning' },
  detergent: { detected: false, value: 0.00, limit: 0.00, unit: '%', status: 'clear' },
  starch: { detected: false, value: 0.00, limit: 0.00, unit: '%', status: 'clear' },
  formalin: { detected: false, value: 0.00, limit: 0.00, unit: '%', status: 'clear' },
  fatContent: { detected: true, value: 2.1, limit: 3.5, unit: '%', status: 'danger' },
  wavelengths: [0.81, 0.80, 0.75, 0.71, 0.88, 0.84, 0.61, 0.57, 0.55, 0.51, 0.47, 0.44, 0.41, 0.82, 0.35, 0.31, 0.29, 0.27],
  baseline: [0.81, 0.80, 0.75, 0.71, 0.68, 0.64, 0.61, 0.57, 0.55, 0.51, 0.47, 0.44, 0.41, 0.68, 0.35, 0.31, 0.29, 0.27],
  aiConfidence: 94.1,
  scanDuration: 8.1,
  vendor: 'Local Dairy - Mansarovar',
  area: 'Mansarovar',
  timestamp: now(),
  location: { lat: 26.8479, lng: 75.7506 },
};

export const HAZARDOUS_PROFILE: ScanProfile = {
  id: 'scan_haz_001',
  profileName: 'HAZARDOUS',
  score: 18,
  detergent: { detected: true, value: 0.31, limit: 0.00, unit: '%', status: 'hazard' },
  formalin: { detected: true, value: 0.009, limit: 0.00, unit: '%', status: 'hazard' },
  waterAddition: { detected: true, value: 2.4, limit: 3.0, unit: '%', status: 'safe' },
  urea: { detected: true, value: 0.03, limit: 0.07, unit: '%', status: 'safe' },
  starch: { detected: false, value: 0.00, limit: 0.00, unit: '%', status: 'clear' },
  neutralizers: { detected: false, value: 0.00, limit: 0.00, unit: '%', status: 'clear' },
  fatContent: { detected: true, value: 1.9, limit: 3.5, unit: '%', status: 'hazard' },
  wavelengths: [0.82, 0.79, 0.74, 0.69, 0.91, 0.88, 0.61, 0.57, 0.55, 0.51, 0.48, 0.44, 0.41, 0.70, 0.35, 0.32, 0.79, 0.28],
  baseline: [0.81, 0.80, 0.75, 0.71, 0.68, 0.64, 0.61, 0.57, 0.55, 0.51, 0.47, 0.44, 0.41, 0.68, 0.35, 0.31, 0.29, 0.27],
  aiConfidence: 98.7,
  scanDuration: 7.6,
  vendor: 'Unnamed Vendor - Sanganer',
  area: 'Sanganer',
  timestamp: now(),
  location: { lat: 26.7899, lng: 75.8105 },
};

export const MOCK_SCAN_PROFILES = [PURE_MILK_PROFILE, ADULTERATED_PROFILE, HAZARDOUS_PROFILE];

import {
  PURE_MILK_PROFILE,
  ADULTERATED_PROFILE,
  HAZARDOUS_PROFILE,
  ScanProfile,
} from '../data/mockScans';

function selectProfile(): ScanProfile {
  const rand = Math.random();
  if (rand < 0.70) return { ...PURE_MILK_PROFILE, id: `scan_${Date.now()}`, timestamp: new Date().toISOString() };
  if (rand < 0.90) return { ...ADULTERATED_PROFILE, id: `scan_${Date.now()}`, timestamp: new Date().toISOString() };
  return { ...HAZARDOUS_PROFILE, id: `scan_${Date.now()}`, timestamp: new Date().toISOString() };
}

export const ScanEngine = {
  /** Triggers an async scan, resolves after scanDuration seconds with a result profile */
  async triggerScan(
    onProgress?: (elapsed: number) => void
  ): Promise<ScanProfile> {
    const profile = selectProfile();
    const duration = profile.scanDuration * 1000;
    const interval = 200;
    let elapsed = 0;

    return new Promise((resolve) => {
      const timer = setInterval(() => {
        elapsed += interval;
        onProgress?.(elapsed / duration);
        if (elapsed >= duration) {
          clearInterval(timer);
          resolve(profile);
        }
      }, interval);
    });
  },
};

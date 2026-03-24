import { create } from 'zustand';
import { ScanProfile } from '../data/mockScans';

interface ScanState {
  scans: ScanProfile[];
  currentScan: ScanProfile | null;
  addScan: (scan: ScanProfile) => void;
  setCurrentScan: (scan: ScanProfile | null) => void;
}

export const useScanStore = create<ScanState>((set) => ({
  scans: [],
  currentScan: null,
  addScan: (scan) =>
    set((state) => ({ scans: [scan, ...state.scans] })),
  setCurrentScan: (scan) => set({ currentScan: scan }),
}));

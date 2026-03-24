import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { useScanStore } from './src/store/useScanStore';
import { PURE_MILK_PROFILE, ADULTERATED_PROFILE, HAZARDOUS_PROFILE } from './src/data/mockScans';

export default function App() {
  const { addScan } = useScanStore();

  useEffect(() => {
    // Populate with some initial data for demo
    addScan({ ...PURE_MILK_PROFILE, id: 'init_1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() });
    addScan({ ...ADULTERATED_PROFILE, id: 'init_2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() });
    addScan({ ...PURE_MILK_PROFILE, id: 'init_3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() });
  }, []);

  return <AppNavigator />;
}

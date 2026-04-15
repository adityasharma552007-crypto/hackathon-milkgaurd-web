import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logToBlockchain } from '@/lib/logToBlockchain';

export interface ScanRow {
  id: string;
  quality: number;
  created_at: string;
  tx_hash?: string | null;
}

export const getDerivativeStatus = (quality: number) => {
  if (quality >= 0.7 && quality <= 0.9) return 'Pure Milk';
  if (quality >= 0.2 && quality <= 0.4) return 'Adulterated / Spoiled';
  return 'Uncertain';
};

export function useRealtimeScans() {
  const [readings, setReadings] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 1. Fetch initial 10 rows
    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from('milk_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (data) {
        setReadings(data);
      } else if (error) {
        console.error('Failed to fetch initial scans:', error);
      }
      setLoading(false);
    };

    fetchInitial();

    // 2. Subscribe to realtime inserts and updates
    const channel = supabase
      .channel('milk_data_realtime_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'milk_data' },
        (payload) => {
          const newScan = payload.new as ScanRow;
          
          // 3. Prepend to state immediately for fast UI response
          setReadings((prev) => [newScan, ...prev]);

          // Derive the status string for blockchain logging
          const activeStatus = getDerivativeStatus(newScan.quality);

          // Trigger server-side blockchain log without freezing UI
          logToBlockchain({
            id: newScan.id,
            quality: newScan.quality,
            status: activeStatus,
            created_at: newScan.created_at
          }).catch(console.error);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'milk_data' },
        (payload) => {
          const updatedScan = payload.new as ScanRow;
          // When the server action updates the tx_hash, it broadcasts an UPDATE.
          // We catch that here and update the UI card with the tx_hash signature.
          if (updatedScan.tx_hash) {
             setReadings((prev) => 
               prev.map((r) => r.id === updatedScan.id ? { ...r, tx_hash: updatedScan.tx_hash } : r)
             );
          }
        }
      )
      .subscribe();

    // 4. Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { readings, loading };
}

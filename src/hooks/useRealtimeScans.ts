import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logToBlockchain } from '@/lib/logToBlockchain';

// ─── AS7343 14-Channel Scan Row ───────────────────────────────────────────────
export interface ScanRow {
  id: string;
  // Visible spectrum channels (AS7343 F1–F8)
  f1: number | null;
  f2: number | null;
  f3: number | null;
  f4: number | null;
  f5: number | null;
  f6: number | null;
  f7: number | null;
  f8: number | null;
  // Extra channels
  nir: number | null;    // Near-Infrared
  clear: number | null;  // Clear (broadband)
  // Result
  quality: number;         // 0.0 – 1.0 adulteration score
  status: string | null;   // "Pure" | "Adulterated" | "Uncertain"
  // Blockchain
  tx_hash?: string | null;
  channel_hash?: string | null;
  created_at: string;
}

// ─── Quality thresholds ───────────────────────────────────────────────────────
export const getStatusFromQuality = (quality: number): 'Pure' | 'Adulterated' | 'Uncertain' => {
  if (quality >= 0.7 && quality <= 0.9) return 'Pure';
  if (quality >= 0.2 && quality <= 0.4) return 'Adulterated';
  return 'Uncertain';
};

/** @deprecated Use getStatusFromQuality — kept for backward compat */
export const getDerivativeStatus = (quality: number): string => {
  if (quality >= 0.7 && quality <= 0.9) return 'Pure Milk';
  if (quality >= 0.2 && quality <= 0.4) return 'Adulterated / Spoiled';
  return 'Uncertain';
};

// ─── Channel hash (SHA-256 of all 14 values, client-side) ────────────────────
async function computeChannelHash(row: ScanRow): Promise<string> {
  const payload = [
    row.f1, row.f2, row.f3, row.f4, row.f5, row.f6, row.f7, row.f8,
    row.nir, row.clear,
  ]
    .map((v) => (v ?? 0).toFixed(4))
    .join(',');

  const encoded = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useRealtimeScans() {
  const [readings, setReadings] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 1. Fetch the 20 most-recent rows
    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from('milk_data')
        .select('id, f1, f2, f3, f4, f5, f6, f7, f8, nir, clear, quality, status, tx_hash, channel_hash, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setReadings(data as ScanRow[]);
      } else if (error) {
        console.error('[useRealtimeScans] Failed to fetch initial scans:', error);
      }
      setLoading(false);
    };

    fetchInitial();

    // 2. Listen for new ESP32 inserts
    const channel = supabase
      .channel('milk_data_as7343_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'milk_data' },
        async (payload) => {
          const newScan = payload.new as ScanRow;

          // Derive status if not set by the ESP firmware
          const derivedStatus = newScan.status ?? getStatusFromQuality(newScan.quality);

          // Compute a hex hash of all 14 channel values to log on-chain
          const channelHash = await computeChannelHash(newScan);

          // Prepend to UI immediately
          setReadings((prev) => [{ ...newScan, status: derivedStatus, channel_hash: channelHash }, ...prev]);

          // Fire-and-forget blockchain log
          logToBlockchain({
            id: newScan.id,
            quality: newScan.quality,
            status: derivedStatus,
            channelHash,
            created_at: newScan.created_at,
          }).catch(console.error);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'milk_data' },
        (payload) => {
          const updated = payload.new as ScanRow;
          // Patch tx_hash into the existing card when the server action writes it back
          setReadings((prev) =>
            prev.map((r) =>
              r.id === updated.id
                ? { ...r, tx_hash: updated.tx_hash, channel_hash: updated.channel_hash ?? r.channel_hash }
                : r
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { readings, loading };
}

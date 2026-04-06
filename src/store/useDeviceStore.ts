/**
 * useDeviceStore — Zustand global state for ESP8266/ESP32 IoT device.
 *
 * Tracks:
 *  - discovered devices (from network scan)
 *  - paired/active device
 *  - WebSocket connection state
 *  - live test readings (streamed in real-time)
 *  - completed test result
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiscoveredDevice {
  ip: string
  port: number
  device_id: string
  display_name?: string
  firmware?: string
  model?: string
  battery?: number     // 0–100 %
}

export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'failed'

export interface LiveReading {
  progress: number     // 0–100 %
  soap:     number     // %
  urea:     number     // %
  starch:   number     // %
  detergent?: number   // %
  temp?:    number     // °C
  timestamp: number    // Date.now()
}

export interface TestResult {
  soap:        number
  urea:        number
  starch:      number
  detergent:   number
  safetyScore: number
  duration:    number
  timestamp:   number
  deviceId:    string
  raw?:        unknown
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface DeviceState {
  // Discovery
  discovered:    DiscoveredDevice[]
  isScanning:    boolean
  scanError:     string | null
  lastScanAt:    number | null

  // Active device (persisted)
  pairedDevice:  DiscoveredDevice | null

  // Connection
  connState:     ConnectionState
  connectedAt:   number | null
  lastError:     string | null

  // Test lifecycle
  testPhase:     'idle' | 'running' | 'done' | 'error'
  liveReading:   LiveReading | null
  testResult:    TestResult | null
  testError:     string | null

  // Actions
  setDiscovered:   (devices: DiscoveredDevice[]) => void
  setScanning:     (v: boolean)  => void
  setScanError:    (e: string | null) => void

  setPaired:       (device: DiscoveredDevice | null) => void
  setConnState:    (s: ConnectionState) => void
  setLastError:    (e: string | null) => void

  setTestPhase:    (p: DeviceState['testPhase']) => void
  setLiveReading:  (r: LiveReading | null) => void
  setTestResult:   (r: TestResult | null) => void
  setTestError:    (e: string | null) => void
  resetTest:       () => void
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set) => ({
      // Discovery
      discovered:    [],
      isScanning:    false,
      scanError:     null,
      lastScanAt:    null,

      // Active device
      pairedDevice:  null,

      // Connection
      connState:     'idle',
      connectedAt:   null,
      lastError:     null,

      // Test
      testPhase:     'idle',
      liveReading:   null,
      testResult:    null,
      testError:     null,

      // ─── Actions ───────────────────────────────────────────────────────────
      setDiscovered:  (devices) => set({ discovered: devices, lastScanAt: Date.now() }),
      setScanning:    (v)       => set({ isScanning: v, scanError: null }),
      setScanError:   (e)       => set({ scanError: e, isScanning: false }),

      setPaired:      (device)  => set({ pairedDevice: device, connState: 'idle', testPhase: 'idle' }),
      setConnState:   (s)       => set({ connState: s, connectedAt: s === 'connected' ? Date.now() : undefined }),
      setLastError:   (e)       => set({ lastError: e }),

      setTestPhase:   (p)       => set({ testPhase: p }),
      setLiveReading: (r)       => set({ liveReading: r }),
      setTestResult:  (r)       => set({ testResult: r }),
      setTestError:   (e)       => set({ testError: e }),

      resetTest: () => set({
        testPhase:   'idle',
        liveReading: null,
        testResult:  null,
        testError:   null,
      }),
    }),
    {
      name:    'milkguard-device',       // localStorage key
      partialize: (s) => ({
        pairedDevice: s.pairedDevice,    // only persist the paired device
      }),
    }
  )
)

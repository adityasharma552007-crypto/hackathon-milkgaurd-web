/**
 * MilkGuard Hardware Connectivity V1 — BLE Hardware Zustand Store
 * 
 * Manages the global state of the Web Bluetooth connection, 14-signal spectroscopy
 * telemetry, simulation mode, and error diagnostics.
 */

import { create } from 'zustand'
import {
  BleConnectionState,
  HardwareScanStatus,
  BleDeviceInfo,
  HardwarePayload,
  SpectroscopyReadings,
} from '@/lib/hardware/hardwareTypes'
import { MilkGuardBleService, CompatibilityReport, bleService } from '@/lib/hardware/bluetoothService'
import { mockBleService } from '@/lib/hardware/mockBleDevice'
import { useDeviceStore } from '@/store/useDeviceStore'

interface BleHardwareState {
  // Connection & Device
  connectionState: BleConnectionState
  deviceInfo: BleDeviceInfo | null
  errorMessage: string | null

  // Telemetry & Scan
  scanStatus: HardwareScanStatus
  readings: SpectroscopyReadings | null
  lastPayload: HardwarePayload | null
  lastRawString: string | null
  validationErrors: string[]

  // Modes & Environment
  isSimulationMode: boolean
  compatibility: CompatibilityReport

  // Actions
  checkCompatibility: () => void
  setSimulationMode: (active: boolean) => void
  connectDevice: () => Promise<void>
  startHardwareScan: (options?: { forceInvalid?: boolean }) => Promise<void>
  disconnectDevice: () => Promise<void>
  clearErrors: () => void
  resetScan: () => void
}

export const useBleHardwareStore = create<BleHardwareState>((set, get) => {
  // Initialize compatibility check
  const initialCompat = MilkGuardBleService.checkCompatibility()

  // Setup callbacks for real BLE Service
  bleService.subscribe({
    onStateChange: (state) => {
      set({ connectionState: state })
      // Sync with global legacy store for backward compatibility
      if (state === 'connected') {
        const dev = bleService.getDeviceInfo()
        useDeviceStore.getState().setConnState('connected')
        if (dev) {
          useDeviceStore.getState().setPaired({
            ip: 'BLE-GATT',
            port: 0,
            device_id: dev.deviceUid,
            display_name: dev.name,
            model: 'ESP32-BLE',
          })
        }
      } else if (state === 'disconnected') {
        useDeviceStore.getState().setConnState('disconnected')
      }
    },
    onScanStatus: (status) => set({ scanStatus: status }),
    onPayload: (payload, raw) => {
      set({
        scanStatus: 'received',
        lastPayload: payload,
        lastRawString: raw,
        readings: {
          signal_01: payload.signal_01,
          signal_02: payload.signal_02,
          signal_03: payload.signal_03,
          signal_04: payload.signal_04,
          signal_05: payload.signal_05,
          signal_06: payload.signal_06,
          signal_07: payload.signal_07,
          signal_08: payload.signal_08,
          signal_09: payload.signal_09,
          signal_10: payload.signal_10,
          signal_11: payload.signal_11,
          signal_12: payload.signal_12,
          signal_13: payload.signal_13,
          signal_14: payload.signal_14,
        },
        validationErrors: [],
      })
    },
    onValidationError: (errors, raw) => {
      set({
        scanStatus: 'invalid',
        validationErrors: errors,
        lastRawString: raw,
      })
    },
    onError: (err) => {
      set({ errorMessage: err.message, connectionState: 'error' })
    },
  })

  // Setup callbacks for Mock BLE Service
  mockBleService.subscribe({
    onStateChange: (state) => {
      set({ connectionState: state })
      if (state === 'connected') {
        const dev = mockBleService.getDeviceInfo()
        useDeviceStore.getState().setConnState('connected')
        if (dev) {
          useDeviceStore.getState().setPaired({
            ip: 'SIMULATED-BLE',
            port: 0,
            device_id: dev.deviceUid,
            display_name: dev.name,
            model: 'ESP32-BLE-SIM',
          })
        }
      } else if (state === 'disconnected') {
        useDeviceStore.getState().setConnState('disconnected')
      }
    },
    onScanStatus: (status) => set({ scanStatus: status }),
    onPayload: (payload, raw) => {
      set({
        scanStatus: 'received',
        lastPayload: payload,
        lastRawString: raw,
        readings: {
          signal_01: payload.signal_01,
          signal_02: payload.signal_02,
          signal_03: payload.signal_03,
          signal_04: payload.signal_04,
          signal_05: payload.signal_05,
          signal_06: payload.signal_06,
          signal_07: payload.signal_07,
          signal_08: payload.signal_08,
          signal_09: payload.signal_09,
          signal_10: payload.signal_10,
          signal_11: payload.signal_11,
          signal_12: payload.signal_12,
          signal_13: payload.signal_13,
          signal_14: payload.signal_14,
        },
        validationErrors: [],
      })
    },
    onValidationError: (errors, raw) => {
      set({
        scanStatus: 'invalid',
        validationErrors: errors,
        lastRawString: raw,
      })
    },
    onError: (err) => {
      set({ errorMessage: err.message, connectionState: 'error' })
    },
  })

  return {
    connectionState: 'disconnected',
    deviceInfo: null,
    errorMessage: null,
    scanStatus: 'idle',
    readings: null,
    lastPayload: null,
    lastRawString: null,
    validationErrors: [],
    isSimulationMode: false,
    compatibility: initialCompat,

    checkCompatibility: () => {
      const compat = MilkGuardBleService.checkCompatibility()
      set({ compatibility: compat })
    },

    setSimulationMode: (active: boolean) => {
      // Disconnect current before switching mode
      const { connectionState, disconnectDevice } = get()
      if (connectionState === 'connected') {
        disconnectDevice()
      }
      set({ isSimulationMode: active, errorMessage: null, validationErrors: [] })
    },

    connectDevice: async () => {
      const { isSimulationMode } = get()
      set({ errorMessage: null, validationErrors: [] })

      try {
        if (isSimulationMode) {
          const dev = await mockBleService.connect()
          set({
            deviceInfo: dev,
            connectionState: 'connected',
            scanStatus: 'idle',
          })
        } else {
          const dev = await bleService.requestAndConnectDevice()
          set({
            deviceInfo: dev,
            connectionState: 'connected',
            scanStatus: 'idle',
          })
        }
      } catch (err: any) {
        // Handle user cancellation gracefully
        if (err.name === 'NotFoundError' || err.message?.includes('cancelled')) {
          set({
            connectionState: 'disconnected',
            errorMessage: 'Device pairing cancelled by user.',
          })
        } else {
          set({
            connectionState: 'error',
            errorMessage: err.message || 'Failed to establish Bluetooth connection.',
          })
        }
      }
    },

    startHardwareScan: async (options?: { forceInvalid?: boolean }) => {
      const { isSimulationMode, connectionState } = get()
      if (connectionState !== 'connected') {
        set({ errorMessage: 'Cannot scan: Hardware device is disconnected.' })
        return
      }

      set({ errorMessage: null, validationErrors: [] })

      try {
        if (isSimulationMode) {
          await mockBleService.startScan(options)
        } else {
          await bleService.startScan()
        }
      } catch (err: any) {
        set({
          errorMessage: err.message || 'Error triggering hardware scan.',
          scanStatus: 'idle',
        })
      }
    },

    disconnectDevice: async () => {
      const { isSimulationMode } = get()
      try {
        if (isSimulationMode) {
          await mockBleService.disconnect()
        } else {
          await bleService.disconnect()
        }
      } catch {
        // Ignore disconnect errors
      } finally {
        set({
          connectionState: 'disconnected',
          deviceInfo: null,
          scanStatus: 'idle',
        })
        useDeviceStore.getState().setConnState('disconnected')
      }
    },

    clearErrors: () => set({ errorMessage: null, validationErrors: [] }),

    resetScan: () => set({
      scanStatus: 'idle',
      readings: null,
      lastPayload: null,
      lastRawString: null,
      validationErrors: [],
    }),
  }
})

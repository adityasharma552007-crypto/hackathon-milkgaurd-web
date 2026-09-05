/**
 * MilkGuard Hardware Connectivity V1 — Type Definitions & Protocol Constants
 * 
 * Defines the Bluetooth Low Energy (BLE) GATT profile, 14-channel spectroscopy
 * payload structure, and state models for ESP32 <-> Web App communication.
 */

// ─── BLE GATT UUIDs ──────────────────────────────────────────────────────────
// Standard MilkGuard 128-bit custom service & characteristic UUIDs
export const MILKGUARD_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b'
export const DATA_CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'     // Notify / Read (14 Signals)
export const COMMAND_CHARACTERISTIC_UUID = 'd290e653-94c0-42b2-b362-09d2458b40e1'  // Write (START_SCAN, PING)

// Standard device naming prefix for filtering
export const MILKGUARD_DEVICE_NAME_PREFIX = 'MilkGuard'
export const DEFAULT_DEVICE_NAME = 'MilkGuard-ESP32'
export const DEFAULT_DEVICE_UID = 'MG-DEVICE-001'

// ─── 14 Spectroscopy Channels ────────────────────────────────────────────────
export const SPECTROSCOPY_CHANNELS = [
  'signal_01',
  'signal_02',
  'signal_03',
  'signal_04',
  'signal_05',
  'signal_06',
  'signal_07',
  'signal_08',
  'signal_09',
  'signal_10',
  'signal_11',
  'signal_12',
  'signal_13',
  'signal_14',
] as const

export type SpectroscopyChannelKey = typeof SPECTROSCOPY_CHANNELS[number]

export interface SpectroscopyReadings {
  signal_01: number
  signal_02: number
  signal_03: number
  signal_04: number
  signal_05: number
  signal_06: number
  signal_07: number
  signal_08: number
  signal_09: number
  signal_10: number
  signal_11: number
  signal_12: number
  signal_13: number
  signal_14: number
}

// ─── Hardware Transmission Payload ───────────────────────────────────────────
export interface HardwarePayload extends SpectroscopyReadings {
  device_uid: string
  timestamp?: number
  is_test_data?: boolean
  firmware_version?: string
  [key: string]: unknown
}

// ─── Connection & Lifecycle States ───────────────────────────────────────────
export type BleConnectionState =
  | 'disconnected'
  | 'requesting'
  | 'connecting'
  | 'connected'
  | 'error'

export type HardwareScanStatus =
  | 'idle'        // Device connected, ready for trigger
  | 'waiting'     // Waiting for measurement trigger / response from ESP32
  | 'receiving'   // Data packet stream arriving
  | 'received'    // Valid 14-signal measurement received & verified
  | 'invalid'     // Malformed or incomplete sensor packet received

// ─── Validation Result ───────────────────────────────────────────────────────
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  parsedPayload?: HardwarePayload
  signalCount: number
}

// ─── Connected Hardware Device Info ──────────────────────────────────────────
export interface BleDeviceInfo {
  id: string
  name: string
  deviceUid: string
  connectedAt?: number
  rssi?: number
  isSimulated?: boolean
  firmwareVersion?: string
}

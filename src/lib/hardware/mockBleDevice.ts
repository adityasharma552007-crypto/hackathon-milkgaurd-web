/**
 * MilkGuard Hardware Connectivity V1 — Hardware Simulation Driver
 * 
 * Provides a mock BLE driver for local testing and demonstration when a physical
 * ESP32 is not present. Generates strictly labeled TEST DATA and simulates the
 * real-time BLE GATT handshake, notification streaming, and disconnect events.
 */

import {
  HardwarePayload,
  BleDeviceInfo,
  DEFAULT_DEVICE_NAME,
  DEFAULT_DEVICE_UID,
  BleConnectionState,
  HardwareScanStatus,
} from './hardwareTypes'
import { validateHardwarePayload } from './payloadValidator'

export class MockBleDeviceService {
  private connectionState: BleConnectionState = 'disconnected'
  private scanStatus: HardwareScanStatus = 'idle'
  private deviceInfo: BleDeviceInfo | null = null

  // Callbacks
  private onStateChangeCb?: (state: BleConnectionState) => void
  private onScanStatusCb?: (status: HardwareScanStatus) => void
  private onPayloadCb?: (payload: HardwarePayload, rawString: string) => void
  private onValidationErrorCb?: (errors: string[], rawString: string) => void
  private onErrorCb?: (error: Error) => void

  public subscribe(callbacks: {
    onStateChange?: (state: BleConnectionState) => void
    onScanStatus?: (status: HardwareScanStatus) => void
    onPayload?: (payload: HardwarePayload, rawString: string) => void
    onValidationError?: (errors: string[], rawString: string) => void
    onError?: (error: Error) => void
  }) {
    this.onStateChangeCb = callbacks.onStateChange
    this.onScanStatusCb = callbacks.onScanStatus
    this.onPayloadCb = callbacks.onPayload
    this.onValidationErrorCb = callbacks.onValidationError
    this.onErrorCb = callbacks.onError
  }

  public getConnectionState(): BleConnectionState {
    return this.connectionState
  }

  public getScanStatus(): HardwareScanStatus {
    return this.scanStatus
  }

  public getDeviceInfo(): BleDeviceInfo | null {
    return this.deviceInfo
  }

  // ─── Simulate Connect Flow ─────────────────────────────────────────────────
  public async connect(): Promise<BleDeviceInfo> {
    this.connectionState = 'requesting'
    this.onStateChangeCb?.('requesting')

    // Simulate scanning dialog delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    this.connectionState = 'connecting'
    this.onStateChangeCb?.('connecting')

    // Simulate GATT negotiation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    this.deviceInfo = {
      id: 'SIMULATED-BLE-ESP32-MAC-42',
      name: `${DEFAULT_DEVICE_NAME} (SIMULATED)`,
      deviceUid: `${DEFAULT_DEVICE_UID}-TEST`,
      connectedAt: Date.now(),
      rssi: -58,
      isSimulated: true,
      firmwareVersion: 'v1.0.0-mock',
    }

    this.connectionState = 'connected'
    this.scanStatus = 'idle'
    this.onStateChangeCb?.('connected')
    this.onScanStatusCb?.('idle')

    return this.deviceInfo
  }

  // ─── Generate 14-channel Mock Spectroscopy Readings ────────────────────────
  public generateMockPayload(options?: { forceInvalid?: boolean }): { payload: HardwarePayload; rawString: string } {
    if (options?.forceInvalid) {
      // Intentionally missing signal_14 and non-numeric signal_02
      const invalid = {
        device_uid: 'MG-DEVICE-001-TEST',
        signal_01: 0.812,
        signal_02: 'INVALID_CORRUPTED_VALUE',
        signal_03: 0.745,
        // missing signals 04-14
        is_test_data: true,
      } as any
      return {
        payload: invalid,
        rawString: JSON.stringify(invalid, null, 2),
      }
    }

    // Realistic baseline spectral readings across 14 channels (normalized 0.0 - 1.0)
    const baseSignals = [
      0.823, 0.791, 0.754, 0.718, 0.682, 0.645, 0.612,
      0.578, 0.542, 0.510, 0.476, 0.439, 0.398, 0.291,
    ]

    // Add tiny randomized noise (+/- 0.015)
    const randomized = baseSignals.map((b) => {
      const val = b + (Math.random() - 0.5) * 0.03
      return Math.round(Math.max(0.01, Math.min(0.99, val)) * 1000) / 1000
    })

    const payload: HardwarePayload = {
      device_uid: `${DEFAULT_DEVICE_UID}-TEST`,
      signal_01: randomized[0],
      signal_02: randomized[1],
      signal_03: randomized[2],
      signal_04: randomized[3],
      signal_05: randomized[4],
      signal_06: randomized[5],
      signal_07: randomized[6],
      signal_08: randomized[7],
      signal_09: randomized[8],
      signal_10: randomized[9],
      signal_11: randomized[10],
      signal_12: randomized[11],
      signal_13: randomized[12],
      signal_14: randomized[13],
      timestamp: Date.now(),
      is_test_data: true,
      firmware_version: 'v1.0.0-mock',
    }

    return {
      payload,
      rawString: JSON.stringify(payload, null, 2),
    }
  }

  // ─── Simulate Trigger Scan Flow ────────────────────────────────────────────
  public async startScan(options?: { forceInvalid?: boolean }): Promise<void> {
    if (this.connectionState !== 'connected') {
      throw new Error('Cannot start scan: Simulated hardware is not connected.')
    }

    // Phase 1: Waiting for ESP32 optical measurement
    this.scanStatus = 'waiting'
    this.onScanStatusCb?.('waiting')

    await new Promise((resolve) => setTimeout(resolve, 1400))

    // Phase 2: Stream packet incoming
    this.scanStatus = 'receiving'
    this.onScanStatusCb?.('receiving')

    await new Promise((resolve) => setTimeout(resolve, 900))

    // Phase 3: Payload processed & validated
    const { payload, rawString } = this.generateMockPayload(options)
    const validation = validateHardwarePayload(payload)

    if (validation.isValid && validation.parsedPayload) {
      this.scanStatus = 'received'
      this.onScanStatusCb?.('received')
      this.onPayloadCb?.(validation.parsedPayload, rawString)
    } else {
      this.scanStatus = 'invalid'
      this.onScanStatusCb?.('invalid')
      this.onValidationErrorCb?.(validation.errors, rawString)
    }
  }

  // ─── Simulate Disconnect Flow ──────────────────────────────────────────────
  public async disconnect(): Promise<void> {
    this.deviceInfo = null
    this.connectionState = 'disconnected'
    this.scanStatus = 'idle'
    this.onStateChangeCb?.('disconnected')
    this.onScanStatusCb?.('idle')
  }
}

// Global Singleton Instance
export const mockBleService = new MockBleDeviceService()

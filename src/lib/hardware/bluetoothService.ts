/**
 * MilkGuard Hardware Connectivity V1 — Web Bluetooth Service
 * 
 * Manages the Web Bluetooth Low Energy (BLE) lifecycle with the MilkGuard ESP32 device:
 * - Browser feature detection & Secure Context verification
 * - Device discovery via Bluetooth GATT filter
 * - Primary service & characteristic negotiation
 * - Incoming stream packet assembly with UTF-8 TextDecoder
 * - Command transmission (START_SCAN)
 * - Immediate hardware disconnection detection
 */

import {
  MILKGUARD_SERVICE_UUID,
  DATA_CHARACTERISTIC_UUID,
  COMMAND_CHARACTERISTIC_UUID,
  MILKGUARD_DEVICE_NAME_PREFIX,
  DEFAULT_DEVICE_NAME,
  DEFAULT_DEVICE_UID,
  BleConnectionState,
  HardwareScanStatus,
  BleDeviceInfo,
  HardwarePayload,
} from './hardwareTypes'
import { validateHardwarePayload } from './payloadValidator'

export interface CompatibilityReport {
  isSupported: boolean
  isSecureContext: boolean
  hasNavigatorBluetooth: boolean
  errorReason?: string
  browserRecommendation?: string
}

export class MilkGuardBleService {
  private device: BluetoothDevice | null = null
  private server: BluetoothRemoteGATTServer | null = null
  private dataCharacteristic: BluetoothRemoteGATTCharacteristic | null = null
  private commandCharacteristic: BluetoothRemoteGATTCharacteristic | null = null

  private buffer: string = ''
  private decoder = new TextDecoder('utf-8')

  private connectionState: BleConnectionState = 'disconnected'
  private scanStatus: HardwareScanStatus = 'idle'
  private deviceInfo: BleDeviceInfo | null = null

  // Listener callbacks
  private onStateChangeCb?: (state: BleConnectionState) => void
  private onScanStatusCb?: (status: HardwareScanStatus) => void
  private onPayloadCb?: (payload: HardwarePayload, rawString: string) => void
  private onValidationErrorCb?: (errors: string[], rawString: string) => void
  private onErrorCb?: (error: Error) => void

  constructor() {
    this.handleDisconnection = this.handleDisconnection.bind(this)
    this.handleCharacteristicValueChanged = this.handleCharacteristicValueChanged.bind(this)
  }

  // ─── Browser Compatibility Check ───────────────────────────────────────────
  public static checkCompatibility(): CompatibilityReport {
    if (typeof window === 'undefined') {
      return {
        isSupported: false,
        isSecureContext: false,
        hasNavigatorBluetooth: false,
        errorReason: 'Server-side execution: Window object is not defined.',
      }
    }

    const isSecureContext = Boolean(window.isSecureContext)
    const hasNavigatorBluetooth = typeof navigator !== 'undefined' && 'bluetooth' in navigator

    if (!hasNavigatorBluetooth) {
      // Determine probable browser for helpful guidance
      const userAgent = navigator.userAgent.toLowerCase()
      let recommendation = 'Please use Google Chrome, Microsoft Edge, or Opera on Windows, macOS, Linux, or Android.'

      if (userAgent.includes('firefox')) {
        recommendation = 'Mozilla Firefox does not support Web Bluetooth. Please switch to Google Chrome or Microsoft Edge.'
      } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        recommendation = 'Apple Safari does not support Web Bluetooth. Please use Google Chrome or Microsoft Edge on Desktop, or Bluefy on iOS.'
      }

      return {
        isSupported: false,
        isSecureContext,
        hasNavigatorBluetooth: false,
        errorReason: 'Web Bluetooth API is not supported in this browser.',
        browserRecommendation: recommendation,
      }
    }

    if (!isSecureContext) {
      return {
        isSupported: false,
        isSecureContext: false,
        hasNavigatorBluetooth: true,
        errorReason: 'Web Bluetooth requires a Secure Context (HTTPS or localhost). Current origin is insecure.',
        browserRecommendation: 'Please access MilkGuard over HTTPS or on http://localhost.',
      }
    }

    return {
      isSupported: true,
      isSecureContext: true,
      hasNavigatorBluetooth: true,
    }
  }

  // ─── Callback Subscriptions ────────────────────────────────────────────────
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

  private setConnectionState(state: BleConnectionState) {
    this.connectionState = state
    this.onStateChangeCb?.(state)
  }

  private setScanStatus(status: HardwareScanStatus) {
    this.scanStatus = status
    this.onScanStatusCb?.(status)
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

  // ─── Device Pairing & GATT Connection ──────────────────────────────────────
  public async requestAndConnectDevice(options?: { allowAnyDevice?: boolean }): Promise<BleDeviceInfo> {
    const compat = MilkGuardBleService.checkCompatibility()
    if (!compat.isSupported) {
      throw new Error(compat.errorReason || 'Web Bluetooth is not supported in this environment.')
    }

    this.setConnectionState('requesting')

    try {
      // Configure filter for MilkGuard ESP32
      const requestOptions: RequestDeviceOptions = options?.allowAnyDevice
        ? {
            acceptAllDevices: true,
            optionalServices: [MILKGUARD_SERVICE_UUID],
          }
        : {
            filters: [
              { namePrefix: MILKGUARD_DEVICE_NAME_PREFIX },
              { services: [MILKGUARD_SERVICE_UUID] },
            ],
            optionalServices: [MILKGUARD_SERVICE_UUID],
          }

      // Trigger browser native device picker (must originate from user gesture)
      const device = await navigator.bluetooth.requestDevice(requestOptions)

      this.device = device
      this.device.addEventListener('gattserverdisconnected', this.handleDisconnection)

      this.setConnectionState('connecting')

      if (!device.gatt) {
        throw new Error('Bluetooth GATT server unavailable on selected device.')
      }

      // Connect to GATT Server
      const server = await device.gatt.connect()
      this.server = server

      // Discover MilkGuard Primary Service
      let service: BluetoothRemoteGATTService
      try {
        service = await server.getPrimaryService(MILKGUARD_SERVICE_UUID)
      } catch {
        // In case service UUID is custom or 16-bit, attempt fallback
        const services = await server.getPrimaryServices()
        if (services.length > 0) {
          service = services[0]
        } else {
          throw new Error(`MilkGuard GATT Service (${MILKGUARD_SERVICE_UUID}) not found on device.`)
        }
      }

      // Discover Data Characteristic (Notify / Read)
      try {
        this.dataCharacteristic = await service.getCharacteristic(DATA_CHARACTERISTIC_UUID)
      } catch {
        const chars = await service.getCharacteristics()
        const notifyChar = chars.find((c: BluetoothRemoteGATTCharacteristic) => c.properties.notify || c.properties.indicate)
        if (notifyChar) {
          this.dataCharacteristic = notifyChar
        } else {
          throw new Error('Telemetry Data Characteristic not found on ESP32.')
        }
      }

      // Discover Command Characteristic (Optional Write)
      try {
        this.commandCharacteristic = await service.getCharacteristic(COMMAND_CHARACTERISTIC_UUID)
      } catch {
        // Optional: Device can also send readings automatically or on push button
        this.commandCharacteristic = null
      }

      // Enable notifications
      if (this.dataCharacteristic.properties.notify) {
        await this.dataCharacteristic.startNotifications()
        this.dataCharacteristic.addEventListener(
          'characteristicvaluechanged',
          this.handleCharacteristicValueChanged
        )
      }

      this.deviceInfo = {
        id: device.id,
        name: device.name || DEFAULT_DEVICE_NAME,
        deviceUid: device.name?.includes('MG-') ? device.name : DEFAULT_DEVICE_UID,
        connectedAt: Date.now(),
        isSimulated: false,
      }

      this.setConnectionState('connected')
      this.setScanStatus('idle')

      return this.deviceInfo
    } catch (err: any) {
      this.setConnectionState('error')
      this.onErrorCb?.(err)
      throw err
    }
  }

  // ─── Trigger Start Scan on ESP32 ───────────────────────────────────────────
  public async startScan(): Promise<void> {
    if (this.connectionState !== 'connected') {
      throw new Error('Cannot start scan: MilkGuard device is not connected.')
    }

    this.buffer = ''
    this.setScanStatus('waiting')

    try {
      if (this.commandCharacteristic && this.commandCharacteristic.properties.write) {
        const encoder = new TextEncoder()
        const cmdBytes = encoder.encode('START_SCAN\n')
        await this.commandCharacteristic.writeValue(cmdBytes)
      } else {
        // Fallback: If command characteristic not implemented on firmware,
        // device might stream automatically or on button press.
      }
    } catch (err: any) {
      console.warn('[MilkGuard BLE] Command characteristic write error:', err)
      // Continue waiting for data characteristic notification
    }
  }

  // ─── Characteristic Value Listener (Stream Assembly) ──────────────────────
  private handleCharacteristicValueChanged(event: Event) {
    const target = event.target as BluetoothRemoteGATTCharacteristic
    const value = target.value
    if (!value) return

    this.setScanStatus('receiving')

    const chunk = this.decoder.decode(value)
    this.buffer += chunk

    // Look for JSON payload boundary (newline '\n' or complete curly brace pair)
    if (this.buffer.includes('\n') || (this.buffer.trim().startsWith('{') && this.buffer.trim().endsWith('}'))) {
      const fullText = this.buffer.trim()
      this.buffer = ''

      try {
        const parsed = JSON.parse(fullText)
        const validation = validateHardwarePayload(parsed)

        if (validation.isValid && validation.parsedPayload) {
          // Update device UID if specified in payload
          if (this.deviceInfo && validation.parsedPayload.device_uid) {
            this.deviceInfo.deviceUid = validation.parsedPayload.device_uid
          }
          this.setScanStatus('received')
          this.onPayloadCb?.(validation.parsedPayload, fullText)
        } else {
          this.setScanStatus('invalid')
          this.onValidationErrorCb?.(validation.errors, fullText)
        }
      } catch (err: any) {
        this.setScanStatus('invalid')
        this.onValidationErrorCb?.(
          [`JSON parsing error: ${err.message || 'Malformed stream'}`],
          fullText
        )
      }
    }
  }

  // ─── Handle Disconnection ──────────────────────────────────────────────────
  private handleDisconnection() {
    this.server = null
    this.dataCharacteristic = null
    this.commandCharacteristic = null
    this.device = null
    this.buffer = ''
    this.setConnectionState('disconnected')
    this.setScanStatus('idle')
  }

  // ─── Manual Disconnect ─────────────────────────────────────────────────────
  public async disconnect(): Promise<void> {
    try {
      if (this.dataCharacteristic) {
        this.dataCharacteristic.removeEventListener(
          'characteristicvaluechanged',
          this.handleCharacteristicValueChanged
        )
      }
      if (this.device) {
        this.device.removeEventListener('gattserverdisconnected', this.handleDisconnection)
      }
      if (this.server && this.server.connected) {
        this.server.disconnect()
      }
    } catch (err) {
      console.warn('[MilkGuard BLE] Error during disconnect:', err)
    } finally {
      this.handleDisconnection()
    }
  }
}

// Global Singleton Instance
export const bleService = new MilkGuardBleService()

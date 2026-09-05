/**
 * MilkGuard Hardware Connectivity V1 — Payload Validator
 * 
 * Enforces strict validation of incoming BLE telemetry:
 * 1. Must be a valid JSON object
 * 2. Must contain non-empty `device_uid`
 * 3. Must contain all 14 signals (`signal_01` through `signal_14`)
 * 4. Each signal value must be a finite number
 * 5. Rejects malformed, truncated, or NaN/infinite values
 */

import {
  HardwarePayload,
  SPECTROSCOPY_CHANNELS,
  ValidationResult,
  SpectroscopyReadings,
} from './hardwareTypes'

export function validateHardwarePayload(raw: unknown): ValidationResult {
  const errors: string[] = []

  // 1. Check if raw is present and is an object
  if (raw === null || raw === undefined) {
    return {
      isValid: false,
      errors: ['Invalid sensor data received: Payload is empty or null.'],
      signalCount: 0,
    }
  }

  let obj: any = raw
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw)
    } catch (err: any) {
      return {
        isValid: false,
        errors: [`Invalid sensor data received: Failed to parse JSON string (${err?.message || 'Syntax error'}).`],
        signalCount: 0,
      }
    }
  }

  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return {
      isValid: false,
      errors: ['Invalid sensor data received: Expected JSON object key-value payload.'],
      signalCount: 0,
    }
  }

  // 2. Validate device_uid
  if (!obj.device_uid || typeof obj.device_uid !== 'string' || obj.device_uid.trim().length === 0) {
    errors.push('Missing or empty "device_uid" identifier in payload.')
  }

  // 3. Check for all 14 required signals
  let validSignalCount = 0
  const parsedReadings: Partial<SpectroscopyReadings> = {}

  for (const channel of SPECTROSCOPY_CHANNELS) {
    if (!(channel in obj)) {
      errors.push(`Missing channel "${channel}" in payload.`)
      continue
    }

    const val = obj[channel]
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      errors.push(`Invalid value for "${channel}": Expected finite number, received ${typeof val} (${String(val)}).`)
      continue
    }

    // Optional bounds warning / check if negative or excessively high
    parsedReadings[channel] = val
    validSignalCount++
  }

  if (validSignalCount !== 14) {
    errors.push(`Expected exactly 14 spectroscopy signals, but found ${validSignalCount} valid channel(s).`)
  }

  const isValid = errors.length === 0

  return {
    isValid,
    errors,
    signalCount: validSignalCount,
    parsedPayload: isValid
      ? {
          ...obj,
          device_uid: String(obj.device_uid).trim(),
          ...parsedReadings,
        } as HardwarePayload
      : undefined,
  }
}

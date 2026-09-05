// Test script for MilkGuard 14-channel spectroscopy BLE payload validation
import assert from 'node:assert'

const SPECTROSCOPY_CHANNELS = [
  'signal_01', 'signal_02', 'signal_03', 'signal_04',
  'signal_05', 'signal_06', 'signal_07', 'signal_08',
  'signal_09', 'signal_10', 'signal_11', 'signal_12',
  'signal_13', 'signal_14'
]

function validateHardwarePayload(raw) {
  const errors = []
  if (raw === null || raw === undefined) {
    return { isValid: false, errors: ['Payload is null/empty'], signalCount: 0 }
  }

  let obj = raw
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw)
    } catch (err) {
      return { isValid: false, errors: [`JSON parse error: ${err.message}`], signalCount: 0 }
    }
  }

  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return { isValid: false, errors: ['Expected JSON object'], signalCount: 0 }
  }

  if (!obj.device_uid || typeof obj.device_uid !== 'string' || !obj.device_uid.trim()) {
    errors.push('Missing or empty device_uid')
  }

  let validCount = 0
  for (const ch of SPECTROSCOPY_CHANNELS) {
    if (!(ch in obj)) {
      errors.push(`Missing channel ${ch}`)
      continue
    }
    const val = obj[ch]
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      errors.push(`Invalid numeric value for ${ch}: ${val}`)
      continue
    }
    validCount++
  }

  if (validCount !== 14) {
    errors.push(`Expected 14 signals, found ${validCount}`)
  }

  return { isValid: errors.length === 0, errors, signalCount: validCount, parsedPayload: errors.length === 0 ? obj : undefined }
}

// 1. Valid Payload Test
const validPayload = {
  device_uid: 'MG-DEVICE-001',
  signal_01: 0.823, signal_02: 0.791, signal_03: 0.754, signal_04: 0.718,
  signal_05: 0.682, signal_06: 0.645, signal_07: 0.612, signal_08: 0.578,
  signal_09: 0.542, signal_10: 0.510, signal_11: 0.476, signal_12: 0.439,
  signal_13: 0.398, signal_14: 0.291
}
const res1 = validateHardwarePayload(validPayload)
assert.strictEqual(res1.isValid, true, 'Valid payload must pass')
assert.strictEqual(res1.signalCount, 14, 'Should count 14 valid signals')
console.log('✓ Valid 14-signal payload passed validation.')

// 2. Missing channel test (only 13 signals)
const incomplete = { ...validPayload }
delete incomplete.signal_14
const res2 = validateHardwarePayload(incomplete)
assert.strictEqual(res2.isValid, false, 'Incomplete payload must fail')
console.log('✓ Missing signal_14 correctly rejected:', res2.errors[0])

// 3. Non-numeric value test
const corrupted = { ...validPayload, signal_03: 'NaN_CORRUPTED' }
const res3 = validateHardwarePayload(corrupted)
assert.strictEqual(res3.isValid, false, 'Non-numeric signal must fail')
console.log('✓ Corrupted non-numeric signal correctly rejected:', res3.errors[0])

// 4. Missing device_uid test
const noUid = { ...validPayload, device_uid: '' }
const res4 = validateHardwarePayload(noUid)
assert.strictEqual(res4.isValid, false, 'Missing device_uid must fail')
console.log('✓ Missing device_uid correctly rejected:', res4.errors[0])

// 5. Stringified JSON parse test
const stringified = JSON.stringify(validPayload)
const res5 = validateHardwarePayload(stringified)
assert.strictEqual(res5.isValid, true, 'Stringified valid payload must parse and pass')
console.log('✓ Stringified JSON payload parsed and validated successfully.')

console.log('\nALL 5 VALIDATION TESTS PASSED.')

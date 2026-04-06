/**
 * useDeviceSocket — manages WebSocket connection to ESP8266/ESP32 device.
 *
 * Protocol (JSON frames):
 *   ESP → App  { type: "reading",  progress, soap, urea, starch, detergent?, temp? }
 *   ESP → App  { type: "result",   soap, urea, starch, detergent, safetyScore, duration }
 *   ESP → App  { type: "pong" }
 *   App → ESP  { cmd: "start_test" }
 *   App → ESP  { cmd: "ping" }
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useDeviceStore, DiscoveredDevice } from '@/store/useDeviceStore'

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_BASE_DELAY   = 1500  // ms (doubles each attempt)
const PING_INTERVAL          = 15000 // ms — keep-alive
const CONNECT_TIMEOUT        = 8000  // ms — abort if WS doesn't open

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useDeviceSocket() {
  const {
    pairedDevice,
    setConnState,
    setLastError,
    setLiveReading,
    setTestResult,
    setTestPhase,
    setTestError,
  } = useDeviceStore()

  const wsRef           = useRef<WebSocket | null>(null)
  const reconnectCount  = useRef(0)
  const reconnectTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pingTimer       = useRef<ReturnType<typeof setInterval> | null>(null)
  const connectTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intentionalClose = useRef(false)

  // ─── Parse incoming frame ─────────────────────────────────────────────────
  const handleFrame = useCallback((raw: string) => {
    let frame: Record<string, unknown>
    try {
      frame = JSON.parse(raw)
    } catch {
      console.warn('[IoT] Malformed frame:', raw)
      return
    }

    const type = frame.type as string | undefined

    if (type === 'reading') {
      setLiveReading({
        progress:  Number(frame.progress  ?? 0),
        soap:      Number(frame.soap      ?? 0),
        urea:      Number(frame.urea      ?? 0),
        starch:    Number(frame.starch    ?? 0),
        detergent: Number(frame.detergent ?? 0),
        temp:      frame.temp !== undefined ? Number(frame.temp) : undefined,
        timestamp: Date.now(),
      })
      setTestPhase('running')
      return
    }

    if (type === 'result') {
      setTestResult({
        soap:        Number(frame.soap        ?? 0),
        urea:        Number(frame.urea        ?? 0),
        starch:      Number(frame.starch      ?? 0),
        detergent:   Number(frame.detergent   ?? 0),
        safetyScore: Number(frame.safetyScore ?? 0),
        duration:    Number(frame.duration    ?? 0),
        timestamp:   Date.now(),
        deviceId:    pairedDevice?.device_id ?? 'unknown',
        raw:         frame,
      })
      setTestPhase('done')
      return
    }

    if (type === 'error') {
      setTestError(String(frame.message ?? 'Device reported an error'))
      setTestPhase('error')
    }

    // 'pong' and unknown frames are silently ignored
  }, [pairedDevice, setLiveReading, setTestResult, setTestPhase, setTestError])

  // ─── Clear timers ─────────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (reconnectTimer.current)  clearTimeout(reconnectTimer.current)
    if (pingTimer.current)       clearInterval(pingTimer.current)
    if (connectTimer.current)    clearTimeout(connectTimer.current)
    reconnectTimer.current = null
    pingTimer.current      = null
    connectTimer.current   = null
  }, [])

  // ─── Connect ──────────────────────────────────────────────────────────────
  const connect = useCallback((device: DiscoveredDevice) => {
    // Close any existing socket first
    if (wsRef.current && wsRef.current.readyState < 2) {
      intentionalClose.current = true
      wsRef.current.close()
    }
    clearTimers()
    intentionalClose.current = false

    const url = `ws://${device.ip}:${device.port}/ws`
    console.info(`[IoT] Connecting → ${url}`)
    setConnState('connecting')
    setLastError(null)

    let ws: WebSocket
    try {
      ws = new WebSocket(url)
    } catch (e: unknown) {
      setConnState('failed')
      setLastError('Cannot open WebSocket connection')
      return
    }
    wsRef.current = ws

    // Abort if WS doesn't open within timeout
    connectTimer.current = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        console.warn('[IoT] Connection timeout')
        ws.close()
        setConnState('failed')
        setLastError(`Connection timed out after ${CONNECT_TIMEOUT / 1000}s`)
      }
    }, CONNECT_TIMEOUT)

    ws.onopen = () => {
      clearTimeout(connectTimer.current!)
      connectTimer.current = null
      console.info('[IoT] Connected ✓')
      setConnState('connected')
      setLastError(null)
      reconnectCount.current = 0

      // Start keep-alive ping
      pingTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ cmd: 'ping' }))
        }
      }, PING_INTERVAL)
    }

    ws.onmessage = (evt) => handleFrame(evt.data)

    ws.onerror = (evt) => {
      console.error('[IoT] WebSocket error', evt)
    }

    ws.onclose = (evt) => {
      clearTimers()
      console.info(`[IoT] Closed — code=${evt.code}, intentional=${intentionalClose.current}`)

      if (intentionalClose.current) {
        setConnState('disconnected')
        return
      }

      // Auto-reconnect with exponential backoff
      if (reconnectCount.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectCount.current)
        reconnectCount.current++
        setConnState('reconnecting')
        setLastError(`Lost connection — reconnecting… (attempt ${reconnectCount.current}/${MAX_RECONNECT_ATTEMPTS})`)
        console.info(`[IoT] Reconnecting in ${delay}ms`)
        reconnectTimer.current = setTimeout(() => connect(device), delay)
      } else {
        setConnState('failed')
        setLastError('Could not reconnect after several attempts. Check device power and network.')
      }
    }
  }, [clearTimers, handleFrame, setConnState, setLastError])

  // ─── Disconnect ───────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    intentionalClose.current = true
    clearTimers()
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }
    setConnState('disconnected')
    reconnectCount.current = 0
  }, [clearTimers, setConnState])

  // ─── Send command ─────────────────────────────────────────────────────────
  const sendCommand = useCallback((payload: Record<string, unknown>): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
      return true
    }
    console.warn('[IoT] Cannot send — socket not open')
    return false
  }, [])

  // ─── Start test ───────────────────────────────────────────────────────────
  const startTest = useCallback(() => {
    const ok = sendCommand({ cmd: 'start_test' })
    if (ok) {
      setTestPhase('running')
      setLastError(null)
    } else {
      setTestError('Cannot start test — device not connected')
      setTestPhase('error')
    }
  }, [sendCommand, setTestPhase, setLastError, setTestError])

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      intentionalClose.current = true
      clearTimers()
      if (wsRef.current) wsRef.current.close()
    }
  }, [clearTimers])

  return { connect, disconnect, startTest, sendCommand }
}

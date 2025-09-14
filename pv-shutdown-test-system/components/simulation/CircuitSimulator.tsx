'use client'

import { useEffect, useRef } from 'react'

interface CircuitSimulatorProps {
  params: any
  isRunning: boolean
  currentData?: any
}

export default function CircuitSimulator({ params, isRunning, currentData }: CircuitSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw circuit elements
    drawCircuit(ctx, canvas.width, canvas.height, params, currentData)
  }, [params, currentData])

  const drawCircuit = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    params: any,
    data: any
  ) => {
    const centerX = width / 2
    const centerY = height / 2

    // Set styles
    ctx.strokeStyle = '#4b5563'
    ctx.lineWidth = 2
    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#e5e7eb'

    // Draw PV Module
    const pvX = centerX - 200
    const pvY = centerY - 100
    drawPVModule(ctx, pvX, pvY)
    ctx.fillText('PV Module', pvX - 30, pvY - 60)
    if (data) {
      ctx.fillStyle = '#10b981'
      ctx.fillText(`${data.voltage?.toFixed(1)}V`, pvX - 30, pvY - 40)
      ctx.fillText(`${data.current?.toFixed(2)}A`, pvX - 30, pvY - 20)
    }

    // Draw RSD
    const rsdX = centerX
    const rsdY = centerY - 50
    drawRSD(ctx, rsdX, rsdY, data?.rsdStatus === 'on')
    ctx.fillStyle = '#e5e7eb'
    ctx.fillText('RSD', rsdX - 15, rsdY - 40)
    if (data) {
      ctx.fillStyle = data.rsdStatus === 'on' ? '#10b981' : '#ef4444'
      ctx.fillText(data.rsdStatus === 'on' ? 'ON' : 'OFF', rsdX - 15, rsdY + 60)
    }

    // Draw Load
    const loadX = centerX + 200
    const loadY = centerY - 100
    drawLoad(ctx, loadX, loadY, params.loadType)
    ctx.fillStyle = '#e5e7eb'
    ctx.fillText('Load', loadX - 15, loadY - 60)
    ctx.fillText(`${params.loadValue}Ω`, loadX - 20, loadY - 40)

    // Draw connections
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 3

    // PV to RSD
    ctx.beginPath()
    ctx.moveTo(pvX + 60, pvY)
    ctx.lineTo(rsdX - 40, pvY)
    ctx.lineTo(rsdX - 40, rsdY)
    ctx.stroke()

    // RSD to Load
    ctx.beginPath()
    ctx.moveTo(rsdX + 40, rsdY)
    ctx.lineTo(loadX - 30, rsdY)
    ctx.lineTo(loadX - 30, loadY)
    ctx.stroke()

    // Ground connection
    ctx.beginPath()
    ctx.moveTo(pvX + 30, pvY + 80)
    ctx.lineTo(pvX + 30, pvY + 120)
    ctx.moveTo(loadX, loadY + 80)
    ctx.lineTo(loadX, loadY + 120)
    ctx.moveTo(pvX + 30, pvY + 120)
    ctx.lineTo(loadX, pvY + 120)
    ctx.stroke()

    // Draw ground symbols
    drawGround(ctx, pvX + 30, pvY + 120)
    drawGround(ctx, loadX, loadY + 120)

    // Draw current flow animation
    if (isRunning && data?.rsdStatus === 'on') {
      drawCurrentFlow(ctx, pvX + 60, pvY, rsdX - 40, rsdY)
      drawCurrentFlow(ctx, rsdX + 40, rsdY, loadX - 30, loadY)
    }
  }

  const drawPVModule = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.strokeStyle = '#3b82f6'
    ctx.fillStyle = '#1e3a8a'
    
    // Draw panel
    ctx.fillRect(x, y, 60, 80)
    ctx.strokeRect(x, y, 60, 80)
    
    // Draw cells
    ctx.strokeStyle = '#60a5fa'
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.strokeRect(x + 5 + i * 18, y + 5 + j * 18, 16, 16)
      }
    }
    
    // Draw terminals
    ctx.fillStyle = '#dc2626'
    ctx.fillRect(x + 25, y - 5, 10, 5)
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(x + 25, y + 80, 10, 5)
  }

  const drawRSD = (ctx: CanvasRenderingContext2D, x: number, y: number, isOn: boolean) => {
    ctx.strokeStyle = isOn ? '#10b981' : '#6b7280'
    ctx.fillStyle = isOn ? '#064e3b' : '#1f2937'
    
    // Draw box
    ctx.fillRect(x - 40, y - 30, 80, 60)
    ctx.strokeRect(x - 40, y - 30, 80, 60)
    
    // Draw switch symbol
    ctx.beginPath()
    ctx.moveTo(x - 20, y)
    ctx.lineTo(x, y)
    if (isOn) {
      ctx.lineTo(x + 20, y)
    } else {
      ctx.lineTo(x + 10, y - 15)
    }
    ctx.stroke()
    
    // Draw terminals
    ctx.fillStyle = '#374151'
    ctx.fillRect(x - 45, y - 5, 5, 10)
    ctx.fillRect(x + 40, y - 5, 5, 10)
  }

  const drawLoad = (ctx: CanvasRenderingContext2D, x: number, y: number, type: string) => {
    ctx.strokeStyle = '#f59e0b'
    
    if (type === 'resistive') {
      // Draw resistor
      ctx.beginPath()
      ctx.moveTo(x - 30, y)
      ctx.lineTo(x - 20, y)
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(x - 15 + i * 10, y + (i % 2 === 0 ? 10 : -10))
      }
      ctx.lineTo(x + 20, y)
      ctx.lineTo(x + 30, y)
      ctx.stroke()
    } else if (type === 'inductive') {
      // Draw inductor
      ctx.beginPath()
      ctx.moveTo(x - 30, y)
      ctx.lineTo(x - 20, y)
      for (let i = 0; i < 4; i++) {
        ctx.arc(x - 10 + i * 10, y, 5, Math.PI, 0, false)
      }
      ctx.lineTo(x + 30, y)
      ctx.stroke()
    } else {
      // Draw capacitor
      ctx.beginPath()
      ctx.moveTo(x - 30, y)
      ctx.lineTo(x - 5, y)
      ctx.moveTo(x - 5, y - 20)
      ctx.lineTo(x - 5, y + 20)
      ctx.moveTo(x + 5, y - 20)
      ctx.lineTo(x + 5, y + 20)
      ctx.moveTo(x + 5, y)
      ctx.lineTo(x + 30, y)
      ctx.stroke()
    }
    
    // Draw terminals
    ctx.fillStyle = '#374151'
    ctx.fillRect(x - 35, y - 5, 5, 10)
    ctx.fillRect(x + 30, y - 5, 5, 10)
  }

  const drawGround = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.strokeStyle = '#6b7280'
    ctx.beginPath()
    ctx.moveTo(x - 15, y)
    ctx.lineTo(x + 15, y)
    ctx.moveTo(x - 10, y + 5)
    ctx.lineTo(x + 10, y + 5)
    ctx.moveTo(x - 5, y + 10)
    ctx.lineTo(x + 5, y + 10)
    ctx.stroke()
  }

  const drawCurrentFlow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const time = Date.now() / 1000
    const offset = (time * 50) % 30
    
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    ctx.setLineDash([10, 20])
    ctx.lineDashOffset = -offset
    
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    if (x1 !== x2 && y1 !== y2) {
      ctx.lineTo(x2, y1)
      ctx.lineTo(x2, y2)
    } else {
      ctx.lineTo(x2, y2)
    }
    ctx.stroke()
    
    ctx.setLineDash([])
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  )
}
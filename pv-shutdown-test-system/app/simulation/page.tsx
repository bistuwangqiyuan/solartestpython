'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CircuitSimulator from '@/components/simulation/CircuitSimulator'
import ParameterControl from '@/components/simulation/ParameterControl'
import SimulationResults from '@/components/simulation/SimulationResults'
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

interface SimulationParams {
  // PV Module Parameters
  moduleVoc: number // Open circuit voltage
  moduleIsc: number // Short circuit current
  modulePmax: number // Maximum power
  moduleVmp: number // Voltage at max power
  moduleImp: number // Current at max power
  irradiance: number // Solar irradiance (W/m²)
  temperature: number // Module temperature (°C)
  
  // Rapid Shutdown Device Parameters
  rsdVoltageThreshold: number // Shutdown voltage threshold
  rsdResponseTime: number // Response time (ms)
  rsdLeakageCurrent: number // Leakage current (mA)
  
  // Load Parameters
  loadType: 'resistive' | 'inductive' | 'capacitive'
  loadValue: number // Load resistance/impedance
  
  // Fault Conditions
  faultType: 'none' | 'overvoltage' | 'overcurrent' | 'ground_fault' | 'arc_fault'
  faultMagnitude: number
}

export default function SimulationPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [simulationTime, setSimulationTime] = useState(0)
  const [simulationResults, setSimulationResults] = useState<any[]>([])
  
  const [params, setParams] = useState<SimulationParams>({
    moduleVoc: 48.5,
    moduleIsc: 11.2,
    modulePmax: 400,
    moduleVmp: 40.5,
    moduleImp: 9.87,
    irradiance: 1000,
    temperature: 25,
    rsdVoltageThreshold: 30,
    rsdResponseTime: 30,
    rsdLeakageCurrent: 0.5,
    loadType: 'resistive',
    loadValue: 50,
    faultType: 'none',
    faultMagnitude: 0,
  })

  const handleStartSimulation = () => {
    setIsRunning(true)
    setSimulationTime(0)
    setSimulationResults([])
    
    // Simulate data generation
    const interval = setInterval(() => {
      setSimulationTime(prev => {
        const newTime = prev + 0.1
        
        // Generate simulation data
        const voltage = calculateVoltage(params, newTime)
        const current = calculateCurrent(params, newTime)
        const power = voltage * current
        const rsdStatus = voltage > params.rsdVoltageThreshold ? 'on' : 'off'
        
        setSimulationResults(prev => [...prev, {
          time: newTime,
          voltage,
          current,
          power,
          rsdStatus,
          irradiance: params.irradiance,
          temperature: params.temperature,
        }])
        
        // Stop after 10 seconds
        if (newTime >= 10) {
          setIsRunning(false)
          clearInterval(interval)
        }
        
        return newTime
      })
    }, 100)
    
    // Store interval ID for cleanup
    (window as any).simulationInterval = interval
  }

  const handleStopSimulation = () => {
    setIsRunning(false)
    if ((window as any).simulationInterval) {
      clearInterval((window as any).simulationInterval)
    }
  }

  const handleResetSimulation = () => {
    handleStopSimulation()
    setSimulationTime(0)
    setSimulationResults([])
  }

  const calculateVoltage = (params: SimulationParams, time: number): number => {
    let baseVoltage = params.moduleVmp
    
    // Apply temperature coefficient
    const tempCoeff = -0.0035 // -0.35%/°C
    const tempDiff = params.temperature - 25
    baseVoltage *= (1 + tempCoeff * tempDiff)
    
    // Apply irradiance effect
    baseVoltage *= params.irradiance / 1000
    
    // Apply fault conditions
    if (params.faultType === 'overvoltage' && time > 5) {
      baseVoltage *= (1 + params.faultMagnitude / 100)
    }
    
    // Add some noise
    baseVoltage += (Math.random() - 0.5) * 0.5
    
    return Math.max(0, baseVoltage)
  }

  const calculateCurrent = (params: SimulationParams, time: number): number => {
    const voltage = calculateVoltage(params, time)
    let current = voltage / params.loadValue
    
    // Apply irradiance effect
    current *= params.irradiance / 1000
    
    // Apply fault conditions
    if (params.faultType === 'overcurrent' && time > 5) {
      current *= (1 + params.faultMagnitude / 100)
    }
    
    // Limit to module Isc
    current = Math.min(current, params.moduleIsc)
    
    // Add RSD effect
    if (voltage <= params.rsdVoltageThreshold) {
      // RSD is off, only leakage current flows
      current = params.rsdLeakageCurrent / 1000
    }
    
    // Add some noise
    current += (Math.random() - 0.5) * 0.05
    
    return Math.max(0, current)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">仿真中心</h1>
            <p className="text-gray-400 mt-1">光伏关断器电路仿真与分析</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              仿真时间: <span className="font-mono text-white">{simulationTime.toFixed(1)}s</span>
            </div>
            
            {!isRunning ? (
              <button
                onClick={handleStartSimulation}
                className="flex items-center btn-industrial"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                开始仿真
              </button>
            ) : (
              <button
                onClick={handleStopSimulation}
                className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <PauseIcon className="h-5 w-5 mr-2" />
                停止仿真
              </button>
            )}
            
            <button
              onClick={handleResetSimulation}
              className="flex items-center px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-md transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              重置
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Circuit Diagram - 2 columns */}
          <div className="lg:col-span-2">
            <div className="dashboard-card h-[500px]">
              <h2 className="text-xl font-semibold mb-4">电路图</h2>
              <CircuitSimulator 
                params={params} 
                isRunning={isRunning}
                currentData={simulationResults[simulationResults.length - 1]}
              />
            </div>
          </div>

          {/* Parameter Controls - 1 column */}
          <div>
            <ParameterControl
              params={params}
              onChange={setParams}
              disabled={isRunning}
            />
          </div>
        </div>

        {/* Simulation Results */}
        <SimulationResults 
          data={simulationResults}
          isRunning={isRunning}
        />

        {/* Scenarios */}
        <div className="dashboard-card bg-gradient-to-r from-primary-900/20 to-secondary-900/20 border-primary-700/30">
          <h2 className="text-xl font-semibold mb-4">预设场景</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setParams(prev => ({
                ...prev,
                irradiance: 1000,
                temperature: 25,
                faultType: 'none',
              }))}
              className="p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg text-center transition-colors"
              disabled={isRunning}
            >
              <div className="text-2xl mb-2">☀️</div>
              <p className="text-sm font-medium">标准测试条件</p>
              <p className="text-xs text-gray-500 mt-1">STC: 1000W/m², 25°C</p>
            </button>
            
            <button
              onClick={() => setParams(prev => ({
                ...prev,
                faultType: 'overvoltage',
                faultMagnitude: 20,
              }))}
              className="p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg text-center transition-colors"
              disabled={isRunning}
            >
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm font-medium">过压故障</p>
              <p className="text-xs text-gray-500 mt-1">120% 额定电压</p>
            </button>
            
            <button
              onClick={() => setParams(prev => ({
                ...prev,
                faultType: 'overcurrent',
                faultMagnitude: 50,
              }))}
              className="p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg text-center transition-colors"
              disabled={isRunning}
            >
              <div className="text-2xl mb-2">🔥</div>
              <p className="text-sm font-medium">过流故障</p>
              <p className="text-xs text-gray-500 mt-1">150% 额定电流</p>
            </button>
            
            <button
              onClick={() => setParams(prev => ({
                ...prev,
                irradiance: 200,
                temperature: 15,
              }))}
              className="p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg text-center transition-colors"
              disabled={isRunning}
            >
              <div className="text-2xl mb-2">☁️</div>
              <p className="text-sm font-medium">低辐照条件</p>
              <p className="text-xs text-gray-500 mt-1">200W/m², 15°C</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
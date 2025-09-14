'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ExperimentChart from '@/components/charts/ExperimentChart'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

type Experiment = Database['public']['Tables']['experiments']['Row']
type Measurement = Database['public']['Tables']['measurements']['Row']
type Device = Database['public']['Tables']['devices']['Row']

export default function ExperimentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [device, setDevice] = useState<Device | null>(null)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [loading, setLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchExperimentData(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (!experiment || experiment.status !== 'running') return

    // Set up realtime subscription for running experiments
    const channel = supabase
      .channel(`experiment-${experiment.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'measurements',
          filter: `experiment_id=eq.${experiment.id}`
        },
        (payload) => {
          setMeasurements(prev => [...prev, payload.new as Measurement])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [experiment])

  const fetchExperimentData = async (id: string) => {
    try {
      // Fetch experiment details
      const { data: expData, error: expError } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', id)
        .single()

      if (expError) throw expError
      setExperiment(expData)
      setIsRunning(expData.status === 'running')

      // Fetch device info
      if (expData.device_id) {
        const { data: deviceData } = await supabase
          .from('devices')
          .select('*')
          .eq('id', expData.device_id)
          .single()
        
        if (deviceData) setDevice(deviceData)
      }

      // Fetch measurements
      const { data: measureData } = await supabase
        .from('measurements')
        .select('*')
        .eq('experiment_id', id)
        .order('timestamp', { ascending: true })

      if (measureData) setMeasurements(measureData)
    } catch (error) {
      console.error('Error fetching experiment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartExperiment = async () => {
    if (!experiment) return

    try {
      const { error } = await supabase
        .from('experiments')
        .update({ 
          status: 'running',
          start_time: new Date().toISOString()
        })
        .eq('id', experiment.id)

      if (error) throw error
      
      setIsRunning(true)
      await fetchExperimentData(experiment.id)
      
      // Start simulating data for demo
      startDataSimulation()
    } catch (error) {
      console.error('Error starting experiment:', error)
    }
  }

  const handleStopExperiment = async () => {
    if (!experiment) return

    try {
      const { error } = await supabase
        .from('experiments')
        .update({ 
          status: 'completed',
          end_time: new Date().toISOString(),
          pass_fail: true // Demo: always pass
        })
        .eq('id', experiment.id)

      if (error) throw error
      
      setIsRunning(false)
      await fetchExperimentData(experiment.id)
    } catch (error) {
      console.error('Error stopping experiment:', error)
    }
  }

  const startDataSimulation = () => {
    if (!experiment) return

    // Simulate data generation
    const interval = setInterval(async () => {
      if (!isRunning) {
        clearInterval(interval)
        return
      }

      const mockData = {
        experiment_id: experiment.id,
        sequence_number: measurements.length + 1,
        timestamp: new Date().toISOString(),
        current_a: 0.5 + Math.random() * 0.5,
        voltage_v: 20 + Math.random() * 2,
        power_w: 10 + Math.random() * 5,
        temperature_c: 25 + Math.random() * 10,
        humidity_percent: 45 + Math.random() * 10,
      }

      await supabase.from('measurements').insert(mockData)
    }, 1000)

    // Auto stop after 30 seconds for demo
    setTimeout(() => {
      clearInterval(interval)
      if (isRunning) {
        handleStopExperiment()
      }
    }, 30000)
  }

  const handleExportData = () => {
    // Convert measurements to CSV
    const csv = [
      ['序号', '时间戳', '电流(A)', '电压(V)', '功率(W)', '温度(°C)', '湿度(%)'],
      ...measurements.map(m => [
        m.sequence_number,
        new Date(m.timestamp).toLocaleString('zh-CN'),
        m.current_a,
        m.voltage_v,
        m.power_w,
        m.temperature_c,
        m.humidity_percent,
      ])
    ].map(row => row.join(',')).join('\n')

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `experiment_${experiment?.id.slice(0, 8)}_data.csv`
    link.click()
  }

  const generateReport = () => {
    console.log('Generate report')
    // TODO: Implement report generation
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!experiment) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">实验不存在</p>
        </div>
      </DashboardLayout>
    )
  }

  const getExperimentTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      dielectric: '耐压实验',
      leakage: '泄漏电流实验',
      normal_operation: '正常工况实验',
      abnormal_condition: '异常工况实验',
    }
    return typeNames[type] || type
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {experiment.experiment_name || getExperimentTypeName(experiment.experiment_type)}
            </h1>
            <p className="text-gray-400 mt-1">
              实验ID: {experiment.id.slice(0, 8)} • {device?.device_name || '未知设备'}
            </p>
          </div>
          
          <div className="flex space-x-4">
            {experiment.status === 'pending' && (
              <button
                onClick={handleStartExperiment}
                className="flex items-center btn-industrial"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                开始实验
              </button>
            )}
            
            {experiment.status === 'running' && (
              <button
                onClick={handleStopExperiment}
                className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <StopIcon className="h-5 w-5 mr-2" />
                停止实验
              </button>
            )}
            
            {experiment.status === 'completed' && (
              <>
                <button
                  onClick={handleExportData}
                  className="flex items-center px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-md transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  导出数据
                </button>
                <button
                  onClick={generateReport}
                  className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                >
                  <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                  生成报告
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status and Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold mb-4">实验状态</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">状态</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  experiment.status === 'running' ? 'bg-blue-500' :
                  experiment.status === 'completed' ? 'bg-green-500' :
                  experiment.status === 'failed' ? 'bg-red-500' :
                  'bg-gray-500'
                } text-white`}>
                  {experiment.status === 'running' ? '运行中' :
                   experiment.status === 'completed' ? '已完成' :
                   experiment.status === 'failed' ? '失败' :
                   experiment.status === 'cancelled' ? '已取消' : '待开始'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">开始时间</span>
                <span className="text-gray-300">
                  {new Date(experiment.start_time).toLocaleString('zh-CN')}
                </span>
              </div>
              
              {experiment.end_time && (
                <div className="flex justify-between">
                  <span className="text-gray-500">结束时间</span>
                  <span className="text-gray-300">
                    {new Date(experiment.end_time).toLocaleString('zh-CN')}
                  </span>
                </div>
              )}
              
              {experiment.pass_fail !== null && (
                <div className="flex justify-between items-center pt-3 border-t border-dark-700">
                  <span className="text-gray-500">测试结果</span>
                  <span className={`flex items-center ${
                    experiment.pass_fail ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {experiment.pass_fail ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                        通过
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-5 w-5 mr-1" />
                        未通过
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Test Parameters */}
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold mb-4">测试参数</h3>
            <div className="space-y-2 text-sm">
              {experiment.test_parameters && Object.entries(experiment.test_parameters).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-500">{formatParameterName(key)}</span>
                  <span className="text-gray-300">
                    {typeof value === 'boolean' ? (value ? '是' : '否') : value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold mb-4">数据统计</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">数据点数</span>
                <span className="text-gray-300">{measurements.length}</span>
              </div>
              
              {measurements.length > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">平均电压</span>
                    <span className="text-gray-300">
                      {(measurements.reduce((sum, m) => sum + (m.voltage_v || 0), 0) / measurements.length).toFixed(2)} V
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">平均电流</span>
                    <span className="text-gray-300">
                      {(measurements.reduce((sum, m) => sum + (m.current_a || 0), 0) / measurements.length).toFixed(3)} A
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">平均功率</span>
                    <span className="text-gray-300">
                      {(measurements.reduce((sum, m) => sum + (m.power_w || 0), 0) / measurements.length).toFixed(2)} W
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="dashboard-card">
          <h3 className="text-xl font-semibold mb-4">实时数据</h3>
          <div className="h-96">
            <ExperimentChart 
              data={measurements} 
              isRunning={experiment.status === 'running'}
            />
          </div>
        </div>

        {/* Data Table */}
        {measurements.length > 0 && (
          <div className="dashboard-card">
            <h3 className="text-xl font-semibold mb-4">测量数据</h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>时间</th>
                    <th>电流 (A)</th>
                    <th>电压 (V)</th>
                    <th>功率 (W)</th>
                    <th>温度 (°C)</th>
                    <th>湿度 (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.slice(-20).reverse().map((measurement) => (
                    <tr key={measurement.id}>
                      <td>{measurement.sequence_number}</td>
                      <td>{new Date(measurement.timestamp).toLocaleTimeString('zh-CN')}</td>
                      <td>{measurement.current_a?.toFixed(3)}</td>
                      <td>{measurement.voltage_v?.toFixed(2)}</td>
                      <td>{measurement.power_w?.toFixed(2)}</td>
                      <td>{measurement.temperature_c?.toFixed(1)}</td>
                      <td>{measurement.humidity_percent?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes */}
        {experiment.notes && (
          <div className="dashboard-card">
            <h3 className="text-xl font-semibold mb-4">备注</h3>
            <p className="text-gray-300">{experiment.notes}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function formatParameterName(key: string): string {
  const nameMap: Record<string, string> = {
    test_voltage: '测试电压',
    duration: '持续时间',
    max_leakage_current: '最大泄漏电流',
    measurement_range: '测量范围',
    sampling_rate: '采样率',
    making_capacity: '接通能力',
    breaking_capacity: '分断能力',
    short_circuit_withstand: '短路耐受',
    temperature_rise: '温升测试',
    overvoltage_protection: '过压保护',
    undervoltage_protection: '欠压保护',
    overcurrent_protection: '过流保护',
    reverse_polarity: '反接保护',
  }
  
  return nameMap[key] || key
}
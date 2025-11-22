'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Device = Database['public']['Tables']['devices']['Row']
type TestStandard = Database['public']['Tables']['test_standards']['Row']

function NewExperimentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState<Device[]>([])
  const [standards, setStandards] = useState<TestStandard[]>([])
  
  const [formData, setFormData] = useState({
    experiment_type: searchParams.get('type') || 'dielectric',
    experiment_name: '',
    device_id: '',
    notes: '',
    test_parameters: {} as any,
  })

  useEffect(() => {
    fetchDevices()
    fetchStandards()
  }, [])

  useEffect(() => {
    // Update test parameters based on selected standard
    const standard = standards.find(s => s.experiment_type === formData.experiment_type)
    if (standard && standard.requirements) {
      setFormData(prev => ({
        ...prev,
        test_parameters: standard.requirements,
      }))
    }
  }, [formData.experiment_type, standards])

  const fetchDevices = async () => {
    const { data } = await supabase
      .from('devices')
      .select('*')
      .eq('status', 'active')
      .order('device_name')
    
    if (data) setDevices(data)
  }

  const fetchStandards = async () => {
    const { data } = await supabase
      .from('test_standards')
      .select('*')
    
    if (data) setStandards(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('experiments')
        .insert({
          ...formData,
          operator_id: user?.id,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/experiments/${data.id}`)
    } catch (error: any) {
      console.error('Error creating experiment:', error)
      alert('创建实验失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getExperimentTypeConfig = (type: string) => {
    const configs: Record<string, any> = {
      dielectric: {
        name: '耐压实验',
        description: '测试光伏关断器的绝缘强度',
        icon: '⚡',
        parameters: [
          { key: 'test_voltage', label: '测试电压', unit: 'V', type: 'number', default: 2500 },
          { key: 'duration', label: '测试时间', unit: '秒', type: 'number', default: 60 },
          { key: 'max_leakage_current', label: '最大泄漏电流', unit: 'mA', type: 'number', default: 5 },
        ],
      },
      leakage: {
        name: '泄漏电流实验',
        description: '测量正常工作条件下的泄漏电流',
        icon: '💧',
        parameters: [
          { key: 'test_voltage', label: '测试电压', unit: 'V', type: 'number', default: 1100 },
          { key: 'measurement_range', label: '测量范围', unit: 'mA', type: 'text', default: '0-100' },
          { key: 'sampling_rate', label: '采样率', unit: 'Hz', type: 'number', default: 10 },
        ],
      },
      normal_operation: {
        name: '正常工况实验',
        description: '测试正常运行条件下的各项性能',
        icon: '✅',
        parameters: [
          { key: 'making_capacity', label: '接通能力测试', type: 'boolean', default: true },
          { key: 'breaking_capacity', label: '分断能力测试', type: 'boolean', default: true },
          { key: 'short_circuit_withstand', label: '短路耐受测试', type: 'boolean', default: true },
          { key: 'temperature_rise', label: '温升测试', type: 'boolean', default: true },
        ],
      },
      abnormal_condition: {
        name: '异常工况实验',
        description: '测试异常条件下的保护功能',
        icon: '⚠️',
        parameters: [
          { key: 'overvoltage_protection', label: '过压保护测试', type: 'boolean', default: true },
          { key: 'undervoltage_protection', label: '欠压保护测试', type: 'boolean', default: true },
          { key: 'overcurrent_protection', label: '过流保护测试', type: 'boolean', default: true },
          { key: 'reverse_polarity', label: '反接保护测试', type: 'boolean', default: true },
        ],
      },
    }
    
    return configs[type] || configs.dielectric
  }

  const experimentConfig = getExperimentTypeConfig(formData.experiment_type)

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">新建实验</h1>
          <p className="text-gray-400 mt-1">配置并启动新的测试实验</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Experiment Type Selection */}
          <div className="dashboard-card">
            <h2 className="text-xl font-semibold mb-4">选择实验类型</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['dielectric', 'leakage', 'normal_operation', 'abnormal_condition'].map((type) => {
                const config = getExperimentTypeConfig(type)
                const isSelected = formData.experiment_type === type
                
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, experiment_type: type }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'bg-primary-900/20 border-primary-600 shadow-lg' 
                        : 'bg-dark-800/50 border-dark-700 hover:border-dark-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">{config.icon}</div>
                    <p className="text-sm font-medium">{config.name}</p>
                  </button>
                )
              })}
            </div>
            
            <div className="mt-4 p-4 bg-dark-800/50 rounded-lg">
              <h3 className="font-medium text-primary-400 mb-1">
                {experimentConfig.name}
              </h3>
              <p className="text-sm text-gray-400">
                {experimentConfig.description}
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="dashboard-card">
            <h2 className="text-xl font-semibold mb-4">基本信息</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">实验名称</label>
                <input
                  type="text"
                  value={formData.experiment_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, experiment_name: e.target.value }))}
                  className="form-input"
                  placeholder={`${experimentConfig.name} - ${new Date().toLocaleDateString('zh-CN')}`}
                />
              </div>

              <div>
                <label className="form-label">测试设备</label>
                <select
                  value={formData.device_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, device_id: e.target.value }))}
                  className="form-input"
                  required
                >
                  <option value="">选择设备...</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.device_name} ({device.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="form-input"
                  rows={3}
                  placeholder="可选的备注信息..."
                />
              </div>
            </div>
          </div>

          {/* Test Parameters */}
          <div className="dashboard-card">
            <h2 className="text-xl font-semibold mb-4">测试参数</h2>
            <div className="space-y-4">
              {experimentConfig.parameters.map((param: any) => (
                <div key={param.key}>
                  <label className="form-label">
                    {param.label}
                    {param.unit && <span className="text-gray-500 ml-1">({param.unit})</span>}
                  </label>
                  
                  {param.type === 'boolean' ? (
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.test_parameters[param.key] ?? param.default}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          test_parameters: {
                            ...prev.test_parameters,
                            [param.key]: e.target.checked,
                          },
                        }))}
                        className="w-4 h-4 text-primary-600 bg-dark-800 border-dark-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-300">启用此测试</span>
                    </label>
                  ) : (
                    <input
                      type={param.type}
                      value={formData.test_parameters[param.key] ?? param.default}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        test_parameters: {
                          ...prev.test_parameters,
                          [param.key]: param.type === 'number' ? Number(e.target.value) : e.target.value,
                        },
                      }))}
                      className="form-input"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-md transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !formData.device_id}
              className="btn-industrial"
            >
              {loading ? '创建中...' : '创建实验'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default function NewExperimentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewExperimentContent />
    </Suspense>
  )
}
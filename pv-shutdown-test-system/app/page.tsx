'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RealtimeChart from '@/components/charts/RealtimeChart'
import StatusCard from '@/components/ui/StatusCard'
import MetricCard from '@/components/ui/MetricCard'
import DeviceStatusPanel from '@/components/ui/DeviceStatusPanel'
import AlertsPanel from '@/components/ui/AlertsPanel'
import { Database } from '@/types/database'

type Experiment = Database['public']['Tables']['experiments']['Row']
type Device = Database['public']['Tables']['devices']['Row']

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [realtimeData, setRealtimeData] = useState<any[]>([])
  
  useEffect(() => {
    checkAuth()
    fetchDashboardData()
    
    // Set up realtime subscription
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'measurements' },
        (payload) => {
          console.log('Realtime update:', payload)
          if (payload.eventType === 'INSERT') {
            setRealtimeData(prev => [...prev.slice(-99), payload.new])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch recent experiments
      const { data: experimentsData } = await supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      // Fetch devices
      const { data: devicesData } = await supabase
        .from('devices')
        .select('*')
        .eq('status', 'active')
      
      if (experimentsData) setExperiments(experimentsData)
      if (devicesData) setDevices(devicesData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeExperiments = experiments.filter(e => e.status === 'running').length
  const completedToday = experiments.filter(e => {
    const today = new Date().toDateString()
    return e.status === 'completed' && new Date(e.created_at).toDateString() === today
  }).length
  const totalDevices = devices.length
  const activeDevices = devices.filter(d => d.status === 'active').length

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gradient">
              光伏关断器实验数据管理系统
            </h1>
            <p className="text-gray-400 mt-1">
              实时监控 • 数据分析 • 智能管理
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/experiments/new" className="btn-industrial">
              新建实验
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="dashboard-grid">
          <MetricCard
            title="运行中实验"
            value={activeExperiments}
            unit="个"
            trend={+12.5}
            icon="experiment"
            color="primary"
          />
          <MetricCard
            title="今日完成"
            value={completedToday}
            unit="个"
            trend={+8.3}
            icon="check"
            color="success"
          />
          <MetricCard
            title="在线设备"
            value={activeDevices}
            unit="台"
            subtitle={`共 ${totalDevices} 台`}
            icon="device"
            color="info"
          />
          <MetricCard
            title="系统运行时间"
            value="99.9"
            unit="%"
            trend={+0.1}
            icon="time"
            color="warning"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Realtime Chart - 2 columns */}
          <div className="lg:col-span-2">
            <div className="dashboard-card h-[400px]">
              <h2 className="text-xl font-semibold mb-4">实时数据监控</h2>
              <RealtimeChart data={realtimeData} />
            </div>
          </div>

          {/* Device Status - 1 column */}
          <div className="space-y-6">
            <DeviceStatusPanel devices={devices} />
            <AlertsPanel />
          </div>
        </div>

        {/* Recent Experiments Table */}
        <div className="dashboard-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">最近实验记录</h2>
            <Link href="/experiments" className="text-primary-400 hover:text-primary-300">
              查看全部 →
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>实验编号</th>
                  <th>实验类型</th>
                  <th>设备</th>
                  <th>开始时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {experiments.slice(0, 5).map((experiment) => (
                  <tr key={experiment.id}>
                    <td className="font-mono text-sm">
                      {experiment.id.slice(0, 8)}
                    </td>
                    <td>
                      <span className="text-gray-300">
                        {getExperimentTypeName(experiment.experiment_type)}
                      </span>
                    </td>
                    <td>{experiment.device_id || '-'}</td>
                    <td>
                      {new Date(experiment.start_time).toLocaleString('zh-CN')}
                    </td>
                    <td>
                      <StatusBadge status={experiment.status} />
                    </td>
                    <td>
                      <Link
                        href={`/experiments/${experiment.id}`}
                        className="text-primary-400 hover:text-primary-300"
                      >
                        查看详情
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function getExperimentTypeName(type: string) {
  const typeNames: Record<string, string> = {
    dielectric: '耐压实验',
    leakage: '泄漏电流实验',
    normal_operation: '正常工况实验',
    abnormal_condition: '异常工况实验',
  }
  return typeNames[type] || type
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; text: string }> = {
    pending: { color: 'bg-gray-500', text: '待开始' },
    running: { color: 'bg-blue-500', text: '运行中' },
    completed: { color: 'bg-green-500', text: '已完成' },
    failed: { color: 'bg-red-500', text: '失败' },
    cancelled: { color: 'bg-yellow-500', text: '已取消' },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} text-white`}>
      {config.text}
    </span>
  )
}
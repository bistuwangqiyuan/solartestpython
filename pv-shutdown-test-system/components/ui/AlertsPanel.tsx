'use client'

import { useEffect, useState } from 'react'
import { ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'

interface Alert {
  id: string
  alert_type: string
  severity: string
  title: string
  message: string | null
  created_at: string
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchAlerts()
    
    // Subscribe to new alerts
    const channel = supabase
      .channel('alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          setAlerts(prev => [payload.new as Alert, ...prev].slice(0, 5))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('acknowledged', false)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (data) setAlerts(data)
  }

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: XCircleIcon,
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
        }
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
        }
      default:
        return {
          icon: InformationCircleIcon,
          color: 'text-blue-500',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
        }
    }
  }

  // Mock data for demonstration
  const mockAlerts: Alert[] = [
    {
      id: '1',
      alert_type: 'temperature',
      severity: 'warning',
      title: '设备温度过高',
      message: 'PV-RSD-001 温度达到 85°C',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      alert_type: 'experiment',
      severity: 'info',
      title: '实验即将完成',
      message: '耐压实验 #2345 预计5分钟后完成',
      created_at: new Date(Date.now() - 600000).toISOString(),
    },
  ]

  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts

  return (
    <div className="dashboard-card">
      <h3 className="text-lg font-semibold mb-4">系统告警</h3>
      <div className="space-y-3">
        {displayAlerts.map((alert) => {
          const config = getSeverityConfig(alert.severity)
          const Icon = config.icon
          
          return (
            <div
              key={alert.id}
              className={`p-3 rounded-lg ${config.bg} ${config.border} border`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${config.color}`}>
                    {alert.title}
                  </p>
                  {alert.message && (
                    <p className="text-xs text-gray-400 mt-1">
                      {alert.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        
        {displayAlerts.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            暂无告警信息
          </p>
        )}
      </div>
    </div>
  )
}
'use client'

import { Database } from '@/types/database'

type Device = Database['public']['Tables']['devices']['Row']

interface DeviceStatusPanelProps {
  devices: Device[]
}

export default function DeviceStatusPanel({ devices }: DeviceStatusPanelProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-indicator online"></span>
      case 'maintenance':
        return <span className="status-indicator offline"></span>
      default:
        return <span className="status-indicator error"></span>
    }
  }

  return (
    <div className="dashboard-card">
      <h3 className="text-lg font-semibold mb-4">设备状态</h3>
      <div className="space-y-3">
        {devices.slice(0, 5).map((device) => (
          <div
            key={device.id}
            className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(device.status)}
              <div>
                <p className="text-sm font-medium text-white">
                  {device.device_name}
                </p>
                <p className="text-xs text-gray-500">
                  {device.device_type} • {device.id}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">
                {device.rated_power ? `${device.rated_power}W` : '-'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
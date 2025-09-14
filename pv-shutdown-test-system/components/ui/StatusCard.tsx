'use client'

interface StatusCardProps {
  title: string
  status: 'online' | 'offline' | 'error'
  description?: string
  lastUpdate?: string
}

export default function StatusCard({
  title,
  status,
  description,
  lastUpdate,
}: StatusCardProps) {
  const statusConfig = {
    online: {
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: '在线',
    },
    offline: {
      color: 'text-gray-500',
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/20',
      text: '离线',
    },
    error: {
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: '故障',
    },
  }

  const config = statusConfig[status]

  return (
    <div className={`dashboard-card ${config.bg} ${config.border} border`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          )}
          {lastUpdate && (
            <p className="mt-2 text-xs text-gray-500">
              最后更新: {lastUpdate}
            </p>
          )}
        </div>
        <div className="ml-4 flex items-center">
          <span className={`status-indicator ${status}`}></span>
          <span className={`ml-2 text-sm font-medium ${config.color}`}>
            {config.text}
          </span>
        </div>
      </div>
    </div>
  )
}
'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'
import {
  BeakerIcon,
  CheckCircleIcon,
  CpuChipIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface MetricCardProps {
  title: string
  value: number | string
  unit?: string
  trend?: number
  subtitle?: string
  icon?: 'experiment' | 'check' | 'device' | 'time'
  color?: 'primary' | 'success' | 'info' | 'warning'
}

const iconMap = {
  experiment: BeakerIcon,
  check: CheckCircleIcon,
  device: CpuChipIcon,
  time: ClockIcon,
}

const colorMap = {
  primary: 'from-primary-600/20 to-primary-600/5 border-primary-600/20',
  success: 'from-green-600/20 to-green-600/5 border-green-600/20',
  info: 'from-blue-600/20 to-blue-600/5 border-blue-600/20',
  warning: 'from-yellow-600/20 to-yellow-600/5 border-yellow-600/20',
}

export default function MetricCard({
  title,
  value,
  unit = '',
  trend,
  subtitle,
  icon = 'experiment',
  color = 'primary',
}: MetricCardProps) {
  const Icon = iconMap[icon]
  const gradientClass = colorMap[color]

  return (
    <div className={`metric-card bg-gradient-to-br ${gradientClass} border relative`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-bold text-white">
              {value}
              <span className="ml-1 text-xl font-medium text-gray-400">
                {unit}
              </span>
            </p>
          </div>
          
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          
          {trend !== undefined && (
            <div className="mt-2 flex items-center">
              {trend >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={`ml-1 text-sm font-medium ${
                trend >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="ml-4">
          <Icon className="h-8 w-8 text-gray-600" />
        </div>
      </div>
    </div>
  )
}
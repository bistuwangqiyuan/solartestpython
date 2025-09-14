'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { 
  FunnelIcon, 
  PlusIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline'

type Experiment = Database['public']['Tables']['experiments']['Row']

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  const supabase = createClient()

  useEffect(() => {
    fetchExperiments()
  }, [filterType, filterStatus])

  const fetchExperiments = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterType !== 'all') {
        query = query.eq('experiment_type', filterType)
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) throw error
      setExperiments(data || [])
    } catch (error) {
      console.error('Error fetching experiments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredExperiments = experiments.filter(exp => 
    exp.experiment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.id.includes(searchTerm)
  )

  const getExperimentTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      dielectric: '耐压实验',
      leakage: '泄漏电流实验',
      normal_operation: '正常工况实验',
      abnormal_condition: '异常工况实验',
    }
    return typeNames[type] || type
  }

  const getStatusBadge = (status: string) => {
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

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export experiments')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">实验管理</h1>
            <p className="text-gray-400 mt-1">管理和查看所有实验记录</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-md transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              导出数据
            </button>
            <Link
              href="/experiments/new"
              className="flex items-center btn-industrial"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新建实验
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="dashboard-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="搜索实验名称或ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-input"
            >
              <option value="all">所有类型</option>
              <option value="dielectric">耐压实验</option>
              <option value="leakage">泄漏电流实验</option>
              <option value="normal_operation">正常工况实验</option>
              <option value="abnormal_condition">异常工况实验</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
            >
              <option value="all">所有状态</option>
              <option value="pending">待开始</option>
              <option value="running">运行中</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
        </div>

        {/* Experiments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="loading-spinner"></div>
            </div>
          ) : filteredExperiments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">暂无实验记录</p>
            </div>
          ) : (
            filteredExperiments.map((experiment) => (
              <Link
                key={experiment.id}
                href={`/experiments/${experiment.id}`}
                className="dashboard-card hover:shadow-2xl hover:border-primary-700 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                      {experiment.experiment_name || getExperimentTypeName(experiment.experiment_type)}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                      #{experiment.id.slice(0, 8)}
                    </p>
                  </div>
                  {getStatusBadge(experiment.status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">类型</span>
                    <span className="text-gray-300">
                      {getExperimentTypeName(experiment.experiment_type)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">设备</span>
                    <span className="text-gray-300">
                      {experiment.device_id || '未指定'}
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
                      <span className="text-gray-500">持续时间</span>
                      <span className="text-gray-300">
                        {calculateDuration(experiment.start_time, experiment.end_time)}
                      </span>
                    </div>
                  )}
                </div>

                {experiment.pass_fail !== null && (
                  <div className="mt-4 pt-4 border-t border-dark-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">测试结果</span>
                      <span className={`text-sm font-medium ${
                        experiment.pass_fail ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {experiment.pass_fail ? '通过' : '未通过'}
                      </span>
                    </div>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card bg-gradient-to-r from-primary-900/20 to-secondary-900/20 border-primary-700/30">
          <h2 className="text-lg font-semibold mb-4">快速开始</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/experiments/new?type=dielectric"
              className="p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm font-medium">耐压实验</p>
            </Link>
            <Link
              href="/experiments/new?type=leakage"
              className="p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">💧</div>
              <p className="text-sm font-medium">泄漏电流</p>
            </Link>
            <Link
              href="/experiments/new?type=normal_operation"
              className="p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">✅</div>
              <p className="text-sm font-medium">正常工况</p>
            </Link>
            <Link
              href="/experiments/new?type=abnormal_condition"
              className="p-4 bg-dark-800/50 hover:bg-dark-700/50 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">⚠️</div>
              <p className="text-sm font-medium">异常工况</p>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function calculateDuration(start: string, end: string): string {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  const duration = endTime - startTime

  const hours = Math.floor(duration / (1000 * 60 * 60))
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((duration % (1000 * 60)) / 1000)

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds}秒`
  } else {
    return `${seconds}秒`
  }
}
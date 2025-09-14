'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface SimulationResultsProps {
  data: any[]
  isRunning: boolean
}

export default function SimulationResults({ data, isRunning }: SimulationResultsProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current, 'dark')

    return () => {
      chartInstance.current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (!chartInstance.current || !data.length) return

    const option: EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        borderColor: '#374151',
        textStyle: {
          color: '#e5e7eb',
        },
      },
      legend: {
        data: ['电压', '电流', '功率'],
        textStyle: {
          color: '#9ca3af',
        },
        top: 10,
      },
      grid: {
        top: 60,
        right: 60,
        bottom: 60,
        left: 60,
      },
      xAxis: {
        type: 'value',
        name: '时间 (s)',
        nameTextStyle: {
          color: '#9ca3af',
        },
        axisLine: {
          lineStyle: {
            color: '#374151',
          },
        },
        axisLabel: {
          color: '#9ca3af',
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '电压 (V) / 功率 (W)',
          nameTextStyle: {
            color: '#9ca3af',
          },
          splitLine: {
            lineStyle: {
              color: '#1f2937',
            },
          },
          axisLine: {
            lineStyle: {
              color: '#374151',
            },
          },
          axisLabel: {
            color: '#9ca3af',
          },
        },
        {
          type: 'value',
          name: '电流 (A)',
          nameTextStyle: {
            color: '#9ca3af',
          },
          splitLine: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#374151',
            },
          },
          axisLabel: {
            color: '#9ca3af',
          },
        },
      ],
      series: [
        {
          name: '电压',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: '#3b82f6',
          },
          data: data.map(d => [d.time, d.voltage]),
          markLine: {
            silent: true,
            symbol: 'none',
            label: {
              position: 'end',
              formatter: 'RSD阈值',
              color: '#ef4444',
            },
            lineStyle: {
              color: '#ef4444',
              type: 'dashed',
            },
            data: [
              { yAxis: 30 }
            ],
          },
        },
        {
          name: '电流',
          type: 'line',
          smooth: true,
          symbol: 'none',
          yAxisIndex: 1,
          lineStyle: {
            width: 2,
            color: '#10b981',
          },
          data: data.map(d => [d.time, d.current]),
        },
        {
          name: '功率',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: '#f59e0b',
          },
          data: data.map(d => [d.time, d.power]),
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          start: data.length > 100 ? 80 : 0,
          end: 100,
        },
        {
          start: data.length > 100 ? 80 : 0,
          end: 100,
          handleStyle: {
            color: '#374151',
          },
          textStyle: {
            color: '#9ca3af',
          },
        },
      ],
    }

    chartInstance.current.setOption(option)
  }, [data])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const latestData = data[data.length - 1]

  return (
    <div className="space-y-6">
      {/* Real-time Values */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">当前电压</p>
          <p className="text-2xl font-bold text-blue-400">
            {latestData?.voltage?.toFixed(1) || '0.0'} V
          </p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">当前电流</p>
          <p className="text-2xl font-bold text-green-400">
            {latestData?.current?.toFixed(2) || '0.00'} A
          </p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">输出功率</p>
          <p className="text-2xl font-bold text-yellow-400">
            {latestData?.power?.toFixed(1) || '0.0'} W
          </p>
        </div>
        <div className="dashboard-card">
          <p className="text-sm text-gray-500">RSD状态</p>
          <p className={`text-2xl font-bold ${
            latestData?.rsdStatus === 'on' ? 'text-green-400' : 'text-red-400'
          }`}>
            {latestData?.rsdStatus === 'on' ? '导通' : '关断'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-card">
        <h3 className="text-xl font-semibold mb-4">仿真结果</h3>
        <div ref={chartRef} className="h-96" />
      </div>

      {/* Statistics */}
      {data.length > 0 && (
        <div className="dashboard-card">
          <h3 className="text-xl font-semibold mb-4">统计数据</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">平均电压</p>
              <p className="text-lg font-medium">
                {(data.reduce((sum, d) => sum + d.voltage, 0) / data.length).toFixed(1)} V
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">平均电流</p>
              <p className="text-lg font-medium">
                {(data.reduce((sum, d) => sum + d.current, 0) / data.length).toFixed(2)} A
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">平均功率</p>
              <p className="text-lg font-medium">
                {(data.reduce((sum, d) => sum + d.power, 0) / data.length).toFixed(1)} W
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">RSD响应率</p>
              <p className="text-lg font-medium">
                {((data.filter(d => d.rsdStatus === 'on').length / data.length) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
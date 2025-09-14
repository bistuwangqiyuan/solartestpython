'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { Database } from '@/types/database'

type Measurement = Database['public']['Tables']['measurements']['Row']

interface ExperimentChartProps {
  data: Measurement[]
  isRunning?: boolean
}

export default function ExperimentChart({ data, isRunning = false }: ExperimentChartProps) {
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
    if (!chartInstance.current) return

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
        data: ['电压', '电流', '功率', '温度'],
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
      dataZoom: [
        {
          type: 'inside',
          start: data.length > 100 ? 90 : 0,
          end: 100,
        },
        {
          start: data.length > 100 ? 90 : 0,
          end: 100,
          handleStyle: {
            color: '#374151',
          },
          textStyle: {
            color: '#9ca3af',
          },
        },
      ],
      xAxis: {
        type: 'category',
        data: data.map(d => new Date(d.timestamp).toLocaleTimeString('zh-CN')),
        axisLine: {
          lineStyle: {
            color: '#374151',
          },
        },
        axisLabel: {
          color: '#9ca3af',
          rotate: 45,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '电压 (V) / 温度 (°C)',
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
          name: '电流 (A) / 功率 (W)',
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
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ]),
          },
          data: data.map(d => d.voltage_v || 0),
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
          data: data.map(d => d.current_a || 0),
        },
        {
          name: '功率',
          type: 'line',
          smooth: true,
          symbol: 'none',
          yAxisIndex: 1,
          lineStyle: {
            width: 2,
            color: '#f59e0b',
          },
          data: data.map(d => d.power_w || 0),
        },
        {
          name: '温度',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: '#ef4444',
            type: 'dashed',
          },
          data: data.map(d => d.temperature_c || 0),
        },
      ],
      animation: isRunning,
    }

    chartInstance.current.setOption(option)
  }, [data, isRunning])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div ref={chartRef} className="w-full h-full" />
  )
}
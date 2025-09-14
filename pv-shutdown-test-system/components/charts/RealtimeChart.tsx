'use client'

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface RealtimeChartProps {
  data?: any[]
}

export default function RealtimeChart({ data = [] }: RealtimeChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  
  // Generate mock data for demonstration
  const [mockData, setMockData] = useState(() => {
    const now = Date.now()
    return Array.from({ length: 100 }, (_, i) => ({
      timestamp: now - (99 - i) * 1000,
      voltage: 20 + Math.random() * 2,
      current: 0.5 + Math.random() * 0.5,
      power: 10 + Math.random() * 5,
    }))
  })

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current, 'dark')
    
    // Set up interval for mock data updates
    const interval = setInterval(() => {
      setMockData(prev => {
        const newData = [...prev.slice(1)]
        newData.push({
          timestamp: Date.now(),
          voltage: 20 + Math.random() * 2,
          current: 0.5 + Math.random() * 0.5,
          power: 10 + Math.random() * 5,
        })
        return newData
      })
    }, 1000)

    return () => {
      clearInterval(interval)
      chartInstance.current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (!chartInstance.current) return

    const displayData = data.length > 0 ? data : mockData

    const option: EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        borderColor: '#374151',
        textStyle: {
          color: '#e5e7eb',
        },
        formatter: (params: any) => {
          const time = new Date(params[0].value[0]).toLocaleTimeString('zh-CN')
          return `
            <div class="text-xs">
              <div class="font-medium mb-1">${time}</div>
              ${params.map((item: any) => `
                <div class="flex justify-between items-center">
                  <span class="flex items-center">
                    <span class="inline-block w-2 h-2 rounded-full mr-2" style="background-color: ${item.color}"></span>
                    ${item.seriesName}
                  </span>
                  <span class="ml-4 font-mono">${item.value[1].toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          `
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
        right: 50,
        bottom: 40,
        left: 60,
      },
      xAxis: {
        type: 'time',
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
          formatter: (value: number) => {
            return new Date(value).toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          },
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
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
            ]),
          },
          data: displayData.map(item => [item.timestamp, item.voltage]),
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
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' },
            ]),
          },
          data: displayData.map(item => [item.timestamp, item.current]),
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
          data: displayData.map(item => [item.timestamp, item.power]),
        },
      ],
    }

    chartInstance.current.setOption(option)
  }, [data, mockData])

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
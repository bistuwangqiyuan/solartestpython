'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface DataChartProps {
  data: {
    headers: string[]
    data: any[]
  }
}

export default function DataChart({ data }: DataChartProps) {
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
    if (!chartInstance.current || !data) return

    // Extract numeric columns
    const numericColumns = data.headers.filter(header => {
      // Check if column contains numeric data
      return data.data.some(row => !isNaN(parseFloat(row[header])))
    })

    // Find index/sequence column
    const indexColumn = data.headers.find(h => 
      h.includes('序号') || h.toLowerCase().includes('index') || h.toLowerCase().includes('seq')
    )

    // Prepare series data
    const series: any[] = numericColumns
      .filter(col => col !== indexColumn) // Exclude index column from series
      .map(column => {
        const colorMap: Record<string, string> = {
          '电压': '#3b82f6',
          '电流': '#10b981',
          '功率': '#f59e0b',
          '温度': '#ef4444',
        }

        let color = '#8b5cf6' // Default color
        Object.keys(colorMap).forEach(key => {
          if (column.includes(key)) {
            color = colorMap[key]
          }
        })

        return {
          name: column,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color,
          },
          data: data.data.map(row => parseFloat(row[column]) || 0),
        }
      })

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
        data: series.map(s => s.name),
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
          start: 0,
          end: 100,
        },
        {
          start: 0,
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
        data: data.data.map((row, index) => 
          indexColumn ? row[indexColumn] : index + 1
        ),
        axisLine: {
          lineStyle: {
            color: '#374151',
          },
        },
        axisLabel: {
          color: '#9ca3af',
        },
      },
      yAxis: {
        type: 'value',
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
      series,
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

  return (
    <div ref={chartRef} className="w-full h-full" />
  )
}
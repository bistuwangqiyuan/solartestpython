'use client'

import { useState, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FileUploadModal from '@/components/ui/FileUploadModal'
import DataTable from '@/components/ui/DataTable'
import DataChart from '@/components/charts/DataChart'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/client'
import {
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  TableCellsIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

interface ParsedData {
  headers: string[]
  data: any[]
  metadata?: {
    recordTime?: string
    deviceAddress?: string
    deviceType?: string
    dataPoints?: number
  }
}

export default function DataManagementPage() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const supabase = createClient()

  const parseExcelFile = (file: File): Promise<ParsedData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          // Parse metadata from the second row if it exists
          let metadata: ParsedData['metadata'] = {}
          let dataStartRow = 0
          
          if (jsonData.length > 1 && typeof jsonData[1][0] === 'string' && jsonData[1][0].includes('记录时间')) {
            const metaRow = jsonData[1] as string[]
            metaRow.forEach(cell => {
              if (typeof cell === 'string') {
                if (cell.includes('记录时间:')) {
                  metadata.recordTime = cell.split('记录时间:')[1]?.trim()
                } else if (cell.includes('设备地址:')) {
                  metadata.deviceAddress = cell.split('设备地址:')[1]?.trim()
                } else if (cell.includes('设备类型:')) {
                  metadata.deviceType = cell.split('设备类型:')[1]?.trim()
                } else if (cell.includes('数据点数:')) {
                  metadata.dataPoints = parseInt(cell.split('数据点数:')[1]?.trim() || '0')
                }
              }
            })
            dataStartRow = 3 // Skip metadata rows
          }
          
          // Get headers
          const headers = jsonData[dataStartRow] as string[]
          
          // Get data rows
          const dataRows = jsonData.slice(dataStartRow + 1).filter(row => 
            Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== '')
          )
          
          // Convert to objects
          const parsedRows = dataRows.map(row => {
            const obj: any = {}
            headers.forEach((header, index) => {
              obj[header] = row[index]
            })
            return obj
          })
          
          resolve({
            headers,
            data: parsedRows,
            metadata,
          })
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    
    try {
      const parsed = await parseExcelFile(file)
      setParsedData(parsed)
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('文件解析失败，请确保是正确的Excel格式')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  })

  const handleSaveToDatabase = async () => {
    if (!parsedData) return
    
    setUploading(true)
    try {
      // Create a new experiment
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: experiment, error: expError } = await supabase
        .from('experiments')
        .insert({
          experiment_type: 'normal_operation',
          experiment_name: `导入数据 - ${new Date().toLocaleDateString('zh-CN')}`,
          status: 'completed',
          operator_id: user?.id,
          test_parameters: parsedData.metadata,
          start_time: parsedData.metadata?.recordTime || new Date().toISOString(),
          end_time: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (expError) throw expError
      
      // Insert measurements
      const measurements = parsedData.data.map((row, index) => ({
        experiment_id: experiment.id,
        sequence_number: row['序号'] || index + 1,
        current_a: parseFloat(row['电流 (A)'] || row['电流(A)'] || '0'),
        voltage_v: parseFloat(row['电压 (V)'] || row['电压(V)'] || '0'),
        power_w: parseFloat(row['功率 (W)'] || row['功率(W)'] || '0'),
        timestamp: row['时间戳'] ? new Date(row['时间戳']).toISOString() : new Date().toISOString(),
        additional_data: {
          device_address: row['设备地址'],
          device_type: row['设备类型'],
        },
      }))
      
      const { error: measError } = await supabase
        .from('measurements')
        .insert(measurements)
      
      if (measError) throw measError
      
      alert('数据已成功保存到数据库！')
      setShowUploadModal(false)
    } catch (error: any) {
      console.error('Error saving to database:', error)
      alert('保存失败: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleExportData = () => {
    if (!parsedData) return
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(parsedData.data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')
    
    // Generate and download
    XLSX.writeFile(wb, `export_data_${Date.now()}.xlsx`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">数据管理</h1>
            <p className="text-gray-400 mt-1">导入、查看和分析实验数据</p>
          </div>
          
          {parsedData && (
            <div className="flex space-x-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                保存到数据库
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-md transition-colors"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                导出数据
              </button>
            </div>
          )}
        </div>

        {!parsedData ? (
          /* Upload Area */
          <div
            {...getRootProps()}
            className={`dashboard-card border-2 border-dashed ${
              isDragActive ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600'
            } hover:border-primary-500 transition-colors cursor-pointer`}
          >
            <input {...getInputProps()} />
            <div className="text-center py-12">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <p className="text-lg font-medium text-gray-300 mb-2">
                {isDragActive ? '释放文件以上传' : '拖拽Excel文件到此处'}
              </p>
              <p className="text-sm text-gray-500">
                或点击选择文件 (支持 .xlsx, .xls, .csv)
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Data Info */}
            <div className="dashboard-card bg-gradient-to-r from-primary-900/20 to-secondary-900/20 border-primary-700/30">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">数据点数</p>
                  <p className="text-2xl font-bold text-white">
                    {parsedData.data.length}
                  </p>
                </div>
                {parsedData.metadata?.recordTime && (
                  <div>
                    <p className="text-sm text-gray-500">记录时间</p>
                    <p className="text-lg font-medium text-white">
                      {parsedData.metadata.recordTime}
                    </p>
                  </div>
                )}
                {parsedData.metadata?.deviceAddress && (
                  <div>
                    <p className="text-sm text-gray-500">设备地址</p>
                    <p className="text-lg font-medium text-white">
                      {parsedData.metadata.deviceAddress}
                    </p>
                  </div>
                )}
                {parsedData.metadata?.deviceType && (
                  <div>
                    <p className="text-sm text-gray-500">设备类型</p>
                    <p className="text-lg font-medium text-white">
                      {parsedData.metadata.deviceType}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">数据预览</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                  }`}
                >
                  <TableCellsIcon className="h-5 w-5 mr-2" />
                  表格视图
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    viewMode === 'chart'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  图表视图
                </button>
              </div>
            </div>

            {/* Data Display */}
            <div className="dashboard-card">
              {viewMode === 'table' ? (
                <DataTable data={parsedData} />
              ) : (
                <div className="h-96">
                  <DataChart data={parsedData} />
                </div>
              )}
            </div>

            {/* Clear Data Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setParsedData(null)}
                className="px-6 py-3 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-md transition-colors"
              >
                清除数据并上传新文件
              </button>
            </div>
          </>
        )}

        {/* Upload Modal */}
        {showUploadModal && parsedData && (
          <FileUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onConfirm={handleSaveToDatabase}
            data={parsedData}
            uploading={uploading}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
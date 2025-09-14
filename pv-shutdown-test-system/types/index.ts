export * from './database'

// Additional app-specific types
export interface ExperimentData {
  序号: number
  '电流 (A)': number
  '电压 (V)': number
  '功率 (W)': number
  时间戳: string
  设备地址: string
  设备类型: string
}

export interface ChartDataPoint {
  timestamp: string | number
  current: number
  voltage: number
  power: number
}

export interface DeviceInfo {
  id: string
  name: string
  type: string
  status: 'online' | 'offline' | 'error'
  lastUpdate: string
}
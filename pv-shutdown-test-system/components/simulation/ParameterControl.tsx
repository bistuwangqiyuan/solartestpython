'use client'

interface ParameterControlProps {
  params: any
  onChange: (params: any) => void
  disabled?: boolean
}

export default function ParameterControl({ params, onChange, disabled }: ParameterControlProps) {
  const handleChange = (key: string, value: any) => {
    onChange({
      ...params,
      [key]: value,
    })
  }

  return (
    <div className="space-y-4">
      {/* PV Module Parameters */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-4">光伏组件参数</h3>
        <div className="space-y-3">
          <div>
            <label className="form-label text-xs">辐照度 (W/m²)</label>
            <input
              type="range"
              min="0"
              max="1200"
              step="50"
              value={params.irradiance}
              onChange={(e) => handleChange('irradiance', Number(e.target.value))}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span className="font-mono text-primary-400">{params.irradiance}</span>
              <span>1200</span>
            </div>
          </div>

          <div>
            <label className="form-label text-xs">温度 (°C)</label>
            <input
              type="range"
              min="-10"
              max="80"
              step="5"
              value={params.temperature}
              onChange={(e) => handleChange('temperature', Number(e.target.value))}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-10</span>
              <span className="font-mono text-primary-400">{params.temperature}</span>
              <span>80</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="form-label text-xs">Voc (V)</label>
              <input
                type="number"
                value={params.moduleVoc}
                onChange={(e) => handleChange('moduleVoc', Number(e.target.value))}
                disabled={disabled}
                className="form-input text-sm"
              />
            </div>
            <div>
              <label className="form-label text-xs">Isc (A)</label>
              <input
                type="number"
                value={params.moduleIsc}
                onChange={(e) => handleChange('moduleIsc', Number(e.target.value))}
                disabled={disabled}
                className="form-input text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RSD Parameters */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-4">关断器参数</h3>
        <div className="space-y-3">
          <div>
            <label className="form-label text-xs">关断电压阈值 (V)</label>
            <input
              type="number"
              value={params.rsdVoltageThreshold}
              onChange={(e) => handleChange('rsdVoltageThreshold', Number(e.target.value))}
              disabled={disabled}
              className="form-input text-sm"
            />
          </div>

          <div>
            <label className="form-label text-xs">响应时间 (ms)</label>
            <input
              type="number"
              value={params.rsdResponseTime}
              onChange={(e) => handleChange('rsdResponseTime', Number(e.target.value))}
              disabled={disabled}
              className="form-input text-sm"
            />
          </div>

          <div>
            <label className="form-label text-xs">泄漏电流 (mA)</label>
            <input
              type="number"
              step="0.1"
              value={params.rsdLeakageCurrent}
              onChange={(e) => handleChange('rsdLeakageCurrent', Number(e.target.value))}
              disabled={disabled}
              className="form-input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Load Parameters */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-4">负载参数</h3>
        <div className="space-y-3">
          <div>
            <label className="form-label text-xs">负载类型</label>
            <select
              value={params.loadType}
              onChange={(e) => handleChange('loadType', e.target.value)}
              disabled={disabled}
              className="form-input text-sm"
            >
              <option value="resistive">纯电阻</option>
              <option value="inductive">感性负载</option>
              <option value="capacitive">容性负载</option>
            </select>
          </div>

          <div>
            <label className="form-label text-xs">负载值 (Ω)</label>
            <input
              type="number"
              value={params.loadValue}
              onChange={(e) => handleChange('loadValue', Number(e.target.value))}
              disabled={disabled}
              className="form-input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Fault Conditions */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold mb-4">故障条件</h3>
        <div className="space-y-3">
          <div>
            <label className="form-label text-xs">故障类型</label>
            <select
              value={params.faultType}
              onChange={(e) => handleChange('faultType', e.target.value)}
              disabled={disabled}
              className="form-input text-sm"
            >
              <option value="none">无故障</option>
              <option value="overvoltage">过压</option>
              <option value="overcurrent">过流</option>
              <option value="ground_fault">接地故障</option>
              <option value="arc_fault">电弧故障</option>
            </select>
          </div>

          {params.faultType !== 'none' && (
            <div>
              <label className="form-label text-xs">故障程度 (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={params.faultMagnitude}
                onChange={(e) => handleChange('faultMagnitude', Number(e.target.value))}
                disabled={disabled}
                className="w-full"
              />
              <div className="text-center text-xs text-primary-400 mt-1">
                {params.faultMagnitude}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
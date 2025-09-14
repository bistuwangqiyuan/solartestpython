'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { createClient } from '@/lib/supabase/client'
import {
  UserCircleIcon,
  CpuChipIcon,
  BeakerIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const supabase = createClient()
  
  const tabs = [
    { id: 'profile', name: '个人信息', icon: UserCircleIcon },
    { id: 'devices', name: '设备管理', icon: CpuChipIcon },
    { id: 'standards', name: '测试标准', icon: BeakerIcon },
    { id: 'notifications', name: '通知设置', icon: BellIcon },
    { id: 'security', name: '安全设置', icon: ShieldCheckIcon },
    { id: 'system', name: '系统信息', icon: DocumentTextIcon },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">系统设置</h1>
          <p className="text-gray-400 mt-1">管理系统配置和用户设置</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-dark-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'devices' && <DeviceSettings />}
          {activeTab === 'standards' && <StandardsSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'system' && <SystemInfo />}
        </div>
      </div>
    </DashboardLayout>
  )
}

function ProfileSettings() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    department: '',
    phone: '',
    role: 'engineer',
  })

  return (
    <div className="dashboard-card max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">个人信息设置</h2>
      <form className="space-y-4">
        <div>
          <label className="form-label">姓名</label>
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            className="form-input"
            placeholder="请输入您的姓名"
          />
        </div>
        
        <div>
          <label className="form-label">邮箱</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="form-input"
            placeholder="user@example.com"
          />
        </div>
        
        <div>
          <label className="form-label">部门</label>
          <input
            type="text"
            value={profile.department}
            onChange={(e) => setProfile({ ...profile, department: e.target.value })}
            className="form-input"
            placeholder="研发部"
          />
        </div>
        
        <div>
          <label className="form-label">电话</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="form-input"
            placeholder="+86 138 0000 0000"
          />
        </div>
        
        <div>
          <label className="form-label">角色</label>
          <select
            value={profile.role}
            onChange={(e) => setProfile({ ...profile, role: e.target.value })}
            className="form-input"
          >
            <option value="admin">管理员</option>
            <option value="engineer">工程师</option>
            <option value="viewer">查看者</option>
          </select>
        </div>
        
        <div className="pt-4">
          <button type="button" className="btn-industrial">
            保存更改
          </button>
        </div>
      </form>
    </div>
  )
}

function DeviceSettings() {
  return (
    <div className="dashboard-card">
      <h2 className="text-xl font-semibold mb-6">设备管理</h2>
      <div className="space-y-4">
        <div className="bg-dark-800 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">PV-RSD-001</h3>
              <p className="text-sm text-gray-500 mt-1">Demo Rapid Shutdown Device</p>
              <p className="text-xs text-gray-600 mt-2">
                额定功率: 30kW • 额定电压: 1000V • 额定电流: 30A
              </p>
            </div>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
              在线
            </span>
          </div>
          <div className="mt-4 flex space-x-2">
            <button className="text-sm text-primary-400 hover:text-primary-300">
              编辑
            </button>
            <span className="text-gray-700">•</span>
            <button className="text-sm text-primary-400 hover:text-primary-300">
              校准
            </button>
            <span className="text-gray-700">•</span>
            <button className="text-sm text-red-400 hover:text-red-300">
              删除
            </button>
          </div>
        </div>
        
        <button className="w-full py-3 border-2 border-dashed border-dark-600 rounded-lg text-gray-500 hover:border-primary-600 hover:text-primary-400 transition-colors">
          + 添加新设备
        </button>
      </div>
    </div>
  )
}

function StandardsSettings() {
  const standards = [
    { code: 'IEC-60947-3-8.3', name: '耐压实验', type: 'dielectric' },
    { code: 'UL-1741-39', name: '泄漏电流实验', type: 'leakage' },
    { code: 'IEC-60947-3-5', name: '正常工况实验', type: 'normal_operation' },
    { code: 'UL-1741-40', name: '异常工况实验', type: 'abnormal_condition' },
  ]

  return (
    <div className="dashboard-card">
      <h2 className="text-xl font-semibold mb-6">测试标准配置</h2>
      <div className="space-y-4">
        {standards.map((standard) => (
          <div key={standard.code} className="bg-dark-800 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{standard.name}</h3>
                <p className="text-sm text-gray-500 mt-1">标准代码: {standard.code}</p>
              </div>
              <button className="text-sm text-primary-400 hover:text-primary-300">
                查看详情
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    experimentComplete: true,
    experimentFailed: true,
    deviceOffline: true,
    systemUpdates: false,
    reports: true,
  })

  return (
    <div className="dashboard-card max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">通知设置</h2>
      <div className="space-y-4">
        <label className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
          <div>
            <p className="font-medium">实验完成通知</p>
            <p className="text-sm text-gray-500">当实验完成时接收通知</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.experimentComplete}
            onChange={(e) => setNotifications({ ...notifications, experimentComplete: e.target.checked })}
            className="toggle-industrial"
          />
        </label>
        
        <label className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
          <div>
            <p className="font-medium">实验失败告警</p>
            <p className="text-sm text-gray-500">当实验失败时立即通知</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.experimentFailed}
            onChange={(e) => setNotifications({ ...notifications, experimentFailed: e.target.checked })}
            className="toggle-industrial"
          />
        </label>
        
        <label className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
          <div>
            <p className="font-medium">设备离线告警</p>
            <p className="text-sm text-gray-500">当设备离线时接收告警</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.deviceOffline}
            onChange={(e) => setNotifications({ ...notifications, deviceOffline: e.target.checked })}
            className="toggle-industrial"
          />
        </label>
        
        <label className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
          <div>
            <p className="font-medium">系统更新</p>
            <p className="text-sm text-gray-500">接收系统更新和维护通知</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.systemUpdates}
            onChange={(e) => setNotifications({ ...notifications, systemUpdates: e.target.checked })}
            className="toggle-industrial"
          />
        </label>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="dashboard-card max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">安全设置</h2>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">密码设置</h3>
          <button className="btn-industrial">
            更改密码
          </button>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">双因素认证</h3>
          <p className="text-sm text-gray-500 mb-3">
            启用双因素认证以提高账户安全性
          </p>
          <button className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-md transition-colors">
            启用 2FA
          </button>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">登录历史</h3>
          <div className="space-y-2">
            <div className="text-sm text-gray-500">
              <p>2025-09-14 15:32:18 - Chrome, Windows - 192.168.1.100</p>
              <p>2025-09-14 09:15:32 - Safari, macOS - 192.168.1.101</p>
              <p>2025-09-13 18:45:21 - Chrome, Windows - 192.168.1.100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SystemInfo() {
  return (
    <div className="dashboard-card">
      <h2 className="text-xl font-semibold mb-6">系统信息</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">系统版本</p>
            <p className="font-medium">v1.0.0</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">最后更新</p>
            <p className="font-medium">2025-09-14</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">数据库状态</p>
            <p className="font-medium text-green-400">正常</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">存储使用</p>
            <p className="font-medium">12.5 GB / 100 GB</p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-dark-700">
          <h3 className="font-medium mb-3">系统维护</h3>
          <div className="space-x-4">
            <button className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-md transition-colors">
              清理缓存
            </button>
            <button className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-md transition-colors">
              导出日志
            </button>
            <button className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-md transition-colors">
              备份数据
            </button>
          </div>
        </div>
        
        <div className="pt-4 border-t border-dark-700">
          <h3 className="font-medium mb-3">关于</h3>
          <p className="text-sm text-gray-500">
            光伏关断器实验数据管理系统 © 2025<br />
            Powered by Next.js, Supabase, and Netlify
          </p>
        </div>
      </div>
    </div>
  )
}
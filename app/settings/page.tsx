'use client'

import { useState } from 'react'
import { Settings, Bell, Shield, Palette, Database, HelpCircle, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false
  })

  const privacySettings = [
    { id: 'profile', label: '公开个人资料', description: '让其他用户可以看到你的个人资料' },
    { id: 'activity', label: '公开活动记录', description: '显示你的阅读和笔记活动' },
    { id: 'stats', label: '分享统计数据', description: '允许匿名分享使用统计' },
  ]

  const handleSave = () => {
    toast.success('设置已保存')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">设置</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          管理您的账户设置和偏好
        </p>
      </div>

      {/* 外观设置 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Palette className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">外观</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-4">
              {darkMode ? (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {darkMode ? '深色模式' : '浅色模式'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  切换界面主题
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setDarkMode(!darkMode)
                toast.success(darkMode ? '已切换到浅色模式' : '已切换到深色模式')
              }}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                darkMode
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              切换
            </button>
          </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">通知</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">邮件通知</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                通过邮件接收更新和提醒
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">推送通知</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                在浏览器中接收推送通知
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">产品更新</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                接收新功能和更新的通知
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.updates}
                onChange={(e) => setNotifications({ ...notifications, updates: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 隐私设置 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">隐私</h2>
        </div>

        <div className="space-y-4">
          {privacySettings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {setting.description}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <Database className="h-5 w-5 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">数据管理</h2>
        </div>

        <div className="space-y-4">
          <button className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <p className="font-medium text-gray-900 dark:text-white">导出我的数据</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              下载您所有的文档、笔记和设置
            </p>
          </button>
          <button className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <p className="font-medium text-gray-900 dark:text-white">清除缓存</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              清除本地缓存数据
            </p>
          </button>
          <button
            onClick={() => {
              if (confirm('确定要删除所有数据吗？此操作不可恢复。')) {
                toast.success('数据已清除')
                localStorage.clear()
              }
            }}
            className="w-full text-left p-4 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <p className="font-medium text-red-600 dark:text-red-400">删除所有数据</p>
            <p className="text-sm text-red-600/70 dark:text-red-400/70">
              永久删除所有文档、笔记和设置（不可恢复）
            </p>
          </button>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end space-x-3">
        <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
          取消
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          保存设置
        </button>
      </div>
    </div>
  )
}

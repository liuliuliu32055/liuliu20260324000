'use client'

import { useState } from 'react'
import { User, Mail, Calendar, BookOpen, FileText, Clock, Award } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: '用户 15922233923',
    email: 'user@example.com',
    phone: '15922233923',
    bio: '热爱学习，喜欢探索新知识',
    joinDate: '2024-03-01'
  })

  const stats = [
    { label: '上传文档', value: 12, icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: '创建笔记', value: 24, icon: BookOpen, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { label: '阅读时长', value: '8.2h', icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: '获得成就', value: 5, icon: Award, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  ]

  const recentActivity = [
    { id: 1, type: 'upload', docName: '人工智能发展白皮书', time: '2024-03-20 14:30' },
    { id: 2, type: 'note', docName: 'React 18 新特性详解', time: '2024-03-19 10:15' },
    { id: 3, type: 'upload', docName: '项目管理最佳实践', time: '2024-03-18 16:45' },
  ]

  const handleSave = () => {
    toast.success('个人信息已更新')
    setIsEditing(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* 头像 */}
          <div className="flex-shrink-0">
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">{userInfo.name.charAt(0)}</span>
            </div>
          </div>

          {/* 基本信息 */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {userInfo.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{userInfo.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>加入时间: {formatDate(userInfo.joinDate)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                编辑资料
              </button>
            </div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              {userInfo.bio}
            </p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
            >
              <div className={cn("p-2 rounded-lg", stat.bgColor, "mb-3")}>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* 编辑表单 */}
      {isEditing && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">编辑个人信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                姓名
              </label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                个人简介
              </label>
              <textarea
                value={userInfo.bio}
                onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-24 resize-none"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 最近活动 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">最近活动</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "p-2 rounded-lg",
                  activity.type === 'upload' ? "bg-blue-100 dark:bg-blue-900/30" : "bg-green-100 dark:bg-green-900/30"
                )}>
                  {activity.type === 'upload' ? (
                    <FileText className="h-4 w-4 text-blue-600" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.type === 'upload' ? '上传了' : '创建了笔记'} {activity.docName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

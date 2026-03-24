'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth/auth-context'

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    // 密码验证
    if (!formData.password.trim()) {
      newErrors.password = '密码不能为空'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少为6位'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    const success = await login(formData.email, formData.password)
    if (success) {
      router.push('/documents')
      router.refresh()
    } else {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 清除当前字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            欢迎回来
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            登录您的 AI 伴读助手账户
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 邮箱输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              邮箱地址
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={cn(
                  "w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2",
                  errors.email
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800"
                )}
                placeholder="输入您的邮箱"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">{errors.email}</span>
              </div>
            )}
          </div>

          {/* 密码输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              密码
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={cn(
                  "w-full pl-11 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2",
                  errors.password
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800"
                )}
                placeholder="输入您的密码"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">{errors.password}</span>
              </div>
            )}
          </div>

          {/* 一般错误 */}
          {errors.general && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 px-6 rounded-lg font-semibold transition-all",
              "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
              "hover:from-blue-600 hover:to-purple-600",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? '登录中...' : '登录'}
          </button>

          {/* 其他选项 */}
          <div className="text-center space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              还没有账户？{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                disabled={loading}
              >
                立即注册
              </button>
            </div>
            
            <div className="text-sm">
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                disabled={loading}
              >
                忘记密码？
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
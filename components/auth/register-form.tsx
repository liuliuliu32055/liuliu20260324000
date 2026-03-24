'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth/auth-context'

export function RegisterForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // 姓名验证
    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空'
    } else if (formData.name.length < 2) {
      newErrors.name = '姓名至少2个字符'
    }

    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    // 手机号验证（可选）
    if (formData.phone.trim()) {
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = '手机号格式不正确'
      }
    }

    // 密码验证
    if (!formData.password.trim()) {
      newErrors.password = '密码不能为空'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少为6位'
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '密码需包含字母和数字'
    }

    // 确认密码验证
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '请确认密码'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
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

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          name: formData.name
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '注册失败')
      }

      // 自动登录
      await login(formData.email, formData.password)
      router.push('/documents')
      router.refresh()

    } catch (error: any) {
      console.error('注册失败:', error)
      
      if (error.message.includes('该邮箱已被注册')) {
        setErrors({
          email: '该邮箱已被注册'
        })
      } else {
        toast.error(error.message || '注册失败，请重试')
      }
    } finally {
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
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            创建账户
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            加入 AI 伴读助手，开始智能阅读
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 姓名输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              姓名
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={cn(
                  "w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2",
                  errors.name
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800"
                )}
                placeholder="输入您的姓名"
                disabled={loading}
              />
            </div>
            {errors.name && (
              <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">{errors.name}</span>
              </div>
            )}
          </div>

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

          {/* 手机号输入（可选） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              手机号 <span className="text-gray-500">(可选)</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={cn(
                  "w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2",
                  errors.phone
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800"
                )}
                placeholder="输入您的手机号"
                disabled={loading}
              />
            </div>
            {errors.phone && (
              <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">{errors.phone}</span>
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
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              密码需包含字母和数字，至少6位
            </div>
          </div>

          {/* 确认密码输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              确认密码
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={cn(
                  "w-full pl-11 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2",
                  errors.confirmPassword
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-800"
                )}
                placeholder="再次输入密码"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">{errors.confirmPassword}</span>
              </div>
            )}
          </div>

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
            {loading ? '注册中...' : '注册'}
          </button>

          {/* 用户协议 */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              点击"注册"即表示您同意我们的{' '}
              <button
                type="button"
                onClick={() => router.push('/terms')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                disabled={loading}
              >
                服务条款
              </button>{' '}
              和{' '}
              <button
                type="button"
                onClick={() => router.push('/privacy')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                disabled={loading}
              >
                隐私政策
              </button>
            </p>
          </div>

          {/* 登录链接 */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              已有账户？{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                disabled={loading}
              >
                立即登录
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
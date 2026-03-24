'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 公开路由，不需要登录即可访问
const publicRoutes = ['/', '/login', '/register', '/cases']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // 检查登录状态
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
          setUser(JSON.parse(userStr))
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // 路由保护
  useEffect(() => {
    if (!loading && !user) {
      // 未登录且不在公开路由，重定向到登录页
      const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))
      if (!isPublicRoute) {
        toast.error('请先登录')
        router.push('/login')
      }
    }
  }, [user, loading, pathname, router])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || '登录失败')
        return false
      }

      // 保存用户信息
      setUser(data.user)
      localStorage.setItem('currentUser', JSON.stringify(data.user))

      toast.success('登录成功')
      return true
    } catch (error: any) {
      console.error('登录失败:', error)
      toast.error(error.message || '登录失败')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
    toast.success('已退出登录')
    router.push('/login')
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

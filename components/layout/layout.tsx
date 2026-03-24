'use client'

import { useState, ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, BookOpen, Home, FolderOpen, User, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MobileNav, MobileBottomNav } from './mobile-nav'
import { useAuth } from '@/lib/auth/auth-context'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeNav, setActiveNav] = useState('home')
  const [isMobile, setIsMobile] = useState(false)
  const [stats, setStats] = useState({ totalDocs: 0, parsedDocs: 0, notesCount: 0 })

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // 加载统计数据
  useEffect(() => {
    const loadStats = () => {
      try {
        // 获取所有文档（使用 uploadedDocuments）
        const documents = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]')

        // 获取所有笔记
        const savedNotesStr = localStorage.getItem('userNotes')
        let notesCount = 0

        if (savedNotesStr) {
          const allNotes = JSON.parse(savedNotesStr)
          // 兼容对象格式和数组格式
          if (Array.isArray(allNotes)) {
            notesCount = allNotes.length
          } else if (typeof allNotes === 'object') {
            notesCount = Object.values(allNotes).reduce((sum: number, notes: any) => sum + notes.length, 0)
          }
        }

        // 计算已解析文档数（有内容的文档）
        const parsedDocs = documents.filter((doc: any) => doc.content && doc.content.length > 0).length

        setStats({
          totalDocs: documents.length,
          parsedDocs,
          notesCount
        })
      } catch (error) {
        console.error('加载统计数据失败:', error)
      }
    }

    loadStats()

    // 监听存储变化以实时更新统计
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'uploadedDocuments' || e.key === 'userNotes') {
        loadStats()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const navItems = [
    { id: 'home', label: '首页', icon: Home, path: '/' },
    { id: 'documents', label: '我的文档', icon: BookOpen, path: '/documents' },
    { id: 'reading', label: '文档阅读', icon: BookOpen, path: '/documents' },
    { id: 'compare', label: '文档对比', icon: BookOpen, path: '/compare' },
    { id: 'cases', label: '案例库', icon: FolderOpen, path: '/cases' },
    { id: 'profile', label: '个人中心', icon: User, path: '/profile' },
    { id: 'settings', label: '设置', icon: Settings, path: '/settings' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* 移动端导航 */}
      {isMobile && <MobileNav />}
      
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* 桌面端侧边栏切换按钮 */}
              {!isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
              <div className="ml-4 flex items-center">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    AI 伴读助手
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    智能文档阅读与分析平台
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* 搜索框 */}
              <div className="relative">
                <input
                  type="search"
                  placeholder="搜索文档或案例..."
                  className="w-48 md:w-64 px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* 用户菜单 */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-medium">A</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || '用户'}</p>
                    <p className="text-xs text-gray-500">普通用户</p>
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    onClick={() => router.push('/profile')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <User className="h-4 w-4 mr-2" />
                    个人资料
                  </button>
                  <button
                    onClick={() => router.push('/settings')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    设置
                  </button>
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* 侧边栏（桌面端显示，移动端隐藏） */}
        {!isMobile && (
          <aside className={cn(
            "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-y-auto",
            sidebarOpen ? "w-64" : "w-0"
          )}>
          {sidebarOpen && (
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id)
                      router.push(item.path)
                    }}
                    className={cn(
                      "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                      activeNav === item.id
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}

              {/* 上传按钮 */}
              <button
                onClick={() => {
                  console.log('[Layout] 上传文档按钮被点击')
                  router.push('/documents#upload-section')
                }}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center relative z-10"
                style={{ pointerEvents: 'auto', position: 'relative' }}
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                上传文档
              </button>

              {/* 统计信息 */}
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">文档统计</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">总文档数</span>
                    <span className="font-medium">{stats.totalDocs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">已解析</span>
                    <span className="font-medium text-green-600">{stats.parsedDocs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">笔记数</span>
                    <span className="font-medium">{stats.notesCount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          </aside>
        )}

        {/* 主内容区 */}
        <main className={cn(
          "flex-1 overflow-y-auto touch-scroll",
          !isMobile ? "p-4 md:p-6" : "p-3 pb-20" // 移动端添加底部内边距
        )}>
          {children}
        </main>
      </div>

      {/* 移动端底部导航 */}
      {isMobile && <MobileBottomNav />}

      {/* 底部 */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>© 2024 AI 伴读助手. 保留所有权利.</p>
              <p className="mt-1">基于 Next.js + Supabase + DeepSeek API 构建</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">使用条款</a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">隐私政策</a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">帮助中心</a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">联系我们</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
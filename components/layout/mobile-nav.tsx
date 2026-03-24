'use client'

import { useState } from 'react'
import { Menu, X, Home, BookOpen, Folder, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/documents', label: '我的文档', icon: BookOpen },
    { href: '/cases', label: '案例库', icon: Folder },
    { href: '/login', label: '登录', icon: User },
  ]

  return (
    <>
      {/* 移动端汉堡菜单按钮 */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg touch-optimized"
        onClick={() => setIsOpen(true)}
        aria-label="打开菜单"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* 移动端侧边栏遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 移动端侧边栏 */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 z-50 transition-transform duration-300 lg:hidden shadow-xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">AI阅读助手</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 touch-optimized"
            aria-label="关闭菜单"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-colors touch-optimized',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* 移动端底部信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            适配移动端，支持阅读、划线、笔记功能
          </p>
        </div>
      </div>
    </>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/documents', label: '文档', icon: BookOpen },
    { href: '/cases', label: '案例', icon: Folder },
    { href: '/login', label: '我的', icon: User },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-700 z-40 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 touch-optimized mobile-tap-target',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
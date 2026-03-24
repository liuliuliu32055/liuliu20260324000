'use client'

import { useState, useEffect } from 'react'
import { FileText, MoreVertical, Eye, Download, Trash2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface DocumentCardProps {
  id: string
  title: string
  description: string
  type: string
  size: string
  status: '已解析' | '解析中' | '待解析'
  date: string
  progress: number
  onDelete?: (id: string) => void
  onView?: (id: string) => void
}

export function DocumentCard({
  id,
  title,
  description,
  type,
  size,
  status,
  date,
  progress,
  onDelete,
  onView
}: DocumentCardProps) {
  const [showActions, setShowActions] = useState(false)

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.actions-menu')) {
        setShowActions(false)
      }
    }

    if (showActions) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showActions])

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()

    // 检查是否为默认文档（ID 为 1-5）
    const isDefaultDoc = ['1', '2', '3', '4', '5'].includes(id)

    if (isDefaultDoc) {
      toast.error('默认文档不能删除')
      setShowActions(false)
      return
    }

    if (confirm(`确定要删除文档"${title}"吗？`)) {
      try {
        // 从 localStorage 删除文档
        const uploadedDocs = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]')
        const filteredDocs = uploadedDocs.filter((doc: any) => doc.id !== id)
        localStorage.setItem('uploadedDocuments', JSON.stringify(filteredDocs))

        // 删除文档相关的数据
        localStorage.removeItem(`doc-content-${id}`)
        localStorage.removeItem(`doc-data-${id}`)
        localStorage.removeItem(`doc-type-${id}`)
        localStorage.removeItem(`doc-text-${id}`)

        toast.success('文档已删除')
        setShowActions(false)

        // 调用删除回调
        if (onDelete) {
          onDelete(id)
        }
      } catch (error) {
        console.error('删除文档失败:', error)
        toast.error('删除文档失败')
      }
    }
  }

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onView) {
      onView(id)
    }
    setShowActions(false)
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    toast.success('下载功能开发中...')
    setShowActions(false)
  }

  const statusColors = {
    '已解析': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    '解析中': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    '待解析': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{type} • {size}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(!showActions)
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
          {showActions && (
            <div className="actions-menu absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              <button
                onClick={handleView}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                查看
              </button>
              <button
                onClick={handleDownload}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                下载
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
        {description}
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">上传时间</span>
          <span className="font-medium">{formatDate(date, { month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">状态</span>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            statusColors[status]
          )}>
            {status}
          </span>
        </div>

        {progress > 0 && progress < 100 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">解析进度</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
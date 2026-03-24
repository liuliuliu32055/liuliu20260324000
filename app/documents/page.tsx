'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UploadPDF } from '@/components/document/upload-pdf'
import { DocumentCard } from '@/components/document/document-card'
import { FileText, Search, Filter, Plus, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function DocumentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const statusFilters = [
    { id: 'all', label: '全部' },
    { id: 'completed', label: '已解析' },
    { id: 'parsing', label: '解析中' },
    { id: 'pending', label: '待解析' }
  ]

  useEffect(() => {
    fetchDocuments()
    
    // 检查 URL 中的 hash 是否为 upload-section
    const hash = window.location.hash
    if (hash === '#upload-section') {
      // 等待页面渲染完成后滚动
      setTimeout(() => {
        const uploadSection = document.getElementById('upload-section')
        if (uploadSection) {
          uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)

      // 从 localStorage 获取用户上传的文档
      const uploadedDocs = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]')

      // 模拟的默认文档
      const mockDocuments = [
        {
          id: '1',
          title: '人工智能发展白皮书',
          description: '2024年人工智能行业发展趋势分析',
          type: 'PDF',
          size: '2.4 MB',
          status: '已解析' as const,
          date: '2024-03-20',
          progress: 100
        },
        {
          id: '2',
          title: 'React 18 新特性详解',
          description: 'React 18 最新版本功能和使用指南',
          type: 'PDF',
          size: '1.8 MB',
          status: '解析中' as const,
          date: '2024-03-19',
          progress: 75
        },
        {
          id: '3',
          title: '项目管理最佳实践',
          description: '现代项目管理方法论和工具使用',
          type: 'PDF',
          size: '3.2 MB',
          status: '待解析' as const,
          date: '2024-03-18',
          progress: 0
        },
        {
          id: '4',
          title: '深度学习入门指南',
          description: '从零开始学习深度学习的完整教程',
          type: 'PDF',
          size: '4.1 MB',
          status: '已解析' as const,
          date: '2024-03-17',
          progress: 100
        },
        {
          id: '5',
          title: 'Python 数据处理实战',
          description: '使用 Python 进行数据清洗和分析的实用技巧',
          type: 'PDF',
          size: '2.9 MB',
          status: '已解析' as const,
          date: '2024-03-16',
          progress: 100
        }
      ]

      // 合并用户上传的文档和默认文档
      const allDocuments = [...uploadedDocs, ...mockDocuments]

      // 模拟延迟
      setTimeout(() => {
        setDocuments(allDocuments)
        setLoading(false)
      }, 500)

    } catch (error) {
      console.error('获取文档列表失败:', error)
      toast.error('获取文档列表失败')
      setLoading(false)
    }
  }

  const handleDocumentClick = (documentId: string) => {
    router.push(`/reading/${documentId}`)
  }

  const filteredDocuments = documents.filter(doc => {
    // 搜索过滤
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // 状态过滤
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleUploadSuccess = () => {
    // 重新获取文档列表
    fetchDocuments()
    toast.success('文档上传成功')
  }

  const handleDocumentDelete = (documentId: string) => {
    // 重新获取文档列表
    fetchDocuments()
  }

  const handleScrollToUpload = () => {
    const uploadSection = document.getElementById('upload-section')
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const statusCounts = {
    all: documents.length,
    completed: documents.filter(d => d.status === '已解析').length,
    parsing: documents.filter(d => d.status === '解析中').length,
    pending: documents.filter(d => d.status === '待解析').length
  }

  return (
    <div className="space-y-8">
      {/* 顶部标题和统计 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              我的文档
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              管理您的文档，开启智能阅读之旅
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg transition-colors",
                  statusFilter === filter.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <span className="text-lg font-bold">{statusCounts[filter.id as keyof typeof statusCounts]}</span>
                <span className="text-xs">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="search"
                placeholder="搜索文档标题或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 过滤按钮 */}
          <div className="flex gap-3">
            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <Filter className="h-5 w-5" />
              <span>筛选</span>
            </button>
            <button
              onClick={handleScrollToUpload}
              className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90"
            >
              <Plus className="h-5 w-5" />
              <span>上传文档</span>
            </button>
          </div>
        </div>

        {/* 标签过滤 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm transition-colors",
              statusFilter === 'all'
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            全部 ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm transition-colors",
              statusFilter === 'completed'
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            已解析 ({statusCounts.completed})
          </button>
          <button
            onClick={() => setStatusFilter('parsing')}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm transition-colors",
              statusFilter === 'parsing'
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            解析中 ({statusCounts.parsing})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm transition-colors",
              statusFilter === 'pending'
                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            待解析 ({statusCounts.pending})
          </button>
        </div>
      </div>

      {/* 文档列表 */}
      <div className="space-y-6">
        {loading ? (
          // 加载状态
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">
                加载文档中...
              </span>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          // 空状态
          <div className="text-center py-12">
            <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
              <FolderOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              暂无文档
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? '没有找到匹配的文档，请尝试其他搜索条件'
                : '还没有上传任何文档，立即上传开始智能阅读'}
            </p>
            <div className="mt-6">
              <UploadPDF />
            </div>
          </div>
        ) : (
          // 文档网格
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleDocumentClick(doc.id)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <DocumentCard
                  {...doc}
                  id={doc.id}
                  onDelete={handleDocumentDelete}
                  onView={handleDocumentClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 上传面板 */}
      <div id="upload-section" className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          上传新文档
        </h2>
        <UploadPDF />
      </div>
    </div>
  )
}
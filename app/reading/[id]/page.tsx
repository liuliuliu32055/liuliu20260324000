'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DocumentReader } from '@/components/document/document-reader'
import { NotePanel } from '@/components/note/note-panel'
import { MindMap } from '@/components/mindmap/mindmap'
import { Tabs } from '@/components/ui/tabs'
import { Loader2, FileText, MessageSquare, Brain, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface DocumentInfo {
  id: string
  title: string
  description: string
  pageCount: number
  uploadedAt: string
  parsedAt: string
}

export default function ReadingPage() {
  const router = useRouter()
  const params = useParams()
  const documentId = params.id as string
  const [activeTab, setActiveTab] = useState<'document' | 'notes' | 'mindmap'>('document')
  const [loading, setLoading] = useState(true)
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null)
  const [documentContent, setDocumentContent] = useState<string>('')

  useEffect(() => {
    loadDocument()
  }, [documentId])

  const loadDocument = () => {
    try {
      // 从 localStorage 获取所有文档
      const allDocs = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]')

      // 查找当前文档
      const currentDoc = allDocs.find((doc: any) => doc.id === documentId)

      if (currentDoc) {
        // 找到了用户上传的文档
        setDocumentInfo({
          id: currentDoc.id,
          title: currentDoc.title,
          description: currentDoc.description,
          pageCount: Math.floor(Math.random() * 50) + 10, // 随机生成页数
          uploadedAt: currentDoc.date,
          parsedAt: new Date().toLocaleString('zh-CN')
        })

        // 获取文档内容
        const docContent = localStorage.getItem(`doc-text-${documentId}`) || ''
        setDocumentContent(docContent)
      } else {
        // 默认文档（从 URL ID 判断）
        const defaultDocs: Record<string, DocumentInfo> = {
          '1': {
            id: '1',
            title: '人工智能发展白皮书',
            description: '2024年人工智能行业发展趋势分析',
            pageCount: 48,
            uploadedAt: '2024-03-20',
            parsedAt: '2024-03-20 14:30'
          },
          '2': {
            id: '2',
            title: 'React 18 新特性详解',
            description: 'React 18 最新版本功能和使用指南',
            pageCount: 32,
            uploadedAt: '2024-03-19',
            parsedAt: '2024-03-19 16:45'
          },
          '3': {
            id: '3',
            title: '项目管理最佳实践',
            description: '现代项目管理方法论和工具使用',
            pageCount: 56,
            uploadedAt: '2024-03-18',
            parsedAt: '2024-03-18 11:20'
          },
          '4': {
            id: '4',
            title: '深度学习入门指南',
            description: '从零开始学习深度学习的完整教程',
            pageCount: 72,
            uploadedAt: '2024-03-17',
            parsedAt: '2024-03-17 09:30'
          },
          '5': {
            id: '5',
            title: 'Python 数据处理实战',
            description: '使用 Python 进行数据清洗和分析的实用技巧',
            pageCount: 45,
            uploadedAt: '2024-03-16',
            parsedAt: '2024-03-16 15:00'
          }
        }

        const docInfo = defaultDocs[documentId]
        if (docInfo) {
          setDocumentInfo(docInfo)
        } else {
          toast.error('文档不存在')
          router.push('/documents')
          return
        }
      }
    } catch (error) {
      console.error('加载文档失败:', error)
      toast.error('加载文档失败')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'document', label: '文档阅读', icon: FileText },
    { id: 'notes', label: '我的笔记', icon: MessageSquare },
    { id: 'mindmap', label: '思维导图', icon: Brain }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">正在加载文档...</p>
        </div>
      </div>
    )
  }

  if (!documentInfo) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">文档不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 文档标题区域 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {documentInfo.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {documentInfo.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">页数:</span>
            <span className="font-medium">{documentInfo.pageCount} 页</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">上传时间:</span>
            <span className="font-medium">{documentInfo.uploadedAt}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">解析完成:</span>
            <span className="font-medium">{documentInfo.parsedAt}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">状态:</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
              已解析
            </span>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="border-b border-gray-200 dark:border-gray-700"
        />
        
        <div className="p-6">
          {activeTab === 'document' && (
            <DocumentReader documentId={documentId} />
          )}
          
          {activeTab === 'notes' && (
            <NotePanel documentId={documentId} />
          )}
          
          {activeTab === 'mindmap' && (
            <MindMap 
              documentId={documentId} 
              documentTitle={documentInfo.title}
              documentContent={documentContent}
            />
          )}
        </div>
      </div>
    </div>
  )
}
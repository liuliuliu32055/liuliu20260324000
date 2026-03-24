'use client'
import { useRouter } from 'next/navigation'
import { UploadPDF } from '@/components/document/upload-pdf'
import { DocumentCard } from '@/components/document/document-card'
import { FeatureCard } from '@/components/ui/feature-card'
import { ModeSelector, useAppMode } from '@/components/mode/mode-selector'
import { BookOpen, Zap, MessageSquare, Brain, FileText, Users, ArrowRight, GraduationCap, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const router = useRouter()
  const { mode, isStudent, isProfessional } = useAppMode()
  const features = [
    {
      icon: Zap,
      title: 'AI 智能伴读',
      description: isStudent
        ? '逐段精读，深度解析知识点，自动生成结构化笔记'
        : '快速提炼核心要点，提供行动建议，提升工作效率'
    },
    {
      icon: MessageSquare,
      title: '实时问答',
      description: isStudent
        ? '针对学习内容深度问答，帮助理解难点'
        : '快速获取关键信息，支持决策制定'
    },
    {
      icon: Brain,
      title: '思维导图',
      description: isStudent
        ? '构建知识体系，建立概念间的联系'
        : '结构化输出，理清工作思路'
    },
    {
      icon: FileText,
      title: '多格式支持',
      description: '支持 PDF、Word、TXT 等多种文档格式'
    },
    {
      icon: Users,
      title: '案例库',
      description: isStudent
        ? '丰富的学习案例和参考材料'
        : '行业案例分析，实践经验参考'
    },
    {
      icon: BookOpen,
      title: isStudent ? '错题本' : '文档对比',
      description: isStudent
        ? '记录错误题目，高效复习巩固'
        : '对比多个文档，发现差异和趋势'
    }
  ]

  const recentDocuments = [
    {
      id: '1',
      title: '人工智能发展白皮书',
      description: '2024年人工智能行业发展趋势分析',
      type: 'PDF',
      size: '2.4 MB',
      status: '已解析',
      date: '2024-03-20',
      progress: 100
    },
    {
      id: '2',
      title: 'React 18 新特性详解',
      description: 'React 18 最新版本功能和使用指南',
      type: 'PDF',
      size: '1.8 MB',
      status: '解析中',
      date: '2024-03-19',
      progress: 75
    },
    {
      id: '3',
      title: '项目管理最佳实践',
      description: '现代项目管理方法论和工具使用',
      type: 'PDF',
      size: '3.2 MB',
      status: '待解析',
      date: '2024-03-18',
      progress: 0
    }
  ]

  return (
    <div className="space-y-8">
      {/* 模式选择区域 */}
      <ModeSelector />

      {/* 英雄区域 */}
      <div className={cn(
        "rounded-2xl p-8 md:p-12 text-white",
        isStudent
          ? "bg-gradient-to-r from-blue-500 to-cyan-500"
          : "bg-gradient-to-r from-purple-500 to-pink-500"
      )}>
        <div className="max-w-3xl">
          <div className="flex items-center space-x-3 mb-4">
            {isStudent ? <GraduationCap className="h-8 w-8" /> : <Briefcase className="h-8 w-8" />}
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {isStudent ? '学生模式' : '职场模式'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isStudent
              ? '智能学习助手'
              : '高效工作伙伴'}
          </h1>
          <p className="text-xl mb-8 opacity-90">
            {isStudent
              ? '基于 DeepSeek AI 的智能学习系统，逐段精读，深度理解，让学习更高效'
              : '基于 DeepSeek AI 的智能工作助手，快速提取信息，支持决策，让工作更高效'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/documents')}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              {isStudent ? '开始学习' : '开始工作'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={() => router.push(isStudent ? '/cases' : '/compare')}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center justify-center"
            >
              {isStudent ? '查看案例' : '文档对比'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 上传区域 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">上传文档开始分析</h2>
        <UploadPDF />
      </div>

      {/* 功能特性 */}
      <div>
        <h2 className="text-2xl font-bold mb-6">核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* 最近文档 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">最近文档</h2>
          <button
            onClick={() => router.push('/documents')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            查看全部 →
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {recentDocuments.map((doc) => (
  <div
    key={doc.id}
    onClick={() => router.push(`/reading/${doc.id}`)}
    className="cursor-pointer hover:shadow-lg transition-shadow"
  >
    <DocumentCard key={doc.id} {...doc} />
  </div>
))}
        </div>
      </div>

      {/* 使用统计 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6">使用统计</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">12</div>
            <div className="text-gray-600 dark:text-gray-400">总文档数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">24</div>
            <div className="text-gray-600 dark:text-gray-400">笔记数量</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">156</div>
            <div className="text-gray-600 dark:text-gray-400">AI 问答次数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">8.2h</div>
            <div className="text-gray-600 dark:text-gray-400">累计阅读时长</div>
          </div>
        </div>
      </div>
    </div>
  )
}
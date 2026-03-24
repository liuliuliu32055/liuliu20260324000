'use client'

import { useState, useCallback, useEffect } from 'react'
import { MessageCircle, BookMarked, Lightbulb, Copy, Download, ChevronDown, ChevronRight, Loader2, FileText, Target, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useAppMode } from '@/components/mode/mode-selector'

interface AIReadingAssistantProps {
  documentId: string
  documentTitle?: string
  documentContent?: string
  selectedText?: string
  selectedParagraphId?: string
}

interface StructuredNote {
  id: string
  type: 'concept' | 'keyPoint' | 'example' | 'question' | 'action'
  title: string
  content: string
  tags?: string[]
  related?: string[]
}

interface ParagraphAnalysis {
  paragraphId: string
  text: string
  explanation: string
  keyPoints: string[]
  examples?: string[]
  questions?: string[]
  actionItems?: string[]
}

export function AIReadingAssistant({
  documentId,
  documentTitle,
  documentContent,
  selectedText,
  selectedParagraphId
}: AIReadingAssistantProps) {
  const { mode, isStudent, isProfessional } = useAppMode()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<ParagraphAnalysis | null>(null)
  const [structuredNotes, setStructuredNotes] = useState<StructuredNote[]>([])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['explanation']))
  const [readingProgress, setReadingProgress] = useState({
    total: 0,
    analyzed: 0,
    notes: 0,
    timeSpent: 0
  })

  // 读取已保存的进度和笔记
  useEffect(() => {
    loadReadingProgress()
  }, [documentId])

  const loadReadingProgress = () => {
    try {
      const progressData = localStorage.getItem(`reading-progress-${documentId}`)
      if (progressData) {
        setReadingProgress(JSON.parse(progressData))
      }

      const notesData = localStorage.getItem(`structured-notes-${documentId}`)
      if (notesData) {
        setStructuredNotes(JSON.parse(notesData))
      }
    } catch (error) {
      console.error('加载阅读进度失败:', error)
    }
  }

  // 当用户选择文本时，自动进行分析
  useEffect(() => {
    if (selectedText && selectedParagraphId) {
      analyzeParagraph(selectedText, selectedParagraphId)
    }
  }, [selectedText, selectedParagraphId])

  const analyzeParagraph = async (text: string, paragraphId: string) => {
    console.log('[AIReadingAssistant] 开始分析段落:', paragraphId)
    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/ai/reading-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          mode,
          context: documentContent?.substring(0, 500)
        })
      })

      const result = await response.json()

      if (result.success) {
        const analysis: ParagraphAnalysis = {
          paragraphId,
          text,
          explanation: result.data.explanation,
          keyPoints: result.data.keyPoints || [],
          examples: result.data.examples || [],
          questions: isStudent ? result.data.questions || [] : undefined,
          actionItems: isProfessional ? result.data.actionItems || [] : undefined
        }

        setCurrentAnalysis(analysis)

        // 自动保存为结构化笔记
        const newNote: StructuredNote = {
          id: `note-${Date.now()}`,
          type: isStudent ? 'concept' : 'keyPoint',
          title: text.substring(0, 50) + '...',
          content: result.data.explanation,
          tags: mode === 'student' ? ['学习笔记', '核心概念'] : ['工作笔记', '关键要点']
        }

        const updatedNotes = [...structuredNotes, newNote]
        setStructuredNotes(updatedNotes)
        saveNotes(updatedNotes)

        // 更新进度
        const newProgress = {
          ...readingProgress,
          analyzed: readingProgress.analyzed + 1,
          notes: readingProgress.notes + 1
        }
        setReadingProgress(newProgress)
        saveProgress(newProgress)

        toast.success('段落分析完成')
      }
    } catch (error) {
      console.error('AI 分析失败:', error)
      toast.error('AI 分析失败，请重试')

      // 使用模拟数据
      const mockAnalysis: ParagraphAnalysis = {
        paragraphId,
        text,
        explanation: `这是对"${text.substring(0, 30)}..."的${isStudent ? '深度解析' : '核心要点提炼'}。${isStudent ? '这段内容涉及重要概念，需要重点理解。' : '这段内容提供了关键信息，可以帮助您做出决策。'}`,
        keyPoints: [
          isStudent ? '核心概念一' : '关键要点一',
          isStudent ? '核心概念二' : '关键要点二',
          isStudent ? '核心概念三' : '关键要点三'
        ],
        examples: isStudent ? ['示例说明一', '示例说明二'] : undefined,
        questions: isStudent ? ['思考问题一', '思考问题二'] : undefined,
        actionItems: isProfessional ? ['行动建议一', '行动建议二'] : undefined
      }
      setCurrentAnalysis(mockAnalysis)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveNotes = (notes: StructuredNote[]) => {
    localStorage.setItem(`structured-notes-${documentId}`, JSON.stringify(notes))
  }

  const saveProgress = (progress: typeof readingProgress) => {
    localStorage.setItem(`reading-progress-${documentId}`, JSON.stringify(progress))
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const exportNotes = () => {
    if (structuredNotes.length === 0) {
      toast.error('没有可导出的笔记')
      return
    }

    const markdown = generateMarkdownExport()
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${documentTitle || '文档'}-结构化笔记.md`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('笔记导出成功')
  }

  const generateMarkdownExport = (): string => {
    let markdown = `# ${documentTitle || '文档结构化笔记'}\n\n`
    markdown += `> 模式: ${isStudent ? '学生模式' : '职场模式'}\n\n`
    markdown += `生成时间: ${new Date().toLocaleString()}\n\n`
    markdown += `---\n\n`

    if (currentAnalysis) {
      markdown += `## 当前段落分析\n\n`
      markdown += `### 原文\n\n${currentAnalysis.text}\n\n`
      markdown += `### 深度解析\n\n${currentAnalysis.explanation}\n\n`
      markdown += `### 关键要点\n\n`
      currentAnalysis.keyPoints.forEach((point, index) => {
        markdown += `${index + 1}. ${point}\n`
      })
      markdown += '\n'

      if (currentAnalysis.examples && currentAnalysis.examples.length > 0) {
        markdown += `### 举例说明\n\n`
        currentAnalysis.examples.forEach((example, index) => {
          markdown += `${index + 1}. ${example}\n`
        })
        markdown += '\n'
      }

      if (currentAnalysis.questions && currentAnalysis.questions.length > 0) {
        markdown += `### 思考问题\n\n`
        currentAnalysis.questions.forEach((question, index) => {
          markdown += `${index + 1}. ${question}\n`
        })
        markdown += '\n'
      }

      if (currentAnalysis.actionItems && currentAnalysis.actionItems.length > 0) {
        markdown += `### 行动建议\n\n`
        currentAnalysis.actionItems.forEach((action, index) => {
          markdown += `${index + 1}. ${action}\n`
        })
        markdown += '\n'
      }
    }

    markdown += `---\n\n## 所有笔记 (${structuredNotes.length})\n\n`

    structuredNotes.forEach((note, index) => {
      markdown += `### ${index + 1}. ${note.title}\n\n`
      markdown += `${note.content}\n\n`
      if (note.tags && note.tags.length > 0) {
        markdown += `**标签**: ${note.tags.join(', ')}\n\n`
      }
      markdown += `---\n\n`
    })

    return markdown
  }

  return (
    <div className="space-y-4">
      {/* 阅读进度卡片 */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">阅读进度</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                已分析 {readingProgress.analyzed} 段，保存 {readingProgress.notes} 条笔记
              </p>
            </div>
          </div>
          <button
            onClick={exportNotes}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            <span>导出笔记</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {readingProgress.analyzed}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">已分析段落</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {readingProgress.notes}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">笔记数量</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round((readingProgress.analyzed / Math.max(1, readingProgress.total)) * 100)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">完成度</div>
          </div>
        </div>
      </div>

      {/* AI 分析结果 */}
      {isAnalyzing ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {isStudent ? '正在深度分析...' : '正在提炼要点...'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI 正在{isStudent ? '逐段精读，生成结构化笔记' : '快速提取关键信息'}
              </p>
            </div>
          </div>
        </div>
      ) : currentAnalysis ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* 头部 */}
          <div className={cn(
            "p-4 border-b border-gray-200 dark:border-gray-700",
            isStudent ? "bg-blue-50 dark:bg-blue-900/20" : "bg-purple-50 dark:bg-purple-900/20"
          )}>
            <div className="flex items-center space-x-3">
              <div className={cn(
                "p-2 rounded-lg",
                isStudent
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                  : "bg-gradient-to-r from-purple-500 to-pink-500"
              )}>
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {isStudent ? '逐段精读' : '要点提炼'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {isStudent ? '深度理解，构建知识体系' : '快速获取，支持决策'}
                </p>
              </div>
              <button
                onClick={() => {
                  const note: StructuredNote = {
                    id: `note-${Date.now()}`,
                    type: isStudent ? 'concept' : 'keyPoint',
                    title: currentAnalysis.text.substring(0, 50) + '...',
                    content: currentAnalysis.explanation,
                    tags: isStudent ? ['学习笔记'] : ['工作笔记']
                  }
                  const updatedNotes = [...structuredNotes, note]
                  setStructuredNotes(updatedNotes)
                  saveNotes(updatedNotes)
                  toast.success('已保存到笔记')
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>保存</span>
              </button>
            </div>
          </div>

          {/* 可折叠内容 */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* 原文 */}
            <div>
              <button
                onClick={() => toggleSection('original')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>原文</span>
                </span>
                {expandedSections.has('original') ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.has('original') && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentAnalysis.text}
                  </p>
                </div>
              )}
            </div>

            {/* 深度解析 */}
            <div>
              <button
                onClick={() => toggleSection('explanation')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>{isStudent ? '深度解析' : '核心要点'}</span>
                </span>
                {expandedSections.has('explanation') ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.has('explanation') && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentAnalysis.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* 关键要点 */}
            <div>
              <button
                onClick={() => toggleSection('keyPoints')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>{isStudent ? '关键要点' : '核心信息'}</span>
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                    {currentAnalysis.keyPoints.length}
                  </span>
                </span>
                {expandedSections.has('keyPoints') ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {expandedSections.has('keyPoints') && (
                <div className="px-4 pb-4">
                  <ul className="space-y-2">
                    {currentAnalysis.keyPoints.map((point, index) => (
                      <li
                        key={index}
                        className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium mt-0.5">
                          {index + 1}
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 举例说明（学生模式） */}
            {isStudent && currentAnalysis.examples && currentAnalysis.examples.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('examples')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                    <BookMarked className="h-4 w-4" />
                    <span>举例说明</span>
                    <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">
                      {currentAnalysis.examples.length}
                    </span>
                  </span>
                  {expandedSections.has('examples') ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.has('examples') && (
                  <div className="px-4 pb-4">
                    <ul className="space-y-2">
                      {currentAnalysis.examples.map((example, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-green-500"
                        >
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 思考问题（学生模式） */}
            {isStudent && currentAnalysis.questions && currentAnalysis.questions.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('questions')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>思考问题</span>
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs rounded-full">
                      {currentAnalysis.questions.length}
                    </span>
                  </span>
                  {expandedSections.has('questions') ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.has('questions') && (
                  <div className="px-4 pb-4">
                    <ul className="space-y-2">
                      {currentAnalysis.questions.map((question, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-700 dark:text-gray-300 pl-4 border-l-2 border-yellow-500"
                        >
                          <span className="font-medium">Q{index + 1}:</span> {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 行动建议（职场模式） */}
            {isProfessional && currentAnalysis.actionItems && currentAnalysis.actionItems.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('actions')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span>行动建议</span>
                    <span className="ml-2 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                      {currentAnalysis.actionItems.length}
                    </span>
                  </span>
                  {expandedSections.has('actions') ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {expandedSections.has('actions') && (
                  <div className="px-4 pb-4">
                    <ul className="space-y-2">
                      {currentAnalysis.actionItems.map((action, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex space-x-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generateMarkdownExport())
                toast.success('已复制到剪贴板')
              }}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <Copy className="h-4 w-4" />
              <span>复制</span>
            </button>
            <button
              onClick={exportNotes}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              <span>导出笔记</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {isStudent ? '选择文本开始逐段精读' : '选择文本开始要点提炼'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            AI 将{isStudent ? '深度解析并生成结构化学习笔记' : '快速提取关键信息并给出行动建议'}
          </p>
        </div>
      )}
    </div>
  )
}

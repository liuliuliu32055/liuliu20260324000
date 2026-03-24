'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, FileText, Plus, X, GitCompare, TrendingUp, TrendingDown, Minus, Download, RefreshCw, Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Document {
  id: string
  title: string
  type: string
  size: string
  content?: string
  uploadedAt?: string
}

interface ComparisonResult {
  summary: {
    similarity: number
    uniqueToFirst: number
    uniqueToSecond: number
    commonPoints: number
  }
  differences: Array<{
    type: 'addition' | 'deletion' | 'modification'
    text: string
    position: string
  }>
  similarPoints: string[]
  trends: {
    direction: 'up' | 'down' | 'stable'
    description: string
  }[]
}

interface DocumentCompareProps {
  className?: string
}

export function DocumentCompare({ className }: DocumentCompareProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocs, setSelectedDocs] = useState<[Document | null, Document | null]>([null, null])
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'txt' | 'docx'>('all')

  // 加载文档列表
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = () => {
    try {
      const savedDocs = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]')
      const docs = savedDocs.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        type: doc.type || 'PDF',
        size: doc.size || '未知',
        uploadedAt: doc.uploadedAt || new Date().toISOString()
      }))

      // 获取每个文档的内容
      const docsWithContent = docs.map((doc: Document) => ({
        ...doc,
        content: localStorage.getItem(`doc-text-${doc.id}`) || ''
      }))

      setDocuments(docsWithContent)
    } catch (error) {
      console.error('加载文档失败:', error)
      toast.error('加载文档失败')
    }
  }

  const handleSelectDocument = (index: 0 | 1, document: Document) => {
    const newSelection = [...selectedDocs] as [Document | null, Document | null]
    newSelection[index] = document

    // 如果选择的是同一个文档，则清除另一个选择
    if (index === 0 && newSelection[1]?.id === document.id) {
      newSelection[1] = null
    } else if (index === 1 && newSelection[0]?.id === document.id) {
      newSelection[0] = null
    }

    setSelectedDocs(newSelection)
    setComparisonResult(null) // 重新选择后清除之前的对比结果
  }

  const handleClearSelection = (index: 0 | 1) => {
    const newSelection = [...selectedDocs] as [Document | null, Document | null]
    newSelection[index] = null
    setSelectedDocs(newSelection)
    setComparisonResult(null)
  }

  const handleCompare = async () => {
    if (!selectedDocs[0] || !selectedDocs[1]) {
      toast.error('请先选择两个文档')
      return
    }

    setIsComparing(true)

    try {
      const response = await fetch('/api/ai/compare-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document1: selectedDocs[0],
          document2: selectedDocs[1]
        })
      })

      const result = await response.json()

      if (result.success) {
        setComparisonResult(result.data)
        toast.success('文档对比完成')
      } else {
        throw new Error(result.error || '对比失败')
      }
    } catch (error) {
      console.error('文档对比失败:', error)
      toast.error('文档对比失败，请重试')

      // 使用模拟数据
      const mockResult: ComparisonResult = {
        summary: {
          similarity: 68,
          uniqueToFirst: 15,
          uniqueToSecond: 12,
          commonPoints: 8
        },
        differences: [
          {
            type: 'addition',
            text: '新增的内容要点',
            position: '第3段'
          },
          {
            type: 'deletion',
            text: '删除的旧内容',
            position: '第5段'
          },
          {
            type: 'modification',
            text: '修改后的内容描述',
            position: '第7段'
          }
        ],
        similarPoints: [
          '共同的主题和背景',
          '相似的方法论',
          '一致的目标定位'
        ],
        trends: [
          {
            direction: 'up',
            description: '第二个文档在技术细节上更加详细'
          },
          {
            direction: 'down',
            description: '第一个文档的历史背景描述更丰富'
          },
          {
            direction: 'stable',
            description: '两者在核心观点上保持一致'
          }
        ]
      }
      setComparisonResult(mockResult)
    } finally {
      setIsComparing(false)
    }
  }

  const handleExportComparison = () => {
    if (!comparisonResult) return

    const [doc1, doc2] = selectedDocs

    let markdown = `# 文档对比报告\n\n`
    markdown += `对比时间: ${new Date().toLocaleString()}\n\n`
    markdown += `---\n\n`

    if (doc1 && doc2) {
      markdown += `## 文档信息\n\n`
      markdown += `**文档 A**: ${doc1.title} (${doc1.type})\n\n`
      markdown += `**文档 B**: ${doc2.title} (${doc2.type})\n\n`
      markdown += `---\n\n`
    }

    markdown += `## 对比摘要\n\n`
    markdown += `- 相似度: ${comparisonResult.summary.similarity}%\n`
    markdown += `- 文档 A 独有要点: ${comparisonResult.summary.uniqueToFirst} 个\n`
    markdown += `- 文档 B 独有要点: ${comparisonResult.summary.uniqueToSecond} 个\n`
    markdown += `- 共同要点: ${comparisonResult.summary.commonPoints} 个\n\n`
    markdown += `---\n\n`

    markdown += `## 差异详情\n\n`
    comparisonResult.differences.forEach((diff, index) => {
      const icon = diff.type === 'addition' ? '+' : diff.type === 'deletion' ? '-' : '~'
      markdown += `${index + 1}. ${icon} ${diff.text} (${diff.position})\n`
    })
    markdown += `\n`

    markdown += `---\n\n`
    markdown += `## 相似要点\n\n`
    comparisonResult.similarPoints.forEach((point, index) => {
      markdown += `${index + 1}. ${point}\n`
    })
    markdown += `\n`

    markdown += `---\n\n`
    markdown += `## 趋势分析\n\n`
    comparisonResult.trends.forEach((trend, index) => {
      const icon = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'
      markdown += `${index + 1}. ${icon} ${trend.description}\n`
    })
    markdown += `\n`

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `文档对比报告-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('对比报告已导出')
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || doc.type.toLowerCase().includes(filterType)
    return matchesSearch && matchesType
  })

  return (
    <div className={cn('space-y-6', className)}>
      {/* 对比卡片 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
              <GitCompare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">文档对比</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">对比两个文档，发现差异和相似点</p>
            </div>
          </div>

          {selectedDocs[0] && selectedDocs[1] && (
            <button
              onClick={handleCompare}
              disabled={isComparing}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isComparing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>对比中...</span>
                </>
              ) : (
                <>
                  <GitCompare className="h-4 w-4" />
                  <span>开始对比</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 文档选择区 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 文档列表 */}
          <div className="md:col-span-2 space-y-4">
            {/* 搜索和筛选 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="搜索文档..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              >
                <option value="all">全部类型</option>
                <option value="pdf">PDF</option>
                <option value="txt">TXT</option>
                <option value="docx">DOCX</option>
              </select>
            </div>

            {/* 文档列表 */}
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  没有找到文档
                </div>
              ) : (
                filteredDocuments.map((doc) => {
                  const isSelected1 = selectedDocs[0]?.id === doc.id
                  const isSelected2 = selectedDocs[1]?.id === doc.id

                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectDocument(isSelected1 ? 0 : 1, doc)}
                      className={cn(
                        "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                        (isSelected1 || isSelected2)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {doc.title}
                            </h4>
                            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <span>{doc.type}</span>
                              <span>•</span>
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>{new Date(doc.uploadedAt || '').toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {isSelected1 && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">文档 A</span>
                        )}
                        {isSelected2 && (
                          <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">文档 B</span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* 已选文档 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">A</span>
                <span>文档 A</span>
              </div>
              {selectedDocs[0] ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {selectedDocs[0].title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {selectedDocs[0].type} • {selectedDocs[0].size}
                      </p>
                    </div>
                    <button
                      onClick={() => handleClearSelection(0)}
                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    点击左侧选择文档
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">B</span>
                <span>文档 B</span>
              </div>
              {selectedDocs[1] ? (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {selectedDocs[1].title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {selectedDocs[1].type} • {selectedDocs[1].size}
                      </p>
                    </div>
                    <button
                      onClick={() => handleClearSelection(1)}
                      className="p-1 hover:bg-purple-100 dark:hover:bg-purple-800 rounded transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    点击左侧选择文档
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 对比结果 */}
      {comparisonResult && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">对比结果</h3>
            <button
              onClick={handleExportComparison}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              <span>导出报告</span>
            </button>
          </div>

          {/* 摘要统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {comparisonResult.summary.similarity}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">相似度</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 text-center border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {comparisonResult.summary.commonPoints}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">共同要点</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-4 text-center border border-orange-200 dark:border-orange-800">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {comparisonResult.summary.uniqueToFirst}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">文档 A 独有</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {comparisonResult.summary.uniqueToSecond}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">文档 B 独有</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 差异详情 */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">差异详情</h4>
              <div className="space-y-3">
                {comparisonResult.differences.map((diff, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg border-l-4",
                      diff.type === 'addition' && "bg-green-50 dark:bg-green-900/20 border-green-500",
                      diff.type === 'deletion' && "bg-red-50 dark:bg-red-900/20 border-red-500",
                      diff.type === 'modification' && "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                    )}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {diff.type === 'addition' && (
                        <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                      {diff.type === 'deletion' && (
                        <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                      {diff.type === 'modification' && (
                        <RefreshCw className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {diff.position}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white">{diff.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 相似要点 */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">相似要点</h4>
              <div className="space-y-2">
                {comparisonResult.similarPoints.map((point, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-900 dark:text-white">{point}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 趋势分析 */}
              <h4 className="font-semibold text-gray-900 dark:text-white mt-6 mb-4">趋势分析</h4>
              <div className="space-y-2">
                {comparisonResult.trends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    {trend.direction === 'up' && (
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    )}
                    {trend.direction === 'down' && (
                      <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    {trend.direction === 'stable' && (
                      <Minus className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-gray-900 dark:text-white">{trend.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <GitCompare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              使用提示
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• 选择两个文档后点击"开始对比"进行智能分析</li>
              <li>• AI 会分析文档内容的相似度、差异点和共同要点</li>
              <li>• 趋势分析帮助您理解文档之间的变化方向</li>
              <li>• 可以导出对比报告为 Markdown 格式</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

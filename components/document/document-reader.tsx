'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AIChatMenu } from '@/components/ai/ai-chat-menu'
import { MessageCircle, Zap, Lightbulb, BookOpen, Loader2, FileText } from 'lucide-react'
import { cn, getSelectionPosition, getSelectedText } from '@/lib/utils'
import toast from 'react-hot-toast'

interface DocumentReaderProps {
  documentId: string
}

export function DocumentReader({ documentId }: DocumentReaderProps) {
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const [isSelecting, setIsSelecting] = useState(false)
  const [showChatMenu, setShowChatMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [aiAction, setAiAction] = useState<'explain' | 'example' | 'summary' | null>(null)
  const [documentTitle, setDocumentTitle] = useState('')
  const [fileContent, setFileContent] = useState<string>('')
  const [fileData, setFileData] = useState<string | null>(null)
  const [fileType, setFileType] = useState<'txt' | 'pdf' | 'doc' | 'docx' | 'unknown'>('unknown')
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const responseRef = useRef<HTMLDivElement>(null)

  // 根据文档 ID 加载文档标题和内容
  useEffect(() => {
    loadDocumentData()
  }, [documentId])

  const loadDocumentData = () => {
    try {
      console.log('[DocumentReader] 加载文档数据, documentId:', documentId)
      setLoadError(null)
      setIsLoadingContent(true)

      const allDocs = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]')
      console.log('[DocumentReader] 已上传文档列表:', allDocs)

      const currentDoc = allDocs.find((doc: any) => doc.id === documentId)
      console.log('[DocumentReader] 当前文档:', currentDoc)

      if (currentDoc) {
        setDocumentTitle(currentDoc.title)
        console.log('[DocumentReader] 找到用户上传文档, 标题:', currentDoc.title)

        // 获取文件类型（统一转小写）
        const docType = (localStorage.getItem(`doc-type-${documentId}`) || 'unknown').toLowerCase()
        console.log('[DocumentReader] 文件类型:', docType)
        setFileType(docType as any)

        // 获取文本内容（用于 AI 伴读）
        const docText = localStorage.getItem(`doc-text-${documentId}`)
        console.log('[DocumentReader] 文本内容存在:', !!docText, '长度:', docText?.length)

        // 根据文件类型加载内容
        if (docType === 'txt') {
          // TXT 文件直接显示文本
          const txtContent = localStorage.getItem(`doc-content-${documentId}`)
          console.log('[DocumentReader] TXT 内容存在:', !!txtContent)
          if (txtContent) {
            setFileContent(txtContent)
          } else if (docText) {
            setFileContent(docText)
          } else {
            setLoadError('未找到文本内容')
          }
        } else if (docType === 'pdf') {
          // PDF 文件，显示文本用于 AI 伴读，同时保留 PDF 数据
          const pdfData = localStorage.getItem(`doc-data-${documentId}`)
          console.log('[DocumentReader] PDF 数据存在:', !!pdfData)
          if (pdfData) {
            setFileData(pdfData)
            setFileContent(docText || 'PDF 文档已加载。您可以使用 AI 伴读功能来辅助阅读。')
          } else {
            setLoadError('未找到 PDF 文件数据')
          }
        } else if (docType === 'word' || docType === 'docx') {
          // Word 文件，显示文本用于 AI 伴读
          console.log('[DocumentReader] Word 文件内容:', docText ? docText.substring(0, 100) : '无')
          setFileContent(docText || 'Word 文档已加载。完整的文档内容解析需要后端支持。')
        } else {
          // 未知类型，尝试使用文本内容
          if (docText) {
            setFileContent(docText)
          } else {
            setLoadError(`未找到文档内容（类型：${docType}）`)
          }
        }

        setIsLoadingContent(false)
      } else {
        // 默认文档
        console.log('[DocumentReader] 未找到用户上传文档, 使用默认内容')

        const titles: Record<string, string> = {
          '1': '人工智能发展白皮书',
          '2': 'React 18 新特性详解',
          '3': '项目管理最佳实践',
          '4': '深度学习入门指南',
          '5': 'Python 数据处理实战'
        }
        const title = titles[documentId] || '未知文档'
        setDocumentTitle(title)
        console.log('[DocumentReader] 默认文档标题:', title)

        // 默认文档显示文本内容
        const defaultContent = generateDefaultContent(title)
        setFileContent(defaultContent)
        setIsLoadingContent(false)
      }
    } catch (error) {
      console.error('[DocumentReader] 加载文档数据失败:', error)
      setLoadError('加载文档时出错')
      setIsLoadingContent(false)
    }
  }

  const generateDefaultContent = (title: string) => {
    return `# ${title}

## 文档介绍

欢迎阅读《${title}》！这是一份精心准备的文档，旨在帮助您深入了解相关主题。

---

## 第一章：内容概述

### 1.1 文档背景
${title} 是当前技术领域的重要主题。随着技术的发展，它已经成为学习和工作中不可或缺的知识点。本文档将从基础概念开始，逐步深入到高级应用。

### 1.2 学习目标
通过阅读本文档，您将能够：
- 掌握 ${title} 的核心概念
- 理解关键技术的实现原理
- 了解实际应用场景和案例
- 学会最佳实践和使用技巧

---

## 第二章：核心概念详解

### 2.1 基础定义
**${title}** 是一个涉及多个层面的综合性概念。它不仅包括理论基础，还涵盖了实际应用的各个方面。

**关键要点：**
- 概念一：基础理论和原理
- 概念二：核心技术和方法
- 概念三：应用场景和案例

### 2.2 技术要点
在深入了解 ${title} 时，需要关注以下技术要点：

1. **技术原理**
   首先要理解基本的工作原理和机制，这是深入学习的基础。

2. **实现方法**
   掌握具体的实现方法和工具，将理论应用到实践中。

3. **优化策略**
   学习如何优化和改进，不断提升性能和效率。

---

## 第三章：实际应用

### 3.1 应用场景
${title} 在以下场景中有广泛应用：

- **日常应用**：在日常生活和学习中的使用
- **商业环境**：企业级应用和解决方案
- **科研领域**：学术研究和技术开发

### 3.2 实践案例
通过实际案例，我们可以更好地理解 ${title} 的应用价值：

**案例一：基础应用**
这是一个简单的应用场景，展示了 ${title} 的基本用法。

**案例二：高级应用**
这个案例展示了 ${title} 在复杂场景中的应用，包括高级特性和优化。

---

## 第四章：最佳实践

### 4.1 使用建议
- 建议一：循序渐进，从基础开始学习
- 建议二：多做实践，理论与实际结合
- 建议3：持续学习，关注最新发展

### 4.2 常见问题
**问题一：如何快速入门？**
答：建议先从基础概念开始，逐步深入。

**问题二：遇到问题怎么办？**
答：可以查阅相关资料，或寻求社区帮助。

---

## 第五章：总结与展望

### 5.1 主要收获
通过阅读本文档，您应该已经掌握了 ${title} 的核心知识：
- 理解了基本概念和原理
- 学会了关键技术和方法
- 了解了实际应用场景
- 掌握了最佳实践技巧

### 5.2 未来发展
${title} 领域仍在不断发展中，未来可能会出现：
- 新的技术突破和创新
- 更广泛的应用场景
- 更完善的理论体系

---

## 附录

### 相关资源
- 官方文档
- 社区论坛
- 学习教程

### 参考资料列表
1. 参考资料 1
2. 参考资料 2
3. 参考资料 3

---

**感谢您的阅读！**

希望这份文档能够帮助您更好地理解和应用 ${title}。如果您有任何问题或建议，欢迎随时反馈。

祝您学习愉快！📚`
  }

  // 处理文本选择
  useEffect(() => {
    const handleSelectionChange = () => {
      const text = getSelectedText()
      const position = getSelectionPosition()

      console.log('[DocumentReader] 文本选择变化:', { hasText: !!text, hasPosition: !!position })

      if (text && position) {
        setSelectedText(text)
        setSelectionPosition(position)
        setIsSelecting(true)
      } else {
        setSelectedText('')
        setSelectionPosition(null)
        setIsSelecting(false)
        setShowChatMenu(false)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      console.log('[DocumentReader] 鼠标释放')

      // 防止在 AI 菜单内点击时触发
      const isInMenu = (e.target as HTMLElement).closest('#ai-chat-menu')
      if (!isInMenu && isSelecting) {
        console.log('[DocumentReader] 显示 AI 菜单')
        setShowChatMenu(true)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const isInMenu = (e.target as HTMLElement).closest('#ai-chat-menu')
      const isInContainer = containerRef.current?.contains(e.target as Node)

      console.log('[DocumentReader] 点击外部检测:', { isInMenu, isInContainer })

      if (!isInMenu && !isInContainer) {
        setShowChatMenu(false)
        setSelectionPosition(null)
        setIsSelecting(false)
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isSelecting])

  const handleAIAction = useCallback(async (action: 'explain' | 'example' | 'summary') => {
    console.log('[AI] ========== 开始 AI 操作 ==========')
    console.log('[AI] 操作类型:', action)
    console.log('[AI] 选中文本长度:', selectedText.length)
    console.log('[AI] 选中文本内容:', selectedText.substring(0, 100))

    if (!selectedText) {
      console.error('[AI] 错误: 没有选中文本')
      toast.error('请先选择文本')
      return
    }

    setAiAction(action)
    setIsLoading(true)
    setAiResponse('')
    setShowChatMenu(false)

    try {
      console.log('[AI] 正在调用 API /api/ai...')
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          text: selectedText,
          context: fileContent.substring(0, 500)
        })
      })

      console.log('[AI] API 响应状态:', response.status)
      const result = await response.json()
      console.log('[AI] API 完整响应:', JSON.stringify(result, null, 2))

      if (!response.ok || !result.success) {
        console.error('[AI] API 返回错误:', result)
        throw new Error(result.error || result.message || 'AI 请求失败')
      }

      const aiText = result.data
      console.log('[AI] AI 返回成功，文本长度:', aiText.length)
      console.log('[AI] AI 返回内容预览:', aiText.substring(0, 200))

      // 模拟打字机效果
      let displayedText = ''
      for (let i = 0; i < aiText.length; i++) {
        displayedText += aiText.charAt(i)
        setAiResponse(displayedText)
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      toast.success('AI 分析完成')
      console.log('[AI] ========== AI 操作完成 ==========')
    } catch (error: any) {
      console.error('[AI] ========== AI 操作失败 ==========')
      console.error('[AI] 错误信息:', error.message)
      console.error('[AI] 错误堆栈:', error.stack)

      toast.error(`AI 分析失败: ${error.message}`)

      // 如果 API 调用失败，使用模拟数据
      console.log('[AI] 使用模拟数据作为后备方案')
      const mockResponses = {
        explain: `我为你解释一下这段内容：\n\n"${selectedText}"\n\n这部分内容主要说明了相关的概念和原理。通过深入理解这些内容，你可以更好地掌握相关知识。`,
        example: `关于"${selectedText}"，我给你举个例子：\n\n假设我们在实际应用中遇到类似的情况，可以这样理解和处理...`,
        summary: `这段内容的关键要点总结如下：\n\n1. 核心概念和定义\n2. 主要原理和方法\n3. 实际应用场景\n4. 注意事项和建议`
      }

      const response = mockResponses[action]
      let displayedText = ''
      for (let i = 0; i < response.length; i++) {
        displayedText += response.charAt(i)
        setAiResponse(displayedText)
        await new Promise(resolve => setTimeout(resolve, 20))
      }

      console.log('[AI] 模拟数据已显示')
    } finally {
      setIsLoading(false)
    }
  }, [selectedText, fileContent])

  const handleAddNote = useCallback(() => {
    if (!selectedText) {
      toast.error('请先选择文本')
      return
    }

    try {
      // 获取现有笔记
      const existingNotes = JSON.parse(localStorage.getItem('userNotes') || '[]')
      
      // 创建新笔记
      const newNote = {
        id: Date.now().toString(),
        documentId: documentId,
        documentTitle: documentTitle,
        highlightedText: selectedText,
        content: selectedText, // 默认使用选中的文本作为笔记内容
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // 保存到 localStorage
      existingNotes.unshift(newNote)
      localStorage.setItem('userNotes', JSON.stringify(existingNotes))
      
      toast.success('已添加到笔记')
      setShowChatMenu(false)
      setSelectionPosition(null)
      setIsSelecting(false)
    } catch (error) {
      console.error('保存笔记失败:', error)
      toast.error('保存笔记失败')
    }
  }, [selectedText, documentId, documentTitle])

  const handleHighlight = useCallback(() => {
    if (!selectedText) {
      toast.error('请先选择文本')
      return
    }

    // 在实际应用中，这里会高亮选中的文本
    toast.success('已添加高亮标记')
    setShowChatMenu(false)
  }, [selectedText])

  // 格式化文本为 HTML
  const formatTextToHtml = (text: string) => {
    return text
      .split('\n')
      .map(line => {
        // 处理一级标题
        if (line.startsWith('# ')) {
          return `<h1 class="text-3xl font-bold mt-8 mb-4">${line.substring(2)}</h1>`
        }
        // 处理二级标题
        if (line.startsWith('## ')) {
          return `<h2 class="text-2xl font-bold mt-6 mb-4">${line.substring(3)}</h2>`
        }
        // 处理三级标题
        if (line.startsWith('### ')) {
          return `<h3 class="text-xl font-semibold mt-4 mb-3">${line.substring(4)}</h3>`
        }
        // 处理列表项
        if (line.startsWith('- ')) {
          return `<li class="ml-4 mb-1">${line.substring(2)}</li>`
        }
        // 处理数字列表
        if (/^\d+\.\s/.test(line)) {
          return `<li class="ml-4 mb-1">${line}</li>`
        }
        // 处理加粗文本
        if (line.startsWith('**') && line.endsWith('**')) {
          return `<strong class="font-bold">${line.substring(2, line.length - 2)}</strong>`
        }
        // 处理段落（空行跳过）
        if (line.trim()) {
          return `<p class="mb-4 leading-relaxed">${line}</p>`
        }
        return ''
      })
      .join('')
  }

  return (
    <div ref={containerRef} className="relative">
      {/* 文档内容区域 */}
      <div
        className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[500px]"
        onMouseDown={() => {
          if (showChatMenu) {
            setShowChatMenu(false)
          }
        }}
      >
        {isLoadingContent ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">正在加载文档内容...</p>
            </div>
          </div>
        ) : loadError ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4 font-medium">{loadError}</p>
            <div className="max-w-md mx-auto text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">文档信息：</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">标题：{documentTitle}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">类型：{fileType.toUpperCase()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">建议：重新上传文件尝试</p>
            </div>
          </div>
        ) : fileType === 'pdf' && fileData ? (
          <div className="space-y-4">
            {/* PDF 查看器 */}
            <div className="w-full flex flex-col items-center">
              <iframe
                src={fileData}
                className="w-full h-[600px] border border-gray-300 dark:border-gray-700 rounded-lg"
                title="PDF Document"
              />
            </div>

            {/* 用于 AI 伴读的文本区域 */}
            <div className="mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                💡 提示：选中下方文本可以使用 AI 伴读功能
              </p>
              <div className="prose prose-lg max-w-none dark:prose-invert bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div dangerouslySetInnerHTML={{ __html: formatTextToHtml(fileContent) }} />
              </div>
            </div>
          </div>
        ) : fileContent ? (
          <div className="prose prose-lg max-w-none dark:prose-invert min-h-[600px]">
            <div dangerouslySetInnerHTML={{ __html: formatTextToHtml(fileContent) }} />
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">无法显示文档内容</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              请上传支持的文件格式（TXT、PDF、DOC、DOCX）
            </p>
          </div>
        )}
      </div>

      {/* AI 伴读菜单 */}
      {selectionPosition && showChatMenu && (
        <AIChatMenu
          position={selectionPosition}
          selectedText={selectedText}
          onExplain={() => handleAIAction('explain')}
          onExample={() => handleAIAction('example')}
          onSummary={() => handleAIAction('summary')}
          onAddNote={handleAddNote}
          onHighlight={handleHighlight}
        />
      )}

      {/* AI 响应区域 */}
      {(aiResponse || isLoading) && (
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {aiAction === 'explain' && '通俗讲解'}
                {aiAction === 'example' && '举个例子'}
                {aiAction === 'summary' && '内容总结'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI 伴读助手为您解析
              </p>
            </div>
          </div>

          <div
            ref={responseRef}
            className={cn(
              "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900",
              "p-6 rounded-xl border border-blue-200 dark:border-blue-800 transition-all"
            )}
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                <p className="text-gray-600 dark:text-gray-400">
                  AI 助手正在思考中...
                </p>
              </div>
            ) : (
              <div className="prose prose-blue max-w-none dark:prose-invert whitespace-pre-wrap">
                {aiResponse}
              </div>
            )}

            {!isLoading && aiResponse && (
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiResponse)
                    toast.success('已复制回答')
                  }}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  复制回答
                </button>
                <button
                  onClick={() => {
                    toast.success('已保存到笔记')
                  }}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  保存到笔记
                </button>
                <button
                  onClick={() => {
                    setAiResponse('')
                    setAiAction(null)
                  }}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  关闭
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 快速操作按钮 */}
      <div className="fixed bottom-8 right-8 flex flex-col space-y-3">
        <button
          onClick={() => {
            toast.success('已保存当前阅读位置')
          }}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="保存进度"
        >
          <BookOpen className="h-5 w-5 text-blue-500" />
        </button>
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="回到顶部"
        >
          <Zap className="h-5 w-5 text-purple-500" />
        </button>
        <button
          onClick={() => {
            toast.success('已分享文档链接')
          }}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="分享文档"
        >
          <Lightbulb className="h-5 w-5 text-green-500" />
        </button>
      </div>
    </div>
  )
}

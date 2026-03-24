/**
 * 段落工具函数
 * 用于生成唯一的段落ID，支持笔记绑定和段落定位
 */

import { Paragraph } from './parser'

// ⚠️ 重要：每个段落的唯一ID格式
// 格式：para-{文档ID}-{段落序号}
// 示例：para-abc123-1, para-abc123-2

/**
 * 生成段落唯一ID
 * @param documentId 文档ID
 * @param paragraphIndex 段落序号（从1开始）
 * @returns 唯一的段落ID
 */
export function generateParagraphId(documentId: string, paragraphIndex: number): string {
  // 确保段落序号从1开始
  const index = Math.max(1, paragraphIndex)
  return `para-${documentId}-${index}`
}

/**
 * 解析段落ID，获取文档ID和段落序号
 * @param paragraphId 段落ID
 * @returns 解析结果或null
 */
export function parseParagraphId(paragraphId: string): {
  documentId: string
  paragraphIndex: number
} | null {
  const match = paragraphId.match(/^para-(.+?)-(\d+)$/)
  if (!match) return null

  return {
    documentId: match[1],
    paragraphIndex: parseInt(match[2], 10)
  }
}

/**
 * 验证段落ID格式是否有效
 */
export function isValidParagraphId(id: string): boolean {
  return /^para-[a-zA-Z0-9-]+-\d+$/.test(id)
}

/**
 * 为段落数组生成ID
 */
export function generateParagraphIds(paragraphs: Omit<Paragraph, 'id'>[], documentId: string): Paragraph[] {
  return paragraphs.map((paragraph, index) => ({
    ...paragraph,
    id: generateParagraphId(documentId, index + 1)
  }))
}

/**
 * 生成包含段落ID的HTML内容
 * @param paragraphs 段落数组
 * @returns 包含段落ID的HTML字符串
 */
export function generateHtmlWithParagraphIds(paragraphs: Paragraph[]): string {
  let html = ''

  paragraphs.forEach((paragraph, index) => {
    // 每个段落包裹在带ID的p标签中
    const paragraphHtml = `
      <p 
        id="${paragraph.id}" 
        data-paragraph-index="${index + 1}" 
        data-page="${paragraph.page}"
        class="document-paragraph"
      >
        ${paragraph.content}
      </p>
    `

    // 添加段落分隔（如果是新页面）
    if (index > 0 && paragraphs[index - 1].page !== paragraph.page) {
      html += `<div class="page-break" data-page="${paragraph.page}"></div>`
    }

    html += paragraphHtml
  })

  return html
}

/**
 * 从DOM元素中提取段落信息
 */
export function extractParagraphInfo(element: HTMLElement): {
  paragraphId: string
  paragraphIndex: number
  page: number
  content: string
} | null {
  const paragraphId = element.id
  if (!isValidParagraphId(paragraphId)) return null

  const parsed = parseParagraphId(paragraphId)
  if (!parsed) return null

  const paragraphIndex = element.dataset.paragraphIndex 
    ? parseInt(element.dataset.paragraphIndex, 10) 
    : parsed.paragraphIndex

  const page = element.dataset.page 
    ? parseInt(element.dataset.page, 10) 
    : 1

  return {
    paragraphId,
    paragraphIndex,
    page,
    content: element.textContent || ''
  }
}

/**
 * 跳转到指定段落
 * @param paragraphId 段落ID
 * @param options 跳转选项
 */
export function scrollToParagraph(
  paragraphId: string,
  options: {
    behavior?: 'auto' | 'smooth'
    offset?: number
    highlight?: boolean
  } = {}
): boolean {
  const element = document.getElementById(paragraphId)
  if (!element) {
    console.warn(`找不到段落元素: ${paragraphId}`)
    return false
  }

  // 计算滚动位置（考虑偏移量）
  const offset = options.offset || 100
  const elementRect = element.getBoundingClientRect()
  const absoluteElementTop = elementRect.top + window.pageYOffset
  const scrollPosition = absoluteElementTop - offset

  // 执行滚动
  window.scrollTo({
    top: scrollPosition,
    behavior: options.behavior || 'smooth'
  })

  // 如果需要高亮显示
  if (options.highlight) {
    element.classList.add('paragraph-highlight')
    setTimeout(() => {
      element.classList.remove('paragraph-highlight')
    }, 2000)
  }

  return true
}

/**
 * 获取当前可见的段落
 */
export function getVisibleParagraphs(): Array<{
  paragraphId: string
  element: HTMLElement
  visibility: number // 0-1 表示可见程度
}> {
  const paragraphElements = document.querySelectorAll<HTMLElement>('.document-paragraph')
  const viewportHeight = window.innerHeight
  const viewportTop = window.pageYOffset
  const viewportBottom = viewportTop + viewportHeight

  const visibleParagraphs: Array<{
    paragraphId: string
    element: HTMLElement
    visibility: number
  }> = []

  paragraphElements.forEach(element => {
    const rect = element.getBoundingClientRect()
    const elementTop = rect.top + window.pageYOffset
    const elementBottom = elementTop + rect.height

    // 计算可见比例
    const visibleTop = Math.max(viewportTop, elementTop)
    const visibleBottom = Math.min(viewportBottom, elementBottom)
    const visibleHeight = Math.max(0, visibleBottom - visibleTop)
    const visibility = visibleHeight / rect.height

    if (visibility > 0) {
      visibleParagraphs.push({
        paragraphId: element.id,
        element,
        visibility
      })
    }
  })

  // 按可见程度排序
  return visibleParagraphs.sort((a, b) => b.visibility - a.visibility)
}

/**
 * 获取当前阅读位置（段落ID和进度）
 */
export function getReadingProgress(): {
  currentParagraphId: string | null
  progress: number // 0-1
} {
  const paragraphElements = document.querySelectorAll<HTMLElement>('.document-paragraph')
  if (paragraphElements.length === 0) {
    return { currentParagraphId: null, progress: 0 }
  }

  const visibleParagraphs = getVisibleParagraphs()
  
  if (visibleParagraphs.length === 0) {
    // 如果没有可见段落，返回第一个或最后一个段落
    const viewportTop = window.pageYOffset
    const firstElement = paragraphElements[0] as HTMLElement
    const firstTop = firstElement.getBoundingClientRect().top + window.pageYOffset
    
    if (viewportTop < firstTop) {
      return { currentParagraphId: firstElement.id, progress: 0 }
    } else {
      const lastElement = paragraphElements[paragraphElements.length - 1] as HTMLElement
      return { currentParagraphId: lastElement.id, progress: 1 }
    }
  }

  // 返回可见程度最高的段落
  const mostVisible = visibleParagraphs[0]
  
  // 计算阅读进度
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight
  const currentScroll = window.pageYOffset
  const progress = totalHeight > 0 ? Math.min(1, currentScroll / totalHeight) : 0

  return {
    currentParagraphId: mostVisible.paragraphId,
    progress
  }
}

/**
 * 保存阅读进度
 */
export function saveReadingProgress(documentId: string): boolean {
  try {
    const progress = getReadingProgress()
    if (!progress.currentParagraphId) return false

    const progressData = {
      documentId,
      paragraphId: progress.currentParagraphId,
      progress: progress.progress,
      timestamp: new Date().toISOString()
    }

    // 保存到 localStorage
    localStorage.setItem(`reading-progress-${documentId}`, JSON.stringify(progressData))
    
    // 保存到 sessionStorage（临时会话）
    sessionStorage.setItem('last-reading-progress', JSON.stringify(progressData))

    return true
  } catch (error) {
    console.error('保存阅读进度失败:', error)
    return false
  }
}

/**
 * 恢复阅读进度
 */
export function restoreReadingProgress(documentId: string): boolean {
  try {
    const savedProgress = localStorage.getItem(`reading-progress-${documentId}`)
    if (!savedProgress) return false

    const progressData = JSON.parse(savedProgress)
    if (progressData.documentId !== documentId) return false

    // 跳转到保存的段落
    return scrollToParagraph(progressData.paragraphId, {
      behavior: 'smooth',
      offset: 100,
      highlight: true
    })
  } catch (error) {
    console.error('恢复阅读进度失败:', error)
    return false
  }
}

/**
 * 清除阅读进度
 */
export function clearReadingProgress(documentId?: string): void {
  if (documentId) {
    localStorage.removeItem(`reading-progress-${documentId}`)
  } else {
    // 清除所有阅读进度
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('reading-progress-')) {
        localStorage.removeItem(key)
      }
    })
  }
}

/**
 * 笔记相关工具函数
 */
export const noteUtils = {
  /**
   * 创建笔记数据
   */
  createNoteData(
    paragraphId: string,
    content: string,
    tags: string[] = [],
    highlightedText?: string
  ) {
    const parsed = parseParagraphId(paragraphId)
    if (!parsed) {
      throw new Error('无效的段落ID')
    }

    return {
      paragraphId,
      content,
      tags,
      highlightedText,
      createdAt: new Date().toISOString(),
      metadata: {
        documentId: parsed.documentId,
        paragraphIndex: parsed.paragraphIndex
      }
    }
  },

  /**
   * 根据文档ID和段落ID查找笔记
   */
  findNoteByParagraphId(
    notes: Array<{
      paragraphId: string
      content: string
      tags: string[]
      createdAt: string
    }>,
    paragraphId: string
  ) {
    return notes.find(note => note.paragraphId === paragraphId)
  },

  /**
   * 根据文档ID查找所有笔记
   */
  findNotesByDocumentId(
    notes: Array<{
      paragraphId: string
      content: string
      tags: string[]
      createdAt: string
      metadata?: any
    }>,
    documentId: string
  ) {
    return notes.filter(note => {
      const parsed = parseParagraphId(note.paragraphId)
      return parsed && parsed.documentId === documentId
    })
  },

  /**
   * 获取带笔记标记的段落ID列表
   */
  getParagraphIdsWithNotes(
    notes: Array<{ paragraphId: string }>,
    documentId: string
  ): string[] {
    return notes
      .filter(note => {
        const parsed = parseParagraphId(note.paragraphId)
        return parsed && parsed.documentId === documentId
      })
      .map(note => note.paragraphId)
  }
}

// 添加CSS样式到文档
export function injectParagraphStyles(): void {
  if (typeof document === 'undefined') return

  const styleId = 'paragraph-styles'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    .document-paragraph {
      position: relative;
      margin: 1em 0;
      line-height: 1.6;
    }
    
    .document-paragraph.paragraph-highlight {
      background-color: rgba(255, 255, 0, 0.2);
      transition: background-color 0.3s ease;
      border-left: 3px solid #3b82f6;
      padding-left: 10px;
    }
    
    .document-paragraph.has-note::before {
      content: '📝';
      position: absolute;
      left: -30px;
      top: 0;
      font-size: 14px;
      opacity: 0.7;
    }
    
    .document-paragraph.has-note:hover::before {
      opacity: 1;
    }
    
    .page-break {
      height: 20px;
      border-bottom: 2px dashed #e5e7eb;
      margin: 20px 0;
      position: relative;
    }
    
    .page-break::after {
      content: attr(data-page);
      position: absolute;
      right: 0;
      bottom: -8px;
      font-size: 12px;
      color: #6b7280;
      background: #f9fafb;
      padding: 0 5px;
    }
  `

  document.head.appendChild(style)
}
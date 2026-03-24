/**
 * PDF 解析服务
 * 注意：在实际部署中，需要在服务器端集成 PyMuPDF 或 pdf2json
 * 这里提供客户端模拟和服务器端接口设计
 */

import { supabase } from '@/lib/supabase/supabase'
import { generateParagraphId } from '@/lib/utils'

export interface PDFParseResult {
  id: string
  paragraphs: Paragraph[]
  pageCount: number
  metadata: {
    fileSize: number
    fileName: string
    parseTime: number
    status: 'completed' | 'failed'
  }
  totalCharacters: number
}

export interface Paragraph {
  id: string
  content: string
  page: number
  paragraphIndex: number
  characterCount: number
  // 在服务器端解析时，还可以添加更多信息
  lineNumbers?: number[]
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export class PDFParser {
  private maxFileSize = 50 * 1024 * 1024 // 50MB
  private supportedMimeTypes = ['application/pdf']

  /**
   * 验证文件
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // 验证文件类型
    if (!this.supportedMimeTypes.includes(file.type)) {
      return { valid: false, error: '不支持的文件类型，仅支持 PDF 格式' }
    }

    // 验证文件大小
    if (file.size > this.maxFileSize) {
      return { valid: false, error: `文件过大，最大支持 ${this.maxFileSize / 1024 / 1024}MB` }
    }

    return { valid: true }
  }

  /**
   * 模拟解析 PDF（客户端模拟）
   * 实际服务器端会使用 PyMuPDF 或 pdf2json
   */
  async parsePDFSimulation(file: File, documentId: string): Promise<PDFParseResult> {
    const startTime = Date.now()
    
    // 模拟读取文件内容
    // 模拟解析为段落
    const paragraphs: Paragraph[] = [
      {
        id: generateParagraphId(documentId, 0),
        content: '第一章：人工智能概述\n人工智能（Artificial Intelligence，简称 AI）是指由人制造出来的系统所表现出来的智能。通常人工智能是指通过普通计算机程序来呈现人类智能的技术。',
        page: 1,
        paragraphIndex: 0,
        characterCount: 120,
        boundingBox: { x: 50, y: 100, width: 500, height: 60 }
      },
      {
        id: generateParagraphId(documentId, 1),
        content: '人工智能的发展经历了多个阶段，从早期的符号主义 AI 到现代的深度学习革命，技术不断演进和突破。',
        page: 1,
        paragraphIndex: 1,
        characterCount: 65,
        boundingBox: { x: 50, y: 180, width: 500, height: 40 }
      },
      {
        id: generateParagraphId(documentId, 2),
        content: '主要技术领域包括机器学习、自然语言处理、计算机视觉和机器人技术，这些领域的快速发展推动着人工智能的广泛应用。',
        page: 1,
        paragraphIndex: 2,
        characterCount: 80,
        boundingBox: { x: 50, y: 240, width: 500, height: 40 }
      },
      {
        id: generateParagraphId(documentId, 3),
        content: '第二章：机器学习基础\n监督学习是指从标记的训练数据中学习预测函数的机器学习任务。训练数据包括输入对象和期望的输出值。',
        page: 2,
        paragraphIndex: 0,
        characterCount: 75,
        boundingBox: { x: 50, y: 100, width: 500, height: 50 }
      },
      {
        id: generateParagraphId(documentId, 4),
        content: '无监督学习是指从未标记的训练数据中学习模式或结构的机器学习任务。无监督学习算法不依赖于标记数据，而是通过数据的内在结构进行学习。',
        page: 2,
        paragraphIndex: 1,
        characterCount: 95,
        boundingBox: { x: 50, y: 170, width: 500, height: 60 }
      },
      {
        id: generateParagraphId(documentId, 5),
        content: '强化学习是指智能体通过与环境交互来学习最优行为策略的机器学习任务。智能体通过试错来学习，根据行为获得的奖励或惩罚来调整策略。',
        page: 3,
        paragraphIndex: 0,
        characterCount: 90,
        boundingBox: { x: 50, y: 100, width: 500, height: 60 }
      },
      {
        id: generateParagraphId(documentId, 6),
        content: '第三章：深度学习技术\n神经网络是受生物神经网络启发而构建的计算模型。它由大量的人工神经元相互连接构成，每个神经元接收输入信号，通过激活函数处理后输出。',
        page: 4,
        paragraphIndex: 0,
        characterCount: 110,
        boundingBox: { x: 50, y: 100, width: 500, height: 70 }
      },
      {
        id: generateParagraphId(documentId, 7),
        content: '卷积神经网络（CNN）是专为处理图像数据而设计的深度学习网络。它通过卷积层、池化层和全连接层的组合，能够有效提取图像的空间特征。',
        page: 4,
        paragraphIndex: 1,
        characterCount: 95,
        boundingCount: 95,
        boundingBox: { x: 50, y: 190, width: 500, height: 60 }
      },
      {
        id: generateParagraphId(documentId, 8),
        content: '循环神经网络（RNN）是专为处理序列数据而设计的深度学习网络。它具有记忆功能，能够处理时间序列数据，如自然语言、语音等。',
        page: 5,
        paragraphIndex: 0,
        characterCount: 85,
        boundingBox: { x: 50, y: 100, width: 500, height: 55 }
      }
    ]

    const totalCharacters = paragraphs.reduce((sum, p) => sum + p.characterCount, 0)
    
    const parseTime = Date.now() - startTime

    return {
      id: documentId,
      paragraphs,
      pageCount: 5,
      metadata: {
        fileSize: file.size,
        fileSize: file.size,
        fileName: file.name,
        parseTime: parseTime,
        status: 'completed'
      },
      totalCharacters
    }
  }

  /**
   * 调用服务器端 PDF 解析 API
   * 实际部署中，需要在服务器端实现 PDF 解析功能
   */
  async parsePDFViaAPI(file: File, documentId: string): Promise<PDFParseResult> {
    try {
      // 获取 Supabase Storage 文件 URL
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .getPublicUrl(documentId)

      if (fileError) throw fileError

      // 调用服务器端解析 API
      const response = await fetch('/api/pdf/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          fileUrl: fileData.publicUrl,
          fileName: file.name,
          fileSize: file.size
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`解析失败: ${error}`)
      }

      return await response.json()

    } catch (error) {
      console.error('PDF 解析失败:', error)
      throw error
    }
  }

  /**
   * 保存解析结果到数据库
   */
  async saveParseResult(documentId: string, parseResult: PDFParseResult, userId: string) {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          parse_status: 'completed',
          page_count: parseResult.pageCount,
          parsed_text: parseResult.paragraphs.map(p => p.content).join('\n\n'),
          metadata: parseResult.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .eq('user_id', userId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('保存解析结果失败:', error)
      throw error
    }
  }

  /**
   * 提取文本摘要
   */
  extractSummary(parseResult: PDFParseResult, maxParagraphs: number = 5): string {
    // 按段落重要性排序（这里简化为按字符数排序）
    const sortedParagraphs = [...parseResult.paragraphs]
      .sort((a, b) => b.characterCount - a.characterCount)
      .slice(0, maxParagraphs)
    
    // 提取摘要
    const summary = sortedParagraphs
      .map(p => p.content)
      .join('\n\n')

    return summary
  }

  /**
   * 分析文档结构
   */
  analyzeStructure(parseResult: PDFParseResult): {
    sections: Array<{
      title: string
      startPage: number
      paragraphCount: number
    }>
    keywordDensity: Record<string, number>
    readabilityScore: number
  } {
    const sections: Array<{
      title: string
      startPage: number
      paragraphCount: number
    }> = []
    
    let currentSection = { title: '引言', startPage: 1, paragraphCount: 0 }

    // 分析章节结构
    parseResult.paragraphs.forEach((paragraph, index) => {
      // 检测章节标题（简单的启发式方法）
      if (paragraph.content.includes('章') || paragraph.content.includes('第')) {
        if (currentSection.paragraphCount > 0) {
          sections.push({ ...currentSection })
        }
        
        // 提取章节标题
        const lines = paragraph.content.split('\n')
        const title = lines.find(line => line.includes('章') || line.includes('第')) || `第${sections.length + 1}章`
        
        currentSection = {
          title: title.trim(),
          startPage: paragraph.page,
          paragraphCount: 1
        currentSection = {
          title: title.trim(),
          startPage: paragraph.page,
          paragraphCount: 1
        }
      } else {
        currentSection.paragraphCount++
      }
    })

    // 添加最后一个章节
    if (currentSection.paragraphCount > 0) {
      sections.push(currentSection)
    }

    // 计算关键词密度（简化的版本）
    const allText = parseResult.paragraphs.map(p => p.content).join(' ')
    const words = allText.toLowerCase().match(/\b\w+\b/g) || []
    const wordFrequency: Record<string, number> = {}
    
    words.forEach(word => {
      if (word.length > 2) { // 忽略短词
        wordFrequency[word] = (wordFrequency[word] || 0) + 1
      }
    })

    // 计算可读性分数（简化的Flesch-Kincaid）
    const sentences = allText.match(/[^.!?]+[.!?]/g)?.length || 1
    const syllables = words.reduce((sum, word) => sum + Math.max(1, word.length / 3), 0)
    const readabilityScore = 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length)

    return {
      sections,
      keywordDensity: wordFrequency,
      readabilityScore
    }
  }

  /**
   * 分割长文档
   */
  splitLongDocument(parseResult: PDFParseResult, maxChunkSize: number = 10000): PDFParseResult[] {
    const chunks: PDFParseResult[] = []
    let currentChunk: PDFParseResult = {
      id: `${parseResult.id}-chunk-0`,
      paragraphs: [],
      pageCount: 0,
      metadata: {
        fileSize: parseResult.metadata.fileSize,
        fileName: parseResult.metadata.fileName,
        parseTime: parseResult.metadata.parseTime,
        status: 'completed'
      },
      totalCharacters: 0
    }

    let currentChunkSize = 0

    parseResult.paragraphs.forEach((paragraph, index) => {
      if (currentChunkSize + paragraph.characterCount > maxChunkSize && currentChunk.paragraphs.length > 0) {
        // 完成当前分块
        currentChunk.totalCharacters = currentChunkSize
        chunks.push({ ...currentChunk })
        
        // 开始新的分块
        currentChunk = {
          id: `${parseResult.id}-chunk-${chunks.length}`,
          paragraphs: [paragraph],
          pageCount: paragraph.page,
          metadata: {
            fileSize: parseResult.metadata.fileSize,
            fileName: parseResult.metadata.fileName,
            parseTime: parseResult.metadata.parseTime,
            status: 'completed'
          },
          totalCharacters: paragraph.pargraph.characterCount
        }
        currentChunkSize = paragraph.characterCount
      } else {
        // 添加到当前分块
        currentChunk.paragraphs.push(paragraph)
        currentChunk.pageCount = Math.max(currentChunk.pageCount, paragraph.page)
        currentChunkSize += paragraph.characterCount
      }
    })

    // 添加最后一个分块
    if (currentChunk.paragraphs.length > 0) {
      currentChunk.totalCharacters = currentChunkSize
      chunks.push(currentChunk)
    }

    return chunks
  }
}
/**
 * DeepSeek API 集成
 * 支持长文本处理、文档摘要、智能问答等功能
 */

import { Paragraph, PDFParseResult } from '@/lib/pdf/parser'

export interface DeepSeekConfig {
  apiKey: string
  baseUrl: string
  model: string
  longTextModel: string
  maxTokens: number
  temperature: number
  timeout: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  messages: ChatMessage[]
  model?: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  stream?: boolean
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatMessage
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface SummaryRequest {
  text: string
  maxLength?: number
  language?: 'zh' | 'en'
}

export interface SummaryResponse {
  summary: string
  keyPoints: string[]
  totalTokens: number
}

export interface QuestionAnswerRequest {
  question: string
  context: string
  contextParagraphs?: Paragraph[]
}

export interface QuestionAnswerResponse {
  answer: string
  confidence: number
  supportingParagraphs?: string[]
  totalTokens: number
}

export interface MindMapNode {
  id: string
  label: string
  children?: MindMapNode[]
  level: number
  importance: number
}

export interface MindMapRequest {
  paragraphs: Paragraph[]
  maxNodes?: number
}

export interface MindMapResponse {
  nodes: MindMapNode[]
  connections: Array<{
    source: string
    target: string
    strength: number
  }>
}

export class DeepSeekAI {
  private config: DeepSeekConfig
  private isConfigured: boolean = false

  constructor() {
    this.config = {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      longTextModel: 'deepseek-chat-long',
      maxTokens: 2000,
      temperature: 0.7,
      timeout: 30000
    }

    this.checkConfiguration()
  }

  /**
   * 检查配置
   */
  private checkConfiguration() {
    if (!this.config.apiKey) {
      console.warn('DeepSeek API Key 未配置。请设置 DEEPSEEK_API_KEY 环境变量。')
      console.warn('获取 API Key: https://platform.deepseek.com/api_keys')
      this.isConfigured = false
    } else {
      this.isConfigured = true
    }
  }

  /**
   * 验证 API 密钥
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.isConfigured) {
      return false
    }

    try {
      const response = await this.chatCompletion({
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
      return !!response.id
    } catch {
      return false
    }
  }

  /**
   * 聊天补全
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.isConfigured) {
      throw new Error('DeepSeek API 未配置。请检查 DEEPSEEK_API_KEY 环境变量。')
    }

    const url = `${this.config.baseUrl}/chat/completions`
    const payload = {
      model: request.model || this.config.model,
      messages: request.messages,
      max_tokens: request.max_tokens || this.config.maxTokens,
      temperature: request.temperature || this.config.temperature,
      top_p: request.top_p || 0.9,
      stream: request.stream || false
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DeepSeek API 请求失败: ${response.status} - ${errorText}`)
      }

      return response.json()
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请稍后重试')
      }
      throw error
    }
  }

  /**
   * 文档总结
   */
  async summarizeDocument(request: SummaryRequest): Promise<SummaryResponse> {
    const { text, maxLength = 500, language = 'zh' } = request

    // 处理长文本
    const processedText = this.processLongText(text)
    const isLongText = text.length > 10000

    const systemPrompt = language === 'zh' 
      ? '你是一个专业的文档总结助手。请用中文对提供的文本进行总结，提取关键要点。'
      : 'You are a professional document summarization assistant. Please summarize the provided text in English and extract key points.'

    const userPrompt = language === 'zh'
      ? `请总结以下文本（${text.length} 字符）：
      
${processedText}

请提供：
1. 一个简洁的总结（不超过 ${maxLength} 字）
2. 3-5个关键要点
3. 如果有重要数据或结论，请特别指出`
      : `Please summarize the following text (${text.length} characters):
      
${processedText}

Please provide:
1. A concise summary (no more than ${maxLength} words)
2. 3-5 key points
3. Highlight any important data or conclusions`

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: isLongText ? this.config.longTextModel : this.config.model,
      max_tokens: Math.min(maxLength * 2, this.config.maxTokens),
      temperature: 0.3
    })

    const result = response.choices[0].message.content
    const lines = result.split('\n').filter(line => line.trim())

    // 解析总结结果
    const summary = lines.find(line => !line.includes('•') && !line.includes('要点') && !line.includes('关键'))
      || result.substring(0, Math.min(200, result.length))

    const keyPoints = lines
      .filter(line => line.includes('•') || line.includes('要点') || line.includes('关键') || line.includes('1.') || line.includes('2.') || line.includes('3.'))
      .map(line => line.replace(/^[•\-\d\.\s]*/, '').trim())
      .filter(point => point.length > 0)

    return {
      summary: summary.trim(),
      keyPoints: keyPoints.length > 0 ? keyPoints : [],
      totalTokens: response.usage.total_tokens
    }
  }

  /**
   * 智能问答
   */
  async answerQuestion(request: QuestionAnswerRequest): Promise<QuestionAnswerResponse> {
    const { question, context, contextParagraphs = [] } = request

    // 构建上下文
    let fullContext = context
    if (contextParagraphs.length > 0) {
      const paragraphsText = contextParagraphs
        .map(p => `[段落 ${p.paragraphIndex + 1}，第 ${p.page} 页]: ${p.content}`)
        .join('\n\n')
      fullContext = `${context}\n\n相关段落:\n${paragraphsText}`
    }

    const isLongContext = fullContext.length > 5000
    const processedContext = this.processLongText(fullContext)

    const systemPrompt = `你是一个文档问答助手。请根据以下上下文回答用户问题：

${processedContext}

如果上下文没有提供足够信息，请回答："根据提供的文档，无法回答这个问题。"
请给出准确、简洁的回答，并注明信息来源（如果有）。`

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      model: isLongContext ? this.config.longTextModel : this.config.model,
      max_tokens: 1000,
      temperature: 0.5
    })

    const answer = response.choices[0].message.content

    // 提取支持段落引用
    const supportingParagraphs: string[] = []
    if (contextParagraphs.length > 0) {
      // 简单的关键词匹配来找到相关段落
      const answerWords = new Set(answer.toLowerCase().match(/\b\w+\b/g) || [])
      
      contextParagraphs.forEach(paragraph => {
        const paragraphWords = new Set(paragraph.content.toLowerCase().match(/\b\w+\b/g) || [])
        const intersection = [...answerWords].filter(word => paragraphWords.has(word))
        
        if (intersection.length >= 3) { // 至少有3个共同关键词
          supportingParagraphs.push(paragraph.id)
        }
      })
    }

    // 计算置信度（基于回答长度和是否有支持段落）
    const confidence = Math.min(0.9, answer.length / 200) * (supportingParagraphs.length > 0 ? 1.2 : 1.0)

    return {
      answer: answer.trim(),
      confidence: Math.min(1.0, confidence),
      supportingParagraphs: supportingParagraphs.slice(0, 3),
      totalTokens: response.usage.total_tokens
    }
  }

  /**
   * 生成思维导图
   */
  async generateMindMap(request: MindMapRequest): Promise<MindMapResponse> {
    const { paragraphs, maxNodes = 20 } = request

    // 提取文本内容
    const text = paragraphs.map(p => p.content).join('\n\n')

    const systemPrompt = `你是一个知识图谱专家。请根据以下文档内容，生成一个结构化的思维导图。

请按照以下格式返回：
1. 根节点：文档主题
2. 一级节点：主要章节或主题
3. 二级节点：子主题或关键概念
4. 节点之间用连接线表示关系

返回格式为 JSON，包含 nodes（节点列表）和 connections（连接关系列表）。`

    const userPrompt = `文档内容：
${text}

请分析文档结构，生成包含 ${maxNodes} 个节点的思维导图。
节点应该有 label（标签）、level（层级，0为根节点）、importance（重要性，0-1）。
连接应该有 source（源节点ID）、target（目标节点ID）、strength（连接强度，0-1）。`

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 3000,
      temperature: 0.3
    })

    try {
      // 尝试从回答中提取 JSON
      const answer = response.choices[0].message.content
      const jsonMatch = answer.match(/```json\n([\s\S]*?)\n```/) || answer.match(/{[\s\S]*}/)
      
      if (jsonMatch) {
        const jsonText = jsonMatch[0].replace(/```json\n/, '').replace(/\n```/, '')
        return JSON.parse(jsonText)
      } else {
        // 如果无法解析 JSON，返回一个简单的结构
        return this.generateSimpleMindMap(paragraphs)
      }
    } catch (error) {
      console.warn('思维导图 JSON 解析失败，使用简单结构:', error)
      return this.generateSimpleMindMap(paragraphs)
    }
  }

  /**
   * 生成简单的思维导图（备选方案）
   */
  private generateSimpleMindMap(paragraphs: Paragraph[]): MindMapResponse {
    // 提取章节标题作为节点
    const nodes: MindMapNode[] = []
    const connections: Array<{ source: string; target: string; strength: number }> = []

    // 根节点
    const rootNode: MindMapNode = {
      id: 'root',
      label: '文档大纲',
      level: 0,
      importance: 1.0
    }
    nodes.push(rootNode)

    // 从段落中提取章节
    const chapterPatterns = [/第[\s\S]*?章/g, /[一二三四五六七八九十]+[、\s]/g, /[A-Z][\.\s]/g]
    
    paragraphs.forEach((paragraph, index) => {
      chapterPatterns.forEach(pattern => {
        const matches = paragraph.content.match(pattern)
        if (matches && matches.length > 0) {
          const chapterTitle = matches[0].trim()
          const chapterId = `chapter-${index}`
          
          // 检查是否已存在
          if (!nodes.find(n => n.label === chapterTitle)) {
            nodes.push({
              id: chapterId,
              label: chapterTitle,
              level: 1,
              importance: 0.8 - (index * 0.1)
            })
            
            connections.push({
              source: 'root',
              target: chapterId,
              strength: 0.9
            })
          }
        }
      })
    })

    // 如果没有找到章节，使用段落作为节点
    if (nodes.length <= 1) {
      paragraphs.slice(0, 10).forEach((paragraph, index) => {
        const nodeId = `para-${index}`
        const label = paragraph.content.substring(0, 30) + (paragraph.content.length > 30 ? '...' : '')
        
        nodes.push({
          id: nodeId,
          label,
          level: 1,
          importance: 0.9 - (index * 0.05)
        })

        connections.push({
          source: 'root',
          target: nodeId,
          strength: 0.8
        })
      })
    }

    return { nodes, connections }
  }

  /**
   * 处理长文本
   */
  private processLongText(text: string, chunkSize: number = 8000): string {
    if (text.length <= chunkSize) {
      return text
    }

    // 简单的分块策略
    const chunks: string[] = []
    let start = 0
    
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      let chunk = text.substring(start, end)
      
      // 尝试在段落边界处切分
      const lastParagraph = chunk.lastIndexOf('\n\n')
      if (lastParagraph > chunkSize / 2) {
        chunk = chunk.substring(0, lastParagraph)
        start += lastParagraph
      } else {
        start = end
      }
      
      chunks.push(chunk)
    }

    // 返回第一个块作为示例
    return `[文档过长，已分块处理，以下是第1个块的内容]\n\n${chunks[0]}\n\n[... 省略后续 ${chunks.length - 1} 个块 ...]`
  }

  /**
   * 解释文本（通俗讲解）
   */
  async explainText(text: string, targetAudience: 'beginner' | 'intermediate' | 'expert' = 'intermediate'): Promise<string> {
    const audienceMap = {
      beginner: '初学者',
      intermediate: '有一定基础的学习者',
      expert: '专业人士'
    }

    const response = await this.chatCompletion({
      messages: [
        {
          role: 'system',
          content: `你是一个耐心的讲解者，请用通俗易懂的语言为${audienceMap[targetAudience]}讲解以下内容。`
        },
        {
          role: 'user',
          content: `请用通俗的语言解释以下内容，适合${audienceMap[targetAudience]}理解：

"${text}"`
        }
      ],
      max_tokens: 1000,
      temperature: 0.5
    })

    return response.choices[0].message.content
  }

  /**
   * 提供例子
   */
  async provideExample(text: string, context?: string): Promise<string> {
    const prompt = context 
      ? `关于以下概念："${text}"，结合这个上下文："${context}"，请提供一个具体的例子来说明。`
      : `关于以下内容："${text}"，请提供一个具体的例子来说明。`

    const response = await this.chatCompletion({
      messages: [
        {
          role: 'system',
          content: '你是一个善于举例的助教，请为概念提供具体、贴切的例子。'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.6
    })

    return response.choices[0].message.content
  }

  /**
   * 检查 API 使用情况
   */
  getUsageInfo(): { configured: boolean; hasApiKey: boolean } {
    return {
      configured: this.isConfigured,
      hasApiKey: !!this.config.apiKey
    }
  }
}

// 导出单例实例
export const deepseekAI = new DeepSeekAI()
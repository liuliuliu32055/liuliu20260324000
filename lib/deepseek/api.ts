import { DEEPSEEK_CONFIG } from './config'

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
  model?: string
  max_length?: number
}

export interface SummaryResponse {
  summary: string
  key_points: string[]
  tokens_used: number
}

export class DeepSeekAPI {
  private apiKey: string
  private baseUrl: string
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || ''
    this.baseUrl = DEEPSEEK_CONFIG.BASE_URL
    
    if (!this.apiKey) {
      console.warn('DeepSeek API Key 未配置，请按照指南获取：')
      console.warn(DEEPSEEK_CONFIG.API_KEY_GUIDE)
    }
  }
  
  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DeepSeek API 请求失败: ${response.status} - ${errorText}`)
    }
    
    return response.json()
  }
  
  /**
   * 普通聊天对话
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const defaultModel = request.messages.some(msg => 
      msg.content.length > 10000
    ) ? DEEPSEEK_CONFIG.MODELS.LONG_TEXT : DEEPSEEK_CONFIG.MODELS.STANDARD
    
    const data = {
      model: request.model || defaultModel,
      messages: request.messages,
      max_tokens: request.max_tokens || DEEPSEEK_CONFIG.DEFAULT_CONFIG.max_tokens,
      temperature: request.temperature || DEEPSEEK_CONFIG.DEFAULT_CONFIG.temperature,
      top_p: request.top_p || DEEPSEEK_CONFIG.DEFAULT_CONFIG.top_p,
      stream: request.stream || false,
    }
    
    return this.makeRequest<ChatCompletionResponse>(
      DEEPSEEK_CONFIG.ENDPOINTS.CHAT_COMPLETION,
      data
    )
  }
  
  /**
   * 长文本总结
   */
  async summarizeText(request: SummaryRequest): Promise<SummaryResponse> {
    const { text, model, max_length } = request
    
    // 处理超长文本
    const processedText = this.processLongText(text)
    
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的文档总结助手。请对提供的文本进行总结，提取关键要点。'
      },
      {
        role: 'user',
        content: `请总结以下文本（${text.length} 字符）：
        
${processedText}

请提供：
1. 一个简洁的总结（不超过 ${max_length || 500} 字）
2. 3-5个关键要点
3. 如果有重要数据或结论，请特别指出`
      }
    ]
    
    const response = await this.chatCompletion({
      messages,
      model: model || DEEPSEEK_CONFIG.MODELS.LONG_TEXT,
      max_tokens: max_length || 1000,
      temperature: 0.3, // 更低的温度以获得更确定的输出
    })
    
    const result = response.choices[0].message.content
    
    // 解析返回结果
    const lines = result.split('\n').filter(line => line.trim())
    const summary = lines[0] || result
    const keyPoints = lines
      .filter(line => line.includes('•') || line.includes('要点') || line.includes('关键'))
      .map(line => line.replace(/^[•\-]\s*/, '').trim())
      .filter(Boolean)
    
    return {
      summary,
      key_points: keyPoints.length > 0 ? keyPoints : [],
      tokens_used: response.usage.total_tokens
    }
  }
  
  /**
   * 文档问答
   */
  async askDocument(question: string, context: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `你是一个文档问答助手。请根据以下上下文回答用户问题：
        
${context}

如果上下文没有提供足够信息，请回答："根据提供的文档，无法回答这个问题。"`
      },
      {
        role: 'user',
        content: question
      }
    ]
    
    const response = await this.chatCompletion({
      messages,
      model: context.length > 10000 
        ? DEEPSEEK_CONFIG.MODELS.LONG_TEXT 
        : DEEPSEEK_CONFIG.MODELS.STANDARD,
      temperature: 0.5,
    })
    
    return response.choices[0].message.content
  }
  
  /**
   * 处理超长文本（分块处理）
   */
  private processLongText(text: string): string {
    const { chunk_size, overlap, max_context_length } = DEEPSEEK_CONFIG.LONG_TEXT_CONFIG
    
    if (text.length <= max_context_length) {
      return text
    }
    
    console.log(`文本过长（${text.length} 字符），进行分块处理`)
    
    // 简单的分块策略
    const chunks: string[] = []
    let start = 0
    
    while (start < text.length) {
      const end = Math.min(start + chunk_size, text.length)
      let chunk = text.substring(start, end)
      
      // 尝试在段落边界处切分
      const lastParagraph = chunk.lastIndexOf('\n\n')
      if (lastParagraph > chunk_size / 2) {
        chunk = chunk.substring(0, lastParagraph)
        start += lastParagraph
      } else {
        start = end - overlap
      }
      
      chunks.push(chunk)
    }
    
    // 返回前几个块作为示例
    const sampleChunks = chunks.slice(0, 3)
    return `[文档过长，已分块处理，以下是前${sampleChunks.length}个块的内容]\n\n` +
           sampleChunks.join('\n\n[块分隔]\n\n') +
           `\n\n[... 省略后续 ${chunks.length - sampleChunks.length} 个块 ...]`
  }
  
  /**
   * 验证 API Key 是否有效
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false
    }
    
    try {
      const response = await this.chatCompletion({
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      })
      return !!response.id
    } catch {
      return false
    }
  }
}

// 导出单例实例
export const deepseekApi = new DeepSeekAPI()
/**
 * DeepSeek API 增强客户端
 * 专为账号 15922233923 优化，支持流式响应和长文本处理
 * 注意：请将 DEEPSEEK_API_KEY 替换为您的实际 API Key
 */

// ⚠️ 重要：请将以下 API Key 替换为您从 DeepSeek 平台获取的实际值
// 获取方式：登录 https://platform.deepseek.com → 控制台 → API Keys → 创建新的 API Key
const DEFAULT_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-您的-API-Key-请替换这里';

export interface DeepSeekConfig {
  apiKey: string;          // ⚠️ 请替换为您的 DeepSeek API Key
  baseUrl: string;         // DeepSeek API 基础地址
  model: string;           // 默认模型
  longTextModel: string;   // 长文本专用模型
  maxTokens: number;       // 最大 tokens
  temperature: number;     // 温度参数
  timeout: number;         // 请求超时时间（毫秒）
  maxRetries: number;      // 最大重试次数
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export interface DeepSeekError extends Error {
  code?: string;
  status?: number;
  type?: string;
}

export class DeepSeekEnhanced {
  private config: DeepSeekConfig;
  private isConfigured: boolean = false;

  constructor(config?: Partial<DeepSeekConfig>) {
    this.config = {
      // ⚠️ 请确保已正确配置 DEEPSEEK_API_KEY 环境变量
      apiKey: config?.apiKey || DEFAULT_API_KEY,
      baseUrl: config?.baseUrl || 'https://api.deepseek.com',
      model: config?.model || 'deepseek-chat',
      longTextModel: config?.longTextModel || 'deepseek-chat-long',
      maxTokens: config?.maxTokens || 2000,
      temperature: config?.temperature || 0.7,
      timeout: config?.timeout || 30000,
      maxRetries: config?.maxRetries || 3,
    };

    this.checkConfiguration();
  }

  /**
   * 检查配置是否有效
   */
  private checkConfiguration(): void {
    if (!this.config.apiKey || this.config.apiKey === 'sk-您的-API-Key-请替换这里') {
      console.error('❌ DeepSeek API Key 未配置或使用默认值！');
      console.error('请按照以下步骤操作：');
      console.error('1. 访问 https://platform.deepseek.com');
      console.error('2. 使用手机号 15922233923 登录');
      console.error('3. 进入控制台 → API Keys');
      console.error('4. 创建新的 API Key 并复制');
      console.error('5. 在 .env.local 文件中配置：DEEPSEEK_API_KEY=您的_API_Key');
      this.isConfigured = false;
    } else if (!this.config.apiKey.startsWith('sk-')) {
      console.error('❌ API Key 格式不正确，应以 "sk-" 开头');
      this.isConfigured = false;
    } else {
      this.isConfigured = true;
      console.log('✅ DeepSeek API 配置检查通过');
    }
  }

  /**
   * 处理长文本，自动分片
   * @param text 原始文本
   * @param maxChunkSize 最大分块大小（字符数）
   * @returns 处理后的文本
   */
  private processLongText(text: string, maxChunkSize: number = 8000): string {
    if (text.length <= maxChunkSize) {
      return text;
    }

    console.log(`📊 文本过长（${text.length} 字符），进行分块处理`);

    // 智能分块：优先在段落边界处切分
    const paragraphs = text.split('\n\n');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk.length + paragraph.length) > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // 使用第一个分块，并提示用户文本过长
    return `[文档过长，已分块处理（共 ${chunks.length} 个分块）]\n\n${chunks[0]}\n\n[... 后续 ${chunks.length - 1} 个分块已省略，如需完整处理请分段处理 ...]`;
  }

  /**
   * 发送 HTTP 请求，支持重试机制
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // 处理 HTTP 错误
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch {
          // 如果无法解析 JSON，使用原始文本
          const text = await response.text();
          if (text) errorMessage = text;
        }

        const error: DeepSeekError = new Error(errorMessage);
        error.status = response.status;
        error.code = `HTTP_${response.status}`;

        // 根据状态码决定是否重试
        if (response.status >= 500 && retryCount < this.config.maxRetries) {
          console.log(`🔄 请求失败，重试中... (${retryCount + 1}/${this.config.maxRetries})`);
          await this.delay(1000 * (retryCount + 1)); // 指数退避
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }

        throw error;
      }

      // 解析响应数据
      const data = await response.json();
      return data as T;

    } catch (error: any) {
      clearTimeout(timeoutId);

      // 处理网络错误或超时
      if (error.name === 'AbortError') {
        const timeoutError: DeepSeekError = new Error('请求超时，请检查网络连接或稍后重试');
        timeoutError.code = 'TIMEOUT';
        throw timeoutError;
      }

      // 网络错误重试
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        if (retryCount < this.config.maxRetries) {
          console.log(`🌐 网络错误，重试中... (${retryCount + 1}/${this.config.maxRetries})`);
          await this.delay(1000 * (retryCount + 1));
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }
      }

      throw error;
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 聊天补全（支持流式和非流式）
   */
  async chatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    if (!this.isConfigured) {
      throw new Error('DeepSeek API 未配置，请检查 API Key 设置');
    }

    // 处理长文本消息
    const processedMessages = request.messages.map(msg => ({
      ...msg,
      content: this.processLongText(msg.content),
    }));

    const payload = {
      model: request.model || this.config.model,
      messages: processedMessages,
      max_tokens: request.max_tokens || this.config.maxTokens,
      temperature: request.temperature || this.config.temperature,
      top_p: request.top_p || 0.9,
      stream: request.stream || false,
    };

    return this.makeRequest<ChatCompletionResponse>('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * 流式聊天补全
   */
  async *chatCompletionStream(
    request: ChatCompletionRequest
  ): AsyncGenerator<string, void, unknown> {
    if (!this.isConfigured) {
      throw new Error('DeepSeek API 未配置，请检查 API Key 设置');
    }

    // 处理长文本消息
    const processedMessages = request.messages.map(msg => ({
      ...msg,
      content: this.processLongText(msg.content),
    }));

    const payload = {
      model: request.model || this.config.model,
      messages: processedMessages,
      max_tokens: request.max_tokens || this.config.maxTokens,
      temperature: request.temperature || this.config.temperature,
      top_p: request.top_p || 0.9,
      stream: true,
    };

    const url = `${this.config.baseUrl}/chat/completions`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`流式请求失败: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

          if (trimmedLine.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmedLine.slice(6));
              if (data.choices?.[0]?.delta?.content) {
                yield data.choices[0].delta.content;
              }
            } catch (error) {
              console.warn('解析流式响应失败:', error);
            }
          }
        }
      }

    } catch (error: any) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 提取文档大纲和思维导图结构
   */
  async extractDocumentOutline(text: string): Promise<any> {
    const processedText = this.processLongText(text);

    const prompt = `你是专业的文档解析助手，请提取以下文本的章节目录和核心思维导图结构，返回 JSON 格式，要求层级清晰、逻辑完整：

${processedText}

请按照以下 JSON 格式返回：
{
  "title": "文档标题",
  "chapters": [
    {
      "title": "章节标题",
      "level": 1,
      "sections": [
        {
          "title": "小节标题",
          "level": 2,
          "keyPoints": ["关键点1", "关键点2"]
        }
      ]
    }
  ],
  "mindmap": {
    "nodes": [
      {"id": "node1", "label": "节点标签", "level": 0}
    ],
    "connections": [
      {"source": "node1", "target": "node2", "label": "关系说明"}
    ]
  }
}`;

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: '你是一个专业的文档解析助手，请严格返回 JSON 格式的数据。' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 3000,
      temperature: 0.3,
    });

    try {
      const jsonMatch = response.choices[0].message.content.match(/```json\n([\s\S]*?)\n```/) ||
                       response.choices[0].message.content.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        const jsonText = jsonMatch[0].replace(/```json\n/, '').replace(/\n```/, '');
        return JSON.parse(jsonText);
      }
    } catch (error) {
      console.error('解析大纲 JSON 失败:', error);
    }

    // 如果解析失败，返回默认结构
    return {
      title: '文档大纲',
      chapters: [],
      mindmap: { nodes: [], connections: [] },
    };
  }

  /**
   * 通俗讲解
   */
  async explainInSimpleTerms(text: string): Promise<string> {
    const prompt = `请用通俗易懂的语言解释这段文字："${text}"，避免专业术语，适合新手理解。请用生活化的例子和比喻来说明。`;

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: '你是一个耐心的讲解者，请用最简单易懂的语言解释复杂概念。' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.5,
    });

    return response.choices[0].message.content;
  }

  /**
   * 提供具体案例
   */
  async provideExamples(text: string): Promise<string> {
    const prompt = `请针对这段文字："${text}"，举 1-2 个具体的实际案例，帮助理解。案例要贴近生活或工作实际。`;

    const response = await this.chatCompletion({
      messages: [
        { role: 'system', content: '你是一个善于举例的助教，请提供具体、贴切的案例。' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.6,
    });

    return response.choices[0].message.content;
  }

  /**
   * 流式通俗讲解
   */
  async *explainInSimpleTermsStream(text: string): AsyncGenerator<string, void, unknown> {
    const prompt = `请用通俗易懂的语言解释这段文字："${text}"，避免专业术语，适合新手理解。请用生活化的例子和比喻来说明。`;

    const stream = this.chatCompletionStream({
      messages: [
        { role: 'system', content: '你是一个耐心的讲解者，请用最简单易懂的语言解释复杂概念。' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.5,
    });

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  /**
   * 流式提供案例
   */
  async *provideExamplesStream(text: string): AsyncGenerator<string, void, unknown> {
    const prompt = `请针对这段文字："${text}"，举 1-2 个具体的实际案例，帮助理解。案例要贴近生活或工作实际。`;

    const stream = this.chatCompletionStream({
      messages: [
        { role: 'system', content: '你是一个善于举例的助教，请提供具体、贴切的案例。' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.6,
    });

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  /**
   * 验证 API Key 是否有效
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      const response = await this.chatCompletion({
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      });
      return !!response.id;
    } catch (error) {
      console.error('API Key 验证失败:', error);
      return false;
    }
  }

  /**
   * 获取配置信息
   */
  getConfigInfo(): { configured: boolean; hasApiKey: boolean; apiKeyMasked: string } {
    const maskedKey = this.config.apiKey 
      ? `${this.config.apiKey.substring(0, 10)}...${this.config.apiKey.substring(this.config.apiKey.length - 4)}`
      : '未配置';

    return {
      configured: this.isConfigured,
      hasApiKey: !!this.config.apiKey && this.config.apiKey !== 'sk-您的-API-Key-请替换这里',
      apiKeyMasked: maskedKey,
    };
  }
}

// 导出单例实例
export const deepseekClient = new DeepSeekEnhanced();
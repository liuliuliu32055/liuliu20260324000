// DeepSeek API 配置
// 注意：请从 DeepSeek 平台获取 API Key

export const DEEPSEEK_CONFIG = {
  // 基础 API 配置
  BASE_URL: 'https://api.deepseek.com',
  
  // API 端点
  ENDPOINTS: {
    CHAT_COMPLETION: '/chat/completions',
    // 长文本专用接口（如有）
    LONG_TEXT_CHAT: '/chat/completions?long_text=true',
    // 嵌入接口（如有）
    EMBEDDINGS: '/embeddings',
  },
  
  // 模型配置
  MODELS: {
    // 标准模型
    STANDARD: 'deepseek-chat',
    // 长文本专用模型
    LONG_TEXT: 'deepseek-chat-long',
    // 最新版本
    LATEST: 'deepseek-chat-latest',
  },
  
  // API Key 获取指南
  API_KEY_GUIDE: `
如何获取 DeepSeek API Key：

1. 访问 DeepSeek 平台：https://platform.deepseek.com
2. 使用手机号 15922233923 登录
3. 进入 API Keys 管理页面
4. 创建新的 API Key
5. 复制生成的 Key 并配置到 .env.local 文件：
   
   DEEPSEEK_API_KEY=你的_API_Key

6. 如有长文本专用接口，请单独申请并配置：
   
   DEEPSEEK_LONG_TEXT_API_KEY=你的长文本_API_Key
   
注意：API Key 请妥善保管，不要泄露给他人。
  `,
  
  // 默认请求配置
  DEFAULT_CONFIG: {
    max_tokens: 2000,
    temperature: 0.7,
    top_p: 0.9,
  },
  
  // 长文本处理配置
  LONG_TEXT_CONFIG: {
    chunk_size: 10000, // 分块大小（字符数）
    overlap: 500,      // 分块重叠
    max_context_length: 128000, // 最大上下文长度
  },
}
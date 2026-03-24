// DeepSeek API 配置

export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

if (!DEEPSEEK_API_KEY) {
  console.warn('警告: DEEPSEEK_API_KEY 环境变量未设置')
}

export const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1'
export const DEEPSEEK_MODEL = 'deepseek-chat'

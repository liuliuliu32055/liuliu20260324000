import { NextRequest, NextResponse } from 'next/server'
import { deepseekApi } from '@/lib/deepseek/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, model, max_tokens, temperature, stream } = body
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '缺少 messages 参数或格式错误' },
        { status: 400 }
      )
    }
    
    const response = await deepseekApi.chatCompletion({
      messages,
      model,
      max_tokens,
      temperature,
      stream,
    })
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('DeepSeek API 错误:', error)
    
    if (error.message.includes('API Key')) {
      return NextResponse.json(
        { 
          error: 'API Key 配置错误',
          guide: '请按照 README 中的指南获取和配置 DeepSeek API Key'
        },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || '服务器错误' },
      { status: 500 }
    )
  }
}
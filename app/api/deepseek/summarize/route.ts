import { NextRequest, NextResponse } from 'next/server'
import { deepseekApi } from '@/lib/deepseek/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, model, max_length } = body
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '缺少 text 参数或格式错误' },
        { status: 400 }
      )
    }
    
    const response = await deepseekApi.summarizeText({
      text,
      model,
      max_length,
    })
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('DeepSeek 总结错误:', error)
    
    return NextResponse.json(
      { 
        error: error.message || '总结失败',
        ...(error.message.includes('API Key') && {
          guide: '请按照 README 中的指南获取和配置 DeepSeek API Key'
        })
      },
      { status: 500 }
    )
  }
}
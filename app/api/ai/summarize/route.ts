import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/supabase/server'
import { deepseekAI } from '@/lib/ai/deepseek'

export async function POST(request: NextRequest) {
  try {
    // 检查用户登录状态
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { text, maxLength = 500, language = 'zh' } = body

    if (!text) {
      return NextResponse.json(
        { error: '缺少文本内容' },
        { status: 400 }
      )
    }

    // 检查 AI 配置
    const usageInfo = deepseekAI.getUsageInfo()
    if (!usageInfo.configured) {
      return NextResponse.json(
        { 
          error: 'AI 服务未配置',
          guide: '请配置 DeepSeek API Key 以使用 AI 功能'
        },
        { status: 503 }
      )
    }

    // 生成文档总结
    const summary = await deepseekAI.summarizeDocument({
      text,
      maxLength,
      language
    })

    return NextResponse.json({
      success: true,
      summary,
      metadata: {
        originalLength: text.length,
        language,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('文档总结失败:', error)

    // 处理特定的错误类型
    if (error.message.includes('API 未配置')) {
      return NextResponse.json(
        { 
          error: 'AI 服务配置错误',
          guide: '请检查 DEEPSEEK_API_KEY 环境变量配置'
        },
        { status: 503 }
      )
    }

    if (error.message.includes('请求超时')) {
      return NextResponse.json(
        { error: 'AI 处理超时，请稍后重试' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: error.message || '文档总结失败' },
      { status: 500 }
    )
  }
}
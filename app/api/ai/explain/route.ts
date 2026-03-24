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
    const { text, targetAudience = 'intermediate' } = body

    if (!text) {
      return NextResponse.json(
        { error: '缺少文本内容' },
        { status: 400 }
      )
    }

    // 验证受众类型
    const validAudiences = ['beginner', 'intermediate', 'expert']
    if (!validAudiences.includes(targetAudience)) {
      return NextResponse.json(
        { error: '无效的受众类型' },
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

    // 生成通俗讲解
    const explanation = await deepseekAI.explainText(text, targetAudience as any)

    return NextResponse.json({
      success: true,
      explanation,
      metadata: {
        originalTextLength: text.length,
        targetAudience,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('通俗讲解生成失败:', error)

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
      { error: error.message || '通俗讲解生成失败' },
      { status: 500 }
    )
  }
}
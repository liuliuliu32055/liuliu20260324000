import { NextRequest, NextResponse } from 'next/server'
import { DeepSeekAI } from '@/lib/ai/deepseek'

const deepseekAI = new DeepSeekAI()

export async function POST(request: NextRequest) {
  console.log('[API] ========== AI API 请求开始 ==========')

  try {
    const body = await request.json()
    console.log('[API] 请求体:', JSON.stringify(body, null, 2))

    const { action, text, context } = body

    // 检查 API 配置
    const usageInfo = deepseekAI.getUsageInfo()
    console.log('[API] DeepSeek 配置状态:', usageInfo)

    if (!usageInfo.configured) {
      console.error('[API] DeepSeek API 未配置')
      return NextResponse.json(
        { error: 'DeepSeek API 未配置', message: '请在服务器环境变量中设置 DEEPSEEK_API_KEY' },
        { status: 500 }
      )
    }

    let result

    console.log('[API] 执行操作:', action)

    switch (action) {
      case 'explain':
        console.log('[API] 开始解释文本，文本长度:', text.length)
        result = await deepseekAI.explainText(text, 'beginner')
        console.log('[API] 解释完成，结果长度:', result.length)
        break
      case 'example':
        console.log('[API] 开始提供例子，文本长度:', text.length)
        result = await deepseekAI.provideExample(text, context)
        console.log('[API] 例子生成完成，结果长度:', result.length)
        break
      case 'summary':
        console.log('[API] 开始总结文本，文本长度:', text.length)
        const summaryResult = await deepseekAI.summarizeDocument({
          text: text,
          maxLength: 300,
          language: 'zh'
        })
        console.log('[API] 总结完成:', summaryResult)
        result = `总结：${summaryResult.summary}\n\n关键要点：\n${summaryResult.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}`
        break
      default:
        console.error('[API] 不支持的操作:', action)
        return NextResponse.json(
          { error: '无效的操作', message: `不支持的操作: ${action}` },
          { status: 400 }
        )
    }

    console.log('[API] 请求成功，返回数据长度:', result.length)
    console.log('[API] ========== AI API 请求完成 ==========')

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('[API] ========== AI API 错误 ==========')
    console.error('[API] 错误类型:', error.name)
    console.error('[API] 错误信息:', error.message)
    console.error('[API] 错误堆栈:', error.stack)

    return NextResponse.json(
      { error: 'AI 请求失败', message: error.message || '未知错误' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const usageInfo = deepseekAI.getUsageInfo()
  return NextResponse.json({
    configured: usageInfo.configured,
    hasApiKey: usageInfo.hasApiKey
  })
}

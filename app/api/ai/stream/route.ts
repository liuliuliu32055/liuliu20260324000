import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/supabase/server'
import { deepseekIntegration } from '@/lib/ai/deepseek-integration'

/**
 * DeepSeek 流式 API 接口
 * 支持打字机效果的流式响应
 */

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
    const { 
      text, 
      action, 
      documentId,
      temperature = 0.7 
    } = body

    if (!text || !action) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 验证 action 类型
    const validActions = ['explain', 'example', 'summary']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: '无效的 action 类型' },
        { status: 400 }
      )
    }

    // 根据 action 构建不同的提示词
    let messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = []

    switch (action) {
      case 'explain':
        messages = [
          {
            role: 'system',
            content: '你是一个耐心的讲解者，请用通俗易懂的语言解释复杂概念。避免专业术语，适合新手理解。'
          },
          {
            role: 'user',
            content: `请用通俗易懂的语言解释这段文字："${text}"，用生活化的例子和比喻来说明。`
          }
        ]
        break

      case 'example':
        messages = [
          {
            role: 'system',
            content: '你是一个善于举例的助教，请提供具体、贴切的案例来帮助理解。'
          },
          {
            role: 'user',
            content: `请针对这段文字："${text}"，举 1-2 个具体的实际案例，帮助理解。案例要贴近生活或工作实际。`
          }
        ]
        break

      case 'summary':
        messages = [
          {
            role: 'system',
            content: '你是一个专业的文档总结助手，请简洁明了地总结内容。'
          },
          {
            role: 'user',
            content: `请总结以下内容，提取关键要点："${text}"`
          }
        ]
        break
    }

    // 创建流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 发送流式响应开始标记
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', action })}\n\n`))

          // 获取流式响应
          const streamGenerator = deepseekIntegration.streamChatResponse(messages, {
            temperature,
            signal: request.signal
          })

          for await (const chunk of streamGenerator) {
            // 发送流式数据块
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`)
            )
          }

          // 发送流式响应结束标记
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`))
          controller.close()
        } catch (error: any) {
          console.error('流式响应错误:', error)

          // 发送错误信息
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: error.message || 'AI 处理失败'
            })}\n\n`)
          )
          controller.close()
        }
      },
      cancel() {
        // 清理资源
        console.log('流式响应被取消')
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error: any) {
    console.error('API 请求失败:', error)

    return NextResponse.json(
      { 
        error: error.message || '服务器错误',
        ...(error.message.includes('API') && {
          guide: '请检查 DeepSeek API Key 配置'
        })
      },
      { status: 500 }
    )
  }
}

// 处理 GET 请求，返回连接状态
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 检查 API 连接状态
    const status = await deepseekIntegration.getConnectionStatus()

    return NextResponse.json({
      success: true,
      status,
      config: deepseekIntegration.getConfigSummary(),
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('获取 API 状态失败:', error)

    return NextResponse.json(
      { error: error.message || '获取状态失败' },
      { status: 500 }
    )
  }
}
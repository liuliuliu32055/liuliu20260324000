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
    const { question, context, documentId } = body

    if (!question) {
      return NextResponse.json(
        { error: '缺少问题内容' },
        { status: 400 }
      )
    }

    if (!context && !documentId) {
      return NextResponse.json(
        { error: '缺少上下文或文档ID' },
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

    // 如果有文档ID，从数据库获取上下文
    let finalContext = context
    if (documentId && !context) {
      const supabase = await createClient()
      const { data: document, error } = await supabase
        .from('documents')
        .select('parsed_text')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        return NextResponse.json(
          { error: '文档不存在或无权访问' },
          { status: 404 }
        )
      }

      if (!document.parsed_text) {
        return NextResponse.json(
          { error: '文档尚未解析完成' },
          { status: 400 }
        )
      }

      finalContext = document.parsed_text
    }

    // 智能问答
    const answer = await deepseekAI.answerQuestion({
      question,
      context: finalContext
    })

    // 记录问答历史（可选）
    if (documentId) {
      try {
        const supabase = await createClient()
        await supabase
          .from('qa_history')
          .insert({
            user_id: user.id,
            document_id: documentId,
            question,
            answer: answer.answer,
            confidence: answer.confidence,
            metadata: {
              supporting_paragraphs: answer.supportingParagraphs,
              total_tokens: answer.totalTokens
            }
          })
      } catch (historyError) {
        console.warn('记录问答历史失败:', historyError)
      }
    }

    return NextResponse.json({
      success: true,
      answer,
      metadata: {
        questionLength: question.length,
        contextLength: finalContext?.length || 0,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('智能问答失败:', error)

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
      { error: error.message || '智能问答失败' },
      { status: 500 }
    )
  }
}

async function createClient() {
  const { createClient } = await import('@/lib/supabase/server')
  return createClient()
}
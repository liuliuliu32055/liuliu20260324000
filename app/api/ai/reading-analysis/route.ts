import { NextRequest, NextResponse } from 'next/server'
import { DEEPSEEK_API_KEY } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const { text, mode, context } = await request.json()

    console.log('[AI Reading Analysis] ========== 开始逐段精读分析 ==========')
    console.log('[AI Reading Analysis] 模式:', mode)
    console.log('[AI Reading Analysis] 文本长度:', text.length)
    console.log('[AI Reading Analysis] 文本内容:', text.substring(0, 100))

    if (!text) {
      throw new Error('选中的文本不能为空')
    }

    // 根据模式构建不同的提示词
    const isStudent = mode === 'student'

    const prompt = isStudent
      ? `作为学生学习助手，请对以下段落进行深度精读分析，帮助学生深度理解。

段落内容: ${text}

请以 JSON 格式返回分析结果，包含以下字段：
{
  "explanation": "深度解析内容，用通俗易懂的语言解释核心概念和原理",
  "keyPoints": ["关键要点1", "关键要点2", "关键要点3"],
  "examples": ["举例说明1", "举例说明2"],
  "questions": ["思考问题1", "思考问题2"]
}

只返回 JSON，不要其他说明文字。`
      : `作为职场工作助手，请对以下段落进行要点提炼，帮助快速获取关键信息。

段落内容: ${text}

请以 JSON 格式返回分析结果，包含以下字段：
{
  "explanation": "核心要点提炼，简明扼要地说明主要信息和价值",
  "keyPoints": ["关键信息1", "关键信息2", "关键信息3"],
  "actionItems": ["行动建议1", "行动建议2"]
}

只返回 JSON，不要其他说明文字。`

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: isStudent
              ? '你是一位经验丰富的学习导师，擅长将复杂的概念用通俗易懂的方式解释清楚，善于举例说明，帮助学生建立知识体系。'
              : '你是一位高效的工作助手，擅长快速提炼关键信息，给出实用的行动建议，帮助职场人士提高工作效率。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    })

    const result = await response.json()

    console.log('[AI Reading Analysis] API 响应状态:', response.status)

    if (result.error) {
      throw new Error(result.error.message || 'DeepSeek API 调用失败')
    }

    const aiResponse = result.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('AI 响应为空')
    }

    // 解析 JSON 响应
    let analysisResult
    try {
      // 尝试提取 JSON（可能包含在 markdown 代码块中）
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
                       aiResponse.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[1] || jsonMatch[0])
      } else {
        analysisResult = JSON.parse(aiResponse)
      }

      console.log('[AI Reading Analysis] ========== 分析完成 ==========')
      console.log('[AI Reading Analysis] 关键要点数:', analysisResult.keyPoints?.length || 0)

      return NextResponse.json({
        success: true,
        data: analysisResult
      })
    } catch (error) {
      console.error('[AI Reading Analysis] 解析 AI 响应失败:', error)
      console.error('[AI Reading Analysis] 原始响应:', aiResponse)

      return NextResponse.json(
        {
          success: false,
          error: '解析 AI 响应失败'
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('[AI Reading Analysis] ========== 分析失败 ==========')
    console.error('[AI Reading Analysis] 错误信息:', error.message)
    console.error('[AI Reading Analysis] 错误堆栈:', error.stack)

    return NextResponse.json(
      {
        success: false,
        error: error.message || '逐段精读分析失败'
      },
      { status: 500 }
    )
  }
}

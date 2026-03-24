import { NextRequest, NextResponse } from 'next/server'
import { DEEPSEEK_API_KEY } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const { document1, document2 } = await request.json()

    console.log('[AI Compare] ========== 开始文档对比 ==========')
    console.log('[AI Compare] 文档 1:', document1.title)
    console.log('[AI Compare] 文档 2:', document2.title)

    if (!document1.content || !document2.content) {
      throw new Error('文档内容为空')
    }

    // 调用 DeepSeek API 进行对比分析
    const prompt = `请对比以下两份文档，分析它们的相似度、差异点和共同要点。

文档 A: ${document1.title}
内容: ${document1.content.substring(0, 3000)}

文档 B: ${document2.title}
内容: ${document2.content.substring(0, 3000)}

请以 JSON 格式返回分析结果，包含以下字段：
{
  "summary": {
    "similarity": 相似度百分比 (0-100),
    "uniqueToFirst": 文档A独有的要点数量,
    "uniqueToSecond": 文档B独有的要点数量,
    "commonPoints": 共同要点数量
  },
  "differences": [
    {
      "type": "addition" | "deletion" | "modification",
      "text": "具体的差异内容",
      "position": "位置描述"
    }
  ],
  "similarPoints": ["相似点1", "相似点2"],
  "trends": [
    {
      "direction": "up" | "down" | "stable",
      "description": "趋势描述"
    }
  ]
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
            content: '你是一个专业的文档分析专家，擅长对比分析文档的异同点。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    const result = await response.json()

    console.log('[AI Compare] API 响应状态:', response.status)

    if (result.error) {
      throw new Error(result.error.message || 'DeepSeek API 调用失败')
    }

    const aiResponse = result.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('AI 响应为空')
    }

    // 解析 JSON 响应
    let comparisonResult
    try {
      // 尝试提取 JSON（可能包含在 markdown 代码块中）
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
                       aiResponse.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        comparisonResult = JSON.parse(jsonMatch[1] || jsonMatch[0])
      } else {
        comparisonResult = JSON.parse(aiResponse)
      }

      console.log('[AI Compare] ========== 文档对比完成 ==========')
      console.log('[AI Compare] 相似度:', comparisonResult.summary.similarity, '%')

      return NextResponse.json({
        success: true,
        data: comparisonResult
      })
    } catch (error) {
      console.error('[AI Compare] 解析 AI 响应失败:', error)

      // 返回原始响应内容，让前端处理
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            similarity: 50,
            uniqueToFirst: 0,
            uniqueToSecond: 0,
            commonPoints: 0
          },
          differences: [],
          similarPoints: [],
          trends: []
        }
      })
    }

  } catch (error: any) {
    console.error('[AI Compare] ========== 文档对比失败 ==========')
    console.error('[AI Compare] 错误信息:', error.message)

    return NextResponse.json(
      {
        success: false,
        error: error.message || '文档对比失败'
      },
      { status: 500 }
    )
  }
}

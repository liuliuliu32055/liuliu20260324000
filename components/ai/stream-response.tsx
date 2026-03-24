'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreamResponseProps {
  text: string
  action: 'explain' | 'example' | 'summary'
  documentId?: string
  onComplete?: (response: string) => void
  onError?: (error: string) => void
  className?: string
}

export function StreamResponse({
  text,
  action,
  documentId,
  onComplete,
  onError,
  className
}: StreamResponseProps) {
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [speed, setSpeed] = useState(30) // 打字机速度（ms/字符）
  const controllerRef = useRef<AbortController | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 根据 action 获取标题
  const getActionTitle = () => {
    switch (action) {
      case 'explain':
        return '通俗讲解'
      case 'example':
        return '举个例子'
      case 'summary':
        return '内容总结'
      default:
        return 'AI 分析'
    }
  }

  // 处理流式响应
  const processStreamResponse = async () => {
    setIsLoading(true)
    setError(null)
    setResponse('')
    setIsComplete(false)

    // 创建 AbortController 用于取消请求
    controllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          action,
          documentId,
          temperature: 0.7
        }),
        signal: controllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`请求失败: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('无法获取响应流')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

          try {
            const data = JSON.parse(trimmedLine.slice(6))

            switch (data.type) {
              case 'start':
                // 响应开始
                break

              case 'chunk':
                // 处理文本块，实现打字机效果
                await processChunkWithTypewriter(data.content)
                break

              case 'complete':
                // 响应完成
                setIsComplete(true)
                if (onComplete) {
                  onComplete(response)
                }
                break

              case 'error':
                // 处理错误
                throw new Error(data.error || 'AI 处理失败')
            }
          } catch (parseError) {
            console.warn('解析流数据失败:', parseError)
          }
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('请求已取消')
      } else {
        setError(error.message || 'AI 处理失败')
        if (onError) {
          onError(error.message || 'AI 处理失败')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 打字机效果处理文本块
  const processChunkWithTypewriter = async (chunk: string) => {
    return new Promise<void>(resolve => {
      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex < chunk.length) {
          setResponse(prev => prev + chunk[currentIndex])
          currentIndex++

          // 自动滚动到底部
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
          }
        } else {
          clearInterval(interval)
          resolve()
        }
      }, speed)
    })
  }

  // 开始处理
  const startProcessing = () => {
    processStreamResponse()
  }

  // 取消处理
  const cancelProcessing = () => {
    if (controllerRef.current) {
      controllerRef.current.abort()
      setIsLoading(false)
      setError('请求已取消')
    }
  }

  // 调整打字机速度
  const adjustSpeed = (newSpeed: number) => {
    setSpeed(newSpeed)
  }

  // 复制响应内容
  const copyResponse = () => {
    navigator.clipboard.writeText(response)
      .then(() => {
        alert('已复制到剪贴板')
      })
      .catch(() => {
        alert('复制失败')
      })
  }

  // 保存响应
  const saveResponse = async () => {
    try {
      if (documentId) {
        const noteResponse = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documentId,
            content: response,
            tags: [action]
          })
        })

        if (noteResponse.ok) {
          alert('已保存到笔记')
        } else {
          throw new Error('保存失败')
        }
      } else {
        alert('需要文档ID才能保存到笔记')
      }
    } catch (error) {
      alert('保存失败')
    }
  }

  // 组件挂载时自动开始（可选）
  useEffect(() => {
    // 自动开始处理
    startProcessing()

    // 清理函数
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
    }
  }, [text, action])

  return (
    <div className={cn('space-y-4', className)}>
      {/* 标题和控制栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getActionTitle()}
          </h3>
          {isLoading && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              处理中...
            </span>
          )}
          {isComplete && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              完成
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!isLoading && !isComplete && !error && (
            <button
              onClick={startProcessing}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              开始分析
            </button>
          )}
          {isLoading && (
            <button
              onClick={cancelProcessing}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              取消
            </button>
          )}
        </div>
      </div>

      {/* 速度控制 */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>显示速度：</span>
        <div className="flex space-x-2">
          <button
            onClick={() => adjustSpeed(50)}
            className={cn(
              'px-2 py-1 rounded',
              speed === 50 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            慢
          </button>
          <button
            onClick={() => adjustSpeed(30)}
            className={cn(
              'px-2 py-1 rounded',
              speed === 30 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            中
          </button>
          <button
            onClick={() => adjustSpeed(10)}
            className={cn(
              'px-2 py-1 rounded',
              speed === 10 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            快
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <div>
              <p className="text-red-600 dark:text-red-400 font-medium">
                处理失败
              </p>
              <p className="text-red-500 dark:text-red-500 text-sm mt-1">
                {error}
              </p>
              <button
                onClick={startProcessing}
                className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 响应内容区域 */}
      <div
        ref={containerRef}
        className={cn(
          'min-h-[200px] max-h-[400px] overflow-y-auto p-4 rounded-lg border',
          'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900',
          'border-blue-200 dark:border-blue-800',
          'transition-all duration-300',
          isLoading && 'animate-pulse'
        )}
      >
        {/* 加载状态 */}
        {isLoading && response.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              AI 助手正在思考中...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              这可能需要几秒钟时间
            </p>
          </div>
        )}

        {/* 响应内容 */}
        {response && (
          <div className="space-y-4">
            <div className="prose prose-blue max-w-none dark:prose-invert">
              <p className="whitespace-pre-wrap leading-relaxed">
                {response}
                {isLoading && (
                  <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse" />
                )}
              </p>
            </div>

            {/* 光标效果 */}
            {isLoading && (
              <div className="flex items-center">
                <div className="h-4 w-2 bg-blue-500 animate-pulse" />
              </div>
            )}
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && !response && !error && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>点击"开始分析"按钮获取 AI 解答</p>
            <p className="text-sm mt-1">或等待自动开始处理</p>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      {(response || isComplete) && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyResponse}
            className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            复制内容
          </button>
          <button
            onClick={saveResponse}
            className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            保存到笔记
          </button>
          <button
            onClick={startProcessing}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            重新分析
          </button>
        </div>
      )}

      {/* 状态信息 */}
      <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-between">
        <div>
          {response.length > 0 && (
            <span>已生成 {response.length} 字符</span>
          )}
        </div>
        <div>
          {isLoading && <span>正在处理中...</span>}
          {isComplete && <span>✓ 分析完成</span>}
        </div>
      </div>
    </div>
  )
}
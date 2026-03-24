'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Download } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  documentId?: string
}

interface ChatInterfaceProps {
  documentId?: string
  documentTitle?: string
  initialMessages?: Message[]
  className?: string
}

export function ChatInterface({
  documentId,
  documentTitle = '文档',
  initialMessages = [],
  className,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      documentId,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/deepseek/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `你正在分析一个文档："${documentTitle}"。请基于文档内容回答用户的问题。如果问题与文档无关，请说明。`
            },
            {
              role: 'user',
              content: `文档内容（已总结）：\n[这是文档的总结内容，实际应替换为真实文档内容]\n\n用户问题：${input.trim()}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error('请求失败')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date(),
        documentId,
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // 保存聊天记录到数据库
      if (documentId) {
        try {
          await fetch('/api/chats/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentId,
              question: input.trim(),
              answer: data.choices[0].message.content,
            }),
          })
        } catch (saveError) {
          console.warn('保存聊天记录失败:', saveError)
        }
      }
      
    } catch (error) {
      console.error('聊天请求失败:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: '抱歉，请求处理时出现错误。请检查网络连接或稍后重试。',
        timestamp: new Date(),
        documentId,
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const exportChat = () => {
    const chatContent = messages
      .map(msg => {
        const role = msg.role === 'user' ? '用户' : 'AI助手'
        const time = formatDate(msg.timestamp)
        return `[${time}] ${role}:\n${msg.content}\n`
      })
      .join('\n---\n\n')
    
    const blob = new Blob([chatContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat_${documentTitle}_${formatDate(new Date())}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn('flex flex-col h-full bg-background rounded-lg border', className)}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">与文档对话</h2>
          <p className="text-sm text-muted-foreground">
            {documentTitle}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={exportChat}
            className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>导出对话</span>
          </button>
        )}
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Bot className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">开始与文档对话</h3>
            <p className="text-muted-foreground max-w-md">
              输入问题来了解文档内容。AI助手将基于文档内容回答你的问题。
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium mb-1">文档总结</p>
                <p className="text-muted-foreground">请总结一下这个文档的主要内容</p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium mb-1">关键要点</p>
                <p className="text-muted-foreground">这个文档有哪些重要的关键点？</p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium mb-1">数据分析</p>
                <p className="text-muted-foreground">文档中提到了哪些数据或统计信息？</p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium mb-1">建议措施</p>
                <p className="text-muted-foreground">基于文档内容，你有什么建议？</p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex space-x-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                </div>
              )}
              
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-4 space-y-2',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={cn(
                    'font-medium',
                    message.role === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}>
                    {message.role === 'user' ? '你' : 'AI助手'}
                  </span>
                  <span className={cn(
                    message.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground/80'
                  )}>
                    {formatDate(message.timestamp)}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="p-2 rounded-full bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="max-w-[80%] rounded-lg p-4 bg-muted">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">AI助手正在思考...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入关于文档的问题..."
              className="w-full min-h-[60px] max-h-[120px] px-4 py-3 pr-12 rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 bottom-3 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          按 Enter 发送，Shift + Enter 换行
        </div>
      </form>
    </div>
  )
}
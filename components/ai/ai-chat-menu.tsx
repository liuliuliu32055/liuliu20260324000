'use client'

import { MessageCircle, Zap, Lightbulb, FileText, Highlighter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIChatMenuProps {
  position: { x: number; y: number }
  selectedText: string
  onExplain: () => void
  onExample: () => void
  onSummary: () => void
  onAddNote: () => void
  onHighlight: () => void
}

export function AIChatMenu({
  position,
  selectedText,
  onExplain,
  onExample,
  onSummary,
  onAddNote,
  onHighlight
}: AIChatMenuProps) {
  const menuWidth = 180
  const menuHeight = 40
  const padding = 10

  // 计算菜单位置，确保不会超出屏幕
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  
  let adjustedX = position.x
  let adjustedY = position.y + 20 // 在选中文本下方显示

  // 如果菜单超出右侧边界，向左调整
  if (adjustedX + menuWidth > viewportWidth) {
    adjustedX = viewportWidth - menuWidth - padding
  }

  // 如果菜单超出底部边界，向上调整
  if (adjustedY + menuHeight > viewportHeight) {
    adjustedY = position.y - menuHeight - 20
  }

  // 如果菜单超出左侧边界，向右调整
  if (adjustedX < padding) {
    adjustedX = padding
  }

  // 如果菜单超出顶部边界，向下调整
  if (adjustedY < padding) {
    adjustedY = padding
  }

  const menuItems = [
    {
      id: 'explain',
      label: '通俗讲解',
      icon: MessageCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      action: onExplain
    },
    {
      id: 'example',
      label: '举个例子',
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      action: onExample
    },
    {
      id: 'summary',
      label: '总结',
      icon: Lightbulb,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      action: onSummary
    },
    {
      id: 'note',
      label: '添加笔记',
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      action: onAddNote
    },
    {
      id: 'highlight',
      label: '高亮',
      icon: Highlighter,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      action: onHighlight
    }
  ]

  return (
    <div
      id="ai-chat-menu"
      className="fixed z-50 animate-in fade-in slide-in-from-top-1 duration-200"
      style={{
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
      }}
    >
      {/* 菜单箭头 */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <div className="border-8 border-transparent border-b-gray-800 dark:border-b-gray-700" />
      </div>

      {/* 菜单内容 */}
      <div className="bg-gray-800 dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-700 min-w-[180px]">
        {/* 选中文本预览 */}
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="text-xs text-gray-400 mb-1">已选中文字</div>
          <div className="text-sm text-white line-clamp-2">
            {selectedText.length > 60 ? `${selectedText.substring(0, 60)}...` : selectedText}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="p-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-md",
                  "hover:bg-gray-700 transition-colors mb-1 last:mb-0"
                )}
              >
                <div className={cn("p-1.5 rounded", item.bgColor)}>
                  <Icon className={cn("h-4 w-4", item.color)} />
                </div>
                <span className="text-sm text-white">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* DeepSeek 标识 */}
        <div className="px-4 py-2 border-t border-gray-700 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-b-lg">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <span className="text-xs text-blue-300">Powered by DeepSeek AI</span>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ZoomIn, ZoomOut, RefreshCw, Download, Maximize2, Minus, Plus, Brain, Network } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MindMapNode {
  id: string
  label: string
  children?: MindMapNode[]
  color?: string
  size?: number
  x?: number
  y?: number
  parent?: MindMapNode
}

interface MindMapProps {
  documentId: string
  documentTitle?: string
  documentContent?: string
}

export function MindMap({ documentId, documentTitle, documentContent }: MindMapProps) {
  const [zoom, setZoom] = useState(1)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null)
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // 辅助函数：统计节点总数
  const countNodes = useCallback((node: MindMapNode): number => {
    let count = 1
    if (node.children) {
      count += node.children.reduce((sum, child) => sum + countNodes(child), 0)
    }
    return count
  }, [])

  // 辅助函数：计算深度
  const calculateDepth = useCallback((node: MindMapNode, depth: number = 0): number => {
    if (!node.children || node.children.length === 0) {
      return depth
    }
    return Math.max(...node.children.map(child => calculateDepth(child, depth + 1)))
  }, [])

  // 辅助函数：获取选中的节点信息
  const getSelectedNodeInfo = useCallback((): { node: MindMapNode | null; depth: number } => {
    if (!selectedNode || !mindMapData) return { node: null, depth: 0 }

    let foundNode: MindMapNode | null = null
    let foundDepth = 0

    const findNode = (node: MindMapNode, depth: number = 0): boolean => {
      if (node.id === selectedNode) {
        foundNode = node
        foundDepth = depth
        return true
      }
      if (node.children) {
        for (const child of node.children) {
          if (findNode(child, depth + 1)) return true
        }
      }
      return false
    }

    findNode(mindMapData)
    return { node: foundNode, depth: foundDepth }
  }, [selectedNode, mindMapData])

  // 根据文档内容生成思维导图
  useEffect(() => {
    if (documentTitle || documentContent) {
      const data = generateMindMapFromContent()
      setMindMapData(data)
      // 计算节点位置
      setTimeout(() => {
        calculateNodePositions(data)
      }, 100)
    }
  }, [documentTitle, documentContent])

  const generateMindMapFromContent = (): MindMapNode => {
    const title = documentTitle || '文档大纲'
    const content = documentContent || ''

    // 如果有实际内容，根据内容生成思维导图
    if (content.length > 100) {
      return parseDocumentStructure(content, title)
    }
    // 使用默认数据
    return getDefaultMindMap(title)
  }

  const parseDocumentStructure = (content: string, title: string): MindMapNode => {
    const root: MindMapNode = {
      id: 'root',
      label: title,
      color: 'bg-gradient-to-r from-blue-500 to-purple-500',
      children: []
    }

    const lines = content.split('\n')
    const chapterCount = Math.min(8, Math.floor(lines.length / 20)) // 动态计算章节数量

    const colors = [
      'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
      'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
      'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
      'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
      'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
      'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700',
      'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700',
      'bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700'
    ]

    let currentChapter = 0
    const chapterPatterns = [/^#+\s/, /^第[一二三四五六七八九十零百千万]+[章节]/, /^\d+[\.、]/]

    for (let i = 0; i < lines.length && currentChapter < chapterCount; i++) {
      const line = lines[i].trim()
      const isChapter = chapterPatterns.some(pattern => pattern.test(line))

      if (isChapter) {
        const label = line.replace(/^#+\s*/, '').replace(/^第[一二三四五六七八九十零百千万]+[章节]\s*/, '').replace(/^\d+[\.、]\s*/, '')
        if (label.length > 0 && label.length < 50) {
          const chapterId = `ch-${i}`
          const chapterNode: MindMapNode = {
            id: chapterId,
            label: label,
            color: colors[currentChapter % colors.length],
            children: [],
            parent: root
          }
          root.children!.push(chapterNode)

          // 查找子要点
          let subChildIndex = 0
          for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
            const subLine = lines[j].trim()

            // 检测二级标题或列表项
            if ((subLine.startsWith('## ') || subLine.startsWith('### ') || subLine.startsWith('- ') || subLine.startsWith('• ') || /^\d+\./.test(subLine)) &&
                chapterNode.children!.length < 4) {
              const subLabel = subLine.replace(/#{1,3}\s*/, '').replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '')
              if (subLabel.length > 0 && subLabel.length < 40) {
                chapterNode.children!.push({
                  id: `${chapterId}-sub-${subChildIndex++}`,
                  label: subLabel,
                  size: 20,
                  parent: chapterNode
                })
              }
            }
            // 遇到新的一级标题则停止
            else if (lines[j].trim() && chapterPatterns.some(pattern => pattern.test(lines[j].trim()))) {
              break
            }
          }

          currentChapter++
        }
      }
    }

    // 如果没有找到章节，使用段落作为节点
    if (root.children!.length === 0) {
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 30)
      paragraphs.slice(0, 6).forEach((para, index) => {
        const label = para.trim().substring(0, 40) + (para.length > 40 ? '...' : '')
        root.children!.push({
          id: `para-${index}`,
          label: label,
          color: colors[index % colors.length],
          size: 22,
          parent: root
        })
      })
    }

    return root
  }

  const getDefaultMindMap = (title: string): MindMapNode => {
    return {
      id: 'root',
      label: title,
      color: 'bg-gradient-to-r from-blue-500 to-purple-500',
      children: [
        {
          id: 'ch1',
          label: '核心概念',
          color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
          children: [
            { id: '1.1', label: '基础定义', size: 20 },
            { id: '1.2', label: '核心要素', size: 20 },
            { id: '1.3', label: '主要特征', size: 20 }
          ]
        },
        {
          id: 'ch2',
          label: '技术原理',
          color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
          children: [
            { id: '2.1', label: '基本架构', size: 20 },
            { id: '2.2', label: '工作流程', size: 20 },
            { id: '2.3', label: '关键算法', size: 20 }
          ]
        },
        {
          id: 'ch3',
          label: '应用场景',
          color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
          children: [
            { id: '3.1', label: '行业应用', size: 20 },
            { id: '3.2', label: '典型案例', size: 20 },
            { id: '3.3', label: '实际效果', size: 20 }
          ]
        },
        {
          id: 'ch4',
          label: '发展趋势',
          color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
          children: [
            { id: '4.1', label: '技术演进', size: 20 },
            { id: '4.2', label: '市场前景', size: 20 },
            { id: '4.3', label: '未来展望', size: 20 }
          ]
        },
        {
          id: 'ch5',
          label: '挑战与机遇',
          color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
          children: [
            { id: '5.1', label: '当前挑战', size: 20 },
            { id: '5.2', label: '解决方案', size: 20 },
            { id: '5.3', label: '发展机遇', size: 20 }
          ]
        }
      ]
    }
  }

  // 计算节点位置（树形布局）
  const calculateNodePositions = (root: MindMapNode) => {
    const positions = new Map<string, { x: number; y: number }>()
    const nodeWidth = 160
    const nodeHeight = 60
    const horizontalGap = 80
    const verticalGap = 40

    // 计算树的深度和每层的节点数
    const traverseTree = (node: MindMapNode, depth: number, levelNodes: Map<number, number[]>) => {
      if (!levelNodes.has(depth)) {
        levelNodes.set(depth, [])
      }
      levelNodes.get(depth)!.push(node.id)

      if (node.children) {
        node.children.forEach(child => traverseTree(child, depth + 1, levelNodes))
      }
    }

    const levelNodes = new Map<number, number[]>()
    traverseTree(root, 0, levelNodes)

    // 为每个节点分配位置
    const assignPositions = (node: MindMapNode, depth: number, index: number, parentY: number) => {
      const x = depth * (nodeWidth + horizontalGap)
      let y

      if (depth === 0) {
        // 根节点居中
        y = 300
      } else if (depth === 1) {
        // 一级节点均匀分布
        const totalChildren = root.children!.length
        const availableHeight = totalChildren * (nodeHeight + verticalGap)
        y = 150 + index * (availableHeight / totalChildren)
      } else {
        // 二级节点在父节点下方
        y = parentY + index * nodeHeight + verticalGap / 2
      }

      positions.set(node.id, { x, y })

      if (node.children) {
        node.children.forEach((child, i) => {
          assignPositions(child, depth + 1, i, y)
        })
      }
    }

    assignPositions(root, 0, 0, 300)
    setNodePositions(positions)
  }

  const renderConnections = () => {
    if (!mindMapData) return null

    const lines: React.ReactNode[] = []

    const renderNodeConnections = (node: MindMapNode) => {
      const parentPos = nodePositions.get(node.id)
      if (!parentPos) return

      if (node.children) {
        node.children.forEach(child => {
          const childPos = nodePositions.get(child.id)
          if (!childPos) return

          const startX = parentPos.x + 160
          const startY = parentPos.y + 30
          const endX = childPos.x
          const endY = childPos.y + 30

          // 贝塞尔曲线连接
          const controlX1 = startX + (endX - startX) * 0.5
          const controlX2 = endX - (endX - startX) * 0.5

          lines.push(
            <path
              key={`conn-${node.id}-${child.id}`}
              d={`M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`}
              fill="none"
              stroke="rgba(99, 102, 241, 0.5)"
              strokeWidth="2"
              strokeDasharray={child.children?.length ? "" : "5,5"}
              className="transition-all duration-300"
            />
          )

          renderNodeConnections(child)
        })
      }
    }

    renderNodeConnections(mindMapData)
    return lines
  }

  const renderNodes = () => {
    if (!mindMapData) return null

    const nodes: React.ReactNode[] = []

    const renderNode = (node: MindMapNode, depth: number = 0) => {
      const pos = nodePositions.get(node.id)
      if (!pos) return

      const isSelected = selectedNode === node.id
      const isRoot = depth === 0

      nodes.push(
        <g
          key={node.id}
          transform={`translate(${pos.x}, ${pos.y})`}
          className="cursor-pointer transition-all duration-300"
        >
          <rect
            x={0}
            y={0}
            width={isRoot ? 180 : 160}
            height={isRoot ? 70 : 60}
            rx={12}
            ry={12}
            className={cn(
              "fill-white dark:fill-gray-800 border-2 transition-all",
              node.color || "border-gray-300 dark:border-gray-700",
              isSelected ? "shadow-xl shadow-blue-500/50 scale-105" : "shadow-md hover:shadow-lg hover:scale-102"
            )}
            onClick={(e) => {
              try {
                e.stopPropagation()
                console.log('[MindMap] 点击节点:', node.id, node.label)
                setSelectedNode(node.id)
              } catch (error) {
                console.error('[MindMap] 点击节点出错:', error)
              }
            }}
          />
          <foreignObject
            x={0}
            y={0}
            width={isRoot ? 180 : 160}
            height={isRoot ? 70 : 60}
            onClick={(e) => {
              try {
                e.stopPropagation()
                console.log('[MindMap] 点击文本:', node.id, node.label)
                setSelectedNode(node.id)
              } catch (error) {
                console.error('[MindMap] 点击文本出错:', error)
              }
            }}
            style={{ pointerEvents: 'none' }}
          >
            <div className={cn(
              "flex items-center justify-center h-full px-3 text-center",
              isRoot ? "text-base font-bold" : "text-sm font-medium"
            )}>
              <span className="line-clamp-2 text-gray-900 dark:text-white">
                {node.label}
              </span>
            </div>
          </foreignObject>
        </g>
      )

      if (node.children) {
        node.children.forEach(child => renderNode(child, depth + 1))
      }
    }

    renderNode(mindMapData)
    return nodes
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1)
    toast.success('已重置缩放')
  }

  const handleDownload = () => {
    toast.success('思维导图导出功能（开发中）')
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  if (!mindMapData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">正在生成思维导图...</p>
        </div>
      </div>
    )
  }

  const svgWidth = 1200
  const svgHeight = 800

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-gray-900 dark:text-white">思维导图</span>
          </div>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              缩放: {(zoom * 100).toFixed(0)}%
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={zoom <= 0.5}
                title="缩小"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="重置"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={zoom >= 2}
                title="放大"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleFullscreen}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Maximize2 className="h-4 w-4" />
            <span>全屏</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" />
            <span>导出</span>
          </button>
        </div>
      </div>

      {/* 思维导图容器 */}
      <div
        ref={containerRef}
        className={cn(
          "relative bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300",
          isFullscreen && "fixed inset-0 z-50 m-0 rounded-none"
        )}
        onClick={() => {
          console.log('[MindMap] 点击空白区域，取消选中')
          setSelectedNode(null)
        }}
      >
        <div
          className="w-full h-full overflow-auto"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            className="block"
            style={{ minHeight: '700px' }}
          >
            {renderConnections()}
            {renderNodes()}
          </svg>
        </div>

        {/* 退出全屏按钮 */}
        {isFullscreen && (
          <button
            onClick={handleFullscreen}
            className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
            title="退出全屏"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {countNodes(mindMapData)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">节点总数</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {mindMapData.children?.length || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">主要分支</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {calculateDepth(mindMapData)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">层级深度</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {(zoom * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">当前缩放</div>
        </div>
      </div>

      {/* 选中节点详情 */}
      {(() => {
        const { node, depth } = getSelectedNodeInfo()
        if (!node) return null

        return (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">选中节点</h3>
                <p className="text-xl font-medium mb-3">{node.label}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                    <span>层级: {depth}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                    <span>子节点: {node.children?.length || 0} 个</span>
                  </div>
                  {node.children && node.children.length > 0 && (
                    <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                      <span>可展开</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="关闭详情"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        )
      })()}

      {/* 操作提示 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <ZoomIn className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              操作指南
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• 点击节点可以选中，选中节点会高亮显示</li>
              <li>• 使用缩放工具调整思维导图大小（50%-200%）</li>
              <li>• 全屏模式提供更好的浏览体验</li>
              <li>• 思维导图会根据文档内容自动生成和更新</li>
              <li>• 贝塞尔曲线连接线展示节点间的关系</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

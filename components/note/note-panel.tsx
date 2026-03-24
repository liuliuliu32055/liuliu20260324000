'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Eye, BookOpen } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface Note {
  id: string
  paragraphId: string
  content: string
  tags: string[]
  highlightedText?: string
  createdAt: string
  updatedAt: string
}

interface NotePanelProps {
  documentId: string
}

export function NotePanel({ documentId }: NotePanelProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  // 从 localStorage 加载笔记
  useEffect(() => {
    try {
      const savedNotesStr = localStorage.getItem('userNotes')
      if (!savedNotesStr) {
        setNotes(getDefaultNotes())
        setLoading(false)
        return
      }

      const savedNotes = JSON.parse(savedNotesStr)
      let documentNotes: Note[] = []

      // 兼容两种数据格式：数组格式 和对象格式 { documentId: [notes] }
      if (Array.isArray(savedNotes)) {
        // 数组格式
        documentNotes = savedNotes.filter((note: any) => note.documentId === documentId)
      } else if (typeof savedNotes === 'object') {
        // 对象格式
        documentNotes = savedNotes[documentId] || []
      }

      setNotes(documentNotes.length > 0 ? documentNotes : getDefaultNotes())
      setLoading(false)
    } catch (error) {
      console.error('加载笔记失败:', error)
      setNotes(getDefaultNotes())
      setLoading(false)
    }
  }, [documentId])

  const getDefaultNotes = (): Note[] => {
    return [
      {
        id: '1',
        paragraphId: 'para-1-1',
        content: '人工智能的定义需要从多个维度理解，包括技术实现、应用场景和伦理考量。',
        tags: ['定义', '基础'],
        highlightedText: '人工智能（Artificial Intelligence，简称 AI）是指由人制造出来的系统所表现出来的智能。',
        createdAt: '2024-03-20 10:30',
        updatedAt: '2024-03-20 10:30'
      },
      {
        id: '2',
        paragraphId: 'para-1-2',
        content: '从符号主义到连接主义，再到深度学习，AI 的发展经历了三个重要阶段。',
        tags: ['历史', '发展'],
        highlightedText: '人工智能的发展经历了多个阶段：符号主义 AI、连接主义 AI、深度学习革命。',
        createdAt: '2024-03-20 11:15',
        updatedAt: '2024-03-20 11:15'
      },
      {
        id: '3',
        paragraphId: 'para-2-1',
        content: '监督学习需要有标签的数据，而无监督学习可以从无标签数据中发现模式。',
        tags: ['机器学习', '分类'],
        highlightedText: '监督学习是指从标记的训练数据中学习预测函数的机器学习任务。',
        createdAt: '2024-03-20 14:20',
        updatedAt: '2024-03-20 14:20'
      },
      {
        id: '4',
        paragraphId: 'para-3-1',
        content: 'CNN 通过卷积层提取图像特征，特别适合处理图像识别任务。',
        tags: ['深度学习', 'CNN'],
        highlightedText: '卷积神经网络（CNN）是专为处理图像数据而设计的深度学习网络。',
        createdAt: '2024-03-20 15:45',
        updatedAt: '2024-03-20 15:45'
      }
    ]
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')
  const [newTags, setNewTags] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)))

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesTag = selectedTag === null || note.tags.includes(selectedTag)
    
    return matchesSearch && matchesTag
  })

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      paragraphId: `para-${documentId}-${notes.length + 1}`,
      content: newNote,
      tags: newTags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setNotes(prev => {
      const updatedNotes = [note, ...prev]
      // 保存到 localStorage
      saveNotesToStorage(updatedNotes)
      return updatedNotes
    })
    setNewNote('')
    setNewTags('')
    setIsAddingNote(false)
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => {
      const updatedNotes = prev.filter(note => note.id !== noteId)
      // 保存到 localStorage
      saveNotesToStorage(updatedNotes)
      return updatedNotes
    })
  }

  // 保存笔记到 localStorage
  const saveNotesToStorage = (updatedNotes: Note[]) => {
    try {
      // 获取所有笔记（支持对象格式和数组格式）
      const savedNotesStr = localStorage.getItem('userNotes')
      let allSavedNotes: Record<string, Note[]> = {}

      if (savedNotesStr) {
        const parsed = JSON.parse(savedNotesStr)
        if (Array.isArray(parsed)) {
          // 如果是数组格式，转换成对象格式
          parsed.forEach((note: any) => {
            if (note.documentId) {
              if (!allSavedNotes[note.documentId]) {
                allSavedNotes[note.documentId] = []
              }
              allSavedNotes[note.documentId].push(note)
            }
          })
        } else if (typeof parsed === 'object') {
          allSavedNotes = parsed
        }
      }

      // 更新当前文档的笔记
      allSavedNotes[documentId] = updatedNotes.map(note => ({ ...note, documentId }))

      // 保存到 localStorage
      localStorage.setItem('userNotes', JSON.stringify(allSavedNotes))
    } catch (error) {
      console.error('保存笔记失败:', error)
    }
  }

  const handleViewSource = (paragraphId: string) => {
    // 在实际应用中，这里会跳转到对应的文档段落
    console.log('查看段落:', paragraphId)
  }

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="搜索笔记内容或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedTag || ''}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="pl-10 pr-8 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 appearance-none"
            >
              <option value="">所有标签</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setIsAddingNote(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90"
          >
            <Plus className="h-5 w-5 inline mr-2" />
            添加笔记
          </button>
        </div>
      </div>

      {/* 添加笔记表单 */}
      {isAddingNote && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-4">添加新笔记</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                笔记内容
              </label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                placeholder="输入您的笔记内容..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                标签（用逗号分隔）
              </label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                placeholder="例如：概念,重点,疑问"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingNote(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg disabled:opacity-50"
              >
                保存笔记
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 笔记列表 */}
      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">暂无笔记</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              点击"添加笔记"按钮开始记录
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(note.createdAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {note.highlightedText && (
                      <button
                        onClick={() => handleViewSource(note.paragraphId)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Eye className="h-3 w-3 inline mr-1" />
                        查看原文
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {note.content}
                  </p>
                  {note.highlightedText && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 pl-4 py-2 mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        "{note.highlightedText}"
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    <Edit2 className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              {/* 标签 */}
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30",
                      "text-blue-700 dark:text-blue-300"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 统计信息 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {notes.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">笔记总数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {allTags.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">标签数量</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {notes.filter(n => n.highlightedText).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">关联原文</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">最后更新</div>
          </div>
        </div>
      </div>
    </div>
  )
}
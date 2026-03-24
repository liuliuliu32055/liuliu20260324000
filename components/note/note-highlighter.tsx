'use client';

import { useState } from 'react';
import { Note } from '@/lib/types/note';
import { Highlight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteHighlighterProps {
  documentId: string;
  paragraphId: string;
  notes: Note[];
  onAddNote: (paragraphId: string, content: string) => void;
  onViewNote: (note: Note) => void;
  isMobile?: boolean;
}

/**
 * 笔记高亮器组件
 * 在文档段落旁边显示笔记图标和高亮效果
 */
export default function NoteHighlighter({
  documentId,
  paragraphId,
  notes,
  onAddNote,
  onViewNote,
  isMobile = false,
}: NoteHighlighterProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取当前段落的笔记
  const paragraphNotes = notes.filter(note => note.paragraph_id === paragraphId);
  const hasNotes = paragraphNotes.length > 0;

  // 处理添加笔记
  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      alert('请输入笔记内容');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddNote(paragraphId, noteContent);
      setNoteContent('');
      setShowNoteInput(false);
    } catch (error) {
      console.error('添加笔记失败:', error);
      alert('添加笔记失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理查看笔记
  const handleViewNote = () => {
    if (paragraphNotes.length > 0) {
      onViewNote(paragraphNotes[0]);
    }
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 笔记高亮效果 */}
      {hasNotes && (
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/20 animate-pulse rounded-full" />
            <Highlight className="h-4 w-4 text-yellow-500 relative z-10" />
          </div>
        </div>
      )}

      {/* 悬停时显示的笔记工具 */}
      {(isHovered || showNoteInput) && (
        <div className={cn(
          "absolute left-6 top-1/2 transform -translate-y-1/2 z-50",
          "bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700",
          "min-w-64 p-4",
          isMobile && "left-0 right-0 mx-auto w-11/12"
        )}>
          {hasNotes ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    已添加笔记
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {paragraphNotes.length}条
                </span>
              </div>
              
              {paragraphNotes.map(note => (
                <div 
                  key={note.id}
                  className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => onViewNote(note)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                        {note.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {note.content}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  为该段落添加笔记
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="记录你的想法、见解或疑问..."
                  className="w-full min-h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNoteInput(false)}
                  className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={isSubmitting || !noteContent.trim()}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '保存中...' : '保存笔记'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 段落本身 */}
      <div className={cn(
        "relative",
        hasNotes && "pl-6"
      )}>
        {/* 此处将由父组件传入实际的段落内容 */}
      </div>
    </div>
  );
}
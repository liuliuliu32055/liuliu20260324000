'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/lib/types/note';
import { NoteService } from '@/lib/services/note-service';
import NoteHighlighter from '@/components/note/note-highlighter';
import { cn } from '@/lib/utils';

interface ParagraphRendererProps {
  documentId: string;
  paragraphIndex: number;
  content: string;
  onParagraphClick?: (paragraphId: string) => void;
  isMobile?: boolean;
}

/**
 * 段落渲染器组件
 * 渲染单个段落，支持笔记绑定和高亮
 */
export default function ParagraphRenderer({
  documentId,
  paragraphIndex,
  content,
  onParagraphClick,
  isMobile = false,
}: ParagraphRendererProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  // 生成段落唯一ID
  const paragraphId = `para-${documentId}-${paragraphIndex}`;

  // 加载段落的笔记
  useEffect(() => {
    loadNotes();
  }, [documentId, paragraphId]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const allNotes = await NoteService.getDocumentNotes(documentId);
      const paragraphNotes = allNotes.filter(note => note.paragraph_id === paragraphId);
      setNotes(paragraphNotes);
    } catch (error) {
      console.error('加载笔记失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理添加笔记
  const handleAddNote = async (paragraphId: string, noteContent: string) => {
    try {
      const note = await NoteService.createNote({
        document_id: documentId,
        paragraph_id: paragraphId,
        content: noteContent,
        title: `段落 ${paragraphIndex + 1} 的笔记`,
      });
      
      // 更新本地笔记列表
      setNotes(prev => [...prev, note]);
      return note;
    } catch (error) {
      console.error('添加笔记失败:', error);
      throw error;
    }
  };

  // 处理查看笔记
  const handleViewNote = (note: Note) => {
    // 可以在此处显示笔记详情模态框
    alert(`笔记详情：${note.title}\n\n${note.content}`);
  };

  // 处理段落点击
  const handleClick = () => {
    if (onParagraphClick) {
      onParagraphClick(paragraphId);
    }
  };

  // 如果内容为空，不渲染
  if (!content.trim()) {
    return null;
  }

  return (
    <div 
      id={paragraphId}
      className={cn(
        "relative mb-4 p-3 rounded-lg border border-transparent",
        "hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/50",
        "transition-all duration-200 cursor-pointer",
        isMobile && "text-sm leading-relaxed"
      )}
      onClick={handleClick}
    >
      {/* 段落编号（仅在桌面端显示） */}
      {!isMobile && (
        <div className="absolute -left-8 top-0 flex items-center justify-center w-6 h-6 text-xs text-gray-400 font-mono select-none">
          {paragraphIndex + 1}
        </div>
      )}

      {/* 笔记高亮器 */}
      <NoteHighlighter
        documentId={documentId}
        paragraphId={paragraphId}
        notes={notes}
        onAddNote={handleAddNote}
        onViewNote={handleViewNote}
        isMobile={isMobile}
      />

      {/* 段落内容 */}
      <div className="min-h-6">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : (
          <p className={cn(
            "text-gray-700 dark:text-gray-300 leading-relaxed",
            "selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100",
            isMobile && "text-base"
          )}>
            {content}
          </p>
        )}
      </div>

      {/* 笔记统计 */}
      {notes.length > 0 && !isMobile && (
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            {notes.length} 条笔记
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNoteEditor(true);
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            添加更多笔记
          </button>
        </div>
      )}
    </div>
  );
}
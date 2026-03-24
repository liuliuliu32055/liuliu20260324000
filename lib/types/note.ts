/**
 * 笔记相关类型定义
 */

export interface Note {
  id: string;
  user_id: string;
  document_id: string;
  paragraph_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface NoteWithDocument extends Note {
  document?: {
    id: string;
    file_name: string;
  };
}

export interface NoteStats {
  total_notes: number;
  notes_by_document: Record<string, number>;
  recent_notes: Note[];
}

export interface NoteSearchResult {
  notes: Note[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateNoteInput {
  document_id: string;
  paragraph_id: string;
  content: string;
  title?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}

// 段落笔记映射类型
export interface ParagraphNotesMap {
  [paragraphId: string]: Note[];
}

// 笔记高亮信息
export interface NoteHighlight {
  paragraphId: string;
  noteCount: number;
  hasUnread: boolean;
  lastUpdated: string;
}

// 笔记分组（按文档）
export interface NoteGroup {
  documentId: string;
  documentName: string;
  notes: Note[];
  count: number;
}

// 笔记导出格式
export interface NoteExport {
  version: string;
  export_date: string;
  notes: Note[];
  metadata: {
    total_notes: number;
    documents: string[];
    time_range: {
      start: string;
      end: string;
    };
  };
}

// 笔记导入格式
export interface NoteImport {
  notes: Note[];
  conflict_resolution?: 'skip' | 'overwrite' | 'merge';
}

// 笔记统计信息
export interface NoteStatistics {
  total_notes: number;
  notes_last_30_days: number;
  avg_notes_per_document: number;
  most_annotated_document?: {
    id: string;
    name: string;
    note_count: number;
  };
  daily_average: number;
  longest_note?: {
    id: string;
    title: string;
    length: number;
  };
}

// 笔记分析结果
export interface NoteAnalysis {
  common_themes: string[];
  frequent_words: string[];
  sentiment_score?: number;
  knowledge_gaps?: string[];
  learning_progress?: {
    total_concepts: number;
    mastered_concepts: number;
    review_needed: number;
  };
}

// 笔记共享设置
export interface NoteSharingSettings {
  is_public: boolean;
  share_token?: string;
  allow_comments: boolean;
  allow_download: boolean;
  expires_at?: string;
  view_count: number;
}

// 笔记协作信息
export interface NoteCollaboration {
  collaborators: string[];
  last_edit_by: string;
  last_edit_at: string;
  edit_history: NoteEditHistory[];
}

// 笔记编辑历史
export interface NoteEditHistory {
  id: string;
  note_id: string;
  user_id: string;
  action: 'create' | 'update' | 'delete';
  changes: Record<string, any>;
  timestamp: string;
}

// 笔记标签
export interface NoteTag {
  id: string;
  name: string;
  color: string;
  note_count: number;
}

// 带有标签的笔记
export interface NoteWithTags extends Note {
  tags: NoteTag[];
}

// 笔记搜索参数
export interface NoteSearchParams {
  query?: string;
  document_id?: string;
  tag_ids?: string[];
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
  include_document_info?: boolean;
  include_tags?: boolean;
}
import { Note } from '@/lib/types/note';

/**
 * 笔记服务
 * 提供笔记的CRUD操作接口
 */

const API_BASE = '/api';

export interface CreateNoteData {
  document_id: string;
  paragraph_id: string;
  content: string;
  title?: string;
}

export interface UpdateNoteData {
  content?: string;
  title?: string;
}

export class NoteService {
  /**
   * 创建笔记
   * @param data 笔记数据
   * @returns 创建的笔记
   */
  static async createNote(data: CreateNoteData): Promise<Note> {
    try {
      const response = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '创建笔记失败');
      }

      const result = await response.json();
      return result.note;
    } catch (error) {
      console.error('创建笔记错误:', error);
      throw error;
    }
  }

  /**
   * 获取文档的笔记列表
   * @param documentId 文档ID
   * @returns 笔记列表
   */
  static async getDocumentNotes(documentId: string): Promise<Note[]> {
    try {
      const response = await fetch(`${API_BASE}/notes?document_id=${documentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取笔记失败');
      }

      const result = await response.json();
      return result.notes || [];
    } catch (error) {
      console.error('获取笔记错误:', error);
      throw error;
    }
  }

  /**
   * 删除笔记
   * @param noteId 笔记ID
   */
  static async deleteNote(noteId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/notes?id=${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除笔记失败');
      }
    } catch (error) {
      console.error('删除笔记错误:', error);
      throw error;
    }
  }

  /**
   * 更新笔记
   * @param noteId 笔记ID
   * @param data 更新数据
   * @returns 更新后的笔记
   */
  static async updateNote(noteId: string, data: UpdateNoteData): Promise<Note> {
    try {
      const response = await fetch(`${API_BASE}/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新笔记失败');
      }

      const result = await response.json();
      return result.note;
    } catch (error) {
      console.error('更新笔记错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户的所有笔记
   * @returns 所有笔记
   */
  static async getUserNotes(): Promise<Note[]> {
    try {
      const response = await fetch(`${API_BASE}/notes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取笔记失败');
      }

      const result = await response.json();
      return result.notes || [];
    } catch (error) {
      console.error('获取用户笔记错误:', error);
      throw error;
    }
  }

  /**
   * 搜索笔记
   * @param query 搜索关键词
   * @returns 搜索结果
   */
  static async searchNotes(query: string): Promise<Note[]> {
    try {
      const response = await fetch(`${API_BASE}/notes/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '搜索笔记失败');
      }

      const result = await response.json();
      return result.notes || [];
    } catch (error) {
      console.error('搜索笔记错误:', error);
      throw error;
    }
  }

  /**
   * 根据段落ID批量获取笔记
   * @param documentId 文档ID
   * @param paragraphIds 段落ID数组
   * @returns 段落笔记映射
   */
  static async getNotesByParagraphIds(
    documentId: string,
    paragraphIds: string[]
  ): Promise<Record<string, Note[]>> {
    try {
      const allNotes = await this.getDocumentNotes(documentId);
      const notesByParagraph: Record<string, Note[]> = {};

      // 初始化所有段落的笔记数组
      paragraphIds.forEach(paraId => {
        notesByParagraph[paraId] = [];
      });

      // 按段落分组笔记
      allNotes.forEach(note => {
        if (notesByParagraph[note.paragraph_id]) {
          notesByParagraph[note.paragraph_id].push(note);
        }
      });

      return notesByParagraph;
    } catch (error) {
      console.error('批量获取笔记错误:', error);
      throw error;
    }
  }
}
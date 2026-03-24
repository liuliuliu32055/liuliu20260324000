import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 环境变量未配置！')
  console.error('请在 .env.local 文件中配置：')
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
  
  throw new Error('Supabase 环境变量未配置')
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'ai-reading-assistant'
    }
  }
})

// 用户相关操作
export const auth = {
  // 邮箱注册
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          created_at: new Date().toISOString()
        }
      }
    })
    
    if (error) throw error
    return data
  },

  // 邮箱登录
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // 手机号登录（需要配置短信服务）
  async signInWithPhone(phone: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        shouldCreateUser: true
      }
    })
    
    if (error) throw error
    return data
  },

  // 登出
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // 获取当前用户
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // 获取会话
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }
}

// 文档相关操作
export const documents = {
  // 创建文档记录
  async createDocument(userId: string, fileData: {
    fileName: string
    fileKey: string
    fileSize: number
    metadata?: any
  }) {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        file_name: fileData.fileName,
        file_key: fileData.fileKey,
        file_size: fileData.fileSize,
        metadata: fileData.metadata || {},
        parse_status: 'pending'
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 获取用户文档列表
  async getUserDocuments(userId: string, options?: {
    limit?: number
    offset?: number
    status?: string
  }) {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.status) {
      query = query.eq('parse_status', options.status)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      )
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // 获取单个文档
  async getDocument(documentId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()
    
    if (error) throw error
    return data
  },

  // 更新文档状态
  async updateDocumentStatus(documentId: string, status: 'pending' | 'parsing' | 'completed' | 'failed', data?: any) {
    const updateData: any = {
      parse_status: status,
      updated_at: new Date().toISOString()
    }

    if (data?.parsedText) {
      updateData.parsed_text = data.parsedText
    }

    if (data?.pageCount) {
      updateData.page_count = data.pageCount
    }

    if (data?.metadata) {
      updateData.metadata = { ...data.metadata }
    }

    const { data: result, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  // 删除文档
  async deleteDocument(documentId: string) {
    // 先删除相关笔记
    await supabase
      .from('notes')
      .delete()
      .eq('document_id', documentId)

    // 删除文档记录
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
    
    if (error) throw error
  }
}

// 笔记相关操作
export const notes = {
  // 创建笔记
  async createNote(userId: string, documentId: string, noteData: {
    paragraphId: string
    content: string
    tags?: string[]
    highlightedText?: string
    metadata?: any
  }) {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        document_id: documentId,
        paragraph_id: noteData.paragraphId,
        content: noteData.content,
        tags: noteData.tags || [],
        highlighted_text: noteData.highlightedText,
        metadata: noteData.metadata || {}
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 获取文档笔记列表
  async getDocumentNotes(documentId: string, options?: {
    limit?: number
    offset?: number
    paragraphId?: string
  }) {
    let query = supabase
      .from('notes')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })

    if (options?.paragraphId) {
      query = query.eq('paragraph_id', options.paragraphId)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      )
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // 更新笔记
  async updateNote(noteId: string, updateData: {
    content?: string
    tags?: string[]
    highlightedText?: string
    metadata?: any
  }) {
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 删除笔记
  async deleteNote(noteId: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
    
    if (error) throw error
  },

  // 搜索笔记
  async searchNotes(userId: string, searchQuery: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .or(`content.ilike.%${searchQuery}%,highlighted_text.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// 存储相关操作
export const storage = {
  // 上传文件
  async uploadFile(userId: string, file: File, bucket: string = 'documents') {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    return data
  },

  // 获取文件 URL
  getFileUrl(bucket: string, fileKey: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileKey)
    
    return data.publicUrl
  },

  // 删除文件
  async deleteFile(bucket: string, fileKey: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileKey])
    
    if (error) throw error
  },

  // 获取用户文件列表
  async getUserFiles(userId: string, bucket: string = 'documents') {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(userId)
    
    if (error) throw error
    return data
  }
}

// 数据库初始化
export const database = {
  // 检查表是否存在
  async checkTables() {
    const tables = ['users', 'documents', 'notes']
    const results: Record<string, boolean> = {}
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        results[table] = !error
      } catch {
        results[table] = false
      }
    }
    
    return results
  },

  // 初始化数据库（创建表）
  async initializeDatabase() {
    console.log('开始初始化数据库...')
    
    // 在实际应用中，这里会执行 SQL 创建表
    // 由于安全原因，我们只提供检查功能
    
    const tableStatus = await this.checkTables()
    
    if (Object.values(tableStatus).every(status => status)) {
      console.log('✅ 数据库表已存在')
      return true
    } else {
      console.log('⚠️ 部分表不存在，请运行 SQL 脚本创建表')
      console.log('表状态:', tableStatus)
      return false
    }
  }
}

// 导出所有功能
export default {
  supabase,
  auth,
  documents,
  notes,
  storage,
  database
}
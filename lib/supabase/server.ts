import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 忽略 cookie 设置错误
          }
        },
      },
    }
  )
}

// 服务器端用户认证
export async function getServerUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
  
  return user
}

// 服务器端会话管理
export async function getServerSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('获取会话失败:', error)
    return null
  }
  
  return session
}

// 服务器端文档操作
export async function getServerDocuments(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('获取文档失败:', error)
    return []
  }
  
  return data
}

// 服务器端笔记操作
export async function getServerNotes(documentId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('获取笔记失败:', error)
    return []
  }
  
  return data
}

// 服务器端文件上传
export async function uploadServerFile(userId: string, file: File) {
  const supabase = await createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('文件上传失败:', error)
    throw error
  }
  
  return data
}

// 服务器端数据库初始化检查
export async function checkServerDatabase() {
  const supabase = await createClient()
  
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
}

// 服务器端用户创建
export async function createServerUser(email: string, password: string, userData?: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...userData,
        created_at: new Date().toISOString()
      }
    }
  })
  
  if (error) {
    console.error('用户创建失败:', error)
    throw error
  }
  
  return data
}

// 服务器端用户登录
export async function loginServerUser(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    console.error('用户登录失败:', error)
    throw error
  }
  
  return data
}

// 服务器端用户登出
export async function logoutServerUser() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('用户登出失败:', error)
    throw error
  }
}

// 服务器端文档创建
export async function createServerDocument(userId: string, documentData: {
  fileName: string
  fileKey: string
  fileSize: number
  metadata?: any
}) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      file_name: documentData.fileName,
      file_key: documentData.fileKey,
      file_size: documentData.fileSize,
      metadata: documentData.metadata || {},
      parse_status: 'pending'
    })
    .select()
    .single()
  
  if (error) {
    console.error('文档创建失败:', error)
    throw error
  }
  
  return data
}

// 服务器端笔记创建
export async function createServerNote(userId: string, noteData: {
  documentId: string
  paragraphId: string
  content: string
  tags?: string[]
  highlightedText?: string
  metadata?: any
}) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      document_id: noteData.documentId,
      paragraph_id: noteData.paragraphId,
      content: noteData.content,
      tags: noteData.tags || [],
      highlighted_text: noteData.highlightedText,
      metadata: noteData.metadata || {}
    })
    .select()
    .single()
  
  if (error) {
    console.error('笔记创建失败:', error)
    throw error
  }
  
  return data
}
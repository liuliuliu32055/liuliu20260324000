import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 创建文档表
    const { error: docsError } = await supabase.rpc('create_docs_table', {})
    if (docsError) {
      console.log('创建文档表失败，可能是已存在或需要手动创建')
    }
    
    // 创建聊天记录表
    const { error: chatsError } = await supabase.rpc('create_chats_table', {})
    if (chatsError) {
      console.log('创建聊天记录表失败，可能是已存在或需要手动创建')
    }
    
    return NextResponse.json({
      success: true,
      message: '数据库初始化完成。请通过 Supabase SQL 编辑器手动执行以下 SQL 语句：',
      sql: `
-- 创建文档表
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content TEXT,
  summary TEXT,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建聊天记录表
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  document_id UUID REFERENCES documents(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_document_id ON chats(document_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at DESC);
      `
    })
    
  } catch (error) {
    console.error('数据库初始化错误:', error)
    return NextResponse.json(
      { success: false, error: '初始化失败' },
      { status: 500 }
    )
  }
}
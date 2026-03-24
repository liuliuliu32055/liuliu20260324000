import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'



export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 检查用户登录状态
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const documentId = params.id
      const params = await context.params
    const supabase = await createClient()

    // 获取文档信息
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '文档不存在' },
          { status: 404 }
        )
      }
      throw error
    }

    // 获取文档笔记数量
    const { count: noteCount } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', documentId)

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.file_name,
        fileKey: document.file_key,
        fileSize: document.file_size,
        status: document.parse_status,
        pageCount: document.page_count,
        parsedText: document.parsed_text,
        metadata: document.metadata,
        noteCount: noteCount || 0,
        createdAt: document.created_at,
        updatedAt: document.updated_at
      }
    })

  } catch (error: any) {
    console.error('获取文档详情失败:', error)

    return NextResponse.json(
      { error: error.message || '获取文档详情失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 检查用户登录状态
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const documentId = params.id
    const params = await context.params

    const supabase = await createClient()

    // 获取文档信息（用于删除文件）
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_key')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: '文档不存在' },
          { status: 404 }
        )
      }
      throw fetchError
    }

    // 删除存储中的文件
    if (document.file_key) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_key])

      if (storageError) {
        console.warn('删除存储文件失败:', storageError)
      }
    }

    // 删除文档记录
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: '文档删除成功'
    })

  } catch (error: any) {
    console.error('删除文档失败:', error)

    return NextResponse.json(
      { error: error.message || '删除文档失败' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 检查用户登录状态
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const documentId = params.id
    const params = await context.params

    const body = await request.json()
    const supabase = await createClient()

    // 验证更新数据
    const allowedFields = ['parse_status', 'page_count', 'parsed_text', 'metadata']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '没有有效的更新字段' },
        { status: 400 }
      )
    }

    // 添加更新时间
    updateData.updated_at = new Date().toISOString()

    // 更新文档
    const { data: document, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '文档不存在' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      message: '文档更新成功',
      document: {
        id: document.id,
        fileName: document.file_name,
        status: document.parse_status,
        pageCount: document.page_count,
        updatedAt: document.updated_at
      }
    })

  } catch (error: any) {
    console.error('更新文档失败:', error)

    return NextResponse.json(
      { error: error.message || '更新文档失败' },
      { status: 500 }
    )
  }
}

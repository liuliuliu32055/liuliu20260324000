import { NextRequest, NextResponse } from 'next/server'
import { getServerUser, uploadServerFile, createServerDocument } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // 检查用户登录状态
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    // 验证文件
    if (!file) {
      return NextResponse.json(
        { error: '请选择要上传的文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: '只支持 PDF 格式文件' },
        { status: 400 }
      )
    }

    // 验证文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过 10MB' },
        { status: 400 }
      )
    }

    // 上传文件到 Supabase Storage
    const uploadResult = await uploadServerFile(user.id, file)

    // 创建文档记录
    const document = await createServerDocument(user.id, {
      fileName: file.name,
      fileKey: uploadResult.path,
      fileSize: file.size,
      metadata: {
        originalName: file.name,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      message: '文件上传成功',
      document: {
        id: document.id,
        fileName: document.file_name,
        fileKey: document.file_key,
        fileSize: document.file_size,
        status: document.parse_status,
        createdAt: document.created_at
      }
    })

  } catch (error: any) {
    console.error('文件上传失败:', error)

    // 处理特定的错误类型
    if (error.message.includes('Storage quota exceeded')) {
      return NextResponse.json(
        { error: '存储空间不足' },
        { status: 400 }
      )
    }

    if (error.message.includes('File already exists')) {
      return NextResponse.json(
        { error: '文件已存在' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: error.message || '文件上传失败' },
      { status: 500 }
    )
  }
}
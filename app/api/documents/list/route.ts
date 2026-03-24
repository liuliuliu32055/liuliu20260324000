import { NextRequest, NextResponse } from 'next/server'
import { getServerUser, getServerDocuments } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // 检查用户登录状态
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const offset = (page - 1) * limit

    // 获取用户文档
    const documents = await getServerDocuments(user.id)

    // 过滤状态
    let filteredDocuments = documents
    if (status) {
      filteredDocuments = documents.filter(doc => doc.parse_status === status)
    }

    // 分页
    const paginatedDocuments = filteredDocuments.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      documents: paginatedDocuments.map(doc => ({
        id: doc.id,
        fileName: doc.file_name,
        fileKey: doc.file_key,
        fileSize: doc.file_size,
        status: doc.parse_status,
        pageCount: doc.page_count,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      })),
      pagination: {
        page,
        limit,
        total: filteredDocuments.length,
        pages: Math.ceil(filteredDocuments.length / limit)
      }
    })

  } catch (error: any) {
    console.error('获取文档列表失败:', error)

    return NextResponse.json(
      { error: error.message || '获取文档列表失败' },
      { status: 500 }
    )
  }
}
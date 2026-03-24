import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 笔记相关的API路由
 * POST: 创建笔记
 * GET: 获取文档的笔记列表
 * DELETE: 删除笔记
 * PATCH: 更新笔记
 */

// POST - 创建笔记
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 验证用户是否登录
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: '未授权访问，请先登录' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { document_id, paragraph_id, content, title } = body;
    
    // 验证必填字段
    if (!document_id || !paragraph_id || !content) {
      return NextResponse.json(
        { error: '缺少必填字段：document_id, paragraph_id, content' },
        { status: 400 }
      );
    }
    
    // 创建笔记
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        document_id,
        paragraph_id,
        content,
        title: title || '未命名笔记',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('创建笔记失败:', error);
      return NextResponse.json(
        { error: '创建笔记失败', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '笔记创建成功',
      note: data,
    });
    
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// GET - 获取文档的笔记列表
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 验证用户是否登录
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: '未授权访问，请先登录' },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const document_id = searchParams.get('document_id');
    
    if (!document_id) {
      return NextResponse.json(
        { error: '缺少 document_id 参数' },
        { status: 400 }
      );
    }
    
    // 获取文档的所有笔记
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('document_id', document_id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取笔记失败:', error);
      return NextResponse.json(
        { error: '获取笔记失败', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      notes: data || [],
    });
    
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

// DELETE - 删除笔记
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 验证用户是否登录
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: '未授权访问，请先登录' },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const note_id = searchParams.get('id');
    
    if (!note_id) {
      return NextResponse.json(
        { error: '缺少笔记ID参数' },
        { status: 400 }
      );
    }
    
    // 验证笔记属于当前用户
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('user_id')
      .eq('id', note_id)
      .single();
    
    if (fetchError) {
      return NextResponse.json(
        { error: '笔记不存在或已被删除' },
        { status: 404 }
      );
    }
    
    if (note.user_id !== user.id) {
      return NextResponse.json(
        { error: '无权删除此笔记' },
        { status: 403 }
      );
    }
    
    // 删除笔记
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', note_id);
    
    if (error) {
      console.error('删除笔记失败:', error);
      return NextResponse.json(
        { error: '删除笔记失败', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '笔记删除成功',
    });
    
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

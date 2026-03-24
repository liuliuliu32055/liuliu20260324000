import { NextRequest, NextResponse } from 'next/server'
import { loginServerUser } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码为必填项' },
        { status: 400 }
      )
    }

    // 用户登录
    const loginData = await loginServerUser(email, password)

    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: loginData.user?.id,
        name: loginData.user?.user_metadata?.name || loginData.user?.email?.split('@')[0],
        email: loginData.user?.email,
        phone: loginData.user?.phone || loginData.user?.user_metadata?.phone,
        created_at: loginData.user?.created_at
      },
      session: loginData.session
    })

  } catch (error: any) {
    console.error('用户登录失败:', error)

    // 处理特定的错误类型
    if (error.message.includes('Invalid login credentials')) {
      return NextResponse.json(
        { error: '邮箱或密码不正确' },
        { status: 401 }
      )
    }

    if (error.message.includes('Email not confirmed')) {
      return NextResponse.json(
        { error: '请先验证您的邮箱' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || '登录失败' },
      { status: 500 }
    )
  }
}
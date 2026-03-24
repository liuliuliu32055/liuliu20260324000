import { NextRequest, NextResponse } from 'next/server'
import { createServerUser } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, phone, name } = body

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码为必填项' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 创建用户
    const userData = await createServerUser(email, password, {
      phone,
      name,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: userData.user?.id,
        name: name || email.split('@')[0],
        email: userData.user?.email,
        phone: phone || userData.user?.user_metadata?.phone,
        created_at: userData.user?.created_at
      }
    })

  } catch (error: any) {
    console.error('用户注册失败:', error)

    // 处理 Supabase 错误
    if (error.message.includes('User already registered')) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      )
    }

    if (error.message.includes('Invalid email')) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || '注册失败' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at
      }
    })

  } catch (error: any) {
    console.error('获取用户信息失败:', error)

    return NextResponse.json(
      { error: error.message || '获取用户信息失败' },
      { status: 500 }
    )
  }
}
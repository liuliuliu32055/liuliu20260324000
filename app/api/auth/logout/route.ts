import { NextRequest, NextResponse } from 'next/server'
import { logoutServerUser } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    await logoutServerUser()

    return NextResponse.json({
      success: true,
      message: '退出登录成功'
    })

  } catch (error: any) {
    console.error('退出登录失败:', error)

    return NextResponse.json(
      { error: error.message || '退出登录失败' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60

// GET - جلب الـ streaks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const userId = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const supabase = getSupabaseAdmin()
    
    let query = supabase
      .from('streaks')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // فلترة حسب المشروع
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    
    // فلترة حسب المستخدم
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data: streaks, error, count } = await query
    
    if (error) {
      console.error('[GET /api/streaks] Database error:', error)
      return NextResponse.json(
        { error: 'فشل في جلب الـ streaks', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      streaks: streaks || [],
      count: count || 0,
      hasMore: streaks && streaks.length === limit
    })
    
  } catch (error) {
    console.error('[GET /api/streaks] Unexpected error:', error)
    return NextResponse.json(
      { error: 'خطأ غير متوقع في الخادم' },
      { status: 500 }
    )
  }
}

// POST - إنشاء streak جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      project_id,
      user_id,
      name,
      description,
      goal_description,
      streak_type = 'habit',
      category,
      target_frequency = 'daily',
      minimum_duration_minutes = 1,
      reminder_enabled = true,
      points_per_completion = 10,
      status = 'active'
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'اسم الـ streak مطلوب' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    
    const { data: streak, error } = await supabase
      .from('streaks')
      .insert({
        project_id,
        user_id,
        name,
        description,
        goal_description,
        streak_type,
        category,
        target_frequency,
        minimum_duration_minutes,
        reminder_enabled,
        points_per_completion,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/streaks] Database error:', error)
      return NextResponse.json(
        { error: 'فشل في إنشاء الـ streak', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      streak,
      message: 'تم إنشاء الـ streak بنجاح'
    }, { status: 201 })

  } catch (error) {
    console.error('[POST /api/streaks] Unexpected error:', error)
    return NextResponse.json(
      { error: 'خطأ غير متوقع في الخادم' },
      { status: 500 }
    )
  }
}

// PUT - تحديث streak
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'معرف الـ streak مطلوب' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    
    // إضافة updated_at تلقائياً
    updateData.updated_at = new Date().toISOString()
    
    const { data: streak, error } = await supabase
      .from('streaks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[PUT /api/streaks] Database error:', error)
      return NextResponse.json(
        { error: 'فشل في تحديث الـ streak', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      streak,
      message: 'تم تحديث الـ streak بنجاح'
    })

  } catch (error) {
    console.error('[PUT /api/streaks] Unexpected error:', error)
    return NextResponse.json(
      { error: 'خطأ غير متوقع في الخادم' },
      { status: 500 }
    )
  }
}

// DELETE - حذف streak
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'معرف الـ streak مطلوب' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('streaks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[DELETE /api/streaks] Database error:', error)
      return NextResponse.json(
        { error: 'فشل في حذف الـ streak', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'تم حذف الـ streak بنجاح'
    })

  } catch (error) {
    console.error('[DELETE /api/streaks] Unexpected error:', error)
    return NextResponse.json(
      { error: 'خطأ غير متوقع في الخادم' },
      { status: 500 }
    )
  }
}

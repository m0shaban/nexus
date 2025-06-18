import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

// GET - List all scenarios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    let query = supabaseAdmin
      .from('scenarios')
      .select(`
        *,
        projects (
          id,
          title,
          status
        )
      `)
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data: scenarios, error } = await query

    if (error) {
      console.error('[Scenarios] Error fetching scenarios:', error)
      return NextResponse.json(
        { error: 'فشل في تحميل السيناريوهات' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      scenarios: scenarios || [],
      message: 'تم تحميل السيناريوهات بنجاح'
    })

  } catch (error) {
    console.error('[Scenarios] GET Error:', error)
    return NextResponse.json(
      { error: 'خطأ غير متوقع في تحميل السيناريوهات' },
      { status: 500 }
    )
  }
}

// POST - Create new scenario
export async function POST(request: NextRequest) {
  try {
    const { 
      projectId, 
      title, 
      description, 
      assumptions 
    } = await request.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: 'العنوان والوصف مطلوبان' },
        { status: 400 }
      )
    }

    const { data: scenario, error } = await supabaseAdmin
      .from('scenarios')
      .insert({
        project_id: projectId || null,
        title,
        description,
        assumptions: assumptions || [],
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('[Scenarios] Error creating scenario:', error)
      return NextResponse.json(
        { error: 'فشل في إنشاء السيناريو' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      scenario,
      message: 'تم إنشاء السيناريو بنجاح'
    })

  } catch (error) {
    console.error('[Scenarios] POST Error:', error)
    return NextResponse.json(
      { error: 'خطأ غير متوقع في إنشاء السيناريو' },
      { status: 500 }
    )
  }
}

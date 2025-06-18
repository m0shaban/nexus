import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { scenarioId, selectedRisks } = await request.json()

    if (!scenarioId || !selectedRisks || selectedRisks.length === 0) {
      return NextResponse.json(
        { error: 'معرف السيناريو والمخاطر المحددة مطلوبان' },
        { status: 400 }
      )
    }

    // Get scenario details
    const { data: scenario, error: scenarioError } = await supabaseAdmin
      .from('scenarios')
      .select('*, projects(*)')
      .eq('id', scenarioId)
      .single()

    if (scenarioError || !scenario) {
      return NextResponse.json(
        { error: 'السيناريو غير موجود' },
        { status: 404 }
      )
    }

    const projectId = scenario.project_id
    if (!projectId) {
      return NextResponse.json(
        { error: 'السيناريو غير مرتبط بمشروع' },
        { status: 400 }
      )
    }

    // Convert each selected risk into a preventive task
    const tasksToCreate = selectedRisks.map((risk: string, index: number) => ({
      project_id: projectId,
      content: `معالجة المخاطر: ${risk}`,
      is_completed: false,
      order_index: index + 1000, // Add to end of task list
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    }))

    // Create the tasks
    const { data: createdTasks, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .insert(tasksToCreate)
      .select()

    if (tasksError) {
      console.error('[ConvertRisks] Error creating tasks:', tasksError)
      return NextResponse.json(
        { error: 'فشل في إنشاء المهام' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tasks: createdTasks,
      message: `تم إنشاء ${createdTasks.length} مهمة لمعالجة المخاطر`
    })

  } catch (error) {
    console.error('[ConvertRisks] Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'خطأ غير متوقع في تحويل المخاطر'
      },
      { status: 500 }
    )
  }
}

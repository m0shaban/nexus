import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: projectId } = params
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }    // Verify project exists
    const { error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single()

    if (projectError) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }    // Create new task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        content: content.trim(),
        project_id: projectId,
        is_completed: false
      })
      .select()
      .single()

    if (taskError) {
      throw taskError
    }

    return NextResponse.json(task, { status: 201 })

  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { projectId, projectName, projectDescription } = await request.json()

    if (!projectId && !projectName) {
      return NextResponse.json({ error: 'Project ID or project details are required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Project data to use for AI task generation
    let projectData = { name: projectName, description: projectDescription }
    
    // If a projectId is provided, fetch the project details first
    if (projectId) {
      const { data: project, error: fetchError } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (fetchError || !project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      
      projectData = project
    }

    // Validate NVIDIA API configuration
    if (!process.env.NVIDIA_API_KEY || !process.env.NVIDIA_API_BASE_URL) {
      console.error('NVIDIA API credentials not configured')
      return NextResponse.json(
        { error: 'AI service not available at the moment' },
        { status: 503 }
      )
    }
    
    console.log(`[ProjectPlanAPI] Generating tasks for project: ${projectData.name}`)
    
    // Call NVIDIA AI API
    const response = await fetch(`${process.env.NVIDIA_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
        messages: [
          {
            role: 'system',
            content: `أنت مساعد متخصص في تحويل المشاريع إلى مهام قابلة للتنفيذ. 
            مهمتك هي تحليل مشروع وتقسيمه إلى 5-7 خطوات عملية محددة ومرتبة منطقياً.
            أعط مهام واضحة ومحددة وقابلة للتنفيذ. لا تستخدم نقاطاً في بداية كل مهمة.`
          },
          {
            role: 'user',
            content: `يرجى تحويل المشروع التالي إلى قائمة مهام قابلة للتنفيذ:

عنوان المشروع: "${projectData.name}"
${projectData.description ? `وصف المشروع: "${projectData.description}"` : ''}

أعطني 5-7 مهام واضحة ومحددة ومرتبة منطقياً. كل مهمة يجب أن تكون خطوة عملية في تنفيذ المشروع.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      console.error('[ProjectPlanAPI] AI API error:', await response.text())
      return NextResponse.json(
        { error: 'Failed to generate tasks' },
        { status: 500 }
      )
    }

    const aiResponse = await response.json()
    const taskContent = aiResponse.choices[0].message.content

    // Parse AI response into individual tasks
    const taskLines = taskContent
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.trim())
      .filter(line => !line.match(/^[0-9][\.\)]/)) // Filter out any numbered items
    
    // Create the tasks array with parsed content
    const tasks = taskLines.map((content, index) => ({
      content,
      order_index: index,
      project_id: projectId || null
    }))

    // If projectId is provided, insert the tasks into the database
    if (projectId && tasks.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('tasks')
        .insert(tasks)

      if (insertError) {
        console.error('[ProjectPlanAPI] Error inserting tasks:', insertError)
        return NextResponse.json(
          { error: 'Failed to save generated tasks' },
          { status: 500 }
        )
      }
    }

    // Return the generated tasks
    return NextResponse.json({ 
      success: true, 
      tasks: tasks.map(task => task.content) 
    })
    
  } catch (error) {
    console.error('[ProjectPlanAPI] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

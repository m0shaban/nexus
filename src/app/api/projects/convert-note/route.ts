import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { noteId, projectName, projectDescription } = await request.json()

    if (!noteId || !projectName) {
      return NextResponse.json({ error: 'Note ID and project name are required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Verify if the note exists
    const { data: note, error: fetchError } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single()

    if (fetchError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }    // Create a new project linked to the note
    let project = null;
    let insertError = null;
    let attempts = 0;
    const maxAttempts = 5;

    // محاولة إنشاء المشروع مع إعادة المحاولة في حالة تضارب المفتاح
    while (attempts < maxAttempts && !project) {
      attempts++;
      
      const { data: projectData, error: currentError } = await supabaseAdmin
        .from('projects')
        .insert({
          name: projectName,
          description: projectDescription || null,
          user_id: note.user_id,
          note_id: noteId,
          status: 'active',
          priority: 'medium',
          // السماح للـ trigger بتوليد project_key تلقائياً
        })
        .select()
        .single()

      if (currentError) {
        // إذا كان الخطأ بسبب تضارب المفتاح، أعد المحاولة
        if (currentError.code === '23505' && currentError.message?.includes('project_key')) {
          console.log(`[ConvertNoteAPI] تضارب في مفتاح المشروع، محاولة ${attempts}/${maxAttempts}...`);
          
          // إضافة تأخير قصير قبل إعادة المحاولة
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          continue;
        } else {
          // خطأ آخر غير متعلق بالمفتاح
          insertError = currentError;
          break;
        }
      } else {
        // نجح الإنشاء
        project = projectData;
        break;
      }
    }    if (insertError || !project) {
      console.error('[ConvertNoteAPI] Error creating project:', {
        error: insertError,
        details: insertError?.details,
        message: insertError?.message,
        code: insertError?.code,
        attempts: attempts
      });
      
      // رسالة خطأ محددة لتضارب المفتاح
      if (insertError?.code === '23505' && insertError?.message?.includes('project_key')) {
        return NextResponse.json(
          { 
            error: 'Failed to create project due to key conflict',
            details: 'تعذر إنشاء المشروع بسبب تضارب في المفتاح. يرجى المحاولة مرة أخرى.',
            code: 'PROJECT_KEY_CONFLICT',
            attempts: attempts
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create project from note',
          details: insertError?.message || 'Unknown database error',
          code: insertError?.code || 'UNKNOWN_ERROR'
        },
        { status: 500 }
      );
    }

    // Initialize streak record for the new project
    const { error: streakError } = await supabaseAdmin
      .from('streaks')
      .insert({
        user_id: note.user_id,
        project_id: project.id,
        current_streak: 0,
        longest_streak: 0,
      })

    if (streakError) {
      console.error('[ConvertNoteAPI] Error creating streak record:', streakError)
      // Continue anyway as this is not critical
    }

    // Generate initial tasks if NVIDIA API is available
    try {
      if (process.env.NVIDIA_API_KEY && process.env.NVIDIA_API_BASE_URL) {
        console.log(`[ConvertNoteAPI] Generating tasks for new project: ${project.id}`)
        
        // Call the AI API to generate tasks based on note content
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
                content: `أنت مساعد متخصص في تحويل الملاحظات إلى مهام قابلة للتنفيذ. 
                مهمتك هي تحليل الملاحظة وتقسيمها إلى 3-5 خطوات عملية محددة ومرتبة منطقياً لبدء المشروع.
                أعط مهام واضحة ومحددة وقابلة للتنفيذ. لا تستخدم نقاطاً في بداية كل مهمة.`
              },
              {
                role: 'user',
                content: `يرجى تحويل الملاحظة التالية إلى قائمة مهام أولية قابلة للتنفيذ:

عنوان المشروع: "${projectName}"
${projectDescription ? `وصف المشروع: "${projectDescription}"` : ''}
محتوى الملاحظة: "${note.content}"

أعطني 3-5 مهام أولية واضحة ومحددة ومرتبة منطقياً لبدء المشروع.`
              }
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        })

        if (response.ok) {
          const aiResponse = await response.json()
          const taskContent = aiResponse.choices[0].message.content          // Parse AI response into tasks
          const taskLines = taskContent
            .split('\n')
            .filter((line: string) => line.trim().length > 0)
            .map((line: string) => line.trim())
            .filter((line: string) => !line.match(/^[0-9][\.\)]/)) // Filter out any numbered items
          
          // Create the tasks
          if (taskLines.length > 0) {
            const tasks = taskLines.map((content: string, index: number) => ({
              content,
              order_index: index,
              project_id: project.id,
            }))

            await supabaseAdmin.from('tasks').insert(tasks)
          }
        }
      }
    } catch (aiError) {
      console.error('[ConvertNoteAPI] Error generating tasks:', aiError)
      // Continue anyway as task generation is not critical for conversion
    }

    // Return the created project
    return NextResponse.json({ 
      success: true, 
      project 
    })
    
  } catch (error) {
    console.error('[ConvertNoteAPI] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60; // Set maximum execution time to 60 seconds

// GET - جلب الملاحظات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    
    const supabase = getSupabaseAdmin()
    
    let query = supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // فلترة حسب الحالة إذا تم تحديدها
    if (status && status !== 'all') {
      query = query.eq('analysis_status', status)
    }
    
    const { data: notes, error, count } = await query
    
    if (error) {
      console.error('[GET /api/notes] Database error:', error)
      return NextResponse.json(
        { error: 'فشل في جلب الملاحظات', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      notes: notes || [],
      count: count || 0,
      hasMore: notes && notes.length === limit
    })
    
  } catch (error) {
    console.error('[GET /api/notes] Unexpected error:', error)
    return NextResponse.json(
      { error: 'خطأ غير متوقع في الخادم' },
      { status: 500 }
    )
  }
}

// POST - إنشاء ملاحظة جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, content_type = 'text', user_id, raw_telegram_message } = body
    
    // التحقق من صحة البيانات
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'محتوى الملاحظة مطلوب ولا يمكن أن يكون فارغاً' },
        { status: 400 }
      )
    }
    
    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'محتوى الملاحظة طويل جداً (الحد الأقصى 10000 حرف)' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseAdmin()
    
    // إنشاء الملاحظة الجديدة
    const noteData = {
      content: content.trim(),
      content_type,
      user_id: user_id || null,
      analysis_status: 'pending',
      raw_telegram_message: raw_telegram_message || null
    }
    
    const { data: note, error } = await supabase
      .from('notes')
      .insert([noteData])
      .select()
      .single()
    
    if (error) {
      console.error('[POST /api/notes] Database error:', error)
      return NextResponse.json(
        { error: 'فشل في إنشاء الملاحظة', details: error.message },
        { status: 500 }
      )
    }
    
    console.log('[POST /api/notes] Note created successfully:', note.id)
    
    // بدء عملية التحليل في الخلفية (بدون انتظار)
    if (note) {
      analyzeNoteInBackground(note.id, content).catch(error => {
        console.error('[POST /api/notes] Background analysis failed:', error)
      })
    }
    
    return NextResponse.json({
      success: true,
      note,
      message: 'تم إنشاء الملاحظة بنجاح'
    }, { status: 201 })
    
  } catch (error) {
    console.error('[POST /api/notes] Unexpected error:', error)
    return NextResponse.json(
      { error: 'خطأ غير متوقع في إنشاء الملاحظة' },
      { status: 500 }
    )
  }
}

// PUT - تحديث ملاحظة موجودة
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, content, analysis_status, ai_summary, ai_questions } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف الملاحظة مطلوب' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseAdmin()
    
    const updateData: Record<string, string | object> = { updated_at: new Date().toISOString() }
    
    if (content !== undefined) updateData.content = content
    if (analysis_status !== undefined) updateData.analysis_status = analysis_status
    if (ai_summary !== undefined) updateData.ai_summary = ai_summary
    if (ai_questions !== undefined) updateData.ai_questions = ai_questions
    
    const { data: note, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('[PUT /api/notes] Database error:', error)
      return NextResponse.json(
        { error: 'فشل في تحديث الملاحظة', details: error.message },
        { status: 500 }
      )
    }
    
    if (!note) {
      return NextResponse.json(
        { error: 'الملاحظة غير موجودة' },
        { status: 404 }
      )
    }
    
    console.log('[PUT /api/notes] Note updated successfully:', note.id)
    
    return NextResponse.json({
      success: true,
      note,
      message: 'تم تحديث الملاحظة بنجاح'
    })
    
  } catch (error) {
    console.error('[PUT /api/notes] Unexpected error:', error)
    return NextResponse.json(
      { error: 'خطأ غير متوقع في تحديث الملاحظة' },
      { status: 500 }
    )
  }
}

// DELETE - حذف ملاحظة
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف الملاحظة مطلوب' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseAdmin()
    
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('[DELETE /api/notes] Database error:', error)
      return NextResponse.json(
        { error: 'فشل في حذف الملاحظة', details: error.message },
        { status: 500 }
      )
    }
    
    console.log('[DELETE /api/notes] Note deleted successfully:', id)
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف الملاحظة بنجاح'
    })
    
  } catch (error) {
    console.error('[DELETE /api/notes] Unexpected error:', error)
    return NextResponse.json(
      { error: 'خطأ غير متوقع في حذف الملاحظة' },
      { status: 500 }
    )
  }
}

// دالة تحليل الملاحظة في الخلفية
async function analyzeNoteInBackground(noteId: string, content: string) {
  try {
    console.log(`[analyzeNoteInBackground] Starting analysis for note: ${noteId}`)
    
    const supabase = getSupabaseAdmin()
    
    // تحديث حالة التحليل إلى "analyzing"
    await supabase
      .from('notes')
      .update({ 
        analysis_status: 'analyzing',
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
    
    // محاولة التحليل بالذكاء الاصطناعي
    let ai_summary = null
    let ai_questions = null
    
    try {
      // استدعاء API التحليل
      const analysisResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          noteId
        })
      })
      
      if (analysisResponse.ok) {
        const analysisResult = await analysisResponse.json()
        ai_summary = analysisResult.summary
        ai_questions = analysisResult.questions
        console.log(`[analyzeNoteInBackground] AI analysis completed for note: ${noteId}`)
      } else {
        console.warn(`[analyzeNoteInBackground] AI analysis failed for note: ${noteId}`, await analysisResponse.text())
      }
    } catch (aiError) {
      console.warn(`[analyzeNoteInBackground] AI analysis error for note: ${noteId}`, aiError)
    }
    
    // تحديث الملاحظة بنتائج التحليل
    const finalUpdate: Record<string, string | object> = {
      analysis_status: 'completed',
      updated_at: new Date().toISOString()
    }
    
    if (ai_summary) finalUpdate.ai_summary = ai_summary
    if (ai_questions) finalUpdate.ai_questions = ai_questions
    
    await supabase
      .from('notes')
      .update(finalUpdate)
      .eq('id', noteId)
    
    console.log(`[analyzeNoteInBackground] Analysis completed for note: ${noteId}`)
    
  } catch (error) {
    console.error(`[analyzeNoteInBackground] Failed to analyze note: ${noteId}`, error)
    
    // تحديث حالة التحليل إلى "error" في حالة الفشل
    try {
      const supabase = getSupabaseAdmin()
      await supabase
        .from('notes')
        .update({ 
          analysis_status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
    } catch (updateError) {
      console.error(`[analyzeNoteInBackground] Failed to update error status for note: ${noteId}`, updateError)
    }
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { noteId } = await request.json()

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get the note
    const { data: note, error: fetchError } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single()

    if (fetchError || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Update status to analyzing
    await supabaseAdmin
      .from('notes')
      .update({ analysis_status: 'analyzing' })
      .eq('id', noteId)

    try {
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
              content: 'أنت مساعد ذكي متخصص في تحليل النصوص. مهمتك هي تلخيص النص في جملة واحدة مفيدة، ثم طرح 3 أسئلة مفتوحة ومحفزة للتفكير حول المحتوى. اجعل الأسئلة عميقة ومثيرة للاهتمام وتشجع على الاستكشاف والتطوير.'
            },
            {
              role: 'user',
              content: `يرجى تحليل النص التالي:

"${note.content}"

اعطني:
1. ملخص في جملة واحدة
2. ثلاثة أسئلة مفتوحة ومحفزة للتفكير

اجعل الإجابة في صيغة JSON كالتالي:
{
  "summary": "الملخص هنا",
  "questions": ["السؤال الأول", "السؤال الثاني", "السؤال الثالث"]
}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      })

      if (!response.ok) {
        throw new Error(`NVIDIA API error: ${response.status}`)
      }

      const aiResponse = await response.json()
      const content = aiResponse.choices[0]?.message?.content

      if (!content) {
        throw new Error('No content in AI response')
      }

      // Try to parse JSON response
      let aiSummary = ''
      let aiQuestions: string[] = []

      try {
        const parsed = JSON.parse(content)
        aiSummary = parsed.summary || ''
        aiQuestions = parsed.questions || []
      } catch {
        // Fallback: treat as plain text
        aiSummary = content
        aiQuestions = []
      }      // Update the note with AI analysis
      const { error: updateError } = await supabaseAdmin
        .from('notes')
        .update({
          ai_summary: aiSummary,
          ai_questions: aiQuestions,
          analysis_status: 'completed'
        })
        .eq('id', noteId)

      if (updateError) {
        throw new Error('Failed to update note with AI analysis')
      }

      return NextResponse.json({
        success: true,
        summary: aiSummary,
        questions: aiQuestions
      })

    } catch (aiError) {
      console.error('AI analysis error:', aiError)
      
      // Update status to error
      await supabaseAdmin
        .from('notes')
        .update({ analysis_status: 'error' })
        .eq('id', noteId)

      return NextResponse.json({
        error: 'Failed to analyze note'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

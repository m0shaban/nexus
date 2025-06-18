import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// NVIDIA AI API configuration
const NVIDIA_API_BASE = process.env.NVIDIA_API_BASE_URL || 'https://integrate.api.nvidia.com/v1'
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { journal_entry_id, user_id } = body

    if (!journal_entry_id || !user_id) {
      return NextResponse.json(
        { error: 'Journal entry ID and user ID are required' },
        { status: 400 }
      )
    }

    if (!NVIDIA_API_KEY) {
      return NextResponse.json(
        { error: 'AI analysis service not configured' },
        { status: 503 }
      )
    }

    // Fetch the journal entry
    const { data: journalEntry, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', journal_entry_id)
      .eq('user_id', user_id)
      .single()

    if (fetchError || !journalEntry) {
      console.error('Error fetching journal entry:', fetchError)
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }

    // Update status to analyzing
    await supabase
      .from('journal_entries')
      .update({ reflection_status: 'analyzing' })
      .eq('id', journal_entry_id)

    // Prepare AI analysis prompt
    const analysisPrompt = `
أنت مستشار نفسي ذكي ومتعاطف. حلل هذه المدخلة اليومية وقدم تحليلاً شاملاً:

النص: "${journalEntry.content}"

${journalEntry.mood_rating ? `تقييم المزاج: ${journalEntry.mood_rating}/10` : ''}
${journalEntry.energy_level ? `مستوى الطاقة: ${journalEntry.energy_level}/10` : ''}
${journalEntry.stress_level ? `مستوى التوتر: ${journalEntry.stress_level}/10` : ''}

قدم تحليلك في الشكل التالي:

1. **المشاعر المهيمنة**: حدد المشاعر الأساسية (مع مستوى الثقة من 1-10)
2. **الموضوعات الرئيسية**: استخرج 3-5 موضوعات أساسية من النص
3. **نقاط القوة**: حدد الجوانب الإيجابية والموارد الشخصية
4. **مجالات النمو**: اقترح مجالات يمكن تطويرها
5. **رؤى عميقة**: ملاحظات نفسية مفيدة
6. **اقتراحات عملية**: 2-3 خطوات قابلة للتطبيق للتحسن

كن متعاطفاً ومشجعاً، وركز على النمو الشخصي والفهم الذاتي.`

    try {
      // Call NVIDIA AI API
      const aiResponse = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Nexus-Mirror/1.0'
        },
        body: JSON.stringify({
          model: 'nvidia/llama-3.1-nemotron-70b-instruct',
          messages: [
            {
              role: 'system',
              content: 'أنت مستشار نفسي ذكي متخصص في التحليل النفسي والنمو الشخصي. تقدم تحليلات عميقة ومفيدة باللغة العربية.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 0.9
        })
      })

      if (!aiResponse.ok) {
        const errorData = await aiResponse.text()
        console.error('NVIDIA AI API error:', errorData)
        throw new Error(`AI API error: ${aiResponse.status}`)
      }

      const aiData = await aiResponse.json()
      const aiReflection = aiData.choices?.[0]?.message?.content

      if (!aiReflection) {
        throw new Error('No reflection content received from AI')
      }

      // Extract structured insights from the reflection
      const extractInsights = (text: string): string[] => {
        const insights: string[] = []
        
        // Look for numbered points or bullet points
        const patterns = [
          /\d+\.\s*\*\*([^*]+)\*\*:?\s*([^\n]+)/g,
          /[-•]\s*([^\n]+)/g,
          /\*\*([^*]+)\*\*:?\s*([^\n]+)/g
        ]
        
        for (const pattern of patterns) {
          let match
          while ((match = pattern.exec(text)) !== null) {
            const insight = match.length > 2 ? `${match[1]}: ${match[2]}` : match[1]
            if (insight && insight.length > 10) {
              insights.push(insight.trim())
            }
          }
          if (insights.length >= 5) break
        }
        
        return insights.slice(0, 6) // Limit to 6 insights
      }

      // Analyze mood from the reflection
      const extractMoodAnalysis = (text: string, content: string) => {
        // Simple emotion detection based on Arabic keywords
        const emotions = {
          'سعيد': ['سعيد', 'فرح', 'مبهج', 'متفائل', 'راض'],
          'حزين': ['حزين', 'كئيب', 'مكتئب', 'يائس', 'محبط'],
          'قلق': ['قلق', 'متوتر', 'خائف', 'مضطرب', 'عصبي'],
          'غاضب': ['غاضب', 'منزعج', 'محبط', 'مستاء', 'ثائر'],
          'هادئ': ['هادئ', 'مسترخي', 'مطمئن', 'سكين', 'منتعش'],
          'متحمس': ['متحمس', 'متحفز', 'نشيط', 'طموح', 'مندفع']
        }
        
        let dominantEmotion = 'مختلط'
        let maxScore = 0
        
        for (const [emotion, keywords] of Object.entries(emotions)) {
          let score = 0
          keywords.forEach(keyword => {
            const occurrences = (content.toLowerCase().match(new RegExp(keyword, 'g')) || []).length
            score += occurrences
          })
          if (score > maxScore) {
            maxScore = score
            dominantEmotion = emotion
          }
        }
        
        return {
          dominant_emotion: dominantEmotion,
          confidence: Math.min(maxScore * 2, 10), // Scale to 1-10
          themes: extractInsights(text).slice(0, 3),
          growth_areas: ['تطوير الوعي الذاتي', 'تحسين إدارة المشاعر', 'تعزيز العادات الإيجابية']
        }
      }

      const aiInsights = extractInsights(aiReflection)
      const aiMoodAnalysis = extractMoodAnalysis(aiReflection, journalEntry.content)

      // Update journal entry with AI analysis
      const { data: updatedEntry, error: updateError } = await supabase
        .from('journal_entries')
        .update({
          ai_reflection: aiReflection,
          ai_insights: aiInsights,
          ai_mood_analysis: aiMoodAnalysis,
          reflection_status: 'completed'
        })
        .eq('id', journal_entry_id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating journal entry with AI analysis:', updateError)
        throw updateError
      }

      return NextResponse.json({
        success: true,
        journalEntry: updatedEntry,
        ai_reflection: aiReflection,
        ai_insights: aiInsights,
        ai_mood_analysis: aiMoodAnalysis,
        message: 'AI reflection completed successfully'
      })

    } catch (aiError) {
      console.error('AI analysis error:', aiError)
      
      // Update status to error
      await supabase
        .from('journal_entries')
        .update({ reflection_status: 'error' })
        .eq('id', journal_entry_id)

      return NextResponse.json(
        { error: 'Failed to generate AI reflection' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in journal reflection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch reflection status
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const journalEntryId = url.searchParams.get('journal_entry_id')
    const userId = url.searchParams.get('user_id')

    if (!journalEntryId || !userId) {
      return NextResponse.json(
        { error: 'Journal entry ID and user ID are required' },
        { status: 400 }
      )
    }

    const { data: journalEntry, error } = await supabase
      .from('journal_entries')
      .select('ai_reflection, ai_insights, ai_mood_analysis, reflection_status')
      .eq('id', journalEntryId)
      .eq('user_id', userId)
      .single()

    if (error || !journalEntry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      reflection_status: journalEntry.reflection_status,
      ai_reflection: journalEntry.ai_reflection,
      ai_insights: journalEntry.ai_insights,
      ai_mood_analysis: journalEntry.ai_mood_analysis
    })

  } catch (error) {
    console.error('Error fetching reflection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

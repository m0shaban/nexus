import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { 
      projectId, 
      scenarioTitle, 
      scenarioDescription, 
      assumptions 
    } = await request.json()

    if (!scenarioTitle || !scenarioDescription) {
      return NextResponse.json(
        { error: 'عنوان السيناريو والوصف مطلوبان' }, 
        { status: 400 }
      )
    }

    // Create scenario record first
    const { data: scenario, error: scenarioError } = await supabaseAdmin
      .from('scenarios')
      .insert({
        project_id: projectId || null,
        title: scenarioTitle,
        description: scenarioDescription,
        assumptions: assumptions || [],
        status: 'analyzing'
      })
      .select()
      .single()

    if (scenarioError) {
      console.error('[PreMortem] Error creating scenario:', scenarioError)
      return NextResponse.json(
        { error: 'فشل في إنشاء السيناريو' },
        { status: 500 }
      )
    }

    // Prepare prompt for AI analysis
    const prompt = `
أنت خبير تحليل المخاطر والتخطيط الاستراتيجي. قم بتحليل هذا السيناريو:

العنوان: ${scenarioTitle}
الوصف: ${scenarioDescription}
${assumptions && assumptions.length > 0 ? `الافتراضات: ${assumptions.join(', ')}` : ''}

قم بإجراء تحليل Pre-Mortem شامل وأعد:

1. أفضل النتائج المحتملة (Best Case) - في جملة واحدة
2. أسوأ النتائج المحتملة (Worst Case) - في جملة واحدة  
3. النتيجة الأكثر احتمالاً (Most Likely) - في جملة واحدة
4. تحليل Pre-Mortem: افترض أن المشروع فشل تماماً، ما هي أهم 5 أسباب محتملة للفشل؟
5. مستوى الثقة (1-10)
6. مستوى المخاطر (low/medium/high/critical)

أجب بتنسيق JSON فقط:
{
  "bestCase": "...",
  "worstCase": "...", 
  "mostLikely": "...",
  "preMortemReasons": ["سبب 1", "سبب 2", "سبب 3", "سبب 4", "سبب 5"],
  "confidenceScore": 8,
  "riskLevel": "medium"
}
`

    // Call AI service
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'أنت خبير تحليل المخاطر الاستراتيجي. أجب بتنسيق JSON صحيح فقط.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    })

    if (!aiResponse.ok) {
      throw new Error(`خطأ في استدعاء AI: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const content = aiData.choices[0]?.message?.content

    if (!content) {
      throw new Error('لم يتم الحصول على رد من AI')
    }

    let analysis
    try {
      analysis = JSON.parse(content)
    } catch (parseError) {
      console.error('[PreMortem] JSON parsing error:', parseError)
      // Fallback parsing for non-JSON responses
      analysis = {
        bestCase: 'تحليل غير مكتمل - يرجى المحاولة مرة أخرى',
        worstCase: 'تحليل غير مكتمل - يرجى المحاولة مرة أخرى',
        mostLikely: 'تحليل غير مكتمل - يرجى المحاولة مرة أخرى',
        preMortemReasons: ['خطأ في التحليل'],
        confidenceScore: 1,
        riskLevel: 'medium'
      }
    }

    // Update scenario with AI analysis
    const { data: updatedScenario, error: updateError } = await supabaseAdmin
      .from('scenarios')
      .update({
        ai_best_case: analysis.bestCase,
        ai_worst_case: analysis.worstCase,
        ai_most_likely: analysis.mostLikely,
        ai_pre_mortem_result: analysis.preMortemReasons,
        confidence_score: analysis.confidenceScore,
        risk_level: analysis.riskLevel,
        status: 'completed'
      })
      .eq('id', scenario.id)
      .select()
      .single()

    if (updateError) {
      console.error('[PreMortem] Error updating scenario:', updateError)
      return NextResponse.json(
        { error: 'فشل في حفظ نتائج التحليل' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      scenario: updatedScenario,
      message: 'تم إجراء تحليل Pre-Mortem بنجاح'
    })

  } catch (error) {
    console.error('[PreMortem] Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'خطأ غير متوقع في تحليل السيناريو'
      },
      { status: 500 }
    )
  }
}

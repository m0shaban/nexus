import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET user preferences
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: preferences, error } = await supabase
      .from('logos_user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // If no preferences exist, create default ones
    if (!preferences) {
      const { data: newPreferences, error: createError } = await supabase
        .from('logos_user_preferences')
        .insert({
          user_id: userId,
          analysis_depth: 'comprehensive',
          response_style: 'strategic',
          challenge_level: 'high',
          auto_context_from_notes: true,
          auto_context_from_projects: true,
          auto_context_from_journal: true,
          auto_context_from_scenarios: true,
          show_thinking_process: true,
          show_confidence_scores: true,
          preferred_language: 'ar',
          enable_proactive_suggestions: true,
          enable_strategic_challenges: true,
          enable_cross_module_analysis: true
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      return NextResponse.json(newPreferences)
    }

    return NextResponse.json(preferences)

  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...updateData } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate enum values
    const validEnums = {
      analysis_depth: ['quick', 'standard', 'comprehensive', 'deep'],
      response_style: ['casual', 'professional', 'strategic', 'analytical'],
      challenge_level: ['low', 'medium', 'high', 'maximum'],
      preferred_language: ['ar', 'en', 'mixed']
    }

    for (const [key, value] of Object.entries(updateData)) {
      if (key in validEnums && !validEnums[key as keyof typeof validEnums].includes(value as string)) {
        return NextResponse.json(
          { error: `Invalid value for ${key}: ${value}` },
          { status: 400 }
        )
      }
    }

    const { data: preferences, error } = await supabase
      .from('logos_user_preferences')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(preferences)

  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

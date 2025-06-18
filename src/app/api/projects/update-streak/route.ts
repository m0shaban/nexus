import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get the project to verify it exists and get the user ID
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get current streak record
    const { data: streakData, error: streakError } = await supabaseAdmin
      .from('streaks')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (streakError && streakError.code !== 'PGRST116') {  // PGRST116 is "no rows returned" error
      console.error('[UpdateStreakAPI] Error fetching streak:', streakError)
      return NextResponse.json(
        { error: 'Failed to fetch streak information' },
        { status: 500 }
      )
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    
    // If streak record exists
    if (streakData) {
      const lastActivityDate = new Date(streakData.last_activity_date)
      const lastActivityDay = new Date(
        lastActivityDate.getFullYear(), 
        lastActivityDate.getMonth(), 
        lastActivityDate.getDate()
      )
      
      const msPerDay = 24 * 60 * 60 * 1000
      const daysSinceLastActivity = Math.round(
        (new Date(today).getTime() - lastActivityDay.getTime()) / msPerDay
      )
      
      let { current_streak, longest_streak } = streakData
      
      // If activity was yesterday, increment streak
      if (daysSinceLastActivity === 1) {
        current_streak += 1
        longest_streak = Math.max(current_streak, longest_streak)
      } 
      // If activity is not from today and not from yesterday, reset streak
      else if (daysSinceLastActivity > 1) {
        current_streak = 1
      }
      // If activity is from today, don't change the streak
      
      // Update the streak record
      const { error: updateError } = await supabaseAdmin
        .from('streaks')
        .update({
          current_streak,
          longest_streak,
          last_activity_date: now.toISOString()
        })
        .eq('id', streakData.id)

      if (updateError) {
        console.error('[UpdateStreakAPI] Error updating streak:', updateError)
        return NextResponse.json(
          { error: 'Failed to update streak information' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        streak: {
          current_streak,
          longest_streak,
          last_activity_date: now.toISOString()
        }
      })
    } 
    // If streak record doesn't exist, create one
    else {
      const { data: newStreak, error: insertError } = await supabaseAdmin
        .from('streaks')
        .insert({
          user_id: project.user_id,
          project_id: projectId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: now.toISOString()
        })
        .select()
        .single()

      if (insertError) {
        console.error('[UpdateStreakAPI] Error creating streak:', insertError)
        return NextResponse.json(
          { error: 'Failed to create streak information' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        streak: newStreak
      })
    }
    
  } catch (error) {
    console.error('[UpdateStreakAPI] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

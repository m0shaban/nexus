import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')
    const date = url.searchParams.get('date')
    const limit = url.searchParams.get('limit') || '30'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('journal_entries')
      .select(`
        id,
        created_at,
        updated_at,
        user_id,
        date,
        content,
        mood_rating,
        energy_level,
        stress_level,
        ai_reflection,
        ai_insights,
        ai_mood_analysis,
        tags,
        is_private,
        reflection_status
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(parseInt(limit))

    // If specific date requested, filter by date
    if (date) {
      query = query.eq('date', date)
    }

    const { data: journalEntries, error } = await query

    if (error) {
      console.error('Error fetching journal entries:', error)
      return NextResponse.json(
        { error: 'Failed to fetch journal entries' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      journalEntries: journalEntries || []
    })

  } catch (error) {
    console.error('Error in journal entries GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      date,
      content,
      mood_rating,
      energy_level,
      stress_level,
      tags,
      is_private = true
    } = body

    // Validation
    if (!user_id || !date || !content) {
      return NextResponse.json(
        { error: 'User ID, date, and content are required' },
        { status: 400 }
      )
    }

    // Validate mood ratings if provided
    if (mood_rating && (mood_rating < 1 || mood_rating > 10)) {
      return NextResponse.json(
        { error: 'Mood rating must be between 1 and 10' },
        { status: 400 }
      )
    }

    if (energy_level && (energy_level < 1 || energy_level > 10)) {
      return NextResponse.json(
        { error: 'Energy level must be between 1 and 10' },
        { status: 400 }
      )
    }

    if (stress_level && (stress_level < 1 || stress_level > 10)) {
      return NextResponse.json(
        { error: 'Stress level must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Check if entry already exists for this user and date
    const { data: existingEntry } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', user_id)
      .eq('date', date)
      .single()

    if (existingEntry) {
      // Update existing entry
      const { data: updatedEntry, error } = await supabase
        .from('journal_entries')
        .update({
          content,
          mood_rating,
          energy_level,
          stress_level,
          tags: tags || [],
          is_private,
          reflection_status: 'pending' // Reset reflection status on content update
        })
        .eq('id', existingEntry.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating journal entry:', error)
        return NextResponse.json(
          { error: 'Failed to update journal entry' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        journalEntry: updatedEntry,
        message: 'Journal entry updated successfully'
      })
    } else {
      // Create new entry
      const { data: newEntry, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id,
          date,
          content,
          mood_rating,
          energy_level,
          stress_level,
          tags: tags || [],
          is_private,
          reflection_status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating journal entry:', error)
        return NextResponse.json(
          { error: 'Failed to create journal entry' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        journalEntry: newEntry,
        message: 'Journal entry created successfully'
      })
    }

  } catch (error) {
    console.error('Error in journal entries POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      content,
      mood_rating,
      energy_level,
      stress_level,
      tags,
      is_private
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Journal entry ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    
    if (content !== undefined) updateData.content = content
    if (mood_rating !== undefined) updateData.mood_rating = mood_rating
    if (energy_level !== undefined) updateData.energy_level = energy_level
    if (stress_level !== undefined) updateData.stress_level = stress_level
    if (tags !== undefined) updateData.tags = tags
    if (is_private !== undefined) updateData.is_private = is_private

    // Reset reflection status if content changed
    if (content !== undefined) {
      updateData.reflection_status = 'pending'
    }

    const { data: updatedEntry, error } = await supabase
      .from('journal_entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating journal entry:', error)
      return NextResponse.json(
        { error: 'Failed to update journal entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      journalEntry: updatedEntry,
      message: 'Journal entry updated successfully'
    })

  } catch (error) {
    console.error('Error in journal entries PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Journal entry ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting journal entry:', error)
      return NextResponse.json(
        { error: 'Failed to delete journal entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Journal entry deleted successfully'
    })

  } catch (error) {
    console.error('Error in journal entries DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

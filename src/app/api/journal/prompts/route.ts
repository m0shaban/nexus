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
    const category = url.searchParams.get('category')
    const activeOnly = url.searchParams.get('active_only') !== 'false'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('journal_prompts')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: prompts, error } = await query

    if (error) {
      console.error('Error fetching journal prompts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch journal prompts' },
        { status: 500 }
      )
    }

    // If no prompts found, create default ones
    if (!prompts || prompts.length === 0) {
      const defaultPrompts = await createDefaultPrompts(userId)
      return NextResponse.json({
        success: true,
        prompts: defaultPrompts,
        message: 'Default prompts created'
      })
    }

    return NextResponse.json({
      success: true,
      prompts: prompts || []
    })

  } catch (error) {
    console.error('Error in journal prompts GET:', error)
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
      question,
      category = 'reflection',
      is_active = true,
      order_index = 0
    } = body

    if (!user_id || !question) {
      return NextResponse.json(
        { error: 'User ID and question are required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['reflection', 'gratitude', 'goals', 'emotions', 'relationships', 'growth']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    const { data: newPrompt, error } = await supabase
      .from('journal_prompts')
      .insert({
        user_id,
        question,
        category,
        is_active,
        order_index
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating journal prompt:', error)
      return NextResponse.json(
        { error: 'Failed to create journal prompt' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      prompt: newPrompt,
      message: 'Journal prompt created successfully'
    })

  } catch (error) {
    console.error('Error in journal prompts POST:', error)
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
      question,
      category,
      is_active,
      order_index
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    
    if (question !== undefined) updateData.question = question
    if (category !== undefined) {
      const validCategories = ['reflection', 'gratitude', 'goals', 'emotions', 'relationships', 'growth']
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
      }
      updateData.category = category
    }
    if (is_active !== undefined) updateData.is_active = is_active
    if (order_index !== undefined) updateData.order_index = order_index

    const { data: updatedPrompt, error } = await supabase
      .from('journal_prompts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating journal prompt:', error)
      return NextResponse.json(
        { error: 'Failed to update journal prompt' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      prompt: updatedPrompt,
      message: 'Journal prompt updated successfully'
    })

  } catch (error) {
    console.error('Error in journal prompts PUT:', error)
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
        { error: 'Prompt ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('journal_prompts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting journal prompt:', error)
      return NextResponse.json(
        { error: 'Failed to delete journal prompt' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Journal prompt deleted successfully'
    })

  } catch (error) {
    console.error('Error in journal prompts DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createDefaultPrompts(userId: string) {
  const defaultPrompts = [
    {
      user_id: userId,
      question: 'ما الذي تشعر بالامتنان له اليوم؟',
      category: 'gratitude',
      is_active: true,
      order_index: 1
    },
    {
      user_id: userId,
      question: 'ما أهم شيء تعلمته اليوم؟',
      category: 'reflection',
      is_active: true,
      order_index: 2
    },
    {
      user_id: userId,
      question: 'كيف كان مستوى طاقتك اليوم؟ ما الذي أثر عليه؟',
      category: 'emotions',
      is_active: true,
      order_index: 3
    },
    {
      user_id: userId,
      question: 'ما التحدي الأكبر الذي واجهته اليوم وكيف تعاملت معه؟',
      category: 'growth',
      is_active: true,
      order_index: 4
    },
    {
      user_id: userId,
      question: 'ما الذي تتطلع إليه غداً؟',
      category: 'goals',
      is_active: true,
      order_index: 5
    },
    {
      user_id: userId,
      question: 'كيف كانت علاقاتك مع الآخرين اليوم؟',
      category: 'relationships',
      is_active: true,
      order_index: 6
    }
  ]

  const { data: createdPrompts, error } = await supabase
    .from('journal_prompts')
    .insert(defaultPrompts)
    .select()

  if (error) {
    console.error('Error creating default prompts:', error)
    throw error
  }

  return createdPrompts || []
}

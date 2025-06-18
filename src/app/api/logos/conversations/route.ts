import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET all conversations for a user
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const limit = url.searchParams.get('limit') || '20'
    const type = url.searchParams.get('type')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('logos_conversations')
      .select(`
        id,
        created_at,
        updated_at,
        title,
        conversation_type,
        priority_level,
        is_active
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(parseInt(limit))

    if (type) {
      query = query.eq('conversation_type', type)
    }

    const { data: conversations, error } = await query

    if (error) {
      throw error
    }

    // Get message count for each conversation
    const conversationsWithStats = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { data: messageCount } = await supabase
          .from('logos_messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)

        const { data: lastMessage } = await supabase
          .from('logos_messages')
          .select('content, created_at, role')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...conv,
          message_count: messageCount?.length || 0,
          last_message: lastMessage || null
        }
      })
    )

    return NextResponse.json(conversationsWithStats)

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, type = 'general', priority = 'normal' } = body

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'User ID and title are required' },
        { status: 400 }
      )
    }

    const { data: conversation, error } = await supabase
      .from('logos_conversations')
      .insert({
        user_id: userId,
        title: title.substring(0, 100), // Limit title length
        conversation_type: type,
        priority_level: priority,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(conversation)

  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update conversation
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, userId, title, type, priority, isActive } = body

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'Conversation ID and user ID are required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title.substring(0, 100)
    if (type !== undefined) updateData.conversation_type = type
    if (priority !== undefined) updateData.priority_level = priority
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: conversation, error } = await supabase
      .from('logos_conversations')
      .update(updateData)
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(conversation)

  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE conversation
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const conversationId = url.searchParams.get('conversationId')
    const userId = url.searchParams.get('userId')

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'Conversation ID and user ID are required' },
        { status: 400 }
      )
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('logos_conversations')
      .update({ is_active: false })
      .eq('id', conversationId)
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

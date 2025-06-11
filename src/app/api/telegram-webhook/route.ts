import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { TelegramMessage } from '@/types/database'

export async function POST(request: NextRequest) {
  // Debug logs for incoming webhook
  console.log('[Telegram Webhook] Headers:', JSON.stringify(Object.fromEntries(request.headers.entries())));
  const rawBody = await request.text();
  console.log('[Telegram Webhook] Raw Body:', rawBody);
  const body = JSON.parse(rawBody);

  // Verify webhook secret
  const webhookSecret = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (webhookSecret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const message: TelegramMessage = body.message

  if (!message) {
    return NextResponse.json({ error: 'No message found' }, { status: 400 })
  }

  // Extract content based on message type
  let content = ''
  let contentType = 'text'

  if (message.text) {
    content = message.text
    contentType = 'text'
  } else if (message.photo) {
    content = 'صورة مرسلة من تيليجرام'
    contentType = 'photo'
  } else if (message.document) {
    content = `مستند: ${message.document.file_name || 'غير محدد'}`
    contentType = 'document'
  } else if (message.voice) {
    content = 'رسالة صوتية من تيليجرام'
    contentType = 'voice'
  } else {
    content = 'رسالة غير مدعومة'
    contentType = 'unknown'
  }    // Save to database
  const supabaseAdmin = getSupabaseAdmin()
  const { data, error } = await supabaseAdmin
    .from('notes')
    .insert({
      content,
      content_type: contentType,
      raw_telegram_message: message,
      analysis_status: null,
      user_id: null // Will be set when auth is implemented
    })
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ success: true, note: data })
}

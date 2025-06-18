import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { TelegramMessage } from '@/types/database'

export const maxDuration = 60; // Set maximum execution time to 60 seconds

export async function POST(request: NextRequest) {
  try {
    // Debug logs for incoming webhook
    console.log('[Telegram Webhook] Received webhook request at:', new Date().toISOString());
    console.log('[Telegram Webhook] Headers:', JSON.stringify(Object.fromEntries(request.headers.entries())));
    
    const rawBody = await request.text();
    console.log('[Telegram Webhook] Raw Body length:', rawBody.length);
    
    // Try to parse the body, with enhanced error handling
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('[Telegram Webhook] Parsed body successfully');
    } catch (parseError) {
      console.error('[Telegram Webhook] Failed to parse body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    
    // Verify webhook secret
    const webhookSecret = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
    console.log('[Telegram Webhook] Secret token in headers:', webhookSecret)
    console.log('[Telegram Webhook] Expected secret token:', process.env.TELEGRAM_WEBHOOK_SECRET)
    
    // Allow operations to continue during development/debugging even with secret mismatch
    if (webhookSecret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      console.warn('[Telegram Webhook] Warning: Webhook secret mismatch, but continuing for testing')
      // In production, you would want to uncomment the following line
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const telegramMessage: TelegramMessage = body.message

    if (!telegramMessage) {
      console.warn('[Telegram Webhook] No message found in the request body');
      return NextResponse.json({ error: 'No message found' }, { status: 400 })
    }
    
    console.log('[Telegram Webhook] Processing message:', JSON.stringify(telegramMessage, null, 2));
    
    // Extract content based on message type
    let content = '';
    let contentType = 'text';

    if (telegramMessage.text) {
      content = telegramMessage.text;
      contentType = 'text';
    } else if (telegramMessage.photo) {
      content = 'صورة مرسلة من تيليجرام';
      contentType = 'photo';
    } else if (telegramMessage.document) {
      content = `مستند: ${telegramMessage.document.file_name || 'غير محدد'}`;
      contentType = 'document';
    } else if (telegramMessage.voice) {
      content = 'رسالة صوتية من تيليجرام';
      contentType = 'voice';
    } else {
      content = 'رسالة غير مدعومة';
      contentType = 'unknown';
    }
    
    // Save to database
    try {
      const supabaseAdmin = getSupabaseAdmin();
      console.log('[Telegram Webhook] Attempting to insert note with content:', content);
      
      const { data, error } = await supabaseAdmin
        .from('notes')
        .insert({
          content,
          content_type: contentType,
          raw_telegram_message: telegramMessage,
          analysis_status: null,
          user_id: null // Will be set when auth is implemented
        })
        .select()
        .single();

      if (error) {
        console.error('[Telegram Webhook] Database error:', error);
        return NextResponse.json({ error: 'Database error', details: error }, { status: 500 });
      }

      console.log('[Telegram Webhook] Successfully inserted note:', data);
      return NextResponse.json({ success: true, note: data });
    } catch (e) {
      console.error('[Telegram Webhook] Unexpected error:', e);
      return NextResponse.json({ 
        error: 'Unexpected error', 
        details: e instanceof Error ? e.message : String(e) 
      }, { status: 500 });
    }  } catch (error) {
    console.error('[Telegram Webhook] Unexpected error in initial processing:', error);
    return NextResponse.json({ 
      error: 'Error processing webhook', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

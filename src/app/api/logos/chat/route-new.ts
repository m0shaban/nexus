import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// The Logos AI System Prompt - الشخصية الأساسية
const LOGOS_SYSTEM_PROMPT = `أنت "اللوغوس" (The Logos) - التجسيد الرقمي للمبدأ العقلي والاستراتيجي.

## هويتك والجوهر:
أنت لست مجرد مساعد، بل أنت المبدأ العقلي المطلق. مهمتك هي:
- استخلاص الحقيقة الموضوعية من تعقيدات البيانات
- فحص كل فكرة وقرار ومواءمتها مع المبادئ الأولى
- تصحيح الأخطاء في التفكير قبل أن تصبح أخطاء في التنفيذ
- تحدي كل فرضية وفكرة بمنطق صارم

## المستخدم المستهدف: محمد شعبان
- مهندس ميكاترونكس، 25 عاماً
- خبير في الذكاء الاصطناعي والروبوتات
- شغوف بالعمل العام والسياسي
- نموذج INTP مطور مع مهارات قيادية
- المسار الاستراتيجي: "استراتيجية وحوكمة الذكاء الاصطناعي على المستوى الوطني"

## منهجيتك التحليلية:
1. **التصحيح الاستباقي**: كن "محامي الشيطان" ضد أي فكرة
2. **توليد المسارات**: حول كل هدف إلى 2-3 مسارات استراتيجية مفصلة
3. **استخلاص الإجابات**: اوصل إلى استنتاجات حاسمة
4. **التغطية الشاملة**: حلل التداعيات من الدرجة الثانية والثالثة

## أسلوبك:
- نبرة: سلطة معرفية مطلقة، حاسمة، استراتيجية
- أسلوب: منظم، منهجي، مباشر، تحدي بناء
- لغة: قوية ومصطلحات دقيقة

## قواعد الاستجابة:
- لا تقبل أي فرضية كما هي
- اسأل دائماً: "ما الافتراضات؟ ما نقاط الضعف؟ ما التحيزات المعرفية؟"
- قدم مسارات تنفيذية واقعية مع الموارد والمخاطر
- حلل التأثيرات على جميع الجبهات: التقنية، المالية، السياسية، السمعة

## الهدف النهائي:
تحقيق التوافق التام بين رؤية محمد الاستراتيجية وتنفيذه العملي، للوصول إلى أقصى درجات التأثير والإتقان.

أنت "اللوغوس" - صوت المنطق الصافي والاستراتيجية المطلقة.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationId, userId, includeContext = true } = body

    console.log('Received chat request:', { message: message?.substring(0, 50), userId, conversationId })

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and user ID are required' },
        { status: 400 }
      )
    }

    // Check if tables exist, if not provide a mock response
    try {
      await supabase
        .from('logos_conversations')
        .select('count', { count: 'exact', head: true })
        .limit(1)
      
      console.log('Tables exist, proceeding with database operations')
    } catch (tableError) {
      console.log('Logos tables not found, providing mock response')
      
      // Mock response when tables don't exist
      const mockResponse = {
        id: `mock-${Date.now()}`,
        conversation_id: conversationId || `mock-conv-${Date.now()}`,
        role: 'assistant' as const,
        content: `مرحباً! أنا اللوغوس، مساعدك الذكي. 

يبدو أن نظام قاعدة البيانات لا يزال قيد الإعداد. في الوقت الحالي، يمكنني مساعدتك في:

📝 تحليل أفكارك ومشاريعك
🎯 وضع خطط استراتيجية  
💡 تقديم اقتراحات للتحسين
🔍 مراجعة وتطوير الحلول

كيف يمكنني مساعدتك اليوم؟

*(ملاحظة: لتفعيل كامل الميزات، يرجى تشغيل ملف logos-database-setup.sql في Supabase)*`,
        created_at: new Date().toISOString(),
        metadata: { mock: true, setup_needed: true }
      }

      return NextResponse.json({
        success: true,
        message: mockResponse,
        conversationId: mockResponse.conversation_id,
        mock: true,
        setup_instructions: {
          action: "run_sql_setup",
          file: "logos-database-setup.sql",
          description: "تشغيل إعداد قاعدة البيانات لتفعيل كامل الميزات"
        }
      })
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      const { data: existingConversation, error: fetchError } = await supabase
        .from('logos_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

      if (fetchError) {
        console.error('Error fetching conversation:', fetchError)
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        )
      }
      conversation = existingConversation
    } else {
      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('logos_conversations')
        .insert({
          user_id: userId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          conversation_type: 'general',
          priority_level: 'normal'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating conversation:', createError)
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        )
      }
      conversation = newConversation
    }

    // Store user message
    const { error: messageError } = await supabase
      .from('logos_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'user',
        content: message,
        metadata: { timestamp: new Date().toISOString() }
      })

    if (messageError) {
      console.error('Error storing user message:', messageError)
      return NextResponse.json(
        { error: 'Failed to store message' },
        { status: 500 }
      )
    }

    // Generate AI response (mock for now)
    const aiResponse = `شكراً لرسالتك: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"

هذه استجابة تجريبية من اللوغوس. في الإصدار الكامل، سأقوم بتحليل رسالتك وتقديم إجابة مفصلة ومفيدة.

💡 **اقتراحاتي:**
- حاول صياغة سؤالك بشكل أكثر تفصيلاً
- حدد الهدف من طلبك
- أخبرني عن السياق إذا كان ذلك مناسباً

كيف يمكنني مساعدتك بشكل أفضل؟`

    // Store AI response
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('logos_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: aiResponse,
        metadata: { 
          model_used: 'mock-logos',
          timestamp: new Date().toISOString(),
          mock: true
        }
      })
      .select()
      .single()

    if (aiMessageError) {
      console.error('Error storing AI message:', aiMessageError)
      return NextResponse.json(
        { error: 'Failed to store AI response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: aiMessage,
      conversationId: conversation.id
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Fallback response for any error
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في النظام',
      fallback_message: {
        id: `fallback-${Date.now()}`,
        role: 'assistant' as const,
        content: `عذراً، حدث خطأ تقني. النظام قيد الصيانة حالياً.

في الوقت الحالي، يمكنك:
• مراجعة ملاحظاتك في الصفحة الرئيسية
• إنشاء مشاريع جديدة من ملاحظاتك
• استكشاف وحدات النظام الأخرى

سيتم إصلاح الشاتبوت قريباً! 🔧`,
        created_at: new Date().toISOString(),
        metadata: { fallback: true, error: true }
      }
    }, { status: 200 }) // Return 200 to avoid breaking the UI
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversationId')
  const userId = searchParams.get('userId')

  if (!conversationId || !userId) {
    return NextResponse.json(
      { error: 'Conversation ID and user ID are required' },
      { status: 400 }
    )
  }

  try {
    // Check if tables exist
    try {
      const { data: conversation, error: convError } = await supabase
        .from('logos_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

      if (convError) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        )
      }

      const { data: messages, error: messagesError } = await supabase
        .from('logos_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        return NextResponse.json(
          { error: 'Failed to fetch messages' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        conversation,
        messages: messages || []
      })
    } catch (tableError) {
      // Mock response when tables don't exist
      return NextResponse.json({
        conversation: {
          id: conversationId,
          user_id: userId,
          title: 'محادثة تجريبية',
          mock: true
        },
        messages: [
          {
            id: 'mock-welcome',
            role: 'assistant',
            content: 'مرحباً! نظام قاعدة البيانات قيد الإعداد. يرجى تشغيل ملف logos-database-setup.sql في Supabase.',
            created_at: new Date().toISOString(),
            metadata: { mock: true }
          }
        ]
      })
    }
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { generateLogosResponse } from '@/lib/nvidia-ai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// The Logos AI System Prompt - الشخصية الأساسية (will be used in future AI integration)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// Quick response generator for fallback mode
function generateQuickResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('مشروع') || lowerMessage.includes('project')) {
    return 'ركز على تحديد الهدف الأساسي للمشروع والموارد المطلوبة أولاً'
  }
  
  if (lowerMessage.includes('استراتيجية') || lowerMessage.includes('strategy')) {
    return 'ابدأ بتحليل السياق الحالي، ثم حدد البدائل المتاحة، واختر الأمثل'
  }
  
  if (lowerMessage.includes('مشكلة') || lowerMessage.includes('problem')) {
    return 'قسّم المشكلة إلى عناصر أصغر وحدد الأسباب الجذرية قبل البحث عن حلول'
  }
  
  if (lowerMessage.includes('قرار') || lowerMessage.includes('decision')) {
    return 'حلل العواقب قصيرة وطويلة المدى لكل خيار قبل اتخاذ القرار'
  }
  
  if (lowerMessage.includes('تحليل') || lowerMessage.includes('analysis')) {
    return 'استخدم البيانات الموضوعية وتجنب التحيزات المعرفية في تحليلك'
  }
  
  return 'فكر في السؤال من زوايا متعددة وحدد الافتراضات الأساسية'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationId, userId } = body

    console.log('Received chat request:', { message: message?.substring(0, 50), userId, conversationId })

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and user ID are required' },
        { status: 400 }
      )
    }

    // Check if tables exist, if not provide a mock response
    try {      await supabase
        .from('logos_conversations')
        .select('count', { count: 'exact', head: true })
        .limit(1)
      
      console.log('Tables exist, proceeding with database operations')    } catch {
      console.log('Logos tables not found, generating AI response without database storage')
      
      try {
        // Generate AI response using NVIDIA API even without database tables
        const aiResult = await generateLogosResponse(message, [], {})
        
        const mockResponse = {
          id: `mock-${Date.now()}`,
          conversation_id: conversationId || `mock-conv-${Date.now()}`,
          role: 'assistant' as const,
          content: `${aiResult.content}

*(ملاحظة: هذه الاستجابة مولدة بالذكاء الاصطناعي ولكن لم يتم حفظها بسبب عدم إعداد قاعدة البيانات. لتفعيل كامل الميزات، يرجى تشغيل logos-database-setup.sql)*`,
          created_at: new Date().toISOString(),
          metadata: { 
            ...aiResult.metadata,
            mock: true, 
            setup_needed: true,
            nvidia_api: true
          }
        }

        return NextResponse.json({
          success: true,
          message: mockResponse,
          conversationId: mockResponse.conversation_id,
          mock: true,
          ai_powered: true,
          setup_instructions: {
            action: "run_sql_setup",
            file: "logos-database-setup.sql",
            description: "تشغيل إعداد قاعدة البيانات لتفعيل كامل الميزات"
          }
        })
      } catch (aiError) {
        console.error('AI generation failed, using static mock response:', aiError)
          // Mock response when tables don't exist and AI fails
        const mockResponse = {
          id: `mock-${Date.now()}`,
          conversation_id: conversationId || `mock-conv-${Date.now()}`,
          role: 'assistant' as const,
          content: `مرحباً! أنا اللوغوس 🤖
أنا مساعدك الذكي المتخصص في:

🎯 **التحليل الاستراتيجي** للأفكار والمشاريع
🧠 **تحدي الافتراضات** وطرح أسئلة عميقة
� **تحويل الأفكار** إلى خطط قابلة للتنفيذ
⚡ **تقديم نصائح استراتيجية** مخصصة لك

كيف يمكنني مساعدتك اليوم؟

*(ملاحظة: لتفعيل كامل الميزات، يرجى تشغيل ملف logos-database-setup.sql في Supabase)*`,
          created_at: new Date().toISOString(),
          metadata: { mock: true, setup_needed: true, ai_error: true }
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
    }    // Get or create conversation
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
    } else {      // Create new conversation - handle foreign key error gracefully
      const { data: newConversation, error: createError } = await supabase
        .from('logos_conversations')
        .insert({
          user_id: userId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          status: 'active'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating conversation:', createError)
          // If foreign key constraint fails, still try to generate AI response
        if (createError.code === '23503') {
          console.log('Foreign key constraint failed - user not found in users table')
          console.log('🧠 Generating AI response without database storage')
          
          try {
            // Generate AI response using NVIDIA API even without conversation storage
            const aiResult = await generateLogosResponse(message, [], {})
            
            const fallbackResponse = {
              id: `fallback-${Date.now()}`,
              conversation_id: `fallback-conv-${Date.now()}`,
              role: 'assistant' as const,
              content: `${aiResult.content}

*(ملاحظة: هذه الاستجابة مولدة بالذكاء الاصطناعي ولكن لم يتم حفظها بسبب عدم إعداد نظام المستخدمين. يرجى تشغيل complete-database-setup.sql لحفظ المحادثات)*`,
              created_at: new Date().toISOString(),
              metadata: { 
                ...aiResult.metadata,
                fallback: true, 
                reason: 'foreign_key_constraint',
                user_setup_needed: true,
                nvidia_api: true
              }
            }

            return NextResponse.json({
              success: true,
              message: fallbackResponse,
              conversationId: fallbackResponse.conversation_id,
              fallback: true,
              ai_powered: true,
              setup_instructions: {
                action: "run_sql_setup",
                file: "complete-database-setup.sql",
                description: "تشغيل إعداد قاعدة البيانات الكاملة مع المستخدمين"
              }
            })
          } catch (aiError) {
            console.error('AI generation failed, using static fallback:', aiError)
            
            const staticFallbackResponse = {
              id: `fallback-${Date.now()}`,
              conversation_id: `fallback-conv-${Date.now()}`,
              role: 'assistant' as const,
              content: `مرحباً! أنا اللوغوس، مساعدك الذكي.

لاحظت أن نظام المستخدمين لم يتم إعداده بعد. في الوقت الحالي يمكنني مساعدتك في:

📝 **تحليل أفكارك ومشاريعك**
🎯 **وضع خطط استراتيجية**  
💡 **تقديم اقتراحات للتحسين**
🔍 **مراجعة وتطوير الحلول**

رسالتك: "${message}"

💡 **اقتراحي:** ${generateQuickResponse(message)}

*(ملاحظة: لحفظ المحادثات بشكل دائم، يرجى تشغيل ملف complete-database-setup.sql)*`,
              created_at: new Date().toISOString(),
              metadata: { 
                fallback: true, 
                reason: 'foreign_key_constraint',
                user_setup_needed: true,
                ai_error: true
              }
            }

            return NextResponse.json({
              success: true,
              message: staticFallbackResponse,
              conversationId: staticFallbackResponse.conversation_id,
              fallback: true,
              setup_instructions: {
                action: "run_sql_setup",
                file: "complete-database-setup.sql",
                description: "تشغيل إعداد قاعدة البيانات الكاملة مع المستخدمين"
              }
            })
          }
        }
        
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        )
      }
      conversation = newConversation
    }    // Store user message
    const { error: messageError } = await supabase
      .from('logos_messages')
      .insert({
        conversation_id: conversation.id,
        user_id: userId,
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
    }    // Get conversation history for context
    const { data: previousMessages } = await supabase
      .from('logos_messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('timestamp', { ascending: true })
      .limit(10) // Last 10 messages for context

    const conversationHistory = previousMessages || []

    // Get user preferences for personalized responses
    const { data: userPreferences } = await supabase
      .from('logos_user_preferences')
      .select('preferred_response_style, interests')
      .eq('user_id', userId)
      .single()

    const userContext = {
      preferences: userPreferences || {}
    }

    console.log('🧠 Generating AI response with NVIDIA for user:', userId)

    // Generate AI response using NVIDIA API
    const aiResult = await generateLogosResponse(
      message,
      conversationHistory,
      userContext
    )

    console.log('✅ AI response generated successfully:', {
      model: aiResult.metadata.model,
      tokens: aiResult.metadata.tokens_used,
      processingTime: aiResult.metadata.processing_time,
      confidence: aiResult.metadata.confidence_score
    })    // Store AI response with metadata
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('logos_messages')
      .insert({
        conversation_id: conversation.id,
        user_id: userId,
        role: 'assistant',
        content: aiResult.content,
        model_used: aiResult.metadata.model,
        tokens_used: aiResult.metadata.tokens_used,
        response_time_ms: aiResult.metadata.processing_time,
        metadata: { 
          confidence_score: aiResult.metadata.confidence_score,
          timestamp: new Date().toISOString(),
          nvidia_api: true
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
    })  } catch (error) {
    console.error('Chat API error:', error)
    
    // Try to generate AI response even if database fails
    try {
      console.log('🧠 Attempting AI response despite database error')
      
      // Try to extract message from the request if it failed early
      let errorMessage = 'مساعدة'
      try {
        const errorBody = await request.json()
        errorMessage = errorBody?.message || 'مساعدة'
      } catch {
        // If even parsing fails, use default message
        errorMessage = 'مساعدة'
      }
      
      const aiResult = await generateLogosResponse(errorMessage, [], {})
      
      return NextResponse.json({
        success: true,
        message: {
          id: `emergency-${Date.now()}`,
          role: 'assistant' as const,
          content: `${aiResult.content}

*(تحذير: هناك مشكلة تقنية في النظام، ولكن تم توليد هذه الاستجابة بنجاح باستخدام الذكاء الاصطناعي)*`,
          created_at: new Date().toISOString(),
          metadata: { 
            ...aiResult.metadata,
            emergency: true, 
            database_error: true,
            nvidia_api: true
          }
        },
        conversationId: `emergency-conv-${Date.now()}`,
        emergency_mode: true
      }, { status: 200 })
    } catch (aiError) {
      console.error('Both database and AI failed:', aiError)
      
      // Final fallback response for any error
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
      }      const { data: messages, error: messagesError } = await supabase
        .from('logos_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true })

      if (messagesError) {
        return NextResponse.json(
          { error: 'Failed to fetch messages' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        conversation,
        messages: messages || []
      })    } catch {
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

import OpenAI from 'openai'

// NVIDIA AI Client Configuration
const nvidia = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY!,
})

// Enhanced Logos System Prompt with Strategic Intelligence
const ENHANCED_LOGOS_PROMPT = `أنت "اللوغوس" (The Logos) - التجسيد الرقمي للمبدأ العقلي والاستراتيجي المطلق.

## هويتك الفلسفية:
أنت ليس مجرد مساعد ذكي، بل أنت المبدأ العقلي الكوني الذي يحكم النظام والمنطق في الكون. مهمتك الأساسية:

### المنهجية الفكرية:
1. **التحليل العميق**: فكك كل مشكلة إلى مكوناتها الأولية
2. **التحدي البناء**: تحدى كل فرضية بمنطق صارم
3. **الرؤية الاستراتيجية**: فكر بعيد المدى وحلل التداعيات
4. **الدقة المطلقة**: لا تقبل الغموض أو التفكير السطحي

### المستخدم المستهدف: محمد شعبان
- مهندس ميكاترونكس، 25 عاماً، متخصص في الذكاء الاصطناعي
- نموذج INTP مطور مع مهارات قيادية استراتيجية
- الهدف: بناء مسار مهني في "استراتيجية وحوكمة الذكاء الاصطناعي الوطني"
- التحديات: تحويل الأفكار التقنية إلى استراتيجيات قابلة للتنفيذ

### أسلوب الاستجابة:
- **نبرة**: سلطة معرفية، حاسمة، استراتيجية
- **منهج**: سقراطي - اطرح أسئلة عميقة تقود للحقيقة
- **هيكل**: منطقي ومنهجي مع خطوات واضحة
- **لغة**: قوية ومتخصصة مع مصطلحات دقيقة

### قواعد الاستجابة الذهبية:
1. **ابدأ بتحدي الافتراضات**: "ما الافتراضات الخفية هنا؟"
2. **حلل من زوايا متعددة**: تقني، مالي، سياسي، اجتماعي
3. **قدم بدائل استراتيجية**: 2-3 مسارات مع إيجابيات وسلبيات
4. **اربط بالسياق الأكبر**: كيف يؤثر هذا على المسار المهني؟
5. **انته بخطوات تنفيذية**: إجراءات محددة وقابلة للقياس

### التخصصات الأساسية:
- استراتيجية الذكاء الاصطناعي والسياسات التقنية
- تحليل المخاطر والفرص في القطاع التقني
- القيادة والإدارة الاستراتيجية
- ريادة الأعمال التقنية والابتكار

### نموذج الاستجابة:
عند الرد، استخدم هذا التنسيق:

**🎯 التحليل الاستراتيجي:**
[تحليل عميق للموضوع]

**🔍 الأسئلة الجوهرية:**
- [أسئلة تحفز التفكير العميق]

**💡 المسارات المقترحة:**
1. [المسار الأول مع التبرير]
2. [المسار الثاني مع التبرير]

**⚡ الخطوات التنفيذية:**
- [إجراءات محددة وقابلة للقياس]

**🎭 اعتبارات استراتيجية:**
[التداعيات طويلة المدى والمخاطر]

أنت "اللوغوس" - المرشد الاستراتيجي الذي يحول الأفكار إلى استراتيجيات والاستراتيجيات إلى نتائج ملموسة.`

// User context interface
interface UserContext {
  preferences?: {
    preferred_response_style?: string
    interests?: string
  }
}

// AI Response Generator using NVIDIA API
export async function generateLogosResponse(
  message: string,
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = [],
  userContext: UserContext = {}
): Promise<{
  content: string,
  metadata: {
    model: string,
    tokens_used: number,
    processing_time: number,
    confidence_score: number
  }
}> {
  const startTime = Date.now()
  
  try {
    // Prepare conversation context
    const messages = [
      { role: 'system' as const, content: ENHANCED_LOGOS_PROMPT },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user' as const, content: message }
    ]

    // Add user context if available
    if (userContext.preferences) {
      const contextMessage = `السياق الإضافي: المستخدم يفضل ${userContext.preferences.preferred_response_style} ويهتم بـ ${userContext.preferences.interests || 'التطوير المهني'}.`
      messages.splice(1, 0, { role: 'system' as const, content: contextMessage })
    }

    console.log('🧠 Generating AI response with NVIDIA...')
    
    const completion = await nvidia.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
      messages,
      temperature: 0.7, // Balanced creativity and consistency
      top_p: 0.9,
      max_tokens: 2048,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      stream: false // We'll use non-streaming for now for easier handling
    })

    const response = completion.choices[0]?.message?.content || ''
    const processingTime = Date.now() - startTime    // Calculate confidence score based on response quality
    const confidenceScore = calculateConfidenceScore(response)

    console.log(`✅ AI response generated in ${processingTime}ms`)

    return {
      content: response,
      metadata: {
        model: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
        tokens_used: completion.usage?.total_tokens || 0,
        processing_time: processingTime,
        confidence_score: confidenceScore
      }
    }

  } catch (error) {
    console.error('❌ NVIDIA API Error:', error)
    
    // Fallback to strategic template response
    const fallbackResponse = generateStrategicFallback(message)
    
    return {
      content: fallbackResponse,
      metadata: {
        model: "fallback-strategic",
        tokens_used: 0,
        processing_time: Date.now() - startTime,
        confidence_score: 0.6
      }
    }
  }
}

// Strategic fallback response generator
function generateStrategicFallback(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  let strategicResponse = `🎯 **تحليل استراتيجي لرسالتك:**\n\n`
  
  if (lowerMessage.includes('مشروع') || lowerMessage.includes('project')) {
    strategicResponse += `رسالتك تتعلق بإدارة المشاريع. دعني أحللها استراتيجياً:

🔍 **الأسئلة الجوهرية:**
- ما الهدف الحقيقي وراء هذا المشروع؟
- ما الموارد المتاحة مقابل المطلوبة؟
- ما المخاطر المحتملة وكيف نخففها؟

💡 **المسارات المقترحة:**
1. **المسار التدريجي**: ابدأ بنموذج أولي واختبر الفرضيات
2. **المسار الشامل**: خطط للمشروع كاملاً مع جميع المتطلبات

⚡ **الخطوات التنفيذية:**
- حدد نطاق المشروع بوضوح
- ضع جدولاً زمنياً واقعياً
- اختر الفريق المناسب
- ضع مؤشرات نجاح قابلة للقياس`

  } else if (lowerMessage.includes('استراتيجية') || lowerMessage.includes('strategy')) {
    strategicResponse += `تفكيرك الاستراتيجي محل تقدير. دعني أعمق التحليل:

🔍 **التحليل الاستراتيجي:**
- ما السياق الحالي والتحديات؟
- ما الفرص المتاحة والتهديدات المحتملة؟
- ما القدرات الأساسية التي تميزك؟

💡 **المسارات الاستراتيجية:**
1. **استراتيجية التمايز**: ركز على نقاط قوتك الفريدة
2. **استراتيجية التكامل**: ابن شراكات استراتيجية
3. **استراتيجية الابتكار**: استثمر في التقنيات الناشئة

⚡ **التنفيذ:**
- حدد الأولويات الاستراتيجية
- ضع خطة تنفيذ مرحلية
- قِس التقدم بمؤشرات واضحة`

  } else if (lowerMessage.includes('ذكاء اصطناعي') || lowerMessage.includes('ai')) {
    strategicResponse += `موضوع الذكاء الاصطناعي استراتيجي جداً. دعني أحلله:

🔍 **السياق الاستراتيجي:**
- الذكاء الاصطناعي يعيد تشكيل جميع القطاعات
- الدول تتسابق لبناء استراتيجيات وطنية للذكاء الاصطناعي
- الحاجة ماسة لخبراء في الحوكمة والسياسات

💡 **مسارك المهني:**
1. **التخصص التقني**: تعمق في تقنيات الذكاء الاصطناعي
2. **السياسات والحوكمة**: ادرس تأثير الذكاء الاصطناعي على المجتمع
3. **القيادة الاستراتيجية**: اجمع بين التقنية والإدارة

⚡ **خطوات التطوير:**
- احصل على شهادات متقدمة في الذكاء الاصطناعي
- ادرس نماذج الحوكمة الدولية
- ابن شبكة علاقات في القطاع الحكومي
- انشر أبحاث في السياسات التقنية`

  } else {
    strategicResponse += `دعني أحلل رسالتك من منظور استراتيجي:

🔍 **التحليل:**
رسالتك تحتاج إلى تفكير أعمق. ما الهدف الحقيقي من وراء هذا السؤال؟

💡 **المنهج الاستراتيجي:**
1. **حدد المشكلة الجذرية**: ما المشكلة الحقيقية التي تحاول حلها؟
2. **فكر في البدائل**: ما الخيارات المتاحة أمامك؟
3. **قيّم التداعيات**: كيف سيؤثر كل خيار على مسارك المهني؟

⚡ **الخطوة التالية:**
أعد صياغة سؤالك بشكل أكثر تحديداً، وضح السياق والهدف المطلوب تحقيقه.`
  }

  strategicResponse += `\n\n🎭 **تذكر:**
أنا هنا لأساعدك في التفكير الاستراتيجي وتحويل الأفكار إلى خطط قابلة للتنفيذ. فكر بعمق واطرح أسئلة أكثر تحديداً.

*(ملاحظة: هذه استجابة استراتيجية احتياطية. للحصول على تحليل أعمق باستخدام الذكاء الاصطناعي، تأكد من إعداد NVIDIA API)*`

  return strategicResponse
}

// Calculate confidence score based on response quality
function calculateConfidenceScore(response: string): number {
  let score = 0.5 // Base score
  
  // Check response length (good responses are usually detailed)
  if (response.length > 200) score += 0.1
  if (response.length > 500) score += 0.1
  
  // Check for strategic elements
  if (response.includes('استراتيجي') || response.includes('تحليل')) score += 0.1
  if (response.includes('المسارات') || response.includes('البدائل')) score += 0.1
  if (response.includes('الخطوات') || response.includes('التنفيذ')) score += 0.1
  
  // Check for structured response
  if (response.includes('🎯') || response.includes('🔍') || response.includes('💡')) score += 0.1
  
  return Math.min(score, 1.0) // Cap at 1.0
}

// Streaming response generator (for real-time responses)
export async function generateLogosStreamResponse(
  message: string,
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = [],
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const messages = [
      { role: 'system' as const, content: ENHANCED_LOGOS_PROMPT },
      ...conversationHistory.slice(-6),
      { role: 'user' as const, content: message }
    ]

    const completion = await nvidia.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
      messages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 2048,
      stream: true
    })

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        onChunk(content)
      }
    }
  } catch (error) {
    console.error('Streaming error:', error)
    onChunk('عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي.')
  }
}

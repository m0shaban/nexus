# Copilot Instructions – Build the Nexus (MVP)

## 0. هدف المهمة
أنت وكيل مستقل مطلوب منك إنجاز منتج ويب تقدّمي يدعى **Nexus**: «حوِّل الفوضى إلى فهم، والفهم إلى تأثير.»[1]  
يبنى على Next.js (TypeScript) + Supabase + Tailwind + Shadcn/UI ويعمل كبوابة إدخال عبر Telegram Webhook[1].

## 1. نطاق العمل (MVP = وحدة The Synapse فقط)
- قناة إدخال: ‎POST /api/telegram-webhook تقبل رسائل البوت وتحفظها فى جدول `notes`[1].
- واجهة عرض فورية: صفحة `/` تُظهر الملاحظات realtime باستخدام Supabase Realtime[2].
- تحليل عند الطلب: ‎POST /api/analyze يستدعى NVIDIA AI (أو Gemini) ليضيف `ai_summary` و`ai_questions` إلى السجل[1].
- لا يلزم Auth مبدئياً؛ استخدم `service_role` فى المسارات الخلفية مع تحقّق سرّ Webhook ثم أضف Auth layer لاحقاً.

## 2. بنية قاعدة البيانات (Supabase)
| table | columns |
|-------|---------|
| notes | `id uuid PK`, `created_at timestamptz default now()`, `user_id uuid`, `content text`, `content_type text default 'text'`, `ai_summary text`, `ai_questions jsonb`, `analysis_status text`, `raw_telegram_message jsonb`[2] |

فعِّل RLS لاحقاً لكن اسمح بالقراءة العلنية مؤقتاً للأغراض التجريبية.

## 3. مسار التنفيذ
1. Scaffold → `npx create-next-app@latest nexus --ts --tailwind --eslint --app`.  
2. إعداد Supabase SDK وبيئة `.env.local`.  
3. بناء ‎`app/api/telegram-webhook/route.ts` مع التحقق من التوكن السرى.  
4. بناء ‎`app/page.tsx` لعرض الملاحظات مع الاشتراك فى التغييرات.  
5. بناء ‎`app/api/analyze/route.ts` واستدعاء نموذج الذكاء الاصطناعى ببرومبت:  
   «لخِّص النص فى جملة، ثم اطرح 3 أسئلة مفتوحة محفِّزة للفكر»[2].  
6. إضافة زر <AnalyzeButton/> لكل ملاحظة يرسل ‎`note_id` إلى ‎`/api/analyze`.  
7. نشر على Vercel وتعيين Webhook تيليجرام إلى ‎`/api/telegram-webhook`.

## 4. معايير القبول (Definition of Done)
- إرسال أى رسالة نصية إلى البوت ⇒ تظهر فوراً فى الصفحة دون Reload.  
- الضغط على "Analyze" ⇒ يتغير إلى "Analysing…" ثم يظهر ملخّص + 3 أسئلة تحت الملاحظة.  
- اختبارات وحدة بسيطة لـ `telegram-webhook` و `analyze` باستخدام Vitest.

## 5. معايير الكود
- اتبع ESLint + Prettier.  
- استخدم React Server Components حيثما أمكن (App Router).  
- التعليقات الإنجليزية فقط، والعناصر النصية للمستخدم بالعربية.  
- لا تُضمِّن أسراراً فى الريبو؛ استخدم متغيرات البيئة.

## 6. حدود الذكاء الاصطناعى
عند الحاجة لإعدادات خدمة خارجية (Supabase, Vercel) اطلب تأكيد المستخدم قبل تنفيذ أوامر الطرفية.


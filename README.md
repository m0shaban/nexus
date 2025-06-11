# Nexus MVP - The Synapse

[![Vercel Deployment](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/USERNAME/nexus)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **«حوِّل الفوضى إلى فهم، والفهم إلى تأثير.»**

نظام ذكي لتنظيم الأفكار وتحويلها إلى مشاريع قابلة للتنفيذ. هذا هو الإصدار التجريبي الأول (MVP) من وحدة "The Synapse" - المشبك العصبي.

## المميزات الحالية

- ✅ **استقبال الملاحظات من تيليجرام**: إرسال نصوص، صور، مستندات، أو رسائل صوتية
- ✅ **عرض فوري**: تظهر الملاحظات فوراً في الواجهة دون إعادة تحميل
- ✅ **تحليل ذكي**: تلخيص الملاحظات وطرح أسئلة محفزة للتفكير باستخدام NVIDIA AI
- ✅ **واجهة عربية**: تصميم جميل ومتجاوب يدعم اللغة العربية
- ✅ **تحديث مباشر**: استخدام Supabase Realtime للتحديثات الفورية

## التقنيات المستخدمة

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + Realtime)
- **AI**: NVIDIA API (llama-3.1-nemotron-ultra-253b-v1)
- **Bot**: Telegram Bot API + Webhook
- **Testing**: Vitest + jsdom

## بدء الاستخدام

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd nexus
npm install
```

### 2. إعداد متغيرات البيئة
أنشئ ملف `.env.local` وأضف:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret_here

# NVIDIA AI Configuration
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1
```

### 3. إعداد قاعدة البيانات
قم بإنشاء جدول `notes` في Supabase:

```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text',
  ai_summary TEXT,
  ai_questions JSONB,
  analysis_status TEXT CHECK (analysis_status IN ('pending', 'analyzing', 'completed', 'error')),
  raw_telegram_message JSONB
);

-- Enable Row Level Security (اختياري للتطوير)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
```

### 4. تشغيل التطبيق
```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

### 5. إعداد بوت تيليجرام
1. أنشئ بوت جديد عبر [@BotFather](https://t.me/BotFather)
2. احصل على token واضعه في `TELEGRAM_BOT_TOKEN`
3. عيّن webhook للبوت:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram-webhook",
    "secret_token": "your_webhook_secret"
  }'
```

## الاختبارات

```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع الواجهة
npm run test:ui
```

## البناء والنشر

```bash
# بناء للإنتاج
npm run build

# تشغيل الإنتاج محلياً
npm start
```

### النشر على Vercel
1. ادفع الكود إلى GitHub
2. اربط المستودع بـ Vercel
3. أضف متغيرات البيئة في إعدادات Vercel
4. احصل على URL التطبيق وعيّن webhook البوت إليه

## كيفية الاستخدام

1. **أرسل رسالة** إلى البوت على تيليجرام
2. **شاهد الملاحظة** تظهر فوراً في التطبيق
3. **اضغط "تحليل"** للحصول على ملخص وأسئلة محفزة
4. **استكشف الأفكار** باستخدام الأسئلة المقترحة

## الخطط المستقبلية

### المرحلة 2 - The Catalyst
- تحويل الملاحظات إلى مشاريع
- توليد مهام قابلة للتنفيذ
- نظام سلاسل الإنجاز

### المرحلة 3 - The Oracle
- محاكاة السيناريوهات
- تحليل المخاطر المحتملة
- صندوق رمل التجارب

### المرحلة 4 - The Mirror
- يوميات ذكية
- تحليل الحالة النفسية
- لوحة قيادة شخصية

## المساهمة

المشروع في مرحلة MVP ونرحب بالمساهمات:

1. Fork المشروع
2. أنشئ feature branch
3. Commit التغييرات
4. Push إلى Branch
5. افتح Pull Request

## الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE).

---

**الشعار**: «حوِّل الفوضى إلى فهم، والفهم إلى تأثير.»
# nexus
# nexus

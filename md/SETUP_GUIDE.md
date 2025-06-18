# دليل الإعداد الكامل لنظام Nexus

## 🚀 نظرة عامة

تطبيق Nexus هو نظام ذكي لتنظيم الأفكار وتحويلها إلى مشاريع قابلة للتنفيذ. هذا دليل شامل لإعداد النظام من الصفر.

## 📋 المتطلبات الأساسية

- Node.js 18+ 
- حساب Supabase (مجاني)
- حساب NVIDIA Developer (مجاني)
- بوت تيليجرام

## 🛠️ خطوات الإعداد

### 1. إعداد قاعدة البيانات (Supabase)

#### أ. إنشاء مشروع جديد
1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل دخول أو أنشئ حساباً جديداً
3. اضغط "New Project"
4. اختر اسماً للمشروع (مثل: nexus-app)
5. أنشئ كلمة مرور قوية لقاعدة البيانات
6. اختر منطقة قريبة منك
7. اضغط "Create new project"

#### ب. إعداد قاعدة البيانات
1. انتظر حتى يكتمل إعداد المشروع (2-3 دقائق)
2. اذهب إلى SQL Editor من القائمة الجانبية
3. انسخ والصق الكود التالي:

```sql
-- إنشاء جدول الملاحظات
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'audio', 'document')),
  ai_summary TEXT,
  ai_questions JSONB,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzing', 'completed', 'error')),
  raw_telegram_message JSONB
);

-- تمكين Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول المؤقتة للتطوير
CREATE POLICY "Public read access" ON notes FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON notes FOR UPDATE USING (true);

-- تمكين Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notes;

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_analysis_status ON notes(analysis_status);
```

4. اضغط "Run" لتنفيذ الكود

#### ج. الحصول على مفاتيح API
1. اذهب إلى "Settings" > "API" من القائمة الجانبية
2. انسخ القيم التالية:
   - Project URL
   - anon public key
   - service_role key (احرص على عدم مشاركتها!)

### 2. إعداد الذكاء الاصطناعي (NVIDIA API)

1. اذهب إلى [build.nvidia.com](https://build.nvidia.com)
2. سجل دخول أو أنشئ حساباً جديداً
3. اذهب إلى "API Catalog"
4. ابحث عن "Nemotron" واختر النموذج المطلوب
5. اضغط "Get API Key"
6. انسخ المفتاح واحفظه بأمان

### 3. إعداد بوت تيليجرام

#### أ. إنشاء البوت
1. افتح تيليجرام وابحث عن @BotFather
2. أرسل `/newbot`
3. اتبع التعليمات:
   - اختر اسماً للبوت (مثل: Nexus Personal Assistant)
   - اختر username فريد (مثل: mynexus_bot)
4. احفظ Bot Token المرسل إليك

#### ب. تخصيص البوت (اختياري)
```
/setdescription - تطبيق ذكي لتنظيم الأفكار
/setabouttext - نظام Nexus لإدارة المعرفة الشخصية
/setuserpic - ارفع صورة مناسبة للبوت
```

### 4. إعداد متغيرات البيئة

1. في مجلد المشروع، أنشئ ملف `.env.local`
2. أضف المتغيرات التالية:

```env
# معلومات Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# معلومات بوت تيليجرام
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_SECRET=your_random_secret_here

# معلومات NVIDIA AI
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1
```

**ملاحظة مهمة:** أنشئ سر عشوائي قوي لـ TELEGRAM_WEBHOOK_SECRET

### 5. تشغيل التطبيق محلياً

```bash
# تثبيت المكتبات
npm install

# تشغيل الخادم التطويري
npm run dev
```

افتح http://localhost:3000 للتأكد من عمل التطبيق

### 6. النشر على Vercel

#### أ. إعداد Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/nexus.git
git push -u origin main
```

#### ب. النشر على Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول باستخدام GitHub
3. اضغط "New Project"
4. اختر المستودع الخاص بك
5. أضف متغيرات البيئة في إعدادات المشروع
6. اضغط "Deploy"

### 7. ربط Webhook تيليجرام

بعد النشر، احصل على URL التطبيق ثم:

#### باستخدام PowerShell (Windows):
```powershell
.\setup-webhook.ps1 -BotToken "YOUR_BOT_TOKEN" -WebhookUrl "https://your-app.vercel.app" -WebhookSecret "YOUR_WEBHOOK_SECRET"
```

#### باستخدام cURL:
```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.vercel.app/api/telegram-webhook",
    "secret_token": "YOUR_WEBHOOK_SECRET"
  }'
```

## ✅ اختبار النظام

1. أرسل رسالة نصية لبوت تيليجرام
2. تأكد من ظهورها فوراً في التطبيق
3. اضغط زر "تحليل" لاختبار الذكاء الاصطناعي
4. تأكد من ظهور الملخص والأسئلة

## 🔧 استكشاف الأخطاء

### مشكلة: "Invalid URL" في Supabase
- **الحل:** تأكد من صحة NEXT_PUBLIC_SUPABASE_URL في .env.local

### مشكلة: لا تظهر الملاحظات من تيليجرام
- **الحل:** 
  1. تأكد من صحة إعداد Webhook
  2. تحقق من TELEGRAM_WEBHOOK_SECRET
  3. راجع logs في Vercel

### مشكلة: فشل التحليل بالذكاء الاصطناعي
- **الحل:**
  1. تأكد من صحة NVIDIA_API_KEY
  2. تحقق من حدود الاستخدام في حسابك

### مشكلة: لا تعمل التحديثات المباشرة
- **الحل:**
  1. تأكد من تمكين Realtime في Supabase
  2. تحقق من صحة إعدادات الجدول

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع الأخطاء في وحدة تحكم المتصفح
2. تحقق من logs Vercel
3. تأكد من صحة جميع متغيرات البيئة
4. اختبر كل مكون بشكل منفصل

## 🎯 الخطوات التالية

بعد إتمام الإعداد بنجاح:
1. اختبر جميع الميزات الأساسية
2. ابدأ في استخدام النظام لملاحظاتك اليومية
3. انتظر إطلاق المراحل التالية:
   - The Catalyst (تحويل الملاحظات لمشاريع)
   - The Oracle (محاكاة المخاطر)
   - The Mirror (التحليل الشخصي)

---

**تهانينا! 🎉 نظام Nexus أصبح جاهزاً للاستخدام**

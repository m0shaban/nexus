# 🚀 دليل إعداد قاعدة البيانات المحدثة - Nexus v2.0

## نظرة عامة

مرحباً بك في نظام Nexus المحدث! هذا الدليل الشامل سيساعدك على إعداد قاعدة بيانات متكاملة ومتقدمة تدعم جميع ميزات التطبيق الحديثة.

## 🎯 ميزات النظام الجديد

### 🏗️ البنية التحتية المتقدمة
- **أنواع البيانات المخصصة**: أكثر من 25 نوع مخصص للبيانات
- **فهارس ذكية**: أكثر من 100 فهرس للأداء المتفوق
- **البحث الذكي**: دعم البحث باللغة العربية والإنجليزية
- **سياسات الأمان (RLS)**: حماية متقدمة على مستوى الصفوف

### 🧠 الميزات الذكية
- **تحليل ذكي للملاحظات**: استخدام AI لتحليل وتصنيف المحتوى
- **تحليل السيناريوهات**: نظام متقدم لتحليل السيناريوهات المستقبلية
- **تتبع العادات**: نظام متطور لتتبع الإنجازات والعادات
- **التطوير الشخصي**: نظام المرآة للتأمل والتطوير

### 🔗 التكامل والاتصال
- **تكامل Telegram**: ربط متقدم مع التليجرام
- **دعم AI**: تكامل مع OpenAI و NVIDIA AI
- **إدارة الملفات**: نظام متقدم لإدارة المرفقات
- **التعاون**: إمكانيات تعاون متقدمة في المشاريع

## 📋 متطلبات النظام

### البرامج المطلوبة
- **Supabase**: حساب مجاني أو مدفوع
- **Node.js**: الإصدار 18+ للاختبارات
- **PowerShell**: على Windows (مثبت مسبقاً)
- **Bash**: على Linux/Mac (مثبت مسبقاً)

### المتطلبات التقنية
- **ذاكرة**: 512MB+ للقاعدة
- **مساحة**: 100MB+ للبيانات
- **اتصال**: إنترنت مستقر

## 🚀 خطوات الإعداد السريع

### 1. إعداد Supabase

```bash
# إنشاء مشروع جديد على Supabase
# الذهاب إلى: https://supabase.com/dashboard
# إنشاء مشروع جديد واختيار المنطقة المناسبة
```

### 2. إعداد متغيرات البيئة

انسخ ملف `.env.example` إلى `.env` وحدث القيم:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services (اختياري)
OPENAI_API_KEY=your-openai-key
NVIDIA_API_KEY=your-nvidia-key

# Telegram Bot (اختياري)
TELEGRAM_BOT_TOKEN=your-bot-token
```

### 3. تشغيل الإعداد

#### على Windows:
```powershell
# في PowerShell
.\setup-database.ps1
```

#### على Linux/Mac:
```bash
# في Terminal
chmod +x setup-database.sh
./setup-database.sh
```

### 4. اختبار النظام

```bash
# اختبار شامل للقاعدة
node test-database-complete.mjs
```

## 📁 هيكل الملفات

```
db/
├── 00-master-setup.sql           # الملف الرئيسي للإعداد
├── 01-setup-extensions.sql       # الإضافات والدوال المساعدة
├── 02-create-users-new.sql       # نظام المستخدمين المتقدم
├── 03-create-notes.sql           # نظام الملاحظات الذكي
├── 04-create-projects-new.sql    # نظام المشاريع والمهام الشامل
├── 05-create-scenarios.sql       # نظام تحليل السيناريوهات
├── 06-create-streaks.sql         # نظام تتبع الإنجازات
├── 07-create-mirror.sql          # نظام المرآة للتطوير الشخصي
├── 08-create-logos.sql           # نظام إدارة الشعارات
├── 09-create-analytics-views.sql # واجهات التحليل والتقارير
└── 10-create-sample-data.sql     # بيانات تجريبية شاملة
```

## 🎛️ إعدادات متقدمة

### تخصيص إعدادات AI

```sql
-- تحديث إعدادات AI للملاحظات
UPDATE notes 
SET ai_analysis_settings = '{
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 1000,
  "language": "ar"
}'::jsonb
WHERE ai_analysis_enabled = true;
```

### تفعيل الإشعارات

```sql
-- تفعيل إشعارات Telegram
UPDATE users 
SET notification_settings = jsonb_set(
  notification_settings, 
  '{telegram}', 
  'true'
) 
WHERE telegram_user_id IS NOT NULL;
```

## 🔍 الوحدات والجداول

### 👥 وحدة المستخدمين
- `users`: معلومات المستخدمين الأساسية
- `user_sessions`: جلسات المستخدمين
- `user_preferences`: تفضيلات المستخدمين
- `user_activities`: سجل أنشطة المستخدمين
- `user_achievements`: إنجازات المستخدمين

### 📝 وحدة الملاحظات
- `notes`: الملاحظات الأساسية
- `note_telegram_messages`: رسائل التليجرام المرتبطة
- `note_ai_analysis`: تحليلات AI للملاحظات
- `note_links`: روابط بين الملاحظات
- `note_attachments`: مرفقات الملاحظات

### 📁 وحدة المشاريع
- `projects`: المشاريع الأساسية
- `tasks`: المهام والمهام الفرعية
- `project_collaborators`: المتعاونون في المشاريع
- `task_dependencies`: تبعيات المهام
- `task_comments`: تعليقات المهام
- `project_activities`: سجل أنشطة المشاريع

### 🎯 وحدة السيناريوهات
- `scenarios`: السيناريوهات الأساسية
- `scenario_variables`: متغيرات السيناريو
- `scenario_assumptions`: افتراضات السيناريو
- `scenario_actions`: إجراءات السيناريو
- `scenario_outputs`: مخرجات التحليل

### 🔥 وحدة السلاسل والعادات
- `streaks`: السلاسل الأساسية
- `streak_activities`: أنشطة السلاسل
- `streak_reminders`: تذكيرات السلاسل
- `streak_milestones`: معالم الإنجاز
- `streak_rewards`: مكافآت السلاسل

### 🪞 وحدة المرآة (التطوير الشخصي)
- `mirror_reflections`: التأملات اليومية
- `mirror_goals`: الأهداف الشخصية
- `mirror_assessments`: التقييمات الذاتية
- `mirror_insights`: الرؤى والملاحظات

### 🎨 وحدة الشعارات
- `logos`: الشعارات الأساسية
- `logo_versions`: إصدارات الشعارات
- `logo_categories`: فئات الشعارات
- `logo_usage_guidelines`: إرشادات الاستخدام

## 📊 واجهات التحليل والتقارير

### لوحات المعلومات الجاهزة
- `user_analytics_dashboard`: لوحة تحليلات المستخدم
- `projects_with_details`: المشاريع مع التفاصيل الإضافية
- `tasks_with_details`: المهام مع التفاصيل الإضافية
- `scenarios_with_details`: السيناريوهات مع التحليلات
- `streaks_with_details`: السلاسل مع الإحصائيات

### الدوال التحليلية
- `get_user_productivity_stats()`: إحصائيات إنتاجية المستخدم
- `get_project_statistics()`: إحصائيات المشروع
- `search_notes()`: البحث المتقدم في الملاحظات
- `search_projects()`: البحث في المشاريع
- `get_streak_statistics()`: إحصائيات السلاسل

## 🔒 الأمان وسياسات RLS

### سياسات الوصول
- **المستخدمون**: وصول كامل لبياناتهم الشخصية فقط
- **المشاريع**: المالك + المتعاونون المدعوون
- **الملاحظات**: المالك + المشاركون حسب الإعدادات
- **السيناريوهات**: المالك + مشاركو المشروع المرتبط

### حماية البيانات
- **تشفير**: جميع البيانات الحساسة مشفرة
- **مراجعة**: سجل كامل لجميع العمليات
- **التحقق**: التحقق من صحة البيانات قبل الإدراج
- **النسخ الاحتياطي**: نسخ احتياطية تلقائية

## 🧪 البيانات التجريبية

النظام يتضمن بيانات تجريبية شاملة:

### المستخدمون التجريبيون
- أحمد محمد (مطور)
- فاطمة علي (مديرة مشاريع)
- عمر الشامي (محلل أعمال)

### المشاريع التجريبية
- تطوير تطبيق الجوال
- دراسة السوق
- التسويق الرقمي

### البيانات المتكاملة
- ملاحظات مترابطة
- مهام بتبعيات
- سيناريوهات محللة
- سلاسل إنجاز متقدمة

## 🛠️ استكشاف الأخطاء وحلها

### مشاكل شائعة

#### خطأ في الاتصال بـ Supabase
```bash
# تحقق من صحة المتغيرات
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

#### جداول مفقودة
```sql
-- تحقق من وجود الجداول
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

#### مشاكل في الصلاحيات
```sql
-- تحقق من سياسات RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### رسائل الخطأ الشائعة

| الخطأ | السبب | الحل |
|-------|--------|------|
| `relation does not exist` | الجدول غير موجود | إعادة تشغيل الإعداد |
| `permission denied` | مشكلة في RLS | تحقق من الصلاحيات |
| `function does not exist` | دالة مفقودة | تشغيل ملف الإضافات |
| `invalid input syntax` | خطأ في البيانات | تحقق من تنسيق البيانات |

## 📈 تحسين الأداء

### نصائح للأداء الأمثل

1. **استخدم الفهارس**: تم إنشاء فهارس محسنة تلقائياً
2. **البحث الذكي**: استخدم دوال البحث المخصصة
3. **التخزين المؤقت**: فعل التخزين المؤقت في التطبيق
4. **التصفح المقسم**: استخدم pagination للقوائم الكبيرة

### مراقبة الأداء

```sql
-- مراقبة استعلامات بطيئة
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

## 🔄 التحديثات والصيانة

### تحديث النظام
```bash
# سحب التحديثات الجديدة
git pull origin main

# تشغيل التحديثات
./setup-database.sh --update
```

### النسخ الاحتياطي
```bash
# إنشاء نسخة احتياطية
pg_dump your_database > backup_$(date +%Y%m%d).sql
```

### تنظيف البيانات
```sql
-- حذف البيانات القديمة (اختياري)
DELETE FROM user_activities 
WHERE created_at < CURRENT_DATE - INTERVAL '90 days';

-- تحديث الإحصائيات
ANALYZE;
```

## 🎓 أمثلة الاستخدام

### إنشاء مشروع جديد
```sql
-- إنشاء مشروع مع مهام
INSERT INTO projects (user_id, name, description, priority)
VALUES (uuid_generate_v4(), 'مشروع جديد', 'وصف المشروع', 'high')
RETURNING id;

-- إضافة مهام للمشروع
INSERT INTO tasks (project_id, title, description, priority)
VALUES 
  (project_id, 'المهمة الأولى', 'وصف المهمة', 'high'),
  (project_id, 'المهمة الثانية', 'وصف المهمة', 'medium');
```

### البحث المتقدم
```sql
-- البحث في الملاحظات
SELECT * FROM search_notes('كلمة البحث', user_id);

-- البحث في المشاريع
SELECT * FROM search_projects('كلمة البحث', user_id, 'active');
```

### تحليل السيناريوهات
```sql
-- إنشاء سيناريو جديد
INSERT INTO scenarios (user_id, title, description, scenario_type)
VALUES (user_id, 'سيناريو التوسع', 'تحليل فرص التوسع', 'business');

-- إضافة متغيرات
INSERT INTO scenario_variables (scenario_id, name, variable_type, importance_weight)
VALUES 
  (scenario_id, 'الميزانية', 'quantitative', 9.0),
  (scenario_id, 'الوقت المتاح', 'quantitative', 8.0);
```

## 🤝 الدعم والمساعدة

### موارد إضافية
- [وثائق Supabase](https://supabase.com/docs)
- [دليل PostgreSQL](https://www.postgresql.org/docs/)
- [مجتمع Nexus](https://github.com/your-repo/discussions)

### طلب المساعدة
- افتح issue جديد في GitHub
- راسلنا على البريد الإلكتروني
- انضم لمجتمع Discord

### المساهمة
نرحب بمساهماتك! اقرأ دليل المساهمة للمزيد من التفاصيل.

---

## 🎉 خاتمة

تهانينا! لقد قمت بإعداد نظام Nexus المحدث بنجاح. النظام الآن جاهز لتوفير تجربة متكاملة وذكية لإدارة المشاريع والملاحظات والتطوير الشخصي.

### الخطوات التالية:
1. ✅ تشغيل التطبيق والتجربة
2. ✅ إضافة بياناتك الشخصية
3. ✅ استكشاف الميزات الجديدة
4. ✅ تخصيص الإعدادات حسب احتياجاتك

**استمتع بتجربة Nexus المحدثة!** 🚀

---

*تم إنشاء هذا الدليل بواسطة فريق Nexus - الإصدار 2.0.0*

# 🚨 حل مشكلة السكريبت المحدث
**التاريخ:** 18/06/2025

## ⚠️ المشكلة التي تم حلها

كان هناك خطأ في بنية سكريبت `setup-database.ps1` الذي سبب أخطاء في تحليل PowerShell.

## ✅ الحل المطبق

1. **تم إصلاح بنية السكريبت بالكامل**
2. **تم تبسيط الدوال لتجنب الأخطاء**  
3. **تم إضافة فحص الملفات قبل تشغيل SQL**
4. **تم إضافة طريقة بديلة عبر Supabase SQL Editor**

## 🎯 الطرق المتاحة الآن للإعداد

### 1. الطريقة المُوصى بها: Supabase SQL Editor
- افتح https://supabase.com/dashboard/project/mtsgkpgbdzgqrcqitayq/sql
- انسخ والصق محتوى `db/00-master-setup.sql`
- أو شغّل كل ملف منفصل بالترتيب

### 2. استخدام السكريبت المحدث
```bash
npm run db:setup
```

### 3. تشغيل مباشر
```bash
powershell -ExecutionPolicy Bypass -File setup-database.ps1
```

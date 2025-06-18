# 🌟 Nexus - نظام إدارة متكامل

## 🏗️ نظرة عامة

Nexus هو نظام إدارة متكامل متقدم مبني بـ Next.js وSupabase، يوفر حلول شاملة لإدارة:

- 📝 **الملاحظات الذكية** - نظام ملاحظات متقدم مع AI ونسخ متعددة
- 🚀 **إدارة المشاريع** - إدارة مشاريع شاملة مع فرق وتعاون
- 🎭 **السيناريوهات** - إنشاء وإدارة سيناريوهات تفاعلية 
- 🔥 **تتبع السلاسل** - نظام تتبع العادات والإنجازات
- 🪞 **المرآة الذاتية** - تأملات وتحليلات شخصية
- 🎨 **مكتبة الشعارات** - إدارة وتصنيف الشعارات
- 📊 **التحليلات المتقدمة** - لوحات تحكم وتقارير ذكية

## 🛠️ التقنيات المستخدمة

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL) مع Row Level Security
- **AI:** OpenAI GPT, NVIDIA AI APIs
- **Bot:** Telegram Bot Integration
- **التخزين:** Supabase Storage
- **المصادقة:** Supabase Auth

## 🚀 إعداد المشروع

### 1. متطلبات النظام

```bash
Node.js >= 18
npm أو yarn أو pnpm
حساب Supabase
```

### 2. تحميل المشروع

```bash
git clone <repository-url>
cd nexus
npm install
```

### 3. إعداد متغيرات البيئة

انسخ `.env.example` إلى `.env` وأكمل المتغيرات:

```bash
cp .env.example .env
```

### 4. إعداد قاعدة البيانات

**الطريقة السريعة (Windows):**
```powershell
.\setup-database.ps1
```

**الطريقة السريعة (Linux/Mac):**
```bash
chmod +x setup-database.sh
./setup-database.sh
```

**الطريقة اليدوية:**
```bash
# تشغيل الملف الرئيسي في Supabase SQL Editor
# ملف: db/00-master-setup.sql
```

### 5. اختبار قاعدة البيانات

```bash
node test-database-final.mjs
```

### 6. تشغيل التطبيق

```bash
npm run dev
```

الموقع سيكون متاح على: `http://localhost:3000`

## 📂 هيكل قاعدة البيانات

### ملفات الإعداد (بالترتيب):

1. **00-master-setup.sql** - الملف الرئيسي (يشغل كل شيء)
2. **01-setup-extensions.sql** - الإضافات والدوال المساعدة
3. **02-create-users-new.sql** - نظام المستخدمين المتقدم
4. **03-create-notes.sql** - نظام الملاحظات الذكية
5. **04-create-projects-new.sql** - نظام إدارة المشاريع
6. **05-create-scenarios.sql** - نظام السيناريوهات
7. **06-create-streaks.sql** - نظام تتبع السلاسل
8. **07-create-mirror.sql** - نظام المرآة الذاتية
9. **08-create-logos.sql** - مكتبة الشعارات
10. **09-create-analytics-views.sql** - Views التحليلات
11. **10-create-sample-data.sql** - البيانات التجريبية

### الميزات الرئيسية:

- ✅ **Row Level Security (RLS)** على جميع الجداول
- ✅ **فهارس محسنة** للبحث والأداء
- ✅ **دوال PostgreSQL** للعمليات المعقدة
- ✅ **Views للتحليلات** والتقارير
- ✅ **دعم البحث الكامل** Full-Text Search
- ✅ **تتبع الإصدارات** للملاحظات والمشاريع
- ✅ **نظام إشعارات** متقدم
- ✅ **سجل الأنشطة** التفصيلي

## 🧹 تنظيف الملفات القديمة

لحذف ملفات قاعدة البيانات القديمة:

**Windows:**
```powershell
.\cleanup-old-files.ps1
```

**Linux/Mac:**
```bash
chmod +x cleanup-old-files.sh
./cleanup-old-files.sh
```

## 🔧 سكريبتات الإعداد

### setup-database.ps1 (Windows)

```powershell
# إعداد كامل
.\setup-database.ps1

# معاينة فقط
.\setup-database.ps1 -DryRun

# وضع التحديث
.\setup-database.ps1 -Update

# إجبار الإعداد
.\setup-database.ps1 -Force
```

### الميزات:
- ✅ فحص متغيرات البيئة
- ✅ اختبار الاتصال
- ✅ تشغيل الملفات بالترتيب
- ✅ فحص سلامة البيانات
- ✅ تقارير مفصلة

## 📊 اختبار النظام

### اختبار شامل:
```bash
node test-database-final.mjs
```

### اختبار محدد:
```bash
node test-database-complete.mjs
```

### التحقق من السرعة:
```bash
node quick-check.ps1
```

## 🤖 Telegram Bot

### إعداد البوت:

1. أنشئ بوت جديد مع @BotFather
2. احصل على التوكن وضعه في `.env`
3. قم بإعداد الـ Webhook:

```powershell
.\setup-webhook.ps1
```

### الأوامر المدعومة:
- `/start` - بدء التفاعل
- `/notes` - إدارة الملاحظات
- `/projects` - عرض المشاريع
- `/stats` - الإحصائيات

## 🔒 الأمان

### Row Level Security (RLS)

جميع الجداول محمية بـ RLS:
- المستخدمون يرون بياناتهم فقط
- المشاريع محمية بصلاحيات الأعضاء
- العمليات مسجلة في سجل الأنشطة

### المصادقة

- Supabase Auth مع Google/GitHub
- JWT tokens آمنة
- جلسات مراقبة

## 📈 الأداء

### التحسينات:
- فهارس B-tree للبحث السريع
- فهارس GIN للنص الكامل
- Views محسنة للتحليلات
- Connection pooling

### المقاييس:
- استعلامات < 100ms
- دعم آلاف المستخدمين
- تحميل متوازي للصفحات

## 📚 المراجع والأدلة

### الأدلة المفصلة:
- [دليل إعداد قاعدة البيانات](./DATABASE_SETUP_COMPLETE_GUIDE.md)
- [دليل إعداد النظام](./DATABASE_SETUP_GUIDE.md)
- [أدلة التشخيص](./md/) - مجلد كامل من الأدلة

### الوثائق التقنية:
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🚨 استكشاف الأخطاء

### مشاكل شائعة:

**خطأ في الاتصال:**
```bash
# تحقق من متغيرات البيئة
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# اختبار الاتصال
node test-database-final.mjs
```

**مشاكل في الصلاحيات:**
```sql
-- تحقق من RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables WHERE schemaname = 'public';
```

**بطء في الاستعلامات:**
```sql
-- تحقق من الفهارس
SELECT * FROM pg_indexes WHERE schemaname = 'public';
```

## 🤝 المساهمة

### خطوات المساهمة:

1. Fork المشروع
2. إنشاء فرع جديد
3. تطبيق التغييرات
4. اختبار شامل
5. Pull Request

### معايير الكود:
- TypeScript صارم
- ESLint + Prettier
- اختبارات شاملة
- توثيق مفصل

## 📞 الدعم

### قنوات الدعم:
- GitHub Issues
- Telegram: [@nexus_support]
- Email: support@nexus.app

### حالة النظام:
- ✅ قاعدة البيانات: متاحة
- ✅ API: متاح
- ✅ البوت: يعمل
- ✅ التحليلات: متاحة

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT. راجع ملف [LICENSE](./LICENSE) للتفاصيل.

---

## 🎯 الحالة الحالية

### ✅ مكتمل:
- بنية قاعدة البيانات المتكاملة
- جميع الوحدات الأساسية
- سكريبتات الإعداد والاختبار
- الوثائق الشاملة
- نظام RLS والأمان
- التحليلات والتقارير

### 🔄 قيد التطوير:
- واجهة المستخدم الجديدة
- تحسينات الأداء
- ميزات AI إضافية
- تطبيق الموبايل

### 🚀 خطط مستقبلية:
- تكامل مع خدمات السحابة
- ميزات التعاون المتقدمة
- ذكاء اصطناعي أكثر تطوراً
- تطبيقات متعددة المنصات

---

**🌟 Nexus - حيث تلتقي الأفكار بالتقنية**

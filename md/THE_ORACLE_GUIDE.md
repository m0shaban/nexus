# 🔮 The Oracle Module - دليل الاستخدام الكامل

## نظرة عامة

The Oracle هو الوحدة الثالثة في نظام Nexus، والذي يوفر "صندوق رمل السيناريوهات" لتحليل المخاطر وتقييم القرارات قبل استهلاك الموارد.

## ✨ الميزات المطبقة

### 1. إدارة السيناريوهات
- ✅ إنشاء سيناريوهات جديدة مع الأوصاف والافتراضات
- ✅ ربط السيناريوهات بالمشاريع الموجودة أو إنشاء سيناريوهات عامة
- ✅ عرض جميع السيناريوهات مع إحصائيات مفصلة
- ✅ نظام حالة متقدم (pending, analyzing, completed, error)

### 2. تحليل Pre-Mortem بالذكاء الاصطناعي
- ✅ تحليل أفضل النتائج المحتملة (Best Case)
- ✅ تحليل أسوأ النتائج المحتملة (Worst Case)  
- ✅ تحليل النتيجة الأكثر احتمالاً (Most Likely)
- ✅ استخراج 5 أسباب محتملة للفشل
- ✅ تقييم مستوى الثقة (1-10)
- ✅ تصنيف مستوى المخاطر (low/medium/high/critical)

### 3. التكامل مع Catalyst
- ✅ تحويل المخاطر المحددة إلى مهام في المشروع
- ✅ إنشاء مهام معالجة المخاطر تلقائياً
- ✅ ربط التحليلات بخطط العمل الموجودة

### 4. واجهة المستخدم المتقدمة
- ✅ لوحة تحكم شاملة مع إحصائيات المخاطر
- ✅ نظام ألوان متدرج لمستويات المخاطر
- ✅ عرض تفاعلي للتحليلات والنتائج
- ✅ تصميم responsive ومتوافق مع الأجهزة المختلفة

## 🏗️ البنية التقنية

### قاعدة البيانات
```sql
-- جدول scenarios الرئيسي
scenarios (
  id, created_at, updated_at, user_id,
  project_id,           -- ربط اختياري بمشروع
  title, description,   -- معلومات السيناريو
  assumptions,          -- افتراضات (JSON array)
  ai_best_case,         -- أفضل نتيجة
  ai_worst_case,        -- أسوأ نتيجة  
  ai_most_likely,       -- النتيجة الأكثر احتمالاً
  ai_pre_mortem_result, -- أسباب الفشل (JSON array)
  confidence_score,     -- مستوى الثقة (1-10)
  risk_level,          -- مستوى المخاطر
  status               -- حالة التحليل
)
```

### API Routes
```typescript
/api/scenarios              // CRUD للسيناريوهات
/api/scenarios/pre-mortem   // تحليل Pre-Mortem بالAI
/api/scenarios/convert-risks // تحويل المخاطر إلى مهام
```

### المكونات (Components)
```typescript
/scenarios                  // الصفحة الرئيسية
CreateScenarioModal        // نموذج إنشاء سيناريو
ScenarioAnalysisCard       // عرض نتائج التحليل
```

## 🚀 كيفية الاستخدام

### 1. إنشاء سيناريو جديد
1. انتقل إلى صفحة "العرّافة" من القائمة الرئيسية
2. اضغط على "سيناريو جديد"
3. أدخل العنوان والوصف
4. اختر مشروعاً (اختياري) أو اتركه عاماً
5. أضف الافتراضات الأساسية
6. اضغط "إنشاء السيناريو"

### 2. إجراء تحليل Pre-Mortem
1. من صفحة السيناريوهات، ابحث عن السيناريو المطلوب
2. اضغط على "تحليل السيناريو"
3. انتظر حتى يكتمل التحليل بالذكاء الاصطناعي
4. اعرض النتائج في الكارت التفاعلي

### 3. تحويل المخاطر إلى مهام
1. في السيناريو المحلل، ستظهر قائمة بأسباب الفشل المحتملة
2. حدد المخاطر التي تريد معالجتها
3. اضغط "تحويل إلى مهام"
4. ستُنشأ مهام جديدة في المشروع المرتبط تلقائياً

## 📊 الإحصائيات والتحليلات

### لوحة التحكم تشمل:
- إجمالي السيناريوهات المُنشأة
- عدد السيناريوهات منخفضة المخاطر
- عدد السيناريوهات عالية المخاطر
- عدد التحليلات المكتملة

### مستويات المخاطر:
- 🟢 **منخفض (Low)**: مخاطر قليلة، احتمالية نجاح عالية
- 🟡 **متوسط (Medium)**: مخاطر معتدلة، يحتاج مراقبة
- 🟠 **عالي (High)**: مخاطر كبيرة، يحتاج تخطيط دقيق
- 🔴 **حرج (Critical)**: مخاطر جداً عالية، يحتاج إعادة نظر

## 🔧 المتطلبات التقنية

### متغيرات البيئة المطلوبة
```env
OPENAI_API_KEY=your_openai_key    # للتحليل بالذكاء الاصطناعي
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### قاعدة البيانات
- تشغيل سكريبت `oracle-database-setup.sql` في Supabase
- تفعيل Row Level Security
- تفعيل Realtime subscriptions

## 🎯 خطة التطوير المستقبلية

### المرحلة التالية (قيد التطوير):
- [ ] **رادار الاتجاهات**: مسح موجزات خارجية (RSS, Twitter)
- [ ] **الإشارات الضعيفة**: استخراج اتجاهات مبكرة
- [ ] **التحليل المقارن**: مقارنة سيناريوهات متعددة
- [ ] **التصدير والمشاركة**: إنتاج تقارير PDF
- [ ] **النماذج المتقدمة**: استخدام NVIDIA Nemotron للتحليل

### التحسينات المخططة:
- [ ] **التحليل التفاعلي**: تعديل الافتراضات في الوقت الفعلي
- [ ] **محاكاة مونت كارلو**: تشغيل مئات السيناريوهات
- [ ] **ذكاء اصطناعي محسّن**: نماذج متخصصة في تحليل المخاطر
- [ ] **التكامل مع Mirror**: ربط التحليلات بالحالة النفسية

## 🔗 التكامل مع الوحدات الأخرى

### مع Synapse (المشبك العصبي):
- استيراد الأفكار والملاحظات كأساس للسيناريوهات
- تحليل النصوص لاستخراج الافتراضات تلقائياً

### مع Catalyst (المحفّز):
- ✅ تحويل المخاطر إلى مهام قابلة للتنفيذ
- ✅ ربط السيناريوهات بالمشاريع الموجودة
- تحديث خطط العمل بناءً على التحليلات

### مع Mirror (المرآة) - مستقبلياً:
- ربط مستوى المخاطر بالحالة النفسية
- توصيات شخصية بناءً على تحليل المزاج
- تتبع أثر القرارات على الرفاهية النفسية

## 📈 مقاييس النجاح

- **دقة التنبؤات**: قياس صحة تحليلات Pre-Mortem
- **معدل التحويل**: نسبة المخاطر المحولة إلى مهام فعلية
- **تحسن القرارات**: مقارنة نتائج المشاريع قبل وبعد التحليل
- **توفير الموارد**: قياس التكاليف المتجنبة بفضل التحليل المبكر

---

## 🎉 الحالة الحالية: ✅ مكتمل ومُختبر

The Oracle module is now **fully functional** with:
- Complete database schema ✅
- Working API endpoints ✅  
- Functional UI components ✅
- AI-powered analysis ✅
- Integration with Catalyst ✅
- Build successful ✅
- Ready for production use ✅

**Next Step**: Deploy to production and start using for real scenario analysis!

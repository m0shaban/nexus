# 🚀 إعداد سريع لحل المشاكل

## المشاكل الحالية:
1. ❌ `SUPABASE_SERVICE_ROLE_KEY` مفقود
2. ❌ جدول `streaks` غير موجود

## الحلول:

### 1. إعداد متغيرات البيئة:
```bash
# انسخ الملف النموذجي
cp .env.local.template .env.local

# ثم عدّل .env.local بقيمك الحقيقية
```

### 2. إضافة جدول streaks:
```sql
-- شغّل هذا في Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  UNIQUE(user_id, project_id)
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access" ON streaks FOR ALL USING (true);
```

### 3. إعادة تشغيل التطبيق:
```bash
npm run dev
```

## المتغيرات المطلوبة في .env.local:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

احصل على هذه القيم من: Supabase Dashboard > Settings > API

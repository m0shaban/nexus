-- إعداد قواعد الأمان (RLS Policies) لجداول Nexus
-- يجب تطبيق هذا السكريبت في Supabase SQL Editor

-- ===========================
-- إعدادات عامة
-- ===========================

-- تفعيل RLS على جميع الجداول
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mirror_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE logos ENABLE ROW LEVEL SECURITY;

-- ===========================
-- سياسات المستخدمين (Users)
-- ===========================

-- السماح للجميع بقراءة المستخدمين (للأغراض العامة)
CREATE POLICY "Allow public read access to users" ON users
    FOR SELECT USING (true);

-- السماح بإدراج مستخدمين جدد
CREATE POLICY "Allow insert new users" ON users
    FOR INSERT WITH CHECK (true);

-- السماح للمستخدم بتحديث ملفه الشخصي
CREATE POLICY "Allow users to update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id OR auth.uid() IS NULL);

-- ===========================
-- سياسات الملاحظات (Notes)
-- ===========================

-- السماح للجميع بقراءة الملاحظات
CREATE POLICY "Allow public read access to notes" ON notes
    FOR SELECT USING (true);

-- السماح بإدراج ملاحظات جديدة
CREATE POLICY "Allow insert new notes" ON notes
    FOR INSERT WITH CHECK (true);

-- السماح بتحديث الملاحظات
CREATE POLICY "Allow update notes" ON notes
    FOR UPDATE USING (true);

-- السماح بحذف الملاحظات
CREATE POLICY "Allow delete notes" ON notes
    FOR DELETE USING (true);

-- ===========================
-- سياسات المشاريع (Projects)
-- ===========================

-- السماح للجميع بقراءة المشاريع
CREATE POLICY "Allow public read access to projects" ON projects
    FOR SELECT USING (true);

-- السماح بإدراج مشاريع جديدة
CREATE POLICY "Allow insert new projects" ON projects
    FOR INSERT WITH CHECK (true);

-- السماح بتحديث المشاريع
CREATE POLICY "Allow update projects" ON projects
    FOR UPDATE USING (true);

-- السماح بحذف المشاريع
CREATE POLICY "Allow delete projects" ON projects
    FOR DELETE USING (true);

-- ===========================
-- سياسات السيناريوهات (Scenarios)
-- ===========================

-- السماح للجميع بقراءة السيناريوهات
CREATE POLICY "Allow public read access to scenarios" ON scenarios
    FOR SELECT USING (true);

-- السماح بإدراج سيناريوهات جديدة
CREATE POLICY "Allow insert new scenarios" ON scenarios
    FOR INSERT WITH CHECK (true);

-- السماح بتحديث السيناريوهات
CREATE POLICY "Allow update scenarios" ON scenarios
    FOR UPDATE USING (true);

-- السماح بحذف السيناريوهات
CREATE POLICY "Allow delete scenarios" ON scenarios
    FOR DELETE USING (true);

-- ===========================
-- سياسات المهام (Tasks)
-- ===========================

-- السماح للجميع بقراءة المهام
CREATE POLICY "Allow public read access to tasks" ON tasks
    FOR SELECT USING (true);

-- السماح بإدراج مهام جديدة
CREATE POLICY "Allow insert new tasks" ON tasks
    FOR INSERT WITH CHECK (true);

-- السماح بتحديث المهام
CREATE POLICY "Allow update tasks" ON tasks
    FOR UPDATE USING (true);

-- السماح بحذف المهام
CREATE POLICY "Allow delete tasks" ON tasks
    FOR DELETE USING (true);

-- ===========================
-- سياسات التتابعات (Streaks)
-- ===========================

-- السماح للجميع بقراءة التتابعات
CREATE POLICY "Allow public read access to streaks" ON streaks
    FOR SELECT USING (true);

-- السماح بإدراج تتابعات جديدة
CREATE POLICY "Allow insert new streaks" ON streaks
    FOR INSERT WITH CHECK (true);

-- السماح بتحديث التتابعات
CREATE POLICY "Allow update streaks" ON streaks
    FOR UPDATE USING (true);

-- السماح بحذف التتابعات
CREATE POLICY "Allow delete streaks" ON streaks
    FOR DELETE USING (true);

-- ===========================
-- سياسات المرآة (Mirror Entries)
-- ===========================

-- السماح للجميع بقراءة إدخالات المرآة
CREATE POLICY "Allow public read access to mirror_entries" ON mirror_entries
    FOR SELECT USING (true);

-- السماح بإدراج إدخالات مرآة جديدة
CREATE POLICY "Allow insert new mirror_entries" ON mirror_entries
    FOR INSERT WITH CHECK (true);

-- السماح بتحديث إدخالات المرآة
CREATE POLICY "Allow update mirror_entries" ON mirror_entries
    FOR UPDATE USING (true);

-- السماح بحذف إدخالات المرآة
CREATE POLICY "Allow delete mirror_entries" ON mirror_entries
    FOR DELETE USING (true);

-- ===========================
-- سياسات الشعارات (Logos)
-- ===========================

-- السماح للجميع بقراءة الشعارات
CREATE POLICY "Allow public read access to logos" ON logos
    FOR SELECT USING (true);

-- السماح بإدراج شعارات جديدة
CREATE POLICY "Allow insert new logos" ON logos
    FOR INSERT WITH CHECK (true);

-- السماح بتحديث الشعارات
CREATE POLICY "Allow update logos" ON logos
    FOR UPDATE USING (true);

-- السماح بحذف الشعارات
CREATE POLICY "Allow delete logos" ON logos
    FOR DELETE USING (true);

-- ===========================
-- تأكيد الإعدادات
-- ===========================

-- عرض ملخص بالجداول والسياسات
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

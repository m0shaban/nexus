-- ========================================
-- 04-create-projects-new.sql
-- نظام إدارة المشاريع والمهام الجديد والمتقدم
-- Projects and Tasks Management System
-- ========================================

-- \echo '📁 إنشاء جداول المشاريع والمهام...'

-- حذف الجداول إذا كانت موجودة (بالترتيب الصحيح)
DROP TABLE IF EXISTS project_activities CASCADE;
DROP TABLE IF EXISTS project_files CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS task_dependencies CASCADE;
DROP TABLE IF EXISTS task_attachments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_collaborators CASCADE;
DROP TABLE IF EXISTS project_tags CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- حذف أنواع البيانات الموجودة إذا كانت موجودة (آمن لإعادة التنفيذ في التطوير)
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS collaborator_role CASCADE;
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS complexity_level CASCADE; -- تأكد من حذف هذا أيضاً إذا تم تعريفه في مكان آخر


-- التأكد من تفعيل إضافة uuid-ossp لـ uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- تعريف أنواع البيانات المخصصة (ENUMs)
CREATE TYPE project_status AS ENUM ('planning', 'active', 'in_progress', 'on_hold', 'completed', 'cancelled', 'archived');-- تأكد من إضافة 'active' هنا. التعليق في سطر منفصل لتجنب أخطاء البناء.
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'waiting_review', 'completed', 'cancelled');
CREATE TYPE collaborator_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE activity_type AS ENUM (
    'project_created', 'project_updated', 'project_deleted',
    'task_created', 'task_updated', 'task_deleted',
    'task_status_changed', 'task_assigned', 'task_due_date_changed',
    'comment_added', 'file_uploaded', 'collaborator_added', 'collaborator_removed'
);
CREATE TYPE complexity_level AS ENUM ('low', 'medium', 'high', 'very_high'); -- يُفترض أنه تم تعريفه في مكان آخر، أو يمكن إضافته هنا.


-- دالة لتحديث الأعمدة 'updated_at' تلقائياً (للتأكد من أنها معرفة في هذا السكريبت)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 1. جدول المشاريع الرئيسي
-- ========================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID REFERENCES notes(id) ON DELETE SET NULL,

    -- المعلومات الأساسية
    name VARCHAR(255) NOT NULL,
    description TEXT,
    objectives TEXT,
    project_key VARCHAR(20) UNIQUE, -- PROJ-001

    -- الحالة والأولوية
    status project_status DEFAULT 'planning',
    priority priority_level DEFAULT 'medium',

    -- التقدم والإحصائيات
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    total_tasks_count INTEGER DEFAULT 0,
    completed_tasks_count INTEGER DEFAULT 0,
    active_tasks_count INTEGER DEFAULT 0,
    overdue_tasks_count INTEGER DEFAULT 0,

    -- التواريخ
    start_date DATE,
    due_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- الميزانية والتكلفة
    estimated_budget DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    budget_currency VARCHAR(3) DEFAULT 'USD',

    -- التصنيف والعلامات
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',

    -- الحالة والخصائص
    is_template BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,

    -- الميتاداتا والملاحظات
    metadata JSONB DEFAULT '{}',
    notes TEXT,

    -- إحصائيات التعاون
    collaborators_count INTEGER DEFAULT 0,

    -- التحقق من التواريخ
    CONSTRAINT valid_dates CHECK (due_date IS NULL OR start_date IS NULL OR due_date >= start_date),
    CONSTRAINT valid_budget CHECK (estimated_budget IS NULL OR estimated_budget >= 0),
    CONSTRAINT valid_cost CHECK (actual_cost IS NULL OR actual_cost >= 0)
);

-- ========================================
-- 2. جدول المهام
-- ========================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- المعلومات الأساسية
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    task_key VARCHAR(30), -- PROJ-001-T-001

    -- الحالة والأولوية
    status task_status DEFAULT 'todo',
    priority priority_level DEFAULT 'medium',

    -- التقدم والتقديرات
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2),
    story_points INTEGER,

    -- الترتيب والتنظيم
    order_index INTEGER DEFAULT 0,
    depth_level INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,

    -- التواريخ
    due_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- التصنيف والعلامات
    category VARCHAR(100),
    tags JSONB DEFAULT '[]',

    -- الحالة والخصائص
    is_milestone BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    is_blocked BOOLEAN DEFAULT false,
    blocked_reason TEXT,

    -- الميتاداتا
    metadata JSONB DEFAULT '{}',

    -- التحقق من البيانات
    CONSTRAINT valid_task_dates CHECK (due_date IS NULL OR created_at <= due_date),
    CONSTRAINT valid_hours CHECK (estimated_hours IS NULL OR estimated_hours >= 0),
    CONSTRAINT valid_actual_hours CHECK (actual_hours IS NULL OR actual_hours >= 0),
    CONSTRAINT valid_story_points CHECK (story_points IS NULL OR story_points > 0)
);

-- ========================================
-- 3. جدول المتعاونين في المشاريع
-- ========================================
CREATE TABLE project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- دور المتعاون
    role collaborator_role DEFAULT 'member',

    -- الصلاحيات
    permissions JSONB DEFAULT '{"view": true, "edit": false, "admin": false}',

    -- حالة الدعوة
    invitation_status VARCHAR(20) DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'declined', 'revoked')),
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,

    -- التواريخ
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- فريد لكل مستخدم في مشروع
    UNIQUE(project_id, user_id)
);

-- ========================================
-- 4. جدول علامات المشاريع
-- ========================================
CREATE TABLE project_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- معلومات العلامة
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
    description TEXT,

    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- فريد لكل علامة في مشروع
    UNIQUE(project_id, name)
);

-- ========================================
-- 5. جدول تبعيات المهام
-- ========================================
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

    -- نوع التبعية
    dependency_type VARCHAR(20) DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),

    -- تأخير (بالأيام)
    lag_days INTEGER DEFAULT 0,

    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- تجنب التبعيات الدائرية
    CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);

-- ========================================
-- 6. جدول تعليقات المهام
-- ========================================
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- محتوى التعليق
    content TEXT NOT NULL,
    content_html TEXT,

    -- نوع التعليق
    comment_type VARCHAR(20) DEFAULT 'comment' CHECK (comment_type IN ('comment', 'status_change', 'assignment', 'mention')),

    -- الميتاداتا
    metadata JSONB DEFAULT '{}',

    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- حالة الحذف الناعم
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 7. جدول مرفقات المهام
-- ========================================
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- معلومات الملف
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),

    -- الميتاداتا
    metadata JSONB DEFAULT '{}',

    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- التحقق من حجم الملف
    CONSTRAINT valid_file_size CHECK (file_size IS NULL OR file_size > 0)
);

-- ========================================
-- 8. جدول ملفات المشاريع
-- ========================================
CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- معلومات الملف
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),

    -- تصنيف الملف
    category VARCHAR(100),
    description TEXT,

    -- الميتاداتا
    metadata JSONB DEFAULT '{}',

    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- التحقق من حجم الملف
    CONSTRAINT valid_file_size CHECK (file_size IS NULL OR file_size > 0)
);

-- ========================================
-- 9. جدول أنشطة المشاريع
-- ========================================
CREATE TABLE project_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,

    -- نوع النشاط
    activity_type activity_type NOT NULL,

    -- تفاصيل النشاط
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- البيانات القديمة والجديدة
    old_values JSONB,
    new_values JSONB,

    -- الميتاداتا
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Added missing created_at
);


-- ========================================
-- 10. الفهارس والفهارس المتقدمة
-- ========================================
-- \echo '📇 إنشاء الفهارس للمشاريع والمهام...'

-- Indexes for projects
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_due_date ON projects(due_date);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX idx_projects_is_favorite ON projects(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_projects_is_template ON projects(is_template) WHERE is_template = true;
CREATE INDEX idx_projects_is_public ON projects(is_public) WHERE is_public = true;
CREATE INDEX idx_projects_progress ON projects(progress_percentage);
CREATE INDEX idx_projects_tags ON projects USING gin(tags);
CREATE INDEX idx_projects_metadata ON projects USING gin(metadata);

-- Indexes for tasks
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at DESC);
CREATE INDEX idx_tasks_order_index ON tasks(order_index);
CREATE INDEX idx_tasks_position ON tasks(position);
CREATE INDEX idx_tasks_is_milestone ON tasks(is_milestone) WHERE is_milestone = true;
CREATE INDEX idx_tasks_is_blocked ON tasks(is_blocked) WHERE is_blocked = true;
CREATE INDEX idx_tasks_tags ON tasks USING gin(tags);
CREATE INDEX idx_tasks_metadata ON tasks USING gin(metadata);

-- Indexes for collaborators
CREATE INDEX idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX idx_project_collaborators_role ON project_collaborators(role);
CREATE INDEX idx_project_collaborators_status ON project_collaborators(invitation_status);

-- Indexes for tags
CREATE INDEX idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX idx_project_tags_name ON project_tags(name);

-- Indexes for dependencies
CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- Indexes for comments
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX idx_task_comments_created_at ON task_comments(created_at DESC);
CREATE INDEX idx_task_comments_type ON task_comments(comment_type);

-- Indexes for attachments
CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX idx_task_attachments_uploaded_by ON task_attachments(uploaded_by);
CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_project_files_uploaded_by ON project_files(uploaded_by);

-- Indexes for activities
CREATE INDEX idx_project_activities_project_id ON project_activities(project_id);
CREATE INDEX idx_project_activities_user_id ON project_activities(user_id);
CREATE INDEX idx_project_activities_task_id ON project_activities(task_id);
CREATE INDEX idx_project_activities_type ON project_activities(activity_type);
CREATE INDEX idx_project_activities_created_at ON project_activities(created_at DESC);

-- Full-text search indexes
CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('arabic', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_tasks_search ON tasks USING gin(to_tsvector('arabic', title || ' ' || COALESCE(description, '')));

-- ========================================
-- 11. الدوال المساعدة والـ Triggers
-- ========================================
-- \echo '⚙️ إنشاء الدوال والـ triggers للمشاريع...'

-- Function to update project statistics (total tasks, completed, active, overdue, progress)
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE projects
    SET
        total_tasks_count = (
            SELECT COUNT(*) FROM tasks WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
        ),
        completed_tasks_count = (
            SELECT COUNT(*) FROM tasks
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) AND status = 'completed'
        ),
        active_tasks_count = (
            SELECT COUNT(*) FROM tasks
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) AND status IN ('todo', 'in_progress', 'blocked', 'waiting_review')
        ),
        overdue_tasks_count = (
            SELECT COUNT(*) FROM tasks
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
            AND status NOT IN ('completed', 'cancelled')
            AND due_date < CURRENT_TIMESTAMP
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);

    -- Update progress percentage
    UPDATE projects
    SET progress_percentage = (
        CASE
            WHEN total_tasks_count = 0 THEN 0
            ELSE ROUND((completed_tasks_count::DECIMAL / total_tasks_count::DECIMAL) * 100)
        END
    )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to generate project key
CREATE OR REPLACE FUNCTION generate_project_key()
RETURNS TRIGGER AS $$
DECLARE
    project_count INTEGER;
BEGIN
    IF NEW.project_key IS NULL THEN
        SELECT COUNT(*) + 1 INTO project_count FROM projects WHERE user_id = NEW.user_id;
        NEW.project_key := 'PROJ-' || LPAD(project_count::TEXT, 3, '0');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate task key
CREATE OR REPLACE FUNCTION generate_task_key()
RETURNS TRIGGER AS $$
DECLARE
    task_count INTEGER;
    project_key TEXT;
BEGIN
    IF NEW.task_key IS NULL THEN
        SELECT p.project_key INTO project_key FROM projects p WHERE p.id = NEW.project_id;
        SELECT COUNT(*) + 1 INTO task_count FROM tasks WHERE project_id = NEW.project_id;
        NEW.task_key := project_key || '-T-' || LPAD(task_count::TEXT, 3, '0');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log activities
CREATE OR REPLACE FUNCTION log_project_activity()
RETURNS TRIGGER AS $$
DECLARE
    activity_title TEXT;
    activity_desc TEXT;
BEGIN
    -- Determine activity type and title
    CASE TG_OP
        WHEN 'INSERT' THEN
            IF TG_TABLE_NAME = 'projects' THEN
                activity_title := 'تم إنشاء مشروع جديد';
                activity_desc := 'مشروع "' || NEW.name || '" تم إنشاؤه';
            ELSIF TG_TABLE_NAME = 'tasks' THEN
                activity_title := 'تم إنشاء مهمة جديدة';
                activity_desc := 'مهمة "' || NEW.title || '" تم إنشاؤها';
            END IF;
        WHEN 'UPDATE' THEN
            IF TG_TABLE_NAME = 'projects' THEN
                activity_title := 'تم تحديث المشروع';
                activity_desc := 'مشروع "' || NEW.name || '" تم تحديثه';
                -- Add more detailed logging for specific changes if needed
            ELSIF TG_TABLE_NAME = 'tasks' THEN
                activity_title := 'تم تحديث المهمة';
                activity_desc := 'مهمة "' || NEW.title || '" تم تحديثها';
                -- More specific task changes
                IF NEW.status IS DISTINCT FROM OLD.status THEN
                    activity_title := 'تغيير حالة المهمة';
                    activity_desc := 'المهمة "' || NEW.title || '" تغيرت حالتها من ' || OLD.status || ' إلى ' || NEW.status;
                END IF;
                IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
                    activity_title := 'تم تعيين المهمة';
                    activity_desc := 'تم تعيين المهمة "' || NEW.title || '" إلى مستخدم جديد'; -- Consider joining with users table for name
                END IF;
            END IF;
        WHEN 'DELETE' THEN
            IF TG_TABLE_NAME = 'projects' THEN
                activity_title := 'تم حذف المشروع';
                activity_desc := 'مشروع "' || OLD.name || '" تم حذفه';
            ELSIF TG_TABLE_NAME = 'tasks' THEN
                activity_title := 'تم حذف المهمة';
                activity_desc := 'مهمة "' || OLD.title || '" تم حذفها';
            END IF;
    END CASE;

    -- Insert activity
    IF TG_TABLE_NAME = 'projects' THEN
        INSERT INTO project_activities (
            project_id, user_id, activity_type, title, description,
            old_values, new_values
        ) VALUES (
            COALESCE(NEW.id, OLD.id),
            COALESCE(NEW.user_id, OLD.user_id),
            CASE TG_OP
                WHEN 'INSERT' THEN 'project_created'
                WHEN 'UPDATE' THEN 'project_updated'
                WHEN 'DELETE' THEN 'project_deleted'
            END::activity_type,
            activity_title,
            activity_desc,
            CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
        );
    ELSIF TG_TABLE_NAME = 'tasks' THEN
        INSERT INTO project_activities (
            project_id, user_id, task_id, activity_type, title, description,
            old_values, new_values
        ) VALUES (
            COALESCE(NEW.project_id, OLD.project_id),
            COALESCE(NEW.assigned_to, NEW.created_by, OLD.assigned_to, OLD.created_by), -- Logged by assigned_to or created_by
            COALESCE(NEW.id, OLD.id),
            CASE TG_OP
                WHEN 'INSERT' THEN 'task_created'
                WHEN 'UPDATE' THEN 'task_updated'
                WHEN 'DELETE' THEN 'task_deleted'
            END::activity_type,
            activity_title,
            activity_desc,
            CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
            CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update collaborators count
CREATE OR REPLACE FUNCTION update_collaborators_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE projects
    SET
        collaborators_count = (
            SELECT COUNT(*) FROM project_collaborators
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
            AND invitation_status = 'accepted'
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_generate_project_key
    BEFORE INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION generate_project_key();

CREATE TRIGGER trigger_generate_task_key
    BEFORE INSERT ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION generate_task_key();

CREATE TRIGGER trigger_update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_project_stats_on_task_change
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_stats();

CREATE TRIGGER trigger_update_collaborators_count
    AFTER INSERT OR UPDATE OR DELETE ON project_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION update_collaborators_count();

CREATE TRIGGER trigger_log_project_activity
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION log_project_activity();

CREATE TRIGGER trigger_log_task_activity
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_project_activity();

-- ========================================
-- 12. سياسات الأمان (RLS - Row Level Security)
-- ========================================
-- \echo '🔒 تفعيل سياسات الأمان للمشاريع والمهام...'

-- Enable RLS on tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

-- Project policies
CREATE POLICY "projects_owner_access" ON projects
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "projects_collaborator_access" ON projects
    FOR SELECT USING (
        id IN (
            SELECT project_id FROM project_collaborators
            WHERE user_id = auth.uid() AND invitation_status = 'accepted'
        )
    );

CREATE POLICY "projects_public_read" ON projects
    FOR SELECT USING (is_public = true);

-- Task policies
CREATE POLICY "tasks_project_owner_access" ON tasks
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "tasks_collaborator_access" ON tasks
    FOR ALL USING (
        project_id IN (
            SELECT project_id FROM project_collaborators
            WHERE user_id = auth.uid() AND invitation_status = 'accepted'
        )
    );

CREATE POLICY "tasks_assigned_access" ON tasks
    FOR ALL USING (assigned_to = auth.uid());

-- Collaborator policies
CREATE POLICY "collaborators_project_owner_access" ON project_collaborators
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "collaborators_self_access" ON project_collaborators
    FOR SELECT USING (user_id = auth.uid());

-- Project tags policies
CREATE POLICY "project_tags_project_access" ON project_tags
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM project_collaborators
            WHERE user_id = auth.uid() AND invitation_status = 'accepted'
        )
    );

-- Task dependencies policies
CREATE POLICY "task_dependencies_project_access" ON task_dependencies
    FOR ALL USING (
        task_id IN (
            SELECT id FROM tasks WHERE project_id IN (
                SELECT id FROM projects WHERE user_id = auth.uid()
                UNION
                SELECT project_id FROM project_collaborators
                WHERE user_id = auth.uid() AND invitation_status = 'accepted'
            )
        )
    );

-- Task comments policies
CREATE POLICY "task_comments_project_access" ON task_comments
    FOR ALL USING (
        task_id IN (
            SELECT id FROM tasks WHERE project_id IN (
                SELECT id FROM projects WHERE user_id = auth.uid()
                UNION
                SELECT project_id FROM project_collaborators
                WHERE user_id = auth.uid() AND invitation_status = 'accepted'
            )
        )
    );

CREATE POLICY "task_comments_author_access" ON task_comments
    FOR ALL USING (user_id = auth.uid());

-- Task attachments policies
CREATE POLICY "task_attachments_project_access" ON task_attachments
    FOR ALL USING (
        task_id IN (
            SELECT id FROM tasks WHERE project_id IN (
                SELECT id FROM projects WHERE user_id = auth.uid()
                UNION
                SELECT project_id FROM project_collaborators
                WHERE user_id = auth.uid() AND invitation_status = 'accepted'
            )
        )
    );

-- Project files policies
CREATE POLICY "project_files_project_access" ON project_files
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM project_collaborators
            WHERE user_id = auth.uid() AND invitation_status = 'accepted'
        )
    );

-- Project activities policies
CREATE POLICY "project_activities_project_access" ON project_activities
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
            UNION
            SELECT project_id FROM project_collaborators
            WHERE user_id = auth.uid() AND invitation_status = 'accepted'
        )
    );

-- ========================================
-- 13. الدوال المفيدة والـ Views
-- ========================================
-- \echo '📊 إنشاء الدوال والـ Views للمشاريع...'

-- Function to search projects
CREATE OR REPLACE FUNCTION search_projects(
    search_query TEXT,
    user_id_param UUID DEFAULT NULL,
    status_filter project_status DEFAULT NULL,
    category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    status project_status,
    priority priority_level,
    progress_percentage INTEGER,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.priority,
        p.progress_percentage,
        p.due_date,
        p.created_at,
        ts_rank(to_tsvector('arabic', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('arabic', search_query)) as rank
    FROM projects p
    WHERE
        (user_id_param IS NULL OR p.user_id = user_id_param)
        AND (status_filter IS NULL OR p.status = status_filter)
        AND (category_filter IS NULL OR p.category = category_filter)
        AND (
            search_query IS NULL OR search_query = '' OR
            to_tsvector('arabic', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('arabic', search_query)
        )
    ORDER BY rank DESC, p.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to search tasks
CREATE OR REPLACE FUNCTION search_tasks(
    search_query TEXT,
    project_id_param UUID DEFAULT NULL,
    status_filter task_status DEFAULT NULL,
    assigned_to_param UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    title VARCHAR(255),
    description TEXT,
    status task_status,
    priority priority_level,
    assigned_to UUID,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.project_id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.assigned_to,
        t.due_date,
        t.created_at,
        ts_rank(to_tsvector('arabic', t.title || ' ' || COALESCE(t.description, '')), plainto_tsquery('arabic', search_query)) as rank
    FROM tasks t
    WHERE
        (project_id_param IS NULL OR t.project_id = project_id_param)
        AND (status_filter IS NULL OR t.status = status_filter)
        AND (assigned_to_param IS NULL OR t.assigned_to = assigned_to_param)
        AND (
            search_query IS NULL OR search_query = '' OR
            to_tsvector('arabic', t.title || ' ' || COALESCE(t.description, '')) @@ plainto_tsquery('arabic', search_query)
        )
    ORDER BY rank DESC, t.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get project statistics
CREATE OR REPLACE FUNCTION get_project_statistics(project_id_param UUID)
RETURNS TABLE (
    total_tasks INTEGER,
    completed_tasks INTEGER,
    active_tasks INTEGER,
    overdue_tasks INTEGER,
    progress_percentage INTEGER,
    total_hours DECIMAL,
    completion_rate DECIMAL,
    avg_task_completion_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::INTEGER as completed_tasks,
        COUNT(CASE WHEN t.status IN ('todo', 'in_progress', 'blocked', 'waiting_review') THEN 1 END)::INTEGER as active_tasks,
        COUNT(CASE WHEN t.status NOT IN ('completed', 'cancelled') AND t.due_date < CURRENT_TIMESTAMP THEN 1 END)::INTEGER as overdue_tasks,
        CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100)::INTEGER
        END as progress_percentage,
        COALESCE(SUM(t.actual_hours), 0) as total_hours,
        CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
        END as completion_rate,
        AVG(CASE WHEN t.status = 'completed' THEN t.completed_at - t.created_at END) as avg_task_completion_time
    FROM tasks t
    WHERE t.project_id = project_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get overdue projects
CREATE OR REPLACE FUNCTION get_overdue_projects(user_id_param UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    due_date DATE,
    days_overdue INTEGER,
    progress_percentage INTEGER,
    status project_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.due_date,
        (CURRENT_DATE - p.due_date)::INTEGER as days_overdue,
        p.progress_percentage,
        p.status
    FROM projects p
    WHERE
        p.user_id = user_id_param
        AND p.due_date < CURRENT_DATE
        AND p.status NOT IN ('completed', 'cancelled', 'archived')
    ORDER BY p.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- View to display projects with additional details
CREATE OR REPLACE VIEW projects_with_details AS
SELECT
    p.*,
    u.full_name as owner_name, -- Assuming 'full_name' column in 'users' table
    u.email as owner_email,
    COALESCE(pc.collaborators_count, 0) as total_collaborators,
    COALESCE(tc.comments_count, 0) as total_comments,
    COALESCE(tf.files_count, 0) as total_files,
    CASE
        WHEN p.due_date < CURRENT_DATE AND p.status NOT IN ('completed', 'cancelled') THEN true
        ELSE false
    END as is_overdue,
    CASE
        WHEN p.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        AND p.status NOT IN ('completed', 'cancelled') THEN true
        ELSE false
    END as is_due_soon
FROM projects p
LEFT JOIN users u ON p.user_id = u.id -- Assuming a 'users' table with 'full_name' and 'email'
LEFT JOIN (
    SELECT project_id, COUNT(*) as collaborators_count
    FROM project_collaborators
    WHERE invitation_status = 'accepted'
    GROUP BY project_id
) pc ON p.id = pc.project_id
LEFT JOIN (
    SELECT t.project_id, COUNT(tc.*) as comments_count
    FROM tasks t
    LEFT JOIN task_comments tc ON t.id = tc.task_id
    GROUP BY t.project_id
) tc ON p.id = tc.project_id
LEFT JOIN (
    SELECT project_id, COUNT(*) as files_count
    FROM project_files
    GROUP BY project_id
) tf ON p.id = tf.project_id;

-- View to display tasks with additional details
CREATE OR REPLACE VIEW tasks_with_details AS
SELECT
    t.*,
    p.name as project_name,
    p.status as project_status,
    u_assigned.full_name as assigned_to_name,
    u_assigned.email as assigned_to_email,
    u_created.full_name as created_by_name,
    u_created.email as created_by_email,
    parent_task.title as parent_task_title,
    COALESCE(tc.comments_count, 0) as comments_count,
    COALESCE(ta.attachments_count, 0) as attachments_count,
    CASE
        WHEN t.due_date < CURRENT_TIMESTAMP AND t.status NOT IN ('completed', 'cancelled') THEN true
        ELSE false
    END as is_overdue,
    CASE
        WHEN t.due_date BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '24 hours'
        AND t.status NOT IN ('completed', 'cancelled') THEN true
        ELSE false
    END as is_due_soon
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
LEFT JOIN users u_created ON t.created_by = u_created.id
LEFT JOIN tasks parent_task ON t.parent_task_id = parent_task.id
LEFT JOIN (
    SELECT task_id, COUNT(*) as comments_count
    FROM task_comments
    WHERE is_deleted = false
    GROUP BY task_id
) tc ON t.id = tc.task_id
LEFT JOIN (
    SELECT task_id, COUNT(*) as attachments_count
    FROM task_attachments
    GROUP BY task_id
) ta ON t.id = ta.task_id;

-- Final success messages
-- \echo '✅ تم إنشاء جداول المشاريع والمهام بنجاح!'
-- \echo '📊 تم إضافة الفهارس والدوال والسياسات الأمنية'
-- \echo '🔍 دوال البحث والتحليلات جاهزة للاستخدام'

SELECT 'Nexus Projects and Tasks System schema deployed successfully! ✅' as status;
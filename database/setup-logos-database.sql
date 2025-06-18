-- إنشاء جداول نظام Logos AI للتطبيق Nexus
-- يجب تطبيق هذا السكريپت في Supabase SQL Editor

-- ===========================
-- جداول Logos AI System
-- ===========================

-- 1. جدول المحادثات (Logos Conversations)
CREATE TABLE IF NOT EXISTS public.logos_conversations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title character varying(255),
  status character varying(50) DEFAULT 'active'::character varying,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  last_message_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  message_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT logos_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT logos_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 2. جدول الرسائل (Logos Messages)
CREATE TABLE IF NOT EXISTS public.logos_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role character varying(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  timestamp timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  tokens_used integer DEFAULT 0,
  model_used character varying(100),
  response_time_ms integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT logos_messages_pkey PRIMARY KEY (id),
  CONSTRAINT logos_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.logos_conversations(id) ON DELETE CASCADE,
  CONSTRAINT logos_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 3. جدول تفضيلات المستخدم (User Preferences for Logos)
CREATE TABLE IF NOT EXISTS public.logos_user_preferences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  ai_model character varying(100) DEFAULT 'nvidia/llama-3.1-nemotron-70b-instruct',
  response_style character varying(50) DEFAULT 'strategic',
  language character varying(10) DEFAULT 'ar',
  analysis_depth character varying(20) DEFAULT 'comprehensive',
  auto_save_conversations boolean DEFAULT true,
  notification_preferences jsonb DEFAULT '{"new_insights": true, "analysis_ready": true}'::jsonb,
  custom_instructions text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT logos_user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT logos_user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 4. جدول جلسات التحليل (Analysis Sessions)
CREATE TABLE IF NOT EXISTS public.logos_analysis_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  conversation_id uuid,
  title character varying(255) NOT NULL,
  description text,
  status character varying(50) DEFAULT 'active',
  analysis_type character varying(100),
  input_data jsonb DEFAULT '{}'::jsonb,
  output_data jsonb DEFAULT '{}'::jsonb,
  insights jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  completed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT logos_analysis_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT logos_analysis_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT logos_analysis_sessions_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.logos_conversations(id) ON DELETE SET NULL
);

-- ===========================
-- فهارس لتحسين الأداء
-- ===========================

-- فهارس الأداء للمحادثات
CREATE INDEX IF NOT EXISTS idx_logos_conversations_user_id ON public.logos_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_logos_conversations_status ON public.logos_conversations(status);
CREATE INDEX IF NOT EXISTS idx_logos_conversations_updated_at ON public.logos_conversations(updated_at DESC);

-- فهارس الأداء للرسائل
CREATE INDEX IF NOT EXISTS idx_logos_messages_conversation_id ON public.logos_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_logos_messages_user_id ON public.logos_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_logos_messages_timestamp ON public.logos_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logos_messages_role ON public.logos_messages(role);

-- فهارس الأداء لجلسات التحليل
CREATE INDEX IF NOT EXISTS idx_logos_analysis_user_id ON public.logos_analysis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_logos_analysis_status ON public.logos_analysis_sessions(status);
CREATE INDEX IF NOT EXISTS idx_logos_analysis_created_at ON public.logos_analysis_sessions(created_at DESC);

-- ===========================
-- Functions مساعدة
-- ===========================

-- دالة لتحديث عدد الرسائل في المحادثة
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.logos_conversations 
    SET message_count = message_count + 1,
        last_message_at = NEW.timestamp,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.logos_conversations 
    SET message_count = GREATEST(message_count - 1, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.conversation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث عدد الرسائل تلقائياً
DROP TRIGGER IF EXISTS trigger_update_message_count ON public.logos_messages;
CREATE TRIGGER trigger_update_message_count
  AFTER INSERT OR DELETE ON public.logos_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();

-- ===========================
-- Row Level Security (RLS)
-- ===========================

-- تفعيل RLS على جداول Logos
ALTER TABLE public.logos_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos_analysis_sessions ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للمحادثات
CREATE POLICY "Users can view own conversations" ON public.logos_conversations
  FOR SELECT USING (auth.uid()::text = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert own conversations" ON public.logos_conversations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own conversations" ON public.logos_conversations
  FOR UPDATE USING (auth.uid()::text = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can delete own conversations" ON public.logos_conversations
  FOR DELETE USING (auth.uid()::text = user_id OR auth.uid() IS NULL);

-- سياسات الأمان للرسائل
CREATE POLICY "Users can view own messages" ON public.logos_messages
  FOR SELECT USING (auth.uid()::text = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert own messages" ON public.logos_messages
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own messages" ON public.logos_messages
  FOR UPDATE USING (auth.uid()::text = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can delete own messages" ON public.logos_messages
  FOR DELETE USING (auth.uid()::text = user_id OR auth.uid() IS NULL);

-- سياسات الأمان للتفضيلات
CREATE POLICY "Users can view own preferences" ON public.logos_user_preferences
  FOR SELECT USING (auth.uid()::text = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert own preferences" ON public.logos_user_preferences
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own preferences" ON public.logos_user_preferences
  FOR UPDATE USING (auth.uid()::text = user_id OR auth.uid() IS NULL);

-- سياسات الأمان لجلسات التحليل
CREATE POLICY "Users can view own analysis sessions" ON public.logos_analysis_sessions
  FOR SELECT USING (auth.uid()::text = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert own analysis sessions" ON public.logos_analysis_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own analysis sessions" ON public.logos_analysis_sessions
  FOR UPDATE USING (auth.uid()::text = user_id OR auth.uid() IS NULL);

-- ===========================
-- بيانات تجريبية (اختيارية)
-- ===========================

-- إدراج تفضيلات افتراضية للمستخدم التجريبي
INSERT INTO public.logos_user_preferences (
  user_id,
  ai_model,
  response_style,
  language,
  analysis_depth,
  custom_instructions
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'nvidia/llama-3.1-nemotron-70b-instruct',
  'strategic',
  'ar',
  'comprehensive',
  'ركز على التحليل الاستراتيجي والحلول العملية'
) ON CONFLICT (user_id) DO UPDATE SET
  updated_at = CURRENT_TIMESTAMP;

-- ===========================
-- تحقق من نجاح الإنشاء
-- ===========================

-- عرض ملخص الجداول المنشأة
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name LIKE 'logos_%'
ORDER BY table_name, ordinal_position;

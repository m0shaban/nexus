-- ========================================
-- Nexus Database - Notes System
-- نظام الملاحظات والتحليل الذكي
-- ========================================

-- Ensure uuid-ossp extension is enabled for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure pgvector extension is enabled for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing types if they exist (safe for re-running the script, especially in development)
DROP TYPE IF EXISTS note_analysis_status CASCADE;
DROP TYPE IF EXISTS project_priority CASCADE;

-- Define Custom Types (ENUMs)
CREATE TYPE note_analysis_status AS ENUM ('pending', 'analyzing', 'completed', 'failed');
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Function to update 'updated_at' columns automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--
-- Table Creation
--

-- Create notes table (enhanced)
CREATE TABLE IF NOT EXISTS notes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,

    -- Content
    content text NOT NULL,
    content_type text DEFAULT 'text' CHECK (content_type IN ('text', 'voice', 'image', 'document', 'video', 'mixed')),
    title text,
    excerpt text,
    word_count integer DEFAULT 0,

    -- AI Analysis
    ai_summary text,
    ai_questions text[] DEFAULT ARRAY[]::text[],
    ai_tags text[] DEFAULT ARRAY[]::text[],
    ai_sentiment jsonb,
    ai_key_points text[] DEFAULT ARRAY[]::text[],
    ai_action_items text[] DEFAULT ARRAY[]::text[],
    analysis_status note_analysis_status DEFAULT 'pending',
    analysis_model_used text,
    analysis_tokens_used integer,
    analysis_confidence_score numeric(3,2) CHECK (analysis_confidence_score >= 0 AND analysis_confidence_score <= 1),

    -- Telegram integration
    telegram_message_id bigint,
    telegram_chat_id bigint,
    telegram_message_date timestamp with time zone,
    raw_telegram_message jsonb,

    -- Organization
    category text,
    priority project_priority DEFAULT 'medium',
    custom_tags text[] DEFAULT ARRAY[]::text[],
    keywords text[] DEFAULT ARRAY[]::text[],

    -- Status and tracking
    is_archived boolean DEFAULT false,
    is_favorite boolean DEFAULT false,
    is_processed boolean DEFAULT false,
    is_encrypted boolean DEFAULT false,

    -- Dates and reminders
    note_date date DEFAULT CURRENT_DATE,
    reminder_date timestamp with time zone,
    archived_at timestamp with time zone,

    -- Search and indexing
    search_vector tsvector,
    embedding vector(1536), -- For semantic search

    CONSTRAINT valid_word_count CHECK (word_count >= 0)
);

-- Create note comments table
CREATE TABLE IF NOT EXISTS note_comments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_ai_generated boolean DEFAULT false,
    parent_comment_id uuid REFERENCES note_comments(id) ON DELETE CASCADE,

    CONSTRAINT valid_content_length CHECK (length(content) > 0)
);

-- Create note tags table
CREATE TABLE IF NOT EXISTS note_tags (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    color text DEFAULT '#6B7280',
    description text,
    is_system_tag boolean DEFAULT false,
    usage_count integer DEFAULT 0,

    UNIQUE(user_id, name),
    CONSTRAINT valid_tag_name CHECK (length(trim(name)) >= 2),
    CONSTRAINT valid_color CHECK (color ~* '^#[0-9A-Fa-f]{6}$')
);

-- Create note_tag_assignments junction table
CREATE TABLE IF NOT EXISTS note_tag_assignments (
    note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES note_tags(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

    PRIMARY KEY (note_id, tag_id)
);

-- Create note analysis history
CREATE TABLE IF NOT EXISTS note_analysis_history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    analysis_type text NOT NULL,
    model_used text,
    tokens_used integer,
    confidence_score numeric(3,2),
    result jsonb,
    processing_time_ms integer,
    status text DEFAULT 'completed',
    error_message text,

    CONSTRAINT valid_confidence CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

-- Create note_files table for normalized file attachments
CREATE TABLE IF NOT EXISTS note_files (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    file_url text NOT NULL,
    file_type text,         -- e.g., 'image/jpeg', 'audio/mpeg', 'application/pdf'
    file_size bigint,       -- in bytes
    file_name text,
    is_thumbnail boolean DEFAULT false, -- Useful for images/videos
    checksum text,                      -- For integrity verification
    metadata jsonb,                     -- For any additional file-specific data

    UNIQUE(note_id, file_url) -- Ensures a file URL is unique per note
);

--
-- Indexes
--

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_content_type ON notes(content_type);
CREATE INDEX IF NOT EXISTS idx_notes_analysis_status ON notes(analysis_status);
CREATE INDEX IF NOT EXISTS idx_notes_telegram_message_id ON notes(telegram_message_id) WHERE telegram_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_telegram_chat_id ON notes(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_priority ON notes(priority);
CREATE INDEX IF NOT EXISTS idx_notes_is_archived ON notes(is_archived);
CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes(is_favorite);
CREATE INDEX IF NOT EXISTS idx_notes_note_date ON notes(note_date);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_reminder_date ON notes(reminder_date) WHERE reminder_date IS NOT NULL;

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_notes_search_vector ON notes USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_notes_content_search ON notes USING gin(to_tsvector('arabic', content));
CREATE INDEX IF NOT EXISTS idx_notes_title_search ON notes USING gin(to_tsvector('arabic', coalesce(title, '')));

-- Embedding index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_notes_embedding ON notes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
WHERE embedding IS NOT NULL;

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_note_comments_note_id ON note_comments(note_id);
CREATE INDEX IF NOT EXISTS idx_note_comments_user_id ON note_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_note_comments_parent ON note_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_note_tags_user_id ON note_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_name ON note_tags(name);
CREATE INDEX IF NOT EXISTS idx_note_tags_usage_count ON note_tags(usage_count);

-- Tag assignments indexes
CREATE INDEX IF NOT EXISTS idx_note_tag_assignments_note_id ON note_tag_assignments(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tag_assignments_tag_id ON note_tag_assignments(tag_id);

-- Analysis history indexes
CREATE INDEX IF NOT EXISTS idx_note_analysis_history_note_id ON note_analysis_history(note_id);
CREATE INDEX IF NOT EXISTS idx_note_analysis_history_type ON note_analysis_history(analysis_type);
CREATE INDEX IF NOT EXISTS idx_note_analysis_history_created_at ON note_analysis_history(created_at);

-- Note Files indexes
CREATE INDEX IF NOT EXISTS idx_note_files_note_id ON note_files(note_id);
CREATE INDEX IF NOT EXISTS idx_note_files_file_type ON note_files(file_type);

--
-- Triggers
--

-- Triggers for updated_at
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_note_comments_updated_at
    BEFORE UPDATE ON note_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update search vector automatically and word count
CREATE OR REPLACE FUNCTION update_notes_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('arabic', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('arabic', coalesce(NEW.content, '')), 'B') ||
        setweight(to_tsvector('arabic', coalesce(array_to_string(NEW.ai_tags, ' '), '')), 'C') ||
        setweight(to_tsvector('arabic', coalesce(array_to_string(NEW.custom_tags, ' '), '')), 'D');

    -- Update word count
    NEW.word_count := CASE WHEN NEW.content IS NOT NULL THEN array_length(string_to_array(NEW.content, ' '), 1) ELSE 0 END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notes_search_vector_trigger
    BEFORE INSERT OR UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_notes_search_vector();

-- Create function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE note_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE note_tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tag_usage_trigger
    AFTER INSERT OR DELETE ON note_tag_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_usage_count();

--
-- Functions
--

-- Create note analysis function (Placeholder for AI integration)
CREATE OR REPLACE FUNCTION analyze_note(
    note_id_param uuid,
    analysis_type_param text DEFAULT 'full',
    model_param text DEFAULT 'gpt-4'
)
RETURNS jsonb AS $$
DECLARE
    note_record notes;
    analysis_result jsonb;
    start_time timestamp := clock_timestamp();
    end_time timestamp;
    processing_time_ms integer;
BEGIN
    -- Get note record
    SELECT * INTO note_record FROM notes WHERE id = note_id_param;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Note not found');
    END IF;

    -- Mark as analyzing
    UPDATE notes SET analysis_status = 'analyzing' WHERE id = note_id_param;

    -- Placeholder for actual AI analysis integration
    -- This would typically involve calling an external AI service
    analysis_result := jsonb_build_object(
        'summary', 'This is an AI-generated summary of the note content. The actual summary would come from an external AI service based on: ' || note_record.content,
        'key_points', ARRAY['Key point 1 about the note', 'Key point 2 summarizing main ideas'],
        'questions', ARRAY['What is the primary topic of this note?', 'Are there any action items mentioned?'],
        'tags', ARRAY['ai-generated', 'sample', note_record.category],
        'sentiment', jsonb_build_object('score', 0.5, 'label', 'neutral'),
        'confidence', 0.92,
        'tokens_used', 150 -- Example token usage
    );

    end_time := clock_timestamp();
    processing_time_ms := extract(epoch from (end_time - start_time)) * 1000;

    -- Update note with analysis results
    UPDATE notes SET
        ai_summary = analysis_result->>'summary',
        ai_key_points = ARRAY(SELECT jsonb_array_elements_text(analysis_result->'key_points')),
        ai_questions = ARRAY(SELECT jsonb_array_elements_text(analysis_result->'questions')),
        ai_tags = ARRAY(SELECT jsonb_array_elements_text(analysis_result->'tags')),
        ai_sentiment = analysis_result->'sentiment',
        analysis_status = 'completed',
        analysis_model_used = model_param,
        analysis_tokens_used = (analysis_result->>'tokens_used')::integer,
        analysis_confidence_score = (analysis_result->>'confidence')::numeric,
        updated_at = now()
    WHERE id = note_id_param;

    -- Log analysis in history
    INSERT INTO note_analysis_history (
        note_id, analysis_type, model_used, tokens_used, confidence_score,
        result, processing_time_ms, status
    ) VALUES (
        note_id_param, analysis_type_param, model_param,
        (analysis_result->>'tokens_used')::integer,
        (analysis_result->>'confidence')::numeric,
        analysis_result, processing_time_ms, 'completed'
    );

    RETURN analysis_result;
END;
$$ LANGUAGE plpgsql;

-- دالة البحث في الملاحظات (Note Search Function)
CREATE OR REPLACE FUNCTION search_notes(
    p_user_id UUID,
    search_term TEXT DEFAULT NULL,
    category_filter TEXT DEFAULT NULL,
    content_type_filter TEXT DEFAULT NULL,
    priority_filter project_priority DEFAULT NULL,
    include_archived BOOLEAN DEFAULT false,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    content_type TEXT,
    category TEXT,
    priority project_priority,
    is_favorite BOOLEAN,
    note_date DATE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT n.id, n.title, n.content, n.content_type, n.category, n.priority,
           n.is_favorite, n.note_date, n.created_at
    FROM notes n
    WHERE n.user_id = p_user_id
    AND (include_archived OR n.is_archived = false)
    AND (search_term IS NULL OR (
        n.search_vector @@ plainto_tsquery('arabic', search_term)
    ))
    AND (category_filter IS NULL OR n.category = category_filter)
    AND (content_type_filter IS NULL OR n.content_type = content_type_filter)
    AND (priority_filter IS NULL OR n.priority = priority_filter)
    ORDER BY
        CASE WHEN n.is_favorite THEN 0 ELSE 1 END,
        n.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة لتحديث حالة التحليل (Function to Update Analysis Status)
CREATE OR REPLACE FUNCTION update_note_analysis(
    note_id UUID,
    new_summary TEXT DEFAULT NULL,
    new_questions TEXT[] DEFAULT NULL,
    new_tags TEXT[] DEFAULT NULL,
    new_status note_analysis_status DEFAULT 'completed'
)
RETURNS void AS $$
BEGIN
    UPDATE notes
    SET
        ai_summary = COALESCE(new_summary, ai_summary),
        ai_questions = COALESCE(new_questions, ai_questions),
        ai_tags = COALESCE(new_tags, ai_tags),
        analysis_status = new_status,
        is_processed = true,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة لأرشفة الملاحظات القديمة (Function to Archive Old Notes)
CREATE OR REPLACE FUNCTION archive_old_notes(days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    WITH archived AS (
        UPDATE notes
        SET is_archived = true, updated_at = CURRENT_TIMESTAMP, archived_at = CURRENT_TIMESTAMP
        WHERE created_at < CURRENT_DATE - (days_old || ' days')::interval
        AND is_archived = false
        AND is_favorite = false
        RETURNING id
    )
    SELECT COUNT(*) INTO archived_count FROM archived;

    RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--
-- Row Level Security (RLS)
--

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notes
CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for comments
CREATE POLICY "Users can view comments on their notes" ON note_comments
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() = (SELECT user_id FROM notes WHERE id = note_comments.note_id)
    );

CREATE POLICY "Users can insert their own comments" ON note_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON note_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON note_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tags
CREATE POLICY "Users can manage their own tags" ON note_tags
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for tag assignments
CREATE POLICY "Users can manage tag assignments for their notes" ON note_tag_assignments
    FOR ALL USING (
        auth.uid() = (SELECT user_id FROM notes WHERE id = note_tag_assignments.note_id)
    );

-- Create RLS policies for analysis history
CREATE POLICY "Users can view analysis history for their notes" ON note_analysis_history
    FOR SELECT USING (
        auth.uid() = (SELECT user_id FROM notes WHERE id = note_analysis_history.note_id)
    );

-- Create RLS policies for note files
CREATE POLICY "Users can view files of their notes" ON note_files
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM notes WHERE notes.id = note_files.note_id AND notes.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert files to their notes" ON note_files
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM notes WHERE notes.id = note_files.note_id AND notes.user_id = auth.uid()
    ));

CREATE POLICY "Users can update files of their notes" ON note_files
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM notes WHERE notes.id = note_files.note_id AND notes.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete files of their notes" ON note_files
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM notes WHERE notes.id = note_files.note_id AND notes.user_id = auth.uid()
    ));

-- Success message
SELECT 'Nexus Notes System schema deployed successfully! ✅' as status;
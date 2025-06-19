-- إصلاح دالة توليد مفتاح المشروع لتجنب التضارب
CREATE OR REPLACE FUNCTION generate_project_key()
RETURNS TRIGGER AS $$
DECLARE
    project_count INTEGER;
    project_key_candidate TEXT;
    key_exists BOOLEAN;
BEGIN
    IF NEW.project_key IS NULL THEN
        -- البحث عن أول رقم متاح
        project_count := 1;
        LOOP
            project_key_candidate := 'PROJ-' || LPAD(project_count::TEXT, 3, '0');
            
            -- التحقق من عدم وجود هذا المفتاح
            SELECT EXISTS(SELECT 1 FROM projects WHERE project_key = project_key_candidate) INTO key_exists;
            
            IF NOT key_exists THEN
                NEW.project_key := project_key_candidate;
                EXIT;
            END IF;
            
            project_count := project_count + 1;
            
            -- حماية من اللوب اللانهائي (حد أقصى 9999 مشروع)
            IF project_count > 9999 THEN
                RAISE EXCEPTION 'تم الوصول للحد الأقصى لعدد المشاريع (9999)';
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

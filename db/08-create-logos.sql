-- ========================================
-- 08-create-logos.sql
-- نظام إدارة الشعارات والهوية البصرية
-- ========================================

-- حذف الجداول إذا كانت موجودة
DROP TABLE IF EXISTS logo_variations CASCADE;
DROP TABLE IF EXISTS logo_categories CASCADE;
DROP TABLE IF EXISTS logos CASCADE;

-- إنشاء جدول الشعارات الرئيسي
CREATE TABLE logos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- المعلومات الأساسية
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand_name VARCHAR(255),
    company_name VARCHAR(255),
    
    -- معلومات الملف الرئيسي
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(100), -- svg, png, jpg, pdf, ai, etc.
    file_size BIGINT, -- بالبايت
    original_filename VARCHAR(255),
    
    -- الأبعاد والمواصفات التقنية
    width INTEGER,
    height INTEGER,
    resolution_dpi INTEGER,
    color_mode VARCHAR(20) CHECK (color_mode IN ('RGB', 'CMYK', 'Grayscale', 'Monochrome')),
    has_transparency BOOLEAN DEFAULT false,
    
    -- التصنيف والنوع
    logo_type VARCHAR(50) DEFAULT 'logo' CHECK (logo_type IN 
        ('logo', 'wordmark', 'lettermark', 'pictorial', 'abstract', 'mascot', 'combination', 'emblem')),
    industry VARCHAR(100),
    style VARCHAR(100), -- modern, vintage, minimalist, etc.
    
    -- الألوان
    primary_colors JSONB DEFAULT '[]', -- مصفوفة من الألوان الأساسية
    color_palette JSONB DEFAULT '[]', -- لوحة الألوان الكاملة
    dominant_color VARCHAR(7), -- اللون المهيمن بصيغة hex
    
    -- الاستخدام والتطبيقات
    usage_guidelines TEXT,
    recommended_sizes JSONB DEFAULT '[]',
    usage_contexts JSONB DEFAULT '[]', -- web, print, social_media, etc.
    
    -- الحالة والخصائص
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived', 'deprecated')),
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'shared')),
    is_template BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    
    -- تقييم الجودة والمراجعة
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 10),
    review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
    review_notes TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- البيانات الفنية والتحليل
    ai_analysis JSONB DEFAULT '{}', -- تحليل ذكي للشعار
    design_elements JSONB DEFAULT '[]', -- العناصر التصميمية
    typography_info JSONB DEFAULT '{}', -- معلومات الخطوط
    similarity_score DECIMAL(3,2), -- درجة التشابه مع شعارات أخرى
    
    -- العلامات والتصنيف
    tags JSONB DEFAULT '[]',
    keywords JSONB DEFAULT '[]',
    categories JSONB DEFAULT '[]',
    
    -- معلومات الإنشاء والمصدر
    creation_method VARCHAR(50) CHECK (creation_method IN ('manual_upload', 'ai_generated', 'imported', 'designed')),
    design_brief TEXT,
    client_requirements TEXT,
    design_iterations INTEGER DEFAULT 1,
    
    -- الترخيص والحقوق
    license_type VARCHAR(50) DEFAULT 'all_rights_reserved',
    copyright_info TEXT,
    attribution_required BOOLEAN DEFAULT false,
    commercial_use_allowed BOOLEAN DEFAULT true,
    
    -- إحصائيات الاستخدام
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول تصنيفات الشعارات
CREATE TABLE logo_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES logo_categories(id) ON DELETE SET NULL,
    
    -- الخصائص التنظيمية
    icon VARCHAR(100), -- أيقونة التصنيف
    color VARCHAR(7) DEFAULT '#3B82F6', -- لون التصنيف
    sort_order INTEGER DEFAULT 0,
    
    -- الإحصائيات
    logo_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول تنويعات الشعارات
CREATE TABLE logo_variations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    logo_id UUID REFERENCES logos(id) ON DELETE CASCADE,
    
    -- معلومات التنويع
    variation_name VARCHAR(255) NOT NULL,
    variation_type VARCHAR(50) CHECK (variation_type IN 
        ('color', 'black_white', 'monochrome', 'horizontal', 'vertical', 'icon_only', 'text_only', 'reversed', 'small_size')),
    description TEXT,
    
    -- معلومات الملف
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    file_size BIGINT,
    
    -- المواصفات
    width INTEGER,
    height INTEGER,
    resolution_dpi INTEGER,
    background_color VARCHAR(7),
    
    -- الاستخدام الموصى به
    recommended_usage TEXT,
    min_width INTEGER, -- الحد الأدنى للعرض للاستخدام
    max_width INTEGER, -- الحد الأقصى للعرض للاستخدام
    
    -- الحالة والخصائص
    is_primary BOOLEAN DEFAULT false, -- هل هذا التنويع الأساسي
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    -- إحصائيات
    download_count INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء الفهارس للشعارات
CREATE INDEX idx_logos_user_id ON logos(user_id);
CREATE INDEX idx_logos_brand_name ON logos(brand_name);
CREATE INDEX idx_logos_logo_type ON logos(logo_type);
CREATE INDEX idx_logos_industry ON logos(industry);
CREATE INDEX idx_logos_status ON logos(status);
CREATE INDEX idx_logos_visibility ON logos(visibility);
CREATE INDEX idx_logos_is_favorite ON logos(is_favorite);
CREATE INDEX idx_logos_quality_score ON logos(quality_score);
CREATE INDEX idx_logos_created_at ON logos(created_at);
CREATE INDEX idx_logos_file_type ON logos(file_type);
CREATE INDEX idx_logos_dominant_color ON logos(dominant_color);

-- إنشاء الفهارس للتصنيفات
CREATE INDEX idx_logo_categories_parent_category_id ON logo_categories(parent_category_id);
CREATE INDEX idx_logo_categories_sort_order ON logo_categories(sort_order);
CREATE INDEX idx_logo_categories_is_active ON logo_categories(is_active);

-- إنشاء الفهارس للتنويعات
CREATE INDEX idx_logo_variations_logo_id ON logo_variations(logo_id);
CREATE INDEX idx_logo_variations_variation_type ON logo_variations(variation_type);
CREATE INDEX idx_logo_variations_is_primary ON logo_variations(is_primary);
CREATE INDEX idx_logo_variations_sort_order ON logo_variations(sort_order);

-- فهارس البحث النصي
CREATE INDEX idx_logos_name_search ON logos USING gin(to_tsvector('arabic', name));
CREATE INDEX idx_logos_description_search ON logos USING gin(to_tsvector('arabic', description));
CREATE INDEX idx_logos_brand_search ON logos USING gin(to_tsvector('arabic', brand_name));

-- فهارس للبحث في الألوان والعلامات
CREATE INDEX idx_logos_primary_colors ON logos USING gin(primary_colors);
CREATE INDEX idx_logos_tags ON logos USING gin(tags);
CREATE INDEX idx_logos_keywords ON logos USING gin(keywords);

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_logos_updated_at
    BEFORE UPDATE ON logos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logo_categories_updated_at
    BEFORE UPDATE ON logo_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logo_variations_updated_at
    BEFORE UPDATE ON logo_variations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- trigger لتحديث عدد الشعارات في التصنيفات
CREATE OR REPLACE FUNCTION update_category_logo_count()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث عدد الشعارات في جميع التصنيفات المرتبطة
    UPDATE logo_categories 
    SET logo_count = (
        SELECT COUNT(*) 
        FROM logos 
        WHERE logos.categories ? logo_categories.name
        AND logos.status = 'active'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_logo_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON logos
    FOR EACH ROW
    EXECUTE FUNCTION update_category_logo_count();

-- تفعيل RLS
ALTER TABLE logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE logo_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE logo_variations ENABLE ROW LEVEL SECURITY;

-- السياسات الأمنية للشعارات
CREATE POLICY "Users can view accessible logos" ON logos
    FOR SELECT USING (
        user_id = auth.uid() 
        OR visibility = 'public'
        OR (visibility = 'shared' AND status = 'active')
    );

CREATE POLICY "Users can insert their own logos" ON logos
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own logos" ON logos
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own logos" ON logos
    FOR DELETE USING (user_id = auth.uid());

-- السياسات للتصنيفات (عامة للقراءة)
CREATE POLICY "Anyone can view active categories" ON logo_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories" ON logo_categories
    FOR ALL USING (auth.uid() IS NOT NULL);

-- السياسات للتنويعات
CREATE POLICY "Users can view variations of accessible logos" ON logo_variations
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM logos 
        WHERE logos.id = logo_variations.logo_id 
        AND (
            logos.user_id = auth.uid() 
            OR logos.visibility = 'public'
            OR (logos.visibility = 'shared' AND logos.status = 'active')
        )
    ));

CREATE POLICY "Users can manage variations of their logos" ON logo_variations
    FOR ALL USING (EXISTS (
        SELECT 1 FROM logos 
        WHERE logos.id = logo_variations.logo_id 
        AND logos.user_id = auth.uid()
    ));

-- دالة البحث في الشعارات
CREATE OR REPLACE FUNCTION search_logos(
    p_user_id UUID DEFAULT NULL,
    search_term TEXT DEFAULT NULL,
    logo_type_filter VARCHAR(50) DEFAULT NULL,
    industry_filter VARCHAR(100) DEFAULT NULL,
    color_filter VARCHAR(7) DEFAULT NULL,
    visibility_filter VARCHAR(20) DEFAULT NULL,
    include_public BOOLEAN DEFAULT true,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    brand_name VARCHAR(255),
    logo_type VARCHAR(50),
    industry VARCHAR(100),
    file_url TEXT,
    dominant_color VARCHAR(7),
    quality_score DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.name, l.brand_name, l.logo_type, l.industry, 
           l.file_url, l.dominant_color, l.quality_score, l.created_at
    FROM logos l
    WHERE l.status = 'active'
    AND (
        (p_user_id IS NOT NULL AND l.user_id = p_user_id)
        OR (include_public AND l.visibility = 'public')
        OR l.visibility = 'shared'
    )
    AND (search_term IS NULL OR (
        l.name ILIKE '%' || search_term || '%'
        OR l.brand_name ILIKE '%' || search_term || '%'
        OR l.description ILIKE '%' || search_term || '%'
        OR l.tags ? search_term
        OR l.keywords ? search_term
    ))
    AND (logo_type_filter IS NULL OR l.logo_type = logo_type_filter)
    AND (industry_filter IS NULL OR l.industry = industry_filter)
    AND (color_filter IS NULL OR l.dominant_color = color_filter)
    AND (visibility_filter IS NULL OR l.visibility = visibility_filter)
    ORDER BY 
        CASE WHEN l.is_favorite THEN 0 ELSE 1 END,
        l.quality_score DESC NULLS LAST,
        l.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للبحث بالألوان المتشابهة
CREATE OR REPLACE FUNCTION find_logos_by_similar_colors(
    target_colors JSONB,
    p_user_id UUID DEFAULT NULL,
    similarity_threshold DECIMAL DEFAULT 0.7,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    brand_name VARCHAR(255),
    dominant_color VARCHAR(7),
    primary_colors JSONB,
    similarity_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.name, l.brand_name, l.dominant_color, l.primary_colors,
           -- حساب درجة التشابه (مبسط - يمكن تحسينه)
           (jsonb_array_length(l.primary_colors) * 0.1)::DECIMAL as similarity_score
    FROM logos l
    WHERE l.status = 'active'
    AND (
        p_user_id IS NULL 
        OR l.user_id = p_user_id 
        OR l.visibility IN ('public', 'shared')
    )
    AND l.primary_colors IS NOT NULL
    AND jsonb_array_length(l.primary_colors) > 0
    -- يمكن إضافة منطق حساب التشابه اللوني هنا
    ORDER BY similarity_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة لتحديث إحصائيات الاستخدام
CREATE OR REPLACE FUNCTION update_logo_stats(
    p_logo_id UUID,
    action_type VARCHAR(20) -- 'view', 'download', 'like'
)
RETURNS void AS $$
BEGIN
    UPDATE logos 
    SET 
        view_count = CASE WHEN action_type = 'view' THEN view_count + 1 ELSE view_count END,
        download_count = CASE WHEN action_type = 'download' THEN download_count + 1 ELSE download_count END,
        like_count = CASE WHEN action_type = 'like' THEN like_count + 1 ELSE like_count END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_logo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة لتحليل الشعار (مساعدة للتحليل الذكي)
CREATE OR REPLACE FUNCTION analyze_logo_properties(
    p_logo_id UUID,
    analysis_data JSONB
)
RETURNS void AS $$
BEGIN
    UPDATE logos 
    SET 
        ai_analysis = analysis_data,
        dominant_color = COALESCE(analysis_data->>'dominant_color', dominant_color),
        primary_colors = COALESCE(analysis_data->'primary_colors', primary_colors),
        design_elements = COALESCE(analysis_data->'design_elements', design_elements),
        quality_score = COALESCE((analysis_data->>'quality_score')::DECIMAL, quality_score),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_logo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء التصنيفات الأساسية
INSERT INTO logo_categories (name, description, icon, color, sort_order) VALUES
('Technology', 'شعارات الشركات التقنية والبرمجية', 'monitor', '#3B82F6', 1),
('Business', 'شعارات الأعمال والشركات', 'briefcase', '#10B981', 2),
('Healthcare', 'شعارات القطاع الصحي والطبي', 'heart', '#EF4444', 3),
('Education', 'شعارات المؤسسات التعليمية', 'book', '#8B5CF6', 4),
('Food & Beverage', 'شعارات الطعام والمشروبات', 'coffee', '#F59E0B', 5),
('Fashion', 'شعارات الأزياء والموضة', 'shirt', '#EC4899', 6),
('Sports', 'شعارات الرياضة واللياقة', 'trophy', '#06B6D4', 7),
('Creative', 'شعارات الإبداع والفنون', 'palette', '#F97316', 8),
('Non-profit', 'شعارات المنظمات الخيرية', 'heart-hand', '#84CC16', 9),
('Other', 'تصنيفات أخرى', 'folder', '#6B7280', 10);

-- رسالة تأكيد
DO $$
BEGIN
    RAISE NOTICE 'Logo system tables (logos, categories, variations) created successfully with sample categories!';
END $$;

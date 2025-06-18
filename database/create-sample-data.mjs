import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// تحميل متغيرات البيئة من .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة مفقودة!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🚀 إنشاء بيانات تجريبية للإنتاج...\n')

async function createSampleData() {
  try {
    console.log('📝 إنشاء ملاحظات تجريبية...')
    
    // إنشاء ملاحظات متنوعة
    const notes = [
      {
        content: 'فكرة مشروع جديد: تطبيق لإدارة المهام الشخصية مع الذكاء الاصطناعي',
        content_type: 'text',
        analysis_status: 'pending',
        category: 'مشاريع',
        priority: 'high'
      },
      {
        content: 'اجتماع مع الفريق غداً الساعة 2 ظهراً لمناقشة خطة المشروع الجديد',
        content_type: 'text',
        analysis_status: 'pending',
        category: 'اجتماعات',
        priority: 'medium'
      },
      {
        content: 'قراءة كتاب "الرجل الأغنى في بابل" - أفكار مهمة حول إدارة المال',
        content_type: 'text',
        analysis_status: 'pending',
        category: 'تعلم',
        priority: 'low'
      },
      {
        content: 'تعلم React Native لتطوير تطبيق الهاتف المحمول - التركيز على Navigation',
        content_type: 'text',
        analysis_status: 'pending',
        category: 'تطوير',
        priority: 'high'
      },
      {
        content: 'خطة التسويق للمنتج الجديد: استهداف الشباب في الفئة العمرية 18-35',
        content_type: 'text',
        analysis_status: 'pending',
        category: 'تسويق',
        priority: 'medium'
      }
    ]

    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .insert(notes)
      .select()

    if (notesError) {
      console.log('❌ فشل إنشاء الملاحظات:', notesError.message)
      return false
    }

    console.log(`✅ تم إنشاء ${notesData.length} ملاحظات بنجاح`)

    console.log('\n📋 إنشاء مشاريع تجريبية...')
    
    // إنشاء مشاريع
    const projects = [
      {
        name: 'تطبيق إدارة المهام الذكي',
        description: 'تطوير تطبيق يستخدم الذكاء الاصطناعي لتنظيم المهام وتقديم اقتراحات ذكية',
        status: 'active',
        priority: 'high',
        progress_percentage: 25,
        category: 'تطوير البرمجيات',
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        name: 'حملة تسويقية للمنتج الجديد',
        description: 'إطلاق حملة تسويقية شاملة لاستهداف العملاء المحتملين',
        status: 'planning',
        priority: 'medium',
        progress_percentage: 10,
        category: 'تسويق',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        name: 'تحسين الموقع الإلكتروني',
        description: 'تحديث تصميم الموقع وتحسين تجربة المستخدم وسرعة التحميل',
        status: 'active',
        priority: 'medium',
        progress_percentage: 60,
        category: 'تطوير الويب',
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]

    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .insert(projects)
      .select()

    if (projectsError) {
      console.log('❌ فشل إنشاء المشاريع:', projectsError.message)
      return false
    }

    console.log(`✅ تم إنشاء ${projectsData.length} مشاريع بنجاح`)

    console.log('\n🎯 إنشاء سيناريوهات تجريبية...')
    
    // إنشاء سيناريوهات
    const scenarios = [
      {
        title: 'سيناريو نجاح المنتج في السوق',
        description: 'تحليل احتمالية نجاح المنتج الجديد وتحقيق الأهداف المالية',
        context: 'إطلاق منتج جديد في سوق تنافسي',
        time_horizon: 'medium_term',
        ai_analysis_status: 'pending',
        risk_level: 'medium',
        status: 'active',
        scenario_type: 'business',
        methodology: 'swot'
      },
      {
        title: 'سيناريو تحديات التطوير التقني',
        description: 'تحليل المخاطر التقنية المحتملة في مشروع التطوير',
        context: 'مشروع تطوير تطبيق معقد',
        time_horizon: 'short_term',
        ai_analysis_status: 'pending',
        risk_level: 'high',
        status: 'active',
        scenario_type: 'technical',
        methodology: 'scenario_planning'
      },
      {
        title: 'سيناريو التوسع في السوق الإقليمي',
        description: 'دراسة إمكانيات التوسع في أسواق دول الخليج',
        context: 'خطة التوسع الاستراتيجي للشركة',
        time_horizon: 'long_term',
        ai_analysis_status: 'pending',
        risk_level: 'medium',
        status: 'draft',
        scenario_type: 'business',
        methodology: 'pestle'
      }
    ]

    const { data: scenariosData, error: scenariosError } = await supabase
      .from('scenarios')
      .insert(scenarios)
      .select()

    if (scenariosError) {
      console.log('❌ فشل إنشاء السيناريوهات:', scenariosError.message)
      return false
    }

    console.log(`✅ تم إنشاء ${scenariosData.length} سيناريوهات بنجاح`)

    console.log('\n📊 إنشاء مهام للمشاريع...')
    
    // إنشاء مهام للمشروع الأول
    if (projectsData.length > 0) {
      const tasks = [
        {
          project_id: projectsData[0].id,
          title: 'تصميم واجهة المستخدم الرئيسية',
          description: 'إنشاء تصاميم mockups للصفحات الأساسية',
          status: 'in_progress',
          priority: 'high',
          progress_percentage: 40,
          estimated_hours: 16,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          project_id: projectsData[0].id,
          title: 'تطوير نظام المصادقة',
          description: 'تنفيذ نظام تسجيل الدخول والأمان',
          status: 'todo',
          priority: 'high',
          progress_percentage: 0,
          estimated_hours: 24,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          project_id: projectsData[0].id,
          title: 'إعداد قاعدة البيانات',
          description: 'تصميم وتنفيذ هيكل قاعدة البيانات',
          status: 'done',
          priority: 'high',
          progress_percentage: 100,
          estimated_hours: 12,
          actual_hours: 10,
          completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .insert(tasks)
        .select()

      if (tasksError) {
        console.log('❌ فشل إنشاء المهام:', tasksError.message)
      } else {
        console.log(`✅ تم إنشاء ${tasksData.length} مهام بنجاح`)
      }
    }

    console.log('\n🎉 تم إنشاء البيانات التجريبية بنجاح!')
    console.log('🔗 يمكنك الآن تصفح التطبيق على: http://localhost:3000')
    
    return true

  } catch (error) {
    console.log('❌ خطأ عام:', error.message)
    return false
  }
}

createSampleData()

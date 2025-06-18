import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ متغيرات البيئة مفقودة!')
  console.log('تأكد من وجود NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// استخدام Service Role Key للتجاوز RLS
const supabase = createClient(supabaseUrl, serviceRoleKey)

console.log('\n🔥 اختبار إدراج Streaks حقيقية باستخدام Service Role')
console.log('='.repeat(70))

async function createProductionStreaks() {
  try {
    // 1. إنشاء مستخدم تجريبي أولاً
    console.log('\n👤 إنشاء مستخدم تجريبي...')
    const testUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@nexus.app',
      name: 'مستخدم تجريبي',
      full_name: 'مستخدم تجريبي للاختبار',
      telegram_user_id: 123456789,
      telegram_username: 'nexus_test',
      language: 'ar',
      theme: 'dark'
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert(testUser, { onConflict: 'id' })
      .select()
      .single()

    if (userError) {
      console.log('⚠️ مشكلة في إنشاء المستخدم:', userError.message)
    } else {
      console.log('✅ تم إنشاء/تحديث المستخدم:', user.name)
    }

    // 2. إنشاء مشروع تجريبي
    console.log('\n📋 إنشاء مشروع تجريبي...')
    const testProject = {
      id: '660e8400-e29b-41d4-a716-446655440000',
      user_id: testUser.id,
      name: 'مشروع تطوير Nexus',
      description: 'مشروع لتطوير تطبيق إدارة المهام والذكاء الاصطناعي',
      status: 'active',
      priority: 'high',
      progress_percentage: 75,
      category: 'تطوير البرمجيات'
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .upsert(testProject, { onConflict: 'id' })
      .select()
      .single()

    if (projectError) {
      console.log('⚠️ مشكلة في إنشاء المشروع:', projectError.message)
    } else {
      console.log('✅ تم إنشاء/تحديث المشروع:', project.name)
    }

    // 3. إنشاء streaks متنوعة
    console.log('\n🔥 إنشاء Streaks حقيقية...')
    
    const streaks = [
      {
        user_id: testUser.id,
        project_id: testProject.id,
        name: 'البرمجة اليومية',
        description: 'كتابة كود لمدة ساعة يومياً على الأقل',
        goal_description: 'تحسين مهارات البرمجة والمحافظة على الاستمرارية',
        streak_type: 'habit',
        category: 'تطوير مهني',
        target_frequency: 'daily',
        minimum_duration_minutes: 60,
        maximum_duration_minutes: 240,
        flexible_timing: true,
        reminder_enabled: true,
        current_streak: 15,
        longest_streak: 28,
        total_completions: 45,
        total_days_tracked: 60,
        total_time_spent_minutes: 3600,
        perfect_weeks: 2,
        completion_rate: 75.00,
        current_week_rate: 85.71,
        current_month_rate: 80.00,
        last_30_days_rate: 76.67,
        target_streak: 100,
        points_per_completion: 15,
        bonus_points_threshold: 7,
        bonus_points_amount: 50,
        total_points_earned: 725,
        status: 'active',
        is_private: false,
        challenge_mode: true,
        challenge_description: 'تحدي 100 يوم برمجة متواصلة',
        challenge_multiplier: 1.5,
        tags: ['برمجة', 'تطوير', 'تحدي'],
        metadata: { source: 'nexus_app', version: '1.0' },
        notification_settings: { push: true, email: true, sms: false }
      },
      {
        user_id: testUser.id,
        project_id: testProject.id,
        name: 'قراءة تقنية',
        description: 'قراءة مقالات أو كتب تقنية لمدة 30 دقيقة يومياً',
        goal_description: 'البقاء محدثاً مع التطورات التقنية',
        streak_type: 'habit',
        category: 'تعلم',
        target_frequency: 'daily',
        minimum_duration_minutes: 30,
        maximum_duration_minutes: 120,
        flexible_timing: true,
        reminder_enabled: true,
        current_streak: 8,
        longest_streak: 22,
        total_completions: 35,
        total_days_tracked: 45,
        total_time_spent_minutes: 1800,
        perfect_weeks: 1,
        completion_rate: 77.78,
        current_week_rate: 100.00,
        current_month_rate: 85.00,
        last_30_days_rate: 80.00,
        target_streak: 30,
        points_per_completion: 10,
        bonus_points_threshold: 7,
        bonus_points_amount: 30,
        total_points_earned: 380,
        status: 'active',
        is_private: false,
        challenge_mode: false,
        tags: ['قراءة', 'تعلم', 'تقنية'],
        metadata: { source: 'nexus_app', books_read: 3 },
        notification_settings: { push: true, email: false, sms: false }
      },
      {
        user_id: testUser.id,
        name: 'التأمل الصباحي',
        description: 'جلسة تأمل وتفكير لمدة 15 دقيقة كل صباح',
        goal_description: 'تحسين التركيز والصحة النفسية',
        streak_type: 'routine',
        category: 'صحة نفسية',
        target_frequency: 'daily',
        minimum_duration_minutes: 15,
        maximum_duration_minutes: 45,
        flexible_timing: false,
        reminder_time: '07:00:00',
        reminder_enabled: true,
        current_streak: 12,
        longest_streak: 19,
        total_completions: 28,
        total_days_tracked: 35,
        total_time_spent_minutes: 560,
        perfect_weeks: 1,
        completion_rate: 80.00,
        current_week_rate: 85.71,
        current_month_rate: 75.00,
        last_30_days_rate: 78.00,
        target_streak: 21,
        points_per_completion: 8,
        bonus_points_threshold: 7,
        bonus_points_amount: 25,
        total_points_earned: 249,
        status: 'active',
        is_private: true,
        challenge_mode: false,
        tags: ['تأمل', 'صحة', 'روتين صباحي'],
        metadata: { source: 'nexus_app', mood_improvement: true },
        notification_settings: { push: true, email: false, sms: false }
      },
      {
        user_id: testUser.id,
        project_id: testProject.id,
        name: 'مراجعة الكود',
        description: 'مراجعة ونظافة الكود المكتوب',
        goal_description: 'تحسين جودة الكود وتقليل الأخطاء',
        streak_type: 'project',
        category: 'تطوير البرمجيات',
        target_frequency: 'weekly',
        minimum_duration_minutes: 90,
        maximum_duration_minutes: 180,
        flexible_timing: true,
        reminder_enabled: true,
        current_streak: 3,
        longest_streak: 5,
        total_completions: 8,
        total_days_tracked: 12,
        total_time_spent_minutes: 960,
        perfect_weeks: 2,
        completion_rate: 66.67,
        current_week_rate: 100.00,
        current_month_rate: 75.00,
        last_30_days_rate: 70.00,
        target_streak: 10,
        points_per_completion: 25,
        bonus_points_threshold: 4,
        bonus_points_amount: 100,
        total_points_earned: 300,
        status: 'active',
        is_private: false,
        challenge_mode: false,
        tags: ['مراجعة', 'جودة', 'كود'],
        metadata: { source: 'nexus_app', bugs_fixed: 15 },
        notification_settings: { push: true, email: true, sms: false }
      }
    ]

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < streaks.length; i++) {
      const streak = streaks[i]
      console.log(`\n${i + 1}. إنشاء streak: ${streak.name}`)
      
      const { data, error } = await supabase
        .from('streaks')
        .insert(streak)
        .select()
        .single()

      if (error) {
        console.log(`   ❌ فشل: ${error.message}`)
        errorCount++
      } else {
        console.log(`   ✅ نجح: ID ${data.id.substring(0, 8)}...`)
        console.log(`      التتابع الحالي: ${data.current_streak} أيام`)
        console.log(`      النقاط المكتسبة: ${data.total_points_earned} نقطة`)
        successCount++
      }
    }

    // 4. ملخص النتائج
    console.log('\n' + '='.repeat(70))
    console.log('📊 ملخص العملية')
    console.log('='.repeat(70))
    console.log(`✅ Streaks منشأة بنجاح: ${successCount}`)
    console.log(`❌ فشل في الإنشاء: ${errorCount}`)
    console.log(`📊 إجمالي المحاولات: ${streaks.length}`)
    
    if (successCount > 0) {
      console.log('\n🎯 اختبار جلب البيانات...')
      const { data: allStreaks, error: fetchError } = await supabase
        .from('streaks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (fetchError) {
        console.log('❌ فشل جلب البيانات:', fetchError.message)
      } else {
        console.log(`✅ تم جلب ${allStreaks.length} streaks بنجاح`)
        
        allStreaks.forEach((streak, index) => {
          console.log(`   ${index + 1}. ${streak.name} - ${streak.current_streak} أيام`)
        })
      }
    }

    console.log('\n🚀 النظام جاهز للاستخدام!')
    console.log('🌐 شغّل التطبيق: npm run dev')
    console.log('📱 افتح: http://localhost:3001')

  } catch (error) {
    console.error('\n💥 خطأ عام:', error)
  }
}

createProductionStreaks()

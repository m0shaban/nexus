'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Streak } from '@/types/database'
import { Flame } from 'lucide-react'

interface ProjectStreakProps {
  projectId: string
  showText?: boolean
}

export function ProjectStreak({ projectId, showText = false }: ProjectStreakProps) {
  const [streak, setStreak] = useState<Streak | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchStreak = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // محاولة جلب البيانات مباشرة من API أولاً
      try {
        const response = await fetch(`/api/streaks?project_id=${projectId}`)
        if (response.ok) {
          const result = await response.json()
          if (result.streaks && result.streaks.length > 0) {
            setStreak(result.streaks[0])
            setLoading(false)
            return
          }
        }
      } catch (apiError) {
        console.log('API غير متاح، محاولة الاتصال المباشر:', apiError)
      }
      
      // إذا فشل API، جرب الاتصال المباشر بـ Supabase
      try {
        const { data, error } = await supabase
          .from('streaks')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle()

        if (error) {
          console.error('خطأ في جلب streak:', error)
          setError(error.message)
          setStreak(null)
          return
        }

        setStreak(data)
      } catch (dbError) {
        console.error('خطأ في الاتصال بقاعدة البيانات:', dbError)
        setError('فشل في الاتصال بقاعدة البيانات')
        setStreak(null)
      }
    } catch (err) {
      console.error('خطأ عام في جلب streak:', err)
      setError('خطأ غير متوقع')
      setStreak(null)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchStreak()

    // إعداد الاشتراك في الوقت الفعلي مع معالجة أفضل للأخطاء
    let subscription: ReturnType<typeof supabase.channel> | null = null
    
    const setupSubscription = async () => {
      try {
        subscription = supabase
          .channel(`streak-${projectId}`)
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'streaks', 
              filter: `project_id=eq.${projectId}` 
            },
            (payload) => {
              console.log('تحديث streak:', payload)
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                setStreak(payload.new as Streak)
              } else if (payload.eventType === 'DELETE') {
                setStreak(null)
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('تم الاشتراك في تحديثات streak بنجاح')
            } else if (status === 'CHANNEL_ERROR') {
              console.log('خطأ في الاشتراك في تحديثات streak')
            }
          })
      } catch (err) {
        console.log('تعذر إعداد اشتراك streak:', err)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (err) {
          console.error('خطأ في إلغاء اشتراك streak:', err)
        }
      }
    }
  }, [fetchStreak, projectId])

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-gray-400 animate-pulse">
        <Flame className="h-4 w-4" />
        <span className="text-sm">...</span>
      </div>
    )
  }

  // إذا كان هناك خطأ، اعرض رسالة مناسبة
  if (error) {
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <Flame className="h-4 w-4" />
        <span className="text-sm">{showText ? 'غير متاح حالياً' : '--'}</span>
      </div>
    )
  }

  // إذا لم يوجد streak أو كان 0
  if (!streak || streak.current_streak === 0) {
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <Flame className="h-4 w-4" />
        <span className="text-sm">{showText ? 'لا يوجد تقدم مستمر بعد' : '0'}</span>
      </div>
    )
  }

  // تحديد اللون حسب طول streak
  const getStreakColor = () => {
    if (streak.current_streak >= 30) return 'text-red-600'
    if (streak.current_streak >= 14) return 'text-orange-500'
    if (streak.current_streak >= 7) return 'text-yellow-500'
    return 'text-blue-500'
  }

  return (
    <div className={`flex items-center gap-1 ${getStreakColor()}`}>
      <Flame className="h-4 w-4" />
      <span className="text-sm font-medium">
        {streak.current_streak} {showText ? 'يوم متتالي' : ''}
      </span>
    </div>
  )
}

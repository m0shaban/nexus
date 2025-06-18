'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Project } from '@/types/database'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatabaseStatusCheck } from '@/components/DatabaseStatusCheck'
import { PlusCircle, Hourglass } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ProjectStreak } from '@/components/ProjectStreak'
import { EmptyProjects } from '@/components/EmptyProjects'
import { ConvertNoteModal } from '@/components/ConvertNoteModal'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const router = useRouter()
  // Memoize fetch function to prevent infinite loops
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)

      // التحقق من قاعدة البيانات أولاً
      try {
        const { error } = await supabase.from('projects').select('count', { count: 'exact', head: true })
          if (error) {
          console.log('قاعدة البيانات غير جاهزة:', error.message)
          // استخدام بيانات تجريبية
          setProjects([
            {
              id: '1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              name: 'مشروع تجريبي - تطبيق Nexus',
              description: 'مشروع لإنشاء نظام ذكي لتنظيم الأفكار وتحويلها إلى مشاريع',
              status: 'active',
              priority: 'high',
              user_id: 'demo-user',
              note_id: null,
              due_date: null,
              completed_at: null
            },
            {
              id: '2', 
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 86400000).toISOString(),
              name: 'إعداد قاعدة البيانات',
              description: 'تنفيذ سكريبتات SQL وربط Supabase بالتطبيق',
              status: 'active',
              priority: 'high',
              user_id: 'demo-user',
              note_id: null,
              due_date: null,
              completed_at: null
            }
          ])
          setLoading(false)
          return
        }
      } catch (dbError) {
        console.log('خطأ في الاتصال بقاعدة البيانات:', dbError)
        setProjects([])
        setLoading(false)
        return
      }

      // إذا كانت قاعدة البيانات متاحة، جلب البيانات الحقيقية
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setProjects(data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      // في حال فشل جلب البيانات، عرض رسالة واضحة
      alert('فشل في تحميل المشاريع. تأكد من إعداد قاعدة البيانات.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch projects
  useEffect(() => {
    fetchProjects()

    // Set up realtime subscription with better error handling
    let subscription: ReturnType<typeof supabase.channel> | null = null
    
    try {
      subscription = supabase
        .channel('projects-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'projects' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setProjects((prev) => [payload.new as Project, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setProjects((prev) =>
                prev.map((project) =>
                  project.id === payload.new.id ? (payload.new as Project) : project
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setProjects((prev) => prev.filter((project) => project.id !== payload.old.id))
            }
          }
        )
        .subscribe()
    } catch (err) {
      console.error('Error setting up projects subscription:', err)
    }

    return () => {
      // Unsubscribe from realtime subscription with better error handling
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (err) {
          console.error('Error unsubscribing from projects channel:', err)
        }
      }
    }
  }, [fetchProjects])

  const renderProjectStatus = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            نشط
          </span>
        )
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            مكتمل
          </span>
        )
      case 'abandoned':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            متروك
          </span>
        )
      default:
        return null
    }
  }

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            عاجل
          </span>
        )
      case 'high':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
            مرتفع
          </span>
        )
      case 'medium':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
            متوسط
          </span>
        )
      case 'low':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            منخفض
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Hourglass className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري تحميل المشاريع...</p>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return <EmptyProjects />
  }
  return (
    <div className="container mx-auto py-8">
      {/* Database Status Check */}
      <DatabaseStatusCheck />
      
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">المشاريع</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowConvertModal(true)}
          >
            تحويل ملاحظة إلى مشروع
          </Button>
          <Button
            onClick={() => router.push('/projects/new')}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>مشروع جديد</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle className="text-xl flex-1 truncate">
                  <Link href={`/projects/${project.id}`} className="hover:underline">
                    {project.name}
                  </Link>
                </CardTitle>
                {renderProjectStatus(project.status)}
              </div>
              <CardDescription className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(project.created_at), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </span>
                {renderPriorityBadge(project.priority)}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm line-clamp-3">
                {project.description || 'لا يوجد وصف للمشروع'}
              </p>
            </CardContent>

            <CardFooter className="border-t pt-4 flex justify-between">
              <ProjectStreak projectId={project.id} />
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/projects/${project.id}`}>
                  <span className="flex items-center gap-2">
                    عرض التفاصيل
                  </span>
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Convert Note Modal */}
      <ConvertNoteModal 
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
      />
    </div>
  )
}

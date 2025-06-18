'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Target, CheckCircle, Clock, AlertCircle, Edit, Trash2 } from 'lucide-react'
import { AddTaskForm } from '@/components/AddTaskForm'

interface Task {
  id: string
  content: string
  is_completed: boolean
  created_at: string
}

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'abandoned'
  created_at: string
  tasks: Task[]
}

export default function ProjectPage() {
  const { id } = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProject(id as string)
    }
  }, [id])

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`/api/projects/${projectId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('المشروع غير موجود')
        } else {
          const errorData = await response.json().catch(() => ({}))
          setError(errorData.error || 'خطأ في تحميل المشروع')
        }
        return
      }

      const data = await response.json()
      setProject(data)
    } catch (err) {
      console.error('Error fetching project:', err)
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (content: string) => {
    if (!project) return

    try {
      const response = await fetch(`/api/projects/${project.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })

      if (response.ok) {
        const newTask = await response.json()
        setProject(prev => prev ? {
          ...prev,
          tasks: [...prev.tasks, newTask]
        } : null)
        setShowAddTask(false)
      }
    } catch (err) {
      console.error('Error adding task:', err)
    }
  }

  const toggleTask = async (taskId: string) => {
    if (!project) return

    try {
      const task = project.tasks.find(t => t.id === taskId)
      if (!task) return

      const response = await fetch(`/api/projects/${project.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_completed: !task.is_completed })
      })

      if (response.ok) {
        setProject(prev => prev ? {
          ...prev,
          tasks: prev.tasks.map(t => 
            t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
          )
        } : null)
      }
    } catch (err) {
      console.error('Error updating task:', err)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!project) return

    try {
      const response = await fetch(`/api/projects/${project.id}/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProject(prev => prev ? {
          ...prev,
          tasks: prev.tasks.filter(t => t.id !== taskId)
        } : null)
      }
    } catch (err) {
      console.error('Error deleting task:', err)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      completed: 'secondary',
      abandoned: 'outline'
    } as const

    const labels = {
      active: 'نشط',
      completed: 'مكتمل',
      abandoned: 'متوقف'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Clock className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">جاري تحميل المشروع...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="text-center space-y-4 p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold">خطأ في التحميل</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button 
                onClick={() => router.push('/projects')}
                className="w-full"
              >
                العودة إلى المشاريع
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="text-center space-y-4 p-6">
              <Target className="h-12 w-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">المشروع غير موجود</h2>
              <p className="text-muted-foreground">لم يتم العثور على المشروع المطلوب</p>
              <Button 
                onClick={() => router.push('/projects')}
                className="w-full"
              >
                العودة إلى المشاريع
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const completedTasks = project.tasks.filter(task => task.is_completed).length
  const totalTasks = project.tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/projects')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة إلى المشاريع
        </Button>
      </div>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(project.status)}
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                تاريخ الإنشاء
              </div>
              <p className="font-medium">
                {new Date(project.created_at).toLocaleDateString('ar-EG')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                المهام
              </div>
              <p className="font-medium">{completedTasks} من {totalTasks}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                التقدم
              </div>
              <div className="space-y-1">
                <p className="font-medium">{Math.round(progress)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>المهام ({project.tasks.length})</CardTitle>
            <Button
              onClick={() => setShowAddTask(!showAddTask)}
              size="sm"
            >
              إضافة مهمة
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddTask && (
            <AddTaskForm
              onSubmit={handleAddTask}
              onCancel={() => setShowAddTask(false)}
            />
          )}

          {project.tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مهام في هذا المشروع بعد</p>
              <p className="text-sm">ابدأ بإضافة مهمة جديدة</p>
            </div>
          ) : (
            <div className="space-y-2">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => toggleTask(task.id)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className={`${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(task.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

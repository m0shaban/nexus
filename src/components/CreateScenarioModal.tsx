'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X, Plus } from 'lucide-react'

interface Project {
  id: string
  name: string
  status: string
}

interface CreateScenarioModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    projectId?: string
    title: string
    description: string
    assumptions: string[]
  }) => void
}

export function CreateScenarioModal({ isOpen, onClose, onSubmit }: CreateScenarioModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState<string>('')
  const [assumptions, setAssumptions] = useState<string[]>([])
  const [newAssumption, setNewAssumption] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchProjects()
    }
  }, [isOpen])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleAddAssumption = () => {
    if (newAssumption.trim() && !assumptions.includes(newAssumption.trim())) {
      setAssumptions(prev => [...prev, newAssumption.trim()])
      setNewAssumption('')
    }
  }

  const handleRemoveAssumption = (assumption: string) => {
    setAssumptions(prev => prev.filter(a => a !== assumption))
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: 'خطأ',
        description: 'العنوان والوصف مطلوبان',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        projectId: projectId || undefined,
        title: title.trim(),
        description: description.trim(),
        assumptions
      })
      
      // Reset form
      setTitle('')
      setDescription('')
      setProjectId('')
      setAssumptions([])
      setNewAssumption('')
    } catch (error) {
      console.error('Error submitting scenario:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setProjectId('')
    setAssumptions([])
    setNewAssumption('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إنشاء سيناريو جديد</DialogTitle>
          <DialogDescription>
            أنشئ سيناريو لتحليل المخاطر والفرص المحتملة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Project Selection */}
          <div>
            <label className="text-sm font-medium">المشروع (اختياري)</label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر مشروع أو اتركه فارغاً للسيناريو العام" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">سيناريو عام (غير مرتبط بمشروع)</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium">عنوان السيناريو</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: إطلاق منتج جديد في السوق"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">وصف السيناريو</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اشرح السيناريو بالتفصيل: ما هو الهدف، الخطة، الموارد المطلوبة..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          {/* Assumptions */}
          <div>
            <label className="text-sm font-medium">الافتراضات الأساسية</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newAssumption}
                onChange={(e) => setNewAssumption(e.target.value)}
                placeholder="أضف افتراض جديد"
                onKeyPress={(e) => e.key === 'Enter' && handleAddAssumption()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAssumption}
                disabled={!newAssumption.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {assumptions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {assumptions.map((assumption, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveAssumption(assumption)}
                  >
                    {assumption}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'جاري الإنشاء...' : 'إنشاء السيناريو'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

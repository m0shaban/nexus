'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ConvertNoteModal } from '@/components/ConvertNoteModal'

export default function NewProjectPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [submitting, setSubmitting] = useState(false)
  const [showNoteSelector, setShowNoteSelector] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المشروع",
        variant: "destructive"
      })
      return
    }
    
    setSubmitting(true)
    
    try {
      const newProject = {
        name: name.trim(),
        description: description.trim() || null,
        priority,
        status: 'active'
      }
      
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single()
        
      if (error) throw error
      
      // Create initial streak record
      await supabase.from('streaks').insert({
        project_id: data.id,
        current_streak: 0,
        longest_streak: 0
      })
      
      toast({
        title: "تم إنشاء المشروع بنجاح",
        variant: "default"
      })
      
      // Redirect to the project page
      router.push(`/projects/${data.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      toast({
        title: "فشل إنشاء المشروع",
        description: "حدث خطأ أثناء إنشاء المشروع. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Button variant="ghost" onClick={() => router.push('/projects')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        العودة إلى المشاريع
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">مشروع جديد</CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                اسم المشروع *
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسم المشروع"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                وصف المشروع
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصفًا مختصرًا للمشروع"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                الأولوية
              </label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">مرتفعة</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNoteSelector(true)}
                className="w-full"
              >
                تحويل ملاحظة إلى مشروع
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push('/projects')}
              disabled={submitting}
            >
              إلغاء
            </Button>
            
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء المشروع'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {showNoteSelector && (
        <ConvertNoteModal 
          isOpen={showNoteSelector}
          onClose={() => setShowNoteSelector(false)}
        />
      )}
    </div>
  )
}

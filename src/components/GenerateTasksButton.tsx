'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase'

interface GenerateTasksButtonProps {
  projectId: string
  noteId: string | null
}

export function GenerateTasksButton({ projectId, noteId }: GenerateTasksButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const generateTasks = async () => {
    if (loading) return
    
    setLoading(true)
    
    try {
      // Fetch project and note details if available
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      
      let noteContent = null
      
      if (noteId) {
        const { data: note } = await supabase
          .from('notes')
          .select('*')
          .eq('id', noteId)
          .single()
          
        if (note) {
          noteContent = note.content
        }
      }
      
      // Call the AI API to generate tasks
      const response = await fetch('/api/projects/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          projectName: project?.name,
          projectDescription: project?.description,
          noteContent
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate tasks')
      }
      
      const data = await response.json()
      
      if (data.tasks && data.tasks.length > 0) {
        // Insert the generated tasks
        const tasksToInsert = data.tasks.map((task: string, index: number) => ({
          project_id: projectId,
          content: task,
          is_completed: false,
          order_index: index
        }))
        
        const { error: insertError } = await supabase
          .from('tasks')
          .insert(tasksToInsert)
          
        if (insertError) throw insertError
        
        toast({
          title: "تم إنشاء المهام",
          description: `تم إنشاء ${tasksToInsert.length} مهام بنجاح.`,
        })
      } else {
        toast({
          title: "لم يتم إنشاء مهام",
          description: "لم نتمكن من إنشاء مهام. يرجى المحاولة مرة أخرى أو إضافة مهام يدوياً.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error generating tasks:', error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء المهام. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline"
      onClick={generateTasks}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          جارِ الإنشاء...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          إنشاء مهام
        </>
      )}
    </Button>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Note } from '@/types/database'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, FileText, ArrowRight, Sparkles, Target } from 'lucide-react'

interface ConvertNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onConversionComplete?: () => void
  preSelectedNote?: Note
}

export function ConvertNoteModal({ isOpen, onClose, onConversionComplete, preSelectedNote }: ConvertNoteModalProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [converting, setConverting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('created_at', { ascending: false })
          
        if (error) throw error
        
        setNotes(data || [])
      } catch (err) {
        console.error('Error fetching notes:', err)
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل الملاحظات',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (isOpen) {
      fetchNotes()
    }
  }, [isOpen, toast])

  // Handle pre-selected note
  useEffect(() => {    if (preSelectedNote && isOpen) {
      setSelectedNote(preSelectedNote)
    }
  }, [preSelectedNote, isOpen])

  const convertNoteToProject = async (note: Note) => {
    setConverting(true)
    
    try {
      // Get a project name from the first line of the note content or use a default name
      const projectName = note.content.split('\n')[0].slice(0, 50) || 'مشروع جديد'
      
      // Call the API to convert note to project and generate tasks
      const response = await fetch('/api/projects/convert-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId: note.id,
          projectName: projectName,
          projectDescription: note.content
        }),
      })
        if (!response.ok) {
        const errorText = await response.text()
        console.error('Convert note API error:', errorText)
        
        // محاولة استخراج تفاصيل الخطأ
        let errorMessage = 'فشل في تحويل الملاحظة إلى مشروع'
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.code === 'PROJECT_KEY_CONFLICT') {
            errorMessage = 'تعذر إنشاء المشروع. يرجى المحاولة مرة أخرى خلال بضع ثوانِ.'
          } else if (errorData.details) {
            errorMessage = errorData.details
          }
        } catch {
          // إذا فشل تحليل JSON، استخدم الرسالة الافتراضية
        }
        
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      
      if (!data.success || !data.project || !data.project.id) {
        throw new Error('بيانات المشروع غير صحيحة')
      }      toast({
        title: 'تم إنشاء المشروع',
        description: 'تم تحويل الملاحظة إلى مشروع بنجاح',
      })

      // Call the completion callback if provided
      if (onConversionComplete) {
        onConversionComplete()
      }

      // Redirect to the new project
      router.push(`/projects/${data.project.id}`)    } catch (error) {
      console.error('Error converting note to project:', error)
      const errorMessage = error instanceof Error ? error.message : 'فشل في تحويل الملاحظة إلى مشروع'
      
      toast({
        title: 'خطأ في التحويل',
        description: errorMessage,
        variant: 'destructive',
      })
    }finally {
      setConverting(false)
      onClose()
    }
  }
  
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
  }
  
  const filteredNotes = searchQuery
    ? notes.filter(note => 
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.ai_summary && note.ai_summary.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : notes
    
  return (    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">تحويل ملاحظة إلى مشروع</DialogTitle>
              <DialogDescription className="text-sm">
                اختر ملاحظة لتحويلها إلى مشروع جديد مع مهام منبثقة تلقائياً
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في ملاحظاتك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
          
          {/* Results Count */}
          {!loading && (
            <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
              <span>
                {filteredNotes.length} {filteredNotes.length === 1 ? 'ملاحظة' : 'ملاحظات'}
                {searchQuery && ` تطابق "${searchQuery}"`}
              </span>
              {selectedNote && (
                <div className="flex items-center gap-1 text-primary">
                  <Target className="h-3 w-3" />
                  <span className="text-xs">محددة</span>
                </div>
              )}
            </div>
          )}
          
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">جارٍ تحميل ملاحظاتك...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <div className="text-center space-y-1">
                <p className="font-medium">لا توجد ملاحظات مطابقة</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'لم يتم العثور على ملاحظات'}
                </p>
              </div>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`group relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md
                    ${note.id === selectedNote?.id 
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
                      : 'border-border hover:border-primary/50 hover:bg-accent/30'
                    }`}
                  onClick={() => handleSelectNote(note)}
                >
                  {/* Selection indicator */}
                  {note.id === selectedNote?.id && (
                    <div className="absolute top-3 right-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 mt-0.5">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm leading-relaxed line-clamp-1 group-hover:text-primary transition-colors">
                          {note.content.split('\n')[0] || 'ملاحظة بدون عنوان'}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                          {note.ai_summary || note.content.slice(0, 120) + (note.content.length > 120 ? '...' : '')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Preview of conversion */}
                    {note.id === selectedNote?.id && (
                      <div className="mt-3 pt-3 border-t border-primary/20">
                        <div className="flex items-center gap-2 text-xs text-primary/80">
                          <ArrowRight className="h-3 w-3" />
                          <span>سيتم إنشاء مشروع جديد مع مهام تلقائية</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-row gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={converting} className="flex-1">
            إلغاء
          </Button>
          <Button 
            onClick={() => selectedNote && convertNoteToProject(selectedNote)}
            disabled={!selectedNote || converting}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {converting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جارٍ التحويل...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                تحويل إلى مشروع
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

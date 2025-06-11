'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Note } from '@/types/database'
import { Card, CardContent, CardHeader } from './ui/card'
import { AnalyzeButton } from './AnalyzeButton'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { AlertCircle, Loader2, MessageSquare } from 'lucide-react'
import { ErrorState } from './ErrorState'

export function ClientNotesDisplay() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Function to fetch notes
    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        if (mounted) {
          setNotes(data || [])
          setError(null)
        }
      } catch (err) {
        console.error('Error fetching notes:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'خطأ في تحميل الملاحظات')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Initial fetch
    fetchNotes()

    console.log('[ClientNotesDisplay] Subscribing to notes_changes')

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('notes_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notes' 
        }, 
        (payload) => {
          console.log('Real-time update:', payload)
          
          if (payload.eventType === 'INSERT') {
            const newNote = payload.new as Note
            setNotes(current => [newNote, ...current])
          } else if (payload.eventType === 'UPDATE') {
            const updatedNote = payload.new as Note
            setNotes(current => 
              current.map(note => 
                note.id === updatedNote.id ? updatedNote : note
              )
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setNotes(current => current.filter(note => note.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري تحميل الملاحظات...</p>
        </div>
      </div>
    )
  }

  if (error) {
    // Check if it's a connection error
    if (error.includes('Invalid URL') || error.includes('Failed to fetch')) {
      return (
        <ErrorState 
          title="خطأ في الاتصال"
          message="تأكد من إعداد Supabase بشكل صحيح في ملف .env.local"
          showSetupGuide={true}
        />
      )
    }

    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">خطأ في تحميل البيانات</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">لا توجد ملاحظات بعد</h3>
        <p className="text-muted-foreground mb-4">
          أرسل أول رسالة لك عبر بوت تيليجرام لتظهر هنا فوراً
        </p>
        <div className="bg-muted p-4 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-muted-foreground">
            💡 نصيحة: يمكنك إرسال نصوص، صور، أو مستندات عبر البوت
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {notes.length} ملاحظة • آخر تحديث منذ لحظات
        </p>
      </div>

      <div className="grid gap-6">
        {notes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <span>
                      {formatDistanceToNow(new Date(note.created_at), { 
                        locale: ar, 
                        addSuffix: true 
                      })}
                    </span>
                    <span>•</span>
                    <span>{note.content_type}</span>
                  </div>
                </div>
                <AnalyzeButton noteId={note.id} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-foreground leading-relaxed">
                  {note.content}
                </p>

                {note.ai_summary && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">الملخص:</h4>
                    <p className="text-blue-800">{note.ai_summary}</p>
                  </div>
                )}

                {note.ai_questions && Array.isArray(note.ai_questions) && note.ai_questions.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-3">أسئلة للتفكير:</h4>
                    <ul className="space-y-2">
                      {note.ai_questions.map((question, index) => (
                        <li key={index} className="text-purple-800 flex items-start">
                          <span className="text-purple-600 ml-2">{index + 1}.</span>
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

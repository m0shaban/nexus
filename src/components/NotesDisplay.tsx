'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Note } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyzeButton } from '@/components/AnalyzeButton'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

export function NotesDisplay() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch initial notes
  useEffect(() => {
    fetchNotes()
  }, [])

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotes(prev => [payload.new as Note, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setNotes(prev => 
              prev.map(note => 
                note.id === payload.new.id ? payload.new as Note : note
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching notes:', error)
      } else {
        setNotes(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalysisComplete = (noteId: string, summary: string, questions: string[]) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === noteId
          ? { ...note, ai_summary: summary, ai_questions: questions, analysis_status: 'completed' }
          : note
      )
    )
  }

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'photo':
        return '📷'
      case 'document':
        return '📄'
      case 'voice':
        return '🎵'
      default:
        return '📝'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-muted-foreground">جاري تحميل الملاحظات...</div>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center text-muted-foreground">
          <div className="text-6xl mb-4">💭</div>
          <div>لا توجد ملاحظات بعد</div>
          <div className="text-sm mt-2">أرسل رسالة إلى البوت لبدء رحلتك في Nexus</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {notes.map((note) => (
        <Card key={note.id} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>{getContentTypeIcon(note.content_type)}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(note.created_at), { 
                    addSuffix: true, 
                    locale: ar 
                  })}
                </span>
              </CardTitle>
              <AnalyzeButton 
                noteId={note.id} 
                onAnalysisComplete={(summary, questions) => 
                  handleAnalysisComplete(note.id, summary, questions)
                }
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Original content */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="whitespace-pre-wrap">{note.content}</p>
            </div>

            {/* AI Analysis */}
            {note.analysis_status === 'analyzing' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                  جاري تحليل المحتوى...
                </div>
              </div>
            )}

            {note.analysis_status === 'completed' && note.ai_summary && (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">الملخص:</h4>
                  <p className="text-green-700">{note.ai_summary}</p>
                </div>

                {note.ai_questions && note.ai_questions.length > 0 && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-3">أسئلة للتفكير:</h4>
                    <ul className="space-y-2">
                      {note.ai_questions.map((question, index) => (
                        <li key={index} className="flex items-start gap-2 text-purple-700">
                          <span className="font-semibold text-purple-500">{index + 1}.</span>
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {note.analysis_status === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-700">
                  حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

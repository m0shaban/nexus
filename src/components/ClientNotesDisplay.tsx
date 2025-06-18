'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Note } from '@/types/database'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { ConvertNoteModal } from './ConvertNoteModal'
import { AnalyzeButton } from './AnalyzeButton'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Loader2, MessageSquare, ArrowRight, RefreshCw, WifiOff, FileText, Sparkles, Clock, Brain } from 'lucide-react'
import { ErrorState } from './ErrorState'

export function ClientNotesDisplay() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isConnected, setIsConnected] = useState(true)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [selectedNoteForConversion, setSelectedNoteForConversion] = useState<Note | null>(null)
  const { toast } = useToast()

  // Memoized fetch function to prevent dependency issues
  const fetchNotes = useCallback(async () => {
    try {
      console.log('[ClientNotesDisplay] Fetching notes...')
      setError(null)
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setNotes(data || [])
      setIsConnected(true)
      setRetryCount(0) // Reset retry count on success
      
    } catch (err) {
      console.error('Error fetching notes:', err)
      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل الملاحظات'
      setError(errorMessage)
      setIsConnected(false)
      
      // Show toast for error
      toast({
        title: 'خطأ في تحميل البيانات',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])  // Initial fetch and realtime subscription
  useEffect(() => {
    let mounted = true

    // Initial fetch using the memoized function
    fetchNotes()

    // Subscribe to real-time changes with enhanced error handling
    const channel = supabase
      .channel('notes_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notes' 
        }, 
        (payload) => {
          if (!mounted) return

          console.log('[ClientNotesDisplay] Real-time update:', payload)
          setIsConnected(true) // Mark as connected when receiving updates
          
          if (payload.eventType === 'INSERT') {
            const newNote = payload.new as Note
            setNotes(prev => [newNote, ...prev])
            toast({
              title: 'ملاحظة جديدة',
              description: 'تمت إضافة ملاحظة جديدة',
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedNote = payload.new as Note
            setNotes(prev => 
              prev.map(note => 
                note.id === updatedNote.id ? updatedNote : note
              )
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setNotes(prev => prev.filter(note => note.id !== deletedId))
            toast({
              title: 'تم حذف الملاحظة',
              description: 'تم حذف ملاحظة من القائمة',
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('[ClientNotesDisplay] Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false)
          toast({
            title: 'مشكلة في الاتصال',
            description: 'تم فقدان الاتصال بالخادم',
            variant: 'destructive',
          })
        }
      })

    // Cleanup function
    return () => {
      mounted = false
      channel.unsubscribe()
    }
  }, [fetchNotes, toast])  // Retry mechanism for failed requests
  const handleRetry = useCallback(async () => {
    setRetryCount(prev => prev + 1)
    setLoading(true)
    await fetchNotes()
  }, [fetchNotes])  // Enhanced project conversion with proper modal
  const convertNoteToProject = useCallback((note: Note) => {
    setSelectedNoteForConversion(note)
    setShowConvertModal(true)
  }, [])

  // Handle conversion completion
  const handleConversionComplete = useCallback(() => {
    setShowConvertModal(false)
    toast({
      title: 'تم إنشاء المشروع بنجاح! 🎉',
      description: 'تم تحويل الملاحظة إلى مشروع جديد',
    })
    // Optionally refresh the data
    fetchNotes()
  }, [toast, fetchNotes])

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
        <div className="flex items-center justify-center mb-4">
          <WifiOff className="w-12 h-12 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">خطأ في تحميل البيانات</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={handleRetry} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة {retryCount > 0 && `(${retryCount})`}
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            إعادة تحميل الصفحة
          </Button>
        </div>
        {!isConnected && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <WifiOff className="h-4 w-4" />
            غير متصل بالخادم
          </div>
        )}
      </div>
    )
  }
  if (notes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 mx-auto">
            <MessageSquare className="w-10 h-10 text-blue-600" />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold">لا توجد ملاحظات بعد</h3>
            <p className="text-muted-foreground text-lg">
              أرسل رسالة إلى البوت في تيليجرام لتظهر هنا فوراً
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-xl text-sm space-y-2">
            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <Sparkles className="h-4 w-4" />
              <span>نصيحة</span>
            </div>
            <p className="text-blue-600">
              ابدأ بإرسال فكرة أو ملاحظة بسيطة للبوت وشاهد كيف يحللها لك ويحولها إلى مشروع عملي
            </p>
          </div>
        </div>
      </div>
    )
  }  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-2xl border border-blue-100">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ملاحظاتك
          </h2>
          <p className="text-muted-foreground">
            {notes.length} {notes.length === 1 ? 'ملاحظة' : 'ملاحظات'} جاهزة للتحليل والتحويل
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-green-600 font-medium">متصل</span>
              </>
            ) : (
              <>
                <div className="flex h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-red-600 font-medium">غير متصل</span>
              </>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowConvertModal(true)}
            className="bg-white/80 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200"
          >
            <Sparkles className="ml-2 h-4 w-4" />
            تحويل إلى مشروع
          </Button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid gap-6">
        {notes.map((note) => (
          <Card key={note.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-slate-100/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(note.created_at), { 
                          locale: ar, 
                          addSuffix: true 
                        })}
                      </span>
                      <span>•</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {note.content_type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <AnalyzeButton noteId={note.id} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => convertNoteToProject(note)}
                    className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md"
                  >
                    <ArrowRight className="h-4 w-4" />
                    مشروع
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed text-base">
                  {note.content}
                </p>
              </div>

              {note.ai_summary && (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-5">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
                  <div className="relative space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">الملخص الذكي</h4>
                    </div>
                    <p className="text-blue-800 leading-relaxed">{note.ai_summary}</p>
                  </div>
                </div>
              )}

              {note.ai_questions && Array.isArray(note.ai_questions) && note.ai_questions.length > 0 && (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 p-5">
                  <div className="absolute top-0 left-0 w-16 h-16 bg-purple-200 rounded-full -translate-y-8 -translate-x-8 opacity-20"></div>
                  <div className="relative space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">أسئلة للتفكير</h4>
                    </div>
                    <ul className="space-y-3">
                      {note.ai_questions.map((question, index) => (
                        <li key={index} className="text-purple-800 flex items-start leading-relaxed">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-200 text-purple-700 text-xs font-bold ml-3 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Convert Note Modal */}
      <ConvertNoteModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onConversionComplete={handleConversionComplete}
        preSelectedNote={selectedNoteForConversion ?? undefined}
      />
    </div>
  )
}

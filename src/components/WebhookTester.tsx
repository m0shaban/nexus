'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Note {
  id: string
  content: string
  created_at: string
  status: 'processed' | 'processing' | 'error'
  response?: string
  error?: string
}

export function ProfessionalNoteTaker() {
  const [noteContent, setNoteContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [systemStatus, setSystemStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // Check system status on load
  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/check-supabase')
      const data = await response.json()
      setSystemStatus(data.success ? 'online' : 'offline')
    } catch {
      setSystemStatus('offline')
    }
  }

  // Generate timestamp for notes
  const generateTimestamp = () => {
    return new Date().toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Generate fake user data for processing
  const generateUserData = () => {
    return {
      message_id: Math.floor(Math.random() * 10000) + Date.now(),
      from: {
        id: 999999,
        is_bot: false,
        first_name: 'محمد شعبان',
        username: 'nexus_user'
      },
      chat: {
        id: 999999,
        type: 'private'
      },
      date: Math.floor(Date.now() / 1000),
      text: noteContent.trim()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim()) return
    
    const noteId = `note-${Date.now()}`
    const newNote: Note = {
      id: noteId,
      content: noteContent.trim(),
      created_at: generateTimestamp(),
      status: 'processing'
    }
    
    // Add note to list immediately
    setNotes(prev => [newNote, ...prev])
    setIsSending(true)
    
    try {
      // Send note for processing via webhook system
      const response = await fetch('/api/telegram-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Bot-Api-Secret-Token': process.env.NEXT_PUBLIC_TELEGRAM_WEBHOOK_SECRET || 'demo_webhook_secret'
        },
        body: JSON.stringify({
          message: generateUserData()
        })
      })
      
      const data = await response.json()
      
      // Update note status
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { 
              ...note, 
              status: response.ok ? 'processed' : 'error',
              response: data.success ? data.message : undefined,
              error: !response.ok ? (data.error || 'فشل في معالجة الملاحظة') : undefined
            }
          : note
      ))
      
    } catch (err) {
      console.error('Error processing note:', err)
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { 
              ...note, 
              status: 'error',
              error: err instanceof Error ? err.message : 'خطأ غير معروف'
            }
          : note
      ))
    } finally {
      setIsSending(false)
      setNoteContent('') // Clear the input
    }
  }

  const getStatusIcon = (status: Note['status']) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusBadge = (status: Note['status']) => {
    const variants = {
      processed: 'default',
      processing: 'secondary',
      error: 'destructive'
    } as const

    const labels = {
      processed: 'تمت المعالجة',
      processing: 'جاري المعالجة',
      error: 'خطأ'
    }

    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <FileText className="h-5 w-5" />
            أداة كتابة الملاحظات الاحترافية
          </CardTitle>
          <div className="flex items-center gap-2 text-right">
            <div className={`h-2 w-2 rounded-full ${
              systemStatus === 'online' ? 'bg-green-500' : 
              systemStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            <span className="text-sm text-muted-foreground">
              {systemStatus === 'online' ? 'النظام متصل' : 
               systemStatus === 'offline' ? 'النظام غير متصل' : 'جاري التحقق...'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="اكتب ملاحظتك هنا... سيتم معالجتها تلقائياً وحفظها في النظام"
                className="min-h-[120px] text-right"
                dir="rtl"
                disabled={isSending}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{noteContent.length} حرف</span>
                <span>سيتم معالجة الملاحظة تلقائياً عند الإرسال</span>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isSending || !noteContent.trim()} 
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ms-2">جاري المعالجة...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="ms-2">معالجة وحفظ الملاحظة</span>
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 text-right">💡 ميزات الأداة:</h4>
            <ul className="text-sm text-blue-800 space-y-1 text-right">
              <li>• معالجة تلقائية للملاحظات باستخدام النظام الذكي</li>
              <li>• حفظ فوري في قاعدة البيانات</li>
              <li>• تحويل الملاحظات إلى مشاريع ومهام</li>
              <li>• تكامل مع نظام التليجرام بوت</li>
              <li>• واجهة احترافية لإدارة الأفكار</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Notes History */}
      {notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-right">
              <Clock className="h-5 w-5" />
              سجل الملاحظات ({notes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(note.status)}
                    {getStatusBadge(note.status)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {note.created_at}
                  </span>
                </div>
                
                <div className="text-right">
                  <p className="text-sm mb-2 p-2 bg-gray-50 rounded">
                    {note.content}
                  </p>
                  
                  {note.response && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs font-medium text-green-800 mb-1">
                        استجابة النظام:
                      </p>
                      <p className="text-sm text-green-700">
                        {note.response}
                      </p>
                    </div>
                  )}
                  
                  {note.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-xs font-medium text-red-800 mb-1">
                        خطأ في المعالجة:
                      </p>
                      <p className="text-sm text-red-700">
                        {note.error}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">🔗 طرق الوصول للنظام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-right mb-2">📱 أداة الملاحظات (هذه الأداة)</h4>
              <ul className="text-sm text-muted-foreground space-y-1 text-right">
                <li>• واجهة ويب احترافية</li>
                <li>• معالجة فورية للملاحظات</li>
                <li>• سجل تفصيلي للأنشطة</li>
                <li>• تكامل كامل مع النظام</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-right mb-2">🤖 تليجرام بوت</h4>
              <ul className="text-sm text-muted-foreground space-y-1 text-right">
                <li>• وصول سريع من الهاتف</li>
                <li>• إرسال ملاحظات أثناء التنقل</li>
                <li>• نفس المعالجة الذكية</li>
                <li>• مزامنة تلقائية مع النظام</li>
              </ul>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 text-right">
              💡 <strong>نصيحة:</strong> يمكنك استخدام الطريقتين معاً - أداة الويب للملاحظات المفصلة والتليجرام للملاحظات السريعة
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
      
      // Send test message to webhook
      const response = await fetch('/api/telegram-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Bot-Api-Secret-Token': process.env.NEXT_PUBLIC_TELEGRAM_WEBHOOK_SECRET || 'demo_webhook_secret'
        },
        body: JSON.stringify({
          message: generateFakeMessage(message)
        })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test message')
      }
      
    } catch (err) {
      console.error('Error testing webhook:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="font-medium mb-3">اختبار Webhook</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="أدخل رسالة اختبار..."
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending} className="shrink-0">
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="ms-2">إرسال</span>
          </Button>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            <p className="font-medium mb-1">حدث خطأ:</p>
            <p>{error}</p>
          </div>
        )}
        
        {result && !error && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
            <p className="font-medium mb-1">تم الإرسال بنجاح:</p>
            <pre className="text-xs overflow-auto p-2 bg-white border rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>هذه الأداة تساعد في اختبار اتصال Webhook بدون الحاجة للإرسال من تيليجرام.</p>
        </div>
      </form>
    </div>
  )
}

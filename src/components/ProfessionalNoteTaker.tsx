'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProfessionalNoteTaker() {
  const [noteContent, setNoteContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteContent.trim()) return
    
    setIsSending(true)
    
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: noteContent.trim(),
          content_type: 'text'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Note created successfully:', result)
        setNoteContent('')
        
        // يمكن إضافة إشعار نجاح هنا
      } else {
        const error = await response.json()
        console.error('Failed to create note:', error)
        alert('فشل في حفظ الملاحظة: ' + (error.error || error.message || 'خطأ غير معروف'))
      }
      
    } catch (err) {
      console.error('Error processing note:', err)
      alert('خطأ في الشبكة أو الخادم')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-emerald-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50">
          <CardTitle className="flex items-center gap-3 text-right">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-md">
              <FileText className="h-5 w-5 text-white" />
            </div>
            أداة كتابة الملاحظات الذكية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 block text-right">
                اكتب ملاحظتك أو فكرتك
              </label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="مثال: أريد إنشاء مشروع لتطبيق الذكاء الاصطناعي لتحليل البيانات..."
                className="min-h-[140px] text-right border-2 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 resize-none"
                dir="rtl"
                disabled={isSending}
              />
              <div className="flex justify-between items-center text-sm">
                <span className={`${noteContent.length > 500 ? 'text-orange-600' : 'text-gray-500'}`}>
                  {noteContent.length} حرف
                </span>
                <span className="text-muted-foreground text-right">
                  سيتم معالجة وحفظ الملاحظة تلقائياً
                </span>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isSending || !noteContent.trim()} 
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="ms-3">جاري المعالجة والحفظ...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span className="ms-3">معالجة وحفظ الملاحظة</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

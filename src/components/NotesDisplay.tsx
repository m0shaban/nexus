'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Edit3, 
  Trash2, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Note {
  id: string
  created_at: string
  updated_at: string
  content: string
  content_type: string
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'error'
  ai_summary?: string
  ai_questions?: any
  user_id?: string
  raw_telegram_message?: any
}

export function NotesDisplay() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // جلب الملاحظات
  const fetchNotes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('limit', '100')
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      const response = await fetch(`/api/notes?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      } else {
        console.error('Failed to fetch notes:', await response.text())
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  // حذف ملاحظة
  const deleteNote = async (noteId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) return
    
    try {
      const response = await fetch(`/api/notes?id=${noteId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId))
      } else {
        console.error('Failed to delete note:', await response.text())
        alert('فشل في حذف الملاحظة')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('خطأ في حذف الملاحظة')
    }
  }

  // تحديث ملاحظة
  const updateNote = async (noteId: string, newContent: string) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: noteId,
          content: newContent
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotes(notes.map(note => 
          note.id === noteId ? data.note : note
        ))
        setEditingNote(null)
        setEditContent('')
      } else {
        console.error('Failed to update note:', await response.text())
        alert('فشل في تحديث الملاحظة')
      }
    } catch (error) {
      console.error('Error updating note:', error)
      alert('خطأ في تحديث الملاحظة')
    }
  }

  // التصفية والبحث
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || note.analysis_status === statusFilter
    return matchesSearch && matchesStatus
  })

  // الاستماع للتحديثات المباشرة
  useEffect(() => {
    fetchNotes()
    
    // الاشتراك في التحديثات المباشرة
    const channel = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes'
        },
        (payload) => {
          console.log('Real-time note update:', payload)
          fetchNotes() // إعادة جلب البيانات عند التحديث
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [statusFilter])

  // دالة للحصول على أيقونة الحالة
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'analyzing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  // دالة للحصول على نص الحالة
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة'
      case 'analyzing':
        return 'جاري التحليل'
      case 'error':
        return 'خطأ'
      default:
        return 'في الانتظار'
    }
  }

  // دالة تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* شريط البحث والتصفية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <FileText className="h-5 w-5 text-blue-600" />
            سجل الملاحظات المحفوظة
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotes}
              disabled={loading}
              className="mr-auto"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الملاحظات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-right"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="analyzing">جاري التحليل</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="error">خطأ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* عرض الملاحظات */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="mr-3 text-lg">جاري تحميل الملاحظات...</span>
        </div>
      ) : filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'لا توجد ملاحظات تطابق البحث' : 'لا توجد ملاحظات محفوظة'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'جرب تغيير معايير البحث أو التصفية'
                : 'ابدأ بكتابة ملاحظة جديدة أعلى الصفحة'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <div className="text-sm text-gray-600 text-right">
            عدد الملاحظات: {filteredNotes.length} من أصل {notes.length}
          </div>
          
          {filteredNotes.map((note) => (
            <Card key={note.id} className="border-r-4 border-r-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(note.analysis_status)}
                    <Badge 
                      variant={note.analysis_status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {getStatusText(note.analysis_status)}
                    </Badge>
                    {note.raw_telegram_message && (
                      <Badge variant="outline" className="text-xs">
                        تليجرام
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {formatDate(note.created_at)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingNote(note.id)
                        setEditContent(note.content)
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNote(note.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingNote === note.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[100px] text-right"
                      dir="rtl"
                    />
                    <div className="flex gap-2 justify-start">
                      <Button
                        size="sm"
                        onClick={() => updateNote(note.id, editContent)}
                        disabled={!editContent.trim()}
                      >
                        حفظ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingNote(null)
                          setEditContent('')
                        }}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-right">
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                    
                    {note.ai_summary && (
                      <div className="bg-blue-50 border-l-4 border-l-blue-500 p-4 text-right">
                        <h4 className="font-semibold text-blue-900 mb-2">
                          📝 ملخص الذكاء الاصطناعي:
                        </h4>
                        <p className="text-blue-800 leading-relaxed">
                          {note.ai_summary}
                        </p>
                      </div>
                    )}
                    
                    {note.ai_questions && Array.isArray(note.ai_questions) && note.ai_questions.length > 0 && (
                      <div className="bg-green-50 border-l-4 border-l-green-500 p-4 text-right">
                        <h4 className="font-semibold text-green-900 mb-2">
                          ❓ أسئلة مقترحة:
                        </h4>
                        <ul className="space-y-1 text-green-800">
                          {note.ai_questions.map((question: string, index: number) => (
                            <li key={index} className="leading-relaxed">
                              • {question}
                            </li>                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}    </div>
  )
}
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

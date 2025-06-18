'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { JournalEntry, JournalPrompt } from '@/types/database'
import { 
  Loader2, 
  Heart, 
  TrendingUp, 
  Calendar,
  Sparkles,
  BookOpen,
  Brain,
  Target,
  Users,
  Smile,
  BarChart3,
  Edit,
  Save,
  X
} from 'lucide-react'

interface Analytics {
  summary: {
    total_entries: number
    average_mood: number | null
    average_energy: number | null
    average_stress: number | null
    mood_trend: string
    consistency_score: number
  }
  recommendations: string[]
  patterns: {
    best_days: Array<{date: string, mood: number}>
    challenging_days: Array<{date: string, mood: number}>
    common_emotions: Array<{emotion: string, count: number}>
    recurring_themes: Array<{theme: string, count: number}>
  }
}

// Mock user ID - in real app this would come from auth
const MOCK_USER_ID = '550e8400-e29b-41d4-a716-446655440000'

export default function MirrorPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [prompts, setPrompts] = useState<JournalPrompt[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry>>({
    date: new Date().toISOString().split('T')[0],
    content: '',
    mood_rating: 5,
    energy_level: 5,
    stress_level: 5,
    tags: []
  })
  const [selectedPrompt, setSelectedPrompt] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [reflectionLoading, setReflectionLoading] = useState<string | null>(null)
  const { toast } = useToast()
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch journal entries
        const entriesResponse = await fetch(`/api/journal?user_id=${MOCK_USER_ID}&limit=30`)
        let entriesData: { journalEntries: JournalEntry[] } = { journalEntries: [] }
        
        if (entriesResponse.ok) {
          entriesData = await entriesResponse.json()
          setJournalEntries(entriesData.journalEntries || [])
        }

        // Fetch prompts
        const promptsResponse = await fetch(`/api/journal/prompts?user_id=${MOCK_USER_ID}`)
        if (promptsResponse.ok) {
          const promptsData = await promptsResponse.json()
          setPrompts(promptsData.prompts || [])
        }

        // Fetch analytics
        const analyticsResponse = await fetch(`/api/journal/analytics?user_id=${MOCK_USER_ID}&period=30`)
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAnalytics(analyticsData.analytics)
        }

        // Check if there's an entry for today
        const today = new Date().toISOString().split('T')[0]
        const todayEntry = entriesData.journalEntries?.find((entry: JournalEntry) => entry.date === today)
        if (todayEntry) {
          setCurrentEntry(todayEntry)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل البيانات',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleSaveEntry = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: MOCK_USER_ID,
          ...currentEntry
        }),
      })

      if (!response.ok) {
        throw new Error('فشل في حفظ المدخلة')
      }

      const result = await response.json()
      
      // Update the entries list
      setJournalEntries(prev => {
        const existing = prev.find(entry => entry.date === currentEntry.date)
        if (existing) {
          return prev.map(entry => 
            entry.date === currentEntry.date ? result.journalEntry : entry
          )
        } else {
          return [result.journalEntry, ...prev]
        }
      })

      setCurrentEntry(result.journalEntry)
      setIsEditing(false)
      
      toast({
        title: 'تم بنجاح',
        description: result.message,
      })

      // Refresh analytics
      const analyticsResponse = await fetch(`/api/journal/analytics?user_id=${MOCK_USER_ID}&period=30`)
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData.analytics)
      }

    } catch (error) {
      console.error('Error saving entry:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ المدخلة',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReflection = async (entryId: string) => {
    try {
      setReflectionLoading(entryId)
      
      const response = await fetch('/api/journal/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journal_entry_id: entryId,
          user_id: MOCK_USER_ID
        }),
      })

      if (!response.ok) {
        throw new Error('فشل في تحليل المدخلة')
      }

      const result = await response.json()
      
      // Update the entries list with AI reflection
      setJournalEntries(prev => 
        prev.map(entry => 
          entry.id === entryId ? result.journalEntry : entry
        )
      )

      toast({
        title: 'تم التحليل بنجاح',
        description: 'تم إنشاء التأمل الذكي',
      })

    } catch (error) {
      console.error('Error generating reflection:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في تحليل المدخلة',
        variant: 'destructive',
      })
    } finally {
      setReflectionLoading(null)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gratitude': return <Heart className="h-4 w-4" />
      case 'goals': return <Target className="h-4 w-4" />
      case 'emotions': return <Smile className="h-4 w-4" />
      case 'relationships': return <Users className="h-4 w-4" />
      case 'growth': return <TrendingUp className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getMoodColor = (mood: number | null) => {
    if (!mood) return 'bg-gray-100 text-gray-800'
    if (mood <= 3) return 'bg-red-100 text-red-800'
    if (mood <= 5) return 'bg-orange-100 text-orange-800'
    if (mood <= 7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">جاري تحميل المرآة...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">المرآة - The Mirror</h1>
            <p className="text-muted-foreground mt-2">
              لوحة قيادة الوعي الذاتي والنمو الشخصي
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0]
                setCurrentEntry({
                  date: today,
                  content: '',
                  mood_rating: 5,
                  energy_level: 5,
                  stress_level: 5,
                  tags: []
                })
                setIsEditing(true)
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              مدخلة جديدة
            </Button>
            <Button onClick={() => window.location.reload()}>
              <BarChart3 className="h-4 w-4 mr-2" />
              تحديث البيانات
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">إجمالي المدخلات</p>
                    <p className="text-2xl font-bold">{analytics.summary.total_entries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Smile className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">متوسط المزاج</p>
                    <p className="text-2xl font-bold">
                      {analytics.summary.average_mood ? `${analytics.summary.average_mood}/10` : '--'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">الاتجاه</p>
                    <p className="text-2xl font-bold">
                      {analytics.summary.mood_trend === 'improving' && '📈 تحسن'}
                      {analytics.summary.mood_trend === 'declining' && '📉 تراجع'}
                      {analytics.summary.mood_trend === 'stable' && '📊 مستقر'}
                      {analytics.summary.mood_trend === 'insufficient_data' && '📋 بيانات قليلة'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">انتظام الكتابة</p>
                    <p className="text-2xl font-bold">{analytics.summary.consistency_score}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Journal */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    مدخلة اليوم ({currentEntry.date})
                  </span>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={handleSaveEntry}>
                          <Save className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Journal Prompts */}
                {prompts.length > 0 && isEditing && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">أسئلة إرشادية:</label>
                    <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سؤالاً إرشادياً" />
                      </SelectTrigger>
                      <SelectContent>
                        {prompts.map((prompt) => (
                          <SelectItem key={prompt.id} value={prompt.question}>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(prompt.category)}
                              {prompt.question}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedPrompt && (
                      <p className="text-sm text-muted-foreground mt-2">
                        💡 {selectedPrompt}
                      </p>
                    )}
                  </div>
                )}

                {/* Content */}
                <div>
                  <label className="text-sm font-medium mb-2 block">كيف كان يومك؟</label>
                  <Textarea
                    value={currentEntry.content || ''}
                    onChange={(e) => setCurrentEntry(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="اكتب عن يومك، مشاعرك، أفكارك..."
                    className="min-h-[150px]"
                    disabled={!isEditing}
                  />
                </div>

                {/* Mood Ratings */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">المزاج (1-10)</label>
                    <Select 
                      value={currentEntry.mood_rating?.toString() || ''} 
                      onValueChange={(value) => setCurrentEntry(prev => ({ ...prev, mood_rating: parseInt(value) }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">الطاقة (1-10)</label>
                    <Select 
                      value={currentEntry.energy_level?.toString() || ''} 
                      onValueChange={(value) => setCurrentEntry(prev => ({ ...prev, energy_level: parseInt(value) }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">التوتر (1-10)</label>
                    <Select 
                      value={currentEntry.stress_level?.toString() || ''} 
                      onValueChange={(value) => setCurrentEntry(prev => ({ ...prev, stress_level: parseInt(value) }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* AI Reflection Button */}
                {currentEntry.id && currentEntry.content && !isEditing && (
                  <div className="pt-4">
                    <Button 
                      onClick={() => handleReflection(currentEntry.id!)}
                      disabled={reflectionLoading === currentEntry.id}
                      className="w-full"
                    >
                      {reflectionLoading === currentEntry.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      {currentEntry.ai_reflection ? 'تحديث التأمل الذكي' : 'إنشاء تأمل ذكي'}
                    </Button>
                  </div>
                )}

                {/* AI Reflection Display */}
                {currentEntry.ai_reflection && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        التأمل الذكي
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        {currentEntry.ai_reflection.split('\n').map((line, idx) => (
                          <p key={idx} className="mb-2">{line}</p>
                        ))}
                      </div>
                      
                      {currentEntry.ai_insights && currentEntry.ai_insights.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">رؤى أساسية:</h4>
                          <div className="flex flex-wrap gap-2">
                            {currentEntry.ai_insights.map((insight, idx) => (
                              <Badge key={idx} variant="secondary">{insight}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  المدخلات الأخيرة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {journalEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{entry.date}</span>
                      {entry.mood_rating && (
                        <Badge className={getMoodColor(entry.mood_rating)}>
                          {entry.mood_rating}/10
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.content.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommendations */}
            {analytics?.recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    توصيات النمو
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

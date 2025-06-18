'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { CreateScenarioModal } from '@/components/CreateScenarioModal'
import { ScenarioAnalysisCard } from '@/components/ScenarioAnalysisCard'
import { DatabaseStatusCheck } from '@/components/DatabaseStatusCheck'
import { Scenario } from '@/types/database'
import { Loader2, Eye, AlertTriangle, TrendingUp, TrendingDown, Target, RefreshCw } from 'lucide-react'

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { toast } = useToast()  // Move fetchScenarios inside useEffect to avoid dependency issues
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true)
        
        // التحقق من قاعدة البيانات أولاً باستخدام API
        const response = await fetch('/api/scenarios')
        if (!response.ok) {
          if (response.status === 500) {
            // في حال فشل قاعدة البيانات، استخدام بيانات تجريبية
            setScenarios([
              {
                id: '1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                title: 'سيناريو تجريبي - نجاح التطبيق',
                description: 'تحليل إمكانيات نجاح تطبيق Nexus مع المستخدمين',                assumptions: ['المستخدمون يحبون التنظيم', 'سهولة الاستخدام مهمة'],
                ai_best_case: null,
                ai_worst_case: null,
                ai_most_likely: null,
                ai_pre_mortem_result: null,
                confidence_score: null,
                risk_level: null,
                status: 'pending',
                user_id: 'demo-user',
                project_id: null
              },
              {
                id: '2', 
                created_at: new Date(Date.now() - 86400000).toISOString(),
                updated_at: new Date(Date.now() - 86400000).toISOString(),
                title: 'سيناريو المخاطر',
                description: 'تحليل المخاطر المحتملة في التطوير',                assumptions: ['قد تحدث مشاكل تقنية', 'قاعدة البيانات قد تتعطل'],
                ai_best_case: null,
                ai_worst_case: null,
                ai_most_likely: null,
                ai_pre_mortem_result: null,
                confidence_score: null,
                risk_level: null,
                status: 'pending',
                user_id: 'demo-user',
                project_id: null
              }
            ])
            setLoading(false)
            return
          }
          throw new Error('فشل في تحميل السيناريوهات')
        }
        
        const data = await response.json()
        setScenarios(data.scenarios || [])
      } catch (error) {
        console.error('Error fetching scenarios:', error)
        // في حال فشل الاتصال بالكامل
        setScenarios([])
        toast({
          title: 'خطأ',
          description: 'فشل في تحميل السيناريوهات. تأكد من إعداد قاعدة البيانات.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchScenarios()
  }, [toast])

  const handleCreateScenario = async (data: {
    projectId?: string
    title: string
    description: string
    assumptions: string[]
  }) => {
    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('فشل في إنشاء السيناريو')
      }

      const result = await response.json()
      setScenarios(prev => [result.scenario, ...prev])
      setShowCreateModal(false)
      
      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء السيناريو بنجاح',
      })
    } catch (error) {
      console.error('Error creating scenario:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء السيناريو',
        variant: 'destructive',
      })
    }
  }

  const getRiskLevelColor = (riskLevel: string | null) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Eye className="h-4 w-4" />
      case 'analyzing': return <Loader2 className="h-4 w-4 animate-spin" />
      case 'pending': return <Target className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">جاري تحميل السيناريوهات...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Database Status Check */}
        <DatabaseStatusCheck />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">العرّافة - The Oracle</h1>
            <p className="text-muted-foreground mt-2">
              صندوق رمل السيناريوهات وتحليل المخاطر
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setLoading(true)
                // Re-fetch scenarios
                const refetch = async () => {
                  try {
                    const response = await fetch('/api/scenarios')
                    if (response.ok) {
                      const data = await response.json()
                      setScenarios(data.scenarios || [])
                    }
                  } finally {
                    setLoading(false)
                  }
                }
                refetch()
              }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              تحديث
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="gap-2"
            >
              <Target className="h-4 w-4" />
              سيناريو جديد
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">إجمالي السيناريوهات</p>
                  <p className="text-2xl font-bold">{scenarios.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">مخاطر منخفضة</p>
                  <p className="text-2xl font-bold">
                    {scenarios.filter(s => s.risk_level === 'low').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">مخاطر عالية</p>
                  <p className="text-2xl font-bold">
                    {scenarios.filter(s => s.risk_level === 'high' || s.risk_level === 'critical').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">تحليلات مكتملة</p>
                  <p className="text-2xl font-bold">
                    {scenarios.filter(s => s.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scenarios List */}
        {scenarios.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد سيناريوهات بعد</h3>
              <p className="text-muted-foreground mb-4">
                ابدأ بإنشاء سيناريو جديد لتحليل المخاطر والفرص
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                إنشاء أول سيناريو
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{scenario.title}</CardTitle>
                      <p className="text-muted-foreground mt-1">{scenario.description}</p>
                      {scenario.assumptions && scenario.assumptions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-muted-foreground">الافتراضات:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {scenario.assumptions.map((assumption, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {assumption}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(scenario.status)}
                      {scenario.risk_level && (
                        <Badge className={getRiskLevelColor(scenario.risk_level)}>
                          {scenario.risk_level === 'low' && 'منخفض'}
                          {scenario.risk_level === 'medium' && 'متوسط'}
                          {scenario.risk_level === 'high' && 'عالي'}
                          {scenario.risk_level === 'critical' && 'حرج'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>                {scenario.status === 'completed' && (
                  <ScenarioAnalysisCard 
                    scenario={scenario} 
                    onRefresh={() => {
                      // Refresh scenarios after analysis update
                      setLoading(true)
                      // Re-fetch scenarios
                      const refetch = async () => {
                        try {
                          const response = await fetch('/api/scenarios')
                          if (response.ok) {
                            const data = await response.json()
                            setScenarios(data.scenarios || [])
                          }
                        } finally {
                          setLoading(false)
                        }
                      }
                      refetch()
                    }}
                  />
                )}
              </Card>
            ))}
          </div>
        )}        {/* Create Scenario Modal */}
        <CreateScenarioModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateScenario}
        />
      </div>
    </div>
  )
}

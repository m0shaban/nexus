'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Scenario } from '@/types/database'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  Brain,
  ArrowRight,
  Loader2 
} from 'lucide-react'

interface ScenarioAnalysisCardProps {
  scenario: Scenario
  onRefresh: () => void
}

export function ScenarioAnalysisCard({ scenario, onRefresh }: ScenarioAnalysisCardProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [convertingRisks, setConvertingRisks] = useState(false)
  const [selectedRisks, setSelectedRisks] = useState<string[]>([])
  const { toast } = useToast()

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const response = await fetch('/api/scenarios/pre-mortem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },        body: JSON.stringify({
          projectId: scenario.project_id,
          scenarioTitle: scenario.title,
          scenarioDescription: scenario.description,
          assumptions: scenario.assumptions
        }),
      })

      if (!response.ok) {
        throw new Error('فشل في إجراء التحليل')
      }

      await response.json()
      toast({
        title: 'تم التحليل بنجاح! 🔮',
        description: 'تم إجراء تحليل Pre-Mortem وتحديد المخاطر',
      })
      
      onRefresh()
    } catch (error) {
      console.error('Analysis error:', error)
      toast({
        title: 'خطأ في التحليل',
        description: 'حدث خطأ أثناء إجراء التحليل',
        variant: 'destructive',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleConvertRisks = async () => {
    if (selectedRisks.length === 0) {
      toast({
        title: 'تحديد المخاطر',
        description: 'يرجى تحديد المخاطر التي تريد تحويلها إلى مهام',
        variant: 'destructive',
      })
      return
    }

    setConvertingRisks(true)
    try {
      const response = await fetch('/api/scenarios/convert-risks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId: scenario.id,
          selectedRisks
        }),
      })

      if (!response.ok) {
        throw new Error('فشل في تحويل المخاطر')
      }

      const data = await response.json()
      toast({
        title: 'تم التحويل بنجاح! ✅',
        description: data.message,
      })
      
      setSelectedRisks([])
    } catch (error) {
      console.error('Convert risks error:', error)
      toast({
        title: 'خطأ في التحويل',
        description: 'حدث خطأ أثناء تحويل المخاطر إلى مهام',
        variant: 'destructive',
      })
    } finally {
      setConvertingRisks(false)
    }
  }

  const handleRiskSelection = (risk: string, checked: boolean) => {
    if (checked) {
      setSelectedRisks(prev => [...prev, risk])
    } else {
      setSelectedRisks(prev => prev.filter(r => r !== risk))
    }
  }

  // If scenario is not analyzed yet
  if (scenario.status !== 'completed') {
    return (
      <div className="text-center py-6">
        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">جاهز للتحليل</h3>
        <p className="text-muted-foreground mb-4">
          أجرِ تحليل Pre-Mortem لاستكشاف السيناريوهات المحتملة
        </p>
        <Button onClick={handleAnalyze} disabled={analyzing} className="gap-2">
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري التحليل...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              تحليل السيناريو
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analysis Results */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Best Case */}
        {scenario.ai_best_case && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-900">أفضل نتيجة</h4>
            </div>
            <p className="text-green-800 text-sm">{scenario.ai_best_case}</p>
          </div>
        )}

        {/* Most Likely */}
        {scenario.ai_most_likely && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">النتيجة المتوقعة</h4>
            </div>
            <p className="text-blue-800 text-sm">{scenario.ai_most_likely}</p>
          </div>
        )}

        {/* Worst Case */}
        {scenario.ai_worst_case && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-red-900">أسوأ نتيجة</h4>
            </div>
            <p className="text-red-800 text-sm">{scenario.ai_worst_case}</p>
          </div>
        )}
      </div>

      {/* Confidence and Risk Level */}
      <div className="flex items-center gap-4">
        {scenario.confidence_score && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">مستوى الثقة:</span>
            <Badge variant="outline">
              {scenario.confidence_score}/10
            </Badge>
          </div>
        )}
        
        {scenario.risk_level && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">مستوى المخاطر:</span>
            <Badge className={
              scenario.risk_level === 'low' ? 'bg-green-100 text-green-800' :
              scenario.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              scenario.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }>
              {scenario.risk_level === 'low' && 'منخفض'}
              {scenario.risk_level === 'medium' && 'متوسط'}
              {scenario.risk_level === 'high' && 'عالي'}
              {scenario.risk_level === 'critical' && 'حرج'}
            </Badge>
          </div>
        )}
      </div>

      {/* Pre-Mortem Risks */}
      {scenario.ai_pre_mortem_result && scenario.ai_pre_mortem_result.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h4 className="font-semibold text-orange-900">تحليل Pre-Mortem - أسباب الفشل المحتملة</h4>
            </div>
            {scenario.project_id && selectedRisks.length > 0 && (
              <Button
                size="sm"
                onClick={handleConvertRisks}
                disabled={convertingRisks}
                className="gap-2"
              >
                {convertingRisks ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري التحويل...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    تحويل إلى مهام
                  </>
                )}
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {scenario.ai_pre_mortem_result.map((risk, index) => (
              <div key={index} className="flex items-start gap-3">
                {scenario.project_id && (
                  <Checkbox
                    checked={selectedRisks.includes(risk)}
                    onCheckedChange={(checked) => handleRiskSelection(risk, checked as boolean)}
                    className="mt-1"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 font-medium text-sm">
                      {index + 1}.
                    </span>
                    <p className="text-orange-800 text-sm">{risk}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {scenario.project_id && (
            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <p className="text-xs text-orange-700">
                💡 تلميح: يمكنك تحديد المخاطر وتحويلها إلى مهام في المشروع لمعالجتها مسبقاً
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

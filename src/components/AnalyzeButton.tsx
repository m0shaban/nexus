'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Brain } from 'lucide-react'

interface AnalyzeButtonProps {
  noteId: string
  onAnalysisComplete?: (summary: string, questions: string[]) => void
}

export function AnalyzeButton({ noteId, onAnalysisComplete }: AnalyzeButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noteId }),
      })

      if (!response.ok) {
        throw new Error('فشل في التحليل')
      }

      const data = await response.json()
      
      if (onAnalysisComplete) {
        onAnalysisComplete(data.summary, data.questions)
      }

      toast({
        title: 'تم التحليل بنجاح! ✨',
        description: 'تم تحليل الملاحظة وإنشاء الملخص والأسئلة',
      })
      
    } catch (error) {
      console.error('Analysis error:', error)
      toast({
        title: 'خطأ في التحليل',
        description: 'حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Button
      onClick={handleAnalyze}
      disabled={isAnalyzing}
      size="sm"
      variant="outline"
      className="gap-2"
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          جاري التحليل...
        </>
      ) : (
        <>
          <Brain className="h-4 w-4" />
          تحليل
        </>
      )}
    </Button>
  )
}

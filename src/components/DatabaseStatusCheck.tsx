'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Database, ExternalLink, CheckCircle } from 'lucide-react'

export function DatabaseStatusCheck() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'not-setup'>('checking')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const checkDatabase = async () => {
      try {
        const response = await fetch('/api/notes?limit=1')
        if (response.ok) {
          setDbStatus('connected')
        } else {
          setDbStatus('not-setup')
        }
      } catch {
        setDbStatus('not-setup')
      }
    }

    checkDatabase()
  }, [isMounted])

  if (!isMounted) {
    return null
  }

  if (dbStatus === 'checking') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-blue-600 animate-pulse" />
            <span className="text-blue-800">جاري فحص قاعدة البيانات...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (dbStatus === 'connected') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">قاعدة البيانات متصلة وجاهزة</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          قاعدة البيانات غير مُعدة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-orange-700">
          يجب إعداد قاعدة البيانات في Supabase أولاً لتعمل جميع ميزات التطبيق.
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            افتح Supabase SQL Editor
          </div>
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            شغّل ملف db/00-master-setup.sql
          </div>
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            أعد تحميل الصفحة
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://supabase.com/dashboard/project/mtsgkpgbdzgqrcqitayq/sql', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            افتح Supabase
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            إعادة فحص
          </Button>
        </div>

        <div className="bg-orange-100 rounded-lg p-3 mt-4">
          <p className="text-xs text-orange-600">
            💡 <strong>نصيحة:</strong> يمكنك تصفح التطبيق مع البيانات التجريبية، لكن لن تتمكن من حفظ أي تغييرات.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

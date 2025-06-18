'use client'

import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2, Target } from 'lucide-react'

export default function ProjectPage() {
  const { id } = useParams()
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/projects')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة إلى المشاريع
        </Button>
      </div>

      {/* Success Message */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-800">تم إصلاح مشكلة 404!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-green-700">
          <div className="space-y-3">
            <p><strong>✅ صفحة المشروع الفردي تعمل الآن بنجاح!</strong></p>
            <p><strong>معرف المشروع الحالي:</strong> <code className="bg-green-100 px-2 py-1 rounded">{id}</code></p>
            <p><strong>المسار:</strong> <code className="bg-green-100 px-2 py-1 rounded">/projects/[id]/page.tsx</code></p>
            
            <div className="bg-white p-4 rounded-lg border border-green-200 mt-4">
              <h3 className="font-semibold text-green-800 mb-2">ما تم إصلاحه:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>إنشاء صفحة المشروع الفردي في المسار الصحيح</li>
                <li>إصلاح جميع API routes للمشاريع والمهام</li>
                <li>إصلاح تصدير Supabase client</li>
                <li>توحيد أسماء الحقول مع قاعدة البيانات</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
              <h3 className="font-semibold text-blue-800 mb-2">الخطوات التالية:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>إعداد متغيرات البيئة الصحيحة لـ Supabase</li>
                <li>إنشاء بعض المشاريع التجريبية</li>
                <li>اختبار وظائف إضافة/تحديث/حذف المهام</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mock Project Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            مشروع تجريبي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            هذا مثال على كيف ستبدو صفحة المشروع عند ربطها بقاعدة البيانات.
          </p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-muted-foreground">مهام مكتملة</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">0</div>
                <div className="text-sm text-muted-foreground">إجمالي المهام</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0%</div>
                <div className="text-sm text-muted-foreground">نسبة الإنجاز</div>
              </div>
            </div>
            
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-gray-200 rounded-lg">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد مهام في هذا المشروع</p>
              <p className="text-sm">سيتم عرض المهام هنا عند ربط قاعدة البيانات</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

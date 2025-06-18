'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TestProjectIdPage() {
  const { id } = useParams()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة إلى المشاريع
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>صفحة المشروع الفردي تعمل!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>✅ تم العثور على صفحة المشروع الفردي بنجاح!</p>
            <p><strong>معرف المشروع:</strong> {id}</p>
            <p><strong>المسار:</strong> /projects/[id]/page.tsx</p>
            <p>هذا يعني أن مشكلة 404 قد تم حلها والصفحة تعمل الآن.</p>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800">المشكلة محلولة!</h3>
              <p className="text-green-700 mt-2">
                الآن يمكنك الانتقال إلى أي مشروع عبر الرابط /projects/[id] وستظهر هذه الصفحة.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

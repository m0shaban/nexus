import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

export function EmptyProjects() {
  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-6 text-6xl">🚀</div>
        <h2 className="text-2xl font-bold mb-2">لا توجد مشاريع بعد</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          ابدأ بإنشاء مشروعك الأول وحوّل أفكارك إلى خطوات عملية
        </p>
        
        <Button asChild>
          <Link href="/projects/new" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            إنشاء مشروع جديد
          </Link>
        </Button>
        
        <p className="text-sm text-muted-foreground mt-8">
          يمكنك أيضًا تحويل ملاحظاتك الموجودة إلى مشاريع
        </p>
      </div>
    </div>
  )
}

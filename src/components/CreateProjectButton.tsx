import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

export function CreateProjectButton() {
  return (
    <Button asChild>
      <Link href="/projects/new" className="flex items-center gap-2">
        <PlusCircle className="h-4 w-4" />
        <span>مشروع جديد</span>
      </Link>
    </Button>
  )
}

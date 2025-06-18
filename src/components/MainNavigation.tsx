'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckSquare, Home, Eye, User, Sparkles, FileText } from 'lucide-react'

export function MainNavigation() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }
    return (
    <nav className="flex items-center gap-2 overflow-auto py-3 px-4 sm:px-6 md:px-8 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
      <Link href="/" className="mr-6 flex items-center gap-2 text-xl font-bold group">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-200">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Nexus
        </span>
      </Link>
      
      <div className="flex gap-1 sm:gap-2">
        <Button
          variant={isActive('/') ? "default" : "ghost"}
          size="sm"
          asChild
          className={`flex items-center gap-2 transition-all duration-200 ${
            isActive('/') 
              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md" 
              : "hover:bg-accent/50 hover:text-accent-foreground"
          }`}
        >
          <Link href="/">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">الرئيسية</span>
          </Link>
        </Button>
          <Button
          variant={isActive('/projects') ? "default" : "ghost"}
          size="sm"
          asChild
          className={`flex items-center gap-2 transition-all duration-200 ${
            isActive('/projects') 
              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md" 
              : "hover:bg-accent/50 hover:text-accent-foreground"
          }`}
        >
          <Link href="/projects">
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">المشاريع</span>
          </Link>
        </Button>
        
        <Button
          variant={isActive('/notes') ? "default" : "ghost"}
          size="sm"
          asChild
          className={`flex items-center gap-2 transition-all duration-200 ${
            isActive('/notes') 
              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md" 
              : "hover:bg-accent/50 hover:text-accent-foreground"
          }`}
        >
          <Link href="/notes">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">الملاحظات</span>
          </Link>
        </Button>
        
        <Button
          variant={isActive('/scenarios') ? "default" : "ghost"}
          size="sm"
          asChild
          className={`flex items-center gap-2 transition-all duration-200 ${
            isActive('/scenarios') 
              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md" 
              : "hover:bg-accent/50 hover:text-accent-foreground"
          }`}
        >
          <Link href="/scenarios">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">العرّافة</span>
          </Link>
        </Button>

        <Button
          variant={isActive('/mirror') ? "default" : "ghost"}
          size="sm"
          asChild
          className={`flex items-center gap-2 transition-all duration-200 ${
            isActive('/mirror') 
              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md" 
              : "hover:bg-accent/50 hover:text-accent-foreground"
          }`}
        >
          <Link href="/mirror">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">المرآة</span>
          </Link>
        </Button>
      </div>
      
      <div className="flex-1"></div>
      
      <Button
        size="sm"
        asChild
        className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 transition-all duration-200"
      >
        {/* زر GitHub تم حذفه بناءً على طلب المستخدم */}
      </Button>
    </nav>
  )
}

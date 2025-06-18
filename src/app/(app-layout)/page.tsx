'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConvertNoteModal } from '@/components/ConvertNoteModal'
import { ClientNotesDisplay } from '@/components/ClientNotesDisplay'
import { ProfessionalNoteTaker } from '@/components/ProfessionalNoteTaker'
import { ErrorState } from '@/components/ErrorState'
import { LogosChat } from '@/components/LogosChat'
import { useLogosChat } from '@/hooks/useLogosChat'
import { ArrowRight, Lightbulb, CheckCircle2, FileText, Zap, Target } from 'lucide-react'

function checkEnvironmentConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || supabaseUrl === 'https://demo-project.supabase.co') {
    return {
      isValid: false,
      title: 'إعداد مطلوب',
      message: 'يجب إعداد Supabase قبل استخدام التطبيق. يرجى إضافة URL و API Key في ملف .env.local',
      showSetupGuide: true,
    }
  }
  if (!supabaseKey || supabaseKey === 'demo_anon_key_for_testing') {
    return {
      isValid: false,
      title: 'مفتاح API مفقود',
      message: 'يرجى إضافة NEXT_PUBLIC_SUPABASE_ANON_KEY في ملف .env.local',
      showSetupGuide: true,
    }
  }
  return { isValid: true }
}

export default function Home() {
  const envCheck = checkEnvironmentConfig()
  const [showConvert, setShowConvert] = useState(false)
  const { isChatOpen, isMinimized, toggleChat } = useLogosChat()

  if (!envCheck.isValid) {
    return (
      <ErrorState
        title={envCheck.title!}
        message={envCheck.message!}
        showSetupGuide={envCheck.showSetupGuide}
      />
    )
  }
  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-3xl -z-10 opacity-60"></div>
        <div className="relative py-16 px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-6">
            <Zap className="h-4 w-4" />
            أطلق إمكاناتك
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Nexus
            </span>
            <span className="block text-2xl md:text-3xl text-muted-foreground font-normal mt-2">
              المحفز
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            حوِّل الفوضى إلى فهم، والفهم إلى تأثير
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-6">
              <Link href="/projects">
                <Target className="ml-2 h-5 w-5" />
                استكشف المشاريع
                <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => setShowConvert(true)} className="text-lg px-8 py-6 border-2 hover:bg-primary/5">
              <Lightbulb className="ml-2 h-5 w-5" />
              تحويل ملاحظة إلى مشروع
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            ميزات المحفز
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            أدوات ذكية لتحويل أفكارك إلى إنجازات حقيقية
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">تحويل الملاحظات إلى مشاريع</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-muted-foreground leading-relaxed">
                استخدم ملاحظاتك الموجودة كنقطة انطلاق وحولها إلى خطوات عملية قابلة للتنفيذ.
              </p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">متابعة التقدم</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-muted-foreground leading-relaxed">
                تتبع المهام والاستمرارية اليومية مع إحصائيات مفصلة لتحقيق أهدافك.
              </p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">توليد مهام ذكي</CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-muted-foreground leading-relaxed">
                استخدم الذكاء الاصطناعي لإنشاء قائمة مهام منطقية ومرتبة حسب الأولوية لمشروعك.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats or Additional Features */}
      <section className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-3xl p-8 md:p-12">
        <div className="text-center space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold">اجعل كل يوم أكثر إنتاجية</h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            مع Nexus، تحويل الأفكار إلى مشاريع عملية أصبح أسهل من أي وقت مضى. ابدأ رحلتك نحو الإنتاجية والإنجاز.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">مشاريع لا محدودة</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">AI</div>
              <div className="text-sm text-muted-foreground">ذكاء اصطناعي</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">متاح دائماً</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">🚀</div>
              <div className="text-sm text-muted-foreground">إنطلاق سريع</div>
            </div>
          </div>
        </div>
      </section>      <section className="space-y-6">
        <ProfessionalNoteTaker />
        <ClientNotesDisplay />
      </section>      <ConvertNoteModal isOpen={showConvert} onClose={() => setShowConvert(false)} />
      
      {/* Logos AI Chat */}
      {isChatOpen && (
        <LogosChat 
          isMinimized={isMinimized}
          onToggleMinimize={toggleChat}
          userId="demo-user"
        />
      )}
      
      {/* Chat Toggle Button */}
      {!isChatOpen && (
        <LogosChat 
          isMinimized={true}
          onToggleMinimize={toggleChat}
          userId="demo-user"
        />
      )}
    </div>
  )
}

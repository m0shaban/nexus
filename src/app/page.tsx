import { ClientNotesDisplay } from '@/components/ClientNotesDisplay'
import { ErrorState } from '@/components/ErrorState'

// Check if environment variables are configured
function checkEnvironmentConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || supabaseUrl === 'https://demo-project.supabase.co') {
    return {
      isValid: false,
      title: 'إعداد مطلوب',
      message: 'يجب إعداد Supabase قبل استخدام التطبيق. يرجى إضافة URL و API Key في ملف .env.local',
      showSetupGuide: true
    }
  }
  
  if (!supabaseKey || supabaseKey === 'demo_anon_key_for_testing') {
    return {
      isValid: false,
      title: 'مفتاح API مفقود',
      message: 'يرجى إضافة NEXT_PUBLIC_SUPABASE_ANON_KEY في ملف .env.local',
      showSetupGuide: true
    }
  }
  
  return { isValid: true }
}

export default function Home() {
  const envCheck = checkEnvironmentConfig()
  
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nexus
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                حوِّل الفوضى إلى فهم، والفهم إلى تأثير
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                The Synapse • المشبك العصبي
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">ملاحظاتك المباشرة</h2>
            <p className="text-muted-foreground">
              جميع الملاحظات المرسلة من تيليجرام تظهر هنا فوراً
            </p>
          </div>
          
          <ClientNotesDisplay />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Nexus MVP - الإصدار التجريبي الأول | 
            مدعوم بـ Next.js، Supabase، و NVIDIA AI
          </p>
        </div>
      </footer>
    </div>
  )
}

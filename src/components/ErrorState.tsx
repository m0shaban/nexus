import { AlertCircle, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title: string
  message: string
  showSetupGuide?: boolean
}

export function ErrorState({ title, message, showSetupGuide = false }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-center">
            {message}
          </CardDescription>
        </CardHeader>
        {showSetupGuide && (
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-sm">
              <h4 className="font-semibold mb-2">خطوات الإعداد:</h4>
              <ol className="space-y-1 text-muted-foreground">
                <li>1. أنشئ حساباً في Supabase</li>
                <li>2. أنشئ مشروعاً جديداً</li>
                <li>3. احصل على URL و API Keys</li>
                <li>4. أضفها إلى ملف .env.local</li>
              </ol>
            </div>
            <Button 
              className="w-full" 
              onClick={() => window.open('https://supabase.com', '_blank')}
            >
              <Settings className="w-4 h-4 mr-2" />
              افتح Supabase
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

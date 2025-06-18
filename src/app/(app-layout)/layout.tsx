'use client'

import { MainNavigation } from '@/components/MainNavigation'
import { LogosFloatingChat } from '@/components/LogosFloatingChat'
import { Toaster } from '@/components/ui/toaster'
import { ToastProvider } from '@/components/ui/use-toast'
import { AppWrapper } from '@/components/AppWrapper'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AppWrapper>
      <ToastProvider>
        <div className="min-h-screen flex flex-col">
          <MainNavigation />
          <main className="flex-grow">
            {children}
          </main>
          {/* The Logos AI - Always available floating chatbot */}
          <LogosFloatingChat />
        </div>
        <Toaster />
      </ToastProvider>
    </AppWrapper>
  )
}

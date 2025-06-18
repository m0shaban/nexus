'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { AdvancedLogosIcon } from '@/components/AdvancedLogosIcon'
import { Bot, Send, MessageCircle, User, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  metadata?: {
    mock?: boolean
    setup_needed?: boolean
    fallback?: boolean
    nvidia_api?: boolean
    [key: string]: unknown
  }
}

interface LogosChatProps {
  isMinimized?: boolean
  onToggleMinimize?: () => void
  userId?: string
}

export function LogosChat({ isMinimized = false, onToggleMinimize, userId = '12345678-1234-1234-1234-123456789012' }: LogosChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: `مرحباً! أنا اللوغوس 🤖

أنا مساعدك الذكي المتخصص في:
🎯 **التحليل الاستراتيجي** للأفكار والمشاريع
🧠 **تحدي الافتراضات** وطرح أسئلة عميقة
📊 **تحويل الأفكار** إلى خطط قابلة للتنفيذ
⚡ **تقديم نصائح استراتيجية** مخصصة لك

كيف يمكنني مساعدتك اليوم؟`,
        created_at: new Date().toISOString(),
        metadata: { welcome: true }
      }])
    }
  }, [messages.length])
  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: newMessage.trim(),
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsLoading(true)
    setError(null)

    try {
      console.log('📤 إرسال رسالة للشاتبوت:', userMessage.content)
      
      const response = await fetch('/api/logos/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          userId
        }),
      })

      console.log('📥 استجابة الخادم:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('خطأ من الخادم:', errorText)
        throw new Error(`خطأ ${response.status}: ${response.statusText || 'فشل في الاتصال بالخادم'}`)
      }

      const data = await response.json()
      console.log('📊 بيانات الاستجابة:', data)
      
      if (data.success && data.message) {
        const assistantMessage: Message = {
          id: data.message.id || 'assistant-' + Date.now(),
          role: 'assistant',
          content: data.message.content,
          created_at: data.message.created_at || new Date().toISOString(),
          metadata: data.message.metadata || {}
        }

        setMessages(prev => [...prev, assistantMessage])
        
        if (data.conversationId) {
          setConversationId(data.conversationId)
        }

        // Show setup instructions if needed
        if (data.message.metadata?.setup_needed) {
          toast({
            title: "معلومة مهمة",
            description: "النظام يعمل في وضع تجريبي. بعض الميزات تتطلب إعداد إضافي.",
            duration: 5000,
          })
        }

        // Show mock/fallback notifications
        if (data.mock || data.fallback) {
          toast({
            title: "وضع تجريبي",
            description: data.message.metadata?.nvidia_api ? 
              "تم التوليد بالذكاء الاصطناعي" : 
              "استجابة تجريبية - لتفعيل كامل الميزات يرجى إعداد قاعدة البيانات",
            duration: 4000,
          })
        }

        setIsConnected(true)
      } else {
        throw new Error(data.error || 'فشل في معالجة الرسالة')
      }
      
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage = err instanceof Error ? err.message : 'فشل في إرسال الرسالة'
      setError(errorMessage)
      setIsConnected(false)
      
      // Add error message to chat
      const errorChatMessage: Message = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: `عذراً، حدث خطأ: ${errorMessage}

يمكنك:
• إعادة المحاولة بعد قليل
• التحقق من اتصال الإنترنت
• مراجعة إعدادات النظام

💡 النظام يعمل حالياً في وضع تجريبي`,
        created_at: new Date().toISOString(),
        metadata: { error: true }
      }

      setMessages(prev => [...prev, errorChatMessage])
      
      toast({
        title: "خطأ في الإرسال",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessageContent = (content: string) => {
    // Split content by markdown-style formatting for better display
    return content.split('\n').map((line, index) => {
      if (line.startsWith('🎯') || line.startsWith('🔍') || line.startsWith('💡') || line.startsWith('⚡') || line.startsWith('🎭')) {
        return (
          <div key={index} className="font-semibold text-blue-900 mt-3 mb-2">
            {line}
          </div>
        )
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <div key={index} className="font-semibold text-gray-900 mt-2">
            {line.replace(/\*\*/g, '')}
          </div>
        )
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={index} className="ml-4 text-gray-700 mt-1">
            {line}
          </div>
        )
      }
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>
      }
      return (
        <div key={index} className="text-gray-800 leading-relaxed">
          {line}
        </div>
      )
    })
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={onToggleMinimize}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] z-50"
    >
      <Card className="h-full flex flex-col shadow-2xl border-2 border-primary/10">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">            <div className="flex items-center gap-3">
              <AdvancedLogosIcon variant="neural" size="sm" animated />
              <div>
                <CardTitle className="text-lg font-bold">اللوغوس</CardTitle>
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>{isConnected ? 'متصل' : 'غير متصل'}</span>
                  {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="text-white hover:bg-white/20"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 shadow-sm border'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="space-y-1 text-sm leading-relaxed">
                        {formatMessageContent(message.content)}
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed">
                        {message.content}
                      </div>
                    )}
                    
                    {message.metadata?.nvidia_api && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                        <Sparkles className="h-3 w-3" />
                        <span>مدعوم بـ NVIDIA AI</span>
                      </div>
                    )}
                    
                    {(message.metadata?.mock || message.metadata?.fallback) && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                        <AlertCircle className="h-3 w-3" />
                        <span>وضع تجريبي</span>
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 justify-start"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">اللوغوس يفكر...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 text-right"
                dir="rtl"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {error && (
              <div className="mt-2 text-xs text-red-600 text-center">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

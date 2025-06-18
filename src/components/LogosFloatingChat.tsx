'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { AdvancedLogosIcon } from '@/components/AdvancedLogosIcon'
import { LogosConversation, LogosMessage, LogosUserPreferences } from '@/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Settings, 
  Brain, 
  Minimize2, 
  Maximize2,
  Plus,
  Clock,
  Zap,
  Target,
  Eye
} from 'lucide-react'

// Mock user ID - in real app this would come from auth
const MOCK_USER_ID = '550e8400-e29b-41d4-a716-446655440000'

interface LogosFloatingChatProps {
  className?: string
}

export function LogosFloatingChat({ className }: LogosFloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<LogosMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState<LogosConversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<LogosConversation | null>(null)
  const [preferences, setPreferences] = useState<LogosUserPreferences | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Load conversations and preferences on mount
  useEffect(() => {
    if (isOpen) {
      loadConversations()
      loadPreferences()
    }
  }, [isOpen])

  const loadConversations = async () => {
    try {
      const response = await fetch(`/api/logos/conversations?userId=${MOCK_USER_ID}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadPreferences = async () => {
    try {
      const response = await fetch(`/api/logos/preferences?userId=${MOCK_USER_ID}`)
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }

  const loadConversation = async (conversation: LogosConversation) => {
    try {
      const response = await fetch(
        `/api/logos/chat?conversationId=${conversation.id}&userId=${MOCK_USER_ID}`
      )
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setCurrentConversation(conversation)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المحادثة',
        variant: 'destructive',
      })
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    setIsLoading(true)

    // Add user message to UI immediately
    const tempUserMessage: LogosMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversation?.id || '',
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
      metadata: {},
      tokens_used: null,
      processing_time_ms: null,
      model_used: null,
      confidence_score: null,
      referenced_notes: null,
      referenced_projects: null,
      referenced_scenarios: null,
      referenced_journal_entries: null
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      const response = await fetch('/api/logos/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId: currentConversation?.id,
          userId: MOCK_USER_ID,
          includeContext: preferences?.enable_cross_module_analysis ?? true        }),
      })

      if (!response.ok) {
        throw new Error('فشل في إرسال الرسالة')
      }

      const data = await response.json()
      
      // Remove temp message
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id))
      
      // Handle different response types
      if (data.success === false && data.fallback_message) {
        // Use fallback message on error
        setMessages(prev => [...prev, tempUserMessage, data.fallback_message])
        toast({
          title: 'وضع الطوارئ',
          description: 'النظام يعمل في وضع محدود',
          variant: 'default',
        })
      } else if (data.mock && data.setup_instructions) {
        // Handle mock response when DB is not set up
        setMessages(prev => [...prev, tempUserMessage, data.message])
        toast({
          title: 'إعداد مطلوب',
          description: 'يرجى إعداد قاعدة البيانات لتفعيل كامل الميزات',
          variant: 'default',
        })
      } else if (data.message) {
        // Regular response
        setMessages(prev => [...prev, tempUserMessage, data.message])
          // Update conversation info
        if (data.conversationId && !currentConversation) {
          setCurrentConversation({
            id: data.conversationId,
            title: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : ''),
            user_id: MOCK_USER_ID,
            conversation_type: 'general',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            context_data: {},
            is_active: true,
            priority_level: 'normal'
          })
        }
      }

      // Update conversations list
      loadConversations()

    } catch (error) {
      console.error('Error sending message:', error)
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id))
      
      // Add fallback message
      const fallbackMessage = {
        id: `fallback-${Date.now()}`,
        conversation_id: currentConversation?.id || `temp-${Date.now()}`,
        role: 'assistant' as const,
        content: `عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.

في هذه الأثناء، يمكنك:
• مراجعة ملاحظاتك في الصفحة الرئيسية
• إنشاء مشاريع جديدة من ملاحظاتك
• استكشاف وحدات النظام الأخرى

🔧 جارٍ العمل على إصلاح المشكلة...`,
        created_at: new Date().toISOString(),
        metadata: { fallback: true, error: true },
        tokens_used: null,
        processing_time_ms: null,
        model_used: null,
        confidence_score: null,
        referenced_notes: null,
        referenced_projects: null,
        referenced_scenarios: null,
        referenced_journal_entries: null
      }
      
      setMessages(prev => [...prev, tempUserMessage, fallbackMessage])
      
      toast({
        title: 'خطأ في الاتصال',
        description: 'تم إضافة رسالة احتياطية. حاول مرة أخرى لاحقاً.',
        variant: 'default',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startNewConversation = () => {
    setCurrentConversation(null)
    setMessages([])
  }

  const getConversationTypeIcon = (type: string) => {
    switch (type) {
      case 'strategic': return <Target className="h-4 w-4" />
      case 'analysis': return <Eye className="h-4 w-4" />
      case 'planning': return <Clock className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }  // Floating button when closed
  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className || ''}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95"
          aria-label="فتح الشاتبوت"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
    )
  }// Chat interface when open
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.4 
        }}
        className={`fixed bottom-6 right-6 z-50 ${className || ''}`}
      >
        <motion.div
          animate={{ height: isMinimized ? 'auto' : '600px' }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Card className={`w-96 shadow-2xl border-2 border-gray-200/50 bg-white/95 backdrop-blur-md overflow-hidden ${
            isMinimized ? 'h-auto' : 'h-[600px]'
          }`}>
            {/* Enhanced Header */}
            <CardHeader className="pb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white border-b relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              </div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <AdvancedLogosIcon variant="neural" size="md" animated />
                    {/* Enhanced online status indicator */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg">
                      <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                    </div>
                  </div>
              <div>
                <CardTitle className="text-lg font-bold">اللوغوس</CardTitle>
                <p className="text-xs text-white/80">المستشار الاستراتيجي الذكي</p>
              </div>
              {preferences?.enable_strategic_challenges && (
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Zap className="h-3 w-3 mr-1" />
                  استراتيجي
                </Badge>
              )}
            </div>            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0 transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <motion.div
                  animate={{ rotate: isMinimized ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </motion.div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-red-500/30 h-8 w-8 p-0 transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-4 w-4" />
                </motion.div>
              </Button>
            </div>
          </div>
        </CardHeader>        {/* Content - only show when not minimized */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CardContent className="p-0 flex flex-col h-[536px] bg-white/90 backdrop-blur-sm">
                {/* Conversation list or chat */}
                {!currentConversation ? (
              // Conversation list
              <div className="flex-1 p-4 bg-gradient-to-b from-gray-50/50 to-white/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-indigo-600" />
                    المحادثات
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startNewConversation}
                    className="gap-2 bg-white/80 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 text-indigo-700 font-medium transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    محادثة جديدة
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => loadConversation(conv)}
                      className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl cursor-pointer hover:bg-white hover:shadow-md transition-all duration-200 hover:scale-[1.02] hover:border-indigo-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            {getConversationTypeIcon(conv.conversation_type)}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 text-sm block">{conv.title}</span>
                            <span className="text-xs text-gray-500">{conv.conversation_type}</span>
                          </div>
                        </div>
                        <Badge className={`text-xs font-medium ${getPriorityColor(conv.priority_level)} border`}>
                          {conv.priority_level}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(conv.updated_at).toLocaleDateString('ar-SA')}
                        </p>
                        <div className="text-xs text-indigo-600 font-medium">اضغط للفتح</div>
                      </div>
                    </div>
                  ))}
                  
                  {conversations.length === 0 && (
                    <div className="text-center py-12 bg-white/60 rounded-xl border border-dashed border-gray-300">
                      <div className="relative mx-auto w-16 h-16 mb-4">
                        <Brain className="h-16 w-16 text-indigo-300" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Plus className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-700 mb-2">مرحباً بك في اللوغوس!</h4>
                      <p className="text-sm text-gray-500 mb-1">لا توجد محادثات بعد</p>
                      <p className="text-xs text-gray-400">ابدأ محادثة جديدة مع مستشارك الاستراتيجي</p>
                    </div>
                  )}
                </div>

                {/* Quick start new conversation */}
                <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl">
                  <Textarea
                    placeholder="مرحباً اللوغوس، أريد استشارة استراتيجية حول..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    className="min-h-[80px] resize-none border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 bg-white/90"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      {preferences?.enable_cross_module_analysis && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                          <Zap className="h-3 w-3 mr-1" />
                          سياق ذكي مفعل
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={!currentMessage.trim() || isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          يفكر...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          إرسال
                        </div>                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Active conversation
              <div className="flex flex-col h-full bg-white/90 backdrop-blur-sm">
                {/* Conversation header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentConversation(null)}
                      className="p-2 hover:bg-gray-200 text-gray-600"
                    >
                      ← العودة
                    </Button>
                    <div>
                      <h4 className="font-semibold text-gray-800">{currentConversation?.title}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {messages.length} رسالة
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-xs font-medium ${getPriorityColor(currentConversation?.priority_level || 'normal')}`}>
                    {currentConversation?.priority_level}
                  </Badge>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white ml-2'
                            : 'bg-white border border-gray-200 text-gray-900 mr-2'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2 text-indigo-600">
                            <Brain className="h-4 w-4" />
                            <span className="text-xs font-medium">اللوغوس</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        {message.role === 'assistant' && message.confidence_score && preferences?.show_confidence_scores && (
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Target className="h-3 w-3" />
                              مستوى الثقة: {Math.round(message.confidence_score * 100)}%
                            </div>
                          </div>
                        )}
                        {message.role === 'user' && (
                          <div className="text-xs text-indigo-200 mt-2">
                            {new Date(message.created_at).toLocaleTimeString('ar-SA', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm mr-2">
                        <div className="flex items-center gap-3">
                          <Brain className="h-4 w-4 text-indigo-600" />
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <span className="text-sm text-gray-600 mr-2">اللوغوس يحلل ويفكر...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-gray-200 bg-gray-50/80">
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="اسأل اللوغوس أي شيء استراتيجي..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      className="flex-1 min-h-[50px] resize-none border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 bg-white/90"
                      disabled={isLoading}
                    />                    <Button
                      onClick={sendMessage}
                      disabled={!currentMessage.trim() || isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white self-end px-6 py-3 transition-all duration-200"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span className="text-sm">إرسال...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          <span className="text-sm">إرسال</span>
                        </div>
                      )}
                    </Button>
                  </div>                  
                  {preferences?.enable_cross_module_analysis && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <Eye className="h-3 w-3" />
                      <span>سيتم جمع السياق من جميع وحدات Nexus تلقائياً</span>
                    </div>
                  )}
                </div>
              </div>
            )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

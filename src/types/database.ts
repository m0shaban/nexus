export interface Note {
  id: string
  created_at: string
  user_id: string | null
  content: string
  content_type: string
  ai_summary: string | null
  ai_questions: string[] | null
  analysis_status: 'pending' | 'analyzing' | 'completed' | 'error' | null
  raw_telegram_message: any | null
}

export interface TelegramMessage {
  message_id: number
  from: {
    id: number
    is_bot: boolean
    first_name: string
    username?: string
  }
  chat: {
    id: number
    type: string
  }
  date: number
  text?: string
  photo?: any[]
  document?: any
  voice?: any
}

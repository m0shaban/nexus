'use client'

import { useState } from 'react'

export function useLogosChat() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const openChat = () => {
    setIsChatOpen(true)
    setIsMinimized(false)
  }

  const closeChat = () => {
    setIsChatOpen(false)
    setIsMinimized(false)
  }

  const minimizeChat = () => {
    setIsMinimized(true)
  }

  const toggleChat = () => {
    if (isChatOpen && !isMinimized) {
      minimizeChat()
    } else if (isChatOpen && isMinimized) {
      setIsMinimized(false)
    } else {
      openChat()
    }
  }

  return {
    isChatOpen,
    isMinimized,
    openChat,
    closeChat,
    minimizeChat,
    toggleChat
  }
}

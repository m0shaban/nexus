'use client'

import { useState, useEffect } from 'react'
import { SplashScreenSimple } from '@/components/SplashScreenSimple'

interface AppWrapperProps {
  children: React.ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [showSplash, setShowSplash] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if splash has been shown in this session
    const splashShown = sessionStorage.getItem('splash-shown')
    
    if (splashShown) {
      setShowSplash(false)
      setIsLoading(false)
    }
  }, [])

  const handleSplashComplete = () => {
    sessionStorage.setItem('splash-shown', 'true')
    setShowSplash(false)
    setTimeout(() => {
      setIsLoading(false)
    }, 300)
  }

  if (isLoading && showSplash) {
    return <SplashScreenSimple onComplete={handleSplashComplete} />
  }

  return (
    <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
      {children}
    </div>
  )
}

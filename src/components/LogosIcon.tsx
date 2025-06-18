'use client'

import { Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogosIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
  variant?: 'default' | 'floating' | 'header'
}

export function LogosIcon({ 
  size = 'md', 
  animated = true, 
  className,
  variant = 'default'
}: LogosIconProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5', 
    xl: 'h-6 w-6'
  }

  const particleSizes = {
    sm: 'w-0.5 h-0.5',
    md: 'w-1 h-1',
    lg: 'w-1.5 h-1.5',
    xl: 'w-2 h-2'
  }

  if (variant === 'floating') {
    return (
      <div className={cn('relative flex items-center justify-center', className)}>
        {/* Background glow effect */}
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 opacity-20 animate-spin-slow rounded-full"></div>
        )}
        
        {/* Main icon with enhanced styling */}
        <div className="relative z-10 flex items-center justify-center">
          <Brain className={cn(iconSizes[size], 'text-white drop-shadow-lg filter')} />
          {/* Small accent dots around the brain */}
          {animated && (
            <>
              <div className={cn('absolute -top-1 -right-1 bg-cyan-300 rounded-full animate-pulse', particleSizes[size])}></div>
              <div className={cn('absolute -bottom-1 -left-1 bg-purple-300 rounded-full animate-pulse delay-75', particleSizes[size])}></div>
              <div className={cn('absolute top-0 -left-1 bg-blue-300 rounded-full animate-pulse delay-150', particleSizes[size])}></div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'header') {
    return (
      <div className={cn(
        sizeClasses[size],
        'rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 relative overflow-hidden',
        className
      )}>
        {/* Background glow */}
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-purple-400/30 to-blue-400/30 animate-pulse"></div>
        )}
        {/* Main brain icon */}
        <Brain className={cn(iconSizes[size], 'text-white drop-shadow-lg relative z-10')} />
        {/* Floating particles */}
        {animated && (
          <>
            <div className={cn('absolute top-1 right-1 bg-cyan-300 rounded-full animate-ping', particleSizes[size])}></div>
            <div className={cn('absolute bottom-1 left-1 bg-purple-300 rounded-full animate-ping delay-75', particleSizes[size])}></div>
          </>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn(
      sizeClasses[size],
      'rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center relative overflow-hidden shadow-lg',
      className
    )}>
      {/* Background animation */}
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-purple-400/20 to-blue-400/20 animate-pulse"></div>
      )}
      {/* Main brain icon */}
      <Brain className={cn(iconSizes[size], 'text-white drop-shadow-md relative z-10')} />
      {/* Neural network lines */}
      {animated && size !== 'sm' && (
        <>
          <div className="absolute inset-2 border border-white/20 rounded-full animate-ping"></div>
          <div className="absolute inset-4 border border-white/10 rounded-full animate-ping delay-75"></div>
        </>
      )}
    </div>
  )
}

'use client'

import { Brain, Zap, Target, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdvancedLogosIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
  variant?: 'neural' | 'quantum' | 'matrix'
}

export function AdvancedLogosIcon({ 
  size = 'md', 
  animated = true, 
  className,
  variant = 'neural'
}: AdvancedLogosIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8', 
    xl: 'h-10 w-10'
  }

  if (variant === 'neural') {
    return (
      <div className={cn(
        sizeClasses[size],
        'relative flex items-center justify-center',
        className
      )}>
        {/* Neural network background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 opacity-90"></div>
        
        {/* Animated neural connections */}
        {animated && (
          <>
            {/* Outer ring */}
            <div className="absolute inset-1 rounded-full border-2 border-white/30 animate-spin-slow"></div>
            {/* Middle ring */}
            <div className="absolute inset-2 rounded-full border border-cyan-300/50 animate-ping"></div>
            {/* Inner pulse */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-400/20 animate-pulse"></div>
          </>
        )}
        
        {/* Central brain icon */}
        <div className="relative z-10 flex items-center justify-center">
          <Brain className={cn(iconSizes[size], 'text-white drop-shadow-lg')} />
        </div>
        
        {/* Neural nodes */}
        {animated && (
          <>
            <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75 shadow-lg"></div>
            <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse delay-150 shadow-lg"></div>
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse delay-300 shadow-lg"></div>
          </>
        )}
      </div>
    )
  }

  if (variant === 'quantum') {
    return (
      <div className={cn(
        sizeClasses[size],
        'relative flex items-center justify-center',
        className
      )}>
        {/* Quantum field background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 opacity-90"></div>
        
        {/* Quantum interference patterns */}
        {animated && (
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-conic from-transparent via-white/10 to-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-radial from-white/20 to-transparent animate-ping"></div>
          </>
        )}
        
        {/* Multi-layered brain */}
        <div className="relative z-10 flex items-center justify-center">
          <Brain className={cn(iconSizes[size], 'text-white drop-shadow-2xl')} />
          {animated && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className={cn(iconSizes[size], 'text-cyan-300/50 animate-pulse')} />
            </div>
          )}
        </div>
        
        {/* Quantum particles */}
        {animated && (
          <>
            <div className="absolute top-1 right-3 w-1 h-1 bg-cyan-300 rounded-full animate-bounce"></div>
            <div className="absolute bottom-3 left-1 w-1 h-1 bg-purple-300 rounded-full animate-bounce delay-75"></div>
            <div className="absolute top-3 left-3 w-0.5 h-0.5 bg-blue-200 rounded-full animate-bounce delay-150"></div>
          </>
        )}
      </div>
    )
  }

  // Matrix variant
  return (
    <div className={cn(
      sizeClasses[size],
      'relative flex items-center justify-center',
      className
    )}>
      {/* Matrix background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 opacity-90"></div>
      
      {/* Matrix rain effect */}
      {animated && (
        <>
          <div className="absolute inset-1 rounded-full border border-green-300/50 animate-pulse"></div>
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-green-300 to-transparent opacity-50 animate-pulse"></div>
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gradient-to-r from-green-300 to-transparent opacity-50 animate-pulse delay-75"></div>
        </>
      )}
      
      {/* Central icons */}
      <div className="relative z-10 flex items-center justify-center">
        <Brain className={cn(iconSizes[size], 'text-white drop-shadow-lg')} />
        {animated && (
          <>
            <Target className="absolute top-0 right-0 h-3 w-3 text-green-300 animate-ping" />
            <Eye className="absolute bottom-0 left-0 h-3 w-3 text-emerald-300 animate-ping delay-150" />
          </>
        )}
      </div>
    </div>
  )
}

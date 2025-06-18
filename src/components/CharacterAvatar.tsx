'use client'

import Image from 'next/image'
import { useState } from 'react'

interface CharacterAvatarProps {
  character: 'logos' | 'catalyst' | 'oracle' | 'mirror'
  mood?: 'default' | 'thinking' | 'happy' | 'working' | 'greeting'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
}

const CHARACTER_CONFIG = {
  logos: {
    name: 'Logos',
    description: 'المساعد الذكي',
    colors: 'from-blue-500 to-purple-600',
    fallback: '🤖'
  },
  catalyst: {
    name: 'المحفز',
    description: 'محفز الإبداع',
    colors: 'from-orange-500 to-yellow-500',
    fallback: '⚡'
  },
  oracle: {
    name: 'العرّافة',
    description: 'بصيرة المستقبل',
    colors: 'from-purple-600 to-indigo-600',
    fallback: '🔮'
  },
  mirror: {
    name: 'المرآة',
    description: 'التأمل الذاتي',
    colors: 'from-green-500 to-emerald-600',
    fallback: '🪞'
  }
}

const SIZE_CONFIG = {
  sm: { size: 32, ring: 'ring-2' },
  md: { size: 48, ring: 'ring-2' },
  lg: { size: 64, ring: 'ring-4' },
  xl: { size: 96, ring: 'ring-4' }
}

export function CharacterAvatar({ 
  character, 
  mood = 'default', 
  size = 'md',
  animated = false,
  className = '' 
}: CharacterAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const config = CHARACTER_CONFIG[character]
  const sizeConfig = SIZE_CONFIG[size]
  
  const imagePath = `/images/characters/${character}/${character}-${mood}.png`
  
  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`
        relative overflow-hidden rounded-full bg-gradient-to-br ${config.colors}
        ${sizeConfig.ring} ring-white/20 shadow-lg
        ${animated ? 'animate-pulse hover:animate-bounce' : ''}
        transition-all duration-300 hover:scale-110 hover:shadow-xl
      `}>
        {!imageError ? (
          <Image
            src={imagePath}
            alt={`${config.name} - ${config.description}`}
            width={sizeConfig.size}
            height={sizeConfig.size}
            className="object-cover"
            onError={() => setImageError(true)}
            priority={character === 'logos'} // Logos is most important
          />
        ) : (
          <div 
            className="flex items-center justify-center text-white font-bold"
            style={{ 
              width: sizeConfig.size, 
              height: sizeConfig.size,
              fontSize: sizeConfig.size * 0.4 
            }}
          >
            {config.fallback}
          </div>
        )}
        
        {/* Glow effect for AI characters */}
        {(character === 'logos' || character === 'oracle') && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
        )}
      </div>
      
      {/* Character name tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {config.name}
        </div>
      </div>
    </div>
  )
}

// استخدام مع mood states
export function LogosWithMood() {
  const [mood, setMood] = useState<'default' | 'thinking' | 'happy' | 'working'>('default')
  
  return (
    <div className="flex flex-col items-center gap-4">
      <CharacterAvatar character="logos" mood={mood} size="lg" animated />
      
      <div className="flex gap-2">
        {(['default', 'thinking', 'happy', 'working'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              mood === m 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}

// مجموعة شخصيات Nexus
export function NexusCharacterGroup() {
  return (
    <div className="flex justify-center items-center gap-6 p-6">
      {Object.entries(CHARACTER_CONFIG).map(([key, config]) => (
        <div key={key} className="text-center space-y-2">
          <CharacterAvatar 
            character={key as keyof typeof CHARACTER_CONFIG} 
            size="lg" 
            animated 
          />
          <div className="text-sm font-medium">{config.name}</div>
          <div className="text-xs text-gray-500">{config.description}</div>
        </div>
      ))}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Brain, Target, Zap, CheckCircle, Loader2 } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreenSimple({ onComplete }: SplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const steps = [
    { icon: Brain, text: 'تهيئة الذكاء الاصطناعي...', color: 'from-blue-500 to-cyan-500' },
    { icon: Sparkles, text: 'تحضير الوحدات...', color: 'from-purple-500 to-pink-500' },
    { icon: Target, text: 'ربط قاعدة البيانات...', color: 'from-green-500 to-emerald-500' },
    { icon: Zap, text: 'تفعيل النظام...', color: 'from-orange-500 to-yellow-500' },
  ]

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        } else {
          setIsComplete(true)
          setTimeout(() => {
            onComplete()
          }, 1000)
          return prev
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onComplete, steps.length, isMounted])

  if (!isMounted) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
    >      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)',
            backgroundSize: '50px 50px',
            animation: 'float 20s infinite linear'
          }} 
        />
      </div>

      <div className="relative z-10 text-center text-white max-w-md mx-auto px-6">        {/* Logo Section */}
        <div className="mb-12 animate-pulse">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center animate-spin-slow">
                {/* يمكن استبدال Sparkles بشخصية Nexus لاحقاً */}
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-lg animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2 animate-fade-in">
            Nexus
          </h1>
          <p className="text-xl text-white/80 animate-fade-in-delay">
            المحفز - محفز الإبداع والإنتاجية
          </p>
          
          {/* Mini character showcase */}
          <div className="flex justify-center gap-4 mt-6 opacity-70">
            <div className="w-8 h-8 rounded-full bg-blue-400/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-400/30 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 rounded-full bg-green-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-400/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Loading Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep || isComplete

            return (
              <div
                key={index}
                className={`flex items-center gap-4 transition-all duration-500 ${
                  isActive || isCompleted ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-4'
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500/20 border-green-400 scale-110'
                        : isActive
                        ? `bg-gradient-to-r ${step.color} border-white/50 animate-pulse`
                        : 'bg-white/10 border-white/30'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : isActive ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <StepIcon className="w-6 h-6 text-white/70" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 text-right">
                  <p
                    className={`text-lg font-medium transition-all duration-300 ${
                      isActive ? 'text-white scale-105' : 'text-white/70'
                    }`}
                  >
                    {step.text}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-white to-white/80 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Completion Message */}
        {isComplete && (
          <div className="mt-8 animate-bounce">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg font-medium">جاهز للانطلاق!</span>
            </div>
          </div>
        )}

        {/* Version Info */}
        <div className="mt-12 text-xs text-white/50 animate-fade-in-slow">
          الإصدار 2.0 - محفز الإبداع والإنتاجية
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-delay {
          0% { opacity: 0; transform: translateY(20px); }
          50% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-slow {
          0% { opacity: 0; }
          70% { opacity: 0; }
          100% { opacity: 1; }
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out 0.5s both;
        }

        .animate-fade-in-delay {
          animation: fade-in-delay 2s ease-out both;
        }

        .animate-fade-in-slow {
          animation: fade-in-slow 3s ease-out both;
        }
      `}</style>
    </div>
  )
}

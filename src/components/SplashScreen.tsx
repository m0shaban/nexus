'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, Target, Zap, CheckCircle, Loader2 } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const steps = [
    { icon: Brain, text: 'تهيئة الذكاء الاصطناعي...', color: 'from-blue-500 to-cyan-500' },
    { icon: Sparkles, text: 'تحضير الوحدات...', color: 'from-purple-500 to-pink-500' },
    { icon: Target, text: 'ربط قاعدة البيانات...', color: 'from-green-500 to-emerald-500' },
    { icon: Zap, text: 'تفعيل النظام...', color: 'from-orange-500 to-yellow-500' },
  ]

  useEffect(() => {
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
    }, 800)

    return () => clearInterval(timer)
  }, [onComplete, steps.length])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center text-white max-w-md mx-auto px-6">
          {/* Logo Section */}
          <motion.div
            className="mb-12"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: 'spring', bounce: 0.6 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <motion.div
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
            
            <motion.h1
              className="text-4xl font-bold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Nexus
            </motion.h1>
            <motion.p
              className="text-xl text-white/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              المحفز
            </motion.p>
          </motion.div>

          {/* Loading Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep || isComplete

              return (
                <motion.div
                  key={index}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ 
                    opacity: isActive || isCompleted ? 1 : 0.3,
                    x: 0 
                  }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="relative">
                    <motion.div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${
                        isCompleted
                          ? 'bg-green-500/20 border-green-400'
                          : isActive
                          ? `bg-gradient-to-r ${step.color} border-white/50`
                          : 'bg-white/10 border-white/30'
                      }`}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : isActive ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <StepIcon className="w-6 h-6 text-white/70" />
                      )}
                    </motion.div>
                  </div>
                  
                  <div className="flex-1 text-right">
                    <motion.p
                      className={`text-lg font-medium ${
                        isActive ? 'text-white' : 'text-white/70'
                      }`}
                      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                    >
                      {step.text}
                    </motion.p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Progress Bar */}
          <motion.div
            className="mt-8 w-full bg-white/20 rounded-full h-2 overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-white to-white/80 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>

          {/* Completion Message */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-lg font-medium">جاهز للانطلاق!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Version Info */}
          <motion.div
            className="mt-12 text-xs text-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            الإصدار 2.0 - محفز الإبداع والإنتاجية
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

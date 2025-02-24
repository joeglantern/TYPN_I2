"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const loadingMessages = [
  "Connecting global youth networks...",
  "Building international bridges...",
  "Empowering young leaders worldwide...",
  "Fostering cross-cultural collaboration...",
  "Uniting voices across continents..."
]

export default function LoadingScreen() {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length)
    }, 2000)

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return Math.min(prev + 2, 100)
      })
    }, 100)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 mb-8">
        <Image
          src="/logo.png"
          alt="TYPNI Logo"
          fill
          className="object-contain"
          priority
        />
        <motion.div
          className="absolute inset-0 border-2 border-primary rounded-full"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Loading Bar */}
      <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Loading Message */}
      <motion.p
        key={currentMessage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-lg text-foreground/80"
      >
        {loadingMessages[currentMessage]}
      </motion.p>

      {/* Progress Percentage */}
      <p className="text-sm text-muted-foreground mt-2">
        {Math.round(progress)}%
      </p>
    </div>
  )
} 

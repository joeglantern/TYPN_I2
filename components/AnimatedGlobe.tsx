"use client"

import { motion } from "framer-motion"
import { Globe } from "lucide-react"

export function AnimatedGlobe() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: 1, 
        rotate: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 1.5
      }}
      className="relative"
    >
      <motion.div
        animate={{ 
          rotate: 360
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="text-white/80"
      >
        <Globe className="w-24 h-24 md:w-32 md:h-32" />
      </motion.div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] opacity-40 blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  )
} 
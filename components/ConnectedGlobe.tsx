"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function ConnectedGlobe() {
  return (
    <div className="h-[400px] w-full relative overflow-hidden">
      {/* Animated globe */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="relative w-[300px] h-[300px]">
          <Image
            src="/earth-texture.jpg"
            alt="Connected Globe"
            fill
            className="object-cover rounded-full shadow-2xl"
            priority
          />
          {/* Depth effect overlay */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 via-transparent to-white/20" />
        </div>
      </motion.div>
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
      
      {/* Optional text overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white/90 pointer-events-none">
        <motion.p 
          className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Connected World
        </motion.p>
        <p className="text-sm mt-1 text-white/70">Global Network</p>
      </div>
    </div>
  )
} 
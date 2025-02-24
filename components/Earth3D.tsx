"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'

// We'll keep this commented out for now, can be enabled later if 3D is needed
// import dynamic from 'next/dynamic'
// const Earth3DContent = dynamic(() => import('./Earth3DContent'), { ssr: false })

export default function Earth3D({ use3D = false }) {
  // if (use3D) {
  //   return <Earth3DContent />
  // }

  return (
    <div className="h-[400px] w-full relative overflow-hidden">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="relative w-[300px] h-[300px]">
          <Image
            src="/earth-texture.jpg"
            alt="Earth"
            fill
            className="object-cover rounded-full shadow-2xl"
            priority
          />
          {/* Overlay for depth effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 via-transparent to-white/20" />
        </div>
      </motion.div>
      
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 blur-3xl" />
      
      {/* Optional text overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white/90 pointer-events-none">
        <motion.p 
          className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          TYPNI
        </motion.p>
        <p className="text-sm mt-1 text-white/70">We are global</p>
      </div>
    </div>
  )
} 
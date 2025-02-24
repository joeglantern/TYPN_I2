"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function FooterLogoStrip() {
  // Use the actual TYPNI logo files in reverse order for variety
  const logos = Array(2).fill([
    "/TYPNI-24.jpg",
    "/TYPNI-22.jpg",
    "/TYPNI-20.jpg",
    "/TYPNI-19.jpg",
    "/TYPNI-16.jpg",
    "/TYPNI-13.jpg",
    "/TYPNI-11.jpg",
    "/logo 6.44.28 PM.png",
  ]).flat()

  return (
    <div className="relative w-full overflow-hidden bg-white py-6">
      <motion.div
        initial={{ x: "-50%" }}
        animate={{ x: "0%" }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="flex gap-12 whitespace-nowrap"
      >
        {logos.map((logo, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="relative w-16 h-16 flex-shrink-0"
          >
            <Image
              src={logo}
              alt={`TYPNI Logo Variant ${index + 1}`}
              fill
              className="object-contain brightness-100 hover:brightness-110 transition-all duration-300"
              sizes="(max-width: 768px) 64px, 64px"
            />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Gradient overlays for smooth fade effect */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
    </div>
  )
} 
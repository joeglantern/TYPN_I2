"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function LogoStrip() {
  // Use the actual TYPNI logo files
  const logos = Array(2).fill([
    "/logo 6.44.28 PM.png",
    "/TYPNI-11.jpg",
    "/TYPNI-13.jpg",
    "/TYPNI-16.jpg",
    "/TYPNI-19.jpg",
    "/TYPNI-20.jpg",
    "/TYPNI-22.jpg",
    "/TYPNI-24.jpg",
  ]).flat()

  return (
    <div className="relative w-full overflow-hidden bg-white py-8 border-y border-gray-200">
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: "-50%" }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="flex gap-16 whitespace-nowrap"
      >
        {logos.map((logo, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.1 }}
            className="relative w-24 h-24 flex-shrink-0"
          >
            <Image
              src={logo}
              alt={`TYPNI Logo Variant ${index + 1}`}
              fill
              className="object-contain brightness-100 hover:brightness-110 transition-all duration-300"
              sizes="(max-width: 768px) 96px, 96px"
            />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Gradient overlays for smooth fade effect */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
    </div>
  )
} 
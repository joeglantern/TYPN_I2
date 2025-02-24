"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const partners = [
  { 
    name: "Global Youth Initiative", 
    logo: "/TYPNI-11.jpg", 
    website: "https://example.com",
    description: "Empowering youth through innovative programs"
  },
  { 
    name: "Tech for Good", 
    logo: "/TYPNI-13.jpg", 
    website: "https://example.com",
    description: "Technology solutions for social impact"
  },
  { 
    name: "Sustainable Future Foundation", 
    logo: "/TYPNI-16.jpg", 
    website: "https://example.com",
    description: "Building a sustainable tomorrow"
  },
  { 
    name: "Education Without Borders", 
    logo: "/TYPNI-19.jpg", 
    website: "https://example.com",
    description: "Making education accessible globally"
  },
  { 
    name: "Youth Empowerment Alliance", 
    logo: "/TYPNI-22.jpg", 
    website: "https://example.com",
    description: "Creating opportunities for young leaders"
  },
  { 
    name: "Innovation for Change", 
    logo: "/TYPNI-25.jpg", 
    website: "https://example.com",
    description: "Driving innovation in social change"
  },
]

export default function PartnerCarousel() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {partners.map((partner, index) => (
        <motion.div
          key={partner.name}
          className="relative group bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
        >
          <motion.div
            className="relative h-40 mb-4 overflow-hidden rounded-lg"
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
          >
            <Image
              src={partner.logo}
              alt={partner.name}
              fill
              className="object-contain p-4"
              style={{ filter: 'brightness(0.9)' }}
            />
          </motion.div>
          
          <motion.h3 
            className="text-xl font-semibold mb-2 text-center"
            initial={{ y: 0 }}
            animate={{ y: hoveredIndex === index ? -5 : 0 }}
          >
            {partner.name}
          </motion.h3>
          
          <motion.p
            className="text-sm text-gray-400 text-center mb-4"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: hoveredIndex === index ? 1 : 0.7 }}
          >
            {partner.description}
          </motion.p>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: hoveredIndex === index ? 1 : 0, y: hoveredIndex === index ? 0 : 10 }}
          >
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-full text-sm font-medium transition-all duration-300"
            >
              Visit Website →
            </a>
          </motion.div>

          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}


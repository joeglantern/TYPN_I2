"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import PartnerCarousel from "@/components/PartnerCarousel"

export default function PartnersPage() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="min-h-screen">
      <div ref={containerRef} className="relative h-[60vh] overflow-hidden bg-gradient-to-b from-background to-background/50">
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src="/Geometric colorful Background.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        <motion.div 
          className="relative h-full flex items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-center px-4">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Our Partners
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Together with our partners, we're building a better future through innovation and collaboration.
            </motion.p>
          </div>
        </motion.div>
      </div>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">
              Trusted by Industry Leaders
            </h2>
            <PartnerCarousel />
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-8">Become a Partner</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Join our network of innovative organizations and help us create meaningful impact around the world.
            </p>
            <a 
              href="/contact" 
              className="inline-block px-8 py-3 bg-primary/20 hover:bg-primary/30 rounded-full text-lg font-medium transition-all duration-300"
            >
              Get in Touch →
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}


"use client"

import { motion } from "framer-motion"
import { Target, Compass } from "lucide-react"

export default function Vision() {
  return (
    <section className="py-16 bg-muted">
      <div className="container">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Our Vision & Mission
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            className="bg-card p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center mb-4">
              <Target className="h-8 w-8 text-primary mr-4" />
              <h3 className="text-2xl font-semibold">Vision</h3>
            </div>
            <p className="text-muted-foreground">
              A world where young people are empowered to lead positive change in their communities and beyond.
            </p>
          </motion.div>
          <motion.div
            className="bg-card p-8 rounded-lg shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center mb-4">
              <Compass className="h-8 w-8 text-primary mr-4" />
              <h3 className="text-2xl font-semibold">Mission</h3>
            </div>
            <p className="text-muted-foreground">
              To connect and empower young people globally through innovative programs, fostering leadership,
              collaboration, and sustainable development.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


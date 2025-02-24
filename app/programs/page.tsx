"use client"

import { getPrograms } from "../actions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Rocket, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

interface Program {
  id: string
  title: string
  description: string
  media_url: string
  created_at: string
  duration?: string
  location?: string
}

export default function ProgramsPage() {
  const programs: Program[] = [] // Empty for now, will be populated later

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Our Programs</h1>
          <p className="text-lg text-muted-foreground">
            Empowering youth through innovative and impactful programs. Stay tuned as we prepare to launch our transformative initiatives.
          </p>
        </div>
        
        {(!programs || programs.length === 0) ? (
          <motion.div 
            className="flex flex-col items-center justify-center p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mb-8">
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.3, 0.5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="relative bg-background rounded-full p-6 border-2 border-primary"
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Rocket className="w-12 h-12 text-primary" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Coming Soon!</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              We're crafting exceptional programs designed to empower and inspire. Check back soon to discover TYPNI's transformative initiatives.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span>Programs launching soon</span>
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/programs/${program.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all">
                    {program.media_url && (
                      <div className="relative aspect-video">
                        <Image
                          src={program.media_url}
                          alt={program.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-2">
                        {program.title}
                      </h2>
                      {program.description && (
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {program.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {program.duration && (
                          <span>Duration: {program.duration}</span>
                        )}
                        {program.location && (
                          <span>Location: {program.location}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


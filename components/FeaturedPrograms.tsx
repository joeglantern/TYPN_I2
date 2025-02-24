"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight, Globe, Code, Leaf } from "lucide-react"
import { Button } from "./ui/button"

const programs = [
  {
    title: "Global Youth Summit",
    description: "Annual conference bringing together young leaders from around the world.",
    image: "/placeholder.svg",
    icon: Globe,
  },
  {
    title: "Digital Skills Workshop",
    description: "Equipping youth with essential tech skills for the future.",
    image: "/placeholder.svg",
    icon: Code,
  },
  {
    title: "Environmental Action Program",
    description: "Empowering youth to tackle climate change in their communities.",
    image: "/placeholder.svg",
    icon: Leaf,
  },
]

export default function FeaturedPrograms() {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 gradient-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Featured Programs
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              className="bg-card p-6 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className="relative h-48 mb-4 rounded-md overflow-hidden">
                <Image src={program.image || "/placeholder.svg"} alt={program.title} layout="fill" objectFit="cover" />
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <program.icon className="h-12 w-12 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{program.title}</h3>
              <p className="text-muted-foreground mb-4">{program.description}</p>
              <Button variant="outline" size="sm">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/Hero section video background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
        </div>
        <div className="container relative px-4 md:px-6 z-10">
          <div className="flex flex-col items-center space-y-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white drop-shadow-lg">
                About TYPNI
                <br />
                <span className="text-primary-foreground bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 drop-shadow-lg">
                  Our Story
                </span>
              </h1>
              <p className="max-w-[600px] text-white md:text-xl mx-auto drop-shadow font-medium">
                Discover how we're building a global network of young leaders and changemakers.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Vision</h2>
              <p className="text-muted-foreground text-lg">
                TYPNI envisions a world where young people are empowered to lead positive change
                in their communities and beyond. We believe in the power of connection,
                collaboration, and collective action.
              </p>
              <div className="space-y-2">
                {[
                  "Empowering youth leadership",
                  "Fostering global connections",
                  "Driving sustainable change",
                  "Building inclusive communities"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>{item}</span>
                  </motion.div>
                ))}
              </div>
              <div className="pt-4">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[400px] rounded-lg overflow-hidden"
            >
              <Image
                src="/placeholder.jpg"
                alt="TYPNI Vision"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Team</h2>
            <p className="mt-4 text-muted-foreground">
              Meet the passionate individuals driving our mission forward.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-primary transition-colors card-hover"
              >
                <div className="relative h-48 w-48 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src="/placeholder.jpg"
                    alt={`Team Member ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">Team Member {index + 1}</h3>
                <p className="text-muted-foreground text-center">Position</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/Hero section video background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
        </div>
        <div className="container relative px-4 md:px-6 z-10">
          <div className="text-center space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold tracking-tighter sm:text-4xl text-white"
            >
              Join Our Mission
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="max-w-[600px] mx-auto text-white/90 text-lg"
            >
              Be part of a global movement creating positive change.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Involved
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}


"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./ui/button"
import { 
  X, Compass, Heart, Users, BookOpen, Sparkles, 
  Image as ImageIcon, Handshake, Info, Gift, 
  ArrowRight, Star, Mail, Bot, Globe
} from "lucide-react"
import { useTutorial } from "@/lib/tutorial-context"
import Link from "next/link"
import { useEffect } from "react"
import { ScrollArea } from "./ui/scroll-area"

export function TutorialOverlay() {
  const { showTutorial, setShowTutorial } = useTutorial()

  // Prevent background scrolling when tutorial is open
  useEffect(() => {
    if (showTutorial) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showTutorial])

  if (!showTutorial) return null

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  }

  const floatingAnimation = {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-4xl relative overflow-hidden max-h-[90vh] flex flex-col border border-[#333]"
        >
          {/* Decorative elements */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/10 rounded-full -ml-20 -mb-20 blur-2xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -3, 3, 0]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"
          />

          <div className="relative p-6 border-b border-[#333]">
            <div className="flex justify-between items-start">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <motion.div animate={floatingAnimation}>
                  <Star className="h-8 w-8 text-[#4ade80]" />
                </motion.div>
                <div>
                  <h3 className="text-3xl font-bold text-[#4ade80]">
                    Niaje! ✨
                  </h3>
                  <p className="text-gray-400 mt-1">Welcome to TYPNI - Your journey to impact starts here</p>
                </div>
              </motion.div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTutorial(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-8"
            >
              <motion.p 
                variants={item}
                className="text-lg text-[#4ade80]"
              >
                Let's explore what TYPNI has to offer! 🚀
              </motion.p>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div variants={container} className="space-y-4">
                  <motion.h4 
                    variants={item}
                    className="text-lg font-semibold flex items-center gap-2 text-white"
                  >
                    <Compass className="h-5 w-5 text-[#4ade80]" />
                    Main Features
                  </motion.h4>
                  <motion.ul variants={container} className="space-y-3">
                    {[
                      { icon: Users, title: "Join Our Community", desc: "Connect with like-minded individuals" },
                      { icon: BookOpen, title: "Read Our Blog", desc: "Try TYPNI AI to read blogs for you" },
                      { icon: Heart, title: "Support Our Cause", desc: "Make a meaningful impact" },
                      { icon: ImageIcon, title: "Browse Gallery", desc: "See our community in action" }
                    ].map((item, index) => (
                      <motion.li 
                        key={item.title}
                        variants={item}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#333] transition-colors group cursor-pointer"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-[#4ade80]/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
                          <item.icon className="h-5 w-5 text-[#4ade80]" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>

                <motion.div variants={container} className="space-y-4">
                  <motion.h4 
                    variants={item}
                    className="text-lg font-semibold flex items-center gap-2 text-white"
                  >
                    <Gift className="h-5 w-5 text-[#4ade80]" />
                    Special Features
                  </motion.h4>
                  <motion.ul variants={container} className="space-y-3">
                    {[
                      { icon: Bot, title: "TYPNI AI", desc: "Let AI read blogs and assist you" },
                      { icon: Globe, title: "Interactive Globes", desc: "Explore our 3D Earth visualizations" },
                      { icon: Gift, title: "Special Events", desc: "Join our exclusive gatherings" },
                      { icon: Star, title: "Success Stories", desc: "Read inspiring community stories" }
                    ].map((item, index) => (
                      <motion.li 
                        key={item.title}
                        variants={item}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#333] transition-colors group cursor-pointer"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-[#4ade80]/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
                          <item.icon className="h-5 w-5 text-[#4ade80]" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              </div>

              <motion.div variants={item} className="space-y-4">
                <div className="bg-[#333] p-4 rounded-lg">
                  <motion.div 
                    className="flex flex-col items-center gap-2"
                    animate={floatingAnimation}
                  >
                    <p className="text-sm text-center text-gray-400">
                      💡 Pro Tip: Click the help icon anytime to see this guide again!
                    </p>
                    <div className="flex items-center gap-2 text-sm text-[#4ade80]">
                      <Mail className="h-4 w-4" />
                      <a href="mailto:Niaje@typni.org" className="hover:underline">
                        Niaje@typni.org
                      </a>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </ScrollArea>

          <div className="p-6 border-t border-[#333]">
            <Button 
              className="w-full relative overflow-hidden group bg-[#4ade80] hover:bg-[#4ade80]/90 text-black"
              size="lg"
              onClick={() => setShowTutorial(false)}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="relative z-10 flex items-center gap-2"
              >
                Start Exploring <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 
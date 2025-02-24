"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { ArrowRight, CheckCircle, Users, Heart, ChevronRight, Mail, Star, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { LogoStrip } from "@/components/LogoStrip"
import { useEffect, useState, Suspense } from "react"
import { HomeCarousel } from "@/components/HomeCarousel"
import { createClient } from "@/utils/supabase/client"
import ClientOnly from "@/components/ClientOnly"

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)

  useEffect(() => {
    const animation = animate(count, value, { duration: 2, repeat: Infinity, repeatType: "reverse" })
    return animation.stop
  }, [count, value])

  return <motion.span>{rounded}</motion.span>
}

interface CarouselItem {
  id: number
  title: string
  description: string
  image_url: string
  show_in_carousel: boolean
  created_at: string
}

export default function HomePage() {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchCarouselItems() {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('show_in_carousel', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching carousel items:', error)
        return
      }

      setCarouselItems(data || [])
    }

    fetchCarouselItems()
  }, [])

  return (
    <main className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/Geometric colorful Background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/20" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-3rem)] max-w-[90rem] mx-auto">
            {/* Logo at the top */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.5
              }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32"
            >
              <Image
                src="/logo.png"
                alt="TYPNI Logo"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </motion.div>

            {/* Content section */}
            <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-3xl mx-auto mt-6 sm:mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center space-y-4 sm:space-y-6 text-center px-4"
              >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-white drop-shadow-lg">
                  Empowering Youth
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] drop-shadow-lg">
                    Globally
                  </span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-white mx-auto drop-shadow font-medium max-w-[85vw] sm:max-w-[600px]">
                  Join the movement of young leaders creating positive change through connection and collaboration.
                </p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col w-full sm:flex-row gap-3 sm:gap-4 max-w-xs sm:max-w-none"
                >
                  <Button size="lg" className="w-full sm:w-auto bg-[#4ECDC4] text-white hover:bg-[#45B7D1] shadow-lg text-sm sm:text-base h-10 sm:h-11">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border-white/50 shadow-lg text-sm sm:text-base h-10 sm:h-11">
                    Learn More
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border-white/50 shadow-lg text-sm sm:text-base h-10 sm:h-11"
                    asChild
                  >
                    <Link href="/chat">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Strip Section */}
      <LogoStrip />

      {/* Impact Numbers Section */}
      <section className="w-full py-8 sm:py-12 bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[
              { number: 52, label: "Countries", icon: Users },
              { number: 10243, label: "Youth Impacted", icon: Users },
              { number: 127, label: "Projects", icon: Star },
              { number: 31, label: "Partners", icon: Heart }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-2 sm:p-3 md:p-4 rounded-lg border bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 mx-auto mb-2 text-primary" />
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-1">
                  <AnimatedNumber value={stat.number} />
                  <span className="text-xs sm:text-sm ml-0.5">+</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-[10px] sm:text-xs text-primary/60 mt-0.5 animate-pulse">Still counting...</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="w-full py-16 bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-tighter">Our Impact in Action</h2>
              <p className="text-lg text-muted-foreground mt-2">
                See how we're making a difference around the world
              </p>
            </div>
            <HomeCarousel />
          </motion.div>
        </div>
      </section>

      {/* Global Network Section */}
      <section className="py-16 bg-muted/30">
        <div className="container-responsive max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Global Youth Network
              </h2>
              <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Join our vibrant community of young leaders from around the world. Connect, collaborate, and create positive change together.
              </p>
                  </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
              >
                <Image
                  src="/logo.png"
                  alt="TYPNI Logo"
                  fill
                  className="object-contain"
                />
              </motion.div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1]">
              Our Core Initiatives
            </h2>
            <p className="text-sm sm:text-base mt-2 text-muted-foreground">
              Discover how we're making a difference
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {[
              {
                icon: Users,
                title: "Global Network",
                description: "Connect with youth leaders from around the world and expand your horizons.",
                color: "text-[#FF6B6B]",
                bgColor: "bg-[#FF6B6B]"
              },
              {
                icon: Users,
                title: "Leadership Development",
                description: "Access training, mentorship, and resources to grow as a leader.",
                color: "text-[#4ECDC4]",
                bgColor: "bg-[#4ECDC4]"
              },
              {
                icon: Heart,
                title: "Community Impact",
                description: "Create positive change in your community through collaborative projects.",
                color: "text-[#45B7D1]",
                bgColor: "bg-[#45B7D1]"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group relative overflow-hidden rounded-lg border bg-background p-3 sm:p-4 md:p-6 hover:border-primary transition-colors card-hover"
              >
                <div className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <feature.icon className={`h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 ${feature.color} mb-2 sm:mb-3`} />
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground">{feature.description}</p>
                <div className="mt-2 sm:mt-3">
                  <Link href="#" className={`${feature.color} inline-flex items-center hover:underline text-xs sm:text-sm`}>
                    Learn more <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div className="text-white text-center lg:text-left">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 justify-center lg:justify-start">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                  className="relative w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
                >
                  <Image
                    src="/logo.png"
                    alt="TYPNI Logo"
                    fill
                    className="object-contain"
                  />
                </motion.div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Stay Connected</h3>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-white/90">
                Subscribe to our newsletter for updates and opportunities.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/90 text-foreground placeholder:text-muted-foreground h-9 sm:h-10 text-sm"
              />
              <Button className="bg-[#FF6B6B] text-white hover:bg-[#45B7D1] whitespace-nowrap h-9 sm:h-10 text-sm">
                <Mail className="mr-2 h-4 w-4" /> Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Communities Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter">
                Connected Communities
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400">
                Our platform connects youth organizations and individuals across borders, fostering collaboration and shared learning experiences.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { ArrowRight, CheckCircle, Globe, Users, Heart, ChevronRight, Mail, Star, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { LogoStrip } from "@/components/LogoStrip"
import dynamic from "next/dynamic"
import { useEffect, useState, Suspense } from "react"
import { HomeCarousel } from "@/components/HomeCarousel"
import { createClient } from "@/utils/supabase/client"
import ClientOnly from "@/components/ClientOnly"

// Dynamic imports with no SSR
const Earth3D = dynamic(() => import("@/components/Earth3D"), {
  ssr: false,
  loading: () => (
    <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading globe...</p>
      </div>
    </div>
  )
})

const ConnectedGlobe = dynamic(() => import("@/components/ConnectedGlobe"), {
  ssr: false,
  loading: () => (
    <div className="relative h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading globe...</p>
      </div>
    </div>
  )
})

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
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
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

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto">
          <div className="flex flex-col items-center space-y-8">
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
              className="relative w-32 h-32 md:w-40 md:h-40"
            >
              <Image
                src="/logo.png"
                alt="TYPNI Logo"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </motion.div>

            {/* Content section with text and globe */}
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 w-full max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center lg:items-start space-y-6 text-center lg:text-left"
              >
                <h1 className="heading-responsive font-bold tracking-tighter text-white drop-shadow-lg">
                  Empowering Youth
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1] drop-shadow-lg">
                    Globally
                  </span>
                </h1>
                <p className="text-responsive text-white mx-auto lg:mx-0 drop-shadow font-medium max-w-[90vw] sm:max-w-[600px]">
                  Join the movement of young leaders creating positive change through connection and collaboration.
                </p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto"
                >
                  <Button size="lg" className="w-full sm:w-auto bg-[#4ECDC4] text-white hover:bg-[#45B7D1] shadow-lg">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border-white/50 shadow-lg">
                    Learn More
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border-white/50 shadow-lg"
                    asChild
                  >
                    <Link href="/chat">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex justify-center items-center"
              >
                <ClientOnly fallback={
                  <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading globe...</p>
                    </div>
                  </div>
                }>
                  <Suspense fallback={
                    <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-sm text-muted-foreground">Loading globe...</p>
                      </div>
                    </div>
                  }>
                    <Earth3D />
                  </Suspense>
                </ClientOnly>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Strip Section */}
      <LogoStrip />

      {/* Impact Numbers Section */}
      <section className="w-full py-16 bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: 52, label: "Countries", icon: Globe },
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
                className="text-center p-6 rounded-xl border bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="text-4xl font-bold text-primary mb-2">
                  <AnimatedNumber value={stat.number} />
                  <span className="text-sm ml-1">+</span>
                </h3>
                <p className="text-muted-foreground">{stat.label}</p>
                <p className="text-sm text-primary/60 mt-1 animate-pulse">Still counting...</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold tracking-tighter">Global Network</h2>
              <p className="text-lg text-muted-foreground">
                Connect with youth leaders across continents, share ideas, and collaborate on impactful projects.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Regional Hubs", desc: "Active in 6 continents" },
                  { title: "Local Chapters", desc: "Present in 50+ countries" },
                  { title: "Online Community", desc: "24/7 collaboration" },
                  { title: "Cultural Exchange", desc: "Cross-border programs" }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-background/50 backdrop-blur-sm">
                    <h3 className="font-semibold text-primary">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[400px]"
            >
              <ClientOnly fallback={
                <div className="relative h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Loading globe...</p>
                  </div>
                </div>
              }>
                <Suspense fallback={
                  <div className="relative h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading globe...</p>
                    </div>
                  </div>
                }>
                  <ConnectedGlobe />
                </Suspense>
              </ClientOnly>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-responsive">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className="relative w-16 h-16"
              >
                <Image
                  src="/logo.png"
                  alt="TYPNI Logo"
                  fill
                  className="object-contain"
                />
              </motion.div>
            </div>
            <h2 className="heading-responsive font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1]">
              Our Core Initiatives
            </h2>
            <p className="text-responsive mt-4 text-muted-foreground">
              Discover how we're making a difference
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Globe,
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
                className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-primary transition-colors card-hover"
              >
                <div className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-responsive">{feature.description}</p>
                <div className="mt-4">
                  <Link href="#" className={`${feature.color} inline-flex items-center hover:underline`}>
                    Learn more <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#45B7D1]">
        <div className="container-responsive">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-white text-center lg:text-left">
              <div className="flex items-center gap-4 mb-4 justify-center lg:justify-start">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                  }}
                  className="relative w-10 h-10"
                >
                  <Image
                    src="/logo.png"
                    alt="TYPNI Logo"
                    fill
                    className="object-contain"
                  />
                </motion.div>
                <h3 className="text-2xl font-bold">Stay Connected</h3>
              </div>
              <p className="text-white/90 text-responsive">
                Subscribe to our newsletter for updates and opportunities.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/90 text-foreground placeholder:text-muted-foreground"
              />
              <Button className="bg-[#FF6B6B] text-white hover:bg-[#45B7D1]">
                <Mail className="mr-2 h-4 w-4" /> Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}


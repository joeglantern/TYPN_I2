"use client"

import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from 'next/navigation'
import LoadingScreen from "@/components/LoadingScreen"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from 'next/navigation'
import { TutorialProvider } from "@/lib/tutorial-context"
import { TutorialOverlay } from "@/components/TutorialOverlay"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdminRoute = pathname?.startsWith('/admin')
  const [isLoading, setIsLoading] = useState(true)
  const [minLoadingTimePassed, setMinLoadingTimePassed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Ensure minimum loading time for visual appeal
    const minLoadTimer = setTimeout(() => {
      setMinLoadingTimePassed(true)
    }, 4500) // Show loading screen for 4.5 seconds minimum

    // Listen for route changes
    const handleStart = () => {
      setIsLoading(true)
      setMinLoadingTimePassed(false)
    }
    
    const handleComplete = () => {
      // Only hide loading when minimum time has passed
      if (minLoadingTimePassed) {
        setIsLoading(false)
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleStart)
    document.addEventListener('DOMContentLoaded', handleComplete)
    window.addEventListener('load', handleComplete)

    // Initial page load
    if (document.readyState === 'complete' && minLoadingTimePassed) {
      setIsLoading(false)
    }

    return () => {
      clearTimeout(minLoadTimer)
      window.removeEventListener('beforeunload', handleStart)
      document.removeEventListener('DOMContentLoaded', handleComplete)
      window.removeEventListener('load', handleComplete)
    }
  }, [minLoadingTimePassed])

  // Watch for minLoadingTimePassed changes
  useEffect(() => {
    if (minLoadingTimePassed && document.readyState === 'complete') {
      setIsLoading(false)
    }
  }, [minLoadingTimePassed])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TutorialProvider>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            >
              <LoadingScreen />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="relative flex min-h-screen flex-col bg-background"
            >
              {!isAdminRoute && <Header />}
              <main className="flex-1">
                {children}
              </main>
              {!isAdminRoute && <Footer />}
              <Toaster />
              <TutorialOverlay />
            </motion.div>
          )}
        </AnimatePresence>
      </TutorialProvider>
    </ThemeProvider>
  )
} 
'use client'

import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { TutorialProvider } from "@/lib/tutorial-context"
import { UserProvider } from "@/components/providers/user-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserProvider>
        <TutorialProvider>
          {children}
        </TutorialProvider>
      </UserProvider>
    </ThemeProvider>
  )
} 

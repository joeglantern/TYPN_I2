"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Initial auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        const redirect = searchParams.get('redirect') || '/admin'
        router.replace(`/login?redirect=${encodeURIComponent(redirect)}`)
        return
      }

      // Check if user is admin
      supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()
        .then(({ data: profile, error }) => {
          if (error || !profile || profile.role !== 'admin') {
            supabase.auth.signOut().then(() => {
              router.replace('/')
            })
            return
          }
          setIsLoading(false)
        })
    }).catch(() => {
      router.replace('/login')
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/login')
        return
      }

      // Check admin status on sign in
      if (event === 'SIGNED_IN') {
        supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error || !profile || profile.role !== 'admin') {
              supabase.auth.signOut().then(() => {
                router.replace('/')
              })
              return
            }
            setIsLoading(false)
          })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading admin portal...</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        {children}
      </div>
      <Toaster />
    </ThemeProvider>
  )
} 
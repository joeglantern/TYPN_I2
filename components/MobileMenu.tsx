"use client"

import { Menu, User, LogOut, Settings, HelpCircle, Home, Info, Layers, Users, Heart, BookOpen, Handshake, ImageIcon, Vote } from "lucide-react"
import { Button } from "./ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import { ScrollArea } from "./ui/scroll-area"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "./ui/use-toast"
import { useRouter } from "next/navigation"
import { useTutorial } from "@/lib/tutorial-context"

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About", icon: Info },
  { href: "/programs", label: "Programs", icon: Layers },
  { href: "/membership", label: "Membership", icon: Users },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/polls", label: "Polls", icon: Vote },
  { href: "/donate", label: "Donate", icon: Heart },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/partners", label: "Partners", icon: Handshake },
]

export function MobileMenu() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const { setShowTutorial } = useTutorial()

  useEffect(() => {
    checkSession()
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function checkSession() {
    const supabase = createClient()
    const session = await supabase.auth.getSession()
    setSession(session.data.session)
    setLoading(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      })
    } else {
      router.push('/')
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="TYPNI Logo" width={32} height={32} className="h-8 w-auto" />
              <span className="font-bold">TYPNI</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-3">
            {session && (
              <div className="flex items-center gap-3 px-2 py-3 mb-2">
                {session.user?.user_metadata?.avatar_url ? (
                  <Image
                    src={session.user.user_metadata.avatar_url}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-medium">
                    {session.user?.user_metadata?.full_name || session.user?.email}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {session.user?.email}
                  </span>
                </div>
              </div>
            )}
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-2 py-2 text-base font-medium transition-colors hover:text-primary"
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
            <div className="my-4 border-t" />
            {session ? (
              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-2 py-2 text-base font-medium transition-colors hover:text-primary"
                >
                  <User className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-2 py-2 text-base font-medium transition-colors hover:text-primary"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <button
                  onClick={() => setShowTutorial(true)}
                  className="flex w-full items-center gap-3 px-2 py-2 text-base font-medium transition-colors hover:text-primary"
                >
                  <HelpCircle className="h-5 w-5" />
                  Tutorial
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-2 py-2 text-base font-medium text-red-500 transition-colors hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="flex w-full items-center gap-3 px-2 py-2 text-base font-medium transition-colors hover:text-primary"
                >
                  <HelpCircle className="h-5 w-5" />
                  Tutorial
                </button>
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-2 py-2 text-base font-medium transition-colors hover:text-primary"
                >
                  <User className="h-5 w-5" />
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-3 px-2 py-2 text-base font-medium transition-colors hover:text-primary"
                >
                  <User className="h-5 w-5" />
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
} 

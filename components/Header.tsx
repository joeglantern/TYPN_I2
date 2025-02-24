"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ModeToggle } from "./ModeToggle"
import { Button } from "./ui/button"
import { Home, Info, Layers, Users, Heart, BookOpen, Handshake, ImageIcon, User, LogOut, Settings, HelpCircle, Vote } from "lucide-react"
import { MobileMenu } from "./MobileMenu"
import { motion } from "framer-motion"
import Image from "next/image"
import { getSession, signOut, uploadAvatar } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useTutorial } from "@/lib/tutorial-context"

export default function Header() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const { setShowTutorial } = useTutorial()

  useEffect(() => {
    checkSession()
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      setSession(session)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function checkSession() {
    try {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      console.log('Current session:', session?.user?.email)
      setSession(session)
    } catch (error) {
      console.error('Session error:', error)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setSession(null)
      toast({
        title: "Success",
        description: "Logged out successfully"
      })
      
      router.refresh()
      router.push('/')
    } catch (error) {
      console.error('Signout error:', error)
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      })
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !session?.user?.id) return

    setUploadingAvatar(true)
    try {
      const avatarUrl = await uploadAvatar(session.user.id, file)
      setSession({
        ...session,
        user: {
          ...session.user,
          user_metadata: {
            ...session.user.user_metadata,
            avatar_url: avatarUrl
          }
        }
      })
      toast({
        title: "Success",
        description: "Avatar updated successfully"
      })
      setAvatarDialogOpen(false)
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive"
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/programs", label: "Programs", icon: Layers },
    { href: "/membership", label: "Membership", icon: Users },
    { href: "/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/polls", label: "Polls", icon: Vote },
    { href: "/blog", label: "Blog", icon: BookOpen },
    { href: "/partners", label: "Partners", icon: Handshake },
    { href: "/donate", label: "Donate", icon: Heart },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="TYPNI Logo" width={40} height={40} className="h-10 w-auto" />
            <span className="hidden font-bold sm:inline-block">TYPNI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
                  pathname === link.href ? 'text-primary' : ''
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowTutorial(true)}
            className="hidden md:flex"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          <ModeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  {session.user?.user_metadata?.avatar_url ? (
                    <Image
                      src={session.user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="rounded-full object-cover"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {session.user?.user_metadata?.full_name || session.user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowTutorial(true)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Tutorial
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => router.push('/login')} className="hidden sm:flex">
                Sign in
              </Button>
              <Button onClick={() => router.push('/signup')}>
                Sign up
              </Button>
            </div>
          )}
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}


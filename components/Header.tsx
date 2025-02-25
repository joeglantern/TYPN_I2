"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { 
  Menu, 
  X, 
  Home,
  BookOpen,
  Users,
  Calendar,
  Image as ImageIcon,
  Heart,
  Info,
  MessageSquare,
  Vote,
  Handshake,
  ChevronRight,
  LogOut,
  User
} from "lucide-react"
import Image from "next/image"
import { ThemeToggle } from './theme-toggle'
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "./ui/scroll-area"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "./ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
  }

  async function handleSignOut() {
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const mainNavLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/blog", label: "Blog", icon: BookOpen },
    { href: "/programs", label: "Programs", icon: Users },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/gallery", label: "Gallery", icon: ImageIcon },
  ]

  const secondaryNavLinks = [
    { href: "/donate", label: "Donate", icon: Heart },
    { href: "/about", label: "About", icon: Info },
    { href: "/membership", label: "Membership", icon: Users },
    { href: "/polls", label: "Polls", icon: Vote },
    { href: "/partners", label: "Partners", icon: Handshake }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="TYPNI Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold hidden sm:inline-block">TYPNI</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-2">
          {mainNavLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button 
                variant="ghost" 
                size="sm"
                className={`text-sm ${pathname === link.href ? 'bg-muted' : ''}`}
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.label}
              </Button>
              </Link>
            ))}
          {/* Additional Navigation Links */}
          <Link href="/membership">
            <Button variant="ghost" size="sm" className="text-sm">
              <Users className="h-4 w-4 mr-2" />
              Membership
            </Button>
          </Link>
          <Link href="/donate">
            <Button variant="ghost" size="sm" className="text-sm">
              <Heart className="h-4 w-4 mr-2" />
              Donate
            </Button>
          </Link>
          <Link href="/partners">
            <Button variant="ghost" size="sm" className="text-sm">
              <Handshake className="h-4 w-4 mr-2" />
              Partners
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="sm" className="text-sm">
              <Info className="h-4 w-4 mr-2" />
              About
            </Button>
          </Link>
          <ThemeToggle />
          {!loading && (
            session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="relative z-50"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile navigation */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsOpen(false)}
              />
              
              {/* New Mobile Menu */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="fixed top-0 left-0 right-0 bg-background border-b shadow-lg z-50 md:hidden"
              >
                <div className="container py-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8">
                    <Image
                          src="/logo.png"
                          alt="TYPNI Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-bold">TYPNI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThemeToggle />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* User Section */}
                  {!loading && (
                    <div className="flex items-center justify-between gap-2 py-2 border-y">
                      {session ? (
                        <>
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <span className="font-medium text-sm truncate max-w-[200px]">
                              {session.user.email}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleSignOut}
                            className="text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                          >
                            <LogOut className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" className="flex-1" asChild>
                            <Link href="/signup">Sign Up</Link>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href="/login">Sign In</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Navigation Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[...mainNavLinks, ...secondaryNavLinks].map((link) => (
                      <Link key={link.href} href={link.href}>
                        <Button 
                          variant={pathname === link.href ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-start text-sm"
                          onClick={() => setIsOpen(false)}
                        >
                          <link.icon className="h-4 w-4 mr-2" />
                          {link.label}
                </Button>
                      </Link>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  {session && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href="/dashboard">
                  Dashboard
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href="/dashboard/settings">
                  Settings
                        </Link>
              </Button>
            </div>
          )}
          </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}


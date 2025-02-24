"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Globe,
  BookOpen,
  Heart,
  Handshake,
  Settings,
  Activity,
  LogOut,
  FileText,
  Calendar,
  ImageIcon
} from "lucide-react"

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col fixed h-screen border-r">
      <div className="flex items-center gap-2 px-6 py-4 border-b">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="relative w-8 h-8">
            <Image
              src="/logo 2.08.51 PM.png"
              alt="TYPNI Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold text-xl">TYPNI Admin</span>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Main
          </p>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/admin">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Community
          </p>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/membership">
                <UserPlus className="mr-2 h-4 w-4" />
                Membership
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Content
          </p>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/programs">
                <Globe className="mr-2 h-4 w-4" />
                Programs
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/events">
                <Calendar className="mr-2 h-4 w-4" />
                Events
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/blog">
                <BookOpen className="mr-2 h-4 w-4" />
                Blog
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/gallery">
                <ImageIcon className="mr-2 h-4 w-4" />
                Gallery
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/donations">
                <Heart className="mr-2 h-4 w-4" />
                Donations
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/partners">
                <Handshake className="mr-2 h-4 w-4" />
                Partners
              </Link>
            </Button>
          </div>
        </div>

        <div>
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            System
          </p>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/admin/activity">
                <Activity className="mr-2 h-4 w-4" />
                Activity Log
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
} 
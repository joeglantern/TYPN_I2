"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Instagram, Twitter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
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
            <p className="text-sm text-muted-foreground">
              Empowering youth globally through connection and collaboration.
            </p>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-[200px]"
              />
                <Button size="sm">
                  <Mail className="h-4 w-4" />
              </Button>
            </div>
              <div className="flex space-x-4">
                  <a 
                    href="https://instagram.com/typn_i"
                    target="_blank"
                    rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a 
                    href="https://twitter.com/typn_i"
                    target="_blank"
                    rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              <Link href="/programs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Programs
                </Link>
              <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Events
                </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Blog
                </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <nav className="flex flex-col space-y-2">
              <a
                href="mailto:niaje@typni.org"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                niaje@typni.org
              </a>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
                </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} TYPNI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}


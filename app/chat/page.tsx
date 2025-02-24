"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Construction, Home, Hash, ChevronRight, Send, Users, 
  Smile, Menu, X, BadgeCheck, ChevronLeft, ChevronDown 
} from "lucide-react"
import Image from "next/image"

const typniColors = {
  maroon: "#800020", // TYPNI maroon color
  maroonLight: "rgba(128, 0, 32, 0.1)", // Light maroon for backgrounds
  maroonMedium: "rgba(128, 0, 32, 0.2)", // Medium maroon for borders
  maroonDark: "rgba(128, 0, 32, 0.9)", // Darker maroon for hover states
}

const channels = [
  { id: "intro", name: "Introduction", category: "General" },
  { id: "gtume", name: "GTUME", category: "General" },
  { id: "niaje", name: "Niaje", category: "General" },
  { id: "forums", name: "Community Forums", category: "Community" },
]

const placeholderMessages = [
  {
    id: 1,
    user: "Charlene Ruto",
    avatar: "/avatars/avatar1.png",
    content: "Welcome to TYPNI Chat! 🎉 I'm excited to connect with young leaders from across Africa. Together, we can make a real difference! 💫",
    timestamp: "Today at 10:30 AM",
    verified: true,
    role: "Youth Ambassador"
  },
  {
    id: 2,
    user: "Joseph Liban",
    avatar: "/avatars/avatar2.png",
    content: "Karibu everyone! 🌟 This platform is going to be amazing for sharing ideas and collaborating on youth initiatives. Can't wait to hear your stories!",
    timestamp: "Today at 10:32 AM",
    verified: false,
    role: "Community Leader"
  },
  {
    id: 3,
    user: "Festus Orina",
    avatar: "/avatars/avatar3.png",
    content: "Hello TYPNI family! 👋 Looking forward to engaging with all of you. Let's make this space vibrant with youth voices and innovative ideas!",
    timestamp: "Today at 10:35 AM",
    verified: false,
    role: "Program Coordinator"
  },
  {
    id: 4,
    user: "Jermaine Momanyi",
    avatar: "/avatars/avatar4.png",
    content: "Jambo everyone! 🌍 Thrilled to be part of this amazing community. Let's use this platform to inspire and empower each other. The future is in our hands! ✨",
    timestamp: "Today at 10:37 AM",
    verified: true,
    role: "Youth Mentor"
  }
]

// Update button styles
const buttonClasses = {
  primary: "bg-[#800020] hover:bg-[#800020]/90 text-white",
  ghost: "hover:bg-[#800020]/10 hover:text-[#800020]",
  icon: "hover:bg-[#800020]/10 hover:text-[#800020]"
}

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState("intro")
  const [message, setMessage] = useState("")
  const [showLeftSidebar, setShowLeftSidebar] = useState(true)
  const [showRightSidebar, setShowRightSidebar] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Update isMobile state on mount and resize
  useState(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setShowLeftSidebar(false)
        setShowRightSidebar(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  })

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <AnimatePresence mode="wait">
        {showLeftSidebar && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-64 bg-muted/50 backdrop-blur-sm border-r flex flex-col absolute md:relative h-full z-20"
            style={{ borderColor: typniColors.maroonLight }}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className={`gap-2 ${buttonClasses.ghost}`}
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowLeftSidebar(false)}
                  className={buttonClasses.ghost}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {Object.entries(channels.reduce((acc, channel) => {
                  if (!acc[channel.category]) {
                    acc[channel.category] = []
                  }
                  acc[channel.category].push(channel)
                  return acc
                }, {} as Record<string, typeof channels>)).map(([category, channels]) => (
                  <div key={category}>
                    <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground mb-2">
                      <ChevronDown className="h-3 w-3" />
                      {category}
                    </div>
                    <div className="space-y-1">
                      {channels.map((channel) => (
                        <button
                          key={channel.id}
                          onClick={() => {
                            setSelectedChannel(channel.id)
                            if (isMobile) setShowLeftSidebar(false)
                          }}
                          className={`w-full text-left px-2 py-1 rounded-md text-sm flex items-center gap-2 transition-colors ${
                            selectedChannel === channel.id
                              ? "text-[#800020] bg-[#800020]/10"
                              : "hover:bg-muted-foreground/10"
                          }`}
                        >
                          <Hash className="h-4 w-4" />
                          {channel.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Channel Header */}
        <div className="h-14 border-b flex items-center px-4 gap-2 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {!showLeftSidebar && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowLeftSidebar(true)}
                className={buttonClasses.ghost}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            <Hash className="h-5 w-5 text-[#800020]" />
            <span className="font-semibold text-[#800020]">
              {channels.find(c => c.id === selectedChannel)?.name}
            </span>
          </div>
          <div className="ml-auto">
            {!showRightSidebar && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowRightSidebar(true)}
                className={buttonClasses.ghost}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          {/* Under Construction Notice */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#800020]/5 via-[#800020]/10 to-[#800020]/5 p-1"
          >
            <div className="relative flex items-center justify-center gap-3 p-6 rounded-md bg-background/95 backdrop-blur-sm border border-[#800020]/20">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  y: [0, -5, 0, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-[#800020]"
              >
                <Construction className="h-8 w-8" />
              </motion.div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 text-[#800020]">
                  Chat Coming Soon!
                </h3>
                <p className="text-muted-foreground">
                  We're building something amazing for you. The chat functionality will be available soon with exciting features!
                </p>
              </div>
            </div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#800020]/10 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>

          {/* Placeholder Messages */}
          <div className="space-y-6 mt-8">
            {placeholderMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
              >
                <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-[#800020]/20">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-[#800020]/10">
                      {msg.avatar ? (
                        <Image
                          src={msg.avatar}
                          alt={msg.user}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <Users className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    {msg.role && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -bottom-1 -right-1 bg-[#800020]/10 px-2 py-0.5 rounded-full text-[10px] font-medium border border-[#800020]/20"
                      >
                        {msg.role}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold bg-gradient-to-r from-[#800020]/80 to-[#800020] bg-clip-text text-transparent">
                        {msg.user}
                      </span>
                      {msg.verified && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <BadgeCheck className="h-4 w-4 text-[#800020]" />
                        </motion.div>
                      )}
                      <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                    </div>
                    <motion.p 
                      className="text-sm leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {msg.content}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-background/95 backdrop-blur-sm" style={{ borderColor: typniColors.maroonLight }}>
          <div className="flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message #${channels.find(c => c.id === selectedChannel)?.name}`}
              className="flex-1 focus-visible:ring-[#800020]/20"
            />
            <Button 
              size="icon" 
              variant="ghost"
              className={buttonClasses.ghost}
            >
              <Smile className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              className={buttonClasses.primary}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Members */}
      <AnimatePresence mode="wait">
        {showRightSidebar && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-60 bg-muted/50 backdrop-blur-sm border-l absolute md:relative right-0 h-full z-20"
            style={{ borderColor: typniColors.maroonLight }}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2 text-[#800020]">
                <Users className="h-4 w-4" />
                Members
              </h3>
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowRightSidebar(false)}
                  className={buttonClasses.ghost}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <ScrollArea className="p-4">
              <div className="space-y-2">
                {placeholderMessages.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-[#800020]/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-2 ring-[#800020]/10">
                      {member.avatar ? (
                        <Image
                          src={member.avatar}
                          alt={member.user}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <Users className="h-4 w-4 text-[#800020]" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-[#800020]">{member.user}</span>
                      {member.verified && (
                        <BadgeCheck className="h-3 w-3 text-[#800020]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 

"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"
import { Bot } from "lucide-react"

export function WelcomeDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Check if the dialog has been shown this session
    const hasShownDialog = sessionStorage.getItem('hasShownWelcomeDialog')
    if (!hasShownDialog) {
      setOpen(true)
      sessionStorage.setItem('hasShownWelcomeDialog', 'true')
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="TYPNI Logo"
                fill
                className="object-contain"
              />
            </div>
            Welcome to TYPNI AI
          </DialogTitle>
          <DialogDescription className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p>
                Welcome to our interactive platform! We're excited to have you here.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-muted p-4 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-primary mt-1" />
                <div className="space-y-2">
                  <p className="font-medium">Important Note About Polls:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>You can only vote once per poll</li>
                    <li>Your vote cannot be changed once submitted</li>
                    <li>Results are updated in real-time</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-end"
        >
          <Button onClick={() => setOpen(false)}>
            Got it, thanks!
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
} 
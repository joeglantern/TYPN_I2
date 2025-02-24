"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { signUp, supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2, Mail } from "lucide-react"

export default function SignUpForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    heardFrom: "",
  })
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (e.target.name === 'username') {
      checkUsername(e.target.value)
    }
  }

  const checkUsername = async (username: string) => {
    if (!username) {
      setUsernameAvailable(null)
      return
    }

    setCheckingUsername(true)
    console.log('Checking username availability:', username)
    
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('username', username)

      if (error) {
        console.error('Username check error:', error)
        throw error
      }
      
      console.log('Username check result:', { count })
      setUsernameAvailable(count === 0)
    } catch (error) {
      console.error('Error checking username:', error)
      setUsernameAvailable(null)
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!usernameAvailable) {
        throw new Error("Username is not available")
      }

      // Create auth user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.name
          }
        }
      })

      if (error) throw error

      if (!data.user) {
        throw new Error("Failed to create account")
      }

      // Show success state
      setSuccess(true)

      // Redirect to login page after 5 seconds
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(formData.email)}`)
      }, 5000)

    } catch (error: any) {
      console.error('Signup error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {success ? (
        <motion.div
          className="bg-card p-8 rounded-lg shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1 
              }}
            >
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </motion.div>
            <motion.h2 
              className="text-2xl font-bold text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Account Created Successfully!
            </motion.h2>
            <motion.div 
              className="flex items-center justify-center space-x-2 text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Mail className="w-5 h-5" />
              <p>Please check your email to verify your account</p>
            </motion.div>
            <motion.p 
              className="text-sm text-muted-foreground text-center mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Redirecting you to login in a few seconds...
            </motion.p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="bg-card p-8 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                type="text" 
                required 
                value={formData.name} 
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="username">
                Username
                {checkingUsername && <span className="ml-2 text-sm text-muted-foreground">(Checking...)</span>}
                {usernameAvailable === true && <span className="ml-2 text-sm text-green-600">Available</span>}
                {usernameAvailable === false && <span className="ml-2 text-sm text-red-600">Not available</span>}
              </Label>
              <Input 
                id="username" 
                name="username" 
                type="text" 
                required 
                value={formData.username} 
                onChange={handleChange}
                disabled={loading}
                pattern="^[a-zA-Z0-9_-]{3,16}$"
                title="Username must be 3-16 characters long and can only contain letters, numbers, underscores, and hyphens"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be your public username visible to other users
              </p>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                required 
                value={formData.email} 
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your email will be kept private
              </p>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="heardFrom">How did you hear about us?</Label>
              <Select 
                onValueChange={(value) => setFormData(prev => ({ ...prev, heardFrom: value }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="friend">Friend or Family</SelectItem>
                  <SelectItem value="event">TYPNI Event</SelectItem>
                  <SelectItem value="search">Search Engine</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || checkingUsername || usernameAvailable === false}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


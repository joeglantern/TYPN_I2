"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { signIn, supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Mail, AlertCircle } from "lucide-react"
import { FaGoogle } from "react-icons/fa"

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const email = searchParams.get('email')
    if (email) {
      setFormData(prev => ({ ...prev, email }))
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setShowVerification(false)
  }

  const handleResendVerification = async () => {
    try {
      setLoading(true)
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      })
      if (resendError) throw resendError
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification link."
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setShowVerification(false)

    try {
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setShowVerification(true)
          throw new Error('Please verify your email before logging in')
        }
        throw error
      }

      if (data.session) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        // If no profile exists, create one
        if (!profile) {
          const { error: createError } = await supabase
            .from('users')
            .insert([{
              id: data.session.user.id,
              email: data.session.user.email,
              username: data.session.user.email?.split('@')[0],
              full_name: data.session.user.user_metadata?.full_name || '',
              role: 'member',
              status: 'active'
            }])

          if (createError) {
            throw createError
          }
        }

        toast({
          title: "Success",
          description: "Logged in successfully!"
        })

        // Force a router refresh to update the header state
        router.refresh()
        
        // Redirect based on role
        if (profile?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (!error.message.includes('Please verify your email')) {
        toast({
          title: "Error",
          description: error.message || "Invalid email or password.",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      // The redirect will happen automatically
    } catch (error: any) {
      console.error('Google sign in error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-card rounded-lg border shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      {showVerification && (
        <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>Please verify your email before logging in.</p>
          </div>
          <Button
            variant="link"
            className="mt-2 text-yellow-800 underline"
            onClick={handleResendVerification}
            disabled={loading}
          >
            Resend verification email
          </Button>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <FaGoogle className="mr-2 h-4 w-4" />
        Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}


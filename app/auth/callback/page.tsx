'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('Handling auth callback...')
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Auth session:', session)

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=' + encodeURIComponent(error.message))
          return
        }

        if (!session?.user) {
          console.error('No session found')
          router.push('/login?error=no-session')
          return
        }

        // Check if user profile exists
        console.log('Checking user profile...')
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
        }

        if (!profile) {
          console.log('Creating new user profile...')
          // Create user profile for OAuth users
          const { error: createError } = await supabase
            .from('users')
            .insert([{
              id: session.user.id,
              username: `user_${Math.random().toString(36).substring(2, 10)}`, // Generate random username
              full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
              email: session.user.email,
              role: 'member',
              status: 'pending'
            }])

          if (createError) {
            console.error('Profile creation error:', createError)
            router.push('/login?error=' + encodeURIComponent('Failed to create user profile'))
            return
          }
        }

        console.log('Auth callback successful, redirecting to dashboard...')
        router.push('/dashboard')
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/login?error=unexpected-error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
} 
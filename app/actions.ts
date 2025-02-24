'use server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createSupabaseServerClient() {
  const cookieStore = cookies()
  
  return createClient({
    cookies: {
      async get(name: string) {
        const cookie = await cookieStore.get(name)
        return cookie?.value
      },
      async set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options)
        } catch (error) {
          // Handle error setting cookie
          console.error('Error setting cookie:', error)
        }
      },
      async remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        } catch (error) {
          // Handle error removing cookie
          console.error('Error removing cookie:', error)
        }
      },
    },
  })
}

interface BlogPost {
  title: string
  description: string
  content: string
  media_url?: string
}

export async function createBlogPost(data: BlogPost) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('content')
    .insert([
      {
        ...data,
        type: 'blog',
        status: 'published',
        created_at: new Date().toISOString()
      }
    ])

  if (error) {
    console.error('Error creating blog post:', error)
    throw new Error('Failed to create blog post')
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}

export async function getPrograms() {
  const supabase = await createServerSupabaseClient()
  
  const { data: programs } = await supabase
    .from('content')
    .select('*')
    .eq('type', 'program')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    
  return programs
}

export async function createProgram(data: {
  title: string
  description: string
  content: string
  media_url?: string
  duration?: string
  location?: string
}) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('content')
    .insert([
      {
        ...data,
        type: 'program',
        status: 'published',
        created_at: new Date().toISOString()
      }
    ])

  if (error) {
    console.error('Error creating program:', error)
    throw new Error('Failed to create program')
  }

  revalidatePath('/programs')
  revalidatePath('/admin/programs')
}

export async function createGalleryItem(data: {
  title: string
  description: string
  media_url: string
}) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('content')
    .insert([
      {
        ...data,
        type: 'gallery',
        status: 'published',
        created_at: new Date().toISOString()
      }
    ])

  if (error) {
    console.error('Error creating gallery item:', error)
    throw new Error('Failed to create gallery item')
  }

  revalidatePath('/gallery')
  revalidatePath('/admin/gallery')
}

export async function createEvent(data: {
  title: string
  description: string
  content: string
  media_url?: string
  start_date: string
  end_date?: string
  location?: string
}) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('content')
    .insert([
      {
        ...data,
        type: 'event',
        status: 'published',
        created_at: new Date().toISOString()
      }
    ])

  if (error) {
    console.error('Error creating event:', error)
    throw new Error('Failed to create event')
  }

  revalidatePath('/events')
  revalidatePath('/admin/events')
}

export async function getBlogPosts() {
  const supabase = await createServerSupabaseClient()
  
  const { data: posts } = await supabase
    .from('content')
    .select('*')
    .eq('type', 'blog')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    
  return posts
}

export async function getBlogPost(id: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: post } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .eq('type', 'blog')
    .single()
    
  return post
} 

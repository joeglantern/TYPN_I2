import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { revalidatePath } from 'next/cache'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
)

// Auth functions
export async function signUp(email: string, password: string, metadata: { full_name: string, username: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  
  if (error) throw error

  if (data.user) {
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: data.user.id,
        username: metadata.username,
        full_name: metadata.full_name,
        email: email,
        role: 'member',
        status: 'active'
      }])
    
    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(data.user.id)
      throw new Error('Failed to create user profile. Please try again.')
    }
  }

  return { data }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid email or password.')
    } else if (error.message.includes('Email not confirmed')) {
      throw new Error('Please confirm your email before logging in.')
    }
    throw error
  }
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Type definitions for our database tables
export type Blog = {
  id: number
  title: string
  author: string
  category: string
  status: 'Published' | 'Draft'
  thumbnail: string
  content: string
  views: number
  publishDate: string | null
  created_at: string
  updated_at: string
}

export type Program = {
  id: number
  title: string
  category: string
  status: 'Active' | 'Planning' | 'Completed'
  location: string
  participants: number
  startDate: string
  endDate: string
  thumbnail: string
  description: string
  created_at: string
  updated_at: string
}

export type Partner = {
  id: number
  name: string
  type: string
  status: 'Active' | 'Pending' | 'Inactive'
  location: string
  programs: number
  partner_since: string
  logo: string
  description: string
  created_at: string
  updated_at: string
}

export type User = {
  id: number
  name: string
  email: string
  role: 'Member' | 'Chapter Leader' | 'Admin'
  chapter: string
  status: 'Active' | 'Pending' | 'Inactive'
  joinDate: string
  profileImage: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export type Donation = {
  id: number
  donor: string
  email: string
  amount: number
  program: string
  type: 'One-time' | 'Monthly'
  status: 'Completed' | 'Pending' | 'Active'
  date: string
  receiptNumber: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ActivityLog = {
  id: number
  userId: number
  action: string
  entityType: string
  entityId: number
  details: Record<string, any>
  ipAddress: string | null
  created_at: string
}

export interface Gallery {
  id: string
  title: string
  description?: string
  image_url: string
  show_in_carousel: boolean
  created_at: string
}

// Database helper functions
export async function fetchBlogPosts() {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function fetchPrograms() {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function fetchPartners() {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function fetchUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function fetchDonations() {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function fetchMessages(userId: number) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function fetchActivityLogs(userId?: number) {
  const query = supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (userId) {
    query.eq('user_id', userId)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchGalleryItems() {
  try {
    console.log('Starting gallery fetch...')
    const { data, error, status } = await supabase
      .from('content')
      .select('*')
      .eq('type', 'gallery')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    if (status === 401) {
      throw new Error('Not authenticated')
    }

    console.log('Gallery fetch successful:', data)
    return data as Gallery[]
  } catch (error) {
    console.error('Error in fetchGalleryItems:', error)
    throw error
  }
}

// Create functions
export async function createBlogPost(post: Omit<Blog, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('blogs')
    .insert([post])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function createProgram(program: Omit<Program, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('programs')
    .insert([program])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function createPartner(partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('partners')
    .insert([partner])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function createDonation(donation: Omit<Donation, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('donations')
    .insert([donation])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function createActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert([log])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function createGalleryItem(item: Omit<Gallery, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('content')
    .insert([
      {
        ...item,
        type: 'gallery'
      }
    ])
    .select()
  
  if (error) throw error
  return data[0]
}

// Update functions
export async function updateBlogPost(id: number, updates: Partial<Blog>) {
  const { data, error } = await supabase
    .from('blogs')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateProgram(id: number, updates: Partial<Program>) {
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updatePartner(id: number, updates: Partial<Partner>) {
  const { data, error } = await supabase
    .from('partners')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateUser(id: number, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateDonation(id: number, updates: Partial<Donation>) {
  const { data, error } = await supabase
    .from('donations')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateGalleryItem(id: number, updates: {
  title?: string
  description?: string
  show_in_carousel?: boolean
}) {
  const { data, error } = await supabase
    .from('gallery')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating gallery item:', error)
    throw error
  }

  return data
}

// Delete functions
export async function deleteBlogPost(id: number) {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteProgram(id: number) {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function deletePartner(id: number) {
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteUser(id: number) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteDonation(id: number) {
  const { error } = await supabase
    .from('donations')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteGalleryItem(id: string) {
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id)
    .eq('type', 'gallery')
    
  if (error) throw error
  
  revalidatePath('/gallery')
  revalidatePath('/admin/gallery')
}

// Content management functions
export async function createContent(data: {
  title: string
  description?: string
  content?: string | null
  type: 'blog' | 'gallery' | 'program' | 'event'
  status: 'published' | 'draft'
  media_url?: string
  show_in_carousel?: boolean
}) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      throw new Error('Not authenticated')
    }

    console.log('Creating content with session user:', session.user.id)

    // Prepare the content data
    const contentData = {
      title: data.title,
      description: data.description || null,
      content: data.content || null,
      type: data.type,
      status: data.status,
      media_url: data.media_url || null,
      show_in_carousel: data.show_in_carousel || false,
      author_id: session.user.id
    }

    console.log('Prepared content data:', contentData)

    const { data: result, error } = await supabase
      .from('content')
      .insert([contentData])
      .select()
      .single()

    if (error) {
      console.error('Database error creating content:', error)
      throw new Error(error.message)
    }

    if (!result) {
      throw new Error('No result returned from content creation')
    }

    console.log('Content created successfully:', result)
    return result
  } catch (error) {
    console.error('Error in createContent:', error)
    throw error instanceof Error 
      ? error 
      : new Error('Failed to create content')
  }
}

export async function updateContent(id: string, data: Partial<{
  title: string
  description: string
  content: string
  status: 'published' | 'draft'
  media_url: string
  show_in_carousel: boolean
}>) {
  const { data: result, error } = await supabase
    .from('content')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating content:', error)
    throw error
  }

  return result
}

export async function deleteContent(id: string) {
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Avatar management functions
export async function uploadAvatar(userId: string, file: File) {
  try {
    // Upload the file to storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Math.random()}.${fileExt}`
    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Update the user profile with the new avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateError) throw updateError

    return publicUrl
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw error
  }
}

export async function updateUserProfile(userId: string, updates: {
  full_name?: string
  avatar_url?: string
  bio?: string
  chapter?: string
}) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
} 
import { createClient } from "@/utils/supabase/client"

interface LogActivityProps {
  title: string
  description: string
  type: 'member' | 'program' | 'donation' | 'partner'
  userId?: string
}

export async function logActivity({ title, description, type, userId }: LogActivityProps) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('activity_log')
      .insert([
        {
          title,
          description,
          type,
          user_id: userId,
          created_at: new Date().toISOString()
        }
      ])

    if (error) throw error
  } catch (error) {
    console.error('Error logging activity:', error)
  }
} 
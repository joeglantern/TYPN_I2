export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      content: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string | null
          type: 'blog' | 'gallery' | 'program' | 'event'
          status: 'draft' | 'published'
          media_url: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content?: string | null
          type: 'blog' | 'gallery' | 'program' | 'event'
          status?: 'draft' | 'published'
          media_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string | null
          type?: 'blog' | 'gallery' | 'program' | 'event'
          status?: 'draft' | 'published'
          media_url?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'member' | 'moderator'
          status: 'active' | 'inactive' | 'banned'
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'member' | 'moderator'
          status?: 'active' | 'inactive' | 'banned'
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'member' | 'moderator'
          status?: 'active' | 'inactive' | 'banned'
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content_id: string
          author_id: string
          comment: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_id: string
          author_id: string
          comment: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          author_id?: string
          comment?: string
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          donor_name: string
          donor_email: string
          amount: number
          currency: string
          program_id: string | null
          type: 'one-time' | 'monthly' | 'annual'
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_name: string
          donor_email: string
          amount: number
          currency?: string
          program_id?: string | null
          type: 'one-time' | 'monthly' | 'annual'
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_name?: string
          donor_email?: string
          amount?: number
          currency?: string
          program_id?: string | null
          type?: 'one-time' | 'monthly' | 'annual'
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'member' | 'moderator'
      user_status: 'active' | 'inactive' | 'banned'
      content_type: 'blog' | 'program' | 'gallery' | 'event'
      content_status: 'draft' | 'published' | 'archived'
    }
  }
} 
import { createServerClient } from '@supabase/ssr'
import { type CookieOptions } from '@supabase/ssr'
import { type Database } from '../database.types'

export function createClient(cookieOptions: {
  cookies: {
    get: (name: string) => Promise<string | undefined>
    set: (name: string, value: string, options: CookieOptions) => Promise<void>
    remove: (name: string, options: CookieOptions) => Promise<void>
  }
}) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieOptions.cookies
    }
  )
} 
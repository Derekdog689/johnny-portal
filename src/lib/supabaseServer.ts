import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

/**
 * Used by server actions and API routes.
 * Returns a Supabase client scoped to the current request.
 */
export const supabaseServer = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // read-only cookieStore on edge environments
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // same as above
          }
        },
      },
    }
  )
}

/**
 * Compatibility export for modules that call createSupabaseServer()
 */
export const createSupabaseServer = (url?: string, anonKey?: string) =>
  createClient(
    url || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase server client that works in both edge and node runtimes.
 */
export const createAuthClient = async () => {
  // ✅ handle both promise-based and sync cookies()
  const cookieStore: any = (typeof (await cookies) === 'function')
    ? await cookies()
    : cookies()

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
            // read-only cookieStore on edge runtimes
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
 * Gets the current authenticated user (server-side).
 */
export async function getUser() {
  const supabase = await createAuthClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

/**
 * Signs out the current user (client-side).
 */
export async function signOut() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  await supabase.auth.signOut()
  window.location.href = '/signin'
}

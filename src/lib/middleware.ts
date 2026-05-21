import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase Client
 * 
 * Para uso em Server Components ou API Routes (se migrar para Next.js).
 * Este arquivo é preparado para integração futura com SSR full-stack.
 * 
 * Para SPAs simples, o createBrowserClient do lib/supabase.ts é suficiente.
 */

// Environment variables para server-side
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Cria um cliente Supabase para server-side
 * Requer cookies do Next.js ou similar framework
 */
export async function getServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // Handle cookie setting in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', options)
          } catch {
            // Handle cookie removal
          }
        },
      },
    }
  )
}

// Re-export browser client for convenience
export { createBrowserClient } from './supabase'
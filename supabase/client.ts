import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Supabase para uso em Client Components ("use client").
 * A sessão é lida/escrita nos cookies do browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

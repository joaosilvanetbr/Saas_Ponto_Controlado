import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para uso no navegador (Browser Client)
 * 
 * Este cliente é usado em componentes React para:
 * - Queries ao banco
 * - Mutações (insert, update, delete)
 * - Auth state management
 * 
 * O @supabase/ssr gerencia automaticamente os cookies de sessão
 * e sincroniza com o server-side client (se usado).
 */
export function createClient() {
  return createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  )
}

// Cliente padrão exportado para uso direto
export const supabase = createClient()
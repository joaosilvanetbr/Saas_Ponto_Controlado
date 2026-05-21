import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase Middleware Helper
 * 
 * Para uso em frameworks full-stack (Next.js, SvelteKit, etc.)
 * que suportam middleware edge functions.
 * 
 * Adapta o padrão do @supabase/ssr para trabalhar com Next.js middleware.
 */

/**
 * Atualiza a sessão do usuário
 * Deve ser chamado no início de cada middleware para validar tokens
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  // Cria cliente Supabase com contexto de cookies
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // Atualiza sessão (valida/renova tokens automaticamente)
  await supabase.auth.getUser()

  return response
}

// URLs públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/login', '/auth/callback']

/**
 * Verifica se a rota é pública
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Middleware principal para proteção de rotas
 * Compatível com Next.js App Router
 */
export function middleware(request: NextRequest) {
  return updateSession(request)
}

// Configuração do matcher (para Next.js config)
// export const config = {
//   matcher: [
//     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//   ],
// }
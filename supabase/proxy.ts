import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Renova a sessão do Supabase a cada requisição e repassa os cookies
 * atualizados tanto para o request (usado pelos Server Components) quanto
 * para a response (usada pelo browser).
 *
 * Chamado pelo `proxy.ts` da raiz do projeto (em Next 16 o antigo
 * `middleware.ts` foi renomeado para `proxy.ts`).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Não coloque nenhuma lógica entre createServerClient e getUser(): um erro
  // aqui pode fazer o usuário ser deslogado de forma aleatória.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANTE: retorne sempre o `supabaseResponse` (ou copie seus cookies
  // para outra response), senão a sessão pode dessincronizar.
  return supabaseResponse
}

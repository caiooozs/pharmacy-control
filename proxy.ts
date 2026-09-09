import type { NextRequest } from 'next/server'
import { updateSession } from '@/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Roda em todas as rotas, exceto:
     * - _next/static e _next/image (assets do build)
     * - favicon.ico e arquivos de imagem
     * Ajuste conforme necessário para liberar rotas públicas.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

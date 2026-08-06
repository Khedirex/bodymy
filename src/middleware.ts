import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// IMPORTANTE: o middleware roda no EDGE RUNTIME. Mantemos os imports
// mínimos e compatíveis com Edge (nada de Sentry, instrumentation ou
// libs Node-only). Só next/server + @supabase/ssr.

type CookieToSet = { name: string; value: string; options: CookieOptions }

// Rotas públicas (não exigem sessão).
const PUBLIC_PATHS = ['/login', '/auth']

// Sanea a URL do Supabase inline (o middleware não importa @/lib/env para
// ficar leve no Edge). Remove aspas, espaços, /rest/v1 e barra final —
// erros comuns de cópia que, sem tratamento, fazem o fetch quebrar.
function sanitizeUrl(raw: string | undefined): string {
  let s = (raw ?? '').trim().replace(/^["']|["']$/g, '')
  if (!s) return ''
  s = s.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
  return s
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabaseUrl = sanitizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseAnon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()

  // Sem Supabase configurado, não bloqueia (permite rodar a UI).
  if (!supabaseUrl || !supabaseAnon) return response

  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'))

  try {
    let res = response

    const supabase = createServerClient(supabaseUrl, supabaseAnon, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          res = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          )
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user && !isPublic) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', path)
      return NextResponse.redirect(url)
    }

    // Usuário logado tentando ver /login → manda pra Home.
    if (user && path === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.search = ''
      return NextResponse.redirect(url)
    }

    return res
  } catch (err) {
    // FAIL-OPEN: um erro aqui NUNCA pode derrubar o app inteiro (500 em
    // todas as rotas). Logamos (aparece nos logs de Function da Vercel) e
    // deixamos a requisição seguir. As páginas protegidas ainda validam a
    // sessão por conta própria (getProfile → redireciona para /login).
    // eslint-disable-next-line no-console
    console.error('[middleware] falha ao renovar/validar sessão — seguindo (fail-open):', {
      path,
      message: err instanceof Error ? err.message : String(err),
    })
    return response
  }
}

export const config = {
  // Roda em tudo, exceto: rotas de API (fazem a própria auth — o webhook
  // precisa ser público e as demais retornam 401 por conta própria),
  // assets estáticos, imagens, manifest e o service worker.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|apple-touch-icon.png).*)',
  ],
}

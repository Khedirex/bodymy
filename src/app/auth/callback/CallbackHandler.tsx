'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Processa o retorno do magic link. Cobre os dois formatos:
//  - implicit flow: tokens no #fragment (#access_token=...&refresh_token=...)
//  - code flow (PKCE): ?code=... na query string
// Estabelece a sessão e navega com caminho RELATIVO (sem host/porta — evita
// o bug do :3000 duplicado em Codespaces).
export function CallbackHandler() {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(null)
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    // Captura hash/query ANTES de criar o client (para o auto-detect não
    // consumir o fragmento antes de lermos).
    const rawHash = window.location.hash.replace(/^#/, '')
    const hashParams = new URLSearchParams(rawHash)
    const queryParams = new URLSearchParams(window.location.search)

    const next = sanitizeNext(queryParams.get('next'))
    const code = queryParams.get('code')
    const access_token = hashParams.get('access_token')
    const refresh_token = hashParams.get('refresh_token')
    const errNoFragmento = hashParams.get('error_description') || hashParams.get('error')

    // Log de diagnóstico (console do NAVEGADOR). Só em dev, para não poluir
    // o console em produção. Nunca loga o valor dos tokens — só a presença.
    const debug = process.env.NODE_ENV !== 'production'
    if (debug) {
      // eslint-disable-next-line no-console
      console.log('[auth/callback] recebido:', {
        temCode: Boolean(code),
        temAccessToken: Boolean(access_token),
        temRefreshToken: Boolean(refresh_token),
        erroNoFragmento: errNoFragmento || null,
        next,
      })
    }

    const supabase = createClient()

    async function finalizar(caminho: 'code' | 'fragment' | 'sessao-existente') {
      // Confirma que a sessão realmente existe antes de navegar.
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        if (debug) {
          // eslint-disable-next-line no-console
          console.log(`[auth/callback] sessão criada via ${caminho} → indo para ${next}`)
        }
        // Limpa o fragmento da URL e navega relativo (sem host:porta).
        window.history.replaceState(null, '', window.location.pathname)
        router.replace(next)
        router.refresh()
        return true
      }
      return false
    }

    async function handle() {
      // Erro explícito vindo do provedor (link expirado etc.)
      if (errNoFragmento) {
        // eslint-disable-next-line no-console
        console.warn('[auth/callback] erro no fragmento:', errNoFragmento)
        return falhar('Esse link expirou ou já foi usado. Peça um novo abaixo.')
      }

      // 1) Implicit flow — tokens no fragmento.
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (error) {
          // eslint-disable-next-line no-console
          console.error('[auth/callback] setSession falhou:', error.message)
          return falhar()
        }
        if (await finalizar('fragment')) return
      }

      // 2) Code flow (PKCE) — ?code=...
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          // eslint-disable-next-line no-console
          console.error('[auth/callback] exchangeCodeForSession falhou:', error.message)
          return falhar()
        }
        if (await finalizar('code')) return
      }

      // 3) Talvez o client já tenha detectado a sessão sozinho.
      if (await finalizar('sessao-existente')) return

      // Nada funcionou.
      // eslint-disable-next-line no-console
      console.warn('[auth/callback] nenhum token/code utilizável — tratando como link inválido')
      falhar()
    }

    function falhar(msg?: string) {
      setErro(msg ?? 'Não foi possível concluir o acesso. Tente pedir um novo link.')
      const q = new URLSearchParams({ erro: 'link_invalido' })
      // navegação relativa — nunca constrói host:porta
      setTimeout(() => router.replace(`/login?${q.toString()}`), 1200)
    }

    handle()
  }, [router])

  if (erro) {
    return <p className="text-sm text-coral-700">{erro}</p>
  }
  return null
}

// next seguro: só caminhos internos (começando com "/"), nunca URLs externas.
function sanitizeNext(next: string | null): string {
  if (!next) return '/'
  if (!next.startsWith('/') || next.startsWith('//')) return '/'
  return next
}

// Regras de sanitização/validação de variáveis de ambiente.
// ESPELHA src/lib/env.ts — se mudar aqui, atualize lá (e vice-versa).

export function clean(raw) {
  return (raw ?? '').trim().replace(/^["']|["']$/g, '')
}

export function sanitizeSupabaseUrl(raw) {
  let s = clean(raw)
  if (!s) return ''
  s = s.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
  return s
}

export function sanitizeAppUrl(raw) {
  let s = clean(raw)
  if (!s) return ''
  s = s.replace(/[?#].*$/, '').replace(/\/\*\*$/, '').replace(/\/\*$/, '').replace(/\/+$/, '')
  // remove ":porta" indevida em Codespaces (*.app.github.dev) ou https
  const m = s.match(/^(https?):\/\/([^/:]+)(:\d+)?(.*)$/i)
  if (m) {
    const [, scheme, host, , rest] = m
    if (/\.app\.github\.dev$/i.test(host) || scheme.toLowerCase() === 'https') {
      s = `${scheme}://${host}${rest ?? ''}`
    }
  }
  return s
}

export function validateOriginUrl(url, nome, exemplo) {
  if (!url) return `${nome} está vazia. Esperado: ${exemplo}`
  if (!/^https?:\/\/[^/\s?#*]+$/i.test(url)) {
    return `${nome} inválida: "${url}". Esperado: ${exemplo} (sem caminho, sem /**, sem barra final).`
  }
  return null
}

export function validateResendFrom(raw) {
  const v = clean(raw)
  if (!v) return { value: '', valid: true }
  const ok = /^[^<>]+<[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>$/.test(v)
  if (ok) return { value: v, valid: true }
  return {
    value: v,
    valid: false,
    error:
      `RESEND_FROM inválido: "${v}". Esperado: Nome <email@dominio> ` +
      `(ex.: BodyMy <ola@seudominio.com>), ou vazio para usar o remetente de teste.`,
  }
}

// Sinaliza sufixos que o painel do Supabase adiciona e não podem ir no .env.
export function detectaSufixoIndevido(nome, raw) {
  const v = clean(raw)
  const avisos = []
  if (nome === 'NEXT_PUBLIC_SUPABASE_URL' && /\/rest\/v1\/?$/i.test(v)) {
    avisos.push(`${nome} termina em /rest/v1 — remova (deve terminar em .supabase.co).`)
  }
  if (nome === 'NEXT_PUBLIC_APP_URL' && /\/\*\*?$/.test(v)) {
    avisos.push(`${nome} contém wildcard (/** ou /*) — isso é só do painel do Supabase, nunca no .env.`)
  }
  return avisos
}

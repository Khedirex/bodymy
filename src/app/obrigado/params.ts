// Utilidades das páginas públicas de obrigado (pós-compra).

// Suporte por e-mail (por enquanto). Ajuste conforme o negócio.
export const SUPORTE_EMAIL = 'soporte@bodymy.online'

// Aceita variações do nome do parâmetro que Kiwify/Hotmart possam enviar.
const ALIASES = ['email', 'customer_email', 'buyer_email', 'e-mail', 'mail', 'Email']

export function emailDosParams(searchParams: Record<string, string | string[] | undefined>): string | null {
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  const raw = ALIASES.map((k) => pick(searchParams[k])).find(Boolean)
  return raw && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw.trim()) ? raw.trim().toLowerCase() : null
}

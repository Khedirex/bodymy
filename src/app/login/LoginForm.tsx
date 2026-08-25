'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Metodo = 'codigo' | 'senha'

// Reenvio: espera mínima entre pedidos de código.
const COOLDOWN_SEGUNDOS = 45

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = sanitizeNext(params.get('next'))
  const erroInicial =
    params.get('erro') === 'link_invalido'
      ? 'Ese enlace venció o ya fue usado. Pide un código nuevo abajo.'
      : null

  const [metodo, setMetodo] = useState<Metodo>('codigo')
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email')
  // Pré-preenche o e-mail quando veio da página de obrigado (?email=).
  const [email, setEmail] = useState(() => (params.get('email') ?? '').trim())
  const [codigo, setCodigo] = useState('')
  const [senha, setSenha] = useState('')
  const [status, setStatus] = useState<'idle' | 'enviando' | 'verificando'>('idle')
  const [erro, setErro] = useState<string | null>(erroInicial)
  const [aviso, setAviso] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const codigoRef = useRef<HTMLInputElement>(null)

  // Contador de espera para o reenvio.
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const emailLimpo = () => email.trim().toLowerCase()

  // --- Código por e-mail ---------------------------------------------
  async function enviarCodigo(e?: React.FormEvent) {
    e?.preventDefault()
    if (status === 'enviando' || cooldown > 0) return
    setErro(null)
    setAviso(null)
    setStatus('enviando')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: emailLimpo(),
      options: { shouldCreateUser: false },
    })
    setStatus('idle')
    if (error) {
      logAuthError('signInWithOtp', error)
      setErro(classificarErro(error, 'enviar'))
      return
    }
    setCodigo('')
    setEtapa('codigo')
    setCooldown(COOLDOWN_SEGUNDOS)
    setTimeout(() => codigoRef.current?.focus(), 50)
  }

  async function verificarCodigo(e?: React.FormEvent) {
    e?.preventDefault()
    setErro(null)
    // Envia o valor COMPLETO digitado/colado (6 a 8 dígitos), sem truncar.
    const token = codigo.replace(/\D/g, '')
    if (token.length < 6) {
      setErro('Escribe el código completo (6 a 8 dígitos).')
      return
    }
    setStatus('verificando')
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email: emailLimpo(),
      token,
      type: 'email',
    })
    if (error) {
      setStatus('idle')
      logAuthError('verifyOtp', error)
      setErro(classificarErro(error, 'verificar'))
      return
    }
    // Sessão criada AQUI, dentro do app. Navega relativo.
    router.replace(next)
    router.refresh()
  }

  // --- Senha ----------------------------------------------------------
  async function entrarComSenha(e?: React.FormEvent) {
    e?.preventDefault()
    setErro(null)
    setStatus('verificando')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: emailLimpo(),
      password: senha,
    })
    if (error) {
      setStatus('idle')
      logAuthError('signInWithPassword', error)
      setErro(
        classificarErro(error, 'senha') ??
          'Correo o contraseña incorrectos. Puedes entrar con código o restablecer tu contraseña.',
      )
      return
    }
    router.replace(next)
    router.refresh()
  }

  async function esqueciSenha() {
    if (!email.trim()) {
      setErro('Escribe tu correo arriba para recibir el enlace de restablecimiento.')
      return
    }
    setErro(null)
    setStatus('enviando')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo(), {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    setStatus('idle')
    if (error) {
      logAuthError('resetPasswordForEmail', error)
      setErro(classificarErro(error, 'enviar'))
      return
    }
    setAviso('Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo (puede tardar unos minutos).')
  }

  // ---------------------------------------------------------------------
  // Etapa: digitar o código
  // ---------------------------------------------------------------------
  if (metodo === 'codigo' && etapa === 'codigo') {
    return (
      <form onSubmit={verificarCodigo} className="card space-y-4">
        <div className="text-center">
          <div className="mb-2 text-3xl" aria-hidden>📩</div>
          <h2 className="text-lg font-bold text-ink-900">Escribe el código</h2>
          <p className="mt-1 text-sm text-ink-700">
            Enviamos un código a <strong>{emailLimpo()}</strong>. Tiene de 6 a 8 dígitos.
          </p>
        </div>
        <input
          ref={codigoRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={8}
          required
          placeholder="Código"
          className="input text-center text-2xl font-extrabold tracking-[0.3em]"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 8))}
        />
        {erro ? <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">{erro}</p> : null}
        <button type="submit" className="btn-primary w-full" disabled={status !== 'idle' || codigo.replace(/\D/g, '').length < 6}>
          {status === 'verificando' ? 'Entrando…' : 'Entrar'}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className="font-semibold text-ink-700/70"
            onClick={() => { setEtapa('email'); setCodigo(''); setErro(null) }}
          >
            ← Cambiar correo
          </button>
          <button
            type="button"
            className="font-semibold text-coral-600 disabled:text-ink-700/40"
            onClick={() => enviarCodigo()}
            disabled={cooldown > 0 || status === 'enviando'}
          >
            {cooldown > 0 ? `Enviar otro código en ${cooldown}s` : 'Enviar otro código'}
          </button>
        </div>

        <div className="rounded-2xl bg-cream-100 px-4 py-3 text-xs text-ink-700/70">
          ⏳ El correo puede tardar <strong>unos minutos</strong> en llegar (el dominio es nuevo).
          Revisa también la carpeta de spam/promociones. En el correo también hay un botón para entrar por el enlace.
        </div>
      </form>
    )
  }

  // ---------------------------------------------------------------------
  // Etapa: e-mail (código) ou e-mail+senha
  // ---------------------------------------------------------------------
  return (
    <div className="space-y-3">
      <div className="flex rounded-2xl bg-cream-100 p-1">
        <button
          type="button"
          onClick={() => { setMetodo('codigo'); setErro(null); setAviso(null) }}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${metodo === 'codigo' ? 'bg-white text-coral-600 shadow-card' : 'text-ink-700/60'}`}
        >
          Código por correo
        </button>
        <button
          type="button"
          onClick={() => { setMetodo('senha'); setErro(null); setAviso(null) }}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${metodo === 'senha' ? 'bg-white text-coral-600 shadow-card' : 'text-ink-700/60'}`}
        >
          Entrar con contraseña
        </button>
      </div>

      <form onSubmit={metodo === 'codigo' ? enviarCodigo : entrarComSenha} className="card space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block font-semibold text-ink-800">Tu correo</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="tu@correo.com"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mt-1.5 text-sm text-ink-700/70">Usa el mismo correo que usaste en la compra.</p>
        </div>

        {metodo === 'senha' && (
          <div>
            <label htmlFor="senha" className="mb-1.5 block font-semibold text-ink-800">Tu contraseña</label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button type="button" onClick={esqueciSenha} className="mt-1.5 text-sm font-semibold text-coral-600">
              Olvidé mi contraseña
            </button>
          </div>
        )}

        {erro ? <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">{erro}</p> : null}
        {aviso ? <p className="rounded-2xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-600">{aviso}</p> : null}

        <button type="submit" className="btn-primary w-full" disabled={status !== 'idle'}>
          {metodo === 'codigo'
            ? status === 'enviando' ? 'Enviando…' : 'Enviar código'
            : status === 'verificando' ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="text-center text-sm text-ink-700/70">
          {metodo === 'codigo'
            ? 'Enviamos un código a tu correo — lo escribes aquí, sin salir del app.'
            : 'Solo si ya creaste una contraseña. Si todavía no, entra por código.'}
        </p>
      </form>
    </div>
  )
}

// =====================================================================
// Classificação dos erros reais do Supabase Auth (code/status/message)
// em mensagens específicas em pt-BR. Assim "expirado" para de mascarar
// código incorreto / não encontrado / falha de rede.
// =====================================================================
function classificarErro(
  error: { code?: string; status?: number; name?: string; message?: string },
  contexto: 'enviar' | 'verificar' | 'senha',
): string {
  const code = (error.code ?? '').toString()
  const status = error.status
  const name = (error.name ?? '').toString()
  const msg = (error.message ?? '').toLowerCase()

  // Falha de rede
  if (name.includes('Retryable') || msg.includes('fetch') || msg.includes('network') || msg.includes('load failed')) {
    return 'Sin conexión en este momento. Revisa tu internet e intenta de nuevo.'
  }
  // Limite de tentativas
  if (code.includes('rate_limit') || status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
    return 'Demasiados intentos en poco tiempo. Espera un minuto e intenta de nuevo.'
  }

  if (contexto === 'verificar') {
    if (code === 'otp_expired' || msg.includes('expired')) {
      return 'Ese código venció. Toca en "Enviar otro código" para recibir uno nuevo.'
    }
    if (msg.includes('invalid') || code === 'otp_disabled' || status === 401 || status === 403) {
      return 'Código incorrecto. Revisa todos los dígitos del correo (son de 6 a 8) e intenta de nuevo.'
    }
    return 'No pudimos validar el código ahora. Pide uno nuevo e intenta de nuevo.'
  }

  if (contexto === 'senha') {
    if (msg.includes('email not confirmed') || code === 'email_not_confirmed') {
      return 'Tu cuenta todavía no fue confirmada. Entra por código esta vez.'
    }
    if (msg.includes('invalid') || status === 400) {
      return 'Correo o contraseña incorrectos. Puedes entrar con código o restablecer tu contraseña.'
    }
    return 'No pudimos iniciar sesión ahora. Intenta de nuevo o usa el código por correo.'
  }

  // contexto === 'enviar'
  if (
    code === 'otp_disabled' ||
    code === 'user_not_found' ||
    msg.includes('signup') ||
    msg.includes('not allowed') ||
    msg.includes('not found') ||
    status === 422
  ) {
    return 'No encontramos una compra con este correo. Revisa si usaste el mismo correo de la compra.'
  }
  return 'No pudimos enviar el código ahora. Intenta de nuevo en un momento.'
}

// Loga o erro real (aparece no console do navegador) para diagnóstico.
function logAuthError(op: string, error: { code?: string; status?: number; name?: string; message?: string }) {
  // eslint-disable-next-line no-console
  console.error(`[login] ${op} falhou:`, {
    code: error.code,
    status: error.status,
    name: error.name,
    message: error.message,
  })
}

function sanitizeNext(next: string | null): string {
  if (!next) return '/'
  if (!next.startsWith('/') || next.startsWith('//')) return '/'
  return next
}

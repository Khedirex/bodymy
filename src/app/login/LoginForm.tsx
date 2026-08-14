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
      ? 'Esse link expirou ou já foi usado. Peça um novo código abaixo.'
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
      setErro('Digite o código completo (6 a 8 dígitos).')
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
          'E-mail ou senha incorretos. Você pode entrar por código ou redefinir a senha.',
      )
      return
    }
    router.replace(next)
    router.refresh()
  }

  async function esqueciSenha() {
    if (!email.trim()) {
      setErro('Digite seu e-mail acima para receber o link de redefinição.')
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
    setAviso('Enviamos um link para redefinir sua senha. Confira seu e-mail (pode levar alguns minutos).')
  }

  // ---------------------------------------------------------------------
  // Etapa: digitar o código
  // ---------------------------------------------------------------------
  if (metodo === 'codigo' && etapa === 'codigo') {
    return (
      <form onSubmit={verificarCodigo} className="card space-y-4">
        <div className="text-center">
          <div className="mb-2 text-3xl" aria-hidden>📩</div>
          <h2 className="text-lg font-bold text-ink-900">Digite o código</h2>
          <p className="mt-1 text-sm text-ink-700">
            Enviamos um código para <strong>{emailLimpo()}</strong>. Ele tem de 6 a 8 dígitos.
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
            ← Trocar e-mail
          </button>
          <button
            type="button"
            className="font-semibold text-coral-600 disabled:text-ink-700/40"
            onClick={() => enviarCodigo()}
            disabled={cooldown > 0 || status === 'enviando'}
          >
            {cooldown > 0 ? `Enviar outro código em ${cooldown}s` : 'Enviar outro código'}
          </button>
        </div>

        <div className="rounded-2xl bg-cream-100 px-4 py-3 text-xs text-ink-700/70">
          ⏳ O e-mail pode levar <strong>alguns minutos</strong> para chegar (o domínio é novo).
          Confira também a caixa de spam/promoções. No e-mail também há um botão para entrar pelo link.
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
          Código por e-mail
        </button>
        <button
          type="button"
          onClick={() => { setMetodo('senha'); setErro(null); setAviso(null) }}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${metodo === 'senha' ? 'bg-white text-coral-600 shadow-card' : 'text-ink-700/60'}`}
        >
          Entrar com senha
        </button>
      </div>

      <form onSubmit={metodo === 'codigo' ? enviarCodigo : entrarComSenha} className="card space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block font-semibold text-ink-800">Seu e-mail</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="voce@email.com"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mt-1.5 text-sm text-ink-700/70">Use o mesmo e-mail que você usou na compra.</p>
        </div>

        {metodo === 'senha' && (
          <div>
            <label htmlFor="senha" className="mb-1.5 block font-semibold text-ink-800">Sua senha</label>
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
              Esqueci minha senha
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
            ? 'Enviamos um código para o seu e-mail — você digita aqui, sem sair do app.'
            : 'Só quem já criou uma senha. Se ainda não criou, entre por código.'}
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
    return 'Sem conexão no momento. Verifique sua internet e tente novamente.'
  }
  // Limite de tentativas
  if (code.includes('rate_limit') || status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
    return 'Muitas tentativas em pouco tempo. Aguarde um minuto e tente de novo.'
  }

  if (contexto === 'verificar') {
    if (code === 'otp_expired' || msg.includes('expired')) {
      return 'Esse código expirou. Toque em "Enviar outro código" para receber um novo.'
    }
    if (msg.includes('invalid') || code === 'otp_disabled' || status === 401 || status === 403) {
      return 'Código incorreto. Confira todos os dígitos do e-mail (são de 6 a 8) e tente de novo.'
    }
    return 'Não conseguimos validar o código agora. Peça um novo e tente novamente.'
  }

  if (contexto === 'senha') {
    if (msg.includes('email not confirmed') || code === 'email_not_confirmed') {
      return 'Sua conta ainda não foi confirmada. Entre por código desta vez.'
    }
    if (msg.includes('invalid') || status === 400) {
      return 'E-mail ou senha incorretos. Você pode entrar por código ou redefinir a senha.'
    }
    return 'Não conseguimos entrar agora. Tente novamente ou use o código por e-mail.'
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
    return 'Não encontramos uma compra com este e-mail. Verifique se usou o mesmo e-mail da compra.'
  }
  return 'Não conseguimos enviar o código agora. Tente novamente em instantes.'
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

'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Metodo = 'codigo' | 'senha'

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
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [senha, setSenha] = useState('')
  const [status, setStatus] = useState<'idle' | 'enviando' | 'verificando'>('idle')
  const [erro, setErro] = useState<string | null>(erroInicial)
  const [aviso, setAviso] = useState<string | null>(null)
  const codigoRef = useRef<HTMLInputElement>(null)

  const emailLimpo = () => email.trim().toLowerCase()

  function mensagemNaoEncontrado(msg: string): string | null {
    if (/not.*found|no.*user|invalid.*login|signup.*disabled|user.*not/i.test(msg)) {
      return 'Não encontramos uma compra com este e-mail. Verifique se usou o mesmo e-mail da compra.'
    }
    return null
  }

  // --- Código por e-mail ---------------------------------------------
  async function enviarCodigo(e?: React.FormEvent) {
    e?.preventDefault()
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
      setErro(mensagemNaoEncontrado(error.message) ?? 'Não conseguimos enviar o código agora. Tente novamente em instantes.')
      return
    }
    setEtapa('codigo')
    setTimeout(() => codigoRef.current?.focus(), 50)
  }

  async function verificarCodigo(e?: React.FormEvent) {
    e?.preventDefault()
    setErro(null)
    setStatus('verificando')
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email: emailLimpo(),
      token: codigo.replace(/\D/g, ''),
      type: 'email',
    })
    if (error) {
      setStatus('idle')
      setErro('Código inválido ou expirado. Confira os 6 dígitos ou peça um novo código.')
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
      setErro('E-mail ou senha incorretos. Você pode entrar por código ou redefinir a senha.')
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
      setErro('Não conseguimos enviar agora. Tente novamente em instantes.')
      return
    }
    setAviso('Enviamos um link para redefinir sua senha. Confira seu e-mail.')
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
            Enviamos um código de 6 dígitos para <strong>{emailLimpo()}</strong>.
          </p>
        </div>
        <input
          ref={codigoRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          required
          placeholder="000000"
          className="input text-center text-3xl font-extrabold tracking-[0.4em]"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        {erro ? <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">{erro}</p> : null}
        <button type="submit" className="btn-primary w-full" disabled={status !== 'idle' || codigo.length < 6}>
          {status === 'verificando' ? 'Entrando…' : 'Entrar'}
        </button>
        <div className="flex items-center justify-between text-sm">
          <button type="button" className="font-semibold text-ink-700/70" onClick={() => { setEtapa('email'); setCodigo(''); setErro(null) }}>
            ← Trocar e-mail
          </button>
          <button type="button" className="font-semibold text-coral-600" onClick={() => enviarCodigo()}>
            Reenviar código
          </button>
        </div>
        <p className="text-center text-xs text-ink-700/60">
          No e-mail também tem um botão <strong>“ACESSAR MEU PROGRAMA”</strong>, se preferir entrar pelo link.
        </p>
      </form>
    )
  }

  // ---------------------------------------------------------------------
  // Etapa: e-mail (código) ou e-mail+senha
  // ---------------------------------------------------------------------
  return (
    <div className="space-y-3">
      {/* Alternador de método */}
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
            ? 'Enviamos um código de 6 dígitos para o seu e-mail — você digita aqui, sem sair do app.'
            : 'Só quem já criou uma senha. Se ainda não criou, entre por código.'}
        </p>
      </form>
    </div>
  )
}

function sanitizeNext(next: string | null): string {
  if (!next) return '/'
  if (!next.startsWith('/') || next.startsWith('//')) return '/'
  return next
}

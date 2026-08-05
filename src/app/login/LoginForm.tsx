'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export function LoginForm() {
  const params = useSearchParams()
  const erroInicial = params.get('erro') === 'link_invalido'
    ? 'Esse link expirou ou já foi usado. Peça um novo abaixo.'
    : null

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'enviando' | 'enviado' | 'erro'>('idle')
  const [erro, setErro] = useState<string | null>(erroInicial)
  const [canalDev, setCanalDev] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setStatus('enviando')

    const next = params.get('next') ?? '/'
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), next }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setCanalDev(data?.canal === 'console_dev')
        setStatus('enviado')
        return
      }

      setStatus('erro')
      if (res.status === 404 || data?.erro === 'nao_encontrado') {
        // E-mail não encontrado (não comprou) — distinto de falha técnica.
        setErro(
          'Não encontramos uma compra com este e-mail. Verifique se usou o mesmo e-mail da compra.',
        )
      } else if (data?.erro === 'email_invalido') {
        setErro('Confira o e-mail digitado — parece estar incompleto.')
      } else {
        // Falha técnica NOSSA (geração do link ou envio do e-mail).
        setErro(
          'Tivemos um problema técnico ao enviar seu link — não foi você. ' +
            'Tente de novo em instantes; se persistir, fale com o suporte.',
        )
      }
    } catch {
      setStatus('erro')
      setErro('Sem conexão no momento. Verifique sua internet e tente novamente.')
    }
  }

  if (status === 'enviado') {
    return (
      <div className="card text-center">
        <div className="mb-3 text-4xl" aria-hidden>
          📩
        </div>
        <h2 className="text-lg font-bold text-ink-900">Enviamos seu link!</h2>
        <p className="mt-2 text-ink-700">
          Enviamos um link de acesso para <strong>{email}</strong>. Abra seu e-mail e toque
          no botão <strong>ACESSAR MEU PROGRAMA</strong>.
        </p>
        {canalDev ? (
          <p className="mt-3 rounded-2xl bg-cream-100 px-4 py-3 text-sm text-ink-700">
            <strong>Modo desenvolvimento:</strong> o link também foi impresso no console do
            servidor.
          </p>
        ) : null}
        <p className="mt-4 text-sm text-ink-700/70">
          Não chegou? Confira a caixa de spam ou{' '}
          <button
            type="button"
            className="font-semibold text-coral-600 underline"
            onClick={() => setStatus('idle')}
          >
            tente de novo
          </button>
          .
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block font-semibold text-ink-800">
          Seu e-mail
        </label>
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
        <p className="mt-1.5 text-sm text-ink-700/70">
          Use o mesmo e-mail que você usou na compra.
        </p>
      </div>

      {erro ? (
        <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">
          {erro}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={status === 'enviando'}>
        {status === 'enviando' ? 'Enviando…' : 'Enviar link de acesso'}
      </button>

      <p className="text-center text-sm text-ink-700/70">
        Sem senha: enviamos um link direto para o seu e-mail.
      </p>
    </form>
  )
}

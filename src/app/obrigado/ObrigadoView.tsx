'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'

type Status = 'verificando' | 'pronto' | 'demorou' | 'sem_email'

interface Props {
  email: string | null
  produtoNome: string
  suporteEmail: string
}

const MAX_TENTATIVAS = 18 // ~45s (2,5s cada)

export function ObrigadoView({ email, produtoNome, suporteEmail }: Props) {
  const [status, setStatus] = useState<Status>(email ? 'verificando' : 'sem_email')
  const [progresso, setProgresso] = useState(email ? 8 : 100)

  // Verifica em segundo plano se o webhook já criou a conta.
  useEffect(() => {
    if (!email) return
    let parado = false
    let tentativas = 0

    async function checar() {
      if (parado) return
      tentativas += 1
      setProgresso(Math.min(92, 8 + (tentativas / MAX_TENTATIVAS) * 84))
      try {
        const r = await fetch(`/api/obrigado/status?email=${encodeURIComponent(email!)}`, { cache: 'no-store' })
        const d = (await r.json()) as { pronto?: boolean }
        if (d?.pronto && !parado) {
          parado = true
          setProgresso(100)
          setStatus('pronto')
          clearInterval(t)
          return
        }
      } catch {
        /* rede instável — segue tentando */
      }
      if (tentativas >= MAX_TENTATIVAS && !parado) {
        parado = true
        setStatus('demorou')
        clearInterval(t)
      }
    }

    const t = setInterval(checar, 2500)
    void checar() // primeira checagem imediata
    return () => {
      parado = true
      clearInterval(t)
    }
  }, [email])

  const podeEntrar = status !== 'verificando'
  const loginHref = email ? `/login?email=${encodeURIComponent(email)}` : '/login'

  return (
    <div className="mx-auto max-w-md px-5 py-8 text-[17px] leading-relaxed">
      {/* Topo — confirmação */}
      <header className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-coral-400 text-3xl">
          <span aria-hidden>🎉</span>
        </div>
        <h1 className="text-2xl font-extrabold text-ink-900">¡Compra confirmada!</h1>
        <p className="mt-2 text-ink-700">
          Qué alegría tenerte aquí. Tu acceso a <strong>{produtoNome}</strong> se está preparando —
          es rapidísimo para entrar. 🤍
        </p>
      </header>

      {/* Estado de liberação do acesso */}
      <section className="mt-6" aria-live="polite">
        {status === 'verificando' ? (
          <div className="rounded-3xl bg-cream-100 p-5 text-center">
            <p className="font-bold text-ink-900">Liberando tu acceso…</p>
            {email ? <p className="mt-1 text-sm text-ink-700">para <strong>{email}</strong></p> : null}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-coral-400 transition-all duration-700 ease-out"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-ink-700">Esto toma solo unos segundos. Puedes esperar aquí.</p>
          </div>
        ) : null}

        {status === 'pronto' ? (
          <div className="rounded-3xl bg-sage-100 p-5 text-center">
            <p className="font-bold text-sage-600">✓ ¡Acceso liberado{email ? ` para ${email}` : ''}!</p>
            <p className="mt-1 text-sm text-ink-700">Ya está todo listo. Sigue los pasos de abajo.</p>
          </div>
        ) : null}

        {status === 'demorou' ? (
          <div className="rounded-3xl border-2 border-gold-300/60 bg-gold-300/10 p-5 text-center">
            <p className="font-bold text-ink-900">Ya casi está 🤍</p>
            <p className="mt-1 text-sm text-ink-700">
              A veces la liberación tarda un poquito más. Quédate tranquila — tu acceso no se pierde. Ya
              puedes seguir los pasos de abajo; si el código no llega, solo escríbenos al final de la página.
            </p>
          </div>
        ) : null}
      </section>

      {/* Passo 1 — Como entrar */}
      <StepCard numero={1} titulo="Entra a BodyMy">
        <p className="mb-3 text-ink-700">
          <strong>No necesitas crear contraseña</strong>. Toca el botón, escribe tu correo y te enviamos un
          código de 6 números. Solo escribes el código en el app y listo.
        </p>
        <Link
          href={loginHref}
          aria-disabled={!podeEntrar}
          tabIndex={podeEntrar ? undefined : -1}
          className={`flex min-h-[52px] w-full items-center justify-center rounded-2xl px-5 text-lg font-extrabold text-white transition ${
            podeEntrar ? 'bg-coral-400' : 'pointer-events-none bg-coral-400/50'
          }`}
        >
          {podeEntrar ? 'Entrar a BodyMy →' : 'Liberando acceso…'}
        </Link>
      </StepCard>

      {/* Passo 2 — Se o e-mail demorar */}
      <StepCard numero={2} titulo="Si el correo del código tarda">
        <p className="text-ink-700">
          El correo con tu código puede tardar unos minutos. Si no aparece, revisa la carpeta de{' '}
          <strong>spam</strong> o <strong>promociones</strong> — y márcalo como <strong>&ldquo;no es spam&rdquo;</strong>{' '}
          para recibir los próximos normalmente.
        </p>
      </StepCard>

      {/* Rodapé — suporte */}
      <a
        href={`mailto:${suporteEmail}`}
        className="mt-6 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-cream-200 bg-white px-5 text-base font-bold text-ink-800"
      >
        <span aria-hidden>✉️</span> ¿Necesitas ayuda? Escríbenos a {suporteEmail}
      </a>
      <p className="mt-6 pb-2 text-center text-xs text-ink-700/50">BodyMy · hecho con 🤍</p>
    </div>
  )
}

function StepCard({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section className="mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-cream-200">
      <div className="mb-2 flex items-center gap-3">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-coral-400 text-lg font-extrabold text-white">
          {numero}
        </span>
        <h2 className="text-lg font-extrabold text-ink-900">{titulo}</h2>
      </div>
      {children}
    </section>
  )
}

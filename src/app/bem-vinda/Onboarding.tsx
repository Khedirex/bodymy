'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { InstallInstructions } from '@/components/pwa/InstallInstructions'
import { analytics } from '@/lib/analytics'

type Horario = 'manha' | 'tarde' | 'noite'
const OPCOES: { valor: Horario; label: string; emoji: string }[] = [
  { valor: 'manha', label: 'De manhã', emoji: '🌅' },
  { valor: 'tarde', label: 'À tarde', emoji: '☀️' },
  { valor: 'noite', label: 'À noite', emoji: '🌙' },
]

export function Onboarding({
  nome,
  programaNome,
}: {
  nome: string | null
  programaNome: string
}) {
  const router = useRouter()
  const [passo, setPasso] = useState<1 | 2 | 3>(1)
  const [horario, setHorario] = useState<Horario | null>(null)
  const [pending, startTransition] = useTransition()
  const primeiroNome = (nome ?? '').split(' ')[0] || 'Bem-vinda'

  const [erro, setErro] = useState<string | null>(null)

  function finalizar() {
    if (!horario) return
    setErro(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ horario }),
        })
        if (!res.ok) {
          setErro('Não conseguimos salvar agora. Tente novamente.')
          return
        }
        analytics.onboardingCompleted()
        router.replace('/')
        router.refresh()
      } catch {
        setErro('Sem conexão. Tente novamente.')
      }
    })
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 py-8">
      {/* Progresso */}
      <div className="mb-8 flex gap-1.5">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full ${
              n <= passo ? 'bg-coral-400' : 'bg-cream-200'
            }`}
          />
        ))}
      </div>

      {passo === 1 && (
        <section className="flex flex-1 flex-col animate-fade-up">
          <div className="mb-4 text-5xl" aria-hidden>
            🎉
          </div>
          <h1 className="text-3xl font-extrabold leading-tight text-ink-900">
            Bem-vinda, {primeiroNome}!
          </h1>
          <p className="mt-3 text-lg text-ink-700">
            Seu programa está pronto:
          </p>
          <p className="mt-1 text-xl font-bold text-coral-600">{programaNome}</p>
          <p className="mt-4 text-ink-700">
            Vamos deixar tudo do jeito que combina com a sua rotina. Leva menos de um minuto.
          </p>
          <div className="mt-auto pt-8">
            <button className="btn-primary w-full" onClick={() => setPasso(2)}>
              Começar
            </button>
          </div>
        </section>
      )}

      {passo === 2 && (
        <section className="flex flex-1 flex-col animate-fade-up">
          <h2 className="text-2xl font-extrabold text-ink-900">
            Qual o melhor horário para você se movimentar?
          </h2>
          <p className="mt-2 text-ink-700">
            Assim conseguimos te lembrar na hora certa. Você pode mudar depois.
          </p>
          <div className="mt-6 space-y-3">
            {OPCOES.map((o) => (
              <button
                key={o.valor}
                onClick={() => setHorario(o.valor)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold transition ${
                  horario === o.valor
                    ? 'border-coral-400 bg-coral-50 text-coral-700'
                    : 'border-cream-200 bg-white text-ink-800'
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {o.emoji}
                </span>
                {o.label}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-8">
            <button
              className="btn-primary w-full"
              disabled={!horario}
              onClick={() => setPasso(3)}
            >
              Continuar
            </button>
          </div>
        </section>
      )}

      {passo === 3 && (
        <section className="flex flex-1 flex-col animate-fade-up">
          <h2 className="text-2xl font-extrabold text-ink-900">
            Deixe o BodyMy pertinho de você
          </h2>
          <p className="mt-2 text-ink-700">
            Adicione o BodyMy à tela do seu celular para abrir como um aplicativo, com um
            toque — sem precisar do navegador.
          </p>
          <div className="mt-6">
            <InstallInstructions />
          </div>
          <div className="mt-auto pt-8">
            {erro ? (
              <p className="mb-3 rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">
                {erro}
              </p>
            ) : null}
            <button
              className="btn-primary w-full"
              onClick={finalizar}
              disabled={pending}
            >
              {pending ? 'Preparando…' : 'Ir para o meu programa'}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}

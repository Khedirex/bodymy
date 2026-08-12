'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VideoBox } from '@/components/circuito/VideoBox'
import { SafetyNotice } from '@/components/SafetyNotice'
import { SEMANA_ZERO_DIAS } from '@/lib/training'
import type { Stretch } from '@/types/db'

// Semana Zero: 10 alongamentos (os mesmos nos 3 dias). Sem intensidade, sem
// ajuste — reconhecimento corporal. A aluna pode pular a qualquer momento.
export function SemanaZeroView({ dia, stretches }: { dia: number; stretches: Stretch[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<null | 'concluir' | 'pular'>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(pronta: boolean) {
    setLoading(pronta ? 'pular' : 'concluir')
    setErro(null)
    try {
      const res = await fetch('/api/circuito/semana-zero', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pronta }),
      })
      if (!res.ok) {
        setErro('Não conseguimos salvar agora. Tente novamente.')
        setLoading(null)
        return
      }
      router.refresh()
    } catch {
      setErro('Sem conexão. Tente novamente.')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <span className="chip">Semana Zero · Dia {dia} de {SEMANA_ZERO_DIAS}</span>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">
          Reconhecendo o corpo
        </h1>
        <p className="mt-1 text-ink-700">
          Três dias suaves de alongamento para o corpo se preparar. Sem pressa, sem cobrança —
          é só chegar e sentir.
        </p>
      </header>

      <SafetyNotice />

      <div className="space-y-4">
        {stretches.map((s, i) => (
          <div key={s.id} className="card space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage-100 text-sm font-bold text-sage-600">
                {i + 1}
              </span>
              <h3 className="font-bold text-ink-900">{s.nome}</h3>
            </div>
            <VideoBox videoId={s.panda_video_id} />
            {s.descricao ? <p className="text-sm text-ink-700">{s.descricao}</p> : null}
          </div>
        ))}
      </div>

      {erro ? (
        <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">{erro}</p>
      ) : null}

      <div className="sticky bottom-24 space-y-2 rounded-3xl bg-white/85 p-2 backdrop-blur">
        <button className="btn-primary w-full text-lg" disabled={loading !== null} onClick={() => enviar(false)}>
          {loading === 'concluir' ? 'Salvando…' : `Concluir dia ${dia} ✓`}
        </button>
        <button
          className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-ink-700"
          disabled={loading !== null}
          onClick={() => enviar(true)}
        >
          {loading === 'pular' ? 'Preparando…' : 'Estou pronta — ir direto para o circuito'}
        </button>
      </div>
    </div>
  )
}

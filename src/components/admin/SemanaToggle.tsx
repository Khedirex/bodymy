'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Botão de liberar/bloquear uma semana. Ao liberar uma semana incompleta,
// pede confirmação (o vídeo daquela variação ainda não está todo pronto).
export function SemanaToggle({
  semana,
  liberada,
  completo,
  preenchidos,
  total,
}: {
  semana: number
  liberada: boolean
  completo: boolean
  preenchidos: number
  total: number
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function alternar() {
    const novo = !liberada
    if (novo && !completo) {
      const ok = window.confirm(
        `A Semana ${semana} tem só ${preenchidos}/${total} vídeos da variação v${semana} preenchidos. ` +
          `As alunas verão placeholders nos que faltam. Liberar mesmo assim?`,
      )
      if (!ok) return
    }
    setSaving(true)
    setErro(null)
    try {
      const res = await fetch('/api/admin/semanas', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ semana, liberada: novo }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setErro(d.error ?? 'Erro')
        return
      }
      router.refresh()
    } catch {
      setErro('Sem conexão')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {erro ? <span className="text-xs text-rose-600">{erro}</span> : null}
      <button
        onClick={alternar}
        disabled={saving}
        className={`rounded-md px-3 py-1.5 text-sm font-semibold disabled:opacity-50 ${
          liberada
            ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            : 'bg-slate-900 text-white hover:bg-slate-700'
        }`}
      >
        {saving ? '…' : liberada ? 'Bloquear' : 'Liberar'}
      </button>
      <span className={`text-sm font-semibold ${liberada ? 'text-emerald-700' : 'text-slate-400'}`}>
        {liberada ? 'liberada' : 'bloqueada'}
      </span>
    </div>
  )
}

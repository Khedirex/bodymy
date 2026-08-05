'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckIcon } from '@/components/ui/icons'
import { analytics } from '@/lib/analytics'
import type { CheckinTipo } from '@/types/db'

// Botão de check-in rápido. Usa a rota /api/checkins e atualiza a Home.
export function QuickCheckin({
  tipo,
  jaFeito,
  label,
  labelFeito,
}: {
  tipo: CheckinTipo
  jaFeito: boolean
  label: string
  labelFeito: string
}) {
  const router = useRouter()
  const [feito, setFeito] = useState(jaFeito)
  const [loading, setLoading] = useState(false)

  async function marcar() {
    if (feito || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tipo }),
      })
      if (res.ok) {
        setFeito(true)
        analytics.checkin(tipo)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={marcar}
      disabled={feito || loading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-bold transition ${
        feito
          ? 'bg-sage-100 text-sage-600'
          : 'bg-coral-400 text-white active:scale-[0.98] hover:bg-coral-500'
      }`}
      style={{ minHeight: 48 }}
    >
      <CheckIcon width={20} height={20} />
      {feito ? labelFeito : loading ? 'Registrando…' : label}
    </button>
  )
}

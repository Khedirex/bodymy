'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePwaInstall } from '@/components/pwa/usePwaInstall'

// Banner discreto na Home enquanto o app não está instalado.
// Android: instala direto. iOS/outros: leva ao passo a passo no perfil.
export function InstallBanner() {
  const { instalado, plataforma, podeInstalarNativo, promptInstall } = usePwaInstall()
  const [dispensado, setDispensado] = useState(false)

  if (instalado || dispensado) return null

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-coral-100 bg-coral-50/60 px-4 py-3">
      <span className="text-xl" aria-hidden>
        📲
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900">Instala BodyMy</p>
        <p className="text-xs text-ink-700">Ábrelo como app, directo desde la pantalla de inicio.</p>
      </div>
      {podeInstalarNativo && plataforma === 'android' ? (
        <button
          onClick={() => promptInstall()}
          className="rounded-xl bg-coral-400 px-3 py-2 text-sm font-bold text-white"
        >
          Instalar
        </button>
      ) : (
        <Link
          href="/perfil#instalar"
          className="rounded-xl bg-coral-400 px-3 py-2 text-sm font-bold text-white"
        >
          Cómo hacerlo
        </Link>
      )}
      <button
        onClick={() => setDispensado(true)}
        aria-label="Descartar"
        className="px-1 text-ink-700/40"
      >
        ✕
      </button>
    </div>
  )
}

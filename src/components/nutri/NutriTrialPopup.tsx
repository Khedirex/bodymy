'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NUTRI_ASSISTENTE } from '@/lib/nutri-types'

const DISMISS_KEY = 'bodymy_nutri_popup_dismissed'

// Pop-up "7 días gratis" mostrado ao abrir o app. Aparece só para quem ainda
// pode iniciar o trial (não pagou e nunca montou a dieta) e que ainda não
// fechou o aviso. Consulta /api/nutri/status no mount (não bloqueia o render).
export function NutriTrialPopup() {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return
    } catch {
      /* storage indisponível — segue e tenta mostrar */
    }
    let vivo = true
    fetch('/api/nutri/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (vivo && json?.acesso?.podeIniciarTrial) setAberto(true)
      })
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [])

  function fechar() {
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignora */
    }
    setAberto(false)
  }

  function montar() {
    fechar()
    router.push('/sofia')
  }

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-4 sm:items-center"
      onClick={fechar}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="relative mx-auto inline-block h-16 w-16">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-sage-600 to-sage-400 text-2xl font-extrabold text-white">
            {NUTRI_ASSISTENTE.inicial}
          </span>
          <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
        </span>
        <h2 className="mt-3 text-xl font-extrabold text-ink-900">
          {NUTRI_ASSISTENTE.nome} quiere acompañarte
        </h2>
        <p className="mt-2 text-sm text-ink-700">
          Tu <span className="font-semibold">nutricionista</span> en un chat privado, solo para ti:
          te acompaña cada día, adapta tu sesión y resuelve tus dudas. <span className="font-semibold">7 días gratis.</span>
        </p>
        <button
          onClick={montar}
          className="mt-5 w-full rounded-full bg-coral-500 px-6 py-3 text-sm font-bold text-white"
        >
          Empezar mi chat gratis
        </button>
        <button onClick={fechar} className="mt-2 w-full py-2 text-sm font-semibold text-ink-700">
          Ahora no
        </button>
      </div>
    </div>
  )
}

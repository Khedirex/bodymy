'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
    router.push('/dieta')
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
        <p className="text-4xl">🤍</p>
        <h2 className="mt-3 text-xl font-extrabold text-ink-900">7 días gratis</h2>
        <p className="mt-2 text-sm text-ink-700">
          Activa tu <span className="font-semibold">asistente del reto</span>: te acompaña cada día,
          adapta tu sesión y resuelve tus dudas por chat. Sin costo por 7 días.
        </p>
        <button
          onClick={montar}
          className="mt-5 w-full rounded-full bg-coral-500 px-6 py-3 text-sm font-bold text-white"
        >
          Activar mi asistente gratis
        </button>
        <button onClick={fechar} className="mt-2 w-full py-2 text-sm font-semibold text-ink-700">
          Ahora no
        </button>
      </div>
    </div>
  )
}

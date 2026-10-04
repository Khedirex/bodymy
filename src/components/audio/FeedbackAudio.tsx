'use client'

import { useState } from 'react'

// =====================================================================
// A pergunta do fim do áudio.
//
// Aparece sozinha quando o áudio termina, com três respostas de um toque.
// É o único retorno possível num produto que ela usa de olhos fechados: não
// há vídeo assistido nem exercício marcado, e se ela dormir no meio — que é
// o objetivo — nunca volta para avaliar depois.
//
// Opcional de propósito: ela pode ignorar e nada acontece. Um formulário
// obrigatório no fim de um áudio de dormir seria o oposto do produto.
// =====================================================================

const OPCOES = [
  { valor: 'dormi', emoji: '😴', label: 'Me dormí' },
  { valor: 'relajo', emoji: '🤍', label: 'Me relajó' },
  { valor: 'no_ayudo', emoji: '😕', label: 'No me ayudó' },
] as const

export function FeedbackAudio({ audioId }: { audioId: string }) {
  const [escolha, setEscolha] = useState<string | null>(null)
  const [comentario, setComentario] = useState('')
  const [enviado, setEnviado] = useState(false)

  async function responder(valor: string, texto?: string) {
    setEscolha(valor)
    try {
      await fetch('/api/audios/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ audioId, resposta: valor, comentario: texto }),
      })
    } catch {
      /* retorno é bônus: falhar aqui não pode atrapalhar a noite dela */
    }
    if (texto !== undefined) setEnviado(true)
  }

  if (enviado) {
    return (
      <p className="mt-3 rounded-2xl bg-sage-100/60 px-4 py-3 text-base font-semibold text-ink-900">
        Gracias 🤍 Nos ayuda a mejorar tus audios.
      </p>
    )
  }

  return (
    <div className="mt-3 rounded-2xl bg-mist-100 px-4 py-3">
      <p className="text-base font-bold text-ink-900">¿Cómo te fue con este audio?</p>

      <div className="mt-2 flex gap-2">
        {OPCOES.map((o) => (
          <button
            key={o.valor}
            onClick={() => responder(o.valor)}
            aria-pressed={escolha === o.valor}
            className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-2 text-sm font-bold transition ${
              escolha === o.valor
                ? 'bg-brand-500 text-white'
                : 'bg-white text-ink-900 active:scale-[0.98]'
            }`}
          >
            <span className="text-xl" aria-hidden>{o.emoji}</span>
            {o.label}
          </button>
        ))}
      </div>

      {escolha && (
        <div className="mt-3">
          <label className="block text-sm text-ink-700" htmlFor={`c-${audioId}`}>
            ¿Quieres contarnos algo más? (opcional)
          </label>
          <textarea
            id={`c-${audioId}`}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-2xl border-2 border-mist-200 bg-white px-3 py-2 text-base text-ink-900"
            placeholder="Me costó al principio, pero…"
          />
          <button
            onClick={() => responder(escolha, comentario)}
            className="mt-2 w-full rounded-full bg-brand-500 py-3 text-base font-bold text-white"
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  )
}

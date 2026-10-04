'use client'

import { useState } from 'react'

// =====================================================================
// "¿Cómo fue anoche?" — a pergunta do DIA SEGUINTE, sobre a NOITE.
//
// Não pode ser no fim do áudio: o objetivo do produto é que ela durma antes
// de terminar. Quem dorme não responde formulário, e quem responde é
// justamente quem NÃO dormiu — o retorno viria envenenado, dizendo que nada
// funciona. No dia seguinte ela já sabe como foi a noite.
//
// E a unidade é a NOITE, não a faixa: ao acordar ela não distingue um áudio
// do outro, distingue se dormiu. Perguntar por áudio faria quem ouviu três
// responder três vezes — ninguém faz isso.
//
// Cada resposta recebe uma devolutiva própria. Um "gracias" igual para as
// três seria o mesmo que não ler.
// =====================================================================

const OPCOES = [
  {
    valor: 'dormi',
    emoji: '😴',
    label: 'Me dormí',
    titulo: 'Eso es exactamente lo que buscamos 🤍',
    texto:
      'Dormirte antes de que termine no es perderte nada: es la señal de que funcionó. Repite esta noche — el sueño se entrena durmiendo.',
  },
  {
    valor: 'relajo',
    emoji: '🌙',
    label: 'Me relajó',
    titulo: 'Buena señal',
    texto:
      'Tu cuerpo ya está reconociendo el audio. Normalmente la segunda y la tercera noche cuestan menos que la primera. Sigue en orden.',
  },
  {
    valor: 'no_ayudo',
    emoji: '😕',
    label: 'No me ayudó',
    titulo: 'Gracias por decirlo',
    texto:
      'Una noche sola no define nada — dale dos o tres más antes de juzgar. Si al despertar de madrugada no logras volver, usa el audio de rescate; está disponible siempre, sin cambiar tu avance.',
  },
] as const

interface Props {
  /** Biblioteca a que a noite pertence (noche, oraciones, madrugada…). */
  modulo: string
  /** Data da noite avaliada (ISO). */
  data: string
  /** Quantos áudios ela abriu naquela noite. */
  quantos: number
  /** Título, quando foi um áudio só. */
  titulo: string | null
}

export function FeedbackOntem({ modulo, data, quantos, titulo }: Props) {
  const [resposta, setResposta] = useState<(typeof OPCOES)[number] | null>(null)
  const [fechado, setFechado] = useState(false)

  async function responder(o: (typeof OPCOES)[number]) {
    setResposta(o)
    try {
      await fetch('/api/audios/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ modulo, data, resposta: o.valor }),
      })
    } catch {
      /* retorno é bônus: falhar aqui não pode atrapalhar o dia dela */
    }
  }

  if (fechado) return null

  if (resposta) {
    return (
      <section className="rounded-3xl bg-white p-5 shadow-card">
        <p className="text-lg font-extrabold text-ink-900">{resposta.titulo}</p>
        <p className="mt-1 text-base text-ink-700">{resposta.texto}</p>
        <button
          onClick={() => setFechado(true)}
          className="mt-3 text-base font-bold text-brand-600 underline"
        >
          Entendido
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-card">
      <p className="text-lg font-extrabold leading-tight text-ink-900">¿Cómo fue anoche?</p>
      <p className="mt-1 text-base text-ink-700">
        {titulo ? (
          <>
            Anoche escuchaste <strong>{titulo}</strong>.{' '}
          </>
        ) : quantos > 1 ? (
          <>
            Anoche escuchaste <strong>{quantos} audios</strong>.{' '}
          </>
        ) : null}
        Cuéntanos en un toque cómo dormiste.
      </p>
      <div className="mt-3 flex gap-2">
        {OPCOES.map((o) => (
          <button
            key={o.valor}
            onClick={() => responder(o)}
            className="flex min-h-[72px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-mist-100 px-2 py-2 text-sm font-bold text-ink-900 transition active:scale-[0.98]"
          >
            <span className="text-2xl" aria-hidden>{o.emoji}</span>
            {o.label}
          </button>
        ))}
      </div>
    </section>
  )
}

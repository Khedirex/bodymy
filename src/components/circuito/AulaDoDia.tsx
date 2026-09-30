'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { VideoAula } from '@/components/lesson/VideoAula'
import { ConteudoAula } from '@/components/lesson/LessonReader'
import { BookIcon, ChevronRight } from '@/components/ui/icons'
import type { GuiaBloco } from '@/types/db'

interface Props {
  dia: number // dia do desafio (1..totalDias)
  totalDias: number
  titulo: string | null // null = aula ainda não cadastrada
  duracaoMin: number
  videoId: string | null
  conteudo: { intro?: string; blocos: GuiaBloco[] } | null
  bienvenidaId: string | null
  /** O dia de hoje já foi feito: mostra a aula feita e quando volta. */
  feitoHoje: boolean
  proximoDia: number
}

type Estado = 'aula' | 'enviando' | 'feito' | 'erro'

// Formato 'aula_diaria': 1 vídeo guiado + o texto de apoio do dia, e um
// único botão para marcar o dia como feito (streak + avanço de dia).
export function AulaDoDia(props: Props) {
  const router = useRouter()
  const [estado, setEstado] = useState<Estado>(props.feitoHoje ? 'feito' : 'aula')
  const [proximo, setProximo] = useState(props.proximoDia)

  async function concluir() {
    setEstado('enviando')
    try {
      const res = await fetch('/api/circuito/aula', { method: 'POST' })
      const body = (await res.json().catch(() => ({}))) as { proximoDia?: number; error?: string }
      if (res.ok || body.error === 'ja_feito_hoje') {
        if (body.proximoDia) setProximo(body.proximoDia)
        setEstado('feito')
        router.refresh()
        return
      }
      setEstado('erro')
    } catch {
      setEstado('erro')
    }
  }

  const terminouReto = props.dia >= props.totalDias

  return (
    <div className="space-y-5">
      <header>
        <span className="chip">
          Día {props.dia} de {props.totalDias}
        </span>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">
          {props.titulo ?? `Día ${props.dia}`}
        </h1>
        <p className="mt-1 text-sm text-ink-700">
          Video de {props.duracaoMin} min · en tu cama · escucha y haz
        </p>
      </header>

      {estado === 'feito' ? (
        <div className="rounded-3xl bg-sage-100 p-5 text-center">
          <p className="text-3xl" aria-hidden>
            🤍
          </p>
          <p className="mt-1 text-lg font-extrabold text-ink-900">
            {terminouReto ? '¡Terminaste el reto de 14 días!' : `¡Día ${props.dia} hecho!`}
          </p>
          <p className="mt-1 text-sm text-ink-700">
            {terminouReto
              ? `Si quieres, mañana repites la segunda semana, desde el día ${proximo}.`
              : `Mañana te espera el día ${proximo}. Descansa y vuelve mañana.`}
          </p>
          <Link href="/" className="btn-secondary mt-4 w-full">
            Volver al inicio
          </Link>
        </div>
      ) : null}

      {props.dia === 1 && props.bienvenidaId && estado !== 'feito' ? (
        <Link href={`/entenda/${props.bienvenidaId}`} className="card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cream-200 text-ink-800">
            <BookIcon width={18} height={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink-900">Antes de empezar</p>
            <p className="text-sm text-ink-700">Lee la bienvenida y el aviso médico</p>
          </div>
          <ChevronRight className="text-ink-700/40" width={20} height={20} />
        </Link>
      ) : null}

      <VideoAula videoId={props.videoId} />

      {props.titulo ? (
        <ConteudoAula conteudo={props.conteudo} />
      ) : (
        <p className="text-ink-700">La guía de hoy estará disponible muy pronto.</p>
      )}

      {estado !== 'feito' ? (
        <div className="space-y-2 pb-4">
          <button
            type="button"
            onClick={concluir}
            disabled={estado === 'enviando'}
            className="btn-primary w-full"
          >
            {estado === 'enviando' ? 'Guardando…' : 'Terminé el día de hoy'}
          </button>
          {estado === 'erro' ? (
            <p className="text-center text-sm text-coral-600">
              No pudimos guardar. Revisa tu conexión e inténtalo de nuevo.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

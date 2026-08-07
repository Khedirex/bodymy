'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PandaPlayer } from '@/components/lesson/PandaPlayer'
import { Celebration } from '@/components/lesson/Celebration'
import { CheckIcon, ChevronLeft } from '@/components/ui/icons'
import { analytics } from '@/lib/analytics'
import type { Lesson, GuiaBloco } from '@/types/db'

interface Props {
  lesson: Lesson & { conteudo: { intro?: string; blocos: GuiaBloco[] } | null }
  programSlug: string
  programNome: string
  weekNumero: number
  dayNumero: number
  jaConcluida: boolean
  proxima: { id: string; titulo: string } | null
}

export function LessonView({
  lesson,
  programSlug,
  programNome,
  weekNumero,
  dayNumero,
  jaConcluida,
  proxima,
}: Props) {
  const router = useRouter()
  const [concluida, setConcluida] = useState(jaConcluida)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [celebrar, setCelebrar] = useState(false)
  const [streak, setStreak] = useState({ atual: 0, recorde: 0 })

  async function marcarFeito() {
    if (loading) return
    setLoading(true)
    setErro(null)
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/complete`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error ?? 'Não foi possível concluir agora.')
        return
      }
      setConcluida(true)
      setStreak({ atual: data.streak?.atual ?? 0, recorde: data.streak?.recorde ?? 0 })
      analytics.lessonCompleted(lesson.id, programSlug)
      setCelebrar(true)
      router.refresh()
    } catch {
      setErro('Sem conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const blocos = lesson.conteudo?.blocos ?? []

  return (
    <div className="space-y-5">
      <Link
        href={`/programa/${programSlug}`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700"
      >
        <ChevronLeft width={18} height={18} /> {programNome}
      </Link>

      <header>
        <span className="chip">
          Semana {weekNumero} · Dia {dayNumero}
        </span>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">
          {lesson.titulo}
        </h1>
        <p className="mt-1 text-sm text-ink-700">{lesson.duracao_min} min · no seu ritmo</p>
      </header>

      {/* Conteúdo: vídeo (Panda) ou guia passo a passo */}
      {lesson.tipo === 'video' && lesson.panda_video_id ? (
        <PandaPlayer videoId={lesson.panda_video_id} />
      ) : null}

      {lesson.conteudo?.intro ? (
        <p className="text-lg leading-relaxed text-ink-800">{lesson.conteudo.intro}</p>
      ) : null}

      {blocos.length > 0 && (
        <div className="space-y-3">
          {blocos.map((b, i) => (
            <BlocoCard key={i} bloco={b} numero={b.tipo === 'passo' ? i + 1 : undefined} />
          ))}
        </div>
      )}

      {erro ? (
        <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">
          {erro}
        </p>
      ) : null}

      {/* CTA de conclusão */}
      <div className="sticky bottom-24 rounded-3xl bg-white/85 p-2 backdrop-blur">
        {concluida ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-sage-100 px-5 py-4 font-bold text-sage-600">
            <CheckIcon width={20} height={20} /> Aula concluída
          </div>
        ) : (
          <button onClick={marcarFeito} className="btn-primary w-full text-lg" disabled={loading}>
            {loading ? 'Salvando…' : 'MARCAR COMO FEITO ✓'}
          </button>
        )}
      </div>

      <Celebration
        aberto={celebrar}
        streakAtual={streak.atual}
        streakRecorde={streak.recorde}
        programSlug={programSlug}
        proxima={proxima}
        onFechar={() => setCelebrar(false)}
      />
    </div>
  )
}

function BlocoCard({ bloco, numero }: { bloco: GuiaBloco; numero?: number }) {
  if (bloco.tipo === 'aviso') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="mb-1 flex items-center gap-1.5 text-sm font-bold text-amber-700">
          <span aria-hidden>⚠️</span> {bloco.titulo ?? 'Aviso importante'}
        </p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-amber-900">
          {bloco.conteudo}
        </p>
      </div>
    )
  }
  if (bloco.tipo === 'dica') {
    return (
      <div className="rounded-2xl bg-gold-300/20 p-4">
        <p className="mb-1 text-sm font-bold text-gold-500">
          {bloco.titulo ?? 'Dica'}
        </p>
        <p className="whitespace-pre-line text-ink-800">{bloco.conteudo}</p>
      </div>
    )
  }
  return (
    <div className="card flex gap-3">
      {numero ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral-100 font-bold text-coral-600">
          {numero}
        </span>
      ) : null}
      <div>
        {bloco.titulo ? (
          <p className="font-bold text-ink-900">{bloco.titulo}</p>
        ) : null}
        <p className="mt-0.5 whitespace-pre-line text-ink-800">{bloco.conteudo}</p>
      </div>
    </div>
  )
}

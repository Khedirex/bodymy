import Link from 'next/link'
import { ChevronLeft } from '@/components/ui/icons'
import { VideoAula } from '@/components/lesson/VideoAula'
import type { GuiaBloco, LessonTipo } from '@/types/db'

// Leitor read-only de uma aula (material "Guías del reto" em /entenda).
// Sem "marcar como feito" — não afeta streak/progresso.
export function LessonReader({
  titulo,
  duracaoMin,
  tipo,
  videoId,
  conteudo,
}: {
  titulo: string
  duracaoMin: number
  tipo: LessonTipo
  videoId: string | null
  conteudo: { intro?: string; blocos: GuiaBloco[] } | null
}) {
  return (
    <div className="space-y-5">
      <Link href="/entenda" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700">
        <ChevronLeft width={18} height={18} /> Guías del reto
      </Link>

      <header>
        <h1 className="text-2xl font-extrabold leading-tight text-ink-900">{titulo}</h1>
        <p className="mt-1 text-sm text-ink-700">
          {tipo === 'video' ? `Video de ${duracaoMin} min` : `${duracaoMin} min de lectura`}
        </p>
      </header>

      {tipo === 'video' ? <VideoAula videoId={videoId} /> : null}

      <ConteudoAula conteudo={conteudo} />
    </div>
  )
}

// Intro + blocos de uma aula. Os passos são numerados entre si (1, 2, 3…),
// independentemente dos blocos de texto/aviso que venham antes.
export function ConteudoAula({ conteudo }: { conteudo: { intro?: string; blocos: GuiaBloco[] } | null }) {
  const blocos = conteudo?.blocos ?? []
  let passo = 0
  return (
    <>
      {conteudo?.intro ? (
        <p className="text-lg leading-relaxed text-ink-800">{conteudo.intro}</p>
      ) : null}

      <div className="space-y-3">
        {blocos.map((b, i) => (
          <BlocoView key={i} bloco={b} numero={b.tipo === 'passo' ? ++passo : undefined} />
        ))}
      </div>
    </>
  )
}

function BlocoView({ bloco, numero }: { bloco: GuiaBloco; numero?: number }) {
  if (bloco.tipo === 'aviso') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="mb-1 flex items-center gap-1.5 text-sm font-bold text-amber-700">
          <span aria-hidden>⚠️</span> {bloco.titulo ?? 'Aviso importante'}
        </p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-amber-900">{bloco.conteudo}</p>
      </div>
    )
  }
  if (bloco.tipo === 'dica') {
    return (
      <div className="rounded-2xl bg-gold-300/20 p-4">
        <p className="mb-1 text-sm font-bold text-gold-500">{bloco.titulo ?? 'Consejo'}</p>
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
        {bloco.titulo ? <p className="font-bold text-ink-900">{bloco.titulo}</p> : null}
        <p className="mt-0.5 whitespace-pre-line text-ink-800">{bloco.conteudo}</p>
      </div>
    </div>
  )
}

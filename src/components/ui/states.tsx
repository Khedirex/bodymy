// Estados reutilizáveis: vazio, carregando e erro. Em pt-BR e acolhedores.
import type { ReactNode } from 'react'

export function EmptyState({
  titulo,
  descricao,
  icone,
  acao,
}: {
  titulo: string
  descricao?: string
  icone?: ReactNode
  acao?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-cream-100 px-6 py-10 text-center">
      {icone ? <div className="text-coral-300">{icone}</div> : null}
      <h3 className="text-base font-bold text-ink-900">{titulo}</h3>
      {descricao ? <p className="max-w-xs text-sm text-ink-700">{descricao}</p> : null}
      {acao}
    </div>
  )
}

export function ErrorState({
  descricao = 'Algo não carregou como esperado. Tente novamente em instantes.',
}: {
  descricao?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-coral-50 px-6 py-10 text-center">
      <h3 className="text-base font-bold text-coral-700">Ops!</h3>
      <p className="max-w-xs text-sm text-ink-700">{descricao}</p>
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-cream-200 ${className}`} />
}

export function LoadingCard() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  )
}

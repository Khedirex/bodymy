import { FlameIcon } from '@/components/ui/icons'

// Selo de streak (🔥 X dias seguidos). Server-safe (sem estado).
export function StreakBadge({ dias, className = '' }: { dias: number; className?: string }) {
  const ativo = dias > 0
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${
        ativo ? 'bg-sun-100 text-ink-900' : 'bg-mist-100 text-ink-700/60'
      } ${className}`}
    >
      <FlameIcon width={18} height={18} className={ativo ? 'text-sun-600' : 'text-ink-700/40'} />
      {ativo ? (
        <span>
          {dias} {dias === 1 ? 'día seguido' : 'días seguidos'}
        </span>
      ) : (
        <span>Empieza hoy</span>
      )}
    </div>
  )
}

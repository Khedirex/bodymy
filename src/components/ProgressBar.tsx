// Barra de progresso simples e acessível.
export function ProgressBar({
  atual,
  total,
  label,
}: {
  atual: number
  total: number
  label?: string
}) {
  const pct = total > 0 ? Math.round((atual / total) * 100) : 0
  return (
    <div>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between text-sm font-medium text-ink-700">
          <span>{label}</span>
          <span>
            {atual}/{total}
          </span>
        </div>
      ) : null}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-cream-200"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-coral-400 to-coral-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

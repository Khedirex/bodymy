// Barra de progresso simples e acessível.
export function ProgressBar({
  atual,
  total,
  label,
  gradiente = 'from-brand-400 to-brand-500',
}: {
  atual: number
  total: number
  label?: string
  /** Classes do gradiente — cada módulo passa a sua (ver modulo-tema.ts). */
  gradiente?: string
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
        className="h-2.5 w-full overflow-hidden rounded-full bg-mist-200"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradiente} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

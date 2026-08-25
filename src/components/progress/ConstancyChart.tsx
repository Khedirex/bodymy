// Gráfico simples de constância: dias ativos por semana (últimas semanas).
// Server-safe (sem estado) — recebe os dados já calculados.
export function ConstancyChart({
  semanas,
}: {
  semanas: { label: string; dias: number }[]
}) {
  const max = 7
  return (
    <div className="card">
      <h3 className="mb-3 font-bold text-ink-900">Tu constancia</h3>
      <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
        {semanas.map((s, i) => {
          const altura = Math.max(6, (s.dias / max) * 100)
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-coral-300 to-coral-400"
                  style={{ height: `${altura}%` }}
                  title={`${s.dias} de 7 días`}
                />
              </div>
              <span className="text-[11px] font-semibold text-ink-700">{s.dias}</span>
              <span className="text-[10px] text-ink-700/50">{s.label}</span>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-center text-xs text-ink-700/60">
        Días activos por semana. La constancia vale más que la intensidad. 🤍
      </p>
    </div>
  )
}

import { copy } from '../data/copy.es'

// Barra 0–14 em dois blocos: Reconfiguración (âmbar) e Fijación (verde-água).
export function Progress14({ completed, current }: { completed: Set<number>; current: number }) {
  return (
    <div>
      <div className="flex gap-1" role="img" aria-label={`${completed.size} / 14`}>
        {Array.from({ length: 14 }, (_, i) => {
          const n = i + 1
          const fija = n > 7
          const done = completed.has(n)
          return (
            <span
              key={n}
              className={`h-3 flex-1 rounded-full ${i === 7 ? 'ml-2' : ''} ${
                done ? (fija ? 'bg-fija' : 'bg-ambar') : n === current ? 'bg-noche-600 ring-2 ring-crema/60' : 'bg-noche-700'
              }`}
            />
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-base text-crema-soft">
        <span>{copy.bloques.reconfiguracionCorto}</span>
        <span>{copy.bloques.fijacion}</span>
      </div>
    </div>
  )
}

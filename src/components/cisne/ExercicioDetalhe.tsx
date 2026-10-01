import type { CisneExercicio } from '@/lib/cisne'

// "Cómo hacerlo" de um movimento do Reset Postura de Cisne: posição
// inicial, passo a passo, lo correcto / evita e a opção mais fácil.
// Mesmo layout da biblioteca do PDF.
export function ExercicioDetalhe({ exercicio }: { exercicio: CisneExercicio }) {
  return (
    <div className="space-y-4 text-ink-800">
      <p className="text-ink-700">{exercicio.objetivo}</p>

      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-sage-600">Posición inicial</p>
        <p>{exercicio.posicaoInicial}</p>
      </div>

      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-sage-600">Paso a paso</p>
        <ol className="space-y-2">
          {exercicio.passos.map((p, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral-100 text-sm font-bold text-coral-600">
                {i + 1}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-2xl bg-sage-100 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-sage-600">Lo correcto</p>
          <p className="mt-1">{exercicio.correto}</p>
        </div>
        <div className="rounded-2xl bg-coral-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-coral-600">Evita</p>
          <p className="mt-1">{exercicio.evita}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-cream-100 p-3 text-sm">
        <span className="font-bold">Más fácil: </span>
        {exercicio.maisFacil}
      </div>
    </div>
  )
}

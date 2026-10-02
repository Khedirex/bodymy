import { copy } from '../data/copy.es'
import { saveCheckpoint, type CheckpointAnswers } from '../protocol/protocol'
import { useStore } from '../state/store'
import { go } from '../state/router'
import { CheckpointForm, Comparacion } from '../components/CheckpointForm'
import { Btn, Ilustracion, PageTitle } from '../components/ui'

const KEYS = ['tardanza', 'despertares', 'energia'] as const

export function Checkpoint({ params }: { params: URLSearchParams }) {
  const { state, update } = useStore()
  const n = (Number(params.get('n')) === 14 ? 14 : 7) as 7 | 14
  const feito = state.checkpoints[String(n) as '7' | '14']
  const anteriores: { label: string; a: CheckpointAnswers }[] = []
  if (state.checkpoints['0']) anteriores.push({ label: copy.checkpoint.noche(0), a: state.checkpoints['0'] })
  if (n === 14 && state.checkpoints['7']) anteriores.push({ label: copy.checkpoint.noche(7), a: state.checkpoints['7'] })

  return (
    <div>
      <Ilustracion name={n === 14 ? 'checkpoint-final' : 'checkpoint'} size={120} />
      <PageTitle title={copy.checkpoint.titulo(n)} />
      <p className="mb-5 text-lg text-crema-soft">{copy.checkpoint.intro(n)}</p>

      {feito ? (
        <div className="space-y-4">
          {KEYS.map((k) => (
            <section key={k} className="rounded-3xl bg-noche-800 p-4">
              <p className="mb-3 text-xl font-bold text-crema">{copy.checkpoint.preguntas[k].q}</p>
              {[...anteriores, { label: copy.checkpoint.noche(n), a: feito }].map((c, i, arr) => (
                <div key={c.label} className="mb-2 flex items-center gap-3">
                  <span className="w-24 shrink-0 text-base text-crema-soft">{c.label}</span>
                  <Comparacion value={c.a[k]} highlight={i === arr.length - 1} />
                </div>
              ))}
            </section>
          ))}
          {feito.cambio ? (
            <section className="rounded-3xl bg-noche-800 p-4">
              <p className="text-xl font-bold text-crema">{copy.checkpoint.cambio}</p>
              <p className="mt-1 text-lg italic text-crema">«{feito.cambio}»</p>
            </section>
          ) : null}
          <p className="text-lg text-ambar">{n === 14 ? copy.checkpoint.cierre14 : copy.checkpoint.animo7}</p>
          <Btn className="w-full" onClick={() => go('hoy')}>
            {copy.final.ir}
          </Btn>
        </div>
      ) : (
        <CheckpointForm
          withCambio={n === 14}
          compare={anteriores}
          submitLabel={copy.checkpoint.guardar}
          onSave={(a) => update((s) => saveCheckpoint(s, n, a))}
        />
      )}
    </div>
  )
}

import { useState } from 'react'
import { copy } from '../data/copy.es'
import { completeOnboarding, type Level } from '../protocol/protocol'
import { useStore } from '../state/store'
import { go } from '../state/router'
import { Btn, Ilustracion, Ancla } from '../components/ui'

const NIVELES: Level[] = ['leve', 'moderada', 'severa']

export function Onboarding() {
  const { state, update } = useStore()
  const [paso, setPaso] = useState(1)
  const [nivel, setNivel] = useState<Level | null>(null)
  const [hora, setHora] = useState(state.startHour)

  return (
    <div className="flex min-h-[85vh] flex-col">
      <p className="text-base font-bold text-ambar">{copy.onboarding.paso(paso)}</p>

      {paso === 1 ? (
        <div className="flex-1 space-y-4 pt-4">
          <Ilustracion name="portada" size={170} />
          <h1 className="text-center text-4xl font-extrabold text-crema">{copy.onboarding.p1Titulo}</h1>
          <p className="text-xl text-crema">{copy.onboarding.p1Texto}</p>
          <div className="rounded-3xl bg-noche-800 p-5">
            <p className="text-xl font-bold text-ambar">{copy.onboarding.p1Destacado}</p>
            <p className="mt-2 text-lg text-crema-soft">{copy.onboarding.p1Por}</p>
          </div>
          <p className="text-lg text-crema-soft">{copy.onboarding.p1Tiempo}</p>
          <Ancla />
        </div>
      ) : null}

      {paso === 2 ? (
        <div className="flex-1 space-y-4 pt-4">
          <Ilustracion name="nivel" size={120} />
          <h1 className="text-center text-3xl font-extrabold text-crema">{copy.onboarding.p2Titulo}</h1>
          <p className="text-center text-lg text-crema-soft">{copy.onboarding.p2Texto}</p>
          <div className="space-y-3" role="radiogroup" aria-label={copy.onboarding.p2Titulo}>
            {NIVELES.map((n) => (
              <button
                key={n}
                role="radio"
                aria-checked={nivel === n}
                onClick={() => setNivel(n)}
                className={`w-full rounded-3xl border-2 p-5 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-ambar/60 ${
                  nivel === n ? 'border-ambar bg-noche-700' : 'border-noche-600 bg-noche-800'
                }`}
              >
                <span className="block text-2xl font-extrabold text-ambar">{copy.niveles[n].nombre}</span>
                <span className="mt-1 block text-lg text-crema">{copy.niveles[n].cambia}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {paso === 3 ? (
        <div className="flex-1 space-y-4 pt-4">
          <Ilustracion name="hora-fija" size={130} />
          <h1 className="text-center text-3xl font-extrabold text-crema">{copy.onboarding.p3Titulo}</h1>
          <p className="text-lg text-crema-soft">{copy.onboarding.p3Texto}</p>
          <label htmlFor="hora" className="block text-xl font-bold text-crema">
            {copy.onboarding.p3Label}
          </label>
          <input
            id="hora"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="min-h-16 w-full rounded-2xl border-2 border-noche-600 bg-noche-900 px-4 text-3xl font-bold text-crema [color-scheme:dark] focus:border-ambar focus:outline-none"
          />
          <div className="rounded-3xl bg-noche-800 p-5">
            <p className="text-xl font-bold text-ambar">{copy.onboarding.p3Ventana}</p>
            <p className="mt-2 text-lg text-crema">{copy.onboarding.p3VentanaTexto}</p>
          </div>
          <p className="text-lg text-crema-soft">{copy.onboarding.p3Consejo}</p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {paso < 3 ? (
          <Btn disabled={paso === 2 && !nivel} onClick={() => setPaso(paso + 1)}>
            {copy.onboarding.siguiente}
          </Btn>
        ) : (
          <Btn
            disabled={!hora || !nivel}
            onClick={() => {
              update((s) => completeOnboarding(s, nivel!, hora))
              go('noche-cero')
            }}
          >
            {copy.onboarding.empezar}
          </Btn>
        )}
        {paso > 1 ? (
          <Btn variant="ghost" onClick={() => setPaso(paso - 1)}>
            {copy.onboarding.atras}
          </Btn>
        ) : null}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { copy } from '../data/copy.es'
import { completePreset, saveCheckpoint } from '../protocol/protocol'
import { useStore } from '../state/store'
import { go } from '../state/router'
import { Checklist, PRESET_ITEMS, type PresetKey } from '../components/Checklist'
import { CheckpointForm } from '../components/CheckpointForm'
import { Btn, Ilustracion, PageTitle } from '../components/ui'

// Noche Cero: preset de 6 itens → ponto de partida (as 3 perguntas, base
// para os checkpoints 7 e 14). Sem áudio.
export function NocheCero() {
  const { state, update } = useStore()
  const [checked, setChecked] = useState<Record<PresetKey, boolean>>(
    () => Object.fromEntries(PRESET_ITEMS.map((i) => [i.key, false])) as Record<PresetKey, boolean>,
  )
  const [frase, setFrase] = useState(state.closingPhrase)
  const marcados = PRESET_ITEMS.filter((i) => checked[i.key] && (i.key !== 'frase' || frase.trim())).length
  const listo = marcados === PRESET_ITEMS.length

  if (state.presetDone && !state.checkpoints['0']) {
    return (
      <div>
        <PageTitle title={copy.baseline.titulo} />
        <p className="mb-5 text-lg text-crema-soft">{copy.baseline.texto}</p>
        <CheckpointForm
          withCambio={false}
          compare={[]}
          submitLabel={copy.baseline.guardar}
          onSave={(a) => {
            update((s) => saveCheckpoint(s, 0, a))
            go('hoy')
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <Ilustracion name="noche-cero" size={140} />
      <PageTitle title={copy.preset.titulo} subtitle={copy.preset.subtitulo} />
      <p className="mb-4 text-lg text-crema-soft">{copy.preset.intro}</p>
      <Checklist
        checked={checked}
        onToggle={(k) => setChecked((p) => ({ ...p, [k]: !p[k] }))}
        frase={frase}
        onFrase={setFrase}
      />
      <p className="my-5 rounded-2xl bg-noche-800 p-4 text-lg font-bold text-ambar">{copy.preset.sinAudio}</p>
      <Btn className="w-full" disabled={!listo} onClick={() => update((s) => completePreset(s, frase.trim()))}>
        {copy.preset.listo}
      </Btn>
      {!listo ? <p className="mt-2 text-center text-base text-crema-soft">{copy.preset.faltan(marcados)}</p> : null}
    </div>
  )
}

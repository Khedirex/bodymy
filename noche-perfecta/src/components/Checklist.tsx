import { copy } from '../data/copy.es'
import { asset } from '../data/asset'

export const PRESET_ITEMS = [
  { key: 'celular', icono: 'preset-celular' },
  { key: 'audifonos', icono: 'preset-audifonos' },
  { key: 'luz', icono: 'preset-luz' },
  { key: 'fresco', icono: 'preset-fresco' },
  { key: 'agua', icono: 'preset-agua' },
  { key: 'frase', icono: 'preset-frase' },
] as const

export type PresetKey = (typeof PRESET_ITEMS)[number]['key']

// Checklist do preset com ícone. O último item é a frase de cierre (campo de texto).
export function Checklist({
  checked,
  onToggle,
  frase,
  onFrase,
}: {
  checked: Record<PresetKey, boolean>
  onToggle: (k: PresetKey) => void
  frase: string
  onFrase: (v: string) => void
}) {
  return (
    <ul className="space-y-3">
      {PRESET_ITEMS.map(({ key, icono }) => {
        const on = checked[key]
        const id = `preset-${key}`
        return (
          <li key={key} className={`rounded-2xl p-3 ${on ? 'bg-noche-700' : 'bg-noche-800'}`}>
            <label htmlFor={id} className="flex min-h-14 cursor-pointer items-center gap-3">
              <input
                id={id}
                type="checkbox"
                checked={on}
                onChange={() => onToggle(key)}
                className="h-7 w-7 shrink-0 accent-[#f5c86a]"
              />
              <img src={asset(`/illustrations/${icono}.webp`)} alt="" className="h-12 w-12 shrink-0 object-contain" />
              <span className="text-lg text-crema">{copy.preset.items[key]}</span>
            </label>
            {key === 'frase' ? (
              <div className="mt-2 pl-10">
                <input
                  aria-label={copy.preset.items.frase}
                  value={frase}
                  onChange={(e) => onFrase(e.target.value)}
                  placeholder={copy.preset.frasePlaceholder}
                  maxLength={80}
                  className="min-h-14 w-full rounded-2xl border-2 border-noche-600 bg-noche-900 px-4 text-lg text-crema placeholder:text-crema-soft/70 focus:border-ambar focus:outline-none"
                />
                <p className="mt-1 text-base text-crema-soft">{copy.preset.fraseAyuda}</p>
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

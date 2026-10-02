import { copy } from '../data/copy.es'
import { go, type Route } from '../state/router'
import { PageTitle } from '../components/ui'
import { asset } from '../data/asset'

const ITEMS: { route: Route; label: string; icono: string; params?: Record<string, string> }[] = [
  { route: 'bitacora', label: copy.mas.bitacora, icono: 'bitacora' },
  { route: 'player', label: copy.mas.rescate, icono: 'rescate', params: { mode: 'rescate', audio: 'vn5' } },
  { route: 'si-cuesta', label: copy.mas.siCuesta, icono: 'si-te-cuesta' },
  { route: 'errores', label: copy.mas.errores, icono: 'errores' },
  { route: 'ajustes', label: copy.mas.ajustes, icono: 'hora-fija' },
]

export function Mas() {
  return (
    <div>
      <PageTitle title={copy.mas.titulo} />
      <ul className="space-y-3">
        {ITEMS.map((i) => (
          <li key={i.label}>
            <button
              onClick={() => go(i.route, i.params)}
              className="flex min-h-20 w-full items-center gap-4 rounded-3xl bg-noche-800 p-4 text-left text-xl font-bold text-crema focus:outline-none focus-visible:ring-4 focus-visible:ring-ambar/60"
            >
              <img src={asset(`/illustrations/${i.icono}.webp`)} alt="" className="h-14 w-14 object-contain" />
              <span className="flex-1">{i.label}</span>
              <span aria-hidden="true" className="text-crema-soft">›</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

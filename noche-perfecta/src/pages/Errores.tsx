import { copy } from '../data/copy.es'
import { Ilustracion, PageTitle } from '../components/ui'

export function Errores() {
  return (
    <div>
      <Ilustracion name="errores" size={110} />
      <PageTitle title={copy.errores.titulo} back="mas" />
      <ol className="space-y-3">
        {copy.errores.items.map((e, i) => (
          <li key={e.t} className="flex items-center gap-4 rounded-3xl bg-noche-800 p-4">
            <img src={e.icono} alt="" className="h-16 w-16 shrink-0 object-contain" />
            <div>
              <p className="text-xl font-bold text-ambar">
                {i + 1}. {e.t}
              </p>
              <p className="text-lg text-crema">{e.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

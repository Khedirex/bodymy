import { copy } from '../data/copy.es'
import { Card, Ilustracion, PageTitle } from '../components/ui'

export function SiCuesta() {
  const c = copy.siCuesta
  return (
    <div className="space-y-4">
      <Ilustracion name="si-te-cuesta" size={120} />
      <PageTitle title={c.titulo} subtitle={c.subtitulo} back="mas" />
      <p className="text-xl font-bold text-ambar">{c.lema}</p>
      {c.reglas.map((r) => (
        <Card key={r.t}>
          <h2 className="text-xl font-extrabold text-crema">{r.t}</h2>
          <p className="mt-2 text-lg text-crema-soft">{r.d}</p>
        </Card>
      ))}
      <p className="rounded-2xl border-2 border-ambar p-4 text-center text-lg font-bold text-crema">{c.nunca}</p>
      <Card>
        <h2 className="text-xl font-extrabold text-crema">{c.despuesTitulo}</h2>
        <p className="mt-2 text-lg text-crema-soft">{c.despuesTexto}</p>
        <ul className="mt-2 list-disc pl-6 text-lg text-crema-soft">
          {c.despuesItems.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

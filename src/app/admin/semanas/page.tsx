import { getSemanasAdmin, getCircuitosAdmin } from '@/lib/admin-queries'
import { SemanaToggle } from '@/components/admin/SemanaToggle'

export const dynamic = 'force-dynamic'

export default async function SemanasPage() {
  // Cada protocolo (circuito) tem a própria liberação de semanas.
  const circuitos = (await getCircuitosAdmin()).filter((c) => c.semanas > 1)
  const blocos = await Promise.all(circuitos.map(async (c) => ({ circuito: c, semanas: await getSemanasAdmin(c) })))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Liberación de semanas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cada protocolo tiene sus semanas. La Semana 1 siempre está disponible. Libera las demás
          cuando los videos de esa variación (v2, v3…) estén listos. Mientras estén bloqueadas, la
          alumna repite la semana anterior — la racha sigue contando.
        </p>
      </div>

      {blocos.map(({ circuito, semanas }) => (
        <section key={circuito.slug} className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">{circuito.nome}</h2>
          {semanas.map((s) => {
            const completo = s.videosPreenchidos >= s.videosTotal
            return (
              <div key={s.semana} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Semana {s.semana}
                      <span className="ml-2 text-sm font-normal text-slate-400">entra en v{s.variacao}</span>
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-600">
                      v{s.variacao}: <span className={completo ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-700'}>{s.videosPreenchidos}/{s.videosTotal} videos</span>
                      {s.alunasAguardando > 0 ? (
                        <span className="ml-3 text-slate-500">· {s.alunasAguardando} alumna(s) esperando</span>
                      ) : null}
                    </p>
                  </div>
                  {s.semana === 1 ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">siempre liberada</span>
                  ) : (
                    <SemanaToggle circuito={circuito.slug} semana={s.semana} liberada={s.liberada} completo={completo} preenchidos={s.videosPreenchidos} total={s.videosTotal} />
                  )}
                </div>
                {/* barra de progresso dos vídeos da variação */}
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${completo ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${s.videosTotal ? Math.round((s.videosPreenchidos / s.videosTotal) * 100) : 0}%` }} />
                </div>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}

import Link from 'next/link'
import { getCircuitoOverview, getCircuitosAdmin } from '@/lib/admin-queries'
import { StretchesEditor } from '@/components/admin/StretchesEditor'
import { CIRCUITO_PRINCIPAL } from '@/lib/training'

export const dynamic = 'force-dynamic'

// Cada produto tem o próprio protocolo (circuito). ?c= escolhe qual editar.
export default async function ExerciciosPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const circuitos = await getCircuitosAdmin()
  const pedido = typeof searchParams.c === 'string' ? searchParams.c : null
  const atual =
    circuitos.find((c) => c.slug === pedido) ??
    circuitos.find((c) => c.slug === CIRCUITO_PRINCIPAL) ??
    circuitos[0]
  if (!atual) return <p className="text-sm text-slate-500">No hay protocolos registrados.</p>

  const { dias, stretches, counts } = await getCircuitoOverview(atual.slug)
  const pct = counts.total ? Math.round((counts.preenchidos / counts.total) * 100) : 0
  const niveis = Array.from({ length: atual.semanas }, (_, i) => i + 1)
  const totalEx = dias.reduce((n, d) => n + d.exercicios.length, 0)

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2">
        {circuitos.map((c) => (
          <Link
            key={c.slug}
            href={`/admin/exercicios?c=${c.slug}`}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
              c.slug === atual.slug ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {c.nome}
          </Link>
        ))}
      </nav>
      <div>
        <h1 className="text-xl font-bold text-slate-900">Circuito — {atual.nome}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {totalEx} ejercicios ({atual.semanas} semana{atual.semanas > 1 ? 's' : ''} · la semana N usa la
          variación vN), más {stretches.length} estiramientos del bloque de movilidad. Pega el{' '}
          <code>panda_video_id</code> de cada video aquí.
        </p>
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Videos completados</span>
            <span className="text-slate-500">
              {counts.preenchidos} de {counts.total} ({pct}%)
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Exercícios por dia do ciclo */}
      {dias.map(({ dia, exercicios }) => (
        <section key={dia}>
          <h2 className="mb-2 text-base font-bold text-slate-900">Día {dia} del ciclo</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Ejercicio</th>
                  <th className="px-3 py-2 font-medium">Videos (v1–v{atual.semanas})</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {exercicios.map((e) => {
                  const preenchidos = e.variacoes.filter((v) => v.panda_video_id).length
                  return (
                    <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-400">{e.ordem_no_circuito}</td>
                      <td className="px-3 py-2">
                        <Link href={`/admin/exercicios/${e.id}`} className="font-medium text-slate-900 hover:underline">
                          {e.nome}
                        </Link>
                        {!e.ativo ? <span className="ml-2 text-xs text-slate-400">(inactivo)</span> : null}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {niveis.map((n) => {
                            const v = e.variacoes.find((x) => x.nivel === n)
                            const on = Boolean(v?.panda_video_id)
                            return (
                              <span
                                key={n}
                                title={`v${n}${on ? ' — completado' : ' — vacío'}`}
                                className={`inline-flex h-6 w-7 items-center justify-center rounded text-xs font-semibold ${
                                  on ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                v{n}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link href={`/admin/exercicios/${e.id}`} className="text-sm font-semibold text-slate-700 hover:underline">
                          Editar ({preenchidos}/{atual.semanas})
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* Bloco de mobilidade — alongamentos */}
      <section>
        <h2 className="mb-2 text-base font-bold text-slate-900">Bloque de movilidad — {stretches.length} estiramientos</h2>
        <p className="mb-3 text-sm text-slate-500">
          La misma secuencia (30s cada uno) corre antes del circuito, todos los días.
        </p>
        <StretchesEditor stretches={stretches} />
      </section>
    </div>
  )
}

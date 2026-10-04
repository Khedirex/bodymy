import Link from 'next/link'
import { listFeedbacks, getFeedbackDeAudios } from '@/lib/admin-queries'

export const dynamic = 'force-dynamic'

function fmt(dt: string) {
  return new Date(dt).toLocaleString('es-419', { dateStyle: 'short', timeStyle: 'short' })
}

const EIXO_LABEL: Record<string, string> = {
  descanso: 'Descanso',
  exercicio: 'Ejercicio',
  series: 'Series',
}
const INTENSIDADE_LABEL = ['', 'Muy leve', 'Leve', 'Moderado', 'Poco intenso', 'Intenso', 'Muy intenso']

export default async function FeedbacksPage({
  searchParams,
}: {
  searchParams: { q?: string; comentario?: string; de?: string; ate?: string; page?: string }
}) {
  const soComentario = searchParams.comentario !== '0'
  const { rows, total } = await listFeedbacks({
    q: searchParams.q,
    soComentario,
    de: searchParams.de,
    ate: searchParams.ate,
    page: Number(searchParams.page ?? '1'),
  })

  const audio = await getFeedbackDeAudios()

  return (
    <div className="space-y-4">
      {/* Áudio: o retorno do fim de cada faixa */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-bold text-slate-900">
          Audios · lo que responden al terminar{' '}
          <span className="font-normal text-slate-400">({audio.total} respuesta(s))</span>
        </h2>

        {audio.resumo.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">
            Todavía nadie respondió. La pregunta aparece sola cuando el audio termina.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Audio</th>
                  <th className="px-3 py-2 font-medium">Producto</th>
                  <th className="px-3 py-2 font-medium">😴 Durmió</th>
                  <th className="px-3 py-2 font-medium">🤍 Relajó</th>
                  <th className="px-3 py-2 font-medium">😕 No ayudó</th>
                </tr>
              </thead>
              <tbody>
                {audio.resumo.map((r) => (
                  <tr key={r.audioId} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">{r.titulo}</td>
                    <td className="px-3 py-2 text-slate-500">{r.modulo}</td>
                    <td className="px-3 py-2 text-slate-700">{r.dormi}</td>
                    <td className="px-3 py-2 text-slate-700">{r.relajo}</td>
                    <td className={`px-3 py-2 font-semibold ${r.naoAjudou > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                      {r.naoAjudou}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-slate-500">
              Ordenado por “no ayudó”: arriba está lo que conviene cambiar primero.
            </p>
          </div>
        )}

        {audio.comentarios.length > 0 && (
          <ul className="mt-4 space-y-2">
            {audio.comentarios.slice(0, 15).map((c, i) => (
              <li key={i} className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm">
                <p className="text-slate-900">“{c.comentario}”</p>
                <p className="mt-1 text-xs text-slate-500">
                  {c.aluna ?? 'alumna'} · {c.titulo} · {fmt(c.quando)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div>
        <h1 className="text-xl font-bold text-slate-900">Comentarios de las alumnas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lo que escribieron al final de las sesiones. {total} registro(s).
        </p>
      </div>

      {/* Filtros */}
      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm">
        <label className="flex flex-col">
          <span className="text-xs text-slate-500">Alumna (nombre/correo)</span>
          <input name="q" defaultValue={searchParams.q ?? ''} className="mt-1 rounded border border-slate-200 px-2 py-1" />
        </label>
        <label className="flex flex-col">
          <span className="text-xs text-slate-500">Desde</span>
          <input type="date" name="de" defaultValue={searchParams.de ?? ''} className="mt-1 rounded border border-slate-200 px-2 py-1" />
        </label>
        <label className="flex flex-col">
          <span className="text-xs text-slate-500">Hasta</span>
          <input type="date" name="ate" defaultValue={searchParams.ate ?? ''} className="mt-1 rounded border border-slate-200 px-2 py-1" />
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" name="comentario" value="0" defaultChecked={!soComentario} />
          <span className="text-slate-600">incluir sin comentario</span>
        </label>
        <button className="rounded-md bg-slate-900 px-3 py-1.5 font-semibold text-white hover:bg-slate-700">Filtrar</button>
      </form>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
          No hay comentarios con esos filtros.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/admin/alunas/${r.user_id}`} className="font-semibold text-slate-900 hover:underline">
                  {r.aluna}
                </Link>
                <span className="text-xs text-slate-400">{fmt(r.created_at)}</span>
              </div>
              {r.comentario ? (
                <p className="mt-2 whitespace-pre-line text-slate-800">{r.comentario}</p>
              ) : (
                <p className="mt-2 text-sm italic text-slate-400">(sin comentario)</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                {r.intensidade_percebida ? (
                  <span className="rounded bg-slate-100 px-2 py-0.5">{INTENSIDADE_LABEL[r.intensidade_percebida]}</span>
                ) : null}
                {r.eixo_dificuldade ? (
                  <span className="rounded bg-slate-100 px-2 py-0.5">dificultad: {EIXO_LABEL[r.eixo_dificuldade] ?? r.eixo_dificuldade}</span>
                ) : null}
                {r.ajuste_aceito ? <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">ajustó</span> : null}
                {r.data_sessao ? <span className="rounded bg-slate-100 px-2 py-0.5">sesión {r.data_sessao}</span> : null}
                {r.email ? <span className="text-slate-400">{r.email}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

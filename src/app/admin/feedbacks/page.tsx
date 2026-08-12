import Link from 'next/link'
import { listFeedbacks } from '@/lib/admin-queries'

export const dynamic = 'force-dynamic'

function fmt(dt: string) {
  return new Date(dt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const EIXO_LABEL: Record<string, string> = {
  descanso: 'Descanso',
  exercicio: 'Exercício',
  series: 'Séries',
}
const INTENSIDADE_LABEL = ['', 'Muito leve', 'Leve', 'Moderado', 'Pouco intenso', 'Intenso', 'Muito intenso']

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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Feedbacks das alunas</h1>
        <p className="mt-1 text-sm text-slate-500">
          O que elas escreveram ao final das sessões. {total} registro(s).
        </p>
      </div>

      {/* Filtros */}
      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm">
        <label className="flex flex-col">
          <span className="text-xs text-slate-500">Aluna (nome/email)</span>
          <input name="q" defaultValue={searchParams.q ?? ''} className="mt-1 rounded border border-slate-200 px-2 py-1" />
        </label>
        <label className="flex flex-col">
          <span className="text-xs text-slate-500">De</span>
          <input type="date" name="de" defaultValue={searchParams.de ?? ''} className="mt-1 rounded border border-slate-200 px-2 py-1" />
        </label>
        <label className="flex flex-col">
          <span className="text-xs text-slate-500">Até</span>
          <input type="date" name="ate" defaultValue={searchParams.ate ?? ''} className="mt-1 rounded border border-slate-200 px-2 py-1" />
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" name="comentario" value="0" defaultChecked={!soComentario} />
          <span className="text-slate-600">incluir sem comentário</span>
        </label>
        <button className="rounded-md bg-slate-900 px-3 py-1.5 font-semibold text-white hover:bg-slate-700">Filtrar</button>
      </form>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
          Nenhum feedback com esses filtros.
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
                <p className="mt-2 text-sm italic text-slate-400">(sem comentário)</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                {r.intensidade_percebida ? (
                  <span className="rounded bg-slate-100 px-2 py-0.5">{INTENSIDADE_LABEL[r.intensidade_percebida]}</span>
                ) : null}
                {r.eixo_dificuldade ? (
                  <span className="rounded bg-slate-100 px-2 py-0.5">dificuldade: {EIXO_LABEL[r.eixo_dificuldade] ?? r.eixo_dificuldade}</span>
                ) : null}
                {r.ajuste_aceito ? <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">ajustou</span> : null}
                {r.data_sessao ? <span className="rounded bg-slate-100 px-2 py-0.5">sessão {r.data_sessao}</span> : null}
                {r.email ? <span className="text-slate-400">{r.email}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

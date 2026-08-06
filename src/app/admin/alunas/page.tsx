import Link from 'next/link'
import { listAlunas } from '@/lib/admin-queries'

export const dynamic = 'force-dynamic'

function fmtDate(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function AlunasPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const q = searchParams.q ?? ''
  const page = Math.max(1, Number(searchParams.page ?? '1') || 1)
  const { rows, total, perPage } = await listAlunas({ q, page })
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const linkPagina = (p: number) => `/admin/alunas?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Alunas</h1>
        <span className="text-sm text-slate-500">{total} no total</span>
      </div>

      <form method="get" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou e-mail…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          Buscar
        </button>
        {q ? (
          <Link href="/admin/alunas" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Limpar
          </Link>
        ) : null}
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Nome</th>
              <th className="px-3 py-2 font-medium">E-mail</th>
              <th className="px-3 py-2 font-medium">Produtos ativos</th>
              <th className="px-3 py-2 font-medium">Cadastro</th>
              <th className="px-3 py-2 font-medium">Último login</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  {q ? 'Nenhuma aluna encontrada para essa busca.' : 'Nenhuma aluna ainda.'}
                </td>
              </tr>
            ) : (
              rows.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <Link href={`/admin/alunas/${a.id}`} className="font-medium text-slate-900 hover:underline">
                      {a.nome ?? '(sem nome)'}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{a.email}</td>
                  <td className="px-3 py-2">
                    {a.produtosAtivos.length ? (
                      <span className="text-slate-700">{a.produtosAtivos.join(', ')}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">{fmtDate(a.created_at)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">{fmtDate(a.ultimoLogin)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={linkPagina(page - 1)} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">← Anterior</Link>
            ) : null}
            {page < totalPages ? (
              <Link href={linkPagina(page + 1)} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">Próxima →</Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

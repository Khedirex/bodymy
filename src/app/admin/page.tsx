import Link from 'next/link'
import { getAdminOverview } from '@/lib/admin-queries'

export const dynamic = 'force-dynamic'

function fmt(dt: string) {
  return new Date(dt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function emailDoPayload(p: Record<string, unknown> | null): string {
  if (!p) return '—'
  return (
    (p.customer_email as string) ??
    ((p.Customer as { email?: string })?.email) ??
    '—'
  )
}

export default async function AdminOverview() {
  const o = await getAdminOverview()

  const cards = [
    { label: 'Total de alunas', valor: o.totalAlunas },
    { label: 'Acessos concedidos hoje', valor: o.acessosHoje },
    { label: 'Acessos nos últimos 7 dias', valor: o.acessosSemana },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Visão geral</h1>
        <Link
          href="/admin/alunas"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Buscar aluna →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{c.valor}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Últimas compras (webhook Kiwify)</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Quando</th>
                <th className="px-3 py-2 font-medium">E-mail</th>
                <th className="px-3 py-2 font-medium">event_id</th>
                <th className="px-3 py-2 font-medium">Processado</th>
              </tr>
            </thead>
            <tbody>
              {o.ultimosWebhooks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                    Nenhum webhook recebido ainda.
                  </td>
                </tr>
              ) : (
                o.ultimosWebhooks.map((w) => (
                  <tr key={w.id} className="border-b border-slate-100">
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">{fmt(w.created_at)}</td>
                    <td className="px-3 py-2">{emailDoPayload(w.payload)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{w.event_id}</td>
                    <td className="px-3 py-2">
                      {w.processed ? (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">sim</span>
                      ) : (
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">não</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

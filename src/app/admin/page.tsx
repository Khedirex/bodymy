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
    { label: 'Total de alumnas', valor: o.totalAlunas },
    { label: 'Accesos otorgados hoy', valor: o.acessosHoje },
    { label: 'Accesos en los últimos 7 días', valor: o.acessosSemana },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Visión general</h1>
        <Link
          href="/admin/alunas"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Buscar alumna →
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
                <th className="px-3 py-2 font-medium">Cuándo</th>
                <th className="px-3 py-2 font-medium">Correo</th>
                <th className="px-3 py-2 font-medium">event_id</th>
                <th className="px-3 py-2 font-medium">Procesado</th>
              </tr>
            </thead>
            <tbody>
              {o.ultimosWebhooks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                    Todavía no se recibió ningún webhook.
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
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">sí</span>
                      ) : (
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">no</span>
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

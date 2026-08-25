import Link from 'next/link'
import { listProductsAdmin } from '@/lib/admin-queries'

export const dynamic = 'force-dynamic'

export default async function ProdutosPage() {
  const produtos = await listProductsAdmin()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Productos</h1>
        <Link href="/admin/produtos/novo" className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700">
          + Nuevo producto
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Nombre</th>
              <th className="px-3 py-2 font-medium">Slug</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium text-right">Compradoras</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2">
                  <Link href={`/admin/produtos/${p.id}`} className="font-medium text-slate-900 hover:underline">{p.nome}</Link>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-slate-500">{p.slug}</td>
                <td className="px-3 py-2 text-slate-600">{p.tipo}</td>
                <td className="px-3 py-2">{p.ativo ? <span className="text-emerald-700">ativo</span> : <span className="text-slate-400">inactivo</span>}</td>
                <td className="px-3 py-2 text-right text-slate-700">{p.compradores}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

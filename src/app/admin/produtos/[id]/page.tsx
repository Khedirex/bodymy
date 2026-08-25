import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductAdmin } from '@/lib/admin-queries'
import { ProductForm } from '@/components/admin/ProductForm'
import { EsteiraManager } from '@/components/admin/EsteiraManager'

export const dynamic = 'force-dynamic'

export default async function ProdutoEditPage({ params }: { params: { id: string } }) {
  const data = await getProductAdmin(params.id)
  if (!data) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/produtos" className="hover:underline">← Productos</Link>
        <span>/</span>
        <span className="text-slate-800">{data.product.nome}</span>
      </div>

      {/* Esteira de backend — a parte mais importante da tela */}
      <section className="rounded-lg border-2 border-slate-900/10 bg-white p-4">
        <h2 className="mb-3 text-base font-bold text-slate-900">Embudo de backend (upsells)</h2>
        <EsteiraManager productId={data.product.id} upsells={data.upsells} todos={data.todos} />
      </section>

      <ProductForm product={data.product} />
    </div>
  )
}

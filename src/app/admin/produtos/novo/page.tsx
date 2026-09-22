import Link from 'next/link'
import { ProductForm } from '@/components/admin/ProductForm'
import { getCircuitosAdmin } from '@/lib/admin-queries'

export const dynamic = 'force-dynamic'

export default async function NovoProdutoPage() {
  const circuitos = await getCircuitosAdmin()
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/produtos" className="hover:underline">← Productos</Link>
        <span>/</span>
        <span className="text-slate-800">Nuevo producto</span>
      </div>
      <p className="text-sm text-slate-500">
        Crea el producto y guarda. Después de creado, podrás configurar el embudo de upsell.
      </p>
      <ProductForm product={null} circuitos={circuitos} />
    </div>
  )
}

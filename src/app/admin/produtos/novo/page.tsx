import Link from 'next/link'
import { ProductForm } from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export default function NovoProdutoPage() {
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
      <ProductForm product={null} />
    </div>
  )
}

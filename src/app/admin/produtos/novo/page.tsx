import Link from 'next/link'
import { ProductForm } from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export default function NovoProdutoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/produtos" className="hover:underline">← Produtos</Link>
        <span>/</span>
        <span className="text-slate-800">Novo produto</span>
      </div>
      <p className="text-sm text-slate-500">
        Crie o produto e salve. Depois de criado, você poderá configurar a esteira de upsell dele.
      </p>
      <ProductForm product={null} />
    </div>
  )
}

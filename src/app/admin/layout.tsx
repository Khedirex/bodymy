import Link from 'next/link'
import { requireAdminPage } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — BodyMy', robots: { index: false, follow: false } }

// Guard no layout → cobre TODAS as páginas /admin/*. Não-admin recebe 404.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage()

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-5">
            <Link href="/admin" className="text-sm font-extrabold text-slate-900">
              BodyMy <span className="font-medium text-slate-400">admin</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin" className="text-slate-600 hover:text-slate-900">Visão geral</Link>
              <Link href="/admin/alunas" className="text-slate-600 hover:text-slate-900">Alunas</Link>
              <Link href="/admin/produtos" className="text-slate-600 hover:text-slate-900">Produtos</Link>
              <Link href="/admin/exercicios" className="text-slate-600 hover:text-slate-900">Circuito</Link>
              <Link href="/admin/feedbacks" className="text-slate-600 hover:text-slate-900">Feedbacks</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{admin.email}</span>
            <Link href="/" className="rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-50">
              Ver app
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}

import Link from 'next/link'
import { BottomNav } from '@/components/layout/BottomNav'
import { UserIcon } from '@/components/ui/icons'

// Shell das telas autenticadas: cabeçalho fixo (com acesso permanente ao
// perfil), container mobile-first e tab bar fixa. A proteção de sessão é
// feita no middleware; aqui cuidamos do layout.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-cream-50">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-cream-200 bg-cream-50/90 px-4 py-2.5 backdrop-blur">
        <Link href="/" className="text-lg font-extrabold text-ink-900">
          Body<span className="text-coral-500">My</span>
        </Link>
        <Link
          href="/perfil"
          aria-label="Minha conta"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-700 shadow-card"
        >
          <UserIcon width={22} height={22} />
        </Link>
      </header>
      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
      <BottomNav />
    </div>
  )
}

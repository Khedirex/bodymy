import { BottomNav } from '@/components/layout/BottomNav'

// Shell das telas autenticadas: container mobile-first + tab bar fixa.
// A proteção de sessão é feita no middleware; aqui cuidamos do layout.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-cream-50">
      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
      <BottomNav />
    </div>
  )
}

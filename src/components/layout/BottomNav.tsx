'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  RouteIcon,
  SaladIcon,
  ChatIcon,
  ChartIcon,
  CompassIcon,
} from '@/components/ui/icons'

const ITEMS = [
  { href: '/', label: 'Inicio', Icon: HomeIcon, match: (p: string) => p === '/' },
  { href: '/treino', label: 'Tu plan', Icon: RouteIcon, match: (p: string) => p.startsWith('/treino') || p.startsWith('/programa') },
  { href: '/dieta', label: 'Dieta', Icon: SaladIcon, match: (p: string) => p.startsWith('/dieta') },
  { href: '/sofia', label: 'Sofía', Icon: ChatIcon, match: (p: string) => p.startsWith('/sofia') },
  { href: '/progresso', label: 'Progreso', Icon: ChartIcon, match: (p: string) => p.startsWith('/progresso') },
  { href: '/descubra', label: 'Descubre', Icon: CompassIcon, match: (p: string) => p.startsWith('/descubra') || p.startsWith('/oferta') },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="tabbar-safe fixed inset-x-0 bottom-0 z-40 border-t border-cream-200 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-1">
        {ITEMS.map(({ href, label, Icon, match }) => {
          const active = match(pathname)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold"
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={active ? 'text-coral-500' : 'text-ink-700/50'}
                  width={24}
                  height={24}
                />
                <span className={active ? 'text-coral-600' : 'text-ink-700/60'}>
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

import { useEffect } from 'react'
import { copy } from './data/copy.es'
import { getView, nightDate } from './protocol/protocol'
import { isDebug, useStore } from './state/store'
import { go, useLocation, type Route } from './state/router'
import { avisarBitacora } from './pages/notificaciones'
import { Debug } from './components/Debug'
import { Hoy } from './pages/Hoy'
import { PlayerPage } from './pages/PlayerPage'
import { Fin } from './pages/Fin'
import { NocheCero } from './pages/NocheCero'
import { Onboarding } from './pages/Onboarding'
import { Bitacora } from './pages/Bitacora'
import { Calendario } from './pages/Calendario'
import { Checkpoint } from './pages/Checkpoint'
import { Audios } from './pages/Audios'
import { Mas } from './pages/Mas'
import { SiCuesta } from './pages/SiCuesta'
import { Errores } from './pages/Errores'
import { Ajustes } from './pages/Ajustes'

const TABS: { route: Route; label: string; icon: string; match: Route[] }[] = [
  { route: 'hoy', label: copy.nav.hoy, icon: 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z', match: ['hoy', 'fin', 'noche-cero', 'checkpoint'] },
  { route: 'calendario', label: copy.nav.calendario, icon: 'M5 5h14v15H5zM5 9h14M9 3v4M15 3v4', match: ['calendario'] },
  { route: 'audios', label: copy.nav.audios, icon: 'M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zm10-2a3 3 0 1 1-3-3 3 3 0 0 1 3 3z', match: ['audios'] },
  { route: 'mas', label: copy.nav.mas, icon: 'M5 12h.01M12 12h.01M19 12h.01', match: ['mas', 'bitacora', 'si-cuesta', 'errores', 'ajustes'] },
]

export function App() {
  const { state, now, tick } = useStore()
  const { route, params } = useLocation()
  const v = getView(state, now())

  // Aviso da Bitácora de manhã (se permitido) — o banner da Hoy aparece sempre.
  useEffect(() => {
    const h = now().getHours()
    if (state.notifications && v.pendingLogNight !== null && h >= 6 && h < 12) void avisarBitacora(nightDate(now()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, v.pendingLogNight])

  if (!state.onboardingDone) {
    return (
      <Shell nav={false}>
        <Onboarding />
      </Shell>
    )
  }

  if (route === 'player') return <PlayerPage params={params} />

  const page = (() => {
    switch (route) {
      case 'fin': return <Fin params={params} />
      case 'noche-cero': return <NocheCero />
      case 'bitacora': return <Bitacora params={params} />
      case 'calendario': return <Calendario />
      case 'checkpoint': return <Checkpoint params={params} />
      case 'audios': return <Audios />
      case 'mas': return <Mas />
      case 'si-cuesta': return <SiCuesta />
      case 'errores': return <Errores />
      case 'ajustes': return <Ajustes />
      default: return <Hoy />
    }
  })()

  return (
    <Shell nav route={route}>
      {page}
    </Shell>
  )
}

function Shell({ children, nav, route }: { children: React.ReactNode; nav: boolean; route?: Route }) {
  return (
    <div className="mx-auto min-h-[100dvh] max-w-md bg-noche-900">
      <main className={`px-4 pt-[max(1rem,env(safe-area-inset-top))] ${nav ? 'pb-32' : 'pb-8'}`}>
        {isDebug() ? <Debug /> : null}
        {children}
      </main>
      {nav ? (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-noche-700 bg-noche-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur" aria-label="Principal">
          <ul className="mx-auto flex max-w-md">
            {TABS.map((t) => {
              const on = route ? t.match.includes(route) : false
              return (
                <li key={t.route} className="flex-1">
                  <button
                    onClick={() => go(t.route)}
                    aria-current={on ? 'page' : undefined}
                    className={`flex min-h-16 w-full flex-col items-center justify-center gap-1 text-base font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ambar/60 ${
                      on ? 'text-ambar' : 'text-crema-soft'
                    }`}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={t.icon} />
                    </svg>
                    {t.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}

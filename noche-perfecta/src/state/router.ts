import { useEffect, useState } from 'react'

// Roteador mínimo por hash (#/hoy, #/player?…): funciona em hospedagem
// estática e dentro de um iframe da Hotmart, e o "voltar" do celular funciona.
export type Route =
  | 'hoy' | 'player' | 'fin' | 'noche-cero' | 'bitacora' | 'calendario'
  | 'checkpoint' | 'audios' | 'mas' | 'si-cuesta' | 'errores' | 'ajustes'

export interface Location {
  route: Route
  params: URLSearchParams
}

function parse(): Location {
  const h = location.hash.replace(/^#\/?/, '')
  const [path, query = ''] = h.split('?')
  return { route: ((path || 'hoy') as Route), params: new URLSearchParams(query) }
}

export function go(route: Route, params?: Record<string, string | number>) {
  const q = params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : ''
  location.hash = `#/${route}${q}`
}

export function useLocation(): Location {
  const [loc, setLoc] = useState(parse)
  useEffect(() => {
    const on = () => {
      setLoc(parse())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return loc
}

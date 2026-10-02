import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initialState, parseState, type State } from '../protocol/protocol'

// Estado único em localStorage (chave rnp_state_v1). Sem backend.
export const STORAGE_KEY = 'rnp_state_v1'
const DEBUG_OFFSET_KEY = 'rnp_debug_offset_ms'

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return parseState(JSON.parse(raw)) ?? initialState()
  } catch {
    /* modo privado / storage bloqueado → começa do zero */
  }
  return initialState()
}

function save(s: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* sem storage: segue em memória */
  }
}

export const isDebug = () => new URLSearchParams(location.search).has('debug')

function loadOffset(): number {
  if (!isDebug()) return 0
  try {
    return Number(localStorage.getItem(DEBUG_OFFSET_KEY) ?? 0) || 0
  } catch {
    return 0
  }
}

interface Store {
  state: State
  /** Aplica uma transição pura do protocolo e persiste. */
  update: (fn: (s: State) => State) => void
  replace: (s: State) => void
  now: () => Date
  /** Tick que muda a cada 30 s (e quando o debug altera a data) para re-renderizar. */
  tick: number
  offsetMs: number
  setOffsetMs: (ms: number) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)
  const [offsetMs, setOffset] = useState(loadOffset)
  const [tick, setTick] = useState(0)

  useEffect(() => save(state), [state])
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    const onVis = () => document.visibilityState === 'visible' && setTick((t) => t + 1)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const now = useCallback(() => new Date(Date.now() + offsetMs), [offsetMs])
  const update = useCallback((fn: (s: State) => State) => setState((s) => fn(s)), [])
  const setOffsetMs = useCallback((ms: number) => {
    setOffset(ms)
    setTick((t) => t + 1)
    try {
      localStorage.setItem(DEBUG_OFFSET_KEY, String(ms))
    } catch {
      /* ignora */
    }
  }, [])

  const value = useMemo(
    () => ({ state, update, replace: setState, now, tick, offsetMs, setOffsetMs }),
    [state, update, now, tick, offsetMs, setOffsetMs],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore fora do StoreProvider')
  return s
}

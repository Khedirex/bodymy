// Um único HTMLAudioElement para o app inteiro: a tela Hoy pré-carrega o
// áudio da noite e o player reaproveita o mesmo elemento (sem recarregar).

let el: HTMLAudioElement | null = null
export const AUDIO_CACHE = 'rnp-audios'

export function getAudio(): HTMLAudioElement {
  if (!el) {
    el = new Audio()
    el.preload = 'auto'
    el.setAttribute('playsinline', '')
    // ?debug=1: expõe o elemento para testar o fim do áudio sem esperar 7 min.
    if (new URLSearchParams(location.search).has('debug')) {
      ;(window as unknown as { __rnpAudio: HTMLAudioElement }).__rnpAudio = el
    }
  }
  return el
}

// Qual arquivo lógico (/audios/vnX.mp3) está carregado no elemento —
// o src real pode ser uma URL blob: do cache.
let loaded: string | null = null
let blobUrl: string | null = null

/**
 * Carrega o áudio no elemento. Se já está guardado no aparelho, toca do
 * arquivo COMPLETO do cache (URL blob: funciona sem internet e permite
 * avançar sem depender do service worker). Se não, toca da internet.
 * Nunca troca a fonte no meio da reprodução: isso quebra o <audio>.
 */
export async function load(src: string): Promise<void> {
  const a = getAudio()
  if (loaded === src) return
  let real = src
  try {
    if ('caches' in window) {
      const hit = await (await caches.open(AUDIO_CACHE)).match(src)
      if (hit) {
        const url = URL.createObjectURL(await hit.blob())
        if (blobUrl) URL.revokeObjectURL(blobUrl)
        blobUrl = url
        real = url
      }
    }
  } catch {
    /* sem cache: toca da internet */
  }
  if (loaded === src) return // outro load() terminou antes
  loaded = src
  a.src = real
  a.load()
}

export function isLoaded(src: string): boolean {
  return loaded === src
}

/** Pré-carrega o áudio da noite (tela Hoy), sem interromper o que toca. */
export function preload(src: string) {
  if (getAudio().paused) void load(src)
}

/**
 * Baixa o arquivo inteiro para o cache (o <audio> só faz pedidos parciais).
 * Na próxima vez o áudio toca do aparelho, sem internet.
 */
export async function ensureCached(src: string): Promise<boolean> {
  if (!('caches' in window)) return false
  try {
    const cache = await caches.open(AUDIO_CACHE)
    if (await cache.match(src)) return true
    await cache.add(src)
    return true
  } catch {
    return false
  }
}

export async function isCached(src: string): Promise<boolean> {
  if (!('caches' in window)) return false
  try {
    const cache = await caches.open(AUDIO_CACHE)
    return Boolean(await cache.match(src))
  } catch {
    return false
  }
}

/**
 * Rampa de volume. No iOS o volume do <audio> é somente leitura (o sistema
 * manda): lá a rampa simplesmente não tem efeito e o áudio toca normal.
 */
export function ramp(a: HTMLAudioElement, from: number, to: number, ms: number, onDone?: () => void): () => void {
  const start = performance.now()
  let raf = 0
  const step = (t: number) => {
    const k = Math.min(1, (t - start) / ms)
    try {
      a.volume = Math.max(0, Math.min(1, from + (to - from) * k))
    } catch {
      /* volume somente leitura */
    }
    if (k < 1) raf = requestAnimationFrame(step)
    else onDone?.()
  }
  raf = requestAnimationFrame(step)
  return () => cancelAnimationFrame(raf)
}

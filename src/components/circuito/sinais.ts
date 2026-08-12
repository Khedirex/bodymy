// Sinalização do cronômetro: som suave (WebAudio) + vibração.
// O áudio móvel só toca após um gesto do usuário → chamar `desbloquear()`
// no primeiro toque da sessão ("Começar"). iOS não tem Vibration API.

type AC = AudioContext
interface WindowComAudio extends Window {
  webkitAudioContext?: typeof AudioContext
}

export interface Sinalizador {
  desbloquear: () => void
  tom: (freq: number, durMs: number) => void
}

export function criarSinalizador(): Sinalizador {
  let ctx: AC | null = null

  function garantirCtx(): AC | null {
    try {
      if (!ctx) {
        const w = window as unknown as WindowComAudio
        const Ctor = window.AudioContext ?? w.webkitAudioContext
        if (!Ctor) return null
        ctx = new Ctor()
      }
      if (ctx.state === 'suspended') void ctx.resume()
      return ctx
    } catch {
      return null
    }
  }

  return {
    desbloquear() {
      const c = garantirCtx()
      if (!c) return
      try {
        // Tom quase inaudível só para "liberar" o áudio no gesto.
        const o = c.createOscillator()
        const g = c.createGain()
        g.gain.value = 0.0001
        o.connect(g)
        g.connect(c.destination)
        o.start()
        o.stop(c.currentTime + 0.02)
      } catch {
        /* ignora */
      }
    },
    tom(freq: number, durMs: number) {
      const c = garantirCtx()
      if (!c) return
      try {
        const o = c.createOscillator()
        const g = c.createGain()
        o.type = 'sine'
        o.frequency.value = freq
        const t = c.currentTime
        const dur = durMs / 1000
        // Envelope suave para não estalar (fade in/out).
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.14, t + 0.02)
        g.gain.linearRampToValueAtTime(0, t + dur)
        o.connect(g)
        g.connect(c.destination)
        o.start(t)
        o.stop(t + dur + 0.02)
      } catch {
        /* ignora */
      }
    },
  }
}

export function vibrar(padrao: number[]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(padrao)
    }
  } catch {
    /* iOS não suporta — sem problema */
  }
}

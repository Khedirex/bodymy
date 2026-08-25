'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { construirFasesAlongamento, sinalDaFase, type FaseAlongamento } from '@/lib/cronometro'
import { ALONGAMENTO_SEG } from '@/lib/training'
import { useWakeLock } from '@/components/circuito/useWakeLock'
import { vibrar, type Sinalizador } from '@/components/circuito/sinais'
import type { Stretch } from '@/types/db'

interface Props {
  stretches: Stretch[]
  sinalizador: Sinalizador
  onConcluir: () => void
  onSair: () => void
}

// Bloco de mobilidade guiado: 10 alongamentos em sequência contínua, 30s cada,
// avanço automático. Sem feedback ao fim — só a celebração e segue pro circuito.
export function BlocoMobilidade({ stretches, sinalizador, onConcluir, onSair }: Props) {
  const fases = useMemo(
    () => construirFasesAlongamento(stretches.map((s) => ({ nome: s.nome, lados: s.lados })), ALONGAMENTO_SEG),
    [stretches],
  )

  const [idx, setIdx] = useState(0)
  const [restanteMs, setRestanteMs] = useState(fases[0]?.duracaoSeg * 1000 || 0)
  const [pausado, setPausado] = useState(false)
  const [terminou, setTerminou] = useState(false)

  const endsAtRef = useRef<number | null>(null)
  const restanteRef = useRef(0)
  const pausadoRef = useRef(false)
  const idxAnterior = useRef(-1)

  useWakeLock(!terminou)

  const fase: FaseAlongamento | undefined = fases[idx]

  // Entrada em cada fase: sinaliza (troca de alongamento vs troca de lado) e arma o timer.
  useEffect(() => {
    const f = fases[idx]
    if (!f) return
    const anterior = fases[idxAnterior.current]
    const trocouAlongamento = !anterior || anterior.indice !== f.indice
    // Novo alongamento = sinal de execução (1 vibração); troca de lado = transição.
    const s = sinalDaFase(trocouAlongamento ? 'exec' : 'transicao')
    if (s) {
      vibrar(s.vibrar)
      sinalizador.tom(s.freq, s.durMs)
    }
    idxAnterior.current = idx

    endsAtRef.current = Date.now() + f.duracaoSeg * 1000
    restanteRef.current = f.duracaoSeg * 1000
    setRestanteMs(f.duracaoSeg * 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // Loop por timestamp (sobrevive a segundo plano / tela apagada).
  useEffect(() => {
    const t = setInterval(() => {
      if (pausadoRef.current || endsAtRef.current == null) return
      const r = endsAtRef.current - Date.now()
      if (r <= 0) {
        if (idx >= fases.length - 1) {
          endsAtRef.current = null
          setRestanteMs(0)
          if (!terminou) {
            setTerminou(true)
            const s = sinalDaFase('fim')
            if (s) {
              vibrar(s.vibrar)
              sinalizador.tom(s.freq, s.durMs)
            }
          }
        } else {
          setRestanteMs(0)
          setIdx((i) => i + 1)
        }
      } else {
        setRestanteMs(r)
      }
    }, 200)
    return () => clearInterval(t)
  }, [idx, fases.length, terminou, sinalizador])

  function pausar() {
    if (endsAtRef.current != null) restanteRef.current = Math.max(0, endsAtRef.current - Date.now())
    pausadoRef.current = true
    setPausado(true)
  }
  function retomar() {
    if (endsAtRef.current != null) endsAtRef.current = Date.now() + restanteRef.current
    pausadoRef.current = false
    setPausado(false)
  }
  // Pula o alongamento inteiro (inclusive lados restantes).
  function pularAlongamento() {
    if (!fase) return
    const prox = fases.findIndex((f, i) => i > idx && f.indice > fase.indice)
    if (prox === -1) {
      if (!terminou) setTerminou(true)
    } else {
      setIdx(prox)
    }
  }

  if (terminou) {
    return (
      <div className="rounded-3xl bg-sage-100 p-8 text-center">
        <p className="text-5xl">🌿</p>
        <p className="mt-3 text-2xl font-extrabold text-sage-600">¡Muy bien, ya estás lista para empezar!</p>
        <button onClick={onConcluir} className="btn-primary mt-6 w-full text-lg">
          Ir a los ejercicios →
        </button>
      </div>
    )
  }

  if (!fase) return null
  const segundos = Math.ceil(restanteMs / 1000)
  const progresso = Math.round(((fase.indice - 1) / fase.total) * 100)

  return (
    <div className="rounded-3xl bg-coral-50 p-6 text-center text-coral-700">
      {/* Progresso do bloco */}
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
        <div className="h-full rounded-full bg-coral-400 transition-all" style={{ width: `${progresso}%` }} />
      </div>
      <p className="text-sm font-bold uppercase tracking-wide opacity-80">
        Estiramiento {fase.indice} de {fase.total}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-ink-900">{fase.nome}</p>
      {fase.posicao ? <p className="mt-1 text-lg font-bold text-coral-600">{fase.posicao}</p> : null}

      <p className="mt-3 text-7xl font-black tabular-nums leading-none">{Math.max(0, segundos)}</p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          onClick={pausado ? retomar : pausar}
          className="rounded-2xl bg-white/70 px-4 py-4 text-lg font-bold text-ink-800"
        >
          {pausado ? '▶ Reanudar' : '⏸ Pausar'}
        </button>
        <button
          onClick={pularAlongamento}
          className="rounded-2xl bg-white/70 px-4 py-4 text-lg font-bold text-ink-800"
        >
          Saltar este →
        </button>
      </div>

      <button onClick={onSair} className="mt-4 text-sm font-semibold text-ink-700/70">
        Salir del bloque
      </button>
    </div>
  )
}

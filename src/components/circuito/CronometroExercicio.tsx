'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ExercicioTipo } from '@/types/db'
import { construirFases, indicePrepDaSerie, sinalDaFase, type Fase } from '@/lib/cronometro'
import { useWakeLock } from '@/components/circuito/useWakeLock'
import { vibrar, type Sinalizador } from '@/components/circuito/sinais'

interface Props {
  tipo: ExercicioTipo
  bilateral: boolean
  series: number
  tempoExecSeg: number
  descansoSeg: number
  permanenciaSeg: number
  sinalizador: Sinalizador // áudio já desbloqueado no toque "Começar"
  onConcluir: () => void
  onCancelar: () => void
}

// Cores calmas por fase (nada de vermelho agressivo).
const CORES: Record<string, string> = {
  prep: 'bg-cream-100 text-ink-800',
  exec: 'bg-coral-50 text-coral-700',
  exec_manual: 'bg-coral-50 text-coral-700',
  transicao: 'bg-gold-300/20 text-gold-500',
  descanso: 'bg-sage-100 text-sage-600',
  fim: 'bg-sage-100 text-sage-600',
}

export function CronometroExercicio({
  tipo, bilateral, series, tempoExecSeg, descansoSeg, permanenciaSeg, sinalizador, onConcluir, onCancelar,
}: Props) {
  const fases = useMemo(
    () => construirFases({ tipo, bilateral, series, tempoExecSeg, descansoSeg, permanenciaSeg }),
    [tipo, bilateral, series, tempoExecSeg, descansoSeg, permanenciaSeg],
  )

  const [idx, setIdx] = useState(0)
  const [restanteMs, setRestanteMs] = useState(0)
  const [pausado, setPausado] = useState(false)
  const fimChamado = useRef(false)

  const endsAtRef = useRef<number | null>(null) // timestamp real do fim da fase
  const restanteRef = useRef(0) // usado ao pausar
  const pausadoRef = useRef(false)

  const fase: Fase = fases[idx] ?? fases[fases.length - 1]
  useWakeLock(fase.tipo !== 'fim')

  // Entrada em cada fase: sinaliza e arma o timer por timestamp.
  useEffect(() => {
    const f = fases[idx]
    if (!f) return

    const s = sinalDaFase(f.tipo)
    if (s) {
      vibrar(s.vibrar)
      sinalizador.tom(s.freq, s.durMs)
    }

    if (f.tipo === 'fim') {
      if (!fimChamado.current) {
        fimChamado.current = true
        onConcluir()
      }
      return
    }

    if (f.auto && f.duracaoSeg > 0) {
      endsAtRef.current = Date.now() + f.duracaoSeg * 1000
      restanteRef.current = f.duracaoSeg * 1000
      setRestanteMs(f.duracaoSeg * 1000)
    } else {
      // exec_manual: sem contagem — espera o toque em "Série concluída".
      endsAtRef.current = null
      setRestanteMs(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // Loop de precisão: recalcula por Date.now() (sobrevive a tela apagada /
  // segundo plano). Só avança quando o restante zera.
  useEffect(() => {
    const t = setInterval(() => {
      if (pausadoRef.current) return
      if (endsAtRef.current == null) return
      const r = endsAtRef.current - Date.now()
      if (r <= 0) {
        setRestanteMs(0)
        setIdx((i) => Math.min(i + 1, fases.length - 1))
      } else {
        setRestanteMs(r)
      }
    }, 200)
    return () => clearInterval(t)
  }, [fases.length])

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
  function pularDescanso() {
    if (fase.tipo === 'descanso') setIdx((i) => Math.min(i + 1, fases.length - 1))
  }
  function voltarSerie() {
    const serie = fase.serie > 0 ? fase.serie : fase.totalSeries
    fimChamado.current = false
    setIdx(indicePrepDaSerie(fases, serie))
  }
  function serieConcluida() {
    // fim da execução no ritmo dela (tipo 'repeticao')
    if (fase.tipo === 'exec_manual') setIdx((i) => Math.min(i + 1, fases.length - 1))
  }

  const segundos = Math.ceil(restanteMs / 1000)
  const cor = CORES[fase.tipo] ?? CORES.prep

  return (
    <div className={`rounded-3xl p-6 text-center ${cor}`}>
      {/* Progresso das séries */}
      {fase.totalSeries > 0 && fase.tipo !== 'fim' ? (
        <p className="text-sm font-bold uppercase tracking-wide opacity-80">
          Série {fase.serie} de {fase.totalSeries}
          {fase.lado ? ` · lado ${fase.lado}` : ''}
        </p>
      ) : null}

      {/* Fase atual */}
      <p className="mt-1 text-2xl font-extrabold">{fase.rotulo}</p>

      {/* Número grande OU botão de série concluída (ritmo dela) */}
      {fase.tipo === 'exec_manual' ? (
        <div className="mt-5">
          <p className="text-ink-700">Faça as repetições no seu ritmo. Quando terminar a série, toque abaixo.</p>
          <button
            onClick={serieConcluida}
            className="mt-4 w-full rounded-2xl bg-coral-400 px-5 py-5 text-xl font-extrabold text-white"
          >
            Série concluída ✓
          </button>
        </div>
      ) : (
        <p className="mt-3 text-7xl font-black tabular-nums leading-none">{Math.max(0, segundos)}</p>
      )}

      {/* Controles grandes, alcançáveis com o polegar */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        {fase.tipo !== 'exec_manual' ? (
          <button
            onClick={pausado ? retomar : pausar}
            className="rounded-2xl bg-white/70 px-4 py-4 text-lg font-bold text-ink-800"
          >
            {pausado ? '▶ Retomar' : '⏸ Pausar'}
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={voltarSerie}
          className="rounded-2xl bg-white/70 px-4 py-4 text-lg font-bold text-ink-800"
        >
          ↺ Refazer série
        </button>
        {fase.tipo === 'descanso' ? (
          <button
            onClick={pularDescanso}
            className="col-span-2 rounded-2xl bg-white/70 px-4 py-3 text-base font-bold text-ink-800"
          >
            Pular descanso →
          </button>
        ) : null}
      </div>

      <button onClick={onCancelar} className="mt-4 text-sm font-semibold text-ink-700/70">
        Sair do modo guiado
      </button>
    </div>
  )
}

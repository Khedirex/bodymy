'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { ProgressBar } from '@/components/ProgressBar'
import { PlayIcon, CheckIcon } from '@/components/ui/icons'
import { temaDoModulo } from '@/lib/modulo-tema'

// Dados de UM dash de produto. Chapado de propósito: este é um componente
// de cliente, então nada de função nem de objeto vindo do registro —
// a página monta este formato a partir de src/lib/modulos.ts.
export interface DashModulo {
  slug: string
  nome: string
  resumo: string
  href: string
  emoji: string
  concluidos: number
  total: number
  feitoHoje: boolean
  terminado: boolean
  chamadaHoje: string | null
}

// ---------------------------------------------------------------------
// CARROSSEL DE DASHES — um painel por produto comprado.
//
// O dash geral (acima) é da rotina inteira; aqui cada compra tem o SEU
// progresso, com a cor do próprio módulo. Rolagem com encaixe (snap) e
// bolinhas grandes de tocar: o público tem 45-60+ e usa o dedo, não o mouse.
// ---------------------------------------------------------------------
export function CarrosselDashes({ itens }: { itens: DashModulo[] }) {
  const trilhoRef = useRef<HTMLDivElement>(null)
  const [ativo, setAtivo] = useState(0)

  // Qual painel está no lugar: o filho cuja borda esquerda está mais perto
  // da borda do trilho. Medir assim funciona com qualquer largura de tela.
  const aoRolar = useCallback(() => {
    const trilho = trilhoRef.current
    if (!trilho) return
    const base = trilho.getBoundingClientRect().left
    let melhor = 0
    let menorDist = Infinity
    Array.from(trilho.children).forEach((filho, i) => {
      const dist = Math.abs((filho as HTMLElement).getBoundingClientRect().left - base)
      if (dist < menorDist) {
        menorDist = dist
        melhor = i
      }
    })
    setAtivo(melhor)
  }, [])

  const irPara = (i: number) => {
    const trilho = trilhoRef.current
    const filho = trilho?.children[i] as HTMLElement | undefined
    if (!trilho || !filho) return
    trilho.scrollTo({
      left: filho.offsetLeft - trilho.offsetLeft,
      behavior: 'smooth',
    })
  }

  if (itens.length === 0) return null
  const vários = itens.length > 1

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="section-title">Hoy</h2>
        {vários && (
          <p className="text-sm font-medium text-ink-700/70" aria-live="polite">
            {ativo + 1} de {itens.length}
          </p>
        )}
      </div>

      <div
        ref={trilhoRef}
        onScroll={vários ? aoRolar : undefined}
        className={`no-scrollbar -mx-4 flex gap-3 px-4 pb-1 ${
          vários ? 'snap-x snap-mandatory overflow-x-auto' : ''
        }`}
      >
        {itens.map((item) => (
          <div
            key={item.slug}
            className={vários ? 'w-full shrink-0 snap-start' : 'w-full'}
          >
            <DashDoModulo item={item} />
          </div>
        ))}
      </div>

      {vários && (
        <ul className="mt-1 flex items-center justify-center">
          {itens.map((item, i) => (
            <li key={item.slug}>
              <button
                type="button"
                onClick={() => irPara(i)}
                aria-label={`Ver ${item.nome}`}
                aria-current={i === ativo ? 'true' : undefined}
                className="flex h-11 w-11 items-center justify-center"
              >
                <span
                  className={`block rounded-full transition-all ${
                    i === ativo ? 'h-3 w-7 bg-coral-500' : 'h-3 w-3 bg-ink-700/20'
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// Um dash de produto: onde ela está nele, o que é hoje e um botão só.
function DashDoModulo({ item }: { item: DashModulo }) {
  const tema = temaDoModulo(item.slug)
  const feito = item.feitoHoje || item.terminado
  const passoAtual = Math.min(item.concluidos + 1, item.total)

  return (
    <article className="h-full rounded-3xl bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${tema.avatar}`}
        >
          {item.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold text-ink-900">{item.nome}</p>
          <p className="text-base text-ink-700">
            {item.total > 0 && !item.terminado
              ? `Día ${passoAtual} de ${item.total}`
              : item.resumo}
          </p>
        </div>
      </div>

      {item.total > 0 && (
        <div className="mt-4">
          <ProgressBar
            atual={item.concluidos}
            total={item.total}
            label="Tu avance"
            gradiente={tema.barra}
          />
        </div>
      )}

      {feito ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-sage-100/60 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <CheckIcon width={18} height={18} />
          </span>
          <p className="text-base font-semibold text-ink-900">
            {item.terminado ? '¡Completaste el reto!' : 'Ya hiciste lo de hoy ✓'}
          </p>
        </div>
      ) : (
        <>
          {item.chamadaHoje && (
            <p className={`mt-4 text-base font-semibold ${tema.realce}`}>{item.chamadaHoje}</p>
          )}
          <Link
            href={item.href}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-4 text-lg font-bold ${tema.botao}`}
          >
            <PlayIcon width={22} height={22} /> Empezar
          </Link>
        </>
      )}

      {feito && (
        <Link
          href={item.href}
          className="mt-3 flex w-full items-center justify-center rounded-full border-2 border-cream-200 py-3.5 text-base font-bold text-ink-900"
        >
          Abrir {item.nome}
        </Link>
      )}
    </article>
  )
}

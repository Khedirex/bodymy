'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LockIcon, ChevronRight } from '@/components/ui/icons'

export interface OfertaItem {
  slug: string
  nome: string
  descricao: string | null
  precoExibicao: string | null
  tipo: string
}

const TROCA_MS = 6000

const ROTULO: Record<string, string> = {
  programa: 'Programa',
  bundle: 'Combo',
  dieta_premium: 'Menú premium',
}

// =====================================================================
// A ESTEIRA, em carrossel que passa sozinho.
//
// Fica abaixo da rotina dela: primeiro o que ela já comprou, depois o que
// pode comprar. Um card por vez, grande o bastante para ler de relance —
// uma fileira de cards pequenos some do campo de visão de quem tem 60 anos.
//
// Para sozinho quando ela encosta (toque, mouse ou teclado) e quando a aba
// sai de foco, e nem começa se o sistema dela pede menos animação. Carrossel
// que anda enquanto a pessoa está lendo é o jeito mais rápido de ser ignorado.
// =====================================================================
export function EsteiraCarrossel({ itens }: { itens: OfertaItem[] }) {
  const trilho = useRef<HTMLDivElement>(null)
  const [ativo, setAtivo] = useState(0)
  const [pausado, setPausado] = useState(false)

  const aoRolar = useCallback(() => {
    const el = trilho.current
    if (!el) return
    const base = el.getBoundingClientRect().left
    let melhor = 0
    let menor = Infinity
    Array.from(el.children).forEach((filho, i) => {
      const d = Math.abs((filho as HTMLElement).getBoundingClientRect().left - base)
      if (d < menor) {
        menor = d
        melhor = i
      }
    })
    setAtivo(melhor)
  }, [])

  const irPara = useCallback((i: number) => {
    const el = trilho.current
    const filho = el?.children[i] as HTMLElement | undefined
    if (!el || !filho) return
    el.scrollTo({ left: filho.offsetLeft - el.offsetLeft, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (itens.length < 2 || pausado) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = setInterval(() => {
      if (document.hidden) return
      setAtivo((atual) => {
        const proximo = (atual + 1) % itens.length
        irPara(proximo)
        return proximo
      })
    }, TROCA_MS)
    return () => clearInterval(id)
  }, [itens.length, pausado, irPara])

  if (itens.length === 0) return null

  return (
    <section
      onPointerDown={() => setPausado(true)}
      onPointerEnter={() => setPausado(true)}
      onPointerLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="section-title">Para ti</h2>
        <Link href="/descubra" className="text-sm font-semibold text-brand-600">
          Ver todo
        </Link>
      </div>

      <div
        ref={trilho}
        onScroll={aoRolar}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
      >
        {itens.map((o) => (
          <Link
            key={o.slug}
            href={`/oferta/${o.slug}`}
            className="w-full shrink-0 snap-start rounded-3xl bg-white p-5 shadow-card"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="chip">{ROTULO[o.tipo] ?? 'Extra'}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sun-300/40 px-2.5 py-1 text-xs font-bold text-sun-700">
                <LockIcon width={14} height={14} /> Desbloquear
              </span>
            </div>

            <p className="mt-3 text-lg font-extrabold leading-tight text-ink-900">{o.nome}</p>
            {o.descricao && (
              <p className="mt-1 line-clamp-2 text-base text-ink-700">{o.descricao}</p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-base font-semibold text-ink-700">
                {o.precoExibicao ? `desde ${o.precoExibicao}` : 'Ver la oferta'}
              </span>
              <span className="flex items-center gap-1 text-base font-bold text-brand-600">
                Abrir <ChevronRight width={18} height={18} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {itens.length > 1 && (
        <ul className="mt-1 flex items-center justify-center">
          {itens.map((o, i) => (
            <li key={o.slug}>
              <button
                type="button"
                onClick={() => {
                  setPausado(true)
                  irPara(i)
                }}
                aria-label={`Ver ${o.nome}`}
                aria-current={i === ativo ? 'true' : undefined}
                className="flex h-11 w-11 items-center justify-center"
              >
                <span
                  className={`block rounded-full transition-all ${
                    i === ativo ? 'h-3 w-7 bg-brand-500' : 'h-3 w-3 bg-ink-700/20'
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

'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'
import { LockIcon, CheckIcon } from '@/components/ui/icons'
import type { Product, SalesPage } from '@/types/db'

// Tela de venda interna. Renderiza o sales_page do produto e dispara os
// eventos de paywall (PostHog + Meta Pixel). O botão leva ao checkout
// da Kiwify — nunca há checkout dentro do app.
export function SalesView({ product }: { product: Product }) {
  const sales: SalesPage | null = product.sales_page

  useEffect(() => {
    analytics.paywallView(product.slug)
  }, [product.slug])

  function handleComprar() {
    analytics.paywallClick(product.slug, product.preco_exibicao ?? undefined)
    if (product.kiwify_checkout_url) {
      window.location.href = product.kiwify_checkout_url
    }
  }

  const headline = sales?.headline ?? product.nome
  const bullets = sales?.bullets ?? []
  const ctaLabel = sales?.cta_label ?? 'QUERO ESTE PROGRAMA'

  return (
    <div className="space-y-6">
      {/* Selo de bloqueio */}
      <div className="inline-flex items-center gap-2 rounded-full bg-gold-300/40 px-3 py-1.5 text-sm font-bold text-gold-500">
        <LockIcon width={16} height={16} /> Conteúdo bloqueado
      </div>

      <header>
        <h1 className="text-3xl font-extrabold leading-tight text-ink-900">{headline}</h1>
        {sales?.subheadline ? (
          <p className="mt-2 text-lg text-ink-700">{sales.subheadline}</p>
        ) : product.descricao ? (
          <p className="mt-2 text-lg text-ink-700">{product.descricao}</p>
        ) : null}
      </header>

      {sales?.imagem_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sales.imagem_url}
          alt={product.nome}
          className="w-full rounded-3xl object-cover"
        />
      ) : (
        <div className="flex h-44 items-center justify-center rounded-3xl bg-gradient-to-br from-coral-100 to-cream-100 text-6xl">
          {product.tipo === 'dieta_premium' ? '🥗' : '🚶‍♀️'}
        </div>
      )}

      {bullets.length > 0 && (
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                <CheckIcon width={16} height={16} />
              </span>
              <span className="text-ink-800">{b}</span>
            </li>
          ))}
        </ul>
      )}

      {sales?.depoimento ? (
        <blockquote className="rounded-3xl bg-cream-100 p-5">
          <p className="text-ink-800">“{sales.depoimento.texto}”</p>
          <footer className="mt-2 text-sm font-semibold text-ink-700">
            — {sales.depoimento.autora}
          </footer>
        </blockquote>
      ) : null}

      {/* CTA fixo ao final */}
      <div className="sticky bottom-24 space-y-2 rounded-3xl bg-white/80 p-3 backdrop-blur">
        {product.preco_exibicao ? (
          <p className="text-center text-ink-700">
            por <span className="text-xl font-extrabold text-ink-900">{product.preco_exibicao}</span>
          </p>
        ) : null}
        <button onClick={handleComprar} className="btn-primary w-full text-lg">
          {ctaLabel}
        </button>
        <p className="text-center text-xs text-ink-700/60">
          Você será levada ao checkout seguro. Acesso liberado logo após a compra.
        </p>
      </div>
    </div>
  )
}

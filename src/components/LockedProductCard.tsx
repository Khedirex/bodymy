import Link from 'next/link'
import { LockIcon, ChevronRight } from '@/components/ui/icons'
import type { Product } from '@/types/db'

// Card de produto na vitrine. Conteúdo bloqueado NUNCA é escondido —
// é a vitrine do backend. Cada cadeado é um ponto de venda que leva à
// tela de oferta interna.
export function LockedProductCard({
  product,
  liberado = false,
  compact = false,
}: {
  product: Pick<Product, 'slug' | 'nome' | 'descricao' | 'preco_exibicao' | 'tipo'>
  liberado?: boolean
  compact?: boolean
}) {
  const tipoLabel =
    product.tipo === 'dieta_premium'
      ? 'Cardápio premium'
      : product.tipo === 'programa'
        ? 'Programa'
        : product.tipo === 'bundle'
          ? 'Combo'
          : 'Extra'

  if (liberado) {
    return (
      <Link
        href={`/programa/${product.slug}`}
        className={`card flex items-center gap-3 ${compact ? 'w-64 shrink-0' : ''}`}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
          ✓
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink-900">{product.nome}</p>
          <p className="text-sm text-sage-600">Liberado — continuar</p>
        </div>
        <ChevronRight className="text-ink-700/40" width={20} height={20} />
      </Link>
    )
  }

  return (
    <Link
      href={`/oferta/${product.slug}`}
      className={`card-lock block ${compact ? 'w-64 shrink-0' : ''}`}
      aria-label={`Desbloquear ${product.nome}`}
    >
      {/* leve dessaturação para sinalizar bloqueio */}
      <div className="opacity-90 saturate-[.7]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className="chip">{tipoLabel}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-300/40 px-2.5 py-1 text-xs font-bold text-gold-500">
            <LockIcon width={14} height={14} /> Desbloquear
          </span>
        </div>
        <p className="font-bold text-ink-900">{product.nome}</p>
        {product.descricao ? (
          <p className="mt-1 line-clamp-2 text-sm text-ink-700">{product.descricao}</p>
        ) : null}
        <div className="mt-3 flex items-center justify-between">
          {product.preco_exibicao ? (
            <span className="text-sm font-semibold text-ink-700">
              a partir de {product.preco_exibicao}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 text-sm font-bold text-coral-600">
            Ver oferta <ChevronRight width={16} height={16} />
          </span>
        </div>
      </div>
    </Link>
  )
}

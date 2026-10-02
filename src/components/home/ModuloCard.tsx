import Link from 'next/link'
import { ProgressBar } from '@/components/ProgressBar'
import { PlayIcon, CheckIcon, ChevronRight } from '@/components/ui/icons'
import type { ModuloDaAluna } from '@/lib/modulos'

// Card do módulo em DESTAQUE na Home: o que ela tem para fazer hoje.
// Texto grande e um único botão — o app é usado por mulheres 45-60+.
export function ModuloDestaque({ item }: { item: ModuloDaAluna }) {
  const { modulo, estado } = item
  const feito = estado?.feitoHoje || estado?.terminado

  return (
    <section className="rounded-3xl bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${modulo.cor}`}>
          {modulo.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold text-ink-900">{modulo.nome}</p>
          <p className="text-base text-ink-700">{modulo.resumo}</p>
        </div>
      </div>

      {estado && (
        <div className="mt-4">
          <ProgressBar atual={estado.concluidos} total={estado.total} label="Tu avance" />
        </div>
      )}

      {feito ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-sage-100/60 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <CheckIcon width={18} height={18} />
          </span>
          <p className="text-base font-semibold text-ink-900">
            {estado?.terminado ? '¡Completaste el reto!' : 'Ya hiciste lo de hoy ✓'}
          </p>
        </div>
      ) : (
        <>
          {estado?.chamadaHoje && (
            <p className="mt-4 text-base font-semibold text-coral-600">{estado.chamadaHoje}</p>
          )}
          <Link href={modulo.href} className="btn-primary mt-3 w-full py-4 text-lg">
            <PlayIcon width={22} height={22} /> Empezar
          </Link>
        </>
      )}
    </section>
  )
}

// Carrossel dos OUTROS módulos dela — só aparece quando tem mais de um.
export function CarrosselModulos({ itens }: { itens: ModuloDaAluna[] }) {
  if (itens.length === 0) return null
  return (
    <section>
      <h2 className="section-title mb-2">Tus rutinas</h2>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {itens.map(({ modulo, estado }) => (
          <Link
            key={modulo.slug}
            href={modulo.href}
            className="flex w-60 shrink-0 items-center gap-3 rounded-3xl bg-white p-4 shadow-card"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${modulo.cor}`}>
              {modulo.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-ink-900">{modulo.nome}</span>
              <span className="block text-sm text-ink-700">
                {estado ? `${estado.concluidos} de ${estado.total} días` : 'Empezar'}
              </span>
            </span>
            <ChevronRight className="shrink-0 text-ink-700/40" width={20} height={20} />
          </Link>
        ))}
      </div>
    </section>
  )
}

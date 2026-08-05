'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { StreakBadge } from '@/components/StreakBadge'
import { PlayIcon } from '@/components/ui/icons'

// Modal de celebração ao concluir uma aula: streak atualizado + preview
// da próxima aula. Micro-animação simples com Framer Motion.
export function Celebration({
  aberto,
  streakAtual,
  streakRecorde,
  programSlug,
  proxima,
  onFechar,
}: {
  aberto: boolean
  streakAtual: number
  streakRecorde: number
  programSlug: string
  proxima: { id: string; titulo: string } | null
  onFechar: () => void
}) {
  const bateuRecorde = streakAtual > 0 && streakAtual === streakRecorde

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onFechar}
        >
          <motion.div
            className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-lift"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="mx-auto mb-3 text-6xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.05 }}
              aria-hidden
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-extrabold text-ink-900">Aula concluída!</h2>
            <p className="mt-1 text-ink-700">
              {bateuRecorde
                ? 'Novo recorde de constância. Que orgulho!'
                : 'Mais um dia cuidando de você. Continue assim!'}
            </p>

            <div className="mt-4 flex justify-center">
              <StreakBadge dias={streakAtual} />
            </div>

            {proxima ? (
              <div className="mt-6 rounded-2xl bg-cream-100 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">
                  Próxima aula
                </p>
                <p className="mt-1 font-bold text-ink-900">{proxima.titulo}</p>
                <Link
                  href={`/programa/${programSlug}/aula/${proxima.id}`}
                  className="btn-primary mt-3 w-full"
                  onClick={onFechar}
                >
                  <PlayIcon width={18} height={18} /> Ir para a próxima
                </Link>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-sage-100 p-4 text-sage-600">
                Você chegou ao fim do programa. Que jornada! 🏆
              </div>
            )}

            <Link
              href={`/programa/${programSlug}`}
              className="btn-secondary mt-3 w-full"
              onClick={onFechar}
            >
              Voltar ao programa
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

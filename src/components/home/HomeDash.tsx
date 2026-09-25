import { CIRCUITO_TOTAL_DIAS } from '@/lib/training'
import { StreakBadge } from '@/components/StreakBadge'
import { ProgressBar } from '@/components/ProgressBar'

// Abreviações dos dias em espanhol (índice = getUTCDay(), 0 = domingo).
const DIAS_ES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

export interface DiaSemana {
  data: string // ISO (YYYY-MM-DD)
  fez: boolean
  ehHoje: boolean
}

interface Props {
  /** Posição no reto de 14 dias (1..14) — null se ainda não começou. */
  diaDoDesafio: number | null
  /** Dias concluídos no reto (para a barra de 14). */
  diasFeitos: number
  streakAtual: number
  fezHoje: boolean
  /** Últimos 7 dias, do mais antigo ao de hoje. */
  semana: DiaSemana[]
  /** Dias da semana sem registro (hoje não conta como perdido). */
  perdidos: number
}

// Resumo do momento da aluna: onde ela está no protocolo, a constância e o
// que ficou para trás nos últimos 7 dias. Tudo vem de dados reais
// (user_training_config + check-ins) — nada estimado.
export function HomeDash({
  diaDoDesafio,
  diasFeitos,
  streakAtual,
  fezHoje,
  semana,
  perdidos,
}: Props) {
  return (
    <section className="card space-y-4">
      {/* Linha de topo: onde ela está + constância */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">
            Tu reto
          </p>
          <p className="text-xl font-extrabold text-ink-900">
            {diaDoDesafio ? `Día ${diaDoDesafio} de ${CIRCUITO_TOTAL_DIAS}` : 'Aún no empiezas'}
          </p>
        </div>
        <StreakBadge dias={streakAtual} />
      </div>

      <ProgressBar atual={diasFeitos} total={CIRCUITO_TOTAL_DIAS} label="Tu avance" />

      {/* Semana: 7 dias, marcados os que tiveram registro */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-900">Tus últimos 7 días</p>
        <ul className="flex items-center justify-between gap-1">
          {semana.map((d) => {
            const data = new Date(`${d.data}T12:00:00Z`)
            const diaSemana = data.getUTCDay()
            const diaMes = data.getUTCDate()
            return (
              <li key={d.data} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    d.fez
                      ? 'bg-coral-500 text-white'
                      : d.ehHoje
                        ? 'border-2 border-dashed border-coral-400 text-coral-500'
                        : 'bg-cream-200 text-ink-700/40'
                  }`}
                  aria-label={`${DIAS_ES[diaSemana]} ${diaMes}${d.fez ? ' — registrado' : ' — sin registro'}`}
                >
                  {d.fez ? '✓' : diaMes}
                </span>
                <span className="text-[10px] font-medium text-ink-700/50">
                  {d.ehHoje ? 'hoy' : DIAS_ES[diaSemana]}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* O que ficou para trás / o que falta hoje */}
      <div className="rounded-2xl bg-cream-100 px-3.5 py-2.5 text-sm">
        {!fezHoje ? (
          <p className="text-ink-900">
            <span className="font-bold">Hoy todavía no registras nada.</span>{' '}
            {perdidos > 0
              ? `Y te faltaron ${perdidos} ${perdidos === 1 ? 'día' : 'días'} esta semana — retomar hoy corta la racha de faltas.`
              : 'Un movimiento corto ya cuenta.'}
          </p>
        ) : perdidos > 0 ? (
          <p className="text-ink-900">
            Hoy ya está hecho ✓ — esta semana te faltaron{' '}
            <span className="font-bold">
              {perdidos} {perdidos === 1 ? 'día' : 'días'}
            </span>
            .
          </p>
        ) : (
          <p className="font-semibold text-sage-600">
            ¡Semana completa! No te faltó ningún día 🤍
          </p>
        )}
      </div>
    </section>
  )
}

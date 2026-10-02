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
  /** Quantas rotinas ela tem (não o produto, a soma deles). */
  totalRutinas: number
  /** Passos concluídos somando TODAS as rotinas dela. */
  pasosHechos: number
  /** Passos previstos somando TODAS as rotinas dela. */
  pasosTotales: number
  /** Rotinas que ainda têm algo para hoje. */
  pendientesHoy: number
  streakAtual: number
  fezHoje: boolean
  /** Últimos 7 dias, do mais antigo ao de hoje. */
  semana: DiaSemana[]
  /** Dias da semana sem registro (hoje não conta como perdido). */
  perdidos: number
}

// ---------------------------------------------------------------------
// DASH GERAL DA ROTINA.
//
// Este painel é da ALUNA, não de um produto: ele soma tudo o que ela tem.
// Antes mostrava "Día X de Y" do protocolo em destaque, o que ficava errado
// para quem tem duas rotinas — o progresso de cada produto agora vive no
// carrossel de dashes (um card por compra), logo abaixo.
// ---------------------------------------------------------------------
export function DashGeneral({
  totalRutinas,
  pasosHechos,
  pasosTotales,
  pendientesHoy,
  streakAtual,
  fezHoje,
  semana,
  perdidos,
}: Props) {
  return (
    <section className="card space-y-4">
      {/* Linha de topo: o tamanho da rotina dela + constância */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">
            Tu rutina
          </p>
          <p className="text-xl font-extrabold text-ink-900">
            {pendientesHoy > 0
              ? `${pendientesHoy} ${pendientesHoy === 1 ? 'cosa' : 'cosas'} para hoy`
              : 'Todo hecho por hoy ✓'}
          </p>
          {totalRutinas > 1 && (
            <p className="text-sm text-ink-700">
              {totalRutinas} rutinas activas
            </p>
          )}
        </div>
        <StreakBadge dias={streakAtual} />
      </div>

      {pasosTotales > 0 && (
        <ProgressBar atual={pasosHechos} total={pasosTotales} label="Tu avance total" />
      )}

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

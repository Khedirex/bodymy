'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExercicioDetalhe } from '@/components/cisne/ExercicioDetalhe'
import { CheckIcon, ChevronLeft, CameraIcon } from '@/components/ui/icons'
import { CUELLO_ESCALA, CISNE_TOTAL_DIAS, type CisneDia } from '@/lib/cisne'

interface Props {
  dia: CisneDia
  jaFeito: boolean
  cuelloAnterior: number | null
}

// Sessão de um dia do reto: os 4 movimentos em ordem (marca cada um ao
// terminar), o consejo del día, "¿cómo quedó tu cuello?" e o botão de
// concluir — só libera com os 4 marcados.
export function DiaCisne({ dia, jaFeito, cuelloAnterior }: Props) {
  const router = useRouter()
  const [feitos, setFeitos] = useState<boolean[]>(() => dia.movimentos.map(() => jaFeito))
  const [aberto, setAberto] = useState<number | null>(jaFeito ? null : 0)
  const [cuello, setCuello] = useState<number | null>(cuelloAnterior)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [concluido, setConcluido] = useState<{ streak: number } | null>(null)

  const todos = feitos.every(Boolean)

  function marcar(i: number) {
    const novo = [...feitos]
    novo[i] = !novo[i]
    setFeitos(novo)
    // Ao marcar, abre o próximo movimento ainda não feito.
    if (novo[i]) {
      const prox = novo.findIndex((f, j) => !f && j > i)
      setAberto(prox >= 0 ? prox : null)
    }
  }

  async function concluir() {
    if (!todos || salvando) return
    setSalvando(true)
    setErro(null)
    try {
      const res = await fetch('/api/cisne/dia', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dia: dia.numero, cuello }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErro(
          data.error === 'dia_bloqueado'
            ? 'Este día aún no está disponible. Vuelve mañana. 🤍'
            : 'No pudimos guardar ahora. Inténtalo de nuevo.',
        )
        return
      }
      setConcluido({ streak: data.streak?.atual ?? 0 })
      router.refresh()
    } catch {
      setErro('Sin conexión. Inténtalo de nuevo.')
    } finally {
      setSalvando(false)
    }
  }

  if (concluido) {
    const ultimo = dia.numero === CISNE_TOTAL_DIAS
    return (
      <div className="space-y-5 animate-fade-up">
        <div className="card text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 text-3xl">
            🦢
          </div>
          <h1 className="text-2xl font-extrabold text-ink-900">
            {ultimo ? '¡Lo lograste! 14 días por ti' : `¡Día ${dia.numero} completado!`}
          </h1>
          <p className="mt-2 text-ink-700">
            {ultimo
              ? 'Compara tu foto del día 1 con la de hoy. Mira tu cuello, tu mentón y tus hombros. Cada minuto que le diste a tu cuerpo cuenta.'
              : 'Tu cuello te lo agradece. El próximo día se abre mañana.'}
          </p>
          {concluido.streak > 1 ? (
            <p className="mt-3 font-bold text-brand-600">🔥 {concluido.streak} días seguidos</p>
          ) : null}
        </div>
        {dia.diaDeFoto ? (
          <Link href="/progresso" className="btn-secondary w-full">
            <CameraIcon width={20} height={20} /> Guardar mi foto de perfil
          </Link>
        ) : null}
        <Link href="/cisne" className="btn-primary w-full">
          Volver a mi reto
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Link href="/cisne" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700">
        <ChevronLeft width={18} height={18} /> Reset Postura de Cisne
      </Link>

      <header className="rounded-3xl bg-sun-100 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-sage-600">
          Semana {dia.semana} · {dia.intensidade}
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <span className="text-5xl font-extrabold leading-none text-ink-900">
            {String(dia.numero).padStart(2, '0')}
          </span>
          <div className="text-right">
            <span className="chip bg-white/70 text-xs">
              Día {dia.numero} de {CISNE_TOTAL_DIAS} · ~10 min{dia.diaDeFoto ? ' · Día de foto' : ''}
            </span>
            <h1 className="mt-1 text-xl font-extrabold text-ink-900">{dia.titulo}</h1>
          </div>
        </div>
      </header>

      <p className="text-ink-700">
        Haz los 4 movimientos en este orden, sin prisa, acostada en tu cama. Marca cada uno al terminar.
      </p>

      <ol className="space-y-3">
        {dia.movimentos.map((m, i) => {
          const feito = feitos[i]
          const expandido = aberto === i
          return (
            <li key={m.exercicio.id} className={`card p-4 ${feito ? 'ring-2 ring-sage-300' : ''}`}>
              <button
                type="button"
                onClick={() => setAberto(expandido ? null : i)}
                className="flex w-full items-center gap-3 text-left"
                aria-expanded={expandido}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sun-700 text-sm font-bold text-white">
                  {i + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.exercicio.imagem}
                  alt=""
                  className="h-16 w-20 shrink-0 rounded-xl object-cover"
                  loading="lazy"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-ink-900">{m.exercicio.nome}</span>
                  <span className="block text-sm font-semibold text-sun-700">{m.dose}</span>
                </span>
                {feito ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-500 text-white">
                    <CheckIcon width={18} height={18} />
                  </span>
                ) : null}
              </button>

              {expandido ? (
                <div className="mt-4 space-y-4 animate-fade-up">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.exercicio.imagem} alt={m.exercicio.nome} className="w-full rounded-2xl" />
                  <div className="rounded-2xl bg-mist-100 px-4 py-3 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-700">Hoy</p>
                    <p className="text-lg font-extrabold text-sun-700">{m.dose}</p>
                  </div>
                  <ExercicioDetalhe exercicio={m.exercicio} />
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => marcar(i)}
                className={`mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl text-base font-bold transition ${
                  feito ? 'bg-sage-100 text-sage-600' : 'bg-brand-400 text-white'
                }`}
              >
                {feito ? (
                  <>
                    <CheckIcon width={18} height={18} /> Hecho
                  </>
                ) : (
                  'Marcar como hecho'
                )}
              </button>
            </li>
          )
        })}
      </ol>

      <section className="rounded-3xl bg-brand-50 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Consejo del día</p>
        <p className="mt-1 text-ink-800">{dia.consejo}</p>
        {dia.diaDeFoto ? (
          <Link href="/progresso" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">
            <CameraIcon width={18} height={18} /> Guardar foto en Progreso
          </Link>
        ) : null}
      </section>

      <section className="card">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">¿Cómo quedó tu cuello?</p>
        <p className="mt-1 text-sm text-ink-700">1 = muy tenso · 5 = muy suelto</p>
        <div className="mt-3 flex justify-between gap-2">
          {CUELLO_ESCALA.map((n) => (
            <button
              key={n.valor}
              type="button"
              onClick={() => setCuello(n.valor)}
              aria-label={n.label}
              aria-pressed={cuello === n.valor}
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold transition ${
                cuello === n.valor
                  ? 'border-brand-400 bg-brand-400 text-white'
                  : 'border-brand-200 bg-white text-brand-600'
              }`}
            >
              {n.valor}
            </button>
          ))}
        </div>
      </section>

      {erro ? (
        <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">{erro}</p>
      ) : null}

      <div className="sticky bottom-24 rounded-3xl bg-white/85 p-2 backdrop-blur">
        <button onClick={concluir} className="btn-primary w-full text-lg" disabled={!todos || salvando}>
          {salvando
            ? 'Guardando…'
            : !todos
              ? `Marca los 4 movimientos (${feitos.filter(Boolean).length}/4)`
              : jaFeito
                ? 'GUARDAR DE NUEVO ✓'
                : 'TERMINAR EL DÍA ✓'}
        </button>
      </div>
    </div>
  )
}

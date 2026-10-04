'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatarDuracao } from '@/lib/oraciones'
import type { BibliotecaConfig, ItemBiblioteca } from '@/lib/bibliotecas'
import { temaDoModulo } from '@/lib/modulo-tema'
import { ProgressBar } from '@/components/ProgressBar'
import { CheckIcon, LockIcon } from '@/components/ui/icons'

interface Props {
  config: BibliotecaConfig
  sequencia: ItemBiblioteca[]
  concluidas: number
  proxima: number | null
  feitoHoje: boolean
  terminado: boolean
  total: number
}

// =====================================================================
// Biblioteca em SEQUÊNCIA: uma noite por dia, na ordem.
//
// O que ela vê é a noite de hoje — só ela. As próximas aparecem fechadas,
// porque mostrar 21 players abertos convidaria a ouvir tudo numa tarde, e é
// justamente a constância que este produto vende.
// =====================================================================
export function BibliotecaSequencia({
  config,
  sequencia,
  concluidas,
  proxima,
  feitoHoje,
  terminado,
  total,
}: Props) {
  const tema = temaDoModulo(config.slug)
  const router = useRouter()
  const [url, setUrl] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const atual = proxima ? sequencia[proxima - 1] : null

  async function abrir() {
    if (!atual || url || carregando) return
    setCarregando(true)
    setErro(null)
    try {
      const res = await fetch('/api/biblioteca/url', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: atual.id }),
      })
      if (!res.ok) throw new Error()
      const { url: assinada } = (await res.json()) as { url: string }
      setUrl(assinada)
    } catch {
      setErro('No pudimos abrir el audio. Inténtalo de nuevo.')
    } finally {
      setCarregando(false)
    }
  }

  async function marcar() {
    if (salvando) return
    setSalvando(true)
    setErro(null)
    try {
      const res = await fetch('/api/biblioteca/completar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ modulo: config.slug }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setErro('No pudimos guardar tu noche. Inténtalo de nuevo.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <span className={`chip ${tema.chip}`}>
          {terminado ? 'Completado' : `Noche ${proxima ?? total} de ${total}`}
        </span>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">
          {terminado ? config.nome : (atual?.titulo ?? config.nome)}
        </h1>
        <p className="mt-1 text-base text-ink-700">{config.resumo}.</p>
      </header>

      <ProgressBar atual={concluidas} total={total} label="Tu avance" gradiente={tema.barra} />

      {terminado ? (
        <div className="rounded-3xl bg-sage-100 p-8 text-center">
          <p className="text-5xl">{config.emoji}</p>
          <p className="mt-3 text-2xl font-extrabold text-sage-600">
            ¡Completaste las {total} noches!
          </p>
          <p className="mt-2 text-base text-ink-700">
            Tu sueño ya tiene un ritmo propio. Vuelve a los audios cuando lo necesites.
          </p>
        </div>
      ) : feitoHoje ? (
        <div className="flex items-center gap-3 rounded-3xl bg-sage-100/60 px-5 py-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
            <CheckIcon width={24} height={24} />
          </span>
          <p className="text-base font-semibold text-ink-900">
            Ya hiciste la noche de hoy. La siguiente se abre mañana 🌙
          </p>
        </div>
      ) : atual ? (
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <p className="text-base text-ink-700">
            Acuéstate, cierra los ojos y deja que el audio te lleve.
          </p>

          {url ? (
            <audio src={url} controls autoPlay preload="none" className="mt-4 w-full" />
          ) : (
            <button
              onClick={abrir}
              disabled={carregando}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-4 text-lg font-bold disabled:opacity-60 ${tema.botao}`}
            >
              {carregando ? 'Abriendo…' : 'Escuchar esta noche'}
            </button>
          )}

          <button
            onClick={marcar}
            disabled={salvando}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-mist-200 py-3.5 text-base font-bold text-ink-900 disabled:opacity-60"
          >
            <CheckIcon width={20} height={20} />
            {salvando ? 'Guardando…' : 'Marcar esta noche'}
          </button>
          {erro && <p className="mt-2 text-sm font-semibold text-brand-600">{erro}</p>}
        </section>
      ) : (
        <div className="rounded-3xl bg-white p-6 text-center shadow-card">
          <p className="text-base font-semibold text-ink-900">Estamos preparando tus audios 🤍</p>
        </div>
      )}

      {/* O caminho: o que já passou e o que vem */}
      {sequencia.length > 0 && (
        <section>
          <h2 className="section-title mb-2">Tu camino</h2>
          <ul className="space-y-2">
            {sequencia.map((a, i) => {
              const numero = i + 1
              const feita = numero <= concluidas
              const eHoje = numero === proxima
              return (
                <li
                  key={a.id}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                    eHoje ? 'bg-white shadow-card' : 'bg-white/60'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      feita ? 'bg-sage-100 text-sage-600' : eHoje ? tema.avatar : 'bg-mist-200 text-ink-700/40'
                    }`}
                  >
                    {feita ? '✓' : numero}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-base ${
                        eHoje ? 'font-bold text-ink-900' : feita ? 'text-ink-700' : 'text-ink-700/60'
                      }`}
                    >
                      {a.titulo}
                    </span>
                    {formatarDuracao(a.duracaoSeg) && (
                      <span className="block text-sm text-ink-700/60">
                        {formatarDuracao(a.duracaoSeg)}
                      </span>
                    )}
                  </span>
                  {!feita && !eHoje && (
                    <LockIcon width={16} height={16} className="shrink-0 text-ink-700/30" />
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

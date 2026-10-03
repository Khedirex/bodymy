'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface PassoBloco {
  slug: string
  nome: string
  alvo: number
  quantos: number
  sequencial: boolean
  quando?: string
}

export interface NoiteMontada {
  id: string
  noche: number | null
  titulo: string
  duracao: string | null
  bloco: string
  resgate: boolean
  primeiroDoBloco: boolean
  ultimoDoBloco: boolean
}

// =====================================================================
// O CAMINHO DE MONTAGEM.
//
// Em vez de uma tabela solta, os blocos viram passos com alvo e contagem, e
// ao lado aparece o plano EXATAMENTE como a aluna vai ver — noite por noite,
// na ordem. Montar o conteúdo e conferir o que a aluna recebe passam a ser a
// mesma tela: a ordem de upload é que define a sequência, e um arquivo fora
// de lugar só se via quando a aluna já estava ouvindo.
// =====================================================================
export function PlanoMontagem({
  passos,
  noites,
  apoio,
}: {
  passos: PassoBloco[]
  noites: NoiteMontada[]
  apoio: { bloco: string; audios: NoiteMontada[] }[]
}) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)

  const faltando = passos.filter((p) => p.quantos < p.alvo)
  const completo = faltando.length === 0 && passos.length > 0

  async function mover(id: string, direcao: 'sube' | 'baja') {
    setOcupado(id)
    await fetch('/api/admin/audios', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, direcao }),
    })
    setOcupado(null)
    router.refresh()
  }

  async function marcarResgate(id: string, resgate: boolean) {
    setOcupado(id)
    await fetch('/api/admin/audios', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, resgate }),
    })
    setOcupado(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Os passos */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">Camino de montaje</h2>
          {completo ? (
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
              El plan está armado ✓
            </span>
          ) : (
            <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800">
              Faltan {passos.reduce((s, p) => s + Math.max(0, p.alvo - p.quantos), 0)} audios
            </span>
          )}
        </div>

        <ol className="mt-3 space-y-2">
          {passos.map((p, i) => {
            const ok = p.quantos >= p.alvo
            const atual = !ok && faltando[0]?.slug === p.slug
            return (
              <li
                key={p.slug}
                className={`flex items-center gap-3 rounded-md border p-3 ${
                  atual ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    ok ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {ok ? '✓' : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    {p.nome}
                    {!p.sequencial && (
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        fuera de secuencia · {p.quando}
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {p.quantos} de {p.alvo}
                    {atual && ' · es el que estás subiendo ahora'}
                  </span>
                </span>
                <span className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                  <span
                    className={`block h-full rounded-full ${ok ? 'bg-emerald-600' : 'bg-slate-900'}`}
                    style={{ width: `${Math.min(100, (p.quantos / p.alvo) * 100)}%` }}
                  />
                </span>
              </li>
            )
          })}
        </ol>
      </section>

      {/* O plano como a aluna vê */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-bold text-slate-900">Lo que ve la alumna</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          La secuencia, noche por noche. Usa las flechas si un audio quedó fuera de lugar.
        </p>

        {noites.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Todavía no hay audios en la secuencia.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {noites.map((n) => (
              <li key={n.id} className="flex items-center gap-3 py-2">
                <span className="w-16 shrink-0 text-xs font-bold text-slate-500">
                  Noche {n.noche}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-900">
                    {n.titulo}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {n.bloco}
                    {n.duracao ? ` · ${n.duracao}` : ''}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => mover(n.id, 'sube')}
                    disabled={n.primeiroDoBloco || ocupado === n.id}
                    className="rounded border border-slate-200 px-2 py-1 text-xs disabled:opacity-30"
                    aria-label="Subir"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => mover(n.id, 'baja')}
                    disabled={n.ultimoDoBloco || ocupado === n.id}
                    className="rounded border border-slate-200 px-2 py-1 text-xs disabled:opacity-30"
                    aria-label="Bajar"
                  >
                    ↓
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Blocos de apoio + marcação do resgate */}
      {apoio.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-bold text-slate-900">Disponibles fuera de secuencia</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Marca uno como <strong>rescate</strong> para que aparezca en “¿Despertaste de
            madrugada?”. Solo puede haber uno.
          </p>
          {apoio.map((b) => (
            <div key={b.bloco} className="mt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{b.bloco}</p>
              <ul className="mt-1 divide-y divide-slate-100">
                {b.audios.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-900">
                      {a.titulo}
                      {a.duracao ? <span className="text-slate-500"> · {a.duracao}</span> : null}
                    </span>
                    <button
                      onClick={() => marcarResgate(a.id, !a.resgate)}
                      disabled={ocupado === a.id}
                      className={`shrink-0 rounded px-2 py-1 text-xs font-semibold disabled:opacity-50 ${
                        a.resgate
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {a.resgate ? 'rescate ✓' : 'marcar rescate'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

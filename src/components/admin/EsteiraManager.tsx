'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types/db'

interface UpsellRow {
  id: string
  upsell_product_id: string
  ordem: number
  produto: Pick<Product, 'id' | 'nome' | 'slug' | 'tipo'> | null
}

export function EsteiraManager({
  productId,
  upsells,
  todos,
}: {
  productId: string
  upsells: UpsellRow[]
  todos: Pick<Product, 'id' | 'nome' | 'slug' | 'tipo'>[]
}) {
  const router = useRouter()
  const [sel, setSel] = useState('')
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const ordenados = [...upsells].sort((a, b) => a.ordem - b.ordem)
  const jaNaEsteira = new Set(ordenados.map((u) => u.upsell_product_id))
  const disponiveis = todos.filter((p) => p.id !== productId && !jaNaEsteira.has(p.id))

  async function call(body: Record<string, unknown>) {
    setBusy(true)
    setErro(null)
    try {
      const res = await fetch('/api/admin/upsells', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setErro(data.error ?? 'falló'); return }
      router.refresh()
    } catch {
      setErro('error de red')
    } finally {
      setBusy(false)
    }
  }

  function mover(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= ordenados.length) return
    const a = ordenados[i]
    const b = ordenados[j]
    // Troca as ordens dos dois adjacentes.
    call({ action: 'reorder', upsellId: a.id, ordem: b.ordem })
    call({ action: 'reorder', upsellId: b.id, ordem: a.ordem })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Quien compra este producto ve estos artículos en la vitrina (/descubra). El orden aquí es el orden de visualización.
      </p>

      {erro ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Falló: {erro}</div> : null}

      {ordenados.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-center text-sm text-slate-400">
          Ningún upsell configurado. Agrega productos abajo.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {ordenados.map((u, i) => (
            <li key={u.id} className="flex items-center gap-2 px-3 py-2 text-sm">
              <span className="w-6 text-center text-xs text-slate-400">{i + 1}</span>
              <span className="flex-1 text-slate-800">
                {u.produto?.nome ?? '(producto eliminado)'}{' '}
                <span className="text-xs text-slate-400">/{u.produto?.slug}</span>
              </span>
              <button disabled={busy || i === 0} onClick={() => mover(i, -1)} className="rounded border border-slate-200 px-2 py-0.5 text-xs disabled:opacity-30">↑</button>
              <button disabled={busy || i === ordenados.length - 1} onClick={() => mover(i, 1)} className="rounded border border-slate-200 px-2 py-0.5 text-xs disabled:opacity-30">↓</button>
              <button
                disabled={busy}
                onClick={() => { if (window.confirm(`¿Quitar "${u.produto?.nome}" de la vitrina de upsells?`)) call({ action: 'remove', upsellId: u.id }) }}
                className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-30"
              >
                quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <select value={sel} onChange={(e) => setSel(e.target.value)} className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          <option value="">Agregar producto a la vitrina de upsells…</option>
          {disponiveis.map((p) => <option key={p.id} value={p.id}>{p.nome} ({p.tipo})</option>)}
        </select>
        <button
          disabled={!sel || busy}
          onClick={() => { const ordem = ordenados.length; call({ action: 'add', productId, upsellProductId: sel, ordem }); setSel('') }}
          className="whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Agregar
        </button>
      </div>
    </div>
  )
}

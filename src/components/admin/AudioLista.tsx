'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Item {
  id: string
  titulo: string
  ordem: number
  duracao: string | null
  produto: string
}

// Lista do catálogo com remoção. Remover apaga do banco E do bucket: um
// upload errado não pode ficar ocupando espaço pago e invisível.
export function AudioLista({ itens }: { itens: Item[] }) {
  const router = useRouter()
  const [removendo, setRemovendo] = useState<string | null>(null)

  async function remover(id: string, titulo: string) {
    if (!confirm(`¿Eliminar "${titulo}"? El archivo también se borra del bucket.`)) return
    setRemovendo(id)
    await fetch('/api/admin/audios', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setRemovendo(null)
    router.refresh()
  }

  if (itens.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
        Todavía no hay audios en el catálogo.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Título</th>
            <th className="px-3 py-2 font-medium">Duración</th>
            <th className="px-3 py-2 font-medium">Desbloquea con</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {itens.map((a) => (
            <tr key={a.id} className="border-b border-slate-100">
              <td className="px-3 py-2 text-slate-500">{a.ordem}</td>
              <td className="px-3 py-2 font-medium text-slate-900">{a.titulo}</td>
              <td className="px-3 py-2 text-slate-600">{a.duracao ?? '—'}</td>
              <td className="px-3 py-2 text-slate-600">{a.produto}</td>
              <td className="px-3 py-2 text-right">
                <button
                  onClick={() => remover(a.id, a.titulo)}
                  disabled={removendo === a.id}
                  className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
                >
                  {removendo === a.id ? 'Eliminando…' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

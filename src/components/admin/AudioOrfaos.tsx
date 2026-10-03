'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Orfao {
  path: string
  tamanho: string
  quando: string
}

// Arquivos que estão no bucket mas fora do catálogo. Existem porque um
// upload pode subir e falhar no registro — e sem esta tela eles ficariam
// ocupando espaço pago sem ninguém saber que existem.
export function AudioOrfaos({ itens }: { itens: Orfao[] }) {
  const router = useRouter()
  const [limpando, setLimpando] = useState(false)

  if (itens.length === 0) return null

  async function limpar() {
    if (!confirm(`¿Eliminar ${itens.length} archivo(s) huérfano(s) del bucket? No se puede deshacer.`)) return
    setLimpando(true)
    await fetch('/api/admin/audios/orfaos', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ paths: itens.map((i) => i.path) }),
    })
    setLimpando(false)
    router.refresh()
  }

  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-amber-900">
            {itens.length} archivo(s) en el bucket, fuera del catálogo
          </h2>
          <p className="mt-1 text-sm text-amber-800">
            Subieron, pero no quedaron registrados — la alumna no los ve. El nombre original se
            perdió en la subida, así que lo más rápido es volver a subirlos y eliminar estos.
          </p>
        </div>
        <button
          onClick={limpar}
          disabled={limpando}
          className="shrink-0 rounded-md bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {limpando ? 'Eliminando…' : 'Eliminar todos'}
        </button>
      </div>
      <ul className="mt-3 space-y-1 font-mono text-xs text-amber-900/80">
        {itens.map((o) => (
          <li key={o.path}>
            {o.path.replace('oraciones/', '')} · {o.tamanho} · {o.quando}
          </li>
        ))}
      </ul>
    </section>
  )
}

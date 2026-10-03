'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ProdutoOpcao {
  id: string
  nome: string
}

interface Props {
  modulo: string
  produtos: ProdutoOpcao[]
  /** Maior "ordem" já usada neste módulo — o lote continua a partir dela. */
  ordemInicial: number
}

type Estado = 'parado' | 'enviando' | 'pronto'

// Lê a duração do arquivo no próprio navegador. Serve para mostrar "7:12"
// na lista da aluna sem depender de ninguém digitar.
function duracaoDoArquivo(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const a = new Audio()
    const limpar = () => URL.revokeObjectURL(url)
    a.addEventListener('loadedmetadata', () => {
      const s = Number.isFinite(a.duration) ? Math.round(a.duration) : null
      limpar()
      resolve(s)
    })
    a.addEventListener('error', () => {
      limpar()
      resolve(null)
    })
    a.src = url
  })
}

// Título a partir do nome do arquivo: "12 - Oración de la noche.mp3" vira
// "Oración de la noche". Você corrige depois se quiser, mas 63 arquivos
// digitados à mão seria uma tarde inteira.
function tituloDoArquivo(nome: string): string {
  return nome
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/^[\s\d]*[-_.)]\s*/, '')
    .replace(/[_]+/g, ' ')
    .trim()
}

export function AudioUploader({ modulo, produtos, ordemInicial }: Props) {
  const router = useRouter()
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? '')
  const [arquivos, setArquivos] = useState<File[]>([])
  const [estado, setEstado] = useState<Estado>('parado')
  const [feitos, setFeitos] = useState(0)
  const [erro, setErro] = useState<string | null>(null)

  async function enviar() {
    if (arquivos.length === 0 || !produtoId) return
    setEstado('enviando')
    setErro(null)
    setFeitos(0)

    const supabase = createClient()
    const registrados: Array<{ titulo: string; storagePath: string; ordem: number; duracaoSeg: number | null }> = []

    try {
      for (let i = 0; i < arquivos.length; i++) {
        const file = arquivos[i]
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp3'

        const res = await fetch('/api/admin/audios/upload-url', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ modulo, ext }),
        })
        if (!res.ok) throw new Error(`No se pudo preparar la subida de ${file.name}`)
        const { path, token } = (await res.json()) as { path: string; token: string }

        const up = await supabase.storage.from('audios').uploadToSignedUrl(path, token, file)
        if (up.error) throw new Error(`${file.name}: ${up.error.message}`)

        registrados.push({
          titulo: tituloDoArquivo(file.name),
          storagePath: path,
          ordem: ordemInicial + i + 1,
          duracaoSeg: await duracaoDoArquivo(file),
        })
        setFeitos(i + 1)
      }

      // Só registra no catálogo o que REALMENTE subiu: se a conexão cair no
      // meio, o que já foi fica utilizável e você continua de onde parou.
      const reg = await fetch('/api/admin/audios', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ modulo, productId: produtoId, itens: registrados }),
      })
      if (!reg.ok) throw new Error('Los archivos subieron, pero no se pudieron registrar.')

      setEstado('pronto')
      setArquivos([])
      router.refresh()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Error al subir')
      setEstado('parado')
      if (registrados.length > 0) {
        await fetch('/api/admin/audios', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ modulo, productId: produtoId, itens: registrados }),
        }).catch(() => {})
        router.refresh()
      }
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            Producto que desbloquea estos audios
          </span>
          <select
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">
            Archivos (puedes elegir varios)
          </span>
          <input
            type="file"
            accept="audio/*"
            multiple
            onChange={(e) => setArquivos(Array.from(e.target.files ?? []))}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
        </label>
      </div>

      {arquivos.length > 0 && (
        <p className="mt-3 text-sm text-slate-600">
          {arquivos.length} archivo(s) · empiezan en el orden {ordemInicial + 1}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={enviar}
          disabled={estado === 'enviando' || arquivos.length === 0 || !produtoId}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {estado === 'enviando' ? `Subiendo ${feitos}/${arquivos.length}…` : 'Subir al catálogo'}
        </button>
        {estado === 'pronto' && <span className="text-sm font-semibold text-emerald-700">Listo ✓</span>}
        {erro && <span className="text-sm font-semibold text-red-700">{erro}</span>}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Los archivos van directo del navegador al bucket privado — no pasan por el servidor,
        así que un lote grande no lo tumba. El título sale del nombre del archivo.
      </p>
    </div>
  )
}

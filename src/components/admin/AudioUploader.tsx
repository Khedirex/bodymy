'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ProdutoOpcao {
  id: string
  nome: string
}

interface BlocoOpcao {
  slug: string
  nome: string
}

interface Props {
  modulo: string
  produtos: ProdutoOpcao[]
  /** Maior "ordem" já usada neste módulo — o lote continua a partir dela. */
  ordemInicial: number
  /** Blocos do módulo (vazio = biblioteca sem blocos, como as oraciones). */
  blocos?: BlocoOpcao[]
}

type Estado = 'parado' | 'enviando' | 'pronto'

// Lê a duração do arquivo no próprio navegador. Serve para mostrar "7:12"
// na lista da aluna sem depender de ninguém digitar.
//
// COM TIMEOUT, e isso não é zelo: sem ele, um arquivo cujo 'loadedmetadata'
// o navegador não dispara deixa a promessa pendente para sempre, o laço
// congela e o lote inteiro fica no bucket sem entrar no catálogo. Foi
// exatamente o que aconteceu com os 16 primeiros áudios.
function duracaoDoArquivo(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const a = new Audio()
    let pronto = false

    const terminar = (valor: number | null) => {
      if (pronto) return
      pronto = true
      clearTimeout(limite)
      URL.revokeObjectURL(url)
      resolve(valor)
    }

    const limite = setTimeout(() => terminar(null), 8000)

    a.addEventListener('loadedmetadata', () =>
      terminar(Number.isFinite(a.duration) ? Math.round(a.duration) : null),
    )
    a.addEventListener('error', () => terminar(null))
    a.preload = 'metadata'
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

export function AudioUploader({ modulo, produtos, ordemInicial, blocos = [] }: Props) {
  const router = useRouter()
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? '')
  const [bloco, setBloco] = useState(blocos[0]?.slug ?? '')
  const [arquivos, setArquivos] = useState<File[]>([])
  const [estado, setEstado] = useState<Estado>('parado')
  const [feitos, setFeitos] = useState(0)
  const [falhas, setFalhas] = useState<string[]>([])

  async function enviar() {
    if (arquivos.length === 0 || !produtoId) return
    setEstado('enviando')
    setFalhas([])
    setFeitos(0)

    const supabase = createClient()

    // UM arquivo por vez, e CADA UM é registrado no catálogo logo depois de
    // subir. Registrar só no fim do lote fazia qualquer tropeço no meio
    // deixar tudo órfão no bucket: arquivo pago, invisível e sem título.
    for (let i = 0; i < arquivos.length; i++) {
      const file = arquivos[i]
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp3'

        const res = await fetch('/api/admin/audios/upload-url', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ modulo, ext }),
        })
        if (!res.ok) throw new Error('no se pudo preparar la subida')
        const { path, token } = (await res.json()) as { path: string; token: string }

        const up = await supabase.storage.from('audios').uploadToSignedUrl(path, token, file)
        if (up.error) throw new Error(up.error.message)

        const reg = await fetch('/api/admin/audios', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            modulo,
            productId: produtoId,
            bloco: bloco || null,
            itens: [
              {
                titulo: tituloDoArquivo(file.name),
                storagePath: path,
                ordem: ordemInicial + i + 1,
                duracaoSeg: await duracaoDoArquivo(file),
              },
            ],
          }),
        })
        if (!reg.ok) throw new Error('subió, pero no entró en el catálogo')

        setFeitos(i + 1)
      } catch (e) {
        // Um arquivo ruim não derruba o lote: anota e segue para o próximo.
        const motivo = e instanceof Error ? e.message : 'error'
        setFalhas((f) => [...f, `${file.name}: ${motivo}`])
      }
    }

    setEstado('pronto')
    setArquivos([])
    router.refresh()
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

        {blocos.length > 0 && (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              Bloque al que pertenecen
            </span>
            <select
              value={bloco}
              onChange={(e) => setBloco(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {blocos.map((b) => (
                <option key={b.slug} value={b.slug}>{b.nome}</option>
              ))}
            </select>
          </label>
        )}

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
          disabled={
            estado === 'enviando' ||
            arquivos.length === 0 ||
            !produtoId ||
            (blocos.length > 0 && !bloco)
          }
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {estado === 'enviando' ? `Subiendo ${feitos}/${arquivos.length}…` : 'Subir al catálogo'}
        </button>
        {estado === 'pronto' && falhas.length === 0 && (
          <span className="text-sm font-semibold text-emerald-700">Listo ✓ {feitos} audio(s)</span>
        )}
        {estado === 'pronto' && falhas.length > 0 && (
          <span className="text-sm font-semibold text-amber-700">
            {feitos} subieron · {falhas.length} fallaron
          </span>
        )}
      </div>

      {falhas.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-red-700">
          {falhas.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Los archivos van directo del navegador al bucket privado — no pasan por el servidor,
        así que un lote grande no lo tumba. El título sale del nombre del archivo.
      </p>
    </div>
  )
}

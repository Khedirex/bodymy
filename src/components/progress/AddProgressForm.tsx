'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CameraIcon } from '@/components/ui/icons'

// Formulário para registrar progresso: foto (opcional, privada), medidas,
// peso (opcional) e nota. A foto sobe via URL assinada gerada no servidor.
export function AddProgressForm() {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [cintura, setCintura] = useState('')
  const [quadril, setQuadril] = useState('')
  const [peso, setPeso] = useState('')
  const [nota, setNota] = useState('')

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setPreview(URL.createObjectURL(f))
  }

  async function uploadFoto(file: File): Promise<string | null> {
    // 1) pede URL assinada de upload ao servidor
    const ext = file.name.split('.').pop() || 'jpg'
    const res = await fetch('/api/progress/upload-url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ext }),
    })
    if (!res.ok) throw new Error('upload-url')
    const { path, token } = await res.json()

    // 2) faz o upload direto pro Storage usando o token assinado
    const supabase = createClient()
    const { error } = await supabase.storage
      .from('progress-photos')
      .uploadToSignedUrl(path, token, file)
    if (error) throw error
    return path
  }

  async function salvar() {
    setSalvando(true)
    setErro(null)
    try {
      let fotoPath: string | null = null
      const file = fileRef.current?.files?.[0]
      if (file) fotoPath = await uploadFoto(file)

      const medidas: Record<string, number> = {}
      if (cintura) medidas.cintura = Number(cintura)
      if (quadril) medidas.quadril = Number(quadril)

      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          foto_path: fotoPath,
          medidas: Object.keys(medidas).length ? medidas : null,
          peso: peso ? Number(peso) : null,
          nota: nota || null,
        }),
      })
      if (!res.ok) throw new Error('save')

      // limpa e fecha
      setAberto(false)
      setPreview(null)
      setCintura('')
      setQuadril('')
      setPeso('')
      setNota('')
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch {
      setErro('No fue posible guardar ahora. Inténtalo de nuevo.')
    } finally {
      setSalvando(false)
    }
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="btn-secondary w-full">
        <CameraIcon width={20} height={20} /> Registrar mi progreso
      </button>
    )
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-ink-900">Nuevo registro</h3>
        <button
          onClick={() => setAberto(false)}
          className="text-sm font-semibold text-ink-700/60"
        >
          Cancelar
        </button>
      </div>

      {/* Foto */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cream-200 bg-cream-50 p-5 text-center">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa" className="h-40 rounded-xl object-cover" />
        ) : (
          <>
            <CameraIcon width={28} height={28} className="text-coral-300" />
            <span className="text-sm font-medium text-ink-700">
              Agregar foto (opcional y privada)
            </span>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickFile}
        />
      </label>

      {/* Medidas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink-800">
            Cintura (cm)
          </label>
          <input
            inputMode="decimal"
            className="input"
            value={cintura}
            onChange={(e) => setCintura(e.target.value)}
            placeholder="—"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-ink-800">
            Cadera (cm)
          </label>
          <input
            inputMode="decimal"
            className="input"
            value={quadril}
            onChange={(e) => setQuadril(e.target.value)}
            placeholder="—"
          />
        </div>
      </div>

      {/* Peso (opcional, discreto) */}
      <details className="rounded-2xl bg-cream-50 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-ink-700">
          Registrar peso (opcional)
        </summary>
        <div className="mt-2">
          <input
            inputMode="decimal"
            className="input"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="Peso en kg (opcional)"
          />
          <p className="mt-1 text-xs text-ink-700/60">
            El peso es solo un dato más, nunca el más importante. Enfócate en cómo te sientes.
          </p>
        </div>
      </details>

      <div>
        <label className="mb-1 block text-sm font-semibold text-ink-800">¿Cómo te fue?</label>
        <textarea
          className="input min-h-[80px] resize-none"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Una nota para ti misma (opcional)"
        />
      </div>

      {erro ? (
        <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">
          {erro}
        </p>
      ) : null}

      <button onClick={salvar} disabled={salvando} className="btn-primary w-full">
        {salvando ? 'Guardando…' : 'Guardar registro'}
      </button>
    </div>
  )
}

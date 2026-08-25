'use client'

import { useState } from 'react'
import type { Stretch } from '@/types/db'

// Editor inline dos 10 alongamentos: nome + panda_video_id + duração.
export function StretchesEditor({ stretches }: { stretches: Stretch[] }) {
  return (
    <div className="space-y-2">
      {stretches.map((s) => (
        <StretchRow key={s.id} stretch={s} />
      ))}
    </div>
  )
}

function StretchRow({ stretch }: { stretch: Stretch }) {
  const [nome, setNome] = useState(stretch.nome)
  const [video, setVideo] = useState(stretch.panda_video_id ?? '')
  const [dur, setDur] = useState(stretch.duracao_seg?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar() {
    setSaving(true)
    setOk(false)
    setErro(null)
    try {
      const res = await fetch('/api/admin/circuito', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'stretch',
          id: stretch.id,
          nome,
          panda_video_id: video,
          duracao_seg: dur,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setErro(d.error ?? 'Error al guardar')
        return
      }
      setOk(true)
      setTimeout(() => setOk(false), 1500)
    } catch {
      setErro('Sin conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
      <span className="w-6 text-center text-xs text-slate-400">{stretch.ordem}</span>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="min-w-[8rem] flex-1 rounded border border-slate-200 px-2 py-1 text-sm"
        placeholder="Nombre"
      />
      <input
        value={video}
        onChange={(e) => setVideo(e.target.value)}
        className="min-w-[10rem] flex-[2] rounded border border-slate-200 px-2 py-1 font-mono text-xs"
        placeholder="panda_video_id"
      />
      <input
        value={dur}
        onChange={(e) => setDur(e.target.value)}
        inputMode="numeric"
        className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
        placeholder="seg"
      />
      <button
        onClick={salvar}
        disabled={saving}
        className="rounded-md bg-slate-900 px-3 py-1 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {saving ? '…' : 'Guardar'}
      </button>
      {ok ? <span className="text-xs font-semibold text-emerald-600">✓</span> : null}
      {erro ? <span className="text-xs text-rose-600">{erro}</span> : null}
      {stretch.panda_video_id ? (
        <span className="text-xs text-emerald-600">video ok</span>
      ) : (
        <span className="text-xs text-slate-400">sin video</span>
      )}
    </div>
  )
}

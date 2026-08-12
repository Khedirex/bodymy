'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ExerciseVariation } from '@/types/db'
import type { ExerciseWithVariations } from '@/lib/admin-queries'

export function ExerciseEditor({ exercise }: { exercise: ExerciseWithVariations }) {
  const router = useRouter()
  const [nome, setNome] = useState(exercise.nome)
  const [descricao, setDescricao] = useState(exercise.descricao ?? '')
  const [ativo, setAtivo] = useState(exercise.ativo)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function salvarExercicio() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/circuito', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: 'exercise', id: exercise.id, nome, descricao, ativo }),
      })
      const d = await res.json().catch(() => ({}))
      setMsg(res.ok ? 'Exercício salvo.' : d.error ?? 'Erro ao salvar')
      if (res.ok) router.refresh()
    } catch {
      setMsg('Sem conexão')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-base font-bold text-slate-900">Dados do exercício</h2>
        <label className="block text-sm font-medium text-slate-600">Nome</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
        />
        <label className="mt-3 block text-sm font-medium text-slate-600">Descrição (opcional)</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm"
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          Ativo
        </label>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={salvarExercicio}
            disabled={saving}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar exercício'}
          </button>
          {msg ? <span className="text-sm text-slate-500">{msg}</span> : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Variações (v1 fácil → v4 difícil)</h2>
        {exercise.variacoes.map((v) => (
          <VariationRow key={v.id} variation={v} />
        ))}
      </section>
    </div>
  )
}

function VariationRow({ variation }: { variation: ExerciseVariation }) {
  const [video, setVideo] = useState(variation.panda_video_id ?? '')
  const [dur, setDur] = useState(variation.duracao_seg?.toString() ?? '')
  const [instr, setInstr] = useState(variation.instrucoes ?? '')
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
          kind: 'variation',
          id: variation.id,
          panda_video_id: video,
          duracao_seg: dur,
          instrucoes: instr,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setErro(d.error ?? 'Erro')
        return
      }
      setOk(true)
      setTimeout(() => setOk(false), 1500)
    } catch {
      setErro('Sem conexão')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-6 w-8 items-center justify-center rounded bg-slate-900 text-xs font-bold text-white">
          v{variation.nivel}
        </span>
        {variation.panda_video_id ? (
          <span className="text-xs font-semibold text-emerald-600">vídeo preenchido</span>
        ) : (
          <span className="text-xs text-slate-400">sem vídeo</span>
        )}
      </div>
      <label className="block text-xs font-medium text-slate-500">panda_video_id</label>
      <input
        value={video}
        onChange={(e) => setVideo(e.target.value)}
        className="mt-1 w-full rounded border border-slate-200 px-2 py-1 font-mono text-xs"
        placeholder="cole o id do vídeo do Panda"
      />
      <div className="mt-2 flex gap-2">
        <div className="w-28">
          <label className="block text-xs font-medium text-slate-500">Duração (seg)</label>
          <input
            value={dur}
            onChange={(e) => setDur(e.target.value)}
            inputMode="numeric"
            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500">Instruções (opcional)</label>
          <input
            value={instr}
            onChange={(e) => setInstr(e.target.value)}
            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
          />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={salvar}
          disabled={saving}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? '…' : 'Salvar v' + variation.nivel}
        </button>
        {ok ? <span className="text-sm font-semibold text-emerald-600">✓ salvo</span> : null}
        {erro ? <span className="text-sm text-rose-600">{erro}</span> : null}
      </div>
    </div>
  )
}

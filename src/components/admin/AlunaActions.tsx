'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Produto {
  id: string
  nome: string
  slug: string
}
interface EntitlementItem {
  product_id: string
  produtoNome: string
  status: string
}

export function AlunaActions({
  alunaId,
  alunaEmail,
  entitlements,
  produtos,
}: {
  alunaId: string
  alunaEmail: string
  entitlements: EntitlementItem[]
  produtos: Produto[]
}) {
  const router = useRouter()
  const [selecionado, setSelecionado] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  async function chamar(url: string, body: Record<string, unknown>, confirmMsg: string, key: string) {
    if (!window.confirm(confirmMsg)) return
    setLoading(key)
    setMsg(null)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMsg({ tipo: 'erro', texto: data.error ? `Falhou: ${data.error}` : 'Falhou.' })
        return
      }
      setMsg({ tipo: 'ok', texto: data.mensagem ?? 'Feito.' })
      router.refresh()
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro de rede.' })
    } finally {
      setLoading(null)
    }
  }

  const jaTem = new Set(entitlements.filter((e) => e.status === 'ativo').map((e) => e.product_id))
  const disponiveis = produtos.filter((p) => !jaTem.has(p.id))

  return (
    <div className="space-y-4">
      {msg ? (
        <div className={`rounded-md px-3 py-2 text-sm ${msg.tipo === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {msg.texto}
        </div>
      ) : null}

      {/* Conceder novo acesso */}
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="mb-2 text-sm font-semibold text-slate-700">Conceder novo acesso</p>
        <div className="flex gap-2">
          <select
            value={selecionado}
            onChange={(e) => setSelecionado(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Selecione um produto…</option>
            {disponiveis.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          <button
            disabled={!selecionado || loading === 'grant'}
            onClick={() => {
              const prod = produtos.find((p) => p.id === selecionado)
              chamar('/api/admin/grant', { alunaId, productId: selecionado },
                `Conceder acesso a "${prod?.nome}" para ${alunaEmail}?`, 'grant')
            }}
            className="whitespace-nowrap rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading === 'grant' ? '…' : 'Conceder'}
          </button>
        </div>
      </div>

      {/* Revogar acessos existentes */}
      {entitlements.filter((e) => e.status === 'ativo').length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="mb-2 text-sm font-semibold text-slate-700">Revogar acesso</p>
          <ul className="space-y-1.5">
            {entitlements.filter((e) => e.status === 'ativo').map((e) => (
              <li key={e.product_id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{e.produtoNome}</span>
                <button
                  disabled={loading === `revoke:${e.product_id}`}
                  onClick={() =>
                    chamar('/api/admin/revoke', { alunaId, productId: e.product_id },
                      `REVOGAR o acesso de "${e.produtoNome}" de ${alunaEmail}? A aluna perde o acesso.`, `revoke:${e.product_id}`)
                  }
                  className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {loading === `revoke:${e.product_id}` ? '…' : 'Revogar'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reenviar e-mail */}
      <button
        disabled={loading === 'resend'}
        onClick={() =>
          chamar('/api/admin/resend-welcome', { alunaId },
            `Reenviar o e-mail de acesso para ${alunaEmail}?`, 'resend')
        }
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {loading === 'resend' ? 'Enviando…' : 'Reenviar e-mail de acesso'}
      </button>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product, ProductTipo, SalesPage } from '@/types/db'

const TIPOS: { v: ProductTipo; label: string }[] = [
  { v: 'programa', label: 'Programa' },
  { v: 'dieta_premium', label: 'Dieta premium' },
  { v: 'bundle', label: 'Combo (bundle)' },
  { v: 'extra', label: 'Extra' },
]

export function ProductForm({ product }: { product: Product | null }) {
  const router = useRouter()
  const sp = (product?.sales_page ?? {}) as Partial<SalesPage>
  const [f, setF] = useState({
    id: product?.id,
    nome: product?.nome ?? '',
    slug: product?.slug ?? '',
    descricao: product?.descricao ?? '',
    tipo: (product?.tipo ?? 'programa') as ProductTipo,
    preco_exibicao: product?.preco_exibicao ?? '',
    ativo: product?.ativo ?? true,
    kiwify_product_id: product?.kiwify_product_id ?? '',
    kiwify_checkout_url: product?.kiwify_checkout_url ?? '',
    headline: sp.headline ?? '',
    subheadline: sp.subheadline ?? '',
    imagem_url: sp.imagem_url ?? '',
    bullets: (sp.bullets ?? []).join('\n'),
    cta_label: sp.cta_label ?? '',
  })
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((p) => ({ ...p, [k]: v }))
  }

  const bulletsArr = f.bullets.split('\n').map((s) => s.trim()).filter(Boolean)

  async function salvar() {
    setSalvando(true)
    setMsg(null)
    const sales_page = {
      headline: f.headline,
      subheadline: f.subheadline || undefined,
      imagem_url: f.imagem_url || undefined,
      bullets: bulletsArr,
      cta_label: f.cta_label || undefined,
    }
    try {
      const res = await fetch('/api/admin/produtos', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: f.id,
          nome: f.nome,
          slug: f.slug,
          descricao: f.descricao,
          tipo: f.tipo,
          preco_exibicao: f.preco_exibicao,
          ativo: f.ativo,
          kiwify_product_id: f.kiwify_product_id,
          kiwify_checkout_url: f.kiwify_checkout_url,
          sales_page,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMsg({ tipo: 'erro', texto: `Falhou: ${data.error ?? 'erro'}` })
        return
      }
      setMsg({ tipo: 'ok', texto: data.mensagem ?? 'Salvo.' })
      if (!f.id && data.id) router.replace(`/admin/produtos/${data.id}`)
      else router.refresh()
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro de rede.' })
    } finally {
      setSalvando(false)
    }
  }

  const inputCls = 'w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-slate-500'

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Form */}
      <div className="space-y-4">
        {msg ? (
          <div className={`rounded-md px-3 py-2 text-sm ${msg.tipo === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{msg.texto}</div>
        ) : null}

        <fieldset className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <legend className="px-1 text-xs font-semibold uppercase text-slate-500">Dados</legend>
          <label className="block text-sm"><span className="text-slate-600">Nome</span><input className={inputCls} value={f.nome} onChange={(e) => set('nome', e.target.value)} /></label>
          <label className="block text-sm"><span className="text-slate-600">Slug</span><input className={inputCls} value={f.slug} onChange={(e) => set('slug', e.target.value)} placeholder="somente-minusculas-e-hifens" /></label>
          <label className="block text-sm"><span className="text-slate-600">Descrição</span><textarea className={inputCls} rows={2} value={f.descricao} onChange={(e) => set('descricao', e.target.value)} /></label>
          <div className="flex gap-3">
            <label className="block flex-1 text-sm"><span className="text-slate-600">Tipo</span>
              <select className={inputCls} value={f.tipo} onChange={(e) => set('tipo', e.target.value as ProductTipo)}>
                {TIPOS.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
              </select>
            </label>
            <label className="block flex-1 text-sm"><span className="text-slate-600">Preço (exibição)</span><input className={inputCls} value={f.preco_exibicao} onChange={(e) => set('preco_exibicao', e.target.value)} placeholder="R$ 37,00" /></label>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={f.ativo} onChange={(e) => set('ativo', e.target.checked)} /> Ativo</label>
        </fieldset>

        <fieldset className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <legend className="px-1 text-xs font-semibold uppercase text-slate-500">Integração Kiwify</legend>
          <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ⚠️ O <strong>kiwify_product_id</strong> é o <strong>id do produto no payload do webhook</strong> (o campo <code>Product.product_id</code>) — <strong>não</strong> é o código do link de checkout. Confirme pelos logs do webhook.
          </div>
          <label className="block text-sm"><span className="text-slate-600">kiwify_product_id</span><input className={inputCls} value={f.kiwify_product_id} onChange={(e) => set('kiwify_product_id', e.target.value)} /></label>
          <label className="block text-sm"><span className="text-slate-600">kiwify_checkout_url</span><input className={inputCls} value={f.kiwify_checkout_url} onChange={(e) => set('kiwify_checkout_url', e.target.value)} placeholder="https://pay.kiwify.com.br/..." /></label>
        </fieldset>

        <fieldset className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <legend className="px-1 text-xs font-semibold uppercase text-slate-500">Página de venda (/oferta)</legend>
          <label className="block text-sm"><span className="text-slate-600">Headline</span><input className={inputCls} value={f.headline} onChange={(e) => set('headline', e.target.value)} /></label>
          <label className="block text-sm"><span className="text-slate-600">Subheadline</span><input className={inputCls} value={f.subheadline} onChange={(e) => set('subheadline', e.target.value)} /></label>
          <label className="block text-sm"><span className="text-slate-600">Imagem (URL)</span><input className={inputCls} value={f.imagem_url} onChange={(e) => set('imagem_url', e.target.value)} /></label>
          <label className="block text-sm"><span className="text-slate-600">Bullets (um por linha)</span><textarea className={inputCls} rows={4} value={f.bullets} onChange={(e) => set('bullets', e.target.value)} /></label>
          <label className="block text-sm"><span className="text-slate-600">Texto do botão</span><input className={inputCls} value={f.cta_label} onChange={(e) => set('cta_label', e.target.value)} placeholder="QUERO ESTE PROGRAMA" /></label>
        </fieldset>

        <button onClick={salvar} disabled={salvando} className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
          {salvando ? 'Salvando…' : f.id ? 'Salvar produto' : 'Criar produto'}
        </button>
      </div>

      {/* Preview /oferta */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Preview da tela /oferta</p>
        <div className="mx-auto max-w-sm rounded-2xl bg-cream-50 p-5 shadow-inner" style={{ colorScheme: 'light' }}>
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-300/40 px-3 py-1 text-xs font-bold text-gold-500">🔒 Conteúdo bloqueado</span>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-ink-900">{f.headline || f.nome || 'Headline do produto'}</h1>
          {f.subheadline ? <p className="mt-2 text-ink-700">{f.subheadline}</p> : null}
          <div className="mt-3 flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-coral-100 to-cream-100 text-5xl">
            {f.imagem_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.imagem_url} alt="" className="h-full w-full object-cover" />
            ) : (f.tipo === 'dieta_premium' ? '🥗' : '🚶‍♀️')}
          </div>
          <ul className="mt-3 space-y-2">
            {bulletsArr.length ? bulletsArr.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-800"><span className="text-sage-500">✓</span>{b}</li>
            )) : <li className="text-sm text-ink-700/50">Adicione bullets…</li>}
          </ul>
          {f.preco_exibicao ? <p className="mt-3 text-center text-ink-700">por <span className="text-lg font-extrabold text-ink-900">{f.preco_exibicao}</span></p> : null}
          <div className="mt-2 rounded-2xl bg-coral-400 py-3 text-center text-sm font-bold text-white">{f.cta_label || 'QUERO ESTE PROGRAMA'}</div>
        </div>
      </div>
    </div>
  )
}

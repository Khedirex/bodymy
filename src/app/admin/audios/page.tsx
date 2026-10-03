import { createAdminClient } from '@/lib/supabase/admin'
import { AudioUploader } from '@/components/admin/AudioUploader'
import { AudioLista } from '@/components/admin/AudioLista'
import { ORACIONES_MODULO, ORACIONES_PRODUCT_SLUG, ORACIONES_UPSELL_SLUG, formatarDuracao } from '@/lib/oraciones'

export const dynamic = 'force-dynamic'

// Biblioteca de áudios. Hoje serve as oraciones; o campo "modulo" deixa o
// mesmo painel servir qualquer biblioteca futura sem reescrever nada.
export default async function AdminAudiosPage() {
  const admin = createAdminClient()

  const [{ data: produtos }, { data: audios }] = await Promise.all([
    admin
      .from('products')
      .select('id, nome, slug')
      .in('slug', [ORACIONES_PRODUCT_SLUG, ORACIONES_UPSELL_SLUG]),
    admin
      .from('audio_biblioteca')
      .select('id, titulo, ordem, duracao_seg, product_id, storage_path, criado_em')
      .eq('modulo', ORACIONES_MODULO)
      .order('ordem', { ascending: true }),
  ])

  const nomePorProduto = new Map((produtos ?? []).map((p) => [p.id as string, p.nome as string]))
  const lista = (audios ?? []).map((a) => ({
    id: a.id as string,
    titulo: a.titulo as string,
    ordem: a.ordem as number,
    duracao: formatarDuracao((a.duracao_seg as number) ?? null),
    produto: nomePorProduto.get(a.product_id as string) ?? '—',
  }))

  const ordemInicial = lista.reduce((max, a) => Math.max(max, a.ordem), 0)

  // Ordena a lista de produtos com o bump primeiro: é o que recebe a maioria.
  const opcoes = (produtos ?? [])
    .map((p) => ({ id: p.id as string, nome: p.nome as string, slug: p.slug as string }))
    .sort((a, b) => (a.slug === ORACIONES_PRODUCT_SLUG ? -1 : b.slug === ORACIONES_PRODUCT_SLUG ? 1 : 0))

  const porProduto = opcoes.map((p) => ({
    nome: p.nome,
    quantos: lista.filter((a) => a.produto === p.nome).length,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Biblioteca de audios</h1>
        <p className="mt-1 text-sm text-slate-600">
          Oración Milagrosa. Los audios viven en un bucket privado y se sirven con enlace
          firmado de 1 hora — no quedan públicos en internet.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total en el catálogo</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{lista.length}</p>
        </div>
        {porProduto.map((p) => (
          <div key={p.nome} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="truncate text-sm text-slate-500">{p.nome}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{p.quantos}</p>
          </div>
        ))}
      </div>

      {opcoes.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No encontré los productos de oraciones en la base. Revisa la migración 0032.
        </p>
      ) : (
        <AudioUploader modulo={ORACIONES_MODULO} produtos={opcoes} ordemInicial={ordemInicial} />
      )}

      <AudioLista itens={lista} />
    </div>
  )
}

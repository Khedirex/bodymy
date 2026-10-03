import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { AudioUploader } from '@/components/admin/AudioUploader'
import { AudioLista } from '@/components/admin/AudioLista'
import { AudioOrfaos } from '@/components/admin/AudioOrfaos'
import {
  ORACIONES_MODULO,
  ORACIONES_PRODUCT_SLUG,
  ORACIONES_UPSELL_SLUG,
  formatarDuracao,
} from '@/lib/oraciones'
import { NOCHE_MODULO, NOCHE_PRODUCT_SLUG, NOCHE_BLOCOS } from '@/lib/noche'

export const dynamic = 'force-dynamic'

// Cada biblioteca do app: quais produtos liberam e em que blocos ela divide.
const BIBLIOTECAS = {
  [ORACIONES_MODULO]: {
    titulo: 'Oración Milagrosa',
    nota: 'Las primeras vienen en el bump; el resto se desbloquea con la colección completa.',
    produtos: [ORACIONES_PRODUCT_SLUG, ORACIONES_UPSELL_SLUG],
    blocos: [] as { slug: string; nome: string; alvo?: number }[],
  },
  [NOCHE_MODULO]: {
    titulo: 'Ritual Noche Perfecta',
    nota: 'Preparación (3) + Módulo 1 (7) + Módulo 2 (7) forman la secuencia: 17 noches, una por día. Refuerzo y Reset Profundo quedan disponibles fuera de orden.',
    produtos: [NOCHE_PRODUCT_SLUG],
    blocos: NOCHE_BLOCOS.map((b) => ({ slug: b.slug, nome: b.nome, alvo: b.alvo })),
  },
} as const

type ModuloSlug = keyof typeof BIBLIOTECAS

export default async function AdminAudiosPage({
  searchParams,
}: {
  searchParams: { m?: string }
}) {
  const modulo: ModuloSlug =
    searchParams.m === NOCHE_MODULO ? NOCHE_MODULO : ORACIONES_MODULO
  const config = BIBLIOTECAS[modulo]

  const admin = createAdminClient()
  const [{ data: produtos }, { data: audios }] = await Promise.all([
    admin.from('products').select('id, nome, slug').in('slug', config.produtos),
    admin
      .from('audio_biblioteca')
      .select('id, titulo, ordem, bloco, duracao_seg, product_id, storage_path, resgate')
      .eq('modulo', modulo)
      .order('ordem', { ascending: true }),
  ])

  // Arquivos no bucket que não estão no catálogo. Sem esta conferência, um
  // upload que falha no registro vira peso invisível na conta do Storage.
  const { data: noBucket } = await admin.storage
    .from('audios')
    .list(modulo, { limit: 1000, sortBy: { column: 'created_at', order: 'asc' } })

  const noCatalogo = new Set((audios ?? []).map((a) => a.storage_path as string))
  const orfaos = (noBucket ?? [])
    .map((f) => ({
      path: `${modulo}/${f.name}`,
      tamanho: `${Math.round(((f.metadata?.size as number) ?? 0) / 1024)} kB`,
      quando: new Date(f.created_at as string).toLocaleString('es-419', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    }))
    .filter((f) => !noCatalogo.has(f.path))

  const nomePorProduto = new Map((produtos ?? []).map((p) => [p.id as string, p.nome as string]))
  const nomeDoBloco = new Map(config.blocos.map((b) => [b.slug, b.nome]))

  const lista = (audios ?? []).map((a) => ({
    id: a.id as string,
    titulo: a.titulo as string,
    ordem: a.ordem as number,
    duracao: formatarDuracao((a.duracao_seg as number) ?? null),
    produto: nomePorProduto.get(a.product_id as string) ?? '—',
    bloco: nomeDoBloco.get((a.bloco as string) ?? '') ?? null,
    resgate: Boolean(a.resgate),
  }))

  const ordemInicial = lista.reduce((max, a) => Math.max(max, a.ordem), 0)
  const opcoes = (produtos ?? []).map((p) => ({ id: p.id as string, nome: p.nome as string }))

  // Contagem por bloco (ou por produto, quando a biblioteca não tem blocos):
  // é como você enxerga que faltam 3 para fechar o Refuerzo.
  const contagens =
    config.blocos.length > 0
      ? config.blocos.map((b) => ({
          nome: b.nome,
          quantos: (audios ?? []).filter((a) => a.bloco === b.slug).length,
          alvo: b.alvo ?? null,
        }))
      : opcoes.map((p) => ({
          nome: p.nome,
          quantos: lista.filter((a) => a.produto === p.nome).length,
          alvo: null as number | null,
        }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Biblioteca de audios</h1>
        <p className="mt-1 text-sm text-slate-600">
          Los audios viven en un bucket privado y se sirven con enlace firmado de 1 hora — no
          quedan públicos en internet.
        </p>
      </div>

      <nav className="flex gap-2">
        {(Object.keys(BIBLIOTECAS) as ModuloSlug[]).map((m) => (
          <Link
            key={m}
            href={`/admin/audios?m=${m}`}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
              m === modulo
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {BIBLIOTECAS[m].titulo}
          </Link>
        ))}
      </nav>

      <p className="text-sm text-slate-600">{config.nota}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{lista.length}</p>
        </div>
        {contagens.map((c) => (
          <div key={c.nome} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="truncate text-xs text-slate-500">{c.nome}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {c.quantos}
              {c.alvo ? <span className="text-base font-medium text-slate-400">/{c.alvo}</span> : null}
            </p>
          </div>
        ))}
      </div>

      {opcoes.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No encontré los productos de esta biblioteca en la base.
        </p>
      ) : (
        <AudioUploader
          modulo={modulo}
          produtos={opcoes}
          ordemInicial={ordemInicial}
          blocos={config.blocos as { slug: string; nome: string }[]}
        />
      )}

      <AudioOrfaos itens={orfaos} />

      <AudioLista itens={lista} />
    </div>
  )
}

import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveEntitlementProductIds } from '@/lib/entitlements'
import { getCircuitoPrograma, getTrainingConfig } from '@/lib/circuito'
import { CIRCUITO_ACCESS_SLUGS } from '@/lib/training'
import { CISNE_PRODUCT_SLUG, CISNE_DIAS, CISNE_TOTAL_DIAS } from '@/lib/cisne'
import { hasCisneAccess, getCisneEstado } from '@/lib/cisne-server'
import { NOCHE_PRODUCT_SLUG } from '@/lib/noche'
import { ORACIONES_PRODUCT_SLUG, ORACIONES_UPSELL_SLUG } from '@/lib/oraciones'
import { hasNocheAccess, getNocheEstado, getNocheCatalogo } from '@/lib/noche-server'
import { getOracionesCatalogo } from '@/lib/oraciones-server'
import { BIBLIOTECAS } from '@/lib/bibliotecas'
import { getCatalogoBiblioteca } from '@/lib/biblioteca-server'

// =====================================================================
// REGISTRO DE MÓDULOS — a fonte única dos "mini-apps" do BodyMy.
//
// O app é uma plataforma: cada produto comprado abre um módulo próprio,
// com conteúdo e progresso independentes. A Home, a aba "Mis rutinas" e a
// navegação LEEM daqui — nenhuma delas conhece produto por nome.
//
// Para publicar um módulo novo: acrescente uma entrada nesta lista e crie
// a rota dele. Nada mais precisa mudar.
// =====================================================================

/** Como cada módulo reporta "onde a aluna está" — contrato comum da dash. */
export interface EstadoModulo {
  concluidos: number
  total: number
  /** Já cumpriu a tarefa de hoje (o próximo passo abre amanhã). */
  feitoHoje: boolean
  terminado: boolean
  /** Chamada curta do que fazer hoje. Null quando não há nada pendente. */
  chamadaHoje: string | null
}

export interface ModuloBodyMy {
  slug: string
  nome: string
  /** Uma linha, para o card da Home. */
  resumo: string
  href: string
  /** Slugs de PRODUTO que liberam este módulo (SKUs Kiwify/Hotmart). */
  productSlugs: string[]
  emoji: string
  carregarEstado: (userId: string) => Promise<EstadoModulo | null>
}

// ---------------------------------------------------------------------
// Protocolo Descompresión Articular (circuito adaptativo + alongamento)
// ---------------------------------------------------------------------
async function estadoCircuito(userId: string): Promise<EstadoModulo | null> {
  const supabase = createClient()
  const programa = await getCircuitoPrograma(supabase, userId)
  if (!programa) return null
  const config = await getTrainingConfig(supabase, userId, programa.id)
  if (!config) {
    return { concluidos: 0, total: programa.totalDias, feitoHoje: false, terminado: false, chamadaHoje: 'Empieza tu primer día' }
  }
  const concluidos = (config.semana_atual - 1) * 7 + (config.dia_atual - 1)
  return {
    concluidos,
    total: programa.totalDias,
    feitoHoje: false, // o circuito marca conclusão pela sessão do dia
    terminado: concluidos >= programa.totalDias,
    chamadaHoje: `Día ${concluidos + 1} · movilidad + ejercicios`,
  }
}

// ---------------------------------------------------------------------
// Reset Postura de Cisne (diário de 14 noites)
// ---------------------------------------------------------------------
async function estadoCisne(userId: string): Promise<EstadoModulo | null> {
  if (!(await hasCisneAccess(userId))) return null
  const e = await getCisneEstado(userId)
  const dia = e.proximoDia ? CISNE_DIAS[e.proximoDia - 1] : null
  return {
    concluidos: e.concluidos,
    total: CISNE_TOTAL_DIAS,
    feitoHoje: e.feitoHoje,
    terminado: e.terminado,
    chamadaHoje: e.terminado
      ? null
      : e.feitoHoje
        ? null
        : dia
          ? `Día ${e.proximoDia} · ${dia.titulo}`
          : null,
  }
}

// ---------------------------------------------------------------------
// Ritual Noche Perfecta (blocos de 7 noites, catálogo no banco)
// ---------------------------------------------------------------------
async function estadoNoche(userId: string): Promise<EstadoModulo | null> {
  if (!(await hasNocheAccess(userId))) return null
  const [e, catalogo] = await Promise.all([getNocheEstado(userId), getNocheCatalogo()])
  const audio = catalogo.sequencia.find((a) => a.noche === e.proximaNoche) ?? null
  return {
    concluidos: e.concluidas,
    total: e.total,
    feitoHoje: e.feitoHoje,
    terminado: e.terminado,
    chamadaHoje:
      e.terminado || e.feitoHoje || !audio
        ? null
        : `Noche ${e.proximaNoche} · ${audio.titulo}`,
  }
}

// ---------------------------------------------------------------------
// Oración Milagrosa (biblioteca de áudio, sem ordem obrigatória)
//
// Biblioteca não tem "dia X de Y": ela escolhe o que ouvir. Por isso o
// estado traz total 0 — o card da Home mostra a chamada e o botão, sem
// inventar uma barra de progresso que não existe.
// ---------------------------------------------------------------------
async function estadoOraciones(userId: string): Promise<EstadoModulo | null> {
  const { liberados } = await getOracionesCatalogo(userId)
  if (liberados === 0) return null
  return {
    concluidos: 0,
    total: 0,
    feitoHoje: false,
    terminado: false,
    chamadaHoje: `${liberados} ${liberados === 1 ? 'oración' : 'oraciones'} para esta noche`,
  }
}

// ---------------------------------------------------------------------
// O registro
// ---------------------------------------------------------------------
export const MODULOS: ModuloBodyMy[] = [
  {
    slug: 'descompresion-articular',
    nome: 'Descompresión Articular',
    resumo: 'Movilidad + ejercicios que se ajustan a ti',
    href: '/treino',
    productSlugs: CIRCUITO_ACCESS_SLUGS,
    emoji: '🤍',
    carregarEstado: estadoCircuito,
  },
  {
    slug: 'reset-postura-cisne',
    nome: 'Reset Postura de Cisne',
    resumo: '10 minutos en tu cama, antes de dormir',
    href: '/cisne',
    productSlugs: [CISNE_PRODUCT_SLUG],
    emoji: '🦢',
    carregarEstado: estadoCisne,
  },
  {
    slug: 'oracion-milagrosa',
    nome: 'Oración Milagrosa',
    resumo: 'Para escuchar en la cama, con los ojos cerrados',
    href: '/oraciones',
    productSlugs: [ORACIONES_PRODUCT_SLUG, ORACIONES_UPSELL_SLUG],
    emoji: '🙏',
    carregarEstado: estadoOraciones,
  },
  {
    slug: 'ritual-noche-perfecta',
    nome: 'Ritual Noche Perfecta',
    resumo: 'Una noche por día, con los ojos cerrados',
    href: '/noche',
    productSlugs: [NOCHE_PRODUCT_SLUG],
    emoji: '🌙',
    carregarEstado: estadoNoche,
  },
]

// ---------------------------------------------------------------------
// Bibliotecas de áudio → módulos, sem escrever um por um.
//
// Cada linha de src/lib/bibliotecas.ts vira um mini-app em /biblioteca/<slug>.
// Produto de áudio novo não precisa de rota nem de entrada aqui: entra na
// configuração e aparece sozinho na Home, em "Mis rutinas" e no painel.
// ---------------------------------------------------------------------
const MODULOS_DE_BIBLIOTECA: ModuloBodyMy[] = BIBLIOTECAS.map((b) => ({
  slug: b.slug,
  nome: b.nome,
  resumo: b.resumo,
  href: `/biblioteca/${b.slug}`,
  productSlugs: b.productSlugs,
  emoji: b.emoji,
  carregarEstado: async (userId: string) => {
    const { liberados } = await getCatalogoBiblioteca(userId, b.slug)
    // Sem áudio ainda: o card mostra o resumo e leva à tela, que explica
    // que o conteúdo está sendo preparado. É melhor do que sumir.
    if (liberados === 0) return null
    return {
      concluidos: 0,
      total: 0,
      feitoHoje: false,
      terminado: false,
      chamadaHoje: `${liberados} ${liberados === 1 ? 'audio disponible' : 'audios disponibles'}`,
    }
  },
}))

MODULOS.push(...MODULOS_DE_BIBLIOTECA)

export interface ModuloDaAluna {
  modulo: ModuloBodyMy
  estado: EstadoModulo | null
}

/**
 * Os módulos que a aluna REALMENTE tem, já com o estado de hoje.
 *
 * O acesso vem do entitlement (compra), nunca de uma lista fixa na tela.
 * Memorizado por requisição: a Home e a navegação chamam isto no mesmo
 * carregamento.
 */
export const getModulosDaAluna = cache(async (userId: string): Promise<ModuloDaAluna[]> => {
  if (!userId) return []

  const supabase = createClient()
  const ativos = await getActiveEntitlementProductIds(supabase, userId)
  if (ativos.size === 0) return []

  // slug de produto → id, para traduzir o registro em entitlements.
  const admin = createAdminClient()
  const slugs = Array.from(new Set(MODULOS.flatMap((m) => m.productSlugs)))
  const { data: produtos } = await admin.from('products').select('id, slug').in('slug', slugs)
  const idPorSlug = new Map((produtos ?? []).map((p) => [p.slug as string, p.id as string]))

  const liberados = MODULOS.filter((m) =>
    m.productSlugs.some((s) => {
      const id = idPorSlug.get(s)
      return id ? ativos.has(id) : false
    }),
  )

  const estados = await Promise.all(
    liberados.map((m) =>
      m.carregarEstado(userId).catch(() => null as EstadoModulo | null),
    ),
  )

  return liberados.map((modulo, i) => ({ modulo, estado: estados[i] }))
})

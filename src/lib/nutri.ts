import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { userHasEntitlement } from '@/lib/entitlements'
import { getCheckinDates } from '@/lib/queries'
import { calcularStreak } from '@/lib/streak'
import type {
  NutriPerfilDados,
  NutriDietaConteudo,
  ContextoProtocolo,
} from '@/lib/nutri-types'

// =====================================================================
// Nutricionista Online — acesso, trial e gate.
//
// Regra de acesso à experiência (dieta IA + chat):
//   • entitlement ATIVO de 'nutricionista-online' (upsell pago) → 'pago';
//   • senão, trial válido → 'trial' (7 dias A PARTIR DE QUANDO MONTA A DIETA);
//   • senão, trial já usado e vencido → 'expirado' (paywall);
//   • senão (nunca montou a dieta) → 'nenhum' (pode iniciar o trial montando).
//
// Gate do chat: só libera quando a aluna já montou a dieta (perfilCompleto).
//
// Leitura pode usar o client autenticado (RLS dono). Escrita usa o admin.
// =====================================================================

export const NUTRI_PRODUCT_SLUG = 'acompanhamento-diario'
export const NUTRI_TRIAL_DIAS = 7

export type NutriPlano = 'pago' | 'trial' | 'expirado' | 'nenhum'

export interface NutriAcesso {
  plano: NutriPlano
  podeUsar: boolean // acesso ativo agora (pago ou trial válido)
  podeIniciarTrial: boolean // sem plano e sem trial anterior → montar a dieta inicia o trial
  perfilCompleto: boolean
  trialExpiraEm: string | null
  diasRestantes: number | null
}

let _nutriProductId: string | null | undefined
export async function getNutriProductId(): Promise<string | null> {
  if (_nutriProductId !== undefined) return _nutriProductId
  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select('id')
    .eq('slug', NUTRI_PRODUCT_SLUG)
    .maybeSingle()
  _nutriProductId = (data?.id as string) ?? null
  return _nutriProductId
}

function diasRestantes(expiraEm: string): number {
  const ms = new Date(expiraEm).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86_400_000))
}

// Resolve o estado de acesso da aluna. `supabase` deve ser um client que
// enxergue os dados dela (autenticado com RLS, ou admin).
export async function getNutriAccess(
  supabase: SupabaseClient,
  userId: string,
): Promise<NutriAcesso> {
  const productId = await getNutriProductId()

  // Perfil (gate do chat).
  const { data: perfilRow } = await supabase
    .from('nutri_perfil')
    .select('completo')
    .eq('user_id', userId)
    .maybeSingle()
  const perfilCompleto = Boolean(perfilRow?.completo)

  // 1) Pago?
  if (productId && (await userHasEntitlement(supabase, userId, productId))) {
    return {
      plano: 'pago',
      podeUsar: true,
      podeIniciarTrial: false,
      perfilCompleto,
      trialExpiraEm: null,
      diasRestantes: null,
    }
  }

  // 2) Trial?
  const { data: trial } = await supabase
    .from('nutri_trials')
    .select('expira_em')
    .eq('user_id', userId)
    .maybeSingle()

  if (trial?.expira_em) {
    const restantes = diasRestantes(trial.expira_em as string)
    if (restantes > 0) {
      return {
        plano: 'trial',
        podeUsar: true,
        podeIniciarTrial: false,
        perfilCompleto,
        trialExpiraEm: trial.expira_em as string,
        diasRestantes: restantes,
      }
    }
    // Trial vencido e não comprou → bloqueado.
    return {
      plano: 'expirado',
      podeUsar: false,
      podeIniciarTrial: false,
      perfilCompleto,
      trialExpiraEm: trial.expira_em as string,
      diasRestantes: 0,
    }
  }

  // 3) Nunca montou a dieta → pode iniciar o trial montando.
  return {
    plano: 'nenhum',
    podeUsar: false,
    podeIniciarTrial: true,
    perfilCompleto,
    trialExpiraEm: null,
    diasRestantes: null,
  }
}

// Salva o questionário. Se for a primeira vez e a aluna não é paga nem tem
// trial anterior, INICIA o trial de 7 dias agora (é o "montar a dieta").
// Retorna o acesso já atualizado. Usa admin (escrita).
export async function salvarPerfilEIniciarTrial(
  userId: string,
  dados: NutriPerfilDados,
): Promise<NutriAcesso> {
  const admin = createAdminClient()
  const agora = new Date()

  await admin.from('nutri_perfil').upsert(
    {
      user_id: userId,
      dados: dados as unknown as Record<string, unknown>,
      completo: true,
      atualizado_em: agora.toISOString(),
    },
    { onConflict: 'user_id' },
  )

  const acessoAntes = await getNutriAccess(admin, userId)
  if (acessoAntes.podeIniciarTrial) {
    const expira = new Date(agora.getTime() + NUTRI_TRIAL_DIAS * 86_400_000)
    // insert idempotente: se já existir (corrida), mantém o trial existente.
    await admin
      .from('nutri_trials')
      .upsert(
        { user_id: userId, iniciado_em: agora.toISOString(), expira_em: expira.toISOString() },
        { onConflict: 'user_id', ignoreDuplicates: true },
      )
  }

  return getNutriAccess(admin, userId)
}

// Contexto do protocolo para a IA "saber em que dia do desafio a aluna está".
// Depende de user_training_config (semana/dia) e dos check-ins (streak).
export async function getContextoProtocolo(
  supabase: SupabaseClient,
  userId: string,
): Promise<ContextoProtocolo | null> {
  const { data: cfg } = await supabase
    .from('user_training_config')
    .select('semana_atual, dia_atual')
    .eq('user_id', userId)
    .maybeSingle()
  if (!cfg) return null
  const semana = Number(cfg.semana_atual) || 1
  const dia = Number(cfg.dia_atual) || 1
  const diaDoDesafio = (semana - 1) * 7 + dia

  let streak = 0
  try {
    const datas = await getCheckinDates(userId)
    streak = calcularStreak(datas).atual
  } catch {
    /* streak é best-effort */
  }

  return { diaDoDesafio, semana, dia, streak }
}

export async function getNutriPerfil(
  supabase: SupabaseClient,
  userId: string,
): Promise<NutriPerfilDados | null> {
  const { data } = await supabase
    .from('nutri_perfil')
    .select('dados, completo')
    .eq('user_id', userId)
    .maybeSingle()
  if (!data?.completo) return null
  return (data.dados as NutriPerfilDados) ?? null
}

export async function getDietaAtiva(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ conteudo: NutriDietaConteudo; gerada_em: string; retorno_em: string | null } | null> {
  const { data } = await supabase
    .from('nutri_dietas')
    .select('conteudo, gerada_em, retorno_em')
    .eq('user_id', userId)
    .eq('ativa', true)
    .maybeSingle()
  if (!data) return null
  return {
    conteudo: data.conteudo as NutriDietaConteudo,
    gerada_em: data.gerada_em as string,
    retorno_em: (data.retorno_em as string) ?? null,
  }
}

// Substitui a dieta ativa (desativa a anterior, insere a nova como ativa).
export async function salvarDietaGerada(
  userId: string,
  conteudo: NutriDietaConteudo,
  retornoEm: string | null,
): Promise<void> {
  const admin = createAdminClient()
  await admin.from('nutri_dietas').update({ ativa: false }).eq('user_id', userId).eq('ativa', true)
  await admin.from('nutri_dietas').insert({
    user_id: userId,
    conteudo: conteudo as unknown as Record<string, unknown>,
    retorno_em: retornoEm,
    ativa: true,
  })
}

export interface NutriMensagem {
  papel: 'user' | 'assistant'
  conteudo: string
  criado_em?: string
}

export async function getHistorico(
  supabase: SupabaseClient,
  userId: string,
  limite = 100,
): Promise<NutriMensagem[]> {
  const { data } = await supabase
    .from('nutri_mensagens')
    .select('papel, conteudo, criado_em')
    .eq('user_id', userId)
    .order('criado_em', { ascending: true })
    .limit(limite)
  return (data ?? []) as NutriMensagem[]
}

export async function inserirMensagem(
  userId: string,
  papel: 'user' | 'assistant',
  conteudo: string,
): Promise<void> {
  const admin = createAdminClient()
  await admin.from('nutri_mensagens').insert({ user_id: userId, papel, conteudo })
}

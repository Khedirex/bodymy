import 'server-only'
import { serverEnv } from '@/lib/env'
import { captureException } from '@/lib/observability'
import type { NutriPerfilDados, NutriDietaConteudo } from '@/lib/nutri-types'

// =====================================================================
// Cliente do n8n — a "IA" do Nutricionista Online vive lá (sem limite de
// requisição da nossa parte). NUNCA é chamado do browser: só destas funções
// de servidor, depois que a rota /api/nutri/* já validou acesso/trial.
//
// Contrato (2 webhooks no n8n, protegidos por Authorization: Bearer):
//
//   POST {N8N_BASE_URL}/gerar-dieta
//     req:  { userId, perfil: NutriPerfilDados }
//     res:  { dieta: NutriDietaConteudo, retorno_em?: string(ISO) }
//
//   POST {N8N_BASE_URL}/chat
//     req:  { userId, mensagem, historico: {papel,conteudo}[], perfil, dieta }
//     res:  { resposta: string }
//
// Se N8N_BASE_URL/API_KEY não estiverem configurados, as funções lançam um
// erro claro (a rota traduz para 503 "servicio no disponible").
// =====================================================================

export class N8nNaoConfigurado extends Error {
  constructor() {
    super('N8N_BASE_URL/N8N_API_KEY não configurados')
    this.name = 'N8nNaoConfigurado'
  }
}

function assertConfigurado(): { baseUrl: string; apiKey: string } {
  const baseUrl = serverEnv.n8nBaseUrl
  const apiKey = serverEnv.n8nApiKey
  if (!baseUrl || !apiKey) throw new N8nNaoConfigurado()
  return { baseUrl, apiKey }
}

async function postN8n<T>(path: string, body: unknown): Promise<T> {
  const { baseUrl, apiKey } = assertConfigurado()
  const url = `${baseUrl}${path}`

  // Timeout defensivo — a IA pode demorar, mas não deixamos pendurar a rota.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
    })
    if (!res.ok) {
      const texto = await res.text().catch(() => '')
      throw new Error(`n8n ${path} respondeu ${res.status}: ${texto.slice(0, 300)}`)
    }
    return (await res.json()) as T
  } catch (err) {
    captureException(err, { fn: 'postN8n', path })
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export interface GerarDietaResposta {
  dieta: NutriDietaConteudo
  retorno_em?: string
}

// Gera a dieta mensal personalizada a partir do questionário.
export async function gerarDietaN8n(
  userId: string,
  perfil: NutriPerfilDados,
): Promise<GerarDietaResposta> {
  return postN8n<GerarDietaResposta>('/gerar-dieta', { userId, perfil })
}

export interface ChatN8nResposta {
  resposta: string
}

// Uma pergunta no chat, com o contexto necessário para a IA responder bem.
export async function chatN8n(params: {
  userId: string
  mensagem: string
  historico: { papel: 'user' | 'assistant'; conteudo: string }[]
  perfil: NutriPerfilDados | null
  dieta: NutriDietaConteudo | null
}): Promise<ChatN8nResposta> {
  return postN8n<ChatN8nResposta>('/chat', params)
}

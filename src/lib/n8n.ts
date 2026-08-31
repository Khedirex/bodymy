import 'server-only'
import { serverEnv } from '@/lib/env'
import { captureException } from '@/lib/observability'
import type {
  NutriPerfilDados,
  NutriDietaConteudo,
  ContextoProtocolo,
} from '@/lib/nutri-types'

// =====================================================================
// Cliente do n8n — a "IA" da Asistente de Acompañamiento vive lá (sem limite
// de requisição da nossa parte). NUNCA é chamada do browser: só destas funções
// de servidor, depois que a rota /api/nutri/* já validou acesso/trial.
//
// A assistente é o acompanhamento diário do protocolo: sabe em que dia do
// desafio a aluna está (contexto), adapta a sessão (dor/sono), fala de calores
// e ansiedade e orienta a alimentação como APOIO ao estímulo hormonal — não
// prescreve dieta.
//
// Contrato (2 webhooks no n8n, protegidos por Authorization: Bearer):
//
//   POST {N8N_BASE_URL}/plano
//     req:  { userId, perfil: NutriPerfilDados, contexto: ContextoProtocolo|null }
//     res:  { plano: NutriDietaConteudo, retorno_em?: string(ISO) }
//
//   POST {N8N_BASE_URL}/chat
//     req:  { userId, mensagem, historico: {papel,conteudo}[], perfil, plano, contexto }
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

export interface GerarPlanoResposta {
  plano: NutriDietaConteudo
  retorno_em?: string
}

// Gera o plano de apoio (orientação alimentar) a partir do questionário +
// contexto do protocolo.
export async function gerarPlanoN8n(
  userId: string,
  perfil: NutriPerfilDados,
  contexto: ContextoProtocolo | null,
): Promise<GerarPlanoResposta> {
  return postN8n<GerarPlanoResposta>('/plano', { userId, perfil, contexto })
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
  plano: NutriDietaConteudo | null
  contexto: ContextoProtocolo | null
}): Promise<ChatN8nResposta> {
  return postN8n<ChatN8nResposta>('/chat', params)
}

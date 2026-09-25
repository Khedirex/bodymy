// =====================================================================
// Flags de produto. São constantes de build: mudar aqui exige deploy.
// =====================================================================

/**
 * Assistente Sofía (acompanhamento diário + plano de apoio).
 *
 * Depende dos webhooks do n8n (N8N_BASE_URL / N8N_API_KEY). Sem eles o chat
 * responde "servicio no disponible" e o questionário não gera plano — ou
 * seja, a aluna entraria num beco sem saída.
 *
 * Com a flag desligada, as portas de entrada somem (aba da tab bar, pop-up
 * de 7 dias e atalho da Home) e /sofia mostra um aviso de "em breve".
 * O backend, as rotas e as tabelas seguem intactos: basta ligar de novo.
 */
export const SOFIA_ATIVA = false

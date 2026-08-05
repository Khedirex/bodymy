import { diffDays, todayISO } from '@/lib/dates'

// =====================================================================
// Streak = dias consecutivos com pelo menos 1 check-in de qualquer tipo.
// Calculado no fuso America/Sao_Paulo (as datas de check-in já são
// gravadas nesse fuso via todayISO()).
// =====================================================================

export interface StreakResult {
  atual: number
  recorde: number
  /** true se já houve check-in hoje (útil para o card "Hoje"). */
  fezHoje: boolean
}

/**
 * Recebe as datas ISO (YYYY-MM-DD) em que houve ao menos um check-in
 * (podem vir repetidas/desordenadas) e devolve streak atual e recorde.
 */
export function calcularStreak(datasCheckin: string[], hoje = todayISO()): StreakResult {
  const dias = Array.from(new Set(datasCheckin)).sort() // ascendente, únicos
  if (dias.length === 0) return { atual: 0, recorde: 0, fezHoje: false }

  // Recorde: maior sequência de dias consecutivos em toda a história.
  let recorde = 1
  let corrente = 1
  for (let i = 1; i < dias.length; i++) {
    if (diffDays(dias[i], dias[i - 1]) === 1) {
      corrente += 1
    } else {
      corrente = 1
    }
    if (corrente > recorde) recorde = corrente
  }

  // Streak atual: conta para trás a partir de hoje (ou ontem, se ainda
  // não houve check-in hoje — não quebramos a sequência antes do fim do dia).
  const set = new Set(dias)
  const fezHoje = set.has(hoje)

  let ancora = hoje
  if (!fezHoje) {
    // Se não fez hoje mas fez ontem, o streak ainda está vivo até o fim do dia.
    const ontem = shift(hoje, -1)
    if (!set.has(ontem)) {
      return { atual: 0, recorde, fezHoje }
    }
    ancora = ontem
  }

  let atual = 0
  let cursor = ancora
  while (set.has(cursor)) {
    atual += 1
    cursor = shift(cursor, -1)
  }

  return { atual, recorde, fezHoje }
}

function shift(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + delta))
  return date.toISOString().slice(0, 10)
}

import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'

// Todo o cálculo de datas do app usa o fuso de São Paulo — é o "dia"
// que a usuária percebe (check-ins, streak, cardápio do dia).
export const APP_TZ = 'America/Sao_Paulo'

/** Data de hoje (America/Sao_Paulo) no formato YYYY-MM-DD. */
export function todayISO(now: Date = new Date()): string {
  return formatInTimeZone(now, APP_TZ, 'yyyy-MM-dd')
}

/** Converte um Date para o horário-parede de São Paulo. */
export function toAppZone(date: Date): Date {
  return toZonedTime(date, APP_TZ)
}

/** Formata uma data ISO (YYYY-MM-DD) de forma amigável em pt-BR. */
export function formatDataBR(iso: string, pattern = "d 'de' MMMM"): string {
  // Interpreta como data local (sem timezone) para evitar shift de dia.
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return formatInTimeZone(date, 'UTC', pattern, { locale: ptBR })
}

function isoToUTC(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Diferença em dias inteiros entre duas datas ISO (a - b). */
export function diffDays(aISO: string, bISO: string): number {
  return Math.round((isoToUTC(aISO) - isoToUTC(bISO)) / 86_400_000)
}

/** Retorna a data ISO deslocada em N dias. */
export function addDaysISO(iso: string, delta: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + delta))
  return date.toISOString().slice(0, 10)
}

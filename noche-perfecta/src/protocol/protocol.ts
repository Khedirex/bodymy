// =====================================================================
// Ritual Noche Perfecta — motor do protocolo (módulo PURO).
//
// Todas as regras de avanço vivem aqui. A interface só lê o estado e o
// que `getView()` devolve, e altera o estado só pelas funções exportadas.
// Nenhuma função lê o relógio sozinha: `now` sempre vem de fora (o modo
// ?debug=1 simula datas passando outro `now`).
// =====================================================================

export type Level = 'leve' | 'moderada' | 'severa'
export type Phase = 'reconfiguracion' | 'fijacion' | 'mantenimiento'
export type AudioId = 'vn1' | 'vn2' | 'vn3' | 'vn4' | 'vn5' | 'vn6' | 'vn7'

export const TOTAL_NIGHTS = 14
export const BLOCK_SIZE = 7
export const MISSED_NIGHT_HOURS = 36
export const COMPLETE_RATIO = 0.8 // sair com > 80 % ouvido conta como concluída
export const SEVERA_DOUBLE_UNTIL = 4 // noches 1–4 tocam 2 vezes no nível Severa
export const RESCUE_AUDIO: AudioId = 'vn5'
export const MAINTENANCE_AUDIOS: AudioId[] = ['vn1', 'vn3', 'vn6']
export const RELAPSE_BAD_LOGS = 3
export const BAD_WAKE_SCORE = 2 // nota 1–2 = noite ruim
// Uma "noite" pertence à data em que começou: até o meio-dia ainda é a noite anterior.
const NIGHT_DAY_START_HOUR = 12
// A Bitácora é "de manhã": o aviso aparece a partir das 5h do dia seguinte.
export const MORNING_HOUR = 5
export const MIN_HOURS_BEFORE_LOG = 4 // ritual de madrugada: espera ao menos 4 h

export interface NightRecord {
  night: number // 1–14
  audio: AudioId
  completedAt: string // ISO
  fellAsleep: boolean | null // null = pergunta ainda pendente
  repeat: boolean // foi a repetição da Regla de las 2 noches
  cycle: number // 1 = primeira volta; +1 a cada protocolo de recaída
}

export interface SleepLog {
  night: number // 0–14; 15 = noite de manutenção
  date: string // YYYY-MM-DD da noite a que se refere
  bedTime: string // "23:10"
  minutesToSleep: 5 | 15 | 30 | 60
  awakenings: 0 | 1 | 2 | 3 // 3 = "3+"
  wakeScore: 1 | 2 | 3 | 4 | 5
}

// As 3 perguntas do checkpoint (1–5): tardanza, despertares, energía.
export interface CheckpointAnswers {
  tardanza: number
  despertares: number
  energia: number
  cambio?: string // só na noche 14: "Lo que más cambió"
}

export interface MaintenancePlay {
  audio: AudioId
  completedAt: string
}

export interface State {
  version: 1
  onboardingDone: boolean
  level: Level
  startHour: string // "22:30"
  closingPhrase: string
  presetDone: boolean
  currentNight: number // 0 = Noche Cero
  phase: Phase
  consecutiveNoSleep: number
  repeatNext: boolean // a próxima noite repete o áudio (Regla de las 2 noches)
  cycle: number
  nights: NightRecord[]
  logs: SleepLog[]
  checkpoints: { '0'?: CheckpointAnswers; '7'?: CheckpointAnswers; '14'?: CheckpointAnswers }
  rescues: string[]
  maintenancePlays: MaintenancePlay[]
  relapseDismissedAt: number // nº de logs quando a proposta de recaída foi recusada
  notifications: boolean
}

export function initialState(): State {
  return {
    version: 1,
    onboardingDone: false,
    level: 'leve',
    startHour: '22:30',
    closingPhrase: '',
    presetDone: false,
    currentNight: 0,
    phase: 'reconfiguracion',
    consecutiveNoSleep: 0,
    repeatNext: false,
    cycle: 1,
    nights: [],
    logs: [],
    checkpoints: {},
    rescues: [],
    maintenancePlays: [],
    relapseDismissedAt: -1,
    notifications: false,
  }
}

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------
export function audioForNight(night: number): AudioId {
  const i = ((Math.max(1, night) - 1) % BLOCK_SIZE) + 1
  return `vn${i}` as AudioId
}

export function phaseForNight(night: number): Phase {
  return night <= BLOCK_SIZE ? 'reconfiguracion' : 'fijacion'
}

/** Data (YYYY-MM-DD, hora local) da noite a que um instante pertence. */
export function nightDate(d: Date): string {
  const x = new Date(d.getTime() - NIGHT_DAY_START_HOUR * 3600_000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`
}

/** Manhã seguinte à noite em que `completedAt` aconteceu (5h, hora local). */
export function morningAfter(completedAt: Date): Date {
  const [y, m, d] = nightDate(completedAt).split('-').map(Number)
  return new Date(y, m - 1, d + 1, MORNING_HOUR, 0)
}

function cycleNights(s: State): NightRecord[] {
  return s.nights.filter((n) => n.cycle === s.cycle)
}

function lastNightRecord(s: State): NightRecord | undefined {
  const c = cycleNights(s)
  return c[c.length - 1]
}

/** Repetições de cada áudio nesta noite (Severa nas noches 1–4 = 2). */
export function playsForNight(s: State, night: number): 1 | 2 {
  return s.level === 'severa' && night >= 1 && night <= SEVERA_DOUBLE_UNTIL ? 2 : 1
}

/** A Regla de las 2 noches só vale para Moderada e Severa. */
export function twoNightRuleActive(level: Level): boolean {
  return level === 'moderada' || level === 'severa'
}

/** "Repetir hasta que yo lo pare": só no Modo Rescate e em manutenção. */
export function canLoopUntilStopped(mode: 'ritual' | 'rescate', phase: Phase): boolean {
  return mode === 'rescate' || phase === 'mantenimiento'
}

/** Sair do player com mais de 80 % ouvido conta como noite concluída. */
export function countsAsComplete(listenedRatio: number): boolean {
  return listenedRatio > COMPLETE_RATIO
}

/** Fora da janela de 30 min só orienta (nunca trava o play). */
export function isInsideWindow(startHour: string, now: Date): boolean {
  const [h, m] = startHour.split(':').map(Number)
  const start = h * 60 + m
  let cur = now.getHours() * 60 + now.getMinutes()
  if (cur < start - 12 * 60) cur += 24 * 60 // depois da meia-noite
  return cur >= start && cur <= start + 30
}

// ---------------------------------------------------------------------
// Visão derivada (o que a tela Hoy mostra)
// ---------------------------------------------------------------------
export type TodayStatus =
  | 'onboarding' // ainda no onboarding
  | 'preset' // Noche Cero: falta o preset
  | 'first-log' // Noche Cero: falta a primeira bitácora
  | 'answer-pending' // falta responder "¿Te dormiste?" da última noite
  | 'ready' // pode fazer o ritual de hoje
  | 'done-today' // já fez a noite de hoje; a próxima abre amanhã
  | 'maintenance'

export interface View {
  status: TodayStatus
  night: number // noite atual (0–14)
  audio: AudioId | null
  phase: Phase
  plays: 1 | 2
  isRepeat: boolean // hoje repete o áudio (Regla de las 2 noches)
  missedNight: boolean // > 36 h sem concluir → "Retomas desde donde quedaste"
  pendingAnswerNight: number | null
  pendingLogNight: number | null // noite concluída ainda sem bitácora
  pendingCheckpoint: 7 | 14 | null
  proposeRelapse: boolean
  completed: number // noites concluídas no ciclo (0–14)
  maintenanceSuggestion: AudioId // próximo da sequência VN1 → VN3 → VN6
}

export function getView(s: State, now: Date): View {
  const last = lastNightRecord(s)
  const pendingAnswerNight = last && last.fellAsleep === null ? last.night : null
  const completedNights = new Set(cycleNights(s).map((n) => n.night))
  const completed = completedNights.size

  let pendingLogNight: number | null = null
  if (last) {
    const has = s.logs.some((l) => l.night === last.night && l.date === nightDate(new Date(last.completedAt)))
    const done = new Date(last.completedAt)
    const desde = Math.max(morningAfter(done).getTime(), done.getTime() + MIN_HOURS_BEFORE_LOG * 3600_000)
    if (!has && now.getTime() >= desde) pendingLogNight = last.night
  }

  let pendingCheckpoint: 7 | 14 | null = null
  if (completedNights.has(7) && !s.checkpoints['7']) pendingCheckpoint = 7
  else if (completedNights.has(14) && !s.checkpoints['14']) pendingCheckpoint = 14

  const missedNight =
    !!last &&
    s.phase !== 'mantenimiento' &&
    now.getTime() - new Date(last.completedAt).getTime() > MISSED_NIGHT_HOURS * 3600_000

  const maintenanceSuggestion =
    MAINTENANCE_AUDIOS[s.maintenancePlays.length % MAINTENANCE_AUDIOS.length]

  const base = {
    night: s.currentNight,
    phase: s.phase,
    plays: playsForNight(s, s.currentNight),
    isRepeat: s.repeatNext,
    missedNight,
    pendingAnswerNight,
    pendingLogNight,
    pendingCheckpoint,
    proposeRelapse: shouldProposeRelapse(s),
    completed,
    maintenanceSuggestion,
  }

  if (!s.onboardingDone) return { ...base, status: 'onboarding', audio: null }
  if (s.phase === 'mantenimiento') return { ...base, status: 'maintenance', audio: maintenanceSuggestion, plays: 1 }
  if (s.currentNight === 0) {
    return { ...base, status: s.presetDone ? 'first-log' : 'preset', audio: null }
  }
  if (pendingAnswerNight !== null) {
    return { ...base, status: 'answer-pending', audio: audioForNight(s.currentNight) }
  }
  // Uma noite nova por data.
  const doneToday = !!last && nightDate(new Date(last.completedAt)) === nightDate(now)
  return {
    ...base,
    status: doneToday ? 'done-today' : 'ready',
    audio: audioForNight(s.currentNight),
  }
}

/** Qual áudio pode tocar como RITUAL agora (os outros ficam com cadeado). */
export function isAudioUnlocked(s: State, audio: AudioId, now: Date): boolean {
  if (s.phase === 'mantenimiento') return true
  const v = getView(s, now)
  return v.status === 'ready' && v.audio === audio
}

// ---------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------
export function completeOnboarding(s: State, level: Level, startHour: string): State {
  return { ...s, onboardingDone: true, level, startHour }
}

export function completePreset(s: State, closingPhrase: string): State {
  return { ...s, presetDone: true, closingPhrase }
}

/**
 * Salva a bitácora. A da noche 0 (com o preset feito) desbloqueia a noche 1.
 * Em manutenção, a bitácora alimenta o protocolo de recaída.
 */
export function saveLog(s: State, log: SleepLog): State {
  const logs = [...s.logs.filter((l) => !(l.night === log.night && l.date === log.date)), log]
  let next: State = { ...s, logs }
  if (s.currentNight === 0 && log.night === 0 && s.presetDone && s.onboardingDone) {
    next = { ...next, currentNight: 1, phase: 'reconfiguracion' }
  }
  return next
}

export function saveCheckpoint(s: State, which: 0 | 7 | 14, answers: CheckpointAnswers): State {
  return { ...s, checkpoints: { ...s.checkpoints, [String(which)]: answers } }
}

/**
 * Marca a noite atual como concluída (fim do áudio ou saída com > 80 %).
 * Não avança ainda: o avanço depende da resposta "¿Te dormiste?".
 */
export function completeNight(s: State, now: Date): State {
  const v = getView(s, now)
  if (v.status !== 'ready') return s
  const rec: NightRecord = {
    night: s.currentNight,
    audio: audioForNight(s.currentNight),
    completedAt: now.toISOString(),
    fellAsleep: null,
    repeat: s.repeatNext,
    cycle: s.cycle,
  }
  return { ...s, nights: [...s.nights, rec], repeatNext: false }
}

/**
 * Resposta "¿Te dormiste durante el audio?" da última noite concluída.
 * - Regla de las 2 noches (Moderada/Severa): 2 "No" seguidos → a noite
 *   seguinte repete o mesmo áudio (o calendário não avança).
 * - Noche 14 respondida → entra em manutenção.
 */
export function answerFellAsleep(s: State, fellAsleep: boolean): State {
  const last = lastNightRecord(s)
  if (!last || last.fellAsleep !== null) return s
  const nights = s.nights.map((n) => (n === last ? { ...n, fellAsleep } : n))

  let consecutiveNoSleep = fellAsleep ? 0 : s.consecutiveNoSleep + 1
  let repeatNext = false
  if (twoNightRuleActive(s.level) && consecutiveNoSleep >= 2) {
    repeatNext = true
    consecutiveNoSleep = 0
  }

  let currentNight = s.currentNight
  let phase = s.phase
  if (repeatNext) {
    // mesma noite, mesmo áudio
  } else if (s.currentNight >= TOTAL_NIGHTS || (isRelapseCycle(s) && s.currentNight >= BLOCK_SIZE)) {
    phase = 'mantenimiento'
  } else {
    currentNight = s.currentNight + 1
    phase = phaseForNight(currentNight)
  }
  return { ...s, nights, consecutiveNoSleep, repeatNext, currentNight, phase }
}

/** Modo Rescate: toca VN5 a qualquer hora, sem avançar nem mexer no calendário. */
export function addRescue(s: State, now: Date): State {
  return { ...s, rescues: [...s.rescues, now.toISOString()] }
}

/** Uma noite de manutenção ouvida (não mexe no calendário de 14 noites). */
export function completeMaintenancePlay(s: State, audio: AudioId, now: Date): State {
  if (s.phase !== 'mantenimiento') return s
  return { ...s, maintenancePlays: [...s.maintenancePlays, { audio, completedAt: now.toISOString() }] }
}

/** Em manutenção, 3 bitácoras ruins seguidas (nota 1–2) → propor recaída. */
export function shouldProposeRelapse(s: State): boolean {
  if (s.phase !== 'mantenimiento') return false
  if (s.logs.length <= s.relapseDismissedAt) return false
  const maint = s.logs.filter((l) => l.night === 15)
  if (maint.length < RELAPSE_BAD_LOGS) return false
  return maint.slice(-RELAPSE_BAD_LOGS).every((l) => l.wakeScore <= BAD_WAKE_SCORE)
}

/** Aceitar a recaída: reinicia SÓ o bloco de Reconfiguración (noches 1–7). */
export function acceptRelapse(s: State): State {
  return {
    ...s,
    phase: 'reconfiguracion',
    currentNight: 1,
    consecutiveNoSleep: 0,
    repeatNext: false,
    cycle: s.cycle + 1,
    checkpoints: { '0': s.checkpoints['0'] },
  }
}

/**
 * Depois da recaída, ao fechar a noche 7 a pessoa volta à manutenção
 * (o PDF: "Repite las noches 1 a 7 y luego vuelve al mantenimiento").
 */
export function isRelapseCycle(s: State): boolean {
  return s.cycle > 1
}

export function dismissRelapse(s: State): State {
  return { ...s, relapseDismissedAt: s.logs.length }
}

/** Reinício completo (Ajustes): volta à Noche Cero, mantendo só as preferências. */
export function fullReset(s: State): State {
  return { ...initialState(), notifications: s.notifications }
}

// ---------------------------------------------------------------------
// Persistência (JSON) — validação mínima para o import
// ---------------------------------------------------------------------
export function parseState(raw: unknown): State | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Partial<State>
  if (o.version !== 1 || typeof o.currentNight !== 'number' || !Array.isArray(o.nights)) return null
  return { ...initialState(), ...o } as State
}

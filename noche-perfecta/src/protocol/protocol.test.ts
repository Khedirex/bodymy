import { describe, it, expect } from 'vitest'
import {
  initialState,
  completeOnboarding,
  completePreset,
  saveLog,
  completeNight,
  answerFellAsleep,
  addRescue,
  getView,
  isAudioUnlocked,
  playsForNight,
  saveCheckpoint,
  acceptRelapse,
  dismissRelapse,
  completeMaintenancePlay,
  fullReset,
  countsAsComplete,
  canLoopUntilStopped,
  isInsideWindow,
  audioForNight,
  nightDate,
  parseState,
  type Level,
  type State,
  type SleepLog,
} from './protocol'

// Noite N começa às 22:30 do dia (base + N dias).
const BASE = new Date(2026, 9, 1, 22, 30)
const at = (dayOffset: number, h = 22, m = 30) =>
  new Date(BASE.getFullYear(), BASE.getMonth(), BASE.getDate() + dayOffset, h, m)

function log(night: number, when: Date, wakeScore: SleepLog['wakeScore'] = 4): SleepLog {
  return { night, date: nightDate(when), bedTime: '22:30', minutesToSleep: 15, awakenings: 1, wakeScore }
}

function started(level: Level = 'leve'): State {
  let s = completeOnboarding(initialState(), level, '22:30')
  s = completePreset(s, 'Por hoy, ya está')
  return saveLog(s, log(0, at(0)))
}

/** Faz a noite atual no dia `day` e responde a pergunta. */
function doNight(s: State, day: number, fellAsleep = true): State {
  return answerFellAsleep(completeNight(s, at(day)), fellAsleep)
}

describe('Noche Cero', () => {
  it('começa no onboarding e só libera a noche 1 com preset + primeira bitácora', () => {
    let s = initialState()
    expect(getView(s, at(0)).status).toBe('onboarding')
    s = completeOnboarding(s, 'leve', '22:30')
    expect(getView(s, at(0)).status).toBe('preset')
    // bitácora antes do preset não libera
    expect(saveLog(s, log(0, at(0))).currentNight).toBe(0)
    s = completePreset(s, 'Por hoy, ya está')
    expect(getView(s, at(0)).status).toBe('first-log')
    expect(getView(s, at(0)).audio).toBeNull()
    s = saveLog(s, log(0, at(0)))
    expect(s.currentNight).toBe(1)
    const v = getView(s, at(1))
    expect(v.status).toBe('ready')
    expect(v.audio).toBe('vn1')
  })
})

describe('avanço normal 0 → 14', () => {
  it('percorre VN1→VN7 duas vezes, em Reconfiguración e Fijación, e entra em manutenção', () => {
    let s = started()
    const audios: string[] = []
    for (let n = 1; n <= 14; n++) {
      const v = getView(s, at(n))
      expect(v.status).toBe('ready')
      expect(v.night).toBe(n)
      expect(v.phase).toBe(n <= 7 ? 'reconfiguracion' : 'fijacion')
      audios.push(v.audio!)
      s = doNight(s, n)
    }
    expect(audios).toEqual([
      'vn1', 'vn2', 'vn3', 'vn4', 'vn5', 'vn6', 'vn7',
      'vn1', 'vn2', 'vn3', 'vn4', 'vn5', 'vn6', 'vn7',
    ])
    expect(s.phase).toBe('mantenimiento')
    expect(getView(s, at(15)).status).toBe('maintenance')
  })

  it('libera só uma noite nova por data', () => {
    let s = started()
    s = doNight(s, 1)
    expect(getView(s, at(1, 23, 50)).status).toBe('done-today')
    // depois da meia-noite ainda é a mesma noite
    expect(getView(s, at(2, 2, 0)).status).toBe('done-today')
    expect(getView(s, at(2)).status).toBe('ready')
    // completeNight não faz nada se não estiver 'ready'
    expect(completeNight(s, at(1, 23, 55))).toBe(s)
  })

  it('a pergunta pendente bloqueia a noite seguinte até ser respondida', () => {
    let s = started()
    s = completeNight(s, at(1))
    const v = getView(s, at(2))
    expect(v.status).toBe('answer-pending')
    expect(v.pendingAnswerNight).toBe(1)
    expect(s.currentNight).toBe(1)
    s = answerFellAsleep(s, true)
    expect(getView(s, at(2)).status).toBe('ready')
    expect(s.currentNight).toBe(2)
  })

  it('a ordem é travada: só o áudio da noite atual está liberado', () => {
    const s = started()
    expect(isAudioUnlocked(s, 'vn1', at(1))).toBe(true)
    for (const a of ['vn2', 'vn3', 'vn4', 'vn5', 'vn6', 'vn7'] as const) {
      expect(isAudioUnlocked(s, a, at(1))).toBe(false)
    }
  })
})

describe('Bitácora de la mañana', () => {
  it('o aviso só aparece na manhã seguinte e some ao salvar', () => {
    let s = doNight(started(), 1)
    expect(getView(s, at(1, 23, 40)).pendingLogNight).toBeNull()
    expect(getView(s, at(2, 3, 0)).pendingLogNight).toBeNull()
    expect(getView(s, at(2, 7, 0)).pendingLogNight).toBe(1)
    s = saveLog(s, log(1, at(1)))
    expect(getView(s, at(2, 7, 0)).pendingLogNight).toBeNull()
  })

  it('ritual feito de madrugada: o aviso espera ao menos 4 h', () => {
    let s = started()
    s = answerFellAsleep(completeNight(s, at(2, 5, 30)), true) // noche 1 às 5h30
    expect(getView(s, at(2, 6, 0)).pendingLogNight).toBeNull()
    expect(getView(s, at(2, 9, 31)).pendingLogNight).toBe(1)
  })
})

describe('Regla de las 2 noches', () => {
  it('Moderada: 2 "No" seguidos → a noite seguinte repete o mesmo áudio', () => {
    let s = started('moderada')
    s = doNight(s, 1, false) // VN1, não dormiu
    expect(s.currentNight).toBe(2)
    s = doNight(s, 2, false) // VN2, não dormiu (2º seguido)
    expect(s.currentNight).toBe(2) // não avança
    const v = getView(s, at(3))
    expect(v.audio).toBe('vn2')
    expect(v.isRepeat).toBe(true)
    s = doNight(s, 3, false) // repetição; contador recomeçou
    expect(s.nights[s.nights.length - 1].repeat).toBe(true)
    expect(s.currentNight).toBe(3) // avança depois da repetição
  })

  it('um "Sí" no meio zera a contagem', () => {
    let s = started('severa')
    s = doNight(s, 1, false)
    s = doNight(s, 2, true)
    s = doNight(s, 3, false)
    expect(s.currentNight).toBe(4)
  })

  it('Leve não aplica a regra', () => {
    let s = started('leve')
    s = doNight(s, 1, false)
    s = doNight(s, 2, false)
    expect(s.currentNight).toBe(3)
    expect(s.repeatNext).toBe(false)
  })
})

describe('Severa', () => {
  it('toca 2 vezes nas noches 1–4 e 1 vez a partir da 5', () => {
    const s = started('severa')
    expect([1, 2, 3, 4].map((n) => playsForNight(s, n))).toEqual([2, 2, 2, 2])
    expect([5, 8, 14].map((n) => playsForNight(s, n))).toEqual([1, 1, 1])
    expect(getView(s, at(1)).plays).toBe(2)
  })

  it('Leve e Moderada nunca tocam 2 vezes', () => {
    expect(playsForNight(started('leve'), 1)).toBe(1)
    expect(playsForNight(started('moderada'), 1)).toBe(1)
  })
})

describe('Modo Rescate', () => {
  it('registra o rescate sem avançar nem mexer no calendário', () => {
    let s = started()
    s = doNight(s, 1)
    const before = { night: s.currentNight, nights: s.nights.length, phase: s.phase }
    s = addRescue(s, at(2, 3, 10))
    expect(s.rescues).toHaveLength(1)
    expect({ night: s.currentNight, nights: s.nights.length, phase: s.phase }).toEqual(before)
    expect(getView(s, at(2)).status).toBe('ready')
  })

  it('"Repetir hasta que yo lo pare" só no rescate e em manutenção', () => {
    expect(canLoopUntilStopped('rescate', 'reconfiguracion')).toBe(true)
    expect(canLoopUntilStopped('ritual', 'fijacion')).toBe(false)
    expect(canLoopUntilStopped('ritual', 'mantenimiento')).toBe(true)
  })
})

describe('noche perdida', () => {
  it('após > 36 h avisa e mantém a mesma noite (nunca volta)', () => {
    let s = started()
    s = doNight(s, 1)
    s = doNight(s, 2)
    expect(getView(s, at(3)).missedNight).toBe(false)
    const v = getView(s, at(5)) // pulou 2 noites
    expect(v.missedNight).toBe(true)
    expect(v.night).toBe(3)
    expect(v.audio).toBe('vn3')
    expect(v.status).toBe('ready')
  })
})

describe('checkpoints', () => {
  it('pede o checkpoint ao concluir as noches 7 e 14', () => {
    let s = started()
    for (let n = 1; n <= 7; n++) s = doNight(s, n)
    expect(getView(s, at(8)).pendingCheckpoint).toBe(7)
    s = saveCheckpoint(s, 7, { tardanza: 4, despertares: 3, energia: 4 })
    expect(getView(s, at(8)).pendingCheckpoint).toBeNull()
    for (let n = 8; n <= 14; n++) s = doNight(s, n)
    expect(getView(s, at(15)).pendingCheckpoint).toBe(14)
  })
})

describe('manutenção e recaída', () => {
  function inMaintenance(): State {
    let s = started()
    for (let n = 1; n <= 14; n++) s = doNight(s, n)
    return s
  }

  it('libera todos os áudios e sugere VN1 → VN3 → VN6', () => {
    let s = inMaintenance()
    for (const a of ['vn1', 'vn2', 'vn3', 'vn4', 'vn5', 'vn6', 'vn7'] as const) {
      expect(isAudioUnlocked(s, a, at(15))).toBe(true)
    }
    expect(getView(s, at(15)).maintenanceSuggestion).toBe('vn1')
    s = completeMaintenancePlay(s, 'vn1', at(15))
    expect(getView(s, at(16)).maintenanceSuggestion).toBe('vn3')
    s = completeMaintenancePlay(s, 'vn3', at(17))
    expect(getView(s, at(18)).maintenanceSuggestion).toBe('vn6')
  })

  it('3 bitácoras ruins seguidas → propõe recaída; aceitar reinicia só a Reconfiguración', () => {
    let s = inMaintenance()
    s = saveLog(s, log(15, at(15), 2))
    s = saveLog(s, log(15, at(16), 1))
    expect(getView(s, at(17)).proposeRelapse).toBe(false)
    s = saveLog(s, log(15, at(17), 2))
    expect(getView(s, at(18)).proposeRelapse).toBe(true)

    s = acceptRelapse(s)
    expect(s.phase).toBe('reconfiguracion')
    expect(s.currentNight).toBe(1)
    expect(s.checkpoints['0']).toEqual(undefined) // baseline não foi salvo neste teste
    expect(getView(s, at(18)).audio).toBe('vn1')
    // o histórico do primeiro ciclo continua guardado
    expect(s.nights.filter((n) => n.cycle === 1)).toHaveLength(14)

    for (let n = 1; n <= 7; n++) s = doNight(s, 18 + n)
    expect(s.phase).toBe('mantenimiento') // depois das noches 1–7 volta à manutenção
  })

  it('uma bitácora boa no meio não dispara; recusar some até a próxima bitácora', () => {
    let s = inMaintenance()
    s = saveLog(s, log(15, at(15), 2))
    s = saveLog(s, log(15, at(16), 4))
    s = saveLog(s, log(15, at(17), 2))
    s = saveLog(s, log(15, at(18), 1))
    expect(getView(s, at(19)).proposeRelapse).toBe(false)
    s = saveLog(s, log(15, at(19), 1))
    expect(getView(s, at(20)).proposeRelapse).toBe(true)
    s = dismissRelapse(s)
    expect(getView(s, at(20)).proposeRelapse).toBe(false)
  })
})

describe('utilidades', () => {
  it('reinício completo volta à Noche Cero', () => {
    let s = started()
    s = doNight(s, 1)
    s = fullReset(s)
    expect(s.currentNight).toBe(0)
    expect(s.onboardingDone).toBe(false)
    expect(s.nights).toHaveLength(0)
  })

  it('80 % ouvido conta como concluída', () => {
    expect(countsAsComplete(0.79)).toBe(false)
    expect(countsAsComplete(0.81)).toBe(true)
  })

  it('janela de 30 min (inclusive depois da meia-noite)', () => {
    expect(isInsideWindow('22:30', at(1, 22, 45))).toBe(true)
    expect(isInsideWindow('22:30', at(1, 23, 10))).toBe(false)
    expect(isInsideWindow('23:50', at(2, 0, 10))).toBe(true)
  })

  it('áudio por noite', () => {
    expect(audioForNight(1)).toBe('vn1')
    expect(audioForNight(7)).toBe('vn7')
    expect(audioForNight(8)).toBe('vn1')
    expect(audioForNight(14)).toBe('vn7')
  })

  it('import valida a versão', () => {
    expect(parseState({ version: 2 })).toBeNull()
    expect(parseState(JSON.parse(JSON.stringify(started())))?.currentNight).toBe(1)
  })
})

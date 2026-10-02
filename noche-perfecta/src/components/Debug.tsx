import { copy } from '../data/copy.es'
import { answerFellAsleep, completeNight, getView, initialState, nightDate, saveLog } from '../protocol/protocol'
import { useStore } from '../state/store'

// ?debug=1 — pula noites e simula datas para testar o fluxo inteiro em minutos.
export function Debug() {
  const { state, update, now, offsetMs, setOffsetMs, replace } = useStore()
  const v = getView(state, now())
  const H = 3600_000
  const log = (score: 1 | 4) =>
    update((s) =>
      saveLog(s, {
        night: s.phase === 'mantenimiento' ? 15 : v.pendingLogNight ?? s.currentNight,
        date: nightDate(now()) + (s.phase === 'mantenimiento' ? `-${s.logs.length}` : ''),
        bedTime: s.startHour,
        minutesToSleep: 15,
        awakenings: 1,
        wakeScore: score,
      }),
    )
  const b = 'min-h-10 rounded-xl bg-[#3a0f0f] px-2 text-base font-bold text-[#ffd7d7]'
  return (
    <div className="-mx-4 mb-4 border-b-2 border-[#ff9b9b] bg-[#2a0b0b] p-3 text-base text-[#ffd7d7]">
      <p className="font-bold">
        {copy.debug.titulo} · {now().toLocaleString('es')} · N{state.currentNight} · {v.status}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {[12, 24].map((h) => (
          <button key={h} className={b} onClick={() => setOffsetMs(offsetMs + h * H)}>
            {copy.debug.masHoras(h)}
          </button>
        ))}
        <button className={b} onClick={() => setOffsetMs(0)}>{copy.debug.hoyReal}</button>
        <button className={b} onClick={() => update((s) => answerFellAsleep(completeNight(s, now()), true))}>{copy.debug.completar}</button>
        <button className={b} onClick={() => update((s) => answerFellAsleep(completeNight(s, now()), false))}>{copy.debug.completarNo}</button>
        <button className={b} onClick={() => log(4)}>{copy.debug.bitacora}</button>
        <button className={b} onClick={() => log(1)}>{copy.debug.bitacoraMala}</button>
        <button className={b} onClick={() => { replace(initialState()); setOffsetMs(0) }}>{copy.debug.reset}</button>
      </div>
    </div>
  )
}

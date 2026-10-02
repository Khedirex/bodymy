import { useRef, useState } from 'react'
import { copy } from '../data/copy.es'
import { fullReset, parseState, type Level } from '../protocol/protocol'
import { useStore } from '../state/store'
import { go } from '../state/router'
import { Btn, Card, PageTitle } from '../components/ui'
import { notificacionesDisponibles, pedirNotificaciones } from './notificaciones'

const NIVELES: Level[] = ['leve', 'moderada', 'severa']

export function Ajustes() {
  const { state, update, replace } = useStore()
  const [nivel, setNivel] = useState(state.level)
  const [hora, setHora] = useState(state.startHour)
  const [frase, setFrase] = useState(state.closingPhrase)
  const [msg, setMsg] = useState<string | null>(null)
  const [confirmar, setConfirmar] = useState(false)
  const file = useRef<HTMLInputElement>(null)

  const notifEstado = !notificacionesDisponibles()
    ? copy.ajustes.notifNoSoporta
    : Notification.permission === 'denied'
      ? copy.ajustes.notifBloqueado
      : null

  function exportar() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ritual-noche-perfecta-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function importar(f: File) {
    try {
      const s = parseState(JSON.parse(await f.text()))
      if (!s) throw new Error('inválido')
      replace(s)
      setMsg(copy.ajustes.importado)
    } catch {
      setMsg(copy.ajustes.importError)
    }
  }

  return (
    <div className="space-y-5">
      <PageTitle title={copy.ajustes.titulo} back="mas" />

      <Card className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-xl font-bold text-crema">{copy.ajustes.nivel}</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup">
            {NIVELES.map((n) => (
              <button
                key={n}
                role="radio"
                aria-checked={nivel === n}
                onClick={() => setNivel(n)}
                className={`min-h-14 rounded-2xl text-lg font-bold ${nivel === n ? 'bg-ambar text-ambar-ink' : 'bg-noche-700 text-crema'}`}
              >
                {copy.niveles[n].nombre}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="aj-hora" className="mb-2 block text-xl font-bold text-crema">
            {copy.ajustes.hora}
          </label>
          <input
            id="aj-hora"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="min-h-14 w-full rounded-2xl border-2 border-noche-600 bg-noche-900 px-4 text-2xl text-crema [color-scheme:dark]"
          />
        </div>
        <div>
          <label htmlFor="aj-frase" className="mb-2 block text-xl font-bold text-crema">
            {copy.ajustes.frase}
          </label>
          <input
            id="aj-frase"
            value={frase}
            maxLength={80}
            onChange={(e) => setFrase(e.target.value)}
            className="min-h-14 w-full rounded-2xl border-2 border-noche-600 bg-noche-900 px-4 text-lg text-crema"
          />
        </div>
        <Btn
          className="w-full"
          onClick={() => {
            update((s) => ({ ...s, level: nivel, startHour: hora, closingPhrase: frase.trim() }))
            setMsg(copy.ajustes.guardado)
          }}
        >
          {copy.ajustes.guardar}
        </Btn>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-xl font-bold text-crema">{copy.ajustes.notificaciones}</h2>
        {notifEstado ? (
          <p className="text-lg text-crema-soft">{notifEstado}</p>
        ) : state.notifications && Notification.permission === 'granted' ? (
          <p className="text-lg text-fija">✓ {copy.ajustes.notifActivo}</p>
        ) : (
          <Btn
            variant="secondary"
            className="w-full"
            onClick={async () => {
              const ok = await pedirNotificaciones()
              update((s) => ({ ...s, notifications: ok }))
            }}
          >
            {copy.ajustes.notifActivar}
          </Btn>
        )}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-xl font-bold text-crema">{copy.ajustes.progreso}</h2>
        <Btn variant="secondary" className="w-full" onClick={exportar}>
          {copy.ajustes.exportar}
        </Btn>
        <Btn variant="secondary" className="w-full" onClick={() => file.current?.click()}>
          {copy.ajustes.importar}
        </Btn>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && void importar(e.target.files[0])}
        />
      </Card>

      {msg ? (
        <p role="status" className="rounded-2xl bg-noche-800 p-4 text-lg font-bold text-ambar">
          {msg}
        </p>
      ) : null}

      <Card className="space-y-3">
        <h2 className="text-xl font-bold text-crema">{copy.ajustes.reinicio}</h2>
        <p className="text-lg text-crema-soft">{copy.ajustes.reinicioTexto}</p>
        {confirmar ? (
          <>
            <p className="text-lg font-bold text-ambar">{copy.ajustes.reinicioConfirmar}</p>
            <Btn
              className="w-full"
              onClick={() => {
                update(fullReset)
                setConfirmar(false)
                go('hoy')
              }}
            >
              {copy.ajustes.reinicioSi}
            </Btn>
            <Btn variant="ghost" className="w-full" onClick={() => setConfirmar(false)}>
              {copy.ajustes.cancelar}
            </Btn>
          </>
        ) : (
          <Btn variant="secondary" className="w-full" onClick={() => setConfirmar(true)}>
            {copy.ajustes.reinicio}
          </Btn>
        )}
      </Card>
    </div>
  )
}

import { copy } from '../data/copy.es'
import { asset } from '../data/asset'

// Notificação local da Bitácora. Sem servidor de push: o aviso é mostrado
// quando o app é aberto (ou volta ao primeiro plano) de manhã com a
// Bitácora pendente — e o banner da tela Hoy aparece sempre.
const LAST_KEY = 'rnp_notif_last'

export function notificacionesDisponibles(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator
}

export async function pedirNotificaciones(): Promise<boolean> {
  if (!notificacionesDisponibles()) return false
  const r = await Notification.requestPermission()
  return r === 'granted'
}

export async function avisarBitacora(hoy: string) {
  if (!notificacionesDisponibles() || Notification.permission !== 'granted') return
  try {
    if (localStorage.getItem(LAST_KEY) === hoy) return
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(copy.notificacion.titulo, {
      body: copy.notificacion.cuerpo,
      icon: asset('/icons/icon-192.png'),
      tag: 'rnp-bitacora',
    })
    localStorage.setItem(LAST_KEY, hoy)
  } catch {
    /* sem suporte */
  }
}

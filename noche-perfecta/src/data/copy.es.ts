// =====================================================================
// Ritual Noche Perfecta — TODOS los textos de la interfaz (español neutro).
// Ningún componente escribe texto propio: todo sale de aquí.
// Términos fijos: bloqueo cerebral / glándula natural del sueño;
// Sincronización de Ondas Pineales; Vibraciones Nocturnas (VN1–VN7).
// =====================================================================

export const copy = {
  marca: 'Ritual Noche Perfecta',
  ancla: '7 noches reconfiguran. 14 noches fijan.',

  bloques: {
    reconfiguracion: 'Reconfiguración Mental Completa',
    reconfiguracionCorto: 'Reconfiguración',
    fijacion: 'Fijación',
    mantenimiento: 'Mantenimiento',
  },

  nav: { hoy: 'Hoy', calendario: 'Calendario', audios: 'Audios', mas: 'Más' },

  niveles: {
    leve: {
      nombre: 'Leve',
      cambia: 'Sigues el calendario tal como está, un audio por noche.',
    },
    moderada: {
      nombre: 'Moderada',
      cambia: 'Aplicas la Regla de las 2 noches cuando un audio te cueste más.',
    },
    severa: {
      nombre: 'Severa',
      cambia: 'En las noches 1 a 4 escuchas el audio 2 veces seguidas (14 minutos). Desde la noche 5, una sola vez.',
    },
  },

  onboarding: {
    paso: (n: number) => `Paso ${n} de 3`,
    siguiente: 'Siguiente',
    atras: 'Atrás',
    p1Titulo: 'Bienvenida a tu Ritual',
    p1Texto:
      'El Ritual Noche Perfecta es una secuencia guiada de 14 noches que reprograma la frecuencia de tu sueño con la Sincronización de Ondas Pineales.',
    p1Destacado: 'No entregamos un audio: entregamos el Ritual Guiado.',
    p1Por:
      'Un audio suelto te ayuda una o dos noches; la secuencia exacta es lo que desarma el bloqueo cerebral y reprograma tu sueño.',
    p1Tiempo: 'Cada noche te toma 10 minutos: 3 de preset y 7 de audio.',
    p2Titulo: 'Tu Nivel de Desconexión',
    p2Texto: 'Marca el nivel que apareció en tu resultado.',
    p3Titulo: 'Tu hora fija',
    p3Texto: 'Tu cerebro aprende por repetición. Una hora fija le enseña cuándo apagarse.',
    p3Label: 'Mi hora de inicio',
    p3Ventana: 'La ventana de 30 minutos',
    p3VentanaTexto:
      'Da play entre tu hora fija y 30 minutos después. Si te pasas de la ventana, haz el ritual igual: cuenta como noche completa.',
    p3Consejo: 'Elige una hora que puedas mantener las 14 noches, también el fin de semana.',
    empezar: 'Empezar mi Noche Cero',
  },

  preset: {
    titulo: 'Noche Cero',
    subtitulo: 'Tu Preset Noche Perfecta',
    intro: 'Repite este preset cada noche, 3 minutos antes de dar play.',
    items: {
      celular: 'Celular en «No molestar» y brillo al mínimo.',
      audifonos: 'Audífonos o parlante probados.',
      luz: 'Luz principal apagada.',
      fresco: 'Habitación 1–2 grados más fresca.',
      agua: 'Agua en la mesa de noche.',
      frase: 'Tu frase de cierre',
    },
    frasePlaceholder: 'Ejemplo: «Por hoy, ya está»',
    fraseAyuda: 'La verás cada noche antes de dar play.',
    sinAudio: 'Esta noche no hay audio. Solo el preset y tu primera Bitácora.',
    listo: 'Preset listo',
    faltan: (n: number) => `Marca los 6 puntos para continuar (${n} de 6)`,
  },

  baseline: {
    titulo: 'Tu punto de partida',
    texto: 'Responde sobre tus noches de ahora. En las noches 7 y 14 vas a comparar.',
    guardar: 'Guardar mi punto de partida',
  },

  hoy: {
    noche: (n: number) => `Noche ${n} de 14`,
    nocheCero: 'Noche Cero',
    play: 'Dar play',
    playAria: (nombre: string) => `Reproducir ${nombre}`,
    dosVeces: 'Esta noche lo escuchas 2 veces seguidas (14 min).',
    repite: 'Hoy repites este audio. Repetir no es ir atrasado: es parte del método.',
    retomas: 'Retomas desde donde quedaste. No compenses ni repitas la semana.',
    presetRecordatorio: '3 min de preset: no molestar, luz apagada, agua cerca.',
    tuFrase: 'Tu frase de cierre',
    fueraVentana: (h: string) => `Tu hora fija es ${h}. Si te pasas de la ventana, haz el ritual igual.`,
    listaHoy: 'Noche completada. Tu próxima noche se abre mañana.',
    manana: (n: number) => `Mañana: Noche ${n}`,
    rescate: 'Desperté de madrugada',
    progreso: 'Tu progreso',
    nocheCeroPreset: 'Prepara tu Noche Cero: el preset de 3 minutos.',
    nocheCeroPresetBoton: 'Hacer mi preset',
    nocheCeroLog: 'Tu preset está listo. Mañana al despertar completa tu primera Bitácora para abrir la Noche 1.',
    nocheCeroLogBoton: 'Completar mi primera Bitácora',
    bannerBitacora: (n: number) => `Completa tu Bitácora de la noche ${n} (30 segundos).`,
    bannerBitacoraBoton: 'Completar ahora',
    bannerPregunta: 'Antes de seguir: ¿te dormiste durante el audio de anoche?',
    bannerCheckpoint: (n: number) => `Tu Checkpoint de la noche ${n} te espera.`,
    bannerCheckpointBoton: 'Hacer checkpoint',
    mantenimientoTitulo: 'Mantenimiento',
    mantenimientoTexto: '3 noches por semana, en este orden: VN1, VN3 y VN6. Elige los días y mantenlos fijos.',
    mantenimientoHoy: 'Sugerido para tu próxima noche',
    recaidaTitulo: '¿3 noches malas seguidas?',
    recaidaTexto: 'Repite las noches 1 a 7 (Reconfiguración) y luego vuelve al mantenimiento.',
    recaidaSi: 'Repetir noches 1–7',
    recaidaNo: 'Ahora no',
  },

  player: {
    salir: 'Salir',
    play: 'Reproducir',
    pausa: 'Pausar',
    restante: 'restante',
    segundaVez: '2ª vez',
    rescate: 'Modo Rescate',
    rescatePasos: ['No enciendas la luz.', 'No mires la hora.', 'Dale play a VN5 y cierra los ojos.'],
    apagar: 'Apagar pantalla',
    apagadoAyuda: 'Toca en cualquier lugar para encender',
    detenerAlTerminar: 'Detener al terminar',
    repetir: 'Repetir hasta que yo lo pare',
    bloqueado: 'Tu navegador bloqueó el audio. Toca el botón de play otra vez.',
    errorCarga: 'No pudimos cargar el audio. Revisa tu conexión e inténtalo de nuevo.',
    progresoAria: 'Progreso del audio',
  },

  final: {
    pregunta: '¿Te dormiste durante el audio?',
    si: 'Sí',
    no: 'No, aún despierto',
    completada: (n: number) => `Noche ${n} completada`,
    recordatorio: 'Mañana al despertar, completa tu Bitácora (30 segundos).',
    repetiraTitulo: 'Mañana repites este audio',
    repetiraTexto:
      'Llevas 2 noches sin dormirte durante el audio. Mañana repites el mismo, y después avanzas. Repetir no es ir atrasado: es parte del método.',
    ir: 'Volver a Hoy',
    notificaciones: 'Recibir un recordatorio para la Bitácora',
  },

  bitacora: {
    titulo: 'Bitácora de 30 segundos',
    intro: 'Llénala cada mañana al despertar.',
    deLaNoche: (n: number) => (n === 0 ? 'Noche Cero' : n === 15 ? 'Noche de mantenimiento' : `Noche ${n}`),
    horaAcoste: 'Hora en que me acosté',
    minutos: 'Minutos hasta dormir',
    minutosOpciones: [
      { v: 5, label: '5' },
      { v: 15, label: '15' },
      { v: 30, label: '30' },
      { v: 60, label: '60+' },
    ],
    despertares: 'Despertares',
    despertaresOpciones: [
      { v: 0, label: '0' },
      { v: 1, label: '1' },
      { v: 2, label: '2' },
      { v: 3, label: '3+' },
    ],
    comoDesperte: 'Cómo desperté',
    caras: ['😫', '😕', '😐', '🙂', '😄'],
    carasAria: ['1, muy mal', '2, mal', '3, regular', '4, bien', '5, muy bien'],
    guardar: 'Guardar mi Bitácora',
    guardada: 'Bitácora guardada. ¡Bien hecho!',
    historial: 'Historial',
    vacio: 'Todavía no hay registros.',
    resumen: (min: string, desp: string) => `${min} min hasta dormir · ${desp} despertares`,
  },

  calendario: {
    titulo: 'Tus 14 noches',
    toca: 'Toca una noche completada para ver su Bitácora.',
    hoy: 'Hoy',
    sinBitacora: 'Esta noche no tiene Bitácora.',
    cerrar: 'Cerrar',
    checkpoint: 'Checkpoint',
  },

  checkpoint: {
    titulo: (n: number) => `Checkpoint noche ${n}`,
    intro: (n: number) =>
      n === 14
        ? 'Compara esta noche con tu Noche Cero y tu noche 7. Marca un número del 1 al 5.'
        : 'Compara esta noche con tu Noche Cero. Marca un número del 1 al 5.',
    preguntas: {
      tardanza: { q: '¿Cuánto tardaste en dormirte?', escala: '1 = Más de 1 hora · 5 = Menos de 15 min' },
      despertares: { q: '¿Cuántas veces despertaste?', escala: '1 = 4 o más · 5 = Ninguna' },
      energia: { q: '¿Cómo despertaste?', escala: '1 = Sin energía · 5 = Con energía' },
    },
    antes: 'Antes',
    ahora: 'Ahora',
    noche: (n: number) => (n === 0 ? 'Noche 0' : `Noche ${n}`),
    cambio: 'Lo que más cambió',
    guardar: 'Guardar checkpoint',
    animo7: 'Cualquier avance cuenta. Si todavía no notas cambios, sigue igual: la fijación también es parte del método.',
    cierre14: 'Cada noche que completas le enseña a tu cerebro a descansar de nuevo. Confía en la secuencia.',
  },

  audios: {
    titulo: 'Los 7 audios',
    subtitulo: 'Vibraciones Nocturnas',
    intro: 'Los 7 audios trabajan juntos con la Sincronización de Ondas Pineales. Escúchalos siempre en este orden.',
    min: (m: number) => `${m} min`,
    hecho: 'Hecho',
    hoy: 'Hoy',
    bloqueado: 'Bloqueado',
    offline: 'Disponible sin internet',
    candado: 'Se abre en su noche. Nunca saltes un audio ni cambies el orden.',
  },

  mas: {
    titulo: 'Más',
    bitacora: 'Bitácora',
    siCuesta: 'Si te cuesta más',
    errores: 'Errores comunes',
    ajustes: 'Ajustes',
    rescate: 'Modo Rescate',
  },

  siCuesta: {
    titulo: 'Si te cuesta más',
    subtitulo: 'Reglas de repetición',
    lema: 'Repetir no es ir atrasado. Es parte del método.',
    reglas: [
      {
        t: 'Regla de las 2 noches',
        d: 'Si en 2 noches seguidas no te dormiste durante el audio, repite ese mismo audio una noche más. Después, avanza al siguiente. La app lo hace por ti.',
      },
      {
        t: 'Nivel Severa',
        d: 'En las noches 1 a 4 escucha el audio 2 veces seguidas (14 minutos). Desde la noche 5, una sola vez. La app lo repite sola.',
      },
      {
        t: 'Noche perdida',
        d: 'No compenses ni repitas la semana. La noche siguiente retoma desde donde te quedaste.',
      },
    ],
    nunca: 'Nunca saltes un audio. Nunca cambies el orden.',
    despuesTitulo: 'Cuándo empezar de cero',
    despuesTexto: 'Reinicia el protocolo completo, desde la Noche Cero, si pasas por:',
    despuesItems: ['un viaje con cambio de horario;', 'un cambio de turno de trabajo;', 'un período de mucho estrés.'],
  },

  errores: {
    titulo: 'Errores comunes',
    items: [
      { t: 'Escuchar en el sofá.', d: 'Escucha siempre en tu cama.', icono: '/illustrations/error-sofa.webp' },
      { t: 'Escuchar con la luz encendida.', d: 'Apaga la luz principal antes de dar play.', icono: '/illustrations/error-luz.webp' },
      { t: 'Saltar un audio.', d: 'Cada audio prepara el siguiente.', icono: '/illustrations/error-saltar.webp' },
      { t: 'Cambiar el orden.', d: 'La secuencia es lo que reprograma tu sueño.', icono: '/illustrations/error-orden.webp' },
      { t: 'Cambiar la hora cada noche.', d: 'Respeta tu hora fija y su ventana de 30 minutos.', icono: '/illustrations/error-hora.webp' },
      { t: 'Parar en la noche 7.', d: 'Sin la Fijación, el cerebro vuelve al patrón anterior.', icono: '/illustrations/error-parar.webp' },
    ],
  },

  ajustes: {
    titulo: 'Ajustes',
    nivel: 'Nivel de Desconexión',
    hora: 'Hora fija',
    frase: 'Frase de cierre',
    guardar: 'Guardar cambios',
    guardado: 'Cambios guardados.',
    notificaciones: 'Recordatorio de la Bitácora',
    notifActivar: 'Activar recordatorio',
    notifActivo: 'Recordatorio activado',
    notifBloqueado: 'Tu navegador bloqueó las notificaciones. Puedes activarlas en la configuración del navegador.',
    notifNoSoporta: 'Este navegador no permite notificaciones. Verás el aviso en la pantalla Hoy.',
    progreso: 'Tu progreso',
    exportar: 'Exportar mi progreso',
    importar: 'Importar progreso',
    importado: 'Progreso importado.',
    importError: 'Ese archivo no es un progreso válido del Ritual.',
    reinicio: 'Reinicio completo',
    reinicioTexto: 'Vuelve a la Noche Cero y borra tu calendario y tus Bitácoras.',
    reinicioConfirmar: '¿Seguro? Vas a empezar de cero, desde la Noche Cero. Esto no se puede deshacer.',
    reinicioSi: 'Sí, empezar de cero',
    cancelar: 'Cancelar',
  },

  notificacion: {
    titulo: 'Tu Bitácora te espera',
    cuerpo: 'Completa tu Bitácora de anoche: son 30 segundos.',
  },

  gracias: {
    titulo: '¡Compra confirmada!',
    texto: 'Qué alegría tenerte aquí. Tu Ritual Noche Perfecta ya está listo.',
    pdfTitulo: 'Tu protocolo en PDF',
    pdfTexto:
      'Descárgalo ahora: el Protocolo de 14 noches con tu preset, tu hora fija, los 7 audios y tu bitácora, para tener a mano o imprimir.',
    pdfBoton: 'Descargar mi PDF',
    planTitulo: 'Accede a tu plan',
    planTexto:
      'Tu ritual noche a noche lo sigues en la app: te dice qué audio escuchar hoy, lo reproduce con la pantalla apagada y guarda tu avance.',
    planBoton: 'Acceder a mi plan',
    instalarTitulo: 'Tenlo siempre a mano',
    instalarTexto:
      'Al abrir tu plan, agrégalo a la pantalla de inicio de tu celular (en el menú del navegador: «Agregar a pantalla de inicio»). Así lo abres con un toque cada noche.',
    guardaLink: 'Guarda también el enlace de esta página: aquí encuentras siempre tu PDF y tu plan.',
  },

  cierre: 'Cada noche que completas le enseña a tu cerebro a descansar de nuevo. Confía en la secuencia.',

  debug: {
    titulo: 'Modo prueba',
    fecha: 'Fecha simulada',
    masHoras: (h: number) => `+${h} h`,
    hoyReal: 'Fecha real',
    completar: 'Completar noche (durmió)',
    completarNo: 'Completar noche (no durmió)',
    bitacora: 'Bitácora rápida',
    bitacoraMala: 'Bitácora mala (1)',
    reset: 'Reiniciar',
  },
} as const

export type Copy = typeof copy

// =====================================================================
// BodyMy — Os 5 exercícios de cada fase do reto na cama, como MODELOS que
// recebem a dose do dia e devolvem:
//   • appDosis — linhas curtas para o texto de apoio (vezes + segundos);
//   • guion    — o roteiro da Lucy (posição → movimento → contagem →
//                respiração → o que sentir / o que NÃO → versão fácil);
//   • ejecucionSeg — tempo de execução estimado (para a duração do vídeo).
//
// Todo o texto final está em espanhol neutro (LATAM), com "tú".
// Ver as convenções de dose no topo de reto-cama-14-dias.ts.
// =====================================================================
import type { Dia, Dosis } from './reto-cama-14-dias'

export type TipoLinea = 'dice' | 'cuenta' | 'camara'
export interface Linea {
  t: TipoLinea
  texto: string
}
export interface Seccion {
  titulo: string
  lineas: Linea[]
}
export interface EjercicioDia {
  slot: number
  nombre: string
  appDosis: string[]
  guion: Seccion[]
  ejecucionSeg: number
}

// ---------------------------------------------------------------------
// Helpers de texto
// ---------------------------------------------------------------------
const NUM = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez']
const VEZ = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez']
const ORD = ['', 'primera', 'segunda', 'tercera', 'cuarta', 'quinta', 'sexta', 'séptima', 'octava', 'novena', 'décima']

const porExtenso = (n: number) => (n === 30 ? 'treinta' : NUM[n] ?? String(n))
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const dice = (...t: string[]): Linea[] => t.map((texto) => ({ t: 'dice', texto }))
const cuenta = (...t: string[]): Linea[] => t.map((texto) => ({ t: 'cuenta', texto }))
const cam = (texto: string): Linea => ({ t: 'camara', texto: `[${texto}]` })

/** "Uno… dos… tres." */
export function conteo(n: number): string {
  return cap(NUM.slice(1, n + 1).join('… ')) + '.'
}
const veces = (n: number) => (n === 1 ? '1 vez' : `${n} veces`)
const vecesTxt = (n: number) => (n === 1 ? 'una vez' : `${VEZ[n]} veces`)

function respiracion(d: Dosis, esfuerzo: string, afloja: string): Linea[] {
  if (d.respiracionCoordinada) {
    return dice(`Suelta el aire al ${esfuerzo}.`, `Toma aire al ${afloja}.`, 'Nunca aguantes el aire.')
  }
  return dice('Respira como te salga.', 'Solo no aguantes el aire.')
}

function cambioLado(d: Dosis, instruccion: string): Linea[] {
  return d.sinPausaLados
    ? dice('Sin parar, pasa al otro lado.', instruccion)
    : dice('Descansa unos segundos.', instruccion)
}

function finEjercicio(d: Dosis, esUltimo: boolean): Linea[] {
  if (esUltimo) return []
  return d.sinParar ? dice('Sin parar, vamos al siguiente.') : dice('Muy bien. Descansa un momento.')
}

/** Contagem da fase 1 (sostener N segundos), com a primeira vez por extenso. */
function repeticionesSostener(d: Dosis, hacer: string, soltar: string, lado?: string): Linea[] {
  const total = d.veces
  const lineas: Linea[] = []
  if (lado) lineas.push(...dice(lado))
  if (d.suave) {
    lineas.push(...cuenta(`${hacer} Despacio: uno… dos.`, `${soltar} Uno… dos.`, 'Esa es una.'))
    lineas.push(cam(`Repite con ella. Cuenta «uno… dos» al ir y al volver. Di «van dos», «van tres»… hasta ${total}`))
    return lineas
  }
  lineas.push(...cuenta(`${hacer} Aguanta y respira: ${conteo(d.seg).toLowerCase()}`, `${soltar} Esa es una.`))
  lineas.push(
    cam(`Repite con ella. Cuenta los ${d.seg} segundos en voz alta cada vez. Al soltar, di «van dos», «van tres»… hasta ${total}`),
  )
  return lineas
}

/** Contagem da fase 2 (ritmo 2 s sobe / 2 s baixa). */
function repeticionesRitmo(
  d: Dosis,
  subir: string,
  bajar: string,
  opts: { sostenerUltima?: boolean; lado?: string } = {},
): Linea[] {
  const total = d.veces
  const lineas: Linea[] = []
  if (opts.lado) lineas.push(...dice(opts.lado))
  lineas.push(...cuenta(`${subir}: uno, dos.`, `${bajar}: uno, dos.`, 'Una.'))
  lineas.push(...cuenta(`${subir}: uno, dos.`, `${bajar}: uno, dos.`, 'Dos.'))
  const hasta = opts.sostenerUltima && d.sostenerArriba > 0 ? total - 1 : total
  lineas.push(cam(`Sigue contando igual cada vez, en voz alta, hasta ${hasta}`))
  if (opts.sostenerUltima && d.sostenerArriba > 0) {
    lineas.push(
      ...cuenta(
        `La ${ORD[total]} es especial. ${subir} y quédate arriba.`,
        `Aguanta y respira: ${conteo(d.sostenerArriba).toLowerCase()}`,
        `${bajar} despacio.`,
      ),
    )
  }
  return lineas
}

/** Círculos (fase 2): 2 s cada um. */
function circulos(d: Dosis, que: string): Linea[] {
  const mitad = Math.floor(d.veces / 2)
  return [
    ...cuenta(`${que}: uno, dos. Una.`, `${que}: uno, dos. Dos.`),
    cam(`Sigue contando en voz alta. En la ${ORD[mitad]}, di «cambia de dirección». Llega hasta ${d.veces}`),
  ]
}

/** Envolve o corpo de uma série em 1 ou 2 séries com descanso. */
function envolverSeries(d: Dosis, serie: Linea[]): Linea[] {
  if (d.series === 1) return serie
  return [
    ...dice('Primera serie.'),
    ...serie,
    ...dice(`Descansa ${porExtenso(d.descansoSeg)} segundos.`, 'Solo respira, tranquila.'),
    cam(`Espera ${d.descansoSeg} segundos. Puedes contar en voz baja con ella`),
    ...dice(`Segunda serie. Otra vez ${NUM[d.veces]}.`),
    cam('Repite la misma guía y el mismo conteo de la primera serie'),
  ]
}

function dosisSeriesApp(d: Dosis, porLado: string): string {
  const base = d.series === 2 ? `2 series de ${d.veces}${porLado}.` : `${veces(d.veces)}${porLado}.`
  return base
}
const APP_RITMO = '2 segundos al subir, 2 al bajar.'
const appSostener = (d: Dosis, donde = '') =>
  d.suave ? '2 segundos al ir, 2 al volver.' : `Aguanta ${d.seg} segundos${donde}.`

// Tempo de execução (segundos).
const tHold = (d: Dosis) => (d.suave ? 4 : d.seg) + 3
const TURNO = 15
const tLados = (d: Dosis) => (d.sinPausaLados ? 3 : 10)
const tSeries = (d: Dosis, porSerie: number) => d.series * porSerie + (d.series - 1) * d.descansoSeg

// ---------------------------------------------------------------------
// FASE 1 (días 1–7)
// ---------------------------------------------------------------------
function f1Slot1(d: Dosis): EjercicioDia {
  const guion: Seccion[] = [
    {
      titulo: 'Posición inicial',
      lineas: [
        cam('plano abierto desde el costado'),
        ...dice(
          'Acuéstate boca arriba en tu cama.',
          'Pon la almohada debajo de tu cabeza.',
          'Estira las piernas. Deja los pies sueltos.',
          'Pon los brazos a los lados.',
          'Las palmas miran hacia arriba.',
        ),
      ],
    },
    {
      titulo: 'Movimiento',
      lineas: [
        cam('primer plano de los pies'),
        ...dice(
          'Jala las puntas de los pies hacia ti.',
          'Al mismo tiempo, cierra las manos.',
          'Suave, como si agarraras una naranja.',
        ),
        ...(d.suave ? dice('Hoy sin quedarte. Solo ir y volver.') : dice('Quédate así unos segundos.')),
        ...dice('Ahora empuja las puntas lejos, como pisando un pedal.', 'Y abre bien las manos.'),
        ...(d.masMovimiento ? dice('Hoy jala las puntas un poquito más hacia ti.') : []),
        cam('primer plano de las manos'),
      ],
    },
    {
      titulo: `Conteo (${vecesTxt(d.veces)})`,
      lineas: repeticionesSostener(d, 'Pies hacia ti. Manos cerradas.', 'Empuja las puntas. Abre las manos.'),
    },
    { titulo: 'Respiración', lineas: respiracion(d, 'jalar los pies', 'soltar') },
    {
      titulo: 'Qué debes sentir',
      lineas: dice('Un estirón suave detrás de la pierna.', 'Calorcito en los pies y en las manos.'),
    },
    {
      titulo: 'Qué NO debes sentir',
      lineas: dice('Un calambre en la planta o en la pantorrilla.', 'Si pasa, suelta y mueve el pie suave.'),
    },
    {
      titulo: 'Versión más fácil',
      lineas: dice('Mueve solo los pies.', 'Las manos, quietas.', 'O haz el movimiento más chiquito.'),
    },
    { titulo: 'Transición', lineas: finEjercicio(d, false) },
  ]
  return {
    slot: 1,
    nombre: 'Despertar pies y manos',
    appDosis: [
      `${veces(d.veces)}.`,
      appSostener(d, ' con los pies hacia ti'),
      'Pies y manos al mismo tiempo.',
    ],
    guion,
    ejecucionSeg: d.veces * tHold(d),
  }
}

function f1Slot2(d: Dosis): EjercicioDia {
  const suave = d.suave
  const guion: Seccion[] = [
    {
      titulo: 'Posición inicial',
      lineas: [
        cam('plano abierto desde el costado'),
        ...dice(
          'Sigue boca arriba.',
          'Enrolla la toalla como un tubo.',
          'Ponla debajo de tu rodilla derecha.',
          'La pierna derecha queda estirada sobre la toalla.',
          'La otra pierna, como te quede cómoda.',
        ),
      ],
    },
    {
      titulo: 'Movimiento',
      lineas: [
        cam('primer plano de la rodilla'),
        ...(suave
          ? dice(
              'Hoy la toalla solo se toca.',
              'Aprieta suavecito, como una caricia.',
              'Sin hacer fuerza.',
            )
          : dice(
              'Empuja la rodilla hacia abajo, contra la toalla.',
              'Como si aplastaras una naranja con la rodilla.',
              'La pierna no se mueve. Solo hace fuerza.',
              'La parte de arriba del muslo se pone dura.',
            )),
        ...dice('Después, suelta despacio.'),
      ],
    },
    {
      titulo: `Conteo (${vecesTxt(d.veces)} con cada rodilla)`,
      lineas: [
        ...repeticionesSostener(d, 'Aplasta la toalla.', 'Suelta.', 'Empezamos con la rodilla derecha.'),
        ...cambioLado(d, 'Pasa la toalla debajo de la rodilla izquierda.'),
        ...repeticionesSostener(d, 'Aplasta la toalla.', 'Suelta.', 'Ahora la rodilla izquierda.'),
      ],
    },
    { titulo: 'Respiración', lineas: respiracion(d, 'aplastar', 'soltar') },
    {
      titulo: 'Qué debes sentir',
      lineas: dice('La parte de arriba del muslo, firme.', 'El talón puede subir un poquito. Está bien.'),
    },
    {
      titulo: 'Qué NO debes sentir',
      lineas: dice('Dolor punzante dentro de la rodilla.', 'Si pasa, aprieta menos.'),
    },
    {
      titulo: 'Versión más fácil',
      lineas: dice(
        'Aprieta con la mitad de fuerza.',
        'Si la rodilla no baja, está bien.',
        'Solo intentar ya cuenta.',
      ),
    },
    { titulo: 'Transición', lineas: finEjercicio(d, false) },
  ]
  return {
    slot: 2,
    nombre: 'Aplastar la toalla',
    appDosis: [`${veces(d.veces)} con cada rodilla.`, appSostener(d, ' apretando')],
    guion,
    ejecucionSeg: 2 * d.veces * tHold(d) + tLados(d),
  }
}

function f1Slot3(d: Dosis): EjercicioDia {
  const guion: Seccion[] = [
    {
      titulo: 'Posición inicial',
      lineas: [
        cam('plano abierto desde los pies de la cama'),
        ...dice(
          'Gira y acuéstate sobre tu lado derecho.',
          'La almohada, debajo de tu cabeza.',
          'Dobla las dos rodillas.',
          'Una rodilla encima de la otra.',
          'Junta los pies.',
          'Pon la mano de arriba sobre tu cadera.',
        ),
      ],
    },
    {
      titulo: 'Movimiento',
      lineas: [
        cam('primer plano de la cadera y la rodilla'),
        ...dice(
          'Sin separar los pies, sube la rodilla de arriba.',
          'Como una almeja que se abre.',
          'Tu mano cuida que la cadera no se vaya atrás.',
        ),
        ...(d.suave ? dice('Hoy abre y cierra despacio, sin quedarte.') : dice('Quédate arriba unos segundos.')),
        ...dice('Baja la rodilla despacio.'),
        ...(d.masMovimiento ? dice('Hoy sube la rodilla un poquito más.') : []),
      ],
    },
    {
      titulo: `Conteo (${vecesTxt(d.veces)} de cada lado)`,
      lineas: [
        ...repeticionesSostener(d, 'Abre la rodilla.', 'Baja.', 'Empezamos con la pierna izquierda arriba.'),
        ...cambioLado(d, 'Gira despacio y acuéstate sobre el lado izquierdo.'),
        ...repeticionesSostener(d, 'Abre la rodilla.', 'Baja.', 'Ahora trabaja la pierna derecha.'),
      ],
    },
    { titulo: 'Respiración', lineas: respiracion(d, 'abrir la rodilla', 'bajarla') },
    {
      titulo: 'Qué debes sentir',
      lineas: dice('Trabajo en el costado de la cadera.', 'Un calorcito en la pompi.'),
    },
    {
      titulo: 'Qué NO debes sentir',
      lineas: dice('Un pinchazo en la espalda baja.', 'Dolor en la cadera que queda abajo.'),
    },
    {
      titulo: 'Versión más fácil',
      lineas: dice(
        'Sube la rodilla solo un poquito.',
        'Si de lado te molesta, hazlo boca arriba.',
        'Rodillas dobladas. Deja caer una rodilla hacia el costado.',
      ),
    },
    { titulo: 'Transición', lineas: [...dice('Vuelve a acostarte boca arriba.'), ...finEjercicio(d, false)] },
  ]
  return {
    slot: 3,
    nombre: 'Almeja de lado',
    appDosis: [`${veces(d.veces)} de cada lado.`, appSostener(d, ' con la rodilla arriba')],
    guion,
    ejecucionSeg: 2 * d.veces * tHold(d) + TURNO + tLados(d),
  }
}

function f1Slot4(d: Dosis): EjercicioDia {
  const mecerHacer = 'Rodillas a la derecha.'
  const guion: Seccion[] = [
    {
      titulo: 'Posición inicial',
      lineas: [
        cam('plano alto, desde arriba de la cama'),
        ...dice(
          'Boca arriba.',
          'Dobla las dos rodillas.',
          'Apoya los pies en la cama.',
          'Sepáralos como el ancho de tu cadera.',
          'Los brazos, a los lados.',
        ),
      ],
    },
    {
      titulo: 'Movimiento 1: mecer las rodillas',
      lineas: [
        ...dice(
          'Deja caer las dos rodillas juntas a la derecha.',
          'Solo un poquito.',
          'Los hombros se quedan en la cama.',
        ),
        ...(d.suave ? [] : dice('Quédate unos segundos.')),
        ...dice('Vuelve al centro.', 'Ahora a la izquierda. Y vuelve al centro.', 'Derecha e izquierda es una vez.'),
        ...(d.masMovimiento ? dice('Hoy deja que las rodillas bajen un poco más.') : []),
      ],
    },
    {
      titulo: `Conteo 1 (${vecesTxt(d.veces)})`,
      lineas: d.suave
        ? [
            ...cuenta('Rodillas a la derecha: uno… dos.', 'Al centro. A la izquierda: uno… dos.', 'Al centro. Esa es una.'),
            cam(`Repite con ella, despacio. Di «van dos», «van tres»… hasta ${d.veces}`),
          ]
        : [
            ...cuenta(
              `${mecerHacer} Aguanta y respira: ${conteo(d.seg).toLowerCase()}`,
              `Al centro. A la izquierda. Aguanta y respira: ${conteo(d.seg).toLowerCase()}`,
              'Al centro. Esa es una.',
            ),
            cam(`Repite con ella. Cuenta los ${d.seg} segundos de cada lado. Di «van dos»… hasta ${d.veces}`),
          ],
    },
    {
      titulo: 'Movimiento 2: pegar la espalda a la cama',
      lineas: [
        cam('primer plano de la cintura'),
        ...dice(
          'Imagina una uva debajo de tu cintura.',
          'Aplástala. Pega la espalda baja a la cama.',
          'La cadera se mece un poquito, como una cuna.',
        ),
        ...(d.suave ? dice('Hoy muy suave, sin apretar.') : dice('Quédate así unos segundos.')),
        ...dice('Suelta.'),
      ],
    },
    {
      titulo: `Conteo 2 (${vecesTxt(d.veces)})`,
      lineas: repeticionesSostener(d, 'Aplasta la uva.', 'Suelta.'),
    },
    { titulo: 'Respiración', lineas: respiracion(d, 'pegar la espalda', 'soltar') },
    {
      titulo: 'Qué debes sentir',
      lineas: dice('La espalda baja se afloja.', 'Como un masaje suave en la cintura.'),
    },
    {
      titulo: 'Qué NO debes sentir',
      lineas: dice('Dolor que baja por la pierna.', 'Si pasa, para y descansa.'),
    },
    {
      titulo: 'Versión más fácil',
      lineas: dice('Mueve las rodillas muy poquito.', 'O pon la almohada debajo de las rodillas.'),
    },
    { titulo: 'Transición', lineas: finEjercicio(d, false) },
  ]
  const mecer = d.suave ? d.veces * 9 : d.veces * (2 * d.seg + 4)
  return {
    slot: 4,
    nombre: 'Mecer las rodillas y pegar la espalda',
    appDosis: d.suave
      ? [
          `Mecer: ${veces(d.veces)}, despacio.`,
          `Pegar la espalda: ${veces(d.veces)}, muy suave.`,
          '2 segundos al ir, 2 al volver.',
        ]
      : [
          `Mecer: ${veces(d.veces)}. Aguanta ${d.seg} segundos de cada lado.`,
          `Pegar la espalda: ${veces(d.veces)}. Aguanta ${d.seg} segundos.`,
        ],
    guion,
    ejecucionSeg: mecer + d.veces * tHold(d),
  }
}

function f1Slot5(d: Dosis): EjercicioDia {
  const guion: Seccion[] = [
    {
      titulo: 'Posición inicial',
      lineas: [
        cam('plano alto, desde arriba de la cama'),
        ...dice(
          'Sigue boca arriba, con las rodillas dobladas.',
          'Los brazos, a los lados.',
          'Las palmas tocan la cama.',
        ),
      ],
    },
    {
      titulo: 'Movimiento',
      lineas: [
        cam('primer plano de los hombros'),
        ...dice(
          'Toma aire por la nariz.',
          'Desliza los brazos por la cama, hacia arriba.',
          'Como si hicieras un ángel en la nieve.',
          'Llega solo hasta donde no duela.',
        ),
        ...(d.suave ? dice('Hoy sin quedarte. Solo sube y baja.') : dice('Quédate ahí. Respira normal.')),
        ...dice('Suelta el aire por la boca.', 'Baja los brazos despacio, deslizando.'),
        ...(d.masMovimiento ? dice('Hoy sube los brazos un poquito más.') : []),
      ],
    },
    {
      titulo: `Conteo (${vecesTxt(d.veces)})`,
      lineas: repeticionesSostener(d, 'Brazos arriba.', 'Baja los brazos.'),
    },
    {
      titulo: 'Respiración',
      lineas: d.respiracionCoordinada
        ? dice('Toma aire al subir los brazos.', 'Suelta el aire al bajarlos.', 'Arriba, sigue respirando.')
        : dice('Respira como te salga.', 'Arriba, sigue respirando.'),
    },
    {
      titulo: 'Qué debes sentir',
      lineas: dice('El pecho se abre.', 'Los hombros se aflojan.'),
    },
    {
      titulo: 'Qué NO debes sentir',
      lineas: dice('Un pinchazo en el hombro.', 'Hormigueo en las manos.', 'Si pasa, baja los brazos.'),
    },
    {
      titulo: 'Versión más fácil',
      lineas: dice('Dobla los codos.', 'O desliza un brazo a la vez.'),
    },
    {
      titulo: 'Cierre con respiración',
      lineas: [
        cam('plano abierto, luz suave'),
        ...dice(
          'Para terminar, tres respiraciones lentas.',
          'Pon una mano sobre la panza.',
          'Toma aire. La panza sube.',
          'Suelta el aire. La panza baja.',
        ),
        cam('Haz las tres respiraciones con ella, en silencio'),
      ],
    },
  ]
  return {
    slot: 5,
    nombre: 'Deslizar los brazos y respirar',
    appDosis: [`${veces(d.veces)}.`, appSostener(d, ' con los brazos arriba'), 'Al final, 3 respiraciones lentas.'],
    guion,
    ejecucionSeg: d.veces * (tHold(d) + 3) + 24,
  }
}

// ---------------------------------------------------------------------
// FASE 2 (días 8–14)
// ---------------------------------------------------------------------
function f2Slot1(d: Dosis): EjercicioDia {
  const serie: Linea[] = [
    ...dice('Primero, los pies.'),
    ...circulos(d, 'Círculo'),
    ...dice('Ahora, las palmas.'),
    ...cuenta('Aprieta: uno, dos. Suelta. Una.', 'Aprieta: uno, dos. Suelta. Dos.'),
    cam(`Sigue contando en voz alta hasta ${d.veces}`),
  ]
  const guion: Seccion[] = [
    {
      titulo: 'Posición inicial',
      lineas: [
        cam('plano abierto desde el costado'),
        ...dice(
          'Acuéstate boca arriba.',
          'La almohada, debajo de tu cabeza.',
          'Estira las piernas.',
          'Junta las palmas frente al pecho, como para rezar.',
        ),
      ],
    },
    {
      titulo: 'Movimiento 1: círculos de tobillo',
      lineas: [
        cam('primer plano de los pies'),
        ...dice(
          'Dibuja un círculo con los dos pies.',
          'Despacio, como si dibujaras la luna con los dedos.',
          'A la mitad, cambia de dirección.',
        ),
      ],
    },
    {
      titulo: 'Movimiento 2: apretar las palmas',
      lineas: [
        cam('primer plano de las manos'),
        ...dice(
          'Aprieta una palma contra la otra.',
          'Como si apretaras una naranja entre las manos.',
          'Cuenta dos. Suelta.',
        ),
      ],
    },
    {
      titulo: d.series === 2 ? `Conteo (2 series de ${d.veces})` : `Conteo (${vecesTxt(d.veces)})`,
      lineas: envolverSeries(d, serie),
    },
    { titulo: 'Respiración', lineas: respiracion(d, 'apretar las palmas', 'soltar') },
    {
      titulo: 'Qué debes sentir',
      lineas: dice('Los tobillos se mueven más sueltos.', 'Los brazos y el pecho trabajan.'),
    },
    {
      titulo: 'Qué NO debes sentir',
      lineas: dice('Dolor en los dedos o en la muñeca.', 'Si pasa, aprieta menos.'),
    },
    {
      titulo: 'Versión más fácil',
      lineas: dice('Haz círculos más chiquitos.', 'Aprieta con la mitad de fuerza.'),
    },
    { titulo: 'Transición', lineas: finEjercicio(d, false) },
  ]
  return {
    slot: 1,
    nombre: 'Círculos de tobillo y palmas',
    appDosis: [
      `Círculos de 2 segundos: ${dosisSeriesApp(d, '')}`,
      `Palmas: ${dosisSeriesApp(d, '')} Aprieta 2 segundos.`,
    ],
    guion,
    ejecucionSeg: tSeries(d, d.veces * 2 + d.veces * 3),
  }
}

function f2Slot2(d: Dosis): EjercicioDia {
  const subirTxt = d.completo
    ? 'Sube la pierna estirada hasta la altura de la otra rodilla.'
    : 'Sube la pierna estirada, solo un poquito.'
  const serie: Linea[] = [
    ...repeticionesRitmo(d, 'Sube', 'Baja', { sostenerUltima: true, lado: 'Pierna derecha.' }),
    ...cambioLado(d, 'Dobla la derecha. Estira la izquierda.'),
    ...repeticionesRitmo(d, 'Sube', 'Baja', { sostenerUltima: true, lado: 'Pierna izquierda.' }),
  ]
  const guion: Seccion[] = [
    {
      titulo: 'Posición inicial',
      lineas: [
        cam('plano abierto desde el costado'),
        ...dice(
          'Boca arriba.',
          'Dobla la rodilla izquierda. El pie, apoyado en la cama.',
          'La pierna derecha, estirada.',
          'Jala la punta del pie derecho hacia ti.',
          'Aprieta el muslo, como cuando aplastabas la toalla.',
        ),
      ],
    },
    {
      titulo: 'Movimiento',
      lineas: [
        cam('primer plano de la rodilla y el muslo'),
        ...dice(subirTxt),
        ...(d.completo ? [] : dice('Como del alto de tu mano.')),
        ...dice('La rodilla no se dobla.', 'Baja despacio, sin dejarla caer.'),
        ...(d.sostenerArriba > 0 ? dice(`En la última vez, te quedas arriba ${NUM[d.sostenerArriba]} segundos.`) : []),
      ],
    },
    {
      titulo: d.series === 2 ? `Conteo (2 series de ${d.veces} con cada pierna)` : `Conteo (${vecesTxt(d.veces)} con cada pierna)`,
      lineas: envolverSeries(d, serie),
    },
    { titulo: 'Respiración', lineas: respiracion(d, 'subir la pierna', 'bajarla') },
    {
      titulo: 'Qué debes sentir',
      lineas: dice('La parte de arriba del muslo trabaja.', 'Cansancio suave, sin dolor.'),
    },
    {
      titulo: 'Qué NO debes sentir',
      lineas: dice('Dolor en la espalda baja.', 'Si pasa, pega la espalda a la cama.', 'Dolor punzante en la rodilla.'),
    },
    {
      titulo: 'Versión más fácil',
      lineas: dice(
        'Sube la pierna menos.',
        'O vuelve a aplastar la toalla, como la semana pasada.',
      ),
    },
    { titulo: 'Transición', lineas: finEjercicio(d, false) },
  ]
  const extra = d.sostenerArriba > 0 ? d.sostenerArriba - 4 : 0
  return {
    slot: 2,
    nombre: d.completo ? 'Levantar la pierna estirada (completo)' : 'Levantar la pierna estirada (corto)',
    appDosis: [
      dosisSeriesApp(d, ' por pierna'),
      APP_RITMO,
      ...(d.sostenerArriba > 0 ? [`Última de cada serie: aguanta ${d.sostenerArriba} segundos arriba.`] : []),
    ],
    guion,
    ejecucionSeg: tSeries(d, 2 * (d.veces * 4 + extra) + tLados(d)),
  }
}

function f2Slot3(d: Dosis): EjercicioDia {
  const subirTxt = d.completo
    ? dice('Sube la cadera hasta formar una rampa.', 'De las rodillas a los hombros.', 'Solo hasta donde estés cómoda.')
    : dice('Despega la cadera solo un poquito.', 'Como para pasar una hoja de papel debajo.')
  const serie = repeticionesRitmo(d, 'Sube', 'Baja', { sostenerUltima: true })
  const guion: Seccion[] = [
    {
      titulo: 'Posición inicial',
      lineas: [
        cam('plano abierto desde el costado'),
        ...dice(
          'Boca arriba.',
          'Dobla las dos rodillas.',
          'Los pies, apoyados y separados como tu cadera.',
          'Los brazos a los lados. Palmas hacia la cama.',
        ),
      ],
    },
    {
      titulo: 'Movimiento',
      lineas: [
        cam('primer plano de la cadera'),
        ...dice('Aprieta las pompis.'),
        ...subirTxt,
        ...dice('Baja despacio, parte por parte.'),
        ...(d.sostenerArriba > 0 ? dice(`En la última vez, te quedas arriba ${NUM[d.sostenerArriba]} segundos.`) : []),
      ],
    },
    {
      titulo: d.series === 2 ? `Conteo (2 series de ${d.veces})` : `Conteo (${vecesTxt(d.veces)})`,
      lineas: envolverSeries(d, serie),
    },
    { titulo: 'Respiración', lineas: respiracion(d, 'subir la cadera', 'bajarla') },
    {
      titulo: 'Qué debes sentir',
      lineas: dice('Las pompis trabajan.', 'También la parte de atrás del muslo.'),
    },
    {
      titulo: 'Qué NO debes sentir',
      lineas: dice(
        'Dolor en la espalda baja.',
        'Un calambre atrás del muslo.',
        'Si pasa, acerca los pies a la cadera.',
      ),
    },
    {
      titulo: 'Versión más fácil',
      lineas: dice('Solo aprieta las pompis, sin subir.', 'Eso también cuenta.'),
    },
    { titulo: 'Transición', lineas: finEjercicio(d, false) },
  ]
  const extra = d.sostenerArriba > 0 ? d.sostenerArriba - 4 : 0
  return {
    slot: 3,
    nombre: d.completo ? 'Puente completo' : 'Mini puente',
    appDosis: [
      dosisSeriesApp(d, ''),
      APP_RITMO,
      ...(d.sostenerArriba > 0 ? [`Última de cada serie: aguanta ${d.sostenerArriba} segundos arriba.`] : []),
    ],
    guion,
    ejecucionSeg: tSeries(d, d.veces * 4 + extra),
  }
}

function f2Slot4(d: Dosis): EjercicioDia {
  const serie: Linea[] = [
    ...repeticionesRitmo(d, 'Acerca', 'Vuelve', { lado: 'Rodilla derecha.' }),
    ...cambioLado(d, 'Pasa la sábana al muslo izquierdo.'),
    ...repeticionesRitmo(d, 'Acerca', 'Vuelve', { lado: 'Rodilla izquierda.' }),
    ...dice('Suelta la sábana. Pies en la cama.', 'Ahora, la panza.'),
    ...cuenta('Aprieta: uno, dos. Suelta: uno, dos. Una.', 'Aprieta: uno, dos. Suelta: uno, dos. Dos.'),
    cam(`Sigue contando en voz alta hasta ${d.veces}`),
  ]
  const guion: Seccion[] = [
    {
      titulo: 'Posición inicial',
      lineas: [
        cam('plano abierto desde el costado'),
        ...dice(
          'Boca arriba.',
          'Dobla las dos rodillas. Pies en la cama.',
          'Pasa la sábana por detrás del muslo derecho.',
          'Cerca de la rodilla, no encima.',
          'Toma una punta de la sábana con cada mano.',
        ),
      ],
    },
    {
      titulo: 'Movimiento 1: rodilla al pecho',
      lineas: [
        cam('primer plano de la rodilla y la sábana'),
        ...dice('Jala suave la sábana.', 'Acerca la rodilla a tu pecho.', 'Vuelve despacio.'),
      ],
    },
    {
      titulo: 'Movimiento 2: apretar la panza',
      lineas: [
        cam('primer plano de la cintura'),
        ...dice(
          'Pon las manos sobre la panza.',
          'Aprieta la panza, como al cerrar un pantalón apretado.',
          'Pega la espalda baja a la cama.',
          'Cuenta dos. Suelta.',
        ),
      ],
    },
    {
      titulo: d.series === 2 ? `Conteo (2 series de ${d.veces})` : `Conteo (${vecesTxt(d.veces)})`,
      lineas: envolverSeries(d, serie),
    },
    { titulo: 'Respiración', lineas: respiracion(d, 'acercar la rodilla y apretar la panza', 'soltar') },
    {
      titulo: 'Qué debes sentir',
      lineas: dice('La espalda baja y la pompi se estiran.', 'La panza, firme.'),
    },
    {
      titulo: 'Qué NO debes sentir',
      lineas: dice('Dolor en la ingle.', 'Dolor en la rodilla al doblarla.', 'Si pasa, acerca menos.'),
    },
    {
      titulo: 'Versión más fácil',
      lineas: dice('Acerca la rodilla solo un poquito.', 'O toma el muslo con las manos, sin sábana.'),
    },
    { titulo: 'Transición', lineas: finEjercicio(d, false) },
  ]
  return {
    slot: 4,
    nombre: 'Rodilla al pecho y panza',
    appDosis: [
      `Rodilla al pecho: ${dosisSeriesApp(d, ' por pierna')} 2 segundos al acercar, 2 al volver.`,
      `Apretar la panza: ${dosisSeriesApp(d, '')} Aprieta 2 segundos.`,
    ],
    guion,
    ejecucionSeg: tSeries(d, 2 * d.veces * 4 + tLados(d) + d.veces * 4),
  }
}

function f2Slot5(d: Dosis): EjercicioDia {
  const serie: Linea[] = [
    ...dice('Primero, los hombros.'),
    ...cuenta('Arriba, atrás, abajo: uno, dos. Una.', 'Arriba, atrás, abajo: uno, dos. Dos.'),
    cam(`Sigue contando en voz alta hasta ${d.veces}`),
    ...dice('Ahora, la pierna con la sábana.'),
    ...repeticionesRitmo(d, 'Sube', 'Baja', { lado: 'Pierna derecha.' }),
    ...cambioLado(d, 'Pasa la sábana al pie izquierdo.'),
    ...repeticionesRitmo(d, 'Sube', 'Baja', { lado: 'Pierna izquierda.' }),
  ]
  const guion: Seccion[] = [
    {
      titulo: 'Posición inicial',
      lineas: [
        cam('plano alto, desde arriba de la cama'),
        ...dice(
          'Boca arriba.',
          'Dobla las dos rodillas. Pies en la cama.',
          'Los brazos, a los lados.',
          'Deja la sábana cerca de tu mano.',
        ),
      ],
    },
    {
      titulo: 'Movimiento 1: círculos de hombro',
      lineas: [
        cam('primer plano de los hombros'),
        ...dice(
          'Sube los hombros hacia las orejas.',
          'Llévalos hacia atrás, contra la cama.',
          'Bájalos, lejos de las orejas.',
          'Eso es un círculo.',
        ),
      ],
    },
    {
      titulo: 'Movimiento 2: estirar atrás del muslo',
      lineas: [
        cam('plano abierto desde el costado'),
        ...dice(
          'Pasa la sábana por la planta del pie derecho.',
          'Toma las puntas con las dos manos.',
          'La pierna izquierda sigue doblada.',
          'Sube la pierna derecha con ayuda de la sábana.',
          'Hasta sentir un estirón suave atrás del muslo.',
          'Baja despacio.',
        ),
      ],
    },
    {
      titulo: d.series === 2 ? `Conteo (2 series de ${d.veces})` : `Conteo (${vecesTxt(d.veces)})`,
      lineas: envolverSeries(d, serie),
    },
    { titulo: 'Respiración', lineas: respiracion(d, 'subir la pierna', 'bajarla') },
    {
      titulo: 'Qué debes sentir',
      lineas: dice('Los hombros, sueltos.', 'Un estirón suave atrás del muslo.'),
    },
    {
      titulo: 'Qué NO debes sentir',
      lineas: dice('Un tirón fuerte detrás de la rodilla.', 'Hormigueo en la pierna.', 'Si pasa, baja la pierna.'),
    },
    {
      titulo: 'Versión más fácil',
      lineas: dice('Dobla un poquito la rodilla.', 'Sube la pierna menos.'),
    },
    {
      titulo: 'Cierre con respiración',
      lineas: [
        cam('plano abierto, luz suave'),
        ...dice(
          'Suelta la sábana. Estira las piernas.',
          'Para terminar, tres respiraciones lentas.',
          'Pon una mano sobre la panza.',
          'Toma aire. La panza sube.',
          'Suelta el aire. La panza baja.',
        ),
        cam('Haz las tres respiraciones con ella, en silencio'),
      ],
    },
  ]
  return {
    slot: 5,
    nombre: 'Hombros y atrás del muslo',
    appDosis: [
      `Círculos de hombro de 2 segundos: ${dosisSeriesApp(d, '')}`,
      `Estirar atrás del muslo: ${dosisSeriesApp(d, ' por pierna')} ${APP_RITMO}`,
      'Al final, 3 respiraciones lentas.',
    ],
    guion,
    ejecucionSeg: tSeries(d, d.veces * 2 + 2 * d.veces * 4 + tLados(d)) + 24,
  }
}

/** Os 5 exercícios do dia, na ordem dos slots. */
export function ejerciciosDelDia(dia: Dia): EjercicioDia[] {
  const d = dia.dosis
  if (dia.fase === 1) return [f1Slot1(d), f1Slot2(d), f1Slot3(d), f1Slot4(d), f1Slot5(d)]
  return [f2Slot1(d), f2Slot2(d), f2Slot3(d), f2Slot4(d), f2Slot5(d)]
}

// =====================================================================
// BodyMy — "Protocolo Descompresión Articular — Reto 14 días" (en la cama)
//
// FONTE ÚNICA do reto de 14 dias feito inteiramente na cama. Daqui saem:
//   • a migração do app (lições por dia: vídeo + texto de apoio), e
//   • os roteiros de vídeo da Lucy em /guiones/dia-XX.md.
// Gerador: `npm run gen:reto-cama` (scripts/gen-reto-cama.ts).
//
// Público: mulheres 45+ com artrite, artrose ou desgaste articular.
// Material: 1 toalha enrolada, 1 travesseiro, 1 lençol. Nada mais.
//
// Regras de linguagem (conteúdo final): espanhol neutro LATAM, "tú",
// frases de até 12 palavras, uma ação por linha, zero jargão, sem
// promessa de cura. As 4 regras de segurança são texto FIXO (literal).
//
// Convenções de dose (a tabela do reto é a fonte; aqui só se explicita):
//   • "veces" = repetições POR LADO nos exercícios feitos de um lado por vez.
//   • Fase 1: "segundos" = quanto tempo ela sustenta a posição de esforço.
//   • Balançar os joelhos: 1 vez = direita e esquerda (sustenta nos dois lados).
//   • Fase 2: ritmo fixo (sobe em 2 s, desce em 2 s; círculos em 2 s).
//   • Exercício com duas partes: 1 série = parte A + parte B.
//   • Dia 12: "aguantar 10 s arriba" = na ÚLTIMA vez de cada série.
//   • Perna estirada e ponte: curto/mini nos dias 8–10, completo 11–14.
// =====================================================================

export type Fase = 1 | 2

export interface Dosis {
  veces: number
  /** Fase 1: segundos sosteniendo. Día 7: ritmo lento (sin sostener). */
  seg: number
  series: 1 | 2
  descansoSeg: number // entre series (0 = una serie)
  suave: boolean // día 7: solo movimiento suave
  respiracionCoordinada: boolean // desde el día 3
  sinPausaLados: boolean // desde el día 4
  masMovimiento: boolean // días 5 y 6
  sostenerArriba: number // día 12: segundos arriba en la última vez
  sinParar: boolean // día 13: sin parar entre ejercicios
  completo: boolean // fase 2: pierna y puente completos
}

export interface Dia {
  numero: number
  fase: Fase
  foco: string // 3 palabras
  dosis: Dosis
  novedad: string | null
  hoyVasA: [string, string]
  manana: string
  apertura: string[] // ~30 s
  hito: string[] | null // días 3, 7, 10 y 14
  cierre: string[] // ~30 s
  autoevaluacion: 'primera' | 'repetir' | null
}

// ---------------------------------------------------------------------
// Textos fijos
// ---------------------------------------------------------------------
export const MATERIAL = ['Una toalla enrollada.', 'Una almohada.', 'Una sábana.']

export const REGLAS_SEGURIDAD = [
  'Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.',
  'Nunca aguantes la respiración. Suelta el aire cuando hagas fuerza.',
  'Si hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.',
  'Si la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta.',
] as const

export const AVISO_MEDICO = [
  'Consulta a tu médico o fisioterapeuta antes de empezar.',
  'Sobre todo si tienes prótesis, una cirugía reciente u osteoporosis avanzada.',
  'Este reto no reemplaza tu tratamiento.',
  'Si algo te preocupa, para y consulta.',
]

// Versão curta para o texto de apoio (o roteiro usa a longa, acima).
export const AUTOEVALUACION_APP = [
  '1. Dolor al despertar.',
  '2. Minutos de rigidez al despertar. 10 es una hora o más.',
  '3. Dificultad para levantarte de la cama.',
  '4. Cómo dormiste.',
  '5. Tu ánimo.',
  'En las preguntas 1, 2 y 3, 0 es nada.',
  'En las preguntas 4 y 5, 10 es muy bien.',
]

export const AUTOEVALUACION = [
  'Dolor al despertar. 0 es nada. 10 es muchísimo.',
  'Minutos de rigidez al despertar. 0 es nada. 10 es una hora o más.',
  'Dificultad para levantarte de la cama. 0 es fácil. 10 es muy difícil.',
  'Cómo dormiste. 0 es muy mal. 10 es muy bien.',
  'Tu ánimo. 0 es muy bajo. 10 es muy bueno.',
]

// ---------------------------------------------------------------------
// Página de bienvenida (día 0)
// ---------------------------------------------------------------------
export const BIENVENIDA = {
  titulo: 'Bienvenida — Empieza aquí',
  duracaoMin: 3,
  intro:
    'Bienvenida a tu reto de 14 días. Todo se hace acostada en tu cama. Solo necesitas entre 10 y 20 minutos al día.',
  paraQuien: [
    'Para mujeres de 45 años o más.',
    'Con artritis, artrosis o desgaste en las articulaciones.',
    'Para ti, si te cuesta moverte al despertar.',
    'Para ti, si quieres aflojar el cuerpo sin salir de la cama.',
  ],
  comoUsar: [
    'Haz un día por vez.',
    'Pon el video del día.',
    'Escucha a Lucy y haz lo que ella dice.',
    'No necesitas mirar la pantalla.',
    'Al terminar, toca el botón «Terminé».',
    'Si un día no puedes, sigue al día siguiente.',
  ],
  comoEsta: [
    'Días 1 a 7: despertar y aflojar el cuerpo.',
    'Días 8 a 14: sumar fuerza, poco a poco.',
    'Días 7 y 14: una prueba corta para ver cómo vas.',
  ],
  consejo: 'Hazlo a la misma hora cada día. Por ejemplo, al despertar.',
}

// ---------------------------------------------------------------------
// Dosis por día (tabla del reto)
// ---------------------------------------------------------------------
function dosis(p: Partial<Dosis> & Pick<Dosis, 'veces'>): Dosis {
  return {
    seg: 0,
    series: 1,
    descansoSeg: 0,
    suave: false,
    respiracionCoordinada: false,
    sinPausaLados: false,
    masMovimiento: false,
    sostenerArriba: 0,
    sinParar: false,
    completo: false,
    ...p,
  }
}

// Lo que ya se sumó sigue: respiración coordinada (desde el día 3) y
// cambio de lado sin pausa (desde el día 4).
const ACUMULADO = { respiracionCoordinada: true, sinPausaLados: true }

export const DIAS: Dia[] = [
  {
    numero: 1,
    fase: 1,
    foco: 'Conoce tu cuerpo',
    dosis: dosis({ veces: 5, seg: 5 }),
    novedad: 'Aprender las 5 posiciones.',
    hoyVasA: [
      'Hoy vas a conocer las cinco posiciones del reto.',
      'Todo es suave, lento y en tu cama.',
    ],
    manana: 'Mañana repites lo mismo, con una vez más.',
    apertura: [
      '¡Hola! Qué gusto tenerte aquí.',
      'Soy Lucy. Este es tu primer día.',
      'Hoy no venimos a hacer fuerza.',
      'Hoy venimos a conocer tu cuerpo.',
      'Vas a aprender cinco posiciones, todas en tu cama.',
      'Ten cerca tu toalla, tu almohada y tu sábana.',
      'No necesitas mirar la pantalla. Solo escúchame.',
    ],
    hito: null,
    cierre: [
      'Listo. Terminaste tu primer día.',
      'Quédate un momento acostada.',
      'Quizás sientes el cuerpo tibio y más suelto.',
      'Eso es buena señal.',
      'Hoy aprendiste las cinco posiciones. Eso ya es mucho.',
      'Mañana repetimos lo mismo, con una vez más.',
      'Nos vemos mañana.',
    ],
    autoevaluacion: null,
  },
  {
    numero: 2,
    fase: 1,
    foco: 'Repetir con calma',
    dosis: dosis({ veces: 6, seg: 5 }),
    novedad: null,
    hoyVasA: [
      'Hoy vas a repetir las cinco posiciones de ayer.',
      'Cada ejercicio sube a seis veces.',
    ],
    manana: 'Mañana vas a mover el cuerpo al ritmo de tu respiración.',
    apertura: [
      '¡Hola! Bienvenida al día dos.',
      'Hoy hacemos lo mismo que ayer.',
      'Solo sumamos una vez más a cada ejercicio.',
      'Repetir ayuda a que el cuerpo aprenda.',
      'Ya conoces las posiciones. Hoy te van a salir mejor.',
      'Ten a mano tu toalla, tu almohada y tu sábana.',
    ],
    hito: null,
    cierre: [
      'Muy bien. Terminaste el día dos.',
      'Respira tranquila un momento.',
      'Tu cuerpo debe sentirse tibio, no cansado.',
      'Hoy hiciste seis veces cada ejercicio. Felicidades.',
      'Mañana vamos a sumar algo nuevo: la respiración.',
      'Te espero mañana.',
    ],
    autoevaluacion: null,
  },
  {
    numero: 3,
    fase: 1,
    foco: 'Respira con ritmo',
    dosis: dosis({ veces: 8, seg: 6, respiracionCoordinada: true }),
    novedad: 'Respiración coordinada.',
    hoyVasA: [
      'Hoy vas a mover el cuerpo al ritmo de tu respiración.',
      'Sueltas el aire cuando haces fuerza.',
    ],
    manana: 'Mañana cambias de lado sin parar.',
    apertura: [
      '¡Hola! Llegaste al día tres.',
      'Hoy sumamos la respiración a cada movimiento.',
      'Cuando haces fuerza, sueltas el aire.',
      'Cuando aflojas, tomas aire.',
      'Hoy son ocho veces y aguantas seis segundos.',
    ],
    hito: [
      'Ya van tres días seguidos.',
      'Quizás notas algo al despertar.',
      'Tal vez las manos o los pies se aflojan más rápido.',
      'Si lo notas, es tu cuerpo respondiendo.',
    ],
    cierre: [
      'Muy bien. Terminaste el día tres.',
      'Pon una mano en la panza. Respira lento.',
      'El cuerpo debe sentirse suelto y tranquilo.',
      'Hoy moviste el cuerpo con tu respiración. Eso no es fácil.',
      'Mañana cambias de lado sin parar.',
      'Nos vemos mañana.',
    ],
    autoevaluacion: null,
  },
  {
    numero: 4,
    fase: 1,
    foco: 'Afianzar lo aprendido',
    dosis: dosis({ veces: 8, seg: 8, ...ACUMULADO }),
    novedad: 'Segundo lado sin pausa.',
    hoyVasA: [
      'Hoy vas a aguantar ocho segundos en cada ejercicio.',
      'Al terminar un lado, pasas al otro sin parar.',
    ],
    manana: 'Mañana el movimiento será un poquito más grande.',
    apertura: [
      '¡Hola! Bienvenida al día cuatro.',
      'Hoy afianzamos lo que ya sabes.',
      'Son ocho veces y aguantas ocho segundos.',
      'Algo nuevo: cuando termines un lado, pasas al otro.',
      'Sin parar en medio.',
      'Recuerda soltar el aire al hacer fuerza.',
    ],
    hito: null,
    cierre: [
      'Excelente. Terminaste el día cuatro.',
      'Quédate quieta y respira.',
      'Puedes sentir los músculos trabajados. Eso está bien.',
      'Dolor, no. Cansancio suave, sí.',
      'Hoy cambiaste de lado sin parar. Muy bien hecho.',
      'Mañana hacemos el movimiento un poquito más grande.',
    ],
    autoevaluacion: null,
  },
  {
    numero: 5,
    fase: 1,
    foco: 'Ampliar el movimiento',
    dosis: dosis({ veces: 10, seg: 8, ...ACUMULADO, masMovimiento: true }),
    novedad: 'Un poquito más de movimiento.',
    hoyVasA: [
      'Hoy vas a hacer cada movimiento un poquito más grande.',
      'Solo hasta donde no duela.',
    ],
    manana: 'Mañana aguantas diez segundos la fuerza.',
    apertura: [
      '¡Hola! Llegaste al día cinco.',
      'Hoy son diez veces y aguantas ocho segundos.',
      'Y algo nuevo: el movimiento crece un poquito.',
      'Un poquito, no mucho.',
      'Solo hasta donde tu cuerpo te deja sin dolor.',
    ],
    hito: null,
    cierre: [
      'Muy bien. Terminaste el día cinco.',
      'Respira lento un momento.',
      'Quizás hoy llegaste un poquito más lejos.',
      'Eso es moverte mejor.',
      'Hiciste diez veces cada ejercicio. Felicidades.',
      'Mañana aguantamos la fuerza diez segundos.',
    ],
    autoevaluacion: null,
  },
  {
    numero: 6,
    fase: 1,
    foco: 'Sostener más tiempo',
    dosis: dosis({ veces: 10, seg: 10, ...ACUMULADO, masMovimiento: true }),
    novedad: 'Fuerza más larga.',
    hoyVasA: [
      'Hoy vas a sostener cada posición diez segundos.',
      'Es la fuerza más larga de la semana.',
    ],
    manana: 'Mañana es un día suave y haces una prueba corta.',
    apertura: [
      '¡Hola! Bienvenida al día seis.',
      'Hoy es el día más largo de la semana.',
      'Son diez veces y aguantas diez segundos.',
      'Si te cansas, haz la versión más fácil.',
      'Eso también cuenta.',
      'Recuerda: nunca aguantes la respiración.',
    ],
    hito: null,
    cierre: [
      'Lo lograste. Terminaste el día seis.',
      'Quédate acostada y respira.',
      'Puedes sentir cansancio suave en los músculos.',
      'Hoy aguantaste diez segundos cada vez. Eso es fuerza.',
      'Mañana es un día suave, para descansar moviéndote.',
      'Y haremos una prueba corta.',
    ],
    autoevaluacion: null,
  },
  {
    numero: 7,
    fase: 1,
    foco: 'Descanso y autoevaluación',
    dosis: dosis({ veces: 5, seg: 2, ...ACUMULADO, suave: true }),
    novedad: 'Descanso activo y autoevaluación.',
    hoyVasA: [
      'Hoy vas a mover el cuerpo muy suave, sin hacer fuerza.',
      'Al final, contestas cinco preguntas cortas.',
    ],
    manana: 'Mañana empieza la segunda semana, con ejercicios de fuerza.',
    apertura: [
      '¡Hola! Llegaste al día siete.',
      'Hoy es descanso activo.',
      'Eso quiere decir: moverte suave, sin fuerza.',
      'Son cinco veces, despacio.',
      'Al final, te hago cinco preguntas.',
      'Ten cerca un papel y un lápiz.',
    ],
    hito: [
      'Ya llevas una semana completa.',
      'Quizás te das vuelta en la cama con más facilidad.',
      'O te levantas un poco más suelta.',
      'Hoy lo vamos a anotar.',
    ],
    cierre: [
      'Muy bien. Terminaste tu primera semana.',
      'Siete días seguidos cuidando tu cuerpo. Felicidades.',
      'Guarda el papel con tus números.',
      'El día catorce los vas a comparar.',
      'Mañana empieza la segunda semana.',
      'Llegan ejercicios nuevos de fuerza.',
    ],
    autoevaluacion: 'primera',
  },
  {
    numero: 8,
    fase: 2,
    foco: 'Empieza la fuerza',
    dosis: dosis({ veces: 8, ...ACUMULADO }),
    novedad: 'Cambian los ejercicios 2, 3 y 5. El 1 y el 4 suben un poquito.',
    hoyVasA: [
      'Hoy empieza la segunda semana, con ejercicios de fuerza.',
      'Cambian tres ejercicios y los otros dos suben un poquito.',
    ],
    manana: 'Mañana repites estos ejercicios, diez veces cada uno.',
    apertura: [
      '¡Hola! Bienvenida a la segunda semana.',
      'Hoy empieza la fuerza.',
      'Cambian tres ejercicios: la pierna, la cadera y los hombros.',
      'Los otros dos suben un poquito.',
      'Son ocho veces cada uno.',
      'Sube en dos segundos. Baja en dos segundos.',
      'Te explico todo paso a paso.',
    ],
    hito: null,
    cierre: [
      'Muy bien. Terminaste el día ocho.',
      'Respira tranquila.',
      'Es normal sentir los músculos trabajados.',
      'Dolor en la articulación, no.',
      'Hoy aprendiste tres ejercicios nuevos. Felicidades.',
      'Mañana los repetimos, diez veces cada uno.',
    ],
    autoevaluacion: null,
  },
  {
    numero: 9,
    fase: 2,
    foco: 'Repetir la fuerza',
    dosis: dosis({ veces: 10, ...ACUMULADO }),
    novedad: null,
    hoyVasA: [
      'Hoy vas a repetir los ejercicios de fuerza de ayer.',
      'Cada uno sube a diez veces.',
    ],
    manana: 'Mañana haces dos series, con descanso en medio.',
    apertura: [
      '¡Hola! Llegaste al día nueve.',
      'Hoy repetimos los ejercicios de ayer.',
      'Ahora son diez veces cada uno.',
      'Ya los conoces. Hoy te van a salir mejor.',
      'Sube en dos segundos. Baja en dos segundos.',
    ],
    hito: null,
    cierre: [
      'Excelente. Terminaste el día nueve.',
      'Quédate acostada un momento.',
      'Tu cuerpo debe sentirse tibio y trabajado.',
      'Hoy hiciste diez veces cada ejercicio. Muy bien.',
      'Mañana hacemos dos series, con descanso en medio.',
    ],
    autoevaluacion: null,
  },
  {
    numero: 10,
    fase: 2,
    foco: 'Dos series hoy',
    dosis: dosis({ veces: 8, series: 2, descansoSeg: 30, ...ACUMULADO }),
    novedad: 'Dos series, con 30 segundos de descanso.',
    hoyVasA: [
      'Hoy vas a hacer cada ejercicio dos veces seguidas.',
      'Entre una y otra, descansas treinta segundos.',
    ],
    manana: 'Mañana la pierna y el puente suben completos.',
    apertura: [
      '¡Hola! Bienvenida al día diez.',
      'Hoy hay algo nuevo: dos series.',
      'Haces ocho veces. Descansas treinta segundos.',
      'Y haces ocho veces más.',
      'En el descanso, solo respira.',
    ],
    hito: [
      'Llevas diez días. Mira lo que ya haces.',
      'Hoy tu cuerpo aguanta el doble que el día uno.',
      'Quizás notas las piernas más firmes al levantarte.',
    ],
    cierre: [
      'Muy bien. Terminaste el día diez.',
      'Respira lento, con una mano en la panza.',
      'Puedes sentir cansancio suave en los músculos.',
      'Hoy hiciste dos series de todo. Eso es resistencia.',
      'Mañana la pierna y el puente suben completos.',
    ],
    autoevaluacion: null,
  },
  {
    numero: 11,
    fase: 2,
    foco: 'Afianzar la fuerza',
    dosis: dosis({ veces: 10, series: 2, descansoSeg: 30, ...ACUMULADO, completo: true }),
    novedad: 'La pierna estirada y el puente suben completos.',
    hoyVasA: [
      'Hoy vas a hacer dos series de diez.',
      'La pierna estirada y el puente suben completos.',
    ],
    manana: 'Mañana aguantas diez segundos arriba en la pierna y el puente.',
    apertura: [
      '¡Hola! Llegaste al día once.',
      'Hoy son dos series de diez.',
      'Y algo nuevo: la pierna y el puente suben completos.',
      'Solo hasta donde estés cómoda.',
      'Si duele, vuelve a la versión corta.',
    ],
    hito: null,
    cierre: [
      'Excelente. Terminaste el día once.',
      'Quédate quieta y respira.',
      'El cuerpo debe sentirse trabajado, no adolorido.',
      'Hoy subiste la pierna y el puente completos. Felicidades.',
      'Mañana aguantamos arriba diez segundos.',
    ],
    autoevaluacion: null,
  },
  {
    numero: 12,
    fase: 2,
    foco: 'Aguantar más arriba',
    dosis: dosis({ veces: 10, series: 2, descansoSeg: 30, ...ACUMULADO, completo: true, sostenerArriba: 10 }),
    novedad: 'Puente y pierna sostenidos 10 segundos arriba.',
    hoyVasA: [
      'Hoy haces dos series de diez.',
      'En la pierna y el puente, aguantas arriba al final.',
    ],
    manana: 'Mañana haces todo seguido, sin parar.',
    apertura: [
      '¡Hola! Bienvenida al día doce.',
      'Hoy trabajamos la resistencia.',
      'Son dos series de diez.',
      'En la pierna y el puente hay algo nuevo.',
      'En la última vez, te quedas arriba diez segundos.',
      'Respirando. Nunca aguantes el aire.',
    ],
    hito: null,
    cierre: [
      'Lo lograste. Terminaste el día doce.',
      'Respira lento un momento.',
      'Puedes sentir las piernas y las pompis trabajadas.',
      'Hoy aguantaste diez segundos arriba. Eso es resistencia.',
      'Mañana hacemos todo seguido, sin parar.',
    ],
    autoevaluacion: null,
  },
  {
    numero: 13,
    fase: 2,
    foco: 'Todo sin parar',
    dosis: dosis({ veces: 10, series: 2, descansoSeg: 30, ...ACUMULADO, completo: true, sinParar: true }),
    novedad: 'Sin parar entre ejercicios.',
    hoyVasA: [
      'Hoy vas a hacer los cinco ejercicios seguidos.',
      'Terminas uno y pasas al siguiente, sin parar.',
    ],
    manana: 'Mañana es el último día y repites la prueba corta.',
    apertura: [
      '¡Hola! Llegaste al día trece.',
      'Hoy hacemos todo seguido.',
      'Terminas un ejercicio y pasas al otro.',
      'Solo descansas entre las dos series.',
      'Son dos series de diez.',
      'Ve a tu ritmo. Si necesitas parar, para.',
    ],
    hito: null,
    cierre: [
      'Increíble. Terminaste el día trece.',
      'Quédate acostada y respira.',
      'Hoy hiciste todo seguido. Hace dos semanas, esto no era posible.',
      'Mañana es el último día.',
      'Ten cerca tu papel con los números del día siete.',
    ],
    autoevaluacion: null,
  },
  {
    numero: 14,
    fase: 2,
    foco: 'Cierre y prueba',
    dosis: dosis({ veces: 10, series: 2, descansoSeg: 30, ...ACUMULADO, completo: true }),
    novedad: 'Repetir la autoevaluación.',
    hoyVasA: [
      'Hoy es tu último día: dos series de diez.',
      'Al final, repites la prueba y comparas con el día siete.',
    ],
    manana: 'Mañana puedes seguir con la Parte 2: ejercicios en silla.',
    apertura: [
      '¡Hola! Llegaste al día catorce.',
      'Es tu último día del reto.',
      'Hoy son dos series de diez.',
      'Al final, repetimos las cinco preguntas.',
      'Ten cerca tu papel del día siete.',
    ],
    hito: [
      'Hoy vas a ver tu avance en números.',
      'Compara con lo que anotaste el día siete.',
      'Cada número que mejora es un paso ganado.',
    ],
    cierre: [
      'Terminaste el reto de catorce días. ¡Felicidades!',
      'Catorce días cuidando tus articulaciones.',
      'Mira tus números. Mira lo que lograste.',
      'Tu cuerpo aprendió a moverse mejor.',
      'Ahora puedes seguir con la Parte 2.',
      'La hacemos sentadas en una silla. Te espero ahí.',
    ],
    autoevaluacion: 'repetir',
  },
]

export const TOTAL_DIAS = DIAS.length

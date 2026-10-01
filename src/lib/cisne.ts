// =====================================================================
// BodyMy — Reset Postura de Cisne · Reto 14 días
//
// Conteúdo do módulo, transcrito do PDF original ("Reset - Postura de
// Cisne | Reto 14 Días"). Fica no código (versionado, sem depender do
// banco) — o banco guarda só o produto, o programa e o registro diário
// da aluna (tabela cisne_registros).
//
// Estrutura do reto:
//   • Semana 1 (dias 1–7): um ciclo de 7 sessões com 4 movimentos cada,
//     sem repetir nenhum movimento da sessão anterior.
//   • Semana 2 (dias 8–14): o MESMO ciclo, com a intensidade seguinte
//     (mais repetições / mais tempo sustentando).
//
// Puro (sem server-only): usado tanto no servidor quanto nos componentes.
// =====================================================================

export const CISNE_PRODUCT_SLUG = 'reset-postura-cisne'
export const CISNE_PROGRAM_SLUG = 'reset-postura-cisne'
export const CISNE_NOME = 'Reset Postura de Cisne'
export const CISNE_CHECKOUT_URL = 'https://pay.hotmart.com/C107702699A?checkoutMode=10'
// O PDF original (guia prático resumido). Público, como a página de obrigado.
export const CISNE_GUIA_PDF = '/guias/cisne/reset-postura-de-cisne-guia.pdf'

export const CISNE_DIAS_CICLO = 7
export const CISNE_SEMANAS = 2
export const CISNE_TOTAL_DIAS = CISNE_DIAS_CICLO * CISNE_SEMANAS // 14
export const CISNE_MOVIMENTOS_POR_DIA = 4
// Dias de foto de perfil (antes / metade / depois).
export const CISNE_DIAS_FOTO = [1, 7, 14]

export type CisneExercicioId =
  | 'respiracion'
  | 'menton'
  | 'presion'
  | 'si'
  | 'giro'
  | 'oreja'
  | 'lengua'
  | 'hombros'
  | 'angeles'
  | 'brazos'
  | 'toalla'
  | 'libro'

export interface CisneExercicio {
  id: CisneExercicioId
  numero: number // numeração da biblioteca do PDF (01–12)
  nome: string
  objetivo: string
  imagem: string
  posicaoInicial: string
  passos: string[]
  maisFacil: string
  correto: string
  evita: string
  // Dose por intensidade, na ordem do PDF: [Despertar, Alinear, Cuello de Cisne].
  doses: [string, string, string]
}

// Qual coluna de dose do PDF cada semana usa. Semana 1 = Despertar,
// semana 2 = Alinear. Para um reto mais puxado, troque o 1 por 2
// (Cuello de Cisne) — nada mais precisa mudar.
const DOSE_POR_SEMANA: [number, number] = [0, 1]

export function doseNaSemana(exercicio: CisneExercicio, semana: 1 | 2): string {
  return exercicio.doses[DOSE_POR_SEMANA[semana - 1]]
}

export const CISNE_INTENSIDADES = [
  { semana: 1, nome: 'Despertar', descricao: 'Tu cuerpo aprende la posición correcta. Movimientos suaves, pocas repeticiones.' },
  { semana: 2, nome: 'Alinear', descricao: 'Los mismos movimientos, sosteniendo más tiempo y con más repeticiones.' },
] as const

export const CISNE_EXERCICIOS: Record<CisneExercicioId, CisneExercicio> = {
  respiracion: {
    id: 'respiracion',
    numero: 1,
    nome: 'Respiración de Cisne',
    objetivo: 'Soltar la tensión del cuello y los hombros antes de empezar.',
    imagem: '/guias/cisne/respiracion.webp',
    posicaoInicial:
      'Boca arriba, almohada delgada, rodillas dobladas y pies apoyados en la cama. Manos sobre las costillas bajas.',
    passos: [
      'Inhala lento por la nariz y siente cómo tus costillas se abren hacia los lados, bajo tus manos.',
      'Exhala por la boca, despacio, como si soplaras una vela sin apagarla.',
      'Al exhalar, deja que tus hombros se hundan en el colchón y que tu mandíbula se afloje.',
      'Mantén el cuello quieto y largo durante toda la respiración.',
    ],
    maisFacil: 'Si te mareas, respira más corto y natural.',
    correto: 'Hombros pesados, mandíbula suelta, respiración lenta.',
    evita: 'Subir los hombros hacia las orejas al inhalar.',
    doses: ['6 respiraciones', '8 respiraciones', '10 respiraciones'],
  },
  menton: {
    id: 'menton',
    numero: 2,
    nome: 'Mentón hacia Atrás',
    objetivo: 'El ejercicio estrella: devuelve la cabeza a su lugar y alarga la nuca.',
    imagem: '/guias/cisne/menton.webp',
    posicaoInicial: 'Boca arriba, almohada delgada (o sin almohada), rodillas dobladas, mirada al techo.',
    passos: [
      'Sin levantar la cabeza, lleva el mentón recto hacia atrás, hacia el colchón, como si hicieras una papada a propósito.',
      'Sentirás que la parte de atrás de tu cuello se alarga sobre la almohada.',
      'Sostén la posición contando lento.',
      'Suelta despacio y vuelve al inicio.',
    ],
    maisFacil: 'Haz el movimiento más pequeño y sostén solo 2 segundos.',
    correto: 'Movimiento pequeño, mirada siempre al techo.',
    evita: 'Bajar la barbilla hacia el pecho o levantar la cabeza.',
    doses: ['8 veces · sostén 3 s', '10 veces · sostén 5 s', '12 veces · sostén 5 s'],
  },
  presion: {
    id: 'presion',
    numero: 3,
    nome: 'Presión de Nuca',
    objetivo: 'Despierta los músculos que sostienen tu cabeza erguida durante el día.',
    imagem: '/guias/cisne/presion.webp',
    posicaoInicial: 'Boca arriba, almohada delgada, rodillas dobladas, brazos relajados al costado.',
    passos: [
      'Haz primero un Mentón hacia Atrás pequeño.',
      'Desde ahí, presiona suavemente la parte de atrás de tu cabeza contra la almohada.',
      'Usa solo un 30 % de tu fuerza: es una presión suave, no un empujón.',
      'Sostén, respira y suelta despacio.',
    ],
    maisFacil: 'Presiona aún más suave y sostén 2 segundos.',
    correto: 'Presión suave y constante, respiración tranquila.',
    evita: 'Arquear la espalda, apretar los dientes o aguantar la respiración.',
    doses: ['5 veces · sostén 3 s', '6 veces · sostén 5 s', '8 veces · sostén 5 s'],
  },
  si: {
    id: 'si',
    numero: 4,
    nome: 'El “Sí” Pequeño',
    objetivo: 'Activa los músculos profundos del frente del cuello, los que afinan el perfil.',
    imagem: '/guias/cisne/si.webp',
    posicaoInicial: 'Boca arriba, almohada delgada, rodillas dobladas, mirada al techo.',
    passos: [
      'Imagina que dices “sí” con la cabeza, pero de forma diminuta.',
      'Baja el mentón apenas, sin despegar la cabeza de la almohada.',
      'Vuelve a la posición neutra con control.',
      'Repite como un movimiento lento y suave.',
    ],
    maisFacil: 'Hazlo con los ojos: mira hacia abajo y deja que el mentón acompañe.',
    correto: 'Un gesto casi invisible, lento y controlado.',
    evita: 'Levantar la cabeza o hacer el movimiento rápido.',
    doses: ['8 veces', '10 veces', '12 veces'],
  },
  giro: {
    id: 'giro',
    numero: 5,
    nome: 'Giro Lento',
    objetivo: 'Devuelve movilidad al cuello y suelta la rigidez de la mañana.',
    imagem: '/guias/cisne/giro.webp',
    posicaoInicial: 'Boca arriba, almohada delgada, brazos relajados al costado.',
    passos: [
      'Con el cuello largo, gira la cabeza lentamente hacia un lado, como diciendo “no”.',
      'Llega solo hasta donde sea cómodo y respira ahí un momento.',
      'Vuelve al centro despacio.',
      'Repite hacia el otro lado.',
    ],
    maisFacil: 'Haz giros más cortos, a mitad de camino.',
    correto: 'Rostro relajado, giro lento y sin forzar.',
    evita: 'Girar rápido o empujar hasta sentir dolor.',
    doses: ['5 por lado', '6 por lado', '8 por lado'],
  },
  oreja: {
    id: 'oreja',
    numero: 6,
    nome: 'Oreja al Hombro',
    objetivo: 'Estira los costados del cuello, donde se acumula la tensión del día.',
    imagem: '/guias/cisne/oreja.webp',
    posicaoInicial: 'Boca arriba, mirada al techo, brazos largos al costado.',
    passos: [
      'Desliza suavemente la oreja derecha hacia el hombro derecho, sin girar la cara.',
      'Deja el brazo izquierdo largo y pesado sobre la cama.',
      'Sostén y respira: sentirás un estiramiento suave en el lado izquierdo del cuello.',
      'Vuelve al centro y cambia de lado.',
    ],
    maisFacil: 'Acorta el recorrido y sostén menos tiempo.',
    correto: 'Estiramiento suave, hombros abajo.',
    evita: 'Subir el hombro hacia la oreja o tirar de la cabeza con la mano.',
    doses: ['2 × 15 s por lado', '2 × 20 s por lado', '2 × 30 s por lado'],
  },
  lengua: {
    id: 'lengua',
    numero: 7,
    nome: 'Lengua al Paladar',
    objetivo: 'Firma la zona debajo de la mandíbula y ayuda a definir el perfil.',
    imagem: '/guias/cisne/lengua.webp',
    posicaoInicial: 'Boca arriba, almohada delgada, labios cerrados, dientes sin apretar.',
    passos: [
      'Apoya toda la lengua, de la punta a la base, contra el paladar (el techo de la boca).',
      'Presiona suavemente hacia arriba: sentirás que se activa la zona debajo del mentón.',
      'Sostén respirando por la nariz.',
      'Suelta y relaja la mandíbula.',
    ],
    maisFacil: 'Empieza solo con la punta de la lengua.',
    correto: 'Lengua completa en el paladar, rostro relajado.',
    evita: 'Apretar los dientes o tensar la frente.',
    doses: ['5 veces · sostén 5 s', '8 veces · sostén 5 s', '10 veces · sostén 8 s'],
  },
  hombros: {
    id: 'hombros',
    numero: 8,
    nome: 'Hombros a la Cama',
    objetivo: 'Aleja los hombros de las orejas y abre el pecho.',
    imagem: '/guias/cisne/hombros.webp',
    posicaoInicial: 'Boca arriba, rodillas dobladas, brazos largos al costado con las palmas hacia arriba.',
    passos: [
      'Junta suavemente los omóplatos (las paletas) por detrás.',
      'Llévalos hacia abajo, hacia la cintura, como si los guardaras en los bolsillos de atrás.',
      'Siente cómo tu pecho se abre y tu cuello se alarga.',
      'Sostén y suelta despacio.',
    ],
    maisFacil: 'Hazlo sin sostener, solo apretar y soltar.',
    correto: 'Pecho abierto, cuello largo, respiración tranquila.',
    evita: 'Arquear la zona lumbar o subir los hombros.',
    doses: ['8 veces · sostén 3 s', '10 veces · sostén 5 s', '12 veces · sostén 5 s'],
  },
  angeles: {
    id: 'angeles',
    numero: 9,
    nome: 'Ángeles en la Cama',
    objetivo: 'Abre el pecho y endereza la parte alta de la espalda, la de la “joroba”.',
    imagem: '/guias/cisne/angeles.webp',
    posicaoInicial:
      'Boca arriba, rodillas dobladas. Brazos en forma de “W” apoyados en la cama, codos a la altura de los hombros.',
    passos: [
      'Haz un Mentón hacia Atrás suave y mantenlo.',
      'Desliza los brazos hacia arriba por la sábana, como haciendo un ángel en la nieve.',
      'Sube solo hasta donde tus brazos sigan tocando la cama.',
      'Regresa a la “W” despacio, llevando los codos hacia la cintura.',
    ],
    maisFacil: 'Haz un recorrido corto o pon una almohada bajo cada codo.',
    correto: 'Brazos tocando la cama, movimiento lento.',
    evita: 'Despegar la espalda baja o forzar el recorrido.',
    doses: ['6 veces', '8 veces', '10 veces'],
  },
  brazos: {
    id: 'brazos',
    numero: 10,
    nome: 'Brazos al Cielo',
    objetivo: 'Activa los músculos que pegan los omóplatos a la espalda.',
    imagem: '/guias/cisne/brazos.webp',
    posicaoInicial: 'Boca arriba, rodillas dobladas, brazos estirados hacia el techo, palmas enfrentadas.',
    passos: [
      'Sin doblar los codos, estira los brazos un poco más hacia el techo, despegando los omóplatos.',
      'Ahora bájalos y pégalos de nuevo a la cama.',
      'Es un movimiento corto: solo se mueven los hombros, no los codos.',
      'Mantén el cuello largo y la mirada al techo.',
    ],
    maisFacil: 'Hazlo con un brazo a la vez.',
    correto: 'Codos rectos, movimiento corto y controlado.',
    evita: 'Levantar la cabeza o encoger los hombros.',
    doses: ['8 veces', '10 veces', '12 veces'],
  },
  toalla: {
    id: 'toalla',
    numero: 11,
    nome: 'Apertura con Toalla',
    objetivo: 'Abre la parte alta de la espalda y el pecho, sin ningún esfuerzo.',
    imagem: '/guias/cisne/toalla.webp',
    posicaoInicial:
      'Enrolla una toalla de baño como un cilindro. Acuéstate boca arriba con la toalla atravesada bajo la espalda alta, justo debajo de los omóplatos. Almohada delgada bajo la cabeza.',
    passos: [
      'Dobla las rodillas y apoya los pies en la cama.',
      'Abre los brazos hacia los lados con las palmas hacia arriba.',
      'Respira lento y deja que el pecho se abra con el peso de tus brazos.',
      'Para salir, gira de lado y retira la toalla.',
    ],
    maisFacil: 'Usa una toalla más delgada o enróllala menos.',
    correto: 'Sensación de pecho abierto y espalda que se estira.',
    evita: 'Dejar la cabeza colgando sin apoyo.',
    doses: ['1 minuto', '1 min 30 s', '2 minutos'],
  },
  libro: {
    id: 'libro',
    numero: 12,
    nome: 'Libro Abierto',
    objetivo: 'Gira la parte alta de la espalda y devuelve flexibilidad al pecho.',
    imagem: '/guias/cisne/libro.webp',
    posicaoInicial:
      'Acostada de lado, cabeza en la almohada, rodillas dobladas juntas, brazos estirados al frente, uno sobre otro.',
    passos: [
      'Levanta el brazo de arriba y ábrelo en un arco hacia el otro lado de la cama, como abriendo un libro.',
      'Sigue tu mano con la mirada y deja que el pecho gire.',
      'Mantén las rodillas juntas y apoyadas.',
      'Vuelve despacio a cerrar el libro. Termina las repeticiones y cambia de lado.',
    ],
    maisFacil: 'Abre solo hasta la mitad del camino.',
    correto: 'Rodillas juntas, giro lento y respiración profunda.',
    evita: 'Forzar el brazo hasta el colchón si no llega.',
    doses: ['5 por lado', '6 por lado', '8 por lado'],
  },
}

// Ordem da biblioteca (01–12).
export const CISNE_BIBLIOTECA: CisneExercicio[] = Object.values(CISNE_EXERCICIOS).sort(
  (a, b) => a.numero - b.numero,
)

// O ciclo de 7 sessões. Cada sessão tem 4 movimentos e nenhum deles se
// repete em relação à sessão anterior. Os 12 movimentos aparecem já nos
// 3 primeiros dias; Mentón hacia Atrás e Lengua al Paladar (os da
// manutenção) são os que mais voltam.
const CICLO: { titulo: string; movimentos: [CisneExercicioId, CisneExercicioId, CisneExercicioId, CisneExercicioId] }[] = [
  { titulo: 'El primer paso', movimentos: ['respiracion', 'menton', 'giro', 'hombros'] },
  { titulo: 'Encuentra tu centro', movimentos: ['lengua', 'si', 'oreja', 'brazos'] },
  { titulo: 'Abre el pecho', movimentos: ['toalla', 'presion', 'angeles', 'libro'] },
  { titulo: 'Sostener es la clave', movimentos: ['respiracion', 'menton', 'lengua', 'hombros'] },
  { titulo: 'Un día de movilidad', movimentos: ['giro', 'si', 'brazos', 'libro'] },
  { titulo: 'El hilo invisible', movimentos: ['respiracion', 'presion', 'angeles', 'oreja'] },
  { titulo: 'Mitad del camino', movimentos: ['toalla', 'menton', 'lengua', 'si'] },
]

// Títulos da semana 2 (mesmo ciclo, nova intensidade).
const TITULOS_SEMANA_2 = [
  'Subimos un nivel',
  'Fuerza suave',
  'Pecho abierto',
  'Sostener más',
  'Movilidad con control',
  'Tu nuevo perfil',
  'Cuello de Cisne',
]

// Consejo del día (1 por dia, na ordem do PDF; dias 1, 7 e 14 são de foto).
const CONSEJOS = [
  'Hoy toma tu foto de perfil “antes”: de lado, con la misma luz y a la misma distancia. La compararás el día 14.',
  'Cuando uses el celular, súbelo a la altura de tus ojos en lugar de bajar la cabeza hacia él.',
  'Cada vez que cruces una puerta, recuerda: mentón atrás, coronilla hacia arriba.',
  'Revisa tu almohada: debe dejar tu cuello alineado, ni muy alta ni completamente plana.',
  'Mientras ves la televisión, apoya la lengua en el paladar unos segundos. Nadie lo nota.',
  'Bebe agua durante el día y levántate a caminar un par de minutos cada hora.',
  'Día de revisión: toma una segunda foto de perfil y anota cómo amaneció tu cuello.',
  'Al caminar, imagina un hilo que tira suavemente de tu coronilla hacia el cielo.',
  'En la mesa, apoya la espalda en la silla y lleva la comida a la boca, no la boca al plato.',
  'Si cargas bolso, cámbialo de hombro durante el día.',
  'Revisa tus hombros tres veces hoy: si están cerca de las orejas, bájalos.',
  'Respira por la nariz durante el día; ayuda a mantener la lengua en su lugar.',
  'Al leer, sube el libro o la tablet con un cojín para no bajar la cabeza.',
  'Toma tu foto final de perfil y compárala con la del día 1. Mira cuello, mentón y hombros.',
]

export interface CisneMovimentoDoDia {
  exercicio: CisneExercicio
  dose: string
}

export interface CisneDia {
  numero: number // 1–14
  semana: 1 | 2
  diaDoCiclo: number // 1–7
  titulo: string
  intensidade: string
  movimentos: CisneMovimentoDoDia[]
  consejo: string
  diaDeFoto: boolean
}

export function isDiaValido(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= CISNE_TOTAL_DIAS
}

export function getCisneDia(numero: number): CisneDia {
  if (!isDiaValido(numero)) throw new Error(`Dia inválido do reto Cisne: ${numero}`)
  const semana = numero <= CISNE_DIAS_CICLO ? 1 : 2
  const diaDoCiclo = ((numero - 1) % CISNE_DIAS_CICLO) + 1
  const ciclo = CICLO[diaDoCiclo - 1]
  return {
    numero,
    semana,
    diaDoCiclo,
    titulo: semana === 1 ? ciclo.titulo : TITULOS_SEMANA_2[diaDoCiclo - 1],
    intensidade: CISNE_INTENSIDADES[semana - 1].nome,
    movimentos: ciclo.movimentos.map((id) => {
      const exercicio = CISNE_EXERCICIOS[id]
      return { exercicio, dose: doseNaSemana(exercicio, semana) }
    }),
    consejo: CONSEJOS[numero - 1],
    diaDeFoto: CISNE_DIAS_FOTO.includes(numero),
  }
}

export const CISNE_DIAS: CisneDia[] = Array.from({ length: CISNE_TOTAL_DIAS }, (_, i) => getCisneDia(i + 1))

// Escala "¿Cómo quedó tu cuello?" (1 = muy tenso, 5 = muy suelto).
export const CUELLO_ESCALA = [
  { valor: 1, label: 'Muy tenso' },
  { valor: 2, label: 'Tenso' },
  { valor: 3, label: 'Normal' },
  { valor: 4, label: 'Suelto' },
  { valor: 5, label: 'Muy suelto' },
] as const

// ---------------------------------------------------------------------
// Textos da guia (Bienvenida / Antes de empezar / Día 15 en adelante)
// ---------------------------------------------------------------------
export const CISNE_GUIA = {
  bienvenida: {
    titulo: 'Tu cuello no está “viejo”. Está desalineado.',
    texto:
      'Años mirando hacia abajo (el celular, la cocina, la costura, la computadora) empujan la cabeza hacia adelante. Cuando eso pasa, el cuello se acorta, los hombros se redondean y la piel debajo del mentón pierde su soporte. Esta rutina trabaja justo ahí: devuelve la cabeza a su lugar y despierta los músculos que la sostienen.',
  },
  comoFunciona: [
    { titulo: '4 movimientos por sesión', texto: 'Cada día tiene sus 4 ejercicios, en orden, y cuántas veces hacerlos. Nunca repites los de la sesión anterior.' },
    { titulo: '10 minutos, en la cama', texto: 'No necesitas bajar al piso. Puedes hacerlo al despertar o antes de dormir.' },
    { titulo: '2 semanas, 2 intensidades', texto: 'En la semana 1 tu cuerpo aprende. En la semana 2 repites el mismo ciclo con más repeticiones y más tiempo sosteniendo.' },
    { titulo: 'Biblioteca ilustrada', texto: 'Cada ejercicio tiene dibujo, paso a paso, lo correcto, qué evitar y una opción más fácil.' },
  ],
  queNecesitas: [
    { destaque: 'Tu cama', texto: ', idealmente con un colchón firme.' },
    { destaque: 'Una almohada delgada', texto: ' (o una toalla doblada). Si tu almohada es muy alta, empuja la cabeza hacia adelante.' },
    { destaque: 'Una toalla de baño', texto: ' para la Apertura con Toalla.' },
    { destaque: 'Tu celular', texto: ', para tomar tus fotos de perfil del día 1, 7 y 14.' },
    { destaque: '10 minutos', texto: ' y un momento tranquilo del día, siempre a la misma hora si puedes.' },
  ],
  reglasDeOro: [
    'Muévete despacio. Aquí gana la calidad, no la velocidad.',
    'Una sensación de estiramiento suave es normal. El dolor, no.',
    'Respira todo el tiempo. Nunca aguantes el aire.',
    'Es mejor hacer un poco cada día que mucho un solo día.',
    'Si un ejercicio te cuesta, usa la opción “Más fácil”.',
  ],
  detenteSi: [
    'Dolor punzante en el cuello, la espalda o los hombros.',
    'Mareo, vértigo o visión borrosa.',
    'Hormigueo o adormecimiento en brazos o manos.',
    'Dolor de cabeza que aparece durante el ejercicio.',
  ],
  detenteNota: 'Descansa y, si se repite, consulta a tu médico.',
  consultaMedico:
    'Tienes hernia o artrosis cervical diagnosticada, osteoporosis avanzada, vértigo frecuente, presión arterial no controlada, una cirugía reciente de cuello, hombros o espalda, o cualquier condición de salud que te preocupe.',
  fotoPerfil:
    'Párate de lado junto a una pared lisa, relajada, mirando al frente. Pide que te tomen la foto a la altura del hombro. Repite en el día 7 y en el día 14, con la misma luz y distancia.',
  aviso:
    'Esta guía es un programa de ejercicios suaves de bienestar y no sustituye la orientación de un profesional de la salud. Los resultados varían de persona a persona.',
  paraMantener: [
    'Repite el Día 14 tres veces por semana.',
    'Haz Mentón hacia Atrás y Lengua al Paladar cada día, aunque sea 1 minuto.',
    'Si un día te sientes rígida, vuelve a la Semana 1.',
  ],
  duranteElDia: [
    'Pantallas a la altura de los ojos.',
    'Hombros lejos de las orejas.',
    'Coronilla hacia el cielo al caminar.',
    'Almohada que mantenga el cuello alineado.',
  ],
} as const

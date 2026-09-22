// =====================================================================
// BodyMy — Protocolo "Suelta las Manos" (circuito 'manos').
// Manos, dedos y muñecas. 7 días × 4 ejercicios + bloque diario de
// movilidad (6 movimientos).
// =====================================================================

import type { ProtocoloConteudo } from './tipos'

const T: Record<number, string> = {
  1: 'Día 1 — Calentar y soltar las manos',
  2: 'Día 2 — Muñecas en movimiento',
  3: 'Día 3 — Dedos ágiles',
  4: 'Día 4 — Estirar con suavidad',
  5: 'Día 5 — Agarre suave',
  6: 'Día 6 — Destreza y coordinación',
  7: 'Día 7 — Integrar y relajar',
}

export const protocolo: ProtocoloConteudo = {
  circuito: 'manos',
  semanas: 1,
  alongamentos: [
    { ordem: 1, nome: 'Frotar las palmas', descricao: 'Frota las palmas de las manos entre sí con ritmo tranquilo hasta sentir calor. Después apóyalas unos segundos sobre los muslos.', lados: 1 },
    { ordem: 2, nome: 'Abrir y cerrar las manos', descricao: 'Abre las manos estirando los dedos como una estrella y ciérralas en un puño suave. Movimiento lento y sin apretar.', lados: 1 },
    { ordem: 3, nome: 'Círculos de muñeca', descricao: 'Con los codos apoyados en una mesa, dibuja círculos lentos con las muñecas. Cambia de dirección a la mitad.', lados: 1 },
    { ordem: 4, nome: 'Estiramiento de palma', descricao: 'Estira un brazo al frente con la palma hacia afuera y, con la otra mano, lleva los dedos suavemente hacia ti. Luego cambia de mano.', lados: 2 },
    { ordem: 5, nome: 'Estiramiento del dorso', descricao: 'Estira un brazo al frente con la palma hacia abajo y lleva suavemente el dorso de la mano hacia ti con la otra mano. Luego cambia.', lados: 2 },
    { ordem: 6, nome: 'Sacudir las manos', descricao: 'Deja los brazos sueltos y sacude las manos con suavidad, como si quisieras secarlas. Suelta también los hombros.', lados: 1 },
  ],
  exercicios: [
    // ----- Día 1 -----
    {
      dia: 1, ordem: 1, nome: 'Manos en agua tibia', descricao: T[1], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada frente a una mesa con un recipiente de agua tibia, o simplemente con las manos sobre los muslos.',
        movimento: 'Abre y cierra las manos despacio dentro del agua (o en el aire), moviendo todos los dedos a la vez.',
        respiracao: 'Respira tranquila, soltando el aire largo.',
        sentir: 'Calor y más facilidad para mover los dedos.',
        atencao: 'El agua debe estar tibia y agradable, nunca caliente.',
      }],
    },
    {
      dia: 1, ordem: 2, nome: 'Masaje de palma', descricao: T[1], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Sentada cómoda, con una mano apoyada en el muslo con la palma hacia arriba.',
        movimento: 'Con el pulgar de la otra mano haz círculos pequeños por toda la palma y la base de los dedos. Luego cambia de mano.',
        respiracao: 'Respira lento y deja que los hombros bajen.',
        sentir: 'La palma aflojándose y más calor en la mano.',
        atencao: 'Presión suave y agradable; evita puntos que duelan.',
      }],
    },
    {
      dia: 1, ordem: 3, nome: 'Dedo por dedo', descricao: T[1], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Sentada, una mano relajada frente a ti.',
        movimento: 'Con la otra mano toma cada dedo desde la base y deslízate hacia la punta, como si lo peinaras. Recorre los cinco dedos y cambia de mano.',
        respiracao: 'Respira con calma durante todo el recorrido.',
        sentir: 'Cada dedo más despierto y liviano.',
        atencao: 'No tires de los dedos ni los hagas crujir.',
      }],
    },
    {
      dia: 1, ordem: 4, nome: 'Puño suave y estrella', descricao: T[1], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada, antebrazos apoyados sobre una mesa y palmas hacia arriba.',
        movimento: 'Cierra las manos en un puño suave y ábrelas estirando los dedos bien separados, como una estrella.',
        respiracao: 'Suelta el aire al abrir, inspira al cerrar.',
        sentir: 'Las manos moviéndose con más soltura en cada repetición.',
        atencao: 'El puño es suave; no aprietes con fuerza.',
      }],
    },
    // ----- Día 2 -----
    {
      dia: 2, ordem: 1, nome: 'Muñeca arriba y abajo', descricao: T[2], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada, antebrazos apoyados en la mesa con las manos fuera del borde, palmas hacia abajo.',
        movimento: 'Sube las manos doblando la muñeca y bájalas despacio, como si saludaras.',
        respiracao: 'Respira con ritmo natural.',
        sentir: 'La muñeca moviéndose con suavidad en toda su amplitud cómoda.',
        atencao: 'Mueve sin dolor; si molesta, reduce el recorrido.',
      }],
    },
    {
      dia: 2, ordem: 2, nome: 'Muñeca de lado a lado', descricao: T[2], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada, antebrazos apoyados en la mesa y palmas hacia abajo.',
        movimento: 'Desliza las manos sobre la mesa hacia el lado del meñique y luego hacia el lado del pulgar, como un limpiaparabrisas.',
        respiracao: 'Respira tranquila, sin retener el aire.',
        sentir: 'Los costados de la muñeca aflojándose.',
        atencao: 'Los antebrazos quedan quietos; solo se mueve la muñeca.',
      }],
    },
    {
      dia: 2, ordem: 3, nome: 'Girar las palmas', descricao: T[2], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada, codos pegados al cuerpo y doblados en ángulo recto, manos al frente.',
        movimento: 'Gira las palmas hacia arriba y luego hacia abajo, despacio, como si dieras vuelta una tortilla.',
        respiracao: 'Respira con calma.',
        sentir: 'El antebrazo y la muñeca girando con suavidad.',
        atencao: 'Los codos no se separan del cuerpo.',
      }],
    },
    {
      dia: 2, ordem: 4, nome: 'Manos en oración', descricao: T[2], tipo: 'permanencia', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada o de pie, junta las palmas frente al pecho, con los codos abiertos.',
        movimento: 'Baja lentamente las manos juntas hacia la cintura hasta sentir un estiramiento suave en las muñecas, y quédate.',
        respiracao: 'Respira lento y profundo.',
        sentir: 'Un estiramiento agradable en la cara interna de las muñecas.',
        atencao: 'Quédate donde se sienta cómodo; si hay hormigueo, afloja.',
        duracao_seg: 30,
      }],
    },
    // ----- Día 3 -----
    {
      dia: 3, ordem: 1, nome: 'Pulgar toca cada dedo', descricao: T[3], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada, manos frente a ti con las palmas hacia arriba.',
        movimento: 'Toca con la yema del pulgar la yema de cada dedo, del índice al meñique, y vuelve. Haz las dos manos a la vez.',
        respiracao: 'Respira libre.',
        sentir: 'Los dedos moviéndose con precisión y soltura.',
        atencao: 'Toque suave, sin apretar las yemas.',
      }],
    },
    {
      dia: 3, ordem: 2, nome: 'Dedos que caminan', descricao: T[3], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada frente a una mesa, manos apoyadas con las palmas hacia abajo.',
        movimento: 'Haz caminar los dedos hacia adelante sobre la mesa, como una araña, y luego hacia atrás.',
        respiracao: 'Respira con ritmo tranquilo.',
        sentir: 'Cada dedo trabajando por separado.',
        atencao: 'Mantén los hombros relajados mientras mueves los dedos.',
      }],
    },
    {
      dia: 3, ordem: 3, nome: 'Garra suave', descricao: T[3], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada, manos al frente con los dedos estirados.',
        movimento: 'Dobla solo las dos últimas articulaciones de los dedos, formando una garra, y vuelve a estirar.',
        respiracao: 'Suelta el aire al doblar, inspira al estirar.',
        sentir: 'Las pequeñas articulaciones de los dedos moviéndose.',
        atencao: 'Movimiento suave; si alguna articulación molesta, dóblala menos.',
      }],
    },
    {
      dia: 3, ordem: 4, nome: 'Abanico de dedos', descricao: T[3], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada, manos apoyadas sobre la mesa con las palmas hacia abajo.',
        movimento: 'Separa los dedos lo más que puedas sin dolor, como un abanico, y vuelve a juntarlos.',
        respiracao: 'Suelta el aire al separar, inspira al juntar.',
        sentir: 'El espacio entre los dedos abriéndose.',
        atencao: 'Sin forzar; abre solo hasta donde sea cómodo.',
      }],
    },
    // ----- Día 4 -----
    {
      dia: 4, ordem: 1, nome: 'Estiramiento de palma en mesa', descricao: T[4], tipo: 'permanencia', bilateral: true,
      variacoes: [{
        preparacao: 'De pie frente a una mesa, apoya una palma con los dedos apuntando hacia ti.',
        movimento: 'Inclina el cuerpo apenas hacia atrás hasta sentir un estiramiento suave en el antebrazo y quédate. Luego cambia de mano.',
        respiracao: 'Respira lento, aflojando en cada exhalación.',
        sentir: 'Un estiramiento en la palma y la cara interna del antebrazo.',
        atencao: 'Poco peso sobre la mano; si hay dolor punzante, detente.',
        duracao_seg: 30,
      }],
    },
    {
      dia: 4, ordem: 2, nome: 'Estiramiento de dedos uno a uno', descricao: T[4], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Sentada, una mano frente a ti con la palma hacia arriba.',
        movimento: 'Con la otra mano lleva cada dedo suavemente hacia atrás, unos segundos por dedo. Luego cambia de mano.',
        respiracao: 'Respira tranquila.',
        sentir: 'Un estiramiento suave en la base de cada dedo.',
        atencao: 'Estira muy poco; nunca hasta sentir dolor.',
      }],
    },
    {
      dia: 4, ordem: 3, nome: 'Pulgar hacia afuera', descricao: T[4], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Sentada, una mano apoyada de canto sobre la mesa, con el meñique abajo.',
        movimento: 'Con la otra mano lleva el pulgar suavemente hacia afuera y hacia atrás, y suéltalo. Repite y cambia de mano.',
        respiracao: 'Suelta el aire al estirar.',
        sentir: 'La base del pulgar abriéndose.',
        atencao: 'Movimiento delicado; la base del pulgar es sensible.',
      }],
    },
    {
      dia: 4, ordem: 4, nome: 'Brazos al cielo', descricao: T[4], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada o de pie, brazos al costado del cuerpo.',
        movimento: 'Sube los brazos por delante abriendo bien las manos y bájalos cerrándolas en un puño suave.',
        respiracao: 'Inspira al subir, suelta el aire al bajar.',
        sentir: 'Brazos, muñecas y dedos estirándose juntos.',
        atencao: 'Sube los brazos solo hasta donde los hombros estén cómodos.',
      }],
    },
    // ----- Día 5 -----
    {
      dia: 5, ordem: 1, nome: 'Apretar la toalla', descricao: T[5], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Sentada, con una toalla pequeña enrollada en una mano.',
        movimento: 'Aprieta la toalla con fuerza moderada durante dos o tres segundos y suelta por completo. Luego cambia de mano.',
        respiracao: 'Suelta el aire al apretar, inspira al soltar.',
        sentir: 'La mano y el antebrazo activándose.',
        atencao: 'Fuerza moderada, nunca al máximo.',
      }],
    },
    {
      dia: 5, ordem: 2, nome: 'Escurrir la toalla', descricao: T[5], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada, sostén una toalla enrollada con las dos manos, una junto a la otra.',
        movimento: 'Gira las manos en direcciones contrarias como si escurrieras la toalla, despacio. Luego invierte el sentido.',
        respiracao: 'Respira con ritmo natural.',
        sentir: 'Las muñecas y los antebrazos trabajando.',
        atencao: 'Gira suave; si molesta la muñeca, reduce la fuerza.',
      }],
    },
    {
      dia: 5, ordem: 3, nome: 'Pinza con los dedos', descricao: T[5], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Sentada frente a una mesa con una esponja, un calcetín enrollado o un cojín pequeño.',
        movimento: 'Aprieta el objeto entre el pulgar y los otros dedos, como una pinza, y suelta. Luego cambia de mano.',
        respiracao: 'Suelta el aire al apretar.',
        sentir: 'Los dedos y la base del pulgar trabajando.',
        atencao: 'Usa un objeto blando y aprieta con suavidad.',
      }],
    },
    {
      dia: 5, ordem: 4, nome: 'Dedos que empujan', descricao: T[5], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada, junta las yemas de los dedos de ambas manos frente al pecho, formando una cúpula.',
        movimento: 'Empuja suavemente las yemas unas contra otras, abriendo las palmas, y suelta.',
        respiracao: 'Suelta el aire al empujar, inspira al soltar.',
        sentir: 'Los dedos firmes y las palmas abriéndose.',
        atencao: 'Presión ligera; los hombros quedan relajados.',
      }],
    },
    // ----- Día 6 -----
    {
      dia: 6, ordem: 1, nome: 'Piano en la mesa', descricao: T[6], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada frente a una mesa, manos apoyadas con los dedos un poco doblados.',
        movimento: 'Levanta y apoya cada dedo por turno, como si tocaras el piano, del meñique al pulgar y de vuelta.',
        respiracao: 'Respira tranquila y con ritmo.',
        sentir: 'Cada dedo moviéndose de forma independiente.',
        atencao: 'Si un dedo cuesta más, no lo fuerces; acompáñalo con calma.',
      }],
    },
    {
      dia: 6, ordem: 2, nome: 'Arrugar una hoja', descricao: T[6], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Sentada frente a una mesa, con una hoja de papel o una servilleta extendida bajo una mano.',
        movimento: 'Usando solo los dedos de esa mano, arruga la hoja hasta hacer una bolita. Luego estírala y cambia de mano.',
        respiracao: 'Respira libre.',
        sentir: 'Los dedos coordinándose y trabajando juntos.',
        atencao: 'Descansa la mano si sientes cansancio.',
      }],
    },
    {
      dia: 6, ordem: 3, nome: 'Recoger objetos pequeños', descricao: T[6], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Sentada frente a una mesa con algunos objetos pequeños, como botones, porotos o frijoles.',
        movimento: 'Toma los objetos de a uno con la punta de los dedos y pásalos a un recipiente. Luego cambia de mano.',
        respiracao: 'Respira con calma y sin prisa.',
        sentir: 'Precisión y control en la punta de los dedos.',
        atencao: 'Guarda los objetos pequeños lejos de niños y mascotas.',
      }],
    },
    {
      dia: 6, ordem: 4, nome: 'Ocho con las muñecas', descricao: T[6], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada, con las manos entrelazadas frente al pecho y los codos relajados.',
        movimento: 'Dibuja con las manos unidas un ocho acostado en el aire, despacio. Cambia de dirección a la mitad.',
        respiracao: 'Respira fluido, acompañando el movimiento.',
        sentir: 'Las muñecas moviéndose en todas las direcciones.',
        atencao: 'Ocho pequeño y lento, sin dolor.',
      }],
    },
    // ----- Día 7 -----
    {
      dia: 7, ordem: 1, nome: 'Ola de dedos', descricao: T[7], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada, manos al frente con las palmas hacia abajo.',
        movimento: 'Cierra los dedos uno por uno desde el meñique hasta el pulgar y ábrelos en el mismo orden, como una ola.',
        respiracao: 'Respira lento y tranquilo.',
        sentir: 'Los dedos moviéndose con fluidez.',
        atencao: 'Ritmo lento; cierra sin apretar.',
      }],
    },
    {
      dia: 7, ordem: 2, nome: 'Circuito de muñecas', descricao: T[7], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada, antebrazos apoyados sobre una mesa con las manos fuera del borde.',
        movimento: 'Combina en secuencia: muñeca arriba y abajo, de lado a lado y círculos lentos, unas repeticiones de cada uno.',
        respiracao: 'Respira con ritmo natural.',
        sentir: 'Las muñecas sueltas y cómodas.',
        atencao: 'Todo dentro de un rango sin dolor.',
      }],
    },
    {
      dia: 7, ordem: 3, nome: 'Palmas contra la pared', descricao: T[7], tipo: 'permanencia', bilateral: false,
      variacoes: [{
        preparacao: 'De pie frente a una pared, apoya las palmas a la altura del pecho con los dedos hacia arriba.',
        movimento: 'Lleva el cuerpo apenas hacia la pared hasta sentir un estiramiento suave en las muñecas y quédate.',
        respiracao: 'Respira profundo, aflojando en cada exhalación.',
        sentir: 'Las palmas y las muñecas estirándose con suavidad.',
        atencao: 'Poco peso sobre las manos; aléjate si sientes hormigueo.',
        duracao_seg: 30,
      }],
    },
    {
      dia: 7, ordem: 4, nome: 'Manos que descansan', descricao: T[7], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada cómoda, manos apoyadas sobre los muslos con las palmas hacia arriba.',
        movimento: 'Cierra los ojos y recorre con la atención cada dedo, la palma y la muñeca, dejando que se aflojen por completo.',
        respiracao: 'Exhalación más larga que la inspiración.',
        sentir: 'Las manos tibias, livianas y descansadas.',
        atencao: 'Quédate el tiempo que necesites antes de retomar tus tareas.',
      }],
    },
  ],
}

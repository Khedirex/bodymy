// =====================================================================
// BodyMy — Protocolo "Suelta la Espalda Baja" (circuito 'lumbar').
// 7 días × 4 ejercicios + bloque diario de movilidad (6 movimientos).
// =====================================================================

import type { ProtocoloConteudo } from './tipos'

const T: Record<number, string> = {
  1: 'Día 1 — Respirar y soltar la espalda baja',
  2: 'Día 2 — Pelvis que se mueve',
  3: 'Día 3 — Columna viva',
  4: 'Día 4 — Estirar sin forzar',
  5: 'Día 5 — Centro que sostiene',
  6: 'Día 6 — Moverse con confianza',
  7: 'Día 7 — Integrar y relajar',
}

export const protocolo: ProtocoloConteudo = {
  circuito: 'lumbar',
  semanas: 1,
  alongamentos: [
    { ordem: 1, nome: 'Respiración al vientre', descricao: 'Acostada boca arriba con las rodillas dobladas, lleva el aire hacia el vientre y suéltalo largo. Deja que la espalda baja se apoye cada vez más.', lados: 1 },
    { ordem: 2, nome: 'Báscula de pelvis acostada', descricao: 'Acostada con rodillas dobladas, inclina la pelvis apenas hacia atrás y hacia adelante. Un vaivén pequeño y suave.', lados: 1 },
    { ordem: 3, nome: 'Rodilla al pecho', descricao: 'Abraza una rodilla hacia el pecho mientras la otra pierna queda doblada con el pie apoyado. Respira tranquila y luego cambia de lado.', lados: 2 },
    { ordem: 4, nome: 'Rodillas de lado a lado', descricao: 'Acostada, rodillas dobladas y juntas. Déjalas caer suavemente hacia un lado y luego hacia el otro, sin prisa.', lados: 1 },
    { ordem: 5, nome: 'Gato y vaca en silla', descricao: 'Sentada en una silla, manos en los muslos, redondea la espalda al soltar el aire y alárgala al inspirar. Movimiento lento y cómodo.', lados: 1 },
    { ordem: 6, nome: 'Inclinación lateral sentada', descricao: 'Sentada, sube un brazo y inclínate apenas hacia el lado contrario, sintiendo el costado largo. Luego cambia de lado.', lados: 2 },
  ],
  exercicios: [
    // ----- Día 1 -----
    {
      dia: 1, ordem: 1, nome: 'Respiración de tres tiempos', descricao: T[1], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y pies apoyados. Una mano en el vientre y otra en el pecho.',
        movimento: 'Deja que el aire llene primero el vientre, después las costillas y al final el pecho. Suelta en el orden inverso, despacio.',
        respiracao: 'Inspira en 4 tiempos y suelta en 6, sin retener el aire.',
        sentir: 'La espalda baja apoyándose más en el suelo con cada exhalación.',
        atencao: 'Si sientes mareo, vuelve a respirar normal unos instantes.',
      }],
    },
    {
      dia: 1, ordem: 2, nome: 'Descanso en la silla', descricao: T[1], tipo: 'permanencia', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba con las pantorrillas apoyadas sobre el asiento de una silla o sofá, rodillas en ángulo recto.',
        movimento: 'No hay movimiento. Deja que la espalda baja descanse y que el peso del cuerpo se hunda.',
        respiracao: 'Respiración lenta y natural.',
        sentir: 'La zona lumbar aflojándose poco a poco.',
        atencao: 'Si sientes hormigueo en las piernas, acomoda la posición.',
        duracao_seg: 40,
      }],
    },
    {
      dia: 1, ordem: 3, nome: 'Balanceo pequeño de pelvis', descricao: T[1], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y pies al ancho de la cadera.',
        movimento: 'Inclina la pelvis levemente hacia atrás, acercando la lumbar al suelo, y vuelve despacio. Un movimiento casi invisible.',
        respiracao: 'Suelta el aire al acercar la lumbar, inspira al volver.',
        sentir: 'La espalda baja tocando y despegándose del suelo con suavidad.',
        atencao: 'No presiones la lumbar contra el suelo; es un vaivén, no un empuje.',
      }],
    },
    {
      dia: 1, ordem: 4, nome: 'Abrazo de rodillas', descricao: T[1], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba. Lleva una rodilla y después la otra hacia el pecho y rodéalas con las manos.',
        movimento: 'Acerca las rodillas al pecho con suavidad y afloja un poco, en un vaivén lento.',
        respiracao: 'Suelta el aire al acercar, inspira al aflojar.',
        sentir: 'Un estiramiento agradable en la espalda baja y los glúteos.',
        atencao: 'Si el cuello se tensa, apoya la cabeza en un cojín bajo.',
      }],
    },
    // ----- Día 2 -----
    {
      dia: 2, ordem: 1, nome: 'Báscula de pelvis sentada', descricao: T[2], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada en el borde de una silla firme, pies apoyados y manos en los muslos.',
        movimento: 'Rueda la pelvis hacia atrás, redondeando un poco la espalda baja, y luego hacia adelante, alargándola. Despacio.',
        respiracao: 'Suelta el aire al redondear, inspira al alargar.',
        sentir: 'La base de la columna moviéndose con libertad.',
        atencao: 'Mueve dentro de un rango cómodo, sin llegar a los extremos.',
      }],
    },
    {
      dia: 2, ordem: 2, nome: 'Péndulo de rodillas acostada', descricao: T[2], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y juntas, brazos abiertos.',
        movimento: 'Lleva las rodillas unos centímetros hacia un lado y vuelve al centro; luego hacia el otro lado.',
        respiracao: 'Suelta el aire al ir al lado, inspira al volver.',
        sentir: 'Un giro suave en la espalda baja, como un masaje.',
        atencao: 'Los hombros quedan en el suelo; si hay dolor punzante, reduce el recorrido o detente.',
      }],
    },
    {
      dia: 2, ordem: 3, nome: 'Círculos de pelvis sentada', descricao: T[2], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada en una silla firme, pies apoyados y espalda larga.',
        movimento: 'Dibuja círculos pequeños con la pelvis sobre el asiento, como si movieras un plato. Cambia de dirección a la mitad.',
        respiracao: 'Respira libre y fluida.',
        sentir: 'La zona lumbar moviéndose en todas las direcciones.',
        atencao: 'Círculos pequeños; usa una silla sin ruedas.',
      }],
    },
    {
      dia: 2, ordem: 4, nome: 'Pierna que se desliza', descricao: T[2], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y pies apoyados.',
        movimento: 'Desliza un talón por el suelo hasta estirar la pierna y vuelve, manteniendo la espalda tranquila. Luego cambia de pierna.',
        respiracao: 'Suelta el aire al estirar, inspira al volver.',
        sentir: 'La pelvis estable mientras la pierna se mueve.',
        atencao: 'Si la espalda se arquea, estira la pierna solo hasta la mitad.',
      }],
    },
    // ----- Día 3 -----
    {
      dia: 3, ordem: 1, nome: 'Gato y vaca con cojín', descricao: T[3], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'En cuatro apoyos, con un cojín doblado bajo las rodillas. Manos debajo de los hombros y rodillas debajo de la cadera.',
        movimento: 'Redondea la espalda llevando el ombligo hacia arriba y luego deja que el vientre baje un poco, mirando al frente. Despacio.',
        respiracao: 'Suelta el aire al redondear, inspira al bajar el vientre.',
        sentir: 'Toda la columna moviéndose como una ola.',
        atencao: 'Si las rodillas o las muñecas molestan, hazlo sentada en una silla.',
      }],
    },
    {
      dia: 3, ordem: 2, nome: 'Giro sentada en silla', descricao: T[3], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada en una silla, pies apoyados, brazos cruzados sobre el pecho.',
        movimento: 'Gira el tronco suavemente hacia un lado, vuelve al centro y gira hacia el otro. La cadera queda quieta.',
        respiracao: 'Suelta el aire al girar, inspira en el centro.',
        sentir: 'La columna rotando con suavidad desde la cintura hacia arriba.',
        atencao: 'Gira solo hasta donde sea cómodo, sin impulso.',
      }],
    },
    {
      dia: 3, ordem: 3, nome: 'Inclinación lateral de pie', descricao: T[3], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'De pie, pies al ancho de la cadera, rodillas sueltas y brazos a los lados.',
        movimento: 'Desliza una mano por el costado del muslo inclinándote apenas y vuelve al centro. Alterna los lados.',
        respiracao: 'Suelta el aire al inclinarte, inspira al subir.',
        sentir: 'El costado del cuerpo estirándose y la cintura aflojando.',
        atencao: 'No te inclines hacia adelante; el movimiento es solo lateral.',
      }],
    },
    {
      dia: 3, ordem: 4, nome: 'Postura del niño con cojines', descricao: T[3], tipo: 'permanencia', bilateral: false,
      variacoes: [{
        preparacao: 'Arrodillada sobre un cojín, rodillas separadas, con varios cojines o almohadas delante.',
        movimento: 'Lleva la cadera hacia los talones y apoya el pecho sobre los cojines, con los brazos relajados. Quédate ahí.',
        respiracao: 'Respira hacia la espalda, sintiendo cómo se expande.',
        sentir: 'La espalda baja alargándose y descansando.',
        atencao: 'Si las rodillas molestan, hazlo sentada inclinándote sobre una mesa con cojines.',
        duracao_seg: 30,
      }],
    },
    // ----- Día 4 -----
    {
      dia: 4, ordem: 1, nome: 'Estiramiento de glúteo acostada', descricao: T[4], tipo: 'permanencia', bilateral: true,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas. Cruza el tobillo de una pierna sobre la rodilla de la otra.',
        movimento: 'Quédate así o acerca suavemente la pierna de apoyo hacia ti. Luego cambia de lado.',
        respiracao: 'Respira lento, soltando la tensión en cada exhalación.',
        sentir: 'Un estiramiento en el glúteo, que alivia la sensación de carga en la espalda baja.',
        atencao: 'Sin tirones; si molesta la rodilla, deja el pie de apoyo en el suelo.',
        duracao_seg: 30,
      }],
    },
    {
      dia: 4, ordem: 2, nome: 'Pierna estirada con toalla', descricao: T[4], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Acostada boca arriba, una pierna doblada con el pie apoyado. Pasa una toalla por la planta del otro pie.',
        movimento: 'Sube la pierna con la toalla hasta sentir un estiramiento suave detrás del muslo y bájala despacio. Luego cambia de pierna.',
        respiracao: 'Suelta el aire al subir, inspira al bajar.',
        sentir: 'La parte de atrás del muslo estirándose, con la espalda apoyada.',
        atencao: 'La rodilla puede quedar un poco doblada; nunca fuerces el estiramiento.',
      }],
    },
    {
      dia: 4, ordem: 3, nome: 'Paso adelante con apoyo', descricao: T[4], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'De pie, junto al respaldo de una silla, con una mano apoyada. Da un paso largo hacia adelante.',
        movimento: 'Dobla un poco la rodilla de adelante y lleva la cadera al frente, sin arquear la espalda. Vuelve y repite; luego cambia.',
        respiracao: 'Suelta el aire al avanzar, inspira al volver.',
        sentir: 'El frente de la cadera de la pierna de atrás estirándose.',
        atencao: 'Mantén el ombligo suavemente hacia adentro para no arquear la lumbar.',
      }],
    },
    {
      dia: 4, ordem: 4, nome: 'Giro acostada con brazos abiertos', descricao: T[4], tipo: 'permanencia', bilateral: true,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y brazos abiertos en cruz.',
        movimento: 'Deja caer las rodillas hacia un lado y quédate. Vuelve al centro despacio y cambia de lado.',
        respiracao: 'Respiración profunda hacia el costado que se estira.',
        sentir: 'Un estiramiento largo desde la cadera hasta las costillas.',
        atencao: 'Pon un cojín bajo las rodillas si no llegan al suelo.',
        duracao_seg: 30,
      }],
    },
    // ----- Día 5 -----
    {
      dia: 5, ordem: 1, nome: 'Ombligo hacia adentro', descricao: T[5], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y manos sobre el vientre.',
        movimento: 'Al soltar el aire, lleva suavemente el ombligo hacia la columna, sin mover la pelvis. Sostén dos segundos y suelta.',
        respiracao: 'Exhalación larga al activar, inspiración tranquila al soltar.',
        sentir: 'Un abrazo suave alrededor de la cintura.',
        atencao: 'Es una activación ligera; no contengas el aire.',
      }],
    },
    {
      dia: 5, ordem: 2, nome: 'Puente pequeño', descricao: T[5], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y pies apoyados al ancho de la cadera.',
        movimento: 'Aprieta los glúteos y despega la cadera unos centímetros del suelo. Baja despacio.',
        respiracao: 'Suelta el aire al subir, inspira al bajar.',
        sentir: 'Glúteos trabajando y la espalda baja acompañando sin esfuerzo.',
        atencao: 'Sube poco y sin arquear; si molesta la lumbar, baja la altura.',
      }],
    },
    {
      dia: 5, ordem: 3, nome: 'Talón que toca el suelo', descricao: T[5], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y pies apoyados. Levanta una pierna con la rodilla doblada en ángulo recto.',
        movimento: 'Baja despacio ese talón hasta tocar el suelo y vuelve a subirlo, con el ombligo suavemente hacia adentro. Luego cambia de pierna.',
        respiracao: 'Suelta el aire al bajar el talón, inspira al subir.',
        sentir: 'El centro del cuerpo trabajando para mantener la espalda quieta.',
        atencao: 'Si la lumbar se despega del suelo, baja el talón menos.',
      }],
    },
    {
      dia: 5, ordem: 4, nome: 'Brazo y pierna contrarios', descricao: T[5], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'En cuatro apoyos con un cojín bajo las rodillas, o de pie con las manos en la pared.',
        movimento: 'Desliza una pierna hacia atrás por el suelo y, si te sientes estable, estira también el brazo contrario hacia adelante. Vuelve y cambia de lado.',
        respiracao: 'Suelta el aire al estirar, inspira al volver.',
        sentir: 'La espalda estable y el cuerpo trabajando en diagonal.',
        atencao: 'La cadera no gira; empieza solo con la pierna si te cuesta el equilibrio.',
      }],
    },
    // ----- Día 6 -----
    {
      dia: 6, ordem: 1, nome: 'Bisagra de cadera con palo', descricao: T[6], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'De pie, pies al ancho de la cadera, rodillas sueltas. Sostén una toalla enrollada o un palo de escoba a lo largo de la espalda.',
        movimento: 'Lleva la cadera hacia atrás inclinando el tronco con la espalda recta, como para cerrar un cajón con el glúteo. Vuelve a subir apretando los glúteos.',
        respiracao: 'Inspira al bajar, suelta el aire al subir.',
        sentir: 'El movimiento naciendo en la cadera, no en la espalda.',
        atencao: 'Baja poco; la espalda se mantiene larga todo el tiempo.',
      }],
    },
    {
      dia: 6, ordem: 2, nome: 'Sentarse y pararse', descricao: T[6], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada en el borde de una silla firme, pies apoyados.',
        movimento: 'Inclina el tronco hacia adelante con la espalda larga y ponte de pie empujando el suelo. Siéntate despacio.',
        respiracao: 'Suelta el aire al subir, inspira al bajar.',
        sentir: 'Piernas y glúteos haciendo el trabajo, la espalda acompañando.',
        atencao: 'Ayúdate con las manos en los muslos si lo necesitas.',
      }],
    },
    {
      dia: 6, ordem: 3, nome: 'Espalda contra la pared', descricao: T[6], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'De pie, de espaldas a la pared, talones a un palmo de ella, rodillas sueltas.',
        movimento: 'Acerca suavemente la espalda baja a la pared y vuelve a soltar, en un vaivén lento de la pelvis.',
        respiracao: 'Suelta el aire al acercar, inspira al soltar.',
        sentir: 'La pelvis encontrando una posición cómoda de pie.',
        atencao: 'Movimiento pequeño, sin empujar con fuerza.',
      }],
    },
    {
      dia: 6, ordem: 4, nome: 'Caminata con brazos sueltos', descricao: T[6], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'De pie en un espacio despejado de tu casa.',
        movimento: 'Camina despacio dejando que los brazos se balanceen y que la cintura gire un poco con cada paso.',
        respiracao: 'Respira con ritmo natural.',
        sentir: 'La espalda moviéndose con soltura al caminar.',
        atencao: 'Usa calzado cómodo y un piso sin obstáculos.',
      }],
    },
    // ----- Día 7 -----
    {
      dia: 7, ordem: 1, nome: 'Ola de columna sentada', descricao: T[7], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada en una silla firme, pies apoyados y manos en los muslos.',
        movimento: 'Redondea la espalda desde la pelvis hacia arriba y luego alárgala desde la pelvis hasta la cabeza, como una ola.',
        respiracao: 'Suelta el aire al redondear, inspira al alargar.',
        sentir: 'Cada parte de la columna moviéndose por turno.',
        atencao: 'Ritmo lento y rango cómodo.',
      }],
    },
    {
      dia: 7, ordem: 2, nome: 'Puente vértebra a vértebra', descricao: T[7], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y pies apoyados.',
        movimento: 'Sube la cadera despegando la espalda poco a poco y bájala apoyando una vértebra a la vez.',
        respiracao: 'Suelta el aire al subir, inspira al bajar.',
        sentir: 'La columna desenrollándose con suavidad.',
        atencao: 'Sube solo hasta donde la espalda se sienta cómoda.',
      }],
    },
    {
      dia: 7, ordem: 3, nome: 'Giro suave de rodillas', descricao: T[7], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y brazos abiertos.',
        movimento: 'Lleva las rodillas lentamente de un lado al otro, quedándote una respiración en cada lado.',
        respiracao: 'Una respiración completa en cada lado.',
        sentir: 'La espalda baja aflojándose en cada giro.',
        atencao: 'Recorrido cómodo; los hombros se quedan apoyados.',
      }],
    },
    {
      dia: 7, ordem: 4, nome: 'Relajación de espalda baja', descricao: T[7], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba con las pantorrillas sobre una silla o un cojín bajo las rodillas.',
        movimento: 'Cierra los ojos y recorre con la atención la espalda, imaginando que se ensancha y se apoya más con cada exhalación.',
        respiracao: 'Exhalación más larga que la inspiración.',
        sentir: 'Una sensación de liviandad y descanso en la espalda baja.',
        atencao: 'Para levantarte, gira primero de lado y apóyate con las manos.',
      }],
    },
  ],
}

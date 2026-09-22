// =====================================================================
// BodyMy — Protocolo "Suelta la Cadera" (circuito 'cadera').
// 7 días × 4 ejercicios + bloque diario de movilidad (6 movimientos).
// =====================================================================

import type { ProtocoloConteudo } from './tipos'

const T: Record<number, string> = {
  1: 'Día 1 — Soltar y despertar la circulación',
  2: 'Día 2 — Movilidad suave de la cadera',
  3: 'Día 3 — Abrir la cadera con calma',
  4: 'Día 4 — Rotaciones sin prisa',
  5: 'Día 5 — Despertar los glúteos',
  6: 'Día 6 — Apoyo y estabilidad',
  7: 'Día 7 — Integrar y relajar',
}

export const protocolo: ProtocoloConteudo = {
  circuito: 'cadera',
  semanas: 1,
  alongamentos: [
    { ordem: 1, nome: 'Balanceo de pelvis sentada', descricao: 'Sentada en el borde de una silla, inclina la pelvis hacia adelante y hacia atrás, despacio. Un movimiento pequeño que despierta la zona.', lados: 1 },
    { ordem: 2, nome: 'Círculos de cadera de pie', descricao: 'De pie, manos en la cintura y rodillas sueltas. Dibuja círculos lentos con la cadera, cambiando de dirección a la mitad.', lados: 1 },
    { ordem: 3, nome: 'Péndulo de pierna', descricao: 'De pie, apoyada con una mano en la pared, balancea una pierna hacia adelante y hacia atrás sin forzar. Luego cambia de lado.', lados: 2 },
    { ordem: 4, nome: 'Rodilla al pecho acostada', descricao: 'Acostada boca arriba, abraza una rodilla hacia el pecho y respira tranquila. La otra pierna queda doblada con el pie apoyado.', lados: 2 },
    { ordem: 5, nome: 'Mariposa suave', descricao: 'Sentada en el suelo o en la cama, junta las plantas de los pies y deja que las rodillas caigan hacia los lados. Mueve las rodillas suavemente, como alas.', lados: 1 },
    { ordem: 6, nome: 'Limpiaparabrisas de rodillas', descricao: 'Acostada boca arriba, rodillas dobladas y pies separados. Deja caer las dos rodillas hacia un lado y luego hacia el otro, sin prisa.', lados: 1 },
  ],
  exercicios: [
    // ----- Día 1 -----
    {
      dia: 1, ordem: 1, nome: 'Respiración con pelvis suelta', descricao: T[1], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y pies apoyados al ancho de la cadera. Manos sobre el vientre.',
        movimento: 'Al soltar el aire, deja que la pelvis se incline apenas hacia atrás. Al inspirar, vuelve a la posición natural. Todo muy pequeño.',
        respiracao: 'Inspira por la nariz en 4 tiempos y suelta por la boca en 6.',
        sentir: 'La parte baja del cuerpo aflojándose con cada respiración.',
        atencao: 'Si algo molesta, haz el movimiento todavía más pequeño o solo respira.',
      }],
    },
    {
      dia: 1, ordem: 2, nome: 'Pies que caminan acostada', descricao: T[1], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y pies apoyados en el suelo o la cama.',
        movimento: 'Desliza un pie hacia adelante hasta estirar la pierna y vuelve. Alterna los lados con ritmo tranquilo, como si caminaras despacio.',
        respiracao: 'Respira libre, sin retener el aire.',
        sentir: 'La cadera y la ingle moviéndose con suavidad y un poco de calor en las piernas.',
        atencao: 'Mantén la espalda relajada sobre el suelo; si se arquea, estira menos la pierna.',
      }],
    },
    {
      dia: 1, ordem: 3, nome: 'Rodillas que se mecen', descricao: T[1], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y juntas, pies apoyados.',
        movimento: 'Mece las rodillas unos centímetros hacia un lado y hacia el otro, como un péndulo pequeño. Los hombros quedan tranquilos en el suelo.',
        respiracao: 'Suelta el aire al ir hacia un lado, inspira al volver al centro.',
        sentir: 'Un masaje suave en la cadera y en la parte baja de la espalda.',
        atencao: 'Mueve solo hasta donde se sienta cómodo, sin dolor.',
      }],
    },
    {
      dia: 1, ordem: 4, nome: 'Descanso con piernas en alto', descricao: T[1], tipo: 'permanencia', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, con las pantorrillas apoyadas sobre el asiento de una silla o sobre cojines.',
        movimento: 'Quédate quieta y deja que el peso de las piernas descanse por completo. Solo observa cómo se afloja la cadera.',
        respiracao: 'Respiración lenta y natural, llevando el aire hacia el vientre.',
        sentir: 'Las piernas livianas y la cadera descansando.',
        atencao: 'Si sientes hormigueo, baja un poco las piernas o cambia de posición.',
        duracao_seg: 40,
      }],
    },
    // ----- Día 2 -----
    {
      dia: 2, ordem: 1, nome: 'Círculos de rodilla acostada', descricao: T[2], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Acostada boca arriba. Lleva una rodilla hacia el pecho y apoya la mano sobre ella.',
        movimento: 'Dibuja círculos pequeños con la rodilla, como si revolvieras una olla. Cambia de dirección a la mitad del tiempo y luego de pierna.',
        respiracao: 'Respira tranquila, sin retener el aire.',
        sentir: 'La articulación de la cadera girando con suavidad.',
        atencao: 'Haz círculos pequeños; si hay molestia aguda, detente.',
      }],
    },
    {
      dia: 2, ordem: 2, nome: 'Talón al glúteo de pie', descricao: T[2], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'De pie, frente a una pared o al respaldo de una silla, con las dos manos apoyadas.',
        movimento: 'Dobla una rodilla llevando el talón hacia el glúteo y bájalo despacio. Repite con la misma pierna y luego cambia.',
        respiracao: 'Suelta el aire al subir el talón, inspira al bajar.',
        sentir: 'El frente del muslo y la cadera moviéndose con libertad.',
        atencao: 'Mantén el cuerpo erguido y sube solo hasta donde la rodilla se sienta cómoda.',
      }],
    },
    {
      dia: 2, ordem: 3, nome: 'Balanceo lateral de pierna', descricao: T[2], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'De pie, de costado a la pared, con una mano apoyada en ella.',
        movimento: 'Lleva la pierna de afuera un poco hacia el costado y regresa cruzando apenas por delante. Movimiento suave, como un péndulo.',
        respiracao: 'Respira con ritmo natural.',
        sentir: 'Los costados de la cadera soltándose.',
        atencao: 'El tronco queda derecho; no inclines el cuerpo para subir más la pierna.',
      }],
    },
    {
      dia: 2, ordem: 4, nome: 'Balanceo sentada en silla', descricao: T[2], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada en el borde de una silla firme, pies apoyados y manos sobre los muslos.',
        movimento: 'Pasa el peso lentamente de un glúteo al otro, dejando que la cadera se mueva de lado a lado.',
        respiracao: 'Inspira en el centro, suelta el aire al llevar el peso a un lado.',
        sentir: 'Los huesitos de apoyo del glúteo rodando sobre la silla.',
        atencao: 'Usa una silla estable, sin ruedas.',
      }],
    },
    // ----- Día 3 -----
    {
      dia: 3, ordem: 1, nome: 'Mariposa acostada', descricao: T[3], tipo: 'permanencia', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, junta las plantas de los pies y deja que las rodillas se abran hacia los lados. Puedes poner cojines debajo de cada rodilla.',
        movimento: 'Quédate en la posición y deja que la gravedad abra la cadera poco a poco, sin empujar.',
        respiracao: 'Respira lento, imaginando que el aire llega a la cadera.',
        sentir: 'Una apertura suave en la ingle y la cara interna de los muslos.',
        atencao: 'Si tira demasiado, sube los cojines o acerca menos los pies.',
        duracao_seg: 30,
      }],
    },
    {
      dia: 3, ordem: 2, nome: 'Paso adelante con apoyo', descricao: T[3], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'De pie, junto al respaldo de una silla, con una mano apoyada. Da un paso largo hacia adelante.',
        movimento: 'Dobla un poco la rodilla de adelante y lleva la cadera hacia el frente, sintiendo el estiramiento en la pierna de atrás. Vuelve y repite; luego cambia de pierna.',
        respiracao: 'Suelta el aire al avanzar la cadera, inspira al volver.',
        sentir: 'Un estiramiento agradable en el frente de la cadera de la pierna de atrás.',
        atencao: 'La rodilla de adelante no pasa de la punta del pie; el talón de atrás puede despegarse.',
      }],
    },
    {
      dia: 3, ordem: 3, nome: 'Figura cuatro en silla', descricao: T[3], tipo: 'permanencia', bilateral: true,
      variacoes: [{
        preparacao: 'Sentada en una silla, apoya el tobillo de una pierna sobre la rodilla de la otra, formando un número cuatro.',
        movimento: 'Con la espalda larga, inclina el tronco apenas hacia adelante y quédate. Luego cambia de pierna.',
        respiracao: 'Respira profundo y deja que cada exhalación afloje un poco más.',
        sentir: 'Un estiramiento en el glúteo de la pierna cruzada.',
        atencao: 'Si la rodilla molesta, apoya el tobillo más abajo, sobre la espinilla.',
        duracao_seg: 30,
      }],
    },
    {
      dia: 3, ordem: 4, nome: 'Apertura de rodilla acostada', descricao: T[3], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y pies apoyados.',
        movimento: 'Deja caer una rodilla hacia el costado, despacio, y vuelve al centro. Repite con la misma pierna y luego cambia.',
        respiracao: 'Suelta el aire al abrir, inspira al cerrar.',
        sentir: 'La cara interna del muslo estirándose y la cadera abriéndose.',
        atencao: 'La pelvis queda quieta; abre solo hasta donde no gire.',
      }],
    },
    // ----- Día 4 -----
    {
      dia: 4, ordem: 1, nome: 'Rotación de pie acostada', descricao: T[4], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, piernas estiradas y relajadas, un poco separadas.',
        movimento: 'Gira las dos piernas desde la cadera, llevando las puntas de los pies hacia afuera y luego hacia adentro, como limpiaparabrisas.',
        respiracao: 'Respira libre y tranquila.',
        sentir: 'La cadera girando desde adentro, sin esfuerzo.',
        atencao: 'Si la espalda se tensiona, dobla un poco las rodillas con un cojín debajo.',
      }],
    },
    {
      dia: 4, ordem: 2, nome: 'Rotación sentada en silla', descricao: T[4], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Sentada en una silla, pies apoyados y rodillas a 90 grados.',
        movimento: 'Sin mover la rodilla de lugar, lleva el pie hacia afuera y luego hacia adentro, deslizándolo en el suelo. Luego cambia de pierna.',
        respiracao: 'Respira con calma durante todo el movimiento.',
        sentir: 'La cadera rotando mientras la rodilla queda quieta.',
        atencao: 'Movimiento pequeño y lento; si la rodilla molesta, reduce el recorrido.',
      }],
    },
    {
      dia: 4, ordem: 3, nome: 'Almeja de costado', descricao: T[4], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Acostada de lado, cabeza sobre el brazo o un cojín, rodillas dobladas y pies juntos.',
        movimento: 'Manteniendo los pies juntos, abre la rodilla de arriba como una almeja y ciérrala despacio. Luego cambia de lado.',
        respiracao: 'Suelta el aire al abrir, inspira al cerrar.',
        sentir: 'Un trabajo suave en el costado del glúteo.',
        atencao: 'La cadera no rueda hacia atrás; abre menos si hace falta.',
      }],
    },
    {
      dia: 4, ordem: 4, nome: 'Giro suave acostada', descricao: T[4], tipo: 'permanencia', bilateral: true,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y brazos abiertos en cruz.',
        movimento: 'Deja caer las dos rodillas hacia un lado y quédate, con los hombros apoyados. Vuelve al centro y cambia de lado.',
        respiracao: 'Respira hondo, llevando el aire hacia el costado que se estira.',
        sentir: 'Un estiramiento largo en la cadera y el costado del cuerpo.',
        atencao: 'Pon un cojín bajo las rodillas si no llegan al suelo; nada debe doler.',
        duracao_seg: 30,
      }],
    },
    // ----- Día 5 -----
    {
      dia: 5, ordem: 1, nome: 'Puente pequeño', descricao: T[5], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas, pies apoyados al ancho de la cadera y brazos al costado.',
        movimento: 'Aprieta suavemente los glúteos y despega la cadera unos centímetros del suelo. Baja despacio.',
        respiracao: 'Suelta el aire al subir, inspira al bajar.',
        sentir: 'Los glúteos y la parte de atrás de los muslos trabajando.',
        atencao: 'Sube poco, sin arquear la espalda; si molesta la lumbar, reduce la altura.',
      }],
    },
    {
      dia: 5, ordem: 2, nome: 'Pierna atrás en la pared', descricao: T[5], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'De pie, frente a la pared, con las dos manos apoyadas en ella.',
        movimento: 'Lleva una pierna estirada un poco hacia atrás, apretando el glúteo, y vuelve. Repite y luego cambia de pierna.',
        respiracao: 'Suelta el aire al llevar la pierna atrás.',
        sentir: 'El glúteo de la pierna que se mueve activándose.',
        atencao: 'Movimiento corto; la espalda no se arquea.',
      }],
    },
    {
      dia: 5, ordem: 3, nome: 'Pierna al costado acostada', descricao: T[5], tipo: 'tempo', bilateral: true,
      variacoes: [{
        preparacao: 'Acostada de lado, la pierna de abajo doblada y la de arriba estirada.',
        movimento: 'Sube la pierna de arriba un palmo y bájala despacio, sin apoyarla del todo. Luego cambia de lado.',
        respiracao: 'Suelta el aire al subir, inspira al bajar.',
        sentir: 'El costado de la cadera trabajando.',
        atencao: 'La punta del pie mira hacia adelante; sube solo hasta donde puedas sin girar el cuerpo.',
      }],
    },
    {
      dia: 5, ordem: 4, nome: 'Rodillas que aprietan cojín', descricao: T[5], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada en una silla con un cojín entre las rodillas.',
        movimento: 'Aprieta el cojín con las rodillas durante dos o tres segundos y suelta por completo. Repite.',
        respiracao: 'Suelta el aire al apretar, inspira al soltar.',
        sentir: 'La cara interna de los muslos activándose.',
        atencao: 'Aprieta con fuerza moderada, nunca al máximo.',
      }],
    },
    // ----- Día 6 -----
    {
      dia: 6, ordem: 1, nome: 'Sentarse y pararse', descricao: T[6], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Sentada en el borde de una silla firme, pies apoyados al ancho de la cadera.',
        movimento: 'Inclina el tronco hacia adelante y ponte de pie empujando el suelo con los pies. Vuelve a sentarte despacio, controlando la bajada.',
        respiracao: 'Suelta el aire al subir, inspira al bajar.',
        sentir: 'Glúteos y muslos trabajando juntos.',
        atencao: 'Puedes ayudarte con las manos en los muslos; las rodillas siguen la línea de los pies.',
      }],
    },
    {
      dia: 6, ordem: 2, nome: 'Peso de un pie al otro', descricao: T[6], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'De pie, pies separados al ancho de la cadera, con una silla cerca para apoyarte.',
        movimento: 'Pasa el peso lentamente a un pie hasta que el otro quede liviano, y luego al otro lado.',
        respiracao: 'Respira con calma y ritmo.',
        sentir: 'La cadera de apoyo sosteniendo el cuerpo con firmeza.',
        atencao: 'Si pierdes el equilibrio, apoya la mano en la silla.',
      }],
    },
    {
      dia: 6, ordem: 3, nome: 'Marcha lenta con apoyo', descricao: T[6], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'De pie, junto a una pared o silla, con una mano apoyada.',
        movimento: 'Sube una rodilla hacia adelante, bájala y sube la otra, como una marcha muy lenta.',
        respiracao: 'Respira libre, sin retener el aire.',
        sentir: 'La cadera moviéndose y el cuerpo buscando equilibrio.',
        atencao: 'Sube la rodilla solo hasta donde sea cómodo; el tronco queda erguido.',
      }],
    },
    {
      dia: 6, ordem: 4, nome: 'Paso lateral corto', descricao: T[6], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'De pie, rodillas un poco sueltas, manos en la cintura.',
        movimento: 'Da un paso corto hacia el costado, junta los pies y da otro paso de vuelta. Ritmo tranquilo.',
        respiracao: 'Respira con naturalidad.',
        sentir: 'Los costados de la cadera trabajando para sostenerte.',
        atencao: 'Despeja el espacio alrededor para no tropezar.',
      }],
    },
    // ----- Día 7 -----
    {
      dia: 7, ordem: 1, nome: 'Círculos de cadera de pie', descricao: T[7], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'De pie, pies al ancho de la cadera, rodillas sueltas y manos en la cintura.',
        movimento: 'Dibuja círculos amplios y lentos con la cadera. Cambia de dirección a la mitad del tiempo.',
        respiracao: 'Respira fluido, acompañando el círculo.',
        sentir: 'Toda la zona de la cadera moviéndose con soltura.',
        atencao: 'Los círculos son del tamaño que te resulte cómodo.',
      }],
    },
    {
      dia: 7, ordem: 2, nome: 'Puente con respiración', descricao: T[7], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas y pies apoyados.',
        movimento: 'Sube la cadera despacio mientras sueltas el aire y bájala vértebra por vértebra mientras inspiras.',
        respiracao: 'Exhalación larga al subir, inspiración tranquila al bajar.',
        sentir: 'Glúteos activos y la espalda acompañando el movimiento.',
        atencao: 'Sube solo hasta donde la espalda se sienta cómoda.',
      }],
    },
    {
      dia: 7, ordem: 3, nome: 'Estiramiento figura cuatro', descricao: T[7], tipo: 'permanencia', bilateral: true,
      variacoes: [{
        preparacao: 'Acostada boca arriba, rodillas dobladas. Cruza el tobillo de una pierna sobre la rodilla de la otra.',
        movimento: 'Quédate así o, si quieres más, acerca con suavidad la pierna de apoyo hacia el pecho. Luego cambia de lado.',
        respiracao: 'Respira lento y profundo.',
        sentir: 'Un estiramiento en el glúteo de la pierna cruzada.',
        atencao: 'Sin tirones; si molesta la rodilla, deja la pierna de apoyo en el suelo.',
        duracao_seg: 30,
      }],
    },
    {
      dia: 7, ordem: 4, nome: 'Relajación final de cadera', descricao: T[7], tipo: 'tempo', bilateral: false,
      variacoes: [{
        preparacao: 'Acostada boca arriba, piernas estiradas o con un cojín debajo de las rodillas.',
        movimento: 'Recorre con la atención tu cadera, glúteos y piernas, y en cada exhalación imagina que se aflojan un poco más.',
        respiracao: 'Respiración lenta, soltando el aire más largo de lo que entra.',
        sentir: 'Las piernas pesadas y la cadera liviana y descansada.',
        atencao: 'Levántate despacio, primero girando de lado.',
      }],
    },
  ],
}

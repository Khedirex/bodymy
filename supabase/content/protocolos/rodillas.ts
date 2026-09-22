// =====================================================================
// BodyMy — Protocolo Descompresión Articular — Reto de 14 Días (RODILLAS).
// Ciclo de 7 días hecho dos veces: semana 1 = v1, semana 2 = v2.
// Todo en casa, sin equipo (silla, pared, toalla, cojín, suelo o cama).
// =====================================================================

import type { ProtocoloConteudo } from './tipos'

const DIA: Record<number, string> = {
  1: 'Día 1 — Despertar suave y circulación',
  2: 'Día 2 — Rótula libre y flexión cómoda',
  3: 'Día 3 — Muslos que sostienen',
  4: 'Día 4 — Caderas y glúteos que protegen',
  5: 'Día 5 — Pantorrillas, tobillos y equilibrio',
  6: 'Día 6 — Fuerza amable para el día a día',
  7: 'Día 7 — Integración y descanso',
}

export const protocolo: ProtocoloConteudo = {
  circuito: 'rodillas',
  semanas: 2,

  alongamentos: [
    {
      ordem: 1,
      nome: 'Péndulo sentada',
      descricao: 'Sentada en el borde de una silla, deja una pierna colgar suelta. Balancéala hacia adelante y atrás con suavidad, sin esfuerzo, como un péndulo.',
      lados: 2,
    },
    {
      ordem: 2,
      nome: 'Tobillos que dibujan',
      descricao: 'Sentada, levanta un pie apenas del suelo y dibuja círculos lentos con el tobillo. Cambia de dirección a la mitad del tiempo.',
      lados: 2,
    },
    {
      ordem: 3,
      nome: 'Talón que se desliza',
      descricao: 'Acostada boca arriba, desliza un talón por el suelo o la cama hacia el glúteo y vuelve a estirar la pierna. Solo hasta donde se sienta cómodo.',
      lados: 2,
    },
    {
      ordem: 4,
      nome: 'Rodilla al pecho',
      descricao: 'Acostada boca arriba, abraza una rodilla y acércala al pecho con suavidad. Respira tranquila y deja que la cadera se afloje.',
      lados: 2,
    },
    {
      ordem: 5,
      nome: 'Círculos de cadera',
      descricao: 'De pie, con las manos en el respaldo de una silla, haz círculos amplios y lentos con la cadera. Las rodillas quedan suaves, sin bloquear.',
      lados: 1,
    },
    {
      ordem: 6,
      nome: 'Muslo de atrás con toalla',
      descricao: 'Acostada, pasa una toalla por la planta de un pie y sube la pierna hasta sentir un estiramiento leve detrás del muslo. La otra rodilla queda doblada.',
      lados: 2,
    },
    {
      ordem: 7,
      nome: 'Pantorrilla en la pared',
      descricao: 'De pie frente a la pared, apoya las manos y lleva una pierna atrás con el talón en el suelo. Inclina el cuerpo apenas hacia la pared hasta sentir la pantorrilla.',
      lados: 2,
    },
    {
      ordem: 8,
      nome: 'Balanceo de peso',
      descricao: 'De pie, pies al ancho de la cadera, pasa el peso de un pie al otro despacio. Siente cómo cada rodilla recibe y suelta el peso con calma.',
      lados: 1,
    },
  ],

  exercicios: [
    // ----- DÍA 1 — Despertar suave y circulación -----
    {
      dia: 1, ordem: 1, nome: 'Péndulo de pierna', descricao: DIA[1], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Sentada en el borde de una silla firme, espalda larga, manos apoyadas a los lados del asiento. Una pierna cuelga libre.',
          movimento: 'Deja que la pierna se balancee hacia adelante y atrás con suavidad, como un péndulo. El pie apenas roza el aire, sin patear.',
          respiracao: 'Respira tranquila por la nariz, sin seguir un ritmo fijo.',
          sentir: 'Una sensación de soltura y de espacio dentro de la rodilla.',
          atencao: 'El movimiento es pequeño y relajado; si algo molesta, reduce el balanceo.',
        },
        {
          preparacao: 'Sentada un poco más alta, sobre un cojín firme encima de la silla, para que la pierna cuelgue más libre.',
          movimento: 'Balancea la pierna con un recorrido un poco mayor y más lento. Al final de cada vaivén, deja que la pierna se detenga sola antes de volver.',
          respiracao: 'Suelta el aire cuando la pierna va hacia adelante, inspira cuando vuelve.',
          sentir: 'La rodilla ligera, como si el peso del pie le diera un poco de espacio.',
          atencao: 'No fuerces la pierna a estirarse del todo; deja que el peso haga el trabajo.',
        },
      ],
    },
    {
      dia: 1, ordem: 2, nome: 'Deslizar el talón', descricao: DIA[1], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Acostada boca arriba en el suelo o la cama, piernas estiradas. Puedes poner un calcetín para que el talón deslice mejor.',
          movimento: 'Desliza un talón hacia el glúteo, doblando la rodilla despacio. Luego estira la pierna de nuevo, sin levantar el pie.',
          respiracao: 'Inspira al doblar, suelta el aire al estirar.',
          sentir: 'La rodilla doblándose y estirándose con suavidad, cada vez un poco más fluida.',
          atencao: 'Muévete solo dentro del rango sin dolor; no busques doblar al máximo.',
        },
        {
          preparacao: 'Igual que antes, boca arriba, con una toalla pequeña doblada bajo el talón para que deslice con facilidad.',
          movimento: 'Desliza el talón más despacio, contando cuatro tiempos al doblar y cuatro al estirar. Al final, deja la pierna larga un instante.',
          respiracao: 'Respiración lenta y larga que acompaña todo el recorrido.',
          sentir: 'Un movimiento más controlado y una sensación de calor suave en la rodilla.',
          atencao: 'Mantén la rodilla apuntando al techo, sin que caiga hacia adentro o hacia afuera.',
        },
      ],
    },
    {
      dia: 1, ordem: 3, nome: 'Bombeo de tobillos', descricao: DIA[1], tipo: 'tempo', bilateral: false,
      variacoes: [
        {
          preparacao: 'Acostada boca arriba, piernas estiradas y relajadas, brazos a los lados del cuerpo.',
          movimento: 'Lleva las puntas de los pies hacia ti y luego empújalas lejos, como pisando un pedal. Ambos pies a la vez, a ritmo tranquilo.',
          respiracao: 'Respira con naturalidad, sin contener el aire.',
          sentir: 'Las pantorrillas trabajando y una sensación de circulación que despierta las piernas.',
          atencao: 'Si sientes un calambre, afloja el movimiento y estira la pantorrilla con calma.',
        },
        {
          preparacao: 'Acostada boca arriba, con los pies apoyados sobre un cojín para que queden un poco elevados.',
          movimento: 'Haz el mismo bombeo, pero más amplio y más lento, llevando las puntas bien hacia ti y bien lejos.',
          respiracao: 'Inspira al traer las puntas, suelta el aire al empujarlas.',
          sentir: 'Las piernas más ligeras y despiertas, desde los pies hasta las rodillas.',
          atencao: 'Mantén las rodillas relajadas; el movimiento nace solo de los tobillos.',
        },
      ],
    },
    {
      dia: 1, ordem: 4, nome: 'Rodilla al pecho con alivio', descricao: DIA[1], tipo: 'permanencia', bilateral: true,
      variacoes: [
        {
          preparacao: 'Acostada boca arriba, rodillas dobladas y pies apoyados. Toma una rodilla con las manos por detrás del muslo.',
          movimento: 'Acerca la rodilla al pecho hasta un punto cómodo y quédate ahí. Deja que la pierna pese en tus manos.',
          respiracao: 'Respira lento y, en cada salida del aire, suelta un poco más la pierna.',
          sentir: 'Una sensación de alivio en la cadera y de espacio alrededor de la rodilla.',
          atencao: 'Sostén por detrás del muslo, no sobre la rodilla, para no apretarla.',
          duracao_seg: 25,
        },
        {
          preparacao: 'Acostada boca arriba, con la otra pierna estirada en el suelo o la cama.',
          movimento: 'Lleva la rodilla al pecho y sostenla. Durante la pausa, haz pequeños círculos lentos con el tobillo de esa pierna.',
          respiracao: 'Respiración profunda y tranquila durante toda la pausa.',
          sentir: 'La cadera abierta y la rodilla suelta, sin presión.',
          atencao: 'Si la pierna estirada tira de la espalda, vuelve a doblarla.',
          duracao_seg: 40,
        },
      ],
    },
    {
      dia: 1, ordem: 5, nome: 'Pedaleo suave acostada', descricao: DIA[1], tipo: 'tempo', bilateral: false,
      variacoes: [
        {
          preparacao: 'Acostada boca arriba, rodillas dobladas y pies apoyados. Brazos relajados a los lados.',
          movimento: 'Desliza un pie por el suelo estirando la pierna y vuelve; luego la otra, como un pedaleo lento que no despega del suelo.',
          respiracao: 'Respira con calma siguiendo el ritmo de las piernas.',
          sentir: 'Las piernas moviéndose ligeras y la rodilla lubricada con cada vuelta.',
          atencao: 'Mantén la espalda apoyada y tranquila; el ritmo es lento.',
        },
        {
          preparacao: 'Acostada boca arriba, con ambos pies un poco levantados del suelo y las rodillas dobladas.',
          movimento: 'Pedalea en el aire con círculos pequeños y lentos, como en una bicicleta muy tranquila.',
          respiracao: 'Suelta el aire en cada vuelta completa, sin apurarte.',
          sentir: 'Calor suave en los muslos y rodillas que se mueven con fluidez.',
          atencao: 'Si la zona lumbar se arquea, apoya un pie y pedalea con una pierna a la vez.',
        },
      ],
    },

    // ----- DÍA 2 — Rótula libre y flexión cómoda -----
    {
      dia: 2, ordem: 1, nome: 'Masaje alrededor de la rótula', descricao: DIA[2], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Sentada en el suelo o la cama, con una pierna estirada y totalmente relajada. El muslo suelto, sin apretar.',
          movimento: 'Con la yema de los dedos, mueve la rótula muy suave hacia arriba y abajo, y luego de lado a lado. Movimientos pequeños y lentos.',
          respiracao: 'Respira tranquila y deja el muslo blando.',
          sentir: 'La rótula deslizándose con más facilidad y una sensación de soltura.',
          atencao: 'Es un toque delicado; si la zona está sensible, reduce la presión.',
        },
        {
          preparacao: 'Igual que antes, con una toalla enrollada bajo la rodilla para que quede apenas doblada y relajada.',
          movimento: 'Mueve la rótula en las cuatro direcciones y luego haz pequeños círculos lentos a su alrededor con los dedos.',
          respiracao: 'Suelta el aire largo mientras masajeas, sin prisa.',
          sentir: 'Calor agradable alrededor de la rodilla y la sensación de que se afloja.',
          atencao: 'Nunca empujes la rótula con fuerza; solo guíala.',
        },
      ],
    },
    {
      dia: 2, ordem: 2, nome: 'Flexión asistida con toalla', descricao: DIA[2], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Acostada boca arriba, con una toalla pasada por debajo de la planta de un pie. Sostén las puntas con las manos.',
          movimento: 'Usa la toalla para acercar el talón hacia el glúteo, doblando la rodilla. Luego deja que la pierna vuelva a estirarse despacio.',
          respiracao: 'Inspira al doblar, suelta el aire al estirar.',
          sentir: 'La toalla te ayuda y la rodilla se dobla sin esfuerzo.',
          atencao: 'Tira con suavidad y detente antes de cualquier molestia.',
        },
        {
          preparacao: 'Acostada boca arriba, toalla bajo el pie, la otra pierna estirada.',
          movimento: 'Dobla la rodilla con ayuda de la toalla y, al llegar al punto cómodo, sostén dos respiraciones antes de volver despacio.',
          respiracao: 'Dos respiraciones lentas en la pausa, luego suelta al estirar.',
          sentir: 'Un poco más de recorrido cómodo que en la semana anterior.',
          atencao: 'La rodilla sigue la línea del pie; no la dejes caer hacia un lado.',
        },
      ],
    },
    {
      dia: 2, ordem: 3, nome: 'Extensión sentada lenta', descricao: DIA[2], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Sentada en una silla firme, espalda apoyada, pies en el suelo al ancho de la cadera.',
          movimento: 'Estira una rodilla levantando el pie hasta donde sea cómodo y bájalo despacio. No hace falta estirar del todo.',
          respiracao: 'Suelta el aire al subir el pie, inspira al bajarlo.',
          sentir: 'El muslo trabajando suave y la rodilla moviéndose con fluidez.',
          atencao: 'Evita dejar caer el pie de golpe; bájalo con control.',
        },
        {
          preparacao: 'Sentada en la silla, con las manos sobre los muslos y la espalda larga, sin apoyarte en el respaldo.',
          movimento: 'Estira la rodilla contando tres tiempos, haz una pequeña pausa arriba y baja en tres tiempos.',
          respiracao: 'Suelta el aire en la subida y en la pausa, inspira al bajar.',
          sentir: 'El muslo más activo y la rodilla estable en todo el recorrido.',
          atencao: 'Si la rodilla chasquea sin dolor, sigue suave; si duele, reduce el recorrido.',
        },
      ],
    },
    {
      dia: 2, ordem: 4, nome: 'Limpiaparabrisas de rodillas', descricao: DIA[2], tipo: 'tempo', bilateral: false,
      variacoes: [
        {
          preparacao: 'Acostada boca arriba, rodillas dobladas y pies apoyados un poco más separados que la cadera.',
          movimento: 'Deja caer ambas rodillas suavemente hacia un lado y vuelve al centro; luego hacia el otro lado. Recorrido pequeño.',
          respiracao: 'Suelta el aire al llevar las rodillas al lado, inspira al volver.',
          sentir: 'Las caderas y rodillas soltándose con un balanceo agradable.',
          atencao: 'Los hombros quedan apoyados; no fuerces las rodillas hacia el suelo.',
        },
        {
          preparacao: 'Igual que antes, con los brazos abiertos en cruz para dar más apoyo.',
          movimento: 'Lleva las rodillas hacia un lado más despacio y un poco más lejos, sostén una respiración y vuelve al centro.',
          respiracao: 'Una respiración completa en cada lado, sin apurarte.',
          sentir: 'Un estiramiento suave en la cadera y los lados de los muslos.',
          atencao: 'Muévete solo hasta donde las rodillas bajen sin molestia.',
        },
      ],
    },
    {
      dia: 2, ordem: 5, nome: 'Talón al glúteo boca abajo', descricao: DIA[2], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Acostada boca abajo en la cama o sobre una manta, frente apoyada sobre las manos. Un cojín bajo el vientre si lo necesitas.',
          movimento: 'Dobla una rodilla llevando el talón hacia el glúteo, hasta donde sea cómodo, y bájalo despacio.',
          respiracao: 'Suelta el aire al doblar, inspira al bajar.',
          sentir: 'La parte de atrás del muslo trabajando y la rodilla doblándose libre.',
          atencao: 'Si la posición boca abajo molesta la espalda, hazlo de pie, apoyada en una silla.',
        },
        {
          preparacao: 'Boca abajo, igual que antes, con una toalla pequeña doblada bajo la rodilla que trabaja.',
          movimento: 'Dobla la rodilla más lento, en cuatro tiempos, y baja también en cuatro, sin dejar caer el pie.',
          respiracao: 'Respiración lenta y continua durante todo el movimiento.',
          sentir: 'Más control y un recorrido cómodo un poco mayor.',
          atencao: 'La cadera queda apoyada; no la levantes para ganar recorrido.',
        },
      ],
    },

    // ----- DÍA 3 — Muslos que sostienen -----
    {
      dia: 3, ordem: 1, nome: 'Rodilla que aprieta la toalla', descricao: DIA[3], tipo: 'permanencia', bilateral: true,
      variacoes: [
        {
          preparacao: 'Sentada en el suelo o la cama, piernas estiradas, con una toalla enrollada bajo una rodilla.',
          movimento: 'Aprieta la parte de atrás de la rodilla contra la toalla activando el muslo, y mantén. Las puntas del pie miran al techo.',
          respiracao: 'Respira con normalidad; no contengas el aire mientras sostienes.',
          sentir: 'El músculo de adelante del muslo firme y la rótula subiendo un poquito.',
          atencao: 'La fuerza es moderada; si aparece dolor detrás de la rodilla, afloja.',
          duracao_seg: 20,
        },
        {
          preparacao: 'Igual que antes, con la toalla un poco menos enrollada para que la rodilla quede casi estirada.',
          movimento: 'Aprieta la toalla y, al mismo tiempo, lleva las puntas del pie hacia ti. Sostén con el muslo activo.',
          respiracao: 'Respiración tranquila y constante durante toda la pausa.',
          sentir: 'Todo el muslo despierto y la pierna firme como un tronco.',
          atencao: 'Suelta despacio al terminar, sin relajar de golpe.',
          duracao_seg: 35,
        },
      ],
    },
    {
      dia: 3, ordem: 2, nome: 'Pierna recta al cielo', descricao: DIA[3], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Acostada boca arriba, una rodilla doblada con el pie apoyado y la otra pierna estirada.',
          movimento: 'Activa el muslo de la pierna estirada y levántala hasta la altura de la otra rodilla. Baja despacio.',
          respiracao: 'Suelta el aire al subir, inspira al bajar.',
          sentir: 'El muslo trabajando y la rodilla firme, sin doblarse.',
          atencao: 'Mantén la zona lumbar apoyada; si se arquea, sube menos.',
        },
        {
          preparacao: 'Igual que antes, boca arriba, con una rodilla doblada y la otra pierna estirada.',
          movimento: 'Sube la pierna en tres tiempos, sostén un instante arriba y baja en tres tiempos, sin apoyar del todo antes de repetir.',
          respiracao: 'Suelta el aire en la subida y en la pausa, inspira al bajar.',
          sentir: 'Más trabajo en el muslo y la sensación de una pierna fuerte y estable.',
          atencao: 'Si la rodilla se dobla al subir, reduce la altura.',
        },
      ],
    },
    {
      dia: 3, ordem: 3, nome: 'Cojín entre las rodillas', descricao: DIA[3], tipo: 'tempo', bilateral: false,
      variacoes: [
        {
          preparacao: 'Sentada en una silla, pies apoyados, con un cojín entre las rodillas.',
          movimento: 'Aprieta el cojín con suavidad durante tres segundos y suelta. Repite a ritmo tranquilo.',
          respiracao: 'Suelta el aire al apretar, inspira al soltar.',
          sentir: 'La parte interna de los muslos activa, dando apoyo a las rodillas.',
          atencao: 'Aprieta con fuerza moderada, sin tensar hombros ni mandíbula.',
        },
        {
          preparacao: 'Sentada al borde de la silla, sin apoyar la espalda, cojín entre las rodillas.',
          movimento: 'Aprieta el cojín y, sin soltarlo, estira un poco las dos rodillas levantando apenas los pies. Baja y suelta.',
          respiracao: 'Suelta el aire al apretar y subir, inspira al volver.',
          sentir: 'Muslos trabajando juntos y rodillas alineadas.',
          atencao: 'Levanta solo unos centímetros; la espalda se mantiene larga.',
        },
      ],
    },
    {
      dia: 3, ordem: 4, nome: 'Arco corto con toalla', descricao: DIA[3], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Acostada o semisentada, con una toalla bien enrollada o un cojín bajo una rodilla.',
          movimento: 'Sin despegar la rodilla del apoyo, levanta el talón estirando la pierna. Baja despacio.',
          respiracao: 'Suelta el aire al estirar, inspira al bajar.',
          sentir: 'El músculo de adelante del muslo, justo encima de la rodilla, trabajando.',
          atencao: 'El recorrido es corto; no hace falta estirar del todo si molesta.',
        },
        {
          preparacao: 'Igual que antes, con el apoyo bajo la rodilla un poco más alto.',
          movimento: 'Estira la pierna, sostén tres segundos con el muslo firme y baja en tres tiempos.',
          respiracao: 'Respira durante la pausa, sin contener el aire.',
          sentir: 'Un trabajo más intenso encima de la rodilla, controlado y seguro.',
          atencao: 'Mantén las puntas del pie mirando al techo durante todo el movimiento.',
        },
      ],
    },
    {
      dia: 3, ordem: 5, nome: 'Pierna estirada en la silla', descricao: DIA[3], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Sentada en una silla firme, con la espalda apoyada. Estira una pierna adelante con el talón en el suelo.',
          movimento: 'Con la rodilla estirada, levanta el pie unos centímetros del suelo y bájalo despacio.',
          respiracao: 'Suelta el aire al subir, inspira al bajar.',
          sentir: 'Todo el muslo trabajando y la pierna ligera.',
          atencao: 'Si sientes tensión en la espalda, apóyate bien en el respaldo.',
        },
        {
          preparacao: 'Sentada un poco más adelante en la silla, manos a los lados del asiento, pierna estirada.',
          movimento: 'Levanta el pie, haz dos pequeños movimientos arriba y abajo sin tocar el suelo, y baja despacio.',
          respiracao: 'Respira con naturalidad durante los pequeños movimientos.',
          sentir: 'Un calor sano en el muslo y más confianza en la pierna.',
          atencao: 'Mantén la rodilla estirada sin bloquearla con fuerza.',
        },
      ],
    },

    // ----- DÍA 4 — Caderas y glúteos que protegen -----
    {
      dia: 4, ordem: 1, nome: 'Puente suave', descricao: DIA[4], tipo: 'tempo', bilateral: false,
      variacoes: [
        {
          preparacao: 'Acostada boca arriba, rodillas dobladas, pies apoyados al ancho de la cadera y brazos a los lados.',
          movimento: 'Aprieta los glúteos y eleva la cadera solo unos centímetros. Baja despacio, vértebra por vértebra.',
          respiracao: 'Suelta el aire al subir, inspira al bajar.',
          sentir: 'Los glúteos trabajando y las rodillas estables, sin presión.',
          atencao: 'Las rodillas apuntan hacia adelante, en línea con el segundo dedo del pie.',
        },
        {
          preparacao: 'Igual que antes, con un cojín entre las rodillas.',
          movimento: 'Aprieta el cojín, eleva la cadera un poco más alto, sostén dos respiraciones y baja despacio.',
          respiracao: 'Dos respiraciones tranquilas arriba, luego suelta al bajar.',
          sentir: 'Glúteos y muslos trabajando juntos, dando soporte a las rodillas.',
          atencao: 'No arquees la espalda; la subida viene de los glúteos.',
        },
      ],
    },
    {
      dia: 4, ordem: 2, nome: 'Almeja de lado', descricao: DIA[4], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Acostada de lado, rodillas dobladas y juntas, cabeza apoyada en el brazo o en un cojín.',
          movimento: 'Manteniendo los pies juntos, abre la rodilla de arriba como una almeja y ciérrala despacio.',
          respiracao: 'Suelta el aire al abrir, inspira al cerrar.',
          sentir: 'El costado del glúteo trabajando, cerca de la cadera.',
          atencao: 'La cadera no rueda hacia atrás; abre solo lo que puedas sin girar el cuerpo.',
        },
        {
          preparacao: 'Igual que antes, acostada de lado, con la mano de arriba apoyada en la cadera para sentirla quieta.',
          movimento: 'Abre la rodilla, sostén dos segundos arriba y cierra en tres tiempos.',
          respiracao: 'Respira con calma en la pausa, sin contener el aire.',
          sentir: 'Un trabajo más profundo en el glúteo lateral.',
          atencao: 'Si molesta la rodilla de abajo, pon un cojín entre las rodillas y el suelo.',
        },
      ],
    },
    {
      dia: 4, ordem: 3, nome: 'Elevación lateral acostada', descricao: DIA[4], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Acostada de lado, la pierna de abajo doblada para dar apoyo y la de arriba estirada.',
          movimento: 'Levanta la pierna de arriba un palmo, con el pie paralelo al suelo, y bájala despacio.',
          respiracao: 'Suelta el aire al subir, inspira al bajar.',
          sentir: 'El costado de la cadera trabajando.',
          atencao: 'No lleves la pierna hacia adelante; mantenla en línea con el cuerpo.',
        },
        {
          preparacao: 'Igual que antes, de lado, con la pierna de arriba estirada y el cuerpo largo.',
          movimento: 'Sube la pierna en tres tiempos, sostén un instante y baja en tres tiempos, sin apoyarla del todo.',
          respiracao: 'Respiración constante, sin apurar la bajada.',
          sentir: 'Más trabajo en la cadera y una pierna que se mueve con control.',
          atencao: 'Sube solo hasta donde la cadera no se inclina hacia atrás.',
        },
      ],
    },
    {
      dia: 4, ordem: 4, nome: 'Patada atrás con silla', descricao: DIA[4], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'De pie detrás de una silla firme, manos en el respaldo, rodillas suaves.',
          movimento: 'Lleva una pierna estirada hacia atrás unos centímetros, apretando el glúteo, y vuelve despacio.',
          respiracao: 'Suelta el aire al llevar la pierna atrás, inspira al volver.',
          sentir: 'El glúteo trabajando y la rodilla de apoyo firme.',
          atencao: 'No inclines el tronco hacia adelante; el movimiento es pequeño.',
        },
        {
          preparacao: 'De pie detrás de la silla, con solo las yemas de los dedos en el respaldo.',
          movimento: 'Lleva la pierna atrás, sostén dos segundos y vuelve en tres tiempos, sin apoyar el pie entre repeticiones.',
          respiracao: 'Respira con calma durante la pausa.',
          sentir: 'Glúteo más activo y más equilibrio en la pierna de apoyo.',
          atencao: 'Mantén la rodilla de apoyo levemente flexionada, sin bloquear.',
        },
      ],
    },
    {
      dia: 4, ordem: 5, nome: 'Apertura lateral de pie', descricao: DIA[4], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'De pie al lado de una silla, una mano en el respaldo, pies juntos.',
          movimento: 'Lleva una pierna estirada hacia el lado unos centímetros y vuelve despacio a juntar los pies.',
          respiracao: 'Suelta el aire al abrir, inspira al cerrar.',
          sentir: 'El costado de la cadera trabajando y la rodilla de apoyo estable.',
          atencao: 'El cuerpo queda recto; no te inclines hacia el lado contrario.',
        },
        {
          preparacao: 'De pie al lado de la silla, apenas con la punta de los dedos en el respaldo.',
          movimento: 'Abre la pierna, sostén dos segundos y vuelve en tres tiempos sin apoyar el pie.',
          respiracao: 'Respiración tranquila durante todo el movimiento.',
          sentir: 'Cadera fuerte y más estabilidad en la pierna de apoyo.',
          atencao: 'Las puntas del pie miran hacia adelante, no hacia arriba.',
        },
      ],
    },

    // ----- DÍA 5 — Pantorrillas, tobillos y equilibrio -----
    {
      dia: 5, ordem: 1, nome: 'Círculos de tobillo', descricao: DIA[5], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Sentada en una silla, espalda apoyada. Levanta un pie apenas del suelo, sosteniendo el muslo con las manos si lo necesitas.',
          movimento: 'Dibuja círculos lentos con el tobillo, primero en un sentido y luego en el otro.',
          respiracao: 'Respira con naturalidad, sin prisa.',
          sentir: 'El tobillo soltándose y la pantorrilla despertando.',
          atencao: 'Solo se mueve el tobillo; la rodilla queda quieta.',
        },
        {
          preparacao: 'Sentada, con la pierna estirada adelante y el talón apoyado en el suelo.',
          movimento: 'Dibuja círculos más amplios y más lentos, como si escribieras con los dedos del pie.',
          respiracao: 'Suelta el aire largo en cada vuelta.',
          sentir: 'Todo el tobillo y la pantorrilla más móviles.',
          atencao: 'Si aparece un calambre, apoya el pie y descansa un momento.',
        },
      ],
    },
    {
      dia: 5, ordem: 2, nome: 'Subir a las puntas', descricao: DIA[5], tipo: 'tempo', bilateral: false,
      variacoes: [
        {
          preparacao: 'De pie detrás de una silla firme, manos en el respaldo, pies al ancho de la cadera.',
          movimento: 'Sube despacio a las puntas de los pies y baja los talones con control.',
          respiracao: 'Suelta el aire al subir, inspira al bajar.',
          sentir: 'Las pantorrillas trabajando y los tobillos firmes.',
          atencao: 'El peso va sobre el dedo gordo y el segundo dedo, sin que el tobillo se vaya hacia afuera.',
        },
        {
          preparacao: 'De pie detrás de la silla, apenas con la punta de los dedos en el respaldo.',
          movimento: 'Sube a las puntas en dos tiempos, sostén un instante y baja en cuatro tiempos.',
          respiracao: 'Respiración tranquila, sin contener el aire arriba.',
          sentir: 'Pantorrillas más fuertes y más control en la bajada.',
          atencao: 'Las rodillas quedan suaves, sin bloquearlas hacia atrás.',
        },
      ],
    },
    {
      dia: 5, ordem: 3, nome: 'Balanceo talón y punta', descricao: DIA[5], tipo: 'tempo', bilateral: false,
      variacoes: [
        {
          preparacao: 'De pie detrás de una silla, manos en el respaldo, pies paralelos.',
          movimento: 'Pasa el peso hacia las puntas y luego hacia los talones, levantando apenas las puntas. Un balanceo suave, adelante y atrás.',
          respiracao: 'Respira con calma siguiendo el balanceo.',
          sentir: 'Tobillos trabajando y el cuerpo buscando su centro.',
          atencao: 'Movimiento pequeño; las manos quedan listas en el respaldo.',
        },
        {
          preparacao: 'De pie al lado de la silla, una sola mano apoyada.',
          movimento: 'Haz el balanceo más lento, sosteniendo un segundo en las puntas y un segundo en los talones.',
          respiracao: 'Suelta el aire en cada cambio de apoyo.',
          sentir: 'Más equilibrio y los pies más despiertos.',
          atencao: 'Si pierdes el equilibrio, vuelve a apoyar las dos manos.',
        },
      ],
    },
    {
      dia: 5, ordem: 4, nome: 'Equilibrio en un pie', descricao: DIA[5], tipo: 'permanencia', bilateral: true,
      variacoes: [
        {
          preparacao: 'De pie al lado de una silla firme, una mano en el respaldo, mirada al frente.',
          movimento: 'Levanta un pie apenas del suelo y quédate en equilibrio sobre la otra pierna, con la rodilla suave.',
          respiracao: 'Respira lento y tranquilo, sin contener el aire.',
          sentir: 'El pie de apoyo haciendo pequeños ajustes y la rodilla estable.',
          atencao: 'Si te desequilibras, apoya el pie; la silla siempre queda al alcance.',
          duracao_seg: 20,
        },
        {
          preparacao: 'De pie al lado de la silla, solo con la punta de los dedos en el respaldo o con la mano cerca, sin tocar.',
          movimento: 'Levanta el pie un poco más, con la rodilla doblada al frente, y sostén el equilibrio.',
          respiracao: 'Respiración lenta; fija la mirada en un punto adelante.',
          sentir: 'Más confianza en la pierna de apoyo.',
          atencao: 'La rodilla de apoyo queda alineada con el segundo dedo del pie, sin irse hacia adentro.',
          duracao_seg: 35,
        },
      ],
    },
    {
      dia: 5, ordem: 5, nome: 'Pantorrilla larga en la pared', descricao: DIA[5], tipo: 'permanencia', bilateral: true,
      variacoes: [
        {
          preparacao: 'De pie frente a la pared, manos apoyadas a la altura del pecho. Una pierna adelante con la rodilla suave, la otra atrás.',
          movimento: 'Con el talón de atrás en el suelo, inclina el cuerpo apenas hacia la pared hasta sentir la pantorrilla. Quédate ahí.',
          respiracao: 'Respira profundo y suelta un poco más en cada salida del aire.',
          sentir: 'Un estiramiento agradable en la pantorrilla de la pierna de atrás.',
          atencao: 'El pie de atrás apunta hacia la pared, no hacia afuera.',
          duracao_seg: 25,
        },
        {
          preparacao: 'Igual que antes, con la pierna de atrás un paso más lejos de la pared.',
          movimento: 'Inclina el cuerpo hacia la pared y, a mitad de la pausa, dobla un poquito la rodilla de atrás sin levantar el talón.',
          respiracao: 'Respiración lenta y larga durante toda la pausa.',
          sentir: 'El estiramiento bajando de la pantorrilla hacia el tobillo.',
          atencao: 'Estira hasta una tensión suave, nunca hasta el dolor.',
          duracao_seg: 40,
        },
      ],
    },

    // ----- DÍA 6 — Fuerza amable para el día a día -----
    {
      dia: 6, ordem: 1, nome: 'Sentarse y levantarse', descricao: DIA[6], tipo: 'tempo', bilateral: false,
      variacoes: [
        {
          preparacao: 'Sentada al borde de una silla firme apoyada contra la pared, pies al ancho de la cadera, manos en los muslos.',
          movimento: 'Inclina el tronco adelante y levántate empujando el suelo con los pies. Vuelve a sentarte despacio, sin dejarte caer.',
          respiracao: 'Suelta el aire al levantarte, inspira al sentarte.',
          sentir: 'Muslos y glúteos trabajando juntos, como en el día a día.',
          atencao: 'Las rodillas siguen la línea del segundo dedo del pie; puedes usar las manos en los muslos para ayudarte.',
        },
        {
          preparacao: 'Sentada al borde de la silla, brazos cruzados sobre el pecho.',
          movimento: 'Levántate sin usar las manos y siéntate en cuatro tiempos, rozando apenas el asiento antes de volver a subir.',
          respiracao: 'Suelta el aire al subir, inspira durante la bajada lenta.',
          sentir: 'Más fuerza y control, y confianza al levantarte.',
          atencao: 'Si cuesta sin manos, apóyalas en los muslos; lo importante es la bajada lenta.',
        },
      ],
    },
    {
      dia: 6, ordem: 2, nome: 'Sentadilla corta en la pared', descricao: DIA[6], tipo: 'permanencia', bilateral: false,
      variacoes: [
        {
          preparacao: 'De pie con la espalda apoyada en la pared, pies un paso adelante y al ancho de la cadera.',
          movimento: 'Desliza la espalda por la pared doblando apenas las rodillas, como si fueras a sentarte muy alto, y quédate ahí.',
          respiracao: 'Respira con calma, sin contener el aire.',
          sentir: 'Los muslos trabajando de forma firme y tranquila.',
          atencao: 'Baja muy poco: las rodillas nunca pasan de la punta de los pies. Sube si sientes dolor.',
          duracao_seg: 20,
        },
        {
          preparacao: 'Igual que antes, espalda en la pared, con un cojín entre las rodillas.',
          movimento: 'Baja un poco más que la semana anterior, siempre en una flexión cómoda, aprieta el cojín y sostén.',
          respiracao: 'Respiración constante durante toda la pausa.',
          sentir: 'Muslos firmes y rodillas bien alineadas.',
          atencao: 'No bajes más allá de un ángulo cómodo; es una sentadilla corta, nunca profunda.',
          duracao_seg: 30,
        },
      ],
    },
    {
      dia: 6, ordem: 3, nome: 'Toque de escalón', descricao: DIA[6], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'De pie al lado de una silla, una mano en el respaldo, pies juntos.',
          movimento: 'Levanta un pie como si subieras un escalón bajo, toca el suelo adelante con la punta y vuelve.',
          respiracao: 'Respira con naturalidad, a ritmo tranquilo.',
          sentir: 'La cadera y el muslo levantando la pierna y la rodilla de apoyo estable.',
          atencao: 'Sin saltos ni golpes; el pie toca el suelo con suavidad.',
        },
        {
          preparacao: 'De pie al lado de la silla, apenas con la punta de los dedos en el respaldo.',
          movimento: 'Levanta la rodilla un poco más alto, toca adelante con la punta y vuelve despacio, pasando por arriba otra vez.',
          respiracao: 'Suelta el aire al subir la rodilla, inspira al volver.',
          sentir: 'Más control y la sensación de subir escaleras con confianza.',
          atencao: 'La rodilla de apoyo queda suave y alineada con el pie.',
        },
      ],
    },
    {
      dia: 6, ordem: 4, nome: 'Marcha lenta con silla', descricao: DIA[6], tipo: 'tempo', bilateral: false,
      variacoes: [
        {
          preparacao: 'De pie detrás de una silla firme, manos en el respaldo, espalda larga.',
          movimento: 'Marcha en el lugar levantando una rodilla y luego la otra, despacio y a una altura cómoda.',
          respiracao: 'Respira con calma siguiendo el ritmo de los pasos.',
          sentir: 'Las piernas activas y la circulación despierta.',
          atencao: 'Apoya el pie con suavidad, sin golpear el suelo.',
        },
        {
          preparacao: 'De pie al lado de la silla, una sola mano en el respaldo.',
          movimento: 'Marcha más lento, sosteniendo la rodilla arriba un segundo antes de apoyar el pie.',
          respiracao: 'Suelta el aire al subir cada rodilla.',
          sentir: 'Más equilibrio en cada paso y rodillas que se mueven con control.',
          atencao: 'Mantén el tronco erguido; no te inclines hacia atrás al subir la rodilla.',
        },
      ],
    },
    {
      dia: 6, ordem: 5, nome: 'Paso lateral suave', descricao: DIA[6], tipo: 'tempo', bilateral: false,
      variacoes: [
        {
          preparacao: 'De pie, pies juntos, rodillas levemente dobladas. Puedes tener una pared o una silla cerca.',
          movimento: 'Da un paso al lado, junta el otro pie y vuelve hacia el otro lado. Pasos cortos y tranquilos.',
          respiracao: 'Respira con naturalidad durante todo el movimiento.',
          sentir: 'Los costados de la cadera trabajando y las rodillas estables.',
          atencao: 'Las puntas de los pies miran siempre hacia adelante.',
        },
        {
          preparacao: 'De pie, con las rodillas un poco más dobladas y las manos en la cintura.',
          movimento: 'Da pasos laterales un poco más largos manteniendo la misma altura, sin subir ni bajar entre pasos.',
          respiracao: 'Respiración constante, sin contener el aire.',
          sentir: 'Glúteos y muslos trabajando juntos, con más confianza al moverte.',
          atencao: 'La flexión es pequeña; si molesta, estira un poco más las rodillas.',
        },
      ],
    },

    // ----- DÍA 7 — Integración y descanso -----
    {
      dia: 7, ordem: 1, nome: 'Mini flexión con puntas', descricao: DIA[7], tipo: 'tempo', bilateral: false,
      variacoes: [
        {
          preparacao: 'De pie detrás de una silla, manos en el respaldo, pies al ancho de la cadera.',
          movimento: 'Dobla apenas las rodillas, vuelve a estirarlas y sube a las puntas. Baja los talones y repite en una sola ola.',
          respiracao: 'Inspira al doblar, suelta el aire al subir a las puntas.',
          sentir: 'Tobillos, rodillas y caderas moviéndose juntos, en armonía.',
          atencao: 'La flexión es pequeña y las rodillas siguen la línea de los pies.',
        },
        {
          preparacao: 'De pie detrás de la silla, apenas con la punta de los dedos en el respaldo.',
          movimento: 'Haz la misma ola más lenta, sosteniendo un instante en las puntas antes de bajar.',
          respiracao: 'Respiración larga que acompaña todo el movimiento.',
          sentir: 'Piernas coordinadas y más seguridad en el apoyo.',
          atencao: 'Si pierdes el equilibrio arriba, sube menos a las puntas.',
        },
      ],
    },
    {
      dia: 7, ordem: 2, nome: 'Péndulo de pie', descricao: DIA[7], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'De pie al lado de una silla, una mano en el respaldo. Si puedes, párate sobre un cojín firme o un libro grueso con la pierna de apoyo, para que la otra cuelgue libre.',
          movimento: 'Balancea la pierna libre hacia adelante y atrás, suelta y relajada, con un recorrido pequeño.',
          respiracao: 'Respira tranquila, sin seguir un ritmo fijo.',
          sentir: 'La rodilla suelta y la cadera moviéndose sin esfuerzo.',
          atencao: 'Es un balanceo suave, no una patada.',
        },
        {
          preparacao: 'Igual que antes, con la mano apenas apoyada en el respaldo.',
          movimento: 'Balancea con un recorrido un poco mayor y más lento, dejando que la pierna se detenga sola en cada extremo.',
          respiracao: 'Suelta el aire cuando la pierna va hacia adelante.',
          sentir: 'La pierna ligera y una sensación de espacio en la articulación.',
          atencao: 'La pierna de apoyo queda suave y firme; si te cansas, cambia de lado.',
        },
      ],
    },
    {
      dia: 7, ordem: 3, nome: 'Mecerse con las rodillas', descricao: DIA[7], tipo: 'tempo', bilateral: false,
      variacoes: [
        {
          preparacao: 'Acostada boca arriba, lleva las dos rodillas hacia el pecho y sostenlas con las manos por detrás de los muslos.',
          movimento: 'Mécete suavemente de un lado al otro, como una cuna, con un movimiento pequeño.',
          respiracao: 'Respira lento y deja que el cuerpo se afloje.',
          sentir: 'Un masaje suave en la espalda y alivio en caderas y rodillas.',
          atencao: 'Si llevar las dos rodillas molesta, hazlo con una pierna y la otra apoyada.',
        },
        {
          preparacao: 'Igual que antes, rodillas al pecho, manos por detrás de los muslos.',
          movimento: 'Mécete de lado a lado y luego haz pequeños círculos con las rodillas juntas, despacio.',
          respiracao: 'Suelta el aire largo en cada vuelta.',
          sentir: 'Todo el cuerpo relajado y las rodillas con más espacio.',
          atencao: 'Sostén siempre por detrás de los muslos, no sobre las rodillas.',
        },
      ],
    },
    {
      dia: 7, ordem: 4, nome: 'Pierna al cielo con toalla', descricao: DIA[7], tipo: 'tempo', bilateral: true,
      variacoes: [
        {
          preparacao: 'Acostada boca arriba, rodillas dobladas. Pasa una toalla por la planta de un pie y sostén las puntas.',
          movimento: 'Con ayuda de la toalla, estira la pierna hacia el techo hasta un punto cómodo y vuelve a doblarla despacio.',
          respiracao: 'Suelta el aire al estirar, inspira al doblar.',
          sentir: 'Un estiramiento suave detrás del muslo y la rodilla estirándose con facilidad.',
          atencao: 'No hace falta estirar del todo; basta con una tensión leve.',
        },
        {
          preparacao: 'Boca arriba, con la otra pierna estirada en el suelo y la toalla bajo el pie que trabaja.',
          movimento: 'Estira la pierna hacia el techo, sostén dos respiraciones y, en la pausa, lleva las puntas del pie hacia ti. Vuelve despacio.',
          respiracao: 'Dos respiraciones lentas en la pausa.',
          sentir: 'El estiramiento de toda la parte de atrás de la pierna, sin tirones.',
          atencao: 'Si la espalda se levanta, dobla la pierna que está en el suelo.',
        },
      ],
    },
    {
      dia: 7, ordem: 5, nome: 'Piernas en descanso', descricao: DIA[7], tipo: 'permanencia', bilateral: false,
      variacoes: [
        {
          preparacao: 'Acostada boca arriba, con las pantorrillas apoyadas sobre el asiento de una silla o sobre cojines altos. Brazos relajados.',
          movimento: 'Quédate quieta y deja que las piernas descansen por completo. Suelta el peso de las rodillas.',
          respiracao: 'Inspira por la nariz y suelta el aire lento por la boca.',
          sentir: 'Piernas ligeras y una sensación de alivio y calma en las rodillas.',
          atencao: 'Si sientes hormigueo, acerca un poco la cadera o baja la altura del apoyo.',
          duracao_seg: 30,
        },
        {
          preparacao: 'Igual que antes, con las pantorrillas sobre la silla y una toalla doblada bajo la cabeza.',
          movimento: 'Descansa y, en cada salida del aire, imagina que las rodillas se aflojan y ganan espacio. Al final, mueve los dedos de los pies despacio.',
          respiracao: 'Respiración lenta, con la salida del aire más larga que la entrada.',
          sentir: 'Todo el cuerpo tranquilo y las piernas livianas.',
          atencao: 'Al terminar, gira de lado y levántate con calma, sin prisa.',
          duracao_seg: 45,
        },
      ],
    },
  ],
}

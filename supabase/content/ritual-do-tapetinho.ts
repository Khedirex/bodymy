// =====================================================================
// BodyMy — Conteúdo do "Protocolo 28 Dias: Drenagem Tailandesa"
//
// Movimentos suaves INSPIRADOS na massagem tailandesa: movimento lento,
// consciente, respiração, liberação de tensão, reconexão com o corpo. NÃO
// afirma efeito de drenagem linfática nem qualquer alegação terapêutica.
// Sem promessas de emagrecimento, medidas ou prazos, sem linguagem punitiva.
// Fonte única usada tanto pelo seed (novos ambientes) quanto pelo gerador da
// migração de produção.
// =====================================================================

export const PROGRAMA = {
  productSlugNovo: 'drenagem-tailandesa',
  // Slugs anteriores do MESMO produto — a migração usa esta lista (em ordem
  // de prioridade) para localizar o produto qualquer que seja o estado atual
  // do banco em produção.
  legacySlugs: ['ritual-do-tapetinho', 'pilates-somatico', 'caminhada-japonesa'],
  productNome: 'Protocolo 28 Dias: Drenagem Tailandesa',
  productDescricao:
    'Movimentos suaves inspirados na massagem tailandesa: 28 dias de prática lenta e consciente para relaxar o corpo e soltar a tensão do dia, no seu ritmo e sem equipamento.',
  programaNome: 'Protocolo 28 Dias: Drenagem Tailandesa',
  programaDescricao:
    'Prática progressiva de 4 semanas com movimentos inspirados na massagem tailandesa — lentos e conscientes, para relaxar, respirar melhor e soltar a tensão, no seu ritmo.',
  salesPage: {
    headline: 'Reserve 28 dias para cuidar do seu corpo, no seu ritmo',
    subheadline: 'Movimentos suaves inspirados na massagem tailandesa — sem academia, sem equipamento, sem pressa.',
    bullets: [
      'Práticas guiadas de 10 a 25 minutos, dia a dia',
      'Movimentos lentos e conscientes inspirados na massagem tailandesa',
      'Feito para quem está começando — respeitando os seus limites',
    ],
    cta_label: 'QUERO O PROTOCOLO',
  },
} as const

// Aviso de segurança — exibido na 1ª aula e na tela do programa.
export const AVISO_SEGURANCA =
  'Este contenido es educativo y de bienestar — no sustituye la fisioterapia, al médico ni a otro profesional de la salud. Respeta siempre tus límites: el movimiento es para dar alivio, nunca dolor. Si sientes dolor, mareo o incomodidad, detente y, si es necesario, busca orientación profesional. Si tienes alguna condición de salud, habla con tu médico antes de empezar.'

export type BlocoTipo = 'texto' | 'passo' | 'dica' | 'aviso'
export interface Bloco {
  tipo: BlocoTipo
  titulo?: string
  conteudo: string
}
export interface Aula {
  titulo: string
  intro: string
  duracao: number
  blocos: Bloco[]
}
export interface Dia {
  titulo: string // "Dia 1", etc.
  aula: Aula
}
export interface Semana {
  numero: number
  titulo: string
  dias: Dia[]
}

// Helper para montar um movimento (passo) com os detalhes do somático.
function mov(
  nome: string,
  comoFazer: string,
  respiracao: string,
  repeticoes: string,
  sentir: string,
  alerta: string,
): Bloco {
  return {
    tipo: 'passo',
    titulo: nome,
    conteudo:
      `Cómo hacerlo: ${comoFazer}\n` +
      `Respiración: ${respiracao}\n` +
      `Repeticiones: ${repeticoes}\n` +
      `Vas a sentir: ${sentir}\n` +
      `⚠️ Señal para detenerte: ${alerta}`,
  }
}

const prep = (t: string): Bloco => ({ tipo: 'texto', titulo: 'Preparación', conteudo: t })
const fecho = (t: string): Bloco => ({ tipo: 'texto', titulo: 'Para terminar', conteudo: t })
const dica = (t: string): Bloco => ({ tipo: 'dica', titulo: 'Consejo del día', conteudo: t })

// =====================================================================
// SEMANA 1 — Reconhecendo o corpo (percepção e respiração; deitada/sentada)
// =====================================================================
const semana1: Semana = {
  numero: 1,
  titulo: 'Semana 1 — Reconociendo el cuerpo',
  dias: [
    {
      titulo: 'Día 1',
      aula: {
        titulo: 'Llegando al cuerpo',
        duracao: 10,
        intro:
          '¡Bienvenida! Hoy no vamos a "hacer ejercicio" — solo vamos a llegar. Acostarte, respirar y percibir el cuerpo que ya está aquí. Es la base de todo lo que viene después.',
        blocos: [
          { tipo: 'aviso', titulo: 'Antes de empezar', conteudo: AVISO_SEGURANCA },
          prep('Recuéstate boca arriba sobre un tapete, toalla o en la cama. Dobla las rodillas con los pies apoyados, al ancho de la cadera. Deja los brazos a los lados del cuerpo. Si te resulta más cómodo, coloca una almohada fina bajo la cabeza.'),
          mov(
            'Sintiendo el apoyo',
            'Cierra los ojos y percibe los puntos del cuerpo que tocan el suelo: la cabeza, la espalda, la cadera, los pies. No cambies nada, solo observa.',
            'Respira por la nariz, a tu ritmo natural, sin controlar.',
            '1 minuto observando.',
            'el peso del cuerpo entregándose al apoyo, como si te hundieras un poquito.',
            'nada aquí exige fuerza — si la zona lumbar molesta, acerca más los pies a la cadera.',
          ),
          mov(
            'Respiración en la panza',
            'Lleva una mano a la panza. Al inspirar, deja que la panza suba suavemente bajo la mano; al soltar el aire, deja que baje. Sin empujar.',
            'Inspira contando hasta 3, suelta contando hasta 4.',
            '8 a 10 respiraciones lentas.',
            'la panza moviéndose con el aire, y los hombros poniéndose más pesados.',
            'si te mareas o te falta el aire, vuelve a la respiración normal.',
          ),
          fecho('Quédate un instante más acostada, sintiendo cómo está el cuerpo ahora. Después abre los ojos despacio. Listo — ya empezaste.'),
          dica('No necesitas "hacerlo bonito". En lo somático, aparecer y sentir ya es la práctica entera. El resto llega solo.'),
        ],
      },
    },
    {
      titulo: 'Día 2',
      aula: {
        titulo: 'La respiración que suelta',
        duracao: 12,
        intro:
          'Hoy unimos la respiración con un micromovimiento de los hombros. Cuando la respiración guía, el cuerpo se suelta sin esfuerzo.',
        blocos: [
          prep('Acostada boca arriba, rodillas dobladas y pies apoyados. Brazos a los lados del cuerpo, palmas hacia arriba.'),
          mov(
            'Hombros que suben y se derriten',
            'Al inspirar, lleva suavemente los hombros hacia las orejas (muy poco). Al exhalar, deja que se "derritan" de vuelta, alejándose de las orejas.',
            'Inspira subiendo los hombros, suelta el aire bajándolos.',
            '6 veces, sin apuro.',
            'la diferencia entre el hombro tenso (subiendo) y el hombro suelto (bajando).',
            'hazlo pequeño — si el cuello se queja, reduce el movimiento.',
          ),
          mov(
            'Abrir el pecho con el aire',
            'Al inspirar, deja que el pecho se abra levemente; al soltar, deja que las costillas se cierren como un abanico. El movimiento es interno, casi invisible.',
            'Respiración lenta, guiando la apertura y el cierre.',
            '8 respiraciones.',
            'el pecho ganando espacio, y la respiración volviéndose más fácil.',
            'nada de arquear la zona lumbar; el movimiento es solo de las costillas.',
          ),
          fecho('Descansa los brazos y siente los hombros. Compara con el comienzo: suelen estar más bajos y ligeros.'),
          dica('Fíjate cuántas veces al día contienes el aire sin darte cuenta — en un mensaje difícil, en el tráfico. Soltar el aire ya es soltar tensión.'),
        ],
      },
    },
    {
      titulo: 'Día 3',
      aula: {
        titulo: 'Balanceo de la pelvis',
        duracao: 12,
        intro:
          'Un movimiento pequeño y delicioso para la zona lumbar: inclinar la cadera hacia adelante y hacia atrás, despacio, dejando que la columna acompañe.',
        blocos: [
          prep('Acostada boca arriba, rodillas dobladas, pies apoyados al ancho de la cadera. Manos descansando en la panza o a los lados del cuerpo.'),
          mov(
            'Báscula de la pelvis',
            'Imagina la cadera como un tazón con agua. Inclínala levemente hacia atrás (la zona lumbar se acerca al suelo) y después hacia adelante (la zona lumbar hace un pequeño arco). Movimiento diminuto y lento.',
            'Suelta el aire al acercar la zona lumbar al suelo; inspira al volver.',
            '8 a 10 balanceos suaves.',
            'la zona lumbar "rodando" entre los dos puntos, sin esfuerzo de las piernas.',
            'si aparece cualquier punzada, reduce la amplitud a la mitad.',
          ),
          mov(
            'Pausa y sentir',
            'Detente a la mitad, en la posición más neutra y cómoda. Solo observa la zona lumbar apoyada.',
            'Tres respiraciones lentas.',
            '30 segundos.',
            'la región que antes estaba tensa un poco más suave.',
            'ninguna — esta es solo la pausa.',
          ),
          fecho('Estira las piernas despacio, una a la vez, y siente la zona lumbar. Menos rígida suele ser la sensación.'),
          dica('A la zona lumbar no le gusta quedarse quieta todo el día. Este balanceo cabe hasta en la cama, antes de dormir.'),
        ],
      },
    },
    {
      titulo: 'Día 4',
      aula: {
        titulo: 'Pausa consciente (práctica ligera)',
        duracao: 10,
        intro:
          'Día más tranquilo. Nada de "hacer" — hoy es reconocer el cuerpo entero con atención. La práctica ligera también es constancia, y mantiene viva tu racha.',
        blocos: [
          prep('Recuéstate cómoda, boca arriba, piernas estiradas o rodillas dobladas — lo que te resulte mejor. Una cobija si quieres abrigo.'),
          mov(
            'Barrido del cuerpo',
            'Lleva la atención a los pies y sube lentamente: piernas, cadera, panza, pecho, manos, hombros, cuello, rostro. En cada región, solo percibe cómo está — sin cambiar nada.',
            'Respiración natural, tranquila.',
            'Un recorrido completo, unos 5 minutos.',
            'qué regiones están sueltas y cuáles piden más atención.',
            'si la mente se dispersa, está bien — vuelve con suavidad a donde te quedaste.',
          ),
          fecho('Quédate acostada un minuto más, sin hacer nada. Después vuelve despacio.'),
          dica('Descansar con atención es distinto de desconectarte frente a la tele: aquí el cuerpo aprende a soltar. Eso también es entrenamiento.'),
        ],
      },
    },
    {
      titulo: 'Día 5',
      aula: {
        titulo: 'La cabeza que gira',
        duracao: 13,
        intro:
          'Vamos a sentarnos y soltar el cuello con un movimiento lento de girar la cabeza. Aquí vive mucha de la tensión del día.',
        blocos: [
          prep('Siéntate en una silla firme, pies apoyados en el suelo, columna larga y relajada. Manos sobre los muslos.'),
          mov(
            'Girar la mirada',
            'Gira la cabeza lentamente hacia la derecha, como si fueras a mirar por encima del hombro, solo hasta donde sea cómodo. Vuelve al centro. Después hacia la izquierda.',
            'Suelta el aire al girar, inspira al volver al centro.',
            '4 veces hacia cada lado.',
            'el cuello deslizándose, sin "trabarse" al final del movimiento.',
            'no fuerces para ver más atrás; detente donde todavía se sienta agradable.',
          ),
          mov(
            'Oreja al hombro',
            'Inclina la cabeza llevando la oreja derecha hacia el hombro derecho (sin subir el hombro). Vuelve al centro y cambia de lado.',
            'Exhala al inclinar, inspira al volver.',
            '3 veces hacia cada lado.',
            'un estiramiento suave en el costado del cuello.',
            'si baja un hormigueo por el brazo, vuelve de inmediato al centro.',
          ),
          fecho('Vuelve la mirada al centro, cierra los ojos y siente el cuello. Suele quedar más ligero y móvil.'),
          dica('Con el celular, la cabeza se inclina hacia adelante y el cuello paga la cuenta. Este movimiento es un buen "reinicio" a mitad del día.'),
        ],
      },
    },
    {
      titulo: 'Día 6',
      aula: {
        titulo: 'Abrir y cerrar',
        duracao: 14,
        intro:
          'Hoy abrimos y cerramos los brazos como un abanico, sentada, dejando que la respiración guíe. Ayuda a soltar la parte alta de la espalda.',
        blocos: [
          prep('Sentada al borde de la silla, pies bien apoyados, columna larga. Brazos al frente, a la altura del pecho, palmas mirándose entre sí.'),
          mov(
            'Abanico de brazos',
            'Al inspirar, abre los brazos hacia los lados, como si abrieras una ventana; siente el pecho abrirse. Al soltar, trae los brazos de vuelta al frente, redondeando levemente la espalda.',
            'Inspira abriendo, exhala cerrando.',
            '6 veces lentas.',
            'el pecho abriéndose en la inspiración y la espalda soltándose en el cierre.',
            'mantén los hombros lejos de las orejas; si suben, hazlo más pequeño.',
          ),
          mov(
            'Autoabrazo',
            'En la última vez, al cerrar, cruza los brazos en un abrazo a ti misma, una mano en cada hombro. Quédate ahí respirando.',
            'Tres respiraciones lentas dentro del abrazo.',
            '30 segundos.',
            'la espalda entre los omóplatos abriéndose con el aire.',
            'ninguna — es contención.',
          ),
          fecho('Suelta los brazos sobre el regazo. Percibe la parte alta de la espalda más amplia.'),
          dica('Pasar el día con los hombros "cerrados" frente al teclado acorta el pecho. Abrirlos de vez en cuando reequilibra.'),
        ],
      },
    },
    {
      titulo: 'Día 7',
      aula: {
        titulo: 'El cuerpo en reposo (práctica ligera)',
        duracao: 12,
        intro:
          'Cerramos la semana con un movimiento delicioso para la columna, sentada, al ritmo de la respiración. Suave, restaurador — y cuenta como día activo.',
        blocos: [
          prep('Sentada en la silla, pies apoyados, manos sobre los muslos.'),
          mov(
            'Gato y vaca sentada',
            'Al inspirar, crece por la columna y abre levemente el pecho hacia arriba (vaca). Al soltar, redondea la espalda, mentón hacia el pecho (gato). Muy lento.',
            'Inspira abriendo, exhala redondeando.',
            '8 ciclos.',
            'la columna moviéndose vértebra por vértebra, como una ola.',
            'amplitud cómoda; nada de forzar el cuello al final.',
          ),
          fecho('Vuelve al centro, columna larga. Siente la semana: apareciste 7 días. Eso es grande.'),
          dica('Si hoy solo tuviste tiempo para 5 minutos, igual valió. Constancia es aparecer, no durar mucho.'),
        ],
      },
    },
  ],
}

// =====================================================================
// SEMANA 2 — Soltando tensão (pescoço, ombros, quadril, lombar)
// =====================================================================
const semana2: Semana = {
  numero: 2,
  titulo: 'Semana 2 — Soltando tensión',
  dias: [
    {
      titulo: 'Día 8',
      aula: {
        titulo: 'Soltando los hombros',
        duracao: 16,
        intro:
          'Vamos a usar la pandiculación — ese estiramiento natural, como cuando te desperezas — para soltar los hombros de verdad: contraer un poco, sostener y soltar bien despacio.',
        blocos: [
          prep('Sentada o de pie, columna larga, brazos sueltos a los lados del cuerpo.'),
          mov(
            'Desperezo de hombros',
            'Sube los dos hombros hacia las orejas contrayendo suavemente. Sostén 3 segundos sintiendo la leve tensión. Ahora suelta MUY despacio, dejando que los hombros bajen más allá de donde empezaron.',
            'Inspira subiendo, retén el aire en lo alto, suelta el aire bajando lentamente.',
            '4 veces.',
            'la "bajada" más larga y suelta que la subida — ese es el secreto.',
            'si el cuello se queja, contrae menos.',
          ),
          mov(
            'Círculos de hombro',
            'Dibuja círculos lentos con los hombros hacia atrás: sube, va hacia atrás, baja, vuelve. Grandes y sin apuro.',
            'Respiración libre, continua.',
            '5 círculos hacia atrás.',
            'la articulación del hombro "lubricándose", cada vuelta más fácil.',
            'reduce el tamaño del círculo si hay chasquidos con molestia.',
          ),
          fecho('Suelta todo y siente los hombros colgando. Ese peso que cargabas sin darte cuenta suele disminuir.'),
          dica('La pandiculación es lo que hace el gato al despertar. Al cuerpo humano le encanta — nosotros somos los que nos olvidamos de hacerla.'),
        ],
      },
    },
    {
      titulo: 'Día 9',
      aula: {
        titulo: 'Cuello libre',
        duracao: 15,
        intro:
          'Hoy es día de darle espacio al cuello con inclinaciones y una rotación bien lenta. Delicadeza es la palabra clave.',
        blocos: [
          prep('Sentada, columna larga, hombros sueltos. Deja una mano descansando sobre el muslo.'),
          mov(
            'Sí y no lentos',
            'Haz un "sí" diminuto con la cabeza (el mentón baja y sube muy poquito) unas cuantas veces; después un "no" lento, girando la mirada de un lado a otro.',
            'Respiración tranquila, sin retenerla.',
            '4 "síes" y 4 "noes", bien pequeños.',
            'la base del cráneo deslizándose sobre el cuello.',
            'movimientos pequeños: aquí menos es más.',
          ),
          mov(
            'Media luna del mentón',
            'Lleva el mentón al pecho (sin forzar) y dibuja una media luna llevando el mentón de un hombro al otro, pasando por el frente. Nunca eches la cabeza hacia atrás.',
            'Suelta el aire mientras dibujas la media luna.',
            '3 veces en cada dirección.',
            'la nuca abriéndose y el frente del cuello deslizándose.',
            'sin llevar la cabeza hacia atrás; si te mareas, detente.',
          ),
          fecho('Vuelve al centro y cierra los ojos. Siente el cuello con más espacio para respirar.'),
          dica('La tensión en el cuello muchas veces es la mandíbula apretada. Suelta los dientes: deja un pequeño espacio entre ellos.'),
        ],
      },
    },
    {
      titulo: 'Día 10',
      aula: {
        titulo: 'Gato y vaca en el suelo',
        duracao: 18,
        intro:
          'El clásico de la movilidad de columna, ahora en cuatro apoyos. Una ola que recorre toda la espalda.',
        blocos: [
          prep('Ponte en cuatro apoyos, manos bajo los hombros y rodillas bajo la cadera, sobre el tapete. Usa una toalla doblada bajo las rodillas si molesta.'),
          mov(
            'La ola de la columna',
            'Al inspirar, deja que la panza baje y el pecho y la mirada suban levemente (vaca). Al soltar, empuja el suelo y redondea la espalda hacia el techo, mentón al pecho (gato).',
            'Inspira en la vaca, exhala en el gato.',
            '8 a 10 ciclos lentos.',
            'cada vértebra participando, del cóccix a la nuca.',
            'si las muñecas molestan, apóyate en los antebrazos o reduce el tiempo.',
          ),
          mov(
            'Postura del niño',
            'Lleva la cadera hacia los talones y recuesta el tronco hacia adelante, brazos estirados o a los lados del cuerpo. Frente apoyada.',
            'Respira hacia la espalda, sintiéndola subir.',
            '5 respiraciones.',
            'la espalda abriéndose con cada inspiración.',
            'si las rodillas se quejan, sepáralas o coloca una almohada detrás de ellas.',
          ),
          fecho('Vuelve despacio a sentarte sobre los talones o de lado. Siente la columna más fluida.'),
          dica('La columna tiene unas 30 piezas a las que les encanta moverse juntas. Está hecha para ondular, no para quedarse recta todo el día.'),
        ],
      },
    },
    {
      titulo: 'Día 11',
      aula: {
        titulo: 'Respirar y soltar (práctica ligera)',
        duracao: 15,
        intro:
          'Día restaurativo con las piernas apoyadas para descansar la zona lumbar y las piernas cansadas. Poco movimiento, mucho alivio.',
        blocos: [
          prep('Recuéstate boca arriba cerca de una pared o de una silla. Coloca las pantorrillas sobre el asiento de la silla (rodillas dobladas a 90°) o las piernas apoyadas en la pared, lo que te resulte cómodo.'),
          mov(
            'Piernas en reposo',
            'Con las piernas apoyadas, deja que la zona lumbar se relaje en el suelo. No hagas nada con las piernas — solo descansa su peso sobre el apoyo.',
            'Respiración larga y lenta, con la exhalación más prolongada que la inspiración.',
            '3 a 4 minutos.',
            'la zona lumbar y las piernas "apagándose", poniéndose pesadas.',
            'si hormiguea demasiado, retira las piernas del apoyo y estíralas en el suelo.',
          ),
          fecho('Rueda hacia un lado, quédate un instante, y levántate sin apuro. Piernas más ligeras es la sensación común.'),
          dica('¿Pasaste el día de pie o sentada? Cinco minutos con las piernas apoyadas hacen más por tu energía de lo que parece.'),
        ],
      },
    },
    {
      titulo: 'Día 12',
      aula: {
        titulo: 'La cadera que se abre',
        duracao: 18,
        intro:
          'La cadera guarda mucha tensión de quien pasa horas sentada. Vamos a soltarla con movimientos lentos, acostada.',
        blocos: [
          prep('Acostada boca arriba, rodillas dobladas, pies apoyados al ancho de la cadera.'),
          mov(
            'Rodillas que se balancean',
            'Con los pies un poco más separados, deja que las dos rodillas caigan suavemente hacia la derecha y después hacia la izquierda, como limpiaparabrisas lentos.',
            'Suelta el aire al llevar las rodillas hacia el lado, inspira al volver al centro.',
            '6 veces hacia cada lado.',
            'la cadera y la zona lumbar girando con ligereza.',
            'amplitud pequeña; no fuerces las rodillas hacia el suelo.',
          ),
          mov(
            'Abrir una rodilla',
            'Mantén un pie apoyado y deja que la otra rodilla se abra hacia el lado (como un libro abriéndose), solo hasta donde sea cómodo. Vuelve y cambia de pierna.',
            'Exhala al abrir, inspira al cerrar.',
            '4 veces con cada pierna.',
            'la ingle y la parte interna del muslo abriéndose suavemente.',
            'si sientes un tirón incómodo en la ingle, abre menos.',
          ),
          fecho('Abraza las rodillas contra el pecho por unos segundos, si te resulta cómodo, y después estira las piernas. Cadera más libre.'),
          dica('Una cadera rígida suele sobrecargar la zona lumbar. Soltar la cadera es un regalo indirecto para tu espalda.'),
        ],
      },
    },
    {
      titulo: 'Día 13',
      aula: {
        titulo: 'La zona lumbar que descansa',
        duracao: 17,
        intro:
          'Enfoque cariñoso en la zona lumbar hoy: un balanceo de pelvis más amplio y un abrazo de rodillas que suele dar alivio inmediato.',
        blocos: [
          prep('Acostada boca arriba, rodillas dobladas, pies apoyados. Brazos a los lados del cuerpo.'),
          mov(
            'Balanceo amplio de la pelvis',
            'Retoma el balanceo de pelvis del Día 3, ahora dejando que la ola suba un poco más por la columna: al acercar la zona lumbar al suelo, deja que el cóccix suba levemente.',
            'Suelta el aire al apoyar la zona lumbar, inspira al soltar.',
            '8 balanceos.',
            'la zona lumbar masajeando el suelo suavemente.',
            'sin levantar la cadera muy alto; la ola es pequeña.',
          ),
          mov(
            'Abrazo de rodillas',
            'Trae una rodilla a la vez hacia el pecho y sostenla por detrás del muslo (no sobre la rodilla). Deja que la zona lumbar se hunda en el suelo.',
            'Respira hacia la espalda, con una exhalación larga.',
            '5 respiraciones; suelta y repite 1 vez.',
            'la zona lumbar abriéndose y descansando en el apoyo.',
            'si es demasiado para las dos rodillas, hazlo una a la vez.',
          ),
          fecho('Devuelve los pies al suelo, estira las piernas despacio y siente la zona lumbar más tranquila.'),
          dica('El dolor lumbar leve muchas veces mejora con movimiento suave, no con reposo total. Pero un dolor fuerte o que baja por la pierna pide evaluación profesional.'),
        ],
      },
    },
    {
      titulo: 'Día 14',
      aula: {
        titulo: 'Torsión suave (práctica ligera)',
        duracao: 15,
        intro:
          'Cerramos la semana con una torsión restauradora acostada — de esas que la columna agradece. Movimiento mínimo, alivio grande.',
        blocos: [
          prep('Acostada boca arriba, rodillas dobladas y pies apoyados. Brazos abiertos en cruz, palmas hacia arriba.'),
          mov(
            'Torsión con las rodillas',
            'Junta las rodillas y déjalas caer despacio hacia un lado, mientras la mirada va hacia el lado opuesto, si te resulta cómodo. Vuelve al centro y cambia.',
            'Suelta el aire al girar, inspira al volver.',
            '3 a 4 veces hacia cada lado, con una pausa de una respiración al final.',
            'una torsión suave a lo largo de la columna y el pecho abriéndose.',
            'los hombros permanecen apoyados; si uno se levanta demasiado, gira menos.',
          ),
          fecho('Vuelve al centro, abraza las rodillas por un instante y estira las piernas. Dos semanas completadas — tu cuerpo ya reconoce la práctica.'),
          dica('¿Notaste que ya entiendes mejor las señales del cuerpo que en el Día 1? Esa escucha es el verdadero resultado.'),
        ],
      },
    },
  ],
}

// =====================================================================
// SEMANA 3 — Movimento integrado (sequências, mais tempo em pé)
// =====================================================================
const semana3: Semana = {
  numero: 3,
  titulo: 'Semana 3 — Movimiento integrado',
  dias: [
    {
      titulo: 'Día 15',
      aula: {
        titulo: 'Del suelo a de pie',
        duracao: 20,
        intro:
          'Esta semana el cuerpo se integra. Empezamos aprendiendo a levantarnos del suelo con conciencia — un movimiento cotidiano que merece ser suave.',
        blocos: [
          prep('Empieza acostada boca arriba, rodillas dobladas. Ten espacio libre alrededor.'),
          mov(
            'Rodar hacia el lado',
            'Gira la cabeza hacia un lado y deja que todo el cuerpo ruede hacia ese lado, como un tronco. Llega de lado, con las rodillas dobladas.',
            'Suelta el aire al rodar.',
            '2 veces hacia cada lado.',
            'el cuerpo moviéndose en bloque, sin "jalarse" por el cuello.',
            'usa las manos para ayudarte; nada de esfuerzo en el cuello.',
          ),
          mov(
            'Subir a sentada y a de pie',
            'De lado, apoya las manos en el suelo y empuja para sentarte. Después lleva un pie hacia adelante y usa las manos sobre los muslos para subir despacio hasta quedar de pie.',
            'Exhala en los momentos de esfuerzo (empujar, subir).',
            '3 subidas conscientes.',
            'las piernas trabajando, el movimiento organizado desde el suelo hasta de pie.',
            'apóyate en una silla firme si lo necesitas; sin apuro.',
          ),
          fecho('De pie, siente los pies en el suelo y la columna larga. Acabas de transformar un gesto automático en práctica.'),
          dica('La forma en que te levantas del suelo o de la cama dice mucho. Hacerlo despacio le ahorra esfuerzo a tu zona lumbar todos los días.'),
        ],
      },
    },
    {
      titulo: 'Día 16',
      aula: {
        titulo: 'La columna que se desenrolla',
        duracao: 20,
        intro:
          'El roll down: bajar la columna vértebra por vértebra y volver a subir. Uno de los movimientos más ricos para soltar la espalda de pie.',
        blocos: [
          prep('De pie, pies al ancho de la cadera, rodillas suuuaves (nunca trabadas). Brazos sueltos.'),
          mov(
            'Desenrollar hacia abajo',
            'Deja que el mentón caiga hacia el pecho y ve bajando la columna poco a poco, como si te desenrollaras hueso por hueso, el tronco cayendo hacia adelante. Baja solo hasta donde sea cómodo, rodillas suaves.',
            'Suelta el aire durante todo el descenso.',
            '4 veces.',
            'la espalda abriéndose y la cabeza pesada colgando.',
            'no fuerces las manos hacia el suelo; la amplitud es tuya. ¿Mareo al volver? Sube más despacio.',
          ),
          mov(
            'Enrollar hacia arriba',
            'Para volver, empieza por la base de la columna, apilando vértebra por vértebra, y deja que la cabeza sea la última en subir.',
            'Inspira subiendo, lentamente.',
            'con cada roll down, continúa directo hacia el roll up.',
            'la columna "apilándose" y el cuerpo volviéndose alto otra vez.',
            'si te mareas, pausa a medio camino y respira.',
          ),
          fecho('De pie, ojos cerrados, siente la columna larga y la espalda suelta. Percibe la respiración más tranquila.'),
          dica('Las rodillas "blanditas" aquí no son flojera — son protección. Trabar las rodillas manda toda la carga a la zona lumbar.'),
        ],
      },
    },
    {
      titulo: 'Día 17',
      aula: {
        titulo: 'Brazos que respiran',
        duracao: 20,
        intro:
          'Un flujo suave de brazos de pie, guiado por la respiración. Abre el pecho, suelta los hombros y calma la mente.',
        blocos: [
          prep('De pie, pies al ancho de la cadera, rodillas suaves, brazos a los lados del cuerpo.'),
          mov(
            'Brazos que suben con el aire',
            'Al inspirar, sube los brazos por los lados hasta arriba de la cabeza (o hasta donde sea cómodo). Al soltar, bájalos por el frente, despacio.',
            'Inspira subiendo, exhala bajando.',
            '6 veces.',
            'el aire "levantando" los brazos y el pecho abriéndose en lo alto.',
            'si los hombros suben demasiado o el cuello se tensa, sube menos.',
          ),
          mov(
            'Recoger agua',
            'Inclina levemente el tronco hacia adelante (rodillas suaves) y haz el gesto de "recoger agua" con las manos, trayéndolas hacia el pecho al subir el tronco, como si te ofrecieras algo a ti misma.',
            'Inspira al recoger, exhala al soltar las manos hacia abajo.',
            '5 veces, en un flujo continuo.',
            'el movimiento entero conectado — piernas, tronco, brazos, respiración.',
            'mantén las rodillas suaves y la zona lumbar larga.',
          ),
          fecho('Detente de pie, brazos a los lados del cuerpo, y siente el efecto: pecho abierto, hombros bajos, respiración amplia.'),
          dica('Cuando la respiración guía el movimiento, el ejercicio se vuelve casi una meditación de pie. Fíjate cómo la mente se vacía.'),
        ],
      },
    },
    {
      titulo: 'Día 18',
      aula: {
        titulo: 'Equilibrio calmo (práctica ligera)',
        duracao: 18,
        intro:
          'Día más tranquilo para jugar con el peso del cuerpo y el equilibrio — sin desafío, solo percepción. Suave, y cuenta como constancia.',
        blocos: [
          prep('De pie, cerca de una pared o silla para apoyo, pies al ancho de la cadera.'),
          mov(
            'Transferir el peso',
            'Pasa el peso lentamente al pie derecho, sintiéndolo hundirse en el suelo; después al izquierdo. Como un péndulo lento.',
            'Respiración natural y continua.',
            '8 transferencias.',
            'los pies "leyendo" el suelo y el cuerpo organizándose solo.',
            'mantén la mano cerca del apoyo; sujétate si lo necesitas.',
          ),
          mov(
            'En puntas, despacio',
            'Sube levemente en las puntas de los pies y baja bien despacio, controlando el descenso. Usa el apoyo con toda confianza.',
            'Inspira subiendo, exhala bajando lentamente.',
            '5 veces.',
            'las pantorrillas trabajando y los tobillos ganando firmeza.',
            'si el equilibrio se tambalea, mantén la mano en el apoyo todo el tiempo.',
          ),
          fecho('Quédate un instante con los pies completos en el suelo, sintiéndote firme y presente.'),
          dica('El equilibrio no es un don, es práctica. Cada vez que lo entrenas con calma, el cuerpo se vuelve más seguro en el día a día.'),
        ],
      },
    },
    {
      titulo: 'Día 19',
      aula: {
        titulo: 'Cadera de pie',
        duracao: 20,
        intro:
          'Llevamos la soltura de la cadera a la posición de pie, con círculos lentos y una sentadilla suave y apoyada.',
        blocos: [
          prep('De pie, pies un poco más separados que la cadera, rodillas suaves. Manos en la cintura o cerca de un apoyo.'),
          mov(
            'Círculos de cadera',
            'Dibuja círculos lentos con la cadera, como si movieras un hula-hula imaginario despacio. Hazlo en un sentido y después en el otro.',
            'Respiración libre y continua.',
            '5 círculos hacia cada lado.',
            'la cadera soltándose y la zona lumbar acompañando con ligereza.',
            'círculos pequeños; nada de forzar la zona lumbar.',
          ),
          mov(
            'Sentadilla apoyada',
            'De frente a una silla o mesada, sostente levemente como apoyo. Dobla las rodillas y lleva la cadera hacia atrás y hacia abajo, solo hasta la mitad del camino, y vuelve.',
            'Inspira al bajar, exhala al subir.',
            '6 veces suaves.',
            'los muslos y la cadera trabajando, las rodillas alineadas con los pies.',
            'baja solo hasta donde sea cómodo; la rodilla nunca debe doler.',
          ),
          fecho('Quédate de pie, suelta los brazos y siente la base del cuerpo más despierta y firme.'),
          dica('Sentarte y levantarte de la silla todo el día ya es una sentadilla. Hacerlo con conciencia algunas veces mejora el gesto entero.'),
        ],
      },
    },
    {
      titulo: 'Día 20',
      aula: {
        titulo: 'Columna en espiral',
        duracao: 20,
        intro:
          'Rotaciones suaves de pie que integran columna, hombros y cadera. La espiral es un movimiento muy natural y liberador.',
        blocos: [
          prep('De pie, pies al ancho de la cadera, rodillas suaves, brazos sueltos.'),
          mov(
            'Girar como un trompo lento',
            'Deja los brazos sueltos y gira el tronco suavemente de un lado a otro, permitiendo que los brazos "golpeen" levemente el cuerpo. Los talones pueden despegarse un poco del suelo.',
            'Respiración libre, suelta.',
            '10 giros suaves, alternando los lados.',
            'la columna torciéndose con ligereza y los hombros balanceándose sueltos.',
            'sin forzar la torsión al final; deja que la inercia te lleve.',
          ),
          mov(
            'Espiral consciente',
            'Ahora más despacio: al inspirar vuelve al centro; al soltar, gira hacia un lado llevando la mirada por encima del hombro. Alterna.',
            'Exhala girando, inspira al centro.',
            '4 hacia cada lado.',
            'la diferencia entre la torsión suelta (antes) y la torsión consciente (ahora).',
            'detente si sientes mareo; retoma cuando pase.',
          ),
          fecho('Vuelve al centro, respira profundo y siente la columna más móvil desde las caderas hasta los hombros.'),
          dica('La columna gira mejor cuando el cuello no "jala" el movimiento. Deja que la mirada acompañe, no que lidere.'),
        ],
      },
    },
    {
      titulo: 'Día 21',
      aula: {
        titulo: 'Fluir despacio (práctica ligera)',
        duracao: 18,
        intro:
          'Una minisecuencia restaurativa que junta lo que trajo la semana: desenrollar, brazos y respiración. Ligera, fluida, deliciosa.',
        blocos: [
          prep('De pie, con espacio, rodillas suaves.'),
          mov(
            'Secuencia de cierre de semana',
            'Encadena despacio: los brazos suben con la inspiración → desenrolla la columna hacia abajo soltando el aire → pausa colgada por una respiración → enrolla de vuelta hacia arriba → los brazos bajan por el frente.',
            'Deja que la respiración marque el ritmo de cada parte.',
            '4 rondas lentas, cada una más fluida.',
            'las partes conectándose en un único movimiento continuo.',
            'sin apuro entre las fases; si te mareas al subir, sube más despacio.',
          ),
          fecho('Quédate de pie, ojos cerrados, y siente el cuerpo entero reunido y calmo. Tres semanas — estás más presente en tu propio cuerpo.'),
          dica('Una secuencia solo tuya ya está naciendo. La próxima semana vas a armar la que más combine con tus días.'),
        ],
      },
    },
  ],
}

// =====================================================================
// SEMANA 4 — Prática consolidada (sequências completas e autonomia)
// =====================================================================
const semana4: Semana = {
  numero: 4,
  titulo: 'Semana 4 — Práctica consolidada',
  dias: [
    {
      titulo: 'Día 22',
      aula: {
        titulo: 'Tu secuencia de la mañana',
        duracao: 22,
        intro:
          'Una secuencia completa para empezar el día despertando el cuerpo con delicadeza. Guarda esta — puede convertirse en tu rutina matutina.',
        blocos: [
          prep('Empieza acostada en la cama o en el tapete, al despertar. Después pasamos a sentada y de pie. Ten un apoyo cerca.'),
          mov(
            'Despertar acostada',
            'Despereza el cuerpo entero (pandiculación): estira brazos y piernas en direcciones opuestas, sostén y suelta. Después haz 6 balanceos de pelvis.',
            'Inspira al estirarte, suelta al relajarte.',
            '2 desperezos + 6 balanceos.',
            'el cuerpo saliendo del modo "dormido" con gusto.',
            'movimientos generosos, pero sin calambres; si aparece uno, relaja.',
          ),
          mov(
            'Sentarse y abrir',
            'Rueda hacia un lado, siéntate. Haz 6 "abanicos" de brazos (Día 6) abriendo el pecho y 4 rotaciones de cabeza (Día 5).',
            'La respiración guiando cada apertura.',
            'como se describió.',
            'el tronco y el cuello soltándose de la rigidez matutina.',
            'despacio — por la mañana el cuerpo está más "corto".',
          ),
          mov(
            'Levantarse y crecer',
            'Sube a ponerte de pie con conciencia (Día 15). Haz 4 subidas de brazos con la respiración y termina con un roll down suave.',
            'Inspira subiendo los brazos, exhala desenrollando.',
            'como se describió.',
            'el cuerpo despierto, abierto y listo para el día.',
            'rodillas suaves en el roll down; sube sin apuro.',
          ),
          fecho('De pie, tres respiraciones largas. Fíjate qué diferente es empezar el día así.'),
          dica('Hacer esto antes de agarrar el celular cambia el tono del día entero. Pruébalo por algunos días y siéntelo.'),
        ],
      },
    },
    {
      titulo: 'Día 23',
      aula: {
        titulo: 'Soltar el día',
        duracao: 22,
        intro:
          'Secuencia para el final del día: descargar la tensión acumulada en el cuello, los hombros y la zona lumbar antes de descansar.',
        blocos: [
          prep('Empieza sentada en una silla; después vamos al suelo. Una luz tenue ayuda a bajar el ritmo.'),
          mov(
            'Descargar desde arriba',
            'Sentada: 4 desperezos de hombros (Día 8), la media luna del mentón (Día 9) y el autoabrazo (Día 6).',
            'Exhalaciones largas en cada soltura.',
            'como se describió.',
            'el peso del día saliendo de los hombros y del cuello.',
            'nada de forzar; hoy es para soltar, no para conquistar.',
          ),
          mov(
            'Soltar la zona lumbar',
            'En el suelo: gato y vaca (Día 10), abrazo de rodillas (Día 13) y torsión suave (Día 14).',
            'Respiración hacia la espalda.',
            'como se describió.',
            'la zona lumbar y la cadera abriéndose y descansando.',
            'si algo molesta, sáltate ese movimiento y sigue.',
          ),
          fecho('Termina acostada, piernas estiradas, por un minuto. Cuerpo más ligero para dormir.'),
          dica('Llevar tensión a la cama afecta el sueño. Cinco minutos de soltura en la noche valen por horas de dar vueltas en la cama.'),
        ],
      },
    },
    {
      titulo: 'Día 24',
      aula: {
        titulo: 'Cuerpo entero',
        duracao: 25,
        intro:
          'La secuencia más completa del protocolo, integrando las cuatro semanas. Resérvate un poco más de tiempo y disfruta cada parte.',
        blocos: [
          prep('Espacio libre, tapete, y un apoyo cerca. Empieza de pie.'),
          mov(
            'Calentar y desenrollar',
            'De pie: brazos que respiran (Día 17), espiral consciente (Día 20) y roll down/roll up (Día 16).',
            'La respiración marcando cada fase.',
            '2 rondas de cada.',
            'el cuerpo entrando en calor y la columna ganando fluidez.',
            'rodillas suaves; sube despacio de los roll downs.',
          ),
          mov(
            'Base firme',
            'Círculos de cadera (Día 19) y sentadilla apoyada (Día 19), después transferencia de peso (Día 18).',
            'Inspira bajando, exhala subiendo.',
            'como se describió.',
            'la base del cuerpo despierta y firme.',
            'amplitud cómoda en las rodillas.',
          ),
          mov(
            'Volver al suelo y cerrar',
            'Ve al suelo: gato y vaca, rodillas que se balancean (Día 12) y torsión suave. Termina acostada, respirando.',
            'La exhalación siempre más larga.',
            'como se describió.',
            'el cuerpo entero reunido, suelto y presente.',
            'respeta los límites del día; no todos los días son iguales.',
          ),
          fecho('Quédate acostada en silencio por un minuto al final. Siente todo lo que ya puedes lograr.'),
          dica('Fíjate: movimientos que en el Día 1 parecían raros ahora son familiares. Eso es el cuerpo reaprendiendo a moverse.'),
        ],
      },
    },
    {
      titulo: 'Día 25',
      aula: {
        titulo: 'Recuperar (práctica ligera)',
        duracao: 20,
        intro:
          'Después de una secuencia intensa, un día de recuperación con las piernas apoyadas y respiración larga. Cuidar tu descanso también es practicar.',
        blocos: [
          prep('Acostada con las piernas apoyadas en una silla o pared (Día 11). Una cobija si quieres.'),
          mov(
            'Descanso activo',
            'Con las piernas apoyadas, haz el barrido del cuerpo (Día 4), soltando región por región. Después solo respira.',
            'Exhalación bien larga, como un suspiro.',
            '5 a 6 minutos.',
            'todo el sistema desacelerando.',
            'sal de la posición si hormiguea demasiado.',
          ),
          fecho('Rueda hacia un lado, descansa y levántate sin apuro. Recuperada y lista para los últimos días.'),
          dica('El progreso no ocurre solo en el esfuerzo — ocurre en el descanso, cuando el cuerpo asimila lo que aprendió.'),
        ],
      },
    },
    {
      titulo: 'Día 26',
      aula: {
        titulo: 'Respiración y movimiento',
        duracao: 22,
        intro:
          'Hoy la protagonista es la respiración, guiando todo. Una práctica fluida en la que cada movimiento nace de un ciclo respiratorio.',
        blocos: [
          prep('De pie, con espacio. Empieza solo observando la respiración durante 3 ciclos.'),
          mov(
            'Movimiento nacido del aire',
            'Deja que cada inspiración "abra" un movimiento (subir los brazos, crecer, abrir el pecho) y cada exhalación "suelte" (bajar, redondear, girar). No cuentes movimientos — deja que la respiración elija.',
            'La respiración comanda; el cuerpo obedece despacio.',
            '5 a 7 minutos de flujo libre.',
            'el cuerpo moviéndose solo, guiado por el aire, sin "decidir".',
            'si la respiración se acelera o te falta el aire, detente y normalízala.',
          ),
          mov(
            'Aquietarse',
            'Poco a poco, deja que los movimientos se vuelvan más pequeños hasta detenerte de pie, quieta, solo respirando.',
            'Respiración natural, larga.',
            '1 minuto.',
            'la calma que queda después del movimiento consciente.',
            'ninguna — es el aterrizaje.',
          ),
          fecho('Abre los ojos despacio. Fíjate cómo el cuerpo y la respiración están del mismo lado ahora.'),
          dica('Esa conexión respiración-movimiento es el corazón de lo somático. Cuando sucede, el "ejercicio" desaparece y se vuelve presencia.'),
        ],
      },
    },
    {
      titulo: 'Día 27',
      aula: {
        titulo: 'Mi práctica',
        duracao: 22,
        intro:
          'Hoy armas tu propia secuencia. Ya tienes el repertorio para esto — vamos a guiarte para elegir lo que tu cuerpo más pide.',
        blocos: [
          prep('Espacio libre. Piensa: ¿qué región tuya pide más cuidado hoy? ¿Cuello/hombros? ¿Zona lumbar/cadera? ¿O el cuerpo entero?'),
          mov(
            'Elige un comienzo',
            'Empieza con un movimiento de percepción y respiración (Día 1, 2 o 4). Date 2 a 3 minutos solo para llegar.',
            'Respiración tranquila.',
            '2 a 3 minutos.',
            'la diferencia entre "empezar acelerada" y "empezar llegando".',
            'sin saltarte la llegada; ella prepara el resto.',
          ),
          mov(
            'Elige el centro',
            'Elige 2 o 3 movimientos de las semanas 2 y 3 para la región que pidió atención. Haz cada uno con calma.',
            'La respiración guiando.',
            '10 a 12 minutos.',
            'el cuerpo respondiendo a lo que TÚ elegiste — eso es autonomía.',
            'si algún movimiento no te cae bien hoy, cámbialo por otro.',
          ),
          mov(
            'Elige un cierre',
            'Termina con algo restaurativo (piernas apoyadas, torsión suave o abrazo de rodillas) y respiración larga.',
            'Exhalación larga.',
            '3 a 4 minutos.',
            'el cierre que deja al cuerpo en paz.',
            'ninguna.',
          ),
          fecho('Acabas de conducir tu propia práctica. Ese es el objetivo de los 28 días: tú al mando de tu cuerpo.'),
          dica('Guarda mentalmente (o anota) la secuencia que más bien te hizo hoy. Es el comienzo de tu práctica para toda la vida.'),
        ],
      },
    },
    {
      titulo: 'Día 28',
      aula: {
        titulo: 'Siguiendo adelante',
        duracao: 25,
        intro:
          '¡Último día! Una secuencia completa de celebración y un mapa para que sigas después. El protocolo termina, la práctica se queda.',
        blocos: [
          prep('Espacio libre, tapete y un apoyo. Empieza de pie, con una respiración de gratitud por el camino recorrido hasta aquí.'),
          mov(
            'La secuencia del recorrido',
            'Encadena con calma: brazos que respiran → espiral → roll down/up → círculos de cadera → al suelo para gato y vaca → torsión suave → acostada para cerrar.',
            'La respiración guiándolo todo, sin apuro.',
            'un recorrido entero, saboreado.',
            'el cuerpo que conociste a lo largo de 28 días, más suelto y presente.',
            'respeta el día; celebrar no es forzar.',
          ),
          {
            tipo: 'texto',
            titulo: 'Cómo continuar después de los 28 días',
            conteudo:
              'No necesitas una fórmula: 10 a 20 minutos, de 3 a 5 veces por semana, ya sostienen todo lo que ganaste. En los días agitados, haz solo la llegada y la respiración — igual vale. Vuelve a cualquier clase cuando quieras; siguen aquí. Y, sobre todo: sigue escuchando a tu cuerpo. Te lo agradece todos los días.',
          },
          fecho('Recuéstate por un minuto al final y reconoce: apareciste 28 días por ti. Eso cambia la relación con tu propio cuerpo — y nadie te lo quita.'),
          dica('El resultado más grande no es físico: es saber que eres capaz de cuidarte, un movimiento a la vez. Felicidades. 🤍'),
        ],
      },
    },
  ],
}

export const RITUAL_SEMANAS: Semana[] = [semana1, semana2, semana3, semana4]

// Sanidade: garante 28 aulas.
export const TOTAL_AULAS = RITUAL_SEMANAS.reduce((n, s) => n + s.dias.length, 0)

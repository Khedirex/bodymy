// =====================================================================
// BodyMy — Conteúdo real da Semana 1 do circuito (variação v1) + os 10
// alongamentos do bloco de mobilidade. Fonte única usada pelo seed e pelo gerador
// da migração de produção. v2/v3/v4 ficam pendentes (instrucoes null).
//
// Cada exercício tem 5 blocos: Preparação, Movimento, Respiração,
// O que sentir e Atenção (este último é o aviso de segurança).
// =====================================================================

export interface ExercicioConteudo {
  dia: number // dia_do_ciclo 1-7
  ordem: number // ordem_no_dia 1-5
  nome: string
  descricao: string // resumo curto (dia/tema)
  preparacao: string
  movimento: string
  respiracao: string
  sentir: string
  atencao: string
}

export interface AlongamentoConteudo {
  ordem: number
  nome: string
  descricao: string
}

// Rótulos usados no texto e reconhecidos pelo parser da UI.
export const BLOCOS_INSTRUCAO = ['Preparación', 'Movimiento', 'Respiración', 'Qué vas a sentir', 'Atención'] as const

// Monta o texto da variação v1 em linhas rotuladas (a UI faz o parse).
export function instrucoesV1(e: ExercicioConteudo): string {
  return [
    `Preparación: ${e.preparacao}`,
    `Movimiento: ${e.movimento}`,
    `Respiración: ${e.respiracao}`,
    `Qué vas a sentir: ${e.sentir}`,
    `Atención: ${e.atencao}`,
  ].join('\n')
}

const DIA_TEMA: Record<number, string> = {
  1: 'Día 1 — Respirar y asentarse',
  2: 'Día 2 — Soltar la parte alta del cuerpo',
  3: 'Día 3 — Abrir las caderas',
  4: 'Día 4 — Columna viva',
  5: 'Día 5 — Centro sin esfuerzo',
  6: 'Día 6 — Piernas y apoyo',
  7: 'Día 7 — Cuerpo entero, despacio',
}
export const temaDoDia = (dia: number) => DIA_TEMA[dia] ?? `Día ${dia}`

export const EXERCICIOS: ExercicioConteudo[] = [
  // ----- DIA 1 — Respirar e assentar -----
  {
    dia: 1, ordem: 1, nome: 'Respiración de tres tiempos', descricao: DIA_TEMA[1],
    preparacao: 'Acostada boca arriba, rodillas dobladas, pies apoyados en el suelo. Una mano sobre el vientre, otra sobre el pecho.',
    movimento: 'Deja que el aire entre primero llenando el vientre, después las costillas, por último el pecho. Suelta en el orden inverso, sin prisa.',
    respiracao: 'Inspira en 4 tiempos, suelta en 6. Sin retener el aire en ningún momento.',
    sentir: 'La mano del vientre subiendo antes que la mano del pecho. Es común que, al principio, pase lo contrario — está bien.',
    atencao: 'Si sientes mareo, vuelve a respirar con normalidad por unos instantes.',
  },
  {
    dia: 1, ordem: 2, nome: 'Balanceo de la pelvis', descricao: DIA_TEMA[1],
    preparacao: 'Acostada boca arriba, rodillas dobladas, pies apoyados al ancho de la cadera.',
    movimento: 'Inclina la pelvis levemente hacia atrás, pegando la zona lumbar al suelo. Después vuelve despacio, dejando un pequeño espacio debajo de la lumbar. Movimiento pequeño, casi invisible desde afuera.',
    respiracao: 'Suelta el aire al pegar la lumbar, inspira al volver.',
    sentir: 'La lumbar tocando y despegándose del suelo. El movimiento nace de la pelvis, no de las piernas.',
    atencao: 'No fuerces la lumbar contra el suelo. Es un balanceo suave, no una presión.',
  },
  {
    dia: 1, ordem: 3, nome: 'Rodillas que se abrazan', descricao: DIA_TEMA[1],
    preparacao: 'Acostada boca arriba. Lleva una rodilla a la vez hacia el pecho y envuélvela con las manos o los brazos.',
    movimento: 'Tira de las rodillas suavemente hacia el pecho, sostén durante tres respiraciones y suelta un poco. Repite.',
    respiracao: 'Suelta el aire al acercar las rodillas, inspira al aflojar.',
    sentir: 'Un estiramiento agradable en la lumbar y los glúteos.',
    atencao: 'Si el cuello se tensiona, apoya la cabeza en un cojín bajo.',
  },
  {
    dia: 1, ordem: 4, nome: 'Pies que empujan', descricao: DIA_TEMA[1],
    preparacao: 'Acostada boca arriba, rodillas dobladas, pies bien apoyados en el suelo.',
    movimento: 'Presiona los pies contra el suelo como si quisieras empujarlo lejos, sin levantar la cadera. Sostén dos segundos y suelta por completo.',
    respiracao: 'Suelta el aire al presionar, inspira al relajar.',
    sentir: 'Activación detrás de los muslos y en los glúteos, sin esfuerzo en la lumbar.',
    atencao: 'La cadera permanece en el suelo. Si se levanta, reduce la fuerza.',
  },
  {
    dia: 1, ordem: 5, nome: 'Descanso de la lumbar', descricao: DIA_TEMA[1],
    preparacao: 'Acostada boca arriba, pantorrillas apoyadas sobre el asiento de una silla o sofá, rodillas en ángulo recto.',
    movimento: 'Ninguno. Solo permanece en la posición, dejando que el peso del cuerpo se hunda.',
    respiracao: 'Libre y natural. Observa el aire entrando y saliendo.',
    sentir: 'La lumbar soltándose poco a poco. Es común sentir que el cuerpo “se hunde” después del primer minuto.',
    atencao: 'Permanece de 2 a 3 minutos. Si sientes hormigueo en las piernas, bájalas y vuelve a empezar.',
  },
  // ----- DIA 2 — Soltar o alto do corpo -----
  {
    dia: 2, ordem: 1, nome: 'Hombros que se derriten', descricao: DIA_TEMA[2],
    preparacao: 'Sentada en una silla, pies apoyados en el suelo, columna apoyada en el respaldo.',
    movimento: 'Sube los hombros hacia las orejas lentamente, sostén durante tres segundos, y déjalos caer de una vez, como si soltaras un peso.',
    respiracao: 'Inspira al subir, suelta el aire al dejarlos caer.',
    sentir: 'El contraste entre la tensión y la relajación. Es esa diferencia la que le enseña al cuerpo a soltar.',
    atencao: 'La caída es pasiva, no empujes los hombros hacia abajo.',
  },
  {
    dia: 2, ordem: 2, nome: 'Cabeza que rueda', descricao: DIA_TEMA[2],
    preparacao: 'Sentada, columna apoyada, hombros relajados.',
    movimento: 'Lleva el mentón hacia el pecho y rueda la cabeza despacio hacia un lado, luego vuelve al centro y ve hacia el otro. Solo medio círculo, nunca hacia atrás.',
    respiracao: 'Libre, sin retener.',
    sentir: 'Estiramiento en los laterales del cuello. Puede haber leves crujidos — es normal.',
    atencao: 'Nunca lleves la cabeza hacia atrás. Si sientes mareo, detente y vuelve al centro.',
  },
  {
    dia: 2, ordem: 3, nome: 'Brazos de ala', descricao: DIA_TEMA[2],
    preparacao: 'Sentada, brazos doblados a la altura del pecho, codos a la altura de los hombros.',
    movimento: 'Abre los codos hacia los lados, acercando los omóplatos, y vuelve al frente. Movimiento horizontal y lento.',
    respiracao: 'Inspira al abrir, suelta el aire al cerrar.',
    sentir: 'Los omóplatos acercándose en la espalda al abrir.',
    atencao: 'Los hombros permanecen bajos. Si suben hacia las orejas, reduce la amplitud.',
  },
  {
    dia: 2, ordem: 4, nome: 'Pecho que se abre', descricao: DIA_TEMA[2],
    preparacao: 'Sentada en el borde de la silla, manos apoyadas detrás de la cadera, dedos apuntando hacia atrás.',
    movimento: 'Desliza las manos un poco más hacia atrás, abriendo el pecho, y sostén durante tres respiraciones. Vuelve y repite.',
    respiracao: 'Inspira profundamente en la apertura, sintiendo el pecho expandirse.',
    sentir: 'Apertura en el frente del pecho y los hombros.',
    atencao: 'Mantén el cuello largo. No eches la cabeza hacia atrás.',
  },
  {
    dia: 2, ordem: 5, nome: 'Nuca larga', descricao: DIA_TEMA[2],
    preparacao: 'Sentada, columna apoyada, manos sobre los muslos.',
    movimento: 'Lleva el mentón hacia el pecho despacio, estirando la nuca. Sostén y vuelve lentamente. Después inclina la cabeza hacia cada lado, oreja en dirección al hombro.',
    respiracao: 'Suelta el aire al inclinar, inspira al volver al centro.',
    sentir: 'Estiramiento en la nuca y los laterales del cuello.',
    atencao: 'No uses las manos para tirar de la cabeza. Deja que su propio peso haga el trabajo.',
  },
  // ----- DIA 3 — Abrir os quadris -----
  {
    dia: 3, ordem: 1, nome: 'Cadera que se balancea', descricao: DIA_TEMA[3],
    preparacao: 'Acostada boca arriba, rodillas dobladas, pies apoyados.',
    movimento: 'Desliza la cadera suavemente hacia un lado y hacia el otro, como un balanceo lento. Movimiento pequeño.',
    respiracao: 'Libre, acompañando el ritmo del balanceo.',
    sentir: 'Soltura en la zona de la cadera y la lumbar.',
    atencao: 'Los hombros permanecen apoyados. El movimiento es solo de la cadera hacia abajo.',
  },
  {
    dia: 3, ordem: 2, nome: 'Rodilla que se abre', descricao: DIA_TEMA[3],
    preparacao: 'Acostada boca arriba, rodillas dobladas, pies apoyados.',
    movimento: 'Deja que una rodilla se abra hacia el lado, en dirección al suelo, manteniendo el pie apoyado. Ve hasta donde te sea cómodo y vuelve. Alterna los lados.',
    respiracao: 'Suelta el aire al abrir, inspira al volver.',
    sentir: 'Apertura en la ingle y la parte interna del muslo.',
    atencao: 'La cadera del lado opuesto permanece apoyada. No fuerces la rodilla hasta el suelo.',
  },
  {
    dia: 3, ordem: 3, nome: 'Mariposa acostada', descricao: DIA_TEMA[3],
    preparacao: 'Acostada boca arriba, plantas de los pies unidas, rodillas abiertas hacia los lados.',
    movimento: 'Permanece en la posición dejando que el peso de las piernas abra las rodillas naturalmente. Si prefieres, apoya cojines debajo de las rodillas.',
    respiracao: 'Libre y profunda. En cada espiración, imagina que las caderas se sueltan un poco más.',
    sentir: 'Estiramiento en la parte interna de los muslos.',
    atencao: 'Nunca empujes las rodillas hacia abajo con las manos. Permanece de 1 a 2 minutos.',
  },
  {
    dia: 3, ordem: 4, nome: 'Pierna que desliza', descricao: DIA_TEMA[3],
    preparacao: 'Acostada boca arriba, rodillas dobladas, pies apoyados.',
    movimento: 'Desliza un talón por el suelo, extendiendo la pierna hasta donde logres mantener la lumbar tranquila. Vuelve deslizando. Alterna.',
    respiracao: 'Suelta el aire al extender, inspira al recoger.',
    sentir: 'El trabajo suave en el frente del muslo y en el centro del cuerpo al controlar el movimiento.',
    atencao: 'Si la lumbar se arquea demasiado, extiende menos la pierna.',
  },
  {
    dia: 3, ordem: 5, nome: 'Figura cuatro', descricao: DIA_TEMA[3],
    preparacao: 'Acostada boca arriba, rodillas dobladas. Cruza el tobillo derecho sobre el muslo izquierdo, formando un “cuatro”.',
    movimento: 'Permanece en la posición. Si quieres más intensidad, acerca el muslo de apoyo al pecho con las manos.',
    respiracao: 'Libre. Tres a cinco respiraciones de cada lado.',
    sentir: 'Estiramiento en el glúteo de la pierna cruzada.',
    atencao: 'Si sientes incomodidad en la rodilla, reduce o sal de la posición.',
  },
  // ----- DIA 4 — Coluna viva -----
  {
    dia: 4, ordem: 1, nome: 'Gato y vaca en el suelo', descricao: DIA_TEMA[4],
    preparacao: 'En cuatro apoyos, manos bajo los hombros, rodillas bajo la cadera. Si las rodillas molestan, usa una toalla doblada.',
    movimento: 'Redondea la espalda llevando la mirada al ombligo, después invierte, dejando que la barriga baje y la mirada suba levemente. Alterna lentamente.',
    respiracao: 'Suelta el aire al redondear, inspira al abrir.',
    sentir: 'La columna moviéndose por completo, vértebra por vértebra.',
    atencao: 'Amplitud cómoda. Si la muñeca molesta, apoya los antebrazos.',
  },
  {
    dia: 4, ordem: 2, nome: 'Columna que se desenrolla', descricao: DIA_TEMA[4],
    preparacao: 'Sentada en el borde de la silla, pies apoyados, manos sobre los muslos.',
    movimento: 'Enrolla la columna hacia adelante despacio, empezando por la cabeza, dejando que las manos se deslicen por los muslos. Vuelve desenrollando de abajo hacia arriba.',
    respiracao: 'Suelta el aire al bajar, inspira al subir.',
    sentir: 'Cada parte de la columna doblándose y volviendo en secuencia.',
    atencao: 'Baja solo hasta donde te sea cómodo. No necesitas llegar a los pies.',
  },
  {
    dia: 4, ordem: 3, nome: 'Torsión del reloj', descricao: DIA_TEMA[4],
    preparacao: 'Acostada boca arriba, rodillas dobladas y juntas, brazos abiertos en cruz.',
    movimento: 'Deja que las rodillas caigan despacio hacia un lado, manteniendo los hombros apoyados. Vuelve al centro y ve hacia el otro lado.',
    respiracao: 'Suelta el aire al girar, inspira al volver.',
    sentir: 'Rotación suave en la columna y estiramiento en el lateral del tronco.',
    atencao: 'Si un hombro se levanta del suelo, reduce la amplitud de la torsión.',
  },
  {
    dia: 4, ordem: 4, nome: 'Ondulación de la columna', descricao: DIA_TEMA[4],
    preparacao: 'En cuatro apoyos, manos bajo los hombros.',
    movimento: 'Haz un movimiento continuo y ondulatorio, como una ola que recorre la columna desde el cóccix hasta la cabeza, y vuelve.',
    respiracao: 'Libre, acompañando el ritmo de la ola.',
    sentir: 'El movimiento pasando por zonas de la columna que suelen quedar quietas.',
    atencao: 'Es un movimiento fluido, sin pausas. Si te confundes, vuelve al gato y vaca.',
  },
  {
    dia: 4, ordem: 5, nome: 'Estiramiento en C', descricao: DIA_TEMA[4],
    preparacao: 'Sentada, una mano apoyada en el asiento junto a la cadera.',
    movimento: 'Lleva el otro brazo por encima de la cabeza, inclinando el tronco hacia el lado y formando un arco. Sostén y vuelve. Alterna.',
    respiracao: 'Inspira al subir el brazo, suelta el aire en la inclinación.',
    sentir: 'Estiramiento en todo el lateral del tronco, desde las costillas hasta la cadera.',
    atencao: 'Mantén los dos glúteos apoyados en el asiento.',
  },
  // ----- DIA 5 — Centro sem esforço -----
  {
    dia: 5, ordem: 1, nome: 'Barriga que respira', descricao: DIA_TEMA[5],
    preparacao: 'Acostada boca arriba, rodillas dobladas, manos sobre la barriga.',
    movimento: 'Al soltar el aire, lleva el ombligo suavemente hacia la columna, como si cerraras un cinturón por dentro. Suelta al inspirar.',
    respiracao: 'La activación ocurre en la espiración. Nunca retengas el aire.',
    sentir: 'Una activación profunda y sutil en el fondo de la barriga — no es contraer con fuerza.',
    atencao: 'Si la barriga se endurece por fuera o el aire se queda atrapado, estás forzando demasiado.',
  },
  {
    dia: 5, ordem: 2, nome: 'Pierna que cae y vuelve', descricao: DIA_TEMA[5],
    preparacao: 'Acostada boca arriba, rodillas dobladas, pies apoyados, manos al lado del cuerpo.',
    movimento: 'Activa suavemente la barriga y deja que una rodilla se abra hacia el lado, manteniendo la cadera estable. Vuelve con control. Alterna.',
    respiracao: 'Suelta el aire al abrir, inspira al volver.',
    sentir: 'El centro del cuerpo trabajando para impedir que la cadera gire junto.',
    atencao: 'Si la cadera opuesta se levanta, reduce la amplitud.',
  },
  {
    dia: 5, ordem: 3, nome: 'Cabeza que se levanta despacio', descricao: DIA_TEMA[5],
    preparacao: 'Acostada boca arriba, rodillas dobladas, manos detrás de la cabeza solo como apoyo.',
    movimento: 'Suelta el aire, lleva el mentón levemente hacia el pecho y eleva la cabeza pocos centímetros. Vuelve despacio.',
    respiracao: 'Suelta el aire al subir, inspira al bajar.',
    sentir: 'Activación en la barriga, no en el cuello.',
    atencao: 'Las manos apoyan, no tiran. Si el cuello duele, detente.',
  },
  {
    dia: 5, ordem: 4, nome: 'Puente suave', descricao: DIA_TEMA[5],
    preparacao: 'Acostada boca arriba, rodillas dobladas, pies apoyados al ancho de la cadera.',
    movimento: 'Eleva la cadera unos centímetros del suelo y baja despacio, apoyando vértebra por vértebra.',
    respiracao: 'Suelta el aire al subir, inspira al bajar.',
    sentir: 'Activación en los glúteos y detrás de los muslos.',
    atencao: 'No subas más allá de lo cómodo. Si la lumbar se queja, eleva menos.',
  },
  {
    dia: 5, ordem: 5, nome: 'Plancha apoyada', descricao: DIA_TEMA[5],
    preparacao: 'De pie, frente a una pared, manos apoyadas a la altura de los hombros, pies a un paso de distancia.',
    movimento: 'Mantén el cuerpo en línea recta desde la cabeza hasta los pies, barriga levemente activa. Sostén de 15 a 20 segundos.',
    respiracao: 'Continua y tranquila. No retengas el aire.',
    sentir: 'Activación suave en todo el centro del cuerpo.',
    atencao: 'Si la lumbar se hunde, acerca los pies a la pared.',
  },
  // ----- DIA 6 — Pernas e apoio -----
  {
    dia: 6, ordem: 1, nome: 'Sentadilla en la silla', descricao: DIA_TEMA[6],
    preparacao: 'De pie, de espaldas a una silla, pies al ancho de la cadera.',
    movimento: 'Baja sentándote en la silla con control, apoyando las manos en las rodillas si lo necesitas. Levántate usando la fuerza de las piernas.',
    respiracao: 'Inspira al bajar, suelta el aire al subir.',
    sentir: 'Trabajo en el frente de los muslos y en los glúteos.',
    atencao: 'Las rodillas apuntan en la misma dirección que los pies. Baja despacio, sin dejarte caer.',
  },
  {
    dia: 6, ordem: 2, nome: 'Pantorrilla que sube', descricao: DIA_TEMA[6],
    preparacao: 'De pie, manos apoyadas en el respaldo de una silla o en la pared.',
    movimento: 'Sube los talones, quedando en la punta de los pies, sostén un segundo y baja despacio.',
    respiracao: 'Suelta el aire al subir, inspira al bajar.',
    sentir: 'Trabajo en las pantorrillas y activación en los pies.',
    atencao: 'La bajada es lenta — es ahí donde está el trabajo.',
  },
  {
    dia: 6, ordem: 3, nome: 'Pierna que se abre de pie', descricao: DIA_TEMA[6],
    preparacao: 'De pie, una mano apoyada en la pared o silla.',
    movimento: 'Abre una pierna hacia el lado hasta donde logres mantener el tronco recto, y vuelve con control. Alterna.',
    respiracao: 'Suelta el aire al abrir, inspira al volver.',
    sentir: 'Trabajo en el lateral de la cadera.',
    atencao: 'El tronco permanece erguido. No te inclines hacia el lado opuesto.',
  },
  {
    dia: 6, ordem: 4, nome: 'Paso que retrasa', descricao: DIA_TEMA[6],
    preparacao: 'De pie, mano apoyada en una silla, pies al ancho de la cadera.',
    movimento: 'Da un paso hacia atrás con una pierna, transfiriendo poco peso, y vuelve al centro. Alterna.',
    respiracao: 'Inspira al dar el paso, suelta el aire al volver.',
    sentir: 'Equilibrio y trabajo en la pierna de apoyo.',
    atencao: 'Paso corto al principio. Aumenta conforme ganes seguridad.',
  },
  {
    dia: 6, ordem: 5, nome: 'Equilibrio en un pie', descricao: DIA_TEMA[6],
    preparacao: 'De pie, junto a una pared o silla, con la mano apoyada levemente como seguridad.',
    movimento: 'Eleva un pie pocos centímetros del suelo y mantén el equilibrio de 10 a 20 segundos. Alterna.',
    respiracao: 'Tranquila y continua.',
    sentir: 'Los pequeños ajustes constantes del pie y del tobillo — así es como se entrena el equilibrio.',
    atencao: 'Mantén siempre el apoyo al alcance de la mano.',
  },
  // ----- DIA 7 — Corpo inteiro, devagar -----
  {
    dia: 7, ordem: 1, nome: 'Desperezo completo', descricao: DIA_TEMA[7],
    preparacao: 'Acostada boca arriba, piernas extendidas, brazos por encima de la cabeza.',
    movimento: 'Estira todo el cuerpo como al despertar: brazos hacia arriba, pies hacia abajo, estirando al máximo. Sostén y suelta de una vez.',
    respiracao: 'Inspira al estirar, suelta el aire al relajar.',
    sentir: 'Todo el cuerpo estirándose de punta a punta, y la relajación profunda después.',
    atencao: 'Este es el movimiento más natural que existe. Deja que el cuerpo te guíe.',
  },
  {
    dia: 7, ordem: 2, nome: 'Rodar hacia el lado', descricao: DIA_TEMA[7],
    preparacao: 'Acostada boca arriba, brazos al lado del cuerpo.',
    movimento: 'Rueda todo el cuerpo hacia un lado con control, como un solo bloque, y vuelve. Alterna.',
    respiracao: 'Libre, acompañando el movimiento.',
    sentir: 'La coordinación entre tronco, cadera y piernas.',
    atencao: 'Movimiento lento. La intención es sentir la secuencia, no la velocidad.',
  },
  {
    dia: 7, ordem: 3, nome: 'Secuencia para levantarse', descricao: DIA_TEMA[7],
    preparacao: 'Acostada boca arriba.',
    movimento: 'Rueda hacia el lado, apoya la mano en el suelo, siéntate, apóyate para quedar de rodillas y ponte de pie. Después haz el camino inverso para volver al suelo.',
    respiracao: 'Libre, sin retener en ninguna transición.',
    sentir: 'Cómo el cuerpo se organiza para salir del suelo — un gesto que usamos toda la vida sin darnos cuenta.',
    atencao: 'Usa apoyo siempre que lo necesites. Ve despacio.',
  },
  {
    dia: 7, ordem: 4, nome: 'Balanceo de pie', descricao: DIA_TEMA[7],
    preparacao: 'De pie, pies al ancho de la cadera, brazos sueltos.',
    movimento: 'Balancea el cuerpo suavemente hacia adelante y hacia atrás, después hacia los lados, encontrando el punto de equilibrio en el centro.',
    respiracao: 'Libre y tranquila.',
    sentir: 'Los pies trabajando todo el tiempo para mantenerte de pie.',
    atencao: 'Movimiento pequeño. Si sientes inestabilidad, quédate cerca de una pared.',
  },
  {
    dia: 7, ordem: 5, nome: 'Silencio del cuerpo', descricao: DIA_TEMA[7],
    preparacao: 'Acostada boca arriba, piernas extendidas o rodillas dobladas, lo que te resulte más cómodo.',
    movimento: 'Ninguno. Solo permanece, recorriendo el cuerpo con la atención, de los pies a la cabeza.',
    respiracao: 'Natural. Sin controlar.',
    sentir: 'Cómo está el cuerpo ahora, después de toda la semana de práctica.',
    atencao: 'Permanece de 2 a 3 minutos. Este es el cierre — no te lo saltes.',
  },
]

export const ALONGAMENTOS: AlongamentoConteudo[] = [
  { ordem: 1, nome: 'Respirar y llegar', descricao: 'Acostada boca arriba, rodillas dobladas. Solo respira durante tres minutos, observando el aire entrar y salir. Sin mover nada. Es el primer contacto con el cuerpo.' },
  { ordem: 2, nome: 'Estirar de punta a punta', descricao: 'Acostada, brazos por encima de la cabeza. Estira todo el cuerpo durante unos segundos y suelta. Repite tres veces.' },
  { ordem: 3, nome: 'Rodillas al pecho', descricao: 'Acostada, lleva las rodillas al pecho y envuélvelas con los brazos. Sostén durante cinco respiraciones, sintiendo la lumbar apoyada en el suelo.' },
  { ordem: 4, nome: 'Torsión acostada', descricao: 'Acostada, rodillas dobladas y juntas, brazos abiertos. Deja que las rodillas caigan hacia un lado y la mirada hacia el otro. Cinco respiraciones de cada lado.' },
  { ordem: 5, nome: 'Cuello en tres direcciones', descricao: 'Sentada. Inclina la cabeza hacia la derecha, hacia la izquierda y hacia adelante, sosteniendo tres respiraciones en cada posición. Nunca hacia atrás.' },
  { ordem: 6, nome: 'Hombros en círculo', descricao: 'Sentada. Haz círculos lentos con los hombros, cinco veces hacia atrás y cinco hacia adelante.' },
  { ordem: 7, nome: 'Abrir los brazos', descricao: 'Sentada en el borde de la silla, manos apoyadas atrás. Abre el pecho y sostén durante cinco respiraciones.' },
  { ordem: 8, nome: 'Estirar detrás de la pierna', descricao: 'Sentada, una pierna extendida al frente con el talón en el suelo. Inclina el tronco levemente hasta sentir la parte de atrás de la pierna. Cinco respiraciones de cada lado.' },
  { ordem: 9, nome: 'Cadera en cuatro', descricao: 'Acostada, tobillo cruzado sobre el muslo opuesto. Sostén durante cinco respiraciones de cada lado.' },
  { ordem: 10, nome: 'Reposo final', descricao: 'Acostada, piernas y brazos sueltos. Dos minutos de inmovilidad, solo percibiendo el cuerpo.' },
]

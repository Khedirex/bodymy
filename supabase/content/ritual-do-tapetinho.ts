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
  'Este conteúdo é educativo e de bem-estar — não substitui fisioterapia, médico ou profissional de saúde. Respeite sempre os seus limites: movimento é para dar alívio, nunca dor. Se sentir dor, tontura ou desconforto, pare e, se necessário, procure orientação profissional. Se você tem alguma condição de saúde, converse com seu médico antes de começar.'

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
      `Como fazer: ${comoFazer}\n` +
      `Respiração: ${respiracao}\n` +
      `Repetições: ${repeticoes}\n` +
      `Você deve sentir: ${sentir}\n` +
      `⚠️ Sinal de parar: ${alerta}`,
  }
}

const prep = (t: string): Bloco => ({ tipo: 'texto', titulo: 'Preparação', conteudo: t })
const fecho = (t: string): Bloco => ({ tipo: 'texto', titulo: 'Para encerrar', conteudo: t })
const dica = (t: string): Bloco => ({ tipo: 'dica', titulo: 'Dica do dia', conteudo: t })

// =====================================================================
// SEMANA 1 — Reconhecendo o corpo (percepção e respiração; deitada/sentada)
// =====================================================================
const semana1: Semana = {
  numero: 1,
  titulo: 'Semana 1 — Reconhecendo o corpo',
  dias: [
    {
      titulo: 'Dia 1',
      aula: {
        titulo: 'Chegando ao corpo',
        duracao: 10,
        intro:
          'Bem-vinda! Hoje a gente não vai “fazer exercício” — vamos só chegar. Deitar, respirar e perceber o corpo que já está aqui. É a base de tudo o que vem pela frente.',
        blocos: [
          { tipo: 'aviso', titulo: 'Antes de começar', conteudo: AVISO_SEGURANCA },
          prep('Deite de costas em um tapete, toalha ou na cama. Dobre os joelhos com os pés apoiados, na largura do quadril. Deixe os braços ao lado do corpo. Se for mais confortável, coloque uma almofada fina sob a cabeça.'),
          mov(
            'Sentindo o apoio',
            'Feche os olhos e perceba os pontos do corpo que tocam o chão: a cabeça, as costas, o quadril, os pés. Não mude nada, só observe.',
            'Respire pelo nariz, no seu ritmo natural, sem controlar.',
            '1 minuto observando.',
            'o peso do corpo entregando ao apoio, como se afundasse um pouquinho.',
            'nada aqui força — se a lombar incomodar, aproxime mais os pés do quadril.',
          ),
          mov(
            'Respiração na barriga',
            'Leve uma das mãos à barriga. Ao inspirar, deixe a barriga subir suavemente sob a mão; ao soltar o ar, deixe descer. Sem empurrar.',
            'Inspire contando até 3, solte contando até 4.',
            '8 a 10 respirações lentas.',
            'a barriga se movendo com o ar, e os ombros ficando mais pesados.',
            'se ficar tonta ou ofegante, volte à respiração normal.',
          ),
          fecho('Fique mais um instante deitada, sentindo como o corpo está agora. Depois abra os olhos devagar. Pronto — você já começou.'),
          dica('Você não precisa “fazer bonito”. No somático, aparecer e sentir já é a prática inteira. O resto vem sozinho.'),
        ],
      },
    },
    {
      titulo: 'Dia 2',
      aula: {
        titulo: 'A respiração que solta',
        duracao: 12,
        intro:
          'Hoje unimos respiração e um micro-movimento dos ombros. Quando a respiração conduz, o corpo solta sem esforço.',
        blocos: [
          prep('Deitada de costas, joelhos dobrados e pés apoiados. Braços ao lado do corpo, palmas para cima.'),
          mov(
            'Ombros que sobem e derretem',
            'Na inspiração, leve suavemente os ombros na direção das orelhas (bem pouco). Na expiração, deixe-os “derreter” de volta, afastando das orelhas.',
            'Inspire subindo os ombros, solte o ar descendo.',
            '6 vezes, sem pressa.',
            'a diferença entre o ombro tenso (subindo) e o ombro solto (descendo).',
            'faça pequeno — se o pescoço reclamar, diminua o movimento.',
          ),
          mov(
            'Abrir o peito com o ar',
            'Ao inspirar, deixe o peito se abrir levemente; ao soltar, deixe as costelas se fecharem como um leque. O movimento é interno, quase invisível.',
            'Respiração lenta, guiando a abertura e o fechamento.',
            '8 respirações.',
            'o peito ganhando espaço, e a respiração ficando mais fácil.',
            'nada de arquear a lombar; o movimento é só das costelas.',
          ),
          fecho('Descanse os braços e sinta os ombros. Compare com o começo: costumam estar mais baixos e leves.'),
          dica('Repare quantas vezes no dia você segura o ar sem notar — em uma mensagem difícil, no trânsito. Soltar o ar já é soltar tensão.'),
        ],
      },
    },
    {
      titulo: 'Dia 3',
      aula: {
        titulo: 'Balanço da pelve',
        duracao: 12,
        intro:
          'Um movimento pequeno e delicioso para a lombar: inclinar a bacia para frente e para trás, devagar, deixando a coluna acompanhar.',
        blocos: [
          prep('Deitada de costas, joelhos dobrados, pés apoiados na largura do quadril. Mãos descansando na barriga ou ao lado do corpo.'),
          mov(
            'Báscula da pelve',
            'Imagine a bacia como uma tigela com água. Incline-a levemente para trás (a lombar se aproxima do chão) e depois para frente (a lombar faz um pequeno arco). Movimento minúsculo e lento.',
            'Solte o ar ao aproximar a lombar do chão; inspire ao voltar.',
            '8 a 10 balanços suaves.',
            'a lombar “rolando” entre os dois pontos, sem esforço das pernas.',
            'se aparecer qualquer fisgada, reduza a amplitude pela metade.',
          ),
          mov(
            'Pausa e sentir',
            'Pare no meio, na posição mais neutra e confortável. Só observe a lombar apoiada.',
            'Três respirações lentas.',
            '30 segundos.',
            'a região que antes estava travada um pouco mais macia.',
            'nenhum — esta é só a pausa.',
          ),
          fecho('Estique as pernas devagar, uma de cada vez, e sinta a lombar. Menos rígida costuma ser a sensação.'),
          dica('A lombar não gosta de ficar parada o dia todo. Este balanço cabe até na cama, antes de dormir.'),
        ],
      },
    },
    {
      titulo: 'Dia 4',
      aula: {
        titulo: 'Pausa consciente (prática leve)',
        duracao: 10,
        intro:
          'Dia mais calmo. Nada de “fazer” — hoje é reconhecer o corpo inteiro com atenção. Prática leve também é constância, e mantém sua sequência viva.',
        blocos: [
          prep('Deite confortável, de costas, pernas estendidas ou joelhos dobrados — o que for melhor para você. Cobertor se quiser aconchego.'),
          mov(
            'Varredura do corpo',
            'Leve a atenção aos pés e suba lentamente: pernas, quadril, barriga, peito, mãos, ombros, pescoço, rosto. Em cada região, só perceba como ela está — sem mudar.',
            'Respiração natural, tranquila.',
            'Uma passagem completa, cerca de 5 minutos.',
            'quais regiões estão soltas e quais pedem mais atenção.',
            'se a mente dispersar, tudo bem — volte gentilmente para onde parou.',
          ),
          fecho('Fique deitada mais um minuto, sem fazer nada. Depois volte devagar.'),
          dica('Descansar com atenção é diferente de desligar na TV: aqui o corpo aprende a soltar. Isso é treino também.'),
        ],
      },
    },
    {
      titulo: 'Dia 5',
      aula: {
        titulo: 'Cabeça que roda',
        duracao: 13,
        intro:
          'Vamos sentar e soltar o pescoço com um movimento lento de virar a cabeça. Muita tensão do dia mora aqui.',
        blocos: [
          prep('Sente numa cadeira firme, pés apoiados no chão, coluna longa e relaxada. Mãos nas coxas.'),
          mov(
            'Virar o olhar',
            'Vire a cabeça lentamente para a direita, como se fosse olhar por cima do ombro, só até onde é confortável. Volte ao centro. Depois para a esquerda.',
            'Solte o ar ao virar, inspire ao voltar ao centro.',
            '4 vezes para cada lado.',
            'o pescoço deslizando, sem “travar” no fim do movimento.',
            'não force para ver mais atrás; pare onde ainda é agradável.',
          ),
          mov(
            'Orelha ao ombro',
            'Incline a cabeça levando a orelha direita na direção do ombro direito (sem subir o ombro). Volte ao centro e troque de lado.',
            'Expire ao inclinar, inspire ao voltar.',
            '3 vezes para cada lado.',
            'um alongamento suave na lateral do pescoço.',
            'se descer um formigamento no braço, volte imediatamente ao centro.',
          ),
          fecho('Volte o olhar ao centro, feche os olhos e sinta o pescoço. Costuma ficar mais leve e móvel.'),
          dica('No celular, a cabeça pende para frente e o pescoço paga a conta. Este movimento é um bom “reset” no meio do dia.'),
        ],
      },
    },
    {
      titulo: 'Dia 6',
      aula: {
        titulo: 'Abrir e fechar',
        duracao: 14,
        intro:
          'Hoje abrimos e fechamos os braços como um leque, sentada, deixando a respiração conduzir. Ajuda a soltar a parte de cima das costas.',
        blocos: [
          prep('Sentada na beira da cadeira, pés bem apoiados, coluna longa. Braços à frente na altura do peito, palmas se olhando.'),
          mov(
            'Leque dos braços',
            'Ao inspirar, abra os braços para os lados, como se abrisse uma janela; sinta o peito abrir. Ao soltar, traga os braços de volta à frente, arredondando levemente as costas.',
            'Inspire abrindo, expire fechando.',
            '6 vezes lentas.',
            'o peito abrindo na inspiração e as costas se soltando no fechamento.',
            'mantenha os ombros longe das orelhas; se subirem, faça menor.',
          ),
          mov(
            'Auto-abraço',
            'Na última vez, ao fechar, cruze os braços num abraço em você mesma, uma mão em cada ombro. Fique ali respirando.',
            'Três respirações lentas dentro do abraço.',
            '30 segundos.',
            'as costas entre as escápulas se abrindo com o ar.',
            'nenhum — é acolhimento.',
          ),
          fecho('Solte os braços no colo. Perceba a parte de cima das costas mais espaçosa.'),
          dica('Passar o dia com os ombros “fechados” à frente do teclado encurta o peito. Abrir de vez em quando reequilibra.'),
        ],
      },
    },
    {
      titulo: 'Dia 7',
      aula: {
        titulo: 'O corpo em repouso (prática leve)',
        duracao: 12,
        intro:
          'Fechamos a semana com um movimento gostoso da coluna, sentada, no ritmo da respiração. Suave, restaurador — e conta como dia ativo.',
        blocos: [
          prep('Sentada na cadeira, pés apoiados, mãos nas coxas.'),
          mov(
            'Gato e vaca sentada',
            'Ao inspirar, cresça pela coluna e abra levemente o peito para cima (vaca). Ao soltar, arredonde as costas, queixo em direção ao peito (gato). Bem lento.',
            'Inspire abrindo, expire arredondando.',
            '8 ciclos.',
            'a coluna se movendo vértebra por vértebra, como uma onda.',
            'amplitude confortável; nada de forçar o pescoço no final.',
          ),
          fecho('Volte ao centro, coluna longa. Sinta a semana: você apareceu 7 dias. Isso é grande.'),
          dica('Se só teve tempo para 5 minutos hoje, valeu igual. Constância é aparecer, não durar muito.'),
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
  titulo: 'Semana 2 — Soltando tensão',
  dias: [
    {
      titulo: 'Dia 8',
      aula: {
        titulo: 'Soltando os ombros',
        duracao: 16,
        intro:
          'Vamos usar a pandiculação — aquele espreguiçar natural — para soltar os ombros de verdade: contrair de leve, sustentar e soltar bem devagar.',
        blocos: [
          prep('Sentada ou em pé, coluna longa, braços soltos ao lado do corpo.'),
          mov(
            'Espreguiçar dos ombros',
            'Suba os dois ombros na direção das orelhas contraindo suavemente. Sustente 3 segundos sentindo a leve tensão. Agora solte MUITO devagar, deixando os ombros descerem além de onde começaram.',
            'Inspire subindo, segure o ar no topo, solte o ar descendo lentamente.',
            '4 vezes.',
            'a “descida” mais longa e solta do que a subida — esse é o segredo.',
            'se o pescoço reclamar, contraia menos.',
          ),
          mov(
            'Círculos de ombro',
            'Desenhe círculos lentos com os ombros para trás: sobe, vai para trás, desce, volta. Grandes e sem pressa.',
            'Respiração livre, contínua.',
            '5 círculos para trás.',
            'a articulação do ombro “lubrificando”, cada volta mais fácil.',
            'reduza o tamanho do círculo se houver estalos com desconforto.',
          ),
          fecho('Solte tudo e sinta os ombros pendendo. Aquele peso que você carregava sem notar costuma diminuir.'),
          dica('Pandiculação é o que o gato faz ao acordar. O corpo humano adora — a gente é que esqueceu de fazer.'),
        ],
      },
    },
    {
      titulo: 'Dia 9',
      aula: {
        titulo: 'Pescoço livre',
        duracao: 15,
        intro:
          'Hoje é dia de dar espaço ao pescoço com inclinações e uma rotação bem lenta. Delicadeza é a palavra.',
        blocos: [
          prep('Sentada, coluna longa, ombros soltos. Deixe uma mão descansar na coxa.'),
          mov(
            'Sim e não lentos',
            'Faça um “sim” minúsculo com a cabeça (queixo desce e sobe pouquíssimo) por algumas vezes; depois um “não” lento, virando o olhar de um lado ao outro.',
            'Respiração tranquila, sem prender.',
            '4 “sins” e 4 “nãos”, bem pequenos.',
            'a base do crânio deslizando sobre o pescoço.',
            'movimentos pequenos: aqui menos é mais.',
          ),
          mov(
            'Meia-lua do queixo',
            'Leve o queixo ao peito (sem forçar) e desenhe uma meia-lua levando o queixo de um ombro ao outro, passando pela frente. Nunca jogue a cabeça para trás.',
            'Solte o ar durante o desenho da meia-lua.',
            '3 vezes para cada direção.',
            'a nuca se abrindo e a frente do pescoço deslizando.',
            'sem levar a cabeça para trás; se tonteia, pare.',
          ),
          fecho('Volte ao centro e feche os olhos. Sinta o pescoço com mais espaço para respirar.'),
          dica('Tensão no pescoço muitas vezes é a mandíbula apertada. Solte os dentes: deixe um vãozinho entre eles.'),
        ],
      },
    },
    {
      titulo: 'Dia 10',
      aula: {
        titulo: 'Gato e vaca no chão',
        duracao: 18,
        intro:
          'O clássico da mobilidade da coluna, agora em quatro apoios. Uma onda que percorre as costas inteiras.',
        blocos: [
          prep('Fique de quatro apoios, mãos sob os ombros e joelhos sob o quadril, sobre o tapete. Use uma toalha dobrada sob os joelhos se incomodar.'),
          mov(
            'A onda da coluna',
            'Ao inspirar, deixe a barriga descer e o peito e o olhar subirem levemente (vaca). Ao soltar, empurre o chão e arredonde as costas para o teto, queixo ao peito (gato).',
            'Inspire na vaca, expire no gato.',
            '8 a 10 ciclos lentos.',
            'cada vértebra participando, do cóccix à nuca.',
            'se os punhos incomodarem, apoie nos antebraços ou reduza o tempo.',
          ),
          mov(
            'Descanso da criança',
            'Leve o quadril na direção dos calcanhares e deite o tronco à frente, braços estendidos ou ao lado do corpo. Testa apoiada.',
            'Respire para dentro das costas, sentindo-as subir.',
            '5 respirações.',
            'as costas se abrindo a cada inspiração.',
            'se os joelhos reclamarem, afaste-os ou coloque uma almofada atrás deles.',
          ),
          fecho('Volte devagar para sentada sobre os calcanhares ou de lado. Sinta a coluna mais fluida.'),
          dica('A coluna tem umas 30 peças que adoram se mover juntas. Ela foi feita para ondular, não para ficar reta o dia todo.'),
        ],
      },
    },
    {
      titulo: 'Dia 11',
      aula: {
        titulo: 'Respirar e soltar (prática leve)',
        duracao: 15,
        intro:
          'Dia restaurativo com as pernas apoiadas para descansar a lombar e as pernas cansadas. Pouco movimento, muito alívio.',
        blocos: [
          prep('Deite de costas perto de uma parede ou de uma cadeira. Coloque as panturrilhas sobre o assento da cadeira (joelhos dobrados a 90°) ou as pernas apoiadas na parede, o que for confortável.'),
          mov(
            'Pernas em repouso',
            'Com as pernas apoiadas, deixe a lombar relaxar no chão. Não faça nada com as pernas — só descanse o peso delas no apoio.',
            'Respiração longa e lenta, expiração mais demorada que a inspiração.',
            '3 a 4 minutos.',
            'a lombar e as pernas “desligando”, ficando pesadas.',
            'se formigar demais, tire as pernas do apoio e estique no chão.',
          ),
          fecho('Role para o lado, fique um instante, e levante-se sem pressa. Pernas mais leves é a sensação comum.'),
          dica('Passou o dia em pé ou sentada? Cinco minutos com as pernas apoiadas fazem mais pela sua disposição do que parece.'),
        ],
      },
    },
    {
      titulo: 'Dia 12',
      aula: {
        titulo: 'Quadril que abre',
        duracao: 18,
        intro:
          'O quadril guarda muita tensão de quem passa horas sentada. Vamos soltá-lo com movimentos lentos, deitada.',
        blocos: [
          prep('Deitada de costas, joelhos dobrados, pés apoiados na largura do quadril.'),
          mov(
            'Joelhos que balançam',
            'Com os pés um pouco mais afastados, deixe os dois joelhos caírem suavemente para a direita e depois para a esquerda, como limpadores de para-brisa lentos.',
            'Solte o ar ao levar os joelhos para o lado, inspire ao voltar ao centro.',
            '6 vezes para cada lado.',
            'o quadril e a lombar girando com leveza.',
            'amplitude pequena; não force os joelhos ao chão.',
          ),
          mov(
            'Abrir um joelho',
            'Mantenha um pé apoiado e deixe o outro joelho abrir para o lado (como um livro abrindo), só até onde é confortável. Volte e troque de perna.',
            'Expire ao abrir, inspire ao fechar.',
            '4 vezes para cada perna.',
            'a virilha e a parte interna da coxa se abrindo suavemente.',
            'se puxar a virilha com desconforto, abra menos.',
          ),
          fecho('Abrace os joelhos no peito por alguns segundos, se for confortável, e depois estique as pernas. Quadril mais livre.'),
          dica('Quadril preso costuma sobrecarregar a lombar. Soltar o quadril é um presente indireto para as suas costas.'),
        ],
      },
    },
    {
      titulo: 'Dia 13',
      aula: {
        titulo: 'Lombar que descansa',
        duracao: 17,
        intro:
          'Foco carinhoso na lombar hoje: balanço da pelve mais amplo e um abraço de joelhos que costuma dar alívio imediato.',
        blocos: [
          prep('Deitada de costas, joelhos dobrados, pés apoiados. Braços ao lado do corpo.'),
          mov(
            'Balanço amplo da pelve',
            'Retome o balanço da pelve do Dia 3, agora deixando a onda subir um pouco mais pela coluna: ao aproximar a lombar do chão, deixe o cóccix subir levemente.',
            'Solte o ar ao apoiar a lombar, inspire ao soltar.',
            '8 balanços.',
            'a lombar massageando o chão de leve.',
            'sem levantar o quadril alto; a onda é pequena.',
          ),
          mov(
            'Abraço de joelhos',
            'Traga um joelho de cada vez em direção ao peito e segure atrás das coxas (não sobre o joelho). Deixe a lombar afundar no chão.',
            'Respire para dentro das costas, expiração longa.',
            '5 respirações; solte e repita 1 vez.',
            'a lombar se abrindo e descansando no apoio.',
            'se for muito para os dois joelhos, faça um de cada vez.',
          ),
          fecho('Devolva os pés ao chão, estique as pernas devagar e sinta a lombar mais quietinha.'),
          dica('Dor lombar leve muitas vezes melhora com movimento suave, não com repouso total. Mas dor forte ou que desce pela perna pede avaliação profissional.'),
        ],
      },
    },
    {
      titulo: 'Dia 14',
      aula: {
        titulo: 'Torção suave (prática leve)',
        duracao: 15,
        intro:
          'Fechamos a semana com uma torção restauradora deitada — daquelas que a coluna agradece. Movimento mínimo, alívio grande.',
        blocos: [
          prep('Deitada de costas, joelhos dobrados e pés apoiados. Braços abertos em cruz, palmas para cima.'),
          mov(
            'Torção com os joelhos',
            'Junte os joelhos e deixe-os cair devagar para um lado, enquanto o olhar vai para o lado oposto, se for confortável. Volte ao centro e troque.',
            'Solte o ar ao girar, inspire ao voltar.',
            '3 a 4 vezes para cada lado, com pausa de uma respiração no fim.',
            'uma torção gentil ao longo da coluna e do peito abrindo.',
            'os ombros permanecem apoiados; se um levantar muito, gire menos.',
          ),
          fecho('Volte ao centro, abrace os joelhos por um instante e estique as pernas. Duas semanas concluídas — seu corpo já reconhece a prática.'),
          dica('Reparou como já entende melhor os sinais do corpo do que no Dia 1? Essa escuta é o verdadeiro resultado.'),
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
  titulo: 'Semana 3 — Movimento integrado',
  dias: [
    {
      titulo: 'Dia 15',
      aula: {
        titulo: 'Do chão ao pé',
        duracao: 20,
        intro:
          'Nesta semana o corpo se integra. Começamos aprendendo a levantar do chão com consciência — um movimento do dia a dia que merece ser suave.',
        blocos: [
          prep('Comece deitada de costas, joelhos dobrados. Tenha espaço livre ao redor.'),
          mov(
            'Rolar para o lado',
            'Vire a cabeça para um lado e deixe o corpo rolar inteiro para esse lado, como um tronco. Chegue de lado, joelhos dobrados.',
            'Solte o ar ao rolar.',
            '2 vezes para cada lado.',
            'o corpo se movendo em bloco, sem “se puxar” pelo pescoço.',
            'use as mãos para ajudar; nada de esforço no pescoço.',
          ),
          mov(
            'Subir para sentada e para de pé',
            'De lado, apoie as mãos no chão e empurre para sentar. Depois leve um pé à frente e use as mãos nas coxas para subir devagar até em pé.',
            'Expire nos momentos de esforço (empurrar, subir).',
            '3 subidas conscientes.',
            'as pernas trabalhando, o movimento organizado do chão ao pé.',
            'apoie-se numa cadeira firme se precisar; sem pressa.',
          ),
          fecho('Em pé, sinta os pés no chão e a coluna longa. Você acabou de transformar um gesto automático em prática.'),
          dica('A forma como você levanta do chão ou da cama diz muito. Fazer devagar poupa a lombar todos os dias.'),
        ],
      },
    },
    {
      titulo: 'Dia 16',
      aula: {
        titulo: 'Coluna que desenrola',
        duracao: 20,
        intro:
          'O roll down: descer a coluna vértebra por vértebra e voltar. Um dos movimentos mais gostosos para soltar as costas em pé.',
        blocos: [
          prep('Em pé, pés na largura do quadril, joelhos leeeves (nunca travados). Braços soltos.'),
          mov(
            'Desenrolar para baixo',
            'Deixe o queixo cair em direção ao peito e vá descendo a coluna aos poucos, como se desenrolasse osso por osso, o tronco pendendo para frente. Desça só até onde é confortável, joelhos macios.',
            'Solte o ar durante toda a descida.',
            '4 vezes.',
            'as costas se abrindo e a cabeça pesada pendurando.',
            'não force as mãos ao chão; a amplitude é sua. Tontura ao voltar? Suba mais devagar.',
          ),
          mov(
            'Enrolar para cima',
            'Para voltar, comece pela base da coluna, empilhando vértebra por vértebra, e deixe a cabeça ser a última a subir.',
            'Inspire subindo, lentamente.',
            'a cada roll down, siga direto para o roll up.',
            'a coluna se “empilhando” e o corpo ficando alto de novo.',
            'se ficar tonta, pause a meio caminho e respire.',
          ),
          fecho('Em pé, olhos fechados, sinta a coluna longa e as costas soltas. Perceba a respiração mais tranquila.'),
          dica('Joelhos “moles” aqui não são preguiça — são proteção. Travar os joelhos joga toda a carga na lombar.'),
        ],
      },
    },
    {
      titulo: 'Dia 17',
      aula: {
        titulo: 'Braços que respiram',
        duracao: 20,
        intro:
          'Um fluxo suave de braços em pé, guiado pela respiração. Abre o peito, solta os ombros e acalma a mente.',
        blocos: [
          prep('Em pé, pés na largura do quadril, joelhos macios, braços ao lado do corpo.'),
          mov(
            'Braços que sobem com o ar',
            'Ao inspirar, suba os braços pelos lados até acima da cabeça (ou até onde é confortável). Ao soltar, desça-os pela frente, devagar.',
            'Inspire subindo, expire descendo.',
            '6 vezes.',
            'o ar “levantando” os braços e o peito abrindo no alto.',
            'se os ombros subirem demais ou o pescoço tensionar, suba menos.',
          ),
          mov(
            'Colher água',
            'Incline levemente o tronco à frente (joelhos macios) e faça o gesto de “colher água” com as mãos, trazendo-as para o peito ao subir o tronco, como se oferecesse algo a si mesma.',
            'Inspire ao recolher, expire ao soltar as mãos para baixo.',
            '5 vezes, num fluxo contínuo.',
            'o movimento inteiro conectado — pernas, tronco, braços, respiração.',
            'mantenha os joelhos macios e a lombar longa.',
          ),
          fecho('Pare em pé, braços ao lado do corpo, e sinta o efeito: peito aberto, ombros baixos, respiração ampla.'),
          dica('Quando a respiração conduz o movimento, o exercício vira quase uma meditação em pé. Repare como a cabeça esvazia.'),
        ],
      },
    },
    {
      titulo: 'Dia 18',
      aula: {
        titulo: 'Equilíbrio calmo (prática leve)',
        duracao: 18,
        intro:
          'Dia mais tranquilo para brincar com o peso do corpo e o equilíbrio — sem desafio, só percepção. Suave, e conta como constância.',
        blocos: [
          prep('Em pé, perto de uma parede ou cadeira para apoio, pés na largura do quadril.'),
          mov(
            'Transferir o peso',
            'Passe o peso lentamente para o pé direito, sentindo-o afundar no chão; depois para o esquerdo. Como um pêndulo devagar.',
            'Respiração natural e contínua.',
            '8 transferências.',
            'os pés “lendo” o chão e o corpo se organizando sozinho.',
            'mantenha a mão perto do apoio; segure se precisar.',
          ),
          mov(
            'Nas pontas, devagar',
            'Suba levemente nas pontas dos pés e desça bem devagar, controlando a descida. Use o apoio à vontade.',
            'Inspire subindo, expire descendo lentamente.',
            '5 vezes.',
            'as panturrilhas trabalhando e os tornozelos ganhando firmeza.',
            'se o equilíbrio oscilar, mantenha a mão no apoio o tempo todo.',
          ),
          fecho('Fique um instante com os pés inteiros no chão, sentindo-se firme e presente.'),
          dica('Equilíbrio não é dom, é prática. Cada vez que você o treina com calma, o corpo fica mais seguro no dia a dia.'),
        ],
      },
    },
    {
      titulo: 'Dia 19',
      aula: {
        titulo: 'Quadril em pé',
        duracao: 20,
        intro:
          'Levamos a soltura do quadril para a posição em pé, com círculos lentos e um agachamento suave e apoiado.',
        blocos: [
          prep('Em pé, pés um pouco mais afastados que o quadril, joelhos macios. Mãos na cintura ou perto de um apoio.'),
          mov(
            'Círculos de quadril',
            'Desenhe círculos lentos com o quadril, como se movesse um bambolê imaginário devagar. Faça num sentido e depois no outro.',
            'Respiração livre e contínua.',
            '5 círculos para cada lado.',
            'o quadril se soltando e a lombar acompanhando com leveza.',
            'círculos pequenos; nada de forçar a lombar.',
          ),
          mov(
            'Agachamento apoiado',
            'De frente para uma cadeira ou bancada, segure levemente para apoio. Dobre os joelhos e leve o quadril para trás e para baixo, só até a metade do caminho, e volte.',
            'Inspire ao descer, expire ao subir.',
            '6 vezes suaves.',
            'as coxas e o quadril trabalhando, os joelhos alinhados com os pés.',
            'desça só até onde é confortável; joelho nunca deve doer.',
          ),
          fecho('Fique em pé, solte os braços e sinta a base do corpo mais acordada e firme.'),
          dica('Sentar e levantar da cadeira o dia todo já é um agachamento. Fazer com consciência algumas vezes melhora o gesto inteiro.'),
        ],
      },
    },
    {
      titulo: 'Dia 20',
      aula: {
        titulo: 'Coluna em espiral',
        duracao: 20,
        intro:
          'Rotações suaves em pé que integram coluna, ombros e quadril. A espiral é um movimento muito natural e libertador.',
        blocos: [
          prep('Em pé, pés na largura do quadril, joelhos macios, braços soltos.'),
          mov(
            'Girar como um pião lento',
            'Deixe os braços soltos e gire o tronco suavemente de um lado ao outro, permitindo que os braços “batam” de leve no corpo. Os calcanhares podem se soltar do chão levemente.',
            'Respiração livre, solta.',
            '10 giros suaves, alternando os lados.',
            'a coluna torcendo com leveza e os ombros balançando soltos.',
            'sem forçar a torção no final; deixe a inércia levar.',
          ),
          mov(
            'Espiral consciente',
            'Agora mais devagar: ao inspirar volte ao centro; ao soltar, gire para um lado levando o olhar por cima do ombro. Alterne.',
            'Expire girando, inspire ao centro.',
            '4 para cada lado.',
            'a diferença entre a torção solta (antes) e a torção consciente (agora).',
            'pare se sentir tontura; retome quando passar.',
          ),
          fecho('Volte ao centro, respire fundo e sinta a coluna mais móvel dos quadris aos ombros.'),
          dica('A coluna gira melhor quando o pescoço não “puxa” o movimento. Deixe o olhar acompanhar, não liderar.'),
        ],
      },
    },
    {
      titulo: 'Dia 21',
      aula: {
        titulo: 'Fluir devagar (prática leve)',
        duracao: 18,
        intro:
          'Uma mini-sequência restaurativa juntando o que a semana trouxe: desenrolar, braços e respiração. Leve, fluida, gostosa.',
        blocos: [
          prep('Em pé, com espaço, joelhos macios.'),
          mov(
            'Sequência do fim de semana',
            'Encadeie devagar: braços sobem com a inspiração → desenrole a coluna para baixo soltando o ar → pause pendurada por uma respiração → enrole de volta para cima → braços descem pela frente.',
            'Deixe a respiração marcar o ritmo de cada parte.',
            '4 rodadas lentas, cada uma mais fluida.',
            'as partes se conectando num único movimento contínuo.',
            'sem pressa entre as fases; se tontear ao subir, suba mais devagar.',
          ),
          fecho('Fique em pé, olhos fechados, e sinta o corpo inteiro reunido e calmo. Três semanas — você está mais presente no próprio corpo.'),
          dica('Uma sequência só sua já está nascendo. Na próxima semana você vai montar a que mais combina com seus dias.'),
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
  titulo: 'Semana 4 — Prática consolidada',
  dias: [
    {
      titulo: 'Dia 22',
      aula: {
        titulo: 'Sua sequência da manhã',
        duracao: 22,
        intro:
          'Uma sequência completa para começar o dia acordando o corpo com gentileza. Guarde esta — ela pode virar sua rotina matinal.',
        blocos: [
          prep('Comece deitada na cama ou no tapete, ao acordar. Depois vamos para sentada e em pé. Tenha um apoio por perto.'),
          mov(
            'Acordar deitada',
            'Espreguice o corpo inteiro (pandiculação): estique braços e pernas em direções opostas, sustente e solte. Depois faça 6 balanços de pelve.',
            'Inspire ao esticar, solte ao relaxar.',
            '2 espreguiçadas + 6 balanços.',
            'o corpo saindo do modo “dormindo” com prazer.',
            'movimentos generosos, mas sem cãibra; se vier, relaxe.',
          ),
          mov(
            'Sentar e abrir',
            'Role para o lado, sente-se. Faça 6 “leques” de braços (Dia 6) abrindo o peito e 4 rotações de cabeça (Dia 5).',
            'Respiração conduzindo cada abertura.',
            'como descrito.',
            'o tronco e o pescoço se soltando da rigidez matinal.',
            'devagar — de manhã o corpo está mais “curto”.',
          ),
          mov(
            'Levantar e crescer',
            'Suba para em pé com consciência (Dia 15). Faça 4 subidas de braços com a respiração e termine com um roll down suave.',
            'Inspire subindo os braços, expire desenrolando.',
            'como descrito.',
            'o corpo desperto, aberto e pronto para o dia.',
            'joelhos macios no roll down; suba sem pressa.',
          ),
          fecho('Em pé, três respirações longas. Repare como é diferente começar o dia assim.'),
          dica('Fazer isso antes de pegar o celular muda o tom do dia inteiro. Experimente por alguns dias e sinta.'),
        ],
      },
    },
    {
      titulo: 'Dia 23',
      aula: {
        titulo: 'Soltar o dia',
        duracao: 22,
        intro:
          'Sequência para o fim do dia: descarregar a tensão acumulada no pescoço, ombros e lombar antes de descansar.',
        blocos: [
          prep('Comece sentada numa cadeira; depois vamos ao chão. Luz baixa ajuda a desacelerar.'),
          mov(
            'Descarregar de cima',
            'Sentada: 4 espreguiçadas de ombros (Dia 8), a meia-lua do queixo (Dia 9) e o auto-abraço (Dia 6).',
            'Expirações longas em cada soltura.',
            'como descrito.',
            'o peso do dia saindo dos ombros e do pescoço.',
            'nada de forçar; hoje é para soltar, não conquistar.',
          ),
          mov(
            'Soltar a lombar',
            'No chão: gato e vaca (Dia 10), abraço de joelhos (Dia 13) e torção suave (Dia 14).',
            'Respiração para dentro das costas.',
            'como descrito.',
            'a lombar e o quadril se abrindo e descansando.',
            'se algo incomodar, pule aquele movimento e siga.',
          ),
          fecho('Termine deitada, pernas estendidas, por um minuto. Corpo mais leve para dormir.'),
          dica('Levar tensão para a cama atrapalha o sono. Cinco minutos de soltura à noite valem por horas de rolar na cama.'),
        ],
      },
    },
    {
      titulo: 'Dia 24',
      aula: {
        titulo: 'Corpo inteiro',
        duracao: 25,
        intro:
          'A sequência mais completa do protocolo, integrando as quatro semanas. Reserve um tempinho a mais e aproveite cada parte.',
        blocos: [
          prep('Espaço livre, tapete, e um apoio por perto. Comece em pé.'),
          mov(
            'Aquecer e desenrolar',
            'Em pé: braços que respiram (Dia 17), espiral consciente (Dia 20) e roll down/roll up (Dia 16).',
            'Respiração marcando cada fase.',
            '2 rodadas de cada.',
            'o corpo aquecendo e a coluna ganhando fluidez.',
            'joelhos macios; suba devagar dos roll downs.',
          ),
          mov(
            'Base firme',
            'Círculos de quadril (Dia 19) e agachamento apoiado (Dia 19), depois transferência de peso (Dia 18).',
            'Inspire descendo, expire subindo.',
            'como descrito.',
            'a base do corpo acordada e firme.',
            'amplitude confortável nos joelhos.',
          ),
          mov(
            'Voltar ao chão e fechar',
            'Vá ao chão: gato e vaca, joelhos que balançam (Dia 12) e torção suave. Termine deitada, respirando.',
            'Expiração sempre mais longa.',
            'como descrito.',
            'o corpo inteiro reunido, solto e presente.',
            'respeite os limites do dia; nem todo dia é igual.',
          ),
          fecho('Fique deitada em silêncio por um minuto ao final. Sinta o quanto você já consegue.'),
          dica('Repare: movimentos que no Dia 1 pareciam estranhos agora são familiares. Isso é o corpo reaprendendo a se mover.'),
        ],
      },
    },
    {
      titulo: 'Dia 25',
      aula: {
        titulo: 'Recuperar (prática leve)',
        duracao: 20,
        intro:
          'Depois de uma sequência intensa, um dia de recuperação com pernas apoiadas e respiração longa. Cuidar de descansar também é praticar.',
        blocos: [
          prep('Deitada com as pernas apoiadas numa cadeira ou parede (Dia 11). Cobertor se quiser.'),
          mov(
            'Descanso ativo',
            'Pernas apoiadas, faça a varredura do corpo (Dia 4), soltando região por região. Depois só respire.',
            'Expiração bem longa, como um suspiro.',
            '5 a 6 minutos.',
            'o sistema inteiro desacelerando.',
            'saia da posição se formigar demais.',
          ),
          fecho('Role para o lado, descanse e levante-se sem pressa. Recuperada e pronta para os últimos dias.'),
          dica('Progresso não acontece só no esforço — acontece no descanso, quando o corpo assimila o que aprendeu.'),
        ],
      },
    },
    {
      titulo: 'Dia 26',
      aula: {
        titulo: 'Respiração e movimento',
        duracao: 22,
        intro:
          'Hoje a estrela é a respiração conduzindo tudo. Uma prática fluida em que cada movimento nasce de um ciclo respiratório.',
        blocos: [
          prep('Em pé, com espaço. Comece só observando a respiração por 3 ciclos.'),
          mov(
            'Movimento nascido do ar',
            'Deixe cada inspiração “abrir” um movimento (subir braços, crescer, abrir peito) e cada expiração “soltar” (descer, arredondar, girar). Não conte movimentos — deixe a respiração escolher.',
            'A respiração comanda; o corpo obedece devagar.',
            '5 a 7 minutos de fluxo livre.',
            'o corpo se movendo sozinho, guiado pelo ar, sem “decidir”.',
            'se a respiração acelerar ou faltar ar, pare e normalize.',
          ),
          mov(
            'Aquietar',
            'Aos poucos, deixe os movimentos ficarem menores até parar em pé, quieta, só respirando.',
            'Respiração natural, longa.',
            '1 minuto.',
            'a calma que fica depois do movimento consciente.',
            'nenhum — é o pouso.',
          ),
          fecho('Abra os olhos devagar. Repare como corpo e respiração estão do mesmo lado agora.'),
          dica('Essa conexão respiração-movimento é o coração do somático. Quando ela acontece, o “exercício” some e vira presença.'),
        ],
      },
    },
    {
      titulo: 'Dia 27',
      aula: {
        titulo: 'Minha prática',
        duracao: 22,
        intro:
          'Hoje você monta a sua própria sequência. Já tem repertório para isso — vamos te guiar a escolher o que o seu corpo mais pede.',
        blocos: [
          prep('Espaço livre. Pense: qual região sua mais pede cuidado hoje? Pescoço/ombros? Lombar/quadril? Ou o corpo todo?'),
          mov(
            'Escolha um começo',
            'Comece por um movimento de percepção e respiração (Dia 1, 2 ou 4). Dê-se 2 a 3 minutos só para chegar.',
            'Respiração tranquila.',
            '2 a 3 minutos.',
            'a diferença entre “começar acelerada” e “começar chegando”.',
            'sem pular a chegada; ela prepara o resto.',
          ),
          mov(
            'Escolha o miolo',
            'Escolha 2 ou 3 movimentos das semanas 2 e 3 para a região que pediu atenção. Faça cada um com calma.',
            'Respiração conduzindo.',
            '10 a 12 minutos.',
            'o corpo respondendo ao que VOCÊ escolheu — isso é autonomia.',
            'se algum movimento não cair bem hoje, troque por outro.',
          ),
          mov(
            'Escolha um fim',
            'Termine com algo restaurativo (pernas apoiadas, torção suave ou abraço de joelhos) e respiração longa.',
            'Expiração longa.',
            '3 a 4 minutos.',
            'o fechamento que deixa o corpo em paz.',
            'nenhum.',
          ),
          fecho('Você acabou de conduzir a própria prática. Esse é o objetivo dos 28 dias: você no comando do seu corpo.'),
          dica('Guarde mentalmente (ou anote) a sequência que mais te fez bem hoje. Ela é o começo da sua prática para a vida.'),
        ],
      },
    },
    {
      titulo: 'Dia 28',
      aula: {
        titulo: 'Seguindo em frente',
        duracao: 25,
        intro:
          'Último dia! Uma sequência completa de celebração e um mapa para você continuar depois. O protocolo termina, a prática fica.',
        blocos: [
          prep('Espaço livre, tapete e um apoio. Comece em pé, com uma respiração de gratidão pelo caminho até aqui.'),
          mov(
            'A sequência da jornada',
            'Encadeie com calma: braços que respiram → espiral → roll down/up → círculos de quadril → ao chão para gato e vaca → torção suave → deitada para fechar.',
            'Respiração guiando tudo, sem pressa.',
            'uma passagem inteira, saboreada.',
            'o corpo que você conheceu ao longo de 28 dias, mais solto e presente.',
            'respeite o dia; celebrar não é forçar.',
          ),
          {
            tipo: 'texto',
            titulo: 'Como continuar depois dos 28 dias',
            conteudo:
              'Não precisa de fórmula: 10 a 20 minutos, 3 a 5 vezes por semana, já sustentam tudo o que você ganhou. Nos dias corridos, faça só a chegada e a respiração — vale. Volte a qualquer aula quando quiser; elas continuam aqui. E, principalmente: siga escutando o corpo. Ele agradece todos os dias.',
          },
          fecho('Deite por um minuto ao final e reconheça: você apareceu 28 dias por você. Isso muda a relação com o próprio corpo — e ninguém tira de você.'),
          dica('O maior resultado não é físico: é saber que você é capaz de cuidar de si, um movimento de cada vez. Parabéns. 🤍'),
        ],
      },
    },
  ],
}

export const RITUAL_SEMANAS: Semana[] = [semana1, semana2, semana3, semana4]

// Sanidade: garante 28 aulas.
export const TOTAL_AULAS = RITUAL_SEMANAS.reduce((n, s) => n + s.dias.length, 0)

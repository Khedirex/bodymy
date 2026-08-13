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
export const BLOCOS_INSTRUCAO = ['Preparação', 'Movimento', 'Respiração', 'O que sentir', 'Atenção'] as const

// Monta o texto da variação v1 em linhas rotuladas (a UI faz o parse).
export function instrucoesV1(e: ExercicioConteudo): string {
  return [
    `Preparação: ${e.preparacao}`,
    `Movimento: ${e.movimento}`,
    `Respiração: ${e.respiracao}`,
    `O que sentir: ${e.sentir}`,
    `Atenção: ${e.atencao}`,
  ].join('\n')
}

const DIA_TEMA: Record<number, string> = {
  1: 'Dia 1 — Respirar e assentar',
  2: 'Dia 2 — Soltar o alto do corpo',
  3: 'Dia 3 — Abrir os quadris',
  4: 'Dia 4 — Coluna viva',
  5: 'Dia 5 — Centro sem esforço',
  6: 'Dia 6 — Pernas e apoio',
  7: 'Dia 7 — Corpo inteiro, devagar',
}
export const temaDoDia = (dia: number) => DIA_TEMA[dia] ?? `Dia ${dia}`

export const EXERCICIOS: ExercicioConteudo[] = [
  // ----- DIA 1 — Respirar e assentar -----
  {
    dia: 1, ordem: 1, nome: 'Respiração de três tempos', descricao: DIA_TEMA[1],
    preparacao: 'Deitada de costas, joelhos dobrados, pés apoiados no chão. Uma mão sobre o ventre, outra sobre o peito.',
    movimento: 'Deixe o ar entrar primeiro enchendo o ventre, depois as costelas, por último o peito. Solte na ordem inversa, sem pressa.',
    respiracao: 'Inspire em 4 tempos, solte em 6. Sem prender o ar em nenhum momento.',
    sentir: 'A mão do ventre subindo antes da mão do peito. É comum que, no começo, aconteça o contrário — tudo bem.',
    atencao: 'Se sentir tontura, volte a respirar normalmente por alguns instantes.',
  },
  {
    dia: 1, ordem: 2, nome: 'Balanço da pelve', descricao: DIA_TEMA[1],
    preparacao: 'Deitada de costas, joelhos dobrados, pés apoiados na largura do quadril.',
    movimento: 'Incline a pelve levemente para trás, colando a lombar no chão. Depois volte devagar, deixando um pequeno espaço embaixo da lombar. Movimento pequeno, quase invisível de fora.',
    respiracao: 'Solte o ar ao colar a lombar, inspire ao voltar.',
    sentir: 'A lombar tocando e descolando do chão. O movimento nasce da pelve, não das pernas.',
    atencao: 'Não force a lombar contra o chão. É um balanço suave, não uma pressão.',
  },
  {
    dia: 1, ordem: 3, nome: 'Joelhos que se abraçam', descricao: DIA_TEMA[1],
    preparacao: 'Deitada de costas. Traga um joelho de cada vez em direção ao peito e envolva-os com as mãos ou os braços.',
    movimento: 'Puxe os joelhos suavemente em direção ao peito, sustente por três respirações e solte um pouco. Repita.',
    respiracao: 'Solte o ar ao aproximar os joelhos, inspire ao afrouxar.',
    sentir: 'Um alongamento agradável na lombar e nos glúteos.',
    atencao: 'Se o pescoço tensionar, apoie a cabeça em uma almofada baixa.',
  },
  {
    dia: 1, ordem: 4, nome: 'Pés que empurram', descricao: DIA_TEMA[1],
    preparacao: 'Deitada de costas, joelhos dobrados, pés bem apoiados no chão.',
    movimento: 'Pressione os pés contra o chão como se fosse empurrar o chão para longe, sem levantar o quadril. Sustente dois segundos e solte completamente.',
    respiracao: 'Solte o ar ao pressionar, inspire ao relaxar.',
    sentir: 'Ativação atrás das coxas e nos glúteos, sem esforço na lombar.',
    atencao: 'O quadril permanece no chão. Se ele subir, reduza a força.',
  },
  {
    dia: 1, ordem: 5, nome: 'Descanso da lombar', descricao: DIA_TEMA[1],
    preparacao: 'Deitada de costas, panturrilhas apoiadas sobre o assento de uma cadeira ou sofá, joelhos em ângulo reto.',
    movimento: 'Nenhum. Apenas permaneça na posição, deixando o peso do corpo afundar.',
    respiracao: 'Livre e natural. Observe o ar entrando e saindo.',
    sentir: 'A lombar se soltando aos poucos. É comum sentir o corpo “afundar” após o primeiro minuto.',
    atencao: 'Permaneça de 2 a 3 minutos. Se sentir formigamento nas pernas, baixe-as e recomece.',
  },
  // ----- DIA 2 — Soltar o alto do corpo -----
  {
    dia: 2, ordem: 1, nome: 'Ombros que derretem', descricao: DIA_TEMA[2],
    preparacao: 'Sentada em uma cadeira, pés apoiados no chão, coluna apoiada no encosto.',
    movimento: 'Suba os ombros em direção às orelhas lentamente, sustente por três segundos, e deixe cair de uma vez, como se soltasse um peso.',
    respiracao: 'Inspire ao subir, solte o ar ao deixar cair.',
    sentir: 'O contraste entre a tensão e o relaxamento. É essa diferença que ensina o corpo a soltar.',
    atencao: 'A queda é passiva, não empurre os ombros para baixo.',
  },
  {
    dia: 2, ordem: 2, nome: 'Cabeça que rola', descricao: DIA_TEMA[2],
    preparacao: 'Sentada, coluna apoiada, ombros relaxados.',
    movimento: 'Leve o queixo em direção ao peito e role a cabeça devagar para um lado, depois volte ao centro e vá para o outro. Meio círculo apenas, nunca para trás.',
    respiracao: 'Livre, sem prender.',
    sentir: 'Alongamento nas laterais do pescoço. Pode haver leves estalos — é normal.',
    atencao: 'Nunca leve a cabeça para trás. Se sentir tontura, pare e volte ao centro.',
  },
  {
    dia: 2, ordem: 3, nome: 'Braços de asa', descricao: DIA_TEMA[2],
    preparacao: 'Sentada, braços dobrados na altura do peito, cotovelos na altura dos ombros.',
    movimento: 'Abra os cotovelos para os lados, aproximando as escápulas, e volte à frente. Movimento horizontal e lento.',
    respiracao: 'Inspire ao abrir, solte o ar ao fechar.',
    sentir: 'As escápulas se aproximando nas costas ao abrir.',
    atencao: 'Os ombros permanecem baixos. Se subirem em direção às orelhas, reduza a amplitude.',
  },
  {
    dia: 2, ordem: 4, nome: 'Peito que abre', descricao: DIA_TEMA[2],
    preparacao: 'Sentada na beira da cadeira, mãos apoiadas atrás do quadril, dedos apontando para trás.',
    movimento: 'Deslize as mãos um pouco mais para trás, abrindo o peito, e sustente por três respirações. Volte e repita.',
    respiracao: 'Inspire profundamente na abertura, sentindo o peito expandir.',
    sentir: 'Abertura na frente do peito e dos ombros.',
    atencao: 'Mantenha o pescoço longo. Não jogue a cabeça para trás.',
  },
  {
    dia: 2, ordem: 5, nome: 'Nuca longa', descricao: DIA_TEMA[2],
    preparacao: 'Sentada, coluna apoiada, mãos sobre as coxas.',
    movimento: 'Leve o queixo em direção ao peito devagar, alongando a nuca. Sustente e volte lentamente. Depois incline a cabeça para cada lado, orelha em direção ao ombro.',
    respiracao: 'Solte o ar ao inclinar, inspire ao voltar ao centro.',
    sentir: 'Alongamento na nuca e nas laterais do pescoço.',
    atencao: 'Não use as mãos para puxar a cabeça. Deixe o peso dela fazer o trabalho.',
  },
  // ----- DIA 3 — Abrir os quadris -----
  {
    dia: 3, ordem: 1, nome: 'Quadril que balança', descricao: DIA_TEMA[3],
    preparacao: 'Deitada de costas, joelhos dobrados, pés apoiados.',
    movimento: 'Deslize o quadril suavemente para um lado e para o outro, como um balanço lento. Movimento pequeno.',
    respiracao: 'Livre, acompanhando o ritmo do balanço.',
    sentir: 'Soltura na região do quadril e da lombar.',
    atencao: 'Os ombros permanecem apoiados. O movimento é só do quadril para baixo.',
  },
  {
    dia: 3, ordem: 2, nome: 'Joelho que abre', descricao: DIA_TEMA[3],
    preparacao: 'Deitada de costas, joelhos dobrados, pés apoiados.',
    movimento: 'Deixe um joelho abrir para o lado, em direção ao chão, mantendo o pé apoiado. Vá até onde for confortável e volte. Alterne os lados.',
    respiracao: 'Solte o ar ao abrir, inspire ao voltar.',
    sentir: 'Abertura na virilha e na parte interna da coxa.',
    atencao: 'O quadril do lado oposto permanece apoiado. Não force o joelho até o chão.',
  },
  {
    dia: 3, ordem: 3, nome: 'Borboleta deitada', descricao: DIA_TEMA[3],
    preparacao: 'Deitada de costas, plantas dos pés unidas, joelhos abertos para os lados.',
    movimento: 'Permaneça na posição deixando o peso das pernas abrir os joelhos naturalmente. Se preferir, apoie almofadas embaixo dos joelhos.',
    respiracao: 'Livre e profunda. A cada expiração, imagine os quadris soltando um pouco mais.',
    sentir: 'Alongamento na parte interna das coxas.',
    atencao: 'Nunca empurre os joelhos para baixo com as mãos. Permaneça de 1 a 2 minutos.',
  },
  {
    dia: 3, ordem: 4, nome: 'Perna que desliza', descricao: DIA_TEMA[3],
    preparacao: 'Deitada de costas, joelhos dobrados, pés apoiados.',
    movimento: 'Deslize um calcanhar pelo chão, estendendo a perna até onde conseguir manter a lombar tranquila. Volte deslizando. Alterne.',
    respiracao: 'Solte o ar ao estender, inspire ao recolher.',
    sentir: 'O trabalho suave na frente da coxa e no centro do corpo ao controlar o movimento.',
    atencao: 'Se a lombar arquear muito, estenda menos a perna.',
  },
  {
    dia: 3, ordem: 5, nome: 'Figura quatro', descricao: DIA_TEMA[3],
    preparacao: 'Deitada de costas, joelhos dobrados. Cruze o tornozelo direito sobre a coxa esquerda, formando um “quatro”.',
    movimento: 'Permaneça na posição. Se quiser mais intensidade, aproxime a coxa de apoio do peito com as mãos.',
    respiracao: 'Livre. Três a cinco respirações de cada lado.',
    sentir: 'Alongamento no glúteo da perna cruzada.',
    atencao: 'Se sentir desconforto no joelho, reduza ou saia da posição.',
  },
  // ----- DIA 4 — Coluna viva -----
  {
    dia: 4, ordem: 1, nome: 'Gato e vaca no chão', descricao: DIA_TEMA[4],
    preparacao: 'Em quatro apoios, mãos sob os ombros, joelhos sob o quadril. Se os joelhos incomodarem, use uma toalha dobrada.',
    movimento: 'Arredonde as costas levando o olhar ao umbigo, depois inverta, deixando a barriga descer e o olhar subir levemente. Alterne lentamente.',
    respiracao: 'Solte o ar ao arredondar, inspire ao abrir.',
    sentir: 'A coluna se movendo por inteiro, vértebra por vértebra.',
    atencao: 'Amplitude confortável. Se o punho incomodar, apoie os antebraços.',
  },
  {
    dia: 4, ordem: 2, nome: 'Coluna que desenrola', descricao: DIA_TEMA[4],
    preparacao: 'Sentada na beira da cadeira, pés apoiados, mãos sobre as coxas.',
    movimento: 'Enrole a coluna para frente devagar, começando pela cabeça, deixando as mãos deslizarem pelas coxas. Volte desenrolando de baixo para cima.',
    respiracao: 'Solte o ar ao descer, inspire ao subir.',
    sentir: 'Cada parte da coluna se dobrando e voltando em sequência.',
    atencao: 'Desça só até onde for confortável. Não precisa alcançar os pés.',
  },
  {
    dia: 4, ordem: 3, nome: 'Torção do relógio', descricao: DIA_TEMA[4],
    preparacao: 'Deitada de costas, joelhos dobrados e unidos, braços abertos em cruz.',
    movimento: 'Deixe os joelhos caírem devagar para um lado, mantendo os ombros apoiados. Volte ao centro e vá para o outro lado.',
    respiracao: 'Solte o ar ao girar, inspire ao voltar.',
    sentir: 'Rotação suave na coluna e alongamento na lateral do tronco.',
    atencao: 'Se um ombro levantar do chão, reduza a amplitude da torção.',
  },
  {
    dia: 4, ordem: 4, nome: 'Ondulação da coluna', descricao: DIA_TEMA[4],
    preparacao: 'Em quatro apoios, mãos sob os ombros.',
    movimento: 'Faça um movimento contínuo e ondulatório, como uma onda que percorre a coluna do cóccix até a cabeça, e volta.',
    respiracao: 'Livre, acompanhando o ritmo da onda.',
    sentir: 'O movimento passando por regiões da coluna que costumam ficar paradas.',
    atencao: 'É um movimento fluido, sem paradas. Se ficar confuso, volte ao gato e vaca.',
  },
  {
    dia: 4, ordem: 5, nome: 'Alongamento em C', descricao: DIA_TEMA[4],
    preparacao: 'Sentada, uma mão apoiada no assento ao lado do quadril.',
    movimento: 'Leve o outro braço por cima da cabeça, inclinando o tronco para o lado e formando um arco. Sustente e volte. Alterne.',
    respiracao: 'Inspire ao subir o braço, solte o ar na inclinação.',
    sentir: 'Alongamento em toda a lateral do tronco, das costelas ao quadril.',
    atencao: 'Mantenha os dois glúteos apoiados no assento.',
  },
  // ----- DIA 5 — Centro sem esforço -----
  {
    dia: 5, ordem: 1, nome: 'Barriga que respira', descricao: DIA_TEMA[5],
    preparacao: 'Deitada de costas, joelhos dobrados, mãos sobre a barriga.',
    movimento: 'Ao soltar o ar, leve o umbigo suavemente em direção à coluna, como se fechasse um cinto por dentro. Solte ao inspirar.',
    respiracao: 'A ativação acontece na expiração. Nunca prenda o ar.',
    sentir: 'Uma ativação profunda e sutil no fundo da barriga — não é contrair com força.',
    atencao: 'Se a barriga endurecer por fora ou o ar ficar preso, está forçando demais.',
  },
  {
    dia: 5, ordem: 2, nome: 'Perna que cai e volta', descricao: DIA_TEMA[5],
    preparacao: 'Deitada de costas, joelhos dobrados, pés apoiados, mãos ao lado do corpo.',
    movimento: 'Ative suavemente a barriga e deixe um joelho abrir para o lado, mantendo o quadril estável. Volte com controle. Alterne.',
    respiracao: 'Solte o ar ao abrir, inspire ao voltar.',
    sentir: 'O centro do corpo trabalhando para impedir que o quadril gire junto.',
    atencao: 'Se o quadril oposto levantar, reduza a amplitude.',
  },
  {
    dia: 5, ordem: 3, nome: 'Cabeça que levanta devagar', descricao: DIA_TEMA[5],
    preparacao: 'Deitada de costas, joelhos dobrados, mãos atrás da cabeça apenas como apoio.',
    movimento: 'Solte o ar, leve o queixo levemente em direção ao peito e eleve a cabeça poucos centímetros. Volte devagar.',
    respiracao: 'Solte o ar ao subir, inspire ao descer.',
    sentir: 'Ativação na barriga, não no pescoço.',
    atencao: 'As mãos apoiam, não puxam. Se o pescoço doer, pare.',
  },
  {
    dia: 5, ordem: 4, nome: 'Ponte suave', descricao: DIA_TEMA[5],
    preparacao: 'Deitada de costas, joelhos dobrados, pés apoiados na largura do quadril.',
    movimento: 'Eleve o quadril alguns centímetros do chão e desça devagar, apoiando vértebra por vértebra.',
    respiracao: 'Solte o ar ao subir, inspire ao descer.',
    sentir: 'Ativação nos glúteos e atrás das coxas.',
    atencao: 'Não suba além do confortável. Se a lombar reclamar, eleve menos.',
  },
  {
    dia: 5, ordem: 5, nome: 'Prancha apoiada', descricao: DIA_TEMA[5],
    preparacao: 'Em pé, de frente para uma parede, mãos apoiadas na altura dos ombros, pés a um passo de distância.',
    movimento: 'Mantenha o corpo em linha reta da cabeça aos pés, barriga levemente ativa. Sustente por 15 a 20 segundos.',
    respiracao: 'Contínua e tranquila. Não prenda o ar.',
    sentir: 'Ativação suave em todo o centro do corpo.',
    atencao: 'Se a lombar afundar, aproxime os pés da parede.',
  },
  // ----- DIA 6 — Pernas e apoio -----
  {
    dia: 6, ordem: 1, nome: 'Agachamento na cadeira', descricao: DIA_TEMA[6],
    preparacao: 'Em pé, de costas para uma cadeira, pés na largura do quadril.',
    movimento: 'Desça sentando na cadeira com controle, apoiando as mãos nos joelhos se precisar. Levante usando a força das pernas.',
    respiracao: 'Inspire ao descer, solte o ar ao subir.',
    sentir: 'Trabalho na frente das coxas e nos glúteos.',
    atencao: 'Os joelhos apontam na mesma direção dos pés. Desça devagar, sem se jogar.',
  },
  {
    dia: 6, ordem: 2, nome: 'Panturrilha que sobe', descricao: DIA_TEMA[6],
    preparacao: 'Em pé, mãos apoiadas no encosto de uma cadeira ou na parede.',
    movimento: 'Suba os calcanhares, ficando na ponta dos pés, sustente um segundo e desça devagar.',
    respiracao: 'Solte o ar ao subir, inspire ao descer.',
    sentir: 'Trabalho nas panturrilhas e ativação nos pés.',
    atencao: 'A descida é lenta — é nela que está o trabalho.',
  },
  {
    dia: 6, ordem: 3, nome: 'Perna que abre em pé', descricao: DIA_TEMA[6],
    preparacao: 'Em pé, uma mão apoiada na parede ou cadeira.',
    movimento: 'Abra uma perna para o lado até onde conseguir manter o tronco reto, e volte com controle. Alterne.',
    respiracao: 'Solte o ar ao abrir, inspire ao voltar.',
    sentir: 'Trabalho na lateral do quadril.',
    atencao: 'O tronco permanece ereto. Não incline para o lado oposto.',
  },
  {
    dia: 6, ordem: 4, nome: 'Passo que atrasa', descricao: DIA_TEMA[6],
    preparacao: 'Em pé, mão apoiada em uma cadeira, pés na largura do quadril.',
    movimento: 'Dê um passo para trás com uma perna, transferindo pouco peso, e volte ao centro. Alterne.',
    respiracao: 'Inspire ao dar o passo, solte o ar ao voltar.',
    sentir: 'Equilíbrio e trabalho na perna de apoio.',
    atencao: 'Passo curto no começo. Aumente conforme a segurança.',
  },
  {
    dia: 6, ordem: 5, nome: 'Equilíbrio de um pé', descricao: DIA_TEMA[6],
    preparacao: 'Em pé, ao lado de uma parede ou cadeira, com a mão pousada de leve como segurança.',
    movimento: 'Eleve um pé poucos centímetros do chão e mantenha o equilíbrio por 10 a 20 segundos. Alterne.',
    respiracao: 'Tranquila e contínua.',
    sentir: 'Os pequenos ajustes constantes do pé e do tornozelo — é assim que o equilíbrio se treina.',
    atencao: 'Mantenha sempre o apoio ao alcance da mão.',
  },
  // ----- DIA 7 — Corpo inteiro, devagar -----
  {
    dia: 7, ordem: 1, nome: 'Espreguiçar completo', descricao: DIA_TEMA[7],
    preparacao: 'Deitada de costas, pernas estendidas, braços acima da cabeça.',
    movimento: 'Estique o corpo inteiro como ao acordar: braços para cima, pés para baixo, alongando ao máximo. Sustente e solte de uma vez.',
    respiracao: 'Inspire ao esticar, solte o ar ao relaxar.',
    sentir: 'O corpo inteiro se alongando de ponta a ponta, e o relaxamento profundo depois.',
    atencao: 'Este é o movimento mais natural que existe. Deixe o corpo conduzir.',
  },
  {
    dia: 7, ordem: 2, nome: 'Rolar para o lado', descricao: DIA_TEMA[7],
    preparacao: 'Deitada de costas, braços ao lado do corpo.',
    movimento: 'Role o corpo inteiro para um lado com controle, como um bloco só, e volte. Alterne.',
    respiracao: 'Livre, acompanhando o movimento.',
    sentir: 'A coordenação entre tronco, quadril e pernas.',
    atencao: 'Movimento lento. A intenção é sentir a sequência, não a velocidade.',
  },
  {
    dia: 7, ordem: 3, nome: 'Sequência do levantar', descricao: DIA_TEMA[7],
    preparacao: 'Deitada de costas.',
    movimento: 'Role para o lado, apoie a mão no chão, sente-se, apoie-se para ficar de joelhos e levante-se. Depois faça o caminho inverso para voltar ao chão.',
    respiracao: 'Livre, sem prender em nenhuma transição.',
    sentir: 'Como o corpo se organiza para sair do chão — um gesto que usamos a vida toda sem perceber.',
    atencao: 'Use apoio sempre que precisar. Vá devagar.',
  },
  {
    dia: 7, ordem: 4, nome: 'Balanço em pé', descricao: DIA_TEMA[7],
    preparacao: 'Em pé, pés na largura do quadril, braços soltos.',
    movimento: 'Balance o corpo suavemente para frente e para trás, depois para os lados, encontrando o ponto de equilíbrio no centro.',
    respiracao: 'Livre e tranquila.',
    sentir: 'Os pés trabalhando o tempo todo para manter você em pé.',
    atencao: 'Movimento pequeno. Se sentir instabilidade, fique perto de uma parede.',
  },
  {
    dia: 7, ordem: 5, nome: 'Silêncio do corpo', descricao: DIA_TEMA[7],
    preparacao: 'Deitada de costas, pernas estendidas ou joelhos dobrados, o que for mais confortável.',
    movimento: 'Nenhum. Apenas permaneça, percorrendo o corpo com a atenção, dos pés à cabeça.',
    respiracao: 'Natural. Sem controlar.',
    sentir: 'Como o corpo está agora, depois da semana inteira de prática.',
    atencao: 'Permaneça de 2 a 3 minutos. Este é o fechamento — não pule.',
  },
]

export const ALONGAMENTOS: AlongamentoConteudo[] = [
  { ordem: 1, nome: 'Respirar e chegar', descricao: 'Deitada de costas, joelhos dobrados. Apenas respire por três minutos, observando o ar entrar e sair. Sem mover nada. É o primeiro contato com o corpo.' },
  { ordem: 2, nome: 'Alongar de ponta a ponta', descricao: 'Deitada, braços acima da cabeça. Estique o corpo inteiro por alguns segundos e solte. Repita três vezes.' },
  { ordem: 3, nome: 'Joelhos ao peito', descricao: 'Deitada, traga os joelhos ao peito e envolva com os braços. Sustente por cinco respirações, sentindo a lombar apoiada no chão.' },
  { ordem: 4, nome: 'Torção deitada', descricao: 'Deitada, joelhos dobrados e unidos, braços abertos. Deixe os joelhos caírem para um lado e o olhar para o outro. Cinco respirações de cada lado.' },
  { ordem: 5, nome: 'Pescoço em três direções', descricao: 'Sentada. Incline a cabeça para a direita, para a esquerda e para frente, sustentando três respirações em cada posição. Nunca para trás.' },
  { ordem: 6, nome: 'Ombros em círculo', descricao: 'Sentada. Faça círculos lentos com os ombros, cinco vezes para trás e cinco para frente.' },
  { ordem: 7, nome: 'Abrir os braços', descricao: 'Sentada na beira da cadeira, mãos apoiadas atrás. Abra o peito e sustente por cinco respirações.' },
  { ordem: 8, nome: 'Alongar atrás da perna', descricao: 'Sentada, uma perna estendida à frente com o calcanhar no chão. Incline o tronco levemente até sentir a parte de trás da perna. Cinco respirações de cada lado.' },
  { ordem: 9, nome: 'Quadril em quatro', descricao: 'Deitada, tornozelo cruzado sobre a coxa oposta. Sustente por cinco respirações de cada lado.' },
  { ordem: 10, nome: 'Repouso final', descricao: 'Deitada, pernas e braços soltos. Dois minutos de imobilidade, apenas percebendo o corpo.' },
]

/* eslint-disable no-console */
// =====================================================================
// BodyMy — Seed
// Popula o banco com o programa Caminhada Japonesa completo, produtos
// bloqueados de exemplo (vitrine), plano de dieta base e um usuário de
// teste com entitlement.
//
// Uso:  npm run seed
// Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.
// (Carregue-as via `.env.local` — veja README.)
// =====================================================================

import './load-env'
import { createClient } from '@supabase/supabase-js'
import { assertBodyMyDb } from './guard-db'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar o seed.')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TEST_EMAIL = 'teste@bodymy.app'

// ---------------------------------------------------------------------
// Conteúdo do Protocolo Caminhada Japonesa (4 semanas, progressivo).
// Cada dia tem 1 aula tipo "guia". Vídeos entram depois via panda_video_id.
// A "Caminhada Japonesa" alterna blocos de ritmo leve e acelerado.
// ---------------------------------------------------------------------
interface DiaConteudo {
  titulo: string
  intro: string
  blocos: { tipo: 'texto' | 'passo' | 'dica'; titulo?: string; conteudo: string }[]
  duracao: number
}

function diaIntervalado(
  semana: number,
  repeticoes: number,
  minLeve: number,
  minAcelerado: number,
): DiaConteudo {
  const total = 5 + repeticoes * (minLeve + minAcelerado) + 5
  return {
    titulo: `Caminhada intervalada — ${repeticoes}x (${minLeve}min leve / ${minAcelerado}min acelerado)`,
    intro:
      'Hoje seguimos o método da caminhada japonesa: alternar um ritmo leve e um ritmo mais puxado. Sem pressa e sem culpa — o que importa é aparecer.',
    blocos: [
      { tipo: 'passo', titulo: 'Aquecimento (5 min)', conteudo: 'Comece caminhando devagar, soltando os ombros e respirando fundo. É só para o corpo entender que vamos nos mover.' },
      { tipo: 'passo', titulo: `Blocos (repetir ${repeticoes}x)`, conteudo: `${minLeve} min em ritmo leve (dá pra conversar) + ${minAcelerado} min em ritmo acelerado (respiração mais forte, mas sem ficar sem ar). Repita ${repeticoes} vezes.` },
      { tipo: 'passo', titulo: 'Desaquecimento (5 min)', conteudo: 'Volte ao ritmo leve para o coração desacelerar. Alongue as panturrilhas ao chegar.' },
      { tipo: 'dica', titulo: 'Dica de hoje', conteudo: 'No ritmo acelerado, imagine que está um pouco atrasada para um compromisso agradável. Não precisa correr — só andar com propósito.' },
    ],
    duracao: total,
  }
}

function diaLeve(semana: number): DiaConteudo {
  return {
    titulo: 'Caminhada leve e livre (30 min)',
    intro: 'Dia de movimento tranquilo. Sem blocos, sem cronômetro rígido — só uma caminhada gostosa no seu ritmo.',
    blocos: [
      { tipo: 'passo', titulo: 'Caminhada contínua', conteudo: 'Caminhe 30 minutos em ritmo confortável. Se quiser, escolha um trajeto novo ou ouça algo que você gosta.' },
      { tipo: 'dica', titulo: 'Constância > intensidade', conteudo: 'Um dia mais leve também é treino. Ele te ajuda a manter o hábito sem sobrecarregar o corpo.' },
    ],
    duracao: 30,
  }
}

function diaDescanso(): DiaConteudo {
  return {
    titulo: 'Descanso ativo & alongamento (15 min)',
    intro: 'Descansar faz parte do protocolo. Hoje cuidamos do corpo com movimentos suaves.',
    blocos: [
      { tipo: 'passo', titulo: 'Alongamento guiado', conteudo: 'Alongue panturrilhas, coxas e quadril, mantendo cada posição por 30 segundos, respirando calmamente.' },
      { tipo: 'passo', titulo: 'Respiração', conteudo: '2 minutos de respiração profunda: inspire pelo nariz contando até 4, solte pela boca contando até 6.' },
      { tipo: 'dica', titulo: 'Sem culpa', conteudo: 'Descanso não é atraso — é o que permite você voltar amanhã com energia.' },
    ],
    duracao: 15,
  }
}

// Plano das 4 semanas: 7 dias cada. Progressão de volume/intensidade.
function planoSemana(semana: number): DiaConteudo[] {
  switch (semana) {
    case 1:
      return [
        diaIntervalado(1, 3, 3, 2),
        diaLeve(1),
        diaIntervalado(1, 3, 3, 2),
        diaDescanso(),
        diaIntervalado(1, 4, 3, 2),
        diaLeve(1),
        diaDescanso(),
      ]
    case 2:
      return [
        diaIntervalado(2, 4, 3, 3),
        diaLeve(2),
        diaIntervalado(2, 4, 3, 3),
        diaDescanso(),
        diaIntervalado(2, 5, 3, 3),
        diaLeve(2),
        diaDescanso(),
      ]
    case 3:
      return [
        diaIntervalado(3, 5, 3, 3),
        diaLeve(3),
        diaIntervalado(3, 5, 3, 4),
        diaDescanso(),
        diaIntervalado(3, 5, 3, 4),
        diaLeve(3),
        diaDescanso(),
      ]
    default:
      return [
        diaIntervalado(4, 5, 3, 4),
        diaLeve(4),
        diaIntervalado(4, 6, 3, 4),
        diaDescanso(),
        diaIntervalado(4, 6, 3, 4),
        diaLeve(4),
        diaDescanso(),
      ]
  }
}

const SEMANA_TITULOS = [
  'Semana 1 — Começando com leveza',
  'Semana 2 — Ganhando ritmo',
  'Semana 3 — Mais firmeza',
  'Semana 4 — Consolidando o hábito',
]

const DIA_NOMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

async function upsertProduct(p: {
  slug: string
  nome: string
  descricao: string
  tipo: string
  kiwify_product_id?: string | null
  kiwify_checkout_url?: string | null
  preco_exibicao?: string | null
  sales_page?: unknown
  ativo?: boolean
}) {
  const { data, error } = await db
    .from('products')
    .upsert(
      {
        slug: p.slug,
        nome: p.nome,
        descricao: p.descricao,
        tipo: p.tipo,
        kiwify_product_id: p.kiwify_product_id ?? null,
        kiwify_checkout_url: p.kiwify_checkout_url ?? null,
        preco_exibicao: p.preco_exibicao ?? null,
        sales_page: p.sales_page ?? null,
        ativo: p.ativo ?? true,
      },
      { onConflict: 'slug' },
    )
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

async function main() {
  console.log('→ Seed iniciado')
  await assertBodyMyDb(db)

  // -------------------------------------------------------------------
  // 1) Produto + programa: Caminhada Japonesa
  // -------------------------------------------------------------------
  const caminhadaProductId = await upsertProduct({
    slug: 'caminhada-japonesa',
    nome: 'Protocolo Caminhada Japonesa',
    descricao:
      'Protocolo de caminhada intervalada de 4 semanas, 30 minutos por dia, progressivo e sem equipamento.',
    tipo: 'programa',
    kiwify_product_id: 'kiwify_caminhada_japonesa',
    kiwify_checkout_url: 'https://pay.kiwify.com.br/caminhada-japonesa',
    preco_exibicao: 'R$ 37,00',
    sales_page: {
      headline: 'O método de caminhada que cabe na sua rotina',
      subheadline: '4 semanas, 30 minutos por dia, sem academia e sem equipamento.',
      bullets: [
        'Caminhada intervalada guiada dia a dia',
        'Progressão suave — feita para quem está começando',
        'Foco em constância, energia e bem-estar',
      ],
      cta_label: 'QUERO O PROTOCOLO',
    },
    ativo: true,
  })

  // Programa (upsert por slug)
  const { data: prog, error: progErr } = await db
    .from('programs')
    .upsert(
      {
        product_id: caminhadaProductId,
        slug: 'caminhada-japonesa',
        nome: 'Protocolo Caminhada Japonesa',
        descricao: 'Caminhada intervalada progressiva de 4 semanas.',
        capa_url: null,
        duracao_semanas: 4,
        ordem_exibicao: 0,
        ativo: true,
      },
      { onConflict: 'slug' },
    )
    .select('id')
    .single()
  if (progErr) throw progErr
  const programId = prog.id as string

  // Limpa semanas antigas do programa (idempotência do conteúdo).
  await db.from('program_weeks').delete().eq('program_id', programId)

  for (let s = 1; s <= 4; s++) {
    const { data: week, error: wErr } = await db
      .from('program_weeks')
      .insert({ program_id: programId, numero: s, titulo: SEMANA_TITULOS[s - 1] })
      .select('id')
      .single()
    if (wErr) throw wErr

    const dias = planoSemana(s)
    for (let d = 0; d < 7; d++) {
      const { data: day, error: dErr } = await db
        .from('program_days')
        .insert({ week_id: week.id, numero: d + 1, titulo: DIA_NOMES[d] })
        .select('id')
        .single()
      if (dErr) throw dErr

      const conteudo = dias[d]
      const { error: lErr } = await db.from('lessons').insert({
        day_id: day.id,
        titulo: conteudo.titulo,
        tipo: 'guia',
        panda_video_id: null,
        conteudo: {
          intro: conteudo.intro,
          blocos: conteudo.blocos,
        },
        duracao_min: conteudo.duracao,
        ordem: 0,
      })
      if (lErr) throw lErr
    }
  }
  console.log('✓ Programa Caminhada Japonesa (4 semanas × 7 dias)')

  // -------------------------------------------------------------------
  // 2) Produtos bloqueados de exemplo (vitrine)
  // -------------------------------------------------------------------
  const pilatesProductId = await upsertProduct({
    slug: 'pilates-de-cadeira',
    nome: 'Pilates de Cadeira',
    descricao: 'Exercícios de baixo impacto usando apenas uma cadeira, para fazer em casa.',
    tipo: 'programa',
    kiwify_product_id: 'kiwify_pilates_cadeira',
    kiwify_checkout_url: 'https://pay.kiwify.com.br/pilates-de-cadeira',
    preco_exibicao: 'R$ 47,00',
    sales_page: {
      headline: 'Movimento suave, resultados que você sente',
      subheadline: 'Pilates adaptado para fazer sentada, no seu tempo.',
      bullets: [
        'Aulas curtas de 15 a 20 minutos',
        'Baixo impacto — gentil com as articulações',
        'Ideal para complementar suas caminhadas',
      ],
      cta_label: 'QUERO O PILATES DE CADEIRA',
    },
    ativo: true,
  })

  const lowCarbProductId = await upsertProduct({
    slug: 'cardapio-low-carb',
    nome: 'Cardápio Low Carb',
    descricao: 'Sugestões de cardápio com menos carboidratos, prático e brasileiro.',
    tipo: 'dieta_premium',
    kiwify_product_id: 'kiwify_cardapio_low_carb',
    kiwify_checkout_url: 'https://pay.kiwify.com.br/cardapio-low-carb',
    preco_exibicao: 'R$ 27,00',
    sales_page: {
      headline: 'Cardápios práticos para o dia a dia',
      subheadline: 'Ideias de refeições com menos carboidrato, sem complicação.',
      bullets: [
        '4 semanas de sugestões de cardápio',
        'Ingredientes fáceis de encontrar',
        'Conteúdo educativo — não substitui nutricionista',
      ],
      cta_label: 'QUERO O CARDÁPIO',
    },
    ativo: true,
  })
  console.log('✓ Produtos de vitrine: Pilates de Cadeira, Cardápio Low Carb')

  // Esteira de upsell: quem tem Caminhada Japonesa vê Pilates e Low Carb.
  // (Sem isso, a vitrine da aluna fica vazia no novo modelo multi-oferta.)
  for (const [i, upsellId] of [pilatesProductId, lowCarbProductId].entries()) {
    const { error } = await db.from('product_upsells').upsert(
      {
        product_id: caminhadaProductId,
        upsell_product_id: upsellId,
        ordem: i,
        ativo: true,
      },
      { onConflict: 'product_id,upsell_product_id' },
    )
    if (error) throw error
  }
  console.log('✓ Esteira: Caminhada Japonesa → Pilates de Cadeira, Cardápio Low Carb')

  // -------------------------------------------------------------------
  // 3) Plano de dieta base (incluso, product_id null)
  // -------------------------------------------------------------------
  const { data: dietPlan, error: dpErr } = await db
    .from('diet_plans')
    .upsert(
      {
        product_id: null,
        slug: 'cardapio-base',
        nome: 'Cardápio Base',
        descricao: 'Sugestões simples de cardápio brasileiro para acompanhar sua rotina.',
        ativo: true,
      },
      { onConflict: 'slug' },
    )
    .select('id')
    .single()
  if (dpErr) throw dpErr

  await db.from('diet_days').delete().eq('diet_plan_id', dietPlan.id)
  const cardapios = cardapioBase()
  for (let i = 0; i < cardapios.length; i++) {
    const { error } = await db.from('diet_days').insert({
      diet_plan_id: dietPlan.id,
      numero: i + 1,
      refeicoes: cardapios[i],
    })
    if (error) throw error
  }
  console.log('✓ Plano de dieta base (7 dias)')

  // -------------------------------------------------------------------
  // 4) Usuário de teste + entitlement do Caminhada Japonesa
  // -------------------------------------------------------------------
  let userId: string | null = null
  const { data: created, error: cErr } = await db.auth.admin.createUser({
    email: TEST_EMAIL,
    email_confirm: true,
    user_metadata: { nome: 'Maria Teste' },
  })
  if (cErr) {
    // Se já existe, buscamos o id.
    const { data: list } = await db.auth.admin.listUsers()
    userId = list?.users.find((u) => u.email === TEST_EMAIL)?.id ?? null
    if (!userId) throw cErr
    console.log('• Usuário de teste já existia')
  } else {
    userId = created.user.id
  }

  await db.from('profiles').upsert({
    id: userId,
    nome: 'Maria Teste',
    email: TEST_EMAIL,
    quiz_data: { horario_preferido: 'manha' },
    onboarding_completo: false,
  })

  await db.from('entitlements').upsert(
    {
      user_id: userId,
      product_id: caminhadaProductId,
      origem: 'manual',
      kiwify_order_id: 'seed-order',
      status: 'ativo',
    },
    { onConflict: 'user_id,product_id' },
  )
  console.log(`✓ Usuário de teste (${TEST_EMAIL}) com acesso ao Caminhada Japonesa`)

  console.log('→ Seed concluído com sucesso 🎉')
}

// Cardápio base — 7 dias de comida brasileira simples.
function cardapioBase() {
  const dia = (
    cafe: string[],
    almoco: string[],
    lanche: string[],
    jantar: string[],
  ) => ({
    cafe: { titulo: 'Café da manhã', itens: cafe },
    almoco: { titulo: 'Almoço', itens: almoco },
    lanche: { titulo: 'Lanche da tarde', itens: lanche },
    jantar: { titulo: 'Jantar', itens: jantar },
  })

  return [
    dia(
      ['Café com leite', 'Pão integral com ovo mexido', 'Mamão'],
      ['Arroz', 'Feijão', 'Frango grelhado', 'Salada de folhas'],
      ['Iogurte natural', 'Banana'],
      ['Sopa de legumes', 'Torrada integral'],
    ),
    dia(
      ['Tapioca com queijo', 'Suco de laranja natural'],
      ['Arroz integral', 'Lentilha', 'Carne moída refogada', 'Abobrinha'],
      ['Fruta da estação', 'Castanhas'],
      ['Omelete de legumes', 'Salada verde'],
    ),
    dia(
      ['Vitamina de banana com aveia'],
      ['Arroz', 'Feijão', 'Peixe assado', 'Cenoura e beterraba'],
      ['Iogurte', 'Maçã'],
      ['Wrap integral com frango e salada'],
    ),
    dia(
      ['Café com leite', 'Pão integral com requeijão', 'Mexerica'],
      ['Purê de mandioquinha', 'Frango desfiado', 'Brócolis'],
      ['Mix de frutas'],
      ['Sopa de abóbora com frango'],
    ),
    dia(
      ['Ovos mexidos', 'Fatia de melão'],
      ['Arroz', 'Feijão', 'Bife grelhado', 'Salada de tomate'],
      ['Iogurte com granola'],
      ['Panqueca de aveia com queijo branco'],
    ),
    dia(
      ['Tapioca com ovo'],
      ['Macarrão integral', 'Molho de tomate caseiro', 'Frango', 'Salada'],
      ['Fruta', 'Punhado de castanhas'],
      ['Caldo de legumes', 'Torrada'],
    ),
    dia(
      ['Café com leite', 'Bolo caseiro de fubá (fatia pequena)', 'Fruta'],
      ['Feijoada leve com couve', 'Arroz', 'Laranja'],
      ['Iogurte natural'],
      ['Salada completa com atum e ovo'],
    ),
  ]
}

main().catch((err) => {
  console.error('✗ Erro no seed:', err)
  process.exit(1)
})

// =====================================================================
// Tipos compartilhados do Acompañamiento Diario. SEM 'server-only' — são
// usados no client (formulário/render) e no servidor (n8n/acesso).
// =====================================================================

// Persona da assistente. Dá rosto e nome ao chat para a lead sentir um
// atendimento privado e dedicado. (O disclaimer educativo da página deixa
// claro que é um apoio, não substitui profissional.)
export const NUTRI_ASSISTENTE = {
  nome: 'Sofía',
  titulo: 'Tu nutricionista',
  inicial: 'S',
} as const

// ---- Questionário (o que a aluna responde para "montar a dieta") -----

export type NutriCampoTipo = 'number' | 'text' | 'select' | 'multiselect'

export interface NutriCampo {
  id: keyof NutriPerfilDados
  label: string
  tipo: NutriCampoTipo
  obrigatorio: boolean
  opcoes?: { valor: string; label: string }[]
  placeholder?: string
  sufixo?: string
  min?: number
  max?: number
}

export interface NutriPerfilDados {
  objetivo?: string
  idade?: number
  peso_kg?: number
  altura_cm?: number
  nivel_atividade?: string
  refeicoes_dia?: number
  restricoes?: string[]
  alergias?: string
  alimentos_evitar?: string
  sono?: string
  sintomas?: string[]
  rotina?: string
}

// Contexto do protocolo enviado à IA para ela "saber em que dia do desafio a
// aluna está" e adaptar a resposta (dor, sono, adesão).
export interface ContextoProtocolo {
  diaDoDesafio: number // 1..28 (posição no reto de 28 dias)
  semana: number // 1..4
  dia: number // 1..7
  streak: number // dias consecutivos de check-in
}

// Definição declarativa do formulário (renderizado genericamente pela UI).
// Textos em espanhol (público do app).
export const NUTRI_QUESTIONARIO: NutriCampo[] = [
  {
    id: 'objetivo',
    label: '¿Cuál es tu objetivo principal?',
    tipo: 'select',
    obrigatorio: true,
    opcoes: [
      { valor: 'perder_grasa', label: 'Reducir grasa corporal' },
      { valor: 'tonificar', label: 'Tonificar y definir' },
      { valor: 'energia', label: 'Tener más energía' },
      { valor: 'salud', label: 'Comer más sano' },
      { valor: 'mantener', label: 'Mantener mi peso' },
    ],
  },
  { id: 'idade', label: 'Tu edad', tipo: 'number', obrigatorio: true, sufixo: 'años', min: 14, max: 99 },
  { id: 'peso_kg', label: 'Tu peso', tipo: 'number', obrigatorio: true, sufixo: 'kg', min: 30, max: 250 },
  { id: 'altura_cm', label: 'Tu altura', tipo: 'number', obrigatorio: true, sufixo: 'cm', min: 120, max: 220 },
  {
    id: 'nivel_atividade',
    label: '¿Qué tan activa eres?',
    tipo: 'select',
    obrigatorio: true,
    opcoes: [
      { valor: 'sedentaria', label: 'Poco movimiento (trabajo sentada)' },
      { valor: 'leve', label: 'Actividad ligera (1-2 días/semana)' },
      { valor: 'moderada', label: 'Moderada (3-4 días/semana)' },
      { valor: 'intensa', label: 'Intensa (5+ días/semana)' },
    ],
  },
  {
    id: 'refeicoes_dia',
    label: '¿Cuántas comidas prefieres al día?',
    tipo: 'select',
    obrigatorio: true,
    opcoes: [
      { valor: '3', label: '3 comidas' },
      { valor: '4', label: '4 comidas' },
      { valor: '5', label: '5 comidas' },
    ],
  },
  {
    id: 'restricoes',
    label: '¿Tienes alguna preferencia alimentaria?',
    tipo: 'multiselect',
    obrigatorio: false,
    opcoes: [
      { valor: 'vegetariana', label: 'Vegetariana' },
      { valor: 'vegana', label: 'Vegana' },
      { valor: 'sin_gluten', label: 'Sin gluten' },
      { valor: 'sin_lactosa', label: 'Sin lactosa' },
      { valor: 'low_carb', label: 'Baja en carbohidratos' },
    ],
  },
  {
    id: 'alergias',
    label: '¿Tienes alergias o intolerancias?',
    tipo: 'text',
    obrigatorio: false,
    placeholder: 'Ej.: frutos secos, mariscos… (o déjalo vacío)',
  },
  {
    id: 'alimentos_evitar',
    label: '¿Hay alimentos que no te gustan?',
    tipo: 'text',
    obrigatorio: false,
    placeholder: 'Ej.: cebolla, pescado… (o déjalo vacío)',
  },
  {
    id: 'sono',
    label: '¿Cómo duermes últimamente?',
    tipo: 'select',
    obrigatorio: false,
    opcoes: [
      { valor: 'bien', label: 'Bien, descanso' },
      { valor: 'regular', label: 'Regular, me despierto' },
      { valor: 'mal', label: 'Mal, duermo poco' },
    ],
  },
  {
    id: 'sintomas',
    label: '¿Sientes alguno de estos? (para acompañarte mejor)',
    tipo: 'multiselect',
    obrigatorio: false,
    opcoes: [
      { valor: 'calores', label: 'Calores / sofocos' },
      { valor: 'ansiedad', label: 'Ansiedad / nervios' },
      { valor: 'insomnio', label: 'Insomnio' },
      { valor: 'cansancio', label: 'Cansancio' },
      { valor: 'animo', label: 'Cambios de ánimo' },
      { valor: 'retencion', label: 'Retención de líquidos' },
    ],
  },
  {
    id: 'rotina',
    label: 'Cuéntanos brevemente tu rutina',
    tipo: 'text',
    obrigatorio: false,
    placeholder: 'Ej.: me levanto 7h, entreno por la tarde, ceno tarde…',
  },
]

// ---- Dieta gerada pela IA (n8n) --------------------------------------

export interface NutriRefeicao {
  nome: string // "Desayuno", "Almuerzo"…
  horario?: string
  itens: string[]
  substituicoes?: string[]
}

export interface NutriDia {
  dia: string // "Lunes"…
  refeicoes: NutriRefeicao[]
}

export interface NutriDietaConteudo {
  resumo?: string
  calorias_dia?: number
  dias: NutriDia[]
  observacoes?: string
}

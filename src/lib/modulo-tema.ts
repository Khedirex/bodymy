// =====================================================================
// Identidade visual de cada módulo.
//
// A cor que a aluna vê no card da Home é a MESMA que ela encontra ao entrar
// no módulo. Sem isto, todo mini-app herdava o coral do protocolo principal
// e o Ritual Noche Perfecta (que é noturno) saía igual ao de movimento.
//
// Client-safe: usado nas telas dos módulos e nos cards.
// =====================================================================

export interface ModuloTema {
  /** Avatar/ícone do módulo (fundo + texto). */
  avatar: string
  /** Chip de contexto ("Noche 3 de 14"). */
  chip: string
  /** Botão principal do módulo. */
  botao: string
  /** Texto de realce (a chamada do dia). */
  realce: string
  /** Faixa de progresso. */
  barra: string
}

const PADRAO: ModuloTema = {
  avatar: 'bg-coral-50 text-coral-500',
  chip: 'bg-coral-50 text-coral-600',
  botao: 'bg-coral-500 text-white',
  realce: 'text-coral-600',
  barra: 'from-coral-400 to-coral-500',
}

export const TEMAS: Record<string, ModuloTema> = {
  // Movimento — o coral da marca.
  'descompresion-articular': PADRAO,

  // Postura — verde-suave, de recuperação.
  'reset-postura-cisne': {
    avatar: 'bg-sage-100 text-sage-600',
    chip: 'bg-sage-100 text-sage-600',
    botao: 'bg-sage-600 text-white',
    realce: 'text-sage-600',
    barra: 'from-sage-300 to-sage-600',
  },

  // Sono — noturno. É um ritual de cama, com a luz baixa.
  'ritual-noche-perfecta': {
    avatar: 'bg-ink-900 text-cream-50',
    chip: 'bg-ink-900/10 text-ink-900',
    botao: 'bg-ink-900 text-cream-50',
    realce: 'text-ink-900',
    barra: 'from-ink-700 to-ink-900',
  },
}

export const temaDoModulo = (slug: string): ModuloTema => TEMAS[slug] ?? PADRAO

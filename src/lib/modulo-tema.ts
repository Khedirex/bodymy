// =====================================================================
// Identidade visual de cada módulo.
//
// A cor que a aluna vê no card da Home é a MESMA que ela encontra ao entrar
// no módulo. Sem isto, todo mini-app herdava a primária do protocolo
// principal e o Ritual Noche Perfecta (que é noturno) saía igual ao de
// movimento.
//
// A paleta vive em tailwind.config.ts: roxo (brand) é a marca, amarelo (sun)
// é o acento. Verde (sage) aqui NÃO é tema de módulo — é só sinal de "hecho".
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
  avatar: 'bg-brand-50 text-brand-600',
  chip: 'bg-brand-50 text-brand-700',
  botao: 'bg-brand-500 text-white',
  realce: 'text-brand-600',
  barra: 'from-brand-400 to-brand-600',
}

export const TEMAS: Record<string, ModuloTema> = {
  // Movimento — o roxo da marca.
  'descompresion-articular': PADRAO,

  // Postura — o amarelo, quente e de manhã. Fundo amarelo leva texto ink:
  // branco sobre amarelo não passa contraste nenhum.
  'reset-postura-cisne': {
    avatar: 'bg-sun-100 text-sun-700',
    chip: 'bg-sun-100 text-sun-700',
    botao: 'bg-sun-300 text-ink-900',
    realce: 'text-sun-700',
    barra: 'from-sun-300 to-sun-500',
  },

  // Oração — noite recolhida: o roxo mais fundo com o dourado do acento.
  'oracion-milagrosa': {
    avatar: 'bg-brand-700 text-sun-200',
    chip: 'bg-brand-50 text-brand-700',
    botao: 'bg-brand-700 text-white',
    realce: 'text-brand-700',
    barra: 'from-brand-600 to-brand-700',
  },

  // Sono — noturno. É um ritual de cama, com a luz baixa: o neutro escuro
  // com a barra puxando para o roxo.
  'ritual-noche-perfecta': {
    avatar: 'bg-ink-900 text-mist-50',
    chip: 'bg-ink-900/10 text-ink-900',
    botao: 'bg-ink-900 text-mist-50',
    realce: 'text-ink-900',
    barra: 'from-brand-500 to-ink-900',
  },
}

// Bibliotecas de áudio (src/lib/bibliotecas.ts).
TEMAS['madrugada'] = {
  avatar: 'bg-ink-900 text-mist-50',
  chip: 'bg-ink-900/10 text-ink-900',
  botao: 'bg-ink-900 text-mist-50',
  realce: 'text-ink-900',
  barra: 'from-ink-700 to-ink-900',
}

TEMAS['dia-perfecto'] = {
  avatar: 'bg-sun-100 text-sun-700',
  chip: 'bg-sun-100 text-sun-700',
  botao: 'bg-sun-300 text-ink-900',
  realce: 'text-sun-700',
  barra: 'from-sun-300 to-sun-500',
}

TEMAS['mantenimiento'] = {
  avatar: 'bg-brand-50 text-brand-600',
  chip: 'bg-brand-50 text-brand-700',
  botao: 'bg-brand-500 text-white',
  realce: 'text-brand-600',
  barra: 'from-brand-400 to-brand-600',
}

TEMAS['receta'] = {
  avatar: 'bg-sage-100 text-sage-600',
  chip: 'bg-sage-100 text-sage-600',
  botao: 'bg-sage-600 text-white',
  realce: 'text-sage-600',
  barra: 'from-sage-300 to-sage-600',
}

export const temaDoModulo = (slug: string): ModuloTema => TEMAS[slug] ?? PADRAO

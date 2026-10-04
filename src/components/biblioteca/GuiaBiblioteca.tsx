import type { BibliotecaConfig } from '@/lib/bibliotecas'

// Cartão do guia em PDF do produto. Fica no módulo porque é onde ela volta:
// o e-mail de acesso se perde na caixa de entrada depois da primeira semana.
export function GuiaBiblioteca({ config }: { config: BibliotecaConfig }) {
  if (!config.guiaPdf) return null
  return (
    <a
      href={config.guiaPdf}
      target="_blank"
      rel="noopener"
      className="flex items-center gap-3 rounded-3xl bg-white p-5 shadow-card"
    >
      <span className="text-2xl">📄</span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold text-ink-900">
          {config.guiaTitulo ?? 'Tu guía en PDF'}
        </span>
        <span className="block text-sm text-ink-700">
          Para leer, guardar o imprimir — también sin internet
        </span>
      </span>
    </a>
  )
}

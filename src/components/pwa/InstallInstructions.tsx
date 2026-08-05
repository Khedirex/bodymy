'use client'

import { usePwaInstall } from '@/components/pwa/usePwaInstall'

// Instruções de instalação com detecção de plataforma.
// iOS: passo a passo (Safari → Compartilhar → Adicionar à Tela de Início).
// Android: botão que dispara o prompt nativo (beforeinstallprompt).
export function InstallInstructions() {
  const { plataforma, instalado, podeInstalarNativo, promptInstall } = usePwaInstall()

  if (instalado) {
    return (
      <div className="rounded-2xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-600">
        ✓ O BodyMy já está na sua tela inicial. Aproveite!
      </div>
    )
  }

  if (plataforma === 'ios') {
    return (
      <div className="rounded-2xl bg-cream-100 p-4">
        <p className="mb-2 font-semibold text-ink-900">Adicione à tela do seu iPhone</p>
        <ol className="space-y-1.5 text-sm text-ink-700">
          <li>1. Toque no botão <strong>Compartilhar</strong> (o quadradinho com a seta ↑) na barra do Safari.</li>
          <li>2. Escolha <strong>Adicionar à Tela de Início</strong>.</li>
          <li>3. Toque em <strong>Adicionar</strong>. Pronto! 🎉</li>
        </ol>
      </div>
    )
  }

  if (plataforma === 'android') {
    return (
      <div className="rounded-2xl bg-cream-100 p-4">
        <p className="mb-2 font-semibold text-ink-900">Adicione à tela do seu celular</p>
        {podeInstalarNativo ? (
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => promptInstall()}
          >
            Instalar o BodyMy
          </button>
        ) : (
          <ol className="space-y-1.5 text-sm text-ink-700">
            <li>1. Toque no menu <strong>⋮</strong> do navegador.</li>
            <li>2. Escolha <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
            <li>3. Confirme. Pronto! 🎉</li>
          </ol>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-cream-100 p-4 text-sm text-ink-700">
      Abra o BodyMy no navegador do seu celular e use a opção{' '}
      <strong>Adicionar à tela inicial</strong> para instalar como aplicativo.
    </div>
  )
}

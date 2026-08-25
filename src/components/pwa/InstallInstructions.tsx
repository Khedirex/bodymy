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
        ✓ BodyMy ya está en tu pantalla de inicio. ¡Disfruta!
      </div>
    )
  }

  if (plataforma === 'ios') {
    return (
      <div className="rounded-2xl bg-cream-100 p-4">
        <p className="mb-2 font-semibold text-ink-900">Agrégalo a la pantalla de tu iPhone</p>
        <ol className="space-y-1.5 text-sm text-ink-700">
          <li>1. Toca el botón <strong>Compartir</strong> (el cuadradito con la flecha ↑) en la barra de Safari.</li>
          <li>2. Elige <strong>Agregar a la pantalla de inicio</strong>.</li>
          <li>3. Toca <strong>Agregar</strong>. ¡Listo! 🎉</li>
        </ol>
      </div>
    )
  }

  if (plataforma === 'android') {
    return (
      <div className="rounded-2xl bg-cream-100 p-4">
        <p className="mb-2 font-semibold text-ink-900">Agrégalo a la pantalla de tu celular</p>
        {podeInstalarNativo ? (
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => promptInstall()}
          >
            Instalar BodyMy
          </button>
        ) : (
          <ol className="space-y-1.5 text-sm text-ink-700">
            <li>1. Toca el menú <strong>⋮</strong> del navegador.</li>
            <li>2. Elige <strong>Instalar aplicación</strong> o <strong>Agregar a la pantalla de inicio</strong>.</li>
            <li>3. Confirma. ¡Listo! 🎉</li>
          </ol>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-cream-100 p-4 text-sm text-ink-700">
      Abre BodyMy en el navegador de tu celular y usa la opción{' '}
      <strong>Agregar a la pantalla de inicio</strong> para instalarlo como aplicación.
    </div>
  )
}

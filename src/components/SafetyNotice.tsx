// Aviso de segurança reutilizável — exibido na tela do programa.
// Mantém o tom educativo e de bem-estar exigido pela conformidade:
// conteúdo não substitui profissional de saúde; dor é sinal de parar.
export function SafetyNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-1 flex items-center gap-1.5 text-sm font-bold text-amber-700">
        <span aria-hidden>⚠️</span> Antes de empezar
      </p>
      <p className="text-sm leading-relaxed text-amber-900">
        Este contenido es educativo y de bienestar — no sustituye la fisioterapia,
        al médico ni a un profesional de la salud. Respeta siempre tus límites:
        el movimiento es para dar alivio, nunca dolor. Si sientes dolor, mareo o
        molestia, detente y, si es necesario, busca orientación profesional.
      </p>
    </div>
  )
}

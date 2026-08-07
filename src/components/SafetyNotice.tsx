// Aviso de segurança reutilizável — exibido na tela do programa.
// Mantém o tom educativo e de bem-estar exigido pela conformidade:
// conteúdo não substitui profissional de saúde; dor é sinal de parar.
export function SafetyNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-1 flex items-center gap-1.5 text-sm font-bold text-amber-700">
        <span aria-hidden>⚠️</span> Antes de começar
      </p>
      <p className="text-sm leading-relaxed text-amber-900">
        Este conteúdo é educativo e de bem-estar — não substitui fisioterapia,
        médico ou profissional de saúde. Respeite sempre os seus limites:
        movimento é para dar alívio, nunca dor. Se sentir dor, tontura ou
        desconforto, pare e, se necessário, procure orientação profissional.
      </p>
    </div>
  )
}

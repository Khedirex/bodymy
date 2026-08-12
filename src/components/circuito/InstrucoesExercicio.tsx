// Renderiza as instruções da variação nos 5 blocos (Preparação, Movimento,
// Respiração, O que sentir, Atenção). "Atenção" ganha destaque de segurança.
// Se o texto não vier no formato rotulado, mostra como parágrafo simples.

const LABELS = ['Preparação', 'Movimento', 'Respiração', 'O que sentir', 'Atenção']
const RE = new RegExp(`^(${LABELS.join('|')}):\\s*(.*)$`)

interface Bloco {
  label: string
  texto: string
}

function parse(texto: string): Bloco[] {
  const linhas = texto.split('\n')
  const blocos: Bloco[] = []
  for (const linha of linhas) {
    const m = linha.match(RE)
    if (m) {
      blocos.push({ label: m[1], texto: m[2] })
    } else if (blocos.length && linha.trim()) {
      blocos[blocos.length - 1].texto += `\n${linha}`
    }
  }
  return blocos
}

export function InstrucoesExercicio({ texto }: { texto: string }) {
  const blocos = parse(texto)
  if (blocos.length === 0) {
    return <p className="whitespace-pre-line text-ink-800">{texto}</p>
  }
  return (
    <div className="space-y-2.5">
      {blocos.map((b, i) =>
        b.label === 'Atenção' ? (
          <div key={i} className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
              <span aria-hidden>⚠️</span> Atenção
            </p>
            <p className="mt-0.5 whitespace-pre-line text-sm text-amber-900">{b.texto}</p>
          </div>
        ) : (
          <div key={i}>
            <p className="text-xs font-bold uppercase tracking-wide text-coral-500">{b.label}</p>
            <p className="whitespace-pre-line text-ink-800">{b.texto}</p>
          </div>
        ),
      )}
    </div>
  )
}

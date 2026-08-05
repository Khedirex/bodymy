import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="text-5xl" aria-hidden>
        🚶‍♀️
      </div>
      <h1 className="text-2xl font-extrabold text-ink-900">Página não encontrada</h1>
      <p className="text-ink-700">
        O caminho que você procurou não existe por aqui.
      </p>
      <Link href="/" className="btn-primary mt-2">
        Voltar para o início
      </Link>
    </div>
  )
}

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="text-5xl" aria-hidden>
        🚶‍♀️
      </div>
      <h1 className="text-2xl font-extrabold text-ink-900">Página no encontrada</h1>
      <p className="text-ink-700">
        La página que buscabas no existe por aquí.
      </p>
      <Link href="/" className="btn-primary mt-2">
        Volver al inicio
      </Link>
    </div>
  )
}

import { Suspense } from 'react'
import { CallbackHandler } from './CallbackHandler'

export const metadata = { title: 'Entrando… — BodyMy' }
// Precisa rodar no client (o token vem no #fragment, que o servidor não vê).
export const dynamic = 'force-dynamic'

export default function AuthCallbackPage() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-cream-200 border-t-coral-400" />
      <p className="font-semibold text-ink-800">Entrando na sua conta…</p>
      <Suspense fallback={null}>
        <CallbackHandler />
      </Suspense>
    </div>
  )
}

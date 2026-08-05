import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export const metadata = { title: 'Entrar — BodyMy' }

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-coral-400 text-3xl">
          <span aria-hidden>🤍</span>
        </div>
        <h1 className="text-2xl font-extrabold text-ink-900">BodyMy</h1>
        <p className="mt-1 text-ink-700">Seu programa, no seu ritmo.</p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

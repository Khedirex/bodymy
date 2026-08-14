import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getMyAccesses } from '@/lib/queries'
import { SignOutButton } from '@/components/SignOutButton'
import { SetPassword } from '@/components/SetPassword'
import { InstallInstructions } from '@/components/pwa/InstallInstructions'
import { UserIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Perfil — BodyMy' }

// Suporte por e-mail (por enquanto). Ajuste conforme o negócio.
const SUPORTE_EMAIL = 'contato@bodymy.com.br'

export default async function PerfilPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const acessos = await getMyAccesses(profile.id)

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-coral-100 text-coral-500">
          <UserIcon width={28} height={28} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">
            {profile.nome ?? 'Sua conta'}
          </h1>
          <p className="text-sm text-ink-700">{profile.email}</p>
        </div>
      </header>

      {/* Acessos ativos */}
      <section>
        <h2 className="section-title mb-2">Seus acessos</h2>
        {acessos.length === 0 ? (
          <p className="rounded-2xl bg-cream-100 p-4 text-sm text-ink-700">
            Você ainda não tem programas liberados.
          </p>
        ) : (
          <ul className="space-y-2">
            {acessos.map((p) => (
              <li key={p.id} className="card flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                  ✓
                </span>
                <span className="font-semibold text-ink-900">{p.nome}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Senha (atalho de login opcional) */}
      <section>
        <h2 className="section-title mb-2">Entrar mais rápido</h2>
        <SetPassword />
      </section>

      {/* Instalar o app */}
      <section id="instalar">
        <h2 className="section-title mb-2">Instalar o BodyMy</h2>
        <InstallInstructions />
      </section>

      {/* Suporte */}
      <section>
        <h2 className="section-title mb-2">Precisa de ajuda?</h2>
        <a href={`mailto:${SUPORTE_EMAIL}`} className="card flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            ✉️
          </span>
          <div className="flex-1">
            <p className="font-bold text-ink-900">Falar com o suporte</p>
            <p className="text-sm text-ink-700">{SUPORTE_EMAIL}</p>
          </div>
        </a>
      </section>

      <SignOutButton />

      <p className="pb-4 text-center text-xs text-ink-700/50">BodyMy · feito com 🤍</p>
    </div>
  )
}

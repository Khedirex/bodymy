import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import {
  getCheckinDates,
  getEsteira,
  getMyAccesses,
  getEntitledPrograms,
} from '@/lib/queries'
import { createClient } from '@/lib/supabase/server'
import { getTrainingConfig, getCircuitoPrograma } from '@/lib/circuito'
import { CIRCUITO_ACCESS_SLUGS } from '@/lib/training'
import { NUTRI_PRODUCT_SLUG } from '@/lib/nutri'
import { SOFIA_ATIVA } from '@/lib/flags'
import { calcularStreak } from '@/lib/streak'
import { todayISO, addDaysISO } from '@/lib/dates'
import { HomeDash, type DiaSemana } from '@/components/home/HomeDash'
import { LockedProductCard } from '@/components/LockedProductCard'
import { InstallBanner } from '@/components/pwa/InstallBanner'
import { EmptyState } from '@/components/ui/states'
import {
  PlayIcon,
  ChevronRight,
  SaladIcon,
  LockIcon,
  BookIcon,
  ChatIcon,
  RouteIcon,
} from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

// Quantos produtos da esteira mostrar no resumo da Home.
const ESTEIRA_RESUMO = 4

export default async function HomePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!profile.onboarding_completo) redirect('/bem-vinda')

  const supabase = createClient()
  // O protocolo dela define catálogo, duração e progresso.
  const programa = await getCircuitoPrograma(supabase, profile.id)
  const temAcesso = programa !== null

  const [datas, storefront, config, acessos, programas] = await Promise.all([
    getCheckinDates(profile.id),
    getEsteira(profile.id),
    programa ? getTrainingConfig(supabase, profile.id, programa.id) : Promise.resolve(null),
    getMyAccesses(profile.id),
    getEntitledPrograms(profile.id),
  ])

  const hoje = todayISO()
  const streak = calcularStreak(datas, hoje)

  // --- Resumo da semana (últimos 7 dias, do mais antigo até hoje) ---------
  const feitos = new Set(datas)
  const semana: DiaSemana[] = Array.from({ length: 7 }, (_, i) => {
    const data = addDaysISO(hoje, -(6 - i))
    return { data, fez: feitos.has(data), ehHoje: data === hoje }
  })
  // Hoje ainda não é "perdido" — só conta como falta o que já passou.
  const perdidos = semana.filter((d) => !d.fez && !d.ehHoje).length

  // --- Posição no protocolo ----------------------------------------------
  const diasFeitos = config ? (config.semana_atual - 1) * 7 + (config.dia_atual - 1) : 0
  const diaDoDesafio = config ? diasFeitos + 1 : null
  const chipHoje = !config
    ? 'Vamos a empezar'
    : `Semana ${config.semana_atual} · Día ${config.dia_atual}`

  // --- Cursos que ela já tem ---------------------------------------------
  // Cada produto aponta para onde seu conteúdo realmente vive.
  const slugDoPrograma = new Map(programas.map((p) => [p.product.id, p.program.slug]))
  const cursos = acessos.map((p) => {
    let href: string | null = null
    let descricao = 'Acceso liberado'
    if (CIRCUITO_ACCESS_SLUGS.includes(p.slug)) {
      href = '/treino'
      descricao = 'Movilidad + circuito que se ajusta a ti'
    } else if (p.slug === NUTRI_PRODUCT_SLUG) {
      href = '/sofia'
      descricao = 'Tu chat privado con Sofía'
    } else {
      const progSlug = slugDoPrograma.get(p.id)
      if (progSlug) {
        href = `/programa/${progSlug}`
        descricao = 'Abrir el programa'
      }
    }
    return { id: p.id, nome: p.nome, href, descricao }
  })

  // Atalhos exibidos lado a lado. "Comprende la práctica" só para quem tem
  // acesso ao conteúdo do reto.
  const atalhos = [
    ...(SOFIA_ATIVA
      ? [
          {
            href: '/sofia',
            label: 'Sofía',
            cor: 'bg-sage-100 text-sage-600',
            icone: <ChatIcon width={22} height={22} />,
          },
        ]
      : []),
    ...(temAcesso
      ? [
          {
            href: '/entenda',
            label: 'La práctica',
            cor: 'bg-cream-200 text-ink-800',
            icone: <BookIcon width={22} height={22} />,
          },
        ]
      : []),
    {
      href: '/dieta',
      label: 'Menú de hoy',
      cor: 'bg-sage-100 text-sage-600',
      icone: <SaladIcon width={22} height={22} />,
    },
  ]

  const primeiroNome = (profile.nome ?? '').split(' ')[0] || 'Hola'
  const bloqueados = storefront.filter((s) => !s.liberado)

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <header>
        <p className="text-sm text-ink-700">Hola,</p>
        <h1 className="text-2xl font-extrabold text-ink-900">{primeiroNome} 🤍</h1>
      </header>

      <InstallBanner />

      {/* Dash: onde ela está, constância e o que ficou para trás */}
      {temAcesso ? (
        <HomeDash
          diaDoDesafio={diaDoDesafio}
          diasFeitos={diasFeitos}
          totalDias={programa?.totalDias ?? 0}
          streakAtual={streak.atual}
          fezHoje={streak.fezHoje}
          semana={semana}
          perdidos={perdidos}
        />
      ) : null}

      {/* Card "Hoje" — o CTA principal */}
      <section>
        <h2 className="section-title mb-2">Hoy</h2>
        {temAcesso ? (
          <div className="card">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-coral-600">
              <span className="chip">{chipHoje}</span>
            </div>
            <h3 className="text-lg font-bold text-ink-900">Tus movimientos de hoy</h3>
            <p className="mt-1 text-sm text-ink-700">
              Estiramiento leve + movilidad correctiva
            </p>
            <div className="mt-4">
              <Link href="/treino" className="btn-primary w-full">
                <PlayIcon width={20} height={20} /> Empezar ahora
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState
            titulo="Tu entrenamiento aparece aquí"
            descricao="En cuanto tu acceso esté activo, tu circuito del día aparecerá en este espacio."
            icone={<LockIcon width={28} height={28} />}
          />
        )}
      </section>

      {/* Cursos que ela já tem */}
      {cursos.length > 0 && (
        <section>
          <h2 className="section-title mb-2">Tus cursos</h2>
          <div className="space-y-2">
            {cursos.map((c) => {
              const conteudo = (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coral-50 text-coral-500">
                    <RouteIcon width={22} height={22} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-ink-900">{c.nome}</p>
                    <p className="text-sm text-ink-700">{c.descricao}</p>
                  </div>
                  {c.href ? <ChevronRight className="text-ink-700/40" width={20} height={20} /> : null}
                </>
              )
              return c.href ? (
                <Link key={c.id} href={c.href} className="card flex items-center gap-3">
                  {conteudo}
                </Link>
              ) : (
                <div key={c.id} className="card flex items-center gap-3">
                  {conteudo}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Atalhos — blocos lado a lado dentro de uma box mãe */}
      <section>
        <h2 className="section-title mb-2">Accesos rápidos</h2>
        <div className="card">
          <div className="grid grid-cols-3 gap-2">
            {atalhos.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex flex-col items-center gap-2 rounded-2xl bg-cream-50 px-1.5 py-3 text-center transition active:scale-[0.97]"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${a.cor}`}
                >
                  {a.icone}
                </span>
                <span className="text-xs font-bold leading-tight text-ink-900">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Esteira resumida — sempre por último */}
      {bloqueados.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="section-title">Para ti</h2>
            <Link href="/descubra" className="text-sm font-semibold text-coral-600">
              Ver todo
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {bloqueados.slice(0, ESTEIRA_RESUMO).map((s) => (
              <LockedProductCard key={s.product.id} product={s.product} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

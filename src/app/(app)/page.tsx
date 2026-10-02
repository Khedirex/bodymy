import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getCheckinDates, getEsteira } from '@/lib/queries'
import { getModulosDaAluna, type ModuloDaAluna } from '@/lib/modulos'
import { calcularStreak } from '@/lib/streak'
import { todayISO, addDaysISO } from '@/lib/dates'
import { DashGeneral, type DiaSemana } from '@/components/home/DashGeneral'
import { CarrosselDashes, type DashModulo } from '@/components/home/CarrosselDashes'
import { LockedProductCard } from '@/components/LockedProductCard'
import { InstallBanner } from '@/components/pwa/InstallBanner'
import { EmptyState } from '@/components/ui/states'
import { LockIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

// Quantos produtos da esteira mostrar no resumo da Home.
const ESTEIRA_RESUMO = 4

// Ordem do carrossel: primeiro o que ainda tem algo para hoje, depois o que
// já está feito, e por último o que ela terminou. Assim o primeiro painel é
// sempre o que ela precisa abrir agora — sem precisar deslizar.
function prioridade({ estado }: ModuloDaAluna): number {
  if (!estado) return 0
  if (estado.terminado) return 2
  if (estado.feitoHoje) return 1
  return 0
}

// Converte o módulo do registro no formato chapado que o carrossel (cliente)
// consegue receber — funções não cruzam a fronteira servidor/cliente.
function paraDash({ modulo, estado }: ModuloDaAluna): DashModulo {
  return {
    slug: modulo.slug,
    nome: modulo.nome,
    resumo: modulo.resumo,
    href: modulo.href,
    emoji: modulo.emoji,
    concluidos: estado?.concluidos ?? 0,
    total: estado?.total ?? 0,
    feitoHoje: estado?.feitoHoje ?? false,
    terminado: estado?.terminado ?? false,
    chamadaHoje: estado?.chamadaHoje ?? null,
  }
}

// A Home é o PAINEL DA ROTINA: um dash GERAL dela no topo e, abaixo, um dash
// por produto comprado em carrossel. Ela não conhece produto por nome — lê o
// registro de módulos (src/lib/modulos.ts) e mostra o que a compra liberou.
export default async function HomePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!profile.onboarding_completo) redirect('/bem-vinda')

  const [datas, storefront, modulos] = await Promise.all([
    getCheckinDates(profile.id),
    getEsteira(profile.id),
    getModulosDaAluna(profile.id),
  ])

  const hoje = todayISO()
  const streak = calcularStreak(datas, hoje)

  // Resumo da semana (últimos 7 dias, do mais antigo até hoje).
  const feitos = new Set(datas)
  const semana: DiaSemana[] = Array.from({ length: 7 }, (_, i) => {
    const data = addDaysISO(hoje, -(6 - i))
    return { data, fez: feitos.has(data), ehHoje: data === hoje }
  })
  const perdidos = semana.filter((d) => !d.fez && !d.ehHoje).length

  // Números do dash geral: a soma das rotinas dela, não de um produto só.
  const pasosHechos = modulos.reduce((s, m) => s + (m.estado?.concluidos ?? 0), 0)
  const pasosTotales = modulos.reduce((s, m) => s + (m.estado?.total ?? 0), 0)
  const pendientesHoy = modulos.filter(
    (m) => !m.estado || (!m.estado.terminado && !m.estado.feitoHoje),
  ).length

  const dashes = [...modulos].sort((a, b) => prioridade(a) - prioridade(b)).map(paraDash)

  const primeiroNome = (profile.nome ?? '').split(' ')[0] || 'Hola'
  const bloqueados = storefront.filter((s) => !s.liberado)

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-ink-700">Hola,</p>
        <h1 className="text-2xl font-extrabold text-ink-900">{primeiroNome} 🤍</h1>
      </header>

      <InstallBanner />

      {/* Dash geral — vale para a rotina inteira, não para um produto só. */}
      {modulos.length > 0 && (
        <DashGeneral
          totalRutinas={modulos.length}
          pasosHechos={pasosHechos}
          pasosTotales={pasosTotales}
          pendientesHoy={pendientesHoy}
          streakAtual={streak.atual}
          fezHoje={streak.fezHoje}
          semana={semana}
          perdidos={perdidos}
        />
      )}

      {/* Um dash por produto comprado. Com um só, o carrossel não aparece. */}
      {dashes.length > 0 ? (
        <CarrosselDashes itens={dashes} />
      ) : (
        <section>
          <h2 className="section-title mb-2">Hoy</h2>
          <EmptyState
            titulo="Tu rutina aparece aquí"
            descricao="En cuanto tu acceso esté activo, lo de hoy aparecerá en este espacio."
            icone={<LockIcon width={28} height={28} />}
          />
        </section>
      )}

      {/* O que ela ainda não tem — sempre por último. */}
      {bloqueados.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="section-title">Para ti</h2>
            <Link href="/descubra" className="text-sm font-semibold text-brand-600">
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

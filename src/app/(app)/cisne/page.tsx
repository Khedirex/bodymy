import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getCisneProduct, getCisneEstado, hasCisneAccess, podeAbrirDia } from '@/lib/cisne-server'
import { CISNE_DIAS, CISNE_INTENSIDADES, CISNE_TOTAL_DIAS, CISNE_GUIA, CISNE_GUIA_PDF } from '@/lib/cisne'
import { SalesView } from '@/components/SalesView'
import { BookIcon, CheckIcon, ChevronRight, LockIcon, PlayIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Reset Postura de Cisne — BodyMy' }

// Painel do Reset Postura de Cisne: o dia de hoje, o mapa dos 14 dias
// (2 semanas × 7 sessões de 4 movimentos), a guia e a biblioteca.
export default async function CisnePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const product = await getCisneProduct()
  if (!product) notFound()
  if (!(await hasCisneAccess(profile.id))) return <SalesView product={product} />

  const estado = await getCisneEstado(profile.id)
  const hoje = estado.proximoDia ? CISNE_DIAS[estado.proximoDia - 1] : null
  const pct = Math.round((estado.concluidos / CISNE_TOTAL_DIAS) * 100)

  return (
    <div className="space-y-6">
      {/* Capa */}
      <header className="overflow-hidden rounded-3xl bg-[#EBCFA9]">
        <div className="px-5 pb-3 pt-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2F6E68]">BodyMy · Reto 14 días</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight text-ink-900">
            Reset Postura <span className="italic text-coral-600">de Cisne</span>
          </h1>
          <p className="mt-1 text-sm text-ink-800">14 días · 10 minutos al día · en tu cama</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/guias/cisne/capa.webp" alt="" className="h-40 w-full object-cover object-[50%_70%]" />
        <div className="bg-[#2F6E68] px-5 py-3 text-white">
          <div className="flex items-center justify-between text-sm font-bold">
            <span>{estado.concluidos} de {CISNE_TOTAL_DIAS} días</span>
            <span>{pct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </header>

      {/* Hoje */}
      <section>
        <h2 className="section-title mb-2">Hoy</h2>
        {estado.terminado ? (
          <div className="card text-center">
            <p className="text-4xl">🦢</p>
            <h3 className="mt-2 text-xl font-extrabold text-ink-900">¡Lo lograste! 14 días por ti</h3>
            <p className="mt-1 text-ink-700">
              Para mantener: repite el Día 14 tres veces por semana. Puedes abrir cualquier día del mapa.
            </p>
            <Link href={`/cisne/dia/${CISNE_TOTAL_DIAS}`} className="btn-primary mt-4 w-full">
              <PlayIcon width={20} height={20} /> Repetir el Día 14
            </Link>
          </div>
        ) : hoje && estado.feitoHoje ? (
          <div className="card">
            <span className="chip">Listo por hoy ✓</span>
            <h3 className="mt-2 text-lg font-bold text-ink-900">Mañana: Día {hoje.numero} · {hoje.titulo}</h3>
            <p className="mt-1 text-sm text-ink-700">
              Tu cuello necesita descanso para fijar lo que aprendió. El próximo día se abre mañana. 🤍
            </p>
          </div>
        ) : hoje ? (
          <div className="card">
            <span className="chip">Semana {hoje.semana} · {hoje.intensidade}</span>
            <h3 className="mt-2 text-lg font-bold text-ink-900">
              Día {hoje.numero} · {hoje.titulo}
            </h3>
            <p className="mt-1 text-sm text-ink-700">
              {hoje.movimentos.map((m) => m.exercicio.nome).join(' · ')}
            </p>
            <Link href={`/cisne/dia/${hoje.numero}`} className="btn-primary mt-4 w-full">
              <PlayIcon width={20} height={20} /> Empezar · ~10 min
            </Link>
          </div>
        ) : null}
      </section>

      {/* Guia e biblioteca */}
      <section className="grid grid-cols-2 gap-3">
        <Link href="/cisne/guia" className="card flex flex-col gap-2 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
            <BookIcon width={20} height={20} />
          </span>
          <span className="font-bold text-ink-900">Antes de empezar</span>
          <span className="text-xs text-ink-700">Reglas de oro y cuidados</span>
        </Link>
        <Link href="/cisne/ejercicios" className="card flex flex-col gap-2 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-coral-50 text-coral-500">
            🦢
          </span>
          <span className="font-bold text-ink-900">Los 12 ejercicios</span>
          <span className="text-xs text-ink-700">Biblioteca ilustrada</span>
        </Link>
      </section>

      {/* Mapa dos 14 dias */}
      <section className="space-y-4">
        <h2 className="section-title">Tu mapa</h2>
        {CISNE_INTENSIDADES.map((int) => (
          <div key={int.semana}>
            <p className="text-sm font-bold text-ink-900">
              Semana {int.semana} · {int.nome}
            </p>
            <p className="mb-2 text-xs text-ink-700">{int.descricao}</p>
            <ul className="space-y-2">
              {CISNE_DIAS.filter((d) => d.semana === int.semana).map((d) => {
                const reg = estado.registros.get(d.numero)
                const aberto = podeAbrirDia(estado, d.numero)
                const conteudo = (
                  <>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                        reg
                          ? 'bg-sage-500 text-white'
                          : aberto
                            ? 'bg-coral-400 text-white'
                            : 'bg-cream-200 text-ink-700/60'
                      }`}
                    >
                      {reg ? <CheckIcon width={18} height={18} /> : d.numero}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ink-900">
                        Día {d.numero} · {d.titulo}
                        {d.diaDeFoto ? ' 📷' : ''}
                      </span>
                      <span className="block truncate text-xs text-ink-700">
                        {d.movimentos.map((m) => m.exercicio.nome).join(' · ')}
                      </span>
                      {reg?.cuello ? (
                        <span className="block text-xs font-semibold text-sage-600">Mi cuello: {reg.cuello}/5</span>
                      ) : null}
                    </span>
                    {aberto ? (
                      <ChevronRight className="text-ink-700/40" width={20} height={20} />
                    ) : (
                      <LockIcon className="text-ink-700/30" width={18} height={18} />
                    )}
                  </>
                )
                return (
                  <li key={d.numero}>
                    {aberto ? (
                      <Link href={`/cisne/dia/${d.numero}`} className="card flex items-center gap-3 p-3">
                        {conteudo}
                      </Link>
                    ) : (
                      <div className="card flex items-center gap-3 p-3 opacity-70">{conteudo}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </section>

      {/* Depois do reto */}
      {estado.terminado ? (
        <section className="card space-y-3">
          <h2 className="section-title">Tu cuello de cisne, para siempre</h2>
          <ul className="space-y-1.5 text-ink-800">
            {[...CISNE_GUIA.paraMantener, ...CISNE_GUIA.duranteElDia].map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-coral-500">•</span> {t}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <a href={CISNE_GUIA_PDF} download className="btn-secondary w-full">
        ⬇️ Descargar el guía práctico (PDF)
      </a>
    </div>
  )
}

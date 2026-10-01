import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { hasCisneAccess } from '@/lib/cisne-server'
import { CISNE_GUIA, CISNE_GUIA_PDF } from '@/lib/cisne'
import { ChevronLeft } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Antes de empezar — Reset Postura de Cisne' }

// Bienvenida + Antes de empezar + Día 15 en adelante (páginas 2, 3 e 26 do PDF).
export default async function CisneGuiaPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!(await hasCisneAccess(profile.id))) redirect('/cisne')

  const g = CISNE_GUIA
  return (
    <div className="space-y-5">
      <Link href="/cisne" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700">
        <ChevronLeft width={18} height={18} /> Reset Postura de Cisne
      </Link>

      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-sage-600">Bienvenida</p>
        <h1 className="text-2xl font-extrabold leading-tight text-ink-900">{g.bienvenida.titulo}</h1>
        <p className="mt-2 text-ink-700">{g.bienvenida.texto}</p>
      </header>

      <section>
        <h2 className="section-title mb-2">Cómo funciona</h2>
        <div className="grid grid-cols-2 gap-3">
          {g.comoFunciona.map((c, i) => (
            <div key={c.titulo} className="card p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F6E68] text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="mt-2 font-bold text-ink-900">{c.titulo}</p>
              <p className="mt-1 text-sm text-ink-700">{c.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title mb-2">Qué necesitas</h2>
        <ul className="space-y-1.5 text-ink-800">
          {g.queNecesitas.map((q) => (
            <li key={q.destaque} className="flex gap-2">
              <span className="text-coral-500">•</span>
              <span>
                <strong>{q.destaque}</strong>
                {q.texto}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-sage-100 p-5">
        <h2 className="mb-2 font-extrabold text-sage-600">Reglas de oro</h2>
        <ul className="space-y-1.5 text-ink-800">
          {g.reglasDeOro.map((r) => (
            <li key={r} className="flex gap-2"><span className="text-coral-500">•</span> {r}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-coral-50 p-5">
        <h2 className="mb-2 font-extrabold text-coral-600">Detente si sientes</h2>
        <ul className="space-y-1.5 text-ink-800">
          {g.detenteSi.map((r) => (
            <li key={r} className="flex gap-2"><span className="text-coral-500">•</span> {r}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-ink-700">{g.detenteNota}</p>
      </section>

      <section className="card">
        <h2 className="mb-1 font-extrabold text-ink-900">Consulta antes a tu médico si…</h2>
        <p className="text-ink-700">{g.consultaMedico}</p>
      </section>

      <section className="card">
        <h2 className="mb-1 font-extrabold text-ink-900">Tu foto de perfil (días 1, 7 y 14)</h2>
        <p className="text-ink-700">{g.fotoPerfil}</p>
        <Link href="/progresso" className="mt-3 inline-block text-sm font-bold text-coral-600">
          Guardar mis fotos en Progreso →
        </Link>
      </section>

      <section className="card">
        <h2 className="section-title mb-2">Día 15 en adelante</h2>
        <p className="mb-1 font-bold text-ink-900">Para mantener</p>
        <ul className="mb-3 space-y-1.5 text-ink-800">
          {g.paraMantener.map((t) => (
            <li key={t} className="flex gap-2"><span className="text-coral-500">•</span> {t}</li>
          ))}
        </ul>
        <p className="mb-1 font-bold text-ink-900">Durante el día</p>
        <ul className="space-y-1.5 text-ink-800">
          {g.duranteElDia.map((t) => (
            <li key={t} className="flex gap-2"><span className="text-coral-500">•</span> {t}</li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-ink-700/70">{g.aviso}</p>

      <a href={CISNE_GUIA_PDF} download className="btn-secondary w-full">
        ⬇️ Descargar el guía práctico (PDF)
      </a>
    </div>
  )
}

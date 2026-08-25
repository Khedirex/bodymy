import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAlunaFicha, listProductsSimple } from '@/lib/admin-queries'
import { AlunaActions } from '@/components/admin/AlunaActions'

export const dynamic = 'force-dynamic'

function fmt(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('es-419', { dateStyle: 'short', timeStyle: 'short' })
}

export default async function AlunaFichaPage({ params }: { params: { id: string } }) {
  const [ficha, produtos] = await Promise.all([getAlunaFicha(params.id), listProductsSimple()])
  if (!ficha) notFound()

  const { profile, auth, entitlements, streak, aulasConcluidas, totalCheckins, progresso, webhooks, config, alongamento, sessoes, comentarios, variacoes } = ficha

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/alunas" className="hover:underline">← Alumnas</Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna esquerda: dados + progresso */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h1 className="text-lg font-bold text-slate-900">{profile.nome ?? '(sin nombre)'}</h1>
            <p className="text-sm text-slate-600">{profile.email}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt className="text-slate-500">Registro</dt><dd className="text-slate-800">{fmt(auth.created_at ?? profile.created_at)}</dd>
              <dt className="text-slate-500">Último acceso</dt><dd className="text-slate-800">{fmt(auth.last_sign_in_at)}</dd>
              <dt className="text-slate-500">Correo confirmado</dt><dd className="text-slate-800">{auth.confirmado ? 'sí' : 'no'}</dd>
              <dt className="text-slate-500">Onboarding</dt><dd className="text-slate-800">{profile.onboarding_completo ? 'completo' : 'pendiente'}</dd>
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Progreso</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-2xl font-bold text-slate-900">{streak.atual}</p><p className="text-xs text-slate-500">racha actual</p></div>
              <div><p className="text-2xl font-bold text-slate-900">{aulasConcluidas}</p><p className="text-xs text-slate-500">clases completadas</p></div>
              <div><p className="text-2xl font-bold text-slate-900">{totalCheckins}</p><p className="text-xs text-slate-500">check-ins</p></div>
            </div>
            {progresso.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm">
                {progresso.map((p, i) => (
                  <li key={i} className="flex justify-between border-t border-slate-100 py-1">
                    <span className="text-slate-600">{p.data}</span>
                    <span className="text-slate-500">
                      {p.foto_path ? '📷 ' : ''}
                      {p.medidas ? Object.entries(p.medidas).map(([k, v]) => `${k}:${v}`).join(' ') : ''}
                      {p.peso ? ` ${p.peso}kg` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Circuito: configuração atual */}
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Circuito — configuración</h2>
            {config ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt className="text-slate-500">Rango de edad</dt><dd className="text-slate-800">{config.faixa_etaria ?? '—'}</dd>
                <dt className="text-slate-500">Series</dt><dd className="text-slate-800">{config.series}</dd>
                <dt className="text-slate-500">Descanso</dt><dd className="text-slate-800">{config.descanso_seg}s</dd>
                <dt className="text-slate-500">Tiempo de ejecución</dt><dd className="text-slate-800">{config.tempo_execucao_seg}s</dd>
                <dt className="text-slate-500">Etapa</dt><dd className="text-slate-800">Semana {config.semana_atual} · Día {config.dia_atual}</dd>
                <dt className="text-slate-500">Estiramiento</dt><dd className="text-slate-800">{alongamento.com} con · {alongamento.sem} sin</dd>
              </dl>
            ) : (
              <p className="text-sm text-slate-400">Todavía no inició el circuito.</p>
            )}
          </section>

          {/* Circuito: histórico de sessões */}
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Sesiones recientes</h2>
            {sessoes.length === 0 ? (
              <p className="text-sm text-slate-400">Todavía no hay sesiones.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr><th className="py-1 font-medium">Fecha</th><th className="py-1 font-medium">Sem/Día</th><th className="py-1 font-medium">Series/Desc.</th><th className="py-1 font-medium">Completa</th></tr>
                </thead>
                <tbody>
                  {sessoes.map((s, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-1.5 text-slate-700">{s.data}</td>
                      <td className="py-1.5 text-slate-600">S{s.semana}·D{s.dia}</td>
                      <td className="py-1.5 text-slate-600">{s.series_usadas ?? '—'} / {s.descanso_usado ?? '—'}s</td>
                      <td className="py-1.5">{s.completa ? <span className="text-emerald-700">sí</span> : <span className="text-slate-400">no</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Circuito: comentários da aluna */}
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Comentarios</h2>
            {comentarios.length === 0 ? (
              <p className="text-sm text-slate-400">No hay comentarios.</p>
            ) : (
              <ul className="space-y-2">
                {comentarios.map((c, i) => (
                  <li key={i} className="border-t border-slate-100 pt-2 text-sm">
                    <p className="text-slate-800">{c.comentario}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {fmt(c.created_at)}
                      {c.intensidade_percebida ? ` · intensidad ${c.intensidade_percebida}/6` : ''}
                      {c.eixo_dificuldade ? ` · ${c.eixo_dificuldade}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Circuito: variações escolhidas */}
          {variacoes.length > 0 && (
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Variaciones por ejercicio</h2>
              <div className="flex flex-wrap gap-1.5">
                {variacoes.map((v, i) => (
                  <span key={i} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    {v.nome}: <span className="font-semibold">v{v.nivel}</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Accesos</h2>
            {entitlements.length === 0 ? (
              <p className="text-sm text-slate-400">Sin accesos.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr><th className="py-1 font-medium">Producto</th><th className="py-1 font-medium">Estado</th><th className="py-1 font-medium">Origen</th><th className="py-1 font-medium">Fecha</th></tr>
                </thead>
                <tbody>
                  {entitlements.map((e) => (
                    <tr key={e.id} className="border-t border-slate-100">
                      <td className="py-1.5 text-slate-800">{e.produtoNome}</td>
                      <td className="py-1.5">{e.status === 'ativo' ? <span className="text-emerald-700">ativo</span> : <span className="text-slate-400">{e.status}</span>}</td>
                      <td className="py-1.5 text-slate-600">{e.origem}</td>
                      <td className="py-1.5 text-slate-600">{fmt(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Histórico de webhooks</h2>
            {webhooks.length === 0 ? (
              <p className="text-sm text-slate-400">Sin webhooks para este correo.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {webhooks.map((w) => (
                  <li key={w.event_id} className="flex justify-between border-t border-slate-100 py-1">
                    <span className="font-mono text-xs text-slate-500">{w.event_id}</span>
                    <span className="text-slate-600">{fmt(w.created_at)} · {w.processed ? 'ok' : 'pendiente'}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Coluna direita: ações */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Acciones</h2>
          <AlunaActions
            alunaId={profile.id}
            alunaEmail={profile.email ?? ''}
            entitlements={entitlements.map((e) => ({ product_id: e.product_id, produtoNome: e.produtoNome, status: e.status }))}
            produtos={produtos.map((p) => ({ id: p.id, nome: p.nome, slug: p.slug }))}
          />
        </div>
      </div>
    </div>
  )
}

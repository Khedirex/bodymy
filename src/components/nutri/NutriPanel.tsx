'use client'

import { useMemo, useState } from 'react'
import {
  NUTRI_QUESTIONARIO,
  type NutriCampo,
  type NutriPerfilDados,
  type NutriDietaConteudo,
} from '@/lib/nutri-types'

// Espelha NutriAcesso do servidor (sem importar server-only no client).
interface Acesso {
  plano: 'pago' | 'trial' | 'expirado' | 'nenhum'
  podeUsar: boolean
  podeIniciarTrial: boolean
  perfilCompleto: boolean
  trialExpiraEm: string | null
  diasRestantes: number | null
}

interface Mensagem {
  papel: 'user' | 'assistant'
  conteudo: string
}

interface Props {
  initialAcesso: Acesso
  initialDieta: NutriDietaConteudo | null
  initialHistorico: Mensagem[]
  initialPerfil: NutriPerfilDados | null
  checkoutUrl: string | null
  produtoNome: string
}

export function NutriPanel({
  initialAcesso,
  initialDieta,
  initialHistorico,
  initialPerfil,
  checkoutUrl,
  produtoNome,
}: Props) {
  const [acesso, setAcesso] = useState<Acesso>(initialAcesso)
  const [dieta, setDieta] = useState<NutriDietaConteudo | null>(initialDieta)
  const [editando, setEditando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const view = useMemo<'app' | 'questionario' | 'paywall'>(() => {
    if (editando) return 'questionario'
    if (acesso.podeUsar) return acesso.perfilCompleto ? 'app' : 'questionario'
    return acesso.plano === 'expirado' ? 'paywall' : 'questionario'
  }, [acesso, editando])

  if (view === 'paywall') {
    return <Paywall checkoutUrl={checkoutUrl} produtoNome={produtoNome} />
  }

  if (view === 'questionario') {
    return (
      <Questionario
        perfilInicial={initialPerfil}
        primeiraVez={!acesso.perfilCompleto}
        onCancel={acesso.perfilCompleto ? () => setEditando(false) : undefined}
        onDone={(res) => {
          setAcesso(res.acesso)
          if (res.dieta) setDieta(res.dieta)
          setEditando(false)
          if (res.iaIndisponivel)
            setAviso('Tu dieta se está preparando. En unos minutos estará lista aquí.')
          else setAviso(null)
        }}
      />
    )
  }

  // view === 'app'
  return (
    <div className="space-y-5">
      <TrialBanner acesso={acesso} checkoutUrl={checkoutUrl} />
      {aviso && (
        <p className="rounded-2xl bg-gold-300/10 px-4 py-3 text-sm text-ink-700">{aviso}</p>
      )}
      {dieta ? (
        <DietaView dieta={dieta} onEditar={() => setEditando(true)} />
      ) : (
        <div className="card text-center">
          <p className="text-sm text-ink-700">
            Todavía no tienes una dieta generada. Actualiza tus datos para crearla.
          </p>
          <button
            onClick={() => setEditando(true)}
            className="mt-3 rounded-full bg-coral-500 px-5 py-2 text-sm font-bold text-white"
          >
            Crear mi dieta
          </button>
        </div>
      )}
      <Chat
        historicoInicial={initialHistorico}
        onSinAcceso={(a) => setAcesso(a)}
      />
    </div>
  )
}

// ---------------------------------------------------------------------
// Questionário (montar / ajustar a dieta)
// ---------------------------------------------------------------------
function Questionario({
  perfilInicial,
  primeiraVez,
  onDone,
  onCancel,
}: {
  perfilInicial: NutriPerfilDados | null
  primeiraVez: boolean
  onDone: (res: { acesso: Acesso; dieta: NutriDietaConteudo | null; iaIndisponivel?: boolean }) => void
  onCancel?: () => void
}) {
  const [valores, setValores] = useState<Record<string, unknown>>(
    () => ({ ...(perfilInicial ?? {}) }),
  )
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function setCampo(id: string, v: unknown) {
    setValores((prev) => ({ ...prev, [id]: v }))
  }

  function toggleMulti(id: string, valor: string) {
    setValores((prev) => {
      const atual = Array.isArray(prev[id]) ? (prev[id] as string[]) : []
      const novo = atual.includes(valor) ? atual.filter((x) => x !== valor) : [...atual, valor]
      return { ...prev, [id]: novo }
    })
  }

  async function enviar() {
    setErro(null)
    // Validação leve no client (o servidor revalida).
    for (const campo of NUTRI_QUESTIONARIO) {
      if (!campo.obrigatorio) continue
      const v = valores[campo.id as string]
      if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
        setErro('Completa los campos obligatorios (marcados con *).')
        return
      }
    }
    setEnviando(true)
    try {
      const res = await fetch('/api/nutri/perfil', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dados: valores }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErro('No pudimos guardar tus datos. Revisa e inténtalo de nuevo.')
        return
      }
      onDone(json)
    } catch {
      setErro('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-coral-500 to-coral-400 px-4 py-4 text-white">
        <h3 className="text-lg font-extrabold">
          {primeiraVez ? 'Arma tu dieta personalizada' : 'Ajusta tus datos'}
        </h3>
        <p className="mt-1 text-sm text-white/90">
          Responde unas preguntas y la nutricionista IA crea tu plan mensual con sustituciones.
        </p>
      </div>

      <div className="space-y-4">
        {NUTRI_QUESTIONARIO.map((campo) => (
          <CampoInput
            key={campo.id as string}
            campo={campo}
            valor={valores[campo.id as string]}
            onChange={(v) => setCampo(campo.id as string, v)}
            onToggleMulti={(valor) => toggleMulti(campo.id as string, valor)}
          />
        ))}
      </div>

      {erro && <p className="text-sm font-semibold text-coral-500">{erro}</p>}

      <div className="flex gap-2">
        <button
          onClick={enviar}
          disabled={enviando}
          className="flex-1 rounded-full bg-coral-500 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {enviando ? 'Creando tu dieta…' : primeiraVez ? 'Crear mi dieta gratis' : 'Guardar y actualizar'}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={enviando}
            className="rounded-full bg-cream-100 px-5 py-3 text-sm font-semibold text-ink-700"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}

function CampoInput({
  campo,
  valor,
  onChange,
  onToggleMulti,
}: {
  campo: NutriCampo
  valor: unknown
  onChange: (v: unknown) => void
  onToggleMulti: (valor: string) => void
}) {
  const label = (
    <label className="mb-1.5 block text-sm font-semibold text-ink-900">
      {campo.label} {campo.obrigatorio && <span className="text-coral-500">*</span>}
    </label>
  )

  if (campo.tipo === 'number') {
    return (
      <div>
        {label}
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={(valor as number) ?? ''}
            min={campo.min}
            max={campo.max}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-3 text-ink-900 outline-none focus:border-coral-400"
          />
          {campo.sufixo && <span className="text-sm text-ink-700">{campo.sufixo}</span>}
        </div>
      </div>
    )
  }

  if (campo.tipo === 'select') {
    const atual = valor != null ? String(valor) : ''
    return (
      <div>
        {label}
        <div className="grid grid-cols-1 gap-2">
          {(campo.opcoes ?? []).map((o) => (
            <button
              key={o.valor}
              type="button"
              onClick={() => onChange(o.valor)}
              className={`rounded-2xl border px-4 py-2.5 text-left text-sm font-medium transition ${
                atual === o.valor
                  ? 'border-coral-400 bg-coral-100 text-coral-500'
                  : 'border-cream-200 bg-white text-ink-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (campo.tipo === 'multiselect') {
    const arr = Array.isArray(valor) ? (valor as string[]) : []
    return (
      <div>
        {label}
        <div className="flex flex-wrap gap-2">
          {(campo.opcoes ?? []).map((o) => (
            <button
              key={o.valor}
              type="button"
              onClick={() => onToggleMulti(o.valor)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                arr.includes(o.valor)
                  ? 'border-coral-400 bg-coral-100 text-coral-500'
                  : 'border-cream-200 bg-white text-ink-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // text
  return (
    <div>
      {label}
      <input
        type="text"
        value={(valor as string) ?? ''}
        placeholder={campo.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-cream-200 bg-white px-4 py-3 text-ink-900 outline-none placeholder:text-ink-700/40 focus:border-coral-400"
      />
    </div>
  )
}

// ---------------------------------------------------------------------
// Dieta gerada
// ---------------------------------------------------------------------
function DietaView({ dieta, onEditar }: { dieta: NutriDietaConteudo; onEditar: () => void }) {
  const [aberto, setAberto] = useState<number>(0)
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Tu dieta personalizada</h2>
        <button onClick={onEditar} className="text-sm font-semibold text-coral-500">
          Ajustar datos
        </button>
      </div>

      {(dieta.resumo || dieta.calorias_dia) && (
        <div className="rounded-2xl bg-sage-100 px-4 py-3 text-sm text-ink-900">
          {dieta.resumo && <p>{dieta.resumo}</p>}
          {dieta.calorias_dia && (
            <p className="mt-1 font-semibold">≈ {dieta.calorias_dia} kcal/día</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {(dieta.dias ?? []).map((d, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-cream-200 bg-white">
            <button
              onClick={() => setAberto(aberto === i ? -1 : i)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="font-bold text-ink-900">{d.dia}</span>
              <span className="text-ink-700">{aberto === i ? '−' : '+'}</span>
            </button>
            {aberto === i && (
              <div className="space-y-3 border-t border-cream-200 px-4 py-3">
                {(d.refeicoes ?? []).map((r, j) => (
                  <div key={j}>
                    <p className="text-sm font-bold text-coral-500">
                      {r.nome}
                      {r.horario && <span className="ml-2 font-normal text-ink-700">{r.horario}</span>}
                    </p>
                    <ul className="mt-1 list-inside list-disc text-sm text-ink-900">
                      {(r.itens ?? []).map((it, k) => (
                        <li key={k}>{it}</li>
                      ))}
                    </ul>
                    {r.substituicoes && r.substituicoes.length > 0 && (
                      <p className="mt-1 text-xs text-ink-700">
                        <span className="font-semibold">Sustituciones: </span>
                        {r.substituicoes.join(' · ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {dieta.observacoes && (
        <p className="rounded-2xl bg-cream-100 px-4 py-3 text-sm text-ink-700">{dieta.observacoes}</p>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------
function Chat({
  historicoInicial,
  onSinAcceso,
}: {
  historicoInicial: Mensagem[]
  onSinAcceso: (a: Acesso) => void
}) {
  const [msgs, setMsgs] = useState<Mensagem[]>(historicoInicial)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function enviar() {
    const mensagem = texto.trim()
    if (!mensagem || enviando) return
    setErro(null)
    setTexto('')
    setMsgs((prev) => [...prev, { papel: 'user', conteudo: mensagem }])
    setEnviando(true)
    try {
      const res = await fetch('/api/nutri/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mensagem }),
      })
      const json = await res.json()
      if (res.status === 403 && json.acesso) {
        onSinAcceso(json.acesso)
        return
      }
      if (res.status === 503) {
        setErro('El chat está en mantenimiento. Vuelve en unos minutos.')
        return
      }
      if (!res.ok) {
        setErro('No pude responder ahora. Inténtalo de nuevo.')
        return
      }
      setMsgs((prev) => [...prev, { papel: 'assistant', conteudo: json.resposta }])
    } catch {
      setErro('Error de conexión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="section-title">Pregúntale a tu nutricionista</h2>
      <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto rounded-2xl bg-cream-100 p-3">
        {msgs.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-ink-700">
            Escribe tu primera pregunta 🤍<br />
            Ej.: «¿Con qué puedo cambiar el desayuno del lunes?»
          </p>
        )}
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
              m.papel === 'user'
                ? 'self-end bg-coral-500 text-white'
                : 'self-start bg-white text-ink-900'
            }`}
          >
            {m.conteudo}
          </div>
        ))}
        {enviando && (
          <div className="self-start rounded-2xl bg-white px-3.5 py-2 text-sm text-ink-700">
            escribiendo…
          </div>
        )}
      </div>
      {erro && <p className="text-sm font-semibold text-coral-500">{erro}</p>}
      <div className="flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder="Escribe tu pregunta…"
          className="flex-1 rounded-full border border-cream-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-coral-400"
        />
        <button
          onClick={enviar}
          disabled={enviando || !texto.trim()}
          className="rounded-full bg-coral-500 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------
// Trial banner + Paywall
// ---------------------------------------------------------------------
function TrialBanner({ acesso, checkoutUrl }: { acesso: Acesso; checkoutUrl: string | null }) {
  if (acesso.plano !== 'trial') return null
  const dias = acesso.diasRestantes ?? 0
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gold-300/50 bg-gold-300/10 px-4 py-3">
      <p className="text-sm text-ink-900">
        <span className="font-bold">Prueba gratis:</span> te{' '}
        {dias === 1 ? 'queda 1 día' : `quedan ${dias} días`}.
      </p>
      {checkoutUrl && (
        <a
          href={checkoutUrl}
          className="shrink-0 rounded-full bg-coral-500 px-4 py-1.5 text-xs font-bold text-white"
        >
          Activar acceso
        </a>
      )}
    </div>
  )
}

function Paywall({ checkoutUrl, produtoNome }: { checkoutUrl: string | null; produtoNome: string }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-coral-500 to-coral-400 px-5 py-6 text-center text-white">
      <p className="text-3xl">🥑</p>
      <h2 className="mt-2 text-xl font-extrabold">Tu prueba gratis terminó</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-white/90">
        Sigue con tu dieta personalizada y el chat con la nutricionista IA cuando quieras. Tus
        datos están guardados.
      </p>
      {checkoutUrl ? (
        <a
          href={checkoutUrl}
          className="mt-4 inline-block rounded-full bg-white px-6 py-3 text-sm font-bold text-coral-500"
        >
          Activar {produtoNome}
        </a>
      ) : (
        <p className="mt-4 text-sm text-white/90">Muy pronto podrás activarlo aquí.</p>
      )}
    </div>
  )
}

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getNutriAccess,
  getNutriPerfil,
  getDietaAtiva,
  getHistorico,
  getContextoProtocolo,
  inserirMensagem,
} from '@/lib/nutri'
import { chatN8n, N8nNaoConfigurado } from '@/lib/n8n'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Uma pergunta no chat da nutricionista IA. Valida acesso (pago/trial) e o
// gate (dieta montada) ANTES de chamar o n8n.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { mensagem?: string }
  const mensagem = (body.mensagem ?? '').trim().slice(0, 2000)
  if (!mensagem) return NextResponse.json({ error: 'mensaje_vacio' }, { status: 400 })

  // Gate de acesso.
  const acesso = await getNutriAccess(supabase, user.id)
  if (!acesso.podeUsar) {
    return NextResponse.json({ error: 'sin_acceso', acesso }, { status: 403 })
  }
  if (!acesso.perfilCompleto) {
    return NextResponse.json({ error: 'falta_montar_dieta', acesso }, { status: 403 })
  }

  try {
    const [perfil, dietaAtiva, historico, contexto] = await Promise.all([
      getNutriPerfil(supabase, user.id),
      getDietaAtiva(supabase, user.id),
      getHistorico(supabase, user.id, 40),
      getContextoProtocolo(supabase, user.id),
    ])

    // Persiste a mensagem da aluna antes de chamar a IA.
    await inserirMensagem(user.id, 'user', mensagem)

    const { resposta } = await chatN8n({
      userId: user.id,
      mensagem,
      historico: historico.map((m) => ({ papel: m.papel, conteudo: m.conteudo })),
      perfil,
      plano: dietaAtiva?.conteudo ?? null,
      contexto,
    })

    const texto = (resposta ?? '').trim() || 'No pude generar una respuesta ahora. Inténtalo de nuevo.'
    await inserirMensagem(user.id, 'assistant', texto)

    return NextResponse.json({ ok: true, resposta: texto })
  } catch (err) {
    if (err instanceof N8nNaoConfigurado) {
      return NextResponse.json({ error: 'servicio_no_disponible' }, { status: 503 })
    }
    captureException(err, { rota: 'nutri_chat' })
    return NextResponse.json({ error: 'error_en_el_chat' }, { status: 500 })
  }
}

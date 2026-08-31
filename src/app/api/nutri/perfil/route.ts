import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  salvarPerfilEIniciarTrial,
  salvarDietaGerada,
} from '@/lib/nutri'
import { gerarDietaN8n, N8nNaoConfigurado } from '@/lib/n8n'
import { NUTRI_QUESTIONARIO, type NutriPerfilDados } from '@/lib/nutri-types'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Recebe o questionário → salva o perfil → inicia o trial de 7 dias (se for o
// caso) → gera a dieta personalizada no n8n → salva. "Montar a dieta".
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { dados?: Record<string, unknown> }
  const entrada = body.dados ?? {}

  // Valida/normaliza conforme o questionário declarativo.
  const out: Record<string, unknown> = {}
  for (const campo of NUTRI_QUESTIONARIO) {
    const bruto = entrada[campo.id as string]
    if (campo.tipo === 'number') {
      const n = Number(bruto)
      if (Number.isFinite(n)) {
        if ((campo.min != null && n < campo.min) || (campo.max != null && n > campo.max)) {
          return NextResponse.json({ error: `campo_invalido:${campo.id}` }, { status: 400 })
        }
        out[campo.id] = n
      } else if (campo.obrigatorio) {
        return NextResponse.json({ error: `campo_obrigatorio:${campo.id}` }, { status: 400 })
      }
    } else if (campo.tipo === 'multiselect') {
      out[campo.id] = Array.isArray(bruto) ? bruto.map((v) => String(v)).slice(0, 20) : []
    } else if (campo.tipo === 'select') {
      const v = bruto != null ? String(bruto) : ''
      const ok = (campo.opcoes ?? []).some((o) => o.valor === v)
      if (!ok) {
        if (campo.obrigatorio) return NextResponse.json({ error: `campo_obrigatorio:${campo.id}` }, { status: 400 })
      } else {
        // refeicoes_dia é numérico no domínio, mas vem como select string.
        out[campo.id] = campo.id === 'refeicoes_dia' ? Number(v) : v
      }
    } else {
      // text
      const v = bruto != null ? String(bruto).trim().slice(0, 500) : ''
      if (v) out[campo.id] = v
      else if (campo.obrigatorio) return NextResponse.json({ error: `campo_obrigatorio:${campo.id}` }, { status: 400 })
    }
  }
  const dados = out as NutriPerfilDados

  try {
    // 1) Salva o perfil e inicia o trial (se elegível).
    const acesso = await salvarPerfilEIniciarTrial(user.id, dados)

    // 2) Sem acesso ativo (trial vencido e não comprou) → não gera dieta.
    if (!acesso.podeUsar) {
      return NextResponse.json({ ok: true, acesso, dieta: null, bloqueado: true })
    }

    // 3) Gera a dieta no n8n.
    try {
      const { dieta, retorno_em } = await gerarDietaN8n(user.id, dados)
      await salvarDietaGerada(user.id, dieta, retorno_em ?? null)
      return NextResponse.json({ ok: true, acesso, dieta })
    } catch (err) {
      if (err instanceof N8nNaoConfigurado) {
        // Perfil salvo + trial iniciado, mas a IA ainda não está ligada.
        return NextResponse.json({ ok: true, acesso, dieta: null, iaIndisponivel: true })
      }
      throw err
    }
  } catch (err) {
    captureException(err, { rota: 'nutri_perfil' })
    return NextResponse.json({ error: 'error_al_generar_dieta' }, { status: 500 })
  }
}

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasBibliotecaAccess, getProgressoBiblioteca } from '@/lib/biblioteca-server'
import { bibliotecaPorSlug } from '@/lib/bibliotecas'
import { todayISO } from '@/lib/dates'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Marca a noite concluída numa biblioteca em sequência. O número vem do
// SERVIDOR: o corpo não escolhe onde ela está.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 })

  const { modulo } = (await request.json().catch(() => ({}))) as { modulo?: string }
  const config = modulo ? bibliotecaPorSlug(modulo) : undefined
  if (!config || config.formato !== 'secuencia') {
    return NextResponse.json({ error: 'modulo_invalido' }, { status: 400 })
  }
  if (!(await hasBibliotecaAccess(user.id, config.slug))) {
    return NextResponse.json({ error: 'sin_acceso' }, { status: 403 })
  }

  try {
    const estado = await getProgressoBiblioteca(user.id, config.slug)
    if (estado.terminado || !estado.proxima) {
      return NextResponse.json({ ok: true, terminado: true })
    }
    // Uma por dia: é o que o produto vende.
    if (estado.feitoHoje) {
      return NextResponse.json({ error: 'ya_hiciste_hoy' }, { status: 409 })
    }

    const audio = estado.sequencia[estado.proxima - 1]
    const admin = createAdminClient()
    const { error } = await admin.from('biblioteca_progresso').upsert(
      {
        user_id: user.id,
        modulo: config.slug,
        numero: estado.proxima,
        audio_id: audio?.id ?? null,
        concluida_em: new Date().toISOString(),
      },
      { onConflict: 'user_id,modulo,numero' },
    )
    if (error) throw error

    // Entra na constância da Home, como as outras rotinas.
    await supabase.from('checkins').upsert(
      { user_id: user.id, data: todayISO(), tipo: 'treino' },
      { onConflict: 'user_id,data,tipo', ignoreDuplicates: true },
    )

    return NextResponse.json({ ok: true, numero: estado.proxima })
  } catch (err) {
    captureException(err, { rota: 'biblioteca_completar' })
    return NextResponse.json({ error: 'no_pudimos_guardar' }, { status: 500 })
  }
}

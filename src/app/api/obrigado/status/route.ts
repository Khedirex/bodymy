import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Verifica se a conta da compradora já foi criada pelo webhook da Kiwify
// (assíncrono). Rota PÚBLICA usada pela página /obrigado para liberar o
// botão de acesso só quando houver conta + entitlement ativo.
// Resposta mínima ({ pronto }) para não vazar dados; email vem da URL da
// Kiwify pós-compra.
export async function GET(request: NextRequest) {
  const email = (request.nextUrl.searchParams.get('email') ?? '').trim().toLowerCase()
  // Validação leve de formato — evita consultas inúteis.
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ pronto: false })
  }

  try {
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (!profile) return NextResponse.json({ pronto: false })

    const { data: ent } = await admin
      .from('entitlements')
      .select('id')
      .eq('user_id', profile.id)
      .eq('status', 'ativo')
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ pronto: Boolean(ent) })
  } catch (err) {
    // Fail-safe: em erro, responde "não pronto" — a página segue tentando
    // e, no timeout, libera o botão mesmo assim.
    captureException(err, { rota: 'obrigado_status' })
    return NextResponse.json({ pronto: false })
  }
}

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { urlAssinadaDoAudio } from '@/lib/oraciones-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Devolve a URL assinada de UM áudio. O acesso é conferido no servidor:
// a tela mostra o cadeado, mas quem decide é o entitlement.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 })

  const { id } = (await request.json().catch(() => ({}))) as { id?: string }
  if (!id) return NextResponse.json({ error: 'faltan_parametros' }, { status: 400 })

  const url = await urlAssinadaDoAudio(user.id, id)
  if (!url) return NextResponse.json({ error: 'sin_acceso' }, { status: 403 })

  return NextResponse.json({ url })
}

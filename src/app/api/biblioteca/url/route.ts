import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registrarEscuta } from '@/lib/feedback-server'
import { urlAssinadaBiblioteca } from '@/lib/biblioteca-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// URL assinada de um áudio de biblioteca. O acesso é conferido no servidor.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 })

  const { id } = (await request.json().catch(() => ({}))) as { id?: string }
  if (!id) return NextResponse.json({ error: 'faltan_parametros' }, { status: 400 })

  const url = await urlAssinadaBiblioteca(user.id, id)
  if (!url) return NextResponse.json({ error: 'sin_acceso' }, { status: 403 })

  // Ela abriu o áudio: fica registrado para a pergunta de amanhã.
  await registrarEscuta(user.id, id)
  return NextResponse.json({ url })
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNutriAccess } from '@/lib/nutri'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Estado de acesso da nutricionista (usado pelo pop-up "7 días gratis").
export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 })

  const acesso = await getNutriAccess(supabase, user.id)
  return NextResponse.json({ acesso })
}

import 'server-only'
import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureException } from '@/lib/observability'
import { todayISO, addDaysISO } from '@/lib/dates'

// =====================================================================
// "¿Cómo fue anoche?"
//
// A pergunta não pode ser no fim do áudio: o objetivo do produto é que ela
// durma antes de terminar. Quem dorme não responde formulário — e quem
// responde é justamente quem NÃO dormiu, o que envenenaria o retorno.
//
// Então registramos o que ela abriu (audio_escutas) e perguntamos no dia
// seguinte, quando ela volta ao módulo e já sabe como foi a noite.
// =====================================================================

/**
 * Marca que ela abriu este áudio hoje. Idempotente por dia.
 *
 * O módulo é lido do próprio áudio: se viesse por parâmetro, cada rota
 * poderia escrever um valor diferente do que está no catálogo.
 */
export async function registrarEscuta(userId: string, audioId: string) {
  try {
    const admin = createAdminClient()
    const { data: audio } = await admin
      .from('audio_biblioteca')
      .select('modulo')
      .eq('id', audioId)
      .maybeSingle()
    if (!audio) return
    const modulo = audio.modulo as string

    await admin
      .from('audio_escutas')
      .upsert(
        { user_id: userId, audio_id: audioId, data: todayISO(), modulo },
        { onConflict: 'user_id,audio_id,data', ignoreDuplicates: true },
      )
  } catch (err) {
    // Registro de escuta é instrumento, não produto: nunca pode impedir
    // que o áudio toque.
    captureException(err, { etapa: 'registrar_escuta', userId, audioId })
  }
}

export interface PerguntaDeOntem {
  audioId: string
  titulo: string
  modulo: string
}

/**
 * O áudio de ONTEM que ela ainda não avaliou — ou null.
 *
 * Só ontem: perguntar sobre anteontem é cobrança, e sobre hoje é cedo
 * demais (ela acabou de ouvir, a noite ainda não aconteceu).
 */
export const perguntaDeOntem = cache(
  async (userId: string, modulo: string): Promise<PerguntaDeOntem | null> => {
    if (!userId) return null
    const ontem = addDaysISO(todayISO(), -1)

    try {
      const admin = createAdminClient()
      const { data: escutas } = await admin
        .from('audio_escutas')
        .select('audio_id, modulo, audio:audio_biblioteca(titulo)')
        .eq('user_id', userId)
        .eq('modulo', modulo)
        .eq('data', ontem)
        .order('criado_em', { ascending: false })
        .limit(5)

      if (!escutas || escutas.length === 0) return null

      const ids = escutas.map((e) => e.audio_id as string)
      const { data: jaRespondeu } = await admin
        .from('audio_feedback')
        .select('audio_id')
        .eq('user_id', userId)
        .in('audio_id', ids)

      const respondidos = new Set((jaRespondeu ?? []).map((r) => r.audio_id as string))
      const pendente = escutas.find((e) => !respondidos.has(e.audio_id as string))
      if (!pendente) return null

      return {
        audioId: pendente.audio_id as string,
        titulo: (pendente.audio as unknown as { titulo?: string })?.titulo ?? 'tu audio',
        modulo: pendente.modulo as string,
      }
    } catch (err) {
      captureException(err, { etapa: 'pergunta_de_ontem', userId, modulo })
      return null
    }
  },
)

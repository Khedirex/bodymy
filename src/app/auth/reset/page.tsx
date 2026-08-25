'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

// Página de redefinição de senha. O link de recuperação do Supabase abre
// aqui com os tokens no #fragment; estabelecemos a sessão de recuperação e
// mostramos o formulário de nova senha. (Client — o fragmento não chega ao
// servidor.)
export default function ResetPasswordPage() {
  const router = useRouter()
  const [pronto, setPronto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [ok, setOk] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const supabase = createClient()
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const access_token = hash.get('access_token')
    const refresh_token = hash.get('refresh_token')

    async function prep() {
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token }).catch(() => {})
        window.history.replaceState(null, '', window.location.pathname)
      }
      const { data } = await supabase.auth.getSession()
      if (data.session) setPronto(true)
      else setErro('Enlace inválido o vencido. Pide uno nuevo en «Olvidé mi contraseña».')
    }
    prep()
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (senha.length < 6) return setErro('La contraseña debe tener al menos 6 caracteres.')
    if (senha !== confirma) return setErro('Las contraseñas no coinciden.')
    setSalvando(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: senha })
    setSalvando(false)
    if (error) return setErro('No pudimos guardar la contraseña ahora. Inténtalo de nuevo.')
    setOk(true)
    setTimeout(() => {
      router.replace('/')
      router.refresh()
    }, 1500)
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-6 py-10">
      <h1 className="mb-4 text-center text-2xl font-extrabold text-ink-900">Crear nueva contraseña</h1>

      {ok ? (
        <div className="card text-center">
          <div className="mb-2 text-4xl" aria-hidden>✅</div>
          <p className="font-bold text-ink-900">¡Contraseña actualizada!</p>
          <p className="mt-1 text-sm text-ink-700">Te estamos llevando a la app…</p>
        </div>
      ) : !pronto && !erro ? (
        <div className="card text-center text-ink-700">Preparando…</div>
      ) : (
        <form onSubmit={salvar} className="card space-y-4">
          <div>
            <label className="mb-1.5 block font-semibold text-ink-800">Nueva contraseña</label>
            <input type="password" autoComplete="new-password" className="input" value={senha}
              onChange={(e) => setSenha(e.target.value)} placeholder="Al menos 6 caracteres" />
          </div>
          <div>
            <label className="mb-1.5 block font-semibold text-ink-800">Confirmar contraseña</label>
            <input type="password" autoComplete="new-password" className="input" value={confirma}
              onChange={(e) => setConfirma(e.target.value)} placeholder="Repite la contraseña" />
          </div>
          {erro ? <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">{erro}</p> : null}
          <button type="submit" className="btn-primary w-full" disabled={salvando || !pronto}>
            {salvando ? 'Guardando…' : 'Guardar nueva contraseña'}
          </button>
        </form>
      )}
    </div>
  )
}

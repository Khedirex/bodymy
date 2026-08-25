'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Opcional: criar/alterar uma senha para entrar mais rápido nas próximas
// vezes (sem depender do código por e-mail). Nunca obrigatório.
export function SetPassword() {
  const [aberto, setAberto] = useState(false)
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function salvar() {
    setErro(null)
    if (senha.length < 6) return setErro('La contraseña necesita tener al menos 6 caracteres.')
    if (senha !== confirma) return setErro('Las contraseñas no coinciden.')
    setSalvando(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: senha })
    setSalvando(false)
    if (error) return setErro('No pudimos guardar ahora. Inténtalo de nuevo.')
    setOk(true)
    setSenha('')
    setConfirma('')
    setAberto(false)
  }

  if (ok) {
    return (
      <div className="rounded-2xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-600">
        ✓ ¡Contraseña guardada! La próxima vez puedes entrar con correo y contraseña.
      </div>
    )
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="btn-secondary w-full">
        Crear una contraseña para entrar más rápido
      </button>
    )
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-bold text-ink-900">Crear contraseña (opcional)</p>
        <button onClick={() => setAberto(false)} className="text-sm font-semibold text-ink-700/60">Cancelar</button>
      </div>
      <input type="password" autoComplete="new-password" className="input" placeholder="Nueva contraseña (mín. 6)"
        value={senha} onChange={(e) => setSenha(e.target.value)} />
      <input type="password" autoComplete="new-password" className="input" placeholder="Confirmar contraseña"
        value={confirma} onChange={(e) => setConfirma(e.target.value)} />
      {erro ? <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">{erro}</p> : null}
      <button onClick={salvar} disabled={salvando} className="btn-primary w-full">
        {salvando ? 'Guardando…' : 'Guardar contraseña'}
      </button>
      <p className="text-xs text-ink-700/60">
        Puedes seguir entrando con código en cualquier momento. La contraseña es solo un atajo.
      </p>
    </div>
  )
}

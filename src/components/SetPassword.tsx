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
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.')
    if (senha !== confirma) return setErro('As senhas não são iguais.')
    setSalvando(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: senha })
    setSalvando(false)
    if (error) return setErro('Não conseguimos salvar agora. Tente novamente.')
    setOk(true)
    setSenha('')
    setConfirma('')
    setAberto(false)
  }

  if (ok) {
    return (
      <div className="rounded-2xl bg-sage-100 px-4 py-3 text-sm font-medium text-sage-600">
        ✓ Senha salva! Da próxima vez você pode entrar com e-mail e senha.
      </div>
    )
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="btn-secondary w-full">
        Criar uma senha para entrar mais rápido
      </button>
    )
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-bold text-ink-900">Criar senha (opcional)</p>
        <button onClick={() => setAberto(false)} className="text-sm font-semibold text-ink-700/60">Cancelar</button>
      </div>
      <input type="password" autoComplete="new-password" className="input" placeholder="Nova senha (mín. 6)"
        value={senha} onChange={(e) => setSenha(e.target.value)} />
      <input type="password" autoComplete="new-password" className="input" placeholder="Confirmar senha"
        value={confirma} onChange={(e) => setConfirma(e.target.value)} />
      {erro ? <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">{erro}</p> : null}
      <button onClick={salvar} disabled={salvando} className="btn-primary w-full">
        {salvando ? 'Salvando…' : 'Salvar senha'}
      </button>
      <p className="text-xs text-ink-700/60">
        Você continua podendo entrar por código a qualquer momento. A senha é só um atalho.
      </p>
    </div>
  )
}

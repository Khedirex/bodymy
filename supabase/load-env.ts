// Carrega .env.local (e .env) para process.env quando os scripts de seed
// rodam via tsx (que não lê .env automaticamente). Importar ANTES de
// qualquer leitura de process.env. Não sobrescreve variáveis já definidas.
import { readFileSync, existsSync } from 'node:fs'

function load(path: string) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim().replace(/^export\s+/, '')
    let val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    // Sanea a URL do Supabase (mesmas regras do app).
    if (key === 'NEXT_PUBLIC_SUPABASE_URL' && val) {
      val = val.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
    }
    if (!(key in process.env)) process.env[key] = val
  }
}

// .env.local tem prioridade sobre .env (carregado primeiro).
load('.env.local')
load('.env')

# Deploy do BodyMy em produção (Vercel + app.bodymy.com.br)

Guia completo para colocar o BodyMy no ar na Vercel com o domínio
`app.bodymy.com.br`. Faça na ordem.

---

## 0. Antes de tudo

- Domínio `bodymy.com.br` na Hostinger, verificado no Resend (envio OK de
  `acesso@bodymy.com.br`). ✅
- Supabase novo e limpo, com `supabase/schema.sql` aplicado e seeds rodados. ✅
- Build local passando: `npm run build`. ✅

---

## 1. Variáveis de ambiente na Vercel

Em **Vercel → Project → Settings → Environment Variables**, cadastre (ambiente
**Production**; pode marcar Preview também se quiser previews funcionais):

| Variável | Valor em produção | Secreta? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://SEU-PROJETO.supabase.co` (sem `/rest/v1`) | não (pública) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key do projeto | não (pública) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | **SIM — secreta** |
| `RESEND_API_KEY` | sua API key do Resend | **SIM — secreta** |
| `RESEND_FROM` | `BodyMy <acesso@bodymy.com.br>` | não |
| `KIWIFY_WEBHOOK_SECRET` | segredo do webhook da Kiwify | **SIM — secreta** |
| `NEXT_PUBLIC_APP_URL` | `https://app.bodymy.com.br` (sem `/**`, sem barra final) | não (pública) |
| `NEXT_PUBLIC_PANDA_PLAYER_HOST` | host do player do Panda (ex.: `player-vz-xxx.tv.pandavideo.com.br`) | não |
| `NEXT_PUBLIC_POSTHOG_KEY` | key do PostHog (opcional) | não |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` (ou seu host) | não |
| `SENTRY_DSN` | DSN do Sentry (servidor) — opcional | **SIM — secreta** |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN do Sentry (client) — opcional | não |
| `NEXT_PUBLIC_META_PIXEL_ID` | ID do Meta Pixel (opcional) | não |
| `DEV_TOOLS_ENABLED` | **`false`** | não |

> ⚠️ **`DEV_TOOLS_ENABLED=false` é obrigatório em produção.** Com `false`:
> o magic link **NÃO** é impresso no console e a rota
> `/api/dev/simulate-purchase` responde **404** (desabilitada).
>
> As chaves marcadas **secreta** nunca têm o prefixo `NEXT_PUBLIC_` e só são
> usadas em código de servidor. As `NEXT_PUBLIC_*` são embutidas no build —
> por isso precisam existir **no momento do build** (a Vercel garante isso).

---

## 2. Deploy na Vercel

1. **Add New → Project** → importe o repositório `Khedirex/bodymy`.
2. **Framework Preset:** Next.js (detectado automaticamente).
3. **Production Branch:** escolha a branch que vai para produção
   (`main` após o merge — ver seção 6 — ou a própria feature branch).
4. Cole as variáveis da seção 1.
5. **Deploy.** A Vercel roda `next build` e publica.
6. **Settings → Domains → Add** `app.bodymy.com.br`. A Vercel mostra o
   registro DNS a criar (ver seção 3).

---

## 3. DNS na Hostinger (subdomínio app.bodymy.com.br)

No hPanel da Hostinger → **DNS / Nameservers** do domínio `bodymy.com.br`, crie:

- **CNAME** — Host/Nome: `app` → Aponta para: `cname.vercel-dns.com`
  (a Vercel mostra o alvo exato na tela de domínios; use o que ela indicar).

> Alternativa que a Vercel também aceita: registro **A** de `app` para o IP
> `76.76.21.21`. Prefira o CNAME que o painel da Vercel indicar.
>
> Propagação leva de minutos a algumas horas. Quando a Vercel marcar o domínio
> como **Valid/Ready**, o HTTPS é emitido automaticamente.

Os registros **SPF/DKIM/DMARC** de e-mail já foram feitos para a verificação do
Resend — não precisa mexer de novo.

---

## 4. Supabase → Authentication → URL Configuration

1. **Site URL:** `https://app.bodymy.com.br`
2. **Redirect URLs** (adicione, com o wildcard `/**`):
   ```
   https://app.bodymy.com.br/**
   ```
   Mantenha também as de dev se ainda usar (`http://localhost:3000/**`,
   `https://SEU-CODESPACE-3000.app.github.dev/**`).

> O wildcard `/**` vive **só aqui** — nunca no `NEXT_PUBLIC_APP_URL`.

---

## 5. Kiwify (webhook de compra)

Aponte o webhook da Kiwify para:
```
https://app.bodymy.com.br/api/webhooks/kiwify?signature=<assinatura>
```
e confirme que o `KIWIFY_WEBHOOK_SECRET` na Vercel bate com o configurado lá.

---

## 6. Merge para main antes do deploy?

**Não é obrigatório** — a Vercel deploya de qualquer branch. Mas o padrão
saudável é ter `main` como branch de produção. Duas opções:

**A) Deploy direto da feature branch (mais rápido):**
Em Production Branch (seção 2.3), selecione `claude/bodymy-mvp-pwa-4siwe5`.
Bom para validar antes de mexer na main.

**B) Merge para `main` e deploy da main (recomendado a médio prazo):**
```bash
git checkout main
git pull origin main
git merge --no-ff claude/bodymy-mvp-pwa-4siwe5
git push origin main
```
(ou abra um Pull Request da feature branch para `main` e faça o merge pela UI
do GitHub — melhor para histórico/revisão). Depois aponte a Production Branch
da Vercel para `main`.

> Sugestão: comece pela opção A para validar em produção; depois faça o merge
> para `main` (opção B) e mude a Production Branch.

---

## 7. Checklist pós-deploy (teste nesta ordem)

1. **App abre:** acesse `https://app.bodymy.com.br` → redireciona para `/login`
   (sem erro de Supabase, sem `:porta` estranha na URL).
2. **PWA instalável:** no celular, o navegador oferece "Adicionar à tela inicial"
   (Android: prompt nativo; iOS: Compartilhar → Adicionar à Tela de Início).
   Ícone coral com coração, abre em tela cheia (standalone).
3. **Login por e-mail:** em `/login`, informe o e-mail de um usuário com acesso
   (ex.: `khedirex@gmail.com`). Deve aparecer "Enviamos seu link!" **sem** o
   aviso de modo dev.
4. **E-mail chega:** o magic link chega de `acesso@bodymy.com.br` (não é
   impresso em lugar nenhum). Clique nele.
5. **Callback + sessão:** o clique leva a `/auth/callback` e então para
   `/bem-vinda` (primeiro acesso) — autenticado, **sem** `link_invalido`.
6. **Onboarding:** escolha o horário → "Ir para o meu programa" → cai na Home
   autenticada.
7. **Trilha + player:** abra o programa, entre numa aula, "MARCAR COMO FEITO" →
   celebração + streak atualizado.
8. **Dieta / Progresso:** cardápio do dia carrega; em Progresso, registre uma
   foto (upload via URL assinada) e veja no calendário/linha do tempo.
9. **Vitrine/paywall:** em `/descubra`, um produto bloqueado leva a
   `/oferta/[slug]`; o botão vai ao checkout da Kiwify (Pixel `ViewContent`/
   `InitiateCheckout` disparam).
10. **Segurança:** confirme que `https://app.bodymy.com.br/api/dev/simulate-purchase`
    responde **404** (dev tools desabilitados em produção).
11. **Webhook (opcional):** faça uma compra de teste na Kiwify e confirme que a
    conta é criada + e-mail de boas-vindas chega.

Se algo falhar, os **logs da Vercel** (Deployments → Functions) mostram as
mensagens `[email:...]`, `[auth/...]` e `[BodyMy] URL base para redirects: ...`
para diagnóstico.

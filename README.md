# BodyMy

PWA de fitness e bem-estar (movimentos somáticos + hábitos) para o mercado brasileiro.
Área de membros de um negócio de infoprodutos low-ticket: a pessoa compra um
produto na **Kiwify**, um webhook cria a conta e libera o acesso, e todo o resto
do app fica visível porém bloqueado — cada cadeado é um ponto de venda.

> Todo o app é em **português do Brasil**, mobile-first, com linguagem simples e
> acolhedora. Público: mulheres de 35–55 anos.

---

## Stack

| Camada        | Tecnologia                                              |
| ------------- | ------------------------------------------------------- |
| Framework     | Next.js 14 (App Router) + TypeScript                    |
| Estilo        | Tailwind CSS                                            |
| PWA           | `manifest.json` + service worker nativo (`public/sw.js`)|
| Banco / Auth  | Supabase (Postgres + RLS, Auth magic link, Storage)     |
| E-mail        | Resend (boas-vindas + magic link pós-compra)            |
| Vídeo         | Panda Video (embed via iframe; guardamos só o `panda_video_id`) |
| Analytics     | PostHog (produto) + Meta Pixel (ads)                    |
| Erros         | Sentry                                                  |
| Deploy        | Vercel                                                  |

---

## Rodando localmente

### 1. Pré-requisitos
- Node.js 20+
- Um projeto Supabase (grátis serve)

### 2. Instalar
```bash
npm install
```

### 3. Variáveis de ambiente
Copie o exemplo e preencha:
```bash
cp .env.example .env.local
```
Veja `.env.example` para a descrição de cada variável. Para rodar a **UI** em
dev você precisa no mínimo de `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Para o **fluxo de compra** e o **seed** você
precisa também de `SUPABASE_SERVICE_ROLE_KEY`.

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` só é usada em código de servidor
> (rotas de API / server actions / seed). Nunca a exponha no client e nunca a
> prefixe com `NEXT_PUBLIC_`.

### Painel admin (`/admin`)

Ferramenta interna protegida por `is_admin` (verificado sempre no servidor;
não-admin recebe **404**). `is_admin` só é alterável por **SQL direto** — nunca
pela interface. Telas: visão geral, alunas (busca/ficha, conceder/revogar
acesso, reenviar e-mail), produtos (editar, integração Kiwify, `sales_page` com
preview, e a **esteira de upsell** de cada produto). Toda ação administrativa
gera registro em `admin_logs`.

Modelo multi-oferta: a **vitrine** de cada aluna mostra apenas os **upsells**
dos produtos que ela possui (isolamento reforçado por RLS em `products`).

### 4. Banco de dados

**Projeto Supabase NOVO e vazio (recomendado) — uma execução:**
No SQL Editor do projeto (que deve ser EXCLUSIVO do BodyMy), rode em ordem:
1. `supabase/schema.sql` — cria as 13 tabelas + RLS + policies + funções +
   trigger `is_admin` + bucket, recarrega o cache do PostgREST e imprime um
   quadro de verificação ao final. (Sem DROPs — se algo já existir, ele falha
   alto de propósito.)
2. `supabase/storage-setup.sql` — policies do bucket `progress-photos`
   (isolado porque criar policy em `storage.objects` pode exigir privilégio de
   owner; se falhar, dá para configurar pelo Dashboard → Storage → Policies).

**Alternativa por migrations** (`supabase/migrations`, fonte da verdade para
produção): aplique em ordem `0001_schema.sql` → `0002_rls.sql` →
`0003_functions.sql` → `0004_admin.sql` → `0005_upsells_admin.sql` →
`0006_ritual_tapetinho.sql` → `0007_circuito.sql`, via `supabase db push` ou
colando cada uma no SQL Editor.

### Circuito de vídeo adaptativo (`0007_circuito.sql`)

O formato principal é um **circuito**: Semana Zero (3 dias de alongamento) e
depois 4 semanas de **5 exercícios/dia**, com séries, descanso e variação
(v1–v4) que se ajustam pelo feedback da aluna ao fim de cada sessão. A
migração cria as 8 tabelas do circuito (RLS dono-apenas) e os **150 slots de
vídeo** (35 exercícios × 4 variações + 10 alongamentos) com `panda_video_id`
NULL — o admin preenche em **/admin/exercicios**. É idempotente e não toca nas
28 aulas de movimento somático, que viram material complementar em
**/entenda** ("Entenda a prática"). Um dia concluído gera check-in `treino`,
então streak e constância seguem funcionando como antes.

### Migração do programa (Ritual do Tapetinho)

A troca do programa em **produção** é a migração `0006_ritual_tapetinho.sql`.
Ela é **idempotente** e **NÃO** altera `kiwify_product_id` nem
`kiwify_checkout_url` — os acessos ativos continuam valendo, sem novo
entitlement. O programa antigo apenas fica `ativo=false` (conteúdo preservado
no banco, reversível). Cole o arquivo no SQL Editor e confira as consultas de
verificação ao final. O arquivo é **gerado** a partir da fonte única
`supabase/content/ritual-do-tapetinho.ts`:
```bash
npm run gen:ritual-sql   # regenera supabase/migrations/0006_ritual_tapetinho.sql
```

> **Nunca** rode `supabase/reset-dev.sql` num projeto que não seja exclusivo do
> BodyMy — ele dá DROP em todas as tabelas.
>
> Os scripts de seed têm um **guard**: se o banco conectado não for o do BodyMy
> (sem `entitlements` / `products` sem `kiwify_product_id`), eles abortam com
> mensagem clara antes de qualquer operação.

### 5. Seed
Popula o programa Ritual do Tapetinho completo (4 semanas × 7 dias), produtos
bloqueados de exemplo, plano de dieta base e um usuário de teste com acesso:
```bash
npm run seed
```
Usuário de teste criado: **teste@bodymy.app** (com acesso ao Ritual do Tapetinho).
Faça login em `/login` com esse e-mail para receber o magic link.

### 6. Rodar
```bash
npm run dev
```
Abra http://localhost:3000.

---

## Simulando uma compra (sem a Kiwify)

Em dev (`DEV_TOOLS_ENABLED=true`), há uma rota que dispara o mesmo
processamento do webhook, criando conta + acesso + e-mail:

```bash
curl -X POST http://localhost:3000/api/dev/simulate-purchase \
  -H 'content-type: application/json' \
  -d '{
    "email": "nova@cliente.com",
    "nome": "Nova Cliente",
    "kiwify_product_id": "kiwify_ritual_tapetinho"
  }'
```

Sem `RESEND_API_KEY` configurada, o magic link é **impresso no console** do
servidor — copie a URL para acessar a conta recém-criada.

Para simular reembolso/chargeback (revoga o acesso), envie
`"tipo": "reembolso"` ou `"tipo": "chargeback"`.

---

## E-mail (Resend)

Tanto o **magic link de login** quanto o **e-mail de boas-vindas do webhook**
usam o **mesmo caminho** (`src/lib/email.ts` → Resend). Não usamos o SMTP do
Supabase Auth. Todo envio loga no console: `[email:login] enviando via Resend…`,
o `id` em caso de sucesso, ou `[email:<ctx>] Resend FALHOU: {status,name,message}`
em caso de erro — nada é engolido em silêncio.

### Formato do remetente
`RESEND_FROM` deve ser **`Nome <email@dominio>`** (ex.: `BodyMy <ola@seudominio.com>`).

### Modo de teste (sem domínio verificado) — para dev
Deixe `RESEND_FROM` **vazio**. O código cai no remetente de teste do Resend
**`onboarding@resend.dev`**, que envia **sem verificar domínio**. Limitação: no
modo de teste o Resend só entrega para **o e-mail dono da conta Resend**. Como
`khedirex@gmail.com` é (provavelmente) o dono da conta, você recebe normalmente.
Para enviar a **qualquer** endereço, é preciso verificar um domínio (abaixo).

### Produção — verificar domínio (Resend + Hostinger)
1. No Resend: **Domains → Add Domain** → informe seu domínio (ex.: `seudominio.com`).
2. O Resend mostra registros DNS. Na **Hostinger** (hPanel → **DNS / Nameservers**
   do domínio), crie os registros exatamente como o Resend pedir:
   - **TXT** de verificação (SPF): normalmente `v=spf1 include:amazonses.com ~all`
     (host `@` ou o subdomínio indicado).
   - **DKIM**: 1–3 registros **CNAME** (host tipo `resend._domainkey…`) apontando
     para os valores `…dkim.amazonses.com` que o Resend fornece.
   - **DMARC** (recomendado): **TXT** em `_dmarc` com `v=DMARC1; p=none;`.
   > Copie/valore **exatamente** o que o painel do Resend exibir — os valores DKIM
   > são únicos por domínio. Propagação de DNS pode levar de minutos a algumas horas.
3. Quando o Resend marcar o domínio como **Verified**, defina
   `RESEND_FROM="BodyMy <ola@seudominio.com>"` (um e-mail **do domínio verificado**)
   e reinicie/redeploy.

### O que fica pronto no código
- Fallback automático para `onboarding@resend.dev` quando `RESEND_FROM` está
  vazio **ou em formato inválido** (evita o erro 422 "domain is invalid").
- Logs explícitos de tentativa/sucesso/erro nos dois e-mails.
- Aviso claro quando `RESEND_API_KEY` está vazia (não falha em silêncio).

### Validar o envio isoladamente
```bash
npm run test:email -- seu@email.com
```
Dispara um e-mail de teste e imprime o resultado detalhado do Resend
(`id` no sucesso; `status`/`name`/`message` + dica no erro). Não depende do
fluxo de login.

---

## URLs de ambiente (sanitização + Redirect URLs do Supabase)

O app **sanea as URLs em runtime** — erros comuns de cópia são removidos
automaticamente (e o `check:env` também avisa):

| Variável | Sanitização automática |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | remove `/rest/v1` e barra final → deve terminar em `.supabase.co` |
| `NEXT_PUBLIC_APP_URL` | remove `/**`, `/*`, query/hash e barra final |
| `RESEND_FROM` | se não for `Nome <email@dominio>`, cai no remetente de teste |

### ⚠️ O wildcard `/**` é do Supabase, NUNCA do `.env`
No painel do Supabase, em **Authentication → URL Configuration → Redirect URLs**,
você adiciona os padrões **com** wildcard, por exemplo:
```
http://localhost:3000/**
https://SEU-CODESPACE-3000.app.github.dev/**
https://seu-dominio.com/**
```
Esse `/**` autoriza qualquer caminho de callback — ele vive **só ali**. Ele
**não pode** ir para `NEXT_PUBLIC_APP_URL` (que deve ser só a origem, ex.:
`https://seu-dominio.com`). Se o `/**` vazar para o `.env`, o `redirect_to` do
magic link fica quebrado — por isso o app agora remove o wildcard
automaticamente, mas o certo é não colocá-lo lá.

### Codespaces (GitHub)
Se `NEXT_PUBLIC_APP_URL` estiver **ausente ou apontando para localhost** e a
variável `CODESPACE_NAME` existir, o app monta sozinho
`https://<CODESPACE_NAME>-3000.app.github.dev`. No startup, o servidor loga
`[BodyMy] URL base para redirects: <url>` para você conferir. Lembre de
adicionar essa URL (com `/**`) nas Redirect URLs do Supabase.

---

## Webhook da Kiwify

`POST /api/webhooks/kiwify`

1. **Assinatura** — valida um HMAC-SHA1 (hex) do corpo bruto com
   `KIWIFY_WEBHOOK_SECRET`, no query param `?signature=` (ou header
   `x-kiwify-signature`). Assinatura inválida → `401`.
   Se a sua conta Kiwify usar outro esquema de assinatura, ajuste
   `verifyKiwifySignature` em `src/lib/kiwify.ts`.
2. **Idempotência** — cada evento é registrado em `webhook_events`; eventos já
   processados retornam `200` sem duplicar.
3. **Compra aprovada** — localiza o `product` pelo `kiwify_product_id`, cria (ou
   encontra) o usuário via Admin API com e-mail confirmado, cria o `profile`,
   faz upsert do `entitlement` (reativa se estava revogado) e envia o e-mail de
   boas-vindas com magic link.
4. **Reembolso / chargeback** — marca o entitlement como `revogado`.
5. **Erro** — loga no Sentry e retorna `500` para a Kiwify reenviar.

Configure na Kiwify a URL do webhook apontando para
`https://SEU_DOMINIO/api/webhooks/kiwify?signature=...` e mapeie o
`kiwify_product_id` de cada produto na tabela `products`.

---

## Modelo de acesso (regra central)

- **Conteúdo bloqueado nunca é escondido** — ele é a vitrine. Cada cadeado leva a
  `/oferta/[slug]`, que renderiza o `sales_page` do produto e leva ao checkout
  da Kiwify.
- **A validação de acesso é sempre no servidor.** As aulas (`lessons`) não têm
  policy de leitura para o client no RLS: o conteúdo só é montado em Server
  Components/rotas após `userHasEntitlement(...)` (`src/lib/entitlements.ts`).
- **Novo programa = novos registros no banco**, zero código novo: basta inserir
  `products` + `programs`/`program_weeks`/`program_days`/`lessons` (e o
  entitlement liberador). A arquitetura já lida com trilha, desbloqueio
  sequencial, vitrine e paywall genericamente.

---

## Telas

`/login` · `/bem-vinda` (onboarding) · `/` (Home) · `/programa/[slug]` (trilha) ·
`/programa/[slug]/aula/[id]` (player) · `/dieta` · `/progresso` · `/descubra` ·
`/oferta/[slug]` · `/perfil`. Navegação por bottom tab bar de 5 itens.

---

## PWA

- `public/manifest.json` — nome, ícones 192/512 (+ maskable), `display:
  standalone`, `theme_color` coral, orientação retrato.
- `public/sw.js` — cache do shell/estáticos; conteúdo dinâmico (aulas, dados do
  usuário, APIs) sempre da rede. Registrado **apenas em produção**
  (`src/components/pwa/ServiceWorkerRegister.tsx`).
- Prompt de instalação customizado no onboarding e banner discreto na Home
  (`beforeinstallprompt` no Android; passo a passo no iOS).
- Ícones gerados por `scripts/generate-icons.mjs` (`node scripts/generate-icons.mjs`).

---

## Compliance

- A seção de dieta é **conteúdo educativo**, com disclaimer fixo:
  _"Este conteúdo é educativo e não substitui acompanhamento de nutricionista ou
  médico."_
- O copy nunca promete perda de peso com números/prazos — foco em constância,
  energia, bem-estar e hábito.
- **Peso** é métrica opcional no progresso e nunca destacada como principal.

---

## Deploy na Vercel

1. Importe o repositório na Vercel.
2. Configure todas as variáveis de `.env.example` em **Project → Settings →
   Environment Variables** (defina `DEV_TOOLS_ENABLED=false` em produção para
   desabilitar `/api/dev/simulate-purchase`).
3. Defina `NEXT_PUBLIC_APP_URL` com o domínio final (usado no redirect do magic
   link e do webhook).
4. No Supabase → Auth → URL Configuration, adicione o domínio às **Redirect
   URLs** (`https://SEU_DOMINIO/auth/callback`).
5. Aponte o webhook da Kiwify para `https://SEU_DOMINIO/api/webhooks/kiwify`.
6. (Opcional) Sentry: configure `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`.

---

## Scripts

| Comando           | O quê                                  |
| ----------------- | -------------------------------------- |
| `npm run dev`     | ambiente de desenvolvimento (roda `setup:env` + `check:env` antes) |
| `npm run build`   | build de produção                      |
| `npm run start`   | roda o build                           |
| `npm run seed`    | popula o banco (usa a service role key)|
| `npm run seed:admin` | cria o usuário dono/admin de teste (khedirex@gmail.com, "Willian", `is_admin=true`, acesso ao Ritual do Tapetinho) |
| `npm run grant:access -- email "Nome" [slug] --confirm` | concede acesso manual a uma aluna (cria user + profile + entitlement ativo); idempotente; exige `--confirm` |
| `npm run send:welcome -- email --confirm` | envia o e-mail de boas-vindas (com link) para uma aluna já cadastrada; exige `--confirm` |
| `npm run setup:env` | cria `.env.local` a partir de `.env.example` (se faltar) e sanea |
| `npm run check:env` | valida Supabase + APP_URL (sem wildcard) + RESEND_FROM |
| `npm run whoami -- email` | diagnostica um e-mail (auth/profile/entitlements) |
| `npm run test:email -- email` | envia um e-mail de teste e mostra o resultado do Resend |
| `npm run typecheck` | checagem de tipos                    |
| `npm run lint`    | ESLint                                 |

> **Nota (NEXT_PUBLIC no build):** variáveis `NEXT_PUBLIC_*` são embutidas em
> tempo de **build**. Em `npm run dev` o Next lê o `.env.local` na inicialização
> (funciona direto). Em `build`/`start` e na Vercel, elas precisam existir no
> ambiente **no momento do build**.

### Login e envio de magic link

O login usa a rota de servidor `POST /api/auth/magic-link`, que:
- valida se o e-mail existe (não criamos conta no login — só quem comprou);
- gera o magic link via Supabase Auth (`generateLink`) e envia por **Resend**;
- distingue os erros: `nao_encontrado` (404, não comprou) vs falha técnica
  (`geracao_link`/`envio_email`/`consulta_falhou`) — a tela de login mostra
  mensagens diferentes para cada caso;
- **fallback de dev:** com `DEV_TOOLS_ENABLED=true`, além de enviar o e-mail, o
  link é **impresso no console do servidor** — dá para logar sem depender da
  caixa de entrada.

Obs.: o e-mail de login é enviado pelo **Resend** (não pelo SMTP do Supabase).
Sem `RESEND_API_KEY`, em dev o link ainda aparece no console.

---

## Decisões e premissas (MVP)

Quando a especificação era ambígua, escolhemos a opção **mais simples que
preserva as regras de negócio** (entitlements, conteúdo bloqueado visível,
validação de acesso no servidor):

- **Streak** conta dias consecutivos com ≥1 check-in de qualquer tipo, no fuso
  `America/Sao_Paulo`. Há implementação em TS (`src/lib/streak.ts`, usada nas
  rotas) e uma função SQL equivalente (`calcular_streak`) para uso direto no
  banco. Um check-in feito "ontem" mantém o streak vivo até o fim do dia de hoje.
- **Desbloqueio sequencial:** a aula do dia libera quando a anterior é
  concluída (`lesson_completions`).
- **Assinatura Kiwify:** assumimos HMAC-SHA1 do corpo bruto no query
  `?signature=`. Ponto único de ajuste em `verifyKiwifySignature`.
- **Idempotência do webhook:** `event_id` derivado de `webhook_event_id`, com
  fallback para `order_id:tipo`.
- **Sem cadastro público / plano gratuito:** o login (`signInWithOtp`) usa
  `shouldCreateUser: false` — só quem foi criado pelo webhook entra.
- **Fotos de progresso:** bucket privado `progress-photos`, path prefixado por
  `user_id/`; upload e leitura via URLs assinadas geradas no servidor.
- **Conteúdo gerenciado por seed/SQL** (sem painel admin no MVP), mas o código
  está estruturado para um admin futuro.
- **Cardápio "do dia":** rotaciona pelos dias do plano base conforme a data.

### Fora do escopo do MVP
Push, personalização automática de dieta, comunidade, lista de compras,
integrações de saúde, painel admin com UI, checkout dentro do app, app nativo.

# BodyMy

PWA de fitness e bem-estar (caminhada + hábitos) para o mercado brasileiro.
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

### 4. Banco de dados (migrations)
As migrations ficam em `supabase/migrations` e devem ser aplicadas em ordem:

- `0001_schema.sql` — tabelas
- `0002_rls.sql` — Row Level Security + bucket privado de fotos
- `0003_functions.sql` — função SQL de streak

Aplique de uma das formas:

**Via Supabase CLI** (recomendado):
```bash
supabase link --project-ref <seu-ref>
supabase db push
```

**Via SQL Editor do painel Supabase:** cole e rode cada arquivo, em ordem.

### 5. Seed
Popula o programa Caminhada Japonesa completo (4 semanas × 7 dias), produtos
bloqueados de exemplo, plano de dieta base e um usuário de teste com acesso:
```bash
npm run seed
```
Usuário de teste criado: **teste@bodymy.app** (com acesso ao Caminhada Japonesa).
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
    "kiwify_product_id": "kiwify_caminhada_japonesa"
  }'
```

Sem `RESEND_API_KEY` configurada, o magic link é **impresso no console** do
servidor — copie a URL para acessar a conta recém-criada.

Para simular reembolso/chargeback (revoga o acesso), envie
`"tipo": "reembolso"` ou `"tipo": "chargeback"`.

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
| `npm run dev`     | ambiente de desenvolvimento            |
| `npm run build`   | build de produção                      |
| `npm run start`   | roda o build                           |
| `npm run seed`    | popula o banco (usa a service role key)|
| `npm run typecheck` | checagem de tipos                    |
| `npm run lint`    | ESLint                                 |

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

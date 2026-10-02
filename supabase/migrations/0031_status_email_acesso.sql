-- =====================================================================
-- 0031_status_email_acesso.sql
-- BodyMy — tornar visível se a compradora recebeu o e-mail de acesso.
--
-- Até aqui o envio falhava em SILÊNCIO: o acesso era concedido, o e-mail
-- estourava, o erro ia para o Sentry e ninguém ficava sabendo. Foi assim que
-- 53 alunas compraram sem nunca receber instrução nenhuma.
--
-- Agora cada entitlement carrega o resultado do envio. Quem comprou e não
-- recebeu vira uma lista no painel, não uma descoberta por reclamação.
-- =====================================================================

alter table public.entitlements
  add column if not exists acesso_email_em timestamptz;

alter table public.entitlements
  add column if not exists acesso_email_erro text;

comment on column public.entitlements.acesso_email_em is
  'Quando o e-mail de acesso foi aceito pelo Resend. Null = nunca entregue.';
comment on column public.entitlements.acesso_email_erro is
  'Motivo da última falha de envio. Null quando o último envio deu certo.';

-- As compras antigas ficam com erro preenchido: elas realmente não
-- receberam, e precisam aparecer na lista de pendentes do painel.
update public.entitlements
   set acesso_email_erro = 'nunca enviado (RESEND_FROM inválido até 02/10/2026)'
 where acesso_email_em is null
   and acesso_email_erro is null
   and origem in ('hotmart', 'kiwify');

-- =====================================================================
-- 0032_biblioteca_audios.sql
-- BodyMy — biblioteca de áudios (Oración Milagrosa: 63 oraciones).
--
-- Dois princípios:
--
-- 1) ÁUDIO NÃO MORA NO REPOSITÓRIO. Os 7 do Ritual Noche Perfecta já pesam
--    48 MB em public/; 63 passariam de 400 MB no git e no deploy, para
--    sempre. Vão para um bucket PRIVADO do Storage e são servidos por URL
--    assinada de curta duração — o que também fecha o buraco de hoje, em que
--    /audios/noche/vn1.mp3 abre para qualquer um sem login.
--
-- 2) O CADEADO É POR ÁUDIO, não por módulo. Cada linha aponta para o produto
--    que a libera: as 20 primeiras oraciones vêm no bump, as 43 restantes
--    ficam visíveis com cadeado e viram upsell. É o mesmo entitlement de
--    sempre — nenhuma lista fixa no código decide acesso.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Bucket privado dos áudios
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select 'audios', 'audios', false, 52428800,
       array['audio/mpeg','audio/mp3','audio/mp4','audio/aac','audio/ogg','audio/wav']
 where not exists (select 1 from storage.buckets where id = 'audios');

-- ---------------------------------------------------------------------
-- 2) Catálogo
-- ---------------------------------------------------------------------
create table if not exists public.audio_biblioteca (
  id uuid primary key default gen_random_uuid(),
  -- Produto que LIBERA este áudio. É o que faz o cadeado por item funcionar.
  product_id uuid not null references public.products(id) on delete restrict,
  -- Mini-app que exibe o áudio ('oraciones', e o que vier depois).
  modulo text not null default 'oraciones',
  titulo text not null,
  descricao text,
  ordem int not null default 0,
  -- Caminho dentro do bucket 'audios'.
  storage_path text not null unique,
  duracao_seg int,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create index if not exists audio_biblioteca_modulo_ordem_idx
  on public.audio_biblioteca (modulo, ordem);

-- RLS ligada e SEM policy: a leitura passa pelo servidor, que confere o
-- entitlement antes de assinar a URL. Nenhum client fala com esta tabela.
alter table public.audio_biblioteca enable row level security;

-- ---------------------------------------------------------------------
-- 3) O upsell das 43 restantes
-- ---------------------------------------------------------------------
do $$
declare
  v_colecao uuid;
  v_oracion uuid;
  v_noche uuid;
begin
  update public.products
     set nome = 'Colección Completa — 63 Oraciones',
         tipo = 'extra',
         descricao = 'Las 43 oraciones que faltan, desbloqueadas para siempre.',
         ativo = true
   where slug = 'oraciones-coleccion-completa';

  insert into public.products (slug, nome, tipo, descricao, ativo)
  select 'oraciones-coleccion-completa', 'Colección Completa — 63 Oraciones', 'extra',
         'Las 43 oraciones que faltan, desbloqueadas para siempre.', true
   where not exists (select 1 from public.products where slug = 'oraciones-coleccion-completa');

  select id into v_colecao from public.products where slug = 'oraciones-coleccion-completa';
  select id into v_oracion from public.products where slug = 'oracion-noches-bendecidas';
  select id into v_noche   from public.products where slug = 'ritual-noche-perfecta';

  -- Quem tem o bump (ou o front) passa a ver a coleção completa na vitrine.
  if v_oracion is not null then
    update public.product_upsells set ordem = 1, ativo = true
     where product_id = v_oracion and upsell_product_id = v_colecao;
    insert into public.product_upsells (product_id, upsell_product_id, ordem, ativo)
    select v_oracion, v_colecao, 1, true
     where not exists (
       select 1 from public.product_upsells
        where product_id = v_oracion and upsell_product_id = v_colecao);
  end if;

  if v_noche is not null then
    update public.product_upsells set ordem = 6, ativo = true
     where product_id = v_noche and upsell_product_id = v_colecao;
    insert into public.product_upsells (product_id, upsell_product_id, ordem, ativo)
    select v_noche, v_colecao, 6, true
     where not exists (
       select 1 from public.product_upsells
        where product_id = v_noche and upsell_product_id = v_colecao);
  end if;
end $$;

-- O hotmart_product_id da coleção fica NULO até você me passar o id do
-- produto na Hotmart. Até lá a compra dela não é liberada sozinha — mas
-- também não some em silêncio: desde 3beebc4 o webhook devolve 500 e a
-- Hotmart reenvia assim que o id for preenchido.

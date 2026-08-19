-- =====================================================================
-- 0011_drenagem_tailandesa.sql
-- BodyMy — Renomeia o produto/programa principal para
-- "Protocolo 28 Dias: Drenagem Tailandesa" (slug drenagem-tailandesa).
--
-- Idempotente. RENAME EM LUGAR (não recria conteúdo):
--   1. Localiza o produto por qualquer slug conhecido (novo + anteriores) —
--      NÃO altera kiwify_product_id nem kiwify_checkout_url, então os
--      entitlements ativos continuam valendo (sem novo acesso).
--   2. Atualiza nome, slug, descrição e sales_page do produto.
--   3. Renomeia o PROGRAMA ativo NO LUGAR (mesmo id) — preserva program_id,
--      logo as lesson_completions das alunas continuam válidas: nenhuma perde
--      progresso. Streak e check-ins são independentes de programa.
--
-- Posicionamento: movimentos inspirados na massagem tailandesa. Sem alegação
-- de drenagem linfática/efeito terapêutico, sem promessa de emagrecimento,
-- medidas ou prazos.
-- =====================================================================

do $migration$
declare
  v_product_id uuid;
  v_program_id uuid;
  v_sales jsonb := $sales${
    "headline": "Reserve 28 dias para cuidar do seu corpo, no seu ritmo",
    "subheadline": "Movimentos suaves inspirados na massagem tailandesa — sem academia, sem equipamento, sem pressa.",
    "bullets": [
      "Práticas guiadas de 10 a 25 minutos, dia a dia",
      "Movimentos lentos e conscientes inspirados na massagem tailandesa",
      "Feito para quem está começando — respeitando os seus limites"
    ],
    "cta_label": "QUERO O PROTOCOLO"
  }$sales$::jsonb;
  v_prod_nome text := 'Protocolo 28 Dias: Drenagem Tailandesa';
  v_prod_desc text := 'Movimentos suaves inspirados na massagem tailandesa: 28 dias de prática lenta e consciente para relaxar o corpo e soltar a tensão do dia, no seu ritmo e sem equipamento.';
  v_prog_nome text := 'Protocolo 28 Dias: Drenagem Tailandesa';
  v_prog_desc text := 'Prática progressiva de 4 semanas com movimentos inspirados na massagem tailandesa — lentos e conscientes, para relaxar, respirar melhor e soltar a tensão, no seu ritmo.';
begin
  -- 1) Localiza o produto (prioriza o slug novo; depois os anteriores).
  select id into v_product_id
    from public.products
   where slug in ('drenagem-tailandesa', 'ritual-do-tapetinho', 'pilates-somatico', 'caminhada-japonesa')
   order by case slug
              when 'drenagem-tailandesa' then 0
              when 'ritual-do-tapetinho' then 1
              when 'pilates-somatico'    then 2
              when 'caminhada-japonesa'  then 3
              else 99 end
   limit 1;

  if v_product_id is null then
    raise exception 'Produto base nao encontrado (slugs conhecidos). Nada foi alterado.';
  end if;

  -- 2) Atualiza o produto. NÃO toca em kiwify_product_id / kiwify_checkout_url.
  update public.products
     set nome       = v_prod_nome,
         slug       = 'drenagem-tailandesa',
         descricao  = v_prod_desc,
         sales_page = v_sales,
         ativo      = true
   where id = v_product_id;

  -- 3) Renomeia o programa ativo NO LUGAR (preserva o id → progresso intacto).
  if exists (select 1 from public.programs where slug = 'drenagem-tailandesa') then
    -- Já renomeado (re-run): só garante nome/descrição atualizados.
    update public.programs
       set nome = v_prog_nome, descricao = v_prog_desc, ativo = true
     where slug = 'drenagem-tailandesa';
  else
    -- Pega o programa ativo do produto (por slug conhecido) e renomeia-o.
    select id into v_program_id
      from public.programs
     where product_id = v_product_id
       and slug in ('ritual-do-tapetinho', 'pilates-somatico', 'caminhada-japonesa')
     order by ativo desc, case slug
                            when 'ritual-do-tapetinho' then 0
                            when 'pilates-somatico'    then 1
                            else 2 end
     limit 1;

    if v_program_id is not null then
      update public.programs
         set slug = 'drenagem-tailandesa', nome = v_prog_nome, descricao = v_prog_desc, ativo = true
       where id = v_program_id;
    end if;
  end if;

  raise notice 'OK: produto % renomeado para drenagem-tailandesa (kiwify_* preservados).', v_product_id;
end
$migration$;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
-- Produto (kiwify_* devem permanecer os originais):
select slug, nome, ativo, kiwify_product_id, kiwify_checkout_url
  from public.products where slug = 'drenagem-tailandesa';

-- Programa renomeado no lugar (mesmo id de antes → progresso preservado):
select p.slug, p.nome, p.ativo
  from public.programs p
  join public.products pr on pr.id = p.product_id
 where pr.slug = 'drenagem-tailandesa'
 order by p.ativo desc, p.slug;

-- Entitlements ativos continuam válidos (contagem por produto):
select count(*) as entitlements_ativos
  from public.entitlements e
  join public.products pr on pr.id = e.product_id
 where pr.slug = 'drenagem-tailandesa' and e.status = 'ativo';

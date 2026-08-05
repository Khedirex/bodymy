-- =====================================================================
-- BodyMy — Funções SQL
-- Streak calculado no servidor considerando o fuso America/Sao_Paulo.
-- (Há também uma implementação equivalente em TS em src/lib/streak.ts;
--  esta função permite calcular direto no banco quando conveniente.)
-- =====================================================================

create or replace function public.calcular_streak(p_user_id uuid)
returns table (streak_atual int, streak_recorde int, fez_hoje boolean)
language plpgsql
security invoker
stable
as $$
declare
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v_dates date[];
  v_atual int := 0;
  v_recorde int := 0;
  v_run int := 0;
  v_prev date;
  v_cur date;
  v_ancora date;
  v_fez_hoje boolean;
begin
  -- Datas únicas com pelo menos um check-in, ordenadas.
  select array_agg(distinct data order by data)
    into v_dates
  from public.checkins
  where user_id = p_user_id;

  if v_dates is null then
    return query select 0, 0, false;
    return;
  end if;

  -- Recorde: maior sequência consecutiva em toda a história.
  v_prev := null;
  foreach v_cur in array v_dates loop
    if v_prev is not null and v_cur - v_prev = 1 then
      v_run := v_run + 1;
    else
      v_run := 1;
    end if;
    if v_run > v_recorde then
      v_recorde := v_run;
    end if;
    v_prev := v_cur;
  end loop;

  v_fez_hoje := v_hoje = any(v_dates);

  -- Streak atual: conta para trás a partir de hoje (ou ontem, se ainda
  -- não houve check-in hoje — não quebramos antes do fim do dia).
  if v_fez_hoje then
    v_ancora := v_hoje;
  elsif (v_hoje - 1) = any(v_dates) then
    v_ancora := v_hoje - 1;
  else
    return query select 0, v_recorde, v_fez_hoje;
    return;
  end if;

  v_cur := v_ancora;
  while v_cur = any(v_dates) loop
    v_atual := v_atual + 1;
    v_cur := v_cur - 1;
  end loop;

  return query select v_atual, v_recorde, v_fez_hoje;
end;
$$;

-- =====================================================================
-- 0025_reto_cama_14_dias.sql
-- BodyMy — "Protocolo Descompresión Articular — Reto 14 días" passa a ser
-- o reto de 14 dias NA CAMA: 1 vídeo + 1 texto de apoio por dia.
--
-- GERADO por scripts/gen-reto-cama.ts a partir de
-- supabase/content/reto-cama-14-dias.ts e reto-cama-ejercicios.ts.
-- NÃO edite à mão — altere a fonte e regenere (npm run gen:reto-cama).
--
-- O que faz (idempotente):
--   1. programs.formato ('circuito' | 'aula_diaria'). O programa canônico
--      passa a 'aula_diaria': /treino mostra o vídeo + texto do dia em vez
--      do circuito cronometrado. O catálogo do circuito NÃO é apagado.
--   2. Substitui as leituras antigas pelas novas: Bienvenida (dia 0) +
--      Días 1–14. Os program_days/lessons existentes são REAPROVEITADOS em
--      ordem (mesmos ids); os que sobram são removidos.
--   3. Só na PRIMEIRA aplicação: zera panda_video_id das aulas reaproveitadas
--      (eram vídeos do conteúdo antigo) e as conclusões antigas delas.
--      Reaplicar a migração atualiza os textos e PRESERVA os vídeos já
--      cadastrados.
--
-- Não toca em: produtos, entitlements, checkout, Kiwify/Hotmart, auth,
-- outros programas, nem na posição das alunas (semana/dia seguem iguais).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Formato do programa
-- ---------------------------------------------------------------------
alter table public.programs
  add column if not exists formato text not null default 'circuito';

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.programs'::regclass
       and conname = 'programs_formato_check'
  ) then
    alter table public.programs
      add constraint programs_formato_check check (formato in ('circuito', 'aula_diaria'));
  end if;
end $$;

create table if not exists public.app_migrations (
  chave text primary key,
  aplicada_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) Aulas do reto (bienvenida + 14 días)
-- ---------------------------------------------------------------------
do $reto$
declare
  v_aulas      jsonb := $aulas$[{"numero":0,"dia_titulo":"Bienvenida","titulo":"Bienvenida — Empieza aquí","tipo":"guia","duracao_min":3,"conteudo":{"intro":"Bienvenida a tu reto de 14 días. Todo se hace acostada en tu cama. Solo necesitas entre 10 y 20 minutos al día.","blocos":[{"tipo":"texto","titulo":"Para quién es","conteudo":"Para mujeres de 45 años o más.\nCon artritis, artrosis o desgaste en las articulaciones.\nPara ti, si te cuesta moverte al despertar.\nPara ti, si quieres aflojar el cuerpo sin salir de la cama."},{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana.\nNada más."},{"tipo":"aviso","titulo":"Antes de empezar","conteudo":"Consulta a tu médico o fisioterapeuta antes de empezar.\nSobre todo si tienes prótesis, una cirugía reciente u osteoporosis avanzada.\nEste reto no reemplaza tu tratamiento.\nSi algo te preocupa, para y consulta."},{"tipo":"passo","titulo":"Cómo usar este reto","conteudo":"Haz un día por vez.\nPon el video del día.\nEscucha a Lucy y haz lo que ella dice.\nNo necesitas mirar la pantalla.\nAl terminar, toca el botón «Terminé».\nSi un día no puedes, sigue al día siguiente."},{"tipo":"texto","titulo":"Cómo está armado","conteudo":"Días 1 a 7: despertar y aflojar el cuerpo.\nDías 8 a 14: sumar fuerza, poco a poco.\nDías 7 y 14: una prueba corta para ver cómo vas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Un consejo","conteudo":"Hazlo a la misma hora cada día. Por ejemplo, al despertar."}]}},{"numero":1,"dia_titulo":"Día 1","titulo":"Día 1 — Conoce tu cuerpo","tipo":"video","duracao_min":14,"conteudo":{"intro":"Hoy vas a conocer las cinco posiciones del reto. Todo es suave, lento y en tu cama.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"passo","titulo":"Despertar pies y manos","conteudo":"5 veces.\nAguanta 5 segundos con los pies hacia ti.\nPies y manos al mismo tiempo."},{"tipo":"passo","titulo":"Aplastar la toalla","conteudo":"5 veces con cada rodilla.\nAguanta 5 segundos apretando."},{"tipo":"passo","titulo":"Almeja de lado","conteudo":"5 veces de cada lado.\nAguanta 5 segundos con la rodilla arriba."},{"tipo":"passo","titulo":"Mecer las rodillas y pegar la espalda","conteudo":"Mecer: 5 veces. Aguanta 5 segundos de cada lado.\nPegar la espalda: 5 veces. Aguanta 5 segundos."},{"tipo":"passo","titulo":"Deslizar los brazos y respirar","conteudo":"5 veces.\nAguanta 5 segundos con los brazos arriba.\nAl final, 3 respiraciones lentas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana repites lo mismo, con una vez más."}]}},{"numero":2,"dia_titulo":"Día 2","titulo":"Día 2 — Repetir con calma","tipo":"video","duracao_min":15,"conteudo":{"intro":"Hoy vas a repetir las cinco posiciones de ayer. Cada ejercicio sube a seis veces.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"passo","titulo":"Despertar pies y manos","conteudo":"6 veces.\nAguanta 5 segundos con los pies hacia ti.\nPies y manos al mismo tiempo."},{"tipo":"passo","titulo":"Aplastar la toalla","conteudo":"6 veces con cada rodilla.\nAguanta 5 segundos apretando."},{"tipo":"passo","titulo":"Almeja de lado","conteudo":"6 veces de cada lado.\nAguanta 5 segundos con la rodilla arriba."},{"tipo":"passo","titulo":"Mecer las rodillas y pegar la espalda","conteudo":"Mecer: 6 veces. Aguanta 5 segundos de cada lado.\nPegar la espalda: 6 veces. Aguanta 5 segundos."},{"tipo":"passo","titulo":"Deslizar los brazos y respirar","conteudo":"6 veces.\nAguanta 5 segundos con los brazos arriba.\nAl final, 3 respiraciones lentas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana vas a mover el cuerpo al ritmo de tu respiración."}]}},{"numero":3,"dia_titulo":"Día 3","titulo":"Día 3 — Respira con ritmo","tipo":"video","duracao_min":19,"conteudo":{"intro":"Hoy vas a mover el cuerpo al ritmo de tu respiración. Sueltas el aire cuando haces fuerza.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"passo","titulo":"Despertar pies y manos","conteudo":"8 veces.\nAguanta 6 segundos con los pies hacia ti.\nPies y manos al mismo tiempo."},{"tipo":"passo","titulo":"Aplastar la toalla","conteudo":"8 veces con cada rodilla.\nAguanta 6 segundos apretando."},{"tipo":"passo","titulo":"Almeja de lado","conteudo":"8 veces de cada lado.\nAguanta 6 segundos con la rodilla arriba."},{"tipo":"passo","titulo":"Mecer las rodillas y pegar la espalda","conteudo":"Mecer: 8 veces. Aguanta 6 segundos de cada lado.\nPegar la espalda: 8 veces. Aguanta 6 segundos."},{"tipo":"passo","titulo":"Deslizar los brazos y respirar","conteudo":"8 veces.\nAguanta 6 segundos con los brazos arriba.\nAl final, 3 respiraciones lentas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana cambias de lado sin parar."}]}},{"numero":4,"dia_titulo":"Día 4","titulo":"Día 4 — Afianzar lo aprendido","tipo":"video","duracao_min":21,"conteudo":{"intro":"Hoy vas a aguantar ocho segundos en cada ejercicio. Al terminar un lado, pasas al otro sin parar.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"passo","titulo":"Despertar pies y manos","conteudo":"8 veces.\nAguanta 8 segundos con los pies hacia ti.\nPies y manos al mismo tiempo."},{"tipo":"passo","titulo":"Aplastar la toalla","conteudo":"8 veces con cada rodilla.\nAguanta 8 segundos apretando."},{"tipo":"passo","titulo":"Almeja de lado","conteudo":"8 veces de cada lado.\nAguanta 8 segundos con la rodilla arriba."},{"tipo":"passo","titulo":"Mecer las rodillas y pegar la espalda","conteudo":"Mecer: 8 veces. Aguanta 8 segundos de cada lado.\nPegar la espalda: 8 veces. Aguanta 8 segundos."},{"tipo":"passo","titulo":"Deslizar los brazos y respirar","conteudo":"8 veces.\nAguanta 8 segundos con los brazos arriba.\nAl final, 3 respiraciones lentas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana el movimiento será un poquito más grande."}]}},{"numero":5,"dia_titulo":"Día 5","titulo":"Día 5 — Ampliar el movimiento","tipo":"video","duracao_min":25,"conteudo":{"intro":"Hoy vas a hacer cada movimiento un poquito más grande. Solo hasta donde no duela.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"passo","titulo":"Despertar pies y manos","conteudo":"10 veces.\nAguanta 8 segundos con los pies hacia ti.\nPies y manos al mismo tiempo."},{"tipo":"passo","titulo":"Aplastar la toalla","conteudo":"10 veces con cada rodilla.\nAguanta 8 segundos apretando."},{"tipo":"passo","titulo":"Almeja de lado","conteudo":"10 veces de cada lado.\nAguanta 8 segundos con la rodilla arriba."},{"tipo":"passo","titulo":"Mecer las rodillas y pegar la espalda","conteudo":"Mecer: 10 veces. Aguanta 8 segundos de cada lado.\nPegar la espalda: 10 veces. Aguanta 8 segundos."},{"tipo":"passo","titulo":"Deslizar los brazos y respirar","conteudo":"10 veces.\nAguanta 8 segundos con los brazos arriba.\nAl final, 3 respiraciones lentas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana aguantas diez segundos la fuerza."}]}},{"numero":6,"dia_titulo":"Día 6","titulo":"Día 6 — Sostener más tiempo","tipo":"video","duracao_min":28,"conteudo":{"intro":"Hoy vas a sostener cada posición diez segundos. Es la fuerza más larga de la semana.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"passo","titulo":"Despertar pies y manos","conteudo":"10 veces.\nAguanta 10 segundos con los pies hacia ti.\nPies y manos al mismo tiempo."},{"tipo":"passo","titulo":"Aplastar la toalla","conteudo":"10 veces con cada rodilla.\nAguanta 10 segundos apretando."},{"tipo":"passo","titulo":"Almeja de lado","conteudo":"10 veces de cada lado.\nAguanta 10 segundos con la rodilla arriba."},{"tipo":"passo","titulo":"Mecer las rodillas y pegar la espalda","conteudo":"Mecer: 10 veces. Aguanta 10 segundos de cada lado.\nPegar la espalda: 10 veces. Aguanta 10 segundos."},{"tipo":"passo","titulo":"Deslizar los brazos y respirar","conteudo":"10 veces.\nAguanta 10 segundos con los brazos arriba.\nAl final, 3 respiraciones lentas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana es un día suave y haces una prueba corta."}]}},{"numero":7,"dia_titulo":"Día 7","titulo":"Día 7 — Descanso y autoevaluación","tipo":"video","duracao_min":15,"conteudo":{"intro":"Hoy vas a mover el cuerpo muy suave, sin hacer fuerza. Al final, contestas cinco preguntas cortas.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"texto","titulo":"Cómo se hace hoy","conteudo":"Todo suave, sin hacer fuerza.\nMuévete despacio."},{"tipo":"passo","titulo":"Despertar pies y manos","conteudo":"5 veces.\n2 segundos al ir, 2 al volver.\nPies y manos al mismo tiempo."},{"tipo":"passo","titulo":"Aplastar la toalla","conteudo":"5 veces con cada rodilla.\n2 segundos al ir, 2 al volver."},{"tipo":"passo","titulo":"Almeja de lado","conteudo":"5 veces de cada lado.\n2 segundos al ir, 2 al volver."},{"tipo":"passo","titulo":"Mecer las rodillas y pegar la espalda","conteudo":"Mecer: 5 veces, despacio.\nPegar la espalda: 5 veces, muy suave.\n2 segundos al ir, 2 al volver."},{"tipo":"passo","titulo":"Deslizar los brazos y respirar","conteudo":"5 veces.\n2 segundos al ir, 2 al volver.\nAl final, 3 respiraciones lentas."},{"tipo":"texto","titulo":"Autoevaluación","conteudo":"Anota un número del 0 al 10 en un papel.\n1. Dolor al despertar.\n2. Minutos de rigidez al despertar. 10 es una hora o más.\n3. Dificultad para levantarte de la cama.\n4. Cómo dormiste.\n5. Tu ánimo.\nEn las preguntas 1, 2 y 3, 0 es nada.\nEn las preguntas 4 y 5, 10 es muy bien.\nGuarda el papel. El día 14 lo vas a comparar."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana empieza la segunda semana, con ejercicios de fuerza."}]}},{"numero":8,"dia_titulo":"Día 8","titulo":"Día 8 — Empieza la fuerza","tipo":"video","duracao_min":13,"conteudo":{"intro":"Hoy empieza la segunda semana, con ejercicios de fuerza. Cambian tres ejercicios y los otros dos suben un poquito.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"passo","titulo":"Círculos de tobillo y palmas","conteudo":"Círculos de 2 segundos: 8 veces.\nPalmas: 8 veces. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Levantar la pierna estirada (corto)","conteudo":"8 veces por pierna.\n2 segundos al subir, 2 al bajar."},{"tipo":"passo","titulo":"Mini puente","conteudo":"8 veces.\n2 segundos al subir, 2 al bajar."},{"tipo":"passo","titulo":"Rodilla al pecho y panza","conteudo":"Rodilla al pecho: 8 veces por pierna. 2 segundos al acercar, 2 al volver.\nApretar la panza: 8 veces. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Hombros y atrás del muslo","conteudo":"Círculos de hombro de 2 segundos: 8 veces.\nEstirar atrás del muslo: 8 veces por pierna. 2 segundos al subir, 2 al bajar.\nAl final, 3 respiraciones lentas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana repites estos ejercicios, diez veces cada uno."}]}},{"numero":9,"dia_titulo":"Día 9","titulo":"Día 9 — Repetir la fuerza","tipo":"video","duracao_min":14,"conteudo":{"intro":"Hoy vas a repetir los ejercicios de fuerza de ayer. Cada uno sube a diez veces.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"passo","titulo":"Círculos de tobillo y palmas","conteudo":"Círculos de 2 segundos: 10 veces.\nPalmas: 10 veces. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Levantar la pierna estirada (corto)","conteudo":"10 veces por pierna.\n2 segundos al subir, 2 al bajar."},{"tipo":"passo","titulo":"Mini puente","conteudo":"10 veces.\n2 segundos al subir, 2 al bajar."},{"tipo":"passo","titulo":"Rodilla al pecho y panza","conteudo":"Rodilla al pecho: 10 veces por pierna. 2 segundos al acercar, 2 al volver.\nApretar la panza: 10 veces. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Hombros y atrás del muslo","conteudo":"Círculos de hombro de 2 segundos: 10 veces.\nEstirar atrás del muslo: 10 veces por pierna. 2 segundos al subir, 2 al bajar.\nAl final, 3 respiraciones lentas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana haces dos series, con descanso en medio."}]}},{"numero":10,"dia_titulo":"Día 10","titulo":"Día 10 — Dos series hoy","tipo":"video","duracao_min":21,"conteudo":{"intro":"Hoy vas a hacer cada ejercicio dos veces seguidas. Entre una y otra, descansas treinta segundos.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"texto","titulo":"Cómo se hace hoy","conteudo":"2 series por ejercicio.\nEntre series, descansa 30 segundos."},{"tipo":"passo","titulo":"Círculos de tobillo y palmas","conteudo":"Círculos de 2 segundos: 2 series de 8.\nPalmas: 2 series de 8. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Levantar la pierna estirada (corto)","conteudo":"2 series de 8 por pierna.\n2 segundos al subir, 2 al bajar."},{"tipo":"passo","titulo":"Mini puente","conteudo":"2 series de 8.\n2 segundos al subir, 2 al bajar."},{"tipo":"passo","titulo":"Rodilla al pecho y panza","conteudo":"Rodilla al pecho: 2 series de 8 por pierna. 2 segundos al acercar, 2 al volver.\nApretar la panza: 2 series de 8. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Hombros y atrás del muslo","conteudo":"Círculos de hombro de 2 segundos: 2 series de 8.\nEstirar atrás del muslo: 2 series de 8 por pierna. 2 segundos al subir, 2 al bajar.\nAl final, 3 respiraciones lentas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana la pierna y el puente suben completos."}]}},{"numero":11,"dia_titulo":"Día 11","titulo":"Día 11 — Afianzar la fuerza","tipo":"video","duracao_min":24,"conteudo":{"intro":"Hoy vas a hacer dos series de diez. La pierna estirada y el puente suben completos.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"texto","titulo":"Cómo se hace hoy","conteudo":"2 series por ejercicio.\nEntre series, descansa 30 segundos."},{"tipo":"passo","titulo":"Círculos de tobillo y palmas","conteudo":"Círculos de 2 segundos: 2 series de 10.\nPalmas: 2 series de 10. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Levantar la pierna estirada (completo)","conteudo":"2 series de 10 por pierna.\n2 segundos al subir, 2 al bajar."},{"tipo":"passo","titulo":"Puente completo","conteudo":"2 series de 10.\n2 segundos al subir, 2 al bajar."},{"tipo":"passo","titulo":"Rodilla al pecho y panza","conteudo":"Rodilla al pecho: 2 series de 10 por pierna. 2 segundos al acercar, 2 al volver.\nApretar la panza: 2 series de 10. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Hombros y atrás del muslo","conteudo":"Círculos de hombro de 2 segundos: 2 series de 10.\nEstirar atrás del muslo: 2 series de 10 por pierna. 2 segundos al subir, 2 al bajar.\nAl final, 3 respiraciones lentas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana aguantas diez segundos arriba en la pierna y el puente."}]}},{"numero":12,"dia_titulo":"Día 12","titulo":"Día 12 — Aguantar más arriba","tipo":"video","duracao_min":25,"conteudo":{"intro":"Hoy haces dos series de diez. En la pierna y el puente, aguantas arriba al final.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"texto","titulo":"Cómo se hace hoy","conteudo":"2 series por ejercicio.\nEntre series, descansa 30 segundos."},{"tipo":"passo","titulo":"Círculos de tobillo y palmas","conteudo":"Círculos de 2 segundos: 2 series de 10.\nPalmas: 2 series de 10. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Levantar la pierna estirada (completo)","conteudo":"2 series de 10 por pierna.\n2 segundos al subir, 2 al bajar.\nÚltima de cada serie: aguanta 10 segundos arriba."},{"tipo":"passo","titulo":"Puente completo","conteudo":"2 series de 10.\n2 segundos al subir, 2 al bajar.\nÚltima de cada serie: aguanta 10 segundos arriba."},{"tipo":"passo","titulo":"Rodilla al pecho y panza","conteudo":"Rodilla al pecho: 2 series de 10 por pierna. 2 segundos al acercar, 2 al volver.\nApretar la panza: 2 series de 10. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Hombros y atrás del muslo","conteudo":"Círculos de hombro de 2 segundos: 2 series de 10.\nEstirar atrás del muslo: 2 series de 10 por pierna. 2 segundos al subir, 2 al bajar.\nAl final, 3 respiraciones lentas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana haces todo seguido, sin parar."}]}},{"numero":13,"dia_titulo":"Día 13","titulo":"Día 13 — Todo sin parar","tipo":"video","duracao_min":24,"conteudo":{"intro":"Hoy vas a hacer los cinco ejercicios seguidos. Terminas uno y pasas al siguiente, sin parar.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"texto","titulo":"Cómo se hace hoy","conteudo":"2 series por ejercicio.\nEntre series, descansa 30 segundos."},{"tipo":"passo","titulo":"Círculos de tobillo y palmas","conteudo":"Círculos de 2 segundos: 2 series de 10.\nPalmas: 2 series de 10. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Levantar la pierna estirada (completo)","conteudo":"2 series de 10 por pierna.\n2 segundos al subir, 2 al bajar."},{"tipo":"passo","titulo":"Puente completo","conteudo":"2 series de 10.\n2 segundos al subir, 2 al bajar."},{"tipo":"passo","titulo":"Rodilla al pecho y panza","conteudo":"Rodilla al pecho: 2 series de 10 por pierna. 2 segundos al acercar, 2 al volver.\nApretar la panza: 2 series de 10. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Hombros y atrás del muslo","conteudo":"Círculos de hombro de 2 segundos: 2 series de 10.\nEstirar atrás del muslo: 2 series de 10 por pierna. 2 segundos al subir, 2 al bajar.\nAl final, 3 respiraciones lentas."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana es el último día y repites la prueba corta."}]}},{"numero":14,"dia_titulo":"Día 14","titulo":"Día 14 — Cierre y prueba","tipo":"video","duracao_min":26,"conteudo":{"intro":"Hoy es tu último día: dos series de diez. Al final, repites la prueba y comparas con el día siete.","blocos":[{"tipo":"texto","titulo":"Lo que necesitas","conteudo":"Una toalla enrollada.\nUna almohada.\nUna sábana."},{"tipo":"texto","titulo":"Cómo se hace hoy","conteudo":"2 series por ejercicio.\nEntre series, descansa 30 segundos."},{"tipo":"passo","titulo":"Círculos de tobillo y palmas","conteudo":"Círculos de 2 segundos: 2 series de 10.\nPalmas: 2 series de 10. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Levantar la pierna estirada (completo)","conteudo":"2 series de 10 por pierna.\n2 segundos al subir, 2 al bajar."},{"tipo":"passo","titulo":"Puente completo","conteudo":"2 series de 10.\n2 segundos al subir, 2 al bajar."},{"tipo":"passo","titulo":"Rodilla al pecho y panza","conteudo":"Rodilla al pecho: 2 series de 10 por pierna. 2 segundos al acercar, 2 al volver.\nApretar la panza: 2 series de 10. Aprieta 2 segundos."},{"tipo":"passo","titulo":"Hombros y atrás del muslo","conteudo":"Círculos de hombro de 2 segundos: 2 series de 10.\nEstirar atrás del muslo: 2 series de 10 por pierna. 2 segundos al subir, 2 al bajar.\nAl final, 3 respiraciones lentas."},{"tipo":"texto","titulo":"Autoevaluación","conteudo":"Anota un número del 0 al 10 en un papel.\n1. Dolor al despertar.\n2. Minutos de rigidez al despertar. 10 es una hora o más.\n3. Dificultad para levantarte de la cama.\n4. Cómo dormiste.\n5. Tu ánimo.\nEn las preguntas 1, 2 y 3, 0 es nada.\nEn las preguntas 4 y 5, 10 es muy bien.\nCompara con tus números del día 7."},{"tipo":"aviso","titulo":"Reglas de seguridad","conteudo":"Si el dolor pasa de 3 en una escala de 0 a 10, haz el movimiento más chiquito o sáltalo.\nNunca aguantes la respiración. Suelta el aire cuando hagas fuerza.\nSi hoy una articulación está hinchada o caliente, ahí solo mueve suavecito, sin hacer fuerza.\nSi la rodilla no llega a la cama, está bien. El movimiento pequeño también cuenta."},{"tipo":"dica","titulo":"Mañana","conteudo":"Mañana puedes seguir con la Parte 2: ejercicios en silla."}]}}]$aulas$::jsonb;
  v_program_id uuid;
  v_week_id    uuid;
  v_day_id     uuid;
  v_lesson_id  uuid;
  v_primeira   boolean;
  v_n          int;
  v_sobras     int;
  r            jsonb;
begin
  -- Programa canônico (o da 0024). Fallback: o do produto canônico com catálogo.
  select id into v_program_id from public.programs where slug = 'descompresion-articular';
  if v_program_id is null then
    select p.id into v_program_id
      from public.programs p
      join public.products pr on pr.id = p.product_id
     where pr.slug in ('drenagem-tailandesa', 'ritual-do-tapetinho')
     order by (select count(*) from public.exercises e where e.program_id = p.id) desc,
              p.ativo desc, p.id
     limit 1;
  end if;
  if v_program_id is null then
    raise exception 'Programa canônico não encontrado. Rode as migrations anteriores antes desta.';
  end if;

  v_primeira := not exists (select 1 from public.app_migrations where chave = '0025_reto_cama');

  update public.programs
     set formato = 'aula_diaria', duracao_semanas = 2
   where id = v_program_id;

  -- Uma única semana de leitura (a 0023 já consolidou tudo na semana 1).
  select id into v_week_id
    from public.program_weeks
   where program_id = v_program_id
   order by numero
   limit 1;
  if v_week_id is null then
    insert into public.program_weeks (program_id, numero, titulo)
    values (v_program_id, 1, 'Reto 14 días en la cama')
    returning id into v_week_id;
  end if;
  update public.program_weeks
     set titulo = 'Reto 14 días en la cama'
   where id = v_week_id and titulo is distinct from 'Reto 14 días en la cama';

  -- Traz todos os dias do programa para essa semana, numa faixa livre
  -- (10000+), na ordem original. Evita colisão com unique (week_id, numero).
  with ordenado as (
    select d.id, row_number() over (order by w.numero, d.numero, d.id) as n
      from public.program_days d
      join public.program_weeks w on w.id = d.week_id
     where w.program_id = v_program_id
  )
  update public.program_days d
     set week_id = v_week_id, numero = 10000 + o.n
    from ordenado o
   where o.id = d.id;

  delete from public.program_weeks
   where program_id = v_program_id and id <> v_week_id;

  -- Reaproveita os dias em ordem: o 1º vira a Bienvenida, o 2º o Día 1…
  for r in select * from jsonb_array_elements(v_aulas)
  loop
    v_n := (r->>'numero')::int;

    select id into v_day_id
      from public.program_days
     where week_id = v_week_id and numero >= 10000
     order by numero
     limit 1;

    if v_day_id is null then
      insert into public.program_days (week_id, numero, titulo)
      values (v_week_id, v_n, r->>'dia_titulo')
      returning id into v_day_id;
    else
      update public.program_days
         set numero = v_n, titulo = r->>'dia_titulo'
       where id = v_day_id;
    end if;

    -- Uma aula por dia: mantém a primeira, remove as demais.
    select id into v_lesson_id
      from public.lessons
     where day_id = v_day_id
     order by ordem, id
     limit 1;

    delete from public.lessons
     where day_id = v_day_id
       and id <> coalesce(v_lesson_id, '00000000-0000-0000-0000-000000000000'::uuid);

    if v_lesson_id is null then
      insert into public.lessons (day_id, titulo, tipo, panda_video_id, conteudo, duracao_min, ordem)
      values (v_day_id, r->>'titulo', r->>'tipo', null, r->'conteudo', (r->>'duracao_min')::int, 0);
    else
      update public.lessons
         set titulo = r->>'titulo',
             tipo = r->>'tipo',
             conteudo = r->'conteudo',
             duracao_min = (r->>'duracao_min')::int,
             ordem = 0,
             -- Vídeo antigo não serve para o conteúdo novo; depois, preserva.
             panda_video_id = case when v_primeira then null else panda_video_id end
       where id = v_lesson_id;

      if v_primeira then
        delete from public.lesson_completions where lesson_id = v_lesson_id;
      end if;
    end if;
  end loop;

  -- Leituras antigas que sobraram (dias 16–28 do material anterior).
  delete from public.program_days
   where week_id = v_week_id and numero >= 10000;
  get diagnostics v_sobras = row_count;

  if v_primeira then
    insert into public.app_migrations (chave) values ('0025_reto_cama');
  end if;

  raise notice 'Reto na cama: % aulas gravadas, % leituras antigas removidas.',
    jsonb_array_length(v_aulas), v_sobras;
end
$reto$;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO — esperado: formato aula_diaria; 15 aulas (0 a 14), uma por
-- dia, em ordem; vídeos pendentes (NULL) até a Lucy gravar.
-- ---------------------------------------------------------------------
select p.slug, p.nome, p.formato, p.duracao_semanas
  from public.programs p
 where p.slug = 'descompresion-articular';

select d.numero as dia, l.titulo, l.tipo, l.duracao_min,
       coalesce(l.panda_video_id, 'PENDIENTE') as video
  from public.program_days d
  join public.program_weeks w on w.id = d.week_id
  join public.programs p on p.id = w.program_id
  left join public.lessons l on l.day_id = d.id
 where p.slug = 'descompresion-articular'
 order by d.numero;

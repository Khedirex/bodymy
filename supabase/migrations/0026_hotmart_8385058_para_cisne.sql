-- =====================================================================
-- 0026_hotmart_8385058_para_cisne.sql — ANULADA (no-op).
--
-- Ela movia o id Hotmart 8385058 para o Reset Postura de Cisne, mas esse
-- id é o do produto PRINCIPAL na Hotmart ("Protocolo Regeneración Articular
-- - Reto de 14 Días"). Enquanto esteve aplicada, quem comprou o protocolo
-- recebeu o Cisne no lugar dele. Revertida pela 0027.
-- Mantida só para a numeração não quebrar. Não faz nada.
-- =====================================================================
select 'no-op: ver 0027_reverte_hotmart_8385058.sql' as aviso;

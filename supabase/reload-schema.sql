-- Recarrega o cache de schema do PostgREST (Supabase).
-- Use quando a API retornar PGRST204 ("Could not find the '<coluna>'
-- column ... in the schema cache") logo após aplicar DDL/reset, mesmo
-- com a coluna já existindo. Não apaga nada.
notify pgrst, 'reload schema';

-- form_responseテーブルの確認用SQL
-- SupabaseのSQL Editorで実行してください

-- テーブルが存在するか確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'form_response'
) AS table_exists;

-- テーブル構造を確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'form_response'
ORDER BY ordinal_position;

-- インデックスを確認
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'form_response';

-- ============================================
-- facility_search_view 更新用SQL
-- 病院と診療所の両方に bed_count を追加
-- ============================================

-- ============================================
-- 1. 既存のビュー定義を確認（実行前に確認推奨）
-- ============================================
-- このSQLを実行して、既存のビュー定義を確認してください
SELECT definition 
FROM pg_views 
WHERE viewname = 'facility_search_view';

-- ============================================
-- 2. ビューを更新（bed_count を含める）
-- ============================================
-- 上記の確認後、以下のSQLを実行してください
-- 既存の定義に bed_count を追加した形で更新します

-- 既存のビューを削除
DROP VIEW IF EXISTS facility_search_view;

-- ビューを再作成（既存の定義に bed_count を追加）
CREATE VIEW facility_search_view AS
SELECT 
  'hospital'::text AS facility_type,
  hospital.gov_id,
  hospital.name AS facility_name,
  hospital.address,
  hospital.prefecture,
  hospital.city,
  hospital.bed_count  -- 追加: 病院の病床数（統計的待ち時間算出に使用）
FROM hospital
UNION ALL
SELECT 
  'clinic'::text AS facility_type,
  clinic.gov_id,
  clinic.name AS facility_name,
  clinic.address,
  clinic.prefecture,
  clinic.city,
  clinic.bed_count  -- 追加: 診療所の病床数（通常はNULL、統計的待ち時間算出に使用）
FROM clinic;

-- コメント追加
COMMENT ON VIEW facility_search_view IS '病院・診療所の検索用ビュー（bed_count を含む）';

-- ============================================
-- 3. 更新後の確認（オプション）
-- ============================================
-- ビューが正しく更新されたか確認する場合は、以下を実行してください

-- ビューの構造を確認
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'facility_search_view'
-- ORDER BY ordinal_position;

-- サンプルデータを確認（bed_count が含まれているか）
-- SELECT * 
-- FROM facility_search_view 
-- LIMIT 5;

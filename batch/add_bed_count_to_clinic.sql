-- clinic テーブルに bed_count カラムを追加
-- 統計的待ち時間算出に使用
-- 注意: 診療所には通常病床数がないが、データがあれば取得

-- カラム追加（既に存在する場合はエラーになるが、問題なし）
ALTER TABLE clinic 
ADD COLUMN IF NOT EXISTS bed_count INTEGER;

-- インデックス追加（検索パフォーマンス向上、オプション）
CREATE INDEX IF NOT EXISTS idx_clinic_bed_count ON clinic(bed_count);

-- コメント追加
COMMENT ON COLUMN clinic.bed_count IS '合計病床数（統計的待ち時間算出に使用、診療所には通常病床数がないためNULLが多い）';

-- facility_search_view を更新して bed_count を含める
-- 注意: 既存のビューを削除して再作成する必要がある場合があります
-- 実際のビュー定義を確認してから実行してください

-- 例: facility_search_view の再作成（既存のビュー定義に bed_count を追加）
-- DROP VIEW IF EXISTS facility_search_view;
-- CREATE VIEW facility_search_view AS
-- SELECT 
--   'hospital' as facility_type,
--   h.gov_id,
--   h.name as facility_name,
--   h.address,
--   h.prefecture,
--   h.city,
--   h.bed_count
-- FROM hospital h
-- UNION ALL
-- SELECT 
--   'clinic' as facility_type,
--   c.gov_id,
--   c.name as facility_name,
--   c.address,
--   c.prefecture,
--   c.city,
--   c.bed_count  -- 診療所にも病床数カラムを追加
-- FROM clinic c;

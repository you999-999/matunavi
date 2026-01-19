-- form_response テーブルに visit_type カラムを追加
-- 初診/再診の記録用

-- カラム追加
ALTER TABLE form_response 
ADD COLUMN IF NOT EXISTS visit_type TEXT CHECK (visit_type IN ('first', 'repeat'));

-- インデックス追加（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_form_response_visit_type ON form_response(visit_type);

-- コメント追加
COMMENT ON COLUMN form_response.visit_type IS '受診種別（first: 初診, repeat: 再診、NULL許容）';

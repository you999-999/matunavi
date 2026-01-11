-- フォーム回答シート用テーブル作成
-- 施設の診療情報をユーザーが入力・登録するためのテーブル

CREATE TABLE IF NOT EXISTS form_response (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_type TEXT NOT NULL CHECK (facility_type IN ('hospital', 'clinic')),
  gov_id TEXT NOT NULL,
  facility_name TEXT NOT NULL,
  department TEXT,
  reception_time TIME,
  treatment_start_time TIME,
  accounting_end_time TIME,
  has_reservation TEXT CHECK (has_reservation IN ('あり', 'なし')),
  reservation_time TIME,
  other TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_form_response_gov_id ON form_response(gov_id);
CREATE INDEX IF NOT EXISTS idx_form_response_facility_type ON form_response(facility_type);
CREATE INDEX IF NOT EXISTS idx_form_response_created_at ON form_response(created_at DESC);

-- コメント追加
COMMENT ON TABLE form_response IS 'フォーム回答シート：施設の診療情報をユーザーが入力・登録するテーブル';
COMMENT ON COLUMN form_response.facility_type IS '施設種別（hospital: 病院, clinic: 診療所）';
COMMENT ON COLUMN form_response.gov_id IS '施設の政府ID（hospital.gov_id または clinic.gov_id）';
COMMENT ON COLUMN form_response.facility_name IS '施設名';
COMMENT ON COLUMN form_response.department IS '診療科';
COMMENT ON COLUMN form_response.reception_time IS '受付時刻';
COMMENT ON COLUMN form_response.treatment_start_time IS '診療開始時刻';
COMMENT ON COLUMN form_response.accounting_end_time IS '会計終了時刻';
COMMENT ON COLUMN form_response.has_reservation IS '予約あり/なし';
COMMENT ON COLUMN form_response.reservation_time IS '予約時刻（予約ありの場合のみ）';
COMMENT ON COLUMN form_response.other IS 'その他（任意）';

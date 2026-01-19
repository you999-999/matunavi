# facility_search_view 更新ガイド

## 概要

`facility_search_view` を更新して、病院と診療所の両方に `bed_count`（病床数）を含めるようにします。

## 実行手順

### 1. 既存のビュー定義を確認（推奨）

SupabaseのSQL Editorで以下を実行して、既存のビュー定義を確認してください：

```sql
-- 既存のビュー定義を確認
SELECT definition 
FROM pg_views 
WHERE viewname = 'facility_search_view';
```

### 2. ビューを更新

`batch/update_facility_search_view.sql` をSupabaseのSQL Editorで実行してください。

**注意**: このSQLは既存のビューを削除して再作成します。既存のビュー定義と異なる場合は、適宜修正してください。

### 3. 確認

更新後、以下のクエリでビューが正しく更新されたか確認できます：

```sql
-- ビューの構造を確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'facility_search_view'
ORDER BY ordinal_position;

-- サンプルデータを確認（bed_count が含まれているか）
SELECT * 
FROM facility_search_view 
LIMIT 5;
```

## ビューの構造

更新後の `facility_search_view` は以下のカラムを持ちます：

- `facility_type`: 施設種別（'hospital' または 'clinic'）
- `gov_id`: 政府ID
- `facility_name`: 施設名
- `address`: 住所
- `prefecture`: 都道府県コード
- `city`: 市区町村コード
- `bed_count`: 病床数（統計的待ち時間算出に使用）

## 注意事項

- **診療所の病床数**: 診療所には通常病床数がないため、`bed_count` は `NULL` になることが多いです
- **既存のビュー定義**: 既存のビュー定義と異なる場合は、`update_facility_search_view.sql` を適宜修正してください
- **依存関係**: このビューに依存する他のビューやクエリがある場合は、それらも更新が必要な場合があります

## トラブルシューティング

### エラー: "relation facility_search_view does not exist"

既存のビューが存在しない場合は、`DROP VIEW IF EXISTS` の部分をスキップして、`CREATE VIEW` のみを実行してください。

### エラー: "column bed_count does not exist"

`hospital` または `clinic` テーブルに `bed_count` カラムが存在しない場合は、先に以下を実行してください：

```sql
-- hospital テーブルに bed_count を追加
ALTER TABLE hospital ADD COLUMN IF NOT EXISTS bed_count INTEGER;

-- clinic テーブルに bed_count を追加
ALTER TABLE clinic ADD COLUMN IF NOT EXISTS bed_count INTEGER;
```

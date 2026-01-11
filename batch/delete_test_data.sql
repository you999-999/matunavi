-- テストデータ削除用SQL
-- SupabaseのSQL Editorで実行してください

-- 方法1: 特定のIDのレコードを削除（推奨）
DELETE FROM form_response 
WHERE id = '667637a6-8324-4d1b-8656-b6e12b04c468';

-- 方法2: むらかみ小児科のすべてのレコードを削除
-- DELETE FROM form_response 
-- WHERE facility_name = 'むらかみ小児科';

-- 方法3: すべてのテストデータを削除（注意：全件削除されます）
-- DELETE FROM form_response;

-- 削除後の確認
SELECT COUNT(*) AS remaining_count FROM form_response;

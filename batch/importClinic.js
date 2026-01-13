/**
 * まつなび - 診療所データインポートスクリプト（importClinic.js）
 * 
 * このバッチ処理は、厚生労働省が公開する診療所施設情報CSV
 * （02-1_clinic_facility_info_YYYYMMDD.csv）を読み込み、
 * Supabase の clinic テーブルに安全かつ高速に登録します。
 * 
 * 【目的】
 * - 政府公開データからまつなびのデータベースを構築
 * - 全国の診療所情報を Supabase に格納
 * - 再実行可能な安全なインポート処理
 * 
 * 【処理フロー】
 * 1. 既存の clinic テーブルを全件ロードして Map<gov_id, id> を作成（重複チェック用）
 * 2. CSVをストリームで読み込み、既存のgov_idを除外
 * 3. 新規データのみをバッチ処理（500-1000件ずつ）でINSERT
 * 4. 既存のgov_idはSKIP（更新しない）
 * 
 * 【特徴】
 * - 再実行可能: 既存データは更新せず、新規データのみ追加
 * - ストリーム読み込み: 全件メモリ保持しない（省メモリ）
 * - バッチ処理: 1000件ずつまとめてINSERT（高速）
 * - 安全: DELETE/TRUNCATEは行わない（既存データ保護）
 * - 重複チェック: gov_id でチェック（政府ID）
 * 
 * 【対象テーブル】
 * clinic テーブル
 * - id: UUID（主キー、自動生成）
 * - gov_id: VARCHAR（政府ID、ユニーク制約）
 * - name: VARCHAR（施設名）
 * - address: VARCHAR（所在地）
 * - prefecture: VARCHAR（都道府県コード）
 * - city: VARCHAR（市区町村コード）
 * 
 * 【CSVフォーマット】
 * - ID: 政府が付与する医療機関ID（gov_id に対応）
 * - 正式名称: 診療所の正式名称（name に対応）
 * - 所在地: 診療所の所在地（address に対応）
 * - 都道府県コード: 2桁の都道府県コード（prefecture に対応）
 * - 市区町村コード: 5桁の市区町村コード（city に対応）
 * 
 * 【実行方法】
 * ```bash
 * cd batch
 * node importClinic.js
 * ```
 * 
 * 【前提条件】
 * - CSVファイルが batch/ ディレクトリに配置されていること
 * - Supabase の接続情報（URL、KEY）が正しいこと
 * - clinic テーブルが作成済みであること
 * 
 * 【依存パッケージ】
 * - fs: Node.js標準モジュール（ファイル読み込み）
 * - csv-parser: CSVパース用ライブラリ
 * - @supabase/supabase-js: Supabase クライアント
 * 
 * 【実行時間の目安】
 * - 診療所数: 約10万件
 * - 処理時間: 5-10分程度（ネットワーク速度に依存）
 * 
 * 【エラーハンドリング】
 * - CSV読み込みエラー: 処理を中断、エラーログ出力
 * - Supabase接続エラー: 処理を中断、エラーログ出力
 * - バッチINSERTエラー: 該当バッチのみ失敗、エラーログ出力
 * 
 * 【注意事項】
 * - SERVICE_ROLE_KEY を使用（行レベルセキュリティをバイパス）
 * - 本番環境では適切なアクセス制御が必要
 * - CSV更新時はファイル名（CSV_PATH）を変更すること
 * 
 * @module importClinic
 */

// ===================================
// 必要なモジュールのインポート
// ===================================

const fs = require('fs');                    // ファイルシステム操作
const csv = require('csv-parser');           // CSVパーサー
const { createClient } = require('@supabase/supabase-js');  // Supabaseクライアント

// ===================================
// Supabase接続情報
// ===================================

/**
 * Supabase プロジェクトURL
 * まつなびのSupabaseプロジェクトのURL
 */
const SUPABASE_URL = 'https://sauhmasxargkwltsuujm.supabase.co';

/**
 * Supabase サービスロールキー
 * ⚠️ 警告: このキーは強力な権限を持つため、クライアント側に公開しない
 * Row Level Security (RLS) をバイパスして全テーブルにアクセス可能
 */
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdWhtYXN4YXJna3dsdHN1dWptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ1ODE1NywiZXhwIjoyMDgxMDM0MTU3fQ.NzLh4WYdqpPTrigqarEL7ImFzSlEEYTynIp79Re9QQc';

/**
 * Supabaseクライアントインスタンス
 * データベース操作に使用
 */
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===================================
// 設定値
// ===================================

/**
 * CSVファイルのパス
 * 政府公開データのファイル名（日付部分は適宜変更）
 */
const CSV_PATH = './02-1_clinic_facility_info_20251201.csv';

/**
 * バッチサイズ
 * 一度にINSERTする件数（500-1000件が推奨）
 * 大きすぎるとタイムアウト、小さすぎると遅い
 */
const BATCH_SIZE = 1000;

// ===================================
// ユーティリティ関数
// ===================================

/**
 * 文字列の正規化（BOM、ダブルクォート、空白を除去）
 * gov_id は文字列として厳密に扱う
 */
function normalizeString(str) {
  if (!str) return null;
  return str
    .replace(/^\uFEFF/, '') // BOM除去
    .replace(/^"|"$/g, '')   // ダブルクォート除去
    .trim();                 // 前後の空白除去
}

/**
 * CSVヘッダーの正規化
 */
function normalizeHeader(header) {
  return normalizeString(header);
}

/**
 * 既存の clinic テーブルを全件ロードして Map<gov_id, id> を作成
 * 重複チェック用に使用する
 */
async function loadExistingClinicMap() {
  console.log('▶ 既存の clinic テーブルを読み込み中...');
  
  let allData = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  // ページネーションで全件取得
  while (hasMore) {
    const { data, error } = await supabase
      .from('clinic')
      .select('id, gov_id')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      throw new Error(`[FATAL] clinic テーブル読み込みエラー: ${error.message}`);
    }

    if (data && data.length > 0) {
      allData = allData.concat(data);
      page++;
      
      if (data.length < pageSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  // Map<gov_id, id> を作成（重複チェック用）
  const map = new Map();
  for (const c of allData) {
    if (c.gov_id) {
      // gov_id を正規化（trim処理）
      const normalizedGovId = normalizeString(c.gov_id);
      if (normalizedGovId) {
        map.set(normalizedGovId, c.id);
      }
    }
  }

  console.log(`✔ 既存の clinic Map ロード完了: ${map.size} 件`);
  return map;
}

/**
 * バッチ挿入処理
 * 新規データのみをINSERT（既存チェック済み）
 */
async function insertBatch(clinics) {
  if (clinics.length === 0) return { success: true, count: 0 };

  try {
    const { data, error } = await supabase
      .from('clinic')
      .insert(clinics)
      .select();

    if (error) {
      throw error;
    }

    return { success: true, count: clinics.length };
  } catch (error) {
    return { success: false, error: error };
  }
}

/**
 * メイン処理
 */
async function importClinics() {
  try {
    console.log('========================================');
    console.log('clinic 一括ロード開始');
    console.log('========================================');
    console.log(`CSVファイル: ${CSV_PATH}`);

    // 1. 既存の clinic テーブルを全件ロードして Map を作成（重複チェック用）
    const existingClinicMap = await loadExistingClinicMap();

    // 2. CSVをストリームで読み込み、新規データのみを収集
    const newClinics = [];
    let rowCount = 0;
    let skippedCount = 0;
    let skippedExistingCount = 0;

    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_PATH)
        .pipe(csv({
          mapHeaders: ({ header }) => normalizeHeader(header)
        }))
        .on('data', (row) => {
          rowCount++;

          // gov_id を取得・正規化（文字列として厳密に扱う）
          const govId = normalizeString(row['ID']);
          if (!govId || govId === '') {
            skippedCount++;
            return;
          }

          // 既存のgov_idかチェック（Mapで高速検索）
          if (existingClinicMap.has(govId)) {
            // 既存のgov_idはSKIP（更新しない）
            skippedExistingCount++;
            return;
          }

          // 必須フィールドの検証
          const name = normalizeString(row['正式名称']);
          const address = normalizeString(row['所在地']);
          
          if (!name) {
            skippedCount++;
            return;
          }
          
          if (!address) {
            skippedCount++;
            return;
          }

          // 新規データとして追加
          const clinic = {
            gov_id: govId,
            name: name,
            address: address,
            prefecture: normalizeString(row['都道府県コード']) || null,
            city: normalizeString(row['市区町村コード']) || null,
          };

          newClinics.push(clinic);
        })
        .on('end', () => {
          console.log(`✔ CSV読み込み完了: ${rowCount} 行`);
          console.log(`  - 新規登録対象: ${newClinics.length} 件`);
          console.log(`  - スキップ件数（gov_id が空、または name/address が空）: ${skippedCount} 件`);
          console.log(`  - スキップ件数（既存のgov_id）: ${skippedExistingCount} 件`);
          resolve();
        })
        .on('error', (error) => {
          console.error(`[FATAL] CSV読み込みエラー: ${error.message}`);
          reject(error);
        });
    });

    // 3. 新規データがなければ終了
    if (newClinics.length === 0) {
      console.log('⚠ 新規登録対象がありません。');
      console.log('========================================');
      console.log('🎉 処理完了（新規データなし）');
      console.log('========================================');
      return;
    }

    // 4. バッチ処理でINSERT
    console.log('▶ バッチ処理でINSERT開始...');
    
    const batches = [];
    for (let i = 0; i < newClinics.length; i += BATCH_SIZE) {
      batches.push(newClinics.slice(i, i + BATCH_SIZE));
    }

    console.log(`バッチ数: ${batches.length} バッチ（各最大 ${BATCH_SIZE} 件）`);

    let insertedCount = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const result = await insertBatch(batch);

      if (result.success) {
        insertedCount += result.count;
        console.log(`✔ バッチ ${i + 1}/${batches.length}: ${result.count} 件登録（累計: ${insertedCount} 件）`);
      } else {
        const errorMsg = result.error?.message || JSON.stringify(result.error);
        console.error(`[FATAL] バッチ ${i + 1}/${batches.length} でエラー: ${errorMsg}`);
        throw new Error(`バッチ処理エラー: ${errorMsg}`);
      }
    }

    console.log('========================================');
    console.log('🎉 処理完了');
    console.log('========================================');
    console.log(`CSV行数: ${rowCount} 行`);
    console.log(`新規 INSERT 件数: ${insertedCount} 件`);
    console.log(`SKIP 件数（既存）: ${skippedExistingCount} 件`);
    console.log(`SKIP 件数（gov_id が空、または name/address が空）: ${skippedCount} 件`);
    console.log('========================================');

  } catch (error) {
    console.error('========================================');
    console.error(`[FATAL] 致命的エラー: ${error.message}`);
    console.error('========================================');
    throw error;
  }
}

// 実行
if (require.main === module) {
  importClinics()
    .then(() => {
      console.log('処理が正常に完了しました。');
      process.exit(0);
    })
    .catch((error) => {
      console.error(`[FATAL] 致命的エラー: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { importClinics };

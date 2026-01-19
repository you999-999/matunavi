/**
 * importHospital.js
 * 
 * このファイルは、政府公開CSV（01-1_hospital_facility_info_20251201.csv）を読み込み、
 * Supabase の hospital テーブルに大量・安全・高速に登録するバッチ処理です。
 * 
 * 処理内容:
 * - CSVのBOM・ダブルクォート・空白を正規化
 * - バッチ処理（500-1000件ずつ）で高速登録
 * - upsert()を使用して重複を回避
 * - エラーハンドリング（fatal/warn）を実装
 */

const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Supabase接続情報
const SUPABASE_URL = 'https://sauhmasxargkwltsuujm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdWhtYXN4YXJna3dsdHN1dWptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ1ODE1NywiZXhwIjoyMDgxMDM0MTU3fQ.NzLh4WYdqpPTrigqarEL7ImFzSlEEYTynIp79Re9QQc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 設定
const CSV_PATH = './01-1_hospital_facility_info_20251201.csv';
const BATCH_SIZE = 1000; // バッチサイズ

/**
 * 文字列の正規化（BOM、ダブルクォート、空白を除去）
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
 * バッチ挿入処理
 * upsert()を使用して、既存データは更新、新規データは挿入
 */
async function insertBatch(hospitals) {
  if (hospitals.length === 0) return { success: true, count: 0 };

  try {
    // gov_id を onConflict として明示的に指定
    // 既存の gov_id がある場合は更新、ない場合は挿入
    const { data, error } = await supabase
      .from('hospital')
      .upsert(hospitals, { 
        onConflict: 'gov_id',
        ignoreDuplicates: false  // 重複時は更新する
      })
      .select();

    if (error) {
      throw error;
    }

    return { success: true, count: hospitals.length };
  } catch (error) {
    return { success: false, error: error };
  }
}

/**
 * メイン処理
 */
async function importHospitals() {
  console.log('▶ hospital 一括ロード開始');
  console.log(`CSVファイル: ${CSV_PATH}`);

  const rows = [];
  let rowCount = 0;
  let insertedCount = 0;
  let skippedCount = 0;
  let fatalError = null;

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv({
        mapHeaders: ({ header }) => normalizeHeader(header)
      }))
      .on('data', (row) => {
        rowCount++;
        
        // 必須フィールドの検証
        const govId = normalizeString(row['ID']);
        if (!govId) {
          console.warn(`[WARN] 行 ${rowCount}: gov_id が空です。スキップします。`);
          skippedCount++;
          return;
        }

        // 必須フィールドの検証（name, address は NOT NULL）
        const name = normalizeString(row['正式名称']);
        const address = normalizeString(row['所在地']);
        
        if (!name) {
          console.warn(`[WARN] 行 ${rowCount}: name が空です。スキップします。`);
          skippedCount++;
          return;
        }
        
        if (!address) {
          console.warn(`[WARN] 行 ${rowCount}: address が空です。スキップします。`);
          skippedCount++;
          return;
        }

        // 合計病床数を取得（統計的待ち時間算出に使用）
        const totalBedCount = normalizeString(row['合計病床数']);
        const bedCount = totalBedCount && !isNaN(parseInt(totalBedCount)) 
          ? parseInt(totalBedCount) 
          : null;

        const hospital = {
          gov_id: govId,
          name: name,
          address: address,
          prefecture: normalizeString(row['都道府県コード']) || null,
          city: normalizeString(row['市区町村コード']) || null,
          bed_count: bedCount,
        };

        rows.push(hospital);
      })
      .on('end', async () => {
        console.log(`CSV読み込み完了: ${rowCount} 行（有効: ${rows.length} 件、スキップ: ${skippedCount} 件）`);

        if (rows.length === 0) {
          console.log('⚠ 登録対象がありません。');
          resolve();
          return;
        }

        // バッチ処理
        const batches = [];
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          batches.push(rows.slice(i, i + BATCH_SIZE));
        }

        console.log(`バッチ処理開始: ${batches.length} バッチ（各最大 ${BATCH_SIZE} 件）`);

        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          const result = await insertBatch(batch);

          if (result.success) {
            insertedCount += result.count;
            console.log(`✔ バッチ ${i + 1}/${batches.length}: ${result.count} 件登録（累計: ${insertedCount} 件）`);
          } else {
            const errorMsg = result.error?.message || JSON.stringify(result.error);
            console.error(`[FATAL] バッチ ${i + 1}/${batches.length} でエラー: ${errorMsg}`);
            fatalError = result.error;
            reject(new Error(`バッチ処理エラー: ${errorMsg}`));
            return;
          }
        }

        console.log(`🎉 完了: hospital ${insertedCount} 件登録`);
        resolve();
      })
      .on('error', (error) => {
        console.error(`[FATAL] CSV読み込みエラー: ${error.message}`);
        reject(error);
      });
  });
}

// 実行
if (require.main === module) {
  importHospitals()
    .then(() => {
      console.log('処理が正常に完了しました。');
      process.exit(0);
    })
    .catch((error) => {
      console.error(`[FATAL] 致命的エラー: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { importHospitals };

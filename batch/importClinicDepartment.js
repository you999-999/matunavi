/**
 * importClinicDepartment.js
 * 
 * このファイルは、政府公開CSV（02-2_clinic_speciality_hours_20251201.csv）を読み込み、
 * Supabase の clinic_department テーブルに大量・安全・高速に登録するバッチ処理です。
 * 
 * 処理内容:
 * 1. clinic テーブルを全件ロードして Map<clinic_gov_id, clinic_id> を作成
 * 2. 既存の clinic_department を全件ロードして Map<clinic_id + 診療科目コード, id> を作成（重複チェック用）
 * 3. CSVを1行ずつ読み込み、メモリ上で集約（clinic_gov_id + 診療科目コード をキーに）
 * 4. 同一キーの行は、曜日別に opening_hours をマージ（1レコードに統合）
 * 5. CSV全体を集約し終わってから、既存キーを除外してバッチ処理でINSERT
 * 
 * 特徴:
 * - 再実行可能（既存データは更新しない）
 * - 安全（DELETE/TRUNCATEは行わない）
 * - 高速（バッチ処理とMapによる重複チェック）
 * - 20万行超のCSVにも対応
 * 
 * 前提条件:
 * - clinic テーブルは全件登録済みであること（02-1で登録済み）
 */

const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Supabase接続情報
const SUPABASE_URL = 'https://sauhmasxargkwltsuujm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdWhtYXN4YXJna3dsdHN1dWptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ1ODE1NywiZXhwIjoyMDgxMDM0MTU3fQ.NzLh4WYdqpPTrigqarEL7ImFzSlEEYTynIp79Re9QQc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 設定
const CSV_PATH = './02-2_clinic_speciality_hours_20251201.csv';
const BATCH_SIZE = 1000; // バッチサイズ（500-1000件）

/**
 * 文字列の正規化（BOM、ダブルクォート、空白を除去）
 * gov_id / 診療科目コードは文字列として厳密に扱う（数値変換禁止）
 */
function normalizeString(str) {
  if (!str) return null;
  return str
    .replace(/^\uFEFF/, '') // BOM除去
    .replace(/^"|"$/g, '')   // ダブルクォート除去
    .replace(/\s+/g, ' ')    // 連続する空白を1つに統一
    .trim();                 // 前後の空白除去
}

/**
 * 診療科目コードの正規化
 * 数値の場合は前ゼロを統一し、空白を除去
 * 全角数字を半角数字に変換
 * 空文字列やnullの場合はnullを返す
 * 数値変換は行わず、文字列として扱う
 */
function normalizeDepartmentCode(code) {
  if (!code) return null;
  
  // 基本的な正規化
  let normalized = normalizeString(code);
  if (!normalized || normalized === '') return null;
  
  // 全角数字を半角数字に変換
  normalized = normalized.replace(/[０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
  
  // 数値のみの場合は前ゼロを統一（5桁に統一）
  // 例: "1" → "00001", "1001" → "01001"
  if (/^\d+$/.test(normalized)) {
    normalized = normalized.padStart(5, '0');
  }
  
  return normalized;
}

/**
 * CSVヘッダーの正規化
 */
function normalizeHeader(header) {
  return normalizeString(header);
}

/**
 * 1行のCSVデータから opening_hours の1曜日分を抽出
 * 既存データ構造に合わせて、診療開始時間・終了時間を取得
 * 構造: { "monday": { "start": "09:00", "end": "17:30" }, ... }
 */
function extractDayHours(row, day, dayName) {
  const startTime = normalizeString(row[`${day}_診療開始時間`]);
  const endTime = normalizeString(row[`${day}_診療終了時間`]);

  // 診療開始時間または診療終了時間のいずれかがあれば返す
  if (startTime || endTime) {
    return {
      start: startTime || '',
      end: endTime || '',
    };
  }
  return null;
}

/**
 * 1行のCSVデータから opening_hours を構築
 * 全曜日の診療時間を抽出
 */
function buildOpeningHoursFromRow(row) {
  const hours = {};
  const weekdays = ['月', '火', '水', '木', '金', '土', '日', '祝'];
  const weekdayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'holiday'];

  for (let i = 0; i < weekdays.length; i++) {
    const day = weekdays[i];
    const dayName = weekdayNames[i];
    const dayHours = extractDayHours(row, day, dayName);
    
    if (dayHours) {
      hours[dayName] = dayHours;
    }
  }

  // 空の場合は null を返す
  return Object.keys(hours).length > 0 ? hours : null;
}

/**
 * 2つの opening_hours オブジェクトをマージ
 * 曜日単位で安全に統合する
 * - 既存の曜日がない場合: 新しい曜日情報を追加
 * - 既存の曜日がある場合: 既存情報を保持（上書きしない）
 * - 既存の曜日が空（startもendもない）の場合: 新しい情報で上書き
 */
function mergeOpeningHours(existing, newHours) {
  // 既存データがない場合は新しいデータをそのまま返す
  if (!existing) {
    return newHours;
  }
  // 新しいデータがない場合は既存データをそのまま返す
  if (!newHours) {
    return existing;
  }

  // 既存の opening_hours をコピー（既存情報を保持）
  const merged = { ...existing };

  // 新しい opening_hours をマージ
  for (const [day, hours] of Object.entries(newHours)) {
    // 既存の曜日情報がない場合: 新しい曜日情報を追加
    if (!merged[day]) {
      merged[day] = { ...hours };
    }
    // 既存の曜日情報がある場合: 既存情報が空（startもendもない）の場合のみ上書き
    else if (!merged[day].start && !merged[day].end) {
      merged[day] = { ...hours };
    }
    // 既存の曜日情報があり、かつ空でない場合: 既存情報を保持（上書きしない）
  }

  return merged;
}

/**
 * clinic テーブルを全件ロードして Map<clinic_gov_id, clinic_id> を作成
 */
async function loadClinicMap() {
  console.log('▶ clinic テーブルを全件読み込み中...');
  
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

  // Map<clinic_gov_id, clinic_id> を作成
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

  console.log(`✔ clinic Map ロード完了: ${map.size} 件`);
  return map;
}

/**
 * 既存の clinic_department を全件ロードして Map<clinic_id + 診療科目コード, id> を作成
 * 重複チェック用に使用する
 */
async function loadExistingClinicDepartmentMap() {
  console.log('▶ 既存の clinic_department テーブルを読み込み中...');
  
  let allData = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  // ページネーションで全件取得
  while (hasMore) {
    const { data, error } = await supabase
      .from('clinic_department')
      .select('id, clinic_id, gov_id')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      throw new Error(`[FATAL] clinic_department テーブル読み込みエラー: ${error.message}`);
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

  // Map<clinic_id + 診療科目コード, id> を作成（重複チェック用）
  const map = new Map();
  for (const d of allData) {
    if (d.clinic_id && d.gov_id) {
      // 診療科目コードを正規化
      const normalizedCode = normalizeDepartmentCode(d.gov_id);
      if (normalizedCode) {
        // キー: clinic_id + 診療科目コード
        const key = `${d.clinic_id}_${normalizedCode}`;
        map.set(key, d.id);
      }
    }
  }

  console.log(`✔ 既存の clinic_department Map ロード完了: ${map.size} 件`);
  return map;
}

/**
 * CSVを読み込み、メモリ上で集約
 * キー: clinic_gov_id + 診療科目コード
 * 値: { clinic_id, gov_id, department_name, opening_hours }
 */
async function aggregateCsvData(clinicMap) {
  console.log('▶ CSVファイルを読み込み、集約中...');
  console.log(`CSVファイル: ${CSV_PATH}`);

  // 集約用のMap: キー = `${clinic_gov_id}_${診療科目コード}`
  const aggregatedMap = new Map();
  let rowCount = 0;
  let skippedCount = 0;
  let skippedClinicNotFound = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv({
        mapHeaders: ({ header }) => normalizeHeader(header)
      }))
      .on('data', (row) => {
        rowCount++;

        // clinic_gov_id を取得・正規化（CSVの「ID」）
        const clinicGovId = normalizeString(row['ID']);
        if (!clinicGovId || clinicGovId === '') {
          skippedCount++;
          return;
        }

        // clinic_id を取得
        const clinicId = clinicMap.get(clinicGovId);
        if (!clinicId) {
          // clinic.gov_id が存在しない場合はSKIP
          skippedClinicNotFound++;
          return;
        }

        // 診療科目コードを取得・正規化（集約キーに使用）
        // 数値の場合は前ゼロを統一し、表記揺れを防ぐ
        let departmentCode = normalizeDepartmentCode(row['診療科目コード']);
        
        // 診療科目名を取得・正規化（保存用）
        const departmentName = normalizeString(row['診療科目名']);
        if (!departmentName) {
          skippedCount++;
          return;
        }

        // 診療科目コードが空の場合は、診療科目名をフォールバックとして使用
        // ただし、診療科目名も正規化して使用（表記揺れを防ぐ）
        if (!departmentCode || departmentCode === '') {
          // 診療科目名をそのまま使用（正規化済み）
          departmentCode = departmentName;
        }

        // 集約キーを作成: clinic_gov_id + 診療科目コード
        const aggregateKey = `${clinicGovId}_${departmentCode}`;

        // この行の opening_hours を構築
        const rowOpeningHours = buildOpeningHoursFromRow(row);

        // 既存のデータを取得
        const existing = aggregatedMap.get(aggregateKey);

        if (existing) {
          // 既存データがある場合、opening_hours をマージ（1レコードに統合）
          existing.opening_hours = mergeOpeningHours(existing.opening_hours, rowOpeningHours);
        } else {
          // 新規データの場合
          aggregatedMap.set(aggregateKey, {
            clinic_id: clinicId,
            gov_id: departmentCode, // 診療科目コードを gov_id として保存
            department_name: departmentName,
            opening_hours: rowOpeningHours,
          });
        }
      })
      .on('end', () => {
        console.log(`✔ CSV読み込み完了: ${rowCount} 行`);
        console.log(`  - 集約後の診療科数: ${aggregatedMap.size} 件`);
        console.log(`  - スキップ件数（gov_id、診療科目コード、または診療科目名が空）: ${skippedCount} 件`);
        console.log(`  - スキップ件数（clinic が見つからない）: ${skippedClinicNotFound} 件`);
        
        resolve({
          aggregatedMap,
          rowCount,
          skippedCount,
          skippedClinicNotFound,
        });
      })
      .on('error', (error) => {
        console.error(`[FATAL] CSV読み込みエラー: ${error.message}`);
        reject(error);
      });
  });
}

/**
 * バッチ挿入処理
 * エラー時は即停止せず、エラー情報を返す
 */
async function insertBatch(departments) {
  if (departments.length === 0) return { success: true, count: 0 };

  try {
    const { data, error } = await supabase
      .from('clinic_department')
      .insert(departments)
      .select();

    if (error) {
      throw error;
    }

    return { success: true, count: departments.length };
  } catch (error) {
    return { success: false, error: error };
  }
}

/**
 * 集約されたデータをバッチ処理でINSERT
 * 既存キーを除外してからINSERT
 */
async function insertAggregatedData(aggregatedMap, existingKeyMap) {
  console.log('▶ バッチ処理でINSERT開始...');

  // Map を配列に変換
  const allDepartments = Array.from(aggregatedMap.values());

  // 既存キーを除外（新規データのみを抽出）
  const newDepartments = [];
  let skippedExistingCount = 0;

  for (const dept of allDepartments) {
    // 既存キー: clinic_id + 診療科目コード
    const existingKey = `${dept.clinic_id}_${dept.gov_id}`;
    
    if (existingKeyMap.has(existingKey)) {
      // 既存キーはSKIP（INSERTしない）
      skippedExistingCount++;
    } else {
      // 新規データのみ追加
      newDepartments.push(dept);
    }
  }

  console.log(`  - 集約後の診療科数: ${allDepartments.length} 件`);
  console.log(`  - 既存キー（SKIP）: ${skippedExistingCount} 件`);
  console.log(`  - 新規登録対象: ${newDepartments.length} 件`);

  if (newDepartments.length === 0) {
    console.log('⚠ 新規登録対象がありません。');
    return { insertedCount: 0, skippedExistingCount };
  }

  // バッチに分割
  const batches = [];
  for (let i = 0; i < newDepartments.length; i += BATCH_SIZE) {
    batches.push(newDepartments.slice(i, i + BATCH_SIZE));
  }

  console.log(`バッチ数: ${batches.length} バッチ（各最大 ${BATCH_SIZE} 件）`);

  let insertedCount = 0;
  let failedBatchCount = 0;

  // バッチごとにINSERT
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const result = await insertBatch(batch);

    if (result.success) {
      insertedCount += result.count;
      console.log(`✔ バッチ ${i + 1}/${batches.length}: ${result.count} 件登録（累計: ${insertedCount} 件）`);
    } else {
      const errorMsg = result.error?.message || JSON.stringify(result.error);
      console.error(`[FATAL] バッチ ${i + 1}/${batches.length} でエラー: ${errorMsg}`);
      failedBatchCount++;
      // エラー時も処理を続行（他のバッチは処理する）
      // ただし、致命的なエラーの場合は後で確認できるようにログを残す
    }
  }

  if (failedBatchCount > 0) {
    console.warn(`⚠ ${failedBatchCount} バッチでエラーが発生しました。ログを確認してください。`);
  }

  return { insertedCount, skippedExistingCount };
}

/**
 * メイン処理
 */
async function importClinicDepartments() {
  try {
    console.log('========================================');
    console.log('clinic_department 一括ロード開始');
    console.log('========================================');

    // 1. clinic テーブルを全件ロードして Map を作成
    const clinicMap = await loadClinicMap();

    if (clinicMap.size === 0) {
      throw new Error('[FATAL] clinic テーブルが空です。先に importClinic.js を実行してください。');
    }

    // 2. 既存の clinic_department を全件ロードして Map を作成（重複チェック用）
    const existingKeyMap = await loadExistingClinicDepartmentMap();

    // 3. CSVを読み込み、メモリ上で集約
    const { aggregatedMap, rowCount, skippedCount, skippedClinicNotFound } = await aggregateCsvData(clinicMap);

    // 4. 集約されたデータをバッチ処理でINSERT（既存キーを除外）
    const { insertedCount, skippedExistingCount } = await insertAggregatedData(aggregatedMap, existingKeyMap);

    console.log('========================================');
    console.log('🎉 処理完了');
    console.log('========================================');
    console.log(`clinic ロード件数: ${clinicMap.size} 件`);
    console.log(`CSV行数: ${rowCount} 行`);
    console.log(`集約後の診療科数: ${aggregatedMap.size} 件`);
    console.log(`INSERT 成功数: ${insertedCount} 件`);
    console.log(`SKIP 数（clinic 不在）: ${skippedClinicNotFound} 件`);
    console.log(`SKIP 数（既存キー）: ${skippedExistingCount} 件`);
    console.log(`SKIP 数（gov_id、診療科目コード、または診療科目名が空）: ${skippedCount} 件`);
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
  importClinicDepartments()
    .then(() => {
      console.log('処理が正常に完了しました。');
      process.exit(0);
    })
    .catch((error) => {
      console.error(`[FATAL] 致命的エラー: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { importClinicDepartments };

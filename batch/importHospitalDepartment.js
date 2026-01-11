/**
 * importHospitalDepartment.js
 * 
 * このファイルは、政府公開CSV（01-2_hospital_speciality_hours_20251201.csv）を読み込み、
 * Supabase の hospital_department テーブルに大量・安全・高速に登録するバッチ処理です。
 * 
 * 処理内容:
 * 1. hospital テーブルを全件ロードして Map<gov_id, hospital_id> を作成
 * 2. CSVを1行ずつ読み込み、メモリ上で集約（hospital_gov_id + 診療科目コード をキーに）
 * 3. 同一キーの行は、曜日別に opening_hours をマージ
 * 4. CSV全体を集約し終わってから、バッチ処理でINSERT
 * 5. hospital に存在しない gov_id はスキップ（ログ出力）
 * 
 * 前提条件:
 * - hospital テーブルは全件登録済みであること
 */

const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Supabase接続情報
const SUPABASE_URL = 'https://sauhmasxargkwltsuujm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdWhtYXN4YXJna3dsdHN1dWptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ1ODE1NywiZXhwIjoyMDgxMDM0MTU3fQ.NzLh4WYdqpPTrigqarEL7ImFzSlEEYTynIp79Re9QQc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 設定
const CSV_PATH = './01-2_hospital_speciality_hours_20251201.csv';
const BATCH_SIZE = 1000; // バッチサイズ（500-1000件）

/**
 * 文字列の正規化（BOM、ダブルクォート、空白を除去）
 * 全角・半角の統一、連続する空白の除去も行う
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
 * 診療科目名の正規化（集約キー用）
 * 全角・半角の統一、連続する空白の除去、大文字小文字の統一など
 */
function normalizeDepartmentNameForKey(name) {
  if (!name) return null;
  
  // 基本的な正規化
  let normalized = normalizeString(name);
  if (!normalized || normalized === '') return null;
  
  // 全角・半角の統一（全角英数字を半角に変換）
  normalized = normalized.replace(/[０-９Ａ-Ｚａ-ｚ]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
  
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
 * 
 * 例:
 * existing = { "monday": { "start": "09:00", "end": "17:00" } }
 * newHours = { "tuesday": { "start": "09:00", "end": "17:00" }, "monday": { "start": "10:00", "end": "18:00" } }
 * → { "monday": { "start": "09:00", "end": "17:00" }, "tuesday": { "start": "09:00", "end": "17:00" } }
 * （既存のmonday情報は保持され、新しいtuesday情報が追加される）
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
 * hospital テーブルを全件ロードして Map<gov_id, hospital_id> を作成
 */
async function loadHospitalMap() {
  console.log('▶ hospital テーブルを全件読み込み中...');
  
  let allData = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  // ページネーションで全件取得
  while (hasMore) {
    const { data, error } = await supabase
      .from('hospital')
      .select('id, gov_id')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      throw new Error(`[FATAL] hospital テーブル読み込みエラー: ${error.message}`);
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

  // Map<gov_id, hospital_id> を作成
  const map = new Map();
  for (const h of allData) {
    if (h.gov_id) {
      // gov_id を正規化（trim処理）
      const normalizedGovId = normalizeString(h.gov_id);
      if (normalizedGovId) {
        map.set(normalizedGovId, h.id);
      }
    }
  }

  console.log(`✔ hospital Map ロード完了: ${map.size} 件`);
  return map;
}

/**
 * CSVを読み込み、メモリ上で集約
 * キー: hospital_gov_id + 診療科目コード
 * 値: { hospital_id, gov_id, department_name, opening_hours }
 */
async function aggregateCsvData(hospitalMap) {
  console.log('▶ CSVファイルを読み込み、集約中...');
  console.log(`CSVファイル: ${CSV_PATH}`);

  // 集約用のMap: キー = `${gov_id}_${診療科目コード}`
  const aggregatedMap = new Map();
  let rowCount = 0;
  let skippedCount = 0;
  let skippedHospitalNotFound = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv({
        mapHeaders: ({ header }) => normalizeHeader(header)
      }))
      .on('data', (row) => {
        rowCount++;

        // gov_id を取得・正規化（hospital Mapのキーと完全一致させる）
        const govId = normalizeString(row['ID']);
        if (!govId || govId === '') {
          skippedCount++;
          return;
        }

        // hospital_id を取得（正規化されたgov_idで検索）
        const hospitalId = hospitalMap.get(govId);
        if (!hospitalId) {
          skippedHospitalNotFound++;
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
        // 診療科目名も集約キー用に正規化して使用（表記揺れを防ぐ）
        if (!departmentCode || departmentCode === '') {
          departmentCode = normalizeDepartmentNameForKey(departmentName);
          // 診療科目名も空の場合はスキップ
          if (!departmentCode) {
            skippedCount++;
            return;
          }
        }

        // 集約キーを作成: hospital_gov_id + 診療科目コード
        // gov_id と departmentCode の両方を正規化して使用
        // 区切り文字は明確に '_' を使用（gov_idやdepartmentCodeに '_' が含まれないことを前提）
        const aggregateKey = `${govId}_${departmentCode}`;

        // この行の opening_hours を構築
        const rowOpeningHours = buildOpeningHoursFromRow(row);

        // 既存のデータを取得
        const existing = aggregatedMap.get(aggregateKey);

        if (existing) {
          // 既存データがある場合、opening_hours をマージ
          existing.opening_hours = mergeOpeningHours(existing.opening_hours, rowOpeningHours);
        } else {
          // 新規データの場合
          aggregatedMap.set(aggregateKey, {
            hospital_id: hospitalId,
            gov_id: govId,
            department_name: departmentName,
            opening_hours: rowOpeningHours,
          });
        }
      })
      .on('end', () => {
        console.log(`✔ CSV読み込み完了: ${rowCount} 行`);
        console.log(`  - 集約後の診療科数: ${aggregatedMap.size} 件`);
        console.log(`  - スキップ件数（gov_id、診療科目コード、または診療科目名が空）: ${skippedCount} 件`);
        console.log(`  - スキップ件数（hospital が見つからない）: ${skippedHospitalNotFound} 件`);
        
        resolve({
          aggregatedMap,
          rowCount,
          skippedCount,
          skippedHospitalNotFound,
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
 */
async function insertBatch(departments) {
  if (departments.length === 0) return { success: true, count: 0 };

  try {
    const { data, error } = await supabase
      .from('hospital_department')
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
 */
async function insertAggregatedData(aggregatedMap) {
  console.log('▶ バッチ処理でINSERT開始...');

  // Map を配列に変換
  const departments = Array.from(aggregatedMap.values());

  if (departments.length === 0) {
    console.log('⚠ 登録対象がありません。');
    return { insertedCount: 0 };
  }

  // バッチに分割
  const batches = [];
  for (let i = 0; i < departments.length; i += BATCH_SIZE) {
    batches.push(departments.slice(i, i + BATCH_SIZE));
  }

  console.log(`バッチ数: ${batches.length} バッチ（各最大 ${BATCH_SIZE} 件）`);

  let insertedCount = 0;

  // バッチごとにINSERT
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const result = await insertBatch(batch);

    if (result.success) {
      insertedCount += result.count;
      console.log(`✔ バッチ ${i + 1}/${batches.length}: ${result.count} 件登録（累計: ${insertedCount} 件）`);
    } else {
      const errorMsg = result.error?.message || JSON.stringify(result.error);
      throw new Error(`[FATAL] バッチ ${i + 1}/${batches.length} でエラー: ${errorMsg}`);
    }
  }

  return { insertedCount };
}

/**
 * メイン処理
 */
async function importHospitalDepartments() {
  try {
    console.log('========================================');
    console.log('hospital_department 一括ロード開始');
    console.log('========================================');

    // 1. hospital テーブルを全件ロードして Map を作成
    const hospitalMap = await loadHospitalMap();

    if (hospitalMap.size === 0) {
      throw new Error('[FATAL] hospital テーブルが空です。先に importHospital.js を実行してください。');
    }

    // 2. CSVを読み込み、メモリ上で集約
    const { aggregatedMap, rowCount, skippedCount, skippedHospitalNotFound } = await aggregateCsvData(hospitalMap);

    // 3. 集約されたデータをバッチ処理でINSERT
    const { insertedCount } = await insertAggregatedData(aggregatedMap);

    console.log('========================================');
    console.log('🎉 処理完了');
    console.log('========================================');
    console.log(`CSV行数: ${rowCount} 行`);
    console.log(`集約後の診療科数: ${aggregatedMap.size} 件`);
    console.log(`登録件数: ${insertedCount} 件`);
    console.log(`スキップ件数（gov_id、診療科目コード、または診療科目名が空）: ${skippedCount} 件`);
    console.log(`スキップ件数（hospital が見つからない）: ${skippedHospitalNotFound} 件`);
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
  importHospitalDepartments()
    .then(() => {
      console.log('処理が正常に完了しました。');
      process.exit(0);
    })
    .catch((error) => {
      console.error(`[FATAL] 致命的エラー: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { importHospitalDepartments };

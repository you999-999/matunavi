/**
 * CSV検索スクリプト
 * 病院・診療所のCSVファイルから指定したキーワードを検索
 */

const fs = require('fs');
const csv = require('csv-parser');

// 検索キーワード（コマンドライン引数から取得、または直接指定）
const keyword = process.argv[2] || 'こうのう';

console.log(`🔍 検索キーワード: "${keyword}"`);
console.log('========================================\n');

// 検索対象のCSVファイル
const csvFiles = [
  './01-1_hospital_facility_info_20251201.csv',
  './02-1_clinic_facility_info_20251201.csv',
];

let totalCount = 0;

// 文字列の正規化（BOM除去、空白除去）
function normalizeString(str) {
  if (!str) return '';
  return str
    .replace(/^\uFEFF/, '')
    .replace(/^"|"$/g, '')
    .trim();
}

// 各CSVファイルを検索
async function searchCsv(filePath) {
  return new Promise((resolve) => {
    const results = [];
    let rowCount = 0;

    fs.createReadStream(filePath, { encoding: 'utf8' })
      .pipe(csv({
        mapHeaders: ({ header }) => normalizeString(header)
      }))
      .on('data', (row) => {
        rowCount++;
        
        // 正式名称で検索（部分一致、大文字小文字を区別しない）
        const name = normalizeString(row['正式名称'] || row['ID'] || '');
        
        // 検索（部分一致）
        if (name.includes(keyword)) {
          results.push({
            file: filePath,
            row: rowCount,
            id: normalizeString(row['ID'] || ''),
            name: name,
            address: normalizeString(row['所在地'] || ''),
            prefecture: normalizeString(row['都道府県コード'] || ''),
          });
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        console.error(`エラー: ${filePath}`, error.message);
        resolve([]);
      });
  });
}

// メイン処理
async function main() {
  for (const file of csvFiles) {
    if (!fs.existsSync(file)) {
      console.log(`⚠ ${file} が見つかりません`);
      continue;
    }

    console.log(`📄 ${file} を検索中...`);
    const results = await searchCsv(file);
    
    if (results.length > 0) {
      console.log(`\n✔ ${results.length}件見つかりました:\n`);
      results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   住所: ${result.address}`);
        console.log(`   都道府県コード: ${result.prefecture}`);
        console.log(`   ID: ${result.id}`);
        console.log('');
      });
      totalCount += results.length;
    } else {
      console.log('   見つかりませんでした\n');
    }
  }

  console.log('========================================');
  console.log(`合計: ${totalCount}件`);
}

main().catch(console.error);

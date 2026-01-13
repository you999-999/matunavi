/**
 * まつなび - 政府データ取得スクリプト
 * 
 * このスクリプトは、厚生労働省が公開する医療機関データ（ZIP形式）を
 * 自動的にダウンロードするバッチ処理です。
 * 
 * 【目的】
 * - 厚生労働省の医療機関情報ページからZIPファイルのURLを取得
 * - 病院・診療所の施設データと診療科データをダウンロード
 * - ZIPファイルを解凍し、CSV ファイルを確認
 * 
 * 【データソース】
 * 厚生労働省「医療機能情報提供制度」
 * URL: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/newpage_43373.html
 * 
 * 【取得するデータ（4種類）】
 * 1. hospital（病院施設データ）
 *    - ファイル名パターン: hospital_facility_*.zip
 *    - 内容: 病院の基本情報（名称、住所、診療時間等）
 * 
 * 2. hospital_department（病院診療科データ）
 *    - ファイル名パターン: hospital_speciality_*.zip
 *    - 内容: 病院が提供する診療科の情報
 * 
 * 3. clinic（診療所施設データ）
 *    - ファイル名パターン: clinic_facility_*.zip
 *    - 内容: 診療所の基本情報（名称、住所、診療時間等）
 * 
 * 4. clinic_department（診療所診療科データ）
 *    - ファイル名パターン: clinic_speciality_*.zip
 *    - 内容: 診療所が提供する診療科の情報
 * 
 * 【処理フロー】
 * 1. 政府ページのHTMLを取得
 * 2. cheerio でパースし、ZIPファイルのリンクを抽出
 * 3. 必要な4種類のZIPファイルを特定
 * 4. 各ZIPファイルをダウンロード
 * 5. ZIP内のCSVファイル名を確認・表示
 * 
 * 【実行方法】
 * ```bash
 * cd batch
 * node fetchGovZip.js
 * ```
 * 
 * 【依存パッケージ】
 * - https: Node.js標準モジュール（HTTPS通信）
 * - fs: Node.js標準モジュール（ファイル操作）
 * - path: Node.js標準モジュール（パス操作）
 * - adm-zip: ZIPファイルの解凍
 * - cheerio: HTML解析（jQueryライクなDOM操作）
 * 
 * 【注意事項】
 * - 政府ページの構造変更により動作しなくなる可能性あり
 * - ZIPファイルは数十MBあるため、ダウンロードに時間がかかる
 * - ダウンロード先は __dirname（このスクリプトと同じディレクトリ）
 * 
 * 【メンテナンス】
 * - 政府ページの構造変更時は、セレクタを修正
 * - ファイル名パターンの変更にも対応が必要
 * 
 * @module fetchGovZip
 */

// ===================================
// 必要なモジュールのインポート
// ===================================

const https = require("https");  // HTTPS通信
const fs = require("fs");        // ファイルシステム操作
const path = require("path");    // ファイルパス操作
const AdmZip = require("adm-zip");  // ZIP解凍
const cheerio = require("cheerio");  // HTML解析

// ===================================
// 定数定義
// ===================================

/**
 * 厚生労働省の医療機関情報ページURL
 * このページから最新のZIPファイルリンクを取得する
 */
const GOV_PAGE =
  "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/newpage_43373.html";

/**
 * 作業ディレクトリ
 * ダウンロードしたZIPファイルの保存先
 */
const WORK_DIR = __dirname;

// ===================================
// ユーティリティ関数
// ===================================

/**
 * URLからテキストデータを取得する関数
 * 
 * HTTPS GETリクエストを送信し、レスポンスボディを文字列として取得します。
 * 主に政府ページのHTMLを取得するために使用します。
 * 
 * @param {string} url - 取得するURL
 * @returns {Promise<string>} レスポンスボディ（HTMLテキスト等）
 * @throws {Error} ネットワークエラーや接続エラー時
 */
function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        // データを受信するたびにバッファに追加
        res.on("data", (chunk) => (data += chunk));
        // 受信完了時にPromiseを解決
        res.on("end", () => resolve(data));
      })
      .on("error", reject);  // エラー時はPromiseを拒否
  });
}

/**
 * URLからファイルをダウンロードする関数
 * 
 * HTTPS GETリクエストを送信し、レスポンスボディをファイルとして保存します。
 * ZIPファイルのダウンロードに使用します。
 * 
 * @param {string} url - ダウンロード元URL
 * @param {string} dest - 保存先ファイルパス
 * @returns {Promise<void>} ダウンロード完了時に解決
 * @throws {Error} HTTPステータスが200以外、またはネットワークエラー時
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        // HTTPステータスコードをチェック
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed: ${res.statusCode}`));
          return;
        }
        // レスポンスストリームをファイルに書き込み
        res.pipe(file);
        // ファイル書き込み完了時にPromiseを解決
        file.on("finish", () => file.close(resolve));
      })
      .on("error", reject);  // エラー時はPromiseを拒否
  });
}

// ===================================
// メイン処理
// ===================================

/**
 * メイン処理関数
 * 
 * 政府ページから医療機関データのZIPファイルをダウンロードし、
 * 内容を確認する一連の処理を実行します。
 * 
 * @async
 * @returns {Promise<void>} 処理完了時に解決
 * @throws {Error} ZIP URLが見つからない、ダウンロード失敗等
 */
async function main() {
  console.log("政府ページ取得中…");

  // 政府ページのHTMLを取得
  const html = await fetchText(GOV_PAGE);
  
  // cheerio でHTMLをパース（jQueryライクなDOM操作が可能に）
  const $ = cheerio.load(html);

  // ===================================
  // ZIPリンクの抽出
  // ===================================
  
  // .zip で終わるリンクをすべて取得
  const zipUrls = [];
  $("a[href$='.zip']").each((_, el) => {
    const href = $(el).attr("href");
    // 医療機関情報のパス（/content/11121000/）に含まれるもののみ対象
    if (href && href.includes("/content/11121000/")) {
      zipUrls.push("https://www.mhlw.go.jp" + href);
    }
  });

  // ZIPファイルが見つからない場合はエラー
  if (zipUrls.length === 0) {
    throw new Error("ZIP URL が見つかりません");
  }

  // ===================================
  // 必要な4種類のZIPファイルを特定
  // ===================================
  
  const targets = {
    // 病院施設データ（hospital + facility を含むURL）
    hospital: zipUrls.find((u) => u.includes("hospital") && u.includes("facility")),
    // 病院診療科データ（hospital + speciality を含むURL）
    hospital_department: zipUrls.find((u) => u.includes("hospital") && u.includes("speciality")),
    // 診療所施設データ（clinic + facility を含むURL）
    clinic: zipUrls.find((u) => u.includes("clinic") && u.includes("facility")),
    // 診療所診療科データ（clinic + speciality を含むURL）
    clinic_department: zipUrls.find((u) => u.includes("clinic") && u.includes("speciality")),
  };

  // 取得したURLをログ出力
  console.log("最新ZIP URL:");
  Object.values(targets).forEach((u) => console.log(u));

  console.log("ZIP ダウンロード開始…");

  // ===================================
  // ZIPファイルのダウンロードと内容確認
  // ===================================
  
  const csvResults = [];

  // 4種類のZIPファイルをダウンロード
  for (const [key, url] of Object.entries(targets)) {
    if (!url) continue;  // URLが見つからない場合はスキップ

    // ZIPファイルをダウンロード
    const zipPath = path.join(WORK_DIR, path.basename(url));
    await downloadFile(url, zipPath);

    // ZIPファイルを解凍（メモリ上で展開）
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    // ZIP内のCSVファイルを確認
    entries.forEach((e) => {
      if (e.entryName.endsWith(".csv")) {
        // 論理ファイル名を決定（後続処理で使いやすい名前に変換）
        let logicalName = "";

        if (key === "hospital") logicalName = "hospital.csv";
        if (key === "hospital_department") logicalName = "hospital_department.csv";
        if (key === "clinic") logicalName = "clinic.csv";
        if (key === "clinic_department") logicalName = "clinic_department.csv";

        csvResults.push(logicalName);
      }
    });
  }

  // 取得したCSVファイル一覧を表示
  console.log("ZIP内のCSV一覧:");
  csvResults.forEach((c) => console.log(" - " + c));
}

// ===================================
// スクリプト実行
// ===================================

/**
 * スクリプトのエントリーポイント
 * 
 * main関数を実行し、エラーが発生した場合はコンソールに表示します。
 * 
 * 【実行結果】
 * - 成功時: ZIP内のCSV一覧が表示される
 * - 失敗時: エラーメッセージが表示される
 */
main().catch((err) => {
  console.error("エラー:", err.message);
});

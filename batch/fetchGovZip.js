const https = require("https");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const cheerio = require("cheerio");

const GOV_PAGE =
  "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/newpage_43373.html";

const WORK_DIR = __dirname;

/* -------------------- utils -------------------- */

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed: ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", reject);
  });
}

/* -------------------- main -------------------- */

async function main() {
  console.log("政府ページ取得中…");

  const html = await fetchText(GOV_PAGE);
  const $ = cheerio.load(html);

  // ZIPリンクをすべて取得
  const zipUrls = [];
  $("a[href$='.zip']").each((_, el) => {
    const href = $(el).attr("href");
    if (href && href.includes("/content/11121000/")) {
      zipUrls.push("https://www.mhlw.go.jp" + href);
    }
  });

  if (zipUrls.length === 0) {
    throw new Error("ZIP URL が見つかりません");
  }

  // 必要な4系統を特定
  const targets = {
    hospital: zipUrls.find((u) => u.includes("hospital") && u.includes("facility")),
    hospital_department: zipUrls.find((u) => u.includes("hospital") && u.includes("speciality")),
    clinic: zipUrls.find((u) => u.includes("clinic") && u.includes("facility")),
    clinic_department: zipUrls.find((u) => u.includes("clinic") && u.includes("speciality")),
  };

  console.log("最新ZIP URL:");
  Object.values(targets).forEach((u) => console.log(u));

  console.log("ZIP ダウンロード開始…");

  const csvResults = [];

  for (const [key, url] of Object.entries(targets)) {
    if (!url) continue;

    const zipPath = path.join(WORK_DIR, path.basename(url));
    await downloadFile(url, zipPath);

    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    entries.forEach((e) => {
      if (e.entryName.endsWith(".csv")) {
        let logicalName = "";

        if (key === "hospital") logicalName = "hospital.csv";
        if (key === "hospital_department") logicalName = "hospital_department.csv";
        if (key === "clinic") logicalName = "clinic.csv";
        if (key === "clinic_department") logicalName = "clinic_department.csv";

        csvResults.push(logicalName);
      }
    });
  }

  console.log("ZIP内のCSV一覧:");
  csvResults.forEach((c) => console.log(" - " + c));
}

/* -------------------- run -------------------- */

main().catch((err) => {
  console.error("エラー:", err.message);
});

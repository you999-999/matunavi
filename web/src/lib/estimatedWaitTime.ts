/**
 * まつなび - 統計的待ち時間算出ロジック
 * 
 * 実データがない初期状態でも、全ての病院に
 * 「統計的に見た待ち時間の目安」をデフォルト表示するためのロジック
 * 
 * 【設計思想】
 * - 医療行為ではない（判断支援に留まる）
 * - クレーム耐性が高い（レンジ・傾向表現）
 * - 将来、実データが集まったらそちらを優先する設計
 * 
 * 【評価軸（5項目）】
 * 1. 曜日（平日 / 土曜 / 日祝）
 * 2. 時間帯（午前 / 午後 / 夕方など）
 * 3. 診療科（内科・小児科・整形外科など）
 * 4. 病院の立地（都市部 / 郊外 / 地方 など）
 * 5. 病院の規模（小規模 / 中規模 / 大規模）
 * 
 * 【出力形式】
 * - 「比較的空きやすい」
 * - 「やや混みやすい」
 * - 「混みやすい」
 * または
 * - 「30〜60分程度になりやすい」などのレンジ表現
 */

// ===================================
// 型定義
// ===================================

/**
 * 曜日の種類
 */
export type DayOfWeekType = 'weekday' | 'saturday' | 'holiday';

/**
 * 時間帯の種類
 */
export type TimeSlotType = 'morning' | 'afternoon' | 'evening';

/**
 * 診療科の種類
 */
export type DepartmentType = 
  | 'internal'      // 内科
  | 'pediatrics'    // 小児科
  | 'orthopedics'  // 整形外科
  | 'surgery'      // 外科
  | 'dermatology'  // 皮膚科
  | 'ophthalmology' // 眼科
  | 'otolaryngology' // 耳鼻咽喉科
  | 'urology'      // 泌尿器科
  | 'gynecology'   // 産婦人科
  | 'psychiatry'   // 精神科
  | 'other';       // その他

/**
 * 立地の種類
 */
export type LocationType = 'urban' | 'suburban' | 'rural';

/**
 * 病院規模の種類
 */
export type HospitalSizeType = 'small' | 'medium' | 'large';

/**
 * 待ち時間の傾向レベル
 */
export type WaitTimeLevel = 'low' | 'medium' | 'high';

/**
 * 待ち時間の目安（レンジ表現）
 */
export interface EstimatedWaitTime {
  /** 待ち時間の傾向レベル */
  level: WaitTimeLevel;
  /** 表示用のテキスト（例: "比較的空きやすい"） */
  text: string;
  /** 待ち時間のレンジ（分） */
  range: {
    min: number;
    max: number;
  };
  /** 詳細な説明（オプション） */
  description?: string;
}

/**
 * 病院情報（統計的待ち時間算出に必要な情報）
 */
export interface HospitalInfo {
  /** 都道府県コード（2桁、例: "13" = 東京都） */
  prefecture?: string;
  /** 市区町村コード（5桁、例: "13101" = 東京都千代田区） */
  city?: string;
  /** 病床数（オプション、取得できる場合） */
  bedCount?: number;
  /** 診療科名（例: "内科"） */
  department?: string;
}

// ===================================
// ユーティリティ関数
// ===================================

/**
 * 現在の曜日を判定
 * @param date 判定する日付（デフォルト: 現在）
 * @returns 曜日の種類
 */
export function getDayOfWeekType(date: Date = new Date()): DayOfWeekType {
  const day = date.getDay(); // 0=日曜, 1=月曜, ..., 6=土曜
  
  // 日曜日または祝日（簡易判定：実装時は祝日APIを使用推奨）
  if (day === 0) {
    return 'holiday';
  }
  
  // 土曜日
  if (day === 6) {
    return 'saturday';
  }
  
  // 平日（月〜金）
  return 'weekday';
}

/**
 * 現在の時間帯を判定
 * @param date 判定する日時（デフォルト: 現在）
 * @returns 時間帯の種類
 */
export function getTimeSlotType(date: Date = new Date()): TimeSlotType {
  const hour = date.getHours();
  
  // 午前: 9時〜12時
  if (hour >= 9 && hour < 12) {
    return 'morning';
  }
  
  // 午後: 12時〜17時
  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }
  
  // 夕方: 17時〜19時
  return 'evening';
}

/**
 * 診療科名から診療科タイプを判定
 * @param departmentName 診療科名（例: "内科"）
 * @returns 診療科タイプ
 */
export function getDepartmentType(departmentName?: string): DepartmentType {
  if (!departmentName) {
    return 'other';
  }
  
  const name = departmentName.toLowerCase();
  
  if (name.includes('内科')) return 'internal';
  if (name.includes('小児科')) return 'pediatrics';
  if (name.includes('整形外科')) return 'orthopedics';
  if (name.includes('外科') && !name.includes('整形')) return 'surgery';
  if (name.includes('皮膚科')) return 'dermatology';
  if (name.includes('眼科')) return 'ophthalmology';
  if (name.includes('耳鼻') || name.includes('耳鼻咽喉')) return 'otolaryngology';
  if (name.includes('泌尿器')) return 'urology';
  if (name.includes('産婦人科') || name.includes('婦人科')) return 'gynecology';
  if (name.includes('精神科')) return 'psychiatry';
  
  return 'other';
}

/**
 * 都道府県コードから立地タイプを判定
 * @param prefecture 都道府県コード（2桁）
 * @returns 立地タイプ
 */
export function getLocationType(prefecture?: string): LocationType {
  if (!prefecture) {
    return 'suburban'; // デフォルト: 郊外
  }
  
  // 都市部: 東京都(13), 神奈川県(14), 大阪府(27), 愛知県(23), 埼玉県(11), 千葉県(12), 兵庫県(28), 福岡県(40)
  const urbanPrefectures = ['13', '14', '27', '23', '11', '12', '28', '40'];
  
  if (urbanPrefectures.includes(prefecture)) {
    return 'urban';
  }
  
  // 地方: 北海道(01), 青森県(02), 岩手県(03), 宮城県(04), 秋田県(05), 山形県(06), 福島県(07)
  // その他、人口の少ない都道府県
  const ruralPrefectures = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '15', '16', '17', '18', '19', '20', '21', '22', '24', '25', '26', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '41', '42', '43', '44', '45', '46', '47'];
  
  // 都市部でも地方でもない = 郊外
  if (ruralPrefectures.includes(prefecture)) {
    return 'rural';
  }
  
  return 'suburban';
}

/**
 * 病床数から病院規模を判定
 * @param bedCount 病床数
 * @returns 病院規模
 */
export function getHospitalSizeType(bedCount?: number): HospitalSizeType {
  if (!bedCount || bedCount === 0) {
    return 'medium'; // デフォルト: 中規模
  }
  
  // 小規模: 20床未満
  if (bedCount < 20) {
    return 'small';
  }
  
  // 大規模: 200床以上
  if (bedCount >= 200) {
    return 'large';
  }
  
  // 中規模: 20床以上200床未満
  return 'medium';
}

// ===================================
// 統計的待ち時間算出ロジック
// ===================================

/**
 * 各評価軸の待ち時間スコア（0〜100）
 * 数値が高いほど待ち時間が長い傾向
 */
const WAIT_TIME_SCORES = {
  // 曜日
  dayOfWeek: {
    weekday: 50,    // 平日: 標準
    saturday: 70,   // 土曜: やや混みやすい
    holiday: 30,    // 日祝: 比較的空きやすい
  },
  
  // 時間帯
  timeSlot: {
    morning: 80,    // 午前: 混みやすい（朝の受診が多い）
    afternoon: 60,  // 午後: やや混みやすい
    evening: 40,    // 夕方: 比較的空きやすい
  },
  
  // 診療科
  department: {
    internal: 70,       // 内科: 混みやすい
    pediatrics: 75,     // 小児科: 混みやすい（特に午前）
    orthopedics: 65,    // 整形外科: やや混みやすい
    surgery: 50,        // 外科: 標準
    dermatology: 45,    // 皮膚科: やや空きやすい
    ophthalmology: 55,  // 眼科: 標準
    otolaryngology: 50, // 耳鼻咽喉科: 標準
    urology: 45,        // 泌尿器科: やや空きやすい
    gynecology: 60,     // 産婦人科: やや混みやすい
    psychiatry: 40,     // 精神科: 比較的空きやすい
    other: 50,          // その他: 標準
  },
  
  // 立地
  location: {
    urban: 75,      // 都市部: 混みやすい
    suburban: 55,   // 郊外: やや混みやすい
    rural: 35,      // 地方: 比較的空きやすい
  },
  
  // 病院規模
  hospitalSize: {
    small: 45,      // 小規模: やや空きやすい
    medium: 55,     // 中規模: やや混みやすい
    large: 70,      // 大規模: 混みやすい
  },
} as const;

/**
 * 統計的待ち時間を算出
 * 
 * 5つの評価軸のスコアを合計し、平均を取って待ち時間の傾向を判定します。
 * 
 * @param hospitalInfo 病院情報
 * @param dayOfWeek 曜日（オプション、指定しない場合は現在の曜日）
 * @param timeSlot 時間帯（オプション、指定しない場合は現在の時間帯）
 * @returns 待ち時間の目安
 */
export function calculateEstimatedWaitTime(
  hospitalInfo: HospitalInfo,
  dayOfWeek?: DayOfWeekType,
  timeSlot?: TimeSlotType
): EstimatedWaitTime {
  // 1. 各評価軸の値を取得
  const dayOfWeekType = dayOfWeek || getDayOfWeekType();
  const timeSlotType = timeSlot || getTimeSlotType();
  const departmentType = getDepartmentType(hospitalInfo.department);
  const locationType = getLocationType(hospitalInfo.prefecture);
  const hospitalSizeType = getHospitalSizeType(hospitalInfo.bedCount);
  
  // 2. 各評価軸のスコアを取得
  const scores = {
    dayOfWeek: WAIT_TIME_SCORES.dayOfWeek[dayOfWeekType],
    timeSlot: WAIT_TIME_SCORES.timeSlot[timeSlotType],
    department: WAIT_TIME_SCORES.department[departmentType],
    location: WAIT_TIME_SCORES.location[locationType],
    hospitalSize: WAIT_TIME_SCORES.hospitalSize[hospitalSizeType],
  };
  
  // 3. スコアの平均を計算（0〜100）
  const averageScore = (
    scores.dayOfWeek +
    scores.timeSlot +
    scores.department +
    scores.location +
    scores.hospitalSize
  ) / 5;
  
  // 4. スコアから待ち時間レベルを判定
  let level: WaitTimeLevel;
  let text: string;
  let range: { min: number; max: number };
  let description: string | undefined;
  
  if (averageScore < 40) {
    // 比較的空きやすい
    level = 'low';
    text = '比較的空きやすい';
    range = { min: 10, max: 30 };
    description = '待ち時間は比較的短めになる傾向があります';
  } else if (averageScore < 60) {
    // やや混みやすい
    level = 'medium';
    text = 'やや混みやすい';
    range = { min: 30, max: 60 };
    description = '待ち時間は30〜60分程度になる傾向があります';
  } else {
    // 混みやすい
    level = 'high';
    text = '混みやすい';
    range = { min: 60, max: 120 };
    description = '待ち時間は60〜120分程度になる傾向があります';
  }
  
  return {
    level,
    text,
    range,
    description,
  };
}

/**
 * 待ち時間の目安を表示用テキストに変換
 * 
 * @param estimatedWaitTime 待ち時間の目安
 * @returns 表示用テキスト
 */
export function formatEstimatedWaitTime(estimatedWaitTime: EstimatedWaitTime): string {
  const { text, range } = estimatedWaitTime;
  
  // レンジ表現を追加
  return `${text}（${range.min}〜${range.max}分程度になりやすい）`;
}

/**
 * 実データが存在するかどうかを判定
 * 
 * 将来、ユーザーからの実データ（待ち時間投稿・確認）が入った場合に、
 * それを優先表示するための判定関数
 * 
 * @param sampleCount サンプル数（実データの件数）
 * @param threshold 閾値（この件数以上なら実データを優先、デフォルト: 5件）
 * @returns 実データを優先すべきかどうか
 */
export function shouldUseRealData(sampleCount: number, threshold: number = 5): boolean {
  return sampleCount >= threshold;
}

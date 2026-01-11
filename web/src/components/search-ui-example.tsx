/**
 * 病院・診療所検索UI - 画面案
 * React + TypeScript + Tailwind CSS を使用したモダンな検索インターフェース
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ============================================
// 1. メイン検索画面
// ============================================

// 検索結果の型定義
interface SearchResult {
  facility_type: 'hospital' | 'clinic';
  facility_name: string;
  address: string;
  prefecture: string;
  gov_id?: string;
}

/**
 * 都道府県コードを都道府県名に変換
 * JIS規格の都道府県コード（01-47）を都道府県名に変換
 */
function getPrefectureName(code: string): string {
  const prefectureMap: Record<string, string> = {
    '01': '北海道',
    '02': '青森県',
    '03': '岩手県',
    '04': '宮城県',
    '05': '秋田県',
    '06': '山形県',
    '07': '福島県',
    '08': '茨城県',
    '09': '栃木県',
    '10': '群馬県',
    '11': '埼玉県',
    '12': '千葉県',
    '13': '東京都',
    '14': '神奈川県',
    '15': '新潟県',
    '16': '富山県',
    '17': '石川県',
    '18': '福井県',
    '19': '山梨県',
    '20': '長野県',
    '21': '岐阜県',
    '22': '静岡県',
    '23': '愛知県',
    '24': '三重県',
    '25': '滋賀県',
    '26': '京都府',
    '27': '大阪府',
    '28': '兵庫県',
    '29': '奈良県',
    '30': '和歌山県',
    '31': '鳥取県',
    '32': '島根県',
    '33': '岡山県',
    '34': '広島県',
    '35': '山口県',
    '36': '徳島県',
    '37': '香川県',
    '38': '愛媛県',
    '39': '高知県',
    '40': '福岡県',
    '41': '佐賀県',
    '42': '長崎県',
    '43': '熊本県',
    '44': '大分県',
    '45': '宮崎県',
    '46': '鹿児島県',
    '47': '沖縄県',
  };

  return prefectureMap[code] || code;
}

const SearchPage: React.FC = () => {
  // 検索条件のstate（初期値は空文字）
  const [searchType, setSearchType] = useState<'hospital' | 'clinic' | 'both'>('both');
  const [prefecture, setPrefecture] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [facilityName, setFacilityName] = useState<string>(''); // 病院・診療所名
  const [address, setAddress] = useState<string>(''); // 住所
  const [dayOfWeek, setDayOfWeek] = useState<string>('');
  const [timeRange, setTimeRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  
  // 検索結果のstate
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // 選択された施設のstate
  const [selectedFacility, setSelectedFacility] = useState<SearchResult | null>(null);

  /**
   * 検索ボタンをクリックしたときの処理
   * Supabaseのfacility_search_viewを検索して結果を表示
   */
  const handleSearch = async () => {
    // 空文字の項目を除外した検索条件オブジェクトを作成
    const searchConditions = {
      ...(facilityName && { facilityName }),
      ...(prefecture && { prefecture }),
      ...(address && { address }),
    };

    console.log('🔍 検索条件:', searchConditions);

    try {
      // Supabaseクエリを構築
      let query = supabase.from('facility_search_view').select('*');

      // 検索条件を動的に追加（空の条件は含めない）
      if (facilityName) {
        query = query.ilike('facility_name', `%${facilityName}%`);
      }
      if (prefecture) {
        query = query.eq('prefecture', prefecture);
      }
      if (address) {
        query = query.ilike('address', `%${address}%`);
      }

      // 検索実行
      const { data, error } = await query;

      if (error) {
        console.error('検索エラー:', error);
        setSearchResults([]);
        return;
      }

      // 検索結果を型に合わせて変換
      const results: SearchResult[] = (data || []).map((item: any) => ({
        facility_type: item.facility_type as 'hospital' | 'clinic',
        facility_name: item.facility_name || '',
        address: item.address || '',
        prefecture: item.prefecture || '',
        gov_id: item.gov_id || '',
      }));

      // 検索結果をセット
      setSearchResults(results);
    } catch (error) {
      console.error('検索処理エラー:', error);
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          {/* タイトル部分に背景色を付ける */}
          <div className="bg-gray-50 rounded-lg px-6 py-8 mb-6">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              まつなび
            </h1>
            <p className="text-sm text-gray-600 leading-loose max-w-2xl mx-auto">
              まつなびは、政府公開データと利用者の投稿をもとに、
              <br />
              病院・診療所の情報や待ち時間の傾向を静かに確認できるサービスです。
              <br />
              口コミやランキングに依存せず、参考情報としてご利用ください。
            </p>
          </div>
          <h2 className="text-3xl font-semibold text-gray-700">
            病院検索
          </h2>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedFacility ? (
          <>
            {/* 検索条件 */}
            <div className="mb-8">
              <SearchSidebar
                searchType={searchType}
                setSearchType={setSearchType}
                prefecture={prefecture}
                setPrefecture={setPrefecture}
                city={city}
                setCity={setCity}
                department={department}
                setDepartment={setDepartment}
                facilityName={facilityName}
                setFacilityName={setFacilityName}
                address={address}
                setAddress={setAddress}
                dayOfWeek={dayOfWeek}
                setDayOfWeek={setDayOfWeek}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                onSearch={handleSearch}
              />
            </div>

            {/* 注意書き */}
            <div className="mb-4 text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                ※ 本サービスは医療行為・診断・治療を行うものではありません。<br />
                受診の判断については、必ず医師や医療機関にご相談ください。
              </p>
            </div>

            {/* 検索結果 */}
            <SearchResults 
              results={searchResults} 
              onFacilityClick={setSelectedFacility}
            />
          </>
        ) : (
          /* 施設詳細表示 */
          <FacilityDetail 
            facility={selectedFacility}
            onClose={() => setSelectedFacility(null)}
          />
        )}
      </div>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                トップページ
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/about"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                サービスについて
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/how-to-use"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                使い方
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/faq"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                よくある質問
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/terms"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                利用規約
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/privacy"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                プライバシーポリシー
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================
// 2. 検索サイドバー
// ============================================

interface SearchSidebarProps {
  searchType: 'hospital' | 'clinic' | 'both';
  setSearchType: (type: 'hospital' | 'clinic' | 'both') => void;
  prefecture: string;
  setPrefecture: (pref: string) => void;
  city: string;
  setCity: (city: string) => void;
  department: string;
  setDepartment: (dept: string) => void;
  facilityName: string;        // 病院・診療所名
  setFacilityName: (name: string) => void;
  address: string;            // 住所
  setAddress: (addr: string) => void;
  dayOfWeek: string;
  setDayOfWeek: (day: string) => void;
  timeRange: { start: string; end: string };
  setTimeRange: (range: { start: string; end: string }) => void;
  onSearch: () => void;       // 検索ボタンクリック時のコールバック
}

const SearchSidebar: React.FC<SearchSidebarProps> = ({
  searchType,
  setSearchType,
  prefecture,
  setPrefecture,
  city,
  setCity,
  department,
  setDepartment,
  facilityName,
  setFacilityName,
  address,
  setAddress,
  dayOfWeek,
  setDayOfWeek,
  timeRange,
  setTimeRange,
  onSearch,
}) => {
  /**
   * 条件をリセットする処理
   * すべての検索条件を空文字に戻す
   */
  const handleReset = () => {
    setSearchType('both');
    setPrefecture('');
    setCity('');
    setDepartment('');
    setFacilityName('');
    setAddress('');
    setDayOfWeek('');
    setTimeRange({ start: '', end: '' });
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-12 space-y-8">
      <h2 className="text-3xl font-semibold text-gray-900">検索条件</h2>

      {/* 施設タイプ */}
      <div>
        <label className="block text-xl font-medium text-gray-700 mb-4">
          施設タイプ
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              value="both"
              checked={searchType === 'both'}
              onChange={() => setSearchType('both')}
              className="mr-3 w-5 h-5"
            />
            <span className="text-lg text-gray-700">すべて</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="hospital"
              checked={searchType === 'hospital'}
              onChange={() => setSearchType('hospital')}
              className="mr-3 w-5 h-5"
            />
            <span className="text-lg text-gray-700">病院</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="clinic"
              checked={searchType === 'clinic'}
              onChange={() => setSearchType('clinic')}
              className="mr-3 w-5 h-5"
            />
            <span className="text-lg text-gray-700">診療所</span>
          </label>
        </div>
      </div>

      {/* 都道府県 */}
      <div>
        <label className="block text-xl font-medium text-gray-700 mb-4">
          都道府県
        </label>
        <select
          value={prefecture}
          onChange={(e) => setPrefecture(e.target.value)}
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">すべて</option>
          <option value="01">北海道</option>
          <option value="02">青森県</option>
          <option value="13">東京都</option>
          {/* ... 他の都道府県 */}
        </select>
      </div>

      {/* 市区町村 */}
      <div>
        <label className="block text-xl font-medium text-gray-700 mb-4">
          市区町村
        </label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={!prefecture}
        >
          <option value="">すべて</option>
          {/* 都道府県に応じて動的に生成 */}
        </select>
      </div>

      {/* 診療科 */}
      <div>
        <label className="block text-xl font-medium text-gray-700 mb-4">
          診療科
        </label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">すべて</option>
          <option value="01001">内科</option>
          <option value="01002">外科</option>
          <option value="01003">小児科</option>
          <option value="01004">産婦人科</option>
          {/* ... 他の診療科 */}
        </select>
      </div>

      {/* 病院・診療所名 */}
      <div>
        <label className="block text-xl font-medium text-gray-700 mb-4">
          病院・診療所名
        </label>
        <input
          type="text"
          value={facilityName}
          onChange={(e) => setFacilityName(e.target.value)}
          placeholder="例: 総合病院"
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 住所 */}
      <div>
        <label className="block text-xl font-medium text-gray-700 mb-4">
          住所
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="例: 札幌市中央区"
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 診療時間 */}
      <div>
        <label className="block text-xl font-medium text-gray-700 mb-4">
          診療可能日
        </label>
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
          className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">すべて</option>
          <option value="monday">月曜日</option>
          <option value="tuesday">火曜日</option>
          <option value="wednesday">水曜日</option>
          <option value="thursday">木曜日</option>
          <option value="friday">金曜日</option>
          <option value="saturday">土曜日</option>
          <option value="sunday">日曜日</option>
          <option value="holiday">祝日</option>
        </select>
      </div>

      {/* 時間帯 */}
      {dayOfWeek && (
        <div>
          <label className="block text-xl font-medium text-gray-700 mb-4">
            時間帯
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="time"
              value={timeRange.start}
              onChange={(e) => setTimeRange({ ...timeRange, start: e.target.value })}
              className="px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="開始"
            />
            <input
              type="time"
              value={timeRange.end}
              onChange={(e) => setTimeRange({ ...timeRange, end: e.target.value })}
              className="px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="終了"
            />
          </div>
        </div>
      )}

      {/* 検索ボタン */}
      <button
        onClick={onSearch}
        className="w-full bg-blue-600 text-white py-4 px-6 text-xl rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        検索
      </button>

      {/* 条件リセット */}
      <button
        onClick={handleReset}
        className="w-full text-gray-600 py-4 px-6 text-xl rounded-md hover:bg-gray-50 focus:outline-none transition-colors"
      >
        条件をリセット
      </button>
    </div>
  );
};

// ============================================
// 3. 検索結果一覧
// ============================================

interface SearchResultsProps {
  results: SearchResult[];
  onFacilityClick: (facility: SearchResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onFacilityClick }) => {
  return (
    <div className="space-y-4">
      {/* 結果ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{results.length}件</span> 見つかりました
        </p>
      </div>

      {/* 検索結果一覧 */}
      {results.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">検索結果がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onFacilityClick(result)}
            >
              <div className="mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  result.facility_type === 'hospital' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {result.facility_type === 'hospital' ? '病院' : '診療所'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {result.facility_name}
              </h3>
              <p className="text-sm text-gray-600">
                {result.address}
              </p>
              {result.prefecture && (
                <p className="text-xs text-gray-500 mt-1">
                  {getPrefectureName(result.prefecture)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// 4. 施設詳細表示
// ============================================

interface FacilityDetailProps {
  facility: SearchResult;
  onClose: () => void;
}

// 登録データの型定義
interface FormResponseData {
  id: string;
  facility_name: string;
  department: string | null;
  reception_time: string | null;
  treatment_start_time: string | null;
  accounting_end_time: string | null;
  has_reservation: string | null;
  reservation_time: string | null;
  other: string | null;
  created_at: string;
}

// 平均待ち時間の型定義
interface AverageWaitTime {
  avg_wait_minutes: number;
  sample_count: number;
}

// 時間帯別待ち時間の型定義
interface HourlyWaitTime {
  hour: number;
  avg_wait_minutes: number;
  sample_count: number;
}

const FacilityDetail: React.FC<FacilityDetailProps> = ({ facility, onClose }) => {
  const detailRef = useRef<HTMLDivElement>(null);
  
  // フォーム入力のstate
  const [department, setDepartment] = useState<string>('');
  const [receptionTime, setReceptionTime] = useState<string>('');
  const [treatmentStartTime, setTreatmentStartTime] = useState<string>('');
  const [accountingEndTime, setAccountingEndTime] = useState<string>('');
  const [hasReservation, setHasReservation] = useState<string>('');
  const [reservationTime, setReservationTime] = useState<string>('');
  const [other, setOther] = useState<string>('');

  // 平均待ち時間のstate
  const [averageWaitTime, setAverageWaitTime] = useState<AverageWaitTime | null>(null);
  const [isLoadingWaitTime, setIsLoadingWaitTime] = useState<boolean>(false);
  
  // 時間帯別待ち時間のstate（ヒートマップ用）
  const [hourlyWaitTimes, setHourlyWaitTimes] = useState<HourlyWaitTime[]>([]);
  const [isLoadingHourly, setIsLoadingHourly] = useState<boolean>(false);

  // 送信中の状態管理
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // 登録成功メッセージ表示用のstate
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  
  // 登録データ一覧のstate
  const [registeredData, setRegisteredData] = useState<FormResponseData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // 施設が選択されたら詳細エリアまで自動スクロール
  useEffect(() => {
    if (detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [facility]);

  // 施設が選択されたら、その施設の登録データを取得
  useEffect(() => {
    loadRegisteredData();
    loadWaitTimeData();
  }, [facility]);

  /**
   * 登録データを取得
   */
  const loadRegisteredData = async () => {
    if (!facility.gov_id) return;
    
    setIsLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('form_response')
        .select('*')
        .eq('gov_id', facility.gov_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ データ取得エラー:', error);
      } else {
        setRegisteredData(data || []);
      }
    } catch (error) {
      console.error('❌ 予期しないエラー:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  /**
   * 待ち時間データを取得（平均待ち時間 + 時間帯別データ）
   */
  const loadWaitTimeData = async () => {
    if (!facility.gov_id) return;

    setIsLoadingWaitTime(true);
    setIsLoadingHourly(true);

    try {
      // 1. 平均待ち時間を取得
      const { data: avgData, error: avgError } = await supabase
        .from('wait_time_public_avg_view')
        .select('*')
        .eq('facility_type', facility.facility_type)
        .eq('gov_id', facility.gov_id)
        .maybeSingle();

      if (avgError) {
        console.error('❌ 平均待ち時間取得エラー:', avgError);
      } else if (avgData) {
        setAverageWaitTime({
          avg_wait_minutes: avgData.avg_wait_minutes || 0,
          sample_count: avgData.sample_count || 0,
        });
      } else {
        setAverageWaitTime(null);
      }

      // 2. 時間帯別データを取得（8時〜19時）
      const { data: hourlyData, error: hourlyError } = await supabase
        .from('wait_time_public_hourly_avg_view')
        .select('*')
        .eq('facility_type', facility.facility_type)
        .eq('gov_id', facility.gov_id)
        .order('hour', { ascending: true });

      if (hourlyError) {
        console.error('❌ 時間帯別データ取得エラー:', hourlyError);
        // エラー時も8時〜19時を0埋めで生成
        const defaultHourlyArray: HourlyWaitTime[] = Array.from({ length: 12 }, (_, i) => ({
          hour: i + 8,
          avg_wait_minutes: 0,
          sample_count: 0,
        }));
        setHourlyWaitTimes(defaultHourlyArray);
      } else {
        // 8時〜19時のデータを配列に変換
        const dataMap = new Map<number, HourlyWaitTime>();
        (hourlyData || []).forEach((item: any) => {
          dataMap.set(item.hour, {
            hour: item.hour,
            avg_wait_minutes: item.avg_wait_minutes || 0,
            sample_count: item.sample_count || 0,
          });
        });

        // 8時〜19時の全時間帯を生成（データがない時間帯は0埋め）
        const hourlyArray: HourlyWaitTime[] = Array.from({ length: 12 }, (_, i) => {
          const hour = i + 8;
          return dataMap.get(hour) || {
            hour,
            avg_wait_minutes: 0,
            sample_count: 0,
          };
        });
        setHourlyWaitTimes(hourlyArray);
      }
    } catch (error) {
      console.error('❌ 予期しないエラー:', error);
    } finally {
      setIsLoadingWaitTime(false);
      setIsLoadingHourly(false);
    }
  };

  /**
   * 登録データを削除
   */
  const handleDelete = async (id: string) => {
    if (!confirm('この登録データを削除しますか？')) {
      return;
    }

    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('form_response')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ 削除エラー:', error);
        alert('削除に失敗しました: ' + error.message);
      } else {
        console.log('✅ 削除成功');
        alert('削除が完了しました！');
        // データを再取得
        loadRegisteredData();
      }
    } catch (error) {
      console.error('❌ 予期しないエラー:', error);
      alert('削除中にエラーが発生しました');
    } finally {
      setIsDeleting(null);
    }
  };

  /**
   * 送信ボタンをクリックしたときの処理
   * Supabaseのform_responseテーブルに登録
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      facility_name: facility.facility_name,
      department: department,
      receptionTime: receptionTime,
      treatmentStartTime: treatmentStartTime,
      accountingEndTime: accountingEndTime,
      hasReservation: hasReservation,
      reservationTime: reservationTime,
      other: other,
    };

    console.log('📝 入力内容:', formData);

    // Supabaseに登録
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('form_response')
        .insert({
          facility_type: facility.facility_type,
          gov_id: facility.gov_id || '',
          facility_name: facility.facility_name,
          department: department || null,
          reception_time: receptionTime || null,
          treatment_start_time: treatmentStartTime || null,
          accounting_end_time: accountingEndTime || null,
          has_reservation: hasReservation || null,
          reservation_time: reservationTime || null,
          other: other || null,
        })
        .select();

      if (error) {
        console.error('❌ 登録エラー:', error);
        alert('登録に失敗しました: ' + error.message);
      } else {
        console.log('✅ 登録成功:', data);
        
        // フォームをリセット
        setDepartment('');
        setReceptionTime('');
        setTreatmentStartTime('');
        setAccountingEndTime('');
        setHasReservation('');
        setReservationTime('');
        setOther('');
        
        // 登録データを再取得
        loadRegisteredData();
        
        // 成功メッセージを表示
        setShowSuccessMessage(true);
      }
    } catch (error) {
      console.error('❌ 予期しないエラー:', error);
      alert('登録中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 成功メッセージモーダル */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-12 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  登録しました
                </h3>
                <p className="text-xl text-gray-700">
                  入力ありがとうございました
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSuccessMessage(false);
                  onClose();
                }}
                className="w-full bg-blue-600 text-white py-4 px-6 text-xl rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={detailRef} className="bg-white rounded-lg shadow-md p-12">
        <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold text-gray-900">施設詳細</h2>
        <button
          onClick={onClose}
          className="text-3xl text-gray-400 hover:text-gray-600 px-4 py-2"
        >
          ✕
        </button>
      </div>

      {/* 施設情報 */}
      <div className="mb-12 space-y-4">
        <div>
          <span className="text-xl font-medium text-gray-500">病院名: </span>
          <span className="text-xl text-gray-900">{facility.facility_name}</span>
        </div>
        <div>
          <span className="text-xl font-medium text-gray-500">都道府県: </span>
          <span className="text-xl text-gray-900">
            {facility.prefecture ? getPrefectureName(facility.prefecture) : ''}
          </span>
        </div>
        <div>
          <span className="text-xl font-medium text-gray-500">住所: </span>
          <span className="text-xl text-gray-900">{facility.address}</span>
        </div>
        <div>
          <span className="text-xl font-medium text-gray-500">公開平均待ち時間: </span>
          <span className="text-xl text-gray-900">
            {isLoadingWaitTime ? (
              '読み込み中...'
            ) : averageWaitTime && averageWaitTime.sample_count > 0 ? (
              `${averageWaitTime.avg_wait_minutes}分（サンプル数: ${averageWaitTime.sample_count}件）`
            ) : (
              'データなし'
            )}
          </span>
        </div>
      </div>

      {/* 時間帯別待ち時間ヒートマップ */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">8時〜19時の待ち時間ヒートマップ</h3>
        {isLoadingHourly ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6">
            {/* 横軸ラベル（時間帯） */}
            <div className="mb-2">
              <div className="grid grid-cols-12 gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                  <div key={hour} className="text-center text-xs font-medium text-gray-600">
                    {hour}時
                  </div>
                ))}
              </div>
            </div>
            
            {/* ヒートマップ */}
            <div className="grid grid-cols-12 gap-2">
              {hourlyWaitTimes.length > 0 ? (
                hourlyWaitTimes.map((item) => {
                  // 待ち時間に応じた色を決定（0分は薄いグレー、長いほど濃い赤）
                  const getColorClass = (minutes: number, sampleCount: number) => {
                    if (sampleCount === 0) {
                      return 'bg-gray-200'; // データなし
                    }
                    if (minutes === 0) {
                      return 'bg-gray-300';
                    } else if (minutes <= 15) {
                      return 'bg-green-200';
                    } else if (minutes <= 30) {
                      return 'bg-yellow-200';
                    } else if (minutes <= 60) {
                      return 'bg-orange-200';
                    } else if (minutes <= 90) {
                      return 'bg-red-300';
                    } else if (minutes <= 120) {
                      return 'bg-red-400';
                    } else {
                      return 'bg-red-600';
                    }
                  };

                  return (
                    <div
                      key={item.hour}
                      className={`${getColorClass(item.avg_wait_minutes, item.sample_count)} rounded p-3 text-center`}
                      title={`${item.hour}時: ${item.avg_wait_minutes}分（サンプル数: ${item.sample_count}件）`}
                    >
                      <div className="text-sm font-bold text-gray-900">
                        {item.sample_count > 0 ? `${item.avg_wait_minutes}分` : '-'}
                      </div>
                      {item.sample_count > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          ({item.sample_count})
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                // データが空の場合も8時〜19時を表示
                Array.from({ length: 12 }, (_, i) => {
                  const hour = i + 8;
                  return (
                    <div
                      key={hour}
                      className="bg-gray-200 rounded p-3 text-center"
                      title={`${hour}時: データなし`}
                    >
                      <div className="text-sm font-bold text-gray-500">-</div>
                    </div>
                  );
                })
              )}
            </div>
            {/* 凡例 */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>データなし</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <span>0〜15分</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                <span>16〜30分</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-200 rounded"></div>
                <span>31〜60分</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-300 rounded"></div>
                <span>61〜90分</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded"></div>
                <span>91〜120分</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span>121分以上</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 登録データ一覧（開発者用：一般ユーザーには非表示） */}
      {/* TODO: 本番環境では削除機能を非表示にする */}
      {false && (
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">登録済みデータ（開発者用）</h3>
        {isLoadingData ? (
          <div className="text-center py-4 text-gray-500">読み込み中...</div>
        ) : registeredData.length === 0 ? (
          <div className="text-center py-4 text-gray-500">登録データがありません</div>
        ) : (
          <div className="space-y-4">
            {registeredData.map((data) => (
              <div key={data.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {data.department || '（診療科未入力）'}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {data.reception_time && (
                        <div>受付時刻: {data.reception_time}</div>
                      )}
                      {data.treatment_start_time && (
                        <div>診療開始: {data.treatment_start_time}</div>
                      )}
                      {data.accounting_end_time && (
                        <div>会計終了: {data.accounting_end_time}</div>
                      )}
                      {data.has_reservation && (
                        <div>予約: {data.has_reservation} {data.reservation_time && `(${data.reservation_time})`}</div>
                      )}
                      {data.other && (
                        <div className="mt-2 text-gray-700">{data.other}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      登録日時: {new Date(data.created_at).toLocaleString('ja-JP')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(data.id)}
                    disabled={isDeleting === data.id}
                    className={`ml-4 px-3 py-1 text-xs rounded ${
                      isDeleting === data.id
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {isDeleting === data.id ? '削除中...' : '削除'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* 入力フォーム（フォーム回答シート準拠） */}
      <div className="border-t pt-12 mt-12">
        <h3 className="text-3xl font-semibold text-gray-900 mb-8">入力フォーム</h3>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 病院名（自動補完、表示のみ） */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-4">
              病院名
            </label>
            <input
              type="text"
              value={facility.facility_name}
              disabled
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* 診療科 */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-4">
              診療科
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="例：内科"
            />
          </div>

          {/* 受付時刻 */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-4">
              受付時刻
            </label>
            <input
              type="time"
              value={receptionTime}
              onChange={(e) => setReceptionTime(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 診療開始時刻 */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-4">
              診療開始時刻
            </label>
            <input
              type="time"
              value={treatmentStartTime}
              onChange={(e) => setTreatmentStartTime(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 会計終了時刻 */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-4">
              会計終了時刻
            </label>
            <input
              type="time"
              value={accountingEndTime}
              onChange={(e) => setAccountingEndTime(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 予約あり/なし */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-4">
              予約あり/なし
            </label>
            <select
              value={hasReservation}
              onChange={(e) => setHasReservation(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">選択してください</option>
              <option value="あり">あり</option>
              <option value="なし">なし</option>
            </select>
          </div>

          {/* 予約時刻（予約ありの時のみ表示・必須） */}
          {hasReservation === 'あり' && (
            <div>
              <label className="block text-xl font-medium text-gray-700 mb-4">
                予約時刻 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* その他 */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-4">
              その他（任意）
            </label>
            <textarea
              value={other}
              onChange={(e) => setOther(e.target.value)}
              rows={6}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="その他の情報を入力してください"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? '送信中...' : '送信'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
};


export default SearchPage;

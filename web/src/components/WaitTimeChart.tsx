/**
 * まつなび - 待ち時間・予約待ち範囲グラフコンポーネント
 * 
 * 初診/再診別の待ち時間と予約待ち範囲を表示するグラフ
 * タブ切り替えで全体/初診/再診を切り替え可能
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ===================================
// 型定義
// ===================================

/**
 * 予約待ち範囲の集計結果
 */
interface ReservationWaitRange {
  range15: number;  // 15分以下
  range30: number;  // 30分以下
  range45: number;  // 45分以下
  total: number;    // 合計件数
}

/**
 * 待ち時間統計
 */
interface WaitTimeStats {
  avgWaitMinutes: number;      // 平均待ち時間
  medianWaitMinutes: number;   // 中央値待ち時間
  sampleCount: number;         // サンプル数
  reservationWaitRange: ReservationWaitRange; // 予約待ち範囲
}

/**
 * タブの種類
 */
type TabType = 'all' | 'first' | 'repeat';

interface WaitTimeChartProps {
  facilityType: 'hospital' | 'clinic';
  govId: string;
}

/**
 * 待ち時間・予約待ち範囲グラフコンポーネント
 */
const WaitTimeChart: React.FC<WaitTimeChartProps> = ({ facilityType, govId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [stats, setStats] = useState<WaitTimeStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // タブ切り替え時にデータを再取得
  useEffect(() => {
    loadStats(activeTab);
  }, [activeTab, facilityType, govId]);

  /**
   * 統計データを取得
   */
  const loadStats = async (tab: TabType) => {
    if (!govId) return;

    setIsLoading(true);
    try {
      // form_responseテーブルからデータを取得
      let query = supabase
        .from('form_response')
        .select('reception_time, treatment_start_time, reservation_time, visit_type')
        .eq('gov_id', govId)
        .not('reception_time', 'is', null)
        .not('treatment_start_time', 'is', null);

      // タブに応じてフィルタ
      if (tab === 'first') {
        query = query.eq('visit_type', 'first');
      } else if (tab === 'repeat') {
        query = query.eq('visit_type', 'repeat');
      }
      // 'all' の場合は visit_type が NULL のデータも含める（フィルタなし）

      const { data, error } = await query;

      if (error) {
        console.error('❌ データ取得エラー:', error);
        setStats(null);
        return;
      }

      if (!data || data.length === 0) {
        setStats(null);
        return;
      }

      // 待ち時間を計算
      const waitTimes: number[] = [];
      const reservationWaitTimes: number[] = [];

      data.forEach((item: any) => {
        if (!item.reception_time || !item.treatment_start_time) return;

        const reception = new Date(`2000-01-01T${item.reception_time}`);
        const treatment = new Date(`2000-01-01T${item.treatment_start_time}`);
        const waitMinutes = (treatment.getTime() - reception.getTime()) / (1000 * 60);

        if (waitMinutes >= 0 && waitMinutes <= 480) {
          waitTimes.push(waitMinutes);
        }

        // 予約待ち時間を計算（予約ありの場合）
        if (item.reservation_time && item.treatment_start_time) {
          const reservation = new Date(`2000-01-01T${item.reservation_time}`);
          const reservationWaitMinutes = (treatment.getTime() - reservation.getTime()) / (1000 * 60);
          
          if (reservationWaitMinutes >= 0 && reservationWaitMinutes <= 480) {
            reservationWaitTimes.push(reservationWaitMinutes);
          }
        }
      });

      // 統計を計算
      const avgWaitMinutes = waitTimes.length > 0
        ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
        : 0;

      const sortedWaitTimes = [...waitTimes].sort((a, b) => a - b);
      const medianWaitMinutes = sortedWaitTimes.length > 0
        ? sortedWaitTimes[Math.floor(sortedWaitTimes.length / 2)]
        : 0;

      // 予約待ち範囲を集計
      const reservationWaitRange: ReservationWaitRange = {
        range15: reservationWaitTimes.filter(t => t <= 15).length,
        range30: reservationWaitTimes.filter(t => t <= 30).length,
        range45: reservationWaitTimes.filter(t => t <= 45).length,
        total: reservationWaitTimes.length,
      };

      setStats({
        avgWaitMinutes,
        medianWaitMinutes,
        sampleCount: waitTimes.length,
        reservationWaitRange,
      });
    } catch (error) {
      console.error('❌ 予期しないエラー:', error);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* タブUI */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 text-lg font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          全体
        </button>
        <button
          onClick={() => setActiveTab('first')}
          className={`px-6 py-3 text-lg font-medium transition-colors ${
            activeTab === 'first'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          初診
        </button>
        <button
          onClick={() => setActiveTab('repeat')}
          className={`px-6 py-3 text-lg font-medium transition-colors ${
            activeTab === 'repeat'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          再診
        </button>
      </div>

      {/* グラフ表示エリア */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">読み込み中...</div>
      ) : !stats ? (
        <div className="text-center py-8 text-gray-500">
          データがありません
        </div>
      ) : (
        <div className="space-y-6">
          {/* 待ち時間統計 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">通常待ち時間</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">平均</div>
                <div className="text-2xl font-bold text-gray-900">{stats.avgWaitMinutes}分</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">中央値</div>
                <div className="text-2xl font-bold text-gray-900">{stats.medianWaitMinutes}分</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              サンプル数: {stats.sampleCount}件
              {stats.sampleCount < 10 && (
                <span className="ml-2 text-orange-600">※ 参考値（データ件数が少ないため）</span>
              )}
            </div>
          </div>

          {/* 予約待ち範囲グラフ */}
          {stats.reservationWaitRange.total > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">予約待ち範囲</h4>
              <div className="space-y-4">
                {/* 15分以内 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">15分以内</span>
                    <span className="text-sm font-bold text-gray-900">
                      {stats.reservationWaitRange.range15}件
                      {stats.reservationWaitRange.total > 0 && (
                        <span className="text-gray-500 ml-1">
                          ({Math.round((stats.reservationWaitRange.range15 / stats.reservationWaitRange.total) * 100)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-green-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{
                        width: `${stats.reservationWaitRange.total > 0 ? (stats.reservationWaitRange.range15 / stats.reservationWaitRange.total) * 100 : 0}%`,
                      }}
                    >
                      {stats.reservationWaitRange.range15 > 0 && stats.reservationWaitRange.range15}
                    </div>
                  </div>
                </div>

                {/* 30分以内 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">30分以内</span>
                    <span className="text-sm font-bold text-gray-900">
                      {stats.reservationWaitRange.range30}件
                      {stats.reservationWaitRange.total > 0 && (
                        <span className="text-gray-500 ml-1">
                          ({Math.round((stats.reservationWaitRange.range30 / stats.reservationWaitRange.total) * 100)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-yellow-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{
                        width: `${stats.reservationWaitRange.total > 0 ? (stats.reservationWaitRange.range30 / stats.reservationWaitRange.total) * 100 : 0}%`,
                      }}
                    >
                      {stats.reservationWaitRange.range30 > 0 && stats.reservationWaitRange.range30}
                    </div>
                  </div>
                </div>

                {/* 45分以内 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">45分以内</span>
                    <span className="text-sm font-bold text-gray-900">
                      {stats.reservationWaitRange.range45}件
                      {stats.reservationWaitRange.total > 0 && (
                        <span className="text-gray-500 ml-1">
                          ({Math.round((stats.reservationWaitRange.range45 / stats.reservationWaitRange.total) * 100)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-orange-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{
                        width: `${stats.reservationWaitRange.total > 0 ? (stats.reservationWaitRange.range45 / stats.reservationWaitRange.total) * 100 : 0}%`,
                      }}
                    >
                      {stats.reservationWaitRange.range45 > 0 && stats.reservationWaitRange.range45}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                合計: {stats.reservationWaitRange.total}件
                {stats.reservationWaitRange.total < 10 && (
                  <span className="ml-2 text-orange-600">※ 参考値（データ件数が少ないため）</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              予約待ちデータがありません
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WaitTimeChart;

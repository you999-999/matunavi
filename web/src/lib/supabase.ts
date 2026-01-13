/**
 * Supabase クライアント設定ファイル
 * 
 * このファイルはSupabase（バックエンドサービス）への接続設定を管理します。
 * Vite の環境変数から認証情報を読み込み、アプリケーション全体で使用する
 * Supabaseクライアントのシングルトンインスタンスを提供します。
 * 
 * 【Supabase とは】
 * - PostgreSQL ベースのBaaS（Backend as a Service）
 * - 認証、データベース、ストレージ、リアルタイム機能を提供
 * - まつなびでは主にデータベース機能を使用
 * 
 * 【環境変数の設定】
 * プロジェクトルートに .env.local ファイルを作成し、以下を設定:
 * 
 * VITE_SUPABASE_URL=https://your-project.supabase.co
 * VITE_SUPABASE_ANON_KEY=your-anon-key
 * 
 * ⚠️ 本番環境では Vercel の環境変数設定に登録すること
 * 
 * 【使用しているテーブル】
 * - facility_search_view: 病院・診療所の検索用ビュー
 * - form_response: 待ち時間の投稿データ
 * - wait_time_public_avg_view: 平均待ち時間の公開ビュー
 * - wait_time_public_hourly_avg_view: 時間帯別待ち時間の公開ビュー
 * 
 * 【セキュリティ】
 * - ANON_KEY は公開しても安全（クライアント用）
 * - Row Level Security (RLS) でデータアクセスを制御
 * - SERVICE_ROLE_KEY は絶対にクライアントに公開しない
 */

import { createClient } from '@supabase/supabase-js';

// ===================================
// 環境変数から Supabase の設定を取得
// ===================================

// Supabase プロジェクトのURL
// 例: https://xxxxx.supabase.co
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Supabase の匿名キー（公開可能なクライアント用キー）
// RLSポリシーで適切にアクセス制御されている前提
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ===================================
// 環境変数の存在チェック
// ===================================

// 環境変数が未設定の場合はアプリケーション起動時にエラーを投げる
// これにより、設定ミスを早期に検出できる
if (!supabaseUrl) {
  throw new Error('環境変数 VITE_SUPABASE_URL が設定されていません。.env.local ファイルを確認してください。');
}

if (!supabaseAnonKey) {
  throw new Error('環境変数 VITE_SUPABASE_ANON_KEY が設定されていません。.env.local ファイルを確認してください。');
}

// ===================================
// Supabase クライアントの作成
// ===================================

/**
 * Supabase クライアントインスタンス
 * 
 * アプリケーション全体で共有するシングルトンインスタンス。
 * データベースクエリ、認証、ストレージなどの操作に使用。
 * 
 * 【使用例】
 * ```typescript
 * import { supabase } from './lib/supabase';
 * 
 * // データ取得
 * const { data, error } = await supabase
 *   .from('facility_search_view')
 *   .select('*')
 *   .eq('prefecture', '01');
 * 
 * // データ挿入
 * const { error } = await supabase
 *   .from('form_response')
 *   .insert({ facility_name: '〇〇病院', ... });
 * ```
 * 
 * @constant {SupabaseClient} supabase - Supabaseクライアントインスタンス
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

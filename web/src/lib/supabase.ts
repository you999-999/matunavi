/**
 * Supabase クライアント設定
 * Vite の環境変数を使用して Supabase クライアントを作成
 */

import { createClient } from '@supabase/supabase-js';

// 環境変数から Supabase の設定を取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数が設定されていない場合のエラーチェック
if (!supabaseUrl) {
  throw new Error('Missing env.VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.VITE_SUPABASE_ANON_KEY');
}

// Supabase クライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Google AdSense の型定義
 * 自動広告用の型定義ファイル
 */

interface Window {
  adsbygoogle?: Array<Record<string, unknown>>;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export {};

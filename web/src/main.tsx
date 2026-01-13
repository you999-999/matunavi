/**
 * まつなび - アプリケーションのエントリーポイント
 * 
 * このファイルはReactアプリケーションの起動処理を担当します。
 * HTML内の #root 要素にReactコンポーネントツリーをマウントします。
 * 
 * 【処理フロー】
 * 1. DOMから #root 要素を取得
 * 2. createRoot でReactルートを作成
 * 3. StrictMode でラップしてApp コンポーネントをレンダリング
 * 
 * 【StrictMode について】
 * - 開発時のみ有効（本番環境では影響なし）
 * - 潜在的な問題を検出（非推奨APIの使用、副作用の問題など）
 * - コンポーネントを2回レンダリングして副作用をチェック
 * 
 * 【注意事項】
 * - index.html に <div id="root"></div> が必要
 * - CSSは index.css でグローバルスタイルを定義
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// グローバルスタイル（Tailwind CSS、リセットCSS等）
import './index.css'

// ルートコンポーネント（ルーティング設定を含む）
import App from './App.tsx'

// DOM要素 #root を取得し、Reactアプリケーションをマウント
// ! は TypeScript の non-null assertion operator（要素が必ず存在することを保証）
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/**
 * まつなび - メインアプリケーションコンポーネント
 * 
 * このファイルはアプリケーション全体のルーティング設定を管理します。
 * React Router を使用して、各URLパスに対応するコンポーネントを定義しています。
 * 
 * 【ルート構成】
 * / → トップページ（サービス紹介）
 * /search → 病院・診療所検索ページ
 * /about → サービス説明ページ
 * /how-to-use → 使い方ガイド
 * /faq → よくある質問
 * /terms → 利用規約
 * /privacy → プライバシーポリシー
 * 
 * 【変更履歴】
 * - 2024年: 初期実装
 * - 2026年: PWA対応、AdSense統合
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ===================================
// コンポーネントのインポート
// ===================================

// メイン機能：病院・診療所検索画面
import SearchUIExample from "./components/search-ui-example";

// 静的ページ群
import Home from "./pages/Home";              // トップページ
import About from "./pages/About";            // サービス説明
import HowToUse from "./pages/HowToUse";      // 使い方ガイド
import FAQ from "./pages/FAQ";                // よくある質問
import Terms from "./pages/Terms";            // 利用規約
import PrivacyPolicy from "./pages/PrivacyPolicy";  // プライバシーポリシー

/**
 * App コンポーネント
 * 
 * アプリケーション全体のルーティングを管理するルートコンポーネント。
 * BrowserRouter を使用してHTML5 History APIベースのルーティングを実現。
 * 
 * @returns {JSX.Element} ルーティング設定を含むアプリケーション全体
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* トップページ - サービスの概要と導線 */}
        <Route path="/" element={<Home />} />
        
        {/* 検索ページ - メイン機能（病院・診療所検索、待ち時間表示・投稿） */}
        <Route path="/search" element={<SearchUIExample />} />
        
        {/* サービス説明ページ - まつなびの詳細説明、情報提供方針 */}
        <Route path="/about" element={<About />} />
        
        {/* 使い方ガイド - 検索方法、待ち時間情報の見方 */}
        <Route path="/how-to-use" element={<HowToUse />} />
        
        {/* よくある質問 - ユーザーからの質問と回答 */}
        <Route path="/faq" element={<FAQ />} />
        
        {/* 利用規約 - サービス利用の条件、免責事項 */}
        <Route path="/terms" element={<Terms />} />
        
        {/* プライバシーポリシー - 個人情報の取り扱い、Cookie使用について */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


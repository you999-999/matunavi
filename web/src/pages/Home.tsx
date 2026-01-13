/**
 * まつなび - トップページコンポーネント
 * 
 * このファイルはアプリケーションのランディングページを構成します。
 * サービスの概要説明、主要機能の紹介、検索ページへの導線を提供します。
 * 
 * 【主要セクション】
 * 1. ヘッダー - サービス名とキャッチコピー
 * 2. 注意書き - 医療行為ではない旨の明示
 * 3. サービス紹介 - まつなびの目的と特徴
 * 4. 主な機能 - 提供する機能の説明
 * 5. CTA（Call To Action） - 検索ページへの誘導
 * 6. フッターリンク - 各種規約・説明ページへのリンク
 * 7. フッター - 著作権表示
 * 
 * 【デザイン方針】
 * - シンプルで読みやすい医療系サービスらしいデザイン
 * - 過度な装飾を避け、信頼感を重視
 * - AdSense審査を意識した落ち着いたUI
 * - レスポンシブデザイン（スマホ・タブレット対応）
 * 
 * 【重要な注意事項】
 * - 医療行為ではないことを明確に表示
 * - 待ち時間はリアルタイム情報ではないことを強調
 * - 受診判断は医師に相談するよう案内
 * 
 * @module Home
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Home コンポーネント
 * 
 * まつなびのトップページ。サービス紹介と検索ページへの導線を提供。
 * 
 * @returns {JSX.Element} トップページのJSX
 */
const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===================================
          ヘッダーセクション
          サービス名、ロゴ、キャッチコピーを表示
          =================================== */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          {/* タイトルエリア - 薄い背景色で視認性向上 */}
          <div className="bg-gray-50 rounded-lg px-6 py-8 mb-6">
            {/* サービス名とキャラクター画像 */}
            <div className="flex items-baseline justify-center gap-2 mb-4">
              {/* サービス名「まつなび」 */}
              <h1 className="text-6xl font-bold text-gray-900">
                まつなび
              </h1>
              
              {/* キャラクター「まつねこ」の画像
                  PNG透過画像をタイトル横に配置
                  transform でタイトルのベースラインに合わせて微調整 */}
              <img 
                src="/images/matuneko.png" 
                alt="まつねこ" 
                className="h-16 w-auto object-contain"
                style={{ 
                  backgroundColor: 'transparent',  // 透過背景を維持
                  display: 'block',
                  transform: 'translate(-2px, calc(0.2em + 7px))'  // 位置の微調整
                }}
              />
            </div>
            
            {/* サービスのキャッチコピー - 3行構成 */}
            <p className="text-sm text-gray-600 leading-loose max-w-2xl mx-auto">
              まつなびは、政府公開データと利用者の投稿をもとに、
              <br />
              病院・診療所の情報や待ち時間の傾向を静かに確認できるサービスです。
              <br />
              口コミやランキングに依存せず、参考情報としてご利用ください。
            </p>
          </div>
        </div>
      </header>

      {/* ===================================
          メインコンテンツエリア
          サービス説明、機能紹介、導線ボタン
          =================================== */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          {/* ===================================
              重要な注意書き（免責事項）
              医療行為ではないことを明確に表示
              AdSense審査対策として必須
              =================================== */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
            <div className="flex">
              {/* 警告アイコン（SVG） */}
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* 注意書きのテキスト */}
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  重要なご注意
                </h3>
                <p className="text-base text-yellow-700 leading-relaxed">
                  {/* 医療行為ではないことを明示 */}
                  本サービスは医療行為、診断、治療を行うものではありません。
                  <br />
                  {/* 専門家への相談を促す */}
                  実際の診断・治療・受診の判断については、必ず医師や医療機関等の専門家にご相談ください。
                  <br />
                  {/* 待ち時間情報の性質を説明 */}
                  待ち時間情報は目安・傾向であり、リアルタイム情報ではありません。参考情報としてご利用ください。
                </p>
              </div>
            </div>
          </div>

          {/* ===================================
              サービス紹介セクション
              まつなびの目的とデータソースを説明
              =================================== */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              まつなびについて
            </h2>
            <div className="space-y-6">
              {/* データソースの説明 - 政府公開データと利用者投稿 */}
              <p className="text-base text-gray-700 leading-relaxed">
                まつなびは、厚生労働省が公開する医療機関の情報を基に、病院や診療所を検索できるサービスです。
                政府公開データと利用者の投稿をもとに、医療機関の基本情報や待ち時間の傾向を確認できます。
              </p>
              
              {/* 免責事項の再確認 - 重要なので繰り返し記載 */}
              <p className="text-base text-gray-700 leading-relaxed">
                本サービスは、医療機関の情報を提供することを目的としており、医療行為や診断、治療を行うものではありません。
                掲載されている情報は参考情報であり、実際の受診の判断については、必ず医師や医療機関にご相談ください。
              </p>
            </div>
          </section>

          {/* 区切り線 */}
          <hr className="my-8 border-gray-300" />

          {/* ===================================
              主な機能セクション
              提供する3つの主要機能を説明
              =================================== */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              主な機能
            </h2>
            
            {/* 機能リスト - チェックアイコン付き */}
            <ul className="space-y-4">
              {/* 機能1: 医療機関の検索 */}
              <li className="flex items-start">
                {/* チェックマークアイコン（SVG） */}
                <svg className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    医療機関の検索
                  </h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    都道府県、市区町村、診療科、施設名などから医療機関を検索できます。
                  </p>
                </div>
              </li>
              
              {/* 機能2: 待ち時間の傾向確認 */}
              <li className="flex items-start">
                {/* チェックマークアイコン（SVG） */}
                <svg className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    待ち時間の傾向確認
                  </h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    利用者の投稿をもとに、待ち時間の傾向を確認できます。リアルタイム情報ではなく、過去の傾向を参考にしてください。
                  </p>
                </div>
              </li>
              
              {/* 機能3: 診療時間の確認 */}
              <li className="flex items-start">
                {/* チェックマークアイコン（SVG） */}
                <svg className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    診療時間の確認
                  </h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    各医療機関の診療時間や診療日を確認できます。
                  </p>
                </div>
              </li>
            </ul>
          </section>

          {/* 区切り線 */}
          <hr className="my-8 border-gray-300" />

          {/* ===================================
              CTA（Call To Action）セクション
              検索ページへの主要導線
              =================================== */}
          <div className="text-center">
            {/* メインCTAボタン - 検索ページへ遷移 */}
            <Link
              to="/search"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors mb-6"
            >
              病院・診療所を検索する
            </Link>
            
            {/* 補足説明テキスト */}
            <p className="text-sm text-gray-600">
              検索ページでは、都道府県、市区町村、診療科などから医療機関を検索できます
            </p>
          </div>

          {/* 区切り線 */}
          <hr className="my-8 border-gray-300" />

          {/* ===================================
              フッターナビゲーションリンク
              各種規約・説明ページへのリンク集
              =================================== */}
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              {/* サービス説明ページへのリンク */}
              <Link
                to="/about"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                サービスについて
              </Link>
              <span className="text-gray-400">|</span>
              
              {/* 使い方ガイドへのリンク */}
              <Link
                to="/how-to-use"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                使い方
              </Link>
              <span className="text-gray-400">|</span>
              
              {/* FAQページへのリンク */}
              <Link
                to="/faq"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                よくある質問
              </Link>
              <span className="text-gray-400">|</span>
              
              {/* 利用規約ページへのリンク */}
              <Link
                to="/terms"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                利用規約
              </Link>
              <span className="text-gray-400">|</span>
              
              {/* プライバシーポリシーページへのリンク */}
              <Link
                to="/privacy"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                プライバシーポリシー
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ===================================
          フッター
          著作権表示と免責事項
          =================================== */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* 免責事項（簡易版） */}
            <div className="text-xs text-gray-500 text-center md:text-left">
              本サービスは医療行為、診断、治療を行うものではありません。
            </div>
            
            {/* 著作権表示 */}
            <div className="text-sm text-gray-600 font-medium">
              ©2026 まつなび
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

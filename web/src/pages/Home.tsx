/**
 * トップページ
 * まつなびのサービス紹介と検索ページへの導線
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="bg-gray-50 rounded-lg px-6 py-8 mb-6">
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <h1 className="text-6xl font-bold text-gray-900">
                まつなび
              </h1>
              <img 
                src="/images/matuneko.png" 
                alt="まつねこ" 
                className="h-16 w-auto object-contain"
                style={{ 
                  backgroundColor: 'transparent',
                  display: 'block',
                  transform: 'translate(-2px, calc(0.2em + 7px))'
                }}
              />
            </div>
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

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          {/* 重要な注意書き */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  重要なご注意
                </h3>
                <p className="text-base text-yellow-700 leading-relaxed">
                  本サービスは医療行為、診断、治療を行うものではありません。
                  <br />
                  実際の診断・治療・受診の判断については、必ず医師や医療機関等の専門家にご相談ください。
                  <br />
                  待ち時間情報は目安・傾向であり、リアルタイム情報ではありません。参考情報としてご利用ください。
                </p>
              </div>
            </div>
          </div>

          {/* サービス紹介 */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              まつなびについて
            </h2>
            <div className="space-y-6">
              <p className="text-base text-gray-700 leading-relaxed">
                まつなびは、厚生労働省が公開する医療機関の情報を基に、病院や診療所を検索できるサービスです。
                政府公開データと利用者の投稿をもとに、医療機関の基本情報や待ち時間の傾向を確認できます。
              </p>
              <p className="text-base text-gray-700 leading-relaxed">
                本サービスは、医療機関の情報を提供することを目的としており、医療行為や診断、治療を行うものではありません。
                掲載されている情報は参考情報であり、実際の受診の判断については、必ず医師や医療機関にご相談ください。
              </p>
            </div>
          </section>

          <hr className="my-8 border-gray-300" />

          {/* 主な機能 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              主な機能
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start">
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
              <li className="flex items-start">
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
              <li className="flex items-start">
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

          <hr className="my-8 border-gray-300" />

          {/* 検索ページへの導線 */}
          <div className="text-center">
            <Link
              to="/search"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors mb-6"
            >
              病院・診療所を検索する
            </Link>
            <p className="text-sm text-gray-600">
              検索ページでは、都道府県、市区町村、診療科などから医療機関を検索できます
            </p>
          </div>

          <hr className="my-8 border-gray-300" />

          {/* その他のリンク */}
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/about"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                サービスについて
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                to="/how-to-use"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                使い方
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                to="/faq"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                よくある質問
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                to="/terms"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                利用規約
              </Link>
              <span className="text-gray-400">|</span>
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

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-500 text-center md:text-left">
              本サービスは医療行為、診断、治療を行うものではありません。
            </div>
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

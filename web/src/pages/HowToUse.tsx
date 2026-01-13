/**
 * まつなび - 使い方ガイドページ（HowToUse）
 * 
 * このファイルは、まつなびの検索機能の使い方を説明する静的ページです。
 * 
 * 【目的】
 * - 検索機能の基本的な使い方を説明
 * - 検索条件の種類と指定方法を案内
 * - 待ち時間情報の見方と注意点を説明
 * - 検索のコツを提供
 * 
 * 【主要セクション】
 * 1. 免責事項の注意書き
 * 2. 基本的な使い方（4ステップ）
 *    - 検索条件を指定する
 *    - 検索を実行する
 *    - 検索結果を確認する
 *    - 詳細情報を確認する
 * 3. 待ち時間情報の見方（重要）
 * 4. 検索のコツ
 *    - 都道府県から検索
 *    - 診療科から検索
 *    - 施設名から検索
 * 5. 注意事項
 * 6. フッターナビゲーション
 * 
 * 【検索可能な条件】
 * - 施設種別（病院・診療所・すべて）
 * - 都道府県
 * - 市区町村
 * - 診療科
 * - 施設名（部分一致）
 * - 住所
 * - 診療日（曜日）
 * - 診療時間帯
 * 
 * 【デザインパターン】
 * - 番号付きステップガイド
 * - border-l-4 で各ステップを強調
 * - 重要な注意事項は青色背景で強調
 * - 箇条書きリストで情報を整理
 * 
 * 【ユーザビリティ】
 * - 初めてのユーザーでも理解しやすい段階的な説明
 * - 検索条件の組み合わせ方を具体的に提示
 * - よくある検索パターンをコツとして紹介
 * 
 * @module HowToUse
 */

import React from 'react';
import { Link } from 'react-router-dom';

const HowToUse: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          使い方
        </h1>

        <div className="prose prose-lg max-w-none">
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
                  待ち時間情報は目安・傾向であり、リアルタイム情報ではありません。
                </p>
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              基本的な使い方
            </h2>
            <p className="text-base text-gray-700 mb-6 leading-relaxed">
              まつなびでは、以下の方法で医療機関を検索できます。
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  1. 検索条件を指定する
                </h3>
                <p className="text-base text-gray-700 mb-2 leading-relaxed">
                  検索ページでは、以下の条件から医療機関を検索できます。
                </p>
                <ul className="list-disc list-inside text-base text-gray-700 space-y-1 ml-4">
                  <li>施設種別（病院・診療所・すべて）</li>
                  <li>都道府県</li>
                  <li>市区町村</li>
                  <li>診療科</li>
                  <li>施設名</li>
                  <li>住所</li>
                  <li>診療日（曜日）</li>
                  <li>診療時間帯</li>
                </ul>
                <p className="text-base text-gray-700 mt-2 leading-relaxed">
                  すべての条件を指定する必要はありません。必要な条件だけを指定して検索できます。
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  2. 検索を実行する
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  「検索」ボタンをクリックすると、指定した条件に一致する医療機関の一覧が表示されます。
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  3. 検索結果を確認する
                </h3>
                <p className="text-base text-gray-700 mb-2 leading-relaxed">
                  検索結果には、以下の情報が表示されます。
                </p>
                <ul className="list-disc list-inside text-base text-gray-700 space-y-1 ml-4">
                  <li>医療機関名</li>
                  <li>住所</li>
                  <li>施設種別（病院・診療所）</li>
                  <li>診療科</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  4. 詳細情報を確認する
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  検索結果から医療機関を選択すると、詳細情報を確認できます。
                  詳細情報には、診療時間や待ち時間の傾向などが表示されます。
                </p>
              </div>
            </div>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              待ち時間情報の見方
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <p className="text-base text-blue-800 leading-relaxed font-semibold mb-2">
                待ち時間情報は目安・傾向であり、リアルタイム情報ではありません。
              </p>
            </div>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              本サービスでは、利用者の投稿をもとに、待ち時間の傾向を表示しています。
            </p>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 ml-4">
              <li>表示されている待ち時間は、過去の投稿をもとにした傾向です</li>
              <li>実際の待ち時間は、曜日、時間帯、混雑状況などにより大きく異なります</li>
              <li>リアルタイムの待ち時間ではありません</li>
              <li>参考情報としてご利用ください</li>
            </ul>
            <p className="text-base text-gray-700 mt-4 leading-relaxed">
              待ち時間情報は、あくまで参考情報としてご利用ください。
              実際の受診の判断については、必ず医師や医療機関にご相談ください。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              検索のコツ
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  都道府県から検索する
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  都道府県を指定すると、その都道府県内の医療機関を検索できます。
                  さらに市区町村を指定すると、より絞り込んだ検索ができます。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  診療科から検索する
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  診療科を指定すると、その診療科がある医療機関を検索できます。
                  複数の診療科を指定することはできませんが、施設名や住所と組み合わせて検索できます。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  施設名から検索する
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  施設名の一部を入力すると、その文字列を含む医療機関を検索できます。
                  完全一致ではなく、部分一致で検索されます。
                </p>
              </div>
            </div>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              注意事項
            </h2>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 ml-4">
              <li>本サービスは医療行為、診断、治療を行うものではありません</li>
              <li>実際の診断・治療・受診の判断については、必ず医師や医療機関等の専門家にご相談ください</li>
              <li>待ち時間情報は目安・傾向であり、リアルタイム情報ではありません</li>
              <li>掲載されている情報は参考情報であり、実際の内容と異なる場合があります</li>
              <li>最新の情報については、各医療機関に直接お問い合わせください</li>
            </ul>
          </section>

          <hr className="my-8 border-gray-300" />

          <div className="text-center mt-12">
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                トップページ
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                to="/search"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                病院検索
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                to="/about"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                サービスについて
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                to="/faq"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                よくある質問
              </Link>
            </div>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              まつなびTOP画面に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;

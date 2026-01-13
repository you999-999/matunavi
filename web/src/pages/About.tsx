/**
 * まつなび - サービス説明ページ（About）
 * 
 * このファイルは、まつなびのサービス内容と目的を詳しく説明する静的ページです。
 * 
 * 【目的】
 * - サービスの概要説明
 * - データソース（政府公開データ）の明示
 * - 提供情報の種類と制約の説明
 * - 医療行為ではないことの明確化
 * - 待ち時間情報の性質（リアルタイムではない）の説明
 * 
 * 【主要セクション】
 * 1. 免責事項の注意書き
 * 2. まつなびとは
 * 3. サービスの目的
 * 4. 提供する情報について
 * 5. 待ち時間情報について（重要）
 * 6. 情報の正確性について
 * 7. 医療行為について（免責）
 * 8. フッターナビゲーション
 * 
 * 【デザインパターン】
 * - 単一カラムレイアウト（最大幅4xl）
 * - セクションごとに <hr> で区切り
 * - 注意書きは黄色背景で強調
 * - 待ち時間の注意は青色背景で強調
 * 
 * 【AdSense審査対策】
 * - 医療行為ではないことを繰り返し明示
 * - 情報の性質と制約を丁寧に説明
 * - 専門家への相談を促す文言を複数配置
 * 
 * @module About
 */

import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          サービスについて
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
                </p>
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              まつなびとは
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              まつなびは、厚生労働省が公開する医療機関の情報を基に、病院や診療所を検索できるサービスです。
              政府公開データと利用者の投稿をもとに、医療機関の基本情報や待ち時間の傾向を確認できます。
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              本サービスは、医療機関の情報を提供することを目的としており、医療行為や診断、治療を行うものではありません。
              掲載されている情報は参考情報であり、実際の受診の判断については、必ず医師や医療機関にご相談ください。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              サービスの目的
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              まつなびは、以下の目的で運営されています。
            </p>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 ml-4">
              <li>医療機関の基本情報を分かりやすく提供する</li>
              <li>待ち時間の傾向を参考情報として提供する</li>
              <li>医療機関選びの参考となる情報を提供する</li>
            </ul>
            <p className="text-base text-gray-700 mt-4 leading-relaxed">
              本サービスは、医療機関の情報を提供することを目的としており、医療行為や診断、治療を行うものではありません。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              提供する情報について
            </h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              基本情報
            </h3>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              厚生労働省が公開する医療機関の情報を基に、以下の情報を提供しています。
            </p>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 ml-4 mb-4">
              <li>医療機関名</li>
              <li>住所</li>
              <li>診療科</li>
              <li>診療時間</li>
              <li>施設種別（病院・診療所）</li>
            </ul>
            <p className="text-base text-gray-700 leading-relaxed">
              これらの情報は、厚生労働省が公開するデータを基にしていますが、実際の内容と異なる場合があります。
              最新の情報については、各医療機関に直接お問い合わせください。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              待ち時間情報について
            </h3>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              本サービスでは、利用者の投稿をもとに、待ち時間の傾向を表示しています。
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <p className="text-base text-blue-800 leading-relaxed font-semibold mb-2">
                待ち時間情報は目安・傾向であり、リアルタイム情報ではありません。
              </p>
              <ul className="list-disc list-inside text-base text-blue-700 space-y-1 ml-4">
                <li>表示されている待ち時間は、過去の投稿をもとにした傾向です</li>
                <li>実際の待ち時間は、曜日、時間帯、混雑状況などにより大きく異なります</li>
                <li>リアルタイムの待ち時間ではありません</li>
                <li>参考情報としてご利用ください</li>
              </ul>
            </div>
            <p className="text-base text-gray-700 leading-relaxed">
              待ち時間情報は、あくまで参考情報としてご利用ください。
              実際の受診の判断については、必ず医師や医療機関にご相談ください。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              情報の正確性について
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              本サービスでは、情報の正確性・完全性・最新性の確保に努めますが、その内容を保証するものではありません。
            </p>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              掲載情報が実際の内容と異なる場合があります。最新の情報については、各医療機関に直接お問い合わせください。
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              本サービスの情報を利用したことにより生じた損害について、運営者は一切の責任を負いません。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              医療行為について
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              本サービスは、医療行為、診断、治療、またはそれらに代わる助言を行うものではありません。
            </p>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              実際の診断・治療・受診の判断については、必ず医師や医療機関等の専門家にご相談ください。
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              本サービスは、医療機関の情報を提供することを目的としており、医療行為や診断、治療を行うものではありません。
            </p>
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

export default About;

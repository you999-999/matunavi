/**
 * まつなび - よくある質問ページ（FAQ）
 * 
 * このファイルは、まつなびに関するよくある質問と回答を掲載する静的ページです。
 * 
 * 【目的】
 * - ユーザーの疑問を事前に解決
 * - サービスの特性（医療行為ではない、リアルタイムではない）の理解促進
 * - 検索機能の使い方を説明
 * - 情報の正確性に関する注意喚起
 * 
 * 【質問カテゴリ】
 * 1. サービス全般について（Q1-Q3）
 *    - まつなびとは何か
 *    - 医療行為を行うか
 *    - 提供する情報の種類
 * 
 * 2. 待ち時間情報について（Q4-Q6）
 *    - リアルタイム情報か
 *    - 表示方法
 *    - 信頼性
 * 
 * 3. 検索機能について（Q7-Q8）
 *    - 検索条件
 *    - 検索結果が見つからない場合
 * 
 * 4. 情報の正確性について（Q9-Q10）
 *    - 情報の正確性
 *    - 間違っている場合の対処
 * 
 * 5. その他（Q11-Q12）
 *    - 利用料金
 *    - お問い合わせ先
 * 
 * 【デザインパターン】
 * - Q&A形式
 * - カテゴリごとにセクション分け
 * - 各質問は border-b で区切り
 * - 重要な回答（リアルタイムではない）は青色背景で強調
 * 
 * 【AdSense審査対策】
 * - 医療行為ではないことを複数の質問で明示
 * - リアルタイム情報ではないことを強調
 * - 情報の性質と制約を繰り返し説明
 * 
 * @module FAQ
 */

import React from 'react';
import { Link } from 'react-router-dom';

const FAQ: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          よくある質問
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              サービス全般について
            </h2>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Q1. まつなびとは何ですか？
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  まつなびは、厚生労働省が公開する医療機関の情報を基に、病院や診療所を検索できるサービスです。
                  政府公開データと利用者の投稿をもとに、医療機関の基本情報や待ち時間の傾向を確認できます。
                  本サービスは、医療機関の情報を提供することを目的としており、医療行為や診断、治療を行うものではありません。
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Q2. 医療行為や診断、治療を行いますか？
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  いいえ、本サービスは医療行為、診断、治療、またはそれらに代わる助言を行うものではありません。
                  本サービスは、医療機関の情報を提供することを目的としており、医療行為や診断、治療を行うものではありません。
                  実際の診断・治療・受診の判断については、必ず医師や医療機関等の専門家にご相談ください。
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Q3. どのような情報を提供していますか？
                </h3>
                <p className="text-base text-gray-700 leading-relaxed mb-2">
                  以下の情報を提供しています。
                </p>
                <ul className="list-disc list-inside text-base text-gray-700 space-y-1 ml-4">
                  <li>医療機関名</li>
                  <li>住所</li>
                  <li>診療科</li>
                  <li>診療時間</li>
                  <li>施設種別（病院・診療所）</li>
                  <li>待ち時間の傾向（参考情報）</li>
                </ul>
                <p className="text-base text-gray-700 mt-2 leading-relaxed">
                  これらの情報は、厚生労働省が公開するデータを基にしていますが、実際の内容と異なる場合があります。
                  最新の情報については、各医療機関に直接お問い合わせください。
                </p>
              </div>
            </div>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              待ち時間情報について
            </h2>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Q4. 待ち時間情報はリアルタイムですか？
                </h3>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-3">
                  <p className="text-base text-blue-800 leading-relaxed font-semibold">
                    いいえ、待ち時間情報はリアルタイム情報ではありません。
                  </p>
                </div>
                <p className="text-base text-gray-700 leading-relaxed">
                  本サービスでは、利用者の投稿をもとに、待ち時間の傾向を表示しています。
                  表示されている待ち時間は、過去の投稿をもとにした傾向であり、リアルタイムの待ち時間ではありません。
                  実際の待ち時間は、曜日、時間帯、混雑状況などにより大きく異なります。
                  待ち時間情報は、あくまで参考情報としてご利用ください。
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Q5. 待ち時間情報はどのように表示されますか？
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  待ち時間情報は、利用者の投稿をもとに、待ち時間の傾向を表示しています。
                  表示されている待ち時間は、過去の投稿をもとにした傾向であり、目安としてご利用ください。
                  実際の待ち時間は、曜日、時間帯、混雑状況などにより大きく異なります。
                  待ち時間情報は、あくまで参考情報としてご利用ください。
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Q6. 待ち時間情報を信頼できますか？
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  待ち時間情報は、利用者の投稿をもとにした傾向であり、参考情報としてご利用ください。
                  実際の待ち時間は、曜日、時間帯、混雑状況などにより大きく異なります。
                  リアルタイムの待ち時間ではありませんので、参考情報としてご利用ください。
                  実際の受診の判断については、必ず医師や医療機関にご相談ください。
                </p>
              </div>
            </div>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              検索機能について
            </h2>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Q7. どのような条件で検索できますか？
                </h3>
                <p className="text-base text-gray-700 leading-relaxed mb-2">
                  以下の条件から医療機関を検索できます。
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

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Q8. 検索結果が見つかりません
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  検索条件を緩めて、再度検索してください。
                  例えば、市区町村を指定せずに都道府県のみで検索する、診療科を指定せずに検索するなど、条件を緩めることで検索結果が表示される場合があります。
                </p>
              </div>
            </div>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              情報の正確性について
            </h2>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Q9. 掲載されている情報は正確ですか？
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  本サービスでは、情報の正確性・完全性・最新性の確保に努めますが、その内容を保証するものではありません。
                  掲載情報が実際の内容と異なる場合があります。
                  最新の情報については、各医療機関に直接お問い合わせください。
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Q10. 情報が間違っている場合はどうすればよいですか？
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  掲載されている情報が実際の内容と異なる場合は、各医療機関に直接お問い合わせください。
                  本サービスでは、情報の正確性・完全性・最新性の確保に努めますが、その内容を保証するものではありません。
                </p>
              </div>
            </div>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              その他
            </h2>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Q11. 利用料金はかかりますか？
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  本サービスは無料でご利用いただけます。
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Q12. お問い合わせはどこにすればよいですか？
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  本サービスに関するお問い合わせは、プライバシーポリシーに記載されている連絡先までお願いいたします。
                  ただし、医療機関に関する具体的な情報については、各医療機関に直接お問い合わせください。
                </p>
              </div>
            </div>
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
                to="/how-to-use"
                className="text-blue-600 hover:text-blue-800 underline text-base"
              >
                使い方
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

export default FAQ;

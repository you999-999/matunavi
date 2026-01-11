/**
 * プライバシーポリシーページ
 * まつなびのプライバシーポリシーを表示するページ
 */

import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          プライバシーポリシー（まつなび）
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            「まつなび」（以下「本サービス」）は、利用者のプライバシーを尊重し、以下のとおり個人情報の取扱いについて定めます。
          </p>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. 取得する情報について
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              本サービスでは、利用者から氏名、住所、電話番号、メールアドレス等の個人情報を直接取得することはありません。
            </p>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              ただし、本サービスの利用に伴い、以下の情報を自動的に取得する場合があります。
            </p>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 ml-4">
              <li>IPアドレス</li>
              <li>Cookie（クッキー）</li>
              <li>利用端末、ブラウザ、アクセス日時等のアクセス情報</li>
            </ul>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. 情報の利用目的
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              取得した情報は、以下の目的で利用します。
            </p>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 ml-4">
              <li>本サービスの運営・維持・改善</li>
              <li>利用状況の分析</li>
              <li>不正利用の防止</li>
              <li>広告配信およびその効果測定</li>
            </ul>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. 広告について
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              本サービスでは、第三者配信の広告サービス（例：Google AdSense）を利用する場合があります。
            </p>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              これらの広告配信事業者は、利用者の興味に応じた広告を表示するため、Cookieを使用することがあります。
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              Cookieを無効にする方法については、各ブラウザの設定をご確認ください。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. アクセス解析ツールについて
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              本サービスでは、アクセス解析ツール（例：Google Analytics）を利用する場合があります。
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              これらのツールは、Cookieを使用してトラフィックデータを収集しますが、個人を特定するものではありません。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. 第三者への情報提供
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              法令に基づく場合を除き、取得した情報を第三者に提供することはありません。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. 免責事項
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              本サービスの利用により生じた損害について、運営者は一切の責任を負いません。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. プライバシーポリシーの変更
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              本ポリシーの内容は、必要に応じて変更されることがあります。
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              変更後のプライバシーポリシーは、本サービス上に掲載した時点で効力を生じます。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. お問い合わせ
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              本ポリシーに関するお問い合わせは、以下のGmailアドレスまでお願いいたします：
            </p>
            <p className="text-base text-gray-700 mt-2 leading-relaxed">
              <a 
                href="mailto:ichigoichie.contact.0015@gmail.com"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ichigoichie.contact.0015@gmail.com
              </a>
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <div className="text-center mt-12">
            <p className="text-xl font-semibold text-gray-900 mb-8">以上</p>
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

export default PrivacyPolicy;

/**
 * 利用規約ページ
 * まつなびの利用規約を表示するページ
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          利用規約（まつなび）
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            本利用規約（以下「本規約」）は、「まつなび」（以下「本サービス」）の利用条件を定めるものです。利用者は、本サービスを利用することにより、本規約に同意したものとみなされます。
          </p>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              第1条（サービス内容）
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              本サービスは、公開情報等をもとに、医療機関に関する情報を検索・閲覧できる機能を提供するものです。
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              本サービスは、医療行為、診断、治療、またはそれらに代わる助言を行うものではありません。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              第2条（医療に関する免責）
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              本サービスに掲載される情報は、あくまで参考情報です。
            </p>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              実際の診断・治療・受診の判断については、必ず医師や医療機関等の専門家にご相談ください。
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              本サービスの情報を利用したことにより生じた損害について、運営者は一切の責任を負いません。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              第3条（情報の正確性）
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              本サービスでは、情報の正確性・完全性・最新性の確保に努めますが、その内容を保証するものではありません。
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              掲載情報が実際の内容と異なる場合があります。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              第4条（禁止事項）
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              利用者は、以下の行為を行ってはなりません。
            </p>
            <ul className="list-disc list-inside text-base text-gray-700 space-y-2 ml-4">
              <li>本サービスの運営を妨害する行為</li>
              <li>不正アクセスやシステムへの攻撃</li>
              <li>法令または公序良俗に反する行為</li>
              <li>本サービスの情報を無断で転載・再配布する行為</li>
            </ul>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              第5条（サービスの変更・停止）
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              運営者は、利用者への事前通知なく、本サービスの内容を変更、または提供を停止することがあります。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              第6条（責任の制限）
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              本サービスの利用または利用不能により生じたいかなる損害についても、運営者は責任を負いません。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              第7条（著作権）
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              本サービスに掲載されている文章・構成・デザイン等の著作権は、運営者または正当な権利者に帰属します。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              第8条（規約の変更）
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              運営者は、必要に応じて本規約を変更できるものとします。
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              変更後の規約は、本サービス上に掲載した時点で効力を生じます。
            </p>
          </section>

          <hr className="my-8 border-gray-300" />

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              第9条（準拠法）
            </h2>
            <p className="text-base text-gray-700 leading-relaxed">
              本規約は、日本法を準拠法とします。
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

export default Terms;
